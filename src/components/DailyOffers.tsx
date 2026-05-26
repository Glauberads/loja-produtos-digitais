import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, Gift } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface DailyOffersProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenVideo: (product: Product) => void;
}

export const DailyOffers: React.FC<DailyOffersProps> = ({ products, onOpenDetails, onAddToCart, onOpenVideo }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calcula o tempo até o fim do dia
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pegamos os 3 primeiros produtos (ou 3 aleatórios com base no dia)
  const todayOffers = React.useMemo(() => {
    // Usando uma seed baseada no dia para manter as ofertas do dia consistentes
    const seed = new Date().getDate();
    return [...products]
      .sort((a, b) => ((a.name.length * seed) % 10) - ((b.name.length * seed) % 10))
      .slice(0, 3);
  }, [products]);

  if (todayOffers.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-brand-orange/5 via-theme-bg to-brand-neonOrange/5 border-y border-theme-border mt-12">
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-brand-orange/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Ofertas */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-neonOrange flex items-center justify-center text-white shadow-neon-orange animate-pulse">
              <Gift size={28} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-theme-text flex items-center gap-2">
                Ofertas Relâmpago <Zap size={24} className="text-brand-orange" />
              </h2>
              <p className="text-theme-muted mt-1 font-medium">Condições exclusivas válidas somente para hoje.</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 bg-theme-card border border-brand-orange/30 rounded-2xl p-3 shadow-lg">
            <Timer className="text-brand-orange" size={20} />
            <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Termina em:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <div className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-2 py-1 rounded-md text-lg font-black w-10 text-center">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className="text-brand-orange font-black text-lg">:</span>
              <div className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-2 py-1 rounded-md text-lg font-black w-10 text-center">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className="text-brand-orange font-black text-lg">:</span>
              <div className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-2 py-1 rounded-md text-lg font-black w-10 text-center animate-pulse">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todayOffers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onOpenDetails={onOpenDetails}
                onAddToCart={onAddToCart}
                onOpenVideo={onOpenVideo}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
