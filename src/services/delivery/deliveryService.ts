// ============================================================
// deliveryService.ts
// Serviço frontend para gerenciar acessos e downloads
// ============================================================

import { supabase } from '../../lib/supabase'
import type { ProductAccessRow, GetDownloadResponse } from '../../types/payment'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Busca todos os acessos de um cliente pelo email
 * Usado na Área de Membros
 */
export async function getAccessesByEmail(email: string): Promise<ProductAccessRow[]> {
  // Primeiro, busca o customer pelo email
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (customerError || !customer) {
    console.warn('[deliveryService] Cliente não encontrado para email:', email)
    return []
  }

  // Busca os acessos ativos
  const { data: accesses, error: accessError } = await supabase
    .from('product_access')
    .select(`
      *,
      products:product_id (
        id,
        name,
        short_description,
        checkout_url,
        icon_name,
        gradient
      ),
      orders:order_id (
        id,
        amount,
        paid_at,
        status
      )
    `)
    .eq('user_id', customer.id)
    .order('created_at', { ascending: false })

  if (accessError) {
    console.error('[deliveryService] Erro ao buscar acessos:', accessError)
    return []
  }

  return (accesses || []) as ProductAccessRow[]
}

/**
 * Busca acessos por order_id (para a tela de sucesso)
 */
export async function getAccessByOrderId(orderId: string): Promise<ProductAccessRow | null> {
  const { data, error } = await supabase
    .from('product_access')
    .select(`
      *,
      products:product_id (
        id,
        name,
        short_description,
        checkout_url,
        icon_name,
        gradient
      ),
      orders:order_id (
        id,
        amount,
        paid_at,
        status,
        customer_name,
        customer_email
      )
    `)
    .eq('order_id', orderId)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('[deliveryService] Erro ao buscar acesso por order:', error)
    return null
  }

  return data as ProductAccessRow | null
}

/**
 * Busca o token de download de um pedido específico
 */
export async function getDownloadTokenByOrderId(orderId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('downloads')
    .select('token, expires_at, download_count, max_downloads')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  // Verificar se ainda não expirou
  if (new Date(data.expires_at) < new Date()) return null

  // Verificar se não atingiu o limite
  if (data.download_count >= data.max_downloads) return null

  return data.token
}

/**
 * Valida um token de download via Edge Function (antifraude server-side)
 */
export async function validateAndConsumeDownloadToken(
  token: string,
  orderId?: string
): Promise<GetDownloadResponse> {
  const params = new URLSearchParams({ token })
  if (orderId) params.set('order', orderId)

  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-download?${params}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  const data = await response.json()
  return data as GetDownloadResponse
}

/**
 * Verifica se um pedido tem acesso ativo (para renderização condicional)
 */
export async function hasActiveAccess(orderId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('product_access')
    .select('id, active')
    .eq('order_id', orderId)
    .eq('active', true)
    .maybeSingle()

  return !error && data !== null
}

/**
 * Admin: Revogar acesso manualmente
 */
export async function revokeAccess(accessId: string): Promise<boolean> {
  const { error } = await supabase
    .from('product_access')
    .update({ active: false, revoked_at: new Date().toISOString() })
    .eq('id', accessId)

  return !error
}

/**
 * Admin: Reativar acesso
 */
export async function reactivateAccess(accessId: string): Promise<boolean> {
  const { error } = await supabase
    .from('product_access')
    .update({ active: true, revoked_at: null })
    .eq('id', accessId)

  return !error
}

/**
 * Admin: Busca todos os acessos com filtros
 */
export async function getAllAccesses(options: {
  activeOnly?: boolean
  limit?: number
  offset?: number
} = {}): Promise<ProductAccessRow[]> {
  let query = supabase
    .from('product_access')
    .select(`
      *,
      products:product_id (id, name),
      orders:order_id (id, amount, paid_at, status, customer_email, customer_name, gateway)
    `)
    .order('created_at', { ascending: false })

  if (options.activeOnly) {
    query = query.eq('active', true)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('[deliveryService] Erro ao buscar todos os acessos:', error)
    return []
  }

  return (data || []) as ProductAccessRow[]
}
