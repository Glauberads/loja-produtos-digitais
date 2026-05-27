// ============================================================
// Supabase Edge Function: process-event-queue
// Cron-triggered worker para processar eventos assíncronos
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function hashSHA256(text: string): Promise<string> {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(text.trim().toLowerCase()))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function processMetaCAPIEvent(payload: any, eventName: string) {
  const pixelId = Deno.env.get('META_PIXEL_ID')
  const capiToken = Deno.env.get('META_CAPI_TOKEN')
  if (!pixelId || !capiToken) throw new Error('Meta CAPI credentials missing')

  const userData: Record<string, string> = {}
  if (payload.customer_email) userData.em = await hashSHA256(payload.customer_email)
  if (payload.customer_phone) userData.ph = await hashSHA256(payload.customer_phone.replace(/\D/g, ''))
  if (payload.fbp) userData.fbp = payload.fbp
  if (payload.fbc) userData.fbc = payload.fbc

  const data = {
    data: [{
      event_name: eventName || payload.event_name || 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: payload.event_id,
      event_source_url: payload.event_source_url || 'https://nexussaas.com.br',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value: payload.amount,
        currency: payload.currency || 'BRL',
        content_ids: payload.product_id ? [payload.product_id] : [],
        content_type: 'product',
        order_id: payload.order_id,
      },
    }],
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${capiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`CAPI Error: ${errorText}`)
  }
  
  return await res.json()
}

async function processN8NEvent(payload: any) {
  const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL')
  if (!n8nUrl) throw new Error('N8N URL missing')

  const res = await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`N8N Error: ${res.status}`)
  }
}

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: events, error } = await supabase
    .from('event_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .limit(20)

  if (error || !events || events.length === 0) {
    return new Response(JSON.stringify({ message: 'No events to process' }), { status: 200 })
  }

  const eventIds = events.map(e => e.id)
  // Marcar como processing
  await supabase.from('event_queue').update({ status: 'processing' }).in('id', eventIds)

  for (const event of events) {
    try {
      let resultData = null
      if (event.event_type === 'meta_capi') {
        resultData = await processMetaCAPIEvent(event.payload, event.event_name)
      } else if (event.event_type === 'n8n_webhook' || event.event_type === 'pix_recovery') {
        await processN8NEvent(event.payload)
      } else {
        // Mock success para handlers não implementados nesta versão mínima
        console.log(`Handler ${event.event_type} not strictly implemented yet, marked completed.`)
      }

      // Update success
      const updateData: any = { 
        status: 'completed', 
        processed_at: new Date().toISOString(),
        attempts: event.attempts + 1
      }
      if (resultData) {
        updateData.payload = { ...event.payload, _response: resultData }
      }

      await supabase.from('event_queue').update(updateData).eq('id', event.id)

    } catch (err: any) {
      console.error(`Error processing event ${event.id}:`, err.message)
      const attempts = (event.attempts || 0) + 1
      const maxAttempts = event.max_attempts || 5
      
      let nextStatus = 'pending'
      let scheduledAt = new Date(Date.now() + (Math.pow(2, attempts) * 60000)).toISOString()

      if (attempts >= maxAttempts) {
        nextStatus = 'dead'
        scheduledAt = event.scheduled_at // keeps the same
      }
      
      await supabase.from('event_queue').update({
        status: nextStatus,
        last_error: err.message,
        attempts: attempts,
        scheduled_at: scheduledAt
      }).eq('id', event.id)
    }
  }

  return new Response(JSON.stringify({ processed: events.length }), { status: 200 })
})
