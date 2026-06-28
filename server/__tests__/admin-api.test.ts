import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let cto: ReturnType<typeof request.agent>;
let ceo: ReturnType<typeof request.agent>;
let employee: ReturnType<typeof request.agent>;
let employeeId: string;

async function login(agent: ReturnType<typeof request.agent>, email: string) {
  await agent.post('/api/auth/login').send({ email, password: 'admin123' });
}

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-admin-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  cto = request.agent(app);
  ceo = request.agent(app);
  employee = request.agent(app);
  await login(cto, 'cto@opays.io');
  await login(ceo, 'ceo@opays.io');
  await login(employee, 'employee@opays.io');

  const list = await ceo.get('/api/users');
  employeeId = (list.body.users as { id: string; role_name: string }[]).find((u) => u.role_name === 'employee')!.id;
});

describe('Assignables', () => {
  it('GET /api/users/assignable accessible à tout authentifié', async () => {
    const res = await employee.get('/api/users/assignable');
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
    // Ne renvoie que des champs minimaux (pas d'email).
    expect(res.body.users[0]).not.toHaveProperty('email');
  });
});

describe('Invitation / rôles (CEO-CTO)', () => {
  it('refuse l\'invitation pour un rôle non habilité (employee → 403)', async () => {
    const res = await employee.post('/api/users').send({ email: 'pirate@opays.io' });
    expect(res.status).toBe(403);
  });

  it('autorise l\'invitation par un CTO (201)', async () => {
    const res = await cto.post('/api/users').send({ email: 'newhire@opays.io', full_name: 'New Hire', role_name: 'engineer' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newhire@opays.io');
    expect(res.body.user.role_name).toBe('engineer');
  });

  it('rejette un rôle invalide (400)', async () => {
    const res = await cto.post('/api/users').send({ email: 'x@opays.io', role_name: 'king' });
    expect(res.status).toBe(400);
  });

  it('change le rôle d\'un membre (CTO) et refuse pour un employé', async () => {
    const ok = await cto.patch(`/api/users/${employeeId}/role`).send({ role_name: 'sales' });
    expect(ok.status).toBe(200);
    expect(ok.body.user.role_name).toBe('sales');

    const denied = await employee.patch(`/api/users/${employeeId}/role`).send({ role_name: 'ceo' });
    expect(denied.status).toBe(403);
  });
});

describe('Equity', () => {
  it('refuse la création pour un employé (403) et l\'autorise pour un CTO (201)', async () => {
    const denied = await employee.post('/api/equity').send({ user_id: employeeId, shares_vested: 10, total_shares: 100, vesting_date: '2026-01-01' });
    expect(denied.status).toBe(403);

    const ok = await cto.post('/api/equity').send({ user_id: employeeId, shares_vested: 10, total_shares: 100, vesting_date: '2026-01-01' });
    expect(ok.status).toBe(201);
  });

  it('GET /api/equity réservé à la gestion (employé → 403, CEO → 200)', async () => {
    expect((await employee.get('/api/equity')).status).toBe(403);
    expect((await ceo.get('/api/equity')).status).toBe(200);
  });
});

describe('RH (salaire / performance)', () => {
  it('PUT /api/hr/:id (CTO) persiste et GET le reflète', async () => {
    const put = await cto.put(`/api/hr/${employeeId}`).send({ salary: 55000, performance_score: 88 });
    expect(put.status).toBe(200);

    const get = await ceo.get('/api/hr');
    const rec = (get.body.records as { user_id: string; salary: number; performance_score: number }[]).find((r) => r.user_id === employeeId);
    expect(rec?.salary).toBe(55000);
    expect(rec?.performance_score).toBe(88);
  });

  it('refuse l\'écriture RH pour un employé (403)', async () => {
    const res = await employee.put(`/api/hr/${employeeId}`).send({ salary: 1 });
    expect(res.status).toBe(403);
  });
});
