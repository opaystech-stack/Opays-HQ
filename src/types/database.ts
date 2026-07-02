export type RoleName = 'admin' | 'ceo' | 'coo' | 'cto' | 'sales' | 'engineer' | 'employee';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role_id: string | null;
  role_name: RoleName | null;
  role_label: string | null;
  is_active: boolean;
  created_at: string;
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  owner_id: string | null;
  owner_name: string | null;
  start_date: string | null;
  deadline: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string | null;
  project_name: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  created_by: string | null;
  creator_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreasuryLog {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string | null;
  category: string | null;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  target_role_id: string | null;
  target_role_label: string | null;
  author_id: string | null;
  author_name: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type Resource =
  | 'profiles.all'
  | 'profiles.self'
  | 'projects.create'
  | 'projects.all'
  | 'projects.assigned'
  | 'tasks.create'
  | 'tasks.all'
  | 'tasks.assigned'
  | 'treasury'
  | 'rh.all'
  | 'rh.self'
  | 'equity.all'
  | 'equity.self'
  | 'knowledge.create'
  | 'knowledge.targeted'
  | 'agents.config'
  | 'agents.use'
  | 'admin.users'
  | 'admin.invitations';

export type LeadStatus = 'new' | 'contacted' | 'audit' | 'proposal' | 'won' | 'lost';

export interface Lead {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  estimated_value: number | null;
  status: LeadStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee_name: string | null;
  notes: string | null;
  converted_project_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Champs prospects enrichis
  industry: string | null;
  company_size: string | null;
  source: string | null;
  next_action: string | null;
  next_action_date: string | null;
  call_notes: string | null;
}

// ─── Factures ──────────────────────────────────────────────
export type InvoiceType = 'sale' | 'proforma' | 'credit_note' | 'debit_note' | 'quote';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface Invoice {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  type: InvoiceType;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  paid_at: string | null;
}

// ─── Marketing Templates ──────────────────────────────────
export interface MarketingTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  content: string;
  variables: string[];
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Site Contacts ────────────────────────────────────────
export type SiteContactStatus = 'new' | 'read' | 'replied' | 'archived';

export interface SiteContact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  consent: number;
  status: SiteContactStatus;
  read_at: string | null;
  replied_at: string | null;
  notes: string | null;
  created_at: string;
}
