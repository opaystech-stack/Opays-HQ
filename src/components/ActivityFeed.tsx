"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { CheckCircle2, Clock, DollarSign, MessageSquare, PlusCircle, UserPlus } from 'lucide-react';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchActivities = async () => {
    setLoading(true);

    const { data: leads } = await supabase.from('leads').select('id, company_name, created_at, status').order('created_at', { ascending: false }).limit(3);
    const { data: tasks } = await supabase.from('tasks').select('id, project_id, title, status, updated_at').order('updated_at', { ascending: false }).limit(3);
    const { data: projects } = await supabase.from('projects').select('id, title, created_at').order('created_at', { ascending: false }).limit(2);
    const { data: billing } = await supabase.from('project_billing').select('id, project_id, amount_paid, projects(id, title), updated_at').order('updated_at', { ascending: false }).limit(2);

    const combined = [
      ...(leads || []).map((lead) => ({
        id: lead.id,
        type: 'LEAD',
        href: '/dashboard/leads',
        title: `Nouveau lead : ${lead.company_name}`,
        time: lead.created_at,
        icon: <UserPlus size={14} className="text-cyan-300" />,
      })),
      ...(tasks || []).map((task) => ({
        id: task.id,
        type: 'TASK',
        href: task.project_id ? `/dashboard/projects/${task.project_id}` : '/dashboard/tasks',
        title: task.status === 'DONE' ? `Tâche terminée : ${task.title}` : `Tâche modifiée : ${task.title}`,
        time: task.updated_at,
        icon: task.status === 'DONE' ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Clock size={14} className="text-slate-400" />,
      })),
      ...(projects || []).map((project) => ({
        id: project.id,
        type: 'PROJECT',
        href: `/dashboard/projects/${project.id}`,
        title: `Nouveau projet lancé : ${project.title}`,
        time: project.created_at,
        icon: <PlusCircle size={14} className="text-fuchsia-300" />,
      })),
      ...(billing || []).map((entry) => {
        const p = Array.isArray(entry.projects) ? entry.projects[0] : entry.projects;
        return {
          id: entry.id,
          type: 'BILLING',
          href: p?.id ? `/dashboard/projects/${p.id}` : '/dashboard/contracts',
          title: `Paiement reçu : ${entry.amount_paid}$ (${p?.title || 'Projet'})`,
          time: entry.updated_at,
          icon: <DollarSign size={14} className="text-emerald-300" />,
        };
      }),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);

    setActivities(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-6 text-slate-100 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
        <MessageSquare size={14} /> Flux d'activité global
      </h3>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <Link key={activity.id} href={activity.href} className="group relative flex gap-4">
            {index !== activities.length - 1 && <div className="absolute left-[7px] top-[24px] bottom-[-24px] w-px bg-white/10" />}
            <div className="z-10 mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:bg-cyan-400/15">
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight text-white transition group-hover:text-cyan-200">{activity.title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                {new Date(activity.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.time).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </Link>
        ))}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 animate-pulse">
                <div className="h-4 w-4 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-2 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !activities.length && <p className="py-4 text-center text-xs italic text-slate-500">Aucune activité récente.</p>}
      </div>
    </div>
  );
}
