"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, UserCircle, Briefcase, TrendingUp, Download, MoreVertical, Plus, Sparkles } from 'lucide-react';

export default function AdminHRView() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEmployees = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, hr_records(performance_score, created_at)')
      .order('full_name', { ascending: true });
    
    if (profiles) {
      const processed = profiles.map(p => ({
        ...p,
        latest_score: p.hr_records?.[0]?.performance_score || 0
      }));
      setEmployees(processed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Masse Salariale Est.</p>
          <h3 className="text-2xl font-semibold text-white">{(employees.reduce((acc, e) => acc + (e.salary_amount || 0), 0)).toLocaleString()} $ / mois</h3>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Effectif Total</p>
          <h3 className="text-2xl font-semibold text-white">{employees.length} Collaborateurs</h3>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Score Performance Moyen</p>
          <h3 className="text-2xl font-semibold text-cyan-300">
            {Math.round(employees.reduce((acc, e) => acc + (e.latest_score || 0), 0) / (employees.length || 1))}%
          </h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Collaborateur</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Rôle / Grade</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Salaire</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Performance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {employees.map((emp) => (
              <tr key={emp.id} className="group transition-colors hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">
                      {emp.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{emp.full_name}</p>
                      <p className="text-[11px] text-slate-400">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">{emp.role}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">{(emp.salary_amount || 0).toLocaleString()} $</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${emp.latest_score}%` }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{emp.latest_score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
