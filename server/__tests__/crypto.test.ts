import { describe, it, expect, beforeAll } from 'vitest';

const KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 32 octets

let crypto: typeof import('../crypto');

beforeAll(async () => {
  process.env.TOKEN_ENCRYPTION_KEY = KEY;
  crypto = await import('../crypto');
});

describe('crypto — chiffrement des secrets au repos', () => {
  it('chiffre puis déchiffre une valeur (round-trip)', () => {
    const secret = 'ya29.a0AfH-refresh-token-exemple';
    const enc = crypto.encryptSecret(secret);
    expect(enc).not.toContain(secret); // jamais en clair
    expect(enc.split(':')).toHaveLength(3);
    expect(crypto.decryptSecret(enc)).toBe(secret);
  });

  it('produit un chiffré différent à chaque appel (IV aléatoire)', () => {
    const a = crypto.encryptSecret('même-valeur');
    const b = crypto.encryptSecret('même-valeur');
    expect(a).not.toBe(b);
    expect(crypto.decryptSecret(a)).toBe('même-valeur');
    expect(crypto.decryptSecret(b)).toBe('même-valeur');
  });

  it('rejette une charge altérée (authentification GCM)', () => {
    const enc = crypto.encryptSecret('intègre');
    const [iv, tag, cipher] = enc.split(':');
    // Altère le dernier octet du chiffré.
    const tampered = `${iv}:${tag}:${cipher.slice(0, -2)}00`;
    expect(() => crypto.decryptSecret(tampered)).toThrow();
  });

  it('rejette une charge mal formée', () => {
    expect(() => crypto.decryptSecret('pas-le-bon-format')).toThrow();
  });

  it('isEncryptionConfigured reflète la présence de la clé', () => {
    expect(crypto.isEncryptionConfigured()).toBe(true);
  });
});
