import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { loadOpenRouterConfig } from '../config';
import { chatCompletion, type ChatMessage } from '../llm';
import {
  getAgents,
  getAgentById,
  updateAgent,
  createConversation,
  getConversations,
  getConversationOwner,
  getConversationMessages,
  addMessage,
} from '../models';

const router = Router();
router.use(authMiddleware);

// GET /api/agents — liste des agents (tout authentifié).
router.get('/', (req: AuthRequest, res) => {
  res.json({ agents: getAgents() });
});

// PUT /api/agents/:id — édition du profil/prompt (CEO/CTO uniquement).
router.put('/:id', requireRole('ceo', 'cto'), (req: AuthRequest, res) => {
  const { name, system_prompt, temperature } = req.body;
  if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
    return res.status(400).json({ error: 'Température invalide (0–2)' });
  }
  const agent = updateAgent(req.params.id, { name, system_prompt, temperature });
  if (!agent) return res.status(404).json({ error: 'Agent introuvable' });
  res.json({ agent });
});

// GET /api/agents/conversations — conversations de l'utilisateur courant.
router.get('/conversations', (req: AuthRequest, res) => {
  res.json({ conversations: getConversations(req.user!.id) });
});

// GET /api/agents/conversations/:id — messages (si propriétaire).
router.get('/conversations/:id', (req: AuthRequest, res) => {
  const owner = getConversationOwner(req.params.id);
  if (owner !== req.user!.id) {
    return res.status(404).json({ error: 'Conversation introuvable' });
  }
  res.json({ messages: getConversationMessages(req.params.id) });
});

// POST /api/agents/chat — envoie un message et obtient la réponse du LLM.
router.post('/chat', async (req: AuthRequest, res) => {
  const cfg = loadOpenRouterConfig(process.env);
  if (!cfg) {
    return res.status(503).json({ error: 'Service IA indisponible (clé OpenRouter manquante)' });
  }

  const { agent_id, conversation_id, message } = req.body as {
    agent_id?: string;
    conversation_id?: string;
    message?: string;
  };

  if (!agent_id || !message || !message.trim()) {
    return res.status(400).json({ error: 'agent_id et message requis' });
  }

  const agent = getAgentById(agent_id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent introuvable' });
  }

  // Résout ou crée la conversation, en vérifiant la propriété.
  let conversationId = conversation_id;
  if (conversationId) {
    if (getConversationOwner(conversationId) !== req.user!.id) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }
  } else {
    const title = message.trim().slice(0, 60);
    conversationId = createConversation(req.user!.id, agent_id, title);
  }

  // Enregistre le message utilisateur avant l'appel LLM.
  addMessage(conversationId, 'user', message.trim());

  // Construit le contexte : system prompt + historique complet.
  const history = getConversationMessages(conversationId) as { role: ChatMessage['role']; content: string }[];
  const messages: ChatMessage[] = [];
  if (agent.system_prompt) {
    messages.push({ role: 'system', content: agent.system_prompt });
  }
  for (const m of history) {
    if (m.role === 'user' || m.role === 'assistant') {
      messages.push({ role: m.role, content: m.content });
    }
  }

  try {
    const answer = await chatCompletion(cfg, messages, { temperature: agent.temperature ?? 0.7 });
    addMessage(conversationId, 'assistant', answer);
    res.json({ conversation_id: conversationId, message: answer });
  } catch (err) {
    // Pas d'enregistrement de réponse vide ; on signale un échec en amont.
    const detail = err instanceof Error ? err.message : 'Erreur LLM';
    res.status(502).json({ error: 'Échec de la génération', detail, conversation_id: conversationId });
  }
});

export default router;
