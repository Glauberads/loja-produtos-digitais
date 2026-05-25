import React from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface BestSellersProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenVideo: (product: Product) => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({
  products,
  onOpenDetails,
  onAddToCart,
  onOpenVideo
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Filter top 8 products based on sales count
  const bestSellers = React.useMemo(() => {
    return [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 8);
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollOffset = clientWidth * 0.75;
      
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollOffset : scrollLeft + scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
      
      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-brand-orange/5 neon-sphere -translate-y-1/2"></div>

      {/* Header with control buttons */}
      <div className="flex items-end justify-between mb-10 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="text-brand-orange animate-pulse" size={20} />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              Os Mais <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange font-black">Vendidos</span>
            </h2>
          </div>
          <p className="text-sm text-white/50">
            Os sistemas e automações mais procurados pelos integradores e desenvolvedores.
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-3 rounded-xl bg-brand-darkGray/60 border border-white/5 text-white/70 hover:text-brand-orange hover:border-brand-orange/30 hover:bg-brand-darkGray transition-all duration-300 active:scale-90"
            title="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-3 rounded-xl bg-brand-darkGray/60 border border-white/5 text-white/70 hover:text-brand-orange hover:border-brand-orange/30 hover:bg-brand-darkGray transition-all duration-300 active:scale-90"
            title="Próximo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Sliding Viewport */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-6 scrollbar-thin relative z-10 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // hide standard scrollbars
      >
        {bestSellers.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0"
          >
            <ProductCard
              product={product}
              onOpenDetails={onOpenDetails}
              onAddToCart={onAddToCart}
              onOpenVideo={onOpenVideo}
            />
          </div>
        ))}
      </div>

    </section>
  );
};
