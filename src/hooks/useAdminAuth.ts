import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkIsAdmin(session.user.id);
        setState({ user: session.user, session, isAdmin, loading: false, error: null });
      } else {
        setState({ user: null, session: null, isAdmin: false, loading: false, error: null });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isAdmin = await checkIsAdmin(session.user.id);
        setState({ user: session.user, session, isAdmin, loading: false, error: null });
      } else {
        setState({ user: null, session: null, isAdmin: false, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const isAdmin = await checkIsAdmin(data.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setState(prev => ({ ...prev, loading: false, error: 'Acesso negado. Você não é um administrador autorizado.' }));
          return false;
        }
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setState(prev => ({ ...prev, loading: false, error: message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : message }));
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, login, logout };
}
