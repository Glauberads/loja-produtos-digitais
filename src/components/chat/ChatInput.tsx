import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-theme-border bg-theme-card/90 rounded-b-2xl">
      <div className="flex items-center gap-2 bg-theme-bg/50 border border-theme-border rounded-xl pr-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          className="flex-1 bg-transparent text-theme-text text-sm p-3 focus:outline-none resize-none max-h-24 min-h-[44px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="p-2 rounded-lg bg-brand-orange text-white disabled:opacity-50 disabled:bg-theme-border hover:bg-brand-neonOrange transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
