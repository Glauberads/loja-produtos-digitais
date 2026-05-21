const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Conectado ao banco!');

    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS video_url TEXT,
      ADD COLUMN IF NOT EXISTS details_url TEXT,
      ADD COLUMN IF NOT EXISTS checkout_url TEXT;
    `);
    console.log('✅ Migration applied successfully.');

  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

main();
