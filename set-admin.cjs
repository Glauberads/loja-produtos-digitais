const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    const userId = '0a105eb2-920c-4474-b037-a531586f2261';
    
    const { rows: authRows } = await client.query(
      `SELECT email FROM auth.users WHERE id = $1`,
      [userId]
    );
    
    let email = 'admin@nexussaas.com';
    if (authRows.length > 0) {
      email = authRows[0].email;
      console.log(`Encontrado email na auth.users: ${email}`);
    } else {
      console.log(`Aviso: Usuário não encontrado na tabela auth.users. Vamos prosseguir com o email padrão.`);
    }
    
    await client.query(
      `INSERT INTO admin_users (user_id, email, role) VALUES ($1, $2, 'super_admin') 
       ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', email = $2`,
      [userId, email]
    );
    
    console.log(`✅ Usuário ${userId} foi definido como super_admin com sucesso!`);
  } catch (err) {
    console.error('Erro ao definir super_admin:', err.message);
  } finally {
    await client.end();
  }
}

main();
