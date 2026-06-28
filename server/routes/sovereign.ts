import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getSovereignResearch, createSovereignResearch } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/sovereign — lecture pour tous les utilisateurs authentifiés.
router.get('/', (_req: AuthRequest, res) => {
  res.json({ research: getSovereignResearch() });
});

// POST /api/sovereign — écriture réservée à CEO / CTO.
router.post('/', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { title } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Titre requis' });
  }
  const research = createSovereignResearch({ ...req.body, author_id: req.user!.id });
  res.status(201).json({ research });
});

export default router;
