import React from 'react';
import { Zap, Send, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email }]);
        
        if (error && error.code !== '23505') {
          throw error;
        }
      } catch (err) {
        console.error('Erro ao salvar e-mail no Supabase:', err);
      }
      
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-theme-bg border-t border-theme-border relative overflow-hidden pt-16 pb-8">
      {/* Background glow bottom corner */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[200px] rounded-full bg-brand-orange/5 neon-sphere translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top grid links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-theme-border">
          
          {/* Logo & Info column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-brand-neonOrange flex items-center justify-center text-white shadow-neon-orange">
                <Zap size={16} />
              </div>
              <span className="text-lg font-bold tracking-wider font-sans text-theme-text">
                NEXUS<span className="text-brand-orange font-extrabold">SAAS</span>
              </span>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed max-w-sm">
              O maior ecossistema de códigos-fontes whitelabel e ferramentas SaaS prontas do Brasil. Desenvolvido para ajudar desenvolvedores e agências de marketing a faturarem alto com tecnologia própria.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2.5 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-brand-orange hover:border-brand-orange/30 transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a href="#" className="p-2.5 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-brand-orange hover:border-brand-orange/30 transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-2.5 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-brand-orange hover:border-brand-orange/30 transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links columns (2 cols each) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-theme-text">Marketplace</h4>
            <ul className="space-y-2 text-xs text-theme-muted">
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">Todos os Sistemas</a></li>
              <li><a href="#lancamentos" className="hover:text-brand-orange transition-colors">Lançamentos</a></li>
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">Mais Vendidos</a></li>
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">Em Alta</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-theme-text">Categorias</h4>
            <ul className="space-y-2 text-xs text-theme-muted">
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">WhatsApp</a></li>
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">IA</a></li>
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">SaaS Multi-tenant</a></li>
              <li><a href="#vitrine" className="hover:text-brand-orange transition-colors">Automações</a></li>
            </ul>
          </div>

          {/* Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-theme-text">Inscrição na Newsletter</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Assine nosso boletim e receba alertas de novos lançamentos de SaaS e códigos whitelabel com desconto exclusivo de criador.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insira seu e-mail"
                className="w-full px-4 py-2.5 rounded-xl bg-theme-card/80 border border-theme-border text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all duration-300 pr-12"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-2 rounded-lg bg-brand-orange text-white hover:bg-brand-neonOrange transition-colors"
                title="Inscrever-se"
              >
                <Send size={12} />
              </button>
            </form>
            
            {subscribed && (
              <span className="text-[10px] text-green-500 font-semibold block animate-pulse">
                Inscrição realizada com sucesso! Verifique sua caixa de entrada.
              </span>
            )}
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[10px] text-theme-muted font-mono">
          <div className="flex items-center gap-1.5">
            <Award size={12} />
            <span>Plataforma Oficial NexusSaaS Inc. © 2026. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline hover:text-theme-text">Termos de Uso</a>
            <a href="#" className="hover:underline hover:text-theme-text">Políticas de Privacidade</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
