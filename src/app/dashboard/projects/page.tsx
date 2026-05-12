"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Briefcase, Calendar, DollarSign, ShieldCheck, TrendingDown, Trash2, Layout, FileText, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/lib/ProfileProvider';

const StatusColors: any = {
  PLANNING: 'text-slate-300 bg-white/5 border-white/10',
  IN_PROGRESS: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  TESTING: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  COMPLETED: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  MAINTENANCE: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { checkAccess, isAssociate } = useProfile();

  const fetchData = async () => {
    setLoading(true);
    const { data: projectsData } = await supabase.from('projects').select('*, leads(company_name)').order('due_date', { ascending: true });
    if (projectsData) setProjects(projectsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Supprimer ce projet ?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const canSeeFinancials = isAssociate || checkAccess('treasury') || checkAccess('billing');
  const activeCount = projects.filter((project) => project.status !== 'COMPLETED').length;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.08),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> Production
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Nos projets</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Une vue claire de la production, des échéances et des points de suivi pour garder l'équipe alignée.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
            {activeCount} projets actifs
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Lecture rapide</p>
            <h3 className="text-lg font-semibold text-white">Avancement visible</h3>
            <p className="mt-2 text-sm text-slate-400">Chaque projet doit dire immédiatement où on en est et ce qui reste à faire.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Clarté</p>
            <h3 className="text-lg font-semibold text-white">Rôles et priorités</h3>
            <p className="mt-2 text-sm text-slate-400">La page aide à savoir quoi livrer, quand, et pour quel client.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Sérieux</p>
            <h3 className="text-lg font-semibold text-white">Suivi financier optionnel</h3>
            <p className="mt-2 text-sm text-slate-400">Les informations sensibles restent visibles aux bons rôles seulement.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-white/20">
              <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${project.branch === 'STUDIO' ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' : 'text-violet-300 bg-violet-500/10 border-violet-500/20'}`}>
                          {project.branch === 'STUDIO' ? 'Services' : 'Innovation'}
                        </span>
                        <Link href={`/dashboard/projects/${project.id}`} className="text-xl font-semibold tracking-tight text-white transition hover:text-cyan-300">
                          {project.title}
                        </Link>
                      </div>
                      <p className="text-sm text-slate-400">
                        Client : <span className="font-medium text-slate-200">{project.leads?.company_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] ${StatusColors[project.status]}`}>
                        {project.status}
                      </span>
                      <button onClick={(e) => deleteProject(project.id, e)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack?.map((tech: string) => (
                      <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Étapes de validation</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {project.definition_of_done?.length ? (
                        project.definition_of_done.map((step: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[10px] font-bold text-slate-400">
                              {i + 1}
                            </div>
                            {step}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-slate-500">Aucune étape de validation définie.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 xl:w-80 xl:border-l xl:border-white/10 xl:pl-8">
                  {canSeeFinancials ? (
                    <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                          <DollarSign size={12} /> Marge prévisionnelle
                        </p>
                        <p className="text-xl font-semibold text-emerald-300">{(project.gross_margin_projected || 0).toLocaleString()} $</p>
                      </div>
                      <div className="space-y-1 border-t border-white/10 pt-3">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                          <TrendingDown size={12} className="text-rose-300" /> Marge réelle
                        </p>
                        <p className={`text-xl font-semibold ${(project.gross_margin_real || 0) < (project.gross_margin_projected || 0) ? 'text-rose-300' : 'text-emerald-300'}`}>
                          {(project.gross_margin_real || 0).toLocaleString()} $
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                      <ShieldCheck size={28} className="text-slate-500" />
                      <p className="mt-3 text-xs text-slate-500">Données financières restreintes.</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-1">
                    <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95">
                      <Layout size={14} /> Ouvrir le projet
                    </Link>
                    <Link href={`/dashboard/contracts?project_id=${project.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-200 transition hover:bg-white/10">
                      <FileText size={14} /> Voir les contrats
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && !projects.length && (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
              <Briefcase size={48} className="mx-auto text-slate-600" />
              <p className="mt-4 text-slate-500 italic">Aucun projet actif.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
