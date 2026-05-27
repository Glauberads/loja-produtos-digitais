// ============================================================
// Tipos TypeScript para o sistema de pagamento/entrega
// ============================================================

export type OrderStatus = 'pending' | 'approved' | 'refunded' | 'chargeback' | 'expired' | 'failed'
export type PaymentGateway = 'mercadopago' | 'pushinpay' | 'asaas' | 'pagarme' | 'stripe'
export type AccessLevel = 'full' | 'trial' | 'limited'

export interface CreateOrderParams {
  product_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  gateway?: PaymentGateway
  coupon_code?: string
  // Order Bump
  order_bump_id?: string
  order_bump_amount?: number
  // UTM
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  // Meta Pixel
  fbp?: string
  fbc?: string
  event_id?: string
}

export interface CreateOrderResponse {
  ok: boolean
  order_id: string
  event_id: string
  amount: number
  currency: string
  gateway: string
  pix_code?: string
  pix_qr_image?: string
  payment_url?: string
  product_name: string
  gateway_payment_id?: string
  error?: string
}

export interface OrderRow {
  id: string
  customer_id?: string
  product_id: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  amount: number
  currency: string
  status: OrderStatus
  payment_status: string
  gateway?: PaymentGateway
  transaction_id?: string
  checkout_session_id?: string
  coupon_code?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbp?: string
  fbc?: string
  event_id?: string
  gateway_response?: Record<string, unknown>
  created_at: string
  updated_at: string
  paid_at?: string
}

export interface ProductAccessRow {
  id: string
  user_id?: string
  product_id: string
  order_id: string
  active: boolean
  access_level: AccessLevel
  created_at: string
  revoked_at?: string
  // Joins
  products?: {
    id: string
    name: string
    short_description: string
    checkout_url?: string
    icon_name?: string
    gradient?: string
  }
  orders?: {
    id: string
    amount: number
    paid_at?: string
    status: OrderStatus
  }
}

export interface DownloadRow {
  id: string
  user_id?: string
  product_id: string
  order_id: string
  token: string
  expires_at: string
  max_downloads: number
  download_count: number
  ip?: string
  user_agent?: string
  created_at: string
  last_downloaded_at?: string
}

export interface GetDownloadResponse {
  ok: boolean
  product_name: string
  delivery_url?: string
  downloads_remaining: number
  expires_at: string
  error?: string
  expired?: boolean
  limit_reached?: boolean
}

export interface CheckoutFormData {
  name: string
  email: string
  phone: string
}

export interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}
