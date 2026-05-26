import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../data/products';

// Store para proteção contra double-fire (duplicação) no frontend
const trackedEvents = new Set<string>();

export function useAnalytics() {
  const trackEvent = useCallback(async (eventName: string, metadata: Record<string, any> = {}) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventName,
          metadata: metadata
        });
      
      if (error) {
        console.error('Falha ao registrar evento analítico:', error);
      }
    } catch (err) {
      console.error('Erro de rede ao registrar evento analítico:', err);
    }
  }, []);

  // Handler seguro para Meta Pixel (Impede quebra do site e lida com AdBlock)
  const safeFbq = (action: string, eventName: string, params?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq(action, eventName, params);
    } else if (import.meta.env.DEV) {
      console.log(`[Meta Pixel Dev] ${action} ${eventName}`, params);
    }
  };

  const trackViewContent = useCallback((product: Product) => {
    const dedupKey = `view_content_${product.id}`;
    if (trackedEvents.has(dedupKey)) return;
    trackedEvents.add(dedupKey);

    trackEvent('view_content', { product_id: product.id, product_name: product.name, price: product.price });
    
    safeFbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'BRL'
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((product: Product) => {
    const dedupKey = `add_to_cart_${product.id}`;
    if (trackedEvents.has(dedupKey)) return;
    trackedEvents.add(dedupKey);

    trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price });
    
    safeFbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'BRL'
    });
  }, [trackEvent]);

  const trackInitiateCheckout = useCallback((cart: Product[], total: number) => {
    trackEvent('initiate_checkout', { cart_size: cart.length, total: total });

    const contents = cart.map(item => ({ id: item.id, quantity: 1, item_price: item.price }));
    safeFbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'BRL',
      num_items: cart.length,
      contents: contents
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((cart: Product[], total: number, orderId: string) => {
    const dedupKey = `purchase_${orderId}`;
    if (trackedEvents.has(dedupKey)) return;
    trackedEvents.add(dedupKey);

    trackEvent('purchase', { order_id: orderId, total: total, cart_size: cart.length });

    const contents = cart.map(item => ({ id: item.id, quantity: 1, item_price: item.price }));
    safeFbq('track', 'Purchase', {
      value: total,
      currency: 'BRL',
      contents: contents,
      order_id: orderId
    });
  }, [trackEvent]);

  const trackLead = useCallback((source: string, leadId?: string) => {
    const dedupKey = `lead_${leadId || Date.now()}`;
    if (trackedEvents.has(dedupKey)) return;
    trackedEvents.add(dedupKey);

    trackEvent('lead_captured', { source });
    
    safeFbq('track', 'Lead', {
      content_name: source
    });
  }, [trackEvent]);

  return { 
    trackEvent, 
    trackViewContent, 
    trackAddToCart, 
    trackInitiateCheckout, 
    trackPurchase, 
    trackLead 
  };
}
