import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ShieldAlert, UserPlus, FileUp, Users, Lock, Eye } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Seul le CEO ou un Admin a accès
  if (profile?.role !== 'CEO' && !profile?.is_admin) {
    redirect('/dashboard');
  }

  const { data: members } = await supabase.from('profiles').select('*');
  const { data: docs } = await supabase.from('global_documents').select('*');

  return (
    <div className="p-8 space-y-10 text-white">
      <header className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Lock size={12} /> Espace Gouvernance CEO
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Administration Globale</h1>
          <p className="text-zinc-500 mt-2">Gérez les accès, les membres et les documents confidentiels.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestion des Invitations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold">Inviter un Membre</h2>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-blue-500" placeholder="partenaire@opays.tech" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Rôle</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-blue-500">
                  <option value="ENGINEER">Ingénieur (Labs)</option>
                  <option value="SALES">Sales (Studio)</option>
                  <option value="CTO">CTO</option>
                  <option value="COO">COO</option>
                  <option value="INVESTOR">Investisseur</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Equity (%)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-blue-500" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Salaire ($)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-blue-500" placeholder="0" />
              </div>
            </div>
            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
              Générer le lien d'invitation
            </button>
          </form>
        </div>

        {/* Gestion des Documents */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <FileUp className="text-purple-500" size={24} />
            <h2 className="text-xl font-bold">Document Confidentiel</h2>
          </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Titre du document</label>
              <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-purple-500" placeholder="ex: Stratégie 2026" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Visibilité (Qui peut voir ?)</label>
              <div className="grid grid-cols-2 gap-2">
                {['ASSOCIATE', 'EMPLOYEE', 'CEO', 'CTO', 'SALES'].map(role => (
                  <label key={role} className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-[10px] font-bold cursor-pointer hover:border-zinc-700 transition-all">
                    <input type="checkbox" className="accent-purple-500" /> {role}
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
              Uploader & Diffuser
            </button>
          </form>
        </div>
      </div>

      {/* Liste des Membres Actuels */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users size={20} /> Membres de l'organisation ({members?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members?.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center text-xs font-bold">
                  {m.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{m.full_name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{m.role} • {m.type}</p>
                </div>
              </div>
              <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                <Lock size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
