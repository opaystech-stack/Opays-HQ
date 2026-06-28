# Requirements — Module Agents IA (Phase 4)

## Introduction
Donner vie à la branche IA : des agents configurables (profil + system prompt +
température + rôles autorisés) avec lesquels l'équipe converse, via de vrais appels
LLM passant par OpenRouter. Conversations et messages persistés en SQLite.

## Décisions
- L'intégration LLM lit `OPENROUTER_API_KEY` depuis l'environnement (jamais committée).
  Sans clé, `POST /api/agents/chat` répond 503 (dégradation propre, comme Google OAuth).
- Édition des prompts système réservée aux rôles `ceo` et `cto` (écriture).
- Lecture/usage des agents : tout utilisateur authentifié.

## Requirements

### 1 — Schéma & seed
1. THE base SHALL stocker les agents (`agent_configs` : nom, system_prompt, temperature, allowed_roles) et l'historique (`agent_conversations`, `agent_messages`).
2. WHEN la base est vide d'agents, THE système SHALL semer des agents par défaut : « Le Stratège », « Le Copywriter », « CTO IA ».

### 2 — Backend agents
1. `GET /api/agents` SHALL lister les agents (authentifié).
2. `PUT /api/agents/:id` SHALL modifier nom/prompt/température (réservé `ceo`,`cto` → sinon 403).
3. `GET /api/agents/conversations` SHALL lister les conversations de l'utilisateur courant uniquement.
4. `GET /api/agents/conversations/:id` SHALL renvoyer les messages de la conversation SI elle appartient à l'utilisateur, sinon 404.

### 3 — Chat & LLM
1. `POST /api/agents/chat` (body : `agent_id`, `conversation_id?`, `message`) SHALL : créer la conversation si absente, enregistrer le message utilisateur, appeler le LLM (system prompt de l'agent + historique + message), enregistrer la réponse, et la renvoyer.
2. IF `OPENROUTER_API_KEY` est absente, THEN THE endpoint SHALL répondre 503 sans appel réseau.
3. THE clé API NE SHALL jamais être renvoyée au frontend ni journalisée.
4. WHEN l'appel LLM échoue, THE endpoint SHALL répondre 502 et NE SHALL PAS enregistrer de réponse vide.

### 4 — Frontend `/app/agents`
1. THE page SHALL permettre de choisir un agent, lister les conversations, démarrer un nouveau chat, envoyer un message et voir la réponse.
2. WHERE le rôle est `ceo` ou `cto`, THE page SHALL permettre d'éditer le system prompt et la température d'un agent.

### DoD
- build + typecheck + lint + tests verts.
- Tests d'intégration : flux de chat (LLM mocké), sécurité (PUT réservé CEO/CTO), isolation des conversations, 503 sans clé.
