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

  const [selectedIdea, setSelectedIdea] = useState<any>(null);

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
              <Sparkles size={12} /> Intelligence Collective
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase tracking-tighter">Boîte à <span className="text-cyan-600">Idées</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
                Espace de co-création pour l'amélioration continue d'Opays Tech. Proposez, votez et discutez des prochaines évolutions.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition hover:bg-black"
          >
            <Lightbulb size={18} /> Proposer
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <div 
              key={idea.id} 
              onClick={() => setSelectedIdea(idea)}
              className="flex flex-col justify-between rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm hover:border-cyan-400 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-cyan-600" />
              </div>

              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${CategoryColors[idea.category]}`}>
                  {idea.category}
                </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{idea.status}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{idea.title}</h3>
                  <p className="mt-4 line-clamp-3 text-sm text-slate-500 font-medium leading-relaxed">{idea.description}</p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-100 text-xs font-black text-cyan-700 shadow-sm">
                    {idea.profiles?.full_name?.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idea.profiles?.full_name?.split(' ')[0] || 'Inconnu'}</span>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-slate-400 transition-colors hover:text-cyan-600">
                    <ThumbsUp size={16} />
                    <span className="text-xs font-black">{idea.votes}</span>
                  </button>
                  <button className="text-slate-400 transition-colors hover:text-cyan-600">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && !ideas.length && (
            <div className="col-span-full rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center text-slate-400 italic font-medium bg-white/50">
            Aucune idée proposée pour le moment. Soyez le premier !
            </div>
          )}
        </div>

        {selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${CategoryColors[selectedIdea.category]}`}>
                      {selectedIdea.category}
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter">{selectedIdea.title}</h2>
                  </div>
                  <button onClick={() => setSelectedIdea(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowRight className="rotate-180" size={24} />
                  </button>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedIdea.description}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 border-b border-slate-100 pb-4">
                    <MessageSquare size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Commentaires de l'équipe</h4>
                  </div>
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-400 italic font-medium">Aucun commentaire pour le moment. L'IA analyse la pertinence...</p>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <input 
                      type="text" 
                      placeholder="Votre avis technique..." 
                      className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-cyan-400 transition-all font-medium"
                    />
                    <button className="px-8 py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20">
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
