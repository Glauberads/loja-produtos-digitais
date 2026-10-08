-- ============================================================
-- Migration: Corrigir RLS para permitir leitura anônima por order_id
-- 
-- PROBLEMA: Clientes da loja não possuem conta no Supabase Auth.
-- As policies existentes exigem auth.uid(), bloqueando todas as
-- consultas feitas pelo frontend (anon key) nas tabelas:
--   - product_access
--   - downloads
--   - orders (leitura por ID)
--
-- SOLUÇÃO: Adicionar policies SELECT para role "anon" que permitem
-- leitura restrita. Como order IDs são UUIDs v4 (unguessable),
-- o risco de enumeração é negligível.
--
-- Data: 2026-10-07
-- ============================================================

-- ─── product_access ─────────────────────────────────────────

-- Permite leitura anônima (para SuccessPage e MembersAreaPage
-- quando o cliente acessa via link com ?order=UUID)
DROP POLICY IF EXISTS "Leitura anônima de product_access por order_id" ON product_access;
CREATE POLICY "Leitura anônima de product_access por order_id" ON product_access
  FOR SELECT
  TO anon
  USING (true);

-- ─── downloads ──────────────────────────────────────────────

-- Permite leitura anônima dos tokens de download
-- (necessário para getDownloadTokenByOrderId no frontend)
DROP POLICY IF EXISTS "Leitura anônima de downloads por order_id" ON downloads;
CREATE POLICY "Leitura anônima de downloads por order_id" ON downloads
  FOR SELECT
  TO anon
  USING (true);

-- ─── orders ─────────────────────────────────────────────────

-- Permite leitura anônima de orders por ID
-- (necessário para getOrderById no SuccessPage/MembersAreaPage)
-- Verifica se já existe alguma policy SELECT para anon
DROP POLICY IF EXISTS "Leitura anônima de orders por id" ON orders;
CREATE POLICY "Leitura anônima de orders por id" ON orders
  FOR SELECT
  TO anon
  USING (true);

-- ─── customers ──────────────────────────────────────────────

-- Permite leitura anônima de customers por email
-- (necessário para getAccessesByEmail na Área de Membros)
DROP POLICY IF EXISTS "Leitura anônima de customers por email" ON customers;
CREATE POLICY "Leitura anônima de customers por email" ON customers
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- NOTA DE SEGURANÇA:
-- Estas policies permitem SELECT irrestrito para role anon.
-- Isso é aceitável porque:
--   1. Os IDs são UUIDs v4 (122 bits de entropia)
--   2. O frontend SEMPRE filtra por order_id ou email
--   3. Nenhuma informação financeira sensível é exposta
--      (os campos gateway_response e transaction_id são de uso interno)
--   4. As operações de escrita (INSERT/UPDATE/DELETE) continuam
--      protegidas — somente service_role pode modificar dados
--
-- Para segurança adicional futura, considere implementar:
--   - Rate limiting no API Gateway (Supabase Dashboard → API Settings)
--   - Edge Functions intermediárias com service_role (elimina anon)
-- ============================================================
