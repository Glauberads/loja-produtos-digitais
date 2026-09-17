import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAdminAuth();

  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // O Supabase detecta o token de recovery na URL (hash) automaticamente
    // e dispara o evento PASSWORD_RECOVERY quando a sessão é criada.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Caso o evento já tenha disparado antes do listener ser registrado,
    // verifica se já existe uma sessão ativa.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black tech-grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-brand-orange/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-neonOrange flex items-center justify-center shadow-neon-orange">
            <Zap size={26} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white tracking-wider">
              NEXUS<span className="text-brand-orange">SAAS</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 py-1 rounded-full mt-2">
              <ShieldCheck size={10} />
              Redefinir Senha
            </span>
          </div>
        </div>

        <div className="glassmorphism rounded-3xl p-8 border border-white/8 shadow-2xl">
          {checkingSession ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-white/40">Validando link de redefinição...</p>
            </div>
          ) : !sessionReady ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>Link inválido ou expirado. Solicite uma nova redefinição de senha.</span>
              </div>
              <a href="/admin/login" className="text-xs text-brand-orange hover:underline">
                ← Voltar para o login
              </a>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
              <p className="text-sm text-white/70">Senha atualizada! Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Defina sua nova senha</h2>
                <p className="text-xs text-white/40 mt-1">Escolha uma senha forte com pelo menos 6 caracteres.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Nova senha</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Confirmar senha</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Atualizar Senha
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-5 text-center">
          <a href="/" className="text-xs text-white/30 hover:text-brand-orange transition-colors">
            ← Voltar para a Loja
          </a>
        </div>
      </motion.div>
    </div>
  );
};
