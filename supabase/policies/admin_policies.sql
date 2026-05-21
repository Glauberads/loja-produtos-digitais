-- Políticas para admin_users isoladas
DROP POLICY IF EXISTS "Admin pode ler seu próprio registro" ON admin_users;
CREATE POLICY "Admin pode ler seu próprio registro" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;
CREATE POLICY "Super admins podem gerenciar admins" ON admin_users
  FOR ALL USING (
    exists (select 1 from admin_users au where au.user_id = auth.uid() and au.role = 'super_admin')
  );
