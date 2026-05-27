import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Megaphone, 
  Network,
  ShoppingCart,
  Users,
  Star,
  LineChart,
  Settings,
  Activity,
  LogOut,
  Zap,
  ShieldCheck,
  Ticket,
  X,
  Bot,
  MessageSquare,
  Download,
  Share2,
  DollarSign
} from 'lucide-react';
import { useAdminAuth } from '../../../hooks/useAdminAuth';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAdminAuth();
  const location = useLocation();

  const mainMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Leads', icon: MessageSquare, path: '/admin/leads' },
    { label: 'Produtos', icon: Package, path: '/admin/products' },
    { label: 'Cupons', icon: Ticket, path: '/admin/coupons' },
    { label: 'Entrega Digital', icon: Download, path: '/admin/delivery' },
    { label: 'Marketing', icon: Megaphone, path: '/admin/marketing' },
    { label: 'Afiliados', icon: Share2, path: '/admin/affiliates' },
    { label: 'Integrações', icon: Network, path: '/admin/integrations' },
  ];

  const extrasMenu = [
    { label: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Comissões', icon: DollarSign, path: '/admin/commissions' },
    { label: 'Clientes', icon: Users, path: '/admin/customers' },
    ...(role === 'super_admin' ? [{ label: 'Administradores', icon: ShieldCheck, path: '/admin/admins' }] : []),
    { label: 'Avaliações', icon: Star, path: '/admin/reviews' },
    { label: 'Minha Área', icon: Package, path: '/admin/member-area' },
    { label: 'Analytics', icon: LineChart, path: '/admin/analytics' },
    { label: 'Configurações', icon: Settings, path: '/admin/settings' },
    { label: 'Chat IA', icon: Bot, path: '/admin/ai-settings' },
    { label: 'Logs do Sistema', icon: Activity, path: '/admin/logs' },
  ];

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <NavLink
        to={item.path}
        onClick={() => onClose()}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-brand-neonOrange/10 text-brand-neonOrange border border-brand-neonOrange/30 shadow-[0_0_15px_rgba(255,122,0,0.2)]' 
            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange shadow-[0_0_10px_rgba(255,106,0,1)] rounded-r-md" />
        )}
        <item.icon size={18} className={`transition-all duration-300 ${isActive ? 'text-brand-orange' : 'group-hover:text-brand-orange'}`} />
        <span className="font-semibold text-sm">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#050505] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FF7A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,106,0,0.4)] shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
              <Zap size={16} className="text-white relative z-10" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-wider">NEXUS<span className="text-brand-orange">SAAS</span></span>
              <div className="flex items-center gap-1 -mt-0.5">
                <ShieldCheck size={10} className="text-brand-orange" />
                <span className="text-[9px] font-bold text-brand-orange/80 uppercase tracking-widest">Super Admin</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Menus */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-3">Principal</h4>
            {mainMenu.map(item => <NavItem key={item.path} item={item} />)}
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-3">Extras</h4>
            {extrasMenu.map(item => <NavItem key={item.path} item={item} />)}
          </div>

        </div>

        {/* Footer / User */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-[#0B1020]/30 backdrop-blur-md">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
            
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0B1020] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">Administrador</div>
              <div className="text-[10px] text-white/40 truncate">{user?.email}</div>
            </div>

            <button 
              onClick={() => logout()}
              title="Sair"
              className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
