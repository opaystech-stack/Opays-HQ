# Implementation Plan: Dokploy Deployment

## Overview

This plan implements the application-layer changes required for a correct, secure, and durable Dokploy deployment of Opays HQ. The work is in TypeScript against the existing Express/`tsx` server. It covers: fail-fast `JWT_SECRET` validation, a durable explicit SQLite path with storage-failure handling, correct `/api/*` vs SPA routing with a formalized health endpoint, startup wiring (validation + DB readiness before binding), and the build/deploy artifacts (`Dockerfile`, `.dockerignore`, and the renamed `dokploy.yml`).

Platform-only acceptance criteria (TLS termination, host routing, zero-downtime cutover, rollback, build isolation/timeout, volume mount-failure abort, deployment outcome reporting — Requirements 1.1/1.4–1.6, 4.2–4.7, 5.1–5.2/5.6, 6.x, 7.x, 8.1–8.2) are realized by configuring Dokploy/Traefik to match `dokploy.yml` and are not codeable tasks. They are recorded in `dokploy.yml` as the source of truth the operator transcribes into the dashboard.

## Tasks

- [x] 1. Set up test tooling
  - [x] 1.1 Add test framework and scaffolding
    - Add `vitest` and `supertest` (with `@types/supertest`) as devDependencies
    - Add a `test` script (`vitest --run`) to `package.json`
    - Create a `vitest.config.ts` configured for the Node/server environment
    - Create the `server/__tests__/` directory for integration tests
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [x] 2. Implement startup configuration validation
  - [x] 2.1 Create `server/config.ts`
    - Define `AppConfig` and `ConfigError` types as specified in the design
    - Implement pure `validateJwtSecret(raw)`: report `JWT_SECRET_MISSING` for undefined/empty/whitespace-only (precedence over length), `JWT_SECRET_TOO_SHORT` for length < 32, otherwise `{ ok: true, value }`
    - Implement `loadConfigOrExit(env)`: read `NODE_ENV`, `PORT` (default 3001), and `JWT_SECRET`; on validation failure write a descriptive error log and call `process.exit(1)` so the process never binds
    - _Requirements: 3.4, 3.6_
  - [x]* 2.2 Write unit tests for `validateJwtSecret`
    - Cover undefined, empty, whitespace-only (→ missing), length 31 (→ too short), length 32 boundary and longer (→ ok)
    - Verify the missing check takes precedence over the too-short check
    - _Requirements: 3.4, 3.6_

- [x] 3. Implement secret consumption and durable storage
  - [x] 3.1 Remove the hardcoded JWT fallback in `server/auth.ts`
    - Read the secret from `process.env.JWT_SECRET` (guaranteed valid by startup validation) or the validated config; delete `|| 'opays-hq-secret-change-in-production'`
    - Leave token signing and verification behavior otherwise unchanged
    - _Requirements: 3.3_
  - [x]* 3.2 Write unit tests for token sign/verify
    - Verify a generated token round-trips through verification and that tampered/invalid tokens are rejected
    - _Requirements: 3.3_
  - [x] 3.3 Update `server/db.ts` for a durable, explicit storage path
    - Resolve the DB path from a `DATA_DIR` env var (default `/app/data`) with file name `opays-hq.db`
    - Attempt to create `/app/data` if absent; if creation/open fails because the directory is absent or not writable, emit a storage-failure log identifying the path and fail startup (no silent fallback)
    - Keep `CREATE TABLE IF NOT EXISTS` schema creation and row-count-guarded role seeding so existing data is never re-initialized or overwritten; retain WAL journal mode
    - _Requirements: 5.3, 5.4, 5.5, 5.7, 5.8_
  - [x]* 3.4 Write unit tests for database initialization
    - Verify schema/seed on a fresh temp directory, that re-opening an existing DB does not re-seed or overwrite rows, and that an unwritable/absent directory produces a startup failure with a storage log
    - _Requirements: 5.4, 5.5, 5.7_

