# Opays HQ — Source de vérité du projet

Ce document est la référence unique pour tout travail sur Opays HQ. En cas de
contradiction avec d'anciens artefacts (ex. `supabase/schema.sql`), ce document prime.

## Stack réelle (source de vérité unique)

- **Frontend** : Vite + React 19 + TanStack Router (routage par fichiers dans `src/routes/`).
  État serveur via TanStack Query. Notifications via `sonner`.
- **Backend** : Express 5 exécuté avec `tsx` (`server/`), un seul process sur le port 3001.
- **Base de données** : `better-sqlite3`, fichier sous `/app/data/opays-hq.db` (volume Docker persistant).
- **PAS de Supabase.** `src/lib/supabase.ts` exporte `null`. Le fichier `supabase/schema.sql`
  (Postgres + RLS) est un artefact mort et NON exécuté ; ne pas s'y fier pour la sécurité.
- **Auth** : JWT signé côté serveur (`server/auth.ts`), secret via variable d'environnement
  `JWT_SECRET` validée au démarrage (`server/config.ts`). Migration prévue vers Google OAuth SSO.
- **Tests** : vitest + supertest (`server/__tests__/`).
- **Déploiement** : Dokploy, image construite depuis `Dockerfile`, config dans `dokploy.yml`.

## Rôles (RBAC)

`admin`, `ceo`, `coo`, `cto`, `sales`, `engineer`, `employee`. L'autorisation est
appliquée **côté serveur** par `requireRole(...)` dans Express. Le `src/lib/rbac.ts`
côté client ne sert qu'à l'affichage, jamais comme barrière de sécurité.

## Conventions

- TypeScript partout. Pas de `any` non justifié.
- Toute action UI passe par le client API (`src/lib/api.ts`) et persiste réellement.
- Style : Tailwind CSS + `src/styles.css`. Éviter les gros blocs de styles inline.
- Animations : `framer-motion`. Style visuel : thème sombre premium + glassmorphism.

## Definition of Done

Voir le skill `andrej-karpathy-skill`. Résumé : build + typecheck + lint + tests verts,
pas de code mort, sécurité par défaut, persistance réelle, changement réversible.
