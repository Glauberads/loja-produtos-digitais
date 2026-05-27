import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, ShoppingBag, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
  gradient: GRADIENTS[0], icon_name: 'Box', image_url: null,
  video_url: null, details_url: null, checkout_url: null, active: true,
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'upsell'>('geral');
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');

  // Upsell Form State
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [upsellForm, setUpsellForm] = useState({
    id: '',
    upsell_product_id: '',
    title: 'OFERTA ÚNICA: Adicione ao seu pedido!',
    description: '',
    promotional_price: 0,
    active: false
  });

  useEffect(() => {
    if (product) {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = product as SupabaseProduct & { id: string; created_at: string; updated_at: string };
      setForm({ ...rest });
      loadUpsellOffer(product.id);
    } else {
      setForm(emptyForm());
    }
    loadAvailableProducts();
  }, [product]);

  const loadAvailableProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, price').eq('active', true);
    if (data) {
      // Remover o próprio produto da lista de ofertas
      setAvailableProducts(product ? data.filter(p => p.id !== product.id) : data);
    }
  };

  const loadUpsellOffer = async (productId: string) => {
    const { data } = await supabase.from('upsell_offers').select('*').eq('main_product_id', productId).maybeSingle();
    if (data) {
      setUpsellForm({
        id: data.id,
        upsell_product_id: data.upsell_product_id,
        title: data.title,
        description: data.description || '',
        promotional_price: data.promotional_price,
        active: data.active
      });
    }
  };

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setUpsell = (key: string, value: any) => {
    setUpsellForm(prev => ({ ...prev, [key]: value }));
  };

  const saveUpsell = async (mainProductId: string) => {
    if (!upsellForm.upsell_product_id) return;

    const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
    
    const upsellData = {
      tenant_id: tenant?.id,
      main_product_id: mainProductId,
      upsell_product_id: upsellForm.upsell_product_id,
      title: upsellForm.title,
      description: upsellForm.description,
      promotional_price: upsellForm.promotional_price,
      active: upsellForm.active
    };

    if (upsellForm.id) {
      await supabase.from('upsell_offers').update(upsellData).eq('id', upsellForm.id);
    } else {
      await supabase.from('upsell_offers').insert([upsellData]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 1. Salvar o Produto Principal
      // O hook onSave por enquanto não devolve o ID salvo facilmente se for produto novo
      // Então upsell em produto novo talvez tenha que ser configurado depois de salvar
      // Mas se for edição de produto, podemos salvar.
      const ok = await onSave(form);
      
      if (ok && product) {
        // Se for update, salva o upsell associado
        await saveUpsell(product.id);
      } else if (ok && !product) {
        // Se for novo, vai precisar buscar o produto recém-criado pelo slug para salvar o upsell
        const { data: newProd } = await supabase.from('products').select('id').eq('slug', form.slug).single();
        if (newProd) await saveUpsell(newProd.id);
      }
      
      if (ok) onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto ou upsell');
    } finally {
      setSaving(false);
    }
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
        
        {/* Header com Abas */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex gap-6">
            <button 
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'geral' ? 'border-brand-orange text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <ShoppingBag size={16} /> Detalhes Gerais
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('upsell')}
              className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upsell' ? 'border-brand-orange text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <Zap size={16} /> Funil / Upsell
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:border-white/15 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto">
          
          {activeTab === 'geral' ? (
            <div className="space-y-5">
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

              {/* Descrições, URLs e Features seguem omitidas por simplicidade... */}
              {/* Adicionando de volta pra manter compatibilidade */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descrição Curta</label>
                <input value={form.short_description || ''} onChange={e => set('short_description', e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descrição Longa</label>
                <textarea rows={3} value={form.long_description || ''} onChange={e => set('long_description', e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all resize-none" />
              </div>

              {/* Features & Tech Stack */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Funcionalidades</label>
                  <div className="mt-2 space-y-2">
                    {(form.features || []).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-1 text-[10px] text-white/70 bg-brand-darkGray/40 px-2 py-1.5 rounded-lg truncate">✓ {f}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="p-1 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Nova..." className="flex-1 px-2 py-1.5 rounded-lg bg-brand-darkGray/50 border border-white/8 text-xs text-white" />
                      <button type="button" onClick={addFeature} className="px-2 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-white">Add</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Tech Stack</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(form.tech_stack || []).map((t, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] font-mono bg-white/5 px-2 py-1 rounded-lg text-white/70">
                          {t} <button type="button" onClick={() => removeTech(i)} className="text-white/30 hover:text-red-400"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newTech} onChange={e => setNewTech(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="Ex: React..." className="flex-1 px-2 py-1.5 rounded-lg bg-brand-darkGray/50 border border-white/8 text-xs text-white font-mono" />
                      <button type="button" onClick={addTech} className="px-2 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-white">Add</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL do Vídeo</label>
                  <input value={form.video_url || ''} onChange={e => set('video_url', e.target.value || null)} placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL Ver Mais</label>
                  <input value={form.details_url || ''} onChange={e => set('details_url', e.target.value || null)} placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">URL do Checkout</label>
                  <input value={form.checkout_url || ''} onChange={e => set('checkout_url', e.target.value || null)} placeholder="https://..." className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-darkGray/30 border border-white/5">
                <label className="text-sm font-semibold text-white/70">Produto Ativo (visível na loja)</label>
                <button type="button" onClick={() => set('active', !form.active)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.active ? 'bg-brand-orange' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.active ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aba Upsell */}
              <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-4 text-sm text-white/80">
                Ofereça um produto complementar aos clientes imediatamente após a compra do <strong>{form.name}</strong>.
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Produto de Upsell</label>
                <select 
                  value={upsellForm.upsell_product_id} 
                  onChange={e => setUpsell('upsell_product_id', e.target.value)}
                  className="mt-1 w-full px-3.5 py-3 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white focus:outline-none focus:border-brand-orange/40 transition-all"
                >
                  <option value="">Nenhum Upsell ativo</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Original: R$ {p.price})</option>
                  ))}
                </select>
              </div>

              {upsellForm.upsell_product_id && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Título da Oferta</label>
                      <input value={upsellForm.title} onChange={e => setUpsell('title', e.target.value)}
                        placeholder="Ex: Não feche a página! Leve também..."
                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Preço Promocional (R$)*</label>
                      <input type="number" step="0.01" value={upsellForm.promotional_price} onChange={e => setUpsell('promotional_price', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-brand-orange font-bold focus:border-brand-orange/40" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descrição Persuasiva</label>
                    <textarea rows={3} value={upsellForm.description} onChange={e => setUpsell('description', e.target.value)}
                      placeholder="Mostre por que este produto complementa a compra anterior..."
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-brand-darkGray/50 border border-white/8 text-sm text-white resize-none" />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <label className="text-sm font-bold text-emerald-400">Ativar Oferta de Upsell neste produto</label>
                    <button type="button" onClick={() => setUpsell('active', !upsellForm.active)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ml-auto ${upsellForm.active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${upsellForm.active ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
