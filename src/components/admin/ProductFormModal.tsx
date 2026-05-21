import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { SupabaseProduct, ProductInput } from '../../hooks/useProducts';

const CATEGORIES = ['WhatsApp', 'IA', 'SaaS', 'CRM', 'Dashboard', 'Automação', 'Agência', 'Financeiro', 'Landing Pages', 'E-commerce', 'Delivery'];
const BADGES = ['NOVO', 'HOT', 'IA', 'MAIS VENDIDO'];
const GRADIENTS = [
  'from-green-500/20 via-emerald-600/35 to-brand-black',
  'from-blue-600/20 via-indigo-600/30 to-brand-black',
  'from-brand-orange/20 via-red-600/30 to-brand-black',
  'from-purple-500/20 via-pink-600/30 to-brand-black',
  'from-cyan-500/20 via-teal-600/30 to-brand-black',
  'from-amber-500/20 via-orange-600/30 to-brand-black',
  'from-violet-600/20 via-purple-600/30 to-brand-black',
  'from-emerald-500/20 via-teal-600/30 to-brand-black',
  'from-yellow-600/20 via-amber-600/30 to-brand-black',
  'from-pink-600/20 via-purple-700/30 to-brand-black',
];

interface ProductFormModalProps {
  product: SupabaseProduct | null;
  onClose: () => void;
  onSave: (data: ProductInput) => Promise<boolean>;
}

const emptyForm = (): ProductInput => ({
  slug: '', name: '', category: 'SaaS', short_description: '', long_description: '',
  price: 0, rating: 5.0, sales_count: 0, badge: null, features: [], tech_stack: [],
  gradient: GRADIENTS[0], icon_name: 'Box', image_url: null, active: true,
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    if (product) {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = product as SupabaseProduct & { id: string; created_at: string; updated_at: string };
      setForm({ ...rest });
    } else {
      setForm(emptyForm());
    }
  }, [product]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) onClose();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      set('features', [...(form.features || []), newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (i: number) => {
    set('features', (form.features || []).filter((_, idx) => idx !== i));
  };

  const addTech = () => {
    if (newTech.trim()) {
      set('tech_stack', [...(form.tech_stack || []), newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTech = (i: number) => {
    set('tech_stack', (form.tech_stack || []).filter((_, idx) => idx !== i));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-brand-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[#0D1117] border border-white/8 rounded-3xl shadow-2xl z-10 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-lg font-black text-white">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
            <p className="text-xs text-white/35 mt-0.5">Preencha todos os campos para {product ? 'atualizar' : 'criar'} o produto.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:border-white/15 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Nome + Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Nome do Produto*</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Slug (URL único)*</label>
              <input required value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="ex: zapmax-crm"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white font-mono focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
          </div>

          {/* Row 2: Categoria + Badge */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Categoria*</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Badge</label>
              <select value={form.badge || ''} onChange={e => set('badge', e.target.value || null)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all">
                <option value="">Sem Badge</option>
                {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Preço + Rating + Sales */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Preço (R$)*</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={e => set('price', parseFloat(e.target.value) || 0)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.01" value={form.rating}
                onChange={e => set('rating', parseFloat(e.target.value) || 5)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Vendas</label>
              <input type="number" min="0" value={form.sales_count}
                onChange={e => set('sales_count', parseInt(e.target.value) || 0)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
          </div>

          {/* Descrição curta */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descrição Curta</label>
            <input value={form.short_description || ''} onChange={e => set('short_description', e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
          </div>

          {/* Descrição longa */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descrição Longa</label>
            <textarea rows={3} value={form.long_description || ''} onChange={e => set('long_description', e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all resize-none" />
          </div>

          {/* Features */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Funcionalidades</label>
            <div className="mt-2 space-y-2">
              {(form.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-white/70 bg-brand-darkGray/40 border border-white/5 px-3 py-2 rounded-lg">✓ {f}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Nova funcionalidade..."
                  className="flex-1 px-3 py-2 rounded-lg bg-brand-darkGray/50 border border-white/8 text-xs text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
                <button type="button" onClick={addFeature} className="px-3 py-2 rounded-lg bg-brand-orange/15 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/25 transition-all text-xs font-bold flex items-center gap-1"><Plus size={13} /> Add</button>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Tech Stack</label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.tech_stack || []).map((t, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] font-mono bg-white/5 border border-white/10 text-white/70 px-2 py-1 rounded-lg">
                    {t}
                    <button type="button" onClick={() => removeTech(i)} className="text-white/30 hover:text-red-400 ml-0.5"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTech} onChange={e => setNewTech(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  placeholder="Ex: React, Node.js..."
                  className="flex-1 px-3 py-2 rounded-lg bg-brand-darkGray/50 border border-white/8 text-xs text-white focus:outline-none focus:border-brand-orange/40 transition-all font-mono" />
                <button type="button" onClick={addTech} className="px-3 py-2 rounded-lg bg-brand-orange/15 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/25 transition-all text-xs font-bold flex items-center gap-1"><Plus size={13} /> Add</button>
              </div>
            </div>
          </div>

          {/* Row: Ícone + Gradiente + Image URL */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Nome do Ícone (Lucide)</label>
              <input value={form.icon_name || ''} onChange={e => set('icon_name', e.target.value)}
                placeholder="ex: Zap, Package, Star..."
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white font-mono focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL da Imagem</label>
              <input value={form.image_url || ''} onChange={e => set('image_url', e.target.value || null)}
                placeholder="https://..."
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
            </div>
          </div>

          {/* Gradiente */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Gradiente do Card</label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {GRADIENTS.map(g => (
                <button key={g} type="button" onClick={() => set('gradient', g)}
                  className={`h-8 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${form.gradient === g ? 'border-brand-orange scale-105' : 'border-white/5 hover:border-white/20'}`} />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-darkGray/30 border border-white/5">
            <label className="text-sm font-semibold text-white/70">Produto Ativo (visível na loja)</label>
            <button type="button" onClick={() => set('active', !form.active)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.active ? 'bg-brand-orange' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.active ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
