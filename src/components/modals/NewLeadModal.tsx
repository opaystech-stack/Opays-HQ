"use client";

import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewLeadModal({ isOpen, onClose, onSuccess, lead }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, lead?: any }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    potential_value: 0,
    status: 'NEW',
    sla_qualification_deadline: '',
    audit_deadline: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        setFormData({
          company_name: lead.company_name || '',
          contact_name: lead.contact_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          potential_value: lead.potential_value || 0,
          status: lead.status || 'NEW',
          sla_qualification_deadline: lead.sla_qualification_deadline || '',
          audit_deadline: lead.audit_deadline || ''
        });
      } else {
        setFormData({
          company_name: '', contact_name: '', email: '', phone: '', potential_value: 0, status: 'NEW',
          sla_qualification_deadline: '', audit_deadline: ''
        });
      }
    }
  }, [isOpen, lead]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (lead) {
      res = await supabase.from('leads').update(formData).eq('id', lead.id);
    } else {
      res = await supabase.from('leads').insert([{
        ...formData,
        sla_qualification_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }]);
    }

    setLoading(false);
    if (!res.error) { onSuccess(); onClose(); }
    else { alert(`Erreur lors de la ${lead ? 'modification' : 'création'} du lead`); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm";
  const darkInputClass = "w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-slate-100 outline-none transition focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020]/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Building2 size={18} className="text-cyan-300" /> {lead ? 'Modifier le Prospect' : 'Nouveau Prospect'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Entreprise *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input required type="text" className={darkInputClass} placeholder="Nom de la société" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" className={darkInputClass} placeholder="Nom du contact" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Valeur Est. ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="number" className={darkInputClass} placeholder="0" value={formData.potential_value} onChange={(e) => setFormData({...formData, potential_value: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" className={darkInputClass} placeholder="email@exemple.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="tel" className={darkInputClass} placeholder="+243 ..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:opacity-50">
              {loading ? (lead ? 'Modification...' : 'Création...') : (lead ? 'Enregistrer' : 'Créer le Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
