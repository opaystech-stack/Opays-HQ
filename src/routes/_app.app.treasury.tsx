import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus, TrendingUp, TrendingDown, Landmark, ArrowUpRight, ArrowDownRight,
  Calendar, Filter, Receipt,
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area,
} from 'recharts';
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

type PeriodFilter = 'all' | 'month' | 'quarter';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: 'Tout',
  month: 'Ce mois',
  quarter: 'Ce trimestre',
};

// ─── Couleurs par catégorie ────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  ventes: { bg: 'rgba(34, 197, 94, 0.15)', fg: '#22c55e' },
  Ventes: { bg: 'rgba(34, 197, 94, 0.15)', fg: '#22c55e' },
  salaires: { bg: 'rgba(239, 68, 68, 0.15)', fg: '#ef4444' },
  Salaires: { bg: 'rgba(239, 68, 68, 0.15)', fg: '#ef4444' },
  abonnement: { bg: 'rgba(59, 98, 212, 0.15)', fg: '#3b62d4' },
  Abonnement: { bg: 'rgba(59, 98, 212, 0.15)', fg: '#3b62d4' },
  marketing: { bg: 'rgba(245, 158, 11, 0.15)', fg: '#f59e0b' },
  Marketing: { bg: 'rgba(245, 158, 11, 0.15)', fg: '#f59e0b' },
  investissement: { bg: 'rgba(139, 92, 246, 0.15)', fg: '#8b5cf6' },
  Investissement: { bg: 'rgba(139, 92, 246, 0.15)', fg: '#8b5cf6' },
  frais: { bg: 'rgba(236, 72, 153, 0.15)', fg: '#ec4899' },
  Frais: { bg: 'rgba(236, 72, 153, 0.15)', fg: '#ec4899' },
  loyer: { bg: 'rgba(249, 115, 22, 0.15)', fg: '#f97316' },
  Loyer: { bg: 'rgba(249, 115, 22, 0.15)', fg: '#f97316' },
};

function getCategoryStyle(cat: string | null): { bg: string; fg: string } {
  if (!cat) return { bg: 'rgba(148, 163, 184, 0.15)', fg: '#94a3b8' };
  return CATEGORY_COLORS[cat] || { bg: 'rgba(148, 163, 184, 0.15)', fg: '#94a3b8' };
}

// ─── Helpers ────────────────────────────────────────────────

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function fmtCurrency(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }).replace('USD', '$').trim();
}

