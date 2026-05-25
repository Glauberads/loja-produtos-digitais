import React, { useEffect, useRef } from 'react';
import { X, Bot } from 'lucide-react';
import { useWebChat } from '../../hooks/useWebChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { LeadCaptureForm } from './LeadCaptureForm';
import { LeadSuccess } from './LeadSuccess';

interface WebChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebChatWindow: React.FC<WebChatWindowProps> = ({ isOpen, onClose }) => {
  const { 
    messages, 
    config, 
    isLoading, 
    sendMessage, 
    captureLead, 
    leadCaptured,
    getWhatsappUrl
  } = useWebChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const mode = config?.chat_mode || 'hybrid';
  const isAiDisabled = mode === 'lead_capture';
  const showLeadCapture = isAiDisabled || (mode === 'hybrid' && messages.length > 4 && !leadCaptured);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] flex flex-col bg-theme-bg/95 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
      
      {/* Header */}
      <div className="px-4 py-4 bg-theme-card border-b border-theme-border flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center relative">
            <Bot size={20} className="text-brand-orange" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-theme-bg rounded-full"></div>
          </div>
          <div>
            <h3 className="text-theme-text font-bold text-sm">{config?.agent_name || 'NexusBot'}</h3>
            <p className="text-brand-orange text-[11px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
              Online agora
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-border/50 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/noise.png')] bg-repeat bg-[length:100px_100px] bg-blend-overlay">
        
        {/* Welcome Message for AI or Hybrid */}
        {!isAiDisabled && messages.length === 0 && (
          <div className="flex justify-center mb-6 mt-4">
            <div className="bg-theme-card/80 border border-theme-border text-theme-text text-sm px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg">
              {config?.welcome_message || 'Olá! Como posso te ajudar hoje?'}
            </div>
          </div>
        )}

        {/* Messages */}
        {!isAiDisabled && messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} agentName={config?.agent_name} />
        ))}
        
        {isLoading && !isAiDisabled && <TypingIndicator />}

        {/* Lead Capture Fallback or Hybrid form */}
        {showLeadCapture && !leadCaptured && (
          <div className="mt-4 mb-4 animate-fadeIn">
            <LeadCaptureForm onSubmit={(name, wpp) => captureLead(name, wpp)} />
          </div>
        )}
        
        {showLeadCapture && leadCaptured && (
          <div className="mt-4 mb-4 animate-fadeIn">
            <LeadSuccess whatsappUrl={getWhatsappUrl()} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isAiDisabled && (
        <ChatInput 
          onSend={sendMessage} 
          disabled={isLoading || (showLeadCapture && !leadCaptured && mode === 'hybrid')} 
        />
      )}
      
      {/* Footer Branding */}
      <div className="py-2 text-center bg-theme-card/90 border-t border-theme-border">
        <span className="text-[10px] text-theme-muted flex items-center justify-center gap-1">
          Powered by <Bot size={10} /> NexusSaaS AI
        </span>
      </div>

    </div>
  );
};
