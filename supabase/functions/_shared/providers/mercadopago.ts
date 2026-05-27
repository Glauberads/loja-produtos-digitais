import type { GatewayProvider, CreatePaymentParams, PaymentResult, WebhookValidationResult } from './types.ts'

export class MercadoPagoProvider implements GatewayProvider {
  private accessToken: string
  private webhookUrl: string

  constructor(accessToken: string, webhookUrl: string) {
    this.accessToken = accessToken
    this.webhookUrl = webhookUrl
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (!this.accessToken) {
      return { ok: false, error: 'Mercado Pago Token não configurado' }
    }

    try {
      const mpPayload = {
        transaction_amount: params.amount,
        description: params.productName,
        payment_method_id: 'pix',
        external_reference: params.orderId,
        payer: {
          email: params.customer.email,
          first_name: params.customer.name.split(' ')[0],
          last_name: params.customer.name.split(' ').slice(1).join(' ') || '',
          identification: { type: 'CPF', number: params.customer.document || '00000000000' },
        },
        notification_url: this.webhookUrl,
        metadata: {
          order_id: params.orderId,
          ...params.metadata
        },
      }

      const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
          'X-Idempotency-Key': params.orderId,
        },
        body: JSON.stringify(mpPayload),
      })

      if (!mpRes.ok) {
        const errText = await mpRes.text()
        console.error('[MP] Erro ao gerar PIX:', mpRes.status, errText)
        return { ok: false, error: `MP Erro ${mpRes.status}` }
      }

      const mpData = await mpRes.json()
      return {
        ok: true,
        transactionId: String(mpData.id),
        pixCode: mpData.point_of_interaction?.transaction_data?.qr_code || '',
        pixQrImage: mpData.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        status: mpData.status,
      }
    } catch (err: any) {
      console.error('[MP] Exceção:', err)
      return { ok: false, error: err.message }
    }
  }

  async validateWebhook(request: Request, body: any): Promise<WebhookValidationResult> {
    const topic = (new URL(request.url)).searchParams.get('topic') || body.type || body.action
    const id = (new URL(request.url)).searchParams.get('id') || body.data?.id
    
    if (!id || (topic !== 'payment' && topic !== 'payment.updated')) {
      return { isValid: false, action: 'unknown', paymentId: id || 'unknown', status: 'unknown' }
    }

    // MP Requer buscar na API para ver status real e evitar spoofing
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      })
      if (!res.ok) return { isValid: false, action: 'unknown', paymentId: id, status: 'unknown' }

      const payment = await res.json()
      return {
        isValid: true,
        action: 'payment.updated',
        paymentId: id,
        orderId: payment.external_reference,
        status: payment.status === 'approved' ? 'approved' : 
                payment.status === 'refunded' ? 'refunded' : 
                payment.status === 'charged_back' ? 'chargeback' : 
                payment.status === 'rejected' ? 'failed' : 'pending',
        amount: payment.transaction_amount,
        rawEvent: payment
      }
    } catch (err) {
      console.error('[MP] Webhook validation error:', err)
      return { isValid: false, action: 'unknown', paymentId: id, status: 'unknown' }
    }
  }
}
