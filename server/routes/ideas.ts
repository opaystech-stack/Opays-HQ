import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { getIdeas, createIdea, voteIdea } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/ideas — toutes les idées (avec auteur).
router.get('/', (_req: AuthRequest, res) => {
  res.json({ ideas: getIdeas() });
});

// POST /api/ideas — toute personne authentifiée peut proposer.
router.post('/', (req: AuthRequest, res) => {
  const { title } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Titre requis' });
  }
  const idea = createIdea({ ...req.body, profile_id: req.user!.id });
  res.status(201).json({ idea });
});

// POST /api/ideas/:id/vote — +1 vote.
router.post('/:id/vote', (req: AuthRequest, res) => {
  const idea = voteIdea(req.params.id);
  if (!idea) return res.status(404).json({ error: 'Idée introuvable' });
  res.json({ idea });
});

export default router;
