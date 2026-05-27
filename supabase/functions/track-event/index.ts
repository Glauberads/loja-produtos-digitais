// ============================================================
// Supabase Edge Function: track-event
// Endpoint: POST /functions/v1/track-event
// Usado pelo frontend para registrar eventos de tracking (CAPI) de forma segura.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { event_name, event_id, payload } = body

    if (!event_name) {
      return new Response(JSON.stringify({ error: 'event_name is required' }), { status: 400, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Inserir no event_queue para processamento async pelo CAPI
    const { error } = await supabase.from('event_queue').insert({
      tenant_id: payload?.tenant_id || '00000000-0000-0000-0000-000000000000',
      event_type: 'meta_capi',
      event_name: event_name,
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
      scheduled_at: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      payload: {
        event_name,
        event_id: event_id || crypto.randomUUID(),
        ...payload
      }
    })

    if (error) throw error

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error('Track event error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: corsHeaders })
  }
})
