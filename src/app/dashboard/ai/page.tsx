"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Terminal, 
  Cpu, 
  Shield, 
  Zap, 
  ChevronRight,
  Database,
  Layout,
  MessageSquare,
  Wand2,
  Settings2,
  CheckCircle2,
  FileText,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/lib/ProfileProvider';

const AVAILABLE_MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', desc: 'Équilibré & Rapide', icon: <Zap size={16} /> },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Expert & Nuancé', icon: <Sparkles size={16} /> },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', desc: 'Polyvalent & Puissant', icon: <Cpu size={16} /> },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'Google', desc: 'Enorme contexte', icon: <Database size={16} /> },
];

const SUGGESTED_SKILLS = [
  { id: 'task', title: 'Créer une tâche', desc: 'Assigner du travail à l\'équipe', icon: <CheckCircle2 size={16} className="text-green-500" /> },
  { id: 'linkedin', title: 'Post LinkedIn', desc: 'Rédiger une annonce marketing', icon: <Share2 size={16} className="text-blue-500" /> },
  { id: 'audit', title: 'Analyse Audit', desc: 'Résumer les activités récentes', icon: <Terminal size={16} className="text-purple-500" /> },
  { id: 'contract', title: 'Brouillon Contrat', desc: 'Rédiger une clause juridique', icon: <FileText size={16} className="text-orange-500" /> },
];

export default function AICommandCenter() {
  const { profile } = useProfile();
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userProfile: profile,
      modelId: selectedModel.id
    },
    initialMessages: [
      {
        id: 'system-init',
        role: 'assistant',
        content: `Système Antigravity OS initialisé. Bienvenue dans le Command Center, **${profile?.full_name}**. 

Je suis prêt à assister vos opérations stratégiques avec le modèle **${selectedModel.name}**. Que souhaiteriez-vous accomplir ?`
      }
    ]
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSkillClick = (skill: string) => {
    if (skill === 'task') setInput("Peux-tu créer une tâche pour...");
    if (skill === 'linkedin') setInput("Rédige un post LinkedIn sur...");
    if (skill === 'audit') setInput("Fais-moi un résumé des derniers audits...");
    if (skill === 'contract') setInput("Prépare une clause de contrat pour...");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Model & Skills */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col p-6 space-y-8 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-xl">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Command Center</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Intelligence Artificielle</p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Moteur IA</p>
            <Settings2 size={14} className="text-gray-300" />
          </div>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full text-left p-3 rounded-2xl border transition-all ${
                  selectedModel.id === model.id 
                    ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-500/5' 
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedModel.id === model.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {model.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{model.name}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{model.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Skills */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skills Disponibles</p>
          <div className="grid grid-cols-1 gap-2">
            {SUGGESTED_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSkillClick(skill.id)}
                className="group w-full text-left p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                    {skill.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">{skill.title}</p>
                    <p className="text-[9px] text-gray-400 line-clamp-1">{skill.desc}</p>
                  </div>
                </div>
                <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Security / Status */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="p-4 bg-gray-900 rounded-2xl text-white relative overflow-hidden group">
            <Shield className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-125 transition-transform" size={60} />
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Protection</p>
            <p className="text-xs font-medium leading-relaxed">Agent sécurisé par RBAC. Toutes les actions sont tracées.</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Messages list */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-12 space-y-8 scroll-smooth relative z-10"
        >
          {messages.map((m) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-6 max-w-[800px] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  m.role === 'user' ? 'bg-white text-gray-400' : 'bg-gray-900 text-white'
                }`}>
                  {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div className={`p-6 rounded-3xl text-sm leading-loose shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none prose prose-blue max-w-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center animate-pulse">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-3xl rounded-tl-none flex gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="p-12 pt-0 relative z-10">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 pl-6 flex items-center gap-4 group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
          >
            <Wand2 size={20} className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={`Posez une question à l'intelligence de bord (${selectedModel.name})...`}
              className="flex-1 bg-transparent border-none py-4 text-base outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-30"
            >
              Exécuter <Send size={16} />
            </button>
          </form>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Zap size={12} className="text-blue-500" />
              Latence: 140ms
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Layout size={12} className="text-purple-500" />
              Mode: Operational
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <MessageSquare size={12} className="text-green-500" />
              ID: AG-OS-V1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
