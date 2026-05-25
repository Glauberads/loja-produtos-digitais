import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-brand-orange text-white shadow-neon-orange transition-all duration-300 hover:scale-110 active:scale-95 ${
        isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 animate-pulse-slow'
      }`}
      aria-label="Abrir chat"
    >
      <MessageCircle size={28} />
    </button>
  );
};
