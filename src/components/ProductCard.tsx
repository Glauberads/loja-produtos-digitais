import React from 'react';
import { ShoppingCart, Globe, CreditCard, Zap } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onAddToCart
}) => {
  
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
      className="group relative rounded-[24px] bg-white border border-gray-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between h-full select-none"
    >
      
      {/* 1. TOP PORTION (Gradient + Mockup Header) */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative w-full h-[250px] bg-gradient-to-tr from-[#DCE8FC] via-[#E8F0FE] to-[#F1EEFC] border-b border-gray-100 flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        
        {/* Abstract light grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#EAB308] text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
            ★ DESTAQUE
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-[#F97316] text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
            GANHE ATÉ 20% OFF
          </span>
        </div>

        {/* Headline dynamic text */}
        <div className="text-center px-4 pt-11 z-10">
          <h4 className="text-[11px] sm:text-xs font-black text-gray-800 leading-snug">
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
        <div className="flex items-center justify-center gap-2.5 px-4 my-auto relative z-10">
          
          {/* A. 3D Product Box Software Mockup */}
          <div className="w-[45px] h-[65px] rounded-lg bg-gradient-to-br from-brand-orange to-brand-neonOrange flex flex-col items-center justify-between p-1.5 shadow-[2px_4px_10px_rgba(0,0,0,0.15)] relative transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 border border-white/20 shrink-0">
            <div className="w-full h-1 bg-white/20 rounded-full"></div>
            <TechIcon name={product.iconName} className="text-white animate-pulse" size={18} />
            <span className="text-[5px] font-black text-white tracking-tighter truncate w-full text-center uppercase font-mono">{product.name}</span>
          </div>

          {/* B. Simulated Dashboard Screen (Laptop mockup) */}
          <div className="flex-1 max-w-[130px] aspect-[4/3] rounded-md bg-[#1F2937] border border-gray-300 p-[3px] flex flex-col justify-between shadow-[0_6px_15px_rgba(0,0,0,0.15)] relative transform translate-y-1">
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
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-left text-[7px] text-gray-600 font-bold px-5 pb-9 z-10 shrink-0">
          {product.features.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-0.5 truncate max-w-[120px]">
              <span className="text-blue-600 font-black">✓</span>
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
            className="text-base font-extrabold text-[#111827] tracking-tight hover:text-blue-600 transition-colors cursor-pointer truncate"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            🚀 {product.name} — {product.shortDescription}
          </p>
        </div>

        {/* Price Section */}
        <div>
          {/* Card Price */}
          <div className="flex items-center gap-1.5 text-xs text-[#374151] mt-4 font-bold">
            <CreditCard size={13} className="text-gray-500" />
            <span>
              R$ {product.price.toFixed(2)} <span className="text-gray-400 font-normal">NO CARTÃO</span>
            </span>
          </div>

          {/* Green Discount Offer Banner */}
          <div className="mt-2.5 py-1.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center gap-1 w-full text-[11px] font-black text-[#059669]">
            <span>🎁 Pague só R$ {(product.price * 0.8).toFixed(2)}</span>
            <span className="text-[8px] text-[#34D399] font-bold uppercase tracking-wider">CLIQUE PARA GANHAR</span>
          </div>

          {/* Buttons Row 1: Carrinho + Comprar */}
          <div className="flex items-center gap-2.5 mt-3 w-full">
            <button 
              onClick={(e) => onAddToCart(product, e)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-black bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <ShoppingCart size={13} />
              Carrinho
            </button>
            <button 
              onClick={() => onOpenDetails(product)} // Opens details which has checkout step
              className="flex-1 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
            >
              <Zap size={13} />
              Comprar
            </button>
          </div>

          {/* Buttons Row 2: Ver Demo (Full Width) */}
          <button 
            onClick={() => onOpenDetails(product)}
            className="w-full mt-2.5 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            <Globe size={13} />
            Ver Demo
          </button>
        </div>

      </div>

    </motion.div>
  );
};
