"use client";

import React, { useState } from 'react';
import { X, Mail, Shield, UserPlus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function InviteMemberModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'SALES',
    full_name: ''
  });

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pour une invitation simplifiée dans cette version, on crée directement un profil
      // Dans une version plus avancée, on utiliserait supabase.auth.admin.inviteUserByEmail
      const { error } = await supabase.from('profiles').insert([
        { 
          email: formData.email, 
          full_name: formData.full_name, 
          role: formData.role,
          permissions: {
            dashboard: true,
            leads: formData.role === 'SALES' || formData.role === 'CEO' || formData.role === 'COO',
            projects: true,
            treasury: formData.role === 'CEO' || formData.role === 'COO',
            hr: formData.role === 'CEO' || formData.role === 'COO'
          }
        }
      ]);

      if (error) throw error;
      
      onSuccess();
      onClose();
      alert(`Invitation envoyée à ${formData.email}. (Simulé : Profil créé)`);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 outline-none transition focus:border-indigo-400/50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 uppercase tracking-tight">
            <UserPlus size={20} className="text-indigo-600" /> Inviter un membre
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nom complet</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                className={inputClass} 
                placeholder="Ex: Patricia Kashama" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                required 
                type="email" 
                className={`${inputClass} pl-12`} 
                placeholder="email@opays.tech" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Rôle tactique</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className={`${inputClass} pl-12 appearance-none`} 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="CEO">CEO / Direction</option>
                <option value="COO">COO / Opérations</option>
                <option value="CTO">CTO / Technique</option>
                <option value="SALES">SALES / Associé</option>
                <option value="ADMIN">ADMIN / Support</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
            <p className="text-[10px] leading-relaxed text-indigo-900/60 font-medium italic">
              Les permissions d'accès seront automatiquement configurées selon le rôle choisi. Un email d'activation sera envoyé (simulation).
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Invitation...' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
