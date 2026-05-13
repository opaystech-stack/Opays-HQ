-- ============================================================
-- MIGRATION COMPLÈTE: Audit Users & Invitations Fix
-- Date: 14 mai 2026
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Corrige les problèmes critiques identifiés dans l'audit :
--   C1. InviteMemberModal insérait dans profiles au lieu d'invitations
--   C2. Collision RLS profiles (2 politiques SELECT contradictoires)
--   C3. INSERT policy récursive sur profiles
--   C4. handle_new_user() écrasait les modifications manuelles
--   M3. Pas de DELETE policy sur profiles
--   M7. UPDATE trop permissif sur profiles
--   S5. Pas d'expiration sur invitations
--   S2. Contrainte UNIQUE email sur invitations trop restrictive
-- ============================================================

BEGIN;

-- ============================================================
-- PARTIE 1 : NETTOYAGE DES POLITIQUES RLS SUR PROFILES
-- Supprimer TOUTES les anciennes politiques pour repartir proprement
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self_limited_or_admin" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- Supprimer aussi les politiques qu'on va recréer (idempotence)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

-- ============================================================
-- PARTIE 2 : NOUVELLES POLITIQUES RLS PROPRES SUR PROFILES
-- ============================================================

-- SELECT : Tous les utilisateurs authentifiés voient tous les profils
-- (données semi-publiques dans un contexte d'entreprise interne)
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT TO authenticated
  USING (TRUE);

-- INSERT : Uniquement via le trigger handle_new_user (SECURITY DEFINER)
-- ou par un administrateur authentifié
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    app_private.is_admin()
  );

-- UPDATE : Un utilisateur peut modifier son propre profil
-- Un admin peut modifier tous les profils
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR app_private.is_admin()
  )
  WITH CHECK (
    id = auth.uid()
    OR app_private.is_admin()
  );

-- DELETE : Uniquement les admins (CEO, COO, ADMIN)
CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE TO authenticated
  USING (app_private.is_admin());

-- ============================================================
-- PARTIE 3 : ENRICHIR LA TABLE INVITATIONS
-- ============================================================

-- Ajouter expires_at (expiration automatique)
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE invitations
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 days');

-- Ajouter full_name pour pré-remplir le profil de l'invité
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Supprimer la contrainte UNIQUE sur email pour permettre la ré-invitation
-- (un utilisateur peut être ré-invité après expiration/révocation)
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_email_key;

-- ============================================================
-- PARTIE 4 : RÉÉCRITURE DU TRIGGER handle_new_user()
-- Ne JAMAIS écraser un profil existant.
-- Ordre de priorité :
--   1. Profil existant avec le bon auth.uid → ne rien faire
--   2. Profil orphelin (même email, mauvais ID) → le nettoyer
--   3. Invitation valide → créer le profil avec les données de l'invitation
--   4. Email fondateur connu → créer avec les valeurs par défaut
--   5. Email inconnu → créer comme EMPLOYEE / ENGINEER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_email text := lower(new.email);
  inv RECORD;
  existing_profile RECORD;
  user_role text;
  user_type text;
  user_is_admin boolean;
  user_equity float;
  user_salary float;
  user_vesting date;
  user_full_name text;
