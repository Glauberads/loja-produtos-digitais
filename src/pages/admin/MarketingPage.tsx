import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Ticket, Search, TrendingUp } from 'lucide-react';

export const MarketingPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Marketing & SEO</h1>
          <p className="text-sm text-white/50">Gerencie campanhas, cupons de desconto e otimização de busca.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-bold hover:bg-white/15 transition-all duration-300">
          <Megaphone size={16} />
          Nova Campanha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Placeholder Card 1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Ticket size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Cupons de Desconto</h3>
          <p className="text-xs text-white/50 mb-4">Crie cupons promocionais para seus clientes.</p>
          <div className="text-sm font-mono text-white/30 py-8 text-center border border-dashed border-white/10 rounded-xl">
            Em breve (Módulo Adicional)
          </div>
        </motion.div>

        {/* Placeholder Card 2 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">SEO Global</h3>
          <p className="text-xs text-white/50 mb-4">Ajuste meta tags, title e descriptions da loja.</p>
          <div className="text-sm font-mono text-white/30 py-8 text-center border border-dashed border-white/10 rounded-xl">
            Em breve (Módulo Adicional)
          </div>
        </motion.div>

        {/* Placeholder Card 3 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Banners Destaque</h3>
          <p className="text-xs text-white/50 mb-4">Gerencie os banners rotativos da homepage.</p>
          <div className="text-sm font-mono text-white/30 py-8 text-center border border-dashed border-white/10 rounded-xl">
            Em breve (Módulo Adicional)
          </div>
        </motion.div>

      </div>
    </div>
  );
};
