import React from 'react';
import { Package, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { SupabaseProduct } from '../../hooks/useProducts';

interface AdminStatsProps {
  products: SupabaseProduct[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ products }) => {
  const total = products.length;
  const active = products.filter(p => p.active).length;
  const inactive = products.filter(p => !p.active).length;
  const topSellers = products.filter(p => p.badge === 'MAIS VENDIDO').length;

  const stats = [
    {
      label: 'Total de Produtos',
      value: total,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    },
    {
      label: 'Produtos Ativos',
      value: active,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    },
    {
      label: 'Produtos Inativos',
      value: inactive,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    },
    {
      label: 'Mais Vendidos',
      value: topSellers,
      icon: TrendingUp,
      color: 'text-brand-orange',
      bg: 'bg-brand-orange/10 border-brand-orange/20',
      glow: 'shadow-neon-orange',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`glassmorphism rounded-2xl p-5 border ${stat.bg} ${stat.glow} transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <Icon size={18} className={stat.color} />
              </div>
            </div>
            <div className={`text-3xl font-black ${stat.color} font-mono`}>{stat.value}</div>
            <div className="text-xs text-white/40 mt-1 font-medium">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};
