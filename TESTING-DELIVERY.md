# 🧪 Guia de Teste — Entrega Automática Pós Pagamento
## NexusSaaS — Sistema de Delivery Digital

---

## Pré-requisitos

Antes de testar, configure as variáveis de ambiente no Supabase (painel → Edge Functions → Secrets):

```
MP_ACCESS_TOKEN=APP_USR-seu-token-do-mercado-pago
META_PIXEL_ID=123456789012345
META_CAPI_TOKEN=EAAB...seu-token-capi
N8N_WEBHOOK_URL=https://seu-n8n.dominio.com/webhook/post-purchase
SITE_URL=https://nexussaas.com.br
SUPABASE_SERVICE_ROLE_KEY=eyJh... (já configurado automaticamente)
```

---

## Parte 1 — Aplicar Migrations SQL

Execute no **Supabase SQL Editor** (painel → SQL Editor) nesta ordem:

```sql
-- 1. Rodar o arquivo:
supabase/migrations/202605270001_alter_orders_add_delivery_fields.sql

-- 2. Rodar o arquivo:
supabase/migrations/202605270002_create_product_access.sql

-- 3. Rodar o arquivo:
supabase/migrations/202605270003_create_downloads.sql

-- 4. Rodar o arquivo:
supabase/migrations/202605270004_create_webhook_events.sql
```

**Verificação:** No painel Table Editor, confirme que as tabelas `product_access`, `downloads` e `webhook_events` existem.

---

## Parte 2 — Deploy das Edge Functions

```bash
# Na pasta do projeto, com Supabase CLI instalado:
supabase functions deploy payment-webhook
supabase functions deploy create-payment
supabase functions deploy get-download
```

**Verificação:** No painel Supabase → Edge Functions, veja as funções listadas com status "Active".

---

## Parte 3 — Teste do Fluxo Completo (Sandbox)

### 3.1 — Criar pedido via `create-payment`

```bash
curl -X POST "https://SEU_SUPABASE_URL/functions/v1/create-payment" \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_ANON_KEY" \
  -d '{
    "product_id": "UUID_DO_PRODUTO",
    "customer_name": "João Teste",
    "customer_email": "joao@teste.com",
    "customer_phone": "11999999999",
    "gateway": "mercadopago",
    "utm_source": "google",
    "utm_campaign": "launch2026"
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "order_id": "uuid-do-pedido",
  "pix_code": "00020126...",
  "pix_qr_image": "data:image/png;base64,...",
  "amount": 297.00,
  "currency": "BRL"
}
```

---

### 3.2 — Simular webhook de pagamento aprovado (Mercado Pago)

```bash
curl -X POST "https://SEU_SUPABASE_URL/functions/v1/payment-webhook" \
  -H "Content-Type: application/json" \
  -H "x-gateway-provider: mercadopago" \
  -d '{
    "action": "payment.updated",
    "type": "payment",
    "data": { "id": "ID_PAGAMENTO_MP" },
    "external_reference": "UUID_DO_PEDIDO_CRIADO_ACIMA"
  }'
```

**Verificação no banco:**
```sql
-- Verificar se order foi aprovada
SELECT id, status, paid_at, transaction_id FROM orders WHERE id = 'UUID_DO_PEDIDO';

-- Verificar se acesso foi criado
SELECT * FROM product_access WHERE order_id = 'UUID_DO_PEDIDO';

-- Verificar se token de download foi criado
SELECT token, expires_at, max_downloads, download_count FROM downloads WHERE order_id = 'UUID_DO_PEDIDO';

-- Verificar registro do webhook
SELECT * FROM webhook_events WHERE order_id = 'UUID_DO_PEDIDO';
```

---

### 3.3 — Testar Token de Download

```bash
# Copiar o token retornado no banco e testar:
curl "https://SEU_SUPABASE_URL/functions/v1/get-download?token=TOKEN_AQUI"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "product_name": "Nome do Produto",
  "delivery_url": "https://link-do-produto",
  "downloads_remaining": 2,
  "expires_at": "2026-05-29T..."
}
```

