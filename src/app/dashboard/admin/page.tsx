"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FileUp, Lock, Shield, UserPlus, Users, Clock, Check, X, Loader2, Sparkles, Mail, Trash2 } from 'lucide-react';
import InviteMemberModal from '@/components/modals/InviteMemberModal';
import AccessControlModal from '@/components/modals/AccessControlModal';

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [tab, setTab] = useState<'MEMBERS' | 'INVITATIONS'>('MEMBERS');

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    if (profileData?.role !== 'CEO' && !profileData?.is_admin) {
      router.push('/dashboard');
      return;
    }

    const [{ data: membersData }, { data: invitationsData }] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('invitations').select('*').order('created_at', { ascending: false }),
    ]);

    if (membersData) setMembers(membersData);
    if (invitationsData) setInvitations(invitationsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm('Révoquer cette invitation ?')) return;
    await supabase.from('invitations').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (memberId === profile?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (!confirm('Supprimer ce membre de l\'organisation ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', memberId);
    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fb]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const pendingInvitations = invitations.filter(i => !i.accepted_at);
  const acceptedInvitations = invitations.filter(i => i.accepted_at);

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">
              <Lock size={12} /> Direction
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Gestion de l'équipe</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 font-medium">
              Espace réservé au CEO et aux administrateurs pour gérer les accès, les membres et les invitations.
            </p>
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-500/10"
          >
            <UserPlus size={16} /> Inviter un membre
          </button>
        </header>

        {/* Tabs */}
        <div className="flex w-fit items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setTab('MEMBERS')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              tab === 'MEMBERS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={16} /> Membres ({members.length})
          </button>
          <button
            onClick={() => setTab('INVITATIONS')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              tab === 'INVITATIONS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Mail size={16} /> Invitations
            {pendingInvitations.length > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {pendingInvitations.length}
              </span>
            )}
          </button>
        </div>

        {/* Members tab */}
        {tab === 'MEMBERS' && (
          <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-50">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase tracking-tight">
                <Users size={20} className="text-slate-400" /> Membres de l'organisation
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-8 py-5 group hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase">
                      {member.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.full_name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">
                        {member.role} • {member.type} • {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedMember(member); setIsAccessOpen(true); }}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:text-indigo-600 hover:border-indigo-200"
                      title="Gérer les accès"
                    >
                      <Shield size={14} />
                    </button>
                    {member.id !== profile?.id && (
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:text-red-600 hover:border-red-200"
                        title="Supprimer le membre"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invitations tab */}
        {tab === 'INVITATIONS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pending */}
            <div className="rounded-[2.5rem] border border-amber-100 bg-white shadow-sm">
              <div className="p-8 border-b border-amber-50">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase tracking-tight">
                  <Clock size={20} className="text-amber-500" /> En attente ({pendingInvitations.length})
                </h2>
              </div>
              {pendingInvitations.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm text-slate-400 font-medium italic">Aucune invitation en attente.</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-50">
                  {pendingInvitations.map((inv) => {
                    const isExpired = inv.expires_at && new Date(inv.expires_at) < new Date();
                    return (
                      <div key={inv.id} className="flex items-center justify-between px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                            isExpired ? 'bg-red-50 border-red-100 text-red-400' : 'bg-amber-50 border-amber-100 text-amber-600'
                          }`}>
                            {isExpired ? <X size={18} /> : <Clock size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{inv.full_name || inv.email}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {inv.role} • {inv.type} • {isExpired ? 'EXPIRÉE' : 'En attente'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-red-500 transition hover:bg-red-50 hover:border-red-200"
                        >
                          Révoquer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accepted */}
            {acceptedInvitations.length > 0 && (
              <div className="rounded-[2.5rem] border border-emerald-100 bg-white shadow-sm">
                <div className="p-8 border-b border-emerald-50">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase tracking-tight">
                    <Check size={20} className="text-emerald-500" /> Acceptées ({acceptedInvitations.length})
                  </h2>
                </div>
                <div className="divide-y divide-emerald-50">
                  {acceptedInvitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                          <Check size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{inv.full_name || inv.email}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {inv.role} • Acceptée le {new Date(inv.accepted_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onSuccess={fetchData} />
      <AccessControlModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} member={selectedMember} />
    </div>
  );
}
