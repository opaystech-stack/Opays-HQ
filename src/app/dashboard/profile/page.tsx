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
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mon Compte</h1>
        <p className="text-gray-500 mt-1 text-sm">Gérez votre profil, vos notifications et votre sécurité.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Mon Profil</h2>
            </div>

            {/* Avatar + infos */}
            <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                {fullName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{fullName || 'Utilisateur'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-widest">
                    {profile?.role || 'N/A'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md uppercase tracking-widest">
                    {profile?.type || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom complet</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  placeholder="Votre nom" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <input 
                    type="email" 
                    disabled 
                    value={profile?.email || ''}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                    placeholder="+243..." 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</label>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-gray-400" />
                  <input type="text" disabled value={profile?.role || ''} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                </div>
              </div>
            </div>
            <button 
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
              onClick={handleSave}
            >
              {saving ? 'Sauvegardé ✓' : 'Sauvegarder'}
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Bell className="text-orange-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nouveau prospect assigné', desc: 'Recevoir un email quand un prospect vous est attribué' },
                { label: 'Tâche assignée', desc: 'Être notifié des nouvelles tâches' },
                { label: 'Mise à jour projet', desc: 'Changements de statut sur vos projets' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite : Sécurité + Déconnexion */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="text-green-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
            </div>
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
              <p className="text-sm font-medium text-gray-900">Changer le mot de passe</p>
              <p className="text-xs text-gray-400">Modifier votre mot de passe actuel</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
              <p className="text-sm font-medium text-gray-900">Vérification en 2 étapes</p>
              <p className="text-xs text-gray-400">Non activée</p>
            </button>
          </div>

          <div className="bg-white border border-red-100 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Déconnexion</h2>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition-all"
            >
              <LogOut size={16} /> Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
