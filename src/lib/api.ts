const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
    const json = await res.json();

    if (!res.ok) {
      return { error: json.error || `Erreur ${res.status}` };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || 'Erreur réseau' };
  }
}

// ─── Auth ────────────────────────────────────────────────
export async function apiLogin(email: string, password: string) {
  return request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(email: string, password: string, full_name?: string, role_name?: string) {
  return request<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role_name }),
  });
}

export async function apiGetMe() {
  return request<{ user: any }>('/auth/me');
}

export async function apiLogout() {
  return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

// ─── Dashboard ──────────────────────────────────────────
export async function apiGetDashboardStats() {
  return request<{ stats: any }>('/dashboard/stats');
}

// ─── Projects ───────────────────────────────────────────
export async function apiGetProjects() {
  return request<{ projects: any[] }>('/projects');
}

export async function apiCreateProject(data: any) {
  return request<{ project: any }>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Tasks ──────────────────────────────────────────────
export async function apiGetTasks() {
  return request<{ tasks: any[] }>('/tasks');
}

export async function apiCreateTask(data: any) {
  return request<{ task: any }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateTaskStatus(id: string, status: string) {
  return request<{ task: any }>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Treasury ───────────────────────────────────────────
export async function apiGetTreasury() {
  return request<{ logs: any[] }>('/treasury');
}

export async function apiCreateTreasuryLog(data: any) {
  return request<{ log: any }>('/treasury', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Users ──────────────────────────────────────────────
export async function apiGetUsers() {
  return request<{ users: any[] }>('/users');
}

export async function apiGetAssignableUsers() {
  return request<{ users: { id: string; full_name: string | null; role_label: string | null }[] }>('/users/assignable');
}

export async function apiInviteUser(data: { email: string; full_name?: string; role_name?: string }) {
  return request<{ user: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateUserRole(id: string, role_name: string) {
  return request<{ user: any }>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role_name }),
  });
}

// ─── Equity ─────────────────────────────────────────────
export async function apiGetEquity() {
  return request<{ logs: any[] }>('/equity');
}

export async function apiCreateEquity(data: {
  user_id: string;
  shares_vested: number;
  total_shares: number;
  vesting_date: string;
  notes?: string;
}) {
  return request<{ log: any }>('/equity', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── HR ─────────────────────────────────────────────────
export async function apiGetHr() {
  return request<{ records: any[] }>('/hr');
}

export async function apiUpsertHr(userId: string, data: { salary?: number | null; performance_score?: number | null; notes?: string | null }) {
  return request<{ record: any }>(`/hr/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Knowledge ──────────────────────────────────────────
export async function apiGetArticles() {
  return request<{ articles: any[] }>('/knowledge');
}

export async function apiCreateArticle(data: any) {
  return request<{ article: any }>('/knowledge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Agents IA ──────────────────────────────────────────
export async function apiGetAgents() {
  return request<{ agents: any[] }>('/agents');
}

export async function apiUpdateAgent(id: string, data: { name?: string; system_prompt?: string; temperature?: number }) {
  return request<{ agent: any }>(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiGetConversations() {
  return request<{ conversations: any[] }>('/agents/conversations');
}

export async function apiGetConversationMessages(id: string) {
  return request<{ messages: any[] }>(`/agents/conversations/${id}`);
}

export async function apiAgentChat(data: { agent_id: string; conversation_id?: string; message: string }) {
  return request<{ conversation_id: string; message: string }>('/agents/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── CRM / Leads ────────────────────────────────────────
export async function apiGetLeads() {
  return request<{ leads: any[] }>('/leads');
}

export async function apiCreateLead(data: Record<string, unknown>) {
  return request<{ lead: any }>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateLead(id: string, data: Record<string, unknown>) {
  return request<{ lead: any }>(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteLead(id: string) {
  return request<{ ok: boolean }>(`/leads/${id}`, { method: 'DELETE' });
}

export async function apiConvertLead(id: string) {
  return request<{ project: { id: string }; lead_id: string }>(`/leads/${id}/convert`, { method: 'POST' });
}

// ─── Projects (extension) ───────────────────────────────
export async function apiUpdateProject(id: string, data: Record<string, unknown>) {
  return request<{ project: any }>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Profil ─────────────────────────────────────────────
export async function apiGetProfile() {
  return request<{ user: any; google: { connected: boolean; scopes?: string | null; expiry_date?: number | null } }>('/users/me');
}

export async function apiUpdateProfile(data: { full_name?: string; avatar_url?: string }) {
  return request<{ user: any }>('/users/me', { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Calendrier ─────────────────────────────────────────
export async function apiGetCalendar() {
  return request<{ events: any[] }>('/calendar');
}
export async function apiCreateEvent(data: Record<string, unknown>) {
  return request<{ event: any }>('/calendar', { method: 'POST', body: JSON.stringify(data) });
}
export async function apiDeleteEvent(id: string) {
  return request<{ ok: boolean }>(`/calendar/${id}`, { method: 'DELETE' });
}

// ─── Boîte à idées ──────────────────────────────────────
export async function apiGetIdeas() {
  return request<{ ideas: any[] }>('/ideas');
}
export async function apiCreateIdea(data: Record<string, unknown>) {
  return request<{ idea: any }>('/ideas', { method: 'POST', body: JSON.stringify(data) });
}
export async function apiVoteIdea(id: string) {
  return request<{ idea: any }>(`/ideas/${id}/vote`, { method: 'POST' });
}

// ─── Fiches de poste ────────────────────────────────────
export async function apiGetJobDescriptions() {
  return request<{ jobDescriptions: any[] }>('/job-descriptions');
}
export async function apiCreateJobDescription(data: Record<string, unknown>) {
  return request<{ jobDescription: any }>('/job-descriptions', { method: 'POST', body: JSON.stringify(data) });
}
export async function apiDeleteJobDescription(id: string) {
  return request<{ ok: boolean }>(`/job-descriptions/${id}`, { method: 'DELETE' });
}

// ─── Souveraineté R&D ───────────────────────────────────
export async function apiGetSovereign() {
  return request<{ research: any[] }>('/sovereign');
}
export async function apiCreateSovereign(data: Record<string, unknown>) {
  return request<{ research: any }>('/sovereign', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Business ───────────────────────────────────────────
export async function apiGetBusinessStats() {
  return request<{ stats: any }>('/business/stats');
}

// ─── Vault ──────────────────────────────────────────────
export async function apiGetContracts() {
  return request<{ contracts: any[] }>('/vault/contracts');
}
export async function apiGetBilling() {
  return request<{ billing: any[] }>('/vault/billing');
}
export async function apiUploadDocument(file: File, meta: { project_id?: string; version?: string } = {}) {
  const form = new FormData();
  form.append('file', file);
  if (meta.project_id) form.append('project_id', meta.project_id);
  if (meta.version) form.append('version', meta.version);
  try {
    const res = await fetch(`${API_BASE}/vault/upload`, { method: 'POST', body: form, credentials: 'include' });
    const json = await res.json();
    if (!res.ok) return { error: json.error || `Erreur ${res.status}` };
    return { data: json as { url: string } };
  } catch (err: any) {
    return { error: err.message || 'Erreur réseau' };
  }
}
