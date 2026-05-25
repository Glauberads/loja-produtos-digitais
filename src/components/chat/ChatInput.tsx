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
    <div className="p-3 border-t border-white/10 bg-brand-darkGray/90 rounded-b-2xl">
      <div className="flex items-center gap-2 bg-brand-black/50 border border-white/5 rounded-xl pr-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          className="flex-1 bg-transparent text-white text-sm p-3 focus:outline-none resize-none max-h-24 min-h-[44px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="p-2 rounded-lg bg-brand-orange text-white disabled:opacity-50 disabled:bg-white/10 hover:bg-brand-neonOrange transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
