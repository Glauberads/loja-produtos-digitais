export interface GatewayProvider {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  validateWebhook(request: Request, body: any): Promise<WebhookValidationResult>
  refundPayment?(transactionId: string): Promise<boolean>
  createSubscription?(params: CreateSubscriptionParams): Promise<SubscriptionResult>
}

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency: string
  productName: string
  customer: {
    email: string
    name: string
    phone?: string
    document?: string
  }
  metadata?: any
}

export interface PaymentResult {
  ok: boolean
  transactionId?: string
  pixCode?: string
  pixQrImage?: string
  paymentUrl?: string
  status?: string
  error?: string
}

export interface WebhookValidationResult {
  isValid: boolean
  action: 'payment.updated' | 'payment.created' | 'refund' | 'unknown'
  paymentId: string
  orderId?: string
  status: 'approved' | 'pending' | 'failed' | 'refunded' | 'chargeback' | 'unknown'
  amount?: number
  rawEvent?: any
}

export interface CreateSubscriptionParams {
  orderId: string
  planId: string
  customer: any
}

export interface SubscriptionResult {
  ok: boolean
  subscriptionId?: string
  paymentUrl?: string
  error?: string
}
