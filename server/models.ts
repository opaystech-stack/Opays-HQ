import { getDb } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function uuid(): string {
  return crypto.randomUUID();
}

// ─── Auth ────────────────────────────────────────────────
export function createUser(email: string, password: string, fullName?: string, roleName?: string) {
  const db = getDb();
  const passwordHash = bcrypt.hashSync(password, 10);
  const id = uuid();
  const role = roleName
    ? db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName) as { id: string } | undefined
    : null;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, email, passwordHash, fullName || null, role?.id || null);

  return getUserById(id);
}

export function verifyPassword(email: string, password: string) {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
  `).get(email) as any;

  if (!user) return null;
  if (!bcrypt.compareSync(password, user.password_hash)) return null;

  return sanitizeUser(user);
}

export function getUserById(id: string) {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `).get(id) as any;
  return user ? sanitizeUser(user) : null;
}

function sanitizeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    avatar_url: u.avatar_url,
    role_id: u.role_id,
    role_name: u.role_name,
    role_label: u.role_label,
    is_active: !!u.is_active,
    created_at: u.created_at,
  };
}

// ─── Projects ───────────────────────────────────────────
export function getProjects(userId: string, roleName: string) {
  const db = getDb();
  if (['admin', 'ceo', 'coo', 'cto'].includes(roleName)) {
    return db.prepare('SELECT p.*, u.full_name as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC').all();
  }
  return db.prepare('SELECT p.*, u.full_name as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id WHERE p.owner_id = ? ORDER BY p.created_at DESC').all(userId);
}

export function createProject(data: { name: string; description?: string; owner_id: string; start_date?: string; deadline?: string; budget?: number }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO projects (id, name, description, owner_id, start_date, deadline, budget)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.description || null, data.owner_id, data.start_date || null, data.deadline || null, data.budget || null);
  return { id, ...data };
}

// ─── Tasks ───────────────────────────────────────────────
export function getTasks(userId: string, roleName: string) {
  const db = getDb();
  if (['admin', 'ceo', 'coo', 'cto'].includes(roleName)) {
    return db.prepare(`
      SELECT t.*, u_a.full_name as assignee_name, u_c.full_name as creator_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u_a ON t.assignee_id = u_a.id
      LEFT JOIN users u_c ON t.created_by = u_c.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `).all();
  }
  return db.prepare(`
    SELECT t.*, u_a.full_name as assignee_name, u_c.full_name as creator_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u_a ON t.assignee_id = u_a.id
    LEFT JOIN users u_c ON t.created_by = u_c.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.assignee_id = ? OR t.created_by = ?
    ORDER BY t.created_at DESC
  `).all(userId, userId);
}

export function createTask(data: { title: string; description?: string; priority?: string; project_id?: string; assignee_id?: string; created_by: string; due_date?: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO tasks (id, title, description, priority, project_id, assignee_id, created_by, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.title, data.description || null, data.priority || 'medium', data.project_id || null, data.assignee_id || null, data.created_by, data.due_date || null);
  return { id, ...data };
}

export function updateTaskStatus(id: string, status: string) {
  const db = getDb();
  const completedAt = status === 'done' ? new Date().toISOString() : null;
  db.prepare('UPDATE tasks SET status = ?, completed_at = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, completedAt, id);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

// ─── Treasury ────────────────────────────────────────────
export function getTreasuryLogs() {
  const db = getDb();
  return db.prepare(`
    SELECT t.*, u.full_name as creator_name
    FROM treasury_logs t LEFT JOIN users u ON t.created_by = u.id
    ORDER BY t.created_at DESC
  `).all();
}

export function createTreasuryLog(data: { amount: number; type: string; description?: string; category?: string; created_by: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO treasury_logs (id, amount, type, description, category, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.amount, data.type, data.description || null, data.category || null, data.created_by);
  return { id, ...data };
}

// ─── Users (RH) ──────────────────────────────────────────
export function getUsers() {
  const db = getDb();
  return db.prepare(`
    SELECT u.id, u.email, u.full_name, u.avatar_url, u.is_active, u.created_at,
           r.name as role_name, r.label as role_label
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY r.level, u.full_name
  `).all();
}

// ─── Knowledge ───────────────────────────────────────────
export function getArticles(roleName?: string) {
  const db = getDb();
  // Filtrage par rôle côté serveur : un utilisateur ne voit que les articles
  // publics (target_role_id NULL) ou ciblant explicitement son rôle.
  if (roleName) {
    return db.prepare(`
      SELECT a.*, u.full_name as author_name, r.label as target_role_label
      FROM knowledge_articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN roles r ON a.target_role_id = r.id
      WHERE a.target_role_id IS NULL
         OR a.target_role_id = (SELECT id FROM roles WHERE name = ?)
      ORDER BY a.created_at DESC
    `).all(roleName);
  }
  return db.prepare(`
    SELECT a.*, u.full_name as author_name, r.label as target_role_label
    FROM knowledge_articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN roles r ON a.target_role_id = r.id
    ORDER BY a.created_at DESC
  `).all();
}

export function createArticle(data: { title: string; content: string; author_id: string; target_role_id?: string; tags?: string[] }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO knowledge_articles (id, title, content, author_id, target_role_id, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.title, data.content, data.author_id, data.target_role_id || null, JSON.stringify(data.tags || []));
  return { id, ...data };
}

// ─── Equity ──────────────────────────────────────────────
export function getEquityLogs() {
  const db = getDb();
  return db.prepare(`
    SELECT e.*, u.full_name as user_name
    FROM equity_logs e LEFT JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
  `).all();
}

// ─── Dashboard stats ─────────────────────────────────────
export function getDashboardStats() {
  const db = getDb();
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status IN ('planning','active')").get() as any).c;
  const tasksInProgress = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status IN ('todo','in_progress','review')").get() as any).c;
  const urgentTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE priority IN ('high','urgent') AND status NOT IN ('done','cancelled')").get() as any).c;
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users WHERE is_active = 1').get() as any).c;
  const totalIncome = (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM treasury_logs WHERE type = 'income'").get() as any).s;
  const totalExpense = (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM treasury_logs WHERE type = 'expense'").get() as any).s;

  return { activeProjects, tasksInProgress, urgentTasks, totalUsers, totalIncome, totalExpense };
}

// ─── Google OAuth ────────────────────────────────────────
import { encryptSecret } from './crypto';

export function getUserByEmail(email: string) {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
  `).get(email) as any;
  return user ? sanitizeUser(user) : null;
}

/**
 * Crée un utilisateur authentifié via Google. Aucun mot de passe utilisable :
 * `password_hash` (NOT NULL) reçoit le hash d'un UUID aléatoire, ce qui rend
 * tout login par mot de passe impossible pour ce compte.
 */
export function createGoogleUser(
  email: string,
  fullName: string | null,
  avatarUrl: string | null,
  roleName: string = 'employee',
) {
  const db = getDb();
  const id = uuid();
  const unusablePasswordHash = bcrypt.hashSync(uuid(), 10);
  const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName) as { id: string } | undefined;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, avatar_url, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email, unusablePasswordHash, fullName, avatarUrl, role?.id || null);

  return getUserById(id);
}

/**
 * Crée ou met à jour le lien Google d'un utilisateur. Les jetons sont chiffrés
 * au repos. Si Google ne renvoie pas de nouveau refresh_token, l'ancien est conservé.
 */
export function upsertGoogleAccount(
  userId: string,
  t: { sub: string; accessToken: string | null; refreshToken: string | null; scopes: string | null; expiryDate: number | null },
) {
  const db = getDb();
  const existing = db.prepare('SELECT refresh_token FROM google_accounts WHERE user_id = ?').get(userId) as
    | { refresh_token: string | null }
    | undefined;

  const encAccess = t.accessToken ? encryptSecret(t.accessToken) : null;
  // Conserver le refresh_token existant si Google n'en renvoie pas un nouveau.
  const encRefresh = t.refreshToken
    ? encryptSecret(t.refreshToken)
    : existing?.refresh_token ?? null;

  db.prepare(`
    INSERT INTO google_accounts (user_id, google_sub, access_token, refresh_token, scopes, expiry_date, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      google_sub = excluded.google_sub,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      scopes = excluded.scopes,
      expiry_date = excluded.expiry_date,
      updated_at = datetime('now')
  `).run(userId, t.sub, encAccess, encRefresh, t.scopes, t.expiryDate);
}

/** Métadonnées non sensibles du lien Google (jamais les jetons en clair). */
export function getGoogleAccount(userId: string) {
  const db = getDb();
  const row = db.prepare('SELECT scopes, expiry_date FROM google_accounts WHERE user_id = ?').get(userId) as
    | { scopes: string | null; expiry_date: number | null }
    | undefined;
  return row ?? null;
}

// ─── Membres / Admin ─────────────────────────────────────

/** Liste minimale pour l'assignation de tâches (accessible à tout authentifié). */
export function getAssignableUsers() {
  const db = getDb();
  return db.prepare(`
    SELECT u.id, u.full_name, r.label as role_label
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.is_active = 1
    ORDER BY u.full_name
  `).all();
}

/** Met à jour le rôle d'un utilisateur. Retourne l'utilisateur mis à jour. */
export function updateUserRole(userId: string, roleName: string) {
  const db = getDb();
  const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName) as { id: string } | undefined;
  if (!role) return null;
  db.prepare("UPDATE users SET role_id = ?, updated_at = datetime('now') WHERE id = ?").run(role.id, userId);
  return getUserById(userId);
}

// ─── Equity ──────────────────────────────────────────────
export function createEquityLog(data: {
  user_id: string;
  shares_vested: number;
  total_shares: number;
  vesting_date: string;
  notes?: string;
}) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO equity_logs (id, user_id, shares_vested, total_shares, vesting_date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.user_id, data.shares_vested, data.total_shares, data.vesting_date, data.notes || null);
  return { id, ...data };
}

// ─── RH (salaire / performance) ──────────────────────────
export function getHrRecords() {
  const db = getDb();
  return db.prepare(`
    SELECT u.id as user_id, u.full_name, u.email, r.label as role_label,
           h.salary, h.performance_score, h.notes, h.updated_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN hr_records h ON h.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY r.level, u.full_name
  `).all();
}

export function upsertHrRecord(
  userId: string,
  data: { salary?: number | null; performance_score?: number | null; notes?: string | null },
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO hr_records (user_id, salary, performance_score, notes, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      salary = excluded.salary,
      performance_score = excluded.performance_score,
      notes = excluded.notes,
      updated_at = datetime('now')
  `).run(userId, data.salary ?? null, data.performance_score ?? null, data.notes ?? null);
  return db.prepare('SELECT * FROM hr_records WHERE user_id = ?').get(userId);
}

// ─── Agents IA ───────────────────────────────────────────

export function getAgents() {
  const db = getDb();
  return db.prepare(`
    SELECT id, name, description, system_prompt, temperature, allowed_roles, is_active
    FROM agent_configs WHERE is_active = 1 ORDER BY name
  `).all();
}

export function getAgentById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM agent_configs WHERE id = ?').get(id) as
    | { id: string; name: string; system_prompt: string | null; temperature: number | null }
    | undefined;
}

export function updateAgent(
  id: string,
  data: { name?: string; system_prompt?: string; temperature?: number },
) {
  const db = getDb();
  const current = getAgentById(id);
  if (!current) return null;
  db.prepare(`
    UPDATE agent_configs
    SET name = COALESCE(?, name),
        system_prompt = COALESCE(?, system_prompt),
        temperature = COALESCE(?, temperature),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(data.name ?? null, data.system_prompt ?? null, data.temperature ?? null, id);
  return db.prepare('SELECT id, name, description, system_prompt, temperature, allowed_roles, is_active FROM agent_configs WHERE id = ?').get(id);
}

export function createConversation(userId: string, agentId: string, title: string) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO agent_conversations (id, user_id, agent_config_id, title)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, agentId, title);
  return id;
}

export function getConversations(userId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT c.id, c.title, c.agent_config_id, c.created_at, c.updated_at, a.name as agent_name
    FROM agent_conversations c
    LEFT JOIN agent_configs a ON c.agent_config_id = a.id
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC
  `).all(userId);
}

/** Propriétaire d'une conversation (pour contrôle d'accès). */
export function getConversationOwner(conversationId: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT user_id FROM agent_conversations WHERE id = ?').get(conversationId) as
    | { user_id: string }
    | undefined;
  return row?.user_id ?? null;
}

export function getConversationMessages(conversationId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT id, role, content, created_at
    FROM agent_messages WHERE conversation_id = ?
    ORDER BY created_at ASC, rowid ASC
  `).all(conversationId);
}

export function addMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO agent_messages (id, conversation_id, role, content)
    VALUES (?, ?, ?, ?)
  `).run(id, conversationId, role, content);
  db.prepare("UPDATE agent_conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
  return { id, role, content };
}

// ─── CRM / Leads ─────────────────────────────────────────

export function getLeads() {
  const db = getDb();
  return db.prepare(`
    SELECT l.*, u.full_name as assignee_name
    FROM leads l LEFT JOIN users u ON l.assignee_id = u.id
    ORDER BY l.updated_at DESC
  `).all();
}

export function getLeadById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as
    | {
        id: string;
        company_name: string;
        contact_name: string | null;
        estimated_value: number | null;
        status: string;
        assignee_id: string | null;
        notes: string | null;
        converted_project_id: string | null;
      }
    | undefined;
}

export function createLead(data: {
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  estimated_value?: number;
  status?: string;
  priority?: string;
  assignee_id?: string;
  notes?: string;
  created_by: string;
}) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO leads (id, company_name, contact_name, email, phone, estimated_value, status, priority, assignee_id, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.company_name,
    data.contact_name || null,
    data.email || null,
    data.phone || null,
    data.estimated_value ?? 0,
    data.status || 'new',
    data.priority || 'medium',
    data.assignee_id || null,
    data.notes || null,
    data.created_by,
  );
  return getLeadById(id);
}

const LEAD_FIELDS = ['company_name', 'contact_name', 'email', 'phone', 'estimated_value', 'status', 'priority', 'assignee_id', 'notes'] as const;

export function updateLead(id: string, data: Record<string, unknown>) {
  const db = getDb();
  if (!getLeadById(id)) return null;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of LEAD_FIELDS) {
    if (field in data && data[field] !== undefined) {
      sets.push(`${field} = ?`);
      values.push(data[field]);
    }
  }
  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return getLeadById(id);
}

export function deleteLead(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  return result.changes > 0;
}

export type ConvertResult =
  | { ok: true; project: { id: string }; lead_id: string }
  | { ok: false; error: 'NOT_FOUND' | 'NOT_WON' | 'ALREADY_CONVERTED' };

/**
 * Convertit un lead gagné en projet. Refuse si le lead n'est pas `won`
 * ou s'il a déjà été converti. Transaction atomique.
 */
export function convertLeadToProject(leadId: string, ownerId: string): ConvertResult {
  const db = getDb();
  const lead = getLeadById(leadId);
  if (!lead) return { ok: false, error: 'NOT_FOUND' };
  if (lead.status !== 'won') return { ok: false, error: 'NOT_WON' };
  if (lead.converted_project_id) return { ok: false, error: 'ALREADY_CONVERTED' };

  const projectId = uuid();
  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO projects (id, name, description, status, owner_id, budget)
      VALUES (?, ?, ?, 'active', ?, ?)
    `).run(
      projectId,
      lead.company_name,
      lead.notes || `Projet issu du lead ${lead.company_name}`,
      lead.assignee_id || ownerId,
      lead.estimated_value ?? 0,
    );
    db.prepare("UPDATE leads SET converted_project_id = ?, updated_at = datetime('now') WHERE id = ?").run(projectId, leadId);
  });
  tx();

  return { ok: true, project: { id: projectId }, lead_id: leadId };
}

// ─── Projets (extension) ─────────────────────────────────
export function getProjectById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Record<string, unknown> | undefined;
}

const PROJECT_UPDATE_FIELDS = [
  'name', 'description', 'status', 'branch', 'tech_stack', 'due_date',
  'gross_margin_projected', 'gross_margin_real', 'client_feedback',
] as const;

export function updateProject(id: string, data: Record<string, unknown>) {
  const db = getDb();
  if (!getProjectById(id)) return null;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of PROJECT_UPDATE_FIELDS) {
    if (field in data && data[field] !== undefined) {
      sets.push(`${field} = ?`);
      values.push(field === 'tech_stack' && Array.isArray(data[field]) ? JSON.stringify(data[field]) : data[field]);
    }
  }
  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return getProjectById(id);
}

// ─── Profil utilisateur ──────────────────────────────────
export function updateUserProfile(userId: string, data: { full_name?: string; avatar_url?: string }) {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];
  if (data.full_name !== undefined) { sets.push('full_name = ?'); values.push(data.full_name); }
  if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); values.push(data.avatar_url); }
  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values, userId);
  }
  return getUserById(userId);
}

// ─── Calendrier ──────────────────────────────────────────
export function getCalendarEvents() {
  const db = getDb();
  return db.prepare(`
    SELECT e.*, u.full_name as creator_name
    FROM calendar_events e LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.start_time ASC
  `).all();
}

export function createCalendarEvent(data: { title: string; description?: string; start_time: string; end_time?: string; location?: string; created_by: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO calendar_events (id, title, description, start_time, end_time, location, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.title, data.description || null, data.start_time, data.end_time || null, data.location || null, data.created_by);
  return db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
}

export function deleteCalendarEvent(id: string): boolean {
  const db = getDb();
  return db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id).changes > 0;
}

// ─── Boîte à idées ───────────────────────────────────────
export function getIdeas() {
  const db = getDb();
  return db.prepare(`
    SELECT i.*, u.full_name as author_name
    FROM ideas i LEFT JOIN users u ON i.profile_id = u.id
    ORDER BY i.votes DESC, i.created_at DESC
  `).all();
}

export function createIdea(data: { title: string; description?: string; category?: string; profile_id: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO ideas (id, profile_id, title, description, category)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.profile_id, data.title, data.description || null, data.category || 'OTHER');
  return db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
}

export function voteIdea(id: string) {
  const db = getDb();
  const res = db.prepare('UPDATE ideas SET votes = votes + 1 WHERE id = ?').run(id);
  if (res.changes === 0) return null;
  return db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
}

// ─── Fiches de poste ─────────────────────────────────────
export function getJobDescriptions() {
  const db = getDb();
  return db.prepare('SELECT * FROM job_descriptions ORDER BY created_at DESC').all();
}

export function createJobDescription(data: { title: string; role_name?: string; responsibilities?: string; salary_range?: string; access_level?: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO job_descriptions (id, title, role_name, responsibilities, salary_range, access_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.title, data.role_name || null, data.responsibilities || null, data.salary_range || null, data.access_level || null);
  return db.prepare('SELECT * FROM job_descriptions WHERE id = ?').get(id);
}

export function deleteJobDescription(id: string): boolean {
  const db = getDb();
  return db.prepare('DELETE FROM job_descriptions WHERE id = ?').run(id).changes > 0;
}

// ─── Souveraineté R&D ────────────────────────────────────
export function getSovereignResearch() {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, u.full_name as author_name
    FROM sovereign_research s LEFT JOIN users u ON s.author_id = u.id
    ORDER BY s.created_at DESC
  `).all();
}

export function createSovereignResearch(data: { title: string; abstract?: string; content_url?: string; author_id: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO sovereign_research (id, title, abstract, content_url, author_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.title, data.abstract || null, data.content_url || null, data.author_id);
  return db.prepare('SELECT * FROM sovereign_research WHERE id = ?').get(id);
}

// ─── Vault (contrats & facturation) ──────────────────────
export function getContracts() {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, p.name as project_name
    FROM project_contracts c LEFT JOIN projects p ON c.project_id = p.id
    ORDER BY c.created_at DESC
  `).all();
}

export function createContract(data: { project_id?: string; url: string; signed_at?: string; version?: string }) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO project_contracts (id, project_id, url, signed_at, version)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.project_id || null, data.url, data.signed_at || null, data.version || null);
  return db.prepare('SELECT * FROM project_contracts WHERE id = ?').get(id);
}

export function getBilling() {
  const db = getDb();
  return db.prepare(`
    SELECT b.*, p.name as project_name
    FROM project_billing b LEFT JOIN projects p ON b.project_id = p.id
    ORDER BY b.created_at DESC
  `).all();
}

// ─── Business & Revenue ──────────────────────────────────
export function getBusinessStats() {
  const db = getDb();
  const totalIncome = (db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM treasury_logs WHERE type='income'").get() as any).s;
  const totalExpense = (db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM treasury_logs WHERE type='expense'").get() as any).s;
  const billedTotal = (db.prepare('SELECT COALESCE(SUM(amount_total),0) as s FROM project_billing').get() as any).s;
  const paidTotal = (db.prepare('SELECT COALESCE(SUM(amount_paid),0) as s FROM project_billing').get() as any).s;
  const projectedMargin = (db.prepare('SELECT COALESCE(SUM(gross_margin_projected),0) as s FROM projects').get() as any).s;
  const realMargin = (db.prepare('SELECT COALESCE(SUM(gross_margin_real),0) as s FROM projects').get() as any).s;
  return {
    totalIncome,
    totalExpense,
    treasuryNet: totalIncome - totalExpense,
    billedTotal,
    paidTotal,
    outstanding: billedTotal - paidTotal,
    projectedMargin,
    realMargin,
  };
}
