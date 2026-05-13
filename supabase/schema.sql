-- SCHEMA COMPLET POUR OPAYS HQ (L'OS DE L'ENTREPRISE)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des Profils (Associés & Employés)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  type TEXT CHECK (type IN ('ASSOCIATE', 'EMPLOYEE')) DEFAULT 'ASSOCIATE',
  role TEXT CHECK (role IN ('CEO', 'COO', 'CTO', 'SALES', 'INVESTOR', 'ENGINEER', 'ADMIN')),
  is_admin BOOLEAN DEFAULT FALSE, -- Droits d'administration globaux
  equity_percent FLOAT DEFAULT 0, -- Uniquement pour les associés
  salary_amount FLOAT DEFAULT 0, -- Uniquement pour les employés
  vesting_start_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Système RH & Performance (Employés)
CREATE TABLE hr_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  document_url TEXT, -- Fiches de paie, contrats
  performance_score INT CHECK (performance_score BETWEEN 0 AND 100),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRM : Leads & Opportunités
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT CHECK (status IN ('NEW', 'CONTACTED', 'AUDIT_PENDING', 'PROPOSAL_SENT', 'CLOSED_WON', 'CLOSED_LOST')) DEFAULT 'NEW',
  potential_value FLOAT,
  assigned_to UUID REFERENCES profiles(id),
  sla_qualification_deadline TIMESTAMP WITH TIME ZONE, -- SLA < 24h
  audit_owner_id UUID REFERENCES profiles(id),
  audit_deadline DATE,
  confidence_level FLOAT DEFAULT 0.8 -- Décote de confiance
);

-- 4. Production : Projets & Tâches
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  title TEXT NOT NULL,
  description TEXT,
  branch TEXT CHECK (branch IN ('STUDIO', 'LABS')) DEFAULT 'STUDIO',
  status TEXT CHECK (status IN ('PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'MAINTENANCE')) DEFAULT 'PLANNING',
  tech_stack TEXT[],
  due_date DATE,
  gross_margin_projected FLOAT,
  gross_margin_real FLOAT,
  is_maintenance_active BOOLEAN DEFAULT FALSE,
  maintenance_plan TEXT,
  definition_of_done TEXT[], -- Checklist obligatoire
  client_feedback TEXT
);

-- 4b. Tables Sensibles (Isolées pour RLS)
CREATE TABLE project_contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version TEXT DEFAULT '1.0'
);

CREATE TABLE project_billing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount_total FLOAT NOT NULL,
  amount_paid FLOAT DEFAULT 0,
  status TEXT CHECK (status IN ('PENDING', 'PARTIAL', 'PAID')) DEFAULT 'PENDING',
  due_date DATE,
  invoice_url TEXT
);

CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) DEFAULT 'MEDIUM',
  status TEXT CHECK (status IN ('TODO', 'DOING', 'DONE')) DEFAULT 'TODO',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Trésorerie & Partenariats (Vue Associés)
