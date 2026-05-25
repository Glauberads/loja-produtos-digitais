import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from './useAdminAuth';

export type SavedConfigs = Record<string, Record<string, string>>;

const SETTINGS_ID = 'payment_gateway_configs';

export function useIntegrations() {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfigs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdminAuth();

  const fetchIntegrations = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('id', SETTINGS_ID)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      
      if (data?.value) {
        setSavedConfigs(data.value as SavedConfigs);
      }
    } catch (err: unknown) {
      console.error('Error fetching integrations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar integrações');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const updateIntegrations = async (newConfigs: SavedConfigs): Promise<boolean> => {
    if (!isAdmin) return false;
    
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          id: SETTINGS_ID, 
          value: newConfigs,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      setSavedConfigs(newConfigs);
      return true;
    } catch (err: unknown) {
      console.error('Error saving integrations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar integrações');
      return false;
    }
  };

  return { savedConfigs, loading, error, updateIntegrations };
}
