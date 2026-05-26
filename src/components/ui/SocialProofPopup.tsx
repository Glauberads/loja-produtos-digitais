import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';
import type { FeedEvent } from '../../hooks/useRealtimeFeed';

interface SocialProofPopupProps {
  event: FeedEvent | null;
}

export const SocialProofPopup: React.FC<SocialProofPopupProps> = ({ event }) => {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 z-[99] max-w-sm w-[calc(100vw-3rem)]"
        >
          <div className="relative overflow-hidden rounded-2xl bg-theme-bg/95 backdrop-blur-xl border border-theme-border shadow-2xl p-4 flex items-center gap-4">
            
            {/* Ícone */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              event.type === 'purchase' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
                : 'bg-brand-orange/10 border border-brand-orange/20 text-brand-orange'
            }`}>
              {event.type === 'purchase' ? <CheckCircle2 size={18} /> : <Zap size={18} />}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-theme-text font-medium leading-tight">
                {event.message} <span className="font-bold text-brand-orange">um Sistema Premium</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-theme-muted flex items-center gap-1">
                  {event.timeAgo}
                </span>
                {event.type === 'purchase' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                    Compra Verificada
                  </span>
                )}
              </div>
            </div>

            {/* Efeito Glow sutil no fundo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
