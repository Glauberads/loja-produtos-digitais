const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ProductDetailsModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "{/* ── ETAPA 1: Formulário de dados ────────────────── */}";
const endMarker = "{/* ── ETAPA 2: QR Code PIX real ───────────────────── */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const newLayout = `${startMarker}
            {checkoutStep === 'form' && (
              <div className="w-full flex flex-col md:flex-row gap-8 text-left">
                {/* COLUNA ESQUERDA */}
                <div className="w-full md:w-[65%] space-y-6">
                  
                  {/* Produto Principal Header */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-neonOrange/20 border border-brand-orange/30 flex items-center justify-center shrink-0">
                       <TechIcon name={product.iconName} className="text-brand-orange" size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{product.name}</h4>
                      <p className="text-xs text-white/50">{product.category}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-lg font-black text-white font-mono">R$ {Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Seus Dados */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><User size={16} className="text-brand-orange"/> Seus dados</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-left col-span-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu nome completo?</label>
                          <input type="text" placeholder="Nome da Silva" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={\`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all \${formErrors.name ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}\`} />
                        </div>
                        <div className="text-left col-span-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu e-mail?</label>
                          <input type="email" placeholder="Digite o e-mail que receberá o produto" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={\`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all \${formErrors.email ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}\`} />
                        </div>
                        <div className="text-left">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o número do seu celular?</label>
                          <input type="tel" placeholder="(11) 99999-9999" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className={\`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all \${formErrors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}\`} />
                        </div>
                        <div className="text-left">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Qual é o seu CPF?</label>
                          <input type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} className={\`w-full bg-brand-darkGray border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all \${formErrors.cpf ? 'border-red-500/50' : 'border-white/10 focus:border-brand-orange/50'}\`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Bumps */}
                  {bumpProducts.length > 0 && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-red-400 flex items-center gap-2">
                          <Zap size={16} /> OPORTUNIDADE ÚNICA
                          <span className="text-xs font-medium text-white/50 ml-2 hidden sm:inline-block">Adicione ofertas especiais ao seu pedido!</span>
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {bumpProducts.map(bump => (
                          <div 
                            key={bump.id}
                            className={\`flex items-start gap-3 p-4 rounded-xl border \${selectedBumpIds.includes(bump.id) ? 'border-brand-orange bg-brand-orange/5' : 'border-white/10 bg-white/5'} cursor-pointer hover:border-brand-orange/30 transition-all\`}
                            onClick={() => {
                              setSelectedBumpIds(prev => prev.includes(bump.id) ? prev.filter(id => id !== bump.id) : [...prev, bump.id]);
                            }}
                          >
                            <div className={\`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 \${selectedBumpIds.includes(bump.id) ? 'bg-brand-orange border-brand-orange' : 'border-white/30'}\`}>
                              {selectedBumpIds.includes(bump.id) && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">Aproveite e leve também: {bump.name}</p>
                              <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{bump.short_description || bump.longDescription || 'Adicione este incrível produto ao seu carrinho por um valor exclusivo.'}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-white/30 line-through">De R$ {bump.price}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">-70%</span>
                                <span className="text-sm font-black text-green-400">R$ {bump.bump_price || bump.price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart size={16} className="text-brand-orange"/> Escolha a forma de pagamento</h4>
                    
                    <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-brand-darkGray border border-white/5 w-full sm:w-fit overflow-x-auto">
                      <button 
                        onClick={() => setPaymentMethod('pix')}
                        className={\`relative px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap \${paymentMethod === 'pix' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/40 hover:text-white'}\`}
                      >
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">PIX</span>
                        PIX
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={\`px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap \${paymentMethod === 'card' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/40 hover:text-white'}\`}
                      >
                        Cartão de Crédito
                      </button>
                    </div>

                    {paymentMethod === 'pix' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                              <QrCode size={20} className="text-green-500" />
                           </div>
                           <p className="text-[11px] text-white/60">Aprovação imediata. O código PIX será gerado após clicar em pagar.</p>
                        </div>
                        
                        {checkoutError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertCircle size={13} className="shrink-0" />
                            {checkoutError}
                          </div>
                        )}

                        <button
                          onClick={handleGeneratePix}
                          disabled={checkoutLoading}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-sm font-black text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                        >
                          {checkoutLoading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : <><ShieldCheck size={16} /> PAGAR AGORA</>}
                        </button>
                      </div>
                    )}
                    {paymentMethod === 'card' && (
                      <div className="py-6 text-center">
                        <p className="text-sm text-white/50">Integração de cartão de crédito em breve.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUNA DIREITA */}
                <div className="w-full md:w-[35%]">
                  <div className="sticky top-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-3">Resumo da compra</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between text-white/80">
                          <span>{product.name}</span>
                          <span className="font-mono">R$ {Number(product.price).toFixed(2)}</span>
                        </div>
                        {selectedBumpIds.map(id => {
                          const b = bumpProducts.find(x => x.id === id);
                          if (!b) return null;
                          return (
                            <div key={b.id} className="flex justify-between text-white/80">
                              <span className="truncate pr-4">{b.name}</span>
                              <span className="font-mono text-green-400 whitespace-nowrap">+ R$ {Number(b.bump_price || b.price).toFixed(2)}</span>
                            </div>
                          );
                        })}
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="text-sm font-bold text-white">Total a pagar</span>
                          <span className="text-xl font-black text-green-400 font-mono">
                            R$ {(
                              Number(product.price) + 
                              selectedBumpIds.reduce((acc, id) => {
                                const b = bumpProducts.find(x => x.id === id);
                                return acc + Number(b?.bump_price || b?.price || 0);
                              }, 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        Compra segura e criptografada
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            `;

const newContent = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully replaced checkout form block");
