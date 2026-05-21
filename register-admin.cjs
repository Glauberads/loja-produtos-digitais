const { Client } = require('pg');

// Supabase service connection
const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Conectado ao banco!');

    // Check if admin already exists in admin_users
    const { rows } = await client.query(
      `SELECT au.user_id, au.email FROM admin_users au WHERE au.email = $1`,
      ['glauberads21@gmail.com']
    );

    if (rows.length > 0) {
      console.log('✅ Admin já existe na tabela admin_users:', rows[0].email);
      return;
    }

    // Get the user from auth.users
    const { rows: authRows } = await client.query(
      `SELECT id, email FROM auth.users WHERE email = $1`,
      ['glauberads21@gmail.com']
    );

    if (authRows.length === 0) {
      console.log('⚠️  Usuário não encontrado em auth.users.');
      console.log('');
      console.log('Para criar o usuário admin, acesse:');
      console.log('https://supabase.com/dashboard/project/rgqawadlrhzwgfagnrmy/auth/users');
      console.log('');
      console.log('Clique em "Add user" e insira:');
      console.log('  Email: glauberads21@gmail.com');
      console.log('  Senha: Glps162487$');
      console.log('');
      console.log('Depois execute este script novamente para registrá-lo como admin.');
      return;
    }

    const userId = authRows[0].id;
    console.log('✅ Usuário encontrado em auth.users:', userId);

    // Insert into admin_users
    await client.query(
      `INSERT INTO admin_users (user_id, email, role) VALUES ($1, $2, 'super_admin') ON CONFLICT (user_id) DO NOTHING`,
      [userId, 'glauberads21@gmail.com']
    );

    console.log('✅ Admin registrado com sucesso na tabela admin_users!');
    console.log('');
    console.log('Agora você pode acessar o painel em: http://localhost:5173/admin');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

main();
