import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full justify-start mb-4 animate-fadeIn">
      <div className="flex flex-row items-end gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-brand-orange shadow-neon-orange-sm">
          <Bot size={14} className="text-white" />
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-theme-card border border-theme-border flex items-center gap-1.5 h-[40px]">
          <div className="w-1.5 h-1.5 rounded-full bg-theme-muted animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-theme-muted animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-theme-muted animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
