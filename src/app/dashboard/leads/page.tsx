"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Phone, Mail, Building2, MoreHorizontal, Plus, Clock, Target, Trash2, CheckCircle, Trophy, Sparkles, TrendingUp, Shield } from 'lucide-react';
import NewLeadModal from '@/components/modals/NewLeadModal';

const StatusColors: any = {
  'NEW': 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  'CONTACTED': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'AUDIT_PENDING': 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  'PROPOSAL_SENT': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'CLOSED_WON': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'CLOSED_LOST': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  'WON': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

export default function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const isAuthorized = profileData?.type === 'ASSOCIATE' || profileData?.permissions?.leads || ['CEO', 'COO', 'ADMIN'].includes(profileData?.role || '');
      if (!isAuthorized) {
        window.location.href = '/dashboard';
        return;
      }

      const { data } = await supabase
        .from('leads')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      if (data) setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openNew = () => { setSelectedLead(null); setIsModalOpen(true); };
  const openEdit = (lead: any) => { setSelectedLead(lead); setIsModalOpen(true); };

  const convertToProject = async (lead: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Convertir ${lead.company_name} en projet actif ?`)) {
      setLoading(true);
      await supabase.from('leads').update({ status: 'WON' }).eq('id', lead.id);
      const { data: project, error: pError } = await supabase.from('projects').insert([{
        lead_id: lead.id,
        title: `Projet ${lead.company_name}`,
        status: 'PLANNING',
        branch: 'STUDIO',
        tech_stack: ['IA', 'Automation'],
        gross_margin_projected: (lead.potential_value || 0) * 0.4,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }]).select().single();

      if (!pError) {
        alert("Projet créé avec succès !");
        fetchLeads();
      } else {
        alert("Erreur lors de la conversion");
      }
      setLoading(false);
    }
  };

  const deleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce prospect ?")) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) fetchLeads();
    }
  };

  const getSlaLabel = (deadline?: string) => {
    if (!deadline) return 'TBD';
    const remainingMs = new Date(deadline).getTime() - Date.now();
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    if (remainingHours <= 0) return 'OVERDUE';
    if (remainingHours <= 24) return `${remainingHours}h restantes`;
    return new Date(deadline).toLocaleString('fr-FR');
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(180deg,#050816_0%,#090d1d_55%,#0c1022_100%)]" />
      <div className="relative z-10 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> Revenue Control Center
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Mes Prospects</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Gérez votre pipeline avec une lecture nette du risque, de la valeur et du prochain move commercial.</p>
            </div>
          </div>
          <button 
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/15"
          >
            <Plus size={18} /> Nouveau Prospect
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Total Pipeline</p>
            <h3 className="text-2xl font-semibold text-white">{(leads?.reduce((acc, lead) => acc + (lead.potential_value || 0), 0) || 0).toLocaleString()} $</h3>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">En Audit</p>
            <h3 className="text-2xl font-semibold text-white">{leads?.filter(l => l.status === 'AUDIT_PENDING').length || 0}</h3>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Gagnés</p>
            <h3 className="text-2xl font-semibold text-emerald-300">{leads?.filter(l => ['CLOSED_WON', 'WON'].includes(l.status)).length || 0}</h3>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Total Leads</p>
            <h3 className="text-2xl font-semibold text-white">{leads?.length || 0}</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Entreprise</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Status</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">SLA / Audit</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Valeur Est.</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Assigné à</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => openEdit(lead)}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors group-hover:text-cyan-300">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <span className="block font-semibold text-white">{lead.company_name}</span>
                        <span className="text-xs text-slate-400">{lead.contact_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${StatusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {lead.status === 'NEW' && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-300">
                          <Clock size={12} /> SLA : {getSlaLabel(lead.sla_qualification_deadline)}
                        </div>
                      )}
                      {lead.status === 'AUDIT_PENDING' && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-fuchsia-300">
                          <Target size={12} /> Audit : {lead.audit_deadline ? new Date(lead.audit_deadline).toLocaleDateString() : 'Non planifié'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm font-semibold text-white">{(lead.potential_value || 0).toLocaleString()} $</span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {lead.profiles?.full_name || 'Non assigné'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-all group-hover:opacity-100">
                      {lead.status !== 'WON' && (
                        <button 
                          onClick={(e) => convertToProject(lead, e)}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                          title="Convertir en projet"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {lead.status === 'WON' && <Trophy size={18} className="mr-2 text-amber-300" />}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEdit(lead); }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <button 
                        onClick={(e) => deleteLead(lead.id, e)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !leads.length && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400 italic">
                    Aucun prospect enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <TrendingUp size={16} /> Pipeline prioritaire
            </div>
            <p>Les leads closables sont maintenant lisibles en un coup d'oeil, sans style générique.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-violet-300">
              <Shield size={16} /> Contrôle d'accès
            </div>
            <p>La page suit le RBAC global du dashboard et ne laisse passer que les rôles autorisés.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <Phone size={16} /> Suivi commercial
            </div>
            <p>Les signaux d'audit et les SLA ressortent plus clairement pour prioriser les relances.</p>
          </div>
        </div>

        <NewLeadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchLeads} 
          lead={selectedLead}
        />
      </div>
    </div>
  );
}
