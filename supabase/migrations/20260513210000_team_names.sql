-- Mise à jour des membres de l'équipe avec les noms réels et emails
-- Fenelon Lamsasiri (CEO)
UPDATE profiles SET full_name = 'Fenelon Lamsasiri', role = 'CEO', type = 'ASSOCIATE', email = 'lamsasfenelon@gmail.com' WHERE full_name LIKE '%Fenelon%';

-- Evans (CTO)
UPDATE profiles SET full_name = 'Evans Selemani', role = 'CTO', type = 'ASSOCIATE', email = 'evansselemani@gmail.com' WHERE full_name LIKE '%Evans%';

-- Prince (COO)
UPDATE profiles SET full_name = 'Prince Bagheni', role = 'COO', type = 'ASSOCIATE', email = 'princebagheni@gmail.com' WHERE full_name LIKE '%Prince%';

-- Patricia (Sales)
UPDATE profiles SET full_name = 'Patricia Zamwana', role = 'SALES', type = 'ASSOCIATE', email = 'zamwanapatricia@gmail.com' WHERE full_name LIKE '%Patricia%';

-- Zaina (Sales)
UPDATE profiles SET full_name = 'Zaina Godlive', role = 'SALES', type = 'ASSOCIATE', email = 'zainagodlive28@gmail.com' WHERE full_name LIKE '%Zaina%';

-- Insertion si absents
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