---

### 3.4 — Testar Idempotência (sem duplicidade)

Envie o mesmo webhook duas vezes e verifique:
- Apenas **um** registro em `product_access`
- Apenas **um** registro em `downloads`
- Na tabela `webhook_events`, campo `processed = true`
- Resposta `{ "ok": true, "skipped": "already_processed" }`

---

### 3.5 — Testar Área de Membros

1. Abra `http://localhost:5173/success?order_id=UUID_DO_PEDIDO`
2. Deve exibir "Pagamento Confirmado!" com botão de acesso
3. Abra `http://localhost:5173/minha-area?order=UUID_DO_PEDIDO`
4. Deve exibir o produto com botão "Acessar Produto"
5. Clique em "Acessar Produto" → deve abrir o link de entrega

---

### 3.6 — Testar Revogação de Acesso

1. Acesse `/admin/delivery`
2. Encontre o acesso criado acima
3. Clique em "Revogar"
4. Tente acessar `/minha-area?order=UUID_DO_PEDIDO` → produto deve aparecer como bloqueado

---

## Parte 4 — Teste do Checkout Real na Loja

1. Acesse `http://localhost:5173`
2. Clique em qualquer produto → "Comprar Agora"
3. Preencha Nome, E-mail e WhatsApp
4. Clique em "Gerar PIX"
5. O QR Code real do Mercado Pago aparece (se `MP_ACCESS_TOKEN` estiver configurado)
6. Pague via PIX em sandbox do Mercado Pago
7. A tela muda automaticamente para "Pagamento Aprovado!" (via Realtime)
8. Redireciona para `/success?order_id=...`

---

## Parte 5 — Verificar Meta CAPI

Após pagamento aprovado, verifique no painel Meta Business:
1. Eventos → Gerenciador de Eventos → Seu Pixel
2. Procure o evento `Purchase` com `action_source: website`
3. Verifique que o `event_id` é o mesmo do cookie `_fbp` no navegador (deduplicação)

---

## Parte 6 — Verificar N8N

Se `N8N_WEBHOOK_URL` estiver configurado:
1. Abra o histórico de execuções no N8N
2. Deve aparecer execução com os dados do pedido
3. Campos esperados: `customer_email`, `customer_phone`, `product_name`, `access_link`, `amount`, `utm_source`

---

## Cenários de Erro para Testar

| Cenário | Ação | Resultado Esperado |
|---------|------|-------------------|
| Token expirado | Usar token com `expires_at` no passado | `{ "error": "Link expirado", "expired": true }` |
| Limite atingido | Download 4+ vezes | `{ "error": "Limite de 3 downloads atingido", "limit_reached": true }` |
| Mesmo webhook 2x | Duplicar chamada do webhook | `{ "ok": true, "skipped": "already_processed" }` |
| Order não encontrada | Webhook com `external_reference` errado | `{ "ok": true, "skipped": "order_not_found" }` |
| Pagamento refunded | `status: refunded` no webhook | Acesso revogado em `product_access` |

---

## Logs e Debug

```sql
-- Ver todos os webhooks recentes
SELECT gateway, event_type, transaction_id, processed, error_message, created_at 
FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 20;

-- Ver pedidos com status recentes
SELECT id, customer_email, status, gateway, amount, paid_at, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 20;

-- Ver downloads ativos com contagem
SELECT d.token, d.download_count, d.max_downloads, d.expires_at, p.name as product
FROM downloads d
JOIN products p ON p.id = d.product_id
ORDER BY d.created_at DESC 
LIMIT 20;
```

---

## Estrutura de Variáveis de Ambiente (.env local)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

> [!WARNING]
> As chaves `MP_ACCESS_TOKEN`, `META_CAPI_TOKEN` etc. são configuradas APENAS no painel Supabase como Secrets de Edge Functions. **Nunca no `.env` do frontend.**

---

*Documentação gerada automaticamente pelo NexusSaaS Auto-Delivery System v1.0 — Maio 2026*
