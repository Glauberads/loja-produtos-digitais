import React from 'react';
import { ShoppingCart, Globe, CreditCard, Zap, Heart } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';
import { motion } from 'framer-motion';
import { useDiscountWheel, type DiscountData } from '../hooks/useDiscountWheel';
import { DiscountCountdown } from './wheel/DiscountCountdown';
import { useDiscountWheelContext } from '../context/DiscountWheelContext';
import { useFavorites } from '../hooks/useFavorites';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenVideo?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onAddToCart,
  onOpenVideo
}) => {
  const { openWheel } = useDiscountWheelContext();
  const { getActiveDiscount, clearExpiredDiscount, buildCheckoutUrl } = useDiscountWheel();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeDiscount, setActiveDiscount] = React.useState<DiscountData | null>(null);
  const [copiedCoupon, setCopiedCoupon] = React.useState(false);
  
  const isFav = isFavorite(product.id);

  React.useEffect(() => {
    const checkDiscount = () => {
      const discount = getActiveDiscount(product.id);
      setActiveDiscount(discount);
    };
    
    checkDiscount();
    
    window.addEventListener('storage', checkDiscount);
    return () => window.removeEventListener('storage', checkDiscount);
  }, [product.id, getActiveDiscount]);

  // Removed handleOpenWheel to use inline directly as requested

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDiscount) {
      navigator.clipboard.writeText(activeDiscount.coupon);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };
  
  // Dynamic header copy and mockup visualization based on category/name
  const getHeaderDetails = () => {
    const isWhatsApp = product.category.toLowerCase().includes('whatsapp') || 
                       product.name.toLowerCase().includes('zap') || 
                       product.name.toLowerCase().includes('whats');
    const isIA = product.category.toLowerCase().includes('ia') || 
                 product.category.toLowerCase().includes('inteligência') || 
                 product.name.toLowerCase().includes('ai') || 
                 product.name.toLowerCase().includes('ia');
    
    let headline = '';
    let type: 'whatsapp' | 'ia' | 'saas' = 'saas';

    if (isWhatsApp) {
      headline = 'Transforme o WhatsApp em uma Máquina de Leads B2B';
      type = 'whatsapp';
    } else if (isIA) {
      headline = 'Transforme a Inteligência Artificial em Máquina de Vendas';
      type = 'ia';
    } else {
      headline = `Transforme o ${product.name} em uma Máquina de Faturamento`;
      type = 'saas';
    }

    return { headline, type };
  };

  const { headline, type } = getHeaderDetails();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-[24px] bg-theme-card border border-theme-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full select-none"
    >
      
      {/* 1. TOP PORTION (Gradient + Mockup Header) */}
      <div className={`relative w-full h-[250px] bg-gradient-to-br ${product.gradient} border-b border-theme-border flex flex-col justify-between overflow-hidden`}>
        
        {/* CLICKABLE OVERLAY FOR PRODUCT DETAILS */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="absolute inset-0 z-0 cursor-pointer"
        />
        
        {/* Abstract light grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>

        {/* Badges and Heart */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <span className="bg-[#EAB308] text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
            ★ DESTAQUE
          </span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product);
            }}
            className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <Heart size={15} className={`${isFav ? 'text-brand-orange fill-brand-orange' : 'text-white'}`} />
          </button>
        </div>
        <div className="absolute top-3 right-3 z-20">
          {!activeDiscount ? (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof openWheel === 'function') {
                  openWheel(product);
                } else {
                  console.error("ERRO FATAL: openWheel não é uma função. ProductCard está FORA do DiscountWheelProvider!");
                }
              }}
              className="bg-[#F97316] hover:bg-brand-neonOrange text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider transition-colors cursor-pointer relative"
            >
              GANHE ATÉ 20% OFF
            </button>
          ) : (
            <div className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1">
              <span>{activeDiscount.discount}% OFF ATIVO</span>
            </div>
          )}
        </div>

        {/* Headline dynamic text */}
        <div className="text-center px-4 pt-11 z-10 pointer-events-none">
          <h4 className="text-[11px] sm:text-xs font-black text-theme-text leading-snug">
            {headline.split(' ').map((word, i) => {
              const highlightWords = ['WhatsApp', 'Inteligência', 'Artificial', product.name];
              const cleanedWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
              const isHighlight = highlightWords.some(hw => hw.toLowerCase() === cleanedWord.toLowerCase());
              return (
                <span key={i} className={isHighlight ? "text-blue-600 font-extrabold" : ""}>
                  {word}{' '}
                </span>
              );
            })}
          </h4>
        </div>

        {/* Mockups Container */}
        <div className="flex items-center justify-center gap-2.5 px-4 my-auto relative z-10 pointer-events-none">
          
          {/* A. 3D Product Box Software Mockup */}
          <div className="w-[45px] h-[65px] rounded-lg bg-gradient-to-br from-brand-orange to-brand-neonOrange flex flex-col items-center justify-between p-1.5 shadow-[2px_4px_10px_rgba(0,0,0,0.15)] relative transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 border border-white/20 shrink-0">
            <div className="w-full h-1 bg-white/20 rounded-full"></div>
            <TechIcon name={product.iconName} className="text-white animate-pulse" size={18} />
            <span className="text-[5px] font-black text-white tracking-tighter truncate w-full text-center uppercase font-mono">{product.name}</span>
          </div>

          {/* B. Simulated Dashboard Screen (Laptop mockup) */}
          <div className="flex-1 max-w-[130px] aspect-[4/3] rounded-md bg-[#1F2937] border border-gray-300 p-[3px] flex flex-col justify-between shadow-lg relative transform translate-y-1">
            <div className="flex items-center gap-0.5 border-b border-white/5 pb-0.5">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
              <span className="w-1 h-1 rounded-full bg-green-400"></span>
            </div>
            
            <div className="flex-1 bg-white p-1 rounded-sm flex flex-col justify-between text-[4.5px] text-gray-500 font-mono">
              <div className="flex justify-between border-b border-gray-100 pb-0.5 font-sans font-bold text-gray-700">
                <span className="truncate max-w-[50px]">{product.name} Manager</span>
                <span className="text-[3px] text-emerald-500 font-black animate-pulse">● LIVE</span>
              </div>
              
              {type === 'whatsapp' ? (
                <div className="space-y-0.5 leading-none">
                  <div className="bg-green-50 text-[3.5px] text-green-700 p-0.5 rounded font-sans font-bold">💬 Chatbot Ativo</div>
                  <div className="bg-gray-50 p-0.5 rounded font-sans">👤 4 Atendentes</div>
                </div>
              ) : type === 'ia' ? (
                <div className="space-y-0.5 leading-none">
                  <div className="bg-purple-50 text-[3.5px] text-purple-700 p-0.5 rounded font-sans font-bold">🤖 Agente GPT: ON</div>
                  <div className="bg-gray-50 p-0.5 rounded font-sans">📊 Model: Claude 3.5</div>
                </div>
              ) : (
                <div className="space-y-0.5 leading-none">
                  <div className="bg-blue-50 text-[3.5px] text-blue-700 p-0.5 rounded font-sans font-bold">💳 SaaS Multi-tenant</div>
                  <div className="bg-gray-50 p-0.5 rounded font-sans">📦 Whitelabel pronto</div>
                </div>
              )}

              <div className="w-full bg-gray-100 h-0.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]" />
              </div>
            </div>
          </div>

          {/* C. Small Phone mockup on right */}
          <div className="w-[30px] aspect-[9/16] rounded-md bg-[#111827] border border-gray-400 p-[2px] flex flex-col justify-between shadow-[2px_4px_10px_rgba(0,0,0,0.15)] shrink-0 transform rotate-3">
            <div className="w-2.5 h-[1.5px] bg-white/20 rounded-full mx-auto mb-0.5"></div>
            <div className="flex-1 bg-[#F3F4F6] rounded-[2px] p-0.5 flex flex-col justify-between text-[3.5px] text-gray-400">
              <div className="w-full bg-green-500 h-[1px] rounded-full"></div>
              <div className="flex flex-col gap-0.5 leading-none">
                <div className="bg-white p-0.5 rounded-[1px] w-4 ml-auto text-[3px]">Olá!</div>
                <div className="bg-green-100 text-[#065F46] p-0.5 rounded-[1px] w-4 text-[3px] font-bold">Menu...</div>
              </div>
            </div>
          </div>

        </div>

        {/* Integration logos */}
        <div className="flex items-center justify-center gap-1.5 text-[6.5px] text-gray-500 font-bold bg-[#EBF3FE] border border-blue-100 px-2 py-0.5 rounded-full mx-auto my-0.5 z-10 shrink-0">
          <span>Integração</span>
          <span className="text-blue-300">|</span>
          <span className="text-gray-700">n8n</span>
          <span className="text-gray-700">make</span>
          <span className="text-gray-700">zapier</span>
        </div>

        {/* Features Checklist */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-left text-[7px] text-white/90 font-bold px-5 pb-9 z-10 shrink-0">
          {product.features.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-0.5 truncate max-w-[120px]">
              <span className="text-brand-orange font-black">✓</span>
              <span className="truncate">{f}</span>
            </div>
          ))}
        </div>

        {/* Blue CTA Banner overlay on division */}
        <div className="absolute bottom-0 inset-x-0 mx-4 translate-y-1/2 bg-[#2563EB] text-white text-[8px] font-black py-2 rounded-lg text-center uppercase tracking-wider shadow-md hover:bg-blue-700 transition-colors z-20">
          Baixe agora o código-fonte completo
        </div>

      </div>

      {/* 2. BOTTOM PORTION (Details, Prices and Action Buttons) */}
      <div className="p-5 pt-7 flex flex-col justify-between flex-grow">
        
        {/* Name and description with Rocket emoji */}
        <div>
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-base font-extrabold text-theme-text tracking-tight hover:text-brand-orange transition-colors cursor-pointer truncate"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-theme-muted mt-1 line-clamp-2 leading-relaxed">
            🚀 {product.name} — {product.shortDescription}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[9px] font-bold text-brand-orange">
              {product.salesCount > 500 ? (
                <><span>⚡</span> Alta demanda hoje</>
              ) : (
                <><span>👀</span> {Math.max(2, Math.floor(product.salesCount * 0.05) + (product.name.length % 5))} pessoas vendo</>
              )}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div>
          {/* Card Price */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 text-xs text-theme-text font-bold">
              <CreditCard size={13} className="text-theme-muted" />
              {activeDiscount ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-theme-muted line-through">R$ {product.price.toFixed(2)}</span>
                  <span className="text-sm text-emerald-500 font-black">R$ {activeDiscount.discountedPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span>
                  R$ {product.price.toFixed(2)} <span className="text-theme-muted font-normal">NO CARTÃO</span>
                </span>
              )}
            </div>
            
            {activeDiscount && (
              <DiscountCountdown 
                expiresAt={activeDiscount.expiresAt} 
                onExpire={() => clearExpiredDiscount(product.id)}
              />
            )}
          </div>

          {/* Green Discount Offer Banner */}
          {!activeDiscount ? (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openWheel(product);
              }}
              className="mt-2.5 py-1.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-[#D1FAE5] flex items-center justify-center gap-1 w-full text-[11px] font-black text-[#059669] transition-colors"
            >
              <span>🎁 Pague só R$ {(product.price * 0.8).toFixed(2)}</span>
              <span className="text-[8px] text-[#34D399] font-bold uppercase tracking-wider bg-white/50 px-1.5 py-0.5 rounded">CLIQUE PARA GANHAR</span>
            </button>
          ) : (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1 text-[11px] font-black text-emerald-700">
                <span>CUPOM: {activeDiscount.coupon}</span>
              </div>
              <button 
                onClick={handleCopyCoupon}
                className="py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[10px] font-bold text-gray-600 transition-colors"
              >
                {copiedCoupon ? 'COPIADO!' : 'COPIAR'}
              </button>
            </div>
          )}

          {/* Buttons Row 1: Carrinho + Comprar */}
          <div className="flex items-center gap-2.5 mt-3 w-full">
            <button 
              onClick={(e) => onAddToCart(product, e)}
              className="flex-1 py-2.5 rounded-xl border border-theme-border text-theme-text text-xs font-black bg-theme-bg hover:bg-theme-border/50 flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <ShoppingCart size={13} />
              Adicionar
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const targetUrl = buildCheckoutUrl(product.checkoutUrl, activeDiscount);
                if (targetUrl && targetUrl !== '#') {
                  window.location.href = targetUrl;
                } else {
                  onOpenDetails(product);
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange hover:shadow-neon-orange text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
            >
              <Zap size={13} />
              Comprar
            </button>
          </div>

          {/* Buttons Row 2: Ver Mais (Video Modal) */}
          <div className="flex items-center gap-2.5 mt-2.5 w-full">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenVideo) {
                  onOpenVideo(product);
                } else if (product.detailsUrl) {
                  window.open(product.detailsUrl, '_blank');
                } else {
                  onOpenDetails(product);
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-theme-border/20 border border-theme-border hover:bg-theme-border/40 text-theme-text text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <Globe size={13} />
              Ver Mais
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
