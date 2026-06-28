import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, TrendingUp, Trophy, ClipboardCheck, Users } from 'lucide-react';
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
      });
      setSubmitting(false);
      if (err) {
        toast.error('Création impossible', { description: err });
        return;
      }
      setForm({ company_name: '', contact_name: '', email: '', phone: '', estimated_value: '', status: 'new', assignee_id: '' });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>CRM — Clients & Prospects</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Revenue Control Center
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouveau lead
        </button>
      </div>

      {/* Revenue Control Center */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pipeline total</div>
          <div className="stat-value blue">{fmt(summary.totalPipeline)} $</div>
          <TrendingUp size={18} style={{ color: 'var(--primary)', opacity: 0.6 }} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Leads en audit</div>
          <div className="stat-value orange">{summary.inAudit}</div>
          <ClipboardCheck size={18} style={{ color: '#f59e0b', opacity: 0.6 }} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Leads gagnés</div>
          <div className="stat-value green">{summary.won}</div>
          <Trophy size={18} style={{ color: '#22c55e', opacity: 0.6 }} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Total leads</div>
          <div className="stat-value">{summary.total}</div>
          <Users size={18} style={{ color: 'var(--muted-foreground)', opacity: 0.6 }} />
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
      </div>

      {/* Tableau des leads */}
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
                <th>Statut</th>
                <th>Assigné</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.company_name}</td>
                  <td>
                    <div>{lead.contact_name || '—'}</div>
                    {lead.email && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{lead.email}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmt(lead.estimated_value ?? 0)} $</td>
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
    </div>
  );
}
