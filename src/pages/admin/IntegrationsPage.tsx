import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, CreditCard, MessageSquare, Bot, Cpu, Webhook,
  Settings2, X, Eye, EyeOff, CheckCircle2,
  ExternalLink, Save, Trash2, Info, Zap, Target, Activity, Megaphone, Mail
} from 'lucide-react';

// ──────────────────────────────────────────────
//  Tipos
// ──────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  hint?: string;
  optional?: boolean;
}

interface GatewayDef {
  id: string;
  name: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  accentColor: string;
  docsUrl: string;
  fields: FieldDef[];
  supportedMethods: string[];
  fee: string;
  icon: any;
}

type SavedConfigs = Record<string, Record<string, string>>;

// ──────────────────────────────────────────────
//  Definição dos Gateways
// ──────────────────────────────────────────────
const PAYMENT_GATEWAYS: GatewayDef[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Gateway internacional para cartões de crédito, débito e carteiras digitais.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    accentColor: '#6366f1',
    docsUrl: 'https://dashboard.stripe.com/apikeys',
    fee: '2,9% + R$ 0,30 por transação',
    supportedMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    icon: CreditCard,
    fields: [
      {
        key: 'publishable_key',
        label: 'Chave Publicável (Publishable Key)',
        placeholder: 'pk_live_...',
        hint: 'Começa com pk_test_ (testes) ou pk_live_ (produção)',
      },
      {
        key: 'secret_key',
        label: 'Chave Secreta (Secret Key)',
        placeholder: 'sk_live_...',
        secret: true,
        hint: 'Começa com sk_test_ (testes) ou sk_live_ (produção). Nunca exponha no front-end.',
      },
      {
        key: 'webhook_secret',
        label: 'Webhook Signing Secret',
        placeholder: 'whsec_...',
        secret: true,
        optional: true,
        hint: 'Encontrado no painel Stripe → Developers → Webhooks.',
      },
    ],
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Pagamentos via PIX, Boleto e Cartão para toda a América Latina.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    accentColor: '#0ea5e9',
    docsUrl: 'https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing',
    fee: '4,99% no cartão · PIX grátis',
    supportedMethods: ['PIX', 'Boleto', 'Visa', 'Mastercard', 'Elo', 'Hipercard'],
    icon: CreditCard,
    fields: [
      {
        key: 'public_key',
        label: 'Public Key',
        placeholder: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        hint: 'Credencial pública. Disponível no painel → Suas integrações → Credenciais.',
      },
      {
        key: 'access_token',
        label: 'Access Token',
        placeholder: 'APP_USR-0000000000000000-000000-...',
        secret: true,
        hint: 'Credencial privada. Nunca exponha no cliente.',
      },
    ],
  },
  {
    id: 'asaas',
    name: 'Asaas',
    description: 'Plataforma de cobranças brasileira com PIX, Boleto e cartão.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    accentColor: '#f97316',
    docsUrl: 'https://docs.asaas.com',
    fee: '1% no PIX · 1,99% no boleto · 2,99% no cartão',
    supportedMethods: ['PIX', 'Boleto', 'Visa', 'Mastercard'],
    icon: CreditCard,
    fields: [
      {
        key: 'api_key',
        label: 'Chave de API (API Key)',
        placeholder: '$aact_...',
        secret: true,
        hint: 'Encontrado em Configurações → Integrações → Chave de API no painel Asaas.',
      },
      {
        key: 'environment',
        label: 'Ambiente',
        placeholder: 'production',
        hint: 'Use "sandbox" para testes ou "production" para produção.',
      },
      {
        key: 'webhook_token',
        label: 'Token do Webhook',
        placeholder: 'Token gerado pelo Asaas',
        secret: true,
        optional: true,
        hint: 'Token para validar requisições de webhook recebidas.',
      },
    ],
  },
  {
    id: 'pagarme',
    name: 'Pagar.me',
    description: 'Gateway brasileiro completo com suporte a split de pagamentos.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    accentColor: '#22c55e',
    docsUrl: 'https://docs.pagar.me',
    fee: '2,49% + R$ 0,09 no PIX · 3,29% no cartão',
    supportedMethods: ['PIX', 'Boleto', 'Visa', 'Mastercard', 'Elo', 'Amex'],
    icon: CreditCard,
    fields: [
      {
        key: 'secret_key',
        label: 'Secret Key',
        placeholder: 'sk_...',
        secret: true,
        hint: 'Chave privada. Encontrada em Configurações → Dados da conta → Chaves de API.',
      },
      {
        key: 'public_key',
        label: 'Public Key',
        placeholder: 'pk_...',
        hint: 'Chave pública usada no front-end para tokenizar cartões.',
      },
      {
        key: 'account_id',
        label: 'Account ID',
        placeholder: 'acc_...',
        optional: true,
        hint: 'ID da conta para operações multi-conta.',
      },
    ],
  },
];

