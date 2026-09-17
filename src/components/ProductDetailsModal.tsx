import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, ShoppingCart, Check, ShieldCheck, Zap, QrCode, Loader2, Copy, CheckCircle2, User, AlertCircle } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';
import { createOrder, captureUTMParams, captureMetaCookies, subscribeToOrderStatus, trackServerEvent } from '../services/payments/paymentService';
import type { CreateOrderResponse } from '../types/payment';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'features' | 'tech'>('overview');
  const [checkoutStep, setCheckoutStep] = React.useState<'none' | 'form' | 'pix' | 'waiting' | 'success'>('none');
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', cpf: '' });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [paymentData, setPaymentData] = React.useState<CreateOrderResponse | null>(null);
  const [bumpProducts, setBumpProducts] = React.useState<any[]>([]);
  const [selectedBumpIds, setSelectedBumpIds] = React.useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'card'>('pix');
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  const hasTrackedInit = React.useRef(false);

  React.useEffect(() => {
    if (product && !hasTrackedInit.current) {
      hasTrackedInit.current = true;
      trackServerEvent('ViewContent', {
        product_id: product.id,
        amount: product.price,
      });
    }

    // Fetch bump products
    const fetchBumps = async () => {
      const { supabase } = await import('../lib/supabase');
      if (!product) return;
      const { data } = await supabase.from('products').select('*').eq('is_order_bump', true).eq('active', true).neq('id', product.id).order('created_at', { ascending: false });
      if (data) setBumpProducts(data);
    };
    fetchBumps();
  }, [product]);

  if (!product) return null;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = 'Nome completo obrigatório';
    if (!formData.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) errors.email = 'E-mail válido obrigatório';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) errors.phone = 'WhatsApp obrigatório (com DDD)';
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length < 11) errors.cpf = 'CPF/CNPJ obrigatório';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGeneratePix = async () => {
    if (!validateForm()) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      // Form submitted, track as Lead
      trackServerEvent('Lead', {
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim(),
        product_id: product.id,
      });

      const utms = captureUTMParams();
      const meta = captureMetaCookies();
      const eventId = crypto.randomUUID();

      const result = await createOrder({
        product_id: product.id,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim(),
        customer_document: formData.cpf.trim().replace(/\D/g, ''),
        event_id: eventId,
        order_bump_ids: selectedBumpIds,
        ...utms,
        ...meta,
      });

      setPaymentData(result);
      setCheckoutStep(result.pix_code ? 'pix' : 'waiting');

      // Subscrever ao Realtime para mudança de status
      const unsubscribe = subscribeToOrderStatus(result.order_id, async (updatedOrder) => {
        if (updatedOrder.status === 'approved') {
          setCheckoutStep('success');
          unsubscribeRef.current?.();
          
          // Checar se existe oferta de upsell
          const { supabase } = await import('../lib/supabase');
          const { data: upsellOffer } = await supabase
            .from('upsell_offers')
            .select('id')
            .eq('main_product_id', product.id)
            .eq('active', true)
            .maybeSingle();

          setTimeout(() => {
            if (upsellOffer) {
              navigate(`/success-offer?order_id=${result.order_id}`);
            } else {
              navigate(`/success?order_id=${result.order_id}`);
            }
          }, 2000);
        } else if (updatedOrder.status === 'failed' || updatedOrder.status === 'expired') {
          setCheckoutError('Pagamento falhou. Tente novamente.');
          setCheckoutStep('form');
        }
      });
      unsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      setCheckoutError(err.message || 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!paymentData?.pix_code) return;
    navigator.clipboard.writeText(paymentData.pix_code);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // Cleanup Realtime ao fechar
  const handleClose = () => {
    unsubscribeRef.current?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      
      {/* Background Overlay */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-md transition-opacity duration-300"
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-brand-darkGray/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scaleIn z-10">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-brand-black/60 border border-white/5 text-white/70 hover:text-white hover:border-brand-orange/30 hover:bg-brand-black transition-all duration-300"
        >
          <X size={18} />
        </button>

        {checkoutStep === 'none' ? (
          <>
            {/* LEFT SIDE: Tech Thumbnail & Details */}
            <div className={`w-full md:w-[42%] bg-gradient-to-br ${product.gradient} p-8 flex flex-col justify-between items-center text-center relative border-b md:border-b-0 md:border-r border-white/5`}>
              <div className="absolute inset-0 bg-brand-black/10 tech-grid-bg opacity-20"></div>
              
              <div className="relative z-10 my-auto flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-brand-black/80 flex items-center justify-center border border-white/10 shadow-neon-orange">
                  <TechIcon name={product.iconName} className="text-brand-orange animate-pulse" size={48} />
                </div>
                <h3 className="text-2xl font-black text-white leading-tight mt-2">
                  {product.name}
                </h3>
                <span className="text-xs uppercase font-mono tracking-widest bg-brand-black/85 border border-white/5 text-brand-orange px-3 py-1 rounded-full">
                  {product.category}
                </span>

                <div className="flex items-center gap-1.5 mt-2 justify-center">
                  <div className="flex items-center text-yellow-500">
                    <Star size={14} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-white">{product.rating.toFixed(2)}</span>
                  <span className="text-xs text-white/30 font-mono">({product.salesCount} vendas)</span>
                </div>
              </div>

              {/* Security info */}
              <div className="relative z-10 w-full pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-mono tracking-wider">
                <ShieldCheck size={14} className="text-green-500" />
                Entrega imediata Whitelabel
              </div>
            </div>

            {/* RIGHT SIDE: Info tabs and Checkout CTAs */}
            <div className="w-full md:w-[58%] p-8 overflow-y-auto flex flex-col justify-between">
              
              <div>
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-6">
                  {[
                    { id: 'overview', label: 'Sobre' },
                    { id: 'features', label: 'Funcionalidades' },
                    { id: 'tech', label: 'Tecnologias' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-brand-orange/15 border border-brand-orange/30 text-brand-orange'
                          : 'text-white/50 border border-transparent hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="min-h-[220px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <p className="text-sm text-white/80 leading-relaxed">
                        {product.longDescription}
                      </p>
                      
                      <div className="p-4 rounded-2xl bg-brand-black/30 border border-white/5 space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">O que está incluso na compra?</h4>
                        <ul className="text-xs text-white/60 space-y-1.5 list-disc pl-4">
                          <li>Código-fonte limpo, estruturado e documentado</li>
                          <li>Direito de revenda sob sua própria marca (White Label)</li>
                          <li>Suporte na instalação e documentação em vídeo</li>
                          <li>Atualizações vitalícias gratuitas</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Principais Funcionalidades</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-brand-black/20 border border-white/5">
                            <span className="p-1 rounded bg-brand-orange/10 text-brand-orange shrink-0">
                              <Check size={12} className="stroke-[3]" />
                            </span>
                            <span className="text-xs text-white/80 leading-normal">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'tech' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Tecnologias Utilizadas</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.techStack.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3.5 py-2 rounded-xl bg-brand-black border border-white/5 text-xs font-mono text-white/85"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-black/30 border border-white/5 flex items-start gap-3 mt-4">
                        <Zap size={18} className="text-brand-orange shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-white">Performance Garantida</h5>
                          <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                            Desenvolvido seguindo as melhores práticas globais de engenharia de software para garantir escalabilidade sob alto volume de acessos e requisições.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Cart Action Area */}
              <div className="pt-6 mt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Valor Whitelabel</span>
                  <span className="text-2xl font-black text-brand-orange font-mono">
                    R$ {product.price}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-darkGray hover:bg-brand-black border border-white/10 text-sm font-semibold text-white/95 hover:text-white transition-all duration-300"
                  >
                    <ShoppingCart size={16} />
                    Adicionar
                  </button>
                  <button 
                    onClick={() => {
                      setCheckoutStep('form')
                      trackServerEvent('InitiateCheckout', {
                        product_id: product.id,
                        amount: product.price,
                      })
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Comprar Agora
                  </button>
                </div>
              </div>

            </div>
          </>
        ) : (
          // CHECKOUT FLOW REAL
          <div className="w-full p-8 flex flex-col justify-between items-center text-center max-h-[85vh] overflow-y-auto">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/5 mb-6 text-left">
              <div>
                <h3 className="font-bold text-lg text-white">Checkout Seguro</h3>
                <p className="text-xs text-white/45 font-mono">{product.name} · R$ {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
              </div>
              {checkoutStep !== 'success' && (
                <button 
                  onClick={() => setCheckoutStep('none')}
                  className="text-xs text-brand-orange font-bold hover:underline"
                >
                  Voltar
                </button>
              )}
            </div>

            {/* ── ETAPA 1: Formulário de dados ────────────────── */}
            {checkoutStep === 'form' && (
              <div className="w-full flex flex-col md:flex-row gap-8 text-left">
                {/* COLUNA ESQUERDA */}
                <div className="w-full md:w-[65%] space-y-6">
                  
                  {/* Produto Principal Header */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-neonOrange/20 border border-brand-orange/30 flex items-center justify-center shrink-0">
                       <TechIcon name={product.iconName} className="text-brand-orange" size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{product.name}</h4>
                      <p className="text-xs text-white/50">{product.category}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-lg font-black text-white font-mono">R$ {Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Seus Dados */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><User size={16} className="text-brand-orange"/> Seus dados</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-left col-span-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu nome completo?</label>
                          <input type="text" placeholder="Nome da Silva" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all ${formErrors.name ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}`} />
                        </div>
                        <div className="text-left col-span-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu e-mail?</label>
                          <input type="email" placeholder="Digite o e-mail que receberá o produto" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all ${formErrors.email ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}`} />
                        </div>
                        <div className="text-left">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o número do seu celular?</label>
                          <input type="tel" placeholder="(11) 99999-9999" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className={`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all ${formErrors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}`} />
                        </div>
                        <div className="text-left">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu CPF?</label>
                          <input type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} className={`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all ${formErrors.cpf ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Bumps */}
                  {bumpProducts.length > 0 && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-red-400 flex items-center gap-2">
                          <Zap size={16} /> OPORTUNIDADE ÚNICA
                          <span className="text-xs font-medium text-white/50 ml-2 hidden sm:inline-block">Adicione ofertas especiais ao seu pedido!</span>
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {bumpProducts.map(bump => (
                          <div 
                            key={bump.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border ${selectedBumpIds.includes(bump.id) ? 'border-brand-orange bg-brand-orange/5' : 'border-white/10 bg-white/5'} cursor-pointer hover:border-brand-orange/30 transition-all`}
                            onClick={() => {
                              setSelectedBumpIds(prev => prev.includes(bump.id) ? prev.filter(id => id !== bump.id) : [...prev, bump.id]);
                            }}
                          >
                            <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${selectedBumpIds.includes(bump.id) ? 'bg-brand-orange border-brand-orange' : 'border-white/30'}`}>
                              {selectedBumpIds.includes(bump.id) && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">Aproveite e leve também: {bump.name}</p>
                              <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{bump.short_description || bump.longDescription || 'Adicione este incrível produto ao seu carrinho por um valor exclusivo.'}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-white/30 line-through">De R$ {bump.price}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">-70%</span>
                                <span className="text-sm font-black text-green-400">R$ {bump.bump_price || bump.price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart size={16} className="text-brand-orange"/> Escolha a forma de pagamento</h4>
                    
                    <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-brand-darkGray border border-white/5 w-full sm:w-fit overflow-x-auto">
                      <button 
                        onClick={() => setPaymentMethod('pix')}
                        className={`relative px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${paymentMethod === 'pix' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/40 hover:text-white'}`}
                      >
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">PIX</span>
                        PIX
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${paymentMethod === 'card' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/40 hover:text-white'}`}
                      >
                        Cartão de Crédito
                      </button>
                    </div>

                    {paymentMethod === 'pix' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                              <QrCode size={20} className="text-green-500" />
                           </div>
                           <p className="text-[11px] text-white/60">Aprovação imediata. O código PIX será gerado após clicar em pagar.</p>
                        </div>
                        
                        {checkoutError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertCircle size={13} className="shrink-0" />
                            {checkoutError}
                          </div>
                        )}

                        <button
                          onClick={handleGeneratePix}
                          disabled={checkoutLoading}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-sm font-black text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                        >
                          {checkoutLoading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : <><ShieldCheck size={16} /> PAGAR AGORA</>}
                        </button>
                      </div>
                    )}
                    {paymentMethod === 'card' && (
                      <div className="py-6 text-center">
                        <p className="text-sm text-white/50">Integração de cartão de crédito em breve.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUNA DIREITA */}
                <div className="w-full md:w-[35%]">
                  <div className="sticky top-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-3">Resumo da compra</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between text-white/80">
                          <span>{product.name}</span>
                          <span className="font-mono">R$ {Number(product.price).toFixed(2)}</span>
                        </div>
                        {selectedBumpIds.map(id => {
                          const b = bumpProducts.find(x => x.id === id);
                          if (!b) return null;
                          return (
                            <div key={b.id} className="flex justify-between text-white/80">
                              <span className="truncate pr-4">{b.name}</span>
                              <span className="font-mono text-green-400 whitespace-nowrap">+ R$ {Number(b.bump_price || b.price).toFixed(2)}</span>
                            </div>
                          );
                        })}
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="text-sm font-bold text-white">Total a pagar</span>
                          <span className="text-xl font-black text-green-400 font-mono">
                            R$ {(
                              Number(product.price) + 
                              selectedBumpIds.reduce((acc, id) => {
                                const b = bumpProducts.find(x => x.id === id);
                                return acc + Number(b?.bump_price || b?.price || 0);
                              }, 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        Compra segura e criptografada
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ETAPA 2: QR Code PIX real ───────────────────── */}
            {checkoutStep === 'pix' && paymentData && (
              <div className="space-y-5 max-w-sm w-full py-2 flex flex-col items-center">
                <div className="text-center">
                  <p className="text-sm font-bold text-white mb-1">Pague o PIX abaixo</p>
                  <p className="text-xs text-white/40">R$ {Number(paymentData.amount).toFixed(2)} · {paymentData.product_name}</p>
                </div>

                {/* QR Code real (base64) ou placeholder */}
                <div className="p-3 rounded-2xl bg-white border-2 border-brand-orange/30 shadow-neon-orange">
                  {paymentData.pix_qr_image ? (
                    <img src={paymentData.pix_qr_image} alt="QR Code PIX" className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center">
                      <QrCode size={80} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-black border border-white/10 hover:border-brand-orange/30 text-xs font-semibold text-white transition-all duration-300"
                >
                  {copiedPix ? <><CheckCircle2 size={13} className="text-green-400" /> Copiado!</> : <><Copy size={13} /> Copiar Código Pix Copia e Cola</>}
                </button>

                {/* Indicador de aguardando */}
                <div className="w-full p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3">
                  <Loader2 size={14} className="text-yellow-400 animate-spin shrink-0" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-yellow-400">Aguardando pagamento...</p>
                    <p className="text-[10px] text-white/30">A liberação é automática após confirmação</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── ETAPA 3: Aguardando (sem QR Code do MP) ─────── */}
            {checkoutStep === 'waiting' && paymentData && (
              <div className="space-y-5 max-w-sm w-full py-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Loader2 size={28} className="text-yellow-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Processando pedido...</p>
                  <p className="text-xs text-white/40 mt-1">Pedido criado. Redirecionando para pagamento...</p>
                </div>
                {paymentData.payment_url && (
                  <a
                    href={paymentData.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white transition-all"
                  >
                    Ir para o pagamento →
                  </a>
                )}
              </div>
            )}

            {/* ── ETAPA 4: Sucesso ─────────────────────────────── */}
            {checkoutStep === 'success' && (
              <div className="space-y-6 max-w-md w-full py-8 flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Pagamento Aprovado! 🎉</h4>
                  <p className="text-xs text-white/50 mt-1">Redirecionando para sua área de acesso...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Loader2 size={12} className="animate-spin" />
                  Preparando seu acesso...
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
