import React from 'react';
import { Menu, Store, Bell, Search, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenSidebar }) => {
  const location = useLocation();
  
  // Create breadcrumb from pathname
  const paths = location.pathname.split('/').filter(Boolean);
  const breadcrumb = paths.map(p => p.charAt(0).toUpperCase() + p.slice(1));

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 transition-all">
      
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className={idx === breadcrumb.length - 1 ? 'text-white' : 'text-white/40'}>
                {crumb}
              </span>
              {idx < breadcrumb.length - 1 && <ChevronRight size={14} className="text-white/20" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 lg:gap-5">
        
        {/* Global Search */}
        <div className="hidden md:flex items-center relative">
          <Search size={14} className="absolute left-3 text-white/30" />
          <input 
            placeholder="Buscar (Cmd+K)..." 
            className="pl-9 pr-4 py-2 w-64 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-orange/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Actions */}
        <button 
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all group"
        >
          <Store size={14} className="group-hover:text-brand-orange transition-colors" />
          <span className="hidden sm:block">Ver Loja</span>
        </button>

        <button className="relative p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full shadow-[0_0_8px_rgba(255,106,0,0.8)] animate-pulse"></span>
        </button>

      </div>
    </header>
  );
};