const MARKETING_INTEGRATIONS: GatewayDef[] = [
  {
    id: 'meta_pixel',
    name: 'Meta Pixel & CAPI',
    description: 'Rastreamento de eventos via Pixel e Conversions API do Facebook.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accentColor: '#3b82f6',
    docsUrl: 'https://business.facebook.com/events_manager2/',
    fee: 'Gratuito',
    supportedMethods: ['Pixel de Navegador', 'Conversions API (Server-Side)'],
    icon: Target,
    fields: [
      {
        key: 'pixel_id',
        label: 'ID do Pixel',
        placeholder: '123456789012345',
        hint: 'Ex: 123456789012345. Usado para eventos no navegador.',
      },
      {
        key: 'capi_token',
        label: 'Token de Acesso (CAPI)',
        placeholder: 'EAAB...',
        secret: true,
        optional: true,
        hint: 'Token gerado no Gerenciador de Eventos para eventos de servidor.',
      },
    ],
  },
  {
    id: 'google_tag',
    name: 'Google Tag (GTM/GA4)',
    description: 'Acompanhamento do Google Analytics 4, Google Ads e Tag Manager.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accentColor: '#f59e0b',
    docsUrl: 'https://tagmanager.google.com/',
    fee: 'Gratuito',
    supportedMethods: ['GA4', 'Google Ads', 'Tag Manager'],
    icon: Activity,
    fields: [
      {
        key: 'gtm_id',
        label: 'ID da Tag',
        placeholder: 'GTM-XXXXXXX ou G-XXXXXXX',
        hint: 'O ID do seu contêiner do Tag Manager ou ID de Medição do GA4.',
      },
    ],
  },
];

const COMMUNICATION_INTEGRATIONS: GatewayDef[] = [
  {
    id: 'resend',
    name: 'Resend API',
    description: 'Envio de e-mails transacionais (boas-vindas, recuperação de senha) com alta taxa de entrega.',
    color: 'text-zinc-300',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    accentColor: '#ffffff',
    docsUrl: 'https://resend.com/api-keys',
    fee: 'Até 3.000 e-mails/mês grátis',
    supportedMethods: ['E-mails Transacionais', 'Newsletters'],
    icon: Mail,
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 're_123456789...',
        secret: true,
        hint: 'Sua chave de API do Resend (começa com re_).',
      },
      {
        key: 'from_email',
        label: 'E-mail Remetente (From)',
        placeholder: 'contato@sualoja.com',
        hint: 'O e-mail padrão usado para enviar as mensagens. O domínio deve estar verificado no Resend.',
      },
    ],
  },
];

