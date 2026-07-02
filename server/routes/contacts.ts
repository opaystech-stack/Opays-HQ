import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getDb } from '../db';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

// Réservé à la direction
const CONTACT_ROLES = ['admin', 'ceo', 'coo', 'cto'] as const;
router.use(requireRole(...CONTACT_ROLES));

function uuid(): string {
  return crypto.randomUUID();
}

// GET /api/contacts
router.get('/', (req: AuthRequest, res) => {
  const db = getDb();
  const contacts = db.prepare(
    'SELECT * FROM site_contacts ORDER BY created_at DESC'
  ).all();
  res.json({ contacts });
});

// GET /api/contacts/:id
router.get('/:id', (req: AuthRequest, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM site_contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact introuvable' });
  res.json({ contact });
});

// PATCH /api/contacts/:id/status
router.patch('/:id/status', (req: AuthRequest, res) => {
  const db = getDb();
  const { status } = req.body;
  const validStatuses = ['new', 'read', 'replied', 'archived'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide. Valeurs acceptées : new, read, replied, archived' });
  }

  const contact = db.prepare('SELECT * FROM site_contacts WHERE id = ?').get(req.params.id) as any;
  if (!contact) return res.status(404).json({ error: 'Contact introuvable' });

  const readAt = status === 'read' && !contact.read_at ? new Date().toISOString() : contact.read_at;
  const repliedAt = status === 'replied' && !contact.replied_at ? new Date().toISOString() : contact.replied_at;

  db.prepare(`
    UPDATE site_contacts
    SET status = ?, read_at = ?, replied_at = ?
    WHERE id = ?
  `).run(status, readAt, repliedAt, req.params.id);

  const updated = db.prepare('SELECT * FROM site_contacts WHERE id = ?').get(req.params.id);
  res.json({ contact: updated });
});

// DELETE /api/contacts/:id
router.delete('/:id', (req: AuthRequest, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM site_contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact introuvable' });
  db.prepare('DELETE FROM site_contacts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
