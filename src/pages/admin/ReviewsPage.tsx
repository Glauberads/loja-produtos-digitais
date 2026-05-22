import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Check, X, ShieldAlert, StarHalf, Pencil, Save, Plus, Trash2 } from 'lucide-react';

interface Review {
  id: number;
  customer: string;
  product: string;
  rating: number;
  date: string;
  comment: string;
  status: string;
}

const mockReviews: Review[] = [
  { id: 1, customer: 'Thiago F.', product: 'Nexus Analytics Pro', rating: 5, date: '20 Mai, 2026', comment: 'Sistema incrível! O painel é super rápido e a integração foi feita em minutos. Recomendo muito.', status: 'approved' },
  { id: 2, customer: 'Letícia N.', product: 'SaaS CRM Master', rating: 4, date: '19 Mai, 2026', comment: 'Gostei bastante das funcionalidades. O suporte ajudou a configurar o webhook com o n8n.', status: 'pending' },
  { id: 3, customer: 'Bruno R.', product: 'Nexus Analytics Pro', rating: 5, date: '18 Mai, 2026', comment: 'Melhor script que já comprei. Código limpo e fácil de alterar. A área de membros é muito boa.', status: 'approved' },
  { id: 4, customer: 'Marcos P.', product: 'E-commerce Toolkit', rating: 1, date: '15 Mai, 2026', comment: 'Não consegui instalar no meu servidor compartilhado antigo.', status: 'hidden' },
  { id: 5, customer: 'Julia S.', product: 'Nexus Analytics Pro', rating: 5, date: '14 Mai, 2026', comment: 'Design maravilhoso! Meus clientes amaram a nova interface whitelabel.', status: 'pending' },
];

const PRODUCT_OPTIONS = [
  'Nexus Analytics Pro',
  'SaaS CRM Master',
  'E-commerce Toolkit',
  'WhatsApp CRM Pro',
  'Agente IA GPT',
  'Dashboard Financeiro',
  'Landing Page Builder',
];

