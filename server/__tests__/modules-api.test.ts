import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let ceo: ReturnType<typeof request.agent>;
let cto: ReturnType<typeof request.agent>;
let employee: ReturnType<typeof request.agent>;
let sales: ReturnType<typeof request.agent>;

async function login(agent: ReturnType<typeof request.agent>, email: string) {
  await agent.post('/api/auth/login').send({ email, password: 'admin123' });
}

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-modules-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  ceo = request.agent(app);
  cto = request.agent(app);
  employee = request.agent(app);
  sales = request.agent(app);
  await login(ceo, 'ceo@opays.io');
  await login(cto, 'cto@opays.io');
  await login(employee, 'employee@opays.io');
  await login(sales, 'patricia@opays.io');
});

describe('Profil (/api/users/me)', () => {
  it('renvoie le profil + statut Google (non connecté en test)', async () => {
    const res = await employee.get('/api/users/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('employee@opays.io');
    expect(res.body.google.connected).toBe(false);
  });
  it('met à jour le nom complet', async () => {
    const res = await employee.put('/api/users/me').send({ full_name: 'Employé Modifié' });
    expect(res.status).toBe(200);
    expect(res.body.user.full_name).toBe('Employé Modifié');
  });
});

describe('Calendrier', () => {
  it('lecture pour tous, écriture managers seulement', async () => {
    expect((await employee.get('/api/calendar')).status).toBe(200);
    expect((await employee.post('/api/calendar').send({ title: 'X', start_time: '2026-07-01T09:00' })).status).toBe(403);
    const ok = await ceo.post('/api/calendar').send({ title: 'Monday Brief', start_time: '2026-07-01T09:00' });
    expect(ok.status).toBe(201);
    expect((await ceo.delete(`/api/calendar/${ok.body.event.id}`)).status).toBe(200);
  });
});

describe('Boîte à idées', () => {
  it('création par tous + vote incrémente', async () => {
    const created = await employee.post('/api/ideas').send({ title: 'Idée géniale', category: 'TECH' });
    expect(created.status).toBe(201);
    expect(created.body.idea.votes).toBe(0);
    const voted = await ceo.post(`/api/ideas/${created.body.idea.id}/vote`);
    expect(voted.status).toBe(200);
    expect(voted.body.idea.votes).toBe(1);
  });
});

describe('Fiches de poste (CEO/CTO)', () => {
  it('refuse les non-habilités (employee → 403) et autorise CEO', async () => {
    expect((await employee.get('/api/job-descriptions')).status).toBe(403);
    expect((await ceo.get('/api/job-descriptions')).status).toBe(200);
    const created = await ceo.post('/api/job-descriptions').send({ title: 'Ingénieur Backend', role_name: 'engineer', salary_range: '45-60k' });
    expect(created.status).toBe(201);
  });
});

describe('Souveraineté R&D', () => {
  it('lecture pour tous, écriture CEO/CTO', async () => {
    expect((await employee.get('/api/sovereign')).status).toBe(200);
    expect((await employee.post('/api/sovereign').send({ title: 'Bench LLM' })).status).toBe(403);
    expect((await cto.post('/api/sovereign').send({ title: 'Architecture offline' })).status).toBe(201);
  });
});

describe('Business & Revenue (direction)', () => {
  it('refuse employee (403), renvoie les agrégats pour CEO', async () => {
    expect((await employee.get('/api/business/stats')).status).toBe(403);
    const res = await ceo.get('/api/business/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('treasuryNet');
    expect(res.body.stats).toHaveProperty('outstanding');
  });
});

describe('Vault (contrats / facturation / upload)', () => {
  it('lecture réservée à la gestion (employee → 403, CEO → 200)', async () => {
    expect((await employee.get('/api/vault/contracts')).status).toBe(403);
    expect((await ceo.get('/api/vault/contracts')).status).toBe(200);
    expect((await ceo.get('/api/vault/billing')).status).toBe(200);
  });
  it('upload réservé CEO/CTO/CSO (employee → 403, sales → 201)', async () => {
    expect((await employee.post('/api/vault/upload')).status).toBe(403);
    const ok = await sales.post('/api/vault/upload').attach('file', Buffer.from('PDF de test'), 'contrat.pdf');
    expect(ok.status).toBe(201);
    expect(ok.body.url).toMatch(/^\/api\/vault\/files\//);
  });
});

describe('Projets (mise à jour)', () => {
  it('PUT /api/projects/:id met à jour la marge (gestion)', async () => {
    const created = await ceo.post('/api/projects').send({ name: 'Projet Test' });
    const id = created.body.project.id;
    const res = await ceo.put(`/api/projects/${id}`).send({ gross_margin_real: 12345, status: 'active' });
    expect(res.status).toBe(200);
    expect(res.body.project.gross_margin_real).toBe(12345);
  });
});
