import React from 'react';
import { ArrowRight, Terminal, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36 tech-grid-bg text-center">
      
      {/* Glow ambient background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full bg-brand-darkBlue/20 blur-[130px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center space-y-8">
        
        {/* Centered Headline Container */}
        <div className="flex flex-col items-center space-y-4 max-w-3xl">
          
          {/* Main Headline (Exactly as the print) */}
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text flex items-center justify-center gap-3 select-none"
          >
            🔥 Lançamento 🔥
          </motion.h1>

          {/* Subheadline (Exactly as the print) */}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-theme-text leading-snug font-sans"
          >
            Tenha sua própria plataforma SaaS de WhatsApp
          </motion.h2>
          
        </div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2"
        >
          <button
            onClick={() => scrollToSection('vitrine')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-neonOrange text-base font-bold text-white shadow-neon-orange hover:shadow-neon-orange-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Explorar Sistemas
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => scrollToSection('lancamentos')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-theme-card/80 border border-theme-border hover:border-brand-orange/30 hover:bg-theme-card text-base font-bold text-theme-muted hover:text-theme-text transition-all duration-300"
          >
            Ver Lançamentos
          </button>
        </motion.div>

        {/* Centered Video / Demo Mockup Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-[760px] aspect-[16/9] rounded-3xl glassmorphism p-3.5 glow-border glow-border-hover shadow-2xl relative overflow-hidden group cursor-pointer"
          onClick={() => scrollToSection('vitrine')}
        >
          {/* Simulated Window Header */}
          <div className="flex items-center justify-between border-b border-theme-border pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
            </div>
            <div className="text-[10px] text-theme-muted font-mono tracking-widest uppercase flex items-center gap-1 bg-theme-bg/60 px-2.5 py-0.5 rounded">
              <Terminal size={10} className="text-brand-orange" />
              demo_whatsapp_saas.mp4
            </div>
          </div>

          {/* Video Mockup Interface */}
          <div className="relative w-full h-[calc(100%-36px)] rounded-2xl overflow-hidden bg-theme-bg/80 flex items-center justify-center">
            
            {/* Tech grid layout design background representing SaaS Dashboard */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 via-theme-bg/20 to-brand-neonOrange/5 opacity-55 tech-grid-bg"></div>
            
            {/* Simulated UI components */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-theme-card/85 border border-theme-border px-3 py-1.5 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-mono text-theme-text tracking-wider">Servidor: WhatsApp API Online</span>
              </div>
              <div className="flex gap-2">
                <span className="h-5 w-16 rounded bg-theme-border/20 border border-theme-border text-[8px] font-mono flex items-center justify-center text-theme-muted">Multi-tenant</span>
                <span className="h-5 w-16 rounded bg-brand-orange/10 border border-brand-orange/30 text-[8px] font-mono flex items-center justify-center text-brand-orange font-bold">100% White Label</span>
              </div>
            </div>

            {/* Central Giant Play Button (Exactly like the print) */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-neon-orange group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                {/* Simulated Youtube play icon */}
                <Play size={28} fill="currentColor" className="ml-1 text-white" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-theme-card border border-theme-border text-theme-muted px-3.5 py-1.5 rounded-full group-hover:text-brand-orange transition-colors">
                Clique para Ver os Sistemas na Vitrine
              </span>
            </div>

            {/* Footer indicators inside mockup */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-theme-muted font-mono text-[8px] pointer-events-none">
              <span>Stack: Node.js, React, Tailwind, PostgreSQL</span>
              <span>1080p Full HD Demo</span>
            </div>
            
          </div>
          
        </motion.div>

        {/* Info tags below video */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-theme-muted text-xs font-mono pt-4 select-none"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-ping"></span>
            Entrega Imediata
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange"></span>
            Código-fonte Incluso
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange"></span>
            Sem Mensalidades
          </span>
        </motion.div>

      </div>
    </section>
  );
};
