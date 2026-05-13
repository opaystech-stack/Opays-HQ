"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  ChevronRight, 
  MapPin, 
  MessageSquare, 
  Radio, 
  Target, 
  TrendingUp, 
  Users,
  Sparkles,
  ArrowRight,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react';
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
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-600">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-600"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Command Center v2.0</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Pilotage <span className="text-cyan-600">Opérationnel</span></h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 font-medium">Synchronisation stratégique des descentes terrain et du pipeline commercial pour l'exécution tactique.</p>
          </div>
          <div className="flex gap-4">
            <button 
              className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              <FileText size={18} /> Guide Opérationnel
            </button>
            <Link 
              href="/dashboard/calendar" 
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition hover:bg-black"
            >
              <Calendar size={18} /> Planifier
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="text-2xl font-black text-cyan-600/10 mb-4">PHASE 01</div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3">Immersion Terrain</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Identification des frictions réelles chez le prospect. L'objectif est de collecter le "bruit" opérationnel sans filtre technique.</p>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="text-2xl font-black text-cyan-600/10 mb-4">PHASE 02</div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3">Diagnostic IA</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Analyse des données collectées via le moteur d'audit pour quantifier le ROI potentiel et les goulots d'étranglement.</p>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="text-2xl font-black text-cyan-600/10 mb-4">PHASE 03</div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3">Exécution Tactique</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Déploiement des solutions automatisées et suivi de la performance en temps réel pour valider les gains projetés.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { label: 'Leads actifs', value: stats.leads, icon: <Users size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { label: 'Descentes prévues', value: '4', icon: <MapPin size={20} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
            { label: 'Audits en cours', value: stats.actions, icon: <Target size={20} />, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
            { label: 'Conversion (WON)', value: stats.won, icon: <TrendingUp size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-900/5 transition-all">
              <div className={`mb-6 w-fit rounded-2xl border ${stat.border} ${stat.bg} p-4 ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
              <h3 className="mt-3 text-4xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 uppercase tracking-tight">
                <Activity size={20} className="text-slate-400" /> Flux d'activité des Associés
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Temps Réel</span>
            </div>
            
            <div className="space-y-4">
              {salesActivity.map((activity) => (
                <div key={activity.id} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-600/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 font-bold text-cyan-600 border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-all uppercase">
                        {activity.profiles?.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-slate-900 uppercase tracking-tight">{activity.profiles?.full_name}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">sur</span>
                          <span className="text-base font-bold text-cyan-600 uppercase tracking-tight">{activity.company_name}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 font-medium">
                          Mise à jour : <span className="font-bold text-slate-700">{activity.status}</span>
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-6">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Calendar size={12} /> {new Date(activity.updated_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            <MapPin size={12} /> Descente effectuée
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/leads?id=${activity.id}`} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400 transition hover:bg-white hover:text-cyan-600 hover:border-cyan-200 hover:shadow-sm">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}

              {!loading && !salesActivity.length && (
                <div className="rounded-[2rem] border border-dashed border-slate-200 px-6 py-20 text-center">
                  <MessageSquare size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-sm font-medium italic text-slate-400">Aucune activité commerciale détectée.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-900 bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20">
              <div className="absolute right-0 top-0 p-10 opacity-10">
                <Zap size={100} />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300 backdrop-blur-md mb-6">
                <Sparkles size={10} /> Rôle Tactique
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Command Comm</h3>
              <p className="mb-8 leading-7 text-slate-300 font-medium text-sm">
                Prince coordonne les goulots identifiés par Patricia et Zaina pour planifier les audits avec l'équipe technique.
              </p>
              <div className="space-y-4">
                <button className="w-full rounded-2xl bg-cyan-600 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 shadow-xl shadow-cyan-600/20">
                  Affecter un nouveau Lead
                </button>
                <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:bg-white/10">
                  Consulter Rapports d'Audit
                </button>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="rounded-xl bg-slate-50 p-2 text-slate-400">
                  <Users size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.28em] text-slate-900">Pipeline de Prince</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Patricia', stats: '3 Leads actifs • 1 Audit prévu', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                  { name: 'Zaina', stats: '5 Leads actifs • 0 Audit prévu', color: 'bg-cyan-500', bg: 'bg-cyan-50' },
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 group hover:bg-white hover:border-slate-200 transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{member.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">{member.stats}</p>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${member.color} shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform`} />
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 text-indigo-900">
                <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest mb-2">
                  <ShieldCheck size={14} className="text-indigo-600" /> Sécurité RLS
                </div>
                <p className="text-[11px] leading-relaxed font-medium opacity-80">
                  L'accès aux données est restreint par politique RLS. Prince voit tout, les associés voient leurs propres leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
