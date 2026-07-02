import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_FILE_NAME = 'opays-hq.db';

// The data directory is an explicit, environment-overridable absolute path with a
// production default of `/app/data`. The SQLite file lives at `<DATA_DIR>/opays-hq.db`.
function resolveDataDir(): string {
  const dataDir = process.env.DATA_DIR?.trim();
  return dataDir && dataDir.length > 0 ? dataDir : '/app/data';
}

function resolveDbPath(): string {
  return path.join(resolveDataDir(), DB_FILE_NAME);
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = resolveDbPath();
    const dir = path.dirname(dbPath);

    // Attempt to ensure the data directory exists. If the directory is absent and
    // cannot be created, or the database cannot be opened because the location is
    // not writable, emit a storage-failure log identifying the path and fail
    // startup. There is no silent fallback to another location.
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      db = new Database(dbPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `❌ Storage failure: unable to open SQLite database at "${dbPath}" ` +
          `(data directory "${dir}" is absent or not writable): ${message}`
      );
      throw new Error(
        `SQLite storage initialization failed for path "${dbPath}": ${message}`
      );
    }

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    migrateSchema();
    seedData();
    seedAgents();
  }
  return db;
}

/** Ajoute une colonne si elle n'existe pas (migration idempotente). */
function ensureColumn(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Migrations idempotentes pour les bases déjà créées (anciennes colonnes). */
function migrateSchema() {
  ensureColumn('agent_configs', 'system_prompt', 'TEXT');
  ensureColumn('agent_configs', 'temperature', 'REAL DEFAULT 0.7');
  ensureColumn('agent_configs', 'allowed_roles', 'TEXT');
  ensureColumn('agent_configs', 'updated_at', 'TEXT');

  // Projets : champs additionnels (branche, stack, marges, feedback, lien lead).
  ensureColumn('projects', 'lead_id', 'TEXT');
  ensureColumn('projects', 'branch', "TEXT DEFAULT 'FORGE'");
  ensureColumn('projects', 'tech_stack', "TEXT DEFAULT '[]'");
  ensureColumn('projects', 'gross_margin_projected', 'REAL');
  ensureColumn('projects', 'gross_margin_real', 'REAL');
  ensureColumn('projects', 'client_feedback', 'TEXT');

  // Leads : champs additionnels (deadline d'audit, niveau de confiance).
  ensureColumn('leads', 'audit_deadline', 'TEXT');
  ensureColumn('leads', 'confidence_level', 'REAL');

  // Prospects enrichis : champs supplémentaires.
  ensureColumn('leads', 'industry', 'TEXT');
  ensureColumn('leads', 'company_size', 'TEXT');
  ensureColumn('leads', 'source', 'TEXT');
  ensureColumn('leads', 'next_action', 'TEXT');
  ensureColumn('leads', 'next_action_date', 'TEXT');
  ensureColumn('leads', 'call_notes', 'TEXT');
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      level INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      role_id TEXT REFERENCES roles(id),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','paused','completed','cancelled')),
      owner_id TEXT REFERENCES users(id),
      start_date TEXT,
      deadline TEXT,
      budget REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done','cancelled')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      assignee_id TEXT REFERENCES users(id),
      created_by TEXT REFERENCES users(id),
      due_date TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
      author_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      system_prompt TEXT,
      temperature REAL DEFAULT 0.7,
      allowed_roles TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      agent_config_id TEXT REFERENCES agent_configs(id),
      title TEXT,
      messages TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT REFERENCES agent_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_role_id TEXT REFERENCES roles(id),
      author_id TEXT REFERENCES users(id),
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS treasury_logs (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      type TEXT CHECK (type IN ('income','expense','transfer')),
      description TEXT,
      category TEXT,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      shares_vested REAL NOT NULL,
      total_shares REAL NOT NULL,
      vesting_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS google_accounts (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      google_sub TEXT UNIQUE,
      access_token TEXT,
      refresh_token TEXT,
      scopes TEXT,
      expiry_date INTEGER,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hr_records (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      salary REAL,
      performance_score REAL,
      notes TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      estimated_value REAL DEFAULT 0,
      status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','audit','proposal','won','lost')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
      assignee_id TEXT REFERENCES users(id),
      notes TEXT,
      converted_project_id TEXT REFERENCES projects(id),
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      location TEXT,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      profile_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'OTHER' CHECK (category IN ('TECH','SALES','OPS','OTHER')),
      votes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','REVIEWED','IMPLEMENTED')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_descriptions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      role_name TEXT,
      responsibilities TEXT,
      salary_range TEXT,
      access_level TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sovereign_research (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      abstract TEXT,
      content_url TEXT,
      author_id TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_contracts (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      signed_at TEXT,
      version TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_billing (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      amount_total REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','PAID')),
      due_date TEXT,
      invoice_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('sale','proforma','credit_note','debit_note','quote')),
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_address TEXT,
      client_tax_id TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      notes TEXT,
      terms TEXT,
      due_date TEXT,
      issued_date TEXT,
      paid_date TEXT,
      created_by TEXT REFERENCES users(id),
      project_id TEXT REFERENCES projects(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS marketing_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'email' CHECK (category IN ('email','social','landing','print','other')),
      content TEXT NOT NULL DEFAULT '{}',
      variables TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      service TEXT,
      message TEXT NOT NULL,
      consent INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
      read_at TEXT,
      replied_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM roles').get() as { c: number };
  if (count.c > 0) return;

  const insertRole = db.prepare('INSERT INTO roles (id, name, label, level) VALUES (?, ?, ?, ?)');
  const roles = [
    ['role_admin', 'admin', 'Admin', 1],
    ['role_ceo', 'ceo', 'CEO', 2],
    ['role_coo', 'coo', 'COO', 2],
    ['role_cto', 'cto', 'CTO', 3],
    ['role_sales', 'sales', 'Directeur Commercial', 3],
    ['role_engineer', 'engineer', 'Ingénieur', 4],
    ['role_employee', 'employee', 'Employé', 4],
  ];
  for (const r of roles) insertRole.run(...r);
}

/** Sème des agents IA par défaut si la table est vide. */
function seedAgents() {
  const count = db.prepare('SELECT COUNT(*) as c FROM agent_configs').get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO agent_configs (id, name, description, system_prompt, temperature, allowed_roles)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const agents: [string, string, string, string, number, string | null][] = [
    [
      'agent_strategist',
      'Le Stratège',
      "Conseiller en stratégie d'entreprise et prise de décision.",
      "Tu es Le Stratège d'Opays HQ, un conseiller en stratégie d'entreprise pragmatique. Tu fournis des analyses structurées, des options chiffrées et des recommandations actionnables. Tu poses des questions de clarification quand le contexte manque.",
      0.7,
      null,
    ],
    [
      'agent_copywriter',
      'Le Copywriter',
      'Rédaction marketing et communication.',
      "Tu es Le Copywriter d'Opays HQ. Tu rédiges des textes marketing clairs, percutants et adaptés à la cible. Tu proposes plusieurs variantes et expliques tes choix de ton.",
      0.8,
      null,
    ],
    [
      'agent_cto',
      'CTO IA',
      'Supervision technique et qualité du code.',
      "Tu es le CTO IA d'Opays HQ. Tu évalues la qualité technique, la simplicité et la sécurité. Tu es méthodique, direct, et tu exiges des preuves (build/tests). Tu suis la méthode Karpathy : simplicité d'abord, mesurer avant d'optimiser, refuser la sur-ingénierie.",
      0.3,
      null,
    ],
  ];
  for (const a of agents) insert.run(...a);
}
