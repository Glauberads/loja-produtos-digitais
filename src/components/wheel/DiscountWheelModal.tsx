import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, CheckCircle2 } from 'lucide-react';
import { DiscountWheel } from './DiscountWheel';
import { useDiscountWheel, type DiscountData } from '../../hooks/useDiscountWheel';

import type { Product } from '../../data/products';

interface DiscountWheelModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export const DiscountWheelModal: React.FC<DiscountWheelModalProps> = ({ isOpen, product, onClose }) => {
  console.log("MODAL ROLETA PROPS", { isOpen, product });

  if (isOpen && product) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black text-white flex items-center justify-center">
        MODAL DA ROLETA ABERTO
      </div>
    );
  }

  if (!isOpen || !product) return null;

  const { spinWheel, generateCoupon, discountOptions } = useDiscountWheel();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [result, setResult] = useState<DiscountData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSpinClick = () => {
    if (isSpinning || result) return;
    
    // Determine the result right away using the hook
    const value = spinWheel();
    setTargetValue(value);
    setIsSpinning(true);
  };

  const handleSpinEnd = (value: number) => {
    // Generate and persist the coupon
    const couponData = generateCoupon(product.id, value, product.price);
    setResult(couponData);
  };

  const copyCoupon = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0B1020]/90 backdrop-blur-md"
        onClick={() => !isSpinning && onClose()}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-brand-darkGray/95 border border-brand-orange/30 rounded-3xl shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden z-10 flex flex-col"
      >
        {/* Confetti / Glow Effects */}
        {result && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-orange/20 blur-[80px] rounded-full mix-blend-screen" />
          </div>
        )}

        <button 
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="wheel"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest mb-3">
                    <Gift size={12} />
                    Roleta Premium
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                    Gire a roleta e descubra<br/>seu desconto!
                  </h2>
                  <p className="text-sm text-white/50">
                    Tente a sorte e desbloqueie uma oferta exclusiva.
                  </p>
                </div>

                <div className="my-4">
                  <DiscountWheel 
                    options={discountOptions}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                    targetValue={targetValue}
                    onSpinEnd={handleSpinEnd}
                  />
                </div>

                <button
                  onClick={handleSpinClick}
                  disabled={isSpinning}
                  className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-black text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                >
                  {isSpinning ? 'GIRANDO...' : 'GIRAR ROLETA'}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-full flex flex-col items-center py-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                  <Gift size={40} className="relative z-10" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">PARABÉNS!</h2>
                <p className="text-lg text-emerald-400 font-bold mb-6">Você ganhou {result.discount}% OFF</p>

                <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-white/40 font-medium">De:</span>
                    <span className="text-white/40 line-through">R$ {result.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-bold">Por apenas:</span>
                    <span className="text-2xl font-black text-emerald-400">R$ {result.discountedPrice.toFixed(2)}</span>
                  </div>

                  <div className="w-full h-px bg-white/5 mb-4" />

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider text-left">Seu cupom:</span>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#1A1F2E] border border-brand-orange/30 rounded-xl px-4 py-3 text-brand-orange font-mono font-bold text-center tracking-widest text-lg">
                        {result.coupon}
                      </div>
                      <button 
                        onClick={copyCoupon}
                        className="w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        title="Copiar cupom"
                      >
                        {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  APLICAR DESCONTO
                </button>
                <p className="text-[11px] text-white/40 mt-4">
                  Use este cupom no checkout. O desconto expira em 15 minutos!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
