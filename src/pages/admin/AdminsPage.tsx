import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Lock, 
  Edit2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Users
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { supabase } from '../../lib/supabase';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  created_at: string;
  updated_at: string;
}

export const AdminsPage: React.FC = () => {
  const { user: currentUser, role: currentRole, loading: authLoading } = useAdminAuth();
  
  // State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin' | 'manager'>('admin');
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Admins
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });

      if (dbError) throw dbError;
      setAdmins(data as AdminUser[]);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar administradores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'super_admin') {
      fetchAdmins();
    }
  }, [currentRole, fetchAdmins]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Open Edit Modal
  const handleEditClick = (admin: AdminUser) => {
    if (admin.user_id === currentUser?.id) {
      showToast('Bloqueado: Você não pode alterar suas próprias permissões.', 'error');
      return;
    }
    setSelectedAdmin(admin);
    setSelectedRole(admin.role);
    setIsEditOpen(true);
  };

  // Validate and Trigger Confirmation
  const handleSaveClick = () => {
    if (!selectedAdmin) return;
    
    // Check if lowering role of super_admin and if it's the last one
    if (selectedAdmin.role === 'super_admin' && selectedRole !== 'super_admin') {
      const superAdminsCount = admins.filter(a => a.role === 'super_admin').length;
      if (superAdminsCount <= 1) {
        showToast('Operação bloqueada: Não é possível remover o último Super Administrador.', 'error');
        setIsEditOpen(false);
        return;
      }
    }

    setIsConfirmOpen(true);
  };

  // Execute Supabase Update
  const handleConfirmSave = async () => {
    if (!selectedAdmin) return;
    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ role: selectedRole, updated_at: new Date().toISOString() })
        .eq('user_id', selectedAdmin.user_id);

      if (updateError) throw updateError;

      showToast(`Permissão de ${selectedAdmin.email} alterada para ${selectedRole} com sucesso!`, 'success');
      setIsConfirmOpen(false);
      setIsEditOpen(false);
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar alterações no banco de dados.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading indicator for Auth check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Protection at the Page Level (Even if direct URL accessed)
  if (currentRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[75vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-[#0B1020]/60 border border-white/10 backdrop-blur-xl text-center shadow-lg relative overflow-hidden group"
        >
          {/* Background subtle glow */}
          <div className="absolute -inset-px bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl opacity-50 blur-sm pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-6">
            <Lock size={32} className="animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-3 tracking-wider">Acesso Negado</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Esta seção é restrita exclusivamente a usuários com privilégios de <strong>Super Administrador</strong>. Seu cargo atual não possui permissão para visualizar ou gerenciar acessos.
          </p>
          
          <a 
            href="/admin/dashboard"
            className="inline-block w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-all"
          >
            Voltar ao Dashboard
          </a>
        </motion.div>
      </div>
    );
  }

  // Filtered Admins for search
  const filteredAdmins = admins.filter(admin => 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Counters
  const totalCount = admins.length;
  const superCount = admins.filter(a => a.role === 'super_admin').length;
  const adminCount = admins.filter(a => a.role === 'admin').length;
  const managerCount = admins.filter(a => a.role === 'manager').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-wide">
            Administradores
          </h1>
          <p className="text-sm text-white/50">
            Gerenciamento de privilégios de acesso e controle de cargos do painel.
          </p>
        </div>
        <button 
          onClick={fetchAdmins}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand-orange' : ''} />
          Sincronizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/40 border border-white/10 backdrop-blur-md flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-white/[0.02] pointer-events-none">
            <Users size={80} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Total Contas</p>
            <h3 className="text-2xl font-black text-white">{totalCount}</h3>
          </div>
        </div>

        {/* Super Admin Card */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/40 border border-white/10 backdrop-blur-md flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-red-500/[0.02] pointer-events-none">
            <ShieldAlert size={80} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-400/50 uppercase tracking-widest mb-0.5">Super Admins</p>
            <h3 className="text-2xl font-black text-white">{superCount}</h3>
          </div>
        </div>

        {/* Admin Card */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/40 border border-white/10 backdrop-blur-md flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-blue-500/[0.02] pointer-events-none">
            <ShieldCheck size={80} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest mb-0.5">Admins</p>
            <h3 className="text-2xl font-black text-white">{adminCount}</h3>
          </div>
        </div>

        {/* Manager Card */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/40 border border-white/10 backdrop-blur-md flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-emerald-500/[0.02] pointer-events-none">
            <Shield size={80} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest mb-0.5">Managers</p>
            <h3 className="text-2xl font-black text-white">{managerCount}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-white/40" />
        </div>
        <input
          type="text"
          placeholder="Buscar administrador por e-mail ou permissão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1020]/40 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-orange/40 transition-colors backdrop-blur-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#0B1020]/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md relative">
        {loading && (
          <div className="absolute inset-0 bg-[#050505]/40 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Administrador</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Membro Desde</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAdmins.map((admin, idx) => {
                const isSelf = admin.user_id === currentUser?.id;
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={admin.id} 
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs border
                          ${admin.role === 'super_admin' ? 'bg-gradient-to-br from-red-500/20 to-brand-orange/20 border-red-500/30 text-red-300' : ''}
                          ${admin.role === 'admin' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300' : ''}
                          ${admin.role === 'manager' ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300' : ''}
                        `}>
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            {admin.email}
                            {isSelf && (
                              <span className="text-[9px] bg-white/10 text-white/60 font-semibold px-1.5 py-0.5 rounded-md border border-white/10">
                                Você
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md
                        ${admin.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]' : ''}
                        ${admin.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]' : ''}
                        ${admin.role === 'manager' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : ''}
                      `}>
                        {admin.role === 'super_admin' && <ShieldAlert size={11} />}
                        {admin.role === 'admin' && <ShieldCheck size={11} />}
                        {admin.role === 'manager' && <Shield size={11} />}
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-white/40">
                        {new Date(admin.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span 
                          title="Auto-bloqueio: Você não pode alterar sua própria permissão."
                          className="text-[10px] text-white/20 font-bold italic px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] select-none"
                        >
                          Bloqueado
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(admin)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-brand-orange/10 hover:text-brand-orange font-semibold text-xs text-white/70 transition-all inline-flex items-center gap-1.5 shadow-sm group-hover:scale-[1.02]"
                        >
                          <Edit2 size={12} />
                          Alterar Cargo
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}

              {!loading && filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40 text-sm">
                    Nenhum administrador encontrado para "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Toasts Overlay */}
      <AnimatePresence>
        {/* Toast Notification */}
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-md max-w-md
              ${toast.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-red-950/80 text-red-300 border-red-500/30'}
            `}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span className="text-xs font-bold leading-normal">{toast.message}</span>
          </motion.div>
        )}

        {/* Modal 1: Edit Role Form */}
        {isEditOpen && selectedAdmin && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#090D1A]/90 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-50 overflow-hidden"
            >
              {/* Pumpkin Glow accent at top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-80" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Shield size={18} className="text-brand-orange" />
                  Alterar Cargo Administrativo
                </h3>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Details */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Administrador</p>
                  <p className="text-sm font-bold text-white truncate">{selectedAdmin.email}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] text-white/40">Cargo Atual:</span>
                    <span className="text-[10px] font-black uppercase text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {selectedAdmin.role}
                    </span>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Novo Cargo</label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm focus:border-brand-orange/40 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="super_admin" className="bg-[#090D1A] text-white">Super Administrador (Acesso Total)</option>
                    <option value="admin" className="bg-[#090D1A] text-white">Administrador (Gerenciador)</option>
                    <option value="manager" className="bg-[#090D1A] text-white">Gerente (Acesso Limitado)</option>
                  </select>
                </div>

                {/* Safety Warning */}
                {selectedRole === 'super_admin' && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium leading-normal flex items-start gap-2.5">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 animate-bounce" />
                    <span>
                      <strong>Cuidado:</strong> Conceder privilégios de <strong>Super Administrador</strong> dará a esta conta controle completo do sistema, incluindo gerenciamento de outros administradores e permissões.
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveClick}
                    disabled={selectedRole === selectedAdmin.role}
                    className="flex-1 py-3 rounded-xl bg-brand-orange hover:bg-brand-neonOrange text-white font-bold text-sm shadow-neon-orange hover:shadow-neon-orange-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Salvar Cargo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 2: Confirmation Prompt */}
        {isConfirmOpen && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-[#0F0707]/90 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-xl relative z-50 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>

              <h4 className="text-base font-black text-white mb-2">Confirmar Alteração de Cargo?</h4>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Tem certeza de que deseja alterar o cargo de <strong className="text-white">{selectedAdmin.email}</strong> para <strong className="text-brand-orange uppercase">{selectedRole}</strong>? 
                Esta ação altera imediatamente todas as credenciais e permissões de segurança da conta.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  {isSaving ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
