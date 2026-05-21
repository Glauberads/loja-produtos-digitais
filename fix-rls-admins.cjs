const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Conectado ao banco!');

    // 1. Drop ALL existing policies on admin_users
    await client.query(`DROP POLICY IF EXISTS "Admin pode ler seu próprio registro" ON admin_users;`);
    await client.query(`DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;`);
    await client.query(`DROP POLICY IF EXISTS "Admin pode ler registros de admin" ON admin_users;`);
    await client.query(`DROP POLICY IF EXISTS "Super admins podem modificar admins" ON admin_users;`);
    console.log('✅ Todas as políticas antigas removidas.');

    // 2. Create a SECURITY DEFINER function to check super_admin status
    //    This function bypasses RLS, breaking the circular dependency
    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_super_admin()
      RETURNS boolean
      LANGUAGE sql
      SECURITY DEFINER
      STABLE
      SET search_path = public
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
        );
      $$;
    `);
    console.log('✅ Função is_super_admin() criada com SECURITY DEFINER.');

    // 3. Create a SECURITY DEFINER function to check any admin status
    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS boolean
      LANGUAGE sql
      SECURITY DEFINER
      STABLE
      SET search_path = public
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        );
      $$;
    `);
    console.log('✅ Função is_admin() criada com SECURITY DEFINER.');

    // 4. SELECT policy: any admin can read their own row, super_admin can read ALL
    await client.query(`
      CREATE POLICY "admin_users_select_policy" ON admin_users
        FOR SELECT USING (
          user_id = auth.uid()
          OR
          public.is_super_admin()
        );
    `);
    console.log('✅ Política de SELECT criada (sem referência circular).');

    // 5. INSERT/UPDATE/DELETE policy: only super_admin
    await client.query(`
      CREATE POLICY "admin_users_modify_policy" ON admin_users
        FOR ALL USING (
          public.is_super_admin()
        );
    `);
    console.log('✅ Política de escrita (ALL) para super_admin criada.');

    console.log('');
    console.log('🎉 Políticas de RLS corrigidas com sucesso! O login deve funcionar agora.');

  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

main();
