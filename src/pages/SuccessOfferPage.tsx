import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackServerEvent, subscribeToOrderStatus } from '../services/payments/paymentService';
import { Loader2, CheckCircle2, ShieldCheck, QrCode, AlertCircle, Copy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SuccessOfferPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutos
  
  // Checkout flow states
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/minha-area');
      return;
    }
    fetchOffer();
  }, [orderId]);

  useEffect(() => {
    if (timeLeft <= 0 || pixData) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, pixData]);

  const fetchOffer = async () => {
    try {
      // Validar order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('product_id, status, customer_email')
        .eq('id', orderId)
        .single();

      if (orderErr || !order || order.status !== 'approved') {
        navigate('/minha-area');
        return;
      }

      // Buscar offer
      const { data: offerData, error: offerErr } = await supabase
        .from('upsell_offers')
        .select('*, upsell_product:products(*)')
        .eq('main_product_id', order.product_id)
        .eq('active', true)
        .maybeSingle();

      if (!offerData) {
        navigate('/minha-area');
        return;
      }

      setOffer(offerData);
      
      // Tracking
      trackServerEvent('UpsellView', {
        product_id: offerData.upsell_product.id,
        amount: offerData.promotional_price,
        customer_email: order.customer_email
      });

    } catch (err: any) {
      console.error(err);
      navigate('/minha-area');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer) return;
    setProcessing(true);
    setError(null);

    // Tracking
    trackServerEvent('UpsellAccepted', {
      product_id: offer.upsell_product.id,
      amount: offer.promotional_price
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-upsell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : '' // Pode não ter se for anon, a edge function não restringe JWT
        },
        body: JSON.stringify({
          parent_order_id: orderId,
          upsell_offer_id: offer.id
        })
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setPixData(data);

      // Subscrever para saber quando foi pago
      unsubscribeRef.current = subscribeToOrderStatus(data.order_id, (updatedOrder) => {
        if (updatedOrder.status === 'approved') {
           trackServerEvent('UpsellPurchase', {
              product_id: offer.upsell_product.id,
              amount: offer.promotional_price
           });
           unsubscribeRef.current?.();
           navigate('/minha-area');
        }
      });

    } catch (err: any) {
      setError(err.message || 'Erro ao processar oferta.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    trackServerEvent('UpsellRejected', {
      product_id: offer?.upsell_product?.id
    });
    navigate('/minha-area');
  };

  const handleCopyPix = () => {
    if (!pixData?.pix_code) return;
    navigator.clipboard.writeText(pixData.pix_code);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-orange" size={32} />
      </div>
    );
  }

  if (!offer) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background FX */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FF6A00]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 mt-8">
        
        {/* Header Alert */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4 animate-scaleIn">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-emerald-400">Pagamento Principal Aprovado!</h2>
            <p className="text-sm text-emerald-400/70">Seu acesso já foi garantido e enviado para seu e-mail.</p>
          </div>
        </div>

        {/* Upsell Content */}
        <div className="bg-[#0B1020]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl animate-fadeIn">
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full animate-pulse">
              Atenção: Não feche esta página
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-6 leading-tight">
              {offer.title}
            </h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
            {/* Mockup Placeholder */}
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-6xl">🎁</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-lg text-white/80 leading-relaxed">
                {offer.description}
              </p>
              
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="text-left">
                    <span className="text-xs text-white/40 line-through block">De R$ {offer.upsell_product.price}</span>
                    <span className="text-3xl font-black text-brand-orange">R$ {offer.promotional_price}</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">
                    Desconto Único Aplicado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col items-center">
            
            {!pixData && timeLeft > 0 && (
              <div className="flex items-center gap-2 mb-6 text-red-400 font-mono bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                <Clock size={16} />
                <span className="font-bold">Esta oferta expira em:</span>
                <span className="text-lg font-black">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {pixData ? (
                /* PIX Gerado */
                <motion.div 
                  key="pix"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-sm space-y-4 flex flex-col items-center text-center"
                >
                  <div className="w-full p-4 rounded-2xl bg-white border-2 border-brand-orange/30 shadow-neon-orange">
                    {pixData.pix_qr_image ? (
                      <img src={pixData.pix_qr_image} alt="QR Code" className="w-full h-auto object-contain" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center"><QrCode size={64} className="text-gray-400" /></div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleCopyPix}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-black border border-white/10 hover:border-brand-orange/30 text-sm font-bold text-white transition-all"
                  >
                    {copiedPix ? <><CheckCircle2 size={16} className="text-green-400" /> Copiado!</> : <><Copy size={16} /> Copiar Código Pix Copia e Cola</>}
                  </button>
                  
                  <div className="w-full p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3">
                    <Loader2 size={16} className="text-yellow-400 animate-spin shrink-0" />
                    <p className="text-xs text-yellow-400/80 text-left leading-tight">
                      Aguardando pagamento... O acesso extra será liberado assim que o PIX for compensado.
                    </p>
                  </div>
                  
                  <button onClick={() => navigate('/minha-area')} className="text-xs text-white/40 hover:text-white hover:underline mt-4">
                    Ir para minha área agora
                  </button>
                </motion.div>
              ) : (
                /* Botões de Ação */
                <motion.div 
                  key="action"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md flex flex-col gap-4"
                >
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  {timeLeft > 0 ? (
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-lg font-black text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="animate-spin" /> : 'SIM, QUERO ADICIONAR AO MEU PEDIDO!'}
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 text-white/50 text-sm mb-4">
                      Esta oferta exclusiva expirou.
                    </div>
                  )}

                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="w-full py-3 text-sm font-bold text-white/40 hover:text-white/80 hover:underline transition-colors disabled:opacity-50"
                  >
                    Não, obrigado. Quero apenas o produto que já paguei.
                  </button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Adição em 1-clique totalmente segura
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};
