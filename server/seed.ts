import { getDb } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Mot de passe des comptes seedés.
 *
 * En production, la connexion se fait EXCLUSIVEMENT via Google SSO : les comptes
 * seedés reçoivent donc un secret aléatoire non communiqué (login par mot de passe
 * de facto neutralisé — personne ne connaît la valeur). En dev/test, on utilise un
 * mot de passe connu pour faciliter les essais et les tests d'intégration.
 */
function seedPassword(): string {
  if (process.env.NODE_ENV === 'production') {
    return crypto.randomBytes(24).toString('hex');
  }
  return process.env.SEED_PASSWORD?.trim() || 'admin123';
}

export function seedDefaultUsers() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) return; // Already seeded

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const getRoleId = (name: string) => {
    return (db.prepare('SELECT id FROM roles WHERE name = ?').get(name) as { id: string })?.id;
  };

  const users = [
    { email: 'ceo@opays.io', full_name: 'Fenelon Lamsasiri', role: 'ceo' },
    { email: 'admin@opays.io', full_name: 'Admin Opays', role: 'admin' },
    { email: 'coo@opays.io', full_name: 'COO Opays', role: 'coo' },
    { email: 'cto@opays.io', full_name: 'CTO Opays', role: 'cto' },
    { email: 'patricia@opays.io', full_name: 'Patricia', role: 'sales' },
    { email: 'employee@opays.io', full_name: 'Employé Test', role: 'employee' },
  ];

  for (const u of users) {
    const roleId = getRoleId(u.role);
    // Un hash distinct par utilisateur : en production chaque compte a un secret
    // aléatoire propre et inutilisable pour un login mot de passe.
    insertUser.run(
      crypto.randomUUID(),
      u.email,
      bcrypt.hashSync(seedPassword(), 10),
      u.full_name,
      roleId
    );
  }

  console.log(`✅ ${users.length} utilisateurs par défaut créés`);
}

