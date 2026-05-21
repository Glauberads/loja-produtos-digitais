import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useProducts, type SupabaseProduct, type ProductInput } from '../../hooks/useProducts';
import { AdminStats } from '../../components/admin/AdminStats';
import { ProductTable } from '../../components/admin/ProductTable';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const ProductsPage: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct, toggleActive } = useProducts(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null);

  const handleEdit = (product: SupabaseProduct) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleSave = async (data: ProductInput): Promise<boolean> => {
    if (editingProduct) {
      return updateProduct(editingProduct.id, data);
    }
    return createProduct(data);
  };

  const handleDelete = async (product: SupabaseProduct) => {
    await deleteProduct(product.id);
  };

  const handleToggle = async (product: SupabaseProduct) => {
    await toggleActive(product.id, !product.active);
  };

  return (
    <div className="space-y-6 pb-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Catálogo de Produtos</h1>
          <p className="text-sm text-white/50">Gerencie todos os produtos, preços e status do marketplace.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white text-sm font-bold shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_25px_rgba(255,106,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <AdminStats products={products} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="p-6 rounded-3xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">Listagem de Produtos</h2>
          <span className="text-xs font-mono text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-3 py-1 rounded-full">
            {products.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggle}
          />
        )}
      </motion.div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
