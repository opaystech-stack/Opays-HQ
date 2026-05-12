"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { UserCircle, FileText, Target, BarChart3, Download, Award, Users, Sparkles } from 'lucide-react';
import AdminHRView from '@/components/AdminHRView';

export default function HRPage() {
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [view, setView] = useState<'SELF' | 'ADMIN'>('SELF');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data: recordData } = await supabase
        .from('hr_records')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      setRecords(recordData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  const isAdmin = ['CEO', 'COO', 'ADMIN'].includes(profile?.role || '') || profile?.permissions?.hr;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.1),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.1),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> HR Command
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
            {view === 'SELF' ? 'Mon Espace RH' : 'Gestion du Personnel'}
          </h1>
            <p className="mt-1 text-sm text-slate-400">
            {view === 'SELF' ? 'Gérez vos documents administratifs et vos fiches de paie.' : 'Supervisez l\'équipe et la masse salariale.'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <button 
              onClick={() => setView('SELF')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${view === 'SELF' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Ma Fiche
            </button>
            <button 
              onClick={() => setView('ADMIN')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${view === 'ADMIN' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Users size={14} /> Vue Admin
            </button>
          </div>
          )}
        </header>

        {view === 'ADMIN' ? (
          <AdminHRView />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3 text-slate-400">
                <Target size={20} />
                <span className="text-sm font-medium">Performance Actuelle</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-semibold text-white">{records?.[0]?.performance_score || 0}%</h3>
                  <span className="text-sm text-slate-400">Score global</span>
                </div>
                <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" 
                    style={{ width: `${records?.[0]?.performance_score || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3 text-slate-400">
                <BarChart3 size={20} />
                <span className="text-sm font-medium">Salaire Mensuel</span>
                </div>
                <h3 className="text-4xl font-semibold text-white">{(profile?.salary_amount || 0).toLocaleString()} $</h3>
                <p className="mt-2 text-xs text-slate-400">Versé le 1er du mois (Net à payer).</p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3 text-slate-400">
                <Award size={20} />
                <span className="text-sm font-medium">Grade / Rôle</span>
                </div>
                <h3 className="text-2xl font-semibold uppercase tracking-tight text-white">{profile?.role || 'Membre'}</h3>
                <p className="mt-2 text-xs text-slate-400">Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '?'}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <FileText size={20} /> Mes Documents & Fiches de paie
              </h2>
              <div className="space-y-3">
                {records?.filter(r => r.document_url).map((record) => (
                  <div key={record.id} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-cyan-500/20 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors group-hover:text-cyan-300">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Fiche de paie - {new Date(record.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-slate-400">{record.review_notes || 'Document administratif'}</p>
                      </div>
                    </div>
                    <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300">
                      <Download size={18} />
                    </button>
                  </div>
                ))}

                {!records?.filter(r => r.document_url).length && (
                  <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
                    <p className="text-sm italic text-slate-500">Aucun document administratif disponible.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
