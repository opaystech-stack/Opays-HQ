import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { Users, DollarSign, TrendingUp, Target } from 'lucide-react';
import { apiGetHr, apiGetEquity } from '@/lib/api';
import { buildVestingSeries } from '@/lib/equity';

export const Route = createFileRoute('/_app/app/rh')({
  component: RHPage,
});

interface HrRecord {
  user_id: string;
  full_name: string | null;
  email: string;
  role_label: string | null;
  salary: number | null;
  performance_score: number | null;
}

interface EquityLog {
  shares_vested: number;
  vesting_date: string;
  user_name: string | null;
}

function fmtSalary(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' $';
}

function perfColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#3b62d4';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function perfLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'À améliorer';
}

function EmployeeCard({ r }: { r: HrRecord }) {
  const initial = (r.full_name || r.email)[0].toUpperCase();
  const score = r.performance_score ?? 0;
  const color = perfColor(score);

  return (
    <div className="employee-card">
      <div className="employee-card-head">
        <div className="employee-avatar">{initial}</div>
        <div className="employee-info">
          <div className="employee-name">{r.full_name || r.email}</div>
          <div className="employee-role">{r.role_label || '—'}</div>
        </div>
      </div>
      <div className="employee-card-body">
        <span className="employee-salary">
          {r.salary != null ? fmtSalary(r.salary) : '—'}
        </span>
        <div className="employee-perf">
          <div className="employee-perf-label">
            <span>{perfLabel(score)}</span>
            <span>{score}/100</span>
          </div>
          <div className="employee-perf-bar">
            <div
              className="employee-perf-fill"
              style={{ width: `${score}%`, background: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RHPage() {
  const [records, setRecords] = useState<HrRecord[]>([]);
  const [equity, setEquity] = useState<EquityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [hr, eq] = await Promise.all([apiGetHr(), apiGetEquity()]);
    if (hr.error || !hr.data) {
      setError(hr.error || 'Erreur de chargement RH');
    } else {
      setRecords(hr.data.records as HrRecord[]);
    }
    if (eq.data?.logs) setEquity(eq.data.logs as EquityLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const vesting = useMemo(() => buildVestingSeries(equity), [equity]);

  // Stats calculées
  const stats = useMemo(() => {
    const salaries = records.filter(r => r.salary != null).map(r => r.salary!);
    const scores = records.filter(r => r.performance_score != null).map(r => r.performance_score!);
    return {
      total: records.length,
      avgSalary: salaries.length ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0,
      avgPerf: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      totalPayroll: salaries.reduce((a, b) => a + b, 0),
    };
  }, [records]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ressources Humaines</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Fiches employés, performance et vesting d'equity
        </p>
      </div>

      {loading && <div className="card kanban-empty">Chargement…</div>}
      {error && !loading && (
        <div className="card" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Statistiques */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Effectif</div>
              <div className="stat-value blue">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Salaire moyen</div>
              <div className="stat-value green">{stats.avgSalary.toLocaleString('fr-FR')} $</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Performance moyenne</div>
              <div className="stat-value" style={{ color: perfColor(stats.avgPerf) }}>{stats.avgPerf}/100</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Masse salariale</div>
              <div className="stat-value orange">{stats.totalPayroll.toLocaleString('fr-FR')} $</div>
            </div>
          </div>

          {/* Grille employés */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} style={{ marginRight: '0.5rem' }} />
                Équipe
              </div>
              <div className="card-description">
                {records.length} employé{records.length > 1 ? 's' : ''} — salaires et scores de performance
              </div>
            </div>
            {records.length === 0 ? (
              <div className="kanban-empty">Aucun employé</div>
            ) : (
              <div className="employee-grid">
                {records.map((r) => (
                  <EmployeeCard key={r.user_id} r={r} />
                ))}
              </div>
            )}
          </div>

          {/* Tableau détaillé */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <DollarSign size={18} style={{ marginRight: '0.5rem' }} />
                Détail des salaires
              </div>
              <div className="card-description">Vue tableau complet</div>
            </div>
            {records.length === 0 ? (
              <div className="kanban-empty">Aucun employé</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Rôle</th>
                    <th style={{ textAlign: 'right' }}>Salaire</th>
                    <th style={{ textAlign: 'right' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.user_id}>
                      <td>{r.full_name || r.email}</td>
                      <td>
                        <span className="badge badge-blue">{r.role_label || '—'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {r.salary != null ? (
                          <span className="badge badge-green">{r.salary.toLocaleString('fr-FR')} $</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {r.performance_score != null ? (
                          <span
                            className="badge"
                            style={{
                              background: `${perfColor(r.performance_score)}22`,
                              color: perfColor(r.performance_score),
                            }}
                          >
                            {r.performance_score}/100
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Vesting Equity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={18} style={{ marginRight: '0.5rem' }} />
                Progression du vesting d'equity
              </div>
              <div className="card-description">Cumul des parts acquises dans le temps</div>
            </div>
            {vesting.length === 0 ? (
              <div className="kanban-empty">Aucune donnée d'equity</div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={vesting} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <defs>
                      <linearGradient id="vestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b62d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b62d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#f1f5f9',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="vested"
                      stroke="#3b62d4"
                      strokeWidth={2}
                      fill="url(#vestGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
