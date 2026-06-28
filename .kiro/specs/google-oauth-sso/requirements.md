# Requirements — Google OAuth SSO & Workspace Integration

## Introduction

Remplacer le login email/mot de passe d'Opays HQ par une authentification unique
Google (OAuth 2.0 / OpenID Connect), et stocker de façon sécurisée les jetons Google
de chaque utilisateur afin de pouvoir, ultérieurement, exploiter ses outils Google
(Gmail, Drive, Sheets, Docs) depuis son espace de travail.

Contraintes transverses :
- Aucun secret committé (identifiants OAuth et clés via variables d'environnement).
- Session applicative portée par un cookie **HttpOnly**, **Secure** (en prod), **SameSite=Strict**.
- Code entièrement typé (TypeScript), testé, et conforme à la Definition of Done du projet.

## Glossaire

- **Google_OAuth_Client** : client OAuth 2.0 configuré dans Google Cloud Console (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
- **Session_Cookie** : cookie HttpOnly/SameSite=Strict contenant le JWT applicatif signé.
- **State_Cookie** : cookie transitoire HttpOnly/SameSite=Lax portant le paramètre anti-CSRF `state`.
- **Google_Account** : enregistrement liant un utilisateur Opays HQ à son compte Google (sub, jetons chiffrés, scopes, expiration).
- **Workspace_Scopes** : périmètres OAuth Drive/Sheets/Docs en plus de `openid email profile`.

## Requirements

### Requirement 1 — Démarrage du flux OAuth
**User Story:** En tant qu'utilisateur, je veux me connecter via Google, afin de ne plus gérer de mot de passe.

#### Acceptance Criteria
1. WHEN un client appelle `GET /api/auth/google`, THE backend SHALL générer un paramètre `state` aléatoire imprévisible, le déposer dans un State_Cookie HttpOnly, et rediriger (302) vers l'écran de consentement Google.
2. THE URL de consentement SHALL inclure `client_id`, `redirect_uri` (= `GOOGLE_REDIRECT_URI`), `response_type=code`, `access_type=offline`, `prompt=consent`, le `state`, et les scopes `openid email profile` + Workspace_Scopes.
3. IF la configuration Google est absente au démarrage, THEN `GET /api/auth/google` SHALL répondre 503 sans divulguer de détail de configuration.

### Requirement 2 — Callback et établissement de session
**User Story:** En tant qu'utilisateur, je veux être connecté après avoir consenti chez Google, afin d'accéder à mon espace.

#### Acceptance Criteria
1. WHEN `GET /api/auth/google/callback` reçoit un `code` et un `state`, THE backend SHALL rejeter la requête (redirection vers `/login?error=...`) IF le `state` de la query ne correspond pas au State_Cookie (protection CSRF), sans établir de session.
2. WHEN le `state` est valide, THE backend SHALL échanger le `code` contre des jetons Google, vérifier l'`id_token`, et en extraire `sub`, `email`, `name`, `picture`.
3. WHEN l'email correspond à un utilisateur existant, THE backend SHALL réutiliser ce compte ; OTHERWISE il SHALL créer un compte (sans mot de passe utilisable) avec un rôle par défaut `employee`.
4. WHEN l'authentification réussit, THE backend SHALL signer un JWT applicatif, le déposer dans un Session_Cookie HttpOnly/SameSite=Strict (Secure en production), effacer le State_Cookie, et rediriger vers `APP_URL/app/dashboard`.
5. IF l'échange de code ou la vérification de l'`id_token` échoue, THEN THE backend SHALL rediriger vers `/login?error=...` sans établir de session et sans exposer de détail sensible.

### Requirement 3 — Stockage sécurisé des jetons Google
**User Story:** En tant qu'opérateur, je veux que les jetons Google soient stockés de manière sûre, afin de protéger les accès Workspace des utilisateurs.

#### Acceptance Criteria
1. THE base SHALL contenir une table `google_accounts` (clé = `user_id`) avec `google_sub`, `access_token`, `refresh_token`, `scopes`, `expiry_date`.
2. THE `access_token` et `refresh_token` SHALL être chiffrés au repos (AES-256-GCM, clé `TOKEN_ENCRYPTION_KEY`) ; ils ne SHALL jamais être stockés en clair ni renvoyés au frontend.
3. WHEN un utilisateur déjà lié se reconnecte, THE backend SHALL mettre à jour les jetons existants (upsert) sans dupliquer le compte. IF Google ne renvoie pas de nouveau `refresh_token`, THEN THE backend SHALL conserver le `refresh_token` précédemment stocké.

### Requirement 4 — Session par cookie et déconnexion
**User Story:** En tant qu'utilisateur, je veux une session sécurisée et une déconnexion fiable.

#### Acceptance Criteria
1. THE middleware d'authentification SHALL accepter le JWT depuis le Session_Cookie ; pour compatibilité, il PEUT aussi accepter l'en-tête `Authorization: Bearer`.
2. WHEN un client appelle `POST /api/auth/logout`, THE backend SHALL effacer le Session_Cookie et répondre 200.
3. THE frontend SHALL envoyer ses requêtes API avec les cookies (`credentials: 'include'`) et ne SHALL pas stocker le JWT dans `localStorage`.

### Requirement 5 — Page de login
**User Story:** En tant qu'utilisateur, je veux une page de connexion claire utilisant Google.

#### Acceptance Criteria
1. THE page `/login` SHALL présenter un bouton « Continuer avec Google » déclenchant `GET /api/auth/google`.
2. WHEN une erreur OAuth est passée en query (`?error=`), THE page SHALL l'afficher de façon lisible.
