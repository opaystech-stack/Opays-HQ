"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Bell, Shield, LogOut, Mail, Phone, Award } from 'lucide-react';
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
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile.id);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />
      <div className="relative mx-auto max-w-7xl space-y-8">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
            <User size={12} /> Mon compte
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">Profil & sécurité</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Gérez votre identité, vos notifications et votre accès de façon simple et cohérente avec le reste du HQ.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <User className="text-cyan-300" size={20} />
                <h2 className="text-lg font-semibold text-white">Mon profil</h2>
              </div>

              <div className="mt-5 flex items-center gap-5 rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-bold text-white">
                  {fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{fullName || 'Utilisateur'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                      {profile?.role || 'N/A'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      {profile?.type || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Nom complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30"
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Email</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                    <Mail size={14} className="text-slate-500" />
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full bg-transparent text-sm text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Téléphone</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                    <Phone size={14} className="text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="+243..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Rôle</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                    <Award size={14} className="text-slate-500" />
                    <input
                      type="text"
                      disabled
                      value={profile?.role || ''}
                      className="w-full bg-transparent text-sm text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <button
                className="mt-6 rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                onClick={handleSave}
              >
                {saving ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <Bell className="text-amber-300" size={20} />
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: 'Nouveau prospect assigné', desc: 'Recevoir un email quand un prospect vous est attribué' },
                  { label: 'Tâche assignée', desc: 'Être notifié des nouvelles tâches' },
                  { label: 'Mise à jour projet', desc: 'Changements de statut sur vos projets' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="peer h-5 w-9 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <Shield className="text-emerald-300" size={20} />
                <h2 className="text-lg font-semibold text-white">Sécurité</h2>
              </div>
              <div className="mt-4 space-y-3">
                <button className="w-full rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-left transition hover:bg-white/10">
                  <p className="text-sm font-semibold text-white">Changer le mot de passe</p>
                  <p className="mt-1 text-xs text-slate-400">Modifier votre mot de passe actuel</p>
                </button>
                <button className="w-full rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-left transition hover:bg-white/10">
                  <p className="text-sm font-semibold text-white">Vérification en 2 étapes</p>
                  <p className="mt-1 text-xs text-slate-400">Non activée</p>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <h2 className="text-lg font-semibold text-white">Déconnexion</h2>
              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
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
