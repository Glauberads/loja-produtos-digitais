import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter, Eye, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

const mockOrders = [
  { id: 'ORD-2026-901', product: 'Nexus Analytics Pro', customer: 'João Silva', email: 'joao.silva@email.com', date: '21 Mai, 2026', amount: 297.00, status: 'approved', method: 'PIX' },
  { id: 'ORD-2026-902', product: 'SaaS CRM Master', customer: 'Maria Oliveira', email: 'maria.ol@email.com', date: '21 Mai, 2026', amount: 497.00, status: 'pending', method: 'Boleto' },
  { id: 'ORD-2026-903', product: 'Nexus Analytics Pro', customer: 'Carlos Mendes', email: 'carlos.m@email.com', date: '20 Mai, 2026', amount: 297.00, status: 'approved', method: 'Cartão' },
  { id: 'ORD-2026-904', product: 'E-commerce Toolkit', customer: 'Ana Costa', email: 'ana.costa@email.com', date: '19 Mai, 2026', amount: 197.00, status: 'failed', method: 'PIX' },
  { id: 'ORD-2026-905', product: 'SaaS CRM Master', customer: 'Pedro Santos', email: 'pedro.s@email.com', date: '18 Mai, 2026', amount: 497.00, status: 'approved', method: 'PIX' },
];

export const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = mockOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Pedidos</h1>
          <p className="text-sm text-white/50">Gerencie e acompanhe as vendas da sua loja.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-semibold text-white/70 transition-all">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={16} className="text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, Cliente ou Produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1020]/50 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-orange/50 transition-colors"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B1020]/50 border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0B1020]/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">ID do Pedido</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Data & Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={order.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-white/80">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{order.customer}</span>
                      <span className="text-xs text-white/40">{order.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} className="text-brand-orange" />
                      </div>
                      <span className="text-sm text-white/80">{order.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-emerald-400 font-bold">R$ {order.amount.toFixed(2)}</span>
                      <span className="text-[11px] text-white/40">{order.date} • {order.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Pago
                      </span>
                    )}
                    {order.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                        <Clock size={12} /> Aguardando
                      </span>
                    )}
                    {order.status === 'failed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                        <XCircle size={12} /> Recusado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-xs font-semibold">
                      <Eye size={14} /> Detalhes
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 text-sm">
                    Nenhum pedido encontrado para a busca "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
