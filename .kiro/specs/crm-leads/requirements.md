# Requirements — Module CRM / Leads (Step 6)

## Introduction
Restaurer l'espace CRM (Clients & Prospects) pour l'équipe commerciale (Patricia, rôle
`sales`) et la direction. Gestion des leads (CRUD), tableau de bord « Revenue Control
Center », et conversion d'un lead gagné en projet.

## Décisions
- La table `leads` n'existait pas dans le stack actuel : elle est créée (idempotent).
- Accès CRM : associés et direction → `admin`, `ceo`, `coo`, `cto`, `sales`. Exclus : `engineer`, `employee`.
- Statuts : `new`, `contacted`, `audit`, `proposal`, `won`, `lost`.

## Requirements

### 1 — Base & Backend (CRUD + conversion)
1. THE base SHALL contenir une table `leads` (entreprise, contact, email, téléphone, valeur estimée, statut, priorité, assigné, notes, projet converti).
2. `GET /api/leads` SHALL renvoyer les leads (rôles CRM ; sinon 403).
3. `POST /api/leads` SHALL créer un lead (company_name requis).
4. `PUT /api/leads/:id` SHALL mettre à jour statut/détails.
5. `DELETE /api/leads/:id` SHALL supprimer un lead.
6. `POST /api/leads/:id/convert` SHALL convertir un lead `won` en projet : créer une entrée `projects` (nom = entreprise, budget = valeur estimée), lier `converted_project_id`, et refuser (400) si le lead n'est pas `won`, (409) s'il est déjà converti.

### 2 — Frontend `/app/leads`
1. THE page SHALL afficher un « Revenue Control Center » : Pipeline total ($), Leads en audit, Leads gagnés, Total leads.
2. THE page SHALL lister les leads avec recherche (entreprise/contact) et filtres (statut, priorité, assigné).
3. THE page SHALL offrir un formulaire « Nouveau lead » (entreprise, contact, email, téléphone, valeur estimée, statut, assigné).
4. WHERE un lead est `won`, THE page SHALL proposer « Convertir en projet ».

### 3 — Accès
1. WHERE le rôle n'est pas dans {admin, ceo, coo, cto, sales}, THE page `/app/leads` SHALL être inaccessible (redirection) ET les endpoints SHALL répondre 403.

### DoD
- build + typecheck + lint + tests verts.
- Tests : CRUD, conversion (won→projet, refus si non-won/déjà converti), gardes de sécurité, logique pure du tableau de bord.
