import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getBusinessStats } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/business/stats — direction uniquement (CEO, CTO, COO).
router.get('/stats', requireRole('ceo', 'cto', 'coo'), (_req: AuthRequest, res) => {
  res.json({ stats: getBusinessStats() });
});

export default router;
