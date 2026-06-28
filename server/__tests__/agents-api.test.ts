import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Application } from 'express';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const TEST_SECRET = 'test-jwt-secret-value-1234567890-abcdef';

let app: Application;
let ceo: ReturnType<typeof request.agent>;
let employee: ReturnType<typeof request.agent>;

async function login(agent: ReturnType<typeof request.agent>, email: string) {
  await agent.post('/api/auth/login').send({ email, password: 'admin123' });
}

// Mock global fetch → réponse OpenRouter simulée (aucun appel réseau réel).
function mockLLM(content = 'Réponse simulée du LLM') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content } }] }),
    })) as unknown as typeof fetch,
  );
}

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-agents-test-'));
  process.env.NODE_ENV = 'test';
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  process.env.OPENROUTER_MODEL = 'openai/gpt-4o-mini';

  ({ app } = (await import('../index')) as { app: Application });
  const { seedDefaultUsers } = await import('../seed');
  seedDefaultUsers();

  ceo = request.agent(app);
  employee = request.agent(app);
  await login(ceo, 'ceo@opays.io');
  await login(employee, 'employee@opays.io');
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Agents — liste & configuration', () => {
  it('GET /api/agents renvoie les agents seedés (authentifié)', async () => {
    const res = await employee.get('/api/agents');
    expect(res.status).toBe(200);
    const names = (res.body.agents as { name: string }[]).map((a) => a.name);
    expect(names).toContain('Le Stratège');
    expect(names).toContain('CTO IA');
    // Pas de fuite de clé API.
    expect(JSON.stringify(res.body)).not.toContain('openrouter');
  });

  it('PUT /api/agents/:id réservé CEO/CTO (employé → 403, CEO → 200)', async () => {
    const denied = await employee.put('/api/agents/agent_strategist').send({ system_prompt: 'hack' });
    expect(denied.status).toBe(403);

    const ok = await ceo.put('/api/agents/agent_strategist').send({ system_prompt: 'Nouveau prompt', temperature: 0.5 });
    expect(ok.status).toBe(200);
    expect(ok.body.agent.system_prompt).toBe('Nouveau prompt');
    expect(ok.body.agent.temperature).toBe(0.5);
  });

  it('rejette une température invalide (400)', async () => {
    const res = await ceo.put('/api/agents/agent_strategist').send({ temperature: 9 });
    expect(res.status).toBe(400);
  });
});

describe('Agents — chat', () => {
  it('POST /api/agents/chat enregistre le message et la réponse (LLM mocké)', async () => {
    mockLLM('Voici ma recommandation stratégique.');
    const res = await ceo.post('/api/agents/chat').send({ agent_id: 'agent_strategist', message: 'Quelle stratégie ?' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Voici ma recommandation stratégique.');
    expect(res.body.conversation_id).toBeDefined();

    // Les deux messages sont persistés et lisibles par le propriétaire.
    const msgs = await ceo.get(`/api/agents/conversations/${res.body.conversation_id}`);
    expect(msgs.status).toBe(200);
    const roles = (msgs.body.messages as { role: string }[]).map((m) => m.role);
    expect(roles).toEqual(['user', 'assistant']);
  });

  it('isole les conversations entre utilisateurs (404 pour un tiers)', async () => {
    mockLLM();
    const created = await employee.post('/api/agents/chat').send({ agent_id: 'agent_copywriter', message: 'Un slogan ?' });
    const convId = created.body.conversation_id;

    const intruder = await ceo.get(`/api/agents/conversations/${convId}`);
    expect(intruder.status).toBe(404);
  });

  it('répond 503 quand la clé OpenRouter est absente', async () => {
    const saved = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      const res = await ceo.post('/api/agents/chat').send({ agent_id: 'agent_strategist', message: 'Test' });
      expect(res.status).toBe(503);
    } finally {
      process.env.OPENROUTER_API_KEY = saved;
    }
  });
});
