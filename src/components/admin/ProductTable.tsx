import React, { useState } from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Search, ChevronUp, ChevronDown } from 'lucide-react';
import type { SupabaseProduct } from '../../hooks/useProducts';

interface ProductTableProps {
  products: SupabaseProduct[];
  onEdit: (product: SupabaseProduct) => void;
  onDelete: (product: SupabaseProduct) => void;
  onToggleActive: (product: SupabaseProduct) => void;
}

const CATEGORIES = ['Todas', 'WhatsApp', 'IA', 'SaaS', 'CRM', 'Dashboard', 'Automação', 'Agência', 'Financeiro', 'Landing Pages', 'E-commerce', 'Delivery'];

const badgeColors: Record<string, string> = {
  'MAIS VENDIDO': 'bg-brand-orange/10 border-brand-orange/30 text-brand-neonOrange',
  'HOT': 'bg-red-500/10 border-red-500/30 text-red-400',
  'IA': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  'NOVO': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

type SortKey = 'name' | 'category' | 'price' | 'sales_count';

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, onToggleActive }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<SupabaseProduct | null>(null);

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.slug.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Todas' || p.category === category;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.active : !p.active);
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av;
      }
      return 0;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(prev => !prev);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />;
    return sortAsc ? <ChevronUp size={12} className="text-brand-orange" /> : <ChevronDown size={12} className="text-brand-orange" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou slug..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-orange/40 transition-all"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3.5 py-2.5 rounded-xl bg-brand-darkGray/60 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Count */}
      <div className="text-xs text-white/35 font-mono">
        {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/3 border-b border-white/5">
              {[
                { label: 'Nome', key: 'name' as SortKey },
                { label: 'Categoria', key: 'category' as SortKey },
                { label: 'Preço', key: 'price' as SortKey },
                { label: 'Vendas', key: 'sales_count' as SortKey },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon k={col.key} />
                  </div>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">Badge</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-white group-hover:text-brand-orange transition-colors truncate max-w-[200px]">{p.name}</div>
                  <div className="text-[10px] text-white/30 font-mono mt-0.5">{p.slug}</div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">{p.category}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-bold text-white font-mono">R$ {p.price.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-white/60 font-mono">{p.sales_count.toLocaleString('pt-BR')}</span>
                </td>
                <td className="px-4 py-3.5">
                  {p.badge ? (
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColors[p.badge] || 'bg-white/10 border-white/20 text-white/60'}`}>
                      {p.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => onToggleActive(p)} title={p.active ? 'Desativar' : 'Ativar'}
                      className={`p-1.5 rounded-lg border transition-all ${p.active ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}>
                      {p.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                    </button>
                    <button onClick={() => onEdit(p)} title="Editar"
                      className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(p)} title="Excluir"
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                  Nenhum produto encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/85 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative glassmorphism border border-red-500/20 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h4 className="text-base font-bold text-white">Confirmar Exclusão</h4>
              <p className="text-xs text-white/50">Tem certeza que deseja excluir permanentemente <strong className="text-white">{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70 hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-bold transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
