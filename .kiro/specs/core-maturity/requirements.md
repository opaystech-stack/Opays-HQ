# Requirements — Maturité du cœur fonctionnel (Tasks A–D)

## Introduction
Amener OPAYS HQ à 100 % sur son cœur fonctionnel : gestion des membres/RH,
administration intégrée aux Paramètres (CEO/CTO uniquement), trésorerie, equity/RH,
accessibilité du Kanban, et sécurité de la base de connaissances.

## Décisions de conception
- « Inviter » = pré-provisionner un compte (email + rôle) sans mot de passe utilisable.
  À la première connexion Google avec cet email, le compte est réutilisé avec son rôle.
- Section admin des Paramètres : strictement réservée aux rôles **ceo** et **cto**.
- Vues RH (lecture) : `admin`, `ceo`, `coo`. Écritures de gestion (invite, rôle, equity, salaire) : `ceo`, `cto`.

## Requirements

### A — Membres / RH & Admin dans les Paramètres
1. THE backend SHALL exposer `GET /api/users/assignable` (tout utilisateur authentifié) renvoyant `{id, full_name, role_label}` pour l'assignation de tâches.
2. THE Kanban SHALL charger cette liste et permettre de choisir un assigné à la création (résolvant `assignee_id = null`).
3. THE page `/app/settings` SHALL regrouper : liste d'équipe, invitation, attribution d'equity/salaires, édition des rôles.
4. WHERE le rôle n'est pas `ceo` ni `cto`, THE page `/app/settings` SHALL être inaccessible (redirection) ET les endpoints d'écriture SHALL répondre 403.

### B — Trésorerie
1. THE page `/app/treasury` SHALL afficher les écritures (revenus/dépenses) via `GET /api/treasury`.
2. THE page SHALL offrir un formulaire de création (montant, type, catégorie, description) persistant via `POST /api/treasury`.
3. THE accès SHALL rester réservé à `admin`, `ceo`, `coo`.

### C — RH & Equity
1. THE page `/app/rh` SHALL lister les employés avec leur score de performance et salaire (`GET /api/hr`).
2. THE page SHALL visualiser la progression du vesting d'equity (`GET /api/equity`).

### D — Accessibilité & Sécurité Knowledge
1. THE Kanban SHALL intégrer le `KeyboardSensor` dnd-kit (navigation clavier).
2. THE `GET /api/knowledge` SHALL filtrer côté serveur : un utilisateur ne voit que les articles dont `target_role_id` correspond à son rôle ou est NULL (public).

### DoD
- build + typecheck + lint + tests verts pour chaque tâche.
- Tests pour chaque feature : état base de données, routage UI, gardes de sécurité.
