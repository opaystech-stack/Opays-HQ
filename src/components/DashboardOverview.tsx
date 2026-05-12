"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowRight, BarChart3, Briefcase, CheckSquare, Compass, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import ActivityFeed from '@/components/ActivityFeed';
import { useProfile } from '@/lib/ProfileProvider';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  accent: string;
  description: string;
};

const CapacityBar = ({ label, current, target, accent }: { label: string; current: number; target: number; accent: string; }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[11px] font-semibold">
      <span className="text-slate-400">{label}</span>
      <span className={current > target ? 'text-red-300' : 'text-slate-500'}>{current}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${accent}`}
        style={{ width: `${current}%` }}
      />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, href, accent, description }: StatCardProps) => (
  <Link
    href={href}
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</h3>
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-300 shadow-lg shadow-black/20 transition-transform group-hover:scale-105">
        {icon}
      </div>
    </div>
    <div className="relative mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-200">
      Ouvrir le module <ArrowRight size={14} />
    </div>
  </Link>
);

export default function DashboardOverview() {
  const { profile } = useProfile();
  const [stats, setStats] = useState({
    pipeline: 0,
    leads: 0,
    audits: 0,
    vesting: 0,
    projects: 0,
    tasks: 0,
    studioShare: 0,
    labsShare: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: leads } = await supabase.from('leads').select('potential_value, status');
      const pipelineValue = leads?.reduce((acc, lead) => acc + (lead.potential_value || 0), 0) || 0;
      const auditCount = leads?.filter((lead) => lead.status === 'AUDIT_PENDING').length || 0;

      const { data: projectsData } = await supabase.from('projects').select('id, title, status, due_date, branch, leads(company_name)').order('created_at', { ascending: false }).limit(5);
      const { data: allProjects } = await supabase.from('projects').select('id, branch');
      const { data: taskData } = await supabase.from('tasks').select('id, status');
      const { data: logs } = await supabase.from('equity_vesting_logs').select('shares_unlocked');

      const totalVested = logs?.reduce((acc, log) => acc + (log.shares_unlocked || 0), 0) || 0;
      const studioCount = allProjects?.filter((project) => project.branch === 'STUDIO').length || 0;
      const labsCount = allProjects?.filter((project) => project.branch === 'LABS').length || 0;
      const totalCount = Math.max(allProjects?.length || 0, 1);

      setStats({
        pipeline: pipelineValue,
        leads: leads?.length || 0,
        audits: auditCount,
        vesting: totalVested,
        projects: allProjects?.length || 0,
        tasks: taskData?.filter((task) => task.status !== 'DONE').length || 0,
        studioShare: Math.round((studioCount / totalCount) * 100),
        labsShare: Math.round((labsCount / totalCount) * 100),
      });

      if (projectsData) setProjects(projectsData);
    };

    fetchData();
  }, [supabase]);

  const roleLabel = profile?.role || 'Équipe';

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_22%),linear-gradient(180deg,_#050816_0%,_#0b1020_54%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative space-y-8"
      >
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
              <Sparkles size={12} /> Antigravity OS
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
              Bonjour {profile?.full_name?.split(' ')[0] || roleLabel},
              <span className="block text-slate-400">voici le pouls de l’entreprise en temps réel.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              Vue consolidée des projets, du pipeline commercial, des tâches et de la trésorerie pour piloter l'équipe comme un véritable système d'exploitation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pipeline</p>
              <p className="mt-2 text-2xl font-semibold text-white">${stats.pipeline.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Missions ouvertes</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.tasks}</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title="Prospects"
            value={stats.leads}
            icon={<Users size={20} />}
            href="/dashboard/leads"
            accent="from-cyan-500/20 via-cyan-500/5 to-transparent"
            description="Base commerciale active et flux de qualification."
          />
          <StatCard
            title="Projets"
            value={stats.projects}
            icon={<Briefcase size={20} />}
            href="/dashboard/projects"
            accent="from-indigo-500/20 via-indigo-500/5 to-transparent"
            description="Livraisons clients et initiatives internes."
          />
          <StatCard
            title="Tâches"
            value={stats.tasks}
            icon={<CheckSquare size={20} />}
            href="/dashboard/tasks"
            accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
            description="Charge active sur l'équipe opérationnelle."
          />
          <StatCard
            title="Audits IA"
            value={stats.audits}
            icon={<Zap size={20} />}
            href="/dashboard/audit"
            accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
            description="Analyses en cours et opportunités d'optimisation."
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Projets récents</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Flux de livraison</p>
              </div>
              <Link href="/dashboard/projects" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 transition hover:border-cyan-400/20 hover:bg-slate-950/80"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-cyan-200">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {project.leads?.company_name || 'Client interne'} • Échéance {project.due_date ? new Date(project.due_date).toLocaleDateString('fr-FR') : 'TBD'}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                    {project.status}
                  </span>
                </Link>
              ))}
              {projects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-slate-500">
                  Aucun projet actif pour le moment.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Répartition du travail</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Capacité stratégique</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                  Live
                </div>
              </div>

              <div className="space-y-4">
                <CapacityBar label="Services" current={stats.studioShare || 0} target={70} accent="bg-gradient-to-r from-cyan-400 to-blue-500" />
                <CapacityBar label="Innovation" current={stats.labsShare || 0} target={20} accent="bg-gradient-to-r from-fuchsia-400 to-violet-500" />
                <CapacityBar label="Réserve" current={Math.max(0, 100 - (stats.studioShare + stats.labsShare))} target={10} accent="bg-gradient-to-r from-slate-500 to-slate-300" />
              </div>

              <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">
                {stats.labsShare > 20
                  ? 'Attention: la part innovation dépasse le seuil cible. Rebalancez la capacité vers la livraison.'
                  : 'La répartition actuelle reste cohérente avec le modèle de croissance.'}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Commandes rapides</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Navigation accélérée</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { href: '/dashboard/ai', label: 'AI Center' },
                  { href: '/dashboard/tasks', label: 'Kanban' },
                  { href: '/dashboard/treasury', label: 'Trésorerie' },
                  { href: '/dashboard/settings', label: 'Pilotage' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/20 hover:bg-slate-950/90"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Flux d'activité</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Événements récents</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
              <BarChart3 size={14} /> Consolidé
            </div>
          </div>
          <ActivityFeed />
        </section>
      </motion.div>
    </div>
  );
}
