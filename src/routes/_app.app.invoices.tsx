import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  FileText,
  Receipt,
  Clock,
  DollarSign,
  AlertTriangle,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import {
  apiGetInvoices,
  apiCreateInvoice,
  apiUpdateInvoice,
  apiDeleteInvoice,
} from '@/lib/api';
import type { Invoice, InvoiceType, InvoiceStatus, InvoiceLine } from '@/types/database';

const INVOICE_ROLES = ['admin', 'ceo', 'coo', 'sales'];

export const Route = createFileRoute('/_app/app/invoices')({
  component: InvoicesPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !INVOICE_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

const TYPE_LABEL: Record<InvoiceType, string> = {
  sale: 'Vente',
  proforma: 'Proforma',
  credit_note: 'Avoir',
  debit_note: 'Note de débit',
  quote: 'Devis',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  paid: 'Payée',
  overdue: 'Impayée',
  cancelled: 'Annulée',
};

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  draft: 'badge-gray',
  pending: 'badge-blue',
  paid: 'badge-green',
  overdue: 'badge-red',
  cancelled: 'badge-gray',
};

const TYPES: InvoiceType[] = ['sale', 'proforma', 'credit_note', 'debit_note', 'quote'];
const STATUSES: InvoiceStatus[] = ['draft', 'pending', 'paid', 'overdue', 'cancelled'];

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
}

