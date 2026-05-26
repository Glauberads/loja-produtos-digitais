import { useState, useEffect } from 'react';

export type FeedEventType = 'purchase' | 'checkout' | 'lead' | 'view';

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  message: string;
  timeAgo: string;
  productName?: string;
}

// Nomes e ações mockadas para gerar prova social realista e natural
const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Beatriz', 'Lucas', 'Fernanda', 'Rafael', 'Juliana', 'Marcos', 'Camila'];
const times = ['agora mesmo', 'há 2 minutos', 'há 5 minutos', 'há 10 minutos'];

export function useRealtimeFeed() {
  const [recentEvent, setRecentEvent] = useState<FeedEvent | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(42);

  // Lógica para contagem de usuários flutuante
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        // Varia entre -3 e +3, mantendo num range de 20 a 150
        const variation = Math.floor(Math.random() * 7) - 3;
        const next = prev + variation;
        if (next < 20) return 20;
        if (next > 150) return 150;
        return next;
      });
    }, 15000); // atualiza a cada 15 segundos

    return () => clearInterval(interval);
  }, []);

  // Lógica para eventos automáticos de Prova Social
  useEffect(() => {
    const generateEvent = () => {
      const isPurchase = Math.random() > 0.4; // 60% chance de ser compra
      const name = names[Math.floor(Math.random() * names.length)];
      const time = times[Math.floor(Math.random() * times.length)];
      
      const newEvent: FeedEvent = {
        id: Math.random().toString(36).substring(7),
        type: isPurchase ? 'purchase' : 'checkout',
        message: isPurchase 
          ? `${name} acabou de adquirir` 
          : `${name} iniciou o checkout de`,
        timeAgo: time,
      };

      setRecentEvent(newEvent);

      // Limpa o evento após 6 segundos para a animação de saída funcionar
      setTimeout(() => {
        setRecentEvent(null);
      }, 6000);
    };

    // Gera um evento inicial após 10 segundos
    const initialTimeout = setTimeout(generateEvent, 10000);

    // Depois, gera eventos em intervalos aleatórios entre 20 e 45 segundos
    const interval = setInterval(() => {
      generateEvent();
    }, Math.random() * 25000 + 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Função para disparar um Toast manualmente (ex: ao adicionar ao carrinho)
  const triggerToast = (message: string, type: FeedEventType = 'view') => {
    const newEvent: FeedEvent = {
      id: Math.random().toString(36).substring(7),
      type,
      message,
      timeAgo: 'agora mesmo'
    };
    setRecentEvent(newEvent);
    setTimeout(() => {
      setRecentEvent(null);
    }, 6000);
  };

  return { recentEvent, onlineUsers, triggerToast };
}
