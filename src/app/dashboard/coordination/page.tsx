"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, MapPin, MessageSquare, Radio, Target, TrendingUp, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function CoordinationPage() {
  const [salesActivity, setSalesActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ leads: 0, actions: 0, won: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: activities } = await supabase
      .from('leads')
      .select('*, profiles(full_name, avatar_url)')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (activities) setSalesActivity(activities);

    const { data: leads } = await supabase.from('leads').select('status');
    if (leads) {
      setStats({
        leads: leads.length,
        actions: leads.filter((lead) => lead.status === 'CONTACTED' || lead.status === 'AUDIT_PENDING').length,
        won: leads.filter((lead) => lead.status === 'WON' || lead.status === 'CLOSED_WON').length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />
      <div className="relative mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <Radio size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Opérations en Direct</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">Coordination des descentes terrain et du pipeline commercial.</p>
          </div>
          <Link href="/dashboard/calendar" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
            <Calendar size={18} /> Planifier une descente
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { label: 'Leads actifs', value: stats.leads, icon: <Users size={20} /> },
            { label: 'Descentes prévues', value: '4', icon: <MapPin size={20} /> },
            { label: 'Audits en cours', value: stats.actions, icon: <Target size={20} /> },
            { label: 'Conversion (WON)', value: stats.won, icon: <TrendingUp size={20} /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="mb-4 w-fit rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-200">
                {stat.icon}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageSquare size={18} className="text-slate-500" /> Flux d'activité des Associés
            </h2>
            <div className="space-y-4">
              {salesActivity.map((activity) => (
                <div key={activity.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 font-bold text-cyan-200">
                        {activity.profiles?.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white">{activity.profiles?.full_name}</span>
                          <span className="text-xs text-slate-500">sur</span>
                          <span className="font-semibold text-cyan-200">{activity.company_name}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Dernière mise à jour du statut : <span className="font-semibold text-slate-200">{activity.status}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                            <Calendar size={10} /> {new Date(activity.updated_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                            <MapPin size={10} /> Descente effectuée
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/leads?id=${activity.id}`} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-200">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}

              {!loading && !salesActivity.length && (
                <div className="rounded-3xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-slate-500">
                  Aucune activité commerciale.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/20">
              <div className="absolute right-0 top-0 p-8 opacity-20">
                <Radio size={80} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Rôle du Chef Comm</h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-400">
                Prince coordonne les goulots identifiés par Patricia et Zaina pour planifier les audits avec l'équipe technique.
              </p>
              <div className="space-y-4">
                <button className="w-full rounded-2xl bg-cyan-500 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-950 transition hover:bg-cyan-400">
                  Affecter un nouveau Lead
                </button>
                <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-100 transition hover:bg-white/10">
                  Consulter les Rapports d'Audit
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Pipeline de Prince</h3>
              <div className="space-y-4">
                {[
                  { name: 'Patricia', stats: '3 Leads actifs • 1 Audit prévu', color: 'bg-emerald-400' },
                  { name: 'Zaina', stats: '5 Leads actifs • 0 Audit prévu', color: 'bg-cyan-400' },
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{member.name}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">{member.stats}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${member.color} animate-pulse`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
