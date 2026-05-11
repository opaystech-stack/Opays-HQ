"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { DollarSign, Flame, BarChart3, TrendingUp, Users, Briefcase, CheckSquare, Zap } from 'lucide-react';

const CapacityBar = ({ label, current, target, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold">
      <span className="text-zinc-400">{label}</span>
      <span className={current > target ? 'text-red-500' : 'text-zinc-500'}>{current}%</span>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
      <div 
        className={`h-full ${color} transition-all duration-1000`} 
        style={{ width: `${current}%` }}
      />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, change }: { title: string, value: string | number, icon: any, change?: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        {change && <p className="text-green-500 text-xs mt-1">{change} vs mois dernier</p>}
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300">
        {icon}
      </div>
    </div>
  </div>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    pipeline: 0,
    leads: 0,
    audits: 0,
    vesting: 0,
    projects: 0,
    tasks: 0,
    studioShare: 0,
    labsShare: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Leads & Pipeline
      const { data: leads } = await supabase.from('leads').select('potential_value, status');
      const pipelineValue = leads?.reduce((acc, l) => acc + (l.potential_value || 0), 0) || 0;
      const auditCount = leads?.filter(l => l.status === 'AUDIT_PENDING').length || 0;

      // Fetch Projects
      const { data: projectsData } = await supabase.from('projects').select('*, leads(company_name)').limit(5);
      const { data: allProjects } = await supabase.from('projects').select('id, branch');
      const { data: taskData } = await supabase.from('tasks').select('id, status');

      // Fetch Vesting Average (mocked or simplified)
      const { data: logs } = await supabase.from('equity_vesting_logs').select('shares_unlocked');
      const totalVested = logs?.reduce((acc, l) => acc + l.shares_unlocked, 0) || 0;
      const studioCount = allProjects?.filter((project) => project.branch === 'STUDIO').length || 0;
      const labsCount = allProjects?.filter((project) => project.branch === 'LABS').length || 0;
      const totalCount = Math.max(allProjects?.length || 0, 1);
      const studioShare = Math.round((studioCount / totalCount) * 100);
      const labsShare = Math.round((labsCount / totalCount) * 100);

      setStats({
        pipeline: pipelineValue,
        leads: leads?.length || 0,
        audits: auditCount,
        vesting: totalVested,
        projects: allProjects?.length || 0,
        tasks: taskData?.filter((task) => task.status !== 'DONE').length || 0,
        studioShare,
        labsShare
      });
      if (projectsData) setProjects(projectsData);
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">OPAYS HQ</h1>
          <p className="text-zinc-500 mt-2">Bienvenue sur le centre de commandement d'OPAYS TECH.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métriques Classiques */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard title="Leads Actifs" value={stats.leads} icon={<Users className="text-blue-500" />} />
          <StatCard title="Projets en cours" value={stats.projects} icon={<Briefcase className="text-purple-500" />} />
          <StatCard title="Tâches Todo" value={stats.tasks} icon={<CheckSquare className="text-orange-500" />} />
          <StatCard title="Audits Complétés" value={stats.audits} icon={<Zap className="text-yellow-500" />} />
        </div>

        {/* Allocation de Capacité (Audit Recommendation) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Allocation Capacité</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold">LIVE</span>
          </div>
          
          <div className="space-y-4">
            <CapacityBar label="Studio (70%)" current={stats.studioShare || 0} target={70} color="bg-blue-500" />
            <CapacityBar label="Labs (20%)" current={stats.labsShare || 0} target={20} color="bg-purple-500" />
            <CapacityBar label="Buffer (10%)" current={Math.max(0, 100 - (stats.studioShare + stats.labsShare))} target={10} color="bg-zinc-700" />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 italic leading-relaxed">
              {stats.labsShare > 20
                ? "⚠️ Alerte : Les Labs dépassent l'allocation cible. Risque de cannibalisation de la livraison Studio."
                : "Allocation conforme au cadre 70/20/10."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Projets Récents</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                <div>
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-sm text-zinc-500">{project.leads?.company_name} • Échéance : {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'TBD'}</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase">
                  {project.status}
                </span>
              </div>
            ))}
            {projects.length === 0 && <p className="text-zinc-600 italic py-10 text-center">Aucun projet actif.</p>}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Objectifs Collectifs</h2>
          <div className="space-y-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Croissance Pipeline</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              "L'efficience n'est pas une destination, c'est un processus continu."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
