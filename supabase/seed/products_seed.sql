-- Refer to setup-db.cjs for full product seed data. 
-- Here is an example to test the seed:
INSERT INTO products (slug, name, category_id, category, price, active) VALUES
('zapmax', 'ZapMax CRM', (SELECT id FROM categories WHERE slug = 'whatsapp'), 'WhatsApp', 297, true),
('titanops', 'TitanOps SaaS', (SELECT id FROM categories WHERE slug = 'saas'), 'SaaS', 499, true)
ON CONFLICT (slug) DO NOTHING;
