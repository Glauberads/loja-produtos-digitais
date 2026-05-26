import { useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { useAnalytics } from './useAnalytics';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem('nexus_favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    
    loadFavorites();
    window.addEventListener('favorites_changed', loadFavorites);
    return () => window.removeEventListener('favorites_changed', loadFavorites);
  }, []);

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.id === product.id);
      let newFavs;
      
      if (exists) {
        newFavs = prev.filter(item => item.id !== product.id);
        trackEvent('favorite_removed', { product_id: product.id, product_name: product.name });
      } else {
        newFavs = [...prev, product];
        trackEvent('favorite_added', { product_id: product.id, product_name: product.name });
      }
      
      localStorage.setItem('nexus_favorites', JSON.stringify(newFavs));
      window.dispatchEvent(new Event('favorites_changed'));
      return newFavs;
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
}
