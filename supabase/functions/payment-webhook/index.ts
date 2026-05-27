// ============================================================
// Supabase Edge Function: payment-webhook
// Endpoint: POST /functions/v1/payment-webhook
//
// Fluxo (Arquitetura Orientada a Eventos):
// 1. Detectar gateway e validar assinatura via Gateway Adapter
// 2. Inserir/Atualizar webhook_event (idempotência & trace)
// 3. Atualizar order status
// 4. Liberar acesso ao produto (Síncrono/Imediato)
// 5. Enfileirar Meta CAPI e N8N no event_queue (Assíncrono)
// 6. Responder 200 OK Rápido
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGatewayProvider } from '../_shared/providers/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gateway-signature, x-signature',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const traceId = crypto.randomUUID()
  console.log(`[Webhook] Iniciado Trace ID: ${traceId}`)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let rawBody = ''
  let body: Record<string, unknown> = {}

  try {
    rawBody = await req.text()
    body = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const gatewayHeader = req.headers.get('x-gateway-provider')
  const gateway = (gatewayHeader || (body.gateway as string) || 'mercadopago').toLowerCase()
  console.log(`[Webhook] Gateway: ${gateway}`)

  let validationResult
  try {
    const provider = getGatewayProvider(gateway)
    validationResult = await provider.validateWebhook(req, body)
  } catch (err: any) {
    console.error(`[Webhook] Erro no adapter do gateway:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }

  if (!validationResult.isValid || !validationResult.paymentId) {
    console.warn(`[Webhook] Evento não validado. Payload:`, body)
    return new Response(JSON.stringify({ ok: true, skipped: 'invalid_or_ignored' }), {
      status: 200, headers: corsHeaders
    })
  }

  const transactionId = validationResult.paymentId
  const status = validationResult.status

  // Idempotência e Auditoria
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, processed')
    .eq('gateway', gateway)
    .eq('transaction_id', transactionId)
    .maybeSingle()

  if (existingEvent?.processed) {
    console.log(`[Webhook] Evento já processado (idempotência): ${transactionId}`)
    return new Response(JSON.stringify({ ok: true, skipped: 'already_processed' }), { status: 200, headers: corsHeaders })
  }

  let webhookEventId = existingEvent?.id
  if (!webhookEventId) {
    const { data: insertedEvent } = await supabase.from('webhook_events').insert({
      tenant_id: '00000000-0000-0000-0000-000000000000', // Default tenant
      gateway,
      event_type: validationResult.action,
      transaction_id: transactionId,
      payload: body,
      processed: false,
      trace_id: traceId,
    }).select('id').single()
    webhookEventId = insertedEvent?.id
  } else {
    await supabase.from('webhook_events').update({ trace_id: traceId }).eq('id', webhookEventId)
  }

  // Buscar order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq(validationResult.orderId ? 'id' : 'transaction_id', validationResult.orderId || transactionId)
    .single()

  if (orderError || !orderData) {
    console.warn(`[Webhook] Order não encontrada`)
    await supabase.from('webhook_events').update({ error_message: 'Order não encontrada', retry_count: 1 }).eq('id', webhookEventId)
    return new Response(JSON.stringify({ ok: true, skipped: 'order_not_found' }), { status: 200, headers: corsHeaders })
  }

  const order = orderData
  const tenantId = order.tenant_id || '00000000-0000-0000-0000-000000000000'

  if (order.status === 'approved' && status === 'approved') {
    await supabase.from('webhook_events').update({ processed: true, processed_at: new Date().toISOString() }).eq('id', webhookEventId)
    return new Response(JSON.stringify({ ok: true, skipped: 'already_approved' }), { status: 200, headers: corsHeaders })
  }

  // Processar
  if (status === 'approved') {
    // 1. Síncrono: Atualizar order
    await supabase.from('orders').update({
      status: 'approved',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      transaction_id: transactionId,
      gateway,
      gateway_response: validationResult.rawEvent || {},
    }).eq('id', order.id)

    // Audit log
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      action: 'payment_approved',
      entity: 'orders',
      entity_id: order.id,
      trace_id: traceId
    })

    const isUpsell = order.order_type === 'upsell'
    const isBump = order.order_type === 'bump'

    // 2. Fluxo de Entrega (Aprovação)
    const { data: customerData } = await supabase.from('customers').select('id').eq('email', order.customer_email).maybeSingle()
    const customerId = customerData?.id

    // 2.1 Libera acesso ao produto (Product Access)
    const { data: accessData } = await supabase
      .from('product_access')
      .insert({ tenant_id: tenantId, user_id: customerId, product_id: order.product_id, order_id: order.id, active: true, access_level: 'full' })
      .select('id')
      .single()
      
    if (order.order_bump_id) {
      await supabase.from('product_access').insert({ tenant_id: tenantId, user_id: customerId, product_id: order.order_bump_id, order_id: order.id, active: true, access_level: 'full' })
      console.log(`[Webhook] Access granted to Order Bump product: ${order.order_bump_id}`)
    }

    // 2.2 Gera Token de Download
    const maxDownloads = typeof product?.max_downloads === 'number' ? product.max_downloads : 5
    const expirationDays = typeof product?.download_expiration_days === 'number' ? product.download_expiration_days : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)
    
    const downloadToken = crypto.randomUUID()
    await supabase.from('downloads').insert({
      tenant_id: tenantId,
      user_id: customerId,
      product_id: order.product_id,
      order_id: order.id,
      token: downloadToken,
      expires_at: expiresAt,
      max_downloads: 3,
      download_count: 0,
    })

      // Audit log: access_granted e download_token_created
      await supabase.from('audit_logs').insert([
        { tenant_id: tenantId, user_id: customerId, action: 'access_granted', entity: 'product_access', entity_id: accessData?.id, trace_id: traceId },
        { tenant_id: tenantId, user_id: customerId, action: 'download_token_created', entity: 'downloads', entity_id: null, trace_id: traceId }
      ])
      
      if (order.order_bump_id) {
         await supabase.from('audit_logs').insert([
           { tenant_id: tenantId, user_id: customerId, action: 'access_granted_bump', entity: 'product_access', details: { bump_product_id: order.order_bump_id }, trace_id: traceId }
         ])
      }

      if (isUpsell) {
         await supabase.from('audit_logs').insert([
           { tenant_id: tenantId, user_id: customerId, action: 'upsell_purchase_granted', entity: 'product_access', details: { parent_order_id: order.parent_order_id }, trace_id: traceId }
         ])
      }

    // 2.5 Gerar Comissão do Afiliado (se houver)
    if (order.affiliate_id && order.commission_amount) {
       // Idempotency check
       const { data: existingCommission } = await supabase.from('commissions').select('id').eq('order_id', order.id).maybeSingle()
       if (!existingCommission) {
          const { data: affiliate } = await supabase.from('affiliates').select('commission_rate').eq('id', order.affiliate_id).maybeSingle()
          const percentage = affiliate?.commission_rate || 50;

          await supabase.from('commissions').insert({
             tenant_id: tenantId,
             affiliate_id: order.affiliate_id,
             order_id: order.id,
             product_id: order.product_id,
             amount: order.commission_amount,
             percentage: percentage,
             base_amount: order.amount,
             status: 'approved',
             approved_at: new Date().toISOString()
          })
          
          await supabase.from('orders').update({ commission_status: 'approved' }).eq('id', order.id)
          await supabase.from('audit_logs').insert({ tenant_id: tenantId, action: 'commission_created', entity: 'commissions', details: { order_id: order.id, amount: order.commission_amount }, trace_id: traceId })
       } else {
          await supabase.from('audit_logs').insert({ tenant_id: tenantId, action: 'commission_skipped_duplicate', entity: 'commissions', details: { order_id: order.id }, trace_id: traceId })
       }
    }

    // 3. Assíncrono: Enfileirar eventos (Meta CAPI & N8N) na event_queue
    const siteUrl = Deno.env.get('SITE_URL') || 'https://nexussaas.com.br'
    const accessLink = `${siteUrl}/minha-area?order=${order.id}&token=${downloadToken}`
    
    const { data: productData } = await supabase.from('products').select('name').eq('id', order.product_id).maybeSingle()

    const eventsToQueue = [
      {
        tenant_id: tenantId,
        event_type: 'meta_capi',
        event_name: 'Purchase',
        status: 'pending',
        attempts: 0,
        max_attempts: 5,
        scheduled_at: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        trace_id: traceId,
        payload: {
          order_id: order.id,
          amount: validationResult.amount || order.amount,
          currency: order.currency || 'BRL',
          product_id: order.product_id,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          fbp: order.fbp,
          fbc: order.fbc,
          event_id: order.event_id || `purchase_${order.id}`,
          event_source_url: `${siteUrl}/success?order_id=${order.id}`
        }
      },
      {
        tenant_id: tenantId,
        event_type: 'n8n_webhook',
        event_name: 'purchase_approved',
        status: 'pending',
        attempts: 0,
        max_attempts: 5,
        scheduled_at: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        trace_id: traceId,
        payload: {
          event: 'purchase_approved',
          order_id: order.id,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          product_id: order.product_id,
          product_name: productData?.name || '',
          access_link: accessLink,
          download_token: downloadToken,
          amount: validationResult.amount || order.amount,
          currency: order.currency || 'BRL',
          gateway,
          transaction_id: transactionId,
          utm_source: order.utm_source,
          utm_campaign: order.utm_campaign
        }
      }
    ]

    const { error: eventError } = await supabase.from('event_queue').insert(eventsToQueue)
    
    if (eventError) {
       await supabase.from('audit_logs').insert({ tenant_id: tenantId, action: 'event_queue_failed', entity: 'event_queue', details: { error: eventError.message }, trace_id: traceId })
    } else {
       await supabase.from('audit_logs').insert({ tenant_id: tenantId, action: 'event_queue_created', entity: 'event_queue', trace_id: traceId })
    }

    console.log(`[Webhook] Order ${order.id} approved. Events enqueued.`)

  } else if (status === 'refunded' || status === 'chargeback' || status === 'failed') {
    await supabase.from('orders').update({ status, gateway_response: validationResult.rawEvent || {} }).eq('id', order.id)
    await supabase.from('product_access').update({ active: false, revoked_at: new Date().toISOString() }).eq('order_id', order.id)
    
    // Enfileirar webhook pro N8N
    await supabase.from('event_queue').insert({
      tenant_id: tenantId,
      event_type: 'n8n_webhook',
      event_name: status === 'refunded' ? 'payment_refunded' : status === 'chargeback' ? 'payment_chargeback' : 'payment_failed',
      status: 'pending',
      attempts: 0,
      scheduled_at: new Date().toISOString(),
      trace_id: traceId,
      payload: {
        event: status === 'refunded' ? 'payment_refunded' : status === 'chargeback' ? 'payment_chargeback' : 'payment_failed',
        order_id: order.id,
        customer_email: order.customer_email,
        transaction_id: transactionId,
        gateway
      }
    })

    // Estornar comissão se existir
    if (order.affiliate_id) {
       const newCommStatus = status === 'failed' ? 'canceled' : (status === 'refunded' ? 'refunded' : 'canceled');
       await supabase.from('commissions').update({ status: newCommStatus }).eq('order_id', order.id)
       await supabase.from('orders').update({ commission_status: newCommStatus }).eq('id', order.id)
       await supabase.from('audit_logs').insert({ tenant_id: tenantId, action: 'commission_refunded', entity: 'commissions', details: { order_id: order.id, new_status: newCommStatus }, trace_id: traceId })
    }

    console.log(`[Webhook] Order ${order.id} status changed to ${status}. N8N event enqueued.`)
  }

  // Marcar como processado
  await supabase.from('webhook_events').update({
    processed: true,
    processed_at: new Date().toISOString(),
    order_id: order.id,
  }).eq('id', webhookEventId)

  return new Response(JSON.stringify({ ok: true, status, orderId: order.id }), { status: 200, headers: corsHeaders })
})
