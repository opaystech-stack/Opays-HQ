import { describe, it, expect } from 'vitest';
import type { Task, TaskStatus } from '../types/database';
import {
  COLUMNS,
  statusToColumn,
  columnStatus,
  tasksByColumn,
  applyStatusChange,
  filterTasks,
  distinctAssignees,
} from './kanban';

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    id: overrides.id,
    title: overrides.title ?? 'Tâche',
    description: null,
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    project_id: null,
    project_name: null,
    assignee_id: overrides.assignee_id ?? null,
    assignee_name: overrides.assignee_name ?? null,
    created_by: null,
    creator_name: null,
    due_date: null,
    completed_at: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

describe('statusToColumn', () => {
  it('mappe chaque statut vers sa colonne dédiée', () => {
    expect(statusToColumn('todo')).toBe('todo');
    expect(statusToColumn('in_progress')).toBe('in_progress');
    expect(statusToColumn('review')).toBe('review');
    expect(statusToColumn('done')).toBe('done');
    expect(statusToColumn('cancelled')).toBe('cancelled');
  });
});

describe('columnStatus', () => {
  it('retourne le statut canonique de chaque colonne', () => {
    expect(COLUMNS.map((c) => columnStatus(c.id))).toEqual(['todo', 'in_progress', 'review', 'done', 'cancelled']);
  });
});

describe('tasksByColumn', () => {
  it('répartit les tâches dans les 5 colonnes', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'in_progress' }),
      makeTask({ id: '3', status: 'review' }),
      makeTask({ id: '4', status: 'done' }),
      makeTask({ id: '5', status: 'cancelled' }),
    ];
    const cols = tasksByColumn(tasks);
    expect(cols.todo.map((t) => t.id)).toEqual(['1']);
    expect(cols.in_progress.map((t) => t.id)).toEqual(['2']);
    expect(cols.review.map((t) => t.id)).toEqual(['3']);
    expect(cols.done.map((t) => t.id)).toEqual(['4']);
    expect(cols.cancelled.map((t) => t.id)).toEqual(['5']);
  });
});

describe('applyStatusChange', () => {
  it('change le statut de la bonne tâche', () => {
    const tasks = [makeTask({ id: '1', status: 'todo' }), makeTask({ id: '2', status: 'todo' })];
    const next = applyStatusChange(tasks, '1', 'done' as TaskStatus);
    expect(next.find((t) => t.id === '1')!.status).toBe('done');
    expect(next.find((t) => t.id === '2')!.status).toBe('todo');
  });
  it("est immuable (n'altère pas la liste ni la tâche d'origine)", () => {
    const original = [makeTask({ id: '1', status: 'todo' })];
    const next = applyStatusChange(original, '1', 'in_progress');
    expect(original[0].status).toBe('todo');
    expect(next).not.toBe(original);
    expect(next[0]).not.toBe(original[0]);
  });
  it('ne change rien si l\'id est inconnu', () => {
    const tasks = [makeTask({ id: '1', status: 'todo' })];
    const next = applyStatusChange(tasks, 'inconnu', 'done');
    expect(next[0].status).toBe('todo');
  });
});

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: '1', priority: 'urgent', assignee_id: 'u1' }),
    makeTask({ id: '2', priority: 'low', assignee_id: 'u2' }),
    makeTask({ id: '3', priority: 'urgent', assignee_id: 'u2' }),
  ];
  it('filtre par priorité', () => {
    expect(filterTasks(tasks, { priority: 'urgent' }).map((t) => t.id)).toEqual(['1', '3']);
  });
  it('filtre par assigné', () => {
    expect(filterTasks(tasks, { assigneeId: 'u2' }).map((t) => t.id)).toEqual(['2', '3']);
  });
  it('combine les filtres', () => {
    expect(filterTasks(tasks, { priority: 'urgent', assigneeId: 'u2' }).map((t) => t.id)).toEqual(['3']);
  });
  it('« all » ne filtre rien', () => {
    expect(filterTasks(tasks, { priority: 'all', assigneeId: 'all' })).toHaveLength(3);
  });
});

describe('distinctAssignees', () => {
  it('déduplique et utilise le nom si présent', () => {
    const tasks = [
      makeTask({ id: '1', assignee_id: 'u1', assignee_name: 'Alice' }),
      makeTask({ id: '2', assignee_id: 'u1', assignee_name: 'Alice' }),
      makeTask({ id: '3', assignee_id: 'u2', assignee_name: null }),
      makeTask({ id: '4', assignee_id: null }),
    ];
    expect(distinctAssignees(tasks)).toEqual([
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'u2' },
    ]);
  });
});
