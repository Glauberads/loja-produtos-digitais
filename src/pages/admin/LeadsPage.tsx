import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Filter, Phone, User } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  source: string;
  page_url: string;
  status: string;
  created_at: string;
}

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadLeads();
    
    // Realtime subscription
    const channel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev]);
        // Toasts will be handled globally or here if needed
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeads = async () => {
    try {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setLeads(data);
    } catch (error) {
      console.error('Error loading leads', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (!error) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Novo Lead': return 'bg-brand-neonOrange/20 text-brand-neonOrange border-brand-neonOrange/50';
      case 'Em Contato': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Qualificado': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Convertido': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Perdido': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const openWhatsapp = (number: string) => {
    const num = number.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.whatsapp.includes(search);
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-brand-orange" /> Gestão de Leads
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Acompanhe e converta leads capturados pelo Web Chat.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Leads Hoje', value: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: 'text-white' },
          { label: 'Total de Leads', value: leads.length, color: 'text-brand-orange' },
          { label: 'Convertidos', value: leads.filter(l => l.status === 'Convertido').length, color: 'text-green-400' },
          { label: 'Em Contato', value: leads.filter(l => l.status === 'Em Contato').length, color: 'text-blue-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-brand-darkGray/50 border border-white/5 p-4 rounded-xl">
            <p className="text-sm text-white/60">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-darkGray/50 border border-white/5 p-4 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-white/40" size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="Novo Lead">Novo Lead</option>
            <option value="Em Contato">Em Contato</option>
            <option value="Qualificado">Qualificado</option>
            <option value="Convertido">Convertido</option>
            <option value="Perdido">Perdido</option>
          </select>
        </div>
      </div>

      {/* Table (Future Kanban) */}
      <div className="bg-brand-darkGray/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-brand-black/30">
                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Lead</th>
                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Contato</th>
                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">Carregando leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">Nenhum lead encontrado.</td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0 border border-brand-orange/30">
                          <User size={18} className="text-brand-orange" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{lead.name}</p>
                          <p className="text-xs text-white/40 truncate max-w-[200px]">{lead.page_url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-white/80 font-mono">{lead.whatsapp}</div>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full border bg-transparent font-medium focus:outline-none ${getStatusBadge(lead.status)}`}
                      >
                        <option value="Novo Lead" className="bg-brand-black text-white">Novo Lead</option>
                        <option value="Em Contato" className="bg-brand-black text-white">Em Contato</option>
                        <option value="Qualificado" className="bg-brand-black text-white">Qualificado</option>
                        <option value="Convertido" className="bg-brand-black text-white">Convertido</option>
                        <option value="Perdido" className="bg-brand-black text-white">Perdido</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openWhatsapp(lead.whatsapp)}
                        className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 transition-all inline-flex items-center gap-2"
                        title="Falar no WhatsApp"
                      >
                        <Phone size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
