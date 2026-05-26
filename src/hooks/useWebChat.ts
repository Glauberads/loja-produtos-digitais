import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAnalytics } from './useAnalytics';

export type ChatMode = 'ai' | 'lead_capture' | 'hybrid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatConfig {
  chat_mode: ChatMode;
  welcome_message: string;
  whatsapp_number: string | null;
  agent_name: string;
}

export function useWebChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const { trackLead } = useAnalytics();

  // Initialize visitor ID and load config
  useEffect(() => {
    // Visitor ID
    let vid = localStorage.getItem('nexus_visitor_id');
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem('nexus_visitor_id', vid);
    }
    setVisitorId(vid);

    // Context / UTM
    const urlParams = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith('utm_')) utms[key] = value;
    }
    if (Object.keys(utms).length > 0) {
      localStorage.setItem('nexus_utm_data', JSON.stringify(utms));
    }
    if (document.referrer && !localStorage.getItem('nexus_referrer')) {
      localStorage.setItem('nexus_referrer', document.referrer);
    }

    loadConfig();
    loadHistory(vid);
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('ai_settings')
        .select('chat_mode, welcome_message, whatsapp_number, agent_name')
        .limit(1)
        .single();
      
      if (data) {
        setConfig(data as ChatConfig);
      }
    } catch (err) {
      console.error('Error loading chat config:', err);
    }
  };

  const loadHistory = async (vid: string) => {
    // Try local storage first or fetch from DB if needed
    const saved = localStorage.getItem(`chat_history_${vid}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
    
    // Also check if lead was already captured
    if (localStorage.getItem(`lead_captured_${vid}`)) {
      setLeadCaptured(true);
    }
  };

  const saveHistory = (msgs: Message[]) => {
    setMessages(msgs);
    localStorage.setItem(`chat_history_${visitorId}`, JSON.stringify(msgs));
  };

  const startConversation = async () => {
    if (conversationId) return conversationId;
    
    try {
      const { data } = await supabase
        .from('chat_conversations')
        .insert([{ visitor_id: visitorId, source: window.location.pathname }])
        .select()
        .single();
        
      if (data) {
        setConversationId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error('Error creating conversation', err);
    }
    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    const updatedMsgs = [...messages, userMsg];
    saveHistory(updatedMsgs);
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      convId = await startConversation();
    }

    if (convId) {
       // Save user msg to DB silently
       supabase.from('chat_messages').insert([{
         conversation_id: convId,
         role: 'user',
         content: text
       }]).then();
    }

    try {
      console.log("ENVIANDO PARA IA", text);
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: text,
          conversationHistory: updatedMsgs.slice(0, -1) // exclude current msg
        }
      });

      if (error) throw error;

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString()
      };

      saveHistory([...updatedMsgs, aiMsg]);
      
      if (convId) {
        // Save ai msg to DB silently
        supabase.from('chat_messages').insert([{
          conversation_id: convId,
          role: 'assistant',
          content: data.reply
        }]).then();
      }

    } catch (err: any) {
      console.error('ERRO IA:', err);
      // Fallback
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Nosso assistente está temporariamente indisponível 😊\nVocê pode falar diretamente no WhatsApp.\n\n*(Erro técnico: ${err.message})*`,
        created_at: new Date().toISOString()
      };
      saveHistory([...updatedMsgs, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const captureLead = async (name: string, whatsapp: string, currentProduct?: string) => {
    try {
      const utmData = JSON.parse(localStorage.getItem('nexus_utm_data') || '{}');
      const referrer = localStorage.getItem('nexus_referrer') || '';
      
      const { error } = await supabase.from('leads').insert([{
        name,
        whatsapp,
        page_url: window.location.href,
        source: referrer,
        current_product: currentProduct,
        utm_data: utmData,
        device_info: {
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      }]);

      if (error) throw error;
      
      setLeadCaptured(true);
      localStorage.setItem(`lead_captured_${visitorId}`, 'true');
      
      // Aciona o evento de Lead Avançado
      trackLead('WebChat', whatsapp);
      
      return true;
    } catch (err) {
      console.error('Error capturing lead:', err);
      return false;
    }
  };

  const getWhatsappUrl = () => {
    if (!config?.whatsapp_number) return '';
    const num = config.whatsapp_number.replace(/\D/g, '');
    const text = encodeURIComponent('Olá, acabei de solicitar atendimento no NexusSaaS.');
    return `https://wa.me/${num}?text=${text}`;
  };

  return {
    isOpen,
    setIsOpen,
    messages,
    config,
    isLoading,
    sendMessage,
    captureLead,
    leadCaptured,
    getWhatsappUrl
  };
}
