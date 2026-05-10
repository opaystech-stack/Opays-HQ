"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Détection automatique de la session (Porte Automatique)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/dashboard';
      }
    };

    checkUser();

    // Écouter les changements d'état (quand on clique sur le mail ou après mot de passe)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.location.href = '/dashboard';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (showPassword && password) {
      // Connexion par mot de passe
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(`Erreur: ${error.message}`);
    } else {
      // Connexion par lien magique
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) setMessage(`Erreur: ${error.message}`);
      else setMessage('Lien envoyé ! Vérifiez votre boîte mail.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Accès Associés</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">Entrez vos identifiants pour accéder au HQ.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1 uppercase tracking-wider">
              Email Professionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>

          {showPassword && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1 uppercase tracking-wider">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="••••••••"
                required={showPassword}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Traitement...' : showPassword ? 'Se connecter' : 'Recevoir un lien magique'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            {showPassword ? "Utiliser le lien magique" : "Se connecter avec un mot de passe"}
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm text-center ${message.includes('Erreur') ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
