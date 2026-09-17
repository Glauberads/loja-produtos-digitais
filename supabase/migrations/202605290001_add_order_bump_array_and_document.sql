-- ============================================================
-- Migration: Suporte a múltiplos Order Bumps + CPF no checkout
-- Autor: NexusSaaS Checkout Full-Page
-- Data: 2026-05-29
-- ============================================================

-- Array com os IDs de todos os order bumps aceitos no pedido.
-- Mantém order_bump_id/order_bump_amount (colunas antigas) intactas
-- para não quebrar pedidos já existentes; a partir desta migration,
-- o checkout novo grava a lista completa aqui e a soma continua em
-- order_bump_amount.
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS order_bump_ids UUID[] DEFAULT '{}';

-- Documento (CPF/CNPJ) informado no checkout para este pedido específico.
-- customers.document já existe e também é atualizado, mas manter uma
-- cópia no pedido facilita auditoria/nota fiscal por transação.
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS customer_document TEXT;

CREATE INDEX IF NOT EXISTS orders_order_bump_ids_idx ON orders USING GIN (order_bump_ids);
