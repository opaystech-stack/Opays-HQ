import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Bot,
  Send,
  Settings2,
  Plus,
  User,
  Sparkles,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Clock,
  Trash2,
  ChevronRight,
} from 'lucide-react';
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

const QUICK_SUGGESTIONS = [
  { icon: Sparkles, label: 'Résumé exécutif', prompt: 'Peux-tu me faire un résumé exécutif de la situation actuelle ?' },
  { icon: Lightbulb, label: 'Idées stratégiques', prompt: 'Quelles sont les meilleures stratégies pour améliorer notre performance ?' },
  { icon: TrendingUp, label: 'Analyse KPI', prompt: 'Analyse les indicateurs clés de performance et suggère des améliorations.' },
  { icon: MessageSquare, label: 'Rapport', prompt: 'Génère un rapport complet sur nos activités récentes.' },
];

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleQuickSuggestion = useCallback(
    (prompt: string) => {
      setInput(prompt);
      // Auto-submit after a brief delay so the user sees the suggestion appear
      setTimeout(() => {
        const form = document.querySelector('.agents-input') as HTMLFormElement;
        if (form) form.requestSubmit();
      }, 100);
    },
    [],
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
    <div className="agents-page">
      {/* Header */}
      <div className="agents-page-header">
        <div>
          <h1 className="agents-page-title">Agents IA</h1>
          <p className="agents-page-subtitle">
            Conversez avec vos agents et ajustez leurs comportements
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
        >
          <ChevronRight size={16} className={`sidebar-toggle-icon ${sidebarOpen ? 'open' : ''}`} />
        </button>
      </div>

      <div className={`agents-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {/* Sidebar : agents + conversations */}
        <aside className="agents-sidebar">
          <div className="agents-sidebar-inner">
            <div className="agents-section-title">
              <Bot size={14} />
              <span>Agents</span>
            </div>
            <div className="agents-list">
              {agents.map((a) => (
                <button
                  key={a.id}
                  className={`agent-item ${a.id === selectedAgentId ? 'active' : ''}`}
                  onClick={() => setSelectedAgentId(a.id)}
                >
                  <div className="agent-item-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="agent-item-info">
                    <span className="agent-item-name">{a.name}</span>
                    {a.description && (
                      <span className="agent-item-desc">{a.description}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-sm btn-full new-chat-btn" onClick={startNewChat}>
              <Plus size={14} /> Nouvelle conversation
            </button>

            <div className="agents-section-title">
              <Clock size={14} />
              <span>Conversations</span>
            </div>
            <div className="agents-list conversations-list">
              {conversations.length === 0 && (
                <div className="kanban-empty">Aucune conversation</div>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className={`agent-item ${c.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => openConversation(c)}
                >
                  <div className="agent-item-avatar conv-avatar">
                    <MessageSquare size={14} />
                  </div>
                  <div className="agent-item-info">
                    <span className="agent-item-name">
                      {c.title || 'Sans titre'}
                    </span>
                    {c.agent_name && (
                      <span className="agent-item-desc">{c.agent_name}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Zone de chat */}
        <section className="agents-chat card">
          {/* En-tête du chat */}
          <div className="agents-chat-header">
            <div className="agents-chat-header-info">
              <div className="chat-header-avatar">
                <Bot size={20} />
              </div>
              <div>
                <div className="card-title">{selectedAgent?.name || 'Agent'}</div>
                <div className="card-description">{selectedAgent?.description || 'Sélectionnez un agent pour commencer'}</div>
              </div>
            </div>
            {canConfigure && selectedAgent && (
              <button className="btn btn-outline btn-sm" onClick={openConfig}>
                <Settings2 size={14} /> Configurer
              </button>
            )}
          </div>

          {/* Configuration */}
          {configOpen && canConfigure && (
            <div className="agents-config">
              <label className="form-label">Prompt système</label>
              <textarea
                className="form-input"
                rows={5}
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
              />
              <div className="agents-config-actions">
                <div className="agents-config-field">
                  <label className="form-label">Température (0–2)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={tempDraft}
                    onChange={(e) => setTempDraft(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveConfig}>Enregistrer</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfigOpen(false)}>Annuler</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="agents-messages">
            {messages.length === 0 && !sending && (
              <div className="agents-empty-state">
                <div className="agents-empty-icon">
                  <Bot size={48} />
                </div>
                <h3>Démarrez une conversation</h3>
                <p>
                  Posez une question à <strong>{selectedAgent?.name || 'votre agent'}</strong> ou choisissez une suggestion ci-dessous.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id ?? i} className={`chat-row chat-${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-avatar assistant-avatar">
                    <Bot size={18} />
                  </div>
                )}
                <div className={`chat-bubble chat-${m.role}`}>
                  <div className="chat-bubble-content">{m.content}</div>
                </div>
                {m.role === 'user' && (
                  <div className="chat-avatar user-avatar">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-row chat-assistant">
                <div className="chat-avatar assistant-avatar">
                  <Bot size={18} />
                </div>
                <div className="chat-bubble chat-assistant chat-typing">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          {messages.length === 0 && !sending && (
            <div className="agents-suggestions">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => handleQuickSuggestion(s.prompt)}
                  disabled={!selectedAgentId}
                >
                  <s.icon size={14} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="agents-input" onSubmit={handleSend}>
            <input
              className="form-input"
              placeholder="Écrivez votre message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedAgentId}
            />
            <button
              type="submit"
              className="btn btn-primary btn-send"
              disabled={sending || !input.trim() || !selectedAgentId}
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
