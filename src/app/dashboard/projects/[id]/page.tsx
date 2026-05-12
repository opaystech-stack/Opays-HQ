import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  CheckCircle2,
  FileText,
  MessageSquare,
  Users,
  Zap,
  Layout,
  Download,
  Sparkles,
  ArrowRight,
  Calendar,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import TaskItem from '@/components/TaskItem';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      leads (
        company_name,
        contact_name,
        email
      ),
      project_contracts (
        id,
        version,
        url,
        signed_at
      ),
      project_billing (
        id,
        amount_total,
        amount_paid,
        status,
        due_date
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (!project) notFound();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles(full_name)')
    .eq('project_id', id)
    .order('due_date', { ascending: true });

  const totalBilling = project.project_billing?.reduce((acc: number, b: any) => acc + (b.amount_total || 0), 0) || 0;
  const totalPaid = project.project_billing?.reduce((acc: number, b: any) => acc + (b.amount_paid || 0), 0) || 0;
  const pendingTasks = tasks?.filter((t: any) => t.status !== 'DONE').length || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.08),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10">
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/projects" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-white">{project.title}</h1>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${project.status === 'COMPLETED' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'}`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{project.leads?.company_name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/contracts?project_id=${project.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                <Settings size={16} /> Contrats
              </Link>
              <Link href="/dashboard/workspace" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95">
                <Zap size={16} /> Ouvrir le workspace
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] space-y-8 p-6 md:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Budget total</p>
              <h4 className="text-2xl font-semibold text-white">{totalBilling.toLocaleString()} $</h4>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Déjà payé</p>
              <h4 className="text-2xl font-semibold text-emerald-300">{totalPaid.toLocaleString()} $</h4>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Tâches ouvertes</p>
              <h4 className="text-2xl font-semibold text-cyan-300">{pendingTasks} / {tasks?.length || 0}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-white">
                    <CheckCircle2 size={18} className="text-cyan-300" /> Tâches du projet
                  </h2>
                  <button className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300 transition hover:text-white">Ajouter</button>
                </div>
                <div className="space-y-3 p-4">
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => <TaskItem key={task.id} task={task} onUpdate={() => {}} />)
                  ) : (
                    <p className="py-10 text-center text-sm italic text-slate-500">Aucune tâche assignée à ce projet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h2 className="mb-6 flex items-center gap-2 font-semibold text-white">
                  <MessageSquare size={18} className="text-violet-300" /> Discussion & historique
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-cyan-500/10" />
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm italic text-slate-400">
                      Pas d'activité récente enregistrée.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
                    <textarea
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/40"
                      placeholder="Laisser un commentaire ou une note interne..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Client & contact</h3>
                <p className="text-sm font-semibold text-white">{project.leads?.company_name}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Users size={12} /> {project.leads?.contact_name || 'Contact inconnu'}
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Documents & contrats</h3>
                  <Link href={`/dashboard/contracts?project_id=${project.id}`} className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300 hover:underline">
                    Gérer
                  </Link>
                </div>
                <div className="space-y-2">
                  {project.project_contracts?.length > 0 ? (
                    project.project_contracts.map((c: any) => (
                      <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
                        <span className="flex items-center gap-2">
                          <FileText size={14} className="text-cyan-300" /> Contrat v{c.version}
                        </span>
                        <Download size={12} className="text-slate-500" />
                      </a>
                    ))
                  ) : (
                    <p className="text-[11px] italic text-slate-500">Aucun contrat signé.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">État de facturation</h3>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-slate-400">Total encaissé</span>
                    <span className="font-bold text-white">{totalPaid.toLocaleString()} $</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000" style={{ width: `${Math.min(100, (totalPaid / (totalBilling || 1)) * 100)}%` }} />
                  </div>
                  <p className="mt-2 text-[9px] font-medium text-slate-500">Pipeline : {totalBilling.toLocaleString()} $</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Informations projet</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Échéance</span>
                    <span className="font-bold text-white">{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Non définie'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Branche</span>
                    <span className="font-bold text-white">{project.branch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Progression</span>
                    <span className="font-bold text-cyan-300">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
