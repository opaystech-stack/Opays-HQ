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

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 outline-none transition focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Building2 size={18} className="text-cyan-600" /> {lead ? 'Modifier le Prospect' : 'Nouveau Prospect'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Entreprise *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required type="text" className={inputClass} placeholder="Nom de la société" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Contact</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" className={inputClass} placeholder="Nom du contact" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Valeur Est. ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="number" className={inputClass} placeholder="0" value={formData.potential_value} onChange={(e) => setFormData({...formData, potential_value: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="email" className={inputClass} placeholder="email@exemple.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="tel" className={inputClass} placeholder="+243 ..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-cyan-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700 disabled:opacity-50">
              {loading ? (lead ? 'Modification...' : 'Création...') : (lead ? 'Enregistrer' : 'Créer le Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
