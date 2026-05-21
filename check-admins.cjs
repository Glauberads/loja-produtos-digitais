const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    const { rows } = await client.query('SELECT * FROM admin_users');
    console.log('Admin Users in DB:', rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
