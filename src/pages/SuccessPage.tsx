import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Package, Copy, Check,
  Clock, MessageCircle, RefreshCw, ShieldCheck, Download, ArrowRight
} from 'lucide-react';
import { getOrderById } from '../services/payments/paymentService';
import { getAccessByOrderId, getDownloadTokenByOrderId } from '../services/delivery/deliveryService';
import { useAnalytics } from '../hooks/useAnalytics';
import type { OrderRow, ProductAccessRow } from '../types/payment';

// ── Animação de Confete ──────────────────────────────────────
const ConfettiDot = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full animate-bounce pointer-events-none" style={style} />
);

const CONFETTI_COLORS = ['#FF6B35', '#FFD700', '#00FF88', '#00D4FF', '#FF69B4', '#9B59B6'];

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('order');
  const tokenParam = searchParams.get('token');

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [access, setAccess] = useState<ProductAccessRow | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(tokenParam);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pixelFired, setPixelFired] = useState(false);

  const { trackPurchase } = useAnalytics();

  const loadData = useCallback(async () => {
    if (!orderId) { setLoading(false); return; }

    try {
      const [orderData, accessData] = await Promise.all([
        getOrderById(orderId),
        getAccessByOrderId(orderId),
      ]);

      setOrder(orderData);
      setAccess(accessData);

      // Buscar token se não veio na URL
      if (!tokenParam && orderData?.status === 'approved') {
        const token = await getDownloadTokenByOrderId(orderId);
        setDownloadToken(token);
      }

      // Disparar Meta Pixel Purchase (browser-side) — com deduplicação por event_id
      if (orderData?.status === 'approved' && !pixelFired) {
        setPixelFired(true);
        const product = accessData?.products;
        trackPurchase(
          product ? [{ id: orderData.product_id, name: product.name, price: orderData.amount } as any] : [],
          orderData.amount,
          orderData.event_id || orderId // event_id para deduplicação com CAPI
        );
      }
    } catch (err) {
      console.error('[SuccessPage] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, tokenParam, pixelFired, trackPurchase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh se ainda pending
  useEffect(() => {
    if (order?.status === 'pending') {
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [order?.status, loadData]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/minha-area?order=${orderId}&token=${downloadToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const accessLink = downloadToken
    ? `${window.location.origin}/minha-area?order=${orderId}&token=${downloadToken}`
    : `/minha-area?order=${orderId}`;

  // Confetti random positions
  const confetti = Array.from({ length: 24 }, (_, i) => ({
    key: i,
    style: {
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      top: `${Math.random() * 40}%`,
      left: `${Math.random() * 100}%`,
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      animationDelay: `${Math.random() * 1.5}s`,
      animationDuration: `${1 + Math.random() * 1.5}s`,
      opacity: 0.7,
    } as React.CSSProperties,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-white/50">Pedido não encontrado.</p>
          <a href="/" className="text-brand-orange hover:underline text-sm mt-2 block">← Voltar à loja</a>
        </div>
      </div>
    );
  }

  const isApproved = order?.status === 'approved';
  const isPending = !order || order.status === 'pending';
  const productName = (access?.products as any)?.name || 'Seu produto';

  return (
    <div className="min-h-screen bg-[#060912] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-green-500/5 blur-[100px] pointer-events-none" />

      {/* Confetti (apenas se aprovado) */}
      {isApproved && confetti.map(c => <ConfettiDot key={c.key} style={c.style} />)}

      <div className="relative z-10 w-full max-w-lg">
        {/* Card principal */}
        <div className={`rounded-3xl border backdrop-blur-xl p-8 shadow-2xl transition-all duration-500 ${
          isApproved
            ? 'bg-[#0A1628]/90 border-green-500/20 shadow-green-500/5'
            : 'bg-[#0A1020]/90 border-white/10'
        }`}>

          {/* ─── ESTADO: APROVADO ──────────────────────────────── */}
          {isApproved && (
            <>
              {/* Ícone de sucesso */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <ShieldCheck className="text-green-400" size={40} />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-white mb-2">
                  Pagamento Confirmado! 🎉
                </h1>
                <p className="text-sm text-white/50">
                  Seu acesso ao <span className="text-white font-bold">{productName}</span> foi liberado instantaneamente.
                </p>
                {order?.amount && (
                  <p className="text-xs text-white/30 mt-1">
                    Valor: <span className="text-white/50 font-mono">R$ {Number(order.amount).toFixed(2)}</span>
                    {order.paid_at && (
                      <> · {new Date(order.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </p>
                )}
              </div>

              {/* Box de acesso */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-6 space-y-4">
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                  <Package size={13} />
                  Seu acesso está pronto
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                    Download do código-fonte desbloqueado
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                    Licença Whitelabel ativa
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                    Suporte via WhatsApp liberado
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                    E-mail com instruções enviado
                  </div>
                </div>
              </div>

              {/* Botão principal de acesso */}
              <a
                href={accessLink}
                className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-3"
              >
                <Download size={16} />
                Acessar Meu Produto
                <ArrowRight size={14} />
              </a>

              {/* Copiar link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all duration-200"
              >
                {copied ? <><Check size={13} className="text-green-400" /> Link copiado!</> : <><Copy size={13} /> Copiar link de acesso</>}
              </button>

              {/* Suporte */}
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                <p className="text-[11px] text-white/25">
                  Pedido: <span className="font-mono">{orderId?.slice(0, 8)}...</span>
                </p>
                <a
                  href="https://wa.me/5511999999999?text=Olá!%20Acabei%20de%20comprar%20e%20preciso%20de%20suporte."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-green-400/70 hover:text-green-400 transition-colors"
                >
                  <MessageCircle size={12} />
                  Suporte WhatsApp
                </a>
              </div>
            </>
          )}

          {/* ─── ESTADO: PENDING ────────────────────────────────── */}
          {isPending && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Clock className="text-yellow-400 animate-pulse" size={40} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white mb-2">
                  Aguardando Confirmação
                </h1>
                <p className="text-sm text-white/50">
                  Seu pagamento está sendo processado. Assim que confirmado, seu acesso será liberado automaticamente.
                </p>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                  <RefreshCw size={13} className="animate-spin text-yellow-400" />
                  Verificando a cada 5 segundos...
                </div>
                <p className="text-xs text-white/30">
                  Se você pagou o PIX, aguarde alguns segundos. O Mercado Pago pode demorar até 2 minutos para confirmar.
                </p>
              </div>

              <a href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all">
                ← Voltar à loja
              </a>
            </>
          )}
        </div>

        {/* Rodapé de segurança */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-white/20">
          <ShieldCheck size={11} />
          Pagamento seguro · Acesso instantâneo · Suporte 24h
        </div>
      </div>
    </div>
  );
};
