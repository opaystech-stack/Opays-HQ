"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Save, BookOpen, Sparkles } from 'lucide-react';

export default function NewKnowledgeModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'METHOD',
    content: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('knowledge_articles').insert([formData]);
    if (!error) {
      onSuccess();
      onClose();
      setFormData({ title: '', category: 'METHOD', content: '' });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020]/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Knowledge Base</p>
              <h2 className="text-xl font-semibold text-white">Nouveau Guide</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Titre du Guide</label>
            <input
              required
              type="text"
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/40"
              placeholder="Ex: Méthodologie Audit Flash"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Catégorie</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="METHOD">Méthodologie</option>
              <option value="GUIDE">Guide Pratique</option>
              <option value="VISION">Vision Stratégique</option>
              <option value="TECH">Documentation Tech</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Contenu (Markdown supporté)</label>
            <textarea
              required
              rows={10}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/40"
              placeholder="Décrivez les étapes ou la vision ici..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={16} /> Format recommandé
            </div>
            <p className="mt-2 leading-relaxed">
              Utilise des questions claires, des réponses courtes, puis des étapes concrètes pour que la lecture reste opérationnelle dans l'app.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-slate-300 transition hover:bg-white/10"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:opacity-50"
            >
              <Save size={20} /> {loading ? 'Enregistrement...' : 'Publier le Guide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
