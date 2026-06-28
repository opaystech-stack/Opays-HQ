/**
 * Startup configuration validator.
 *
 * Reads and validates environment configuration before the server binds to
 * port 3001. The validation logic is kept pure (no `process.exit`, no logging)
 * so it can be unit/property tested; the thin imperative wrapper
 * `loadConfigOrExit` performs the side effects (logging + exit) at startup.
 *
 * See design Component 1 (Requirements 3.4, 3.6).
 */

/** Minimum acceptable length for the JWT secret, in characters. */
export const MIN_JWT_SECRET_LENGTH = 32;

export interface AppConfig {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
}

export type ConfigError =
  | { kind: 'JWT_SECRET_MISSING' } // empty, undefined, or whitespace-only
  | { kind: 'JWT_SECRET_TOO_SHORT'; length: number }; // < 32 chars

/**
 * Pure validation of the JWT secret.
 *
 * Rules (Requirement 3.4, 3.6):
 * - `undefined`, empty string, or whitespace-only -> `JWT_SECRET_MISSING`.
 * - Length `< 32` -> `JWT_SECRET_TOO_SHORT` (length reported on the raw value).
 * - Otherwise valid.
 *
 * The missing/whitespace check takes precedence over the length check: a
 * whitespace-only string is reported as missing rather than too-short.
 */
export function validateJwtSecret(
  raw: string | undefined
):
  | { ok: true; value: string }
  | { ok: false; error: ConfigError } {
  if (raw === undefined || raw.trim().length === 0) {
    return { ok: false, error: { kind: 'JWT_SECRET_MISSING' } };
  }

  if (raw.length < MIN_JWT_SECRET_LENGTH) {
    return {
      ok: false,
      error: { kind: 'JWT_SECRET_TOO_SHORT', length: raw.length },
    };
  }

  return { ok: true, value: raw };
}

/** Default port the server binds to when `PORT` is not provided. */
const DEFAULT_PORT = 3001;

/**
 * Thin imperative wrapper used by `index.ts`.
 *
 * Reads `NODE_ENV`, `PORT` (default 3001), and `JWT_SECRET` from the supplied
 * environment. On JWT secret validation failure it writes a descriptive error
 * log and calls `process.exit(1)` so the process never binds port 3001.
 */
export function loadConfigOrExit(env: NodeJS.ProcessEnv): AppConfig {
  const nodeEnv = env.NODE_ENV ?? 'development';

  const parsedPort = Number.parseInt(env.PORT ?? '', 10);
  const port = Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort;

  const result = validateJwtSecret(env.JWT_SECRET);
  if (!result.ok) {
    switch (result.error.kind) {
      case 'JWT_SECRET_MISSING':
        console.error(
          '[config] Startup aborted: JWT secret is missing. Set the JWT_SECRET environment variable to a non-empty value of at least ' +
            `${MIN_JWT_SECRET_LENGTH} characters.`
        );
        break;
      case 'JWT_SECRET_TOO_SHORT':
        console.error(
          '[config] Startup aborted: JWT secret does not meet the minimum length. ' +
            `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters (received ${result.error.length}).`
        );
        break;
    }
    process.exit(1);
  }

  return {
    nodeEnv,
    port,
    jwtSecret: result.value,
  };
}

// ─── Configuration Google OAuth ─────────────────────────
//
// Non fatale si absente : les process qui n'utilisent pas Google (ex. tests
// unitaires, scripts) démarrent normalement. Les routes Google renvoient 503
// quand cette configuration est absente.

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  appUrl: string;
  isProduction: boolean;
}

/**
 * Charge la configuration Google OAuth depuis l'environnement.
 * Retourne `null` si l'une des variables requises est absente/vide.
 */
export function loadGoogleConfig(env: NodeJS.ProcessEnv): GoogleConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    appUrl: env.APP_URL?.trim() || 'http://localhost:5173',
    isProduction: (env.NODE_ENV ?? 'development') === 'production',
  };
}

// ─── Configuration OpenRouter (LLM) ──────────────────────
//
// Non fatale si absente : le module Agents reste listable/configurable, mais
// `POST /api/agents/chat` répond 503 tant qu'aucune clé n'est fournie.

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

export function loadOpenRouterConfig(env: NodeJS.ProcessEnv): OpenRouterConfig | null {
  const apiKey = env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return {
    apiKey,
    model: env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4o-mini',
  };
}
