import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Share2, Plus, Copy, Search, Filter } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminCard } from '../../components/admin/AdminCard';

export const AffiliatesPage: React.FC = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          id, code, commission_rate, status, created_at,
          user:admin_users(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('affiliates').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader 
        title="Afiliados"
        description="Gerencie seus parceiros e links de indicação"
        icon={Share2}
        action={{
          label: 'Novo Afiliado',
          icon: Plus,
          onClick: () => {}
        }}
      />

      <AdminCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou código..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Afiliado</th>
                <th className="px-6 py-4 font-semibold">Código / Link</th>
                <th className="px-6 py-4 font-semibold">Comissão</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">Carregando...</td>
                </tr>
              ) : affiliates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">Nenhum afiliado encontrado.</td>
                </tr>
              ) : (
                affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{affiliate.user?.[0]?.full_name || 'Desconhecido'}</div>
                      <div className="text-xs text-white/40">{affiliate.user?.[0]?.email || 'Sem email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">{affiliate.code}</span>
                        <button className="text-white/40 hover:text-white" title="Copiar link">
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{affiliate.commission_rate}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        affiliate.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                        affiliate.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {affiliate.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {affiliate.status !== 'active' && (
                        <button onClick={() => updateStatus(affiliate.id, 'active')} className="text-emerald-500 hover:underline text-xs">Aprovar</button>
                      )}
                      {affiliate.status !== 'blocked' && (
                        <button onClick={() => updateStatus(affiliate.id, 'blocked')} className="text-red-500 hover:underline text-xs">Bloquear</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
};
