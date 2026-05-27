-- ============================================================
-- Migration: Criar tabela downloads
-- Controla tokens de download com expiração e limite de uso
-- ============================================================

CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  user_id UUID, -- FK para customers.id
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Token de acesso seguro
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc', now()) + INTERVAL '48 hours'),
  
  -- Controle de downloads
  max_downloads INTEGER DEFAULT 3 NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Logs de acesso para antifraude
  ip TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  last_downloaded_at TIMESTAMPTZ
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS downloads_token_idx ON downloads(token);
CREATE INDEX IF NOT EXISTS downloads_user_id_idx ON downloads(user_id);
CREATE INDEX IF NOT EXISTS downloads_order_id_idx ON downloads(order_id);
CREATE INDEX IF NOT EXISTS downloads_expires_at_idx ON downloads(expires_at);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário lê seus próprios downloads" ON downloads;
CREATE POLICY "Usuário lê seus próprios downloads" ON downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c 
      WHERE c.id = downloads.user_id 
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins gerenciam downloads" ON downloads;
CREATE POLICY "Admins gerenciam downloads" ON downloads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- Acesso público via token (sem auth) — necessário para download por link
-- A Edge Function usa service_role que bypassa RLS
