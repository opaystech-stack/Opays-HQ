import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { FileUp, Lock, Shield, UserPlus, Users } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

  if (profile?.role !== 'CEO' && !profile?.is_admin) {
    redirect('/dashboard');
  }

  const { data: members } = await supabase.from('profiles').select('*');
  const { data: docs } = await supabase.from('global_documents').select('*');

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)] px-6 py-8 text-slate-100 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />

      <div className="relative space-y-8">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-red-200">
            <Lock size={12} /> Direction
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">Gestion de l'équipe</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Espace réservé au CEO et aux administrateurs pour gérer les accès, les membres et les documents confidentiels.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <UserPlus className="text-cyan-300" size={22} />
              <h2 className="text-lg font-semibold text-white">Inviter un membre</h2>
            </div>
            <form className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" type="email" placeholder="email@opays.tech" />
                <select className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30">
                  <option value="ENGINEER">Ingénieur (Labs)</option>
                  <option value="SALES">Sales (Studio)</option>
                  <option value="CTO">CTO</option>
                  <option value="COO">COO</option>
                  <option value="INVESTOR">Investisseur</option>
                </select>
                <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" type="number" placeholder="Equity (%)" />
                <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/30" type="number" placeholder="Salaire ($)" />
              </div>
              <button className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Générer le lien d'invitation
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <FileUp className="text-violet-300" size={22} />
              <h2 className="text-lg font-semibold text-white">Document confidentiel</h2>
            </div>
            <form className="mt-6 space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/30" type="text" placeholder="ex: Stratégie 2026" />
              <div className="grid grid-cols-2 gap-2">
                {['ASSOCIATE', 'EMPLOYEE', 'CEO', 'CTO', 'SALES'].map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-xs font-medium text-slate-300">
                    <input type="checkbox" className="accent-cyan-400" /> {role}
                  </label>
                ))}
              </div>
              <button className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Uploader & diffuser
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
            <Users size={20} /> Membres de l'organisation ({members?.length || 0})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-xs font-bold text-cyan-200">
                    {member.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{member.full_name}</p>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{member.role} • {member.type}</p>
                  </div>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-cyan-200">
                  <Shield size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