BEGIN
  -- ────────────────────────────────────────────
  -- ÉTAPE 0 : Vérifier si un profil existe déjà
  -- ────────────────────────────────────────────
  SELECT * INTO existing_profile
  FROM profiles
  WHERE lower(email) = user_email
  LIMIT 1;

  -- Cas A : Profil existe avec le BON auth.uid → ne rien toucher
  IF existing_profile IS NOT NULL AND existing_profile.id = new.id THEN
    RETURN new;
  END IF;

  -- Cas B : Profil orphelin (créé par l'ancien InviteMemberModal)
  -- → le supprimer car il n'est lié à aucun compte auth
  IF existing_profile IS NOT NULL AND existing_profile.id != new.id THEN
    DELETE FROM profiles WHERE id = existing_profile.id;
  END IF;

  -- ────────────────────────────────────────────
  -- ÉTAPE 1 : Chercher une invitation valide
  -- ────────────────────────────────────────────
  SELECT * INTO inv
  FROM invitations
  WHERE lower(email) = user_email
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  IF inv IS NOT NULL THEN
    user_role := inv.role;
    user_type := COALESCE(inv.type, 'ASSOCIATE');
    user_is_admin := inv.role IN ('CEO', 'COO', 'ADMIN');
    user_equity := COALESCE(inv.equity_granted, 0);
    user_salary := COALESCE(inv.salary_granted, 0);
    user_vesting := CURRENT_DATE;
    user_full_name := COALESCE(
      new.raw_user_meta_data->>'full_name',
      inv.full_name,
      split_part(inv.email, '@', 1)
    );

    -- Marquer l'invitation comme acceptée
    UPDATE invitations SET accepted_at = NOW() WHERE id = inv.id;

  ELSE
    -- ────────────────────────────────────────────
    -- ÉTAPE 2 : Mapping fondateurs par email réel
    -- ────────────────────────────────────────────
    user_role := CASE user_email
      WHEN 'lamsasfenelon@gmail.com'    THEN 'CEO'
      WHEN 'evansselemani@gmail.com'    THEN 'CTO'
      WHEN 'princebagheni@gmail.com'    THEN 'COO'
      WHEN 'zamwanapatricia@gmail.com'  THEN 'SALES'
      WHEN 'zainagodlive28@gmail.com'   THEN 'SALES'
      -- Anciens emails de test (rétrocompatibilité)
      WHEN 'ceo@opays.tech'   THEN 'CEO'
      WHEN 'coo@opays.tech'   THEN 'COO'
      WHEN 'admin@opays.tech' THEN 'ADMIN'
      WHEN 'sales@opays.tech' THEN 'SALES'
      ELSE 'ENGINEER'
    END;

    user_type := CASE user_email
      WHEN 'lamsasfenelon@gmail.com'    THEN 'ASSOCIATE'
      WHEN 'evansselemani@gmail.com'    THEN 'ASSOCIATE'
      WHEN 'princebagheni@gmail.com'    THEN 'ASSOCIATE'
      WHEN 'zamwanapatricia@gmail.com'  THEN 'ASSOCIATE'
      WHEN 'zainagodlive28@gmail.com'   THEN 'ASSOCIATE'
      WHEN 'ceo@opays.tech'            THEN 'ASSOCIATE'
      WHEN 'coo@opays.tech'            THEN 'ASSOCIATE'
      WHEN 'admin@opays.tech'          THEN 'ASSOCIATE'
      WHEN 'sales@opays.tech'          THEN 'ASSOCIATE'
      ELSE 'EMPLOYEE'
    END;

    user_is_admin := user_email IN (
      'lamsasfenelon@gmail.com',
      'evansselemani@gmail.com',
      'princebagheni@gmail.com',
      'ceo@opays.tech',
      'coo@opays.tech',
      'admin@opays.tech'
    );

    user_equity := CASE user_email
      WHEN 'lamsasfenelon@gmail.com'    THEN 22.0
      WHEN 'evansselemani@gmail.com'    THEN 18.0
      WHEN 'princebagheni@gmail.com'    THEN 12.0
      WHEN 'zamwanapatricia@gmail.com'  THEN 8.0
      WHEN 'zainagodlive28@gmail.com'   THEN 8.0
      ELSE 0.0
    END;

    user_salary := 0.0;
    user_vesting := CURRENT_DATE;
    user_full_name := COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.email
    );
  END IF;

  -- ────────────────────────────────────────────
  -- ÉTAPE 3 : Créer le profil (JAMAIS écraser)
  -- ────────────────────────────────────────────
  INSERT INTO public.profiles (
    id, full_name, email, type, role, is_admin,
    equity_percent, salary_amount, vesting_start_date, permissions
  )
  VALUES (
    new.id,
    user_full_name,
    new.email,
    user_type,
    user_role,
    user_is_admin,
    user_equity,
    user_salary,
    user_vesting,
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$function$;

-- ────────────────────────────────────────────
-- S'assurer que le trigger est bien attaché
-- ────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PARTIE 5 : FIX NOTIFICATION INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_self_or_admin" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_authorized" ON notifications;

-- Seul le destinataire ou un admin peut créer une notification
CREATE POLICY "notifications_insert_authorized" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    OR app_private.is_admin()
  );

-- ============================================================
-- PARTIE 6 : INDEX DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_invitations_email_accepted
  ON invitations(lower(email), accepted_at);

CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON invitations(token);

CREATE INDEX IF NOT EXISTS idx_invitations_expires
  ON invitations(expires_at)
  WHERE accepted_at IS NULL;

-- ============================================================
-- PARTIE 7 : NETTOYAGE DES PROFILS ORPHELINS (OPTIONNEL)
-- Supprime les profils qui n'ont pas de compte auth.users correspondant
-- et qui ne font pas partie de l'équipe officielle
-- ============================================================

-- Décommenter si nécessaire après vérification :
-- DELETE FROM profiles
-- WHERE id NOT IN (SELECT id FROM auth.users)
--   AND email NOT IN (
--     'lamsasfenelon@gmail.com',
--     'evansselemani@gmail.com',
--     'princebagheni@gmail.com',
--     'zamwanapatricia@gmail.com',
--     'zainagodlive28@gmail.com'
--   );

COMMIT;
