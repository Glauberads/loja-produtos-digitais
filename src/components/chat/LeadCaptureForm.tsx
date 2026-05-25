import React, { useState } from 'react';
import { Send, User, Phone } from 'lucide-react';

interface LeadCaptureFormProps {
  onSubmit: (name: string, whatsapp: string) => Promise<boolean>;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    const success = await onSubmit(name, whatsapp);
    if (!success) {
      setError('Erro ao enviar. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-theme-bg/60 rounded-xl border border-theme-border">
      <h3 className="text-sm font-bold text-theme-text mb-2 text-center">Fale com um Especialista</h3>
      
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
          <User size={16} />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-theme-card/80 border border-theme-border rounded-lg text-theme-text text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
          placeholder="Seu Nome"
          disabled={isLoading}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
          <Phone size={16} />
        </div>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-theme-card/80 border border-theme-border rounded-lg text-theme-text text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
          placeholder="Seu WhatsApp"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white text-sm font-bold shadow-neon-orange hover:shadow-neon-orange-lg transition-all flex justify-center items-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            Iniciar Atendimento
            <Send size={14} />
          </>
        )}
      </button>
    </form>
  );
};
