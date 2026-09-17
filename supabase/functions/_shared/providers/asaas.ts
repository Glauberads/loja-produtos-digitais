import type { GatewayProvider, CreatePaymentParams, PaymentResult, WebhookValidationResult } from './types.ts'

// ============================================================
// Asaas Provider
// Docs: https://docs.asaas.com
// - Cobrança PIX: POST /v3/payments (billingType: 'PIX')
// - QR Code: GET /v3/payments/{id}/pixQrCode
// - Webhook: POST na URL configurada, autenticado via header
//   "asaas-access-token" contendo o authToken gerado no painel.
// ============================================================

const ASAAS_APPROVED_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'])
const ASAAS_REFUNDED_EVENTS = new Set(['PAYMENT_REFUNDED', 'PAYMENT_PARTIALLY_REFUNDED'])
const ASAAS_CHARGEBACK_EVENTS = new Set(['PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE', 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'])
const ASAAS_FAILED_EVENTS = new Set(['PAYMENT_OVERDUE', 'PAYMENT_DELETED', 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED', 'PAYMENT_REPROVED_BY_RISK_ANALYSIS'])

export class AsaasProvider implements GatewayProvider {
  private apiKey: string
  private webhookToken: string
  private baseUrl: string

  constructor(apiKey: string, webhookToken: string, environment: string = 'production') {
    this.apiKey = apiKey
    this.webhookToken = webhookToken
    this.baseUrl = environment === 'sandbox'
      ? 'https://api-sandbox.asaas.com/v3'
      : 'https://api.asaas.com/v3'
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      access_token: this.apiKey,
      'User-Agent': 'NexusSaaS/1.0.0',
    }
  }

  private async findOrCreateCustomer(customer: CreatePaymentParams['customer']): Promise<string | null> {
    try {
      const searchRes = await fetch(`${this.baseUrl}/customers?email=${encodeURIComponent(customer.email)}`, {
        headers: this.headers(),
      })
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        if (searchData.data?.length > 0) {
          return searchData.data[0].id
        }
      }

      const createRes = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          mobilePhone: customer.phone,
          cpfCnpj: customer.document,
        }),
      })

      if (!createRes.ok) {
        console.error('[Asaas] Erro ao criar cliente:', createRes.status, await createRes.text())
        return null
      }

      const createData = await createRes.json()
      return createData.id
    } catch (err) {
      console.error('[Asaas] Exceção ao buscar/criar cliente:', err)
      return null
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (!this.apiKey) {
      return { ok: false, error: 'Asaas API Key não configurada' }
    }

    try {
      const customerId = await this.findOrCreateCustomer(params.customer)
      if (!customerId) {
        return { ok: false, error: 'Falha ao criar/localizar cliente no Asaas' }
      }

      const dueDate = new Date().toISOString().split('T')[0]
      
      let payload: any = {
        customer: customerId,
        billingType: params.paymentMethod === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX',
        value: params.amount,
        dueDate,
        description: params.productName,
        externalReference: params.orderId,
      }

      if (params.paymentMethod === 'CREDIT_CARD' && params.creditCard) {
        payload.creditCard = {
          holderName: params.creditCard.holderName,
          number: params.creditCard.number,
          expiryMonth: params.creditCard.expiryMonth,
          expiryYear: params.creditCard.expiryYear,
          ccv: params.creditCard.ccv,
        }
        payload.creditCardHolderInfo = {
          name: params.customer.name,
          email: params.customer.email,
          cpfCnpj: params.customer.document || '',
          postalCode: params.creditCard.postalCode || '00000000',
          addressNumber: params.creditCard.addressNumber || '0',
          phone: params.customer.phone || '',
          mobilePhone: params.customer.phone || '',
        }
      }

      const paymentRes = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
      })

      if (!paymentRes.ok) {
        const errText = await paymentRes.text()
        console.error('[Asaas] Erro ao criar cobrança:', paymentRes.status, errText)
        return { ok: false, error: `Asaas Erro ${paymentRes.status}` }
      }

      const paymentData = await paymentRes.json()

      let pixCode = ''
      let pixQrImage = ''
      try {
        const qrRes = await fetch(`${this.baseUrl}/payments/${paymentData.id}/pixQrCode`, {
          headers: this.headers(),
        })
        if (qrRes.ok) {
          const qrData = await qrRes.json()
          pixCode = qrData.payload || ''
          pixQrImage = qrData.encodedImage || ''
        }
      } catch (qrErr) {
        console.error('[Asaas] Erro ao obter QR Code Pix:', qrErr)
      }

      return {
        ok: true,
        transactionId: String(paymentData.id),
        pixCode,
        pixQrImage,
        paymentUrl: paymentData.invoiceUrl,
        status: paymentData.status,
      }
    } catch (err: any) {
      console.error('[Asaas] Exceção:', err)
      return { ok: false, error: err.message }
    }
  }

  async validateWebhook(request: Request, body: any): Promise<WebhookValidationResult> {
    const receivedToken = request.headers.get('asaas-access-token')

    if (this.webhookToken && receivedToken !== this.webhookToken) {
      console.warn('[Asaas] Token de webhook inválido ou ausente')
      return { isValid: false, action: 'unknown', paymentId: 'unknown', status: 'unknown' }
    }

    const event = body?.event as string | undefined
    const payment = body?.payment

    if (!event || !payment?.id) {
      return { isValid: false, action: 'unknown', paymentId: payment?.id || 'unknown', status: 'unknown' }
    }

    let status: WebhookValidationResult['status'] = 'pending'
    if (ASAAS_APPROVED_EVENTS.has(event)) status = 'approved'
    else if (ASAAS_REFUNDED_EVENTS.has(event)) status = 'refunded'
    else if (ASAAS_CHARGEBACK_EVENTS.has(event)) status = 'chargeback'
    else if (ASAAS_FAILED_EVENTS.has(event)) status = 'failed'

    return {
      isValid: true,
      action: 'payment.updated',
      paymentId: String(payment.id),
      orderId: payment.externalReference || undefined,
      status,
      amount: payment.value,
      rawEvent: body,
    }
  }
}
