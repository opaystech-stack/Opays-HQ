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

  if (profile?.type !== 'ASSOCIATE') {
    redirect('/dashboard');
  }

  const { data: logs } = await supabase
    .from('equity_vesting_logs')
    .select('*')
    .eq('profile_id', user?.id)
    .order('month', { ascending: false });

  const totalVested = logs?.reduce((acc, log) => acc + log.shares_unlocked, 0) || 0;

  return (
    <div className="p-8 space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Mon Equity</h1>
        <p className="text-zinc-500 mt-2">Suivi en temps réel de votre participation au capital d'OPAYS TECH.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Parts Débloquées</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold">{totalVested.toFixed(2)}%</h3>
            <span className="text-zinc-500 text-sm">sur {profile?.equity_percent || 0}%</span>
          </div>
          <div className="mt-6 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000" 
              style={{ width: `${(totalVested / (profile?.equity_percent || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Award size={20} />
            <span className="text-sm font-medium">Objectif Cible</span>
          </div>
          <h3 className="text-4xl font-bold">{profile?.equity_percent || 0}%</h3>
          <p className="text-xs text-zinc-500 mt-2 font-bold text-blue-400">Vesting sur 2 ans (Cliff 6 mois)</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Calendar size={20} />
            <span className="text-sm font-medium">Prochain Déblocage</span>
          </div>
          <h3 className="text-2xl font-bold">1er du mois</h3>
          <p className="text-xs text-zinc-500 mt-2">Sous réserve de l'apport de service validé.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6">Historique des Dotations</h2>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-semibold">Dotation Mensuelle - {new Date(log.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-zinc-500">{log.contribution_notes}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-white">+{log.shares_unlocked}%</span>
            </div>
          ))}

          {!logs?.length && (
            <div className="py-10 text-center">
              <p className="text-zinc-500 italic">Aucune dotation enregistrée pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
