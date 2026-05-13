"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Shield, 
  FileText, 
  CreditCard, 
  Lock, 
  Globe, 
  Database,
  Plus,
  Mail,
  Trash2,
  PieChart,
  DollarSign,
  Briefcase,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import InviteMemberModal from '@/components/modals/InviteMemberModal';
import AssociateDocumentsModal from '@/components/modals/AssociateDocumentsModal';
import AssignEquityModal from '@/components/modals/AssignEquityModal';
import AccessControlModal from '@/components/modals/AccessControlModal';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('TEAM');
  const [members, setMembers] = useState<any[]>([]);
  const [equity, setEquity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isEquityOpen, setIsEquityOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: equityData }] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('equity_distribution').select('*, profiles(full_name, role)')
    ]);
    if (profiles) setMembers(profiles);
    if (equityData) setEquity(equityData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'TEAM', label: 'Équipe & Accès', icon: <Users size={18} /> },
    { id: 'LEGAL', label: 'Légal & Statuts', icon: <Shield size={18} /> },
    { id: 'BUDGET', label: 'Budget & Equity', icon: <PieChart size={18} /> },
    { id: 'SYSTEM', label: 'Système', icon: <Database size={18} /> },
  ];

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600">
              <Settings size={14} /> Administration Centrale
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Paramètres</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">Gérez la structure d'Opays Tech, les accès de l'équipe et les paramètres fondamentaux de la plateforme.</p>
            </div>
          </div>
        </header>

        <div className="flex w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white p-1.5 shadow-sm lg:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-2xl px-6 py-3 text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'TEAM' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Membres de l'équipe</h2>
                      <p className="text-sm text-slate-500 font-medium">{members.length} collaborateurs actifs</p>
                    </div>
                    <button 
                      onClick={() => setIsInviteOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-500/10"
                    >
                      <Plus size={16} /> Inviter
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {members.map((member) => (
                      <div 
                        key={member.id} 
                        onClick={() => {
                          setSelectedMember(member);
                          setIsAccessOpen(true);
                        }}
                        className="flex items-center justify-between py-5 first:pt-0 last:pb-0 group cursor-pointer hover:bg-slate-50/50 -mx-4 px-4 rounded-2xl transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {member.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{member.full_name}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{member.role || 'Associé'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
                            member.role === 'CEO' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            {member.role}
                          </span>
                          <div 
                            className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-400 transition hover:bg-white hover:text-slate-900 hover:border-slate-200"
                          >
                            <Lock size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50 p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Rôles & Permissions</h3>
                    <p className="mt-3 text-sm leading-relaxed text-indigo-900 font-medium opacity-80">
                      Permissions centralisées : Fenelon Lamsasiri (DG) détient les clés de voûte de l'infrastructure et de la trésorerie.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedMember(null);
                        setIsAccessOpen(true);
                      }}
                      className="mt-6 w-full rounded-2xl bg-white border border-indigo-200 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition hover:bg-indigo-100"
                    >
                      Matrice d'accès globale
                    </button>
                  </div>
                  <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Stockage Cloud</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-700">Documents Assets</span>
                       <span className="text-[10px] font-black text-emerald-600 uppercase">Synchronisé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LEGAL' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Statuts & Documents</h2>
                    <p className="text-sm text-slate-500 font-medium">Archive sécurisée d'Opays Tech</p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-500/10">
                    <Plus size={16} /> 
                    <span>Upload</span>
                    <input type="file" className="hidden" onChange={(e) => alert('Document reçu. Cryptage et archivage en cours...')} />
                  </label>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: 'Statuts Notariés OPAYS TECH', type: 'PDF', date: 'Jan 2026' },
                    { title: 'RCCM / Identification Nationale', type: 'PDF', date: 'Fév 2026' },
                    { title: 'Pacte d\'Associés v1.2', type: 'DOCX', date: 'Mars 2026' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white hover:border-slate-200 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.title}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{doc.type} • Modifié le {doc.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-10 text-emerald-900">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20">
                  <Globe size={28} />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Identité Juridique</h3>
                <p className="mt-4 leading-relaxed font-medium opacity-80">
                  OPAYS TECH S.A.R.L est une société de droit congolais spécialisée dans l'ingénierie logicielle et le conseil stratégique en IA.
                </p>
                <div className="mt-10 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Capital Social</span>
                    <span className="text-lg font-bold">10,000 USD</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Siège Social</span>
                    <span className="text-sm font-bold">Gombe, Kinshasa</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BUDGET' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Trésorerie Actuelle</p>
                  <h3 className="mt-2 text-4xl font-bold text-slate-900">25,400 $</h3>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">+12% vs mois dernier</span>
                  </div>
                </div>
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Burn Rate Mensuel</p>
                  <h3 className="mt-2 text-4xl font-bold text-slate-900">1,200 $</h3>
                  <p className="mt-6 text-xs text-slate-400 font-medium italic">Inclut infra & frais fixes.</p>
                </div>
                <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50 p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Runway Estimé</p>
                  <h3 className="mt-2 text-4xl font-bold text-indigo-600">21 mois</h3>
                  <p className="mt-6 text-xs text-indigo-900/60 font-medium">Basé sur les dépenses actuelles.</p>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Répartition des Parts (Equity)</h2>
                    <p className="text-sm text-slate-500 font-medium">Répartition du capital entre les associés fondateurs</p>
                  </div>
                  <button 
                    onClick={() => setIsEquityOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-500/10"
                  >
                    <Plus size={18} /> Modifier
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <div className="space-y-6">
                    {equity.map((item) => (
                      <div key={item.id} className="group">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.profiles?.full_name}</span>
                          </div>
                          <span className="text-sm font-black text-indigo-600">{item.equity_percentage}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div 
                            className="h-full rounded-full bg-indigo-600 transition-all duration-1000 group-hover:bg-indigo-500" 
                            style={{ width: `${item.equity_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-center space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                        <DollarSign size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-tight">Valorisation Théorique</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500 font-medium">
                      Basé sur les derniers statuts, la valorisation est fixée à un multiple de 3x la trésorerie actuelle + la valeur de l'IP.
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">150,000 $</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Seed Phase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SYSTEM' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
                <h3 className="mb-8 text-xl font-bold text-slate-900 uppercase tracking-tight">Infrastructure Opays</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Database', status: 'Healthy', provider: 'Supabase' },
                    { label: 'Cloud Hosting', status: 'Active', provider: 'Vercel' },
                    { label: 'AI Engine', status: 'Ready', provider: 'OpenAI/Anthropic' },
                  ].map((sys, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{sys.label}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{sys.provider}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50 p-10 text-rose-900">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-2xl shadow-rose-600/20">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Zone de Danger</h3>
                <p className="mt-4 leading-relaxed font-medium opacity-80">
                  Ces actions sont irréversibles et affectent toute la structure de la plateforme. Manipulez avec une extrême prudence.
                </p>
                <div className="mt-10 space-y-4">
                  <button className="w-full rounded-2xl border border-rose-200 bg-white py-4 text-[10px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-100">
                    Réinitialiser les Clés API
                  </button>
                  <button className="w-full rounded-2xl bg-rose-600 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-rose-700 shadow-xl shadow-rose-600/10">
                    Supprimer l'organisation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onSuccess={fetchData} />
      <AssociateDocumentsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} member={selectedMember} />
      <AssignEquityModal isOpen={isEquityOpen} onClose={() => setIsEquityOpen(false)} onSuccess={fetchData} />
      <AccessControlModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} member={selectedMember} />
    </div>
  );
}
