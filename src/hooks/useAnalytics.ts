import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

  return { trackEvent };
}
