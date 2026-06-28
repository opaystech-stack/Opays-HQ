import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT_SECRET is guaranteed present and valid by the startup configuration
// validation (see server/config.ts), which runs before the server binds.
const JWT_SECRET = process.env.JWT_SECRET as string;

/** Nom du cookie de session applicatif. */
export const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours (= expiration JWT)

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role_name: string;
    role_label: string;
  };
  cookies?: Record<string, string | undefined>;
}

export function generateToken(user: { id: string; email: string; role_name: string; role_label: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role_name: user.role_name, role_label: user.role_label },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** Pose le cookie de session : HttpOnly, SameSite=Strict, Secure en production. */
export function setSessionCookie(res: Response, token: string, isProduction: boolean): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

/** Efface le cookie de session avec les mêmes attributs. */
export function clearSessionCookie(res: Response, isProduction: boolean): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
  });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Le JWT est lu en priorité depuis le cookie de session HttpOnly ; l'en-tête
  // Authorization: Bearer reste accepté pour compatibilité (clients API, tests).
  const cookieToken = req.cookies?.[SESSION_COOKIE];
  const header = req.headers.authorization;
  let token: string | undefined;
  if (cookieToken) {
    token = cookieToken;
  } else if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role_name: decoded.role_name,
      role_label: decoded.role_label,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}
