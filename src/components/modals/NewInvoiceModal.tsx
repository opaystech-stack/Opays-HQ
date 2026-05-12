"use client";

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Landmark, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewInvoiceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_id: '',
    amount_total: '',
    amount_paid: '0',
    due_date: '',
    status: 'PENDING',
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
    const { error } = await supabase.from('project_billing').insert([
      {
        ...formData,
        amount_total: parseFloat(formData.amount_total),
        amount_paid: parseFloat(formData.amount_paid),
      },
    ]);
    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erreur lors de la création de la facture");
    }
  };

  const inputClass = "w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020]/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <DollarSign size={18} className="text-emerald-300" /> Nouvelle facture
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Projet</label>
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                required
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-500/40"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Montant total</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="number" className={inputClass} placeholder="0" value={formData.amount_total} onChange={(e) => setFormData({ ...formData, amount_total: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Déjà payé</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" size={16} />
                <input type="number" className={inputClass} placeholder="0" value={formData.amount_paid} onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Échéance</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input required type="date" className={inputClass} value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={16} /> Suivi clair
            </div>
            <p className="mt-2 leading-relaxed">Une facture bien liée au projet permet de garder la visibilité financière sans confusion.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:opacity-95 disabled:opacity-50">
              {loading ? 'Création...' : 'Émettre la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
