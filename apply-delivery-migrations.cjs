const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:Glps162487$@db.rgqawadlrhzwgfagnrmy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const migrations = [
  // 1 to 4 and 5 were already applied or partially applied. We skip them.
  '202605300001_create_product_delivery_assets.sql',
  '202610070001_fix_anon_rls_for_delivery.sql'
];

async function main() {
  try {
    await client.connect();
    console.log('Retomando a aplicação das migrations de entrega!');

    for (const file of migrations) {
      const filePath = path.join(__dirname, 'supabase', 'migrations', file);
      if (fs.existsSync(filePath)) {
        console.log(`Aplicando ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await client.query(sql);
          console.log(`✅ ${file} aplicada.`);
        } catch (e) {
          console.log(`⚠️ Erro ao aplicar ${file}: ${e.message}`);
        }
      } else {
        console.warn(`⚠️ Arquivo não encontrado: ${file}`);
      }
    }

    console.log('🎉 Migrations restantes processadas.');

  } catch (err) {
    console.error('Erro geral:', err);
  } finally {
    await client.end();
  }
}

main();
