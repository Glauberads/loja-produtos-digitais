import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MemberAreaSettings {
  id?: string;
  tenant_id?: string;
  title: string;
  subtitle: string;
  welcome_text?: string;
  banner_url?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  support_whatsapp?: string;
  support_link?: string;
  button_text: string;
  custom_notice?: string;
  show_downloads: boolean;
  show_products: boolean;
  show_support: boolean;
  show_orders: boolean;
  layout_config?: any;
  active: boolean;
}

const defaultSettings: MemberAreaSettings = {
  title: 'Minha Área',
  subtitle: 'Acesse seus produtos',
  primary_color: '#FF6A00',
  secondary_color: '#3B82F6',
  button_text: 'Acessar Produto',
  show_downloads: true,
  show_products: true,
  show_support: true,
  show_orders: true,
  active: true,
};

export function useMemberSettings() {
  const [settings, setSettings] = useState<MemberAreaSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
      if (!tenant) throw new Error('Tenant não encontrado');

      const { data, error } = await supabase
        .from('member_area_settings')
        .select('*')
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data as MemberAreaSettings);
      }
    } catch (err: any) {
      console.error('Erro ao buscar configurações da Área de Membros:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<MemberAreaSettings>) => {
    try {
      const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
      if (!tenant) throw new Error('Tenant não encontrado');

      const payload = { ...newSettings, tenant_id: tenant.id };

      if (settings.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('member_area_settings')
          .update(payload)
          .eq('id', settings.id)
          .select()
          .single();
        if (error) throw error;
        setSettings(data as MemberAreaSettings);
      } else {
        // Criar
        const { data, error } = await supabase
          .from('member_area_settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setSettings(data as MemberAreaSettings);
      }
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      throw err;
    }
  };

  return { settings, setSettings, loading, error, saveSettings, fetchSettings, defaultSettings };
}
