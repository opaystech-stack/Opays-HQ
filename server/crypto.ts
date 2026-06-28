import crypto from 'crypto';

/**
 * Chiffrement symétrique des secrets au repos (AES-256-GCM).
 *
 * Utilisé pour ne jamais stocker en clair les jetons Google (access/refresh)
 * dans la base SQLite. La clé provient de la variable d'environnement
 * `TOKEN_ENCRYPTION_KEY` (64 caractères hexadécimaux = 32 octets).
 *
 * Format de sortie : "ivHex:tagHex:cipherHex".
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits, recommandé pour GCM
const KEY_LENGTH = 32; // 256 bits

function resolveKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY manquante : impossible de chiffrer/déchiffrer les jetons.'
    );
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY invalide : ${KEY_LENGTH} octets attendus (64 caractères hex), reçu ${key.length}.`
    );
  }
  return key;
}

/** Indique si une clé de chiffrement valide est configurée. */
export function isEncryptionConfigured(): boolean {
  try {
    resolveKey();
    return true;
  } catch {
    return false;
  }
}

/** Chiffre une chaîne et retourne "ivHex:tagHex:cipherHex". */
export function encryptSecret(plaintext: string): string {
  const key = resolveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/** Déchiffre une charge "ivHex:tagHex:cipherHex". Lève si altérée ou mal formée. */
export function decryptSecret(payload: string): string {
  const key = resolveKey();
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Charge chiffrée mal formée.');
  }
  const [ivHex, tagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(cipherHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
