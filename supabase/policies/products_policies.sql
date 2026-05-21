-- Políticas para produtos isoladas
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON products;
CREATE POLICY "Produtos ativos são públicos" ON products
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
CREATE POLICY "Admins podem gerenciar produtos" ON products
  FOR ALL USING (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));
