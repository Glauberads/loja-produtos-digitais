import React from 'react';
import { TrendingUp, ArrowRight, Star } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';

interface TrendingSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  products,
  onOpenDetails,
}) => {
  // Filter 4 specific hot or trending products
  const trendingProducts = React.useMemo(() => {
    return products
      .filter(p => p.badge === 'HOT' || p.badge === 'IA')
      .slice(0, 4);
  }, [products]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative">
      
      {/* Background neon ambient blur */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-brand-orange/5 neon-sphere"></div>

      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Text Area - Left (4 cols) */}
        <div className="lg:col-span-4 space-y-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-semibold text-brand-orange uppercase">
            <TrendingUp size={12} className="text-brand-orange animate-bounce" />
            <span>Tendência de Mercado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans leading-tight">
            Tecnologia <br className="hidden lg:block" />
            Que Está <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange font-black">Em Alta</span>
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Estes sistemas e robôs inteligentes estão dominando as vendas por ajudarem agências e empresas a reduzir custos de operação em até 80% através de automação inteligente de processos.
          </p>
          
          <div className="pt-2">
            <a 
              href="#vitrine"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-neonOrange transition-colors group"
            >
              Explorar todo o catálogo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Cards Grid - Right (8 cols) */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6 w-full">
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onOpenDetails(product)}
              className="group relative cursor-pointer p-6 rounded-2xl bg-brand-darkGray/40 border border-white/5 hover:border-brand-orange/25 transition-all duration-300 hover:scale-[1.01] flex items-start gap-4 shadow-sm hover:shadow-neon-orange/10"
            >
              {/* Left Side: Thumbnail Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.gradient} border border-white/5 flex items-center justify-center shrink-0`}>
                <TechIcon name={product.iconName} className="text-white group-hover:scale-110 transition-transform duration-300" size={24} />
              </div>

              {/* Right Side: Details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors truncate">
                    {product.name}
                  </h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-mono">
                    HOT
                  </span>
                </div>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Rating & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Star size={10} fill="currentColor" className="text-yellow-500" />
                    <span className="text-white/80 font-bold">{product.rating.toFixed(2)}</span>
                    <span>({product.salesCount} vendas)</span>
                  </div>
                  <span className="text-[10px] text-brand-orange font-bold font-mono">
                    R$ {product.price}
                  </span>
                </div>
              </div>

              {/* Top gradient highlight on hover */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-orange/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};
