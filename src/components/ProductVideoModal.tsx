import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Zap, AlertCircle } from 'lucide-react';
import type { Product } from '../data/products';
import { useDiscountWheel, type DiscountData } from '../hooks/useDiscountWheel';

interface ProductVideoModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductVideoModal: React.FC<ProductVideoModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  const { getActiveDiscount, buildCheckoutUrl } = useDiscountWheel();
  const [activeDiscount, setActiveDiscount] = useState<DiscountData | null>(null);

  useEffect(() => {
    if (product) {
      setActiveDiscount(getActiveDiscount(product.id));
    }
  }, [product, getActiveDiscount]);

  if (!product) return null;

  // Converter URL de vídeo para Embed (YouTube, Vimeo, etc)
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      // YouTube Standard
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : url;
      }
      // YouTube Short / youtu.be
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('youtube.com/shorts/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      // Vimeo
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/')[1].split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
      }
      // Loom
      if (url.includes('loom.com/share/')) {
        const id = url.split('loom.com/share/')[1].split('?')[0];
        return `https://www.loom.com/embed/${id}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const videoUrl = product.videoUrl ? getEmbedUrl(product.videoUrl) : null;
  const isDirectMp4 = videoUrl?.toLowerCase().endsWith('.mp4');

  const price = activeDiscount ? activeDiscount.discountedPrice : product.price;

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = buildCheckoutUrl(product.checkoutUrl, activeDiscount);
    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Glow Accent */}
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20 bg-[#F97316]"
            />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-10 bg-[#FF8A00]"
            />

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 relative z-10">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{product.name}</h2>
                <p className="text-xs sm:text-sm text-white/50 mt-1 truncate max-w-xl">{product.shortDescription}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors ml-4 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Video/Fallback) */}
            <div className="relative w-full bg-black/80 aspect-video flex-shrink-0 flex items-center justify-center overflow-hidden z-10">
              {videoUrl ? (
                isDirectMp4 ? (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={videoUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <AlertCircle className="text-white/30" size={32} />
                  </div>
                  <h3 className="text-white/80 font-medium mb-2">Vídeo demonstrativo indisponível</h3>
                  <p className="text-white/40 text-sm max-w-md">
                    No momento não temos um vídeo de demonstração para este produto. Por favor, leia os detalhes do produto abaixo ou entre em contato com nosso atendimento para mais informações.
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#111827] relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Investimento</span>
                <div className="flex items-center gap-2">
                  {activeDiscount ? (
                    <>
                      <span className="text-sm text-white/30 line-through">R$ {product.price.toFixed(2)}</span>
                      <span className="text-xl sm:text-2xl text-[#10B981] font-black">R$ {price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-xl sm:text-2xl text-white font-black">R$ {price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    onClose();
                    onAddToCart(product, e);
                  }}
                  className="flex-1 sm:flex-none py-3 px-6 rounded-xl border border-white/20 text-white text-sm font-black bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <ShoppingCart size={16} />
                  Adicionar
                </button>
                <button
                  onClick={handleBuyClick}
                  className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] shadow-[0_0_20px_rgba(249,115,22,0.3)] text-white text-sm font-black flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Zap size={16} />
                  Comprar Agora
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
