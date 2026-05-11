-- Minimal RBAC seed for OPAYS HQ
-- Purpose: create a small, linked dataset to validate RLS and role boundaries.
-- Run in Supabase SQL editor with elevated privileges.

BEGIN;

DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);
DELETE FROM invitations WHERE email = 'new-engineer@opays.tech';
DELETE FROM global_documents WHERE url IN (
  'https://files.opays.tech/docs/strategy-memo.pdf',
  'https://files.opays.tech/docs/engineer-handbook.pdf'
);
DELETE FROM ideas WHERE profile_id IN (
  '44444444-4444-4444-4444-444444444444',
  '66666666-6666-6666-6666-666666666666'
);
DELETE FROM treasury_logs WHERE description IN ('Initial setup payment', 'Supabase + hosting');
DELETE FROM knowledge_articles WHERE title IN (
  'Sales qualification playbook',
  'Engineering delivery standard',
  'Company vision'
);
DELETE FROM equity_vesting_logs WHERE profile_id IN (
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM hr_records WHERE profile_id IN (
  '77777777-7777-7777-7777-777777777777',
  '55555555-5555-5555-5555-555555555555'
);
DELETE FROM task_comments WHERE task_id IN (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
);
DELETE FROM tasks WHERE id IN (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff'
);
DELETE FROM project_billing WHERE project_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM project_contracts WHERE project_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM projects WHERE id = '99999999-9999-9999-9999-999999999999';
DELETE FROM leads WHERE id = '88888888-8888-8888-8888-888888888888';
DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);

-- Auth identities required by the profiles foreign key.
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  is_anonymous,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'ceo@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"ceo@opays.tech","full_name":"CEO OPAYS"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'coo@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"coo@opays.tech","full_name":"COO OPAYS"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'admin@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"admin@opays.tech","full_name":"Admin OPAYS"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'sales@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"sales@opays.tech","full_name":"Sales OPAYS"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'engineer@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"engineer@opays.tech","full_name":"Engineer OPAYS"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'associate@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"associate@opays.tech","full_name":"Associate CTO"}', FALSE, FALSE, NOW(), NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'employee@opays.tech', '{"provider":"email","providers":["email"]}', '{"email":"employee@opays.tech","full_name":"Employee Ops"}', FALSE, FALSE, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lead and project chain
INSERT INTO leads (
  id, company_name, contact_name, email, phone, status, potential_value, assigned_to,
  sla_qualification_deadline, audit_owner_id, audit_deadline, confidence_level
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  'Acme Mining',
  'M. Diallo',
  'ops@acme-mining.test',
  '+243000000001',
  'AUDIT_PENDING',
  48000,
  '44444444-4444-4444-4444-444444444444',
  NOW() + INTERVAL '18 hours',
  '66666666-6666-6666-6666-666666666666',
  CURRENT_DATE + INTERVAL '3 days',
  0.82
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (
  id, lead_id, title, description, branch, status, tech_stack, due_date,
  gross_margin_projected, gross_margin_real, is_maintenance_active, maintenance_plan, definition_of_done
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  '88888888-8888-8888-8888-888888888888',
  'Acme Mining Ops OS',
  'Automation de la qualification et du reporting.',
  'STUDIO',
  'IN_PROGRESS',
  ARRAY['Next.js', 'Supabase', 'RBAC'],
  CURRENT_DATE + INTERVAL '21 days',
  24000,
  19500,
  TRUE,
  'Support mensuel, monitoring, reprise d incidents.',
  ARRAY['Contract signed', 'Billing created', 'DoD validated', 'Client sign-off']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_contracts (project_id, url, signed_at, version)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'https://files.opays.tech/contracts/acme-mining-v1.pdf',
  NOW() - INTERVAL '2 days',
  '1.0'
)
ON CONFLICT DO NOTHING;

INSERT INTO project_billing (project_id, amount_total, amount_paid, status, due_date, invoice_url)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  30000,
  12000,
  'PARTIAL',
  CURRENT_DATE + INTERVAL '10 days',
  'https://files.opays.tech/invoices/acme-mining-001.pdf'
)
ON CONFLICT DO NOTHING;

-- Tasks and comments
INSERT INTO tasks (id, project_id, assigned_to, title, description, priority, status, due_date)
VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'Build audit dashboard', 'Implement KPI surfaces', 'HIGH', 'DOING', CURRENT_DATE + INTERVAL '5 days'),
  ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'Prepare client docs', 'Compile docs for delivery', 'MEDIUM', 'TODO', CURRENT_DATE + INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_comments (task_id, profile_id, content)
VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'First implementation pass is ready.')
ON CONFLICT DO NOTHING;

-- HR, equity, knowledge, treasury, documents, ideas
INSERT INTO hr_records (profile_id, document_url, performance_score, review_notes)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'https://files.opays.tech/hr/payroll-employee-001.pdf', 86, 'Stable contributor.'),
  ('55555555-5555-5555-5555-555555555555', 'https://files.opays.tech/hr/payroll-engineer-001.pdf', 91, 'Strong delivery quality.')
ON CONFLICT DO NOTHING;

INSERT INTO equity_vesting_logs (profile_id, shares_unlocked, contribution_notes, month)
VALUES
  ('66666666-6666-6666-6666-666666666666', 0.75, 'CTO milestone delivered', date_trunc('month', CURRENT_DATE)),
  ('44444444-4444-4444-4444-444444444444', 0.25, 'First qualified lead converted', date_trunc('month', CURRENT_DATE))
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_articles (title, content, target_role, category)
VALUES
  ('Sales qualification playbook', '## Checklist\n- qualify\n- quantify\n- close', 'SALES', 'METHOD'),
  ('Engineering delivery standard', '## Engineering standard\n- ship small\n- document change', 'ENGINEER', 'GUIDE'),
  ('Company vision', 'OPAYS keeps work fluent and measurable.', NULL, 'VISION')
ON CONFLICT DO NOTHING;

INSERT INTO treasury_logs (type, category, amount, description, created_by)
VALUES
  ('INCOME', 'CLIENT', 30000, 'Initial setup payment', '11111111-1111-1111-1111-111111111111'),
  ('EXPENSE', 'SaaS', 180, 'Supabase + hosting', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

INSERT INTO global_documents (title, url, category, visible_to_roles, visible_to_types, uploaded_by)
VALUES
  ('CEO Strategy Memo', 'https://files.opays.tech/docs/strategy-memo.pdf', 'VISION', ARRAY['CEO', 'COO'], ARRAY['ASSOCIATE'], '11111111-1111-1111-1111-111111111111'),
  ('Engineer Handbook', 'https://files.opays.tech/docs/engineer-handbook.pdf', 'TECH', ARRAY['CTO', 'ENGINEER'], ARRAY['EMPLOYEE'], '66666666-6666-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

INSERT INTO ideas (profile_id, title, description, category, votes, status)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Auto lead routing', 'Route leads by sector and urgency.', 'SALES', 7, 'REVIEWED'),
  ('66666666-6666-6666-6666-666666666666', 'Ops telemetry layer', 'Add delivery and margin telemetry.', 'TECH', 4, 'PENDING')
ON CONFLICT DO NOTHING;

INSERT INTO invitations (email, role, type, token, equity_granted, salary_granted, invited_by)
VALUES
  ('new-engineer@opays.tech', 'ENGINEER', 'EMPLOYEE', 'invite-engineer-token', 0, 2800, '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

COMMIT;