function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    type: 'sale' as InvoiceType,
    status: 'draft' as InvoiceStatus,
    tax_rate: 20,
    discount: 0,
    notes: '',
    due_date: '',
    lines: [{ description: '', quantity: 1, unit_price: 0 }] as InvoiceLine[],
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetInvoices();
    if (err || !data) {
      setError(err || 'Erreur de chargement des factures');
      setInvoices([]);
    } else {
      setInvoices(data.invoices as Invoice[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Stats
  const stats = useMemo(() => {
    const totalUnpaid = invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pending = invoices.filter((inv) => inv.status === 'pending').length;
    const revenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    return { totalUnpaid, pending, revenue };
  }, [invoices]);

  // Filtered list
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (q) {
        const hay = `${inv.number} ${inv.client_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
      return true;
    });
  }, [invoices, search, statusFilter, typeFilter]);

  // Line helpers
  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const lines = [...form.lines];
    (lines[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      lines[index].total = lines[index].quantity * lines[index].unit_price;
    }
    setForm({ ...form, lines });
  };

  const addLine = () => {
    setForm({ ...form, lines: [...form.lines, { description: '', quantity: 1, unit_price: 0 }] });
  };

  const removeLine = (index: number) => {
    if (form.lines.length <= 1) return;
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) });
  };

  const computeSubtotal = () =>
    form.lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.unit_price || 0), 0);
  const subtotal = computeSubtotal();
  const taxAmount = subtotal * (form.tax_rate / 100);
  const total = subtotal + taxAmount - form.discount;

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.client_name.trim()) return;
      setSubmitting(true);
      const { error: err } = await apiCreateInvoice({
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim() || undefined,
        type: form.type,
        status: form.status,
        tax_rate: form.tax_rate,
        discount: form.discount,
        notes: form.notes || undefined,
        due_date: form.due_date || undefined,
        lines: form.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      });
      setSubmitting(false);
      if (err) {
        toast.error('Création impossible', { description: err });
        return;
      }
      setForm({
        client_name: '',
        client_email: '',
        type: 'sale',
        status: 'draft',
        tax_rate: 20,
        discount: 0,
        notes: '',
        due_date: '',
        lines: [{ description: '', quantity: 1, unit_price: 0 }],
      });
      setShowForm(false);
      toast.success('Facture créée');
      await load();
    },
    [form, load],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Supprimer cette facture ?')) return;
      const { error: err } = await apiDeleteInvoice(id);
      if (err) {
        toast.error('Suppression impossible', { description: err });
        return;
      }
      toast.success('Facture supprimée');
      await load();
    },
    [load],
  );

  const handleStatusChange = useCallback(
    async (inv: Invoice, status: InvoiceStatus) => {
      const { error: err } = await apiUpdateInvoice(inv.id, { status });
      if (err) {
        toast.error('Mise à jour impossible', { description: err });
        return;
      }
      await load();
    },
    [load],
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Factures</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Gérez vos factures, devis et notes de crédit
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouvelle facture
        </button>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={32} /></div>
          <div className="stat-label">Total impayé</div>
          <div className="stat-value red">{fmt(stats.totalUnpaid)}</div>
          <div className="stat-sub">Factures en retard</div>
          <Receipt size={18} style={{ color: '#ef4444', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock size={32} /></div>
          <div className="stat-label">En attente</div>
          <div className="stat-value orange">{stats.pending}</div>
          <div className="stat-sub">Factures en attente de paiement</div>
          <FileText size={18} style={{ color: '#f59e0b', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={32} /></div>
          <div className="stat-label">Chiffre d'affaires</div>
          <div className="stat-value green">{fmt(stats.revenue)}</div>
          <div className="stat-sub">Factures payées</div>
          <DollarSign size={18} style={{ color: '#22c55e', opacity: 0.6, position: 'absolute', bottom: '0.75rem', right: '0.75rem' }} />
        </div>
      </div>

      {/* Formulaire nouvelle facture */}
      {showForm && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
          <div className="card-header">
            <div className="card-title">Nouvelle facture</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <input className="form-input" placeholder="Client *" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
            <input className="form-input" type="email" placeholder="Email client" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
            <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InvoiceType })}>
              {TYPES.map((t) => (<option key={t} value={t}>{TYPE_LABEL[t]}</option>))}
            </select>
            <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
              {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
            </select>
            <input className="form-input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} placeholder="Échéance" />
            <input className="form-input" type="number" min="0" max="100" step="0.01" placeholder="TVA (%)" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} />
            <input className="form-input" type="number" min="0" step="0.01" placeholder="Remise (€)" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
          </div>

          {/* Lignes de facture */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Lignes</div>
            {form.lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input
                  className="form-input"
                  style={{ flex: 2 }}
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateLine(i, 'description', e.target.value)}
                />
                <input
                  className="form-input"
                  style={{ flex: 0, width: '5rem' }}
                  type="number"
                  min="1"
                  placeholder="Qté"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                />
                <input
                  className="form-input"
                  style={{ flex: 0, width: '7rem' }}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Prix unit."
                  value={line.unit_price}
                  onChange={(e) => updateLine(i, 'unit_price', Number(e.target.value))}
                />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: '5rem', textAlign: 'right' }}>
                  {fmt((line.quantity || 0) * (line.unit_price || 0))}
                </span>
                {form.lines.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeLine(i)} style={{ color: '#ef4444' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>
              <Plus size={12} /> Ajouter une ligne
            </button>
          </div>

          {/* Totaux */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', fontSize: '0.875rem' }}>
              <div>Sous-total : <strong>{fmt(subtotal)}</strong></div>
              <div>TVA ({form.tax_rate}%) : <strong>{fmt(taxAmount)}</strong></div>
              {form.discount > 0 && <div>Remise : <strong>-{fmt(form.discount)}</strong></div>}
              <div style={{ fontSize: '1rem' }}>Total : <strong>{fmt(total)}</strong></div>
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <textarea className="form-input" placeholder="Notes (optionnel)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          <div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !form.client_name.trim()}>
              {submitting ? 'Création…' : 'Créer la facture'}
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
          <select className="form-input kanban-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')} aria-label="Filtrer par statut">
            <option value="all">Tous statuts</option>
            {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
          </select>
          <select className="form-input kanban-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as InvoiceType | 'all')} aria-label="Filtrer par type">
            <option value="all">Tous types</option>
            {TYPES.map((t) => (<option key={t} value={t}>{TYPE_LABEL[t]}</option>))}
          </select>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
          {visible.length} facture{visible.length !== 1 ? 's' : ''} affichée{visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        {loading && <div className="kanban-empty">Chargement…</div>}
        {error && !loading && <div style={{ color: '#ef4444' }}>{error}</div>}
        {!loading && !error && visible.length === 0 && <div className="kanban-empty">Aucune facture</div>}
        {!loading && !error && visible.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{inv.number}</td>
                  <td>
                    <div>{inv.client_name}</div>
                    {inv.client_email && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{inv.client_email}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${inv.type === 'sale' ? 'badge-green' : inv.type === 'proforma' ? 'badge-blue' : inv.type === 'credit_note' ? 'badge-orange' : inv.type === 'debit_note' ? 'badge-red' : 'badge-gray'}`}>
                      {TYPE_LABEL[inv.type]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.total)}</td>
                  <td>
                    <select
                      className={`form-input kanban-select`}
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv, e.target.value as InvoiceStatus)}
                      aria-label={`Statut de ${inv.number}`}
                    >
                      {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
                    </select>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <a
                        href={`/api/invoices/${inv.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Voir PDF"
                      >
                        <Eye size={12} /> PDF
                      </a>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)} title="Supprimer" style={{ color: '#ef4444' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
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
