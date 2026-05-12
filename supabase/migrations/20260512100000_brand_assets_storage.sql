-- Configuration du Storage pour les Assets de Marque

-- 1. Cr\u00e9ation du bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de s\u00e9curit\u00e9 (RLS) pour le bucket brand-assets

-- Autoriser la lecture publique des assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'brand-assets' );

-- Autoriser l'upload aux utilisateurs authentifi\u00e9s (Associ\u00e9s)
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' 
);

-- Autoriser la suppression aux propri\u00e9taires ou admins
CREATE POLICY "Owners can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (owner = auth.uid() OR (SELECT is_admin FROM profiles WHERE id = auth.uid()))
);
