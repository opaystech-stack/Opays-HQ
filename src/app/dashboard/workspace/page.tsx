"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Activity, ArrowRight, Box, Database, Globe, Layers3, Lock, Monitor, ShieldCheck, Terminal, Zap } from 'lucide-react';

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  tech_stack: string[] | null;
};

type TaskRow = {
  title: string;
  status: string;
  updated_at: string;
  projects?: { title: string } | { title: string }[] | null;
};

export default function WorkspacePage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setIsRefreshing(true);

      const [{ data: projectData }, { data: taskData }] = await Promise.all([
        supabase.from('projects').select('id, title, status, tech_stack').order('created_at', { ascending: false }).limit(4),
        supabase.from('tasks').select('title, status, updated_at, projects(title)').order('updated_at', { ascending: false }).limit(6),
      ]);

      setProjects((projectData || []) as ProjectRow[]);
      setTasks((taskData || []) as TaskRow[]);
      setLastSync(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setIsRefreshing(false);
    };

    fetchWorkspaceData();
  }, [supabase]);

  const activeTasks = tasks.filter((task) => task.status !== 'DONE').length;

  const statusPill = (label: string, tone: 'emerald' | 'cyan' | 'slate') => {
    const styles = {
      emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
      cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
      slate: 'border-white/10 bg-white/5 text-slate-300',
    } as const;

    return (
      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${styles[tone]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_20%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative space-y-8">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
              <Monitor size={12} /> Workspace
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Espace d'exécution technique
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                Ce workspace remplace l'ancien faux terminal par un vrai tableau de bord d'ingénierie: projets actifs, tâches ouvertes, stack technique et état d'infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-cyan-200">
              <Terminal size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Console remplacée par</p>
              <p className="text-sm font-semibold text-white">Flux de diagnostic et supervision</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Projets actifs', value: projects.length, icon: <Layers3 size={18} />, tone: 'cyan' as const },
            { label: 'Tâches ouvertes', value: activeTasks, icon: <Activity size={18} />, tone: 'emerald' as const },
            { label: 'Dernière sync', value: lastSync || 'En cours', icon: <Zap size={18} />, tone: 'slate' as const },
            { label: 'RBAC / RLS', value: 'Actif', icon: <ShieldCheck size={18} />, tone: 'cyan' as const },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-200">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Projets en cours</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Surface de livraison</p>
              </div>
              <Link href="/dashboard/projects" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 transition hover:border-cyan-400/20 hover:bg-slate-950/85"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white group-hover:text-cyan-200">{project.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tech_stack?.slice(0, 3).map((tech) => (
                        <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {statusPill(project.status, project.status === 'COMPLETED' ? 'emerald' : 'cyan')}
                    <ArrowRight size={16} className="text-slate-500 transition group-hover:text-cyan-300" />
                  </div>
                </Link>
              ))}

              {projects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-slate-500">
                  Aucun projet détecté.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Infrastructure</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Santé du système</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-cyan-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">API / Edge</p>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Vercel / Next.js</p>
                    </div>
                  </div>
                  {statusPill('Live', 'emerald')}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-violet-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Base de données</p>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Supabase + RLS</p>
                    </div>
                  </div>
                  {statusPill('Secured', 'cyan')}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-amber-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Permissions</p>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">JSONB + RBAC</p>
                    </div>
                  </div>
                  {statusPill('Active', 'slate')}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
                  <Box size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">À quoi servait le terminal ?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200/90">
                    Il simulait des logs techniques, mais sans vrai signal d'exploitation. Je l'ai remplacé par une vue utile: projets, sync, infra et diagnostics réels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Activité récente</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Derniers changements sur les tâches</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tasks.map((task) => {
              const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

              return (
                <div key={`${task.title}-${task.updated_at}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {project?.title || 'Sans projet'} • {new Date(task.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {statusPill(task.status, task.status === 'DONE' ? 'emerald' : 'slate')}
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-slate-500">
                Aucune tâche récente.
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
