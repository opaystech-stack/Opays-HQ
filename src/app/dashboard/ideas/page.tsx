"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Lightbulb, ThumbsUp, MessageSquare, Sparkles, ArrowRight, Users } from 'lucide-react';
import NewIdeaModal from '@/components/modals/NewIdeaModal';

const CategoryColors: any = {
  'TECH': 'text-cyan-700 bg-cyan-50 border-cyan-100',
  'SALES': 'text-blue-700 bg-blue-50 border-blue-100',
  'OPS': 'text-emerald-700 bg-emerald-50 border-emerald-100',
  'OTHER': 'text-slate-500 bg-slate-50 border-slate-100',
};

export default function IdeasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchIdeas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ideas')
      .select('*, profiles(full_name)')
      .order('votes', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      <div className="relative z-10 space-y-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
              <Sparkles size={12} /> Espace d'amélioration
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Idées & retours terrain</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
                Ici, chacun peut proposer une amélioration utile, une piste commerciale, ou une idée qui aide l'équipe à mieux travailler.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
          >
            <Lightbulb size={18} /> Proposer une idée
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Objectif</p>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Améliorer le travail</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium">On privilégie les idées qui simplifient, accélèrent ou clarifient.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Ce qu'on veut</p>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Du concret</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium">Une idée utile vaut mieux qu'une grande promesse abstraite.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Esprit</p>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Collectif</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium">Les idées servent à faire progresser l'équipe, pas à faire du bruit.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:border-cyan-200 hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${CategoryColors[idea.category]}`}>
                  {idea.category}
                </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">{idea.status}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{idea.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500 font-medium">{idea.description}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-black text-cyan-700">
                    {idea.profiles?.full_name?.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{idea.profiles?.full_name?.split(' ')[0] || 'Inconnu'}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-cyan-600">
                    <ThumbsUp size={14} />
                    <span className="text-xs font-bold">{idea.votes}</span>
                  </button>
                  <button className="text-slate-400 transition-colors hover:text-cyan-600">
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && !ideas.length && (
            <div className="col-span-full rounded-[2rem] border-2 border-dashed border-slate-200 py-20 text-center text-slate-400 italic font-medium bg-white/50">
            Aucune idée proposée pour le moment. Soyez le premier !
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-600">
              <Users size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.28em]">Pourquoi c'est utile</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
              Les meilleures idées viennent souvent du terrain. Cette page nous aide à garder ces signaux visibles, à les classer et à les transformer en actions réelles.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowRight size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.28em]">Bon réflexe</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
              Avant de proposer une idée, demande-toi si elle aide vraiment un client, un collègue ou simplifie une partie du travail quotidien.
            </p>
          </div>
        </div>

      <NewIdeaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchIdeas} 
      />
      </div>
    </div>
  );
}
