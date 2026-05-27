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
  gateway?: string // default: 'mercadopago'
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
  order_bump_id?: string
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
      gateway = 'mercadopago', coupon_code,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      fbp, fbc, event_id, affiliate_code, order_bump_id
    } = body

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
    let finalOrderBumpId = null;

    if (order_bump_id) {
       const { data: bumpProd } = await supabase.from('products').select('id, bump_price, price, name').eq('id', order_bump_id).eq('is_order_bump', true).maybeSingle();
       if (bumpProd) {
          finalOrderBumpId = bumpProd.id;
          bumpAmount = typeof bumpProd.bump_price === 'number' ? bumpProd.bump_price : (typeof bumpProd.price === 'string' ? parseFloat(bumpProd.price) : bumpProd.price);
          finalAmount += bumpAmount;
          console.log(`[CreatePayment] Order Bump detected: ${bumpProd.name} (+R$ ${bumpAmount})`)
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
      await supabase.from('customers').update({
        full_name: customer_name,
        phone: customer_phone || null,
      }).eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: customer_email,
          full_name: customer_name,
          phone: customer_phone || null,
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
        order_bump_amount: finalOrderBumpId ? bumpAmount : null
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
