import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Save } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import {
  apiGetUsers,
  apiGetHr,
  apiInviteUser,
  apiUpdateUserRole,
  apiUpsertHr,
  apiCreateEquity,
} from '@/lib/api';

// Section d'administration strictement réservée aux rôles CEO et CTO.
const ADMIN_ROLES = ['ceo', 'cto'];

export const Route = createFileRoute('/_app/app/settings')({
  component: SettingsPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    if (!user.role_name || !ADMIN_ROLES.includes(user.role_name)) {
      // Accès refusé pour les rôles non habilités → retour au tableau de bord.
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

const ROLES: { name: string; label: string }[] = [
  { name: 'admin', label: 'Admin' },
  { name: 'ceo', label: 'CEO' },
  { name: 'coo', label: 'COO' },
  { name: 'cto', label: 'CTO' },
  { name: 'sales', label: 'Directeur Commercial' },
  { name: 'engineer', label: 'Ingénieur' },
  { name: 'employee', label: 'Employé' },
];

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role_name: string | null;
  salary: number | null;
  performance_score: number | null;
}

function SettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');

  // Equity
  const [equityUser, setEquityUser] = useState('');
  const [sharesVested, setSharesVested] = useState('');
  const [totalShares, setTotalShares] = useState('');
  const [vestingDate, setVestingDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [users, hr] = await Promise.all([apiGetUsers(), apiGetHr()]);
    const hrMap = new Map<string, { salary: number | null; performance_score: number | null }>();
    for (const r of (hr.data?.records ?? []) as any[]) {
      hrMap.set(r.user_id, { salary: r.salary ?? null, performance_score: r.performance_score ?? null });
    }
    const merged: Member[] = ((users.data?.users ?? []) as any[]).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role_name: u.role_name,
      salary: hrMap.get(u.id)?.salary ?? null,
      performance_score: hrMap.get(u.id)?.performance_score ?? null,
    }));
    setMembers(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const email = inviteEmail.trim();
      if (!email) return;
      const { error } = await apiInviteUser({ email, full_name: inviteName.trim() || undefined, role_name: inviteRole });
      if (error) {
        toast.error('Invitation impossible', { description: error });
        return;
      }
      setInviteEmail('');
      setInviteName('');
      setInviteRole('employee');
      toast.success('Membre invité — connexion via Google avec cet email');
      await load();
    },
    [inviteEmail, inviteName, inviteRole, load],
  );

  const handleRoleChange = useCallback(async (id: string, role_name: string) => {
    const { error } = await apiUpdateUserRole(id, role_name);
    if (error) {
      toast.error('Changement de rôle impossible', { description: error });
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role_name } : m)));
    toast.success('Rôle mis à jour');
  }, []);

  const handleHrSave = useCallback(
    async (m: Member) => {
      const { error } = await apiUpsertHr(m.id, { salary: m.salary, performance_score: m.performance_score });
      if (error) {
        toast.error('Enregistrement impossible', { description: error });
        return;
      }
      toast.success('Fiche RH enregistrée');
    },
    [],
  );

  const updateLocal = (id: string, patch: Partial<Member>) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const handleEquity = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const sv = Number.parseFloat(sharesVested);
      const ts = Number.parseFloat(totalShares);
      if (!equityUser || Number.isNaN(sv) || Number.isNaN(ts) || !vestingDate) {
        toast.error('Champs equity invalides');
        return;
      }
      const { error } = await apiCreateEquity({
        user_id: equityUser,
        shares_vested: sv,
        total_shares: ts,
        vesting_date: vestingDate,
      });
      if (error) {
        toast.error('Attribution impossible', { description: error });
        return;
      }
      setSharesVested('');
      setTotalShares('');
      setVestingDate('');
      setEquityUser('');
      toast.success('Equity attribuée');
    },
    [equityUser, sharesVested, totalShares, vestingDate],
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Paramètres — Administration</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Gestion de l'équipe, des rôles, des salaires et de l'equity — CEO / CTO uniquement
        </p>
      </div>

      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Invitation */}
          <form className="card" onSubmit={handleInvite}>
            <div className="card-header">
              <div className="card-title">Inviter un membre</div>
              <div className="card-description">
                Pré-provisionne un compte ; la personne se connecte ensuite via Google avec cet email.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <input className="form-input" style={{ flex: 2, minWidth: '12rem' }} type="email" placeholder="email@opays.io" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              <input className="form-input" style={{ flex: 2, minWidth: '10rem' }} placeholder="Nom complet" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
              <select className="form-input kanban-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.name} value={r.name}>{r.label}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-sm">
                <UserPlus size={14} /> Inviter
              </button>
            </div>
          </form>

          {/* Équipe + rôles + RH */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Équipe</div>
              <div className="card-description">Rôles, salaires et performance</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Rôle</th>
                  <th>Salaire ($)</th>
                  <th>Perf. (/100)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.full_name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{m.email}</div>
                    </td>
                    <td>
                      <select
                        className="form-input kanban-select"
                        value={m.role_name ?? ''}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        aria-label={`Rôle de ${m.email}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r.name} value={r.name}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="form-input"
                        style={{ width: '7rem' }}
                        type="number"
                        value={m.salary ?? ''}
                        onChange={(e) => updateLocal(m.id, { salary: e.target.value === '' ? null : Number(e.target.value) })}
                        aria-label={`Salaire de ${m.email}`}
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        style={{ width: '5rem' }}
                        type="number"
                        min="0"
                        max="100"
                        value={m.performance_score ?? ''}
                        onChange={(e) => updateLocal(m.id, { performance_score: e.target.value === '' ? null : Number(e.target.value) })}
                        aria-label={`Performance de ${m.email}`}
                      />
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleHrSave(m)}>
                        <Save size={14} /> Enregistrer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Equity */}
          <form className="card" onSubmit={handleEquity}>
            <div className="card-header">
              <div className="card-title">Attribuer de l'equity</div>
              <div className="card-description">Enregistre un palier de vesting pour un associé</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <select className="form-input kanban-select" value={equityUser} onChange={(e) => setEquityUser(e.target.value)} required>
                <option value="">Choisir un membre…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>
              <input className="form-input" style={{ width: '9rem' }} type="number" step="0.0001" placeholder="Parts acquises" value={sharesVested} onChange={(e) => setSharesVested(e.target.value)} required />
              <input className="form-input" style={{ width: '9rem' }} type="number" step="0.0001" placeholder="Parts totales" value={totalShares} onChange={(e) => setTotalShares(e.target.value)} required />
              <input className="form-input" style={{ width: '11rem' }} type="date" value={vestingDate} onChange={(e) => setVestingDate(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-sm">Attribuer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
