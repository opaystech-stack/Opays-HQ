-- RBAC validation queries for OPAYS HQ
-- Assumes 00_seed_rbac_minimal.sql has already been applied.
-- Each block runs in its own transaction and fails fast if access is wrong.

-- Helper pattern:
-- 1. set the JWT claim sub to the user id
-- 2. set the session role to authenticated
-- 3. run the query / assertion
-- 4. rollback so the validation never changes data

-- CEO can see everything financial and operational
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  visible_count int;
BEGIN
  SELECT count(*) INTO visible_count FROM treasury_logs;
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'CEO should see treasury_logs';
  END IF;

  SELECT count(*) INTO visible_count FROM project_billing;
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'CEO should see project_billing';
  END IF;
END $$;
ROLLBACK;

-- Sales can see assigned leads and insert a new lead
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  lead_count int;
BEGIN
  SELECT count(*) INTO lead_count FROM leads WHERE assigned_to = auth.uid();
  IF lead_count = 0 THEN
    RAISE EXCEPTION 'Sales should see their assigned leads';
  END IF;

  BEGIN
    INSERT INTO leads (company_name, status, potential_value, assigned_to, sla_qualification_deadline, audit_deadline, confidence_level)
    VALUES ('Validation Lead', 'NEW', 12000, auth.uid(), NOW() + INTERVAL '24 hours', CURRENT_DATE + INTERVAL '2 days', 0.8);
    lead_count := 1;
  EXCEPTION
    WHEN OTHERS THEN
      lead_count := 0;
  END;

  IF lead_count <> 1 THEN
    RAISE EXCEPTION 'Sales insert did not create exactly one lead';
  END IF;
END $$;
ROLLBACK;

-- Engineer cannot touch leads or treasury
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  visible_count int;
  affected_count int := 0;
BEGIN
  SELECT count(*) INTO visible_count FROM treasury_logs;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Engineer must not see treasury_logs';
  END IF;

  BEGIN
    INSERT INTO leads (company_name, status, potential_value, assigned_to, sla_qualification_deadline, audit_deadline, confidence_level)
    VALUES ('Forbidden Lead', 'NEW', 1000, auth.uid(), NOW() + INTERVAL '24 hours', CURRENT_DATE + INTERVAL '2 days', 0.8);
    affected_count := 1;
  EXCEPTION
    WHEN OTHERS THEN
      affected_count := 0;
  END;
  IF affected_count > 0 THEN
    RAISE EXCEPTION 'Engineer should not be able to insert leads';
  END IF;
END $$;
ROLLBACK;

-- Employee can see their own HR record and assigned task, but not billing or treasury
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  visible_count int;
BEGIN
  SELECT count(*) INTO visible_count FROM hr_records WHERE profile_id = auth.uid();
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Employee should see their own hr_records';
  END IF;

  SELECT count(*) INTO visible_count FROM tasks WHERE assigned_to = auth.uid();
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Employee should see assigned tasks';
  END IF;

  SELECT count(*) INTO visible_count FROM project_billing;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Employee must not see project_billing';
  END IF;
END $$;
ROLLBACK;

-- Associate can see contracts, billing, project data, and equity
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  visible_count int;
BEGIN
  SELECT count(*) INTO visible_count FROM project_contracts;
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Associate should see project_contracts';
  END IF;

  SELECT count(*) INTO visible_count FROM project_billing;
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Associate should see project_billing';
  END IF;

  SELECT count(*) INTO visible_count FROM equity_vesting_logs WHERE profile_id = auth.uid();
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Associate should see own equity_vesting_logs';
  END IF;
END $$;
ROLLBACK;

-- Admin can read invitations and all profiles
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
DECLARE
  visible_count int;
BEGIN
  SELECT count(*) INTO visible_count FROM invitations;
  IF visible_count = 0 THEN
    RAISE EXCEPTION 'Admin should see invitations';
  END IF;

  SELECT count(*) INTO visible_count FROM profiles;
  IF visible_count < 7 THEN
    RAISE EXCEPTION 'Admin should see all seeded profiles';
  END IF;
END $$;
ROLLBACK;
