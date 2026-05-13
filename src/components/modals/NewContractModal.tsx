"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, Link as LinkIcon, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewContractModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_id: '',
    version: '1.0',
    url: '',
    signed_at: new Date().toISOString().split('T')[0],
  });

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('id, title');
        if (data) setProjects(data);
      };
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('project_contracts').insert([formData]);
    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erreur lors de l'ajout du contrat");
    }
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 font-medium";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 uppercase tracking-tight">
            <FileText size={20} className="text-cyan-600" /> Nouveau contrat
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 px-1">Projet associé</label>
            <select
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400/50 focus:bg-white font-medium appearance-none"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 px-1">Version</label>
              <input type="text" className={inputClass} value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 px-1">Date de signature</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" className={inputClass} value={formData.signed_at} onChange={(e) => setFormData({ ...formData, signed_at: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 px-1">Lien du document (Drive/Cloud)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required type="url" className={inputClass} placeholder="https://..." value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5 text-sm text-cyan-900/70">
            <div className="flex items-center gap-2 text-cyan-600 font-bold uppercase tracking-widest text-[10px]">
              <Sparkles size={14} /> Intelligence Documentaire
            </div>
            <p className="mt-2 leading-relaxed font-medium italic">Assurez-vous que le contrat est accessible par les parties prenantes autorisées.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-cyan-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {loading ? 'Enregistrement...' : 'Ajouter le contrat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
