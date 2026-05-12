"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Plus,
  Filter,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import NewContractModal from '@/components/modals/NewContractModal';
import NewInvoiceModal from '@/components/modals/NewInvoiceModal';
import Link from 'next/link';
import { useProfile } from '@/lib/ProfileProvider';

const StatusColors: any = {
  PENDING: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  PARTIAL: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  PAID: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

const StatusLabels: any = {
  PENDING: 'En attente',
  PARTIAL: 'Partiel',
  PAID: 'Payé',
};

export default function ContractsPage() {
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams.get('project_id');

  const [contracts, setContracts] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);
  const { isManager: isManagerFromContext } = useProfile();

  const fetchData = async () => {
    setLoading(true);

    let contractQuery = supabase.from('project_contracts').select('*, projects(id, title, status, leads(company_name))');
    if (projectIdFilter) contractQuery = contractQuery.eq('project_id', projectIdFilter);
    const { data: contractsData } = await contractQuery.order('signed_at', { ascending: false });
    if (contractsData) setContracts(contractsData);

    let billingQuery = supabase.from('project_billing').select('*, projects(id, title, leads(company_name))');
    if (projectIdFilter) billingQuery = billingQuery.eq('project_id', projectIdFilter);
    const { data: billingData } = await billingQuery.order('due_date', { ascending: true });
    if (billingData) setBilling(billingData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectIdFilter]);

  const deleteInvoice = async (id: string) => {
    if (confirm('Supprimer cette facture ?')) {
      const { error } = await supabase.from('project_billing').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const isManager = isManagerFromContext;
  const totalDue = billing?.reduce((acc, b) => acc + (b.amount_total || 0), 0) || 0;
  const totalPaid = billing?.reduce((acc, b) => acc + (b.amount_paid || 0), 0) || 0;
  const pendingCount = billing?.filter((b) => b.status !== 'PAID').length || 0;

  const activeProjectTitle = projectIdFilter && (contracts[0]?.projects?.title || billing[0]?.projects?.title);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> Suivi contractuel
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Contrats & facturation</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Un espace clair pour suivre les engagements signés, les paiements attendus et ce qui reste à recouvrer.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {projectIdFilter && (
              <Link href="/dashboard/contracts" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/10">
                <X size={16} /> Effacer le filtre
              </Link>
            )}
            {isManager && (
              <>
                <button onClick={() => setIsContractOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15">
                  <Plus size={16} /> Contrat
                </button>
                <button onClick={() => setIsInvoiceOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95">
                  <DollarSign size={16} /> Facture
                </button>
              </>
            )}
          </div>
        </header>

        {projectIdFilter && activeProjectTitle && (
          <div className="rounded-[1.75rem] border border-cyan-500/20 bg-cyan-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-cyan-200">
              <Filter size={18} />
              <p className="text-sm font-medium">
                Filtré par projet : <span className="font-bold">{activeProjectTitle}</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Montant total</p>
            <h3 className="text-2xl font-semibold text-white">{totalDue.toLocaleString()} $</h3>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Total encaissé</p>
            <h3 className="text-2xl font-semibold text-emerald-300">{totalPaid.toLocaleString()} $</h3>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">À recouvrer</p>
            <h3 className="text-2xl font-semibold text-amber-300">{(totalDue - totalPaid).toLocaleString()} $</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FileText size={20} className="text-cyan-300" /> Documents contractuels
              </h2>
              <span className="text-xs font-medium text-slate-400">{contracts.length} fichiers</span>
            </div>
            <div className="space-y-3 p-6">
              {contracts.map((contract: any) => (
                <div key={contract.id} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-500/20 hover:bg-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <FileText size={18} />
                    </div>
                    <div>
                      <Link href={`/dashboard/projects/${contract.projects?.id}`} className="text-sm font-semibold text-white transition hover:text-cyan-300">
                        {contract.projects?.title || 'Projet'}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {contract.projects?.leads?.company_name} • v{contract.version} • {new Date(contract.signed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {contract.url && (
                    <a href={contract.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300">
                      <Download size={16} />
                    </a>
                  )}
                </div>
              ))}
              {!loading && !contracts.length && (
                <div className="py-12 text-center">
                  <FileText size={40} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm italic text-slate-500">Aucun contrat trouvé.</p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <DollarSign size={20} className="text-emerald-300" /> État des paiements
              </h2>
              <span className="text-xs font-medium text-slate-400">{pendingCount} en attente</span>
            </div>
            <div className="space-y-3 p-6">
              {billing.map((invoice: any) => (
                <div key={invoice.id} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                      {invoice.status === 'PAID' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <Link href={`/dashboard/projects/${invoice.projects?.id}`} className="text-sm font-semibold text-white transition hover:text-cyan-300">
                        {invoice.projects?.title || 'Projet'}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {invoice.projects?.leads?.company_name} • Échéance : {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-bold text-white">{(invoice.amount_paid || 0).toLocaleString()} / {(invoice.amount_total || 0).toLocaleString()} $</p>
                      <span className={`mt-1 inline-block rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.24em] ${StatusColors[invoice.status]}`}>
                        {StatusLabels[invoice.status] || invoice.status}
                      </span>
                    </div>
                    {isManager && (
                      <button onClick={() => deleteInvoice(invoice.id)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && !billing.length && (
                <div className="py-12 text-center">
                  <DollarSign size={40} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm italic text-slate-500">Aucun suivi de paiement trouvé.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Ce que cette page dit au client</p>
            <p>On suit les engagements avec sérieux, sans complexité inutile.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Ce qu'elle dit à l'équipe</p>
            <p>Chaque projet a ses documents, ses échéances et ses paiements visibles en un coup d'œil.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Règle simple</p>
            <p>Si un suivi n'est pas clair, il doit être rendu lisible avant de passer à autre chose.</p>
          </div>
        </div>

        <NewContractModal isOpen={isContractOpen} onClose={() => setIsContractOpen(false)} onSuccess={fetchData} />
        <NewInvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} onSuccess={fetchData} />
      </div>
    </div>
  );
}
