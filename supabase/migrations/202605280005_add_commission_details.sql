-- 202605280005_add_commission_details.sql
-- Adiciona colunas extras exigidas para comissões rigorosas

ALTER TABLE IF EXISTS commissions
    ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id),
    ADD COLUMN IF NOT EXISTS percentage NUMERIC NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS base_amount NUMERIC,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
