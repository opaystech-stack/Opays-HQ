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

  const inputClass = "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 font-medium";

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <div className="relative space-y-8">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">
            <Lock size={12} /> Direction
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">Gestion de l'équipe</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
            Espace réservé au CEO et aux administrateurs pour gérer les accès, les membres et les documents confidentiels.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserPlus className="text-cyan-600" size={22} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Inviter un membre</h2>
            </div>
            <form className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input className={inputClass} type="email" placeholder="email@opays.tech" />
                <select className={inputClass}>
                  <option value="ENGINEER">Ingénieur (Labs)</option>
                  <option value="SALES">Sales (Studio)</option>
                  <option value="CTO">CTO</option>
                  <option value="COO">COO</option>
                  <option value="INVESTOR">Investisseur</option>
                </select>
                <input className={inputClass} type="number" placeholder="Equity (%)" />
                <input className={inputClass} type="number" placeholder="Salaire ($)" />
              </div>
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700">
                Générer le lien d'invitation
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileUp className="text-violet-600" size={22} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Document confidentiel</h2>
            </div>
            <form className="mt-6 space-y-4">
              <input className={`${inputClass} w-full`} type="text" placeholder="ex: Stratégie 2026" />
              <div className="grid grid-cols-2 gap-2">
                {['ASSOCIATE', 'EMPLOYEE', 'CEO', 'CTO', 'SALES'].map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-white transition-all cursor-pointer">
                    <input type="checkbox" className="accent-cyan-600" /> {role}
                  </label>
                ))}
              </div>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                Uploader & diffuser
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 uppercase tracking-tight">
            <Users size={20} className="text-slate-400" /> Membres de l'organisation ({members?.length || 0})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 hover:bg-white hover:border-slate-200 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-xs font-black text-cyan-700">
                    {member.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{member.full_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">{member.role} • {member.type}</p>
                  </div>
                </div>
                <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:text-cyan-600 hover:border-cyan-200">
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
