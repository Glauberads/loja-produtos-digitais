-- ============================================================
-- Migration: Criar tabela product_access
-- Controla quais usuários têm acesso a quais produtos
-- ============================================================

CREATE TABLE IF NOT EXISTS product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  user_id UUID, -- FK para customers.id
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Controle de acesso
  active BOOLEAN DEFAULT true NOT NULL,
  access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'trial', 'limited')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  revoked_at TIMESTAMPTZ -- Preenchido quando revogado
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS product_access_user_id_idx ON product_access(user_id);
CREATE INDEX IF NOT EXISTS product_access_product_id_idx ON product_access(product_id);
CREATE INDEX IF NOT EXISTS product_access_order_id_idx ON product_access(order_id);
CREATE INDEX IF NOT EXISTS product_access_active_idx ON product_access(active);

-- Garantir que um usuário não receba duplo acesso ao mesmo produto via mesma order
CREATE UNIQUE INDEX IF NOT EXISTS product_access_order_product_unique 
  ON product_access(order_id, product_id) WHERE order_id IS NOT NULL;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;

-- Usuários só veem seus próprios acessos (via email match nos customers)
DROP POLICY IF EXISTS "Usuário lê seu próprio acesso" ON product_access;
CREATE POLICY "Usuário lê seu próprio acesso" ON product_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c 
      WHERE c.id = product_access.user_id 
      AND c.user_id = auth.uid()
    )
  );

-- Admins têm acesso total
DROP POLICY IF EXISTS "Admins gerenciam product_access" ON product_access;
CREATE POLICY "Admins gerenciam product_access" ON product_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- Edge Functions (service_role) podem inserir/atualizar
-- service_role bypassa RLS por padrão, não precisa de policy específica