CREATE TABLE treasury_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
  category TEXT, -- Salaire, SaaS, Client, etc.
  amount FLOAT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE partnerships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  status TEXT CHECK (status IN ('NEGOTIATION', 'ACTIVE', 'PAUSED')),
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Knowledge Base (Les Ficelles du Métier)
CREATE TABLE knowledge_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Format Markdown
  target_role TEXT, -- Filtrage par rôle (ex: 'SALES')
  category TEXT CHECK (category IN ('METHOD', 'GUIDE', 'VISION', 'TECH')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Suivi d'Equity (Vesting mensuel)
CREATE TABLE equity_vesting_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  shares_unlocked FLOAT,
  contribution_notes TEXT,
  month DATE DEFAULT date_trunc('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Espace Audit IA (ROI & Frictions)
CREATE TABLE ai_audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  lead_id UUID REFERENCES leads(id),
  raw_data_url TEXT,
  salary_loaded_monthly FLOAT, -- Salaire chargé employeur
  productive_hours_monthly FLOAT DEFAULT 140, -- Heures productives (ex: 160 - pauses/formation)
  rework_cost_monthly FLOAT DEFAULT 0, -- Coût des erreurs/re-travail
  opays_maintenance_monthly FLOAT DEFAULT 600,
  initial_setup_cost FLOAT DEFAULT 0,
  confidence_level FLOAT DEFAULT 0.8,
  gain_net_annual FLOAT,
  payback_months FLOAT,
  multiple_roi FLOAT,
  status TEXT CHECK (status IN ('PENDING', 'ANALYZING', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Système de Commentaires (Tâches)
CREATE TABLE task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Boîte à Idées (Stratégie & Innovation)
CREATE TABLE ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('TECH', 'SALES', 'OPS', 'OTHER')),
  votes INT DEFAULT 0,
  status TEXT CHECK (status IN ('PENDING', 'REVIEWED', 'IMPLEMENTED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Documents Globaux (Gestion CEO)
CREATE TABLE global_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  visible_to_roles TEXT[], -- ex: ['CEO', 'CTO']
  visible_to_types TEXT[], -- ex: ['ASSOCIATE']
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Invitations Avancées
CREATE TABLE invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  type TEXT CHECK (type IN ('ASSOCIATE', 'EMPLOYEE')),
  token TEXT UNIQUE NOT NULL,
  equity_granted FLOAT DEFAULT 0,
  salary_granted FLOAT DEFAULT 0,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 13. Sécurité, RBAC et indexation de production
-- Supabase expose le schéma public via l'API: RLS doit être activé partout.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.current_profile_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION app_private.current_profile_type()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT type FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin OR role IN ('CEO', 'COO', 'ADMIN') FROM profiles WHERE id = auth.uid()),
    FALSE
  )
$$;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_vesting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_self_or_admin" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR app_private.is_admin());

CREATE POLICY "profiles_update_self_limited_or_admin" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR app_private.is_admin())
  WITH CHECK (id = auth.uid() OR app_private.is_admin());

CREATE POLICY "hr_records_select_owner_or_ops" ON hr_records
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR app_private.is_admin());

CREATE POLICY "hr_records_write_ops" ON hr_records
  FOR ALL TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

CREATE POLICY "leads_select_sales_or_assignee" ON leads
  FOR SELECT TO authenticated
  USING (
    app_private.current_profile_role() IN ('CEO', 'COO', 'SALES', 'ADMIN')
    OR assigned_to = auth.uid()
  );

CREATE POLICY "leads_insert_sales" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'SALES', 'ADMIN'));

CREATE POLICY "leads_update_sales_or_assignee" ON leads
  FOR UPDATE TO authenticated
  USING (
    app_private.current_profile_role() IN ('CEO', 'COO', 'SALES', 'ADMIN')
    OR assigned_to = auth.uid()
  )
  WITH CHECK (
    app_private.current_profile_role() IN ('CEO', 'COO', 'SALES', 'ADMIN')
    OR assigned_to = auth.uid()
  );

CREATE POLICY "projects_select_associates_or_task_members" ON projects
  FOR SELECT TO authenticated
  USING (
    app_private.current_profile_type() = 'ASSOCIATE'
    OR EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.project_id = projects.id
      AND tasks.assigned_to = auth.uid()
    )
  );

CREATE POLICY "projects_write_delivery_leads" ON projects
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'CTO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'CTO', 'ADMIN'));

CREATE POLICY "project_contracts_select_associates" ON project_contracts
  FOR SELECT TO authenticated
  USING (app_private.current_profile_type() = 'ASSOCIATE' OR app_private.is_admin());

CREATE POLICY "project_contracts_write_founders" ON project_contracts
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "project_billing_select_associates" ON project_billing
  FOR SELECT TO authenticated
  USING (app_private.current_profile_type() = 'ASSOCIATE' OR app_private.is_admin());

