import type { GatewayProvider, CreatePaymentParams, PaymentResult, WebhookValidationResult } from './types.ts'

export class StripeProvider implements GatewayProvider {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  // Not implemented fully yet since Stripe is Phase 2 for Cards/Recurrence,
  // but keeping the interface standard.
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (!this.secretKey) return { ok: false, error: 'Stripe Key not configured' }
    
    // In Phase 2, this will create a Stripe Checkout Session or PaymentIntent
    return {
      ok: false,
      error: 'Stripe PIX/Payment not implemented yet. Use Mercado Pago for Phase 1.'
    }
  }

  async validateWebhook(request: Request, body: any): Promise<WebhookValidationResult> {
    // Phase 2: Validate Stripe Signature
    return {
      isValid: false,
      action: 'unknown',
      paymentId: '',
      status: 'unknown'
    }
  }
}
