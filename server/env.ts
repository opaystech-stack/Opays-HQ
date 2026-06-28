import dotenv from 'dotenv';

/**
 * Chargement des variables d'environnement de développement.
 *
 * Ce module est importé EN PREMIER par `server/index.ts`, avant tout autre
 * module qui lit `process.env` au chargement (ex. `server/auth.ts`). En
 * production, les variables sont injectées par la plateforme (Dokploy), donc
 * on ne charge aucun fichier. En test, les variables sont posées explicitement
 * par chaque suite ; on n'écrase rien.
 *
 * dotenv n'écrase jamais une variable déjà définie dans `process.env`.
 */
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv !== 'production' && nodeEnv !== 'test') {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}
