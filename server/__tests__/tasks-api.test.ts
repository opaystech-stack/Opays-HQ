import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-tasks-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  // Admin : habilité à créer des tâches (requireRole).
  agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email: 'admin@opays.io', password: 'admin123' });
});

describe('API Tâches', () => {
  let createdId: string;

  it('GET /api/tasks renvoie une liste (authentifié)', async () => {
    const res = await agent.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it('refuse GET /api/tasks sans authentification', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('POST /api/tasks crée une tâche', async () => {
    const res = await agent.post('/api/tasks').send({ title: 'Préparer le déploiement', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.task.id).toBeDefined();
    createdId = res.body.task.id;
  });

  it('PATCH /api/tasks/:id/status applique une transition valide', async () => {
    const res = await agent.patch(`/api/tasks/${createdId}/status`).send({ status: 'in_progress' });
    expect(res.status).toBe(200);

    const list = await agent.get('/api/tasks');
    const updated = (list.body.tasks as { id: string; status: string }[]).find((t) => t.id === createdId);
    expect(updated?.status).toBe('in_progress');
  });

  it('PATCH /api/tasks/:id/status rejette un statut invalide (400)', async () => {
    const res = await agent.patch(`/api/tasks/${createdId}/status`).send({ status: 'bogus' });
    expect(res.status).toBe(400);
  });
});
