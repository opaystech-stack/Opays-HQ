import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../models';

const router = Router();
router.use(authMiddleware);

const WRITE_ROLES = ['admin', 'ceo', 'coo', 'cto'] as const;

// GET /api/calendar — tous les utilisateurs authentifiés (lecture).
router.get('/', (_req: AuthRequest, res) => {
  res.json({ events: getCalendarEvents() });
});

// POST /api/calendar — managers uniquement.
router.post('/', requireRole(...WRITE_ROLES), (req: AuthRequest, res) => {
  const { title, start_time } = req.body;
  if (!title || !start_time) {
    return res.status(400).json({ error: 'Titre et date de début requis' });
  }
  const event = createCalendarEvent({ ...req.body, created_by: req.user!.id });
  res.status(201).json({ event });
});

// DELETE /api/calendar/:id — managers uniquement.
router.delete('/:id', requireRole(...WRITE_ROLES), (req: AuthRequest, res) => {
  if (!deleteCalendarEvent(req.params.id)) return res.status(404).json({ error: 'Événement introuvable' });
  res.json({ ok: true });
});

export default router;
