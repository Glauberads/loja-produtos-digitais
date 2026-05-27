// ============================================================
// Supabase Edge Function: get-download
// Endpoint: GET /functions/v1/get-download?token=xxx
//
// Valida token de download, aplica antifraude e retorna URL de acesso
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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const orderId = url.searchParams.get('order')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token não fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 1. Buscar token no banco ────────────────────────────
    const { data: download, error: downloadError } = await supabase
      .from('downloads')
      .select(`
        *,
        products:product_id (id, name, checkout_url, details_url)
      `)
      .eq('token', token)
      .maybeSingle()

    if (downloadError || !download) {
      return new Response(JSON.stringify({ error: 'Token inválido ou expirado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Verificar expiração ──────────────────────────────
    if (new Date(download.expires_at) < new Date()) {
      return new Response(JSON.stringify({
        error: 'Link expirado. Entre em contato com o suporte para renovar seu acesso.',
        expired: true,
      }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Verificar limite de downloads ───────────────────
    if (download.download_count >= download.max_downloads) {
      return new Response(JSON.stringify({
        error: `Limite de ${download.max_downloads} downloads atingido. Entre em contato com o suporte.`,
        limit_reached: true,
        download_count: download.download_count,
        max_downloads: download.max_downloads,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Verificar se order ainda está aprovada ──────────
    if (orderId || download.order_id) {
      const { data: orderCheck } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId || download.order_id)
        .single()

      if (orderCheck && !['approved'].includes(orderCheck.status)) {
        return new Response(JSON.stringify({
          error: 'Pedido não está aprovado. Verifique o status do seu pagamento.',
          order_status: orderCheck.status,
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── 5. Coletar dados de antifraude ─────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('cf-connecting-ip') ||
               req.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // ── 6. Incrementar contador + registrar acesso ─────────
    const { error: updateError } = await supabase
      .from('downloads')
      .update({
        download_count: download.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
        ip,
        user_agent: userAgent,
      })
      .eq('id', download.id)

    if (updateError) {
      console.error('[Download] Erro ao atualizar contador:', updateError)
    }

    console.log(`[Download] Token usado: ${token.slice(0, 8)}... | Download ${download.download_count + 1}/${download.max_downloads} | IP: ${ip}`)

    // ── 7. Buscar link de entrega do produto ───────────────
    const product = download.products as { id: string; name: string; checkout_url: string; details_url: string } | null
    const deliveryUrl = product?.checkout_url || product?.details_url || null

    // ── 8. Retornar dados de acesso ────────────────────────
    return new Response(JSON.stringify({
      ok: true,
      product_name: product?.name || 'Produto',
      delivery_url: deliveryUrl,
      downloads_remaining: download.max_downloads - (download.download_count + 1),
      expires_at: download.expires_at,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[GetDownload] Erro crítico:', error)
    return new Response(JSON.stringify({ error: 'Erro interno ao processar download' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
