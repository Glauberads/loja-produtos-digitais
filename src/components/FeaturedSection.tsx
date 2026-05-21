import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';

interface FeaturedSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  products,
  onOpenDetails,
}) => {
  // Get 3 specific premium launches (e.g. Builderfy AI, VoiceAgent AI, SaaS Delivery Multi-Tenant)
  const featuredProducts = React.useMemo(() => {
    return products.filter(p => 
      p.id === 'builderfy-ai' || 
      p.id === 'voiceagent-ai' || 
      p.id === 'saas-delivery'
    );
  }, [products]);

  return (
    <section id="lancamentos" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative scroll-mt-20">
      
      {/* Title */}
      <div className="flex flex-col items-center text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-semibold text-brand-orange uppercase tracking-wider">
          <Sparkles size={12} className="animate-pulse" />
          <span>Vitrine de Destaque</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
          Lançamentos <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange font-black">Ultra Premium</span>
        </h2>
        <p className="text-sm text-white/50 max-w-md">
          Conheça as nossas ferramentas mais avançadas com código-fonte completo e licença whitelabel ilimitada.
        </p>
      </div>

      {/* Grid horizontal/verticais grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onOpenDetails(product)}
            className="group relative cursor-pointer rounded-3xl bg-brand-darkGray/30 border border-white/5 overflow-hidden transition-all duration-300 hover:border-brand-orange/20 hover:scale-[1.01] glow-card flex flex-col justify-between"
          >
            {/* Tech Gradient Overlay header */}
            <div className={`relative h-48 bg-gradient-to-br ${product.gradient} flex items-center justify-center p-6 border-b border-white/5`}>
              <div className="absolute inset-0 bg-brand-black/20 tech-grid-bg opacity-30"></div>
              
              {/* Launcher glow line top */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-orange to-transparent"></div>

              {/* Dynamic Logo inside card */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-brand-black/85 flex items-center justify-center border border-white/10 shadow-neon-orange group-hover:border-brand-orange/40 transition-colors duration-300">
                  <TechIcon name={product.iconName} className="text-brand-orange group-hover:scale-110 transition-transform duration-300" size={32} />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest bg-brand-black/85 border border-white/5 text-white/60 px-2.5 py-0.5 rounded-full">
                  Categoria: {product.category}
                </span>
              </div>

              {/* Float Neon Badge */}
              <div className="absolute top-4 right-4 bg-brand-orange px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest uppercase text-white shadow-neon-orange">
                EXCLUSIVO
              </div>
            </div>

            {/* Info details */}
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                  {product.longDescription}
                </p>

                {/* Micro feature check bullets */}
                <div className="space-y-2 pt-2">
                  {product.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                      <ShieldCheck size={14} className="text-brand-orange shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing area */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Preço Whitelabel</span>
                  <p className="text-2xl font-black text-white font-mono">R$ {product.price}</p>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-semibold px-4.5 py-2.5 rounded-xl bg-brand-orange text-white shadow-neon-orange group-hover:shadow-neon-orange-lg group-hover:scale-105 transition-all duration-300">
                  Adquirir Licença
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </section>
  );
};
