# Design — Module Tâches / Kanban

## Vue d'ensemble

Tableau Kanban côté frontend (React + dnd-kit) consommant l'API Express existante.
La logique métier (mapping statut↔colonne, application d'une transition, filtrage)
est isolée dans un module pur `src/lib/kanban.ts` pour être testée sans DOM.

## Backend (existant, inchangé)
- `GET /api/tasks` → `{ tasks: Task[] }` (filtré par rôle côté serveur).
- `POST /api/tasks` → crée (rôles `admin,ceo,coo,cto,sales,engineer`).
- `PATCH /api/tasks/:id/status` → valide le statut ∈ {todo,in_progress,review,done,cancelled}, sinon 400.

## Composants

### src/lib/kanban.ts (nouveau, pur — testable en Node)
```typescript
import type { Task, TaskStatus, TaskPriority } from '../types/database';

export type ColumnId = 'todo' | 'in_progress' | 'done';
export interface KanbanColumn { id: ColumnId; title: string; }
export const COLUMNS: KanbanColumn[];           // 3 colonnes ordonnées

export function statusToColumn(status: TaskStatus): ColumnId | null; // review→in_progress, cancelled→null
export function columnStatus(col: ColumnId): TaskStatus;             // colonne → statut canonique
export function tasksByColumn(tasks: Task[]): Record<ColumnId, Task[]>;
export function applyStatusChange(tasks: Task[], taskId: string, status: TaskStatus): Task[]; // immuable
export interface TaskFilter { priority?: TaskPriority | 'all'; assigneeId?: string | 'all'; }
export function filterTasks(tasks: Task[], f: TaskFilter): Task[];
export function distinctAssignees(tasks: Task[]): { id: string; name: string }[];
```
Règles : `statusToColumn` renvoie `null` pour `cancelled` (masqué) et `in_progress`
pour `review`. `applyStatusChange` retourne une nouvelle liste (pas de mutation).

### src/routes/_app.app.tasks.tsx (réécrit)
- État : `tasks`, `loading`, `error`, filtres (`priority`, `assignee`).
- Chargement via `apiGetTasks()` ; dérive colonnes via `tasksByColumn(filterTasks(...))`.
- **dnd-kit** : `DndContext` global ; chaque colonne = `useDroppable({ id: ColumnId })` ;
  chaque carte = `useDraggable({ id: task.id })`.
- `onDragEnd` : si colonne cible ≠ colonne actuelle → mise à jour optimiste via
  `applyStatusChange`, puis `apiUpdateTaskStatus(id, columnStatus(target))` ;
  en cas d'échec, rollback de l'état + toast `sonner`.
- Création : formulaire (titre + priorité) visible si `can(roleName, 'tasks.create')` ;
  `apiCreateTask` puis rechargement.
- Filtres : `<select>` priorité et assigné ; appliqués en mémoire.

### Styles
Réutilise `styles.css` (cartes `.card`, badges de priorité `.badge-*`). Colonnes en
grille 3 colonnes ; styles Kanban ajoutés dans `styles.css` (pas d'inline massif).

## Stratégie de test
- `src/lib/kanban.test.ts` (Vitest, env node) : `statusToColumn` (review→in_progress, cancelled→null),
  `columnStatus`, `tasksByColumn`, `applyStatusChange` (immuabilité + transition),
  `filterTasks` (priorité, assigné), `distinctAssignees`.
- `server/__tests__/tasks-api.test.ts` (supertest) : `GET /api/tasks` authentifié ;
  `POST /api/tasks` crée ; `PATCH /api/tasks/:id/status` applique une transition valide
  et rejette un statut invalide (400).
- `vitest.config.ts` : étendre `include` pour couvrir `src/**/*.{test,spec}.ts`.

## Dépendance
- `@dnd-kit/core` (léger, robuste, accessible). Pas de `@dnd-kit/sortable` (tri intra-colonne hors périmètre).
