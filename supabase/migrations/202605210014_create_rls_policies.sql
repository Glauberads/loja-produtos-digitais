-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 1. Products RLS
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON products;
CREATE POLICY "Produtos ativos são públicos" ON products
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
CREATE POLICY "Admins podem gerenciar produtos" ON products
  FOR ALL USING (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));

-- 2. Categories RLS
DROP POLICY IF EXISTS "Categorias ativas são públicas" ON categories;
CREATE POLICY "Categorias ativas são públicas" ON categories
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON categories;
CREATE POLICY "Admins podem gerenciar categorias" ON categories
  FOR ALL USING (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));

-- 3. Banners RLS
DROP POLICY IF EXISTS "Banners ativos são públicos" ON banners;
CREATE POLICY "Banners ativos são públicos" ON banners
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins podem gerenciar banners" ON banners;
CREATE POLICY "Admins podem gerenciar banners" ON banners
  FOR ALL USING (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));

-- 4. Admin Users RLS
DROP POLICY IF EXISTS "Admin pode ler seu próprio registro" ON admin_users;
CREATE POLICY "Admin pode ler seu próprio registro" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;
CREATE POLICY "Super admins podem gerenciar admins" ON admin_users
  FOR ALL USING (
    exists (select 1 from admin_users au where au.user_id = auth.uid() and au.role = 'super_admin')
  );

-- 5. Outras Tabelas: Admins gerenciam tudo
-- (Vamos criar um fallback onde admins podem fazer TUDO nas outras tabelas)
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('system_settings', 'product_images', 'product_tags', 'customers', 'orders', 'product_reviews', 'favorites', 'audit_logs', 'webhook_logs', 'notifications', 'analytics')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins possuem acesso total em %I" ON %I;', t_name, t_name);
        EXECUTE format('CREATE POLICY "Admins possuem acesso total em %I" ON %I FOR ALL USING (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));', t_name, t_name);
    END LOOP;
END
$$;

-- 6. Acessos do Cliente final
-- Clientes podem ver seus próprios pedidos e editar seus dados
DROP POLICY IF EXISTS "Cliente gerencia seus próprios dados" ON customers;
CREATE POLICY "Cliente gerencia seus próprios dados" ON customers
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Cliente lê seus pedidos" ON orders;
CREATE POLICY "Cliente lê seus pedidos" ON orders
  FOR SELECT USING (
    exists (select 1 from customers c where c.id = orders.customer_id and c.user_id = auth.uid())
  );
