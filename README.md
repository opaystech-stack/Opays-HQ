# Opays HQ

Système d'exploitation interne d'Opays : application full-stack mono-conteneur.

- **Frontend** : Vite + React 19 + TanStack Router (SPA).
- **Backend** : Express 5 (exécuté via `tsx`), un seul process sur le port **3001**, servant l'API et le SPA.
- **Base de données** : `better-sqlite3`, fichier sous `DATA_DIR` (défaut `/app/data`), persisté sur un volume Docker.
- **Auth** : Google OAuth SSO + session par cookie HttpOnly/SameSite=Strict (JWT signé).
- **Modules** : Tableau de bord, Tâches (Kanban dnd-kit), Projets, Trésorerie, RH & Equity, Base de connaissances (filtrée par rôle), Agents IA (OpenRouter), Paramètres d'administration (CEO/CTO).

## Développement

```bash
npm install
# Renseigner les secrets de dev dans .env.local (non versionné) — voir DEPLOYMENT.md §2.
npm run dev:server   # API Express (port 3001)
npm run dev          # Frontend Vite (proxy /api -> :3001)
```

## Qualité (Definition of Done)

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # oxlint
npm test             # vitest (unitaires + intégration)
npm run build        # build de production (Vite)
```

## Déploiement

La mise en production sur Dokploy (variables d'environnement, volume SQLite, domaine,
TLS, health check) est décrite en détail dans **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
La configuration de référence est versionnée dans **`dokploy.yml`**.
