import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Ticket, Search, TrendingUp, Plus, Trash2, Copy, CheckCircle2,
  X, Save, Eye, EyeOff, Tag, Globe, Image, ExternalLink, AlertCircle, Check
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  maxUses: number;
  uses: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaUrl: string;
  color: string;
  active: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const LS_COUPONS = 'nexus_admin_coupons';
const LS_SEO = 'nexus_admin_seo';
const LS_BANNERS = 'nexus_admin_banners';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveLS<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_COUPONS: Coupon[] = [
  { id: '1', code: 'LAUNCH20', discount: 20, type: 'percent', maxUses: 100, uses: 34, expiresAt: '2026-12-31', active: true, createdAt: '2026-05-01' },
  { id: '2', code: 'WELCOME50', discount: 50, type: 'fixed', maxUses: 50, uses: 12, expiresAt: '2026-07-31', active: true, createdAt: '2026-05-10' },
];

const DEFAULT_SEO: SeoConfig = {
  title: 'NexusSaaS | Marketplace Premium de Sistemas, Automações e Dashboards',
  description: 'O maior marketplace de sistemas digitais premium. Adquira SaaS, automações, dashboards, templates e ferramentas de IA prontas para usar ou revender com tecnologia de ponta.',
  keywords: 'SaaS, automações, dashboard, templates, WhatsApp, delivery, CRM, agência, sistemas digitais, marketplace',
  ogImage: '',
};

const DEFAULT_BANNERS: Banner[] = [
  { id: '1', title: '🔥 Lançamento', subtitle: 'Tenha sua própria plataforma SaaS de WhatsApp', cta: 'Explorar Sistemas', ctaUrl: '#vitrine', color: 'from-orange-600 to-orange-400', active: true, createdAt: '2026-05-01' },
];

