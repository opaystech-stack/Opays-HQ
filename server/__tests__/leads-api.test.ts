import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let sales: ReturnType<typeof request.agent>; // Patricia (rôle sales) — accès CRM
let employee: ReturnType<typeof request.agent>; // exclu du CRM

async function login(agent: ReturnType<typeof request.agent>, email: string) {
  await agent.post('/api/auth/login').send({ email, password: 'admin123' });
}

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-leads-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  sales = request.agent(app);
  employee = request.agent(app);
  await login(sales, 'patricia@opays.io');
  await login(employee, 'employee@opays.io');
});

describe('Accès CRM', () => {
  it('refuse l\'accès aux rôles hors CRM (employee → 403)', async () => {
    expect((await employee.get('/api/leads')).status).toBe(403);
  });

  it('autorise le rôle sales (Patricia)', async () => {
    const res = await sales.get('/api/leads');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leads)).toBe(true);
  });
});

describe('CRUD leads', () => {
  let leadId: string;

  it('POST /api/leads crée un lead (company_name requis)', async () => {
    const bad = await sales.post('/api/leads').send({ contact_name: 'Sans entreprise' });
    expect(bad.status).toBe(400);

    const res = await sales.post('/api/leads').send({ company_name: 'ACME Corp', estimated_value: 12000, status: 'audit' });
    expect(res.status).toBe(201);
    expect(res.body.lead.company_name).toBe('ACME Corp');
    leadId = res.body.lead.id;
  });

  it('PUT /api/leads/:id met à jour le statut', async () => {
    const res = await sales.put(`/api/leads/${leadId}`).send({ status: 'proposal' });
    expect(res.status).toBe(200);
    expect(res.body.lead.status).toBe('proposal');
  });

  it('DELETE /api/leads/:id supprime le lead', async () => {
    const created = await sales.post('/api/leads').send({ company_name: 'Éphémère SARL' });
    const del = await sales.delete(`/api/leads/${created.body.lead.id}`);
    expect(del.status).toBe(200);
    const after = await sales.delete(`/api/leads/${created.body.lead.id}`);
    expect(after.status).toBe(404);
  });
});

describe('Conversion lead → projet', () => {
  it('refuse la conversion d\'un lead non gagné (400)', async () => {
    const lead = await sales.post('/api/leads').send({ company_name: 'NotWon Inc', status: 'new' });
    const res = await sales.post(`/api/leads/${lead.body.lead.id}/convert`);
    expect(res.status).toBe(400);
  });

  it('convertit un lead gagné en projet (201) puis refuse une 2e conversion (409)', async () => {
    const lead = await sales.post('/api/leads').send({ company_name: 'BigDeal Ltd', estimated_value: 50000, status: 'won' });
    const conv = await sales.post(`/api/leads/${lead.body.lead.id}/convert`);
    expect(conv.status).toBe(201);
    expect(conv.body.project.id).toBeDefined();

    // Le projet existe désormais dans la liste des projets.
    const projects = await sales.get('/api/projects');
    const names = (projects.body.projects as { name: string }[]).map((p) => p.name);
    expect(names).toContain('BigDeal Ltd');

    // Une 2e conversion est refusée.
    const again = await sales.post(`/api/leads/${lead.body.lead.id}/convert`);
    expect(again.status).toBe(409);
  });
});
