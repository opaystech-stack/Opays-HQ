import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getUsers, getAssignableUsers, getUserByEmail, createGoogleUser, updateUserRole, getUserById, updateUserProfile, getGoogleAccount } from '../models';

const router = Router();
router.use(authMiddleware);

// Rôles assignables (liste blanche partagée avec l'inscription).
const ASSIGNABLE_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales', 'engineer', 'employee'];

// GET /api/users/me — profil de l'utilisateur courant + statut de liaison Google.
router.get('/me', (req: AuthRequest, res) => {
  const user = getUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  const google = getGoogleAccount(req.user!.id);
  res.json({
    user,
    google: google ? { connected: true, scopes: google.scopes, expiry_date: google.expiry_date } : { connected: false },
  });
});

// PUT /api/users/me — l'utilisateur édite son propre profil (nom, avatar).
// L'email reste en lecture seule : il sert de clé d'identité au SSO Google.
router.put('/me', (req: AuthRequest, res) => {
  const { full_name, avatar_url } = req.body;
  const user = updateUserProfile(req.user!.id, { full_name, avatar_url });
  res.json({ user });
});

// GET /api/users — liste complète (vue RH / admin / paramètres CEO-CTO).
router.get('/', requireRole('admin', 'ceo', 'coo', 'cto'), (req: AuthRequest, res) => {
  const users = getUsers();
  res.json({ users });
});

// GET /api/users/assignable — liste minimale pour l'assignation de tâches.
// Accessible à tout utilisateur authentifié (les créateurs de tâches en ont besoin).
router.get('/assignable', (req: AuthRequest, res) => {
  const users = getAssignableUsers();
  res.json({ users });
});

// POST /api/users — invite/pré-provisionne un membre (CEO/CTO uniquement).
// L'utilisateur se connectera ensuite via Google avec cet email et héritera du rôle.
router.post('/', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { email, full_name, role_name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  if (role_name && !ASSIGNABLE_ROLES.includes(role_name)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  if (getUserByEmail(email)) {
    return res.status(409).json({ error: 'Cet email existe déjà' });
  }
  const user = createGoogleUser(email, full_name ?? null, null, role_name || 'employee');
  res.status(201).json({ user });
});

// PATCH /api/users/:id/role — modifie le rôle (CEO/CTO uniquement).
router.patch('/:id/role', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { role_name } = req.body;
  if (!role_name || !ASSIGNABLE_ROLES.includes(role_name)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  const user = updateUserRole(req.params.id, role_name);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ user });
});

export default router;