- [x] 4. Implement routing, health endpoint, and startup wiring
  - [x] 4.1 Add the API 404 guard, reorder middleware, and formalize health in `server/index.ts`
    - Mount API routers and `GET /api/health`, then add an `/api`-scoped 404 handler returning `404 application/json` before the static and SPA-fallback middleware
    - Ensure static assets return 200 and all remaining non-API paths return `index.html` with 200
    - Formalize the health response as `{ status: "ok", timestamp: <ISO-8601> }` with `Content-Type: application/json` and status 200
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1_
  - [x] 4.2 Wire config validation and DB readiness before `app.listen` in `server/index.ts`
    - Call `loadConfigOrExit(process.env)` and ensure database open/init completes before binding `0.0.0.0:3001`
    - Replace the unconditional `seedDefaultUsers()`-then-listen flow so the server only binds after validation and storage are ready
    - _Requirements: 1.3, 3.4, 3.6, 5.4_
  - [x]* 4.3 Write integration tests for routing and health
    - Using supertest against the Express app: unmatched `/api/*` returns JSON 404 (not SPA HTML); a defined API route dispatches to its handler; non-API path returns `index.html` with 200; `GET /api/health` returns 200, `application/json`, and `status: "ok"`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.1, 8.3, 8.4_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Build and deployment artifacts
  - [x] 6.1 Correct the `Dockerfile`
    - Ensure `tsx` is present in the production image (move to `dependencies` or install in the production stage) so startup needs no network fetch and is ready within 60s
    - Remove the dead backend-compile stage and the vestigial `dist-server` copy referencing the non-existent `tsconfig.server.json`
    - Keep building the Vite frontend, installing production deps with native build tools then removing them, copying `dist` and `server/`, creating `/app/data`, exposing 3001, setting `NODE_ENV=production` and `PORT=3001`, and launching the single Express process
    - _Requirements: 1.2, 1.3, 2.7_
  - [x] 6.2 Create `.dockerignore`
    - Exclude `node_modules`, `dist`, `dist-server`, `data`, `*.db*`, `.git`, `.kiro`, `.env*`, and `nginx.conf` from the build context
    - _Requirements: 1.2, 2.7_
  - [x] 6.3 Rename `doploy.yml` to `dokploy.yml` and correct its fields
    - Record container port 3001; health check path `/api/health`, interval 30s, timeout 10s, retries 3; domain `hq.opays.io` with TLS and HTTP→HTTPS redirect; env `NODE_ENV=production`, `PORT=3001`, `JWT_SECRET=${JWT_SECRET}` via substitution (no committed secret); volume `/data/opays-hq:/app/data` read-write
    - _Requirements: 2.6, 3.1, 3.2, 3.3, 3.5, 4.2, 5.1_

- [x] 7. Deployment verification tests
  - [x]* 7.1 Write integration tests for the authentication API
    - Using supertest against the Express app: valid credentials return a signed token; invalid credentials are rejected with an error and no token
    - _Requirements: 8.5, 8.6_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP.
- The implementation language is TypeScript, matching the existing server codebase.
- The design has no "Correctness Properties" section, so tests are unit and integration tests rather than property-based tests.
- Each task references specific requirements (granular criteria) for traceability.
- Platform-only criteria (TLS, host routing, zero-downtime/rollback, build isolation/timeout, volume mount-failure abort, deployment reporting) are configured in Dokploy to match `dokploy.yml` and are out of scope for coding tasks.
- Checkpoints ensure incremental validation before moving to build/deploy artifacts.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "3.3", "6.1", "6.2", "6.3"] },
    { "id": 1, "tasks": ["2.2", "3.2", "3.4", "4.1"] },
    { "id": 2, "tasks": ["4.2"] },
    { "id": 3, "tasks": ["4.3", "7.1"] }
  ]
}
```
