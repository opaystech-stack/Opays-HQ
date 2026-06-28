import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
          {/* Employés */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Équipe</div>
              <div className="card-description">Salaires et scores de performance</div>
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
                      <td>{r.role_label || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {r.salary != null ? `${r.salary.toLocaleString('fr-FR')} $` : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {r.performance_score != null ? `${r.performance_score}/100` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Vesting */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Progression du vesting d'equity</div>
              <div className="card-description">Cumul des parts acquises dans le temps</div>
            </div>
            {vesting.length === 0 ? (
              <div className="kanban-empty">Aucune donnée d'equity</div>
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={vesting} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Line type="monotone" dataKey="vested" stroke="#3b62d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
