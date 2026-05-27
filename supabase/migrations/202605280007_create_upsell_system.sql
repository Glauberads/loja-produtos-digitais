-- 202605280007_create_upsell_system.sql
-- FASE 4: Upsell Pós-Compra

-- 1. Modificar orders para suportar hierarquia de upsell
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES orders(id),
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'main' CHECK (order_type IN ('main', 'bump', 'upsell'));

-- Impedir upsell duplicado (Um parent_order só pode ter 1 upsell do mesmo produto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_upsell ON orders(parent_order_id, product_id) WHERE order_type = 'upsell';

-- 2. Tabela de ofertas de upsell
CREATE TABLE IF NOT EXISTS upsell_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    main_product_id UUID REFERENCES products(id) NOT NULL,
    upsell_product_id UUID REFERENCES products(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    promotional_price NUMERIC NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(main_product_id, upsell_product_id)
);

CREATE INDEX IF NOT EXISTS idx_upsell_offers_main_product ON upsell_offers(main_product_id) WHERE active = true;

-- 3. Triggers para atualizacao
IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_upsell_offers_updated_at') THEN
    CREATE TRIGGER trigger_upsell_offers_updated_at
        BEFORE UPDATE ON upsell_offers
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_column();
END IF;

-- 4. RLS
ALTER TABLE upsell_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Upsell Offers" ON upsell_offers FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Public Read Active Upsells" ON upsell_offers FOR SELECT USING (active = true);
