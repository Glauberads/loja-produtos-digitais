import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package, Download, ExternalLink, Clock, ShieldCheck,
  AlertTriangle, CheckCircle2, RefreshCw, Lock, Mail,
  MessageCircle, Calendar, CreditCard,
  Loader2
} from 'lucide-react';
import { getAccessesByEmail, getAccessByOrderId, validateAndConsumeDownloadToken } from '../services/delivery/deliveryService';
import { getOrderById } from '../services/payments/paymentService';
import { useMemberSettings } from '../hooks/useMemberSettings';
import type { ProductAccessRow, OrderRow } from '../types/payment';

// ── Componente de Card de Produto ────────────────────────────
const ProductAccessCard: React.FC<{
  access: ProductAccessRow;
  onDownload: (access: ProductAccessRow) => void;
  downloading: string | null;
  buttonText?: string;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ access, onDownload, downloading, buttonText = 'Acessar Produto', primaryColor = '#FF6A00' }) => {
  const product = access.products as any;
  const order = access.orders as any;
  const isActive = access.active;
  const isDownloading = downloading === access.id;

  const statusConfig = {
    approved: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Ativo' },
    refunded: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Reembolsado' },
    chargeback: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Contestado' },
  };
  const orderStatus = order?.status as string || 'approved';
  const sc = statusConfig[orderStatus as keyof typeof statusConfig] || statusConfig.approved;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${
      isActive
        ? 'bg-[#0B1020]/80 border-white/10 hover:border-white/20'
        : 'bg-[#0B1020]/40 border-white/5 opacity-60'
    }`}>
      <div className="flex items-start gap-4">
        {/* Ícone do produto */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product?.gradient || 'from-brand-orange/20 to-orange-600/30'} flex items-center justify-center shrink-0 border border-white/5`}>
          <Package size={20} className="text-white/80" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-white leading-tight truncate">
              {product?.name || 'Produto'}
            </h3>
            <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.border} border ${sc.color} uppercase tracking-wider`}>
              {isActive ? sc.label : 'Revogado'}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mb-3 truncate">
            {product?.short_description || 'Sistema digital com código-fonte completo'}
          </p>

          {/* Metadados */}
          <div className="flex items-center gap-3 text-[10px] text-white/30 mb-4">
            {order?.paid_at && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(order.paid_at).toLocaleDateString('pt-BR')}
              </span>
            )}
            {order?.amount && (
              <span className="flex items-center gap-1">
                <CreditCard size={10} />
                R$ {Number(order.amount).toFixed(2)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <ShieldCheck size={10} />
              Licença Whitelabel
            </span>
          </div>

          {/* Ações */}
          {isActive ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDownload(access)}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: primaryColor, boxShadow: `0 4px 14px 0 ${primaryColor}40` }}
              >
                {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                {isDownloading ? 'Abrindo...' : buttonText}
              </button>
              {product?.checkout_url && (
                <a
                  href={product.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
                >
                  <ExternalLink size={11} />
                  Preview
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-400/60">
              <Lock size={11} />
              Acesso revogado. Entre em contato com o suporte.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Formulário de e-mail para buscar acessos ─────────────────
const EmailLookup: React.FC<{ onFound: (email: string) => void }> = ({ onFound }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      onFound(email.trim().toLowerCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mx-auto">
        <Mail size={28} className="text-brand-orange" />
      </div>
      <div>
        <h2 className="text-xl font-black text-white mb-2">Acessar Minha Área</h2>
        <p className="text-sm text-white/50">
          Digite o e-mail usado na compra para ver seus produtos
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-orange/50 transition-all"
          required
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 size={14} className="inline animate-spin mr-2" />Buscando...</> : 'Ver Meus Produtos →'}
        </button>
      </form>
    </div>
  );
};

// ── Página Principal ─────────────────────────────────────────
export const MembersAreaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const tokenParam = searchParams.get('token');

  const { settings, loading: settingsLoading } = useMemberSettings();

  const [accesses, setAccesses] = useState<ProductAccessRow[]>([]);
  const [singleAccess, setSingleAccess] = useState<ProductAccessRow | null>(null);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<{ accessId: string; url?: string; error?: string } | null>(null);

  // Carregamento inicial: se vier com order_id na URL, busca direto
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        if (orderId) {
          const [orderData, accessData] = await Promise.all([
            getOrderById(orderId),
            getAccessByOrderId(orderId),
          ]);
          setOrder(orderData);
          setSingleAccess(accessData);
        }
      } catch (err) {
        console.error('[MembersArea] Erro ao carregar dados iniciais:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [orderId]);

  // Busca por e-mail
  const handleEmailFound = useCallback(async (foundEmail: string) => {
    setLoading(true);
    setEmail(foundEmail);
    try {
      const data = await getAccessesByEmail(foundEmail);
      setAccesses(data);
    } catch (err) {
      console.error('[MembersArea] Erro ao buscar acessos por email:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Download: validar token via Edge Function e redirecionar
  const handleDownload = useCallback(async (access: ProductAccessRow) => {
    setDownloading(access.id);
    setDownloadResult(null);
    try {
      const { supabase } = await import('../lib/supabase');

      const { data: tokenData } = await supabase
        .from('downloads')
        .select('token')
        .eq('order_id', access.order_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const token = tokenParam || tokenData?.token;

      if (!token) {
        setDownloadResult({ accessId: access.id, error: 'Token de acesso não encontrado. Entre em contato com o suporte.' });
        return;
      }

      // Validar token via Edge Function (aplica antifraude server-side)
      const result = await validateAndConsumeDownloadToken(token, access.order_id);

      if (result.error) {
        setDownloadResult({ accessId: access.id, error: result.error });
        return;
      }

      if (result.delivery_url) {
        window.open(result.delivery_url, '_blank');
        setDownloadResult({ accessId: access.id, url: result.delivery_url });
      } else {
        setDownloadResult({ accessId: access.id, error: 'URL de entrega não configurada. Entre em contato com o suporte.' });
      }
    } catch (err: any) {
      setDownloadResult({ accessId: access.id, error: err.message || 'Erro ao processar download' });
    } finally {
      setDownloading(null);
    }
  }, [tokenParam]);

  // ── Renderização ─────────────────────────────────────────────

  // Loading
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: settings?.primary_color || '#FF6A00', borderTopColor: 'transparent' }} />
          <p className="text-white/40 text-sm">Carregando seus produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060912] relative overflow-hidden">
      {/* Background Dinâmico */}
      {settings.banner_url ? (
        <div className="absolute top-0 left-0 right-0 h-96 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${settings.banner_url})` }} />
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: settings.primary_color }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: settings.secondary_color }} />
        </>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">

        {/* Header Dinâmico */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-white/30 mb-2">
              <a href="/" className="hover:text-white/60 transition-colors">← Voltar à Loja</a>
            </div>
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="h-10 object-contain mb-4" />
            )}
            <h1 className="text-2xl font-black text-white">{settings.title}</h1>
            <p className="text-sm text-white/50 mt-0.5">{settings.subtitle}</p>
            {email && <p className="text-xs text-white/40 mt-1">Produtos de <span className="text-white/60">{email}</span></p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Package size={18} style={{ color: settings.primary_color }} />
          </div>
        </div>

        {/* Aviso Personalizado */}
        {settings.custom_notice && (
          <div className="mb-8 p-4 rounded-2xl border flex items-start gap-3 bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{settings.custom_notice}</p>
          </div>
        )}

        {/* ── Conteúdo conforme contexto ─────────────────────── */}

        {/* Caso 1: Veio com order_id na URL (pós-compra) */}
        {orderId && singleAccess && (
          <div className="space-y-4">
            {/* Banner de boas-vindas */}
            {order?.status === 'approved' && (
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-green-400">Acesso liberado com sucesso!</p>
                  <p className="text-xs text-white/40">Salve o link desta página para acessar seu produto quando quiser.</p>
                </div>
              </div>
            )}

            {/* Resultado do download */}
            {downloadResult && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                downloadResult.error
                  ? 'bg-red-500/5 border-red-500/20 text-red-400'
                  : 'bg-green-500/5 border-green-500/20 text-green-400'
              }`}>
                {downloadResult.error
                  ? <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
                <p className="text-xs">{downloadResult.error || 'Download aberto em nova aba!'}</p>
              </div>
            )}

            <ProductAccessCard
              access={singleAccess}
              onDownload={handleDownload}
              downloading={downloading}
              buttonText={settings.button_text}
              primaryColor={settings.primary_color}
              secondaryColor={settings.secondary_color}
            />

            {/* Suporte Dinâmico */}
            <div className="mt-6 p-4 rounded-2xl bg-white/3 border border-white/5">
              <p className="text-xs text-white/30 mb-3">Precisa de ajuda?</p>
              <div className="flex items-center gap-3">
                {settings.show_support && (
                  <>
                    <a
                      href={settings.support_whatsapp ? `https://wa.me/${settings.support_whatsapp.replace(/\D/g,'')}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-green-400/70 hover:text-green-400 transition-colors"
                    >
                      <MessageCircle size={12} /> WhatsApp Suporte
                    </a>
                    <span className="text-white/10">·</span>
                  </>
                )}
                <button
                  onClick={() => { if (email) handleEmailFound(email); }}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  <RefreshCw size={11} /> Ver todos os produtos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Caso 2: Veio com order mas sem acesso aprovado */}
        {orderId && !singleAccess && order && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
              <Clock className="text-yellow-400" size={28} />
            </div>
            <h2 className="text-lg font-bold text-white">Pagamento em processamento</h2>
            <p className="text-sm text-white/40">
              Seu pedido está com status: <span className="font-mono text-white/60">{order.status}</span>
            </p>
            {order.status === 'pending' && (
              <p className="text-xs text-white/30">
                Se você já pagou o PIX, aguarde até 2 minutos. A liberação é automática.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white text-xs mx-auto transition-all"
            >
              <RefreshCw size={12} /> Verificar novamente
            </button>
          </div>
        )}

        {/* Caso 3: Busca por e-mail (sem order_id) */}
        {!orderId && !email && (
          <div className="max-w-md mx-auto">
            <EmailLookup onFound={handleEmailFound} />
          </div>
        )}

        {/* Caso 4: Resultado da busca por email */}
        {email && !orderId && (
          <div>
            {accesses.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package size={36} className="text-white/20 mx-auto" />
                <p className="text-sm text-white/40">Nenhum produto encontrado para este e-mail.</p>
                <button
                  onClick={() => setEmail(null)}
                  className="text-xs text-brand-orange hover:underline"
                >
                  Tentar outro e-mail
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/30">{accesses.length} produto{accesses.length !== 1 ? 's' : ''} encontrado{accesses.length !== 1 ? 's' : ''}</p>
                  <button onClick={() => setEmail(null)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                    ← Trocar e-mail
                  </button>
                </div>

                {/* Resultado do download */}
                {downloadResult && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    downloadResult.error
                      ? 'bg-red-500/5 border-red-500/20 text-red-400'
                      : 'bg-green-500/5 border-green-500/20 text-green-400'
                  }`}>
                    {downloadResult.error
                      ? <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
                    <p className="text-xs">{downloadResult.error || 'Download aberto em nova aba!'}</p>
                  </div>
                )}

                {accesses.map(access => (
                  <ProductAccessCard
                    key={access.id}
                    access={access}
                    onDownload={handleDownload}
                    downloading={downloading}
                    buttonText={settings.button_text}
                    primaryColor={settings.primary_color}
                    secondaryColor={settings.secondary_color}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