CREATE POLICY "project_billing_write_founders" ON project_billing
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "tasks_select_assigned_or_ops" ON tasks
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid()
    OR app_private.current_profile_type() = 'ASSOCIATE'
  );

CREATE POLICY "tasks_insert_ops" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (app_private.current_profile_type() = 'ASSOCIATE');

CREATE POLICY "tasks_update_assigned_or_ops" ON tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR app_private.current_profile_type() = 'ASSOCIATE')
  WITH CHECK (assigned_to = auth.uid() OR app_private.current_profile_type() = 'ASSOCIATE');

CREATE POLICY "treasury_select_founders" ON treasury_logs
  FOR SELECT TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "treasury_write_founders" ON treasury_logs
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "partnerships_select_associates" ON partnerships
  FOR SELECT TO authenticated
  USING (app_private.current_profile_type() = 'ASSOCIATE');

CREATE POLICY "partnerships_write_founders" ON partnerships
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "knowledge_select_by_role" ON knowledge_articles
  FOR SELECT TO authenticated
  USING (
    target_role IS NULL
    OR target_role = app_private.current_profile_role()
    OR app_private.is_admin()
  );

CREATE POLICY "knowledge_write_admin" ON knowledge_articles
  FOR ALL TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

CREATE POLICY "equity_select_owner_or_founders" ON equity_vesting_logs
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN')
  );

CREATE POLICY "equity_write_founders" ON equity_vesting_logs
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE POLICY "ai_audits_select_project_authorized" ON ai_audits
  FOR SELECT TO authenticated
  USING (
    app_private.current_profile_type() = 'ASSOCIATE'
    OR EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.project_id = ai_audits.project_id
      AND tasks.assigned_to = auth.uid()
    )
  );

CREATE POLICY "ai_audits_write_sales_delivery" ON ai_audits
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'CTO', 'SALES', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'CTO', 'SALES', 'ADMIN'));

CREATE POLICY "task_comments_select_task_authorized" ON task_comments
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND (tasks.assigned_to = auth.uid() OR app_private.current_profile_type() = 'ASSOCIATE')
    )
  );

CREATE POLICY "task_comments_insert_task_authorized" ON task_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND (tasks.assigned_to = auth.uid() OR app_private.current_profile_type() = 'ASSOCIATE')
    )
  );

CREATE POLICY "ideas_select_authenticated" ON ideas
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "ideas_insert_self" ON ideas
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "ideas_update_owner_or_admin" ON ideas
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR app_private.is_admin())
  WITH CHECK (profile_id = auth.uid() OR app_private.is_admin());

CREATE POLICY "global_documents_select_visible" ON global_documents
  FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR app_private.is_admin()
    OR app_private.current_profile_role() = ANY(visible_to_roles)
    OR app_private.current_profile_type() = ANY(visible_to_types)
  );

CREATE POLICY "global_documents_write_admin" ON global_documents
  FOR ALL TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

CREATE POLICY "invitations_admin_only" ON invitations
  FOR ALL TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

CREATE INDEX idx_profiles_role_type ON profiles(role, type);
CREATE INDEX idx_leads_status_assigned_created ON leads(status, assigned_to, created_at DESC);
CREATE INDEX idx_projects_branch_status_due ON projects(branch, status, due_date);
CREATE INDEX idx_project_contracts_project_signed ON project_contracts(project_id, signed_at DESC);
CREATE INDEX idx_project_billing_project_due ON project_billing(project_id, due_date DESC);
CREATE INDEX idx_tasks_assigned_status_due ON tasks(assigned_to, status, due_date);
CREATE INDEX idx_treasury_logs_date_type ON treasury_logs(date DESC, type);
CREATE INDEX idx_hr_records_profile_created ON hr_records(profile_id, created_at DESC);
CREATE INDEX idx_equity_vesting_profile_month ON equity_vesting_logs(profile_id, month DESC);
CREATE INDEX idx_task_comments_task_created ON task_comments(task_id, created_at DESC);
CREATE INDEX idx_knowledge_articles_target_role ON knowledge_articles(target_role, category);

