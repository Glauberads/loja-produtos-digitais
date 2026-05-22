// DashboardPage.tsx - Refactored for NexusSaaS Premium Dashboard
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingCart, Users, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorldMap } from '../../components/admin/WorldMap'; // placeholder component using react-simple-maps

// Mock Data – realistic numbers as requested
const revenueData = [
  { name: 'Seg', total: 12000 },
  { name: 'Ter', total: 15000 },
  { name: 'Qua', total: 18000 },
  { name: 'Qui', total: 21000 },
  { name: 'Sex', total: 25000 },
  { name: 'Sáb', total: 30000 },
  { name: 'Dom', total: 28000 },
];

const trafficData = [
  { time: '00:00', visitors: 50 },
  { time: '04:00', visitors: 30 },
  { time: '08:00', visitors: 120 },
  { time: '12:00', visitors: 200 },
  { time: '16:00', visitors: 260 },
  { time: '20:00', visitors: 180 },
  { time: '23:59', visitors: 90 },
];

// Mock real‑time visitor count – starts at 12 as per spec
const KpiCard = ({ title, value, change, isPositive, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md group hover:border-brand-orange/30 transition-all"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={48} className="text-white" />
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-white/5 text-white/70 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-white/60">{title}</span>
    </div>
    <div className="flex items-baseline gap-2 mb-1">
      <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      <span>{change} vs último mês</span>
    </div>
  </motion.div>
);

export const DashboardPage: React.FC = () => {
  // Mock real‑time visitor count – starts at 12 as per spec
  const [onlineVisitors, setOnlineVisitors] = useState(12);
  const [recentSales] = useState([
    { id: 1, product: 'ZapMax CRM', customer: 'João Silva', time: 'Há 2 min', amount: 297 },
    { id: 2, product: 'TitanOps SaaS', customer: 'Tech Solutions', time: 'Há 15 min', amount: 499 },
    { id: 3, product: 'Builderfy AI', customer: 'Agência Digital', time: 'Há 45 min', amount: 349 },
    { id: 4, product: 'Delivery PRO', customer: 'Burger King', time: 'Há 1 hora', amount: 197 },
  ]);

  // Update visitor count every 5 seconds (mock realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 .. +2
        return Math.max(0, Math.min(30, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Visão Geral</h1>
          <p className="text-sm text-white/50">Métricas financeiras e acessos em tempo real da plataforma.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {onlineVisitors} Visitantes Online
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Receita Mensal (MRR)" value="R$ 184K" change="+12.5%" isPositive={true} icon={DollarSign} delay={0.1} />
        <KpiCard title="Novos Pedidos" value="184" change="+8.2%" isPositive={true} icon={ShoppingCart} delay={0.2} />
        <KpiCard title="Produtos Ativos" value="42" change="+15.3%" isPositive={true} icon={Users} delay={0.3} />
        <KpiCard title="Taxa de Conversão" value="4.8%" change="-1.2%" isPositive={false} icon={Activity} delay={0.4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white">Faturamento (Últimos 7 dias)</h3>
            <select className="bg-white/5 border border-white/10 text-xs text-white/70 rounded-lg px-2 py-1 outline-none">
              <option>Esta semana</option>
              <option>Mês passado</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#FF6A00' }} />
                <Area type="monotone" dataKey="total" stroke="#FF6A00" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Traffic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md"
        >
          <h3 className="text-base font-bold text-white mb-6">Tráfego Diário</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff20', borderRadius: '12px' }} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="visitors" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom section – Activity feed & global map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="lg:col-span-1 p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white">Feed em Tempo Real</h3>
            <Activity size={16} className="text-brand-orange animate-pulse" />
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <DollarSign size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{sale.product}</div>
                  <div className="text-[10px] text-white/50 truncate">Comprado por {sale.customer}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-400">+R$ {sale.amount}</div>
                  <div className="text-[10px] text-white/30">{sale.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Visitors Map (react‑simple‑maps placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md relative overflow-hidden flex flex-col"
        >
          <h3 className="text-base font-bold text-white mb-2">Sessões Globais (Últimos 30 min)</h3>
          <p className="text-xs text-white/40 mb-6">Monitoramento de tráfego distribuído por região.</p>
          <div className="flex-1 min-h-[250px] relative flex items-center justify-center rounded-xl border border-white/5 bg-[#050505]/50 overflow-hidden">
            <WorldMap />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
