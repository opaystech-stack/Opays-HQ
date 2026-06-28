import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';
const APP_URL = 'http://localhost:5173';

let app: Application;

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-google-test-'));
  process.env.NODE_ENV = 'test';
  process.env.TOKEN_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3001/api/auth/google/callback';
  process.env.APP_URL = APP_URL;

  ({ app } = (await import('../index')) as { app: Application });
});

describe('GET /api/auth/google', () => {
  it('redirige vers Google avec les bons paramètres et pose le State_Cookie', async () => {
    const res = await request(app).get('/api/auth/google');

    expect(res.status).toBe(302);
    const location = res.headers['location'];
    expect(location).toContain('accounts.google.com');
    expect(location).toContain('client_id=test-client-id');
    expect(location).toContain('scope=');
    expect(decodeURIComponent(location)).toContain('https://www.googleapis.com/auth/drive');
    expect(location).toContain('state=');
    expect(location).toContain('access_type=offline');

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const stateCookie = setCookie.find((c) => c.startsWith('g_oauth_state='));
    expect(stateCookie).toBeDefined();
    expect(stateCookie).toMatch(/HttpOnly/i);
  });
});

describe('GET /api/auth/google/callback — protection CSRF', () => {
  it('rejette quand le State_Cookie est absent', async () => {
    const res = await request(app).get('/api/auth/google/callback?code=abc&state=xyz');
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe(`${APP_URL}/login?error=state`);
    // Aucun cookie de session ne doit être posé.
    const setCookie = (res.headers['set-cookie'] as unknown as string[]) || [];
    expect(setCookie.find((c) => c.startsWith('session='))).toBeUndefined();
  });

  it('rejette quand le state de la query ne correspond pas au cookie', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=abc&state=valeur-query')
      .set('Cookie', 'g_oauth_state=valeur-differente');
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe(`${APP_URL}/login?error=state`);
  });

  it('rejette quand le code est absent malgré un state valide', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?state=bon-state')
      .set('Cookie', 'g_oauth_state=bon-state');
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe(`${APP_URL}/login?error=code`);
  });
});
