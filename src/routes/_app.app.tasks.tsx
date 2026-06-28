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
import { Plus } from 'lucide-react';
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

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} className="kanban-card" {...listeners} {...attributes}>
      <div className="kanban-card-title">{task.title}</div>
      <div className="kanban-card-meta">
        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
        {task.assignee_name && <span className="kanban-card-assignee">{task.assignee_name}</span>}
      </div>
    </div>
  );
}

function Column({ id, title, tasks }: { id: ColumnId; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}>
      <div className="kanban-column-header">
        <span>{title}</span>
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

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [team, setTeam] = useState<{ id: string; full_name: string | null; role_label: string | null }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    // Petite distance d'activation pour distinguer un clic d'un glissement.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Navigation clavier : ramassage/déplacement/dépose des cartes au clavier.
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

  // Charge la liste d'équipe pour l'assignation (si l'utilisateur peut créer).
  useEffect(() => {
    if (!canCreate) return;
    apiGetAssignableUsers().then(({ data }) => {
      if (data?.users) setTeam(data.users);
    });
  }, [canCreate]);

  const assignees = useMemo(() => distinctAssignees(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterTasks(tasks, { priority: priorityFilter, assigneeId: assigneeFilter }),
    [tasks, priorityFilter, assigneeFilter],
  );
  const columns = useMemo(() => tasksByColumn(visibleTasks), [visibleTasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const taskId = String(event.active.id);
      const overId = event.over?.id as ColumnId | undefined;
      if (!overId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const currentColumn = statusToColumn(task.status);
      if (currentColumn === overId) return; // déposé dans sa propre colonne

      const newStatus = columnStatus(overId);
      const previous = tasks;
      // Mise à jour optimiste.
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

      const { error: err } = await apiUpdateTaskStatus(taskId, newStatus);
      if (err) {
        setTasks(previous); // rollback
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
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tâches</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Glissez les cartes pour faire avancer vos tâches
        </p>
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
