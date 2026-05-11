-- OPAYS HQ hardening migration
-- Applies the governance, RBAC, and scaling changes used by the current app.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('ASSOCIATE', 'EMPLOYEE')) DEFAULT 'ASSOCIATE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equity_percent FLOAT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_amount FLOAT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vesting_start_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

ALTER TABLE leads ADD COLUMN IF NOT EXISTS sla_qualification_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS audit_owner_id UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS audit_deadline DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS confidence_level FLOAT DEFAULT 0.8;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS gross_margin_projected FLOAT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gross_margin_real FLOAT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_maintenance_active BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS maintenance_plan TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS definition_of_done TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_feedback TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS branch TEXT CHECK (branch IN ('STUDIO', 'LABS')) DEFAULT 'STUDIO';
ALTER TABLE projects DROP COLUMN IF EXISTS contract_url;
ALTER TABLE projects DROP COLUMN IF EXISTS billing_status;

CREATE TABLE IF NOT EXISTS project_contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version TEXT DEFAULT '1.0'
);

CREATE TABLE IF NOT EXISTS project_billing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount_total FLOAT NOT NULL,
  amount_paid FLOAT DEFAULT 0,
  status TEXT CHECK (status IN ('PENDING', 'PARTIAL', 'PAID')) DEFAULT 'PENDING',
  due_date DATE,
  invoice_url TEXT
);

ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS salary_loaded_monthly FLOAT;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS productive_hours_monthly FLOAT DEFAULT 140;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS rework_cost_monthly FLOAT DEFAULT 0;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS opays_maintenance_monthly FLOAT DEFAULT 600;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS initial_setup_cost FLOAT DEFAULT 0;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS confidence_level FLOAT DEFAULT 0.8;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS gain_net_annual FLOAT;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS payback_months FLOAT;
ALTER TABLE ai_audits ADD COLUMN IF NOT EXISTS multiple_roi FLOAT;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
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

ALTER TABLE invitations ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('ASSOCIATE', 'EMPLOYEE'));
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS equity_granted FLOAT DEFAULT 0;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS salary_granted FLOAT DEFAULT 0;

DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self_limited_or_admin" ON profiles;
DROP POLICY IF EXISTS "hr_records_select_owner_or_ops" ON hr_records;
DROP POLICY IF EXISTS "hr_records_write_ops" ON hr_records;
DROP POLICY IF EXISTS "leads_select_sales_or_assignee" ON leads;
DROP POLICY IF EXISTS "leads_insert_sales" ON leads;
DROP POLICY IF EXISTS "leads_update_sales_or_assignee" ON leads;
DROP POLICY IF EXISTS "projects_select_associates_or_task_members" ON projects;
DROP POLICY IF EXISTS "projects_write_delivery_leads" ON projects;
DROP POLICY IF EXISTS "project_contracts_select_associates" ON project_contracts;
DROP POLICY IF EXISTS "project_contracts_write_founders" ON project_contracts;
DROP POLICY IF EXISTS "project_billing_select_associates" ON project_billing;
DROP POLICY IF EXISTS "project_billing_write_founders" ON project_billing;
DROP POLICY IF EXISTS "tasks_select_assigned_or_ops" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_ops" ON tasks;
DROP POLICY IF EXISTS "tasks_update_assigned_or_ops" ON tasks;
DROP POLICY IF EXISTS "treasury_select_founders" ON treasury_logs;
DROP POLICY IF EXISTS "treasury_write_founders" ON treasury_logs;
DROP POLICY IF EXISTS "partnerships_select_associates" ON partnerships;
DROP POLICY IF EXISTS "partnerships_write_founders" ON partnerships;
DROP POLICY IF EXISTS "knowledge_select_by_role" ON knowledge_articles;
DROP POLICY IF EXISTS "knowledge_write_admin" ON knowledge_articles;
DROP POLICY IF EXISTS "equity_select_owner_or_founders" ON equity_vesting_logs;
DROP POLICY IF EXISTS "equity_write_founders" ON equity_vesting_logs;
DROP POLICY IF EXISTS "ai_audits_select_project_authorized" ON ai_audits;
DROP POLICY IF EXISTS "ai_audits_write_sales_delivery" ON ai_audits;
DROP POLICY IF EXISTS "task_comments_select_task_authorized" ON task_comments;
DROP POLICY IF EXISTS "task_comments_insert_task_authorized" ON task_comments;
DROP POLICY IF EXISTS "ideas_select_authenticated" ON ideas;
DROP POLICY IF EXISTS "ideas_insert_self" ON ideas;
DROP POLICY IF EXISTS "ideas_update_owner_or_admin" ON ideas;
DROP POLICY IF EXISTS "global_documents_select_visible" ON global_documents;
DROP POLICY IF EXISTS "global_documents_write_admin" ON global_documents;
DROP POLICY IF EXISTS "invitations_admin_only" ON invitations;

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

CREATE INDEX IF NOT EXISTS idx_profiles_role_type ON profiles(role, type);
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned_created ON leads(status, assigned_to, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_branch_status_due ON projects(branch, status, due_date);
CREATE INDEX IF NOT EXISTS idx_project_contracts_project_signed ON project_contracts(project_id, signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_billing_project_due ON project_billing(project_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status_due ON tasks(assigned_to, status, due_date);
CREATE INDEX IF NOT EXISTS idx_treasury_logs_date_type ON treasury_logs(date DESC, type);
CREATE INDEX IF NOT EXISTS idx_hr_records_profile_created ON hr_records(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equity_vesting_profile_month ON equity_vesting_logs(profile_id, month DESC);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_created ON task_comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_target_role ON knowledge_articles(target_role, category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO authenticated;
