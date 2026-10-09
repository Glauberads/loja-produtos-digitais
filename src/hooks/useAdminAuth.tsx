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

    const clearState = () => {
      if (mounted) setState({ user: null, session: null, isAdmin: false, role: null, loading: false, error: null });
    };

    // Auto-signOut clears corrupted/expired tokens from localStorage
    // so the user doesn't need to manually clear cookies
    const forceCleanSignOut = async () => {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // If even signOut fails, manually clear Supabase keys from localStorage
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch { /* ignore */ }
      }
      clearState();
    };

    // Timeout fallback: if session loading takes too long, force clean and let user re-login
    const fallbackTimer = setTimeout(() => {
      if (mounted && state.loading) {
        console.warn('[Auth] Session load timeout – clearing stale session');
        forceCleanSignOut();
      }
    }, 6000);

    const loadSession = async (session: Session | null) => {
      if (!session?.user) {
        clearState();
        return;
      }
      try {
        const { isAdmin, role } = await fetchAdminDetails(session.user.id);
        if (mounted) setState({ user: session.user, session, isAdmin, role, loading: false, error: null });
      } catch {
        clearState();
      }
    };

    // 1. Manually fetch the current session (vital on page reload!)
    //    Then verify it's still valid by attempting a token refresh.
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        // Session retrieval failed – clear corrupted tokens automatically
        console.warn('[Auth] getSession error, clearing stale session:', error.message);
        await forceCleanSignOut();
        return;
      }

      if (!session) {
        // No session at all – nothing to clean, just show login
        clearState();
        return;
      }

      // Session exists – verify it's still valid by checking token expiry
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at ?? 0;
      const isExpired = expiresAt > 0 && expiresAt < now;

      if (isExpired) {
        // Token is expired, try to refresh it
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          // Refresh failed – stale session, auto-clean so user can re-login
          console.warn('[Auth] Session expired and refresh failed – clearing stale session');
          await forceCleanSignOut();
          return;
        }
        // Refresh succeeded – use the new session
        loadSession(refreshData.session);
      } else {
        // Session looks valid
        loadSession(session);
      }
    }).catch(async () => {
      // Unexpected error (network, etc.) – clean up gracefully
      console.warn('[Auth] Unexpected error loading session – clearing');
      await forceCleanSignOut();
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
