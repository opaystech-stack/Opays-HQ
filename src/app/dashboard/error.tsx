"use client";

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#f8f9fb] px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle size={22} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">Dashboard indisponible</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Une requête du tableau de bord a échoué. Relancez le chargement; si le problème persiste, vérifiez les politiques RLS et les migrations Supabase.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-[11px] text-slate-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    </div>
  );
}
