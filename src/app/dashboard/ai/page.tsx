"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Search, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  Activity,
  Bot,
  BrainCircuit,
  Workflow,
  Command,
  Layout,
  Globe,
  MonitorCheck
} from 'lucide-react';
import AICreativeAgent from '@/components/AICreativeAgent';
import AIAuditSpace from '@/components/AIAuditSpace';

export default function AIPage() {
  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-12">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl uppercase">AI Command Center</h1>
            <p className="text-sm font-medium text-slate-500 max-w-2xl">Pilotage centralisé des agents autonomes et de l'identité de marque.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Studio Area */}
          <div className="xl:col-span-8 space-y-10">
            <AICreativeAgent />
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-600/5">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Workflow size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Automatisations Flux</h3>
                <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">Connectez les données du CRM aux agents de rédaction pour automatiser la prospection.</p>
                <button className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-600 hover:text-indigo-700">
                  Ouvrir le Workflow <ArrowRight size={14} />
                </button>
              </div>

              <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-600/5">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <Bot size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Agents Spécialisés</h3>
                <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">Configurez des assistants spécialisés pour le juridique ou le support technique.</p>
                <button className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-violet-600 hover:text-violet-700">
                  Gérer les Agents <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="xl:col-span-4 space-y-10">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    <MonitorCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">Status Infra</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Réseau Neuronal</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest animate-pulse">
                  En ligne
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { name: 'GPT-4o (Reasoning)', status: 'Optimal', latency: '120ms', color: 'bg-emerald-500' },
                  { name: 'Claude 3.5 Sonnet', status: 'Optimal', latency: '85ms', color: 'bg-emerald-500' },
                  { name: 'Opays Custom RAG', status: 'Ready', latency: '210ms', color: 'bg-indigo-500' },
                ].map((model) => (
                  <div key={model.name} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-tight text-slate-900">{model.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Latence: {model.latency}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{model.status}</span>
                      <div className={`h-2.5 w-2.5 rounded-full ${model.color} shadow-sm border-2 border-white`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-3xl border border-indigo-50 bg-indigo-50/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Souveraineté Totale</p>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900/60 font-medium italic">
                  Interactions chiffrées de bout en bout. Données exclues de l'entraînement public.
                </p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Consommation Quota</h3>
                <Activity size={16} className="text-indigo-600" />
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Tokens Opays-Tactical</span>
                    <span className="text-slate-900">1.2M / 5.0M</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: '24%' }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Analyses Audit IA</span>
                    <span className="text-slate-900">42 / 100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>
              <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                  Réinitialisation dans <span className="text-slate-900">12 jours</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
      </div>
    </div>
  );
}
