import React from 'react';
import { Search, ShoppingCart, User, Layers, Sparkles, Zap, Menu, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  setSelectedCategory,
  cartCount,
  onOpenCart
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glassmorphism-header border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCategory(null)}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-neonOrange shadow-neon-orange overflow-hidden group">
              <Zap className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-brand-orange">
              NEXUS<span className="text-brand-orange font-extrabold">SAAS</span>
            </span>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40 group-focus-within:text-brand-orange transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sistemas, automações, dashboards..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black/40 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all duration-300 group-hover:border-white/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation - Right */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a
                href="#vitrine"
                className="text-sm font-medium text-white/70 hover:text-brand-orange transition-all duration-300 flex items-center gap-1.5"
              >
                <Layers size={14} className="text-brand-orange" />
                Explorar Vitrine
              </a>
              <a
                href="#lancamentos"
                className="text-sm font-medium text-white/70 hover:text-brand-orange transition-all duration-300 flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-brand-orange animate-bounce" />
                Lançamentos
              </a>
            </nav>

            <div className="h-6 w-[1px] bg-white/10"></div>

            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button 
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-brand-darkGray/60 border border-white/5 text-white/80 hover:text-white hover:border-brand-orange/30 hover:bg-brand-darkGray/90 transition-all duration-300"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white shadow-neon-orange animate-scaleIn">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Login Button */}
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-semibold text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                <User size={16} />
                Área do Cliente
              </button>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-brand-darkGray/60 border border-white/5 text-white/80"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white shadow-neon-orange">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-brand-darkGray/60 border border-white/5 text-white/80"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-brand-black/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-4 animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar sistemas, automações..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-darkGray border border-white/10 text-sm text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <a
              href="#vitrine"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium text-white/80 hover:text-white flex items-center gap-2"
            >
              <Layers size={16} className="text-brand-orange" />
              Explorar Vitrine
            </a>
            <a
              href="#lancamentos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium text-white/80 hover:text-white flex items-center gap-2"
            >
              <Sparkles size={16} className="text-brand-orange" />
              Lançamentos
            </a>
          </div>

          {/* Mobile Login Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white shadow-neon-orange">
            <User size={18} />
            Área do Cliente
          </button>
        </div>
      )}
    </header>
  );
};
