import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-session-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();
});

describe('Session par cookie HttpOnly', () => {
  it('POST /login pose un cookie de session HttpOnly + SameSite=Strict', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@opays.io', password: 'admin123' });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const session = setCookie.find((c) => c.startsWith('session='));
    expect(session).toBeDefined();
    expect(session).toMatch(/HttpOnly/i);
    expect(session).toMatch(/SameSite=Strict/i);
  });

  it('authentifie /api/auth/me via le cookie de session (sans en-tête Authorization)', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'admin@opays.io', password: 'admin123' });

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin@opays.io');
  });

  it('POST /logout efface le cookie et invalide la session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'admin@opays.io', password: 'admin123' });

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(200);

    const after = await agent.get('/api/auth/me');
    expect(after.status).toBe(401);
  });
});
