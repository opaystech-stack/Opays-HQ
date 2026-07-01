import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import {
  Plus,
  ListTodo,
  PlayCircle,
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  FolderKanban,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { can } from '@/lib/rbac';
import { apiGetTasks, apiCreateTask, apiUpdateTaskStatus, apiGetAssignableUsers } from '@/lib/api';
import type { Task, TaskPriority } from '@/types/database';
import {
  COLUMNS,
  type ColumnId,
  statusToColumn,
  columnStatus,
  tasksByColumn,
  filterTasks,
  distinctAssignees,
  distinctProjects,
} from '@/lib/kanban';

export const Route = createFileRoute('/_app/app/tasks')({
  component: TasksPage,
});

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  urgent: 'badge-red',
  high: 'badge-orange',
  medium: 'badge-blue',
  low: 'badge-gray',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

const COLUMN_ICONS: Record<ColumnId, React.ReactNode> = {
  todo: <ListTodo size={14} />,
  in_progress: <PlayCircle size={14} />,
  review: <FileSearch size={14} />,
  done: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
};

const COLUMN_COLORS: Record<ColumnId, string> = {
  todo: '#94a3b8',
  in_progress: '#3b62d4',
  review: '#f59e0b',
  done: '#22c55e',
  cancelled: '#ef4444',
};

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    transition: 'box-shadow 0.15s',
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.2)',
  };

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'cancelled';

  return (
    <div ref={setNodeRef} style={style} className="kanban-card" {...listeners} {...attributes}>
      <div className="kanban-card-title">{task.title}</div>

      {task.project_name && (
        <div className="kanban-card-project">
          <FolderKanban size={11} />
          <span>{task.project_name}</span>
        </div>
      )}

      <div className="kanban-card-meta">
        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
        {task.assignee_name && (
          <span className="kanban-card-assignee">
            <Users size={11} />
            {task.assignee_name}
          </span>
        )}
      </div>

      {task.due_date && (
        <div className={`kanban-card-date ${isOverdue ? 'overdue' : ''}`}>
          <Calendar size={11} />
          <span>{new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          {isOverdue && <span className="overdue-badge">En retard</span>}
        </div>
      )}
    </div>
  );
}

function Column({ id, title, tasks }: { id: ColumnId; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}>
      <div className="kanban-column-header">
        <div className="kanban-column-header-left">
          <span style={{ color: COLUMN_COLORS[id] }}>{COLUMN_ICONS[id]}</span>
          <span>{title}</span>
        </div>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <div className="kanban-column-body">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
        {tasks.length === 0 && <div className="kanban-empty">Aucune tâche</div>}
      </div>
    </div>
  );
}

function TasksPage() {
  const { user } = useUser();
  const roleName = user?.role_name || null;
  const canCreate = can(roleName, 'tasks.create');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [team, setTeam] = useState<{ id: string; full_name: string | null; role_label: string | null }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetTasks();
    if (err || !data) {
      setError(err || 'Erreur de chargement des tâches');
      setTasks([]);
    } else {
      setTasks(data.tasks as Task[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canCreate) return;
    apiGetAssignableUsers().then(({ data }) => {
      if (data?.users) setTeam(data.users);
    });
  }, [canCreate]);

  const assignees = useMemo(() => distinctAssignees(tasks), [tasks]);
  const projects = useMemo(() => distinctProjects(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterTasks(tasks, { priority: priorityFilter, assigneeId: assigneeFilter, projectId: projectFilter }),
    [tasks, priorityFilter, assigneeFilter, projectFilter],
  );
  const columns = useMemo(() => tasksByColumn(visibleTasks), [visibleTasks]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const urgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done' && t.status !== 'cancelled').length;
    const doneToday = tasks.filter((t) => {
      if (t.status !== 'done' || !t.completed_at) return false;
      const today = new Date();
      const completed = new Date(t.completed_at);
      return (
        completed.getDate() === today.getDate() &&
        completed.getMonth() === today.getMonth() &&
        completed.getFullYear() === today.getFullYear()
      );
    }).length;
    return { total, inProgress, urgent, doneToday };
  }, [tasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const taskId = String(event.active.id);
      const overId = event.over?.id as ColumnId | undefined;
      if (!overId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const currentColumn = statusToColumn(task.status);
      if (currentColumn === overId) return;

      const newStatus = columnStatus(overId);
      const previous = tasks;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

      const { error: err } = await apiUpdateTaskStatus(taskId, newStatus);
      if (err) {
        setTasks(previous);
        toast.error('Impossible de déplacer la tâche', { description: err });
      }
    },
    [tasks],
  );

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const title = newTitle.trim();
      if (!title) return;
      setSubmitting(true);
      const { error: err } = await apiCreateTask({
        title,
        priority: newPriority,
        ...(newAssignee ? { assignee_id: newAssignee } : {}),
      });
      setSubmitting(false);
      if (err) {
        toast.error('Création impossible', { description: err });
        return;
      }
      setNewTitle('');
      setNewPriority('medium');
      setNewAssignee('');
      toast.success('Tâche créée');
      await load();
    },
    [newTitle, newPriority, newAssignee, load],
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tâches</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Glissez les cartes entre les colonnes pour mettre à jour leur statut
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ListTodo />
          </div>
          <div className="stat-label">Total</div>
          <div className="stat-value blue">{stats.total}</div>
          <div className="stat-sub">Tâches créées</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <PlayCircle />
          </div>
          <div className="stat-label">En cours</div>
          <div className="stat-value orange">{stats.inProgress}</div>
          <div className="stat-sub">Tâches en cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <AlertCircle />
          </div>
          <div className="stat-label">Urgentes</div>
          <div className="stat-value red">{stats.urgent}</div>
          <div className="stat-sub">Non terminées</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 />
          </div>
          <div className="stat-label">Terminées aujourd'hui</div>
          <div className="stat-value green">{stats.doneToday}</div>
          <div className="stat-sub">Tâches finalisées</div>
        </div>
      </div>

      {/* Filtres + création */}
      <div className="kanban-toolbar">
        <div className="kanban-filters">
          <select
            className="form-input kanban-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            aria-label="Filtrer par priorité"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
          <select
            className="form-input kanban-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="Filtrer par assigné"
          >
            <option value="all">Tous les assignés</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            className="form-input kanban-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filtrer par projet"
          >
            <option value="all">Tous les projets</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {canCreate && (
          <form className="kanban-create" onSubmit={handleCreate}>
            <input
              className="form-input"
              placeholder="Nouvelle tâche…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="Titre de la nouvelle tâche"
            />
            <select
              className="form-input kanban-select"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              aria-label="Priorité de la nouvelle tâche"
            >
              <option value="urgent">Urgent</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            <select
              className="form-input kanban-select"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              aria-label="Assigné de la nouvelle tâche"
            >
              <option value="">Non assigné</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || m.id}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !newTitle.trim()}>
              <Plus size={14} />
              {submitting ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        )}
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted-foreground)' }}>
          Chargement des tâches…
        </div>
      )}

      {error && !loading && (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '2rem 0', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          {error}
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={load}>
              Réessayer
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map((col) => (
              <Column key={col.id} id={col.id} title={col.title} tasks={columns[col.id]} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
