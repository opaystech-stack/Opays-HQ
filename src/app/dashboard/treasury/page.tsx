import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, Handshake, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default async function TreasuryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  // La trésorerie est un périmètre fondateur, pas un simple espace associé.
  if (!['CEO', 'COO', 'ADMIN'].includes(profile?.role || '')) {
    redirect('/dashboard');
  }

  const { data: logs } = await supabase
    .from('treasury_logs')
    .select('*')
    .order('date', { ascending: false });

  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('*');

  const balance = logs?.reduce((acc, log) => acc + (log.type === 'INCOME' ? log.amount : -log.amount), 0) || 0;
  const income = logs?.filter(l => l.type === 'INCOME').reduce((acc, l) => acc + l.amount, 0) || 0;
  const expenses = logs?.filter(l => l.type === 'EXPENSE').reduce((acc, l) => acc + l.amount, 0) || 0;

  return (
    <div className="p-8 space-y-8 text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Trésorerie & Partenariats</h1>
          <p className="text-zinc-500 mt-2">Vue stratégique sur les actifs et les alliances d'OPAYS TECH.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-all">
            <Handshake size={18} /> Nouveau Partenaire
          </button>
          <button className="px-5 py-2.5 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all">
            <Plus size={18} /> Nouvelle Transaction
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} />
          </div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Solde Actuel</p>
          <h3 className="text-5xl font-black">{balance.toLocaleString()} $</h3>
          <div className="mt-8 flex gap-6">
            <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
              <ArrowUpRight size={16} /> {income.toLocaleString()} $
            </div>
            <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
              <ArrowDownRight size={16} /> {expenses.toLocaleString()} $
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Partenariats Actifs</h3>
            <div className="space-y-4">
              {partnerships?.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">{p.status}</span>
                </div>
              ))}
              {!partnerships?.length && <p className="text-xs text-zinc-600 italic">Aucun partenaire enregistré.</p>}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Derniers Flux</h3>
            <div className="space-y-3">
              {logs?.slice(0, 4).map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">{log.description}</span>
                  <span className={log.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}>
                    {log.type === 'INCOME' ? '+' : '-'}{log.amount} $
                  </span>
                </div>
              ))}
              {!logs?.length && <p className="text-xs text-zinc-600 italic">Aucun mouvement récent.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
