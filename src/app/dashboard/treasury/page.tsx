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
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <div className="relative space-y-8">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600">
              <Wallet size={12} /> Treasury
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">Caisse & partenariats</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Vue de trésorerie alignée avec le pilotage HQ, pour suivre les entrées, sorties et alliances stratégiques sans bruit visuel.
            </p>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <>
                <button
                  onClick={() => setIsPartnerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Handshake size={16} /> Nouveau partenaire
                </button>
                <button
                  onClick={() => setIsTxOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                >
                  <Plus size={16} /> Nouvelle transaction
                </button>
              </>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div 
            onClick={() => {
              if (canEdit) {
                setIsTxOpen(true);
              }
            }}
            className={`group relative rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:col-span-1 transition-all ${canEdit ? 'cursor-pointer hover:border-emerald-400 hover:shadow-2xl' : ''}`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={20} className="text-emerald-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Solde Opérationnel</p>
            <h2 className="text-5xl font-bold text-slate-900 tracking-tighter">{balance.toLocaleString()} $</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                <ArrowUpRight size={14} /> {income.toLocaleString()} $
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
                <ArrowDownRight size={14} /> {expenses.toLocaleString()} $
              </span>
            </div>
            {canEdit && <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">Cliquer pour ajuster le solde</p>}
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:col-span-2">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Alliances actives ({partnerships.length})</h3>
                  {canEdit && <button onClick={() => { setIsPartnerOpen(true); }} className="text-cyan-600 hover:text-cyan-700"><Plus size={16} /></button>}
                </div>
                <div className="space-y-3">
                  {partnerships.map((partner) => (
                    <div 
                      key={partner.id} 
                      onClick={() => {
                        if (canEdit) {
                          setIsPartnerOpen(true);
                        }
                      }}
                      className={`group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 transition-all ${canEdit ? 'cursor-pointer hover:bg-white hover:border-cyan-200 hover:shadow-md' : ''}`}
                    >
                      <span className="text-sm font-bold text-slate-900 uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{partner.name}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.28em] ${partner.status === 'ACTIVE' ? 'border-emerald-100 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                        {partner.status}
                      </span>
                    </div>
                  ))}
                  {!partnerships.length && <p className="text-xs italic text-slate-400">Aucun partenaire enregistré.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Mouvements Récents</h3>
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id} 
                      onClick={() => {
                        if (canEdit) {
                          setIsTxOpen(true);
                        }
                      }}
                      className={`group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all ${canEdit ? 'cursor-pointer hover:bg-white hover:border-slate-200 hover:shadow-md' : ''}`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="truncate text-xs text-slate-900 font-bold uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{log.description}</p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-400 font-black">{log.category || 'DIVERS'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black ${log.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {log.type === 'INCOME' ? '+' : '-'}{Number(log.amount).toLocaleString()} $
                        </span>
                      </div>
                    </div>
                  ))}
                  {!logs.length && <p className="text-xs italic text-slate-400">Aucun mouvement récent.</p>}
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
