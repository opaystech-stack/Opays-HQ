-- Ensure auth user onboarding creates valid OPAYS profiles.
-- This mirrors the live fix applied to the Supabase dashboard project.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_email text := lower(new.email);
  user_role text;
  user_type text;
  user_is_admin boolean;
  user_equity float;
  user_salary float;
  user_vesting date;
BEGIN
  user_role := CASE user_email
    WHEN 'ceo@opays.tech' THEN 'CEO'
    WHEN 'coo@opays.tech' THEN 'COO'
    WHEN 'admin@opays.tech' THEN 'ADMIN'
    WHEN 'sales@opays.tech' THEN 'SALES'
    WHEN 'engineer@opays.tech' THEN 'ENGINEER'
    WHEN 'associate@opays.tech' THEN 'CTO'
    WHEN 'employee@opays.tech' THEN 'ENGINEER'
    ELSE 'ENGINEER'
  END;

  user_type := CASE user_email
    WHEN 'engineer@opays.tech' THEN 'EMPLOYEE'
    WHEN 'employee@opays.tech' THEN 'EMPLOYEE'
    ELSE 'ASSOCIATE'
  END;

  user_is_admin := user_email IN ('ceo@opays.tech', 'coo@opays.tech', 'admin@opays.tech');
  user_equity := CASE user_email
    WHEN 'ceo@opays.tech' THEN 22.0
    WHEN 'coo@opays.tech' THEN 12.0
    WHEN 'admin@opays.tech' THEN 0.0
    WHEN 'sales@opays.tech' THEN 8.0
    WHEN 'engineer@opays.tech' THEN 0.0
    WHEN 'associate@opays.tech' THEN 18.0
    WHEN 'employee@opays.tech' THEN 0.0
    ELSE 0.0
  END;
  user_salary := CASE user_email
    WHEN 'engineer@opays.tech' THEN 3200.0
    WHEN 'employee@opays.tech' THEN 2400.0
    ELSE 0.0
  END;
  user_vesting := CASE user_email
    WHEN 'ceo@opays.tech' THEN CURRENT_DATE - INTERVAL '400 days'
    WHEN 'coo@opays.tech' THEN CURRENT_DATE - INTERVAL '300 days'
    WHEN 'admin@opays.tech' THEN CURRENT_DATE - INTERVAL '200 days'
    WHEN 'sales@opays.tech' THEN CURRENT_DATE - INTERVAL '180 days'
    WHEN 'engineer@opays.tech' THEN CURRENT_DATE - INTERVAL '120 days'
    WHEN 'associate@opays.tech' THEN CURRENT_DATE - INTERVAL '260 days'
    WHEN 'employee@opays.tech' THEN CURRENT_DATE - INTERVAL '90 days'
    ELSE CURRENT_DATE
  END;

  INSERT INTO public.profiles (
    id, full_name, email, type, role, is_admin, equity_percent, salary_amount, vesting_start_date
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    user_type,
    user_role,
    user_is_admin,
    user_equity,
    user_salary,
    user_vesting
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    type = EXCLUDED.type,
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin,
    equity_percent = EXCLUDED.equity_percent,
    salary_amount = EXCLUDED.salary_amount,
    vesting_start_date = EXCLUDED.vesting_start_date;

  RETURN new;
END;
$function$;
