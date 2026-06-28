# Design — Google OAuth SSO & Workspace Integration

## Vue d'ensemble

Flux OAuth 2.0 Authorization Code côté serveur (Express), avec session applicative
portée par un cookie HttpOnly. Les jetons Google sont chiffrés au repos dans SQLite.

```
Navigateur            Express (server/)                 Google
   |   GET /api/auth/google  |                              |
   |------------------------>| set State_Cookie (Lax)       |
   |  302 vers Google + state|----------------------------->|
   |                         |        consentement          |
   |<----------------------- 302 callback?code&state -------|
   |  GET /callback?code&state                              |
   |------------------------>| vérifie state == cookie      |
   |                         | échange code -> tokens       |
   |                         |----------------------------->|
   |                         |<-- tokens + id_token --------|
   |                         | upsert user + google_account |
   |  302 /app/dashboard     | set Session_Cookie (Strict)  |
   |<------------------------|                              |
```

### Note de sécurité sur SameSite

- **State_Cookie = SameSite=Lax** : la requête de callback est une navigation top-level
  initiée par Google (cross-site). Un cookie `Strict` ne serait PAS renvoyé sur ce
  callback, cassant la vérification CSRF. `Lax` est le bon choix pour ce cookie transitoire,
  à durée de vie courte (~10 min), HttpOnly.
- **Session_Cookie = SameSite=Strict** : posé sur la réponse du callback, il est ensuite
  envoyé sur les requêtes same-site (l'app étant servie sur le même domaine que l'API en
  production). C'est l'exigence de la DoD.
- `Secure` activé quand `NODE_ENV=production`.

## Composants

### server/crypto.ts (nouveau)
Chiffrement symétrique AES-256-GCM des secrets au repos.
```typescript
export function encryptSecret(plaintext: string): string; // "ivHex:tagHex:cipherHex"
export function decryptSecret(payload: string): string;
export function isEncryptionConfigured(): boolean;
```
Clé : `TOKEN_ENCRYPTION_KEY` (64 hex = 32 octets). Lève une erreur explicite si absente/mal formée à l'usage.

### server/config.ts (étendu)
`loadGoogleConfig(env)` retourne `GoogleConfig | null` (non fatal si absent, pour ne pas
casser les tests/process qui n'utilisent pas Google) :
```typescript
export interface GoogleConfig {
  clientId: string; clientSecret: string; redirectUri: string;
  appUrl: string; isProduction: boolean;
}
export function loadGoogleConfig(env: NodeJS.ProcessEnv): GoogleConfig | null;
```

### server/google.ts (nouveau)
Encapsule `google-auth-library` (`OAuth2Client`).
```typescript
export const WORKSPACE_SCOPES: string[]; // openid email profile + drive sheets docs
export function buildAuthUrl(cfg: GoogleConfig, state: string): string;
export async function exchangeCode(cfg: GoogleConfig, code: string): Promise<GoogleTokens>;
export interface GoogleTokens {
  sub: string; email: string; name: string | null; picture: string | null;
  accessToken: string | null; refreshToken: string | null;
  scope: string | null; expiryDate: number | null;
}
```
Scopes : `openid`, `email`, `profile`,
`https://www.googleapis.com/auth/drive`,
`https://www.googleapis.com/auth/spreadsheets`,
`https://www.googleapis.com/auth/documents`.
> Note : ces scopes sont « sensibles » et nécessitent une vérification Google pour la
> production. Documenté pour l'opérateur.

### server/db.ts (étendu)
Ajout (idempotent, `CREATE TABLE IF NOT EXISTS`) :
```sql
CREATE TABLE IF NOT EXISTS google_accounts (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  google_sub TEXT UNIQUE,
  access_token TEXT,   -- chiffré
  refresh_token TEXT,  -- chiffré
  scopes TEXT,
  expiry_date INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);
```
`users.password_hash` reste `NOT NULL` : les comptes Google reçoivent un hash bcrypt
d'un UUID aléatoire (login mot de passe impossible).

### server/models.ts (étendu)
```typescript
export function getUserByEmail(email: string): SanitizedUser | null;
export function createGoogleUser(email, fullName, avatarUrl, roleName?): SanitizedUser;
export function upsertGoogleAccount(userId, t: { sub; accessToken; refreshToken; scopes; expiryDate }): void;
export function getGoogleAccount(userId: string): { scopes; expiry_date } | null; // jamais les tokens en clair vers l'extérieur
```
`upsertGoogleAccount` chiffre les tokens et préserve le `refresh_token` existant si Google
n'en renvoie pas de nouveau.

### server/routes/auth.ts (étendu)
- `GET /google` : 503 si `loadGoogleConfig` = null ; sinon state aléatoire (`crypto.randomBytes`), pose State_Cookie, 302 vers `buildAuthUrl`.
- `GET /google/callback` : valide state vs cookie → sinon `302 /login?error=state`. Échange code, vérifie id_token, upsert user + google_account, signe JWT, pose Session_Cookie (Strict), efface State_Cookie, `302 APP_URL/app/dashboard`. Toute erreur → `302 /login?error=oauth`.
- `POST /logout` : efface le Session_Cookie, 200.
- `/login` (password) conservé pour compatibilité et tests ; pose désormais aussi le Session_Cookie.

### server/auth.ts (étendu)
`authMiddleware` lit le token depuis `req.cookies.session` en priorité, puis l'en-tête
`Authorization: Bearer` en repli. Helpers `setSessionCookie(res, token, isProd)` et
`clearSessionCookie(res)` centralisent les attributs du cookie.

### server/index.ts (étendu)
- Charge `.env.local` en dev (via `dotenv`) avant la validation de config.
- Monte `cookie-parser`.

### Frontend
- `src/lib/api.ts` : `fetch(..., { credentials: 'include' })`.
- `src/lib/auth.ts` : `signOut` appelle `POST /api/auth/logout` ; plus de JWT en `localStorage`.
- `src/routes/login.tsx` : bouton « Continuer avec Google » → `window.location.href = '/api/auth/google'` ; affiche `?error=`.

## Modèle de données (google_accounts)

| Champ | Type | Notes |
|------|------|------|
| user_id | TEXT PK | FK users(id), ON DELETE CASCADE |
| google_sub | TEXT UNIQUE | identifiant Google stable |
| access_token | TEXT | chiffré AES-256-GCM |
| refresh_token | TEXT | chiffré ; conservé si non renvoyé |
| scopes | TEXT | liste séparée par espaces |
| expiry_date | INTEGER | epoch ms |
| updated_at | TEXT | datetime('now') |

## Stratégie de test (vitest + supertest)
- `crypto.test.ts` : round-trip chiffrement/déchiffrement ; rejet si payload altéré.
- `google-auth.test.ts` : `GET /api/auth/google` → 302 vers Google, State_Cookie posé, URL contient client_id/scopes/state ; callback avec state absent/incohérent → 302 `/login?error=` et aucun Session_Cookie.
- `session-cookie.test.ts` : `/login` pose un Session_Cookie ; `/api/auth/me` authentifie via cookie ; `POST /logout` efface le cookie.
- L'échange réseau réel avec Google n'est pas testé (dépendance externe) ; on teste les parties critiques de sécurité (CSRF state, cookies, chiffrement).
