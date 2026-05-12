"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Minimize2, Sparkles, Loader2, Terminal } from 'lucide-react';
import { useProfile } from '@/lib/ProfileProvider';

export default function AIChatbot() {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userProfile: profile,
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour ${profile?.full_name?.split(' ')[0] || 'associé'}. Je suis Antigravity OS. Comment puis-je assister vos opérations aujourd'hui ?`,
      },
    ],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[560px] w-[26rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            <div className="relative flex items-center justify-between overflow-hidden border-b border-white/10 px-4 py-4 text-white">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Terminal size={40} />
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Antigravity <span className="text-cyan-300">OS</span></h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Système actif</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_30%)] p-4 space-y-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${m.role === 'user' ? 'bg-white/10 text-slate-300' : 'bg-cyan-500 text-slate-950'}`}>
                      {m.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'rounded-tr-sm bg-cyan-500 text-white' : 'rounded-tl-sm border border-white/10 bg-white/10 text-slate-200'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                    <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/10 px-4 py-3">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-950/90 p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Posez une question à l'OS..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30 focus:ring-4 focus:ring-cyan-400/10"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
                Antigravity OS v1.0.4 - Intelligence collective
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl shadow-black/30 transition-all duration-500 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? (
          <X className="text-white" size={24} />
        ) : (
          <div className="relative">
            <MessageSquare className="text-white" size={24} />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
        )}
      </button>
    </div>
  );
}
