import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAdmin, user, requestPasswordReset } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setForgotResult(null);
    const result = await requestPasswordReset(forgotEmail);
    setForgotResult(result);
    setForgotSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black tech-grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-brand-orange/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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
              Painel Super Admin
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-brand-darkGray/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {forgotMode ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => { setForgotMode(false); setForgotResult(null); }}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-4"
                >
                  <ArrowLeft size={13} /> Voltar ao login
                </button>
                <h2 className="text-xl font-bold text-white">Recuperar senha</h2>
                <p className="text-xs text-white/40 mt-1">Informe seu e-mail de administrador para receber o link de redefinição.</p>
              </div>

              {forgotResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm mb-5 ${
                    forgotResult.success
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {forgotResult.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                  <span>{forgotResult.message}</span>
                </motion.div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">E-mail</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="admin@nexussaas.com.br"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2 flex items-center justify-center gap-2"
                >
                  {forgotSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Enviar link de redefinição
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
                <p className="text-xs text-white/40 mt-1">Insira suas credenciais de administrador para continuar.</p>
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
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">E-mail</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@nexussaas.com.br"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Senha</label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotResult(null); }}
                      className="text-[11px] text-brand-orange/80 hover:text-brand-orange transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Entrar no Painel
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-white/25 font-mono">
            <ShieldCheck size={10} />
            <span>Ambiente seguro e criptografado — Acesso exclusivo ao Super Admin</span>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-5 text-center">
          <a href="/" className="text-xs text-white/30 hover:text-brand-orange transition-colors">
            ← Voltar para a Loja
          </a>
        </div>
      </motion.div>
    </div>
  );
};
