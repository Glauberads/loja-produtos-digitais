import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ShieldAlert, CheckCircle2, Info, Activity, AlertTriangle, RefreshCw } from 'lucide-react';

const mockLogs = [
  { id: 1, type: 'info', message: 'Sistema inicializado na versão 2.4.1.', time: '08:00:12', date: '21 Mai, 2026' },
  { id: 2, type: 'success', message: 'Conexão com Supabase estabelecida (LATÊNCIA: 12ms).', time: '08:00:14', date: '21 Mai, 2026' },
  { id: 3, type: 'warning', message: 'Tentativa de login falha no painel Admin (IP: 192.168.1.104).', time: '09:15:33', date: '21 Mai, 2026' },
  { id: 4, type: 'success', message: 'Login de administrador bem sucedido (IP: 187.20.144.200).', time: '09:17:01', date: '21 Mai, 2026' },
  { id: 5, type: 'info', message: 'Novo pedido criado: ORD-2026-901 (Nexus Analytics Pro).', time: '10:45:22', date: '21 Mai, 2026' },
  { id: 6, type: 'success', message: 'Webhook [MercadoPago] recebido: Pagamento Aprovado para ORD-2026-901.', time: '10:46:05', date: '21 Mai, 2026' },
  { id: 7, type: 'info', message: 'E-mail transacional enviado para joao.silva@email.com (Acesso Liberado).', time: '10:46:12', date: '21 Mai, 2026' },
  { id: 8, type: 'error', message: 'Falha na comunicação com Evolution API (Timeout 5000ms).', time: '11:20:00', date: '21 Mai, 2026' },
  { id: 9, type: 'warning', message: 'Retentativa 1/3 para webhook da Evolution API iniciada.', time: '11:20:05', date: '21 Mai, 2026' },
  { id: 10, type: 'success', message: 'Conexão Evolution API reestabelecida com sucesso.', time: '11:20:07', date: '21 Mai, 2026' },
];

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState(mockLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final do terminal quando um novo log chega
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newLog = {
        id: Date.now(),
        type: 'info',
        message: 'Refresh manual dos logs do sistema executado pelo Administrador.',
        time: new Date().toLocaleTimeString('pt-BR'),
        date: '21 Mai, 2026'
      };
      setLogs(prev => [...prev, newLog]);
      setIsRefreshing(false);
    }, 800);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />;
      case 'error': return <ShieldAlert size={14} className="text-red-400 shrink-0 mt-0.5" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />;
      default: return <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400 font-bold';
      case 'warning': return 'text-yellow-400';
      default: return 'text-white/70';
    }
  };

  return (
    <div className="space-y-6 pb-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Logs do Sistema</h1>
          <p className="text-sm text-white/50">Auditoria de eventos, webhooks e erros em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-bold text-white/70 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar Agora
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 min-h-[500px] rounded-2xl bg-[#030508] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
        {/* Terminal Header */}
        <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="mx-auto flex items-center gap-2 text-[10px] font-mono text-white/30 tracking-widest uppercase">
            <Terminal size={12} />
            server@nexus-saas-core:~/logs
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={terminalRef}
          className="flex-1 p-6 overflow-y-auto font-mono text-xs sm:text-sm space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {logs.map((log) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id} 
              className="flex items-start gap-3 hover:bg-white/[0.02] p-1 rounded transition-colors"
            >
              {getLogIcon(log.type)}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full">
                <span className="text-white/30 shrink-0 text-[11px] sm:text-xs">[{log.date} {log.time}]</span>
                <span className={`${getLogColor(log.type)} leading-relaxed break-words`}>
                  {log.message}
                </span>
              </div>
            </motion.div>
          ))}
          
          <div className="flex items-center gap-2 text-white/50 pt-4 animate-pulse">
            <Activity size={14} className="text-brand-orange" />
            <span>Aguardando novos eventos...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
