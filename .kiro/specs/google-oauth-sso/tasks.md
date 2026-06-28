# Implementation Plan — Google OAuth SSO

- [ ] 1. Dépendances & chargement d'environnement
  - Ajouter `google-auth-library`, `cookie-parser`, `dotenv` (+ `@types/cookie-parser`)
  - Charger `.env.local` en dev dans `server/index.ts`
  - _Req: 1, 2_

- [ ] 2. Chiffrement des secrets au repos (`server/crypto.ts`)
  - AES-256-GCM `encryptSecret` / `decryptSecret` / `isEncryptionConfigured`
  - _Req: 3.2_

- [ ] 3. Config Google (`server/config.ts`)
  - `loadGoogleConfig(env)` → `GoogleConfig | null`
  - _Req: 1.3, 2_

- [ ] 4. Schéma `google_accounts` (`server/db.ts`)
  - Table idempotente liée à `users`
  - _Req: 3.1_

- [ ] 5. Client Google (`server/google.ts`)
  - Scopes, `buildAuthUrl`, `exchangeCode` (+ vérif id_token)
  - _Req: 1.2, 2.2_

- [ ] 6. Modèles (`server/models.ts`)
  - `getUserByEmail`, `createGoogleUser`, `upsertGoogleAccount`, `getGoogleAccount`
  - _Req: 2.3, 3.1, 3.3_

- [ ] 7. Cookies de session (`server/auth.ts`)
  - `setSessionCookie` / `clearSessionCookie` ; `authMiddleware` lit cookie puis Bearer
  - _Req: 4.1_

- [ ] 8. Routes OAuth (`server/routes/auth.ts`)
  - `GET /google`, `GET /google/callback`, `POST /logout` ; `/login` pose le cookie
  - _Req: 1, 2, 4.2_

- [ ] 9. Câblage backend (`server/index.ts`)
  - Monter `cookie-parser`
  - _Req: 4_

- [ ] 10. Frontend
  - `api.ts` `credentials:'include'` ; `auth.ts` logout backend ; `login.tsx` bouton Google + erreurs
  - _Req: 4.3, 5_

- [ ] 11. Tests (vitest + supertest)
  - `crypto.test.ts`, `google-auth.test.ts`, `session-cookie.test.ts`
  - _Req: 2.1, 3.2, 4_

- [ ] 12. Validation DoD par le CTO IA
  - build + typecheck + lint + tests verts ; pas de secret committé ; cookies HttpOnly/Strict ; typage complet
