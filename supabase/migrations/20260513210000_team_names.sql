-- 1. Nettoyage radical : supprimer tous les profils qui ne sont pas dans la liste officielle
DELETE FROM profiles 
WHERE email NOT IN (
  'lamsasfenelon@gmail.com',
  'evansselemani@gmail.com',
  'zamwanapatricia@gmail.com',
  'zainagodlive28@gmail.com',
  'princebagheni@gmail.com'
) OR email IS NULL;

-- 2. Mise à jour des membres réels pour garantir l'exactitude
UPDATE profiles SET full_name = 'Fenelon Lamsasiri', role = 'CEO', type = 'ASSOCIATE', is_admin = true WHERE email = 'lamsasfenelon@gmail.com';
UPDATE profiles SET full_name = 'Evans Selemani', role = 'CTO', type = 'ASSOCIATE', is_admin = true WHERE email = 'evansselemani@gmail.com';
UPDATE profiles SET full_name = 'Prince Bagheni', role = 'COO', type = 'ASSOCIATE', is_admin = true WHERE email = 'princebagheni@gmail.com';
UPDATE profiles SET full_name = 'Patricia Zamwana', role = 'SALES', type = 'ASSOCIATE' WHERE email = 'zamwanapatricia@gmail.com';
UPDATE profiles SET full_name = 'Zaina Godlive', role = 'SALES', type = 'ASSOCIATE' WHERE email = 'zainagodlive28@gmail.com';

-- 3. Insertion de sécurité si un membre a été supprimé par erreur ou n'existait pas encore
INSERT INTO profiles (id, email, full_name, role, type, is_admin)
SELECT uuid_generate_v4(), 'lamsasfenelon@gmail.com', 'Fenelon Lamsasiri', 'CEO', 'ASSOCIATE', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'lamsasfenelon@gmail.com');

INSERT INTO profiles (id, email, full_name, role, type, is_admin)
SELECT uuid_generate_v4(), 'evansselemani@gmail.com', 'Evans Selemani', 'CTO', 'ASSOCIATE', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'evansselemani@gmail.com');

INSERT INTO profiles (id, email, full_name, role, type, is_admin)
SELECT uuid_generate_v4(), 'princebagheni@gmail.com', 'Prince Bagheni', 'COO', 'ASSOCIATE', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'princebagheni@gmail.com');

INSERT INTO profiles (id, email, full_name, role, type)
SELECT uuid_generate_v4(), 'zamwanapatricia@gmail.com', 'Patricia Zamwana', 'SALES', 'ASSOCIATE'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'zamwanapatricia@gmail.com');

INSERT INTO profiles (id, email, full_name, role, type)
SELECT uuid_generate_v4(), 'zainagodlive28@gmail.com', 'Zaina Godlive', 'SALES', 'ASSOCIATE'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'zainagodlive28@gmail.com');
