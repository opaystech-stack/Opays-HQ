"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { FlaskConical, Beaker, Lightbulb, Shield, Send, Lock, CheckCircle2, Sparkles } from 'lucide-react';

export default function LabsPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchNotes = async () => {
    const { data } = await supabase
      .from('ideas')
      .select('*, profiles(full_name)')
      .eq('category', 'RESEARCH')
      .order('created_at', { ascending: false });
    if (data) setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('ideas').insert([{
      title: 'Note de Recherche',
      content: newNote,
      category: 'RESEARCH',
      profile_id: user?.id,
      status: 'PRIVATE'
    }]);

    if (!error) {
      setNewNote('');
      fetchNotes();
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-10">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600">
              <FlaskConical size={14} /> Laboratoire Stratégique
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Labs & R&D</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
                Concevez le futur d'Opays Tech. Identifiez les technologies souveraines et les méthodes qui nous donneront un avantage décisif.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-violet-600 p-3 text-white shadow-lg shadow-violet-600/20">
              <Beaker size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Statut Lab</p>
              <p className="text-sm font-bold text-slate-900">Veille Technologique Active</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm group hover:border-violet-300 transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl bg-violet-50 p-3 text-violet-600 border border-violet-100">
                    <Sparkles size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projet Alpha</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">IA Souveraine On-Premise</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
                  Recherche sur le déploiement de modèles LLM locaux pour garantir la confidentialité totale des données clients critiques.
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {i === 1 ? 'FL' : 'ES'}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">En cours</span>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm group hover:border-fuchsia-300 transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-600 border border-fuchsia-100">
                    <Lightbulb size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Benchmark</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Agents de Coordination</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
                  Exploration des protocoles MCP pour permettre une interopérabilité sans friction entre nos outils internes et les IA.
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      ES
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600">Exploration</span>
                </div>
              </div>
            </div>

            <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-lg">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <Beaker size={24} className="text-violet-600" /> Journal de Bord Scientifique
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Lock size={12} /> Confidentialité Restreinte
                </div>
              </div>

              <form onSubmit={handleSave} className="mb-12 space-y-6">
                <textarea 
                  className="h-40 w-full resize-none rounded-[2rem] border border-slate-100 bg-slate-50 p-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 font-medium"
                  placeholder="Notez une observation, une intuition ou un résultat d'expérience..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex items-center justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition hover:bg-black disabled:opacity-50"
                  >
                    {loading ? 'Archivage...' : 'Enregistrer la note'} <Send size={16} />
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {notes.map((note) => (
                  <div key={note.id} className="relative rounded-[2rem] border border-slate-50 bg-slate-50/50 p-8 transition-all hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-violet-600 shadow-sm">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note de recherche</p>
                          <p className="text-xs font-bold text-slate-900">
                            {new Date(note.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-violet-100 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-violet-600">
                        {note.profiles?.full_name || 'Expert Lab'}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-600 font-medium text-sm text-justify">
                      {note.content}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="rounded-[2.5rem] border border-dashed border-slate-200 py-32 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-200 mb-6">
                      <Beaker size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune donnée expérimentale</p>
                    <p className="mt-2 text-xs text-slate-400 font-medium italic">Commencez à documenter vos recherches pour construire notre avenir.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[3rem] border border-violet-100 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 p-10 text-white shadow-2xl shadow-violet-600/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <h3 className="text-2xl font-black uppercase tracking-tight">Le Manifeste Labs</h3>
              <p className="mt-6 text-sm leading-relaxed text-violet-50 font-medium opacity-90">
                L'innovation chez Opays n'est pas une distraction, c'est notre protection. Nous explorons pour ne jamais subir les changements technologiques.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  { title: "Souveraineté", desc: "Être maîtres de nos algorithmes." },
                  { title: "Adaptation", desc: "IA appliquée au terrain réel." },
                  { title: "Pragmatisme", desc: "L'innovation doit servir le client." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{item.title}</p>
                      <p className="text-xs text-violet-200 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-8">Outils d'Analyse</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Benchmarks IA', icon: <TrendingUp size={16} /> },
                  { label: 'State of Art', icon: <Globe size={16} /> },
                  { label: 'Drafts Architectures', icon: <FlaskConical size={16} /> },
                  { label: 'Veille Concurrentielle', icon: <Shield size={16} /> },
                ].map((tool, i) => (
                  <button 
                    key={i} 
                    className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-600 transition hover:bg-white hover:border-violet-200 hover:text-violet-600 group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400 group-hover:text-violet-600 transition-colors">{tool.icon}</span>
                      {tool.label}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
