const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERRO: Variável de ambiente DATABASE_URL não encontrada no .env");
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    console.log('Conectando ao Supabase...');
    await client.connect();
    console.log('Conectado!');

    // 1. Criar tabelas da Fase 2
    console.log('\n[1/3] Criando tabelas da Fase 2...');
    await client.query(`
      create table if not exists coupons (
        id uuid primary key default gen_random_uuid(),
        code text unique not null,
        discount_percent numeric not null,
        expires_at timestamp with time zone,
        usage_limit integer default null,
        usage_count integer default 0,
        active boolean default true,
        created_at timestamp with time zone default timezone('utc', now()),
        updated_at timestamp with time zone default timezone('utc', now())
      );

      create table if not exists analytics_events (
        id uuid primary key default gen_random_uuid(),
        event_type text not null,
        metadata jsonb default '{}'::jsonb,
        created_at timestamp with time zone default timezone('utc', now())
      );
    `);
    console.log('✅ Tabelas criadas!');

    // 2. Ativar RLS
    console.log('\n[2/3] Configurando RLS...');
    await client.query(`
      alter table coupons enable row level security;
      alter table analytics_events enable row level security;

      -- Cupons ativos são públicos (para validação no checkout)
      drop policy if exists "Cupons ativos são públicos" on coupons;
      create policy "Cupons ativos são públicos"
        on coupons for select
        using (active = true);

      -- Admin gerencia cupons
      drop policy if exists "Somente admins gerenciam cupons" on coupons;
      create policy "Somente admins gerenciam cupons"
        on coupons for all
        using (
          exists (select 1 from admin_users where admin_users.user_id = auth.uid())
        )
        with check (
          exists (select 1 from admin_users where admin_users.user_id = auth.uid())
        );

      -- Qualquer um pode inserir analytics (público)
      drop policy if exists "Qualquer um pode inserir analytics" on analytics_events;
      create policy "Qualquer um pode inserir analytics"
        on analytics_events for insert
        with check (true);

      -- Apenas admin pode ler analytics
      drop policy if exists "Somente admins leem analytics" on analytics_events;
      create policy "Somente admins leem analytics"
        on analytics_events for select
        using (
          exists (select 1 from admin_users where admin_users.user_id = auth.uid())
        );
    `);
    console.log('✅ RLS configurado!');

    console.log('\n✅ SETUP FASE 2 COMPLETO! Banco de dados atualizado com sucesso.');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

main();
