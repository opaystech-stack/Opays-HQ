-- ============================================================
-- AI/RAG, RBAC and performance hardening (13 mai 2026)
-- ============================================================

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
ALTER TABLE equity_distribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_self_or_admin" ON notifications;
CREATE POLICY "notifications_insert_self_or_admin" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS "activity_log_select_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_select_authorized" ON activity_log;
CREATE POLICY "activity_log_select_authorized" ON activity_log
  FOR SELECT TO authenticated
  USING (
    app_private.current_profile_type() = 'ASSOCIATE'
    OR actor_id = auth.uid()
    OR details->>'assigned_to' = auth.uid()::text
  );

DROP POLICY IF EXISTS "activity_log_insert_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_insert_self" ON activity_log;
CREATE POLICY "activity_log_insert_self" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "equity_distribution_select_owner_or_founders" ON equity_distribution;
CREATE POLICY "equity_distribution_select_owner_or_founders" ON equity_distribution
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR app_private.current_profile_role() IN ('CEO', 'COO', 'ADMIN')
  );

DROP POLICY IF EXISTS "equity_distribution_write_founders" ON equity_distribution;
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_billing_updated_at') THEN
    CREATE TRIGGER trg_project_billing_updated_at
      BEFORE UPDATE ON project_billing
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_equity_distribution_updated_at') THEN
    CREATE TRIGGER trg_equity_distribution_updated_at
      BEFORE UPDATE ON equity_distribution
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_permissions_gin ON profiles USING GIN (permissions);
CREATE INDEX IF NOT EXISTS idx_projects_created_updated ON projects(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_billing_status_updated ON project_billing(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_updated ON tasks(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_created ON activity_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read ON notifications(profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equity_distribution_profile ON equity_distribution(profile_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_search_vector ON knowledge_articles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_title_trgm ON knowledge_articles USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_content_embedding ON knowledge_articles USING hnsw (content_embedding vector_cosine_ops);
