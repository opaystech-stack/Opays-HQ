# Déploiement — Opays HQ sur Dokploy

Guide de mise en production de l'application Opays HQ (Vite + React + Express + SQLite)
sur un hôte géré par **Dokploy**. La base SQLite est persistée sur un volume Docker.

> `dokploy.yml` est la **source de vérité** de cette configuration. Dokploy ne charge pas
> ce fichier automatiquement pour une application de type Dockerfile : l'opérateur en
> recopie les champs dans le tableau de bord Dokploy.

---

## 1. Prérequis

- Un hôte Dokploy opérationnel, relié au dépôt Git.
- Le domaine **`hq.opays.io`** pointant (DNS A/AAAA) vers l'hôte Dokploy.
- Un client **Google OAuth** (Google Cloud Console) avec l'URI de redirection de production autorisée.
- Une clé **OpenRouter** (https://openrouter.ai/keys).

---

## 2. Variables d'environnement à injecter dans Dokploy

À configurer dans **Dokploy → Application → Environment** (les secrets via le gestionnaire
de secrets, jamais en clair dans le dépôt).

| Variable | Exemple / Valeur | Secret ? | Rôle |
|---|---|---|---|
| `NODE_ENV` | `production` | non | Mode production (active `Secure` sur les cookies, désactive dotenv). |
| `PORT` | `3001` | non | Port d'écoute du conteneur. |
| `DATA_DIR` | `/app/data` | non | Répertoire de la base SQLite (cible du volume). |
| `JWT_SECRET` | (≥ 32 caractères aléatoires) | **oui** | Signature des JWT de session. |
| `TOKEN_ENCRYPTION_KEY` | (64 hex = 32 octets) | **oui** | Clé AES-256-GCM chiffrant les jetons Google au repos. |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | **oui** | Client OAuth Google. |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | **oui** | Secret OAuth Google. |
| `GOOGLE_REDIRECT_URI` | `https://hq.opays.io/api/auth/google/callback` | non | Doit correspondre **exactement** à l'URI autorisée dans Google Cloud Console. |
| `APP_URL` | `https://hq.opays.io` | non | Base de redirection après login. |
| `OPENROUTER_API_KEY` | `sk-or-...` | **oui** | Appels LLM des agents IA. Sans elle, le chat répond 503. |
| `OPENROUTER_MODEL` | `google/gemini-2.5-flash` | non | Modèle LLM par défaut. |

### Générer les secrets

```bash
# JWT_SECRET (≥ 32 caractères)
openssl rand -base64 48

# TOKEN_ENCRYPTION_KEY (32 octets en hexadécimal = 64 caractères)
openssl rand -hex 32
```

> ⚠️ Le `TOKEN_ENCRYPTION_KEY` doit rester **stable** : s'il change, les jetons Google
> déjà chiffrés en base deviennent illisibles (les utilisateurs devront se reconnecter à Google).

---

## 3. Configuration Google Cloud Console

Dans l'écran OAuth du projet Google :
- **Authorized redirect URI** : `https://hq.opays.io/api/auth/google/callback`
- **Authorized JavaScript origin** : `https://hq.opays.io`
- Scopes sensibles utilisés (Drive/Sheets/Docs) : l'application doit passer la
  **vérification Google** avant un usage public en production.

---

## 4. Build & runtime (Dockerfile)

- Image multi-stage : build du SPA Vite (stage 1) → image de production (stage 2).
- `tsx` est installé dans l'image de production : **aucun téléchargement au démarrage**.
- Le conteneur lance un **unique process Express** sur `0.0.0.0:3001` servant l'API et le SPA.
- `ENV` posés dans l'image : `NODE_ENV=production`, `PORT=3001`, `DATA_DIR=/app/data`.

---

## 5. Persistance — volume SQLite

Dans **Dokploy → Application → Volumes** :

| Type | Host path | Container path | Accès |
|---|---|---|---|
| Bind/Volume | `/data/opays-hq` | `/app/data` | read-write |

La base `opays-hq.db` (+ fichiers WAL) vit dans `DATA_DIR=/app/data`. Le volume garantit
sa survie aux redéploiements et redémarrages. Le schéma est créé/migré au démarrage de
façon idempotente ; les données existantes ne sont jamais réinitialisées.

---

## 6. Domaine, TLS & health check

| Paramètre | Valeur |
|---|---|
| Domaine | `hq.opays.io` |
| HTTPS / TLS | activé (Traefik + Let's Encrypt) |
| Redirection HTTP → HTTPS | activée (permanente) |
| Port conteneur | `3001` |
| Health check | `GET /api/health` — interval 30 s, timeout 10 s, retries 3 |

---

## 7. Procédure de déploiement

1. Créer l'application Dokploy de type **Dockerfile**, reliée au dépôt (branche de prod).
2. Renseigner les **variables d'environnement** (section 2) — secrets dans le gestionnaire de secrets.
3. Déclarer le **volume** `/data/opays-hq:/app/data` (section 5).
4. Configurer **domaine + HTTPS + health check** (section 6).
5. Lancer le déploiement (build de l'image → démarrage health-gated → bascule sans coupure).

---

## 8. Vérifications post-déploiement

```bash
# Santé de l'API
curl -fsS https://hq.opays.io/api/health      # → {"status":"ok","timestamp":"..."}

# Le SPA répond
curl -fsSI https://hq.opays.io/               # → 200, text/html

# Un /api inconnu renvoie du JSON (pas le SPA)
curl -fsS https://hq.opays.io/api/inexistant  # → 404 application/json
```

Puis, dans le navigateur :
- `https://hq.opays.io/login` → bouton **Continuer avec Google** → consentement → retour connecté.
- Vérifier les modules : Tâches (Kanban), Trésorerie, RH/Equity, Agents IA, Paramètres (CEO/CTO).

---

## 9. Sécurité & exploitation

- **Aucun secret dans le dépôt** : tout passe par les secrets Dokploy. `.env.local` est local et gitignored.
- **Faire tourner** tout secret ayant transité hors d'un canal sûr (ex. le `GOOGLE_CLIENT_SECRET` partagé en clair pendant le développement).
- Cookies de session : **HttpOnly + SameSite=Strict + Secure** (en production).
- Sauvegardes : sauvegarder régulièrement le volume `/data/opays-hq` (base SQLite).
- Rollback : Dokploy permet de redéployer l'image précédente (bascule health-gated).

---

## 10. Sauvegardes du volume (script + cron)

Le script [`scripts/backup.sh`](./scripts/backup.sh) crée une archive horodatée du
répertoire de données (base SQLite + WAL + `vault/`) et applique une rétention.

```bash
# Sauvegarde manuelle (avant chaque upgrade)
DATA_DIR=/data/opays-hq BACKUP_DIR=/data/backups/opays-hq ./scripts/backup.sh
```

Cron quotidien à 02h00 (sur l'hôte Dokploy) :

```cron
0 2 * * * DATA_DIR=/data/opays-hq BACKUP_DIR=/data/backups/opays-hq RETENTION_DAYS=14 /chemin/vers/scripts/backup.sh >> /var/log/opays-hq-backup.log 2>&1
```

Restauration :

```bash
# Stopper le conteneur, puis restaurer l'archive choisie
tar -xzf /data/backups/opays-hq/opays-hq-AAAAMMJJ-HHMMSS.tar.gz -C /data/
# Redéployer l'image (les données restaurées sont ré-attachées via le volume)
```
