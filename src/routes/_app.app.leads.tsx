import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  TrendingUp,
  Trophy,
  ClipboardCheck,
  Users,
  LayoutGrid,
  Table2,
  DollarSign,
  Target,
  BarChart3,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import {
  apiGetLeads,
  apiCreateLead,
  apiUpdateLead,
  apiConvertLead,
  apiGetAssignableUsers,
} from '@/lib/api';
import type { Lead, LeadStatus, TaskPriority } from '@/types/database';
import { summarizeLeads, filterLeads } from '@/lib/leads';
import LeadKanban from '@/components/LeadKanban';

const CRM_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales'];

export const Route = createFileRoute('/_app/app/leads')({
  component: LeadsPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !CRM_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  audit: 'Audit',
  proposal: 'Proposition',
  won: 'Gagné',
  lost: 'Perdu',
};

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'badge-gray',
  contacted: 'badge-blue',
  audit: 'badge-orange',
  proposal: 'badge-blue',
  won: 'badge-green',
  lost: 'badge-red',
};

const STATUSES: LeadStatus[] = ['new', 'contacted', 'audit', 'proposal', 'won', 'lost'];

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [team, setTeam] = useState<{ id: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View toggle
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Formulaire nouveau lead
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    estimated_value: '',
    status: 'new' as LeadStatus,
    assignee_id: '',
    industry: '',
    company_size: '',
    source: '',
    next_action: '',
    next_action_date: '',
    call_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetLeads();
    if (err || !data) {
      setError(err || 'Erreur de chargement des leads');
      setLeads([]);
    } else {
      setLeads(data.leads as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    apiGetAssignableUsers().then(({ data }) => {
      if (data?.users) setTeam(data.users);
    });
  }, [load]);

  const summary = useMemo(() => summarizeLeads(leads), [leads]);
  const visible = useMemo(
    () => filterLeads(leads, { search, status: statusFilter, priority: priorityFilter, assigneeId: assigneeFilter }),
    [leads, search, statusFilter, priorityFilter, assigneeFilter],
  );

  // Stats enrichies
  const stats = useMemo(() => {
    const contacted = leads.filter((l) => l.status === 'contacted').length;
    const proposal = leads.filter((l) => l.status === 'proposal').length;
    const lost = leads.filter((l) => l.status === 'lost').length;
    const urgent = leads.filter((l) => l.priority === 'urgent').length;
    const conversionRate = summary.total > 0
      ? Math.round((summary.won / summary.total) * 100)
      : 0;
    return { contacted, proposal, lost, urgent, conversionRate };
  }, [leads, summary]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.company_name.trim()) return;
      setSubmitting(true);
      const { error: err } = await apiCreateLead({
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
        status: form.status,
        assignee_id: form.assignee_id || undefined,
        industry: form.industry.trim() || undefined,
        company_size: form.company_size.trim() || undefined,
        source: form.source.trim() || undefined,
        next_action: form.next_action.trim() || undefined,
        next_action_date: form.next_action_date || undefined,
        call_notes: form.call_notes.trim() || undefined,
      });
      setSubmitting(false);
      if (err) {
        toast.error('Création impossible', { description: err });
        return;
      }
      setForm({ company_name: '', contact_name: '', email: '', phone: '', estimated_value: '', status: 'new', assignee_id: '', industry: '', company_size: '', source: '', next_action: '', next_action_date: '', call_notes: '' });
      setShowForm(false);
      toast.success('Lead créé');
      await load();
    },
    [form, load],
  );

  const handleStatusChange = useCallback(
    async (lead: Lead, status: LeadStatus) => {
      const previous = leads;
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
      const { error: err } = await apiUpdateLead(lead.id, { status });
      if (err) {
        setLeads(previous);
        toast.error('Mise à jour impossible', { description: err });
      }
    },
    [leads],
  );

  const handleConvert = useCallback(
    async (lead: Lead) => {
      const { error: err } = await apiConvertLead(lead.id);
      if (err) {
        toast.error('Conversion impossible', { description: err });
        return;
      }
      toast.success(`« ${lead.company_name} » converti en projet`);
      await load();
    },
    [load],
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>CRM — Clients & Prospects</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Revenue Control Center
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: '0.125rem',
              border: '1px solid var(--border)',
            }}
          >
            <button
              className={`btn btn-sm`}
              style={{
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                border: 'none',
                borderRadius: 'calc(var(--radius) - 0.125rem)',
                padding: '0.375rem 0.625rem',
              }}
              onClick={() => setViewMode('table')}
              title="Vue tableau"
            >
              <Table2 size={14} />
            </button>
            <button
              className={`btn btn-sm`}
              style={{
                background: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                border: 'none',
                borderRadius: 'calc(var(--radius) - 0.125rem)',
                padding: '0.375rem 0.625rem',
              }}
              onClick={() => setViewMode('kanban')}
              title="Vue Kanban"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Nouveau lead
          </button>
        </div>
      </div>

      {/* Stats cards améliorées */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={32} /></div>
          <div className="stat-label">Pipeline total</div>
          <div className="stat-value blue">{fmt(summary.totalPipeline)} $</div>
          <div className="stat-sub">{summary.total} leads actifs</div>
          <TrendingUp size={18} style={{ color: 'var(--primary)', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Target size={32} /></div>
          <div className="stat-label">Taux de conversion</div>
          <div className="stat-value green">{stats.conversionRate}%</div>
          <div className="stat-sub">{summary.won} gagnés / {summary.total} total</div>
          <Trophy size={18} style={{ color: '#22c55e', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BarChart3 size={32} /></div>
          <div className="stat-label">En cours</div>
          <div className="stat-value orange">{summary.inAudit}</div>
          <div className="stat-sub">{stats.contacted} contactés · {stats.proposal} propositions</div>
          <ClipboardCheck size={18} style={{ color: '#f59e0b', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={32} /></div>
          <div className="stat-label">Total leads</div>
          <div className="stat-value">{summary.total}</div>
          <div className="stat-sub">
            <span style={{ color: '#ef4444' }}>{stats.urgent} urgents</span>
            {' · '}
            <span style={{ color: '#94a3b8' }}>{stats.lost} perdus</span>
          </div>
          <Users size={18} style={{ color: 'var(--muted-foreground)', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
      </div>

      {/* Formulaire nouveau lead */}
      {showForm && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
          <div className="card-header">
            <div className="card-title">Nouveau lead</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
            <input className="form-input" placeholder="Entreprise *" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
            <input className="form-input" placeholder="Contact" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-input" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="form-input" type="number" min="0" placeholder="Valeur estimée ($)" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} />
            <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <select className="form-input" value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}>
              <option value="">Non assigné</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name || m.id}</option>
              ))}
            </select>
            <input className="form-input" placeholder="Secteur d'activité" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <select className="form-input" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })}>
              <option value="">Taille d'entreprise</option>
              <option value="1-10">1-10 employés</option>
              <option value="11-50">11-50 employés</option>
              <option value="51-200">51-200 employés</option>
              <option value="201-1000">201-1000 employés</option>
              <option value="1000+">1000+ employés</option>
            </select>
            <input className="form-input" placeholder="Source (ex: LinkedIn, Bouche-à-oreille)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <input className="form-input" placeholder="Prochaine action" value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} />
            <input className="form-input" type="date" value={form.next_action_date} onChange={(e) => setForm({ ...form, next_action_date: e.target.value })} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <textarea className="form-input" placeholder="Notes d'appel" value={form.call_notes} onChange={(e) => setForm({ ...form, call_notes: e.target.value })} rows={2} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !form.company_name.trim()}>
              {submitting ? 'Ajout…' : 'Créer le lead'}
            </button>
          </div>
        </form>
      )}

      {/* Filtres */}
      <div className="kanban-toolbar">
        <div className="kanban-filters" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input className="form-input kanban-select" style={{ paddingLeft: '2rem' }} placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input kanban-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')} aria-label="Filtrer par statut">
            <option value="all">Tous statuts</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select className="form-input kanban-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')} aria-label="Filtrer par priorité">
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
          <select className="form-input kanban-select" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} aria-label="Filtrer par assigné">
            <option value="all">Tous les assignés</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name || m.id}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
          {visible.length} lead{visible.length !== 1 ? 's' : ''} affiché{visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Vue Kanban */}
      {viewMode === 'kanban' && (
        <>
          {loading && <div className="kanban-empty">Chargement…</div>}
          {error && !loading && <div style={{ color: '#ef4444' }}>{error}</div>}
          {!loading && !error && (
            <LeadKanban leads={visible} onStatusChange={handleStatusChange} />
          )}
        </>
      )}

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <div className="card">
          {loading && <div className="kanban-empty">Chargement…</div>}
          {error && !loading && <div style={{ color: '#ef4444' }}>{error}</div>}
          {!loading && !error && visible.length === 0 && <div className="kanban-empty">Aucun lead</div>}
          {!loading && !error && visible.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Valeur</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Assigné</th>
                  <th>Secteur</th>
                  <th>Source</th>
                  <th>Prochaine action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 600 }}>{lead.company_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                        <span>{lead.contact_name || '—'}</span>
                      </div>
                      {lead.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                          <Mail size={10} style={{ flexShrink: 0 }} />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={10} style={{ flexShrink: 0 }} />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(lead.estimated_value ?? 0)} $</td>
                    <td>
                      <span className={`kanban-card-priority ${lead.priority === 'urgent' ? 'priority-urgent' : lead.priority === 'high' ? 'priority-high' : lead.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                        {lead.priority === 'urgent' ? 'Urgent' : lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-input kanban-select`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        aria-label={`Statut de ${lead.company_name}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td>{lead.assignee_name || '—'}</td>
                    <td style={{ fontSize: '0.75rem' }}>{lead.industry || '—'}</td>
                    <td style={{ fontSize: '0.75rem' }}>{lead.source || '—'}</td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {lead.next_action ? (
                        <div>
                          <div>{lead.next_action}</div>
                          {lead.next_action_date && (
                            <div style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(lead.next_action_date).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {lead.status === 'won' && !lead.converted_project_id && (
                        <button className="btn btn-outline btn-sm" onClick={() => handleConvert(lead)}>
                          Convertir en projet
                        </button>
                      )}
                      {lead.converted_project_id && <span className={`badge ${STATUS_BADGE.won}`}>Converti</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
