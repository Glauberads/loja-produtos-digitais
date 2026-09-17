// ============================================================
// Supabase Edge Function: create-payment
// Endpoint: POST /functions/v1/create-payment
//
// Cria um pedido pending + gera PIX via Mercado Pago ou outro gateway
// Retorna: { order_id, pix_code, pix_qr_image, payment_url, expires_at }
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGatewayProvider } from '../_shared/providers/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentRequest {
  product_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_document?: string // CPF/CNPJ informado no checkout
  gateway?: string // opcional: apenas uma dica, o gateway ativo é resolvido no servidor
  coupon_code?: string
  // UTM Tracking
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  // Meta Pixel
  fbp?: string
  fbc?: string
  event_id?: string // UUID para deduplicação Pixel vs CAPI
  affiliate_code?: string
  order_bump_id?: string // legado: um único bump (ainda suportado)
  order_bump_ids?: string[] // novo: múltiplos bumps selecionados no checkout
}

// Campos obrigatórios por gateway para considerá-lo "conectado"
// (mesma lógica usada em src/pages/admin/IntegrationsPage.tsx)
const GATEWAY_REQUIRED_FIELDS: Record<string, string[]> = {
  stripe: ['publishable_key', 'secret_key'],
  mercadopago: ['public_key', 'access_token'],
  asaas: ['api_key', 'environment'],
  pagarme: ['secret_key', 'public_key'],
}

// Ordem de prioridade quando mais de um gateway estiver conectado
const GATEWAY_PRIORITY = ['asaas', 'mercadopago', 'stripe', 'pagarme']

/**
 * Resolve qual gateway usar com base no que está de fato configurado/conectado
 * em admin_settings (payment_gateway_configs). Nunca confia apenas no valor
 * enviado pelo cliente, pois isso permitiria cobrar por um gateway desconectado
 * ou divergente do exibido no painel admin.
 */
