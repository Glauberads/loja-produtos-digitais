import React from 'react';
import { CheckCircle, MessageCircle } from 'lucide-react';

interface LeadSuccessProps {
  whatsappUrl: string;
}

export const LeadSuccess: React.FC<LeadSuccessProps> = ({ whatsappUrl }) => {
  return (
    <div className="p-6 text-center space-y-4 bg-brand-black/40 rounded-xl border border-brand-orange/30 shadow-neon-orange-sm">
      <div className="flex justify-center">
        <CheckCircle size={40} className="text-green-500 animate-pulse" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">Recebemos seus dados! 👋</h3>
        <p className="text-white/60 text-sm mt-2">
          Um de nossos especialistas já foi notificado e está pronto para te ajudar.
        </p>
      </div>
      
      {whatsappUrl && (
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 mt-4 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
        >
          Falar no WhatsApp Agora
          <MessageCircle size={16} />
        </a>
      )}
    </div>
  );
};
