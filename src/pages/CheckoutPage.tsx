import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, CheckCircle2, ShieldCheck, Zap, QrCode, CreditCard, Loader2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createOrder, captureUTMParams, captureMetaCookies, subscribeToOrderStatus, trackServerEvent } from '../services/payments/paymentService';
import type { CreateOrderResponse } from '../types/payment';
import type { Product } from '../data/products';

export const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [bumpProducts, setBumpProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cpf: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Credit Card State
  const [creditCard, setCreditCard] = useState({ holderName: '', number: '', expiry: '', ccv: '' });
  const [ccErrors, setCcErrors] = useState<Record<string, string>>({});

  const [selectedBumpIds, setSelectedBumpIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<CreateOrderResponse | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'pix' | 'waiting' | 'success'>('form');

  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prodData } = await supabase.from('products').select('*').eq('id', id).eq('active', true).single();
        if (prodData) {
          setProduct(prodData as any);
          trackServerEvent('InitiateCheckout', { product_id: prodData.id, amount: prodData.price });
          
          const { data: bumpsData } = await supabase.from('products').select('*').eq('is_order_bump', true).eq('active', true).neq('id', prodData.id).order('created_at', { ascending: false });
          if (bumpsData) setBumpProducts(bumpsData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = 'Nome completo obrigatório';
    if (!formData.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) errors.email = 'E-mail válido obrigatório';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) errors.phone = 'WhatsApp obrigatório (com DDD)';
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length < 11) errors.cpf = 'CPF/CNPJ obrigatório';
    
    setFormErrors(errors);

    if (paymentMethod === 'CREDIT_CARD') {
      const ccErrs: Record<string, string> = {};
      if (!creditCard.holderName.trim()) ccErrs.holderName = 'Nome no cartão obrigatório';
      if (!creditCard.number.trim() || creditCard.number.replace(/\D/g, '').length < 14) ccErrs.number = 'Número de cartão inválido';
      if (!creditCard.expiry.trim() || !creditCard.expiry.includes('/')) ccErrs.expiry = 'Validade inválida (MM/AA)';
      if (!creditCard.ccv.trim() || creditCard.ccv.length < 3) ccErrs.ccv = 'CVV inválido';
      setCcErrors(ccErrs);
      return Object.keys(errors).length === 0 && Object.keys(ccErrs).length === 0;
    }

    return Object.keys(errors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm() || !product) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    
    trackServerEvent('AddPaymentInfo', {
      payment_method: paymentMethod,
      product_id: product.id,
    });

    try {
      const utms = captureUTMParams();
      const meta = captureMetaCookies();
      const eventId = crypto.randomUUID();

      let ccPayload = undefined;
      if (paymentMethod === 'CREDIT_CARD') {
        const [month, year] = creditCard.expiry.split('/');
        ccPayload = {
          holderName: creditCard.holderName,
          number: creditCard.number.replace(/\D/g, ''),
          expiryMonth: month?.trim() || '',
          expiryYear: year?.trim() || '',
          ccv: creditCard.ccv,
        };
      }

      const result = await createOrder({
        product_id: product.id,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim(),
        customer_document: formData.cpf.trim().replace(/\D/g, ''),
        payment_method: paymentMethod,
        credit_card: ccPayload,
        event_id: eventId,
        order_bump_ids: selectedBumpIds,
        coupon_code: searchParams.get('coupon') || undefined,
        ...utms,
        ...meta,
      });

      setPaymentData(result);
      
      if (paymentMethod === 'PIX') {
        setCheckoutStep(result.pix_code ? 'pix' : 'waiting');
      } else {
        setCheckoutStep('waiting'); // Credit Card awaiting approval
      }

      const unsubscribe = subscribeToOrderStatus(result.order_id, async (updatedOrder) => {
        if (updatedOrder.status === 'approved') {
          trackServerEvent('Purchase', { product_id: product.id, amount: updatedOrder.amount, order_id: updatedOrder.id });
          setCheckoutStep('success');
          unsubscribeRef.current?.();
          setTimeout(() => navigate(`/success?order_id=${result.order_id}`), 2000);
        } else if (updatedOrder.status === 'failed' || updatedOrder.status === 'expired' || updatedOrder.status === 'chargeback') {
          setCheckoutError('Pagamento recusado. Tente novamente ou use outro cartão.');
          setCheckoutStep('form');
        }
      });
      unsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      setCheckoutError(err.message || 'Erro ao processar pagamento.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const copyPix = () => {
    if (paymentData?.pix_code) {
      navigator.clipboard.writeText(paymentData.pix_code);
      alert("PIX copiado!");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;
  }

  if (!product) return <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center text-gray-500">Produto não encontrado.</div>;

  const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price);
  const bumpsTotal = selectedBumpIds.reduce((acc, bid) => {
    const b = bumpProducts.find(x => x.id === bid);
    return acc + Number(b?.bump_price || b?.price || 0);
  }, 0);
  const total = productPrice + bumpsTotal;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-20">
      {/* Top Banner (Match the image style) */}
      <div className="w-full bg-[#111] border-b-4 border-red-500 flex justify-center py-0">
         {/* Placeholder for the big banner image */}
         <img src="https://images.unsplash.com/photo-1620325867502-221afb5faa5f?auto=format&fit=crop&w=1200&h=300" alt="Banner" className="w-full max-w-5xl h-48 md:h-64 object-cover object-center brightness-75" />
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 flex flex-col md:flex-row gap-6">
        
        {/* LEFT COLUMN */}
        <div className="w-full md:w-[65%] space-y-4">
          
          {/* Main Product Mini Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-white shrink-0">
               <span className="font-bold text-xs px-1 text-center">PRO</span>
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900">{product.name} — Acesso Imediato</h1>
              <p className="text-xs text-gray-500 line-clamp-1">{product.shortDescription || product.category}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-gray-900 font-mono">R$ {productPrice.toFixed(2)}</p>
            </div>
          </div>

          {checkoutStep === 'form' && (
            <>
              {/* Seus Dados Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                  <User size={16} className="text-gray-400" /> Seus dados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Qual é o seu nome completo?</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Nome da Silva" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors ${formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Qual é o seu e-mail?</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" placeholder="Digite o e-mail que receberá o produto" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors ${formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Qual é o número do seu celular?</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" placeholder="(11) 99999-9999" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors ${formErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Qual é o seu CPF?</label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors ${formErrors.cpf ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Bumps Card */}
              {bumpProducts.length > 0 && (
                <div className="bg-[#fef2f2] p-5 rounded-xl shadow-sm border border-red-200">
                  <div className="flex items-center justify-between mb-4 bg-red-100/50 p-2 rounded-lg">
                    <h2 className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 uppercase">
                      <Zap size={14} fill="currentColor" /> OPORTUNIDADE ÚNICA
                    </h2>
                    <span className="text-[10px] text-gray-500 hidden sm:inline">🔥 Adicione ofertas especiais ao seu pedido!</span>
                  </div>
                  <div className="space-y-3">
                    {bumpProducts.map(bump => {
                       const isSelected = selectedBumpIds.includes(bump.id);
                       return (
                        <div key={bump.id} className={`p-3 rounded-lg border cursor-pointer flex gap-3 transition-colors ${isSelected ? 'bg-white border-red-300 shadow-sm' : 'bg-white/50 border-gray-200 hover:bg-white'}`} onClick={() => setSelectedBumpIds(p => p.includes(bump.id) ? p.filter(id => id !== bump.id) : [...p, bump.id])}>
                          <div className={`w-5 h-5 mt-1 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                            {isSelected && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">Aproveite e leve também: {bump.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{bump.short_description || 'Adicione ao seu pedido com desconto.'}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[10px] text-gray-400 line-through">De R$ {bump.price}</span>
                               <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">-70%</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between text-right shrink-0">
                            <span className="text-xs font-black text-green-600">+ R$ {bump.bump_price || bump.price}</span>
                            <span className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-red-500' : 'text-gray-400'}`}>{isSelected ? 'Selecionado' : 'Adicionar'}</span>
                          </div>
                        </div>
                       )
                    })}
                  </div>
                </div>
              )}

              {/* Payment Method Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                  <CreditCard size={16} className="text-gray-400" /> Escolha a forma de pagamento
                </h2>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-5">
                  <button onClick={() => setPaymentMethod('PIX')} className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'PIX' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <QrCode size={16} /> PIX
                  </button>
                  <button onClick={() => setPaymentMethod('CREDIT_CARD')} className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'CREDIT_CARD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <CreditCard size={16} /> Cartão de Crédito
                  </button>
                </div>

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="space-y-4 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 mb-1 block">Número do Cartão</label>
                      <input type="text" placeholder="0000 0000 0000 0000" value={creditCard.number} onChange={e => setCreditCard(p => ({ ...p, number: e.target.value }))} className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white ${ccErrors.number ? 'border-red-400' : 'border-gray-300'}`} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 mb-1 block">Nome Impresso no Cartão</label>
                      <input type="text" placeholder="NOME DO TITULAR" value={creditCard.holderName} onChange={e => setCreditCard(p => ({ ...p, holderName: e.target.value.toUpperCase() }))} className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white ${ccErrors.holderName ? 'border-red-400' : 'border-gray-300'}`} />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-gray-500 mb-1 block">Validade</label>
                        <input type="text" placeholder="MM/AA" value={creditCard.expiry} onChange={e => setCreditCard(p => ({ ...p, expiry: e.target.value }))} className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white ${ccErrors.expiry ? 'border-red-400' : 'border-gray-300'}`} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-gray-500 mb-1 block">CVV</label>
                        <input type="text" placeholder="123" value={creditCard.ccv} onChange={e => setCreditCard(p => ({ ...p, ccv: e.target.value }))} className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white ${ccErrors.ccv ? 'border-red-400' : 'border-gray-300'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutError && (
                  <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-black text-white shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {checkoutLoading ? <><Loader2 size={16} className="animate-spin" /> PROCESSANDO...</> : <><Lock size={16} /> COMPRAR AGORA</>}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                  <ShieldCheck size={14} className="text-green-500" />
                  Pagamento seguro processado por Asaas
                </div>
              </div>
            </>
          )}

          {checkoutStep === 'pix' && paymentData?.pix_code && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Pague com PIX para liberar</h2>
              <p className="text-xs text-gray-500 mb-6">Escaneie o QR Code ou copie o código Pix Copia e Cola.</p>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block mb-6 shadow-sm">
                {paymentData.pix_qr_image ? (
                  <img src={paymentData.pix_qr_image} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
                ) : (
                  <QrCode size={192} className="text-gray-300" />
                )}
              </div>

              <button onClick={copyPix} className="w-full max-w-xs py-3 px-4 rounded-lg bg-gray-900 text-white text-sm font-bold shadow-md hover:bg-gray-800 transition-colors">
                Copiar Código PIX
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 py-2 px-4 rounded-full">
                 <Loader2 size={14} className="animate-spin" /> Aguardando pagamento...
              </div>
            </div>
          )}
          
          {checkoutStep === 'waiting' && (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
               <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
               <h2 className="text-lg font-bold text-gray-800 mb-2">Processando Cartão...</h2>
               <p className="text-sm text-gray-500">Por favor aguarde enquanto validamos o pagamento.</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Resumo da Compra) */}
        <div className="w-full md:w-[35%]">
          <div className="sticky top-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Resumo da compra</h3>
              
              <div className="space-y-3 text-xs text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span className="truncate pr-4">{product.name}</span>
                  <span className="font-mono font-medium">R$ {productPrice.toFixed(2)}</span>
                </div>
                {selectedBumpIds.map(bid => {
                  const b = bumpProducts.find(x => x.id === bid);
                  if(!b) return null;
                  return (
                    <div key={bid} className="flex justify-between text-gray-600">
                      <span className="truncate pr-4">{b.name}</span>
                      <span className="font-mono text-green-600 font-medium whitespace-nowrap">+ R$ {Number(b.bump_price || b.price).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-5 px-5 pb-5 rounded-b-xl mt-4">
                <span className="text-sm font-bold text-gray-800">Total a pagar</span>
                <span className="text-xl font-black text-green-600 font-mono">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Sidebar Banner */}
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm hidden md:block">
               <img src="https://images.unsplash.com/photo-1620325867502-221afb5faa5f?auto=format&fit=crop&w=400&h=600" alt="Product Side" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
