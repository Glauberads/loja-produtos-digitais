import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SupabaseProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  rating: number;
  sales_count: number;
  badge: string | null;
  features: string[];
  tech_stack: string[];
  gradient: string | null;
  icon_name: string | null;
  image_url: string | null;
  video_url: string | null;
  details_url: string | null;
  checkout_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>;

export function useProducts(adminMode = false) {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!adminMode) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (input: ProductInput): Promise<boolean> => {
    try {
      const { error } = await supabase.from('products').insert([input]);
      if (error) throw error;
      await fetchProducts();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
      return false;
    }
  };

  const updateProduct = async (id: string, input: Partial<ProductInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchProducts();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchProducts();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir produto');
      return false;
    }
  };

  const toggleActive = async (id: string, active: boolean): Promise<boolean> => {
    return updateProduct(id, { active, updated_at: new Date().toISOString() } as Partial<ProductInput>);
  };

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct, toggleActive };
}
