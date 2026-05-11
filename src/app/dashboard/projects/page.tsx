import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Briefcase, Calendar, FileCheck, ShieldCheck, DollarSign, ExternalLink, MoreVertical, TrendingDown } from 'lucide-react';

const StatusColors: any = {
  'PLANNING': 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  'IN_PROGRESS': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'TESTING': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'COMPLETED': 'text-green-500 bg-green-500/10 border-green-500/20',
  'MAINTENANCE': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

const BillingColors: any = {
  'PENDING': 'bg-red-500/20 text-red-500',
  'PARTIAL': 'bg-yellow-500/20 text-yellow-500',
  'PAID': 'bg-green-500/20 text-green-500',
};

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('type')
    .eq('id', user?.id)
    .single();

  const isAssociate = profile?.type === 'ASSOCIATE';

  const { data: projects } = await supabase
    .from('projects')
    .select('*, leads(company_name)')
    .order('due_date', { ascending: true });

  const projectIds = projects?.map((project) => project.id) || [];
  const [contractsResult, billingResult] = projectIds.length
    ? await Promise.all([
        supabase.from('project_contracts').select('project_id, url, signed_at, version').in('project_id', projectIds),
        supabase.from('project_billing').select('project_id, amount_total, amount_paid, status, due_date, invoice_url').in('project_id', projectIds),
      ])
    : [{ data: [] }, { data: [] }];

  const contractsByProject = (contractsResult.data || []).reduce((acc: Record<string, any>, contract) => {
    acc[contract.project_id] = contract;
    return acc;
  }, {});

  const billingByProject = (billingResult.data || []).reduce((acc: Record<string, any>, bill) => {
    acc[bill.project_id] = bill;
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Gestion des Projets</h1>
          <p className="text-zinc-500 mt-2">Suivi de la production, de la maintenance et de la facturation.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {projects?.map((project) => (
          <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all group shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Identité du Projet */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest ${
                        project.branch === 'STUDIO' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {project.branch}
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">{project.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-500">Client : <span className="text-zinc-300 font-medium">{project.leads?.company_name}</span></p>
                  </div>
                  <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border uppercase tracking-widest shadow-lg ${StatusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.map((tech: string) => (
                    <span key={tech} className="px-3 py-1 bg-zinc-950 text-zinc-500 text-[10px] font-bold rounded-lg border border-zinc-800 uppercase tracking-tighter">{tech}</span>
                  ))}
                </div>

                {/* Definition of Done (Checklist) */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                    <span>Definition of Done (Audit)</span>
                    <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400">P0 / P1</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.definition_of_done?.length ? project.definition_of_done.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50 text-xs text-zinc-400">
                        <div className="w-5 h-5 rounded-md border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500">
                          {i + 1}
                        </div>
                        {step}
                      </div>
                    )) : (
                      <p className="text-xs text-zinc-600 italic">Aucune étape de validation définie.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pilotage de la Marge & Financier (Associés) */}
              <div className="lg:w-80 space-y-4 border-l border-zinc-800/50 pl-10">
                {isAssociate ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                          <DollarSign size={12} /> Marge Prévisionnelle
                        </p>
                        <p className="text-xl font-black text-green-400">{(project.gross_margin_projected || 0).toLocaleString()} $</p>
                      </div>
                      <div className="space-y-1 pt-4 border-t border-zinc-900">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                          <TrendingDown size={12} className="text-red-500" /> Marge Réelle (Burn)
                        </p>
                        <p className={`text-xl font-black ${(project.gross_margin_real || 0) < (project.gross_margin_projected || 0) ? 'text-red-400' : 'text-green-400'}`}>
                          {(project.gross_margin_real || 0).toLocaleString()} $
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">Facturation</p>
                        <p className="text-[10px] font-black text-zinc-300 uppercase">{billingByProject[project.id]?.status || 'PENDING'}</p>
                      </div>
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">Maintenance</p>
                        <p className="text-[10px] font-black text-green-500 uppercase">{project.is_maintenance_active ? 'ACTIVE' : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/50 space-y-1">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                        <FileCheck size={12} /> Contrat isolé
                      </p>
                      {contractsByProject[project.id]?.url ? (
                        <a href={contractsByProject[project.id].url} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                          Voir le contrat <ExternalLink size={12} />
                        </a>
                      ) : (
                        <p className="text-xs text-zinc-600 italic">Aucun contrat archivé.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center text-center space-y-4 h-full">
                    <ShieldCheck size={32} className="text-zinc-800" />
                    <p className="text-xs text-zinc-600">Données financières restreintes aux Associés.</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  <button className="w-full py-3 bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all uppercase tracking-widest">
                    Ouvrir le Workspace
                  </button>
                  <button className="w-full py-3 bg-zinc-800 text-zinc-400 font-black text-xs rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest">
                    Gestion Contrats
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!projects?.length && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <Briefcase size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 italic">Aucun projet actif. Signez un lead pour commencer !</p>
          </div>
        )}
      </div>
    </div>
  );
}
