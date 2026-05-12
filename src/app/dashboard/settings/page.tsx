"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Settings, UserPlus, FileUp, Users, ShieldCheck, DollarSign, Shield, TrendingUp, BarChart3 } from 'lucide-react';
import AccessControlModal from '@/components/modals/AccessControlModal';
import AssignEquityModal from '@/components/modals/AssignEquityModal';
import AssociateDocumentsModal from '@/components/modals/AssociateDocumentsModal';
import { useProfile } from '@/lib/ProfileProvider';

export default function SettingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isEquityModalOpen, setIsEquityModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { profile, isCEO, isManager } = useProfile();

  const fetchData = async () => {
    setLoading(true);
    const { data: membersData } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
    const { data: docsData } = await supabase.from('global_documents').select('*').order('created_at', { ascending: false });
    setMembers(membersData || []);
    setDocs(docsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAccessControl = (member: any) => {
    setSelectedMember(member);
    setIsAccessModalOpen(true);
  };

  if (loading && !profile) return <div className="p-8 text-slate-400">Chargement du centre de pilotage...</div>;

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />
      <div className="relative mx-auto max-w-7xl space-y-10">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
            <Settings size={12} /> Paramètres
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">Centre de pilotage</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            {isCEO ? "Gérez l'équipe, les accès, les budgets et les documents importants." : "Consultez les paramètres accessibles selon votre rôle."}
          </p>
        </header>

        {isCEO && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <UserPlus className="text-cyan-300" size={22} />
                <h2 className="text-lg font-semibold text-white">Inviter un membre</h2>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Email</label>
                    <input type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" placeholder="email@opays.tech" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Rôle</label>
                    <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30">
                      <option value="SALES">Commercial</option>
                      <option value="ENGINEER">Ingénieur</option>
                      <option value="CTO">CTO</option>
                      <option value="COO">COO</option>
                      <option value="INVESTOR">Investisseur</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Parts (%)</label>
                    <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Salaire ($)</label>
                    <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Type de contrat</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30">
                    <option value="ASSOCIATE">Associé (parts + salaire)</option>
                    <option value="EMPLOYEE">Employé (salaire uniquement)</option>
                  </select>
                </div>
                <button className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Envoyer l'invitation
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <FileUp className="text-violet-300" size={22} />
                <h2 className="text-lg font-semibold text-white">Documents importants</h2>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Titre du document</label>
                  <input type="text" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/30" placeholder="ex: Contrat type 2026" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Qui peut voir ce document ?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Associés', 'Employés', 'CEO', 'CTO', 'Commerciaux'].map((role) => (
                      <label key={role} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-xs font-medium text-slate-300">
                        <input type="checkbox" className="accent-cyan-400" /> {role}
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Publier le document
                </button>
              </form>

              {docs.length > 0 && (
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Documents existants</p>
                  {docs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                      <p className="text-sm font-medium text-white">{doc.title}</p>
                      <span className="text-[10px] text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isCEO && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <Users size={20} /> Membres de l'équipe ({members?.length || 0})
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 p-4 transition-all hover:border-cyan-400/20 hover:bg-slate-950/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-xs font-bold text-cyan-200">
                      {member.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.full_name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">{member.role} • {member.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openAccessControl(member)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-all hover:border-cyan-400/20 hover:text-cyan-200" title="Gérer les accès">
                      <Shield size={16} />
                    </button>
                    <button onClick={() => { setSelectedMember(member); setIsEquityModalOpen(true); }} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-all hover:border-emerald-400/20 hover:text-emerald-200" title="Gérer les parts sociales">
                      <TrendingUp size={16} />
                    </button>
                    <button onClick={() => { setSelectedMember(member); setIsDocsModalOpen(true); }} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-all hover:border-cyan-400/20 hover:text-cyan-200" title="Documents personnalisés">
                      <FileUp size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isManager && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <DollarSign className="text-emerald-300" size={22} />
                <h2 className="text-lg font-semibold text-white">Budget mensuel</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Budget Total ($)</label>
                  <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/30" placeholder="10000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Objectif CA ($)</label>
                  <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/30" placeholder="50000" />
                </div>
              </div>
              <button className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                Définir le budget
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-orange-300" size={22} />
                <h2 className="text-lg font-semibold text-white">Répartition du travail</h2>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Services (%)</label>
                  <input type="number" defaultValue={70} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-orange-400/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Innovation (%)</label>
                  <input type="number" defaultValue={20} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-orange-400/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Réserve (%)</label>
                  <input type="number" defaultValue={10} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-orange-400/30" />
                </div>
              </div>
              <button className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">
                Appliquer la répartition
              </button>
            </div>
          </div>
        )}

        {!isManager && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center space-y-4 backdrop-blur-xl shadow-2xl shadow-black/20">
            <ShieldCheck className="mx-auto text-slate-500" size={48} />
            <h2 className="text-lg font-semibold text-white">Accès limité</h2>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              Les paramètres avancés sont réservés aux responsables. Contactez votre manager pour toute demande de modification.
            </p>
          </div>
        )}

        <AccessControlModal isOpen={isAccessModalOpen} onClose={() => { setIsAccessModalOpen(false); fetchData(); }} member={selectedMember} />
        <AssignEquityModal isOpen={isEquityModalOpen} onClose={() => { setIsEquityModalOpen(false); fetchData(); }} onSuccess={fetchData} />
        <AssociateDocumentsModal isOpen={isDocsModalOpen} onClose={() => { setIsDocsModalOpen(false); fetchData(); }} member={selectedMember} />
      </div>
    </div>
  );
}
