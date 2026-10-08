import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  role: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Omit<AdminAuthState, 'login' | 'logout' | 'requestPasswordReset' | 'updatePassword'>>({
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
    let mounted = true;

    // Timeout fallback just in case both getSession and onAuthStateChange fail to resolve
    const fallbackTimer = setTimeout(() => {
      if (mounted && state.loading) {
        setState(prev => ({ ...prev, loading: false, error: 'Tempo limite excedido ao carregar sessão.' }));
      }
    }, 5000);

    const loadSession = async (session: Session | null) => {
      if (!session?.user) {
        if (mounted) setState({ user: null, session: null, isAdmin: false, role: null, loading: false, error: null });
        return;
      }
      try {
        const { isAdmin, role } = await fetchAdminDetails(session.user.id);
        if (mounted) setState({ user: session.user, session, isAdmin, role, loading: false, error: null });
      } catch {
        if (mounted) setState({ user: null, session: null, isAdmin: false, role: null, loading: false, error: null });
      }
    };

    // 1. Manually fetch the current session (vital on page reload!)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (mounted) setState(prev => ({ ...prev, loading: false, error: error.message }));
      } else {
        loadSession(session);
      }
    });

    // 2. Listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSession(session);
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []); // Only runs once per app lifecycle!

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

  const requestPasswordReset = async (email: string) => {
    try {
      const redirectTo = 'https://www.omelhordodigital.com.br/admin/reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return { success: true, message: 'Enviamos um link de redefinição para o seu e-mail.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao solicitar redefinição de senha.';
      return { success: false, message };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true, message: 'Senha atualizada com sucesso.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar a senha.';
      return { success: false, message };
    }
  };

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout, requestPasswordReset, updatePassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