-- 14. Compléments production: tables utilisées par l'application, RAG classé et indexes
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE project_billing
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE knowledge_articles
  ADD COLUMN IF NOT EXISTS source_path TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS content_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(category::text, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'C')
  ) STORED;

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('TASK_ASSIGNED', 'TASK_UPDATED', 'LEAD_NEW', 'PROJECT_NEW', 'COMMENT', 'SYSTEM')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  href TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roi_simulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  sector TEXT,
  salary_monthly NUMERIC,
  hours_lost_weekly NUMERIC,
  deal_value NUMERIC,
  deals_lost_monthly NUMERIC,
  total_leak_annual NUMERIC,
  net_gain_annual NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS associate_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  type TEXT DEFAULT 'LEGAL',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equity_distribution (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  equity_percentage NUMERIC(6, 3) NOT NULL CHECK (equity_percentage >= 0 AND equity_percentage <= 100),
  vesting_start_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE associate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select_authorized" ON activity_log
  FOR SELECT TO authenticated
  USING (
    app_private.current_profile_type() = 'ASSOCIATE'
    OR actor_id = auth.uid()
    OR details->>'assigned_to' = auth.uid()::text
  );

CREATE POLICY "activity_log_insert_self" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "notifications_insert_self_or_admin" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR app_private.is_admin());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "roi_simulations_select_owner_or_admin" ON roi_simulations
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR app_private.is_admin());

CREATE POLICY "roi_simulations_insert_self" ON roi_simulations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "associate_documents_select_owner_or_admin" ON associate_documents
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR app_private.is_admin());

CREATE POLICY "associate_documents_write_admin" ON associate_documents
  FOR ALL TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

CREATE POLICY "equity_distribution_select_owner_or_founders" ON equity_distribution
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN')
  );

CREATE POLICY "equity_distribution_write_founders" ON equity_distribution
  FOR ALL TO authenticated
  USING (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'))
  WITH CHECK (app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN'));

CREATE OR REPLACE FUNCTION public.search_knowledge_articles(
  search_query TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  title TEXT,
  content TEXT,
  category TEXT,
  target_role TEXT,
  rank REAL
)
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  WITH query AS (
    SELECT plainto_tsquery('french', search_query) AS q
  )
  SELECT
    article.title,
    left(article.content, 2400) AS content,
    article.category::text,
    article.target_role,
    (
      ts_rank_cd(article.search_vector, query.q)
      + similarity(article.title, search_query) * 0.35
      + similarity(left(article.content, 600), search_query) * 0.15
    )::real AS rank
  FROM knowledge_articles article, query
  WHERE
    article.search_vector @@ query.q
    OR article.title % search_query
    OR left(article.content, 600) % search_query
  ORDER BY rank DESC, article.updated_at DESC
  LIMIT LEAST(GREATEST(match_count, 1), 10);
$$;

CREATE OR REPLACE FUNCTION public.match_knowledge_articles_vector(
  query_embedding vector(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  title TEXT,
  content TEXT,
  category TEXT,
  target_role TEXT,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT
    title,
    left(content, 2400) AS content,
    category::text,
    target_role,
    1 - (content_embedding <=> query_embedding) AS similarity
  FROM knowledge_articles
  WHERE content_embedding IS NOT NULL
  ORDER BY content_embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 10);
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_permissions_gin ON profiles USING GIN (permissions);
CREATE INDEX IF NOT EXISTS idx_projects_created_updated ON projects(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_billing_status_updated ON project_billing(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_updated ON tasks(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_created ON activity_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read ON notifications(profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equity_distribution_profile ON equity_distribution(profile_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_search_vector ON knowledge_articles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_title_trgm ON knowledge_articles USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_content_embedding ON knowledge_articles USING hnsw (content_embedding vector_cosine_ops);
