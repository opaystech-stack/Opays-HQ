"use client";

import React, { useState } from 'react';
import { X, Mail, Shield, UserPlus, Loader2, Users, Briefcase, Copy, Check, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'SALES',
    type: 'ASSOCIATE' as 'ASSOCIATE' | 'EMPLOYEE',
    equity_granted: 0,
    salary_granted: 0,
  });

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const token = crypto.randomUUID();

      // Vérifier si une invitation existe déjà pour cet email
      const { data: existing } = await supabase
        .from('invitations')
        .select('id, accepted_at')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (existing?.accepted_at) {
        alert('Cet utilisateur a déjà accepté une invitation.');
        setLoading(false);
        return;
      }

      if (existing && !existing.accepted_at) {
        // Mettre à jour l'invitation existante
        const { error } = await supabase
          .from('invitations')
          .update({
            role: formData.role,
            type: formData.type,
            full_name: formData.full_name,
            token,
            equity_granted: formData.type === 'ASSOCIATE' ? formData.equity_granted : 0,
            salary_granted: formData.type === 'EMPLOYEE' ? formData.salary_granted : 0,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer une nouvelle invitation
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('invitations').insert([{
          email: formData.email.toLowerCase(),
          full_name: formData.full_name,
          role: formData.role,
          type: formData.type,
          token,
          equity_granted: formData.type === 'ASSOCIATE' ? formData.equity_granted : 0,
          salary_granted: formData.type === 'EMPLOYEE' ? formData.salary_granted : 0,
          invited_by: user?.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }]);

        if (error) throw error;
      }

      // Générer le lien d'invitation (l'utilisateur utilisera ce lien pour se connecter)
      const origin = window.location.origin;
      const link = `${origin}/login?invite=${token}&email=${encodeURIComponent(formData.email.toLowerCase())}`;
      setInviteLink(link);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      alert(`Erreur d'invitation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSuccess(false);
    setInviteLink('');
    setCopied(false);
    setFormData({ email: '', full_name: '', role: 'SALES', type: 'ASSOCIATE', equity_granted: 0, salary_granted: 0 });
    onClose();
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 outline-none transition focus:border-indigo-400/50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 text-sm font-medium";

  // Vue de succès avec le lien d'invitation
  if (success) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
        <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-100">
              <Check size={32} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invitation créée !</h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Envoyez ce lien à <span className="font-bold text-slate-900">{formData.full_name || formData.email}</span> pour qu'il accède à Opays HQ.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Expire dans 30 jours
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-transparent text-xs text-slate-600 font-mono outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`rounded-xl p-2 transition-all ${
                    copied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
              <p className="text-[10px] leading-relaxed text-indigo-900/60 font-medium italic">
                Lorsque l'invité cliquera sur ce lien et se connectera via Magic Link, son profil sera automatiquement créé avec le rôle <span className="font-bold">{formData.role}</span> et le type <span className="font-bold">{formData.type}</span>.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-black"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 uppercase tracking-tight">
            <UserPlus size={20} className="text-indigo-600" /> Inviter un membre
          </h2>
          <button onClick={handleClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Type de membre */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Type de membre</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'ASSOCIATE', salary_granted: 0 })}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                  formData.type === 'ASSOCIATE'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                }`}
              >
                <Users size={18} />
                <div className="text-left">
                  <p className="text-xs font-bold">Associé</p>
                  <p className="text-[9px] font-medium opacity-70">Détient des parts</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EMPLOYEE', equity_granted: 0 })}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                  formData.type === 'EMPLOYEE'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                }`}
              >
                <Briefcase size={18} />
                <div className="text-left">
                  <p className="text-xs font-bold">Employé</p>
                  <p className="text-[9px] font-medium opacity-70">Salarié</p>
                </div>
              </button>
            </div>
          </div>

          {/* Nom complet */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nom complet</label>
            <input
              required
              type="text"
              className={inputClass}
              placeholder="Ex: Patricia Kashama"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                required
                type="email"
                className={`${inputClass} pl-12`}
                placeholder="email@exemple.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Rôle tactique</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className={`${inputClass} pl-12 appearance-none`}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="CEO">CEO / Direction</option>
                <option value="COO">COO / Opérations</option>
                <option value="CTO">CTO / Technique</option>
                <option value="SALES">SALES / Commercial</option>
                <option value="ENGINEER">ENGINEER / Développeur</option>
                <option value="ADMIN">ADMIN / Support</option>
              </select>
            </div>
          </div>

          {/* Equity (Associé seulement) */}
          {formData.type === 'ASSOCIATE' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Equity proposée (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className={inputClass}
                placeholder="0"
                value={formData.equity_granted || ''}
                onChange={(e) => setFormData({ ...formData, equity_granted: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}

          {/* Salaire (Employé seulement) */}
          {formData.type === 'EMPLOYEE' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Salaire mensuel ($)</label>
              <input
                type="number"
                min="0"
                step="100"
                className={inputClass}
                placeholder="0"
                value={formData.salary_granted || ''}
                onChange={(e) => setFormData({ ...formData, salary_granted: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
            <p className="text-[10px] leading-relaxed text-indigo-900/60 font-medium italic">
              Une invitation sera créée et un lien unique sera généré. Le membre devra se connecter via ce lien pour activer son compte avec les permissions appropriées.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Création...' : 'Créer l\'invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
