import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Share2, Plus, Copy, Search, Filter, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminCard } from '../../components/admin/AdminCard';
import { motion, AnimatePresence } from 'framer-motion';

export const AffiliatesPage: React.FC = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    code: '',
    commission_rate: 50
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      // Tivemos que remover user:admin_users(email, full_name) pois admin_users nao tem full_name e a ligação nao é garantida
      const { data, error } = await supabase
        .from('affiliates')
        .select(`id, name, email, whatsapp, code, commission_rate, status, created_at`)
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

  const generateCode = (name: string) => {
    if (!name) return crypto.randomUUID().split('-')[0].toUpperCase();
    return name.split(' ')[0].toUpperCase() + Math.floor(Math.random() * 999);
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.name || !form.email) {
        throw new Error('Nome e e-mail são obrigatórios.');
      }

      const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
      if (!tenant) throw new Error('Tenant ID não encontrado.');

      // Normaliza o código: minúsculo, sem espaços, sem caracteres especiais
      let finalCode = form.code ? form.code.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : generateCode(form.name).toLowerCase();

      const payload = {
        tenant_id: tenant.id,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp || null,
        code: finalCode,
        commission_rate: form.commission_rate,
        status: 'active', // Criação manual via admin já nasce ativo
      };

      console.log('Payload Afiliado:', payload); // Log para debug

      const { data, error: insertError } = await supabase
        .from('affiliates')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        console.error('Erro detalhado:', insertError);
        if (insertError.code === '23505') {
          throw new Error('Este código de afiliado já está em uso.');
        }
        throw new Error('Erro ao salvar no banco de dados. ' + insertError.message);
      }

      setAffiliates([data, ...affiliates]);
      setIsModalOpen(false);
      setForm({ name: '', email: '', whatsapp: '', code: '', commission_rate: 50 });

    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setSaving(false);
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
          onClick: () => setIsModalOpen(true)
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
                      <div className="font-semibold text-white">{affiliate.name || 'Desconhecido'}</div>
                      <div className="text-xs text-white/40">{affiliate.email || 'Sem email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">{affiliate.code}</span>
                        <button className="text-white/40 hover:text-white" title="Copiar link" onClick={() => navigator.clipboard.writeText(`?ref=${affiliate.code}`)}>
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

      {/* Modal de Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl p-6">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">Novo Afiliado</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateAffiliate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Nome Completo *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-brand-darkGray border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-orange" placeholder="João da Silva" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">E-mail *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-brand-darkGray border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-orange" placeholder="joao@email.com" />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">WhatsApp (Opcional)</label>
                  <input type="text" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full bg-brand-darkGray border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-orange" placeholder="11999999999" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Código de Indicação</label>
                    <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full bg-brand-darkGray border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-brand-orange" placeholder="Deixe vazio p/ auto" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Comissão (%) *</label>
                    <input type="number" min="0" max="100" required value={form.commission_rate} onChange={e => setForm({...form, commission_rate: parseFloat(e.target.value) || 0})} className="w-full bg-brand-darkGray border border-white/10 rounded-xl px-4 py-3 text-brand-orange text-sm font-bold focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/10 flex items-center gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-sm font-bold transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-orange hover:bg-brand-neonOrange text-white rounded-xl text-sm font-bold transition-all shadow-neon-orange disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {saving ? 'Criando...' : 'Criar Parceiro'}
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
