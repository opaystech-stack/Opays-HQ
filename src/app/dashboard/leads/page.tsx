"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, Phone, Mail, Building2, MoreHorizontal, Plus, Clock, Target } from 'lucide-react';
import NewLeadModal from '@/components/modals/NewLeadModal';

const StatusColors: any = {
  'NEW': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'CONTACTED': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'AUDIT_PENDING': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'PROPOSAL_SENT': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'CLOSED_WON': 'bg-green-500/10 text-green-500 border-green-500/20',
  'CLOSED_LOST': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getSlaLabel = (deadline?: string) => {
    if (!deadline) return 'TBD';
    const remainingMs = new Date(deadline).getTime() - Date.now();
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    if (remainingHours <= 0) return 'OVERDUE';
    if (remainingHours <= 24) return `${remainingHours}h restantes`;
    return new Date(deadline).toLocaleString('fr-FR');
  };

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Leads & CRM</h1>
          <p className="text-zinc-500 mt-2">Gérez votre pipeline de vente et suivez chaque opportunité.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all"
        >
          <Plus size={18} /> Nouveau Lead
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Pipeline</p>
          <h3 className="text-2xl font-bold">{(leads?.reduce((acc, lead) => acc + (lead.potential_value || 0), 0) || 0).toLocaleString()} $</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">En Audit</p>
          <h3 className="text-2xl font-bold">{leads?.filter(l => l.status === 'AUDIT_PENDING').length || 0}</h3>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Entreprise</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">SLA / Audit</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Valeur Est.</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Assigné à</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span className="font-bold block">{lead.company_name}</span>
                      <span className="text-[10px] text-zinc-500">{lead.contact_name}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${StatusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {lead.status === 'NEW' && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-red-400">
                        <Clock size={12} /> SLA : {getSlaLabel(lead.sla_qualification_deadline)}
                      </div>
                    )}
                    {lead.status === 'AUDIT_PENDING' && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400">
                        <Target size={12} /> Audit : {lead.audit_deadline ? new Date(lead.audit_deadline).toLocaleDateString() : 'Non planifié'}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm">{(lead.potential_value || 0).toLocaleString()} $</span>
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  {lead.profiles?.full_name || 'Non assigné'}
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && !leads.length && (
              <tr>
                <td colSpan={6} className="p-20 text-center text-zinc-600 italic">
                  Aucun prospect enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchLeads} 
      />
    </div>
  );
}
