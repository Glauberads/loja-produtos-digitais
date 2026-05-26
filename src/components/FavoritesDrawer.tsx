import React from 'react';
import { Heart, X, ShoppingCart, Trash2 } from 'lucide-react';
import type { Product } from '../data/products';
import { TechIcon } from './TechIcon';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
      ></div>
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-theme-bg/95 backdrop-blur-xl border-l border-theme-border text-theme-text flex flex-col shadow-2xl relative animate-slideLeft">
          
          <div className="p-6 border-b border-theme-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Heart className="text-brand-orange fill-brand-orange" size={20} />
              <h3 className="font-bold text-base uppercase tracking-wider">Favoritos</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:text-theme-text border border-transparent hover:border-theme-border"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {favorites.length > 0 ? (
              favorites.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col p-3 rounded-xl bg-theme-card border border-theme-border hover:border-theme-muted transition-colors shadow-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                      <TechIcon name={item.iconName} className="text-white" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-theme-text truncate">{item.name}</h4>
                      <p className="text-[10px] text-theme-muted">{item.category}</p>
                    </div>
                    <span className="text-xs font-bold text-theme-text font-mono shrink-0">
                      R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-theme-border">
                    <button
                      onClick={() => onRemoveFavorite(item)}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={12} />
                      Remover
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(item);
                        onRemoveFavorite(item);
                      }}
                      className="flex-1 py-2 rounded-lg bg-brand-orange/10 text-brand-orange text-xs font-bold hover:bg-brand-orange hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart size={12} />
                      Comprar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-theme-muted space-y-3">
                <Heart size={40} className="stroke-[1.5] text-theme-muted" />
                <p className="text-xs font-semibold">Nenhum sistema favoritado.</p>
                <button 
                  onClick={onClose}
                  className="text-xs text-brand-orange font-bold hover:underline"
                >
                  Explorar Vitrine
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
