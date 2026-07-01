import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  Save,
  Users,
  Shield,
  Coins,
  UserCog,
  Crown,
  Swords,
  Cpu,
  Headphones,
  Wrench,
  User,
  Key,
  Lock,
  LogOut,
  Mail,
  Building2,
} from 'lucide-react';
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

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={18} />,
  ceo: <Crown size={18} />,
  coo: <Swords size={18} />,
  cto: <Cpu size={18} />,
  sales: <Headphones size={18} />,
  engineer: <Wrench size={18} />,
  employee: <User size={18} />,
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'role-badge-admin',
  ceo: 'role-badge-ceo',
  coo: 'role-badge-coo',
  cto: 'role-badge-cto',
  sales: 'role-badge-sales',
  engineer: 'role-badge-engineer',
  employee: 'role-badge-employee',
};

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role_name: string | null;
  salary: number | null;
  performance_score: number | null;
}

type Tab = 'team' | 'roles' | 'equity' | 'security';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'team', label: 'Équipe', icon: <Users size={16} /> },
  { id: 'roles', label: 'Rôles', icon: <UserCog size={16} /> },
  { id: 'equity', label: 'Equity', icon: <Coins size={16} /> },
  { id: 'security', label: 'Sécurité', icon: <Shield size={16} /> },
];

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function getRoleLabel(roleName: string | null): string {
  if (!roleName) return '—';
  const found = ROLES.find((r) => r.name === roleName);
  return found?.label ?? roleName;
}

function SettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('team');

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

  // ─── Role counts ──────────────────────────────────────
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const r = m.role_name || 'employee';
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  }, [members]);

  // ─── Render: Tab content ──────────────────────────────
  const renderTeamTab = () => (
    <div className="settings-section">
      {/* Invitation card */}
      <form className="card" onSubmit={handleInvite}>
        <div className="card-header">
          <div className="card-title">Inviter un membre</div>
          <div className="card-description">
            Pré-provisionne un compte ; la personne se connecte ensuite via Google avec cet email.
          </div>
        </div>
        <div className="settings-form-row">
          <input
            className="form-input"
            type="email"
            placeholder="email@opays.io"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Nom complet"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <select
            className="form-input kanban-select"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.name} value={r.name}>{r.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            <UserPlus size={14} /> Inviter
          </button>
        </div>
      </form>

      {/* Members table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Membres de l'équipe</div>
          <div className="card-description">
            {members.length} membre{members.length > 1 ? 's' : ''} — Gérez les rôles, salaires et performance
          </div>
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
                  <div className="member-row">
                    <div className="member-avatar">{getInitials(m.full_name, m.email)}</div>
                    <div className="member-info">
                      <div className="member-name">{m.full_name || '—'}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${ROLE_COLORS[m.role_name ?? ''] || 'badge-gray'}`}>
                      {getRoleLabel(m.role_name)}
                    </span>
                    <select
                      className="form-input kanban-select"
                      style={{ width: 'auto', minWidth: '7rem' }}
                      value={m.role_name ?? ''}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      aria-label={`Rôle de ${m.email}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r.name} value={r.name}>{r.label}</option>
                      ))}
                    </select>
                  </div>
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
    </div>
  );

  const renderRolesTab = () => (
    <div className="settings-section">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Rôles et permissions</div>
          <div className="card-description">
            Aperçu des rôles disponibles et du nombre de membres par rôle
          </div>
        </div>
        <div className="role-cards-grid">
          {ROLES.map((role) => {
            const count = roleCounts[role.name] || 0;
            const colorClass = ROLE_COLORS[role.name] || 'badge-gray';
            return (
              <div key={role.name} className="role-card">
                <div className={`role-card-icon ${colorClass}`}>
                  {ROLE_ICONS[role.name] || <User size={18} />}
                </div>
                <div className="role-card-info">
                  <div className="role-card-name">{role.label}</div>
                  <div className="role-card-count">
                    {count} membre{count > 1 ? 's' : ''}
                  </div>
                </div>
                <span className={`badge ${colorClass}`}>{role.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderEquityTab = () => (
    <div className="settings-section">
      <form className="card" onSubmit={handleEquity}>
        <div className="card-header">
          <div className="card-title">Attribuer de l'equity</div>
          <div className="card-description">
            Enregistre un palier de vesting pour un associé
          </div>
        </div>
        <div className="settings-form-row">
          <select
            className="form-input kanban-select"
            value={equityUser}
            onChange={(e) => setEquityUser(e.target.value)}
            required
          >
            <option value="">Choisir un membre…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
            ))}
          </select>
          <input
            className="form-input"
            style={{ width: '9rem' }}
            type="number"
            step="0.0001"
            placeholder="Parts acquises"
            value={sharesVested}
            onChange={(e) => setSharesVested(e.target.value)}
            required
          />
          <input
            className="form-input"
            style={{ width: '9rem' }}
            type="number"
            step="0.0001"
            placeholder="Parts totales"
            value={totalShares}
            onChange={(e) => setTotalShares(e.target.value)}
            required
          />
          <input
            className="form-input"
            style={{ width: '11rem' }}
            type="date"
            value={vestingDate}
            onChange={(e) => setVestingDate(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Coins size={14} /> Attribuer
          </button>
        </div>
      </form>

      {/* Equity history placeholder */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Historique des attributions</div>
          <div className="card-description">
            Les attributions d'equity apparaîtront ici une fois enregistrées
          </div>
        </div>
        <div className="kanban-empty" style={{ padding: '2rem 0' }}>
          <Coins size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
          <div>Aucune attribution pour le moment</div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Sécurité du compte</div>
          <div className="card-description">
            Gérez les accès et les paramètres de sécurité de l'organisation
          </div>
        </div>
        <div>
          <div className="security-item">
            <div className="security-item-info">
              <div className="security-item-title">Authentification à deux facteurs</div>
              <div className="security-item-desc">
                Renforcez la sécurité des comptes avec une vérification en deux étapes
              </div>
            </div>
            <button className="btn btn-outline btn-sm">
              <Key size={14} /> Configurer
            </button>
          </div>
          <div className="security-item">
            <div className="security-item-info">
              <div className="security-item-title">Politique de mots de passe</div>
              <div className="security-item-desc">
                Exiger des mots de passe forts et une rotation régulière
              </div>
            </div>
            <button className="btn btn-outline btn-sm">
              <Lock size={14} /> Gérer
            </button>
          </div>
          <div className="security-item">
            <div className="security-item-info">
              <div className="security-item-title">Sessions actives</div>
              <div className="security-item-desc">
                Consultez et révoquez les sessions utilisateur actives
              </div>
            </div>
            <button className="btn btn-outline btn-sm">
              <LogOut size={14} /> Voir
            </button>
          </div>
          <div className="security-item">
            <div className="security-item-info">
              <div className="security-item-title">Domaine de messagerie</div>
              <div className="security-item-desc">
                Restreindre les inscriptions aux emails du domaine @opays.io
              </div>
            </div>
            <span className="badge badge-green">Actif</span>
          </div>
          <div className="security-item">
            <div className="security-item-info">
              <div className="security-item-title">Journal d'audit</div>
              <div className="security-item-desc">
                Consultez l'historique des actions administratives
              </div>
            </div>
            <button className="btn btn-outline btn-sm">
              <Building2 size={14} /> Accéder
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Paramètres — Administration</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Gestion de l'équipe, des rôles, des salaires et de l'equity — CEO / CTO uniquement
        </p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : (
        <>
          {activeTab === 'team' && renderTeamTab()}
          {activeTab === 'roles' && renderRolesTab()}
          {activeTab === 'equity' && renderEquityTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </>
      )}
    </div>
  );
}
