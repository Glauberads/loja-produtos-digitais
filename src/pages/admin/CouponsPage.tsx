import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Ticket, Plus, Search, CheckCircle2, XCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  active: boolean;
}

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar cupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon?: Coupon) => {
    setError(null);
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setDiscountPercent(coupon.discount_percent);
      setExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0,16) : '');
      setUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : '');
      setIsActive(coupon.active);
    } else {
      setEditingCoupon(null);
      setCode('');
      setDiscountPercent(10);
      setExpiresAt('');
      setUsageLimit('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code || discountPercent <= 0 || discountPercent > 100) {
      setError('Código e percentual válido são obrigatórios.');
      return;
    }

    try {
      const payload = {
        code: code.toUpperCase(),
        discount_percent: discountPercent,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        active: isActive
      };

      if (editingCoupon) {
        const { error: updateError } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', editingCoupon.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('coupons')
          .insert(payload);
        if (insertError) throw insertError;
        trackEvent('coupon_created', { code: payload.code, discount: payload.discount_percent });
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error('Erro ao salvar cupom:', err);
      setError(err.message || 'Erro ao salvar cupom. Verifique se o código já existe.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cupom:', err);
      alert('Erro ao excluir cupom.');
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? c.active : !c.active;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Ticket className="text-brand-orange" />
            Gerenciar Cupons
          </h1>
          <p className="text-sm text-white/50 mt-1">Crie cupons promocionais para seus clientes.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Novo Cupom
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Buscar por código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="w-full sm:w-48 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
        >
          <option value="all">Todos os status</option>
          <option value="active">Apenas Ativos</option>
          <option value="inactive">Apenas Inativos</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando cupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhum cupom encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-black/40 text-white/50 font-medium border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Desconto</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Uso</th>
                  <th className="px-6 py-4">Expiração</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">
                      {coupon.discount_percent}% OFF
                    </td>
                    <td className="px-6 py-4">
                      {coupon.active ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-max">
                          <CheckCircle2 size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold w-max">
                          <XCircle size={12} /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : 'usos'}
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vitalício'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0B1020] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h3>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Código do Cupom</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: BLACKFRIDAY20"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-orange font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Desconto (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Expiração (Opcional)</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={e => setExpiresAt(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-orange text-sm [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Limite de Uso (Opcional)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ilimitado"
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                    <span className="text-sm font-medium text-white">Cupom Ativo</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-orange text-white font-bold hover:bg-brand-neonOrange transition-colors"
                  >
                    Salvar Cupom
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
