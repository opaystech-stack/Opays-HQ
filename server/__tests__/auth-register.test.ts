/**
 * Tests de sécurité pour POST /api/auth/register.
 *
 * Le endpoint d'inscription est réservé aux administrateurs habilités
 * (admin, ceo, coo) et ne doit jamais permettre une auto-inscription ni
 * l'auto-attribution d'un rôle privilégié.
 *
 * Couvre la correction de la faille d'élévation de privilèges.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef'; // 39 chars (>= 32)

let app: Application;
let adminToken: string;
let employeeToken: string;

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-register-test-'));
  process.env.NODE_ENV = 'test';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  // Récupère un token admin (habilité) et un token employee (non habilité).
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@opays.io', password: 'admin123' });
  adminToken = adminRes.body.token;

  const employeeRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'employee@opays.io', password: 'admin123' });
  employeeToken = employeeRes.body.token;
});

describe('POST /api/auth/register — contrôle d\'accès', () => {
  it('refuse une requête non authentifiée (401) et ne crée aucun compte', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pirate@opays.io', password: 'password123', role_name: 'ceo' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('refuse un utilisateur non habilité (employee → 403)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ email: 'pirate2@opays.io', password: 'password123', role_name: 'admin' });

    expect(res.status).toBe(403);
    expect(res.body.token).toBeUndefined();
  });

  it('rejette un rôle invalide même pour un admin (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@opays.io', password: 'password123', role_name: 'superadmin' });

    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  it('autorise un admin habilité à créer un compte valide (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'engineer2@opays.io', password: 'password123', full_name: 'Ingé Test', role_name: 'engineer' });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('engineer2@opays.io');
    expect(res.body.user.role_name).toBe('engineer');
  });
});
