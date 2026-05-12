"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  Layout,
  Loader2,
  MessageSquare,
  Send,
  Settings2,
  Shield,
  Sparkles,
  Terminal,
  User,
  Wand2,
  Zap,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useProfile } from '@/lib/ProfileProvider';

const AVAILABLE_MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', desc: 'Équilibré & Rapide', icon: <Zap size={16} /> },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Expert & Nuancé', icon: <Sparkles size={16} /> },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', desc: 'Polyvalent & Puissant', icon: <Cpu size={16} /> },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'Google', desc: 'Contexte étendu', icon: <Database size={16} /> },
];

const SUGGESTED_SKILLS = [
  { id: 'task', title: 'Créer une tâche', desc: "Assigner du travail à l'équipe", icon: <CheckCircle2 size={16} className="text-emerald-400" /> },
  { id: 'audit', title: "Flux d'activité", desc: "Que s'est-il passé aujourd'hui ?", icon: <Zap size={16} className="text-amber-400" /> },
  { id: 'financial', title: 'Santé financière', desc: 'Trésorerie et factures', icon: <Database size={16} className="text-sky-400" /> },
  { id: 'knowledge', title: 'Base de savoir', desc: 'Chercher une méthode ou un guide', icon: <Terminal size={16} className="text-violet-400" /> },
  { id: 'linkedin', title: 'Post LinkedIn', desc: 'Rédiger une annonce marketing', icon: <Share2 size={16} className="text-cyan-300" /> },
];

export default function AICommandCenter() {
  const { profile } = useProfile();
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userProfile: profile,
      modelId: selectedModel.id,
    },
    initialMessages: [
      {
        id: 'system-init',
        role: 'assistant',
        content: `Système Antigravity OS initialisé. Bienvenue dans le Command Center, **${profile?.full_name || 'associé'}**. Je suis prêt à piloter les opérations avec le modèle **${selectedModel.name}**.`,
      },
    ],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSkillClick = (skill: string) => {
    if (skill === 'task') setInput('Peux-tu créer une tâche pour...');
    if (skill === 'linkedin') setInput('Rédige un post LinkedIn sur...');
    if (skill === 'audit') setInput("Quelles sont les dernières activités importantes dans l'entreprise ?");
    if (skill === 'financial') setInput('Peux-tu me faire un rapport rapide sur la santé financière actuelle ?');
    if (skill === 'knowledge') setInput('Cherche dans la base de connaissance comment nous gérons...');
  };

  return (
    <div className="relative flex min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.12),_transparent_20%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

      <aside className="relative z-10 w-[21rem] shrink-0 border-r border-white/10 bg-slate-950/70 p-6 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Command Center</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200">Intelligence Artificielle</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Moteur IA</p>
            <Settings2 size={14} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full rounded-2xl border p-3 text-left transition-all ${
                  selectedModel.id === model.id
                    ? 'border-cyan-400/30 bg-cyan-400/10 ring-1 ring-cyan-400/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${selectedModel.id === model.id ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                    {model.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{model.name}</p>
                    <p className="text-[9px] text-slate-400">{model.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Skills disponibles</p>
          <div className="space-y-2">
            {SUGGESTED_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSkillClick(skill.id)}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/60 transition group-hover:bg-white/10">
                    {skill.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white">{skill.title}</p>
                    <p className="text-[9px] text-slate-400">{skill.desc}</p>
                  </div>
                </div>
                <ChevronRight size={12} className="text-slate-500 transition group-hover:text-cyan-300" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <Shield className="mb-2 text-cyan-200" size={22} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">Protection</p>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            Agent sécurisé par RBAC. Chaque action importante doit rester traçable dans `activity_log`, `tasks` et `treasury_logs`.
          </p>
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/35 px-6 py-4 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Runtime</p>
            <h2 className="text-xl font-semibold text-white">Antigravity OS</h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">Online</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{selectedModel.provider}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="grid h-full min-h-[calc(100vh-10rem)] grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div ref={scrollRef} className="h-[calc(100vh-20rem)] overflow-y-auto px-6 py-8">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={m.id}
                      className={`mb-6 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[820px] gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${m.role === 'user' ? 'bg-white/10 text-slate-300' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white'}`}>
                          {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                        </div>
                        <div className={`rounded-[1.75rem] px-5 py-4 text-sm leading-7 shadow-lg ${m.role === 'user' ? 'rounded-tr-sm bg-cyan-500 text-white' : 'rounded-tl-sm border border-white/10 bg-slate-950/75 text-slate-200'}`}>
                          {m.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                      <div className="flex gap-1.5 rounded-[1.75rem] rounded-tl-sm border border-white/10 bg-slate-950/75 px-5 py-4">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:0.2s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3 shadow-xl shadow-black/20 focus-within:border-cyan-400/30 focus-within:ring-4 focus-within:ring-cyan-400/10">
                  <Wand2 size={18} className="text-slate-500" />
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`Posez une question à l'intelligence de bord (${selectedModel.name})...`}
                    className="flex-1 bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Exécuter <Send size={16} />
                  </button>
                </form>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Skills & commandes</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Command palette</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>• Créer / mettre à jour des tâches</p>
                  <p>• Résumer `activity_log` et `treasury_logs`</p>
                  <p>• Chercher dans la base de connaissance</p>
                  <p>• Générer des briefings pour CEO, CTO et Sales</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-100">
                    <Layout size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Contrôle opérationnel</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">OS mode</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Modèle actif</p>
                    <p className="mt-2 text-sm font-semibold text-white">{selectedModel.name}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Utilisateur</p>
                    <p className="mt-2 text-sm font-semibold text-white">{profile?.full_name || 'Invité'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-violet-200">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Modes rapides</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shortcuts</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Briefing quotidien pour l'équipe</p>
                  <p>• Audit financier express</p>
                  <p>• Priorisation Kanban par rôle</p>
                  <p>• Notes de décision pour le DG</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
