import { Router } from 'express';
import crypto from 'crypto';
import { verifyPassword, createUser, getUserById, getUserByEmail, createGoogleUser, upsertGoogleAccount } from '../models';
import { generateToken, authMiddleware, requireRole, setSessionCookie, clearSessionCookie, AuthRequest } from '../auth';
import { loadGoogleConfig } from '../config';
import { buildAuthUrl, exchangeCode } from '../google';

const router = Router();

// Nom du cookie transitoire portant le state anti-CSRF du flux OAuth.
const STATE_COOKIE = 'g_oauth_state';
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function isProduction(): boolean {
  return (process.env.NODE_ENV ?? 'development') === 'production';
}

// Rôles qu'un administrateur habilité peut attribuer lors de la création d'un compte.
const ASSIGNABLE_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales', 'engineer', 'employee'] as const;

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = verifyPassword(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = generateToken(user);
  setSessionCookie(res, token, isProduction());
  res.json({ user, token });
});

// POST /api/auth/register — réservé aux administrateurs habilités (admin, ceo, coo).
// L'inscription publique est interdite : un compte ne peut pas s'auto-créer ni
// s'auto-attribuer un rôle privilégié.
router.post('/register', authMiddleware, requireRole('admin', 'ceo', 'coo'), (req: AuthRequest, res) => {
  const { email, password, full_name, role_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  // Validation stricte du rôle demandé contre la liste blanche.
  if (role_name !== undefined && role_name !== null && !ASSIGNABLE_ROLES.includes(role_name)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  try {
    const user = createUser(email, password, full_name, role_name);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = getUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ user });
});

// POST /api/auth/logout — efface le cookie de session.
router.post('/logout', (req, res) => {
  clearSessionCookie(res, isProduction());
  res.status(200).json({ ok: true });
});

// GET /api/auth/google — démarre le flux OAuth.
router.get('/google', (req, res) => {
  const cfg = loadGoogleConfig(process.env);
  if (!cfg) {
    return res.status(503).json({ error: 'Authentification Google indisponible' });
  }

  const state = crypto.randomBytes(32).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax', // doit survivre à la redirection cross-site du callback Google
    secure: cfg.isProduction,
    path: '/api/auth',
    maxAge: STATE_MAX_AGE_MS,
  });

  res.redirect(buildAuthUrl(cfg, state));
});

// GET /api/auth/google/callback — échange le code et établit la session.
router.get('/google/callback', async (req: AuthRequest, res) => {
  const cfg = loadGoogleConfig(process.env);
  if (!cfg) {
    return res.status(503).json({ error: 'Authentification Google indisponible' });
  }

  const redirectError = (code: string) =>
    res.redirect(`${cfg.appUrl}/login?error=${encodeURIComponent(code)}`);

  // Protection CSRF : le state de la query doit correspondre au cookie.
  const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
  const stateCookie = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: '/api/auth' });

  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return redirectError('state');
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!code) {
    return redirectError('code');
  }

  try {
    const tokens = await exchangeCode(cfg, code);

    let user = getUserByEmail(tokens.email);
    if (!user) {
      user = createGoogleUser(tokens.email, tokens.name, tokens.picture);
    }
    if (!user) {
      return redirectError('account');
    }

    upsertGoogleAccount(user.id, {
      sub: tokens.sub,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      scopes: tokens.scope,
      expiryDate: tokens.expiryDate,
    });

    const token = generateToken(user);
    setSessionCookie(res, token, cfg.isProduction);
    return res.redirect(`${cfg.appUrl}/app/dashboard`);
  } catch {
    return redirectError('oauth');
  }
});

export default router;
