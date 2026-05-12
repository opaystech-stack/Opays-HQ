"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ArrowDownRight, ArrowUpRight, Handshake, Plus, Trash2, Wallet } from 'lucide-react';
import NewPartnerModal from '@/components/modals/NewPartnerModal';
import NewTransactionModal from '@/components/modals/NewTransactionModal';

export default function TreasuryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    const isAuthorized = ['CEO', 'COO', 'ADMIN'].includes(profileData?.role || '') || profileData?.permissions?.treasury || profileData?.type === 'ASSOCIATE';
    if (!isAuthorized) {
      window.location.href = '/dashboard';
      return;
    }

    const { data: logsData } = await supabase.from('treasury_logs').select('*').order('date', { ascending: false });
    const { data: partnersData } = await supabase.from('partnerships').select('*').order('name', { ascending: true });

    setLogs(logsData || []);
    setPartnerships(partnersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteLog = async (id: string) => {
    if (confirm('Supprimer cette transaction ?')) {
      const { error } = await supabase.from('treasury_logs').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const canEdit = ['CEO', 'COO', 'ADMIN'].includes(profile?.role || '') || profile?.permissions?.treasury || profile?.permissions?.accounting;
  const balance = logs.reduce((acc, log) => acc + (log.type === 'INCOME' ? log.amount : -log.amount), 0);
  const income = logs.filter((l) => l.type === 'INCOME').reduce((acc, l) => acc + l.amount, 0);
  const expenses = logs.filter((l) => l.type === 'EXPENSE').reduce((acc, l) => acc + l.amount, 0);

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />

      <div className="relative space-y-8">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">
              <Wallet size={12} /> Treasury
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">Caisse & partenariats</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Vue de trésorerie alignée avec le pilotage HQ, pour suivre les entrées, sorties et alliances stratégiques sans bruit visuel.
            </p>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <>
                <button
                  onClick={() => setIsPartnerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <Handshake size={16} /> Nouveau partenaire
                </button>
                <button
                  onClick={() => setIsTxOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Plus size={16} /> Nouvelle transaction
                </button>
              </>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20 md:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Solde actuel</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">{balance.toLocaleString()} $</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                <ArrowUpRight size={16} /> {income.toLocaleString()} $
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-200">
                <ArrowDownRight size={16} /> {expenses.toLocaleString()} $
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Partenariats actifs ({partnerships.length})</h3>
                <div className="mt-4 space-y-3">
                  {partnerships.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                      <span className="text-sm font-semibold text-white">{partner.name}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.28em] ${partner.status === 'ACTIVE' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                        {partner.status}
                      </span>
                    </div>
                  ))}
                  {!partnerships.length && <p className="text-xs italic text-slate-500">Aucun partenaire enregistré.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Flux récents</h3>
                <div className="mt-4 space-y-3">
                  {logs.slice(0, 8).map((log) => (
                    <div key={log.id} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                      <div className="min-w-0 pr-4">
                        <p className="truncate text-sm text-slate-200">{log.description}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">{log.category || 'Uncategorized'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${log.type === 'INCOME' ? 'text-emerald-200' : 'text-red-200'}`}>
                          {log.type === 'INCOME' ? '+' : '-'}{Number(log.amount).toLocaleString()} $
                        </span>
                        {canEdit && (
                          <button onClick={() => deleteLog(log.id)} className="rounded-lg p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-red-300">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!logs.length && <p className="text-xs italic text-slate-500">Aucun mouvement récent.</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <NewTransactionModal isOpen={isTxOpen} onClose={() => setIsTxOpen(false)} onSuccess={fetchData} />
      <NewPartnerModal isOpen={isPartnerOpen} onClose={() => setIsPartnerOpen(false)} onSuccess={fetchData} />
    </div>
  );
}
