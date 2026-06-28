import { createFileRoute } from '@tanstack/react-router';
import { useUser } from '@/hooks/useUser';
import { can } from '@/lib/rbac';
import { ListTodo, FolderKanban, Landmark, Bot, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiGetDashboardStats } from '@/lib/api';

export const Route = createFileRoute('/_app/app/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useUser();
  const roleName = user?.role_name || null;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetDashboardStats().then(({ data }) => {
      if (data?.stats) setStats(data.stats);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Projets actifs', value: stats?.activeProjects ?? '—', icon: FolderKanban, color: 'blue' },
    { label: 'Tâches en cours', value: stats?.tasksInProgress ?? '—', icon: ListTodo, color: 'green' },
    { label: 'Tâches urgentes', value: stats?.urgentTasks ?? '—', icon: TrendingUp, color: 'red' },
    { label: 'Employés', value: stats?.totalUsers ?? '—', icon: Users, color: 'orange' },
    ...(can(roleName, 'treasury') ? [
      { label: 'Trésorerie nette', value: stats ? `${(stats.totalIncome - stats.totalExpense).toLocaleString()} $` : '—', icon: Landmark, color: 'blue' },
    ] : []),
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Bonjour, {user?.full_name || user?.email}
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {user?.role_label || '—'} · Vue d'ensemble
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{stat.label}</div>
                  <div className={`stat-value ${stat.color}`}>
                    {loading ? '...' : stat.value}
                  </div>
                </div>
                <Icon size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Tâches prioritaires */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Tâches prioritaires</div>
            <div className="card-description">Les tâches urgentes qui nécessitent votre attention</div>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            <Bot size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            {loading ? 'Chargement...' : `${stats?.urgentTasks || 0} tâche(s) urgente(s) — module à venir (Phase 3)`}
          </div>
        </div>

        {/* Projets en cours */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Projets en cours</div>
            <div className="card-description">Les projets actifs et leur progression</div>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            <Users size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            {loading ? 'Chargement...' : `${stats?.activeProjects || 0} projet(s) actif(s) — module à venir (Phase 3)`}
          </div>
        </div>
      </div>
    </div>
  );
}
