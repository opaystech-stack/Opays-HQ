import { createFileRoute } from '@tanstack/react-router';
import { useUser } from '@/hooks/useUser';
import { can } from '@/lib/rbac';
import { useState, useEffect, useMemo } from 'react';
import { apiGetDashboardStats, apiGetTasks, apiGetProjects, apiGetTreasury } from '@/lib/api';
import {
  ListTodo, FolderKanban, Landmark, Bot, TrendingUp, Users,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle,
  Activity, BarChart3, DollarSign, Target
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, BarChart, Bar
} from 'recharts';

export const Route = createFileRoute('/_app/app/dashboard')({
  component: DashboardPage,
});

// ─── Helpers ──────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

function fmtCurrency(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }).replace('USD', '$').trim();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

// ─── Composants ───────────────────────────────────────────

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

function RecentTasks({ tasks }: { tasks: any[] }) {
  const recent = tasks.slice(0, 5);
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Tâches récentes</div>
          <div className="card-description">Les 5 dernières tâches créées</div>
        </div>
        <span className="badge badge-blue">{tasks.length} total</span>
      </div>
      <div className="activity-list">
        {recent.length === 0 ? (
          <div className="kanban-empty">Aucune tâche pour le moment</div>
        ) : recent.map((t: any) => (
          <div key={t.id} className="activity-item" style={{ alignItems: 'center' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.status === 'done' ? '#22c55e15' : t.status === 'in_progress' ? '#3b62d415' : '#94a3b815',
            }}>
              {t.status === 'done' ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> :
               t.status === 'in_progress' ? <Clock size={14} style={{ color: 'var(--primary)' }} /> :
               <AlertCircle size={14} style={{ color: '#94a3b8' }} />}
            </div>
            <div className="activity-content">
              <div className="activity-text" style={{ fontWeight: 500 }}>{t.title}</div>
              <div className="activity-time">
                {t.assignee_name || 'Non assigné'} · {timeAgo(t.created_at)}
              </div>
            </div>
            <span className={`badge ${t.priority === 'urgent' ? 'badge-red' : t.priority === 'high' ? 'badge-orange' : 'badge-gray'}`}>
              {t.priority || 'medium'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveProjects({ projects }: { projects: any[] }) {
  const active = projects.filter((p: any) => p.status === 'active' || p.status === 'planning').slice(0, 4);
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Projets actifs</div>
          <div className="card-description">En cours et planifiés</div>
        </div>
        <span className="badge badge-green">{active.length} actifs</span>
      </div>
      <div className="activity-list">
        {active.length === 0 ? (
          <div className="kanban-empty">Aucun projet actif</div>
        ) : active.map((p: any) => (
          <div key={p.id} className="activity-item" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
              <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                {p.status === 'active' ? 'En cours' : 'Planifié'}
              </span>
            </div>
            {p.budget && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                Budget: {fmtCurrency(p.budget)}
              </div>
            )}
            {p.deadline && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                Échéance: {new Date(p.deadline).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreasuryChart({ logs }: { logs: any[] }) {
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) {
      // Mock data pour montrer le graphique
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
      let balance = 0;
      return months.map(m => {
        balance += Math.random() * 5000 - 2000;
        return { month: m, solde: Math.round(balance * 100) / 100 };
      });
    }
    // Grouper par mois
    const grouped: Record<string, number> = {};
    let cumul = 0;
    for (const log of logs) {
      const month = new Date(log.created_at).toLocaleDateString('fr-FR', { month: 'short' });
      cumul += log.type === 'income' ? log.amount : -log.amount;
      grouped[month] = cumul;
    }
    return Object.entries(grouped).map(([month, solde]) => ({ month, solde }));
  }, [logs]);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">Évolution de la trésorerie</div>
        <div className="card-description">Solde cumulé sur les 6 derniers mois</div>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b62d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b62d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
              formatter={(value: number) => [`${fmtCurrency(value)}`, 'Solde']}
            />
            <Area type="monotone" dataKey="solde" stroke="#3b62d4" fill="url(#colorSolde)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { icon: Activity, text: 'Nouveau lead ajouté', time: 'il y a 2h', color: 'var(--primary)' },
    { icon: CheckCircle2, text: 'Tâche « Déploiement API » terminée', time: 'il y a 4h', color: '#22c55e' },
    { icon: AlertCircle, text: 'Facture FACT-2026-0001 émise', time: 'il y a 6h', color: '#f59e0b' },
    { icon: Users, text: 'Nouveau membre invité', time: 'il y a 1j', color: '#3b82f6' },
  ];

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">Activité récente</div>
        <div className="card-description">Les dernières actions sur la plateforme</div>
      </div>
      <div className="activity-list">
        {activities.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="activity-item" style={{ alignItems: 'center' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${a.color}15`,
              }}>
                <Icon size={14} style={{ color: a.color }} />
              </div>
              <div className="activity-content">
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────

function DashboardPage() {
  const { user } = useUser();
  const roleName = user?.role_name || null;
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetDashboardStats(),
      apiGetTasks(),
      apiGetProjects(),
      apiGetTreasury(),
    ]).then(([s, t, p, tr]) => {
      if (s.data?.stats) setStats(s.data.stats);
      if (t.data?.tasks) setTasks(t.data.tasks);
      if (p.data?.projects) setProjects(p.data.projects);
      if (tr.data?.logs) setTreasury(tr.data.logs);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Projets actifs', value: stats?.activeProjects ?? '—', icon: FolderKanban, color: 'blue' as const },
    { label: 'Tâches en cours', value: stats?.tasksInProgress ?? '—', icon: ListTodo, color: 'green' as const },
    { label: 'Tâches urgentes', value: stats?.urgentTasks ?? '—', icon: AlertCircle, color: 'red' as const },
    { label: 'Employés', value: stats?.totalUsers ?? '—', icon: Users, color: 'orange' as const },
    ...(can(roleName, 'treasury') ? [{
      label: 'Trésorerie nette',
      value: stats ? `${fmt((stats.totalIncome || 0) - (stats.totalExpense || 0))} $` : '—',
      icon: DollarSign, color: 'blue' as const,
      trend: 'up' as const,
      trendLabel: '+12% ce mois',
    }] : []),
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Bonjour, {user?.full_name || user?.email}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-blue">{user?.role_label || '—'}</span>
            <span>· Vue d'ensemble du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm">
            <BarChart3 size={14} /> Rapport
          </button>
          <button className="btn btn-primary btn-sm">
            <Target size={14} /> Nouveau projet
          </button>
        </div>
      </div>

      {/* Stats cards — 5 colonnes sur PC */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Widgets — 2 colonnes sur PC */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <RecentTasks tasks={tasks} />
        <TreasuryChart logs={treasury} />
      </div>

      {/* Widgets — 2 colonnes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
      }}>
        <ActiveProjects projects={projects} />
        <ActivityFeed />
      </div>
    </div>
  );
}
