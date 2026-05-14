"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Briefcase, CheckSquare, Compass, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import ActivityFeed from '@/components/ActivityFeed';
import { useProfile } from '@/lib/ProfileProvider';
import { canAccessModule } from '@/lib/rbac';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  accent: string;
  description: string;
};

export type DashboardStats = {
  pipeline: number;
  leads: number;
  audits: number;
  vesting: number;
  projects: number;
  tasks: number;
  studioShare: number;
  labsShare: number;
};

export type DashboardProject = {
  id: string;
  title: string;
  status: string | null;
  due_date: string | null;
  branch: string | null;
  leads?: { company_name?: string | null } | null;
};

const CapacityBar = ({ label, current, target, accent }: { label: string; current: number; target: number; accent: string; }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[11px] font-semibold">
      <span className="text-slate-500">{label}</span>
      <span className={current > target ? 'text-red-500' : 'text-slate-400'}>{current}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</h3>
        <p className="mt-2 text-xs text-slate-400">{description}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600 shadow-sm transition-transform group-hover:scale-105">
        {icon}
      </div>
    </div>
    <div className="relative mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-600">
      Ouvrir le module <ArrowRight size={14} />
    </div>
  </Link>
);

export default function DashboardOverview({
  initialStats,
  initialProjects,
}: {
  initialStats: DashboardStats;
  initialProjects: DashboardProject[];
}) {
  const { profile } = useProfile();
  const stats = initialStats;
  const projects = initialProjects;
  const roleLabel = profile?.role || 'Équipe';
  const canSeeProjects = canAccessModule(profile, 'projects');

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative space-y-8"
      >
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
              <Sparkles size={12} /> Opays Help Ai OS
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
              Bonjour {profile?.full_name?.split(' ')[0] || roleLabel},
              <span className="block text-slate-500">voici le pouls de l’entreprise en temps réel.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Vue consolidée des projets, du pipeline commercial, des tâches et de la trésorerie pour piloter l'équipe comme un véritable système d'exploitation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Pipeline</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">${stats.pipeline.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Missions ouvertes</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.tasks}</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-4">
          {canAccessModule(profile, 'leads') && (
            <StatCard
              title="Prospects"
              value={stats.leads}
              icon={<Users size={20} />}
              href="/dashboard/leads"
              accent="from-cyan-500 via-cyan-400 to-transparent"
              description="Base commerciale active et flux de qualification."
            />
          )}
          {canAccessModule(profile, 'projects') && (
            <StatCard
              title="Projets"
              value={stats.projects}
              icon={<Briefcase size={20} />}
              href="/dashboard/projects"
              accent="from-indigo-500 via-indigo-400 to-transparent"
              description="Livraisons clients et initiatives internes."
            />
          )}
          {canAccessModule(profile, 'tasks') && (
            <StatCard
              title="Tâches"
              value={stats.tasks}
              icon={<CheckSquare size={20} />}
              href="/dashboard/tasks"
              accent="from-emerald-500 via-emerald-400 to-transparent"
              description="Charge active sur l'équipe opérationnelle."
            />
          )}
          {canAccessModule(profile, 'audit') && (
            <StatCard
              title="Audits IA"
              value={stats.audits}
              icon={<Zap size={20} />}
              href="/dashboard/audit"
              accent="from-fuchsia-500 via-fuchsia-400 to-transparent"
              description="Analyses en cours et opportunités d'optimisation."
            />
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Projets récents</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Flux de livraison</p>
              </div>
              {canSeeProjects && (
                <Link href="/dashboard/projects" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                  Tout voir <ArrowRight size={14} />
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {canSeeProjects && projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 transition hover:border-cyan-400/20 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-cyan-600">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.leads?.company_name || 'Client interne'} • Échéance {project.due_date ? new Date(project.due_date).toLocaleDateString('fr-FR') : 'TBD'}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                    {project.status}
                  </span>
                </Link>
              ))}
              {canSeeProjects && projects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-400">
                  Aucun projet actif pour le moment.
                </div>
              )}
              {!canSeeProjects && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-400">
                  Accès projets non activé.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Répartition du travail</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Capacité stratégique</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-600">
                  Live
                </div>
              </div>

              <div className="space-y-4">
                <CapacityBar label="Services" current={stats.studioShare || 0} target={70} accent="bg-gradient-to-r from-cyan-400 to-blue-500" />
                <CapacityBar label="Innovation" current={stats.labsShare || 0} target={20} accent="bg-gradient-to-r from-fuchsia-400 to-violet-500" />
                <CapacityBar label="Réserve" current={Math.max(0, 100 - (stats.studioShare + stats.labsShare))} target={10} accent="bg-gradient-to-r from-slate-300 to-slate-200" />
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
                {stats.labsShare > 20
                  ? 'Attention: la part innovation dépasse le seuil cible. Rebalancez la capacité vers la livraison.'
                  : 'La répartition actuelle reste cohérente avec le modèle de croissance.'}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Commandes rapides</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Navigation accélérée</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { href: '/dashboard/ai', label: 'AI Center', moduleId: 'ai' },
                  { href: '/dashboard/tasks', label: 'Kanban', moduleId: 'tasks' },
                  { href: '/dashboard/treasury', label: 'Trésorerie', moduleId: 'treasury' },
                  { href: '/dashboard/settings', label: 'Pilotage', moduleId: 'settings' },
                ].filter((item) => canAccessModule(profile, item.moduleId)).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Flux d'activité</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Événements récents</p>
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
