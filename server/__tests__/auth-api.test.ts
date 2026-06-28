/**
 * Integration tests for the authentication API (Task 7.1).
 *
 * Exercises the configured Express `app` with supertest to assert the
 * POST /api/auth/login contract:
 *   - valid credentials return a signed JWT token (verifiable, with the
 *     expected claims) alongside the sanitized user
 *   - invalid credentials are rejected with a JSON error and NO token
 *
 * Validates: Requirements 8.5, 8.6
 *
 * Environment setup must happen BEFORE the server modules are loaded:
 *   - server/auth.ts reads JWT_SECRET from process.env at module load time, so
 *     a valid (>=32 char) secret must be set before it is imported, otherwise
 *     `jwt.sign` would throw and the login route would return 500.
 *   - server/db.ts resolves storage from DATA_DIR; we point it at an isolated,
 *     writable temp directory rather than the production `/app/data` default.
 * Because ES module `import` statements are hoisted and evaluated before any
 * top-level code, we assign the env vars first and then load `../index` and
 * `../seed` via dynamic `import()` inside `beforeAll` (mirroring auth.test.ts).
 * Importing the app does not bind a port: Vitest sets `process.env.VITEST`,
 * which the module's `start()` guard checks.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// A >=32 char secret so generated tokens are valid and verifiable here.
const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef'; // 39 chars

// Default seeded credentials (see server/seed.ts). All seeded users share the
// same password; `ceo@opays.io` is used as the canonical valid login.
const VALID_EMAIL = 'ceo@opays.io';
const VALID_PASSWORD = 'admin123';

let app: Application;

beforeAll(async () => {
  // Set the environment BEFORE loading any server module.
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(
    path.join(os.tmpdir(), 'opays-auth-api-test-')
  );
  process.env.NODE_ENV = 'test';

  // Dynamically import after env setup so auth.ts captures the valid secret and
  // db.ts resolves to the isolated temp directory.
  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');

  // Ensure the default users exist in the isolated temp DB before logging in.
  seedDefaultUsers();
});

describe('POST /api/auth/login', () => {
  describe('valid credentials', () => {
    it('returns a signed JWT token and the authenticated user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);

      // A token is present and is a non-empty string.
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);

      // The token is a genuinely signed JWT: it verifies against the secret and
      // carries the expected claims for the logged-in user.
      const decoded = jwt.verify(res.body.token, TEST_SECRET) as Record<
        string,
        unknown
      >;
      expect(decoded.email).toBe(VALID_EMAIL);
      expect(decoded.id).toBe(res.body.user.id);
      expect(decoded.role_name).toBe('ceo');

      // The sanitized user is returned without the password hash.
      expect(res.body.user.email).toBe(VALID_EMAIL);
      expect(res.body.user).not.toHaveProperty('password_hash');
    });
  });

  describe('invalid credentials', () => {
    it('rejects a wrong password with a 401 error and NO token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_EMAIL, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toHaveProperty('error');
      expect(res.body.token).toBeUndefined();
    });

    it('rejects an unknown email with a 401 error and NO token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: VALID_PASSWORD });

      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toHaveProperty('error');
      expect(res.body.token).toBeUndefined();
    });
  });
});
