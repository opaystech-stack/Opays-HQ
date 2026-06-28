# Requirements — Module Tâches / Kanban

## Introduction

Remplacer la page squelette `/app/tasks` (`src/routes/_app.app.tasks.tsx`) par un
tableau Kanban interactif, câblé au backend Express existant (`/api/tasks`). Le
tableau permet de visualiser, créer et déplacer des tâches entre colonnes par
glisser-déposer, avec filtres par priorité et par assigné.

## Glossaire

- **Colonne** : regroupement visuel de tâches par statut (À faire / En cours / Terminé).
- **Statut canonique** : statut backend associé à une colonne (`todo` / `in_progress` / `done`).
- **Transition** : changement de statut d'une tâche provoqué par un déplacement entre colonnes.

## Requirements

### Requirement 1 — Affichage du tableau
**User Story:** En tant que membre, je veux voir mes tâches organisées en colonnes, afin de suivre leur avancement.

#### Acceptance Criteria
1. THE page `/app/tasks` SHALL afficher 3 colonnes : « À faire » (`todo`), « En cours » (`in_progress`), « Terminé » (`done`).
2. WHEN la page se charge, THE frontend SHALL récupérer les tâches via `GET /api/tasks` et placer chaque tâche dans la colonne correspondant à son statut.
3. THE statut `review` SHALL être regroupé dans la colonne « En cours » ; THE statut `cancelled` SHALL être masqué.
4. WHILE le chargement est en cours, THE page SHALL afficher un état de chargement ; IF la récupération échoue, THEN THE page SHALL afficher un message d'erreur.

### Requirement 2 — Glisser-déposer et persistance
**User Story:** En tant que membre, je veux déplacer une tâche entre colonnes, afin de mettre à jour son avancement.

#### Acceptance Criteria
1. WHEN une carte est déposée dans une colonne différente, THE frontend SHALL appeler `PATCH /api/tasks/:id/status` avec le statut canonique de la colonne cible.
2. WHEN la transition réussit, THE carte SHALL rester dans la colonne cible (mise à jour optimiste confirmée).
3. IF la transition échoue, THEN THE carte SHALL revenir à sa colonne d'origine ET un message d'erreur SHALL être affiché.
4. WHEN une carte est déposée dans sa propre colonne, THE frontend SHALL n'émettre aucune requête.

### Requirement 3 — Création de tâche
**User Story:** En tant que membre habilité, je veux créer une tâche, afin de l'ajouter au tableau.

#### Acceptance Criteria
1. WHERE le rôle de l'utilisateur autorise la création (`tasks.create`), THE page SHALL afficher un formulaire de création (titre requis, priorité).
2. WHEN le formulaire est soumis avec un titre, THE frontend SHALL appeler `POST /api/tasks` puis rafraîchir la liste.
3. IF le titre est vide, THEN THE soumission SHALL être empêchée côté client.
4. WHERE le rôle n'autorise pas la création, THE formulaire SHALL être masqué.

### Requirement 4 — Filtres
**User Story:** En tant que membre, je veux filtrer les tâches, afin de me concentrer sur un sous-ensemble.

#### Acceptance Criteria
1. THE page SHALL offrir un filtre par priorité (`low`/`medium`/`high`/`urgent` + « toutes »).
2. THE page SHALL offrir un filtre par assigné, dont les options sont dérivées des tâches chargées (+ « tous »).
3. WHEN un filtre est actif, THE colonnes SHALL n'afficher que les tâches correspondantes, sans nouvel appel réseau.

### Requirement 5 — Qualité (DoD)
1. La logique de transition/colonne/filtre SHALL être pure et couverte par des tests Vitest.
2. La transition de statut backend (`PATCH /api/tasks/:id/status`) SHALL être couverte par un test d'intégration (valide + statut invalide rejeté).
3. Code entièrement typé ; build, typecheck, lint et tests verts.
