// ============================================================
// paymentService.ts
// Serviço frontend para criar pedidos via Edge Function
// ============================================================

import { supabase } from '../../lib/supabase'
import type { CreateOrderParams, CreateOrderResponse, OrderRow, UTMData } from '../../types/payment'
import { getAffiliateCode } from '../../hooks/useAffiliateTracking'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Captura UTM params da URL atual
 */
export function captureUTMParams(): UTMData {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const data: UTMData = {}
  if (params.get('utm_source')) data.utm_source = params.get('utm_source')!
  if (params.get('utm_medium')) data.utm_medium = params.get('utm_medium')!
  if (params.get('utm_campaign')) data.utm_campaign = params.get('utm_campaign')!
  if (params.get('utm_content')) data.utm_content = params.get('utm_content')!
  if (params.get('utm_term')) data.utm_term = params.get('utm_term')!
  return data
}

/**
 * Captura cookies do Meta Pixel (_fbp, _fbc)
 */
export function captureMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : undefined
  }
  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
  }
}

/**
 * Cria um pedido e gera PIX via Edge Function create-payment
 * Salva UTMs, cookies Meta e event_id para rastreamento server-side
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  const affiliate_code = getAffiliateCode();
  const payload = { ...params };
  if (affiliate_code) {
    (payload as any).affiliate_code = affiliate_code;
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Erro ao criar pedido')
  }

  return data as CreateOrderResponse
}

/**
 * Envia eventos de tracking (Meta CAPI) de forma segura para o backend
 */
export async function trackServerEvent(eventName: string, payload: any = {}): Promise<void> {
  try {
    const metaCookies = captureMetaCookies()
    const utmParams = captureUTMParams()

    await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        event_name: eventName,
        event_id: crypto.randomUUID(),
        payload: {
          ...payload,
          fbp: metaCookies.fbp,
          fbc: metaCookies.fbc,
          ...utmParams,
          tenant_id: '00000000-0000-0000-0000-000000000000'
        }
      }),
    })
  } catch (err) {
    console.error('[Tracking] Failed to track server event:', err)
  }
}

/**
 * Busca um pedido por ID
 */
export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('[paymentService] Erro ao buscar order:', error)
    return null
  }

  return data as OrderRow
}

/**
 * Polling de status de um pedido com Exponential Backoff
 * Retorna quando status mudar de 'pending' ou timeout
 */
export async function pollOrderStatus(
  orderId: string,
  options: { initialIntervalMs?: number; maxAttempts?: number; onStatusChange?: (status: string) => void } = {}
): Promise<OrderRow | null> {
  const { initialIntervalMs = 5000, maxAttempts = 15, onStatusChange } = options
  let attempts = 0
  let currentInterval = initialIntervalMs

  return new Promise((resolve) => {
    const executePoll = async () => {
      attempts++
      const order = await getOrderById(orderId)

      if (order && ['approved', 'expired', 'canceled', 'failed'].includes(order.status)) {
        onStatusChange?.(order.status)
        resolve(order)
        return
      }

      if (attempts >= maxAttempts) {
        resolve(null) // Timeout
        return
      }

      // Exponential backoff with a cap at 10 seconds
      currentInterval = Math.min(currentInterval * 1.5, 10000)
      setTimeout(executePoll, currentInterval)
    }

    setTimeout(executePoll, currentInterval)
  })
}

/**
 * Subscrição Realtime para mudanças no status do pedido (mais eficiente que polling)
 */
export function subscribeToOrderStatus(
  orderId: string,
  onUpdate: (order: OrderRow) => void
) {
  const channel = supabase
    .channel(`order_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new as OrderRow)
      }
    )
    .subscribe()

  // Retorna função de cleanup
  return () => {
    supabase.removeChannel(channel)
  }
}
