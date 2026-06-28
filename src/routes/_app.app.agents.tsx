import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bot, Send, Settings2, Plus } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import {
  apiGetAgents,
  apiUpdateAgent,
  apiGetConversations,
  apiGetConversationMessages,
  apiAgentChat,
} from '@/lib/api';

export const Route = createFileRoute('/_app/app/agents')({
  component: AgentsPage,
});

interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  temperature: number | null;
}

interface Conversation {
  id: string;
  title: string | null;
  agent_config_id: string;
  agent_name: string | null;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function AgentsPage() {
  const { user } = useUser();
  const canConfigure = user?.role_name === 'ceo' || user?.role_name === 'cto';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [configOpen, setConfigOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState('');
  const [tempDraft, setTempDraft] = useState('0.7');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  const loadConversations = useCallback(async () => {
    const { data } = await apiGetConversations();
    if (data?.conversations) setConversations(data.conversations as Conversation[]);
  }, []);

  useEffect(() => {
    apiGetAgents().then(({ data }) => {
      if (data?.agents) {
        setAgents(data.agents as Agent[]);
        if (data.agents.length > 0) setSelectedAgentId((data.agents[0] as Agent).id);
      }
    });
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveConversationId(conv.id);
    setSelectedAgentId(conv.agent_config_id);
    const { data } = await apiGetConversationMessages(conv.id);
    if (data?.messages) setMessages(data.messages as Message[]);
  }, []);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || !selectedAgentId || sending) return;

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      setSending(true);

      const { data, error } = await apiAgentChat({
        agent_id: selectedAgentId,
        conversation_id: activeConversationId ?? undefined,
        message: text,
      });
      setSending(false);

      if (error || !data) {
        toast.error('Échec de la génération', { description: error });
        setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Le service IA est indisponible pour le moment.' }]);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      if (!activeConversationId) {
        setActiveConversationId(data.conversation_id);
        await loadConversations();
      }
    },
    [input, selectedAgentId, activeConversationId, sending, loadConversations],
  );

  const openConfig = useCallback(() => {
    if (!selectedAgent) return;
    setPromptDraft(selectedAgent.system_prompt ?? '');
    setTempDraft(String(selectedAgent.temperature ?? 0.7));
    setConfigOpen(true);
  }, [selectedAgent]);

  const saveConfig = useCallback(async () => {
    if (!selectedAgent) return;
    const temperature = Number.parseFloat(tempDraft);
    if (Number.isNaN(temperature) || temperature < 0 || temperature > 2) {
      toast.error('Température invalide (0–2)');
      return;
    }
    const { data, error } = await apiUpdateAgent(selectedAgent.id, { system_prompt: promptDraft, temperature });
    if (error || !data) {
      toast.error('Enregistrement impossible', { description: error });
      return;
    }
    setAgents((prev) => prev.map((a) => (a.id === selectedAgent.id ? { ...a, system_prompt: promptDraft, temperature } : a)));
    setConfigOpen(false);
    toast.success('Agent mis à jour');
  }, [selectedAgent, promptDraft, tempDraft]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Agents IA</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Conversez avec vos agents et ajustez leurs comportements
        </p>
      </div>

      <div className="agents-layout">
        {/* Colonne gauche : agents + conversations */}
        <aside className="agents-sidebar">
          <div className="agents-section-title">Agents</div>
          <div className="agents-list">
            {agents.map((a) => (
              <button
                key={a.id}
                className={`agent-item ${a.id === selectedAgentId ? 'active' : ''}`}
                onClick={() => setSelectedAgentId(a.id)}
              >
                <Bot size={16} />
                <span>{a.name}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-primary btn-sm btn-full" style={{ margin: '0.75rem 0' }} onClick={startNewChat}>
            <Plus size={14} /> Nouvelle conversation
          </button>

          <div className="agents-section-title">Conversations</div>
          <div className="agents-list">
            {conversations.length === 0 && <div className="kanban-empty">Aucune conversation</div>}
            {conversations.map((c) => (
              <button
                key={c.id}
                className={`agent-item ${c.id === activeConversationId ? 'active' : ''}`}
                onClick={() => openConversation(c)}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title || 'Sans titre'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Colonne droite : chat */}
        <section className="agents-chat card">
          <div className="agents-chat-header">
            <div>
              <div className="card-title">{selectedAgent?.name || 'Agent'}</div>
              <div className="card-description">{selectedAgent?.description}</div>
            </div>
            {canConfigure && selectedAgent && (
              <button className="btn btn-outline btn-sm" onClick={openConfig}>
                <Settings2 size={14} /> Configurer
              </button>
            )}
          </div>

          {configOpen && canConfigure && (
            <div className="agents-config">
              <label className="form-label">Prompt système</label>
              <textarea
                className="form-input"
                rows={5}
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Température (0–2)</label>
                  <input className="form-input" type="number" min="0" max="2" step="0.1" value={tempDraft} onChange={(e) => setTempDraft(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveConfig}>Enregistrer</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfigOpen(false)}>Annuler</button>
              </div>
            </div>
          )}

          <div className="agents-messages">
            {messages.length === 0 && !sending && (
              <div className="kanban-empty">Démarrez la conversation avec {selectedAgent?.name || 'votre agent'}.</div>
            )}
            {messages.map((m, i) => (
              <div key={m.id ?? i} className={`chat-bubble chat-${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="chat-bubble chat-assistant chat-typing">…</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="agents-input" onSubmit={handleSend}>
            <input
              className="form-input"
              placeholder="Écrivez votre message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedAgentId}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim() || !selectedAgentId}>
              <Send size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
