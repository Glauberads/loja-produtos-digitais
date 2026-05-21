import React from 'react';
import { SlidersHorizontal, DollarSign, Star, Calendar, Flame, RefreshCw } from 'lucide-react';

interface SidebarFiltersProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const CATEGORIES = [
  'Delivery', 'WhatsApp', 'IA', 'CRM', 'Dashboard', 
  'Automação', 'SaaS', 'Agência', 'Financeiro', 'Landing Pages', 'E-commerce'
];

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
}) => {
  
  const handleReset = () => {
    setSelectedCategory(null);
    setMaxPrice(1000);
    setSelectedTag(null);
    setSortBy('popular');
  };

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-6 p-6 rounded-2xl glassmorphism h-fit border border-white/5 relative">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-brand-orange" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-white">Filtros</h3>
        </div>
        <button 
          onClick={handleReset}
          className="text-xs text-white/40 hover:text-brand-orange flex items-center gap-1 transition-all duration-300"
        >
          <RefreshCw size={10} />
          Limpar
        </button>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Ordenar Por</h4>
        <div className="flex flex-col gap-2">
          {[
            { id: 'popular', label: 'Mais Vendidos', icon: Flame },
            { id: 'recent', label: 'Mais Recentes', icon: Calendar },
            { id: 'rating', label: 'Mais Bem Avaliados', icon: Star },
            { id: 'price-asc', label: 'Menor Preço', icon: DollarSign },
            { id: 'price-desc', label: 'Maior Preço', icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon;
            const active = sortBy === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all duration-300 ${
                  active 
                    ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange' 
                    : 'bg-brand-black/20 border-transparent hover:border-white/10 text-white/60 hover:text-white hover:bg-brand-darkGray/40'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Categorias</h4>
        <div className="flex flex-wrap lg:flex-col gap-1.5 max-h-[180px] lg:max-h-none overflow-y-auto lg:overflow-y-visible pr-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border ${
              selectedCategory === null 
                ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange font-semibold' 
                : 'bg-transparent border-transparent text-white/60 hover:text-white'
            }`}
          >
            Todas as Categorias
          </button>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border ${
                  active 
                    ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange font-semibold' 
                    : 'bg-transparent border-transparent text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Filtro de Destaques</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'IA', label: 'Inteligência Artificial' },
            { id: 'HOT', label: 'Em Alta (Hot)' },
            { id: 'MAIS VENDIDO', label: 'Top Vendas' },
            { id: 'NOVO', label: 'Novidades' }
          ].map((tag) => {
            const active = selectedTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold text-center border transition-all duration-300 ${
                  active 
                    ? 'bg-brand-orange/20 border-brand-orange/40 text-brand-orange' 
                    : 'bg-brand-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                }`}
              >
                {tag.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Faixa de Preço</h4>
          <span className="text-xs text-brand-orange font-bold font-mono">
            Até R$ {maxPrice}
          </span>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-brand-black rounded-lg appearance-none cursor-pointer accent-brand-orange focus:outline-none"
          />
          <div className="flex items-center justify-between text-[9px] text-white/30 font-mono">
            <span>R$ 50</span>
            <span>R$ 500</span>
            <span>R$ 1000+</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
