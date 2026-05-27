-- 202605280004_create_affiliates_and_order_bump.sql
-- FASE 2: Escala de Lucro - Afiliados e Order Bump

-- 1. Tabela: affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    user_id UUID NOT NULL, -- user que será o afiliado
    code TEXT UNIQUE NOT NULL, -- ref_id/código
    commission_rate NUMERIC NOT NULL DEFAULT 50.00, -- percentual
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices e RLS para affiliates
CREATE INDEX IF NOT EXISTS idx_affiliates_tenant_id ON affiliates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Affiliates" ON affiliates FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 2. Tabela: commissions
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
    order_id UUID REFERENCES orders(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'canceled', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices e RLS para commissions
CREATE INDEX IF NOT EXISTS idx_commissions_tenant_id ON commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions(order_id);
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Commissions" ON commissions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Tabela: affiliate_links
CREATE TABLE IF NOT EXISTS affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices e RLS para affiliate_links
CREATE INDEX IF NOT EXISTS idx_affiliate_links_tenant_id ON affiliate_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate_id ON affiliate_links(affiliate_id);
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Affiliate Links" ON affiliate_links FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Modificações seguras na tabela orders (Order Bump & Affiliates)
ALTER TABLE IF EXISTS orders 
    ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES affiliates(id),
    ADD COLUMN IF NOT EXISTS referral_code TEXT,
    ADD COLUMN IF NOT EXISTS commission_amount NUMERIC,
    ADD COLUMN IF NOT EXISTS commission_status TEXT CHECK (commission_status IN ('pending', 'approved', 'paid', 'canceled', 'refunded')),
    ADD COLUMN IF NOT EXISTS order_bump_id UUID REFERENCES products(id),
    ADD COLUMN IF NOT EXISTS order_bump_amount NUMERIC;

-- 5. Modificações seguras na tabela products (Order Bump configuration)
ALTER TABLE IF EXISTS products 
    ADD COLUMN IF NOT EXISTS is_order_bump BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS bump_price NUMERIC;

-- 6. Trigger genérico para updated_at (reutiliza a função caso exista)
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_affiliates_updated_at') THEN
        CREATE TRIGGER trigger_affiliates_updated_at
            BEFORE UPDATE ON affiliates
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_commissions_updated_at') THEN
        CREATE TRIGGER trigger_commissions_updated_at
            BEFORE UPDATE ON commissions
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at_column();
    END IF;
END $$;
