import React from 'react';
import { SidebarFilters } from './SidebarFilters';
import { ProductCard } from './ProductCard';
import type { Product } from '../data/products';
import { SearchX, SlidersHorizontal, Grid3X3 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenVideo: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  searchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenDetails,
  onAddToCart,
  onOpenVideo
}) => {
  // Local Filter States
  const [maxPrice, setMaxPrice] = React.useState<number>(1000);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<string>('popular');
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState<boolean>(false);

  // Apply filters in client side
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((product) => {
        // Search Filter
        const matchesSearch = 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category Filter
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        
        // Price Filter
        const matchesPrice = product.price <= maxPrice;
        
        // Tag / Badge Filter
        const matchesTag = selectedTag ? product.badge === selectedTag : true;

        return matchesSearch && matchesCategory && matchesPrice && matchesTag;
      })
      .sort((a, b) => {
        // Sort Filter
        if (sortBy === 'recent') {
          return a.badge === 'NOVO' ? -1 : 1; // Fictional recency
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        // Popularity by default (salesCount)
        return b.salesCount - a.salesCount;
      });
  }, [products, searchQuery, selectedCategory, maxPrice, selectedTag, sortBy]);

  return (
    <section id="vitrine" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative scroll-mt-20">
      
      {/* Title & Counter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Grid3X3 className="text-brand-orange" size={20} />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-theme-text">
              Vitrine de <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange font-black">Sistemas</span>
            </h2>
          </div>
          <p className="text-xs text-theme-muted mt-1 font-mono">
            Mostrando {filteredProducts.length} de {products.length} soluções digitais premium prontas.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-theme-card border border-theme-border text-xs font-semibold text-theme-text"
        >
          <SlidersHorizontal size={14} className="text-brand-orange" />
          Filtros & Ordenação
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block shrink-0">
          <SidebarFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Sidebar Filters - Mobile Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden w-full mb-4 animate-fadeIn">
            <SidebarFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 w-full">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={onOpenDetails}
                  onAddToCart={onAddToCart}
                  onOpenVideo={onOpenVideo}
                />
              ))}
            </div>
          ) : (
            // No Products State
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-theme-card/30 border border-theme-border">
              <div className="p-4 rounded-full bg-theme-card border border-theme-border text-theme-muted mb-4 animate-bounce">
                <SearchX size={32} />
              </div>
              <h3 className="text-lg font-bold text-theme-text mb-2">Nenhum sistema encontrado</h3>
              <p className="text-xs text-theme-muted max-w-sm leading-relaxed">
                Tente ajustar os termos de busca, selecionar outra categoria ou elevar a faixa de preço máxima.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
