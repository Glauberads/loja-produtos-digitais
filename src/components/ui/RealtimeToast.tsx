import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingCart } from 'lucide-react';
import type { FeedEvent } from '../../hooks/useRealtimeFeed';

interface RealtimeToastProps {
  toast: FeedEvent | null;
}

export const RealtimeToast: React.FC<RealtimeToastProps> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full px-4 pointer-events-none"
        >
          <div className="relative overflow-hidden rounded-2xl bg-theme-bg/90 backdrop-blur-xl border border-brand-orange/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] p-3 flex items-center gap-3">
            
            <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
              {toast.type === 'view' ? <Bell size={16} /> : <ShoppingCart size={16} />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-theme-text font-bold">
                {toast.message}
              </p>
            </div>

            {/* Abóbora Glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
