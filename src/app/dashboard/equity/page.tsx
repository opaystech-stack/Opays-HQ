import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { TrendingUp, Award, Calendar, CheckCircle2 } from 'lucide-react';

export default async function EquityPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const isAuthorized = profile?.type === 'ASSOCIATE' || profile?.permissions?.equity || ['CEO', 'COO', 'ADMIN'].includes(profile?.role || '');

  if (!isAuthorized) {
    redirect('/dashboard');
  }

  const { data: logs } = await supabase
    .from('equity_vesting_logs')
    .select('*')
    .eq('profile_id', user?.id)
    .order('month', { ascending: false });

  const totalVested = logs?.reduce((acc, log) => acc + log.shares_unlocked, 0) || 0;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200 backdrop-blur">
            <Award size={12} /> Equity Center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Mes Actions</h1>
          <p className="max-w-2xl text-sm text-slate-400">Suivez en temps réel vos parts dans le capital d'OPAYS TECH, avec une lecture claire du vesting et des prochains débloquages.</p>
      </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3 text-slate-400">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Parts Débloquées</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-semibold text-white">{totalVested.toFixed(2)}%</h3>
              <span className="text-sm text-slate-400">sur {profile?.equity_percent || 0}%</span>
            </div>
            <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000" 
                style={{ width: `${(totalVested / (profile?.equity_percent || 1)) * 100}%` }}
              ></div>
          </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3 text-slate-400">
            <Award size={20} />
            <span className="text-sm font-medium">Objectif Cible</span>
          </div>
            <h3 className="text-4xl font-semibold text-white">{profile?.equity_percent || 0}%</h3>
            <p className="mt-2 text-xs font-semibold text-cyan-300">Vesting sur 2 ans (Cliff 6 mois)</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3 text-slate-400">
            <Calendar size={20} />
            <span className="text-sm font-medium">Prochain Déblocage</span>
          </div>
            <h3 className="text-2xl font-semibold text-white">1er du mois</h3>
            <p className="mt-2 text-xs text-slate-400">Sous réserve de l'apport de service validé.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Historique des Dotations</h2>
          <div className="space-y-3">
            {logs?.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-emerald-500/20 hover:bg-white/8">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Dotation Mensuelle - {new Date(log.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-400">{log.contribution_notes}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-emerald-300">+{log.shares_unlocked}%</span>
              </div>
            ))}

            {!logs?.length && (
              <div className="py-10 text-center">
                <p className="italic text-slate-500">Aucune dotation enregistrée pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
