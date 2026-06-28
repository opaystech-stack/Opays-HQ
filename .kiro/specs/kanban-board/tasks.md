# Implementation Plan — Module Tâches / Kanban

- [ ] 1. Dépendance dnd-kit
  - Installer `@dnd-kit/core`
  - _Req: 2_

- [ ] 2. Logique pure du Kanban (`src/lib/kanban.ts`)
  - `COLUMNS`, `statusToColumn`, `columnStatus`, `tasksByColumn`, `applyStatusChange`, `filterTasks`, `distinctAssignees`
  - _Req: 1.1, 1.3, 2.1, 4_

- [ ] 3. Tests unitaires de la logique (`src/lib/kanban.test.ts`)
  - Étendre `vitest.config.ts` pour inclure `src/**/*.{test,spec}.ts`
  - Couvrir mapping, transition immuable, filtres
  - _Req: 5.1_

- [ ] 4. Tableau Kanban (`src/routes/_app.app.tasks.tsx`)
  - DndContext + colonnes droppables + cartes draggables
  - Chargement, états loading/erreur, mise à jour optimiste + rollback
  - Formulaire de création conditionné par `tasks.create`
  - Filtres priorité/assigné
  - _Req: 1, 2, 3, 4_

- [ ] 5. Styles Kanban (`src/styles.css`)
  - Colonnes, cartes, zones de drop
  - _Req: 1_

- [ ] 6. Test d'intégration backend (`server/__tests__/tasks-api.test.ts`)
  - GET tasks, POST create, PATCH status (valide + invalide 400)
  - _Req: 5.2_

- [ ] 7. Validation DoD par le CTO IA
  - build + typecheck + lint + tests verts ; typage complet
