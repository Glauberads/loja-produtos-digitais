-- ============================================================
-- Migration: Criar tabela webhook_events
-- Garante idempotência: não processa o mesmo evento duas vezes
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do evento
  gateway TEXT NOT NULL, -- 'mercadopago', 'asaas', 'pagarme', 'stripe', 'pushinpay'
  event_type TEXT NOT NULL, -- 'payment.approved', 'payment.refunded', etc.
  transaction_id TEXT NOT NULL, -- ID da transação no gateway
  
  -- Relacionamento com pedido (preenchido após processamento)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Payload bruto do webhook (para debug e replay)
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Controle de processamento
  processed BOOLEAN DEFAULT false NOT NULL,
  processed_at TIMESTAMPTZ,
  error_message TEXT, -- Se houve erro no processamento
  retry_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Índice UNIQUE para idempotência
-- Garante que um mesmo transaction_id + gateway não seja processado duas vezes
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_idempotency_idx 
  ON webhook_events(gateway, transaction_id);

CREATE INDEX IF NOT EXISTS webhook_events_processed_idx ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_events_order_id_idx ON webhook_events(order_id);

-- ============================================================
-- RLS — apenas admins e service_role acessam
-- ============================================================
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerenciam webhook_events" ON webhook_events;
CREATE POLICY "Admins gerenciam webhook_events" ON webhook_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );
