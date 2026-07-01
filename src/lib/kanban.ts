import type { Task, TaskStatus, TaskPriority } from '../types/database';

/**
 * Logique pure du tableau Kanban — sans dépendance React/DOM, donc testable
 * directement en environnement Node (Vitest).
 *
 * Le backend gère 5 statuts ; le tableau expose 5 colonnes :
 *  - À faire    = todo
 *  - En cours   = in_progress
 *  - Révision   = review
 *  - Terminé    = done
 *  - Annulé     = cancelled
 */

export type ColumnId = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export interface KanbanColumn {
  id: ColumnId;
  title: string;
}

export const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'À faire' },
  { id: 'in_progress', title: 'En cours' },
  { id: 'review', title: 'Révision' },
  { id: 'done', title: 'Terminé' },
  { id: 'cancelled', title: 'Annulé' },
];

/** Colonne d'affichage d'un statut. */
export function statusToColumn(status: TaskStatus): ColumnId {
  return status; // 1:1 mapping now
}

/** Statut canonique appliqué quand une tâche est déposée dans une colonne. */
export function columnStatus(col: ColumnId): TaskStatus {
  return col; // tous les ColumnId sont des TaskStatus valides
}

/** Regroupe les tâches par colonne (dans l'ordre de `COLUMNS`). */
export function tasksByColumn(tasks: Task[]): Record<ColumnId, Task[]> {
  const result: Record<ColumnId, Task[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
    cancelled: [],
  };
  for (const task of tasks) {
    const col = statusToColumn(task.status);
    if (result[col]) {
      result[col].push(task);
    }
  }
  return result;
}

/**
 * Retourne une NOUVELLE liste où la tâche `taskId` reçoit le statut `status`.
 * Immuable : la liste et les tâches d'origine ne sont pas mutées.
 */
export function applyStatusChange(tasks: Task[], taskId: string, status: TaskStatus): Task[] {
  return tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
}

export interface TaskFilter {
  priority?: TaskPriority | 'all';
  assigneeId?: string | 'all';
  projectId?: string | 'all';
}

/** Filtre en mémoire par priorité, assigné et/ou projet. */
export function filterTasks(tasks: Task[], f: TaskFilter): Task[] {
  return tasks.filter((t) => {
    if (f.priority && f.priority !== 'all' && t.priority !== f.priority) return false;
    if (f.assigneeId && f.assigneeId !== 'all' && t.assignee_id !== f.assigneeId) return false;
    if (f.projectId && f.projectId !== 'all' && t.project_id !== f.projectId) return false;
    return true;
  });
}

/** Liste dédupliquée des assignés présents dans les tâches (pour le filtre). */
export function distinctAssignees(tasks: Task[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const t of tasks) {
    if (t.assignee_id && !map.has(t.assignee_id)) {
      map.set(t.assignee_id, t.assignee_name ?? t.assignee_id);
    }
  }
  return Array.from(map, ([id, name]) => ({ id, name }));
}

/** Liste dédupliquée des projets présents dans les tâches (pour le filtre). */
export function distinctProjects(tasks: Task[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const t of tasks) {
    if (t.project_id && !map.has(t.project_id)) {
      map.set(t.project_id, t.project_name ?? t.project_id);
    }
  }
  return Array.from(map, ([id, name]) => ({ id, name }));
}
