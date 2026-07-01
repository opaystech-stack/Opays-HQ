import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import {
  getMarketingTemplates,
  getMarketingTemplateById,
  createMarketingTemplate,
  updateMarketingTemplate,
  deleteMarketingTemplate,
} from '../models';

const router = Router();
router.use(authMiddleware);

// Templates marketing accessibles aux rôles de direction + sales.
const MARKETING_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales'] as const;
router.use(requireRole(...MARKETING_ROLES));

// GET /api/marketing/templates
router.get('/templates', (req: AuthRequest, res) => {
  res.json({ templates: getMarketingTemplates() });
});

// GET /api/marketing/templates/:id
router.get('/templates/:id', (req: AuthRequest, res) => {
  const template = getMarketingTemplateById(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template introuvable' });
  res.json({ template });
});

// POST /api/marketing/templates
router.post('/templates', (req: AuthRequest, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Champs requis manquants : name, content' });
  }
  const template = createMarketingTemplate({ ...req.body, created_by: req.user!.id });
  res.status(201).json({ template });
});

// PUT /api/marketing/templates/:id
router.put('/templates/:id', (req: AuthRequest, res) => {
  const template = updateMarketingTemplate(req.params.id, req.body);
  if (!template) return res.status(404).json({ error: 'Template introuvable' });
  res.json({ template });
});

// DELETE /api/marketing/templates/:id
router.delete('/templates/:id', (req: AuthRequest, res) => {
  const ok = deleteMarketingTemplate(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Template introuvable' });
  res.json({ ok: true });
});

export default router;
