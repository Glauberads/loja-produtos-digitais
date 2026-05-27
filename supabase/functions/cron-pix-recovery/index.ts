// ============================================================
// Supabase Edge Function: cron-pix-recovery
// Verifica orders pending (PIX) criadas há mais de 15 minutos
// e enfileira eventos de recuperação no N8N.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 15 minutos atrás
  const timeThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  // 60 minutos atrás (para não buscar orders muito antigas na cron de 15m)
  const timeLimit = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // Buscar orders pendentes
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select('id, tenant_id, customer_email, customer_name, customer_phone, product_id, amount, created_at')
    .eq('status', 'pending')
    .gte('created_at', timeLimit)
    .lte('created_at', timeThreshold)

  if (error || !pendingOrders || pendingOrders.length === 0) {
    return new Response(JSON.stringify({ message: 'No abandoned PIX to recover' }), { status: 200 })
  }

  // Verificar quais já foram enfileiradas para recovery (evitar spam)
  const orderIds = pendingOrders.map(o => o.id)
  
  const { data: existingEvents } = await supabase
    .from('event_queue')
    .select('payload->>order_id')
    .eq('event_type', 'pix_recovery')
    .in('payload->>order_id', orderIds)

  const recoveredOrderIds = new Set(existingEvents?.map(e => e.order_id) || [])

  const eventsToQueue = pendingOrders
    .filter(order => !recoveredOrderIds.has(order.id))
    .map(order => ({
      tenant_id: order.tenant_id || '00000000-0000-0000-0000-000000000000',
      event_type: 'pix_recovery',
      event_name: 'pix_abandoned',
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
      scheduled_at: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      payload: {
        event: 'pix_abandoned',
        order_id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        product_id: order.product_id,
        amount: order.amount,
        created_at: order.created_at,
      }
    }))

  if (eventsToQueue.length > 0) {
    const { error: insertError } = await supabase.from('event_queue').insert(eventsToQueue)
    if (insertError) {
      console.error('Error queueing PIX recovery:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ queued: eventsToQueue.length }), { status: 200 })
})
