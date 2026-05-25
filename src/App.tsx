import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedSection } from './components/FeaturedSection';
import { BestSellers } from './components/BestSellers';
import { TrendingSection } from './components/TrendingSection';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { PRODUCTS_DATA } from './data/products';
import type { Product } from './data/products';
import { TechIcon } from './components/TechIcon';
import { supabase } from './lib/supabase';
import { ShoppingCart, Trash2, X, ShieldCheck, Zap } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { ProductVideoModal } from './components/ProductVideoModal';
import { DiscountWheelProvider } from './context/DiscountWheelContext';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { WebChatWindow } from './components/chat/WebChatWindow';
import { useWebChat } from './hooks/useWebChat';

function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [cart, setCart] = React.useState<Product[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [simulatedCheckoutActive, setSimulatedCheckoutActive] = React.useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
  const [selectedVideoProduct, setSelectedVideoProduct] = React.useState<Product | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const { products: dbProducts, loading, error } = useProducts(false);
  
  const { isOpen: isChatOpen, setIsOpen: setIsChatOpen } = useWebChat();

  const handleOpenVideo = (product: Product) => {
    setSelectedVideoProduct(product);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoModalOpen(false);
    setTimeout(() => setSelectedVideoProduct(null), 300);
  };

  const displayProducts = React.useMemo(() => {
    if (!loading && !error && dbProducts && dbProducts.length > 0) {
      const sorted = [...dbProducts].sort((a, b) => b.sales_count - a.sales_count);
      return sorted.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category as any,
        shortDescription: p.short_description || '',
        longDescription: p.long_description || '',
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        rating: typeof p.rating === 'string' ? parseFloat(p.rating) : p.rating,
        salesCount: p.sales_count,
        badge: p.badge as any,
        features: p.features || [],
        techStack: p.tech_stack || [],
        gradient: p.gradient || 'from-blue-600/20 via-indigo-600/30 to-brand-black',
        iconName: p.icon_name || 'Box',
        videoUrl: p.video_url || undefined,
        detailsUrl: p.details_url || undefined,
        checkoutUrl: p.checkout_url || undefined
      }));
    }
    return PRODUCTS_DATA;
  }, [dbProducts, loading, error]);

  // Cart operations
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Avoid duplicates in cart for simulated download purchase
    if (cart.some(item => item.id === product.id)) {
      showNotification(`"${product.name}" já está no seu carrinho.`);
      return;
    }

    setCart(prev => [...prev, product]);
    showNotification(`"${product.name}" adicionado ao carrinho!`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const cartTotal = React.useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price, 0);
  }, [cart]);

  const handleCartCheckout = () => {
    setSimulatedCheckoutActive(true);
  };

  const handleConfirmCartPayment = async () => {
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        payment_method: 'PIX',
        status: 'approved'
      }));

      const { error } = await supabase
        .from('orders')
        .insert(orderItems);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao registrar pedidos no Supabase:', err);
    }
    setCheckoutSuccess(true);
    setCart([]);
  };

  return (
    <DiscountWheelProvider>
      <div className="relative min-h-screen bg-brand-black overflow-x-hidden">
        
        {/* Background Neon Blur Nodes */}
      <div className="absolute top-[8%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-orange/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-darkBlue/20 blur-[130px] pointer-events-none"></div>

      {/* Alert Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-4 rounded-xl bg-brand-darkGray border border-brand-orange/45 text-white text-xs font-semibold shadow-neon-orange-lg animate-slideIn">
          <Zap size={14} className="text-brand-orange animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Fixo */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Hero Section */}
      <Hero />

      {/* Categories Selector */}
      <CategoryGrid
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Lançamentos Premium (Destaques) */}
      <FeaturedSection 
        products={displayProducts}
        onOpenDetails={setSelectedProduct}
      />

      {/* Os Mais Vendidos (Carrossel) */}
      <BestSellers
        products={displayProducts}
        onOpenDetails={setSelectedProduct}
        onAddToCart={handleAddToCart}
        onOpenVideo={handleOpenVideo}
      />

      {/* Catálogo Principal de Produtos com Filtros Laterais */}
      <ProductGrid
        products={displayProducts}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenDetails={setSelectedProduct}
        onAddToCart={handleAddToCart}
        onOpenVideo={handleOpenVideo}
      />

      {/* Sistemas em Alta */}
      <TrendingSection
        products={displayProducts}
        onOpenDetails={setSelectedProduct}
      />

      {/* FAQ */}
      <FAQ />

      {/* Footer Premium */}
      <Footer />

      {/* Product Details Modal (Quick View + Pix Checkout inside modal) */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod) => handleAddToCart(prod)}
        />
      )}

      {/* Simulated Cart Drawer (Right Sidebar) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => {
              setCartOpen(false);
              setSimulatedCheckoutActive(false);
              setCheckoutSuccess(false);
            }}
            className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-brand-darkGray/95 border-l border-white/10 text-white flex flex-col justify-between shadow-2xl relative animate-slideLeft">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-brand-orange" size={20} />
                  <h3 className="font-bold text-base uppercase tracking-wider">Seu Carrinho</h3>
                </div>
                <button 
                  onClick={() => {
                    setCartOpen(false);
                    setSimulatedCheckoutActive(false);
                    setCheckoutSuccess(false);
                  }}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:text-white border border-transparent hover:border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!simulatedCheckoutActive ? (
                  cart.length > 0 ? (
                    cart.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-brand-black/40 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                            <TechIcon name={item.iconName} className="text-white" size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <p className="text-[10px] text-white/40">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-white/90 font-mono">R$ {item.price}</span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 text-white/40 space-y-3">
                      <ShoppingCart size={40} className="stroke-[1.5]" />
                      <p className="text-xs font-semibold">Seu carrinho está vazio.</p>
                      <button 
                        onClick={() => setCartOpen(false)}
                        className="text-xs text-brand-orange font-bold hover:underline"
                      >
                        Explorar Vitrine
                      </button>
                    </div>
                  )
                ) : (
                  // SIMULATED CHECKOUT INSIDE CART DRAWER
                  <div className="space-y-6">
                    {!checkoutSuccess ? (
                      <div className="space-y-5 text-center flex flex-col items-center py-4">
                        <p className="text-xs text-white/70">
                          Você está prestes a simular o checkout dos seguintes itens ({cart.length}):
                        </p>
                        
                        <div className="w-full max-h-[140px] overflow-y-auto space-y-1.5 pr-1 border border-white/5 rounded-xl p-2 bg-brand-black/25">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-[11px] text-white/80 py-1 border-b border-white/5 last:border-0">
                              <span className="truncate pr-2">{item.name}</span>
                              <span className="font-mono">R$ {item.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* Simulated Pix QR Code */}
                        <div className="p-3 bg-white rounded-xl border border-brand-orange/30 shadow-neon-orange">
                          <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="4" fill="white"/>
                            <rect x="5" y="5" width="20" height="20" fill="#050505"/>
                            <rect x="10" y="10" width="10" height="10" fill="white"/>
                            <rect x="75" y="5" width="20" height="20" fill="#050505"/>
                            <rect x="80" y="10" width="10" height="10" fill="white"/>
                            <rect x="5" y="75" width="20" height="20" fill="#050505"/>
                            <rect x="10" y="80" width="10" height="10" fill="white"/>
                            <rect x="30" y="20" width="15" height="15" fill="#050505"/>
                            <rect x="50" y="45" width="25" height="25" fill="#050505"/>
                            <rect x="70" y="30" width="10" height="10" fill="#050505"/>
                            <rect x="10" y="45" width="15" height="15" fill="#050505"/>
                            <rect x="35" y="65" width="20" height="20" fill="#050505"/>
                          </svg>
                        </div>
                        
                        <p className="text-[10px] text-white/40">
                          Pague o Pix acima para liberar o download simulado de forma instantânea.
                        </p>

                        <button
                          onClick={handleConfirmCartPayment}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-xs font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg transition-all duration-300"
                        >
                          Simular Confirmação de Pix
                        </button>
                        <button
                          onClick={() => setSimulatedCheckoutActive(false)}
                          className="w-full text-xs text-white/40 hover:text-white"
                        >
                          Cancelar e Voltar ao Carrinho
                        </button>
                      </div>
                    ) : (
                      // CHECKOUT SUCCESS STATE
                      <div className="py-8 text-center flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 animate-bounce">
                          <ShieldCheck size={26} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Transação Aprovada!</h4>
                          <p className="text-[11px] text-white/40 mt-1">Seu download simulado está liberado.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-black/45 border border-white/5 text-left w-full text-[11px] text-white/60 leading-relaxed">
                          Os links de download dos repositórios e instruções de deploy para cada sistema foram liberados em seu painel cliente.
                        </div>
                        <button
                          onClick={() => {
                            setCartOpen(false);
                            setSimulatedCheckoutActive(false);
                            setCheckoutSuccess(false);
                          }}
                          className="w-full py-3 rounded-xl bg-brand-black border border-white/10 hover:border-brand-orange/30 text-xs font-bold transition-all duration-300"
                        >
                          Fechar e continuar navegando
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer (Only if not in checkout step) */}
              {!simulatedCheckoutActive && cart.length > 0 && (
                <div className="p-6 border-t border-white/5 space-y-4 bg-brand-black/40">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-white/60">Subtotal:</span>
                    <span className="font-mono text-brand-orange text-lg">R$ {cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleCartCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-sm font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Finalizar Compra
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      <ProductVideoModal 
        isOpen={isVideoModalOpen}
        product={selectedVideoProduct}
        onClose={handleCloseVideo}
        onAddToCart={handleAddToCart}
      />

      {/* Intelligent Web Chat */}
      <FloatingChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(true)} />
      <WebChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      </div>
    </DiscountWheelProvider>
  );
}

export default App;