async function resolveActiveGateway(supabase: any, requestedGateway?: string): Promise<string> {
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('id', 'payment_gateway_configs')
    .maybeSingle()

  const configs = (data?.value as Record<string, Record<string, string>>) || {}

  const isConnected = (id: string) => {
    const cfg = configs[id]
    if (!cfg) return false
    const required = GATEWAY_REQUIRED_FIELDS[id] || []
    return required.every((f) => (cfg[f] ?? '').trim().length > 0)
  }

  if (requestedGateway && isConnected(requestedGateway)) {
    return requestedGateway
  }

  const active = GATEWAY_PRIORITY.find(isConnected)
  return active || requestedGateway || 'mercadopago'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body: CreatePaymentRequest = await req.json()
    const {
      product_id, customer_name, customer_email, customer_phone,
      gateway: requestedGateway, coupon_code,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      fbp, fbc, event_id, affiliate_code, order_bump_id, order_bump_ids, customer_document
    } = body

    // Normaliza a lista de bumps: aceita tanto o campo antigo (order_bump_id,
    // um único item) quanto o novo (order_bump_ids, array) para não quebrar
    // integrações existentes.
    const requestedBumpIds: string[] = Array.isArray(order_bump_ids) && order_bump_ids.length > 0
      ? order_bump_ids
      : (order_bump_id ? [order_bump_id] : [])

    // Resolve o gateway realmente conectado no painel admin — nunca confia
    // apenas no que o front-end enviou.
    const gateway = await resolveActiveGateway(supabase, requestedGateway)

    if (!product_id || !customer_name || !customer_email) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: product_id, customer_name, customer_email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 1. Buscar produto ───────────────────────────────────
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, checkout_url')
      .eq('id', product_id)
      .eq('active', true)
      .single()

    if (productError || !product) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado ou inativo' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let finalAmount = typeof product.price === 'string' ? parseFloat(product.price) : product.price
    let bumpAmount = 0;
    let finalOrderBumpIds: string[] = [];
    // Compat: mantém o campo antigo (singular) apontando para o primeiro bump aceito
    let finalOrderBumpId: string | null = null;

    if (requestedBumpIds.length > 0) {
      const { data: bumpProds } = await supabase
        .from('products')
        .select('id, bump_price, price, name')
        .in('id', requestedBumpIds)
        .eq('is_order_bump', true)
        .eq('active', true);

      if (bumpProds && bumpProds.length > 0) {
        for (const bumpProd of bumpProds) {
          const price = typeof bumpProd.bump_price === 'number'
            ? bumpProd.bump_price
            : (typeof bumpProd.price === 'string' ? parseFloat(bumpProd.price) : bumpProd.price);
          bumpAmount += price;
          finalOrderBumpIds.push(bumpProd.id);
          console.log(`[CreatePayment] Order Bump detected: ${bumpProd.name} (+R$ ${price})`)
        }
        finalAmount += bumpAmount;
        finalOrderBumpId = finalOrderBumpIds[0] || null;
      }
    }

    // ── 2. Aplicar cupom (se fornecido) ────────────────────
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .maybeSingle()

      if (coupon) {
        if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
          if (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit) {
            if (coupon.discount_type === 'percent') {
              finalAmount = finalAmount * (1 - coupon.discount_percent / 100)
            } else {
              finalAmount = Math.max(0, finalAmount - coupon.discount_value)
            }
          }
        }
      }
    }

    finalAmount = Math.round(finalAmount * 100) / 100 // Arredondar 2 casas

    // ── 3. Criar/atualizar customer ─────────────────────────
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer_email)
      .maybeSingle()

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
      const customerUpdate: Record<string, unknown> = {
        full_name: customer_name,
        phone: customer_phone || null,
      }
      if (customer_document) customerUpdate.document = customer_document
      await supabase.from('customers').update(customerUpdate).eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: customer_email,
          full_name: customer_name,
          phone: customer_phone || null,
          document: customer_document || null,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        throw new Error('Falha ao criar cliente')
      }
      customerId = newCustomer.id
    }

    // ── 3.5. Validar Afiliado ───────────────────────────────
    let finalAffiliateId = null;
    let finalCommissionAmount = null;
    let finalCommissionStatus = null;

    if (affiliate_code) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, user_id, commission_rate, status')
        .eq('code', affiliate_code)
        .maybeSingle();

      if (!affiliate) {
        await supabase.from('audit_logs').insert({ tenant_id: '00000000-0000-0000-0000-000000000000', action: 'referral_invalid', entity: 'orders', details: { code: affiliate_code } });
      } else if (affiliate.status !== 'active') {
        await supabase.from('audit_logs').insert({ tenant_id: '00000000-0000-0000-0000-000000000000', action: 'commission_skipped_invalid_ref', details: { reason: 'affiliate_not_active', status: affiliate.status } });
      } else {
        // Prevent self-referral: Check if affiliate.user_id email matches customer_email
        // We can check if existing customer matches, or we do a direct query on admin_users/customers
        const { data: affiliateUser } = await supabase.auth.admin.getUserById(affiliate.user_id).catch(() => ({ data: { user: null } }));
        if (affiliateUser?.user?.email === customer_email || customerId === affiliate.user_id) {
           await supabase.from('audit_logs').insert({ tenant_id: '00000000-0000-0000-0000-000000000000', action: 'commission_skipped_invalid_ref', details: { reason: 'self_referral', customer_email } });
        } else {
           finalAffiliateId = affiliate.id;
           const commRate = affiliate.commission_rate || 50;
           finalCommissionAmount = Math.round((finalAmount * (commRate / 100)) * 100) / 100;
           finalCommissionStatus = 'pending';
           await supabase.from('audit_logs').insert({ tenant_id: '00000000-0000-0000-0000-000000000000', action: 'affiliate_attached_to_order', entity: 'orders', details: { affiliate_id: affiliate.id } });
        }
      }
    }

    // ── 4. Criar order com status=pending ──────────────────
    const orderEventId = event_id || crypto.randomUUID()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        product_id,
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        amount: finalAmount,
        currency: 'BRL',
        status: 'pending',
        payment_status: 'pending',
        gateway,
        coupon_code: coupon_code || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        fbp: fbp || null,
        fbc: fbc || null,
        event_id: orderEventId,
        affiliate_id: finalAffiliateId,
        referral_code: affiliate_code || null,
        commission_amount: finalCommissionAmount,
        commission_status: finalCommissionStatus,
        order_bump_id: finalOrderBumpId,
        order_bump_ids: finalOrderBumpIds,
        order_bump_amount: finalOrderBumpIds.length > 0 ? bumpAmount : null,
        customer_document: customer_document || null,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      throw new Error('Falha ao criar pedido')
    }

    console.log(`[CreatePayment] Order criada: ${order.id} | Gateway: ${gateway} | Valor: R$ ${finalAmount}`)

    // ── 5. Gerar Pagamento via gateway ────────────────────────────
    const siteUrl = Deno.env.get('SITE_URL') || 'https://nexussaas.com.br'
    let paymentUrl = product.checkout_url || `${siteUrl}/checkout?order=${order.id}`
    let pixCode = ''
    let pixQrImage = ''
    let gatewayPaymentId = ''

    try {
      const provider = getGatewayProvider(gateway)
      const payResult = await provider.createPayment({
        orderId: order.id,
        amount: finalAmount,
        currency: 'BRL',
        productName: product.name,
        customer: {
          email: customer_email,
          name: customer_name,
          phone: customer_phone,
        },
        metadata: {
          product_id,
        }
      })

      if (payResult.ok) {
        gatewayPaymentId = payResult.transactionId || ''
        pixCode = payResult.pixCode || ''
        pixQrImage = payResult.pixQrImage || ''
        if (payResult.paymentUrl) paymentUrl = payResult.paymentUrl

        await supabase.from('orders').update({
          transaction_id: gatewayPaymentId,
          gateway_response: { payment_id: gatewayPaymentId, status: payResult.status },
        }).eq('id', order.id)

        console.log(`[Gateway] Pagamento gerado. ID: ${gatewayPaymentId}`)
      } else {
        console.error(`[Gateway] Erro ao gerar pagamento:`, payResult.error)
      }
    } catch (err: any) {
      console.error(`[Gateway] Exceção ao chamar provider:`, err.message)
    }

    return new Response(JSON.stringify({
      ok: true,
      order_id: order.id,
      event_id: orderEventId,
      amount: finalAmount,
      currency: 'BRL',
      gateway,
      pix_code: pixCode,
      pix_qr_image: pixQrImage ? `data:image/png;base64,${pixQrImage}` : null,
      payment_url: paymentUrl,
      product_name: product.name,
      gateway_payment_id: gatewayPaymentId || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[CreatePayment] Erro crítico:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
