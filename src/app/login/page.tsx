"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) setMessage(error.message);
    else setMessage('Vérifiez votre boîte mail pour le lien magique !');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Accès Associés</h2>
          <p className="text-zinc-500 mt-2">Entrez votre email pour recevoir un lien magique.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">Email Professionnel</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="votre@opays.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-xl text-center text-sm text-zinc-300 border border-zinc-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
