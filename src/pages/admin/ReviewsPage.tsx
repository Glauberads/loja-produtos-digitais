import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Check, X, ShieldAlert, StarHalf } from 'lucide-react';

const mockReviews = [
  { id: 1, customer: 'Thiago F.', product: 'Nexus Analytics Pro', rating: 5, date: '20 Mai, 2026', comment: 'Sistema incrível! O painel é super rápido e a integração foi feita em minutos. Recomendo muito.', status: 'approved' },
  { id: 2, customer: 'Letícia N.', product: 'SaaS CRM Master', rating: 4, date: '19 Mai, 2026', comment: 'Gostei bastante das funcionalidades. O suporte ajudou a configurar o webhook com o n8n.', status: 'pending' },
  { id: 3, customer: 'Bruno R.', product: 'Nexus Analytics Pro', rating: 5, date: '18 Mai, 2026', comment: 'Melhor script que já comprei. Código limpo e fácil de alterar. A área de membros é muito boa.', status: 'approved' },
  { id: 4, customer: 'Marcos P.', product: 'E-commerce Toolkit', rating: 1, date: '15 Mai, 2026', comment: 'Não consegui instalar no meu servidor compartilhado antigo.', status: 'hidden' },
  { id: 5, customer: 'Julia S.', product: 'Nexus Analytics Pro', rating: 5, date: '14 Mai, 2026', comment: 'Design maravilhoso! Meus clientes amaram a nova interface whitelabel.', status: 'pending' },
];

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState(mockReviews);

  const handleStatusChange = (id: number, newStatus: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Avaliações</h1>
          <p className="text-sm text-white/50">Modere os depoimentos dos clientes sobre os seus produtos.</p>
        </div>
        <div className="flex gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
          <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold shadow-sm">Todas</button>
          <button className="px-4 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors">Pendentes</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-transparent border border-brand-orange/20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-brand-orange mb-2">
            <Star size={16} fill="currentColor" />
            <span className="font-bold text-sm">Nota Média</span>
          </div>
          <h3 className="text-3xl font-black text-white">4.8<span className="text-sm text-white/40 font-medium ml-1">/ 5.0</span></h3>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <MessageSquare size={16} />
            <span className="font-bold text-sm">Total</span>
          </div>
          <h3 className="text-3xl font-black text-white">342</h3>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <StarHalf size={16} />
            <span className="font-bold text-sm">Pendentes</span>
          </div>
          <h3 className="text-3xl font-black text-white">12</h3>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Check size={16} />
            <span className="font-bold text-sm">Aprovadas</span>
          </div>
          <h3 className="text-3xl font-black text-white">325</h3>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={review.id}
            className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row gap-6 relative overflow-hidden group"
          >
            {review.status === 'pending' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            )}
            
            <div className="sm:w-1/4 shrink-0 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0 sm:pr-6">
              <div className="flex items-center gap-1 text-brand-orange mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-white/20"} />
                ))}
              </div>
              <h4 className="font-bold text-white mb-1">{review.customer}</h4>
              <p className="text-xs text-white/40 mb-3">{review.date}</p>
              <div className="inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60 font-semibold truncate max-w-full">
                {review.product}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-white/80 leading-relaxed italic">"{review.comment}"</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase font-bold tracking-wider">
                  {review.status === 'approved' && <span className="text-emerald-400 flex items-center gap-1.5"><Check size={12} /> Aprovado (Público)</span>}
                  {review.status === 'pending' && <span className="text-yellow-400 flex items-center gap-1.5"><StarHalf size={12} /> Aguardando Moderação</span>}
                  {review.status === 'hidden' && <span className="text-white/30 flex items-center gap-1.5"><ShieldAlert size={12} /> Ocultado</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  {review.status !== 'approved' && (
                    <button 
                      onClick={() => handleStatusChange(review.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Check size={14} /> Aprovar
                    </button>
                  )}
                  {review.status !== 'hidden' && (
                    <button 
                      onClick={() => handleStatusChange(review.id, 'hidden')}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} /> Ocultar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
