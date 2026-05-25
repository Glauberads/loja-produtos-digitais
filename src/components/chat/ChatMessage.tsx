import React from 'react';
import { Bot, User } from 'lucide-react';
import type { Message } from '../../hooks/useWebChat';

interface ChatMessageProps {
  message: Message;
  agentName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, agentName = 'Assistente' }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-white/40 bg-white/5 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slideIn`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-brand-darkBlue border border-brand-lightBlue/30' : 'bg-brand-orange shadow-neon-orange-sm'
        }`}>
          {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {!isUser && <span className="text-[10px] text-white/50 ml-1 mb-1">{agentName}</span>}
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser 
              ? 'bg-brand-darkBlue text-white rounded-br-sm' 
              : 'bg-brand-darkGray/80 border border-white/5 text-white/90 rounded-bl-sm shadow-lg'
          }`}>
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};
