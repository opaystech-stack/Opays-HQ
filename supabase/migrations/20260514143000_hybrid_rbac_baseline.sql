-- ============================================================
-- Hybrid RBAC baseline restore
-- Date: 14 mai 2026
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT lower(COALESCE(email, '')) IN ('lamsasfenelon@gmail.com', 'ceo@opays.tech')
        OR is_admin = TRUE
      FROM profiles
      WHERE id = auth.uid()
    ),
    FALSE
  )
$$;

CREATE OR REPLACE FUNCTION app_private.has_permission(module_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN lower(COALESCE(email, '')) IN ('lamsasfenelon@gmail.com', 'ceo@opays.tech')
          OR is_admin = TRUE THEN TRUE
        WHEN COALESCE(permissions, '{}'::jsonb) ? module_id
          THEN (permissions ->> module_id)::BOOLEAN
        WHEN role = 'SALES'
          AND module_id IN ('leads', 'studio', 'coordination') THEN TRUE
        WHEN role = 'CTO'
          AND module_id IN ('labs', 'workspace', 'projects') THEN TRUE
        WHEN role = 'COO'
          AND module_id = 'coordination' THEN TRUE
        ELSE FALSE
      END
      FROM profiles
      WHERE id = auth.uid()
    ),
    FALSE
  )
$$;

CREATE OR REPLACE FUNCTION public.enforce_single_ceo_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) IN ('lamsasfenelon@gmail.com', 'ceo@opays.tech') THEN
    NEW.is_admin := TRUE;
  ELSE
    NEW.is_admin := COALESCE(NEW.is_admin, FALSE);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_initial_ceo_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'zamwanapatricia@gmail.com' THEN
    UPDATE profiles
    SET permissions = '{"treasury": true}'::jsonb,
        is_admin = FALSE
    WHERE id = NEW.id;
  ELSIF lower(NEW.email) = 'zainagodlive28@gmail.com' THEN
    UPDATE profiles
    SET permissions = '{"brand": true}'::jsonb,
        is_admin = FALSE
    WHERE id = NEW.id;
  ELSIF lower(NEW.email) = 'princebagheni@gmail.com' THEN
    UPDATE profiles
    SET permissions = '{"coordination": true}'::jsonb,
        is_admin = FALSE
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

UPDATE profiles
SET full_name = COALESCE(NULLIF(full_name, ''), 'Fenelon Lamsasiri'),
    role = 'CEO',
    type = 'ASSOCIATE',
    is_admin = TRUE,
    permissions = '{}'::jsonb,
    updated_at = NOW()
WHERE lower(email) IN ('lamsasfenelon@gmail.com', 'ceo@opays.tech');

UPDATE profiles
SET role = 'SALES',
    type = 'ASSOCIATE',
    is_admin = FALSE,
    permissions = '{"treasury": true}'::jsonb,
    updated_at = NOW()
WHERE lower(email) = 'zamwanapatricia@gmail.com';

UPDATE profiles
SET role = 'SALES',
    type = 'ASSOCIATE',
    is_admin = FALSE,
    permissions = '{"brand": true}'::jsonb,
    updated_at = NOW()
WHERE lower(email) = 'zainagodlive28@gmail.com';

UPDATE profiles
SET role = 'COO',
    type = 'ASSOCIATE',
    is_admin = FALSE,
    permissions = '{"coordination": true}'::jsonb,
    updated_at = NOW()
WHERE lower(email) = 'princebagheni@gmail.com';

-- Brand Assets reste un accès nominatif: Zaina et Fenelon seulement par défaut.
UPDATE profiles
SET permissions = COALESCE(permissions, '{}'::jsonb) - 'brand',
    updated_at = NOW()
WHERE lower(COALESCE(email, '')) NOT IN (
  'zainagodlive28@gmail.com',
  'lamsasfenelon@gmail.com',
  'ceo@opays.tech'
);

COMMIT;