function isInPeriod(dateStr: string, period: PeriodFilter): boolean {
  if (period === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (period === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  // quarter
  const qStart = Math.floor(now.getMonth() / 3) * 3;
  return d.getFullYear() === now.getFullYear() && d.getMonth() >= qStart && d.getMonth() < qStart + 3;
}

// ─── StatCard (comme le dashboard) ──────────────────────────

function StatCard({ label, value, icon: Icon, color, trend, trendLabel }: {
  label: string; value: string; icon: any; color: string;
  trend?: 'up' | 'down'; trendLabel?: string;
}) {
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className={`stat-value ${color}`}>{value}</div>
        </div>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
          background: color === 'green' ? '#22c55e15' : color === 'red' ? '#ef444415' : color === 'orange' ? '#f59e0b15' : '#3b62d415',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f59e0b' : 'var(--primary)' }} />
        </div>
      </div>
      {trend && trendLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          {trend === 'up' ? (
            <ArrowUpRight size={12} style={{ color: '#22c55e' }} />
          ) : (
            <ArrowDownRight size={12} style={{ color: '#ef4444' }} />
          )}
          <span style={{ color: trend === 'up' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Graphique d'évolution du solde ────────────────────────

function BalanceChart({ logs, period }: { logs: TreasuryLog[]; period: PeriodFilter }) {
  const chartData = useMemo(() => {
    const filtered = period === 'all' ? logs : logs.filter(l => isInPeriod(l.created_at, period));
    if (!filtered || filtered.length === 0) {
      return [{ date: 'Aucune donnée', solde: 0 }];
    }

    // Trier par date
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Cumul progressif
    let cumul = 0;
    const points: { date: string; solde: number }[] = [];

    for (const log of sorted) {
      cumul += log.type === 'income' ? log.amount : -log.amount;
      points.push({
        date: new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        solde: Math.round(cumul * 100) / 100,
      });
    }

    return points;
  }, [logs, period]);

  const isPositive = chartData.length > 0 && chartData[chartData.length - 1]?.solde >= 0;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = 'colorSoldeTreasury';

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">Évolution du solde</div>
        <div className="card-description">Solde cumulé dans le temps</div>
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '0.5rem', color: '#f1f5f9',
              }}
              formatter={(value: number) => [`${fmtCurrency(value)}`, 'Solde']}
              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="solde"
              stroke={lineColor}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={{ r: 3, fill: lineColor, stroke: '#1e293b', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: lineColor, stroke: '#1e293b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────

function TreasuryPage() {
  const [logs, setLogs] = useState<TreasuryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TxType>('income');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

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

  // Logs filtrés par période
  const filteredLogs = useMemo(
    () => logs.filter(l => isInPeriod(l.created_at, periodFilter)),
    [logs, periodFilter],
  );

  // Résumé filtré
  const summary = useMemo(() => summarizeTreasury(filteredLogs), [filteredLogs]);

  // Tendances : comparer le mois en cours au mois précédent
  const trends = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentLogs = logs.filter(l => {
      const d = new Date(l.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const prevLogs = logs.filter(l => {
      const d = new Date(l.created_at);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    const cur = summarizeTreasury(currentLogs);
    const prev = summarizeTreasury(prevLogs);

    const pct = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? '+100 %' : '0 %';
      const diff = ((cur - prev) / prev) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(0)} %`;
    };

    return {
      income: { trend: cur.net >= prev.net ? 'up' as const : 'down' as const, label: pct(cur.totalIncome, prev.totalIncome) },
      expense: { trend: cur.totalExpense <= prev.totalExpense ? 'up' as const : 'down' as const, label: pct(cur.totalExpense, prev.totalExpense) },
      net: { trend: cur.net >= prev.net ? 'up' as const : 'down' as const, label: pct(cur.net, prev.net) },
    };
  }, [logs]);

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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trésorerie</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Revenus, dépenses et solde — réservé CEO, COO, Admin
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
          {(['all', 'month', 'quarter'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              className={`btn ${periodFilter === p ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setPeriodFilter(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards améliorées avec tendances */}
      <div className="stats-grid">
        <StatCard
          label="Revenus"
          value={`${formatAmount(summary.totalIncome)} $`}
          icon={TrendingUp}
          color="green"
          trend={trends.income.trend}
          trendLabel={`${trends.income.label} vs mois préc.`}
        />
        <StatCard
          label="Dépenses"
          value={`${formatAmount(summary.totalExpense)} $`}
          icon={TrendingDown}
          color="red"
          trend={trends.expense.trend}
          trendLabel={`${trends.expense.label} vs mois préc.`}
        />
        <StatCard
          label="Solde net"
          value={`${formatAmount(summary.net)} $`}
          icon={Landmark}
          color={summary.net >= 0 ? 'blue' : 'red'}
          trend={trends.net.trend}
          trendLabel={`${trends.net.label} vs mois préc.`}
        />
        <StatCard
          label="Transactions"
          value={`${filteredLogs.length}`}
          icon={Receipt}
          color="orange"
        />
      </div>

      {/* Graphique + Formulaire */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <BalanceChart logs={logs} period={periodFilter} />

        {/* Formulaire */}
        <form className="card" onSubmit={handleCreate}>
          <div className="card-header">
            <div className="card-title">Nouvelle écriture</div>
            <div className="card-description">Ajouter un revenu, une dépense ou un transfert</div>
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
      </div>

      {/* Journal des écritures */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Journal des écritures</div>
            <div className="card-description">
              {filteredLogs.length} écriture{filteredLogs.length !== 1 ? 's' : ''}
              {periodFilter !== 'all' && ` (${PERIOD_LABELS[periodFilter].toLowerCase()})`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              {summary.totalIncome > 0 || summary.totalExpense > 0
                ? `+${formatAmount(summary.totalIncome)} / -${formatAmount(summary.totalExpense)} $`
                : 'Aucune transaction'}
            </span>
          </div>
        </div>
        {loading && <div className="kanban-empty">Chargement…</div>}
        {error && !loading && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
        {!loading && !error && filteredLogs.length === 0 && (
          <div className="kanban-empty">
            {periodFilter !== 'all'
              ? `Aucune écriture pour ${PERIOD_LABELS[periodFilter].toLowerCase()}`
              : 'Aucune écriture'}
          </div>
        )}
        {!loading && !error && filteredLogs.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const catStyle = getCategoryStyle(log.category);
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className={`badge ${log.type === 'income' ? 'badge-green' : log.type === 'expense' ? 'badge-red' : 'badge-gray'}`}>
                          {TYPE_LABEL[log.type]}
                        </span>
                      </td>
                      <td>
                        {log.category ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '0.125rem 0.5rem', borderRadius: '9999px',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: catStyle.bg, color: catStyle.fg,
                          }}>
                            {log.category}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description || '—'}
                      </td>
                      <td style={{
                        textAlign: 'right', fontWeight: 600,
                        color: log.type === 'income' ? '#22c55e' : log.type === 'expense' ? '#ef4444' : 'var(--foreground)',
                      }}>
                        {log.type === 'income' ? '+' : log.type === 'expense' ? '−' : ''}
                        {formatAmount(log.amount)} $
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
