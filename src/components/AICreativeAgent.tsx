"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Sparkles, Send, Bot, User, Loader2, Image as ImageIcon, Presentation, FileText, Share2, Copy, Check } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function AICreativeAgent() {
  const { profile } = useProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userProfile: profile,
      role: 'CREATIVE_AGENT',
    },
    initialMessages: [
      {
        id: 'brand-init',
        role: 'assistant',
        content: `Bonjour **Zaina** (ou tout autre associ\u00e9). Je suis votre **Assistant Cr\u00e9atif Opays**. Je ma\u00eetrise les codes de notre marque sur le bout des doigts. 
        
Que souhaitez-vous cr\u00e9er aujourd'hui ? Un flyer pour une descente terrain ? Une structure de deck Canva ? Ou un texte percutant pour LinkedIn ?`,
      },
    ],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAction = (type: string) => {
    if (type === 'flyer') setInput("Aide-moi \u00e0 structurer un flyer pour un audit d'automatisation chez un nouveau prospect.");
    if (type === 'canva') setInput("G\u00e9n\u00e8re un plan de 10 diapositives pour une pr\u00e9sentation Vision CEO d'Opays Tech.");
    if (type === 'post') setInput("R\u00e9dige un post LinkedIn court et expert sur la souverainet\u00e9 num\u00e9rique avec Opays.");
  };

  return (
    <div className="flex flex-col h-[600px] rounded-[2.5rem] border border-pink-500/20 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl shadow-pink-500/5">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-violet-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">AI Creative Agent</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">Brand Guardian</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleQuickAction('flyer')} title="Structure de Flyer" className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-pink-300 transition-all">
            <ImageIcon size={18} />
          </button>
          <button onClick={() => handleQuickAction('canva')} title="Plan Canva" className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-pink-300 transition-all">
            <Presentation size={18} />
          </button>
          <button onClick={() => handleQuickAction('post')} title="R\u00e9daction Sociale" className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-pink-300 transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'user' 
                ? 'bg-slate-700 text-slate-300' 
                : 'bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-pink-500/20'
            }`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-white/10 text-white' 
                : 'bg-white/5 border border-white/10 text-slate-200'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                {m.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {m.role === 'assistant' && m.id !== 'brand-init' && (
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => copyToClipboard(m.content)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-pink-300 transition-colors"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copi\u00e9' : 'Copier'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-950/20 border-t border-white/10">
        <div className="relative group">
          <input 
            value={input}
            onChange={handleInputChange}
            placeholder="D\u00e9crivez votre besoin branding..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 pr-12 text-sm text-white outline-none focus:border-pink-500/50 transition-all placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-900 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500 text-center">
          Entra\u00een\u00e9 sur l'identit\u00e9 souveraine d'Opays Tech
        </p>
      </form>
    </div>
  );
}
