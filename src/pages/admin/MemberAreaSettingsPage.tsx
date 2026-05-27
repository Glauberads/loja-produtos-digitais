import React, { useState, useEffect } from 'react';
import { Package, Smartphone, Monitor, Save, RefreshCcw, Loader2, Link2, Palette, Type, Layout } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminCard } from '../../components/admin/AdminCard';
import { useMemberSettings, MemberAreaSettings } from '../../hooks/useMemberSettings';

export const MemberAreaSettingsPage: React.FC = () => {
  const { settings: initialSettings, saveSettings, loading, defaultSettings } = useMemberSettings();
  const [form, setForm] = useState<MemberAreaSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!loading && initialSettings) {
      setForm(initialSettings);
    }
  }, [loading, initialSettings]);

  const handleChange = (field: keyof MemberAreaSettings, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(form);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Você perderá suas alterações não salvas.')) {
      setForm(defaultSettings);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-8rem)] flex flex-col">
      <AdminPageHeader 
        title="Personalizar Minha Área"
        description="Configure as cores, textos e blocos que seus clientes verão ao acessar os produtos."
        icon={Package}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Painel de Controles (Esquerda) */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* Seção: Textos e Identidade */}
          <AdminCard className="p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Type size={18} className="text-brand-orange" /> Textos Principais
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Título Principal da Página</label>
                <input value={form.title} onChange={e => handleChange('title', e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Subtítulo</label>
                <input value={form.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Aviso Personalizado (Custom Notice)</label>
                <textarea rows={2} placeholder="Ex: Manutenção agendada para sábado..." value={form.custom_notice || ''} onChange={e => handleChange('custom_notice', e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white resize-none" />
              </div>
            </div>
          </AdminCard>

          {/* Seção: Cores e Estilo */}
          <AdminCard className="p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Palette size={18} className="text-indigo-400" /> Cores e Marca
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Cor Primária (HEX)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.primary_color} onChange={e => handleChange('primary_color', e.target.value)} className="w-10 h-10 rounded bg-transparent cursor-pointer" />
                    <input value={form.primary_color} onChange={e => handleChange('primary_color', e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white font-mono uppercase" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Cor Secundária (HEX)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.secondary_color} onChange={e => handleChange('secondary_color', e.target.value)} className="w-10 h-10 rounded bg-transparent cursor-pointer" />
                    <input value={form.secondary_color} onChange={e => handleChange('secondary_color', e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white font-mono uppercase" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL do Logo (Opcional)</label>
                <input value={form.logo_url || ''} onChange={e => handleChange('logo_url', e.target.value)} placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL do Banner de Fundo (Opcional)</label>
                <input value={form.banner_url || ''} onChange={e => handleChange('banner_url', e.target.value)} placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
              </div>
            </div>
          </AdminCard>

          {/* Seção: Links e Suporte */}
          <AdminCard className="p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Link2 size={18} className="text-emerald-400" /> Links de Suporte
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">WhatsApp Num</label>
                  <input value={form.support_whatsapp || ''} onChange={e => handleChange('support_whatsapp', e.target.value)} placeholder="Ex: 5511999999999" className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Botão do Card</label>
                  <input value={form.button_text} onChange={e => handleChange('button_text', e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Seção: Visibilidade */}
          <AdminCard className="p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Layout size={18} className="text-purple-400" /> Visibilidade de Blocos
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                <span className="text-sm text-white">Mostrar WhatsApp de Suporte</span>
                <input type="checkbox" checked={form.show_support} onChange={e => handleChange('show_support', e.target.checked)} className="w-4 h-4 rounded accent-brand-orange" />
              </label>
            </div>
          </AdminCard>

          {/* Ações */}
          <div className="flex gap-4 pt-2">
            <button onClick={handleRestore} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <RefreshCcw size={16} /> Restaurar Padrão
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-brand-orange hover:bg-brand-neonOrange shadow-neon-orange text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </div>

        {/* Painel de Preview (Direita) */}
        <div className="lg:col-span-7 bg-[#060912] border border-white/10 rounded-3xl overflow-hidden flex flex-col relative h-[800px] lg:h-auto">
          
          {/* Header do Preview */}
          <div className="bg-[#0B1020] border-b border-white/10 p-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 text-white/50 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-green-400">●</span> preview-minha-area.localhost
            </div>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setPreviewMode('desktop')} 
                className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Monitor size={16} />
              </button>
              <button 
                onClick={() => setPreviewMode('mobile')} 
                className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>

          {/* Container do Preview */}
          <div className="flex-1 overflow-y-auto flex justify-center bg-black/50 p-4 scrollbar-thin scrollbar-thumb-white/10 relative">
            
            <div className={`transition-all duration-500 origin-top overflow-hidden rounded-xl border border-white/10 bg-[#060912] relative ${previewMode === 'mobile' ? 'w-[375px] h-[812px] shadow-2xl' : 'w-full h-full'}`}>
              
              {/* O "Mock" da MembersAreaPage */}
              <div className="w-full h-full relative" style={{ '--primary': form.primary_color, '--secondary': form.secondary_color } as any}>
                
                {/* Banner Customizado */}
                {form.banner_url ? (
                  <div className="absolute top-0 left-0 right-0 h-48 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${form.banner_url})` }} />
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: form.primary_color }} />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: form.secondary_color }} />
                  </>
                )}

                <div className="relative z-10 px-4 py-8 md:px-8">
                  {/* Header Mock */}
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      {form.logo_url ? (
                        <img src={form.logo_url} alt="Logo" className="h-8 object-contain mb-4" />
                      ) : null}
                      <h1 className="text-2xl font-black text-white">{form.title}</h1>
                      <p className="text-sm text-white/50 mt-0.5">{form.subtitle}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Package size={18} style={{ color: form.primary_color }} />
                    </div>
                  </div>

                  {form.custom_notice && (
                    <div className="mb-6 p-4 rounded-xl border flex items-start gap-3 bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
                      <p className="text-xs">{form.custom_notice}</p>
                    </div>
                  )}

                  {/* Card Mock */}
                  <div className="rounded-2xl border p-5 transition-all bg-[#0B1020]/80 border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5" style={{ background: `linear-gradient(135deg, ${form.primary_color}33, ${form.secondary_color}66)` }}>
                        <Package size={20} className="text-white/80" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-white">Produto de Exemplo</h3>
                          <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 uppercase tracking-wider">Ativo</span>
                        </div>
                        <p className="text-[11px] text-white/40 mb-3">Exemplo de como o card aparecerá para o cliente.</p>
                        
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all" style={{ background: form.primary_color, boxShadow: `0 4px 14px 0 ${form.primary_color}40` }}>
                            {form.button_text}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suporte Mock */}
                  <div className="mt-6 p-4 rounded-2xl bg-white/3 border border-white/5">
                    <p className="text-xs text-white/30 mb-3">Precisa de ajuda?</p>
                    <div className="flex items-center gap-3">
                      {form.show_support && (
                        <a href="#" className="flex items-center gap-1.5 text-xs text-green-400/70">
                          <Smartphone size={12} /> Suporte
                        </a>
                      )}
                      <span className="text-xs text-white/30">Ver todos os produtos</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