// ──────────────────────────────────────────────
//  Componente de Campo de Formulário
// ──────────────────────────────────────────────
const FormField: React.FC<{
  field: FieldDef;
  value: string;
  onChange: (key: string, value: string) => void;
}> = ({ field, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-white/80">
          {field.label}
        </label>
        {field.optional && (
          <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            opcional
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type={field.secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-200 font-mono pr-10"
        />
        {field.secret && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {field.hint && (
        <p className="text-[10px] text-white/35 flex items-start gap-1.5 leading-relaxed">
          <Info size={10} className="mt-0.5 shrink-0 text-white/25" />
          {field.hint}
        </p>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
//  Modal de Configuração do Gateway
// ──────────────────────────────────────────────
const GatewayModal: React.FC<{
  gateway: GatewayDef;
  initialValues: Record<string, string>;
  onSave: (id: string, values: Record<string, string>) => void;
  onDisconnect: (id: string) => void;
  onClose: () => void;
  isConnected: boolean;
}> = ({ gateway, initialValues, onSave, onDisconnect, onClose, isConnected }) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(gateway.id, values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const allRequiredFilled = gateway.fields
    .filter((f) => !f.optional)
    .every((f) => (values[f.key] ?? '').trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${gateway.accentColor}, transparent)` }}
        />
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: gateway.accentColor }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${gateway.bg} ${gateway.border} border flex items-center justify-center ${gateway.color}`}>
              {gateway.icon ? <gateway.icon size={22} /> : <Settings2 size={22} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{gateway.name}</h2>
              <p className="text-[11px] text-white/40">{gateway.fee}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          {/* Métodos suportados */}
          <div className="flex flex-wrap gap-1.5">
            {gateway.supportedMethods.map((m) => (
              <span
                key={m}
                className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/50 bg-white/5 font-semibold"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Campos */}
          <div className="space-y-4">
            {gateway.fields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Link para docs */}
          <a
            href={gateway.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            <ExternalLink size={11} />
            Onde encontrar minhas credenciais?
          </a>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center gap-3">
          {isConnected && (
            <button
              onClick={() => onDisconnect(gateway.id)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
            >
              <Trash2 size={13} />
              Desconectar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!allRequiredFilled}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              allRequiredFilled
                ? 'bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 text-white border border-white/15 hover:border-white/30 hover:shadow-lg'
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            }`}
            style={
              allRequiredFilled
                ? { boxShadow: `0 0 20px ${gateway.accentColor}30` }
                : {}
            }
          >
            {saved ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Salvo com sucesso!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ──────────────────────────────────────────────
//  Card do Gateway
// ──────────────────────────────────────────────
const GatewayCard: React.FC<{
  gateway: GatewayDef;
  isConnected: boolean;
  onConfigure: () => void;
  idx: number;
}> = ({ gateway, isConnected, onConfigure, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.06 }}
    className={`p-6 rounded-2xl bg-[#0B1020]/60 border backdrop-blur-md relative overflow-hidden group transition-all duration-300 cursor-pointer ${
      isConnected
        ? 'border-white/15 hover:border-white/30'
        : 'border-white/5 hover:border-white/20'
    }`}
    onClick={onConfigure}
  >
    {/* Glow quando conectado */}
    {isConnected && (
      <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/15 blur-[50px] rounded-full pointer-events-none" />
    )}
    <div
      className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
      style={{ background: gateway.accentColor }}
    />

    {/* Top row */}
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div
        className={`w-12 h-12 rounded-xl ${gateway.bg} ${gateway.border} border flex items-center justify-center ${gateway.color}`}
      >
        {gateway.icon ? <gateway.icon size={22} /> : <Settings2 size={22} />}
      </div>

      {isConnected ? (
        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Conectado
        </div>
      ) : (
        <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/35 text-[10px] font-bold uppercase tracking-wider">
          Desconectado
        </div>
      )}
    </div>

    <h3 className="text-lg font-bold text-white mb-1.5 relative z-10">{gateway.name}</h3>
    <p className="text-xs text-white/45 mb-5 min-h-[32px] relative z-10 leading-relaxed">
      {gateway.description}
    </p>

    {/* Métodos em miniatura */}
    <div className="flex flex-wrap gap-1 mb-4 relative z-10">
      {gateway.supportedMethods.slice(0, 4).map((m) => (
        <span
          key={m}
          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-semibold"
        >
          {m}
        </span>
      ))}
      {gateway.supportedMethods.length > 4 && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">
          +{gateway.supportedMethods.length - 4}
        </span>
      )}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
      <div className="text-[10px] text-white/30">
        {isConnected ? (
          <span className="flex items-center gap-1 text-emerald-400/70">
            <CheckCircle2 size={10} />
            Credenciais configuradas
          </span>
        ) : (
          'Requer configuração'
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onConfigure(); }}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Settings2 size={15} />
      </button>
    </div>
  </motion.div>
);

// ──────────────────────────────────────────────
//  Outras Integrações (não-pagamento)
// ──────────────────────────────────────────────
const OTHER_INTEGRATIONS = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Banco de dados, Autenticação e Storage oficial da plataforma.',
    icon: Database,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    connected: true,
    lastSync: 'agora',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    description: 'Envio de notificações automáticas via WhatsApp Oficial.',
    icon: MessageSquare,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    connected: false,
    lastSync: null,
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    description: 'Inteligência Artificial para descrições de produtos e SEO.',
    icon: Bot,
    color: 'text-white',
    bg: 'bg-white/10',
    border: 'border-white/20',
    connected: true,
    lastSync: 'há 2 horas',
  },
  {
    id: 'evolution',
    name: 'Evolution API',
    description: 'API não-oficial para WhatsApp (Múltiplas conexões).',
    icon: Cpu,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    connected: false,
    lastSync: null,
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Integrações customizadas para n8n, Make e Zapier.',
    icon: Webhook,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    connected: true,
    lastSync: 'há 5 min',
  },
];

// ──────────────────────────────────────────────
//  Página Principal
// ──────────────────────────────────────────────
const STORAGE_KEY = 'payment_gateway_configs';

export const IntegrationsPage: React.FC = () => {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfigs>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Delaying setState to avoid synchronous call in useEffect body
        setTimeout(() => setSavedConfigs(parsed), 0);
      }
    } catch {
      // ignora
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (id: string, values: Record<string, string>) => {
    const updated = { ...savedConfigs, [id]: values };
    setSavedConfigs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const name = PAYMENT_GATEWAYS.find((g) => g.id === id)?.name 
      || MARKETING_INTEGRATIONS.find((g) => g.id === id)?.name 
      || COMMUNICATION_INTEGRATIONS.find((g) => g.id === id)?.name;
    showToast(`${name} configurado com sucesso!`);
  };

  const handleDisconnect = (id: string) => {
    const updated = { ...savedConfigs };
    delete updated[id];
    setSavedConfigs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActiveModal(null);
    const name = PAYMENT_GATEWAYS.find((g) => g.id === id)?.name 
      || MARKETING_INTEGRATIONS.find((g) => g.id === id)?.name 
      || COMMUNICATION_INTEGRATIONS.find((g) => g.id === id)?.name;
    showToast(`${name} desconectado.`);
  };

  const isConnected = (id: string) => {
    const cfg = savedConfigs[id];
    if (!cfg) return false;
    const gw = PAYMENT_GATEWAYS.find((g) => g.id === id) 
      || MARKETING_INTEGRATIONS.find((g) => g.id === id) 
      || COMMUNICATION_INTEGRATIONS.find((g) => g.id === id);
    if (!gw) return false;
    return gw.fields.filter((f) => !f.optional).every((f) => (cfg[f.key] ?? '').trim().length > 0);
  };

  const activeGateway = PAYMENT_GATEWAYS.find((g) => g.id === activeModal) 
    || MARKETING_INTEGRATIONS.find((g) => g.id === activeModal) 
    || COMMUNICATION_INTEGRATIONS.find((g) => g.id === activeModal);
    
  const connectedCount = PAYMENT_GATEWAYS.filter((g) => isConnected(g.id)).length 
    + MARKETING_INTEGRATIONS.filter((g) => isConnected(g.id)).length 
    + COMMUNICATION_INTEGRATIONS.filter((g) => isConnected(g.id)).length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Integrações</h1>
          <p className="text-sm text-white/50">
            Conecte a plataforma aos seus serviços e gateways de pagamento.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
          <Zap size={13} className="text-yellow-400" />
          <span>
            <span className="text-white font-bold">{connectedCount}</span> de{' '}
            {PAYMENT_GATEWAYS.length + MARKETING_INTEGRATIONS.length + COMMUNICATION_INTEGRATIONS.length} serviços ativos
          </span>
        </div>
      </div>

      {/* ── Gateways de Pagamento ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-white/40" />
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Gateways de Pagamento
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {PAYMENT_GATEWAYS.map((gw, idx) => (
            <GatewayCard
              key={gw.id}
              gateway={gw}
              isConnected={isConnected(gw.id)}
              onConfigure={() => setActiveModal(gw.id)}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* ── Marketing e Rastreamento ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-8">
          <Megaphone size={15} className="text-white/40" />
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Marketing e Rastreamento
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {MARKETING_INTEGRATIONS.map((gw, idx) => (
            <GatewayCard
              key={gw.id}
              gateway={gw}
              isConnected={isConnected(gw.id)}
              onConfigure={() => setActiveModal(gw.id)}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* ── Comunicação e E-mail ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-8">
          <Mail size={15} className="text-white/40" />
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Comunicação e E-mail
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {COMMUNICATION_INTEGRATIONS.map((gw, idx) => (
            <GatewayCard
              key={gw.id}
              gateway={gw}
              isConnected={isConnected(gw.id)}
              onConfigure={() => setActiveModal(gw.id)}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* ── Outras Integrações ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-8">
          <Webhook size={15} className="text-white/40" />
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Outros Serviços
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OTHER_INTEGRATIONS.map((integration, idx) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-6 rounded-2xl bg-[#0B1020]/50 border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${
                integration.connected
                  ? 'border-white/10 hover:border-white/30'
                  : 'border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
              }`}
            >
              {integration.connected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none" />
              )}

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl ${integration.bg} ${integration.border} border flex items-center justify-center ${integration.color}`}
                >
                  <integration.icon size={24} />
                </div>
                {integration.connected ? (
                  <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                    Desconectado
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                {integration.name}
              </h3>
              <p className="text-xs text-white/50 mb-6 min-h-[32px] relative z-10">
                {integration.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                <div className="text-[10px] text-white/30">
                  {integration.connected
                    ? `Sincronizado: ${integration.lastSync}`
                    : 'Requer configuração'}
                </div>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <Settings2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && activeGateway && (
          <GatewayModal
            gateway={activeGateway}
            initialValues={savedConfigs[activeModal] ?? {}}
            onSave={handleSave}
            onDisconnect={handleDisconnect}
            onClose={() => setActiveModal(null)}
            isConnected={isConnected(activeModal)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#0B1120] border border-emerald-500/30 text-white text-xs font-semibold shadow-2xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
