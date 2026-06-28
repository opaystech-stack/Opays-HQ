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
}
