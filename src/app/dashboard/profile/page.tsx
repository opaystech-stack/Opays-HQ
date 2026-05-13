"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Bell, Shield, LogOut, Mail, Phone, Award, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    // Validation basique
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      alert('Le nom doit contenir entre 2 et 100 caractères.');
      return;
    }

    if (trimmedPhone && !/^\+?[\d\s\-()]{6,20}$/.test(trimmedPhone)) {
      alert('Format de téléphone invalide.');
      return;
    }

    setSaving(true);
    // Restriction explicite : seuls full_name et phone sont modifiables par l'utilisateur
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: trimmedName,
        phone: trimmedPhone || null,
      })
      .eq('id', profile.id);

    if (error) {
      alert(`Erreur: ${error.message}`);
      setSaving(false);
    } else {
      setTimeout(() => setSaving(false), 1000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 font-medium";

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      <div className="relative mx-auto max-w-7xl space-y-8">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
            <User size={12} /> Mon compte
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">Profil & sécurité</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
            Gérez votre identité, vos notifications et votre accès de façon simple et cohérente avec le reste du HQ.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <User className="text-cyan-600" size={20} />
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Mon profil</h2>
              </div>

              <div className="mt-5 flex items-center gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-black text-white shadow-lg shadow-cyan-500/20">
                  {fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{fullName || 'Utilisateur'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-600">
                      {profile?.role || 'N/A'}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      {profile?.type || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-1">Nom complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-1">Email</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100/50 px-4 py-3">
                    <Mail size={14} className="text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full bg-transparent text-sm text-slate-500 font-medium outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-1">Téléphone</label>
                  <div className="flex items-center gap-2 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="+243..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-1">Rôle</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100/50 px-4 py-3">
                    <Award size={14} className="text-slate-400" />
                    <input
                      type="text"
                      disabled
                      value={profile?.role || ''}
                      className="w-full bg-transparent text-sm text-slate-500 font-medium outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <button
                className="mt-6 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                onClick={handleSave}
              >
                {saving ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Bell className="text-amber-500" size={20} />
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Notifications</h2>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: 'Nouveau prospect assigné', desc: 'Recevoir un email quand un prospect vous est attribué' },
                  { label: 'Tâche assignée', desc: 'Être notifié des nouvelles tâches' },
                  { label: 'Mise à jour projet', desc: 'Changements de statut sur vos projets' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white hover:border-slate-200 transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className="text-emerald-600" size={20} />
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Sécurité</h2>
              </div>
              <div className="mt-4 space-y-3">
                <button className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:bg-white hover:border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Mot de passe</p>
                    <p className="mt-1 text-[10px] uppercase font-bold text-slate-400">Modifier</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:bg-white hover:border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Double authentification</p>
                    <p className="mt-1 text-[10px] uppercase font-bold text-slate-400">Non activée</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-red-900 uppercase tracking-tight">Zone de danger</h2>
              <p className="mt-2 text-xs text-red-600/70 font-medium">La déconnexion mettra fin à votre session active sur ce terminal.</p>
              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
              >
                <LogOut size={16} /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
