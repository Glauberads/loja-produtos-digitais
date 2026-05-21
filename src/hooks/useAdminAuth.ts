import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  role: string | null;
  loading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    role: null,
    loading: true,
    error: null,
  });

  const fetchAdminDetails = async (userId: string): Promise<{ isAdmin: boolean; role: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();
      if (error || !data) return { isAdmin: false, role: null };
      return { isAdmin: true, role: data.role };
    } catch {
      return { isAdmin: false, role: null };
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { isAdmin, role } = await fetchAdminDetails(session.user.id);
        setState({ user: session.user, session, isAdmin, role, loading: false, error: null });
      } else {
        setState({ user: null, session: null, isAdmin: false, role: null, loading: false, error: null });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { isAdmin, role } = await fetchAdminDetails(session.user.id);
        setState({ user: session.user, session, isAdmin, role, loading: false, error: null });
      } else {
        setState({ user: null, session: null, isAdmin: false, role: null, loading: false, error: null });
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
        const { isAdmin, role } = await fetchAdminDetails(data.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setState(prev => ({ ...prev, loading: false, role: null, error: 'Acesso negado. Você não é um administrador autorizado.' }));
          return false;
        }
        setState(prev => ({ ...prev, isAdmin, role, loading: false }));
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
