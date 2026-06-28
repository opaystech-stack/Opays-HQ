import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let ceo: ReturnType<typeof request.agent>;
let employee: ReturnType<typeof request.agent>;
let cto: ReturnType<typeof request.agent>;

async function login(agent: ReturnType<typeof request.agent>, email: string) {
  await agent.post('/api/auth/login').send({ email, password: 'admin123' });
}

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-knowledge-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  ceo = request.agent(app);
  employee = request.agent(app);
  cto = request.agent(app);
  await login(ceo, 'ceo@opays.io');
  await login(employee, 'employee@opays.io');
  await login(cto, 'cto@opays.io');

  // Articles : public, ciblé CTO, ciblé Employé.
  await ceo.post('/api/knowledge').send({ title: 'Public', content: 'visible par tous' });
  await ceo.post('/api/knowledge').send({ title: 'Secret CTO', content: 'cto only', target_role_id: 'role_cto' });
  await ceo.post('/api/knowledge').send({ title: 'Pour employés', content: 'employee only', target_role_id: 'role_employee' });
});

describe('Filtrage Knowledge par rôle (côté serveur)', () => {
  it('un employé voit le public et son rôle, pas les articles CTO', async () => {
    const res = await employee.get('/api/knowledge');
    expect(res.status).toBe(200);
    const titles = (res.body.articles as { title: string }[]).map((a) => a.title);
    expect(titles).toContain('Public');
    expect(titles).toContain('Pour employés');
    expect(titles).not.toContain('Secret CTO');
  });

  it('un CTO voit le public et son rôle, pas les articles employés', async () => {
    const res = await cto.get('/api/knowledge');
    const titles = (res.body.articles as { title: string }[]).map((a) => a.title);
    expect(titles).toContain('Public');
    expect(titles).toContain('Secret CTO');
    expect(titles).not.toContain('Pour employés');
  });
});
