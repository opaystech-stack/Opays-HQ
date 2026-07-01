import { createFileRoute, Outlet, Link, useLocation, redirect } from '@tanstack/react-router';
import { useUser } from '@/hooks/useUser';
import { getCurrentUser } from '@/lib/auth';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Landmark,
  Users,
  BookOpen,
  Bot,
  Settings,
  Briefcase,
  CalendarDays,
  Lightbulb,
  Archive,
  Globe,
  BarChart3,
  ClipboardList,
  UserCircle,
  LogOut,
  ChevronDown,
  FileText,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  // Garde d'authentification réelle : on vérifie la session côté serveur
  // (token + /api/auth/me) avant de rendre la moindre page sous /app/*.
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
});

const NAV_ITEMS = [
  {
    section: 'Général',
    items: [
      { to: '/app/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: null },
      { to: '/app/tasks', label: 'Tâches', icon: ListTodo, roles: null },
      { to: '/app/projects', label: 'Projets', icon: FolderKanban, roles: null },
      { to: '/app/calendar', label: 'Calendrier', icon: CalendarDays, roles: null },
      { to: '/app/ideas', label: 'Boîte à idées', icon: Lightbulb, roles: null },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { to: '/app/leads', label: 'Prospects', icon: Briefcase, roles: ['admin', 'ceo', 'coo', 'cto', 'sales'] },
      { to: '/app/invoices', label: 'Factures', icon: FileText, roles: ['admin', 'ceo', 'coo', 'sales'] },
      { to: '/app/marketing', label: 'Marketing', icon: Megaphone, roles: ['ceo', 'sales'] },
      { to: '/app/treasury', label: 'Trésorerie', icon: Landmark, roles: ['admin', 'ceo', 'coo'] },
      { to: '/app/rh', label: 'RH', icon: Users, roles: ['admin', 'ceo', 'coo'] },
      { to: '/app/vault', label: 'Coffre-fort', icon: Archive, roles: ['admin', 'ceo', 'coo', 'cto', 'sales'] },
      { to: '/app/knowledge', label: 'Knowledge', icon: BookOpen, roles: null },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { to: '/app/agents', label: 'Agents IA', icon: Bot, roles: null },
      { to: '/app/sovereign', label: 'Souveraineté', icon: Globe, roles: null },
    ],
  },
  {
    section: 'Direction',
    items: [
      { to: '/app/business', label: 'Business', icon: BarChart3, roles: ['ceo', 'cto', 'coo'] },
      { to: '/app/job-descriptions', label: 'Fiches de poste', icon: ClipboardList, roles: ['ceo', 'cto'] },
      { to: '/app/settings', label: 'Paramètres', icon: Settings, roles: ['ceo', 'cto'] },
    ],
  },
  {
    section: 'Compte',
    items: [
      { to: '/app/profile', label: 'Mon profil', icon: UserCircle, roles: null },
    ],
  },
];

function AppLayout() {
  const { user, logout } = useUser();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const roleName = user?.role_name || null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            Opays<span>HQ</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || (roleName && item.roles.includes(roleName)),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section} className="sidebar-section">
                <div className="sidebar-section-title">{section.section}</div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || user?.email}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                {user?.role_label || '—'}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '4rem',
                left: '1.5rem',
                right: '1.5rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                zIndex: 100,
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
