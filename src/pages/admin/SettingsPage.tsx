import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Globe, Palette, Mail, Shield, Smartphone } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'aparencia' | 'notificacoes'>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulating save
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Configurações</h1>
          <p className="text-sm text-white/50">Gerencie as preferências gerais e a aparência da sua loja.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-neonOrange text-white text-sm font-bold shadow-neon-orange hover:shadow-neon-orange-lg transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('geral')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'geral' ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Globe size={18} /> Geral e SEO
            </button>
            <button 
              onClick={() => setActiveTab('aparencia')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'aparencia' ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Palette size={18} /> Aparência e Cores
            </button>
            <button 
              onClick={() => setActiveTab('notificacoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'notificacoes' ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Mail size={18} /> E-mails e Alertas
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md"
          >
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Informações da Loja</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Nome da Loja</label>
                      <input type="text" defaultValue="Nexus SaaS" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-orange/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">E-mail de Suporte</label>
                      <input type="email" defaultValue="contato@nexussaas.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-orange/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Descrição (Meta SEO)</label>
                      <textarea rows={3} defaultValue="A melhor plataforma de vendas whitelabel de sistemas." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-orange/50 focus:outline-none transition-colors resize-none" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4">Segurança</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Forçar SSL/HTTPS</p>
                        <p className="text-xs text-white/40">Redirecionar todo tráfego para a conexão segura.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-emerald-500/20 relative cursor-pointer border border-emerald-500/30">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Identidade Visual</h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Logo da Loja</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-brand-black border border-white/10 flex items-center justify-center shadow-lg">
                          <span className="text-brand-orange font-black text-xl">NX</span>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors">
                          Alterar Logo
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Cor Principal da Marca (Hex)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg shadow-[0_0_15px_rgba(255,106,0,0.4)]" style={{ backgroundColor: '#FF6A00' }} />
                        <input type="text" defaultValue="#FF6A00" className="w-32 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-brand-orange/50 focus:outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4">Layout da Loja</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border-2 border-brand-orange bg-brand-orange/5 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-2 right-2"><CheckCircle2 size={16} className="text-brand-orange" /></div>
                      <Smartphone size={24} className="text-white mb-2" />
                      <p className="text-sm font-bold text-white">Modo Escuro (Padrão)</p>
                      <p className="text-[10px] text-white/40 mt-1">Foco e elegância com neon.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                      <Globe size={24} className="text-white mb-2" />
                      <p className="text-sm font-bold text-white">Modo Claro</p>
                      <p className="text-[10px] text-white/40 mt-1">Design clean e minimalista.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Eventos e Alertas</h3>
                  <p className="text-xs text-white/40 mb-6">Escolha quais notificações você deseja receber por e-mail no endereço de suporte cadastrado.</p>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Novo Pedido Aprovado', checked: true },
                      { label: 'Nova Avaliação Pendente', checked: true },
                      { label: 'Erro em Integração (Webhook falhou)', checked: true },
                      { label: 'Relatório Diário de Vendas', checked: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <span className="text-sm font-semibold text-white/80">{item.label}</span>
                        <div className={`w-12 h-6 rounded-full relative cursor-pointer border ${item.checked ? 'bg-brand-orange/20 border-brand-orange/30' : 'bg-white/5 border-white/10'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${item.checked ? 'right-1 bg-brand-orange' : 'left-1 bg-white/30'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};
