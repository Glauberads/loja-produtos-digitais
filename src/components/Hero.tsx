import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface HeroProps {
  onlineUsers?: number;
}

export const Hero: React.FC<HeroProps> = ({ onlineUsers = 42 }) => {
  const [videoUrl, setVideoUrl] = React.useState('https://www.youtube.com/embed/ZVVOBnVRFVA?si=NexusSaaS');

  React.useEffect(() => {
    const savedUrl = localStorage.getItem('nexus_hero_video_url');
    if (savedUrl) {
      setVideoUrl(savedUrl);
    }
    
    // Listen for cross-tab changes or dynamic updates if needed
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nexus_hero_video_url' && e.newValue) {
        setVideoUrl(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
            {onlineUsers} pessoas navegando agora
          </motion.div>

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

        {/* Centered Video / Demo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-[860px] aspect-[16/9] rounded-3xl glassmorphism p-2 sm:p-3.5 glow-border shadow-2xl relative overflow-hidden bg-theme-card/50"
        >
          {/* ========================================================= */}
          {/* A URL DO VÍDEO AGORA É CONFIGURÁVEL NO PAINEL ADMIN (CONFIGURAÇÕES) */}
          {/* ========================================================= */}
          <iframe 
            src={videoUrl} 
            title="Apresentação NexusSaaS"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full rounded-2xl bg-black/80 border border-theme-border"
          />
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
