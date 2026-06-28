import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getEquityLogs, createEquityLog } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/equity — logs de vesting (vue gestion).
router.get('/', requireRole('admin', 'ceo', 'coo'), (req: AuthRequest, res) => {
  const logs = getEquityLogs();
  res.json({ logs });
});

// POST /api/equity — attribue de l'equity (CEO/CTO uniquement).
router.post('/', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { user_id, shares_vested, total_shares, vesting_date, notes } = req.body;
  if (!user_id || shares_vested == null || total_shares == null || !vesting_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  const log = createEquityLog({ user_id, shares_vested, total_shares, vesting_date, notes });
  res.status(201).json({ log });
});

export default router;
