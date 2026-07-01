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
  // En production, on utilise SEED_PASSWORD s'il est défini, sinon random.
  // Le CEO peut définir SEED_PASSWORD dans les secrets Dokploy pour activer
  // la connexion par mot de passe en attendant la validation Google OAuth.
  const envPw = process.env.SEED_PASSWORD?.trim();
  if (envPw) return envPw;
  if (process.env.NODE_ENV === 'production') {
    return crypto.randomBytes(24).toString('hex');
  }
  return 'admin123';
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
    // Comptes réels de l'équipe — connexion par mot de passe de secours
    { email: 'lamsasfenelon@gmail.com', full_name: 'Fenelon Lamsasiri', role: 'ceo' },
    { email: 'princebagheni1@gmail.com', full_name: 'Prince Bagheni', role: 'coo' },
    { email: 'zamwanapatricia@gmail.com', full_name: 'Patricia Zamwana', role: 'sales' },
    { email: 'zainagodlive28@gmail.com', full_name: 'Zaina Godlive', role: 'sales' },
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

/** Sème 5 templates marketing de base si la table est vide. */
export function seedMarketingTemplates() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM marketing_templates').get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO marketing_templates (id, name, description, category, content, variables, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const templates: [string, string, string, string, string, string][] = [
    [
      'tmpl_welcome_email',
      'Email de bienvenue',
      'Template email de bienvenue pour nouveaux clients',
      'email',
      JSON.stringify({
        subject: 'Bienvenue chez Opays, {{client_name}} !',
        body: '<h1>Bienvenue !</h1><p>Bonjour {{client_name}},</p><p>Nous sommes ravis de vous compter parmi nos clients. Toute l\'équipe Opays est à votre disposition pour vous accompagner.</p><p>Cordialement,<br>L\'équipe Opays</p>',
      }),
      JSON.stringify(['client_name']),
    ],
    [
      'tmpl_followup_email',
      'Email de relance',
      'Template email de relance pour prospects non répondus',
      'email',
      JSON.stringify({
        subject: 'Relance Opays — {{client_name}}',
        body: '<p>Bonjour {{client_name}},</p><p>Suite à notre précédent échange, je souhaitais prendre de vos nouvelles. N\'hésitez pas à nous contacter pour toute question.</p><p>Bien cordialement,<br>{{sender_name}}</p>',
      }),
      JSON.stringify(['client_name', 'sender_name']),
    ],
    [
      'tmpl_quote_email',
      'Email d\'envoi de devis',
      'Template email pour accompagner l\'envoi d\'un devis',
      'email',
      JSON.stringify({
        subject: 'Votre devis Opays — {{quote_number}}',
        body: '<p>Bonjour {{client_name}},</p><p>Veuillez trouver ci-joint votre devis n°{{quote_number}} d\'un montant de {{amount}}.</p><p>Ce devis est valable jusqu\'au {{valid_until}}.</p><p>Cordialement,<br>{{sender_name}}</p>',
      }),
      JSON.stringify(['client_name', 'quote_number', 'amount', 'valid_until', 'sender_name']),
    ],
    [
      'tmpl_social_launch',
      'Annonce lancement (LinkedIn)',
      'Template post LinkedIn pour annonce de lancement de projet',
      'social',
      JSON.stringify({
        text: '🚀 Nous sommes fiers d\'annoncer le lancement de {{project_name}} !\n\nUn grand merci à {{client_name}} pour leur confiance. Ce projet a été réalisé avec passion par l\'équipe Opays.\n\n#Innovation #Opays #{{hashtag}}',
      }),
      JSON.stringify(['project_name', 'client_name', 'hashtag']),
    ],
    [
      'tmpl_newsletter_generic',
      'Newsletter mensuelle',
      'Template newsletter générique pour communication mensuelle',
      'email',
      JSON.stringify({
        subject: 'Newsletter Opays — {{month}} {{year}}',
        body: '<h1>Newsletter {{month}} {{year}}</h1><p>Bonjour {{client_name}},</p><p>Découvrez les dernières actualités d\'Opays :</p><ul><li>{{news_item_1}}</li><li>{{news_item_2}}</li><li>{{news_item_3}}</li></ul><p>À très bientôt !<br>L\'équipe Opays</p>',
      }),
      JSON.stringify(['month', 'year', 'client_name', 'news_item_1', 'news_item_2', 'news_item_3']),
    ],
  ];

  // Use the first admin/ceo user as creator, or null
  const firstUser = db.prepare("SELECT id FROM users ORDER BY created_at ASC LIMIT 1").get() as { id: string } | undefined;
  const creatorId = firstUser?.id || null;

  for (const [id, name, desc, cat, content, vars] of templates) {
    insert.run(id, name, desc, cat, content, vars, creatorId);
  }

  console.log(`✅ ${templates.length} templates marketing créés`);
}

