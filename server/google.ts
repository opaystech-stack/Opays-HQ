import { OAuth2Client } from 'google-auth-library';
import type { GoogleConfig } from './config';

/**
 * Encapsulation du flux OAuth 2.0 Google (Authorization Code).
 *
 * Scopes demandés : identité OpenID + Drive / Sheets / Docs pour permettre,
 * ultérieurement, l'usage des outils Google de l'utilisateur depuis son espace.
 *
 * NOTE opérateur : les scopes Drive/Sheets/Docs sont « sensibles » et exigent
 * une vérification de l'application par Google avant usage en production.
 */
export const WORKSPACE_SCOPES: string[] = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
];

export interface GoogleTokens {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  scope: string | null;
  expiryDate: number | null;
}

function createClient(cfg: GoogleConfig): OAuth2Client {
  return new OAuth2Client({
    clientId: cfg.clientId,
    clientSecret: cfg.clientSecret,
    redirectUri: cfg.redirectUri,
  });
}

/** Construit l'URL de consentement Google avec le paramètre anti-CSRF `state`. */
export function buildAuthUrl(cfg: GoogleConfig, state: string): string {
  const client = createClient(cfg);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: WORKSPACE_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

/**
 * Échange le `code` d'autorisation contre des jetons, vérifie l'`id_token`,
 * et retourne l'identité + les jetons. Lève si l'échange ou la vérification échoue.
 */
export async function exchangeCode(cfg: GoogleConfig, code: string): Promise<GoogleTokens> {
  const client = createClient(cfg);
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new Error("id_token absent de la réponse Google");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: cfg.clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Payload id_token invalide");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
    accessToken: tokens.access_token ?? null,
    refreshToken: tokens.refresh_token ?? null,
    scope: tokens.scope ?? null,
    expiryDate: tokens.expiry_date ?? null,
  };
}
