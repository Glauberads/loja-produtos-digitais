import React from 'react';
import { 
  MessageSquare, Cpu, Layers, LayoutDashboard, Zap, 
  Briefcase, TrendingUp, FileCode, ShoppingCart, ShoppingBag, Users 
} from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

interface CategoryItem {
  name: string;
  count: number;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'IA', count: 7, description: 'Agentes autônomos e chatbots de IA', icon: Cpu, color: 'from-purple-500/20 to-pink-500/20 text-purple-400' },
  { name: 'WhatsApp', count: 5, description: 'Automações e sistemas multiatendimento', icon: MessageSquare, color: 'from-green-500/20 to-emerald-500/20 text-green-400' },
  { name: 'SaaS', count: 6, description: 'Sistemas multi-tenant whitelabel prontos', icon: Layers, color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
  { name: 'Automação', count: 5, description: 'Robôs e raspadores de dados eficientes', icon: Zap, color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400' },
  { name: 'Dashboard', count: 4, description: 'Painéis administrativos e templates', icon: LayoutDashboard, color: 'from-violet-500/20 to-purple-500/20 text-violet-400' },
  { name: 'CRM', count: 4, description: 'Gestores de funil de vendas e contatos', icon: Users, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400' },
  { name: 'Delivery', count: 2, description: 'Pedidos online e cardápios digitais', icon: ShoppingBag, color: 'from-red-500/20 to-orange-500/20 text-red-400' },
  { name: 'Agência', count: 2, description: 'Sistemas ERP e gestão de contratos', icon: Briefcase, color: 'from-amber-500/20 to-yellow-500/20 text-amber-400' },
  { name: 'Financeiro', count: 4, description: 'Controle de caixa e emissão de notas', icon: TrendingUp, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
  { name: 'Landing Pages', count: 3, description: 'Templates de páginas de conversão', icon: FileCode, color: 'from-brand-orange/20 to-red-500/20 text-brand-neonOrange' },
  { name: 'E-commerce', count: 2, description: 'Plataformas completas de vendas online', icon: ShoppingCart, color: 'from-sky-500/20 to-indigo-500/20 text-sky-400' },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    
    // Smooth scroll to product catalog
    setTimeout(() => {
      const el = document.getElementById('vitrine');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative">
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
          Navegue por <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange">Categorias</span>
        </h2>
        <p className="text-sm text-white/50 max-w-md">
          Selecione uma categoria para filtrar o catálogo de ferramentas prontas de alto valor.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        
        {/* All Products Card */}
        <div
          onClick={() => setSelectedCategory(null)}
          className={`group cursor-pointer rounded-2xl p-5 border text-left transition-all duration-300 flex flex-col justify-between aspect-square md:aspect-auto md:h-44 ${
            selectedCategory === null
              ? 'bg-brand-orange/10 border-brand-orange/40 shadow-neon-orange'
              : 'bg-brand-darkGray/40 border-white/5 hover:border-white/15 hover:bg-brand-darkGray/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-white/5 text-white transition-colors duration-300 group-hover:bg-brand-orange/20 group-hover:text-brand-orange`}>
              <Layers size={22} />
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
              Ver todos
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">
              Todos os Sistemas
            </h3>
            <p className="text-xs text-white/40 mt-1 line-clamp-2">
              Explore todo o nosso catálogo completo com 42 ferramentas digitais.
            </p>
          </div>
        </div>

        {/* Categories cards */}
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              className={`group cursor-pointer rounded-2xl p-5 border text-left transition-all duration-300 flex flex-col justify-between aspect-square md:aspect-auto md:h-44 ${
                isSelected
                  ? 'bg-brand-orange/10 border-brand-orange/40 shadow-neon-orange'
                  : 'bg-brand-darkGray/40 border-white/5 hover:border-white/15 hover:bg-brand-darkGray/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10 ${cat.color.split(' ')[2]}`}>
                  <Icon size={22} />
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40 group-hover:bg-white/10 transition-colors">
                  {cat.count} itens
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
