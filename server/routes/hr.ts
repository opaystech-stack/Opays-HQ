import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getHrRecords, upsertHrRecord } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/hr — fiches employés (salaire, performance). Vue gestion + paramètres.
router.get('/', requireRole('admin', 'ceo', 'coo', 'cto'), (req: AuthRequest, res) => {
  const records = getHrRecords();
  res.json({ records });
});

// PUT /api/hr/:userId — met à jour salaire/performance (CEO/CTO uniquement).
router.put('/:userId', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { salary, performance_score, notes } = req.body;
  const record = upsertHrRecord(req.params.userId, { salary, performance_score, notes });
  res.json({ record });
});

export default router;
