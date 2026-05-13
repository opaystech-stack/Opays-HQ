-- Correction des politiques RLS pour permettre l'invitation de membres
-- Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 1. Autoriser la lecture de tous les profils par les utilisateurs authentifiés
CREATE POLICY "Profiles are viewable by authenticated users" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- 2. Autoriser l'insertion de profils par les administrateurs (CEO, COO, CTO)
-- Note: On vérifie le rôle de l'utilisateur qui fait l'insertion
CREATE POLICY "Admins can insert profiles" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role IN ('CEO', 'COO', 'CTO') OR is_admin = true)
  )
);

-- 3. Autoriser la mise à jour par soi-même ou par un admin
CREATE POLICY "Users can update own profile or admins can update all" 
ON profiles FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role IN ('CEO', 'COO', 'CTO') OR is_admin = true)
  )
);
