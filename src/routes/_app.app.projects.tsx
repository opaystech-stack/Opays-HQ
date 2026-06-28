import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { apiGetProjects } from '@/lib/api';
import { projectProgress, parseTechStack, type ProjectStatusKey } from '@/lib/projects';

export const Route = createFileRoute('/_app/app/projects')({
  component: ProjectsPage,
});

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatusKey;
  branch: string | null;
  tech_stack: string | null;
  gross_margin_projected: number | null;
  gross_margin_real: number | null;
}

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

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nos Projets</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Cliquez un projet pour ouvrir son tableau de tâches
        </p>
      </div>

      {loading && <div className="card kanban-empty">Chargement…</div>}
      {error && !loading && <div className="card" style={{ color: '#ef4444' }}>{error}</div>}
      {!loading && !error && projects.length === 0 && (
        <div className="card kanban-empty">
          <FolderKanban size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          Aucun projet. Convertissez un lead gagné depuis le CRM.
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="project-grid">
          {projects.map((p) => {
            const progress = projectProgress(p.status);
            const stack = parseTechStack(p.tech_stack);
            return (
              <button key={p.id} className="project-card" onClick={() => navigate({ to: '/app/tasks' })}>
                <div className="project-card-head">
                  <span className="project-card-title">{p.name}</span>
                  <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-gray'}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                </div>
                {p.branch && <span className="badge badge-blue project-branch">{p.branch}</span>}
                {p.description && <p className="project-card-desc">{p.description}</p>}

                <div className="project-progress">
                  <div className="project-progress-bar" style={{ width: `${progress}%` }} />
                </div>

                {stack.length > 0 && (
                  <div className="project-tags">
                    {stack.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                )}

                <div className="project-margins">
                  <span>Marge prév. : <strong>{(p.gross_margin_projected ?? 0).toLocaleString('fr-FR')} $</strong></span>
                  <span>Réelle : <strong>{(p.gross_margin_real ?? 0).toLocaleString('fr-FR')} $</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
