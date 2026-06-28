import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { apiGetTreasury, apiCreateTreasuryLog } from '@/lib/api';
import type { TreasuryLog } from '@/types/database';
import { summarizeTreasury } from '@/lib/treasury';

export const Route = createFileRoute('/_app/app/treasury')({
  component: TreasuryPage,
});

type TxType = 'income' | 'expense' | 'transfer';

const TYPE_LABEL: Record<TxType, string> = {
  income: 'Revenu',
  expense: 'Dépense',
  transfer: 'Transfert',
};

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function TreasuryPage() {
  const [logs, setLogs] = useState<TreasuryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TxType>('income');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetTreasury();
    if (err || !data) {
      setError(err || 'Erreur de chargement de la trésorerie');
      setLogs([]);
    } else {
      setLogs(data.logs as TreasuryLog[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => summarizeTreasury(logs), [logs]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const value = Number.parseFloat(amount);
      if (Number.isNaN(value) || value <= 0) {
        toast.error('Montant invalide');
        return;
      }
      setSubmitting(true);
      const { error: err } = await apiCreateTreasuryLog({
        amount: value,
        type,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
      });
      setSubmitting(false);
      if (err) {
        toast.error('Enregistrement impossible', { description: err });
        return;
      }
      setAmount('');
      setCategory('');
      setDescription('');
      setType('income');
      toast.success('Écriture enregistrée');
      await load();
    },
    [amount, type, category, description, load],
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trésorerie</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Revenus, dépenses et solde — réservé CEO, COO, Admin
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Revenus</div>
          <div className="stat-value green">{formatAmount(summary.totalIncome)} $</div>
          <TrendingUp size={18} style={{ color: '#22c55e', opacity: 0.6 }} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Dépenses</div>
          <div className="stat-value red">{formatAmount(summary.totalExpense)} $</div>
          <TrendingDown size={18} style={{ color: '#ef4444', opacity: 0.6 }} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Solde net</div>
          <div className={`stat-value ${summary.net >= 0 ? 'blue' : 'red'}`}>{formatAmount(summary.net)} $</div>
          <Landmark size={18} style={{ color: 'var(--muted-foreground)', opacity: 0.6 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Formulaire */}
        <form className="card" onSubmit={handleCreate}>
          <div className="card-header">
            <div className="card-title">Nouvelle écriture</div>
          </div>
          <div className="form-group">
            <label className="form-label">Montant ($)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value as TxType)}>
              <option value="income">Revenu</option>
              <option value="expense">Dépense</option>
              <option value="transfer">Transfert</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex. Ventes, Salaires…" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            <Plus size={14} />
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        {/* Journal */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Journal des écritures</div>
          </div>
          {loading && <div className="kanban-empty">Chargement…</div>}
          {error && !loading && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
          {!loading && !error && logs.length === 0 && <div className="kanban-empty">Aucune écriture</div>}
          {!loading && !error && logs.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${log.type === 'income' ? 'badge-green' : log.type === 'expense' ? 'badge-red' : 'badge-gray'}`}>
                        {TYPE_LABEL[log.type]}
                      </span>
                    </td>
                    <td>{log.category || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatAmount(log.amount)} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