// ─── Star Rating Picker ─────────────────────────────────────────────────────

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={22}
            fill={(hovered || value) >= star ? '#F97316' : 'none'}
            className={(hovered || value) >= star ? 'text-brand-orange' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Edit Modal ──────────────────────────────────────────────────────────────

interface EditModalProps {
  review: Review | null;
  isNew?: boolean;
  onSave: (review: Review) => void;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

const EditModal: React.FC<EditModalProps> = ({ review, isNew = false, onSave, onClose, onDelete }) => {
  const [form, setForm] = useState<Review>(
    review ?? {
      id: Date.now(),
      customer: '',
      product: PRODUCT_OPTIONS[0],
      rating: 5,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
      comment: '',
      status: 'approved',
    }
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (field: keyof Review, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValid = form.customer.trim() !== '' && form.comment.trim() !== '' && form.product.trim() !== '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden z-10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
            <div>
              <h2 className="text-lg font-black text-white">
                {isNew ? '➕ Nova Avaliação' : '✏️ Editar Avaliação'}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                {isNew ? 'Crie manualmente uma avaliação para exibir na loja.' : 'Edite os campos abaixo e salve as alterações.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Customer name */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={form.customer}
                onChange={e => handleChange('customer', e.target.value)}
                placeholder="Ex: João S."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-orange/50 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Product */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Produto
              </label>
              <select
                value={form.product}
                onChange={e => handleChange('product', e.target.value)}
                className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              >
                {PRODUCT_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Nota
              </label>
              <StarPicker value={form.rating} onChange={v => handleChange('rating', v)} />
              <p className="text-[10px] text-white/30 mt-1.5">{form.rating} de 5 estrelas</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Comentário
              </label>
              <textarea
                value={form.comment}
                onChange={e => handleChange('comment', e.target.value)}
                placeholder="Escreva o depoimento do cliente..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-orange/50 focus:bg-white/8 transition-all resize-none leading-relaxed"
              />
              <p className="text-[10px] text-white/20 mt-1 text-right">{form.comment.length} caracteres</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Data
              </label>
              <input
                type="text"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
                placeholder="Ex: 22 Mai, 2026"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-orange/50 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {(['approved', 'pending', 'hidden'] as const).map(s => {
                  const labels = { approved: '✅ Aprovado', pending: '⏳ Pendente', hidden: '🚫 Oculto' };
                  const colors = {
                    approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                    pending: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
                    hidden: 'border-white/20 bg-white/5 text-white/40',
                  };
                  const activeRing = {
                    approved: 'ring-2 ring-emerald-500/60',
                    pending: 'ring-2 ring-yellow-500/60',
                    hidden: 'ring-2 ring-white/30',
                  };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleChange('status', s)}
                      className={`flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${colors[s]} ${form.status === s ? activeRing[s] : 'opacity-40 hover:opacity-70'}`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 border-t border-white/5 flex items-center justify-between gap-3">
            {/* Delete button (only for existing reviews) */}
            {!isNew && onDelete && (
              <div>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all border border-red-500/20"
                  >
                    <Trash2 size={13} />
                    Excluir
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-red-400 font-bold">Confirmar?</span>
                    <button
                      onClick={() => onDelete(form.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 transition-all"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold hover:bg-white/10 transition-all"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => isValid && onSave(form)}
                disabled={!isValid}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white text-sm font-black shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={15} />
                Salvar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleStatusChange = (id: number, newStatus: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleSave = (updated: Review) => {
    setReviews(prev => {
      const exists = prev.some(r => r.id === updated.id);
      if (exists) return prev.map(r => r.id === updated.id ? updated : r);
      return [updated, ...prev];
    });
    setEditingReview(null);
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setEditingReview(null);
  };

  const filtered = filter === 'pending' ? reviews.filter(r => r.status === 'pending') : reviews;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <>
      {/* Edit Modal */}
      {(editingReview || isCreating) && (
        <EditModal
          review={editingReview}
          isNew={isCreating}
          onSave={handleSave}
          onClose={() => { setEditingReview(null); setIsCreating(false); }}
          onDelete={!isCreating ? handleDelete : undefined}
        />
      )}

      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Avaliações</h1>
            <p className="text-sm text-white/50">Modere os depoimentos dos clientes sobre os seus produtos.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white text-xs font-black shadow-[0_0_12px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all"
            >
              <Plus size={14} />
              Nova Avaliação
            </button>
            <div className="flex gap-1 p-1.5 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${filter === 'pending' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                Pendentes
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-yellow-500 text-[9px] font-black text-black flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-transparent border border-brand-orange/20 backdrop-blur-md">
            <div className="flex items-center gap-2 text-brand-orange mb-2">
              <Star size={16} fill="currentColor" />
              <span className="font-bold text-sm">Nota Média</span>
            </div>
            <h3 className="text-3xl font-black text-white">{avgRating}<span className="text-sm text-white/40 font-medium ml-1">/ 5.0</span></h3>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-white/40 mb-2">
              <MessageSquare size={16} />
              <span className="font-bold text-sm">Total</span>
            </div>
            <h3 className="text-3xl font-black text-white">{reviews.length}</h3>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <StarHalf size={16} />
              <span className="font-bold text-sm">Pendentes</span>
            </div>
            <h3 className="text-3xl font-black text-white">{pendingCount}</h3>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Check size={16} />
              <span className="font-bold text-sm">Aprovadas</span>
            </div>
            <h3 className="text-3xl font-black text-white">{approvedCount}</h3>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <MessageSquare size={40} className="mx-auto mb-3 stroke-[1.5]" />
              <p className="text-sm font-semibold">Nenhuma avaliação encontrada.</p>
            </div>
          )}

          {filtered.map((review, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              key={review.id}
              className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              {review.status === 'pending' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              )}
              {review.status === 'hidden' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-white/10" />
              )}

              {/* Left: author info */}
              <div className="sm:w-1/4 shrink-0 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0 sm:pr-6">
                <div className="flex items-center gap-1 text-brand-orange mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-white/20'} />
                  ))}
                </div>
                <h4 className="font-bold text-white mb-1">{review.customer}</h4>
                <p className="text-xs text-white/40 mb-3">{review.date}</p>
                <div className="inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60 font-semibold truncate max-w-full">
                  {review.product}
                </div>
              </div>

              {/* Right: comment + actions */}
              <div className="flex-1 flex flex-col justify-between">
                <p className={`text-sm leading-relaxed italic ${review.status === 'hidden' ? 'text-white/30 line-through' : 'text-white/80'}`}>
                  "{review.comment}"
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    {review.status === 'approved' && <span className="text-emerald-400 flex items-center gap-1.5"><Check size={12} /> Aprovado (Público)</span>}
                    {review.status === 'pending' && <span className="text-yellow-400 flex items-center gap-1.5"><StarHalf size={12} /> Aguardando Moderação</span>}
                    {review.status === 'hidden' && <span className="text-white/30 flex items-center gap-1.5"><ShieldAlert size={12} /> Ocultado</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingReview(review)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-brand-orange/15 hover:text-brand-orange text-xs font-bold transition-all flex items-center gap-1.5 border border-white/5 hover:border-brand-orange/30"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>

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
    </>
  );
};