const GRADIENT_OPTIONS = [
  { label: 'Laranja', value: 'from-orange-600 to-orange-400' },
  { label: 'Azul', value: 'from-blue-600 to-cyan-400' },
  { label: 'Roxo', value: 'from-violet-600 to-purple-400' },
  { label: 'Verde', value: 'from-emerald-600 to-green-400' },
  { label: 'Rosa', value: 'from-pink-600 to-rose-400' },
  { label: 'Índigo', value: 'from-indigo-600 to-blue-400' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COUPON SECTION
// ─────────────────────────────────────────────────────────────────────────────

const CouponsSection: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadLS(LS_COUPONS, DEFAULT_COUPONS));
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({ type: 'percent', discount: 10, maxUses: 100, active: true });

  useEffect(() => { saveLS(LS_COUPONS, coupons); }, [coupons]);

  const handleCreate = () => {
    if (!form.code?.trim()) return;
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: form.code.toUpperCase().trim(),
      discount: form.discount ?? 10,
      type: form.type ?? 'percent',
      maxUses: form.maxUses ?? 100,
      uses: 0,
      expiresAt: form.expiresAt ?? '',
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setForm({ type: 'percent', discount: 10, maxUses: 100, active: true });
    setShowForm(false);
  };

  const toggleActive = (id: string) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const deleteCoupon = (id: string) => setCoupons(prev => prev.filter(c => c.id !== id));

  const copyCoupon = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Ticket size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Cupons de Desconto</h3>
            <p className="text-[11px] text-white/40">{coupons.filter(c => c.active).length} ativos · {coupons.length} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all"
        >
          <Plus size={13} /> Novo Cupom
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-[11px] font-black text-white/50 uppercase tracking-wider">Novo Cupom</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Código</label>
                  <input
                    value={form.code ?? ''}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="EX: PROMO10"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}
                    className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">
                    Desconto {form.type === 'percent' ? '(%)' : '(R$)'}
                  </label>
                  <input
                    type="number"
                    value={form.discount ?? ''}
                    onChange={e => setForm(p => ({ ...p, discount: parseFloat(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Usos Máximos</label>
                  <input
                    type="number"
                    value={form.maxUses ?? ''}
                    onChange={e => setForm(p => ({ ...p, maxUses: parseInt(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Expira em</label>
                  <input
                    type="date"
                    value={form.expiresAt ?? ''}
                    onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleCreate} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5">
                  <Save size={13} /> Criar Cupom
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:text-white transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {coupons.length === 0 && (
          <div className="text-center py-8 text-white/20 text-xs">Nenhum cupom criado ainda.</div>
        )}
        {coupons.map(c => (
          <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${c.active ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono font-black text-sm text-white">{c.code}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${c.type === 'percent' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                  {c.type === 'percent' ? `${c.discount}% OFF` : `R$ ${c.discount} OFF`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/30">
                <span>{c.uses}/{c.maxUses} usos</span>
                {c.expiresAt && <span>Expira: {c.expiresAt}</span>}
              </div>
              {/* Usage bar */}
              <div className="w-full bg-white/5 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.min((c.uses / c.maxUses) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => copyCoupon(c.id, c.code)} title="Copiar código" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                {copiedId === c.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <button onClick={() => toggleActive(c.id)} title={c.active ? 'Desativar' : 'Ativar'} className={`p-1.5 rounded-lg transition-all ${c.active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}>
                {c.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => deleteCoupon(c.id)} title="Excluir" className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO SECTION
// ─────────────────────────────────────────────────────────────────────────────

const SeoSection: React.FC = () => {
  const [config, setConfig] = useState<SeoConfig>(() => loadLS(LS_SEO, DEFAULT_SEO));
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState({ title: config.title.length, description: config.description.length });

  const handleChange = (field: keyof SeoConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (field === 'title' || field === 'description') {
      setCharCount(prev => ({ ...prev, [field]: value.length }));
    }
    setSaved(false);
  };

  const handleSave = () => {
    saveLS(LS_SEO, config);
    // Apply to document head dynamically
    document.title = config.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', config.description);
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) metaKw.setAttribute('content', config.keywords);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const titleStatus = charCount.title < 50 ? 'short' : charCount.title > 60 ? 'long' : 'ok';
  const descStatus = charCount.description < 120 ? 'short' : charCount.description > 160 ? 'long' : 'ok';

  const statusColor = (s: string) => s === 'ok' ? 'text-emerald-400' : s === 'short' ? 'text-yellow-400' : 'text-red-400';
  const statusLabel = (s: string) => s === 'ok' ? '✓ Ideal' : s === 'short' ? '⚠ Curto' : '✗ Longo';

  return (
    <div className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Search size={20} />
        </div>
        <div>
          <h3 className="text-base font-black text-white">SEO Global</h3>
          <p className="text-[11px] text-white/40">Meta tags aplicadas em tempo real à loja.</p>
        </div>
      </div>

      {/* Preview card (Google SERP mockup) */}
      <div className="p-3.5 rounded-xl bg-white border border-gray-200">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-[6px] text-white font-black">N</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">nexussaas.com.br</span>
          <span className="text-gray-300 text-[10px]">›</span>
        </div>
        <p className="text-blue-700 text-sm font-medium leading-tight truncate">{config.title || 'Título do site...'}</p>
        <p className="text-gray-600 text-[11px] leading-snug mt-0.5 line-clamp-2">{config.description || 'Descrição do site...'}</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Title Tag</label>
            <span className={`text-[10px] font-bold ${statusColor(titleStatus)}`}>
              {charCount.title}/60 — {statusLabel(titleStatus)}
            </span>
          </div>
          <input
            value={config.title}
            onChange={e => handleChange('title', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Meta Description</label>
            <span className={`text-[10px] font-bold ${statusColor(descStatus)}`}>
              {charCount.description}/160 — {statusLabel(descStatus)}
            </span>
          </div>
          <textarea
            rows={3}
            value={config.description}
            onChange={e => handleChange('description', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block mb-1.5">Keywords</label>
          <input
            value={config.keywords}
            onChange={e => handleChange('keywords', e.target.value)}
            placeholder="palavra1, palavra2, palavra3..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
          />
          <p className="text-[10px] text-white/20 mt-1">Separe por vírgulas. Keywords ajudam em indexação interna.</p>
        </div>

        {/* OG Image URL */}
        <div>
          <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Globe size={10} /> OG Image URL (Open Graph / WhatsApp / redes sociais)
          </label>
          <input
            value={config.ogImage}
            onChange={e => handleChange('ogImage', e.target.value)}
            placeholder="https://nexussaas.com.br/og-image.jpg"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-mono text-xs"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'}`}
      >
        {saved ? <><Check size={16} /> Salvo com sucesso!</> : <><Save size={15} /> Salvar e Aplicar SEO</>}
      </button>

      {saved && (
        <p className="text-[11px] text-emerald-400/70 text-center -mt-2">
          ✓ Meta tags aplicadas à página atual em tempo real.
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS SECTION
// ─────────────────────────────────────────────────────────────────────────────

const BannersSection: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(() => loadLS(LS_BANNERS, DEFAULT_BANNERS));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Banner>>({ color: GRADIENT_OPTIONS[0].value, active: true });

  useEffect(() => { saveLS(LS_BANNERS, banners); }, [banners]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ color: GRADIENT_OPTIONS[0].value, active: true, cta: 'Ver Agora', ctaUrl: '#vitrine' });
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({ ...b });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title?.trim()) return;
    if (editingId) {
      setBanners(prev => prev.map(b => b.id === editingId ? { ...b, ...form } as Banner : b));
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        title: form.title ?? '',
        subtitle: form.subtitle ?? '',
        cta: form.cta ?? 'Ver Agora',
        ctaUrl: form.ctaUrl ?? '#',
        color: form.color ?? GRADIENT_OPTIONS[0].value,
        active: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setBanners(prev => [newBanner, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const toggleBanner = (id: string) => setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  const deleteBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  return (
    <div className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/10 backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Banners Destaque</h3>
            <p className="text-[11px] text-white/40">{banners.filter(b => b.active).length} ativo(s) na homepage</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all"
        >
          <Plus size={13} /> Novo Banner
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-[11px] font-black text-white/50 uppercase tracking-wider">
                {editingId ? 'Editar Banner' : 'Novo Banner'}
              </p>

              {/* Live Preview */}
              <div className={`w-full p-4 rounded-xl bg-gradient-to-r ${form.color} text-white relative overflow-hidden`}>
                <p className="text-lg font-black leading-tight">{form.title || '🔥 Título do Banner'}</p>
                <p className="text-xs text-white/80 mt-0.5">{form.subtitle || 'Subtítulo aqui...'}</p>
                {form.cta && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-white/20 border border-white/30 text-xs font-bold">
                    {form.cta} →
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Título</label>
                  <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="🔥 Título do Banner" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Subtítulo</label>
                  <input value={form.subtitle ?? ''} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Texto de apoio..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Texto do Botão</label>
                  <input value={form.cta ?? ''} onChange={e => setForm(p => ({ ...p, cta: e.target.value }))} placeholder="Ex: Ver Agora" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">URL do Botão</label>
                  <input value={form.ctaUrl ?? ''} onChange={e => setForm(p => ({ ...p, ctaUrl: e.target.value }))} placeholder="#vitrine" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-2">Cor / Gradiente</label>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENT_OPTIONS.map(g => (
                      <button key={g.value} onClick={() => setForm(p => ({ ...p, color: g.value }))} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.value} transition-all ${form.color === g.value ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`} title={g.label} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5">
                  <Save size={13} /> {editingId ? 'Salvar Edição' : 'Criar Banner'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:text-white transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banners list */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {banners.length === 0 && <div className="text-center py-8 text-white/20 text-xs">Nenhum banner criado.</div>}
        {banners.map(b => (
          <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${b.active ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-40'}`}>
            {/* Color swatch */}
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${b.color} shrink-0 flex items-center justify-center`}>
              <Image size={16} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{b.title}</p>
              <p className="text-[10px] text-white/30 truncate">{b.subtitle}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {b.ctaUrl && (
                  <span className="text-[9px] text-white/20 font-mono truncate max-w-[100px]">{b.ctaUrl}</span>
                )}
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${b.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {b.active ? '● ATIVO' : '○ INATIVO'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Editar">
                <Tag size={14} />
              </button>
              <button onClick={() => toggleBanner(b.id)} className={`p-1.5 rounded-lg transition-all ${b.active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`} title={b.active ? 'Desativar' : 'Ativar'}>
                {b.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => deleteBanner(b.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Excluir">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
        <AlertCircle size={13} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-yellow-400/70 leading-relaxed">
          Para exibir os banners na vitrine, conecte o estado dos banners ativos ao componente <span className="font-mono">Hero.tsx</span> via hook ou context.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────────────────────────

const MarketingStats: React.FC = () => {
  const coupons = loadLS<Coupon[]>(LS_COUPONS, DEFAULT_COUPONS);
  const banners = loadLS<Banner[]>(LS_BANNERS, DEFAULT_BANNERS);
  const totalUses = coupons.reduce((s, c) => s + c.uses, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Cupons Ativos', value: coupons.filter(c => c.active).length, color: 'text-blue-400', icon: <Ticket size={16} /> },
        { label: 'Total de Usos', value: totalUses, color: 'text-brand-orange', icon: <Tag size={16} /> },
        { label: 'Banners Ativos', value: banners.filter(b => b.active).length, color: 'text-emerald-400', icon: <TrendingUp size={16} /> },
        { label: 'Módulos SEO', value: 1, color: 'text-purple-400', icon: <Globe size={16} /> },
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const MarketingPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'all' | 'coupons' | 'seo' | 'banners'>('all');

  const modules = [
    { id: 'all', label: 'Todos' },
    { id: 'coupons', label: '🎟 Cupons' },
    { id: 'seo', label: '🔍 SEO' },
    { id: 'banners', label: '📣 Banners' },
  ] as const;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Marketing & SEO</h1>
          <p className="text-sm text-white/50">Gerencie cupons, otimização de busca e banners da homepage.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeModule === m.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <MarketingStats />

      {/* Modules */}
      <div className={`grid gap-6 ${activeModule === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {(activeModule === 'all' || activeModule === 'coupons') && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <CouponsSection />
          </motion.div>
        )}
        {(activeModule === 'all' || activeModule === 'seo') && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <SeoSection />
          </motion.div>
        )}
        {(activeModule === 'all' || activeModule === 'banners') && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <BannersSection />
          </motion.div>
        )}
      </div>
    </div>
  );
};
