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
      borderColor: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
    },
    {
      label: 'Produtos Ativos',
      value: active,
      icon: CheckCircle,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    },
    {
      label: 'Produtos Inativos',
      value: inactive,
      icon: XCircle,
      color: 'text-red-400',
      borderColor: 'border-red-500/20 hover:border-red-500/40',
      iconBg: 'bg-red-500/10',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]',
    },
    {
      label: 'Mais Vendidos',
      value: topSellers,
      icon: TrendingUp,
      color: 'text-brand-orange',
      borderColor: 'border-brand-orange/20 hover:border-brand-orange/40',
      iconBg: 'bg-brand-orange/10',
      glow: 'shadow-[0_0_20px_rgba(255,106,0,0.05)] hover:shadow-[0_0_25px_rgba(255,106,0,0.15)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl p-5 border bg-[#0B1020]/60 backdrop-blur-md ${stat.borderColor} ${stat.glow} transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Subtle gradient background for hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-${stat.color.replace('text-', '')}/5`} />
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                <Icon size={18} className={stat.color} />
              </div>
            </div>
            <div className={`text-3xl font-black ${stat.color} font-mono relative z-10`}>{stat.value}</div>
            <div className="text-xs text-white/40 mt-1 font-medium relative z-10">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};
