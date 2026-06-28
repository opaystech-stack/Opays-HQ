import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getLeads, createLead, updateLead, deleteLead, convertLeadToProject } from '../models';

const router = Router();
router.use(authMiddleware);

// CRM réservé aux associés et à la direction.
const CRM_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales'] as const;
router.use(requireRole(...CRM_ROLES));

// GET /api/leads
router.get('/', (req: AuthRequest, res) => {
  res.json({ leads: getLeads() });
});

// POST /api/leads
router.post('/', (req: AuthRequest, res) => {
  const { company_name } = req.body;
  if (!company_name || !String(company_name).trim()) {
    return res.status(400).json({ error: "Le nom de l'entreprise est requis" });
  }
  const lead = createLead({ ...req.body, created_by: req.user!.id });
  res.status(201).json({ lead });
});

// PUT /api/leads/:id
router.put('/:id', (req: AuthRequest, res) => {
  const lead = updateLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: 'Lead introuvable' });
  res.json({ lead });
});

// DELETE /api/leads/:id
router.delete('/:id', (req: AuthRequest, res) => {
  const ok = deleteLead(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Lead introuvable' });
  res.json({ ok: true });
});

// POST /api/leads/:id/convert — convertit un lead gagné en projet.
router.post('/:id/convert', (req: AuthRequest, res) => {
  const result = convertLeadToProject(req.params.id, req.user!.id);
  if (!result.ok) {
    if (result.error === 'NOT_FOUND') return res.status(404).json({ error: 'Lead introuvable' });
    if (result.error === 'NOT_WON') return res.status(400).json({ error: 'Seul un lead « gagné » peut être converti' });
    return res.status(409).json({ error: 'Lead déjà converti en projet' });
  }
  res.status(201).json({ project: result.project, lead_id: result.lead_id });
});

export default router;
