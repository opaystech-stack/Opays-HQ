import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FolderKanban,
  LayoutGrid,
  KanbanSquare,
  CalendarDays,
  User,
  MessageSquareQuote,
  TrendingUp,
  DollarSign,
  GitBranch,
  Filter,
  X,
} from 'lucide-react';
import { apiGetProjects, apiGetAssignableUsers } from '@/lib/api';
import { projectProgress, parseTechStack, type ProjectStatusKey } from '@/lib/projects';

export const Route = createFileRoute('/_app/app/projects')({
  component: ProjectsPage,
});

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatusKey;
  owner_id: string;
  owner_name: string | null;
  start_date: string | null;
  deadline: string | null;
  budget: number | null;
  branch: string | null;
  tech_stack: string | null;
  gross_margin_projected: number | null;
  gross_margin_real: number | null;
  client_feedback: string | null;
  created_at: string;
}

interface AssignableUser {
  id: string;
  full_name: string | null;
  role_label: string | null;
}

type ViewMode = 'grid' | 'kanban';

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planification',
  active: 'En cours',
  paused: 'En pause',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const STATUS_BADGE: Record<string, string> = {
  planning: 'badge-gray',
  active: 'badge-blue',
  paused: 'badge-orange',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

const KANBAN_COLUMNS: { id: ProjectStatusKey; label: string }[] = [
  { id: 'planning', label: 'Planification' },
  { id: 'active', label: 'En cours' },
  { id: 'paused', label: 'En pause' },
  { id: 'completed', label: 'Terminé' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return '#22c55e';
  if (progress >= 50) return 'var(--primary)';
  if (progress >= 25) return '#f59e0b';
  return '#94a3b8';
}

function getMarginDeltaClass(projected: number | null, real: number | null): string {
  if (projected === null || real === null) return '';
  const diff = real - projected;
  if (diff > 0) return 'margin-up';
  if (diff < 0) return 'margin-down';
  return 'margin-neutral';
}

function getFeedbackIcon(feedback: string | null): string {
  if (!feedback) return '';
  const lower = feedback.toLowerCase();
  if (lower.includes('satisfait') || lower.includes('content') || lower.includes('excellent') || lower.includes('bravo') || lower.includes('merci')) return '👍';
  if (lower.includes('insatisfait') || lower.includes('problème') || lower.includes('retard') || lower.includes('déçu')) return '👎';
  return '💬';
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetProjects();
    if (err || !data) {
      setError(err || 'Erreur de chargement des projets');
      setProjects([]);
    } else {
      setProjects(data.projects as Project[]);
    }
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await apiGetAssignableUsers();
    if (data?.users) {
      setUsers(data.users as AssignableUser[]);
    }
  }, []);

  useEffect(() => {
    load();
    loadUsers();
  }, [load, loadUsers]);

  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterAssignee !== 'all' && p.owner_id !== filterAssignee) return false;
    return true;
  });

  const activeFilterCount =
    (filterStatus !== 'all' ? 1 : 0) + (filterAssignee !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterAssignee('all');
  };

  // ─── Kanban grouping ──────────────────────────────────────
  const kanbanProjects = KANBAN_COLUMNS.map((col) => ({
    ...col,
    items: filteredProjects.filter((p) => p.status === col.id),
  }));

  return (
    <div>
      {/* Header */}
      <div className="projects-header">
        <div>
          <h1 className="projects-title">Nos Projets</h1>
          <p className="projects-subtitle">
            {projects.length} projet{projects.length > 1 ? 's' : ''} · {filteredProjects.length} affiché{filteredProjects.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="projects-header-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vue grille"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn${viewMode === 'kanban' ? ' active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Vue Kanban"
            >
              <KanbanSquare size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="kanban-toolbar">
        <div className="kanban-filters">
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-input kanban-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-input kanban-select"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="all">Tous les assignés</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {loading && <div className="card kanban-empty">Chargement…</div>}
      {error && !loading && (
        <div className="card" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="card kanban-empty">
          <FolderKanban size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          {activeFilterCount > 0
            ? 'Aucun projet ne correspond aux filtres sélectionnés.'
            : 'Aucun projet. Convertissez un lead gagné depuis le CRM.'}
        </div>
      )}

      {/* ─── GRID VIEW ─────────────────────────────────────── */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'grid' && (
        <div className="project-grid">
          {filteredProjects.map((p) => {
            const progress = projectProgress(p.status);
            const stack = parseTechStack(p.tech_stack);
            const marginClass = getMarginDeltaClass(p.gross_margin_projected, p.gross_margin_real);
            const feedbackIcon = getFeedbackIcon(p.client_feedback);
            return (
              <button
                key={p.id}
                className="project-card"
                onClick={() => navigate({ to: '/app/tasks' })}
              >
                {/* Head */}
                <div className="project-card-head">
                  <span className="project-card-title">{p.name}</span>
                  <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-gray'}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>

                {/* Owner + Branch */}
                <div className="project-card-meta-row">
                  {p.owner_name && (
                    <span className="project-card-meta-item">
                      <User size={12} />
                      {p.owner_name}
                    </span>
                  )}
                  {p.branch && (
                    <span className="project-card-meta-item">
                      <GitBranch size={12} />
                      {p.branch}
                    </span>
                  )}
                </div>

                {/* Description */}
                {p.description && <p className="project-card-desc">{p.description}</p>}

                {/* Progress bar */}
                <div className="project-progress-section">
                  <div className="project-progress-label">
                    <span>Avancement</span>
                    <span style={{ color: getProgressColor(progress) }}>{progress}%</span>
                  </div>
                  <div className="project-progress">
                    <div
                      className="project-progress-bar"
                      style={{ width: `${progress}%`, background: getProgressColor(progress) }}
                    />
                  </div>
                </div>

                {/* Tech stack */}
                {stack.length > 0 && (
                  <div className="project-tags">
                    {stack.map((t) => (
                      <span key={t} className="project-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Margins */}
                <div className={`project-margins ${marginClass}`}>
                  <span className="margin-item">
                    <TrendingUp size={12} />
                    Prév. : <strong>{(p.gross_margin_projected ?? 0).toLocaleString('fr-FR')} $</strong>
                  </span>
                  <span className="margin-item">
                    <DollarSign size={12} />
                    Réelle : <strong>{(p.gross_margin_real ?? 0).toLocaleString('fr-FR')} $</strong>
                  </span>
                </div>

                {/* Client feedback */}
                {p.client_feedback && (
                  <div className="project-feedback">
                    <span className="feedback-icon">{feedbackIcon}</span>
                    <span className="feedback-text">{p.client_feedback}</span>
                  </div>
                )}

                {/* Dates */}
                <div className="project-card-dates">
                  {p.start_date && (
                    <span className="project-date">
                      <CalendarDays size={12} />
                      Début : {formatDate(p.start_date)}
                    </span>
                  )}
                  {p.deadline && (
                    <span className="project-date">
                      <CalendarDays size={12} />
                      Échéance : {formatDate(p.deadline)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ─── KANBAN VIEW ──────────────────────────────────── */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'kanban' && (
        <div className="project-kanban-board">
          {kanbanProjects.map((col) => (
            <div key={col.id} className="project-kanban-column">
              <div className="project-kanban-column-header">
                <span className={`badge ${STATUS_BADGE[col.id] ?? 'badge-gray'}`}>
                  {col.label}
                </span>
                <span className="kanban-column-count">{col.items.length}</span>
              </div>
              <div className="project-kanban-column-body">
                {col.items.length === 0 && (
                  <div className="kanban-empty" style={{ padding: '1rem 0' }}>
                    Aucun projet
                  </div>
                )}
                {col.items.map((p) => {
                  const progress = projectProgress(p.status);
                  const stack = parseTechStack(p.tech_stack);
                  const feedbackIcon = getFeedbackIcon(p.client_feedback);
                  return (
                    <button
                      key={p.id}
                      className="project-kanban-card"
                      onClick={() => navigate({ to: '/app/tasks' })}
                    >
                      <div className="project-kanban-card-title">{p.name}</div>

                      {p.owner_name && (
                        <div className="project-kanban-card-owner">
                          <User size={12} />
                          {p.owner_name}
                        </div>
                      )}

                      {p.description && (
                        <p className="project-card-desc">{p.description}</p>
                      )}

                      {/* Mini progress */}
                      <div className="project-progress">
                        <div
                          className="project-progress-bar"
                          style={{
                            width: `${progress}%`,
                            background: getProgressColor(progress),
                          }}
                        />
                      </div>

                      {stack.length > 0 && (
                        <div className="project-tags">
                          {stack.slice(0, 3).map((t) => (
                            <span key={t} className="project-tag">
                              {t}
                            </span>
                          ))}
                          {stack.length > 3 && (
                            <span className="project-tag">+{stack.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="project-kanban-card-footer">
                        <span className="margin-item">
                          <DollarSign size={12} />
                          {(p.gross_margin_real ?? p.gross_margin_projected ?? 0).toLocaleString('fr-FR')} $
                        </span>
                        {p.client_feedback && (
                          <span className="feedback-icon">{feedbackIcon}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
