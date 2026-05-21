const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();

    // 1. Check auth.users for this email
    const { rows: authRows } = await client.query(
      `SELECT id, email FROM auth.users WHERE email = $1`,
      ['glauberads21@gmail.com']
    );
    console.log('=== auth.users ===');
    console.log(authRows);

    // 2. Check admin_users for this email
    const { rows: adminRows } = await client.query(
      `SELECT user_id, email, role FROM admin_users WHERE email = $1`,
      ['glauberads21@gmail.com']
    );
    console.log('\n=== admin_users ===');
    console.log(adminRows);

    // 3. Compare
    if (authRows.length > 0 && adminRows.length > 0) {
      const authId = authRows[0].id;
      const adminUserId = adminRows[0].user_id;
      if (authId === adminUserId) {
        console.log('\n✅ IDs coincidem! O problema é outro.');
      } else {
        console.log(`\n❌ IDs NÃO coincidem!`);
        console.log(`   auth.users.id     = ${authId}`);
        console.log(`   admin_users.user_id = ${adminUserId}`);
        console.log('\nCorrigindo...');
        await client.query(
          `UPDATE admin_users SET user_id = $1 WHERE email = $2`,
          [authId, 'glauberads21@gmail.com']
        );
        console.log('✅ admin_users atualizado com o user_id correto!');
      }
    } else if (authRows.length === 0) {
      console.log('\n⚠️  Usuário NÃO existe em auth.users!');
    }

    // 4. Also check user@omelhordodigital.com.br
    const { rows: authRows2 } = await client.query(
      `SELECT id, email FROM auth.users WHERE email = $1`,
      ['user@omelhordodigital.com.br']
    );
    const { rows: adminRows2 } = await client.query(
      `SELECT user_id, email FROM admin_users WHERE email = $1`,
      ['user@omelhordodigital.com.br']
    );
    console.log('\n=== Verificação user@omelhordodigital.com.br ===');
    if (authRows2.length > 0 && adminRows2.length > 0) {
      if (authRows2[0].id === adminRows2[0].user_id) {
        console.log('✅ IDs coincidem.');
      } else {
        console.log('❌ IDs NÃO coincidem! Corrigindo...');
        await client.query(
          `UPDATE admin_users SET user_id = $1 WHERE email = $2`,
          [authRows2[0].id, 'user@omelhordodigital.com.br']
        );
        console.log('✅ Corrigido!');
      }
    }

    // 5. Show final state
    const { rows: finalRows } = await client.query('SELECT user_id, email, role FROM admin_users');
    console.log('\n=== Estado Final admin_users ===');
    console.log(finalRows);

  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

main();
