-- ============================================================
-- NETTOYAGE : Suppression des faux comptes de test
-- et invitation de Patricia Zamwana & Zaina Godlive
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- 1. SUPPRIMER LES FAUX COMPTES (profils de test @opays.tech)
-- ============================================================

DELETE FROM profiles
WHERE email IN (
  'employee@opays.tech',
  'engineer@opays.tech',
  'sales@opays.tech',
  'ceo@opays.tech',
  'coo@opays.tech',
  'admin@opays.tech',
  'associate@opays.tech'
)
-- Ne supprimer QUE si ce n'est pas un vrai utilisateur auth
AND id NOT IN (SELECT id FROM auth.users);

-- Supprimer aussi tout profil sans correspondance auth.users
-- ET qui n'est pas un des 5 vrais membres
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users)
  AND email NOT IN (
    'lamsasfenelon@gmail.com',
    'evansselemani@gmail.com',
    'princebagheni@gmail.com',
    'zamwanapatricia@gmail.com',
    'zainagodlive28@gmail.com'
  );

-- ============================================================
-- 2. CORRIGER LES NOMS INCOMPLETS DES MEMBRES RÉELS
-- ============================================================

UPDATE profiles SET full_name = 'Fenelon Lamsasiri'
WHERE email = 'lamsasfenelon@gmail.com' AND (full_name IS NULL OR full_name = '' OR full_name = 'lamsasfenelon@gmail.com');

UPDATE profiles SET full_name = 'Evans Selemani'
WHERE email = 'evansselemani@gmail.com' AND (full_name IS NULL OR full_name = '' OR full_name = 'Evans' OR full_name = 'evansselemani@gmail.com');

UPDATE profiles SET full_name = 'Prince Bagheni'
WHERE email = 'princebagheni@gmail.com' AND (full_name IS NULL OR full_name = '' OR full_name = 'Prince' OR full_name = 'princebagheni@gmail.com');

-- ============================================================
-- 3. CRÉER LES INVITATIONS POUR PATRICIA ET ZAINA
-- (elles pourront se connecter via Magic Link et leur profil
--  sera automatiquement créé par le trigger handle_new_user)
-- ============================================================

-- Patricia Zamwana
INSERT INTO invitations (email, full_name, role, type, token, equity_granted, expires_at)
VALUES (
  'zamwanapatricia@gmail.com',
  'Patricia Zamwana',
  'SALES',
  'ASSOCIATE',
  gen_random_uuid()::text,
  8.0,
  NOW() + INTERVAL '90 days'
)
ON CONFLICT DO NOTHING;

-- Zaina Godlive
INSERT INTO invitations (email, full_name, role, type, token, equity_granted, expires_at)
VALUES (
  'zainagodlive28@gmail.com',
  'Zaina Godlive',
  'SALES',
  'ASSOCIATE',
  gen_random_uuid()::text,
  8.0,
  NOW() + INTERVAL '90 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. VÉRIFICATION : afficher l'état actuel
-- ============================================================

-- Profils restants
SELECT id, full_name, email, role, type, is_admin,
  CASE WHEN id IN (SELECT id FROM auth.users) THEN '✅ Auth OK' ELSE '⚠️ Orphelin' END AS auth_status
FROM profiles
ORDER BY full_name;

-- Invitations en cours
SELECT email, full_name, role, type,
  CASE WHEN accepted_at IS NOT NULL THEN '✅ Acceptée'
       WHEN expires_at < NOW() THEN '❌ Expirée'
       ELSE '⏳ En attente'
  END AS status
FROM invitations
ORDER BY created_at DESC;

COMMIT;
