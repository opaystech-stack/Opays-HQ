import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getJobDescriptions, createJobDescription, deleteJobDescription } from '../models';

const router = Router();
router.use(authMiddleware);
// Fiches de poste : strictement CEO / CTO.
router.use(requireRole('ceo', 'cto'));

router.get('/', (_req: AuthRequest, res) => {
  res.json({ jobDescriptions: getJobDescriptions() });
});

router.post('/', (req: AuthRequest, res) => {
  const { title } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Titre requis' });
  }
  const jd = createJobDescription(req.body);
  res.status(201).json({ jobDescription: jd });
});

router.delete('/:id', (req: AuthRequest, res) => {
  if (!deleteJobDescription(req.params.id)) return res.status(404).json({ error: 'Fiche introuvable' });
  res.json({ ok: true });
});

export default router;
