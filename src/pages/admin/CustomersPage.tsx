import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Download, Mail, ExternalLink, TrendingUp, Star } from 'lucide-react';

const mockCustomers = [
  { id: 'CUS-001', name: 'João Silva', email: 'joao.silva@email.com', totalSpent: 891.00, orders: 3, joined: '10 Jan, 2026', status: 'active', ltvRating: 'A' },
  { id: 'CUS-002', name: 'Maria Oliveira', email: 'maria.ol@email.com', totalSpent: 497.00, orders: 1, joined: '05 Mar, 2026', status: 'active', ltvRating: 'B' },
  { id: 'CUS-003', name: 'Carlos Mendes', email: 'carlos.m@email.com', totalSpent: 1250.00, orders: 5, joined: '12 Nov, 2025', status: 'active', ltvRating: 'S' },
  { id: 'CUS-004', name: 'Ana Costa', email: 'ana.costa@email.com', totalSpent: 0.00, orders: 0, joined: '19 Mai, 2026', status: 'inactive', ltvRating: 'C' },
  { id: 'CUS-005', name: 'Pedro Santos', email: 'pedro.s@email.com', totalSpent: 497.00, orders: 1, joined: '18 Mai, 2026', status: 'active', ltvRating: 'B' },
];

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Clientes</h1>
          <p className="text-sm text-white/50">Base de dados, histórico de compras e LTV.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-semibold text-white/70 transition-all">
            <Download size={14} /> Exportar Lista
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Total Clientes</p>
            <h3 className="text-2xl font-black text-white">1,248</h3>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Clientes Ativos</p>
            <h3 className="text-2xl font-black text-white">892</h3>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">LTV Médio</p>
            <h3 className="text-2xl font-black text-white">R$ 640</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-white/40" />
        </div>
        <input
          type="text"
          placeholder="Buscar cliente por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1020]/50 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-orange/50 transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#0B1020]/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Membro Desde</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-center">Pedidos</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Total Gasto</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-center">Classificação</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={customer.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{customer.name}</span>
                        <span className="text-xs text-white/40">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] text-white/50">{customer.joined}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80">
                      {customer.orders}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-emerald-400 font-bold">
                      R$ {customer.totalSpent.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs
                      ${customer.ltvRating === 'S' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : ''}
                      ${customer.ltvRating === 'A' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                      ${customer.ltvRating === 'B' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                      ${customer.ltvRating === 'C' ? 'bg-white/5 text-white/40 border border-white/10' : ''}
                    `}>
                      {customer.ltvRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors inline-flex">
                      <Mail size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-brand-orange hover:bg-brand-orange/10 transition-colors inline-flex">
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 text-sm">
                    Nenhum cliente encontrado para a busca "{searchTerm}"
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
