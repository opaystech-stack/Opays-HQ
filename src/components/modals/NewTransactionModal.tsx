"use client";

import React, { useState } from 'react';
import { X, DollarSign, FileText, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewTransactionModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'INCOME',
    date: new Date().toISOString().split('T')[0]
  });

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('treasury_logs').insert([{
      ...formData,
      amount: parseFloat(formData.amount)
    }]);
    setLoading(false);
    if (!error) { onSuccess(); onClose(); }
    else { alert("Erreur lors de l'enregistrement de la transaction"); }
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 outline-none transition focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <DollarSign size={18} className="text-cyan-600" /> Nouvelle Transaction
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'INCOME'})}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
            >
              <ArrowUpRight size={14} /> Revenu
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'EXPENSE'})}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
            >
              <ArrowDownRight size={14} /> Dépense
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required type="text" className={inputClass} placeholder="Ex: Paiement Serveurs, Achat Matériel..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Montant ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="number" className={inputClass} placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" className={inputClass} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-black disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
