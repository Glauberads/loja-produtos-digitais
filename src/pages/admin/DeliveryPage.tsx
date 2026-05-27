import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, RefreshCw, Eye, EyeOff, Link2,
  Download, AlertTriangle, CheckCircle2, XCircle,
  Calendar, CreditCard, Mail, User, Loader2, Check,
  RotateCcw, Shield
} from 'lucide-react';
import { getAllAccesses, revokeAccess, reactivateAccess } from '../../services/delivery/deliveryService';
import type { ProductAccessRow } from '../../types/payment';

// ── Helpers ────────────────────────────────────────────────
const statusConfig = {
  approved: { label: 'Aprovado', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  pending: { label: 'Pendente', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  refunded: { label: 'Reembolsado', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  chargeback: { label: 'Contestado', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  failed: { label: 'Falhou', color: 'text-red-400/60', bg: 'bg-red-500/5', border: 'border-red-500/10' },
  expired: { label: 'Expirado', color: 'text-white/30', bg: 'bg-white/5', border: 'border-white/10' },
};

// ── Card de Acesso ─────────────────────────────────────────
const AccessCard: React.FC<{
  access: ProductAccessRow;
  idx: number;
  onRevoke: (id: string) => void;
  onReactivate: (id: string) => void;
  copiedId: string | null;
  onCopyLink: (id: string, orderId: string, token?: string) => void;
  processing: string | null;
}> = ({ access, idx, onRevoke, onReactivate, copiedId, onCopyLink, processing }) => {
  const product = access.products as any;
  const order = access.orders as any;
  const isProcessing = processing === access.id;
  const orderStatus = order?.status as string || 'approved';
  const sc = statusConfig[orderStatus as keyof typeof statusConfig] || statusConfig.approved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`p-5 rounded-2xl border transition-all duration-300 ${
        access.active
          ? 'bg-[#0B1020]/80 border-white/10 hover:border-white/20'
          : 'bg-[#0B1020]/40 border-white/5 opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Status indicator */}
        <div className={`w-10 h-10 rounded-xl ${access.active ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'} border flex items-center justify-center shrink-0`}>
          {access.active
            ? <Shield size={16} className="text-green-400" />
            : <XCircle size={16} className="text-white/20" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-white truncate">
                {product?.name || 'Produto Desconhecido'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.border} border ${sc.color} uppercase tracking-wider`}>
                  {sc.label}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${access.active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/5 text-white/20'} border uppercase tracking-wider`}>
                  {access.active ? 'Ativo' : 'Revogado'}
                </span>
              </div>
            </div>
            {order?.amount && (
              <span className="text-sm font-black text-white/70 font-mono shrink-0">
                R$ {Number(order.amount).toFixed(2)}
              </span>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            {order?.customer_email && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <Mail size={10} />
                <span className="truncate">{order.customer_email}</span>
              </div>
            )}
            {order?.customer_name && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <User size={10} />
                <span className="truncate">{order.customer_name}</span>
              </div>
            )}
            {order?.paid_at && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <Calendar size={10} />
                {new Date(order.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            )}
            {order?.gateway && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <CreditCard size={10} />
                {order.gateway}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCopyLink(access.id, access.order_id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-[10px] font-bold transition-all"
            >
              {copiedId === access.id ? <><Check size={10} className="text-green-400" /> Copiado!</> : <><Link2 size={10} /> Copiar Link</>}
            </button>

            {access.active ? (
              <button
                onClick={() => onRevoke(access.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <EyeOff size={10} />}
                Revogar
              </button>
            ) : (
              <button
                onClick={() => onReactivate(access.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                Reativar
              </button>
            )}

            <a
              href={`/minha-area?order=${access.order_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold transition-all"
            >
              <Eye size={10} /> Ver Área
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Página Principal ─────────────────────────────────────────
export const DeliveryPage: React.FC = () => {
  const [accesses, setAccesses] = useState<ProductAccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'revoked'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAccesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAccesses({ limit: 100 });
      setAccesses(data);
    } catch (err) {
      console.error('[DeliveryPage] Erro ao carregar acessos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccesses();
  }, [loadAccesses]);

  const handleRevoke = async (accessId: string) => {
    setProcessing(accessId);
    try {
      await revokeAccess(accessId);
      setAccesses(prev => prev.map(a => a.id === accessId ? { ...a, active: false } : a));
    } finally {
      setProcessing(null);
    }
  };

  const handleReactivate = async (accessId: string) => {
    setProcessing(accessId);
    try {
      await reactivateAccess(accessId);
      setAccesses(prev => prev.map(a => a.id === accessId ? { ...a, active: true } : a));
    } finally {
      setProcessing(null);
    }
  };

  const handleCopyLink = (accessId: string, orderId: string) => {
    const link = `${window.location.origin}/minha-area?order=${orderId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(accessId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtragem
  const filtered = accesses.filter(a => {
    const order = a.orders as any;
    const product = a.products as any;
    const matchFilter = filterActive === 'all' || (filterActive === 'active' ? a.active : !a.active);
    const matchSearch = !searchQuery.trim() ||
      (order?.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order?.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.order_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Stats
  const totalActive = accesses.filter(a => a.active).length;
  const totalRevoked = accesses.filter(a => !a.active).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Entrega Digital</h1>
          <p className="text-sm text-white/50">Gerencie acessos, downloads e liberações automáticas pós-pagamento.</p>
        </div>
        <button
          onClick={loadAccesses}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Acessos', value: accesses.length, color: 'text-white', icon: <Package size={16} /> },
          { label: 'Acessos Ativos', value: totalActive, color: 'text-green-400', icon: <CheckCircle2 size={16} /> },
          { label: 'Revogados', value: totalRevoked, color: 'text-red-400', icon: <XCircle size={16} /> },
          { label: 'Downloads Liberados', value: totalActive, color: 'text-brand-orange', icon: <Download size={16} /> },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md">
            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-bold">{s.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
          {(['all', 'active', 'revoked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterActive === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? '✓ Ativos' : '✗ Revogados'}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar por e-mail, nome, produto ou order ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
          />
        </div>
      </div>

      {/* Lista de Acessos */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-brand-orange animate-spin" />
            <p className="text-sm text-white/30">Carregando acessos...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">
            {searchQuery ? 'Nenhum resultado para esta busca.' : 'Nenhum acesso registrado ainda.'}
          </p>
          <p className="text-xs text-white/20 mt-1">Os acessos aparecem aqui automaticamente após pagamento aprovado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/30">{filtered.length} acesso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((access, idx) => (
            <AccessCard
              key={access.id}
              access={access}
              idx={idx}
              onRevoke={handleRevoke}
              onReactivate={handleReactivate}
              copiedId={copiedId}
              onCopyLink={handleCopyLink}
              processing={processing}
            />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15">
        <AlertTriangle size={14} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-400/70 leading-relaxed">
          <strong className="text-blue-400">Sobre a entrega automática:</strong> Quando um pagamento é aprovado pelo gateway,
          o sistema cria automaticamente o registro em <code className="font-mono bg-white/5 px-1 rounded">product_access</code> e gera
          um token de download com 48h de validade e limite de 3 downloads. A revogação aqui também bloqueia
          imediatamente o acesso na área de membros.
        </div>
      </div>
    </div>
  );
};
