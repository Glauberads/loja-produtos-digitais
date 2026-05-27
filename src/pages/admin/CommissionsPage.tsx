import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Search } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminCard } from '../../components/admin/AdminCard';

export const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          id, amount, status, created_at,
          order:orders(customer_name, amount),
          affiliate:affiliates(code, user:admin_users(full_name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      // Bloqueia tentativas de pagar algo que não esteja 'approved'
      const comm = commissions.find(c => c.id === id);
      if (comm?.status !== 'approved') return;

      const { error } = await supabase.from('commissions').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id).eq('status', 'approved');
      if (error) throw error;
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: 'paid' } : c));
    } catch (err) {
      alert('Erro ao pagar comissão');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader 
        title="Comissões"
        description="Gestão de pagamentos e repasses para afiliados"
        icon={DollarSign}
        action={{
          label: 'Exportar Relatório',
          icon: Download,
          onClick: () => {}
        }}
      />

      <AdminCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text"
              placeholder="Buscar por ID ou Afiliado..."
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
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Afiliado</th>
                <th className="px-6 py-4 font-semibold">Cliente (Pedido)</th>
                <th className="px-6 py-4 font-semibold">Comissão</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">Carregando...</td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50">Nenhuma comissão encontrada.</td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-xs">
                      {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{comm.affiliate?.user?.[0]?.full_name || 'Desconhecido'}</div>
                      <div className="text-xs text-brand-orange">{comm.affiliate?.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{comm.order?.customer_name || 'Desconhecido'}</div>
                      <div className="text-xs text-white/40">Venda: R$ {comm.order?.amount}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      R$ {comm.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        comm.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                        comm.status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                        comm.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {comm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {comm.status === 'approved' && (
                        <button onClick={() => markAsPaid(comm.id)} className="text-emerald-500 hover:underline text-xs">Marcar como Pago</button>
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
