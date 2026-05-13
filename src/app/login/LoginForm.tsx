"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setMessage('Erreur d\'authentification. Veuillez réessayer.');
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };
    checkUser();
    const timeout = setTimeout(() => { if (!cancelled) setCheckingSession(false); }, 5000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/dashboard');
    });
    return () => { cancelled = true; clearTimeout(timeout); subscription.unsubscribe(); };
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (showPassword && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(`Erreur: ${error.message}`);
      else window.location.href = '/dashboard';
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) setMessage(`Erreur: ${error.message}`);
      else setMessage('✉️ Lien envoyé ! Vérifiez votre boîte mail.');
    }
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initialisation du HQ...</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 font-medium text-sm";

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="w-full max-w-md space-y-8 text-center mb-8 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white shadow-2xl shadow-cyan-500/10 border border-slate-100 mb-4 animate-in zoom-in-95 duration-500">
          <ShieldCheck className="w-10 h-10 text-cyan-600" />
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
            <Sparkles size={12} /> Enterprise OS
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">OPAYS <span className="text-slate-400">HQ</span></h1>
          <p className="text-slate-500 font-medium text-sm">Connectez-vous pour piloter l'organisation.</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Professionnel</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          {showPassword && (
            <div className="space-y-2 text-left animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required={showPassword}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Connexion...' : showPassword ? 'Se connecter' : 'Recevoir mon accès'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="text-[10px] font-black text-slate-400 hover:text-cyan-600 uppercase tracking-[0.2em] transition-colors"
          >
            {showPassword ? "Utiliser le lien magique" : "Utiliser un mot de passe"}
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-xs font-bold text-center border animate-in zoom-in-95 duration-200 ${message.includes('Erreur') ? 'bg-red-50 border-red-100 text-red-600' : 'bg-cyan-50 border-cyan-100 text-cyan-600'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.35em]">
          Gouvernance Digitale 2026
        </p>
        <div className="h-px w-8 bg-slate-200" />
      </div>
    </div>
  );
}
