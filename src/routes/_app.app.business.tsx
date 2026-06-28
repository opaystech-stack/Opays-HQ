import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getCurrentUser } from '@/lib/auth';
import { apiGetBusinessStats } from '@/lib/api';

const BUSINESS_ROLES = ['ceo', 'cto', 'coo'];

export const Route = createFileRoute('/_app/app/business')({
  component: BusinessPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !BUSINESS_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

interface Stats {
  totalIncome: number;
  totalExpense: number;
  treasuryNet: number;
  billedTotal: number;
  paidTotal: number;
  outstanding: number;
  projectedMargin: number;
  realMargin: number;
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

function BusinessPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetBusinessStats();
    if (data?.stats) setStats(data.stats as Stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="card kanban-empty">Chargement…</div>;
  if (!stats) return <div className="card kanban-empty">Aucune donnée.</div>;

  const chartData = [
    { name: 'Revenus', value: stats.totalIncome },
    { name: 'Dépenses', value: stats.totalExpense },
    { name: 'Facturé', value: stats.billedTotal },
    { name: 'Encaissé', value: stats.paidTotal },
    { name: 'En attente', value: stats.outstanding },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Business & Revenue</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Santé économique globale — direction uniquement
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Trésorerie nette</div><div className={`stat-value ${stats.treasuryNet >= 0 ? 'green' : 'red'}`}>{fmt(stats.treasuryNet)} $</div></div>
        <div className="stat-card"><div className="stat-label">Facturé</div><div className="stat-value blue">{fmt(stats.billedTotal)} $</div></div>
        <div className="stat-card"><div className="stat-label">Encaissé</div><div className="stat-value green">{fmt(stats.paidTotal)} $</div></div>
        <div className="stat-card"><div className="stat-label">En attente</div><div className="stat-value orange">{fmt(stats.outstanding)} $</div></div>
        <div className="stat-card"><div className="stat-label">Marge projetée</div><div className="stat-value blue">{fmt(stats.projectedMargin)} $</div></div>
        <div className="stat-card"><div className="stat-label">Marge réelle</div><div className="stat-value green">{fmt(stats.realMargin)} $</div></div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Cartographie des flux</div></div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#3b62d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
