"use client";

import React, { useState } from 'react';
import { X, Lightbulb, Tag, AlignLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewIdeaModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECH'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('ideas')
      .insert([{
        ...formData,
        profile_id: user?.id
      }]);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erreur lors de la soumission de l'idée");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-500" /> Pitcher une Idée
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Titre de l'idée *</label>
            <input 
              required
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:border-yellow-500 outline-none"
              placeholder="ex: Intégration de l'API Mines RDC"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Catégorie</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <select 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-yellow-500 outline-none appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="TECH">Technologie / R&D</option>
                <option value="SALES">Ventes / Marketing</option>
                <option value="OPS">Opérations / RH</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <AlignLeft size={12} /> Vision & Description
            </label>
            <textarea 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:border-yellow-500 outline-none h-32 resize-none"
              placeholder="Expliquez l'impact potentiel de cette idée..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
            >
              {loading ? 'Envoi...' : 'Soumettre mon Idée'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
