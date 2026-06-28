/**
 * Integration tests for HTTP routing and the health endpoint (Task 4.3).
 *
 * Exercises the configured Express `app` with supertest to assert the
 * middleware ordering contract from design Component 4/5:
 *   - unmatched `/api/*` paths return a JSON 404 (never the SPA HTML)
 *   - a defined API route dispatches to its handler (JSON, not the SPA HTML)
 *   - non-API paths return `index.html` with 200
 *   - `GET /api/health` returns 200, application/json, `{ status: 'ok', timestamp }`
 *
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 4.1, 8.3, 8.4
 *
 * The env vars below are set BEFORE importing the app so that any request that
 * lazily opens the database (e.g. the auth route) resolves to a writable temp
 * directory and a valid JWT secret, rather than the production `/app/data`
 * default. Importing the app does not bind a port: Vitest sets `process.env.VITEST`,
 * which the module's `start()` guard checks.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import request from 'supertest';

// A >=32 char secret so any token signing on the import chain is valid.
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-jwt-secret-value-1234567890-abcdef';
// Point storage at an isolated temp dir so DB access never touches /app/data.
process.env.DATA_DIR =
  process.env.DATA_DIR ??
  fs.mkdtempSync(path.join(os.tmpdir(), 'opays-routing-test-'));
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// Imported after env setup. `app` is the configured Express instance.
import { app } from '../index';

describe('HTTP routing contract', () => {
  describe('unmatched /api/* paths', () => {
    it('returns a JSON 404, not the SPA HTML', async () => {
      const res = await request(app).get('/api/this-route-does-not-exist');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toEqual({ error: 'Not found' });
      // Defensive: never the SPA entry document.
      expect(res.text).not.toMatch(/<!doctype html>/i);
    });

    it('returns JSON 404 for an unmatched method on a known API prefix', async () => {
      const res = await request(app).delete('/api/auth/nope');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });

  describe('defined API route dispatch', () => {
    it('dispatches /api/auth/login to its handler (JSON, not SPA HTML)', async () => {
      // Missing credentials exercises the handler's own validation branch,
      // returning a JSON error from the route rather than the SPA fallback.
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.headers['content-type']).toMatch(/application\/json/);
      // The handler responded (400 from its validation), not the SPA fallback.
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.text).not.toMatch(/<!doctype html>/i);
    });

    it('dispatches /api/auth/login with bad credentials to a 401 JSON response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong-password' });

      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.text).not.toMatch(/<!doctype html>/i);
    });
  });

  describe('non-API paths', () => {
    it('returns index.html with 200 for an SPA route', async () => {
      const res = await request(app).get('/dashboard');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toMatch(/<div id="root">/);
      expect(res.text).toMatch(/Opays HQ/);
    });

    it('returns index.html with 200 for the root path', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toMatch(/<div id="root">/);
    });
  });

  describe('GET /api/health', () => {
    it('returns 200 application/json with status "ok" and an ISO timestamp', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body.status).toBe('ok');

      // timestamp is a valid ISO-8601 string.
      expect(typeof res.body.timestamp).toBe('string');
      const parsed = new Date(res.body.timestamp);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
      expect(parsed.toISOString()).toBe(res.body.timestamp);
    });
  });
});
