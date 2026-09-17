export * from './types.ts'
export { MercadoPagoProvider } from './mercadopago.ts'
export { StripeProvider } from './stripe.ts'
export { AsaasProvider } from './asaas.ts'

import { MercadoPagoProvider } from './mercadopago.ts'
import { StripeProvider } from './stripe.ts'
import { AsaasProvider } from './asaas.ts'
import type { GatewayProvider } from './types.ts'

export function getGatewayProvider(gateway: string): GatewayProvider {
  if (gateway === 'mercadopago') {
    const token = Deno.env.get('MP_ACCESS_TOKEN') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`
    return new MercadoPagoProvider(token, webhookUrl)
  }

  if (gateway === 'stripe') {
    return new StripeProvider(Deno.env.get('STRIPE_SECRET_KEY') || '')
  }

  if (gateway === 'asaas') {
    const apiKey = Deno.env.get('ASAAS_API_KEY') || ''
    const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN') || ''
    const environment = Deno.env.get('ASAAS_ENVIRONMENT') || 'production'
    return new AsaasProvider(apiKey, webhookToken, environment)
  }

  throw new Error(`Gateway não suportado ou provider não implementado: ${gateway}`)
}
