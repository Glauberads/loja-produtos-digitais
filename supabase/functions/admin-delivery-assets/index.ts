// ============================================================
// Supabase Edge Function: admin-delivery-assets
// Endpoint: POST /functions/v1/admin-delivery-assets
//
// Administra links de entrega para os produtos.
// Valida JWT e checa a tabela real de administradores.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  // Service client is only used for DB operations requiring bypass of RLS
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Validar o JWT através do client configurado com o token recebido
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token não fornecido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    // Usar auth.getUser para validar o token
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido ou expirado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Verificar permissão de admin na tabela real (NÃO CONFIAR em user_metadata)
    const { data: adminUser, error: adminError } = await supabaseService
      .from('admin_users')
      .select('id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !adminUser) {
      return new Response(JSON.stringify({ error: 'Acesso negado: Requer privilégios de administrador.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Process GET request: Fetch existing delivery asset for a product
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const productId = url.searchParams.get('product_id')
      if (!productId) {
        return new Response(JSON.stringify({ error: 'product_id não fornecido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const { data: asset, error: assetError } = await supabaseService
        .from('product_delivery_assets')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle()
      
      if (assetError) {
        return new Response(JSON.stringify({ error: 'Erro ao buscar asset' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ data: asset }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Process POST request: Upsert delivery asset
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { product_id, provider, delivery_url, is_active } = await req.json()

    // 3. Validações de payload
    if (!product_id || !provider || !delivery_url) {
      return new Response(JSON.stringify({ error: 'Dados incompletos: product_id, provider e delivery_url são obrigatórios.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const trimmedUrl = delivery_url.trim()
    if (!trimmedUrl.startsWith('https://')) {
      return new Response(JSON.stringify({ error: 'A URL de entrega deve ser segura e começar com https://' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    try {
      new URL(trimmedUrl) // Verifica malformação
    } catch {
      return new Response(JSON.stringify({ error: 'URL malformada.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Validar se produto existe
    const { data: productCheck, error: productCheckError } = await supabaseService
      .from('products')
      .select('id')
      .eq('id', product_id)
      .maybeSingle()

    if (productCheckError || !productCheck) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 4. Executar Upsert pelo service_role
    const { data, error } = await supabaseService
      .from('product_delivery_assets')
      .upsert({
        product_id,
        provider,
        delivery_url: trimmedUrl,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }, { onConflict: 'product_id' })
      .select('id, product_id, provider, delivery_url, is_active')
      .single()

    if (error) {
      console.error('[AdminDeliveryAssets] Erro ao realizar upsert:', error)
      return new Response(JSON.stringify({ error: 'Erro ao salvar configuração de entrega.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[AdminDeliveryAssets] Erro crítico:', error)
    return new Response(JSON.stringify({ error: 'Erro interno ao processar requisição' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
