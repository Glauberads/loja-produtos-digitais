import React from 'react';
import { X, Star, ShoppingCart, Check, ShieldCheck, Zap, CreditCard, QrCode } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';
import { supabase } from '../lib/supabase';

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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'features' | 'tech'>('overview');
  const [checkoutStep, setCheckoutStep] = React.useState<'none' | 'method' | 'pix' | 'success'>('none');
  const [copiedPix, setCopiedPix] = React.useState(false);

  if (!product) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136e3bb77a1-b64a-48b8-b5a7-a4d6e78cec8f5204000053039865406297.005802BR5915NexusSaaS%20Store6009SAO%20PAULO62070503***6304D1B2");
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSimulatePayment = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          payment_method: checkoutStep === 'pix' ? 'PIX' : 'CARD',
          status: 'approved'
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao registrar pedido individual no Supabase:', err);
    }
    setCheckoutStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-md transition-opacity duration-300"
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-brand-darkGray/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scaleIn z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
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
                    onClick={() => setCheckoutStep('method')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Comprar Agora
                  </button>
                </div>
              </div>

            </div>
          </>
        ) : (
          // CHECKOUT FLOW SIMULATION
          <div className="w-full p-8 flex flex-col justify-between items-center text-center max-h-[85vh] overflow-y-auto">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/5 mb-6 text-left">
              <div>
                <h3 className="font-bold text-lg text-white">Checkout Seguro</h3>
                <p className="text-xs text-white/45 font-mono">Pedido: {product.id.toUpperCase()}-2026</p>
              </div>
              {checkoutStep !== 'success' && (
                <button 
                  onClick={() => setCheckoutStep('none')}
                  className="text-xs text-brand-orange font-bold hover:underline"
                >
                  Voltar aos Detalhes
                </button>
              )}
            </div>

            {checkoutStep === 'method' && (
              <div className="space-y-6 max-w-md w-full py-6">
                <p className="text-sm text-white/70">Escolha o método de pagamento simulado:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pix Button */}
                  <button
                    onClick={() => setCheckoutStep('pix')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-brand-black/60 border border-white/5 hover:border-brand-orange/30 hover:bg-brand-black transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-brand-orange/10 text-brand-orange group-hover:scale-115 transition-transform duration-300">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">PIX Simulado</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Liberação imediata</p>
                    </div>
                  </button>

                  {/* Cartão Button */}
                  <button
                    onClick={handleSimulatePayment}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-brand-black/60 border border-white/5 hover:border-brand-orange/30 hover:bg-brand-black transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-brand-orange/10 text-brand-orange group-hover:scale-115 transition-transform duration-300">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cartão de Crédito</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Liberação simulada</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 text-xs text-white/40 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Ambiente de demonstração criptografado
                </div>
              </div>
            )}

            {checkoutStep === 'pix' && (
              <div className="space-y-6 max-w-sm w-full py-4 flex flex-col items-center">
                <p className="text-xs text-white/70">Escaneie o QR Code abaixo ou copie a chave Pix Copia e Cola para simular a compra de <strong className="text-brand-orange">{product.name}</strong> por <strong className="text-white">R$ {product.price}</strong>:</p>
                
                {/* SVG QR Code Simulation */}
                <div className="p-4 rounded-2xl bg-white border border-brand-orange/30 shadow-neon-orange relative group">
                  <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" rx="6" fill="white"/>
                    {/* QR Code Grid simulated design */}
                    <rect x="5" y="5" width="25" height="25" fill="#050505"/>
                    <rect x="10" y="10" width="15" height="15" fill="white"/>
                    <rect x="70" y="5" width="25" height="25" fill="#050505"/>
                    <rect x="75" y="10" width="15" height="15" fill="white"/>
                    <rect x="5" y="70" width="25" height="25" fill="#050505"/>
                    <rect x="10" y="75" width="15" height="15" fill="white"/>
                    {/* Small inner design details */}
                    <rect x="35" y="15" width="10" height="5" fill="#050505"/>
                    <rect x="40" y="25" width="15" height="10" fill="#050505"/>
                    <rect x="60" y="35" width="10" height="10" fill="#050505"/>
                    <rect x="25" y="45" width="20" height="15" fill="#050505"/>
                    <rect x="50" y="65" width="25" height="20" fill="#050505"/>
                    <rect x="70" y="45" width="15" height="15" fill="#050505"/>
                    <rect x="5" y="40" width="10" height="10" fill="#050505"/>
                    <rect x="85" y="75" width="10" height="10" fill="#050505"/>
                  </svg>
                  {/* Neon orange glowing center badge */}
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-brand-orange border border-white flex items-center justify-center text-white">
                    <Zap size={14} className="animate-pulse" />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <button
                    onClick={handleCopyPix}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-black border border-white/10 hover:border-brand-orange/30 text-xs font-semibold text-white transition-all duration-300"
                  >
                    {copiedPix ? 'Chave Copiada!' : 'Copiar Código Copia e Cola'}
                  </button>
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg transition-all duration-300"
                  >
                    Simular Pagamento Aprovado
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="space-y-6 max-w-md w-full py-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 animate-bounce">
                  <ShieldCheck size={36} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Pagamento Aprovado!</h4>
                  <p className="text-xs text-white/50 mt-1">Sua compra fictícia foi processada com sucesso.</p>
                </div>
                
                <div className="p-5 rounded-2xl bg-brand-black/40 border border-white/5 w-full text-left space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Detalhes de Acesso</h5>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Em uma loja real, você receberia agora mesmo o link do GitHub para clonar o repositório ou um arquivo compactado `.zip` contendo todo o código-fonte whitelabel configurado.
                  </p>
                  <div className="p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-[11px] text-brand-orange font-mono">
                    Token de Licença: TX-NEXUS-92718362
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutStep('none');
                    onClose();
                  }}
                  className="w-full px-5 py-3 rounded-xl bg-brand-darkGray border border-white/10 hover:border-brand-orange/30 text-xs font-semibold text-white transition-all duration-300"
                >
                  Concluir e Voltar ao Catálogo
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
