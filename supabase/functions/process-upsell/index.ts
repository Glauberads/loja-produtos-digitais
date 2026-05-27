import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGatewayProvider } from '../_shared/providers/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessUpsellBody {
  parent_order_id: string
  upsell_offer_id: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: ProcessUpsellBody = await req.json()
    const { parent_order_id, upsell_offer_id } = body

    if (!parent_order_id || !upsell_offer_id) {
      throw new Error('Faltam parâmetros obrigatórios.')
    }

    // 1. Validar Parent Order
    const { data: parentOrder, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', parent_order_id)
      .single()

    if (orderError || !parentOrder) {
      throw new Error('Pedido original não encontrado.')
    }

    if (parentOrder.status !== 'approved') {
      throw new Error('Pedido original não está aprovado.')
    }

    // 2. Validar Oferta de Upsell
    const { data: offer, error: offerError } = await supabaseClient
      .from('upsell_offers')
      .select('*, upsell_product:products(*)')
      .eq('id', upsell_offer_id)
      .eq('active', true)
      .single()

    if (offerError || !offer) {
      throw new Error('Oferta de upsell não encontrada ou inativa.')
    }

    const upsellProduct = offer.upsell_product
    const finalAmount = parseFloat(offer.promotional_price)

    // 3. Proteger contra Upsell Duplicado
    const { data: existingUpsell } = await supabaseClient
      .from('orders')
      .select('id, status')
      .eq('parent_order_id', parent_order_id)
      .eq('product_id', offer.upsell_product_id)
      .eq('order_type', 'upsell')
      .maybeSingle()

    if (existingUpsell && existingUpsell.status === 'approved') {
      throw new Error('Você já adquiriu este upsell.')
    }

    // Se já gerou o PIX mas tá pendente, reaproveita? Não, vamos recriar o PIX pra segurança ou só negar e gerar de novo?
    // Vamos gerar uma nova order se a existente não for approved, ou reaproveitar se tiver pix valido? 
    // Pra manter simples, vamos criar a order. O UNIQUE index vai bloquear se for exatamente duplicada. 
    // Wait, o UNIQUE index é: parent_order_id + product_id onde order_type = 'upsell'.
    // Se existir pendente, o insert falhará. Então precisamos apagar a pendente ou atualizar.
    if (existingUpsell && (existingUpsell.status === 'pending' || existingUpsell.status === 'expired')) {
        await supabaseClient.from('orders').delete().eq('id', existingUpsell.id);
    }

    // 4. Criar a nova Order de Upsell no Supabase
    const tenantId = parentOrder.tenant_id
    const customerEmail = parentOrder.customer_email
    const customerName = parentOrder.customer_name
    const customerPhone = parentOrder.customer_phone

    const { data: newOrder, error: insertError } = await supabaseClient
      .from('orders')
      .insert({
        tenant_id: tenantId,
        product_id: offer.upsell_product_id,
        parent_order_id: parent_order_id,
        order_type: 'upsell',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        amount: finalAmount,
        currency: 'BRL',
        status: 'pending',
        payment_status: 'pending',
        gateway: parentOrder.gateway || 'mercadopago',
        fbp: parentOrder.fbp,
        fbc: parentOrder.fbc,
        utm_campaign: parentOrder.utm_campaign,
        affiliate_id: parentOrder.affiliate_id, // Atribui comissão de upsell ao afiliado original
        commission_amount: parentOrder.affiliate_id ? (finalAmount * 0.3) : 0, // Placeholder
        commission_status: 'pending'
      })
      .select('id')
      .single()

    if (insertError) {
      console.error(insertError)
      throw new Error('Erro ao registrar pedido de upsell.')
    }

    // 5. Gerar PIX no Gateway
    const gatewayProvider = getGatewayProvider(parentOrder.gateway || 'mercadopago')
    const externalResponse = await gatewayProvider.createPayment({
      amount: finalAmount,
      description: `Upsell - ${offer.title}`,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      product_id: offer.upsell_product_id,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`
    })

    if (!externalResponse.ok) {
      // Falha no gateway, atualizar order para failed
      await supabaseClient.from('orders').update({ status: 'failed', payment_status: 'failed' }).eq('id', newOrder.id)
      throw new Error(externalResponse.error || 'Erro ao comunicar com gateway de pagamento.')
    }

    // 6. Atualizar a nova order com os dados do gateway
    await supabaseClient
      .from('orders')
      .update({
        transaction_id: externalResponse.transaction_id,
        gateway_response: externalResponse.gateway_response
      })
      .eq('id', newOrder.id)

    return new Response(JSON.stringify({ 
      ok: true, 
      order_id: newOrder.id,
      amount: finalAmount,
      pix_code: externalResponse.pix_code,
      pix_qr_image: externalResponse.pix_qr_image,
      product_name: offer.title
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Erro geral no upsell:', error)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
