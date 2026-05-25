import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Bot, Key, Settings, MessageSquare, Phone } from 'lucide-react';

export const AiSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: '',
    provider: 'gemini',
    api_key: '',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    system_prompt: '',
    agent_name: 'NexusBot',
    welcome_message: '',
    chat_mode: 'hybrid',
    whatsapp_number: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setFormData({
          id: data.id,
          provider: data.provider,
          api_key: data.api_key || '',
          model: data.model,
          temperature: data.temperature,
          system_prompt: data.system_prompt,
          agent_name: data.agent_name,
          welcome_message: data.welcome_message,
          chat_mode: data.chat_mode || 'hybrid',
          whatsapp_number: data.whatsapp_number || ''
        });
      }
    } catch (err) {
      console.error('Error loading AI settings', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('ai_settings')
          .update({
            provider: formData.provider,
            api_key: formData.api_key,
            model: formData.model,
            temperature: formData.temperature,
            system_prompt: formData.system_prompt,
            agent_name: formData.agent_name,
            welcome_message: formData.welcome_message,
            chat_mode: formData.chat_mode,
            whatsapp_number: formData.whatsapp_number
          })
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_settings')
          .insert([formData]);
          
        if (error) throw error;
      }
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Error saving settings', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="text-brand-orange" /> Configurações de IA
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Gerencie o assistente virtual, fallback para leads e integrações.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-brand-orange hover:bg-brand-neonOrange text-white rounded-lg flex items-center gap-2 font-medium shadow-neon-orange transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Modo de Chat */}
        <div className="bg-brand-darkGray/50 border border-white/5 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Settings className="text-brand-orange" size={20} /> Modo de Operação
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Comportamento do Chat</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'hybrid', label: 'Híbrido (IA + Leads)' },
                { id: 'ai', label: 'Somente IA' },
                { id: 'lead_capture', label: 'Somente Leads' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setFormData({ ...formData, chat_mode: mode.id })}
                  className={`px-3 py-4 rounded-xl border text-sm font-medium transition-all ${
                    formData.chat_mode === mode.id
                      ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                      : 'bg-brand-black border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-2">
              No modo híbrido, a IA atende inicialmente e tenta capturar o lead no meio da conversa.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">WhatsApp para Leads (Fallback)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-white/40" size={16} />
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
                placeholder="Ex: 5511999999999"
              />
            </div>
          </div>
        </div>

        {/* Provedor IA */}
        <div className="bg-brand-darkGray/50 border border-white/5 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Key className="text-brand-orange" size={20} /> Integração IA
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Provedor</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
                disabled={formData.chat_mode === 'lead_capture'}
              >
                <option value="gemini">Google Gemini</option>
                <option value="openrouter">OpenRouter</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
                placeholder="ex: gemini-1.5-flash"
                disabled={formData.chat_mode === 'lead_capture'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">API Key</label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
              placeholder="Sua chave de API..."
              disabled={formData.chat_mode === 'lead_capture'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Temperatura (0 a 1)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
              disabled={formData.chat_mode === 'lead_capture'}
            />
          </div>
        </div>

        {/* Comportamento e Mensagens */}
        <div className="bg-brand-darkGray/50 border border-white/5 rounded-xl p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <MessageSquare className="text-brand-orange" size={20} /> Personalização do Assistente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Nome do Agente</label>
              <input
                type="text"
                value={formData.agent_name}
                onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Mensagem de Boas-vindas</label>
              <input
                type="text"
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Prompt do Sistema (Comercial)</label>
            <textarea
              rows={5}
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              className="w-full px-3 py-2 bg-brand-black border border-white/10 rounded-lg text-white font-mono text-sm"
              disabled={formData.chat_mode === 'lead_capture'}
            />
            <p className="text-xs text-white/40 mt-1">
              Dica: Instrua a IA a ser persuasiva, sugerir produtos específicos e tentar capturar os dados do cliente se ele demonstrar interesse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
