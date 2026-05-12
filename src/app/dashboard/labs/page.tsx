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
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.1),_transparent_30%),linear-gradient(180deg,#050816_0%,#090d1d_60%,#0b1020_100%)]" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-10 p-6 md:p-8">
        <header className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-200 backdrop-blur">
            <Lock size={12} /> Espace Confidentiel
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">OPAYS Labs</h1>
            <p className="max-w-2xl text-sm text-slate-400">Le laboratoire stratégique pour nourrir nos ambitions futures et préparer les paris technologiques à fort impact.</p>
          </div>
          <div className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="rounded-2xl bg-violet-500/15 p-2 text-violet-300">
            <FlaskConical size={24} />
          </div>
          <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Statut</p>
              <p className="text-sm font-semibold text-white">Veille Active</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Lightbulb size={20} className="text-amber-300" /> Nouvelle Intuition Stratégique
              </h2>
              <textarea 
                className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10"
                placeholder="Décrivez une nouvelle technologie, une vision ou un axe de recherche..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[10px] font-medium italic text-slate-400">
                  <Shield size={12} /> Seuls les fondateurs ont accès à ces notes.
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95 disabled:opacity-50"
                >
                  {loading ? 'Archivage...' : 'Enregistrer'} <Send size={16} />
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <h2 className="px-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Journal de Recherche</h2>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-violet-500/20">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400">
                          <Beaker size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                          {new Date(note.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <Sparkles size={16} className="text-violet-300" />
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{note.content}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-white/10 py-20 text-center">
                    <p className="italic text-slate-500">Aucune note de recherche enregistrée.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-600 to-fuchsia-700 p-8 text-white shadow-2xl shadow-violet-600/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <h3 className="text-xl font-semibold">L'Ambition Opays</h3>
              <p className="mt-3 text-sm leading-relaxed text-violet-100">
                La recherche chez Opays n'est pas faite pour être publiée. Elle alimente notre souveraineté technologique et nos futurs produits.
              </p>
              <ul className="space-y-4 pt-6">
                {[
                  { title: "Souveraineté", desc: "Contrôle total des données." },
                  { title: "Intelligence", desc: "IA appliquée au terrain local." },
                  { title: "Automatisation", desc: "Libérer le potentiel humain." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-[11px] text-violet-200">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Outils de Recherche</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Benchmarks', 'Papers', 'Drafts', 'Architecture'].map(tool => (
                  <button key={tool} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-slate-300 transition hover:border-violet-500/20 hover:bg-violet-500/10 hover:text-white">
                    {tool}
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
