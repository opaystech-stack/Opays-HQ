import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { getProjects, createProject, updateProject } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/projects
router.get('/', (req: AuthRequest, res) => {
  const projects = getProjects(req.user!.id, req.user!.role_name);
  res.json({ projects });
});

// POST /api/projects
router.post('/', requireRole('admin', 'ceo', 'coo', 'cto'), (req: AuthRequest, res) => {
  const project = createProject({ ...req.body, owner_id: req.user!.id });
  res.status(201).json({ project });
});

// PUT /api/projects/:id — statut, marges, feedback client (gestion).
router.put('/:id', requireRole('admin', 'ceo', 'coo', 'cto'), (req: AuthRequest, res) => {
  const project = updateProject(req.params.id, req.body);
  if (!project) return res.status(404).json({ error: 'Projet introuvable' });
  res.json({ project });
});

export default router;
