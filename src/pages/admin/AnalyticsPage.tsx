import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Activity, DollarSign, ShoppingCart, Percent, TrendingUp, AlertCircle, Calendar, Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminCard } from '../../components/admin/AdminCard';

type DateRangeType = 'today' | '7d' | '30d' | 'month' | 'custom';

export const AnalyticsPage: React.FC = () => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal para lançamento manual de custo
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costForm, setCostForm] = useState({ date: '', utm_campaign: '', cost: '' });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let startDate = new Date();
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      if (dateRangeType === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRangeType === '7d') {
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRangeType === '30d') {
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRangeType === 'month') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      } else if (dateRangeType === 'custom' && customStart && customEnd) {
        startDate = new Date(customStart + 'T00:00:00');
        endDate = new Date(customEnd + 'T23:59:59');
      }

      // tenant_id será injetado pela RLS caso o usuário seja admin do tenant?
      // Neste modelo (SaaS), como é Super Admin testando, a RPC precisa do tenant.
      // Vou buscar o tenant_id primeiro:
      const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
      const tenantId = tenant?.id || '00000000-0000-0000-0000-000000000000';

      const [resMetrics, resCharts] = await Promise.all([
        supabase.rpc('get_dashboard_metrics', { p_tenant_id: tenantId, p_start_date: startDate.toISOString(), p_end_date: endDate.toISOString() }),
        supabase.rpc('get_dashboard_charts', { p_tenant_id: tenantId, p_start_date: startDate.toISOString(), p_end_date: endDate.toISOString() })
      ]);

      if (resMetrics.data) setMetrics(resMetrics.data);
      if (resCharts.data) setCharts(resCharts.data);
      
    } catch (err) {
      console.error('Erro ao buscar analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRangeType !== 'custom' || (customStart && customEnd)) {
      fetchAnalytics();
    }
  }, [dateRangeType, customStart, customEnd]);

  const handleSaveCost = async () => {
    if (!costForm.date || !costForm.utm_campaign || !costForm.cost) return;
    try {
      const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
      const { error } = await supabase.from('campaign_costs').insert({
        tenant_id: tenant?.id,
        date: costForm.date,
        utm_campaign: costForm.utm_campaign,
        cost: parseFloat(costForm.cost)
      });
      if (error) throw error;
      setIsCostModalOpen(false);
      setCostForm({ date: '', utm_campaign: '', cost: '' });
      fetchAnalytics();
    } catch (err) {
      alert('Erro ao salvar custo');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <AdminPageHeader 
        title="Dashboard Executivo"
        description="Visão geral do faturamento e performance."
        icon={Activity}
        action={{
          label: 'Lançar Custo (ROAS)',
          icon: Plus,
          onClick: () => setIsCostModalOpen(true)
        }}
      />

      {/* Filtros de Data */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 w-fit">
        <Calendar size={16} className="text-white/40 ml-2" />
        {['today', '7d', '30d', 'month', 'custom'].map((type) => (
          <button
            key={type}
            onClick={() => setDateRangeType(type as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRangeType === type ? 'bg-brand-orange text-white' : 'text-white/50 hover:bg-white/10'
            }`}
          >
            {type === 'today' ? 'Hoje' : type === '7d' ? '7 Dias' : type === '30d' ? '30 Dias' : type === 'month' ? 'Este Mês' : 'Personalizado'}
          </button>
        ))}

        {dateRangeType === 'custom' && (
          <div className="flex items-center gap-2 ml-4">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-white" />
            <span className="text-white/30">até</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-white" />
          </div>
        )}
      </div>

      {loading && !metrics ? (
        <div className="h-64 flex items-center justify-center text-brand-orange animate-pulse">Carregando métricas avançadas...</div>
      ) : (
        <>
          {/* GRID de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span className="text-xs uppercase font-bold tracking-wider">Receita Total</span>
              </div>
              <h3 className="text-2xl font-black text-white">R$ {metrics?.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </AdminCard>

            <AdminCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <ShoppingCart size={16} className="text-blue-400" />
                <span className="text-xs uppercase font-bold tracking-wider">Vendas (Aprovadas / Total)</span>
              </div>
              <h3 className="text-2xl font-black text-white">{metrics?.approved_orders} <span className="text-lg text-white/30">/ {metrics?.total_orders}</span></h3>
            </AdminCard>

            <AdminCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <Percent size={16} className="text-purple-400" />
                <span className="text-xs uppercase font-bold tracking-wider">Conversão de Vendas</span>
              </div>
              <h3 className="text-2xl font-black text-white">{metrics?.conversion_rate}%</h3>
            </AdminCard>

            <AdminCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <TrendingUp size={16} className="text-brand-orange" />
                <span className="text-xs uppercase font-bold tracking-wider">Ticket Médio</span>
              </div>
              <h3 className="text-2xl font-black text-white">R$ {metrics?.average_ticket?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </AdminCard>

            <AdminCard className="p-5 flex flex-col justify-between bg-gradient-to-br from-brand-orange/10 to-transparent border-brand-orange/20">
              <div className="flex items-center gap-3 text-brand-orange/80 mb-2">
                <DollarSign size={16} />
                <span className="text-xs uppercase font-bold tracking-wider">Receita Order Bump</span>
              </div>
              <h3 className="text-2xl font-black text-brand-orange">+ R$ {metrics?.bump_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </AdminCard>

            <AdminCard className="p-5 flex flex-col justify-between border-red-500/20">
              <div className="flex items-center gap-3 text-red-400/80 mb-2">
                <AlertCircle size={16} />
                <span className="text-xs uppercase font-bold tracking-wider">Abandono / Falhas</span>
              </div>
              <h3 className="text-2xl font-black text-red-400">{metrics?.pix_abandonment} PIXs perdidos</h3>
            </AdminCard>
          </div>

          {/* Gráficos e Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top UTMs com ROAS */}
            <AdminCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">Performance de Campanhas (UTMs & ROAS)</h3>
              </div>
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 text-xs text-white/40">
                  <tr>
                    <th className="px-4 py-2">Campanha</th>
                    <th className="px-4 py-2">Vendas</th>
                    <th className="px-4 py-2">Receita</th>
                    <th className="px-4 py-2">Custo</th>
                    <th className="px-4 py-2">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {charts?.top_utms?.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center">Nenhum dado</td></tr>
                  )}
                  {charts?.top_utms?.map((utm: any, i: number) => {
                    const roas = utm.cost > 0 ? (utm.revenue / utm.cost).toFixed(2) : '∞';
                    return (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-white">{utm.campaign}</td>
                        <td className="px-4 py-3">{utm.sales}</td>
                        <td className="px-4 py-3 text-emerald-400">R$ {utm.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-red-400">R$ {utm.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 font-bold">{roas}x</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </AdminCard>

            {/* Top Produtos */}
            <AdminCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">Produtos mais Vendidos</h3>
              </div>
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 text-xs text-white/40">
                  <tr>
                    <th className="px-4 py-2">Produto</th>
                    <th className="px-4 py-2">Qtd Vendas</th>
                    <th className="px-4 py-2">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {charts?.top_products?.length === 0 && (
                    <tr><td colSpan={3} className="p-4 text-center">Nenhum dado</td></tr>
                  )}
                  {charts?.top_products?.map((prod: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">{prod.name}</td>
                      <td className="px-4 py-3">{prod.sales}</td>
                      <td className="px-4 py-3 font-mono">R$ {prod.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminCard>

          </div>
        </>
      )}

      {/* Modal Lançamento de Custo */}
      {isCostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Lançar Custo de Campanha</h3>
            <p className="text-xs text-white/50">Insira quanto você gastou num dia específico para uma UTM para o sistema calcular o ROAS.</p>
            
            <div>
              <label className="text-xs text-white/40 mb-1 block">Data</label>
              <input type="date" value={costForm.date} onChange={e => setCostForm({...costForm, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">UTM Campaign (nome exato)</label>
              <input type="text" placeholder="ex: natal_2026" value={costForm.utm_campaign} onChange={e => setCostForm({...costForm, utm_campaign: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Valor Gasto (R$)</label>
              <input type="number" step="0.01" placeholder="150.50" value={costForm.cost} onChange={e => setCostForm({...costForm, cost: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsCostModalOpen(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white">Cancelar</button>
              <button onClick={handleSaveCost} className="flex-1 py-2 rounded-lg bg-brand-orange hover:bg-brand-neonOrange text-sm text-white font-bold">Salvar Custo</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};
