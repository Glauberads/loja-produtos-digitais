-- ============================================================
-- Migration: Adicionar colunas de entrega automática na tabela orders
-- Autor: NexusSaaS Auto-delivery System
-- Data: 2026-05-27
-- ============================================================

-- Adicionar colunas de cliente
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Renomear/garantir campo de status com valores padronizados
-- O campo payment_status já existe; vamos garantir a coluna 'status' também
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'refunded', 'chargeback', 'expired', 'failed'));

-- Gateway e transação
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gateway TEXT; -- 'mercadopago', 'pushinpay', 'asaas', 'pagarme', 'stripe'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;

-- Valor e moeda
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- UTM tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- Meta Pixel / CAPI
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fbp TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fbc TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS event_id TEXT; -- UUID único para deduplicação Pixel vs CAPI

-- Response do gateway (JSONB para debug)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gateway_response JSONB DEFAULT '{}'::jsonb;

-- Timestamps de pagamento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Índices para performance e idempotência
CREATE UNIQUE INDEX IF NOT EXISTS orders_transaction_id_unique 
  ON orders(transaction_id) WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_event_id_idx ON orders(event_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
