export interface Product {
  id: string;
  name: string;
  category: 'Delivery' | 'WhatsApp' | 'IA' | 'CRM' | 'Dashboard' | 'Automação' | 'SaaS' | 'Agência' | 'Financeiro' | 'Landing Pages' | 'E-commerce';
  shortDescription: string;
  longDescription: string;
  price: number;
  rating: number;
  salesCount: number;
  badge: 'NOVO' | 'HOT' | 'IA' | 'MAIS VENDIDO' | null;
  features: string[];
  techStack: string[];
  gradient: string;
  iconName: string;
  videoUrl?: string;
  detailsUrl?: string;
  checkoutUrl?: string;
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'zapmax',
    name: 'ZapMax CRM',
    category: 'WhatsApp',
    shortDescription: 'Plataforma multiatendimento com chatbot inteligente e funis de vendas.',
    longDescription: 'O ZapMax CRM é a solução definitiva para centralizar o atendimento no WhatsApp de qualquer empresa. Permite múltiplos atendentes com um único número, criação de chatbots com fluxos visuais complexos, disparo de campanhas segmentadas e funis de vendas automatizados integrados com os principais gateways de pagamento.',
    price: 297,
    rating: 4.9,
    salesCount: 1420,
    badge: 'MAIS VENDIDO',
    features: [
      'Múltiplos atendentes em um só número',
      'Chatbot visual Drag & Drop',
      'Disparos em massa inteligentes',
      'Integração direta via Webhook/API',
      'Relatórios de desempenho da equipe'
    ],
    techStack: ['Node.js', 'React', 'TypeScript', 'Prisma', 'Socket.io'],
    gradient: 'from-green-500/20 via-emerald-600/35 to-brand-black',
    iconName: 'MessageSquare'
  },
  {
    id: 'titanops',
    name: 'TitanOps SaaS',
    category: 'SaaS',
    shortDescription: 'ERP para automação de processos internos e gestão operacional escalável.',
    longDescription: 'Automatize todas as operações internas de negócios em um único local. O TitanOps integra gerenciamento de projetos, acompanhamento de metas financeiras, fluxogramas automatizados, faturamento dinâmico e um painel do cliente customizável para prestadores de serviço e equipes de tecnologia.',
    price: 499,
    rating: 4.8,
    salesCount: 890,
    badge: 'HOT',
    features: [
      'Gerenciamento de tarefas Kanban & Gantt',
      'Faturamento recorrente integrado',
      'Módulo de suporte ao cliente com tickets',
      'Templates de automação de fluxo',
      'Suporte multi-empresa'
    ],
    techStack: ['Next.js', 'PostgreSQL', 'TailwindCSS', 'Go', 'Redis'],
    gradient: 'from-blue-600/20 via-indigo-600/30 to-brand-black',
    iconName: 'Layers'
  },
  {
    id: 'delivery-pro',
    name: 'Delivery PRO',
    category: 'Delivery',
    shortDescription: 'Sistema completo de pedidos online com cardápio digital e integração WhatsApp.',
    longDescription: 'Uma plataforma whitelabel de ponta para restaurantes. O Delivery PRO oferece um cardápio digital responsivo e de alta conversão, sistema de entrega com cálculo de frete por raio (Google Maps), recebimento de pedidos diretamente no painel administrativo e no WhatsApp do estabelecimento, além de impressora térmica integrada.',
    price: 197,
    rating: 4.7,
    salesCount: 1105,
    badge: 'HOT',
    features: [
      'Cardápio digital interativo e responsivo',
      'Notificações de status de pedido por WhatsApp',
      'Calculadora automática de rota e frete',
      'Integração com impressoras térmicas (ESC/POS)',
      'Painel de cupons e promoções'
    ],
    techStack: ['React', 'NestJS', 'PostgreSQL', 'TailwindCSS', 'Firebase'],
    gradient: 'from-brand-orange/20 via-red-600/30 to-brand-black',
    iconName: 'ShoppingBag'
  },
  {
    id: 'builderfy-ai',
    name: 'Builderfy AI',
    category: 'IA',
    shortDescription: 'Crie landing pages, sites e funis de vendas completos em segundos usando IA.',
    longDescription: 'O Builderfy AI revoluciona a criação de páginas. Apenas descreva o seu produto ou serviço e nossa inteligência artificial gerará um layout moderno de altíssima conversão, textos de copywriting focados em vendas, imagens integradas e otimização SEO instantânea. Tudo editável em um painel visual.',
    price: 349,
    rating: 4.95,
    salesCount: 954,
    badge: 'IA',
    features: [
      'Geração de layouts via comando de voz ou texto',
      'Criação de copywriting persuasivo inclusa',
      'Hospedagem global ultrarrápida integrada',
      'Exportação direta para HTML/React',
      'Integração de formulários nativa'
    ],
    techStack: ['Next.js', 'OpenAI API', 'Framer Motion', 'TailwindCSS', 'Supabase'],
    gradient: 'from-purple-500/20 via-pink-600/30 to-brand-black',
    iconName: 'Sparkles'
  },
  {
    id: 'clinica-pro',
    name: 'Clínica PRO',
    category: 'Dashboard',
    shortDescription: 'Painel administrativo avançado para gestão médica e agendamentos online.',
    longDescription: 'Desenvolvido especificamente para médicos, dentistas e clínicas de saúde. O Clínica PRO inclui prontuário eletrônico completo, anamnese personalizada, controle financeiro com repasse médico automático, confirmação de consultas por WhatsApp SMS automatizado e emissão de receitas assinadas digitalmente.',
    price: 389,
    rating: 4.8,
    salesCount: 620,
    badge: null,
    features: [
      'Agenda inteligente multi-profissional',
      'Prontuário eletrônico criptografado',
      'Lembrete automático de consulta via WhatsApp',
      'Módulo financeiro integrado',
      'Telemedicina com videochamada criptografada'
    ],
    techStack: ['React', 'Express', 'MongoDB', 'Node.js', 'WebRTC'],
    gradient: 'from-cyan-500/20 via-teal-600/30 to-brand-black',
    iconName: 'Activity'
  },
  {
    id: 'agencia-pro',
    name: 'Agência PRO ERP',
    category: 'Agência',
    shortDescription: 'Gerenciador completo de jobs, contratos, faturamento e times de marketing.',
    longDescription: 'O ERP definitivo para agências digitais que querem escalar. Controle briefs, atribuição de tarefas de criativos, relatórios de horas trabalhadas (timesheet), CRM comercial robusto, faturamento e gestão recorrente de contratos (fee mensal), além de um painel transparente para os clientes acompanharem as entregas.',
    price: 497,
    rating: 4.75,
    salesCount: 432,
    badge: 'MAIS VENDIDO',
    features: [
      'Time-tracking e produtividade por funcionário',
      'Aprovação de criativos online pelo cliente',
      'Módulo financeiro com conciliação automática',
      'Pipeline de vendas (CRM) integrado',
      'Geração de relatórios de tráfego e metas'
    ],
    techStack: ['Vue.js', 'Laravel', 'MySQL', 'TailwindCSS', 'Docker'],
    gradient: 'from-amber-500/20 via-orange-600/30 to-brand-black',
    iconName: 'Briefcase'
  },
  {
    id: 'odonto-pro',
    name: 'Odonto PRO',
    category: 'CRM',
    shortDescription: 'CRM especializado com odontograma interativo e histórico do paciente.',
    longDescription: 'Um sistema moderno de gestão de consultórios odontológicos. Possui odontograma digital 3D interativo onde o profissional marca os procedimentos na tela, acompanhamento ortodôntico por fotos, controle de estoque de insumos clínicos e fluxos de e-mail/WhatsApp para retorno periódico pós-tratamento.',
    price: 299,
    rating: 4.85,
    salesCount: 512,
    badge: null,
    features: [
      'Odontograma interativo gráfico',
      'Gestão de orçamentos e parcelamentos',
      'Envio automático de lembretes e pós-operatórios',
      'Armazenamento seguro de exames radiográficos',
      'Controle de laboratórios parceiros'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS S3'],
    gradient: 'from-sky-500/20 via-indigo-600/30 to-brand-black',
    iconName: 'Smile'
  },
  {
    id: 'fusion-ai',
    name: 'Fusion AI Chatbot',
    category: 'IA',
    shortDescription: 'Agente inteligente treinado com seus dados para suporte e vendas 24/7.',
    longDescription: 'Alimente o Fusion AI com o PDF da sua empresa, site ou manuais e tenha um agente inteligente super-treinado respondendo dúvidas, qualificando leads e fechando vendas de forma humana. Integrável com WhatsApp, Telegram, Direct do Instagram e widget para sites corporativos.',
    price: 397,
    rating: 4.92,
    salesCount: 887,
    badge: 'IA',
    features: [
      'Treinamento simples por upload de arquivos',
      'Transição fluida de IA para humano',
      'Integração multicanal oficial e não-oficial',
      'Integrações com CRMs externos via API',
      'Estatísticas detalhadas de sentimento de chat'
    ],
    techStack: ['React', 'Next.js', 'Python', 'FastAPI', 'LangChain', 'Pinecone'],
    gradient: 'from-purple-600/25 via-indigo-600/30 to-brand-black',
    iconName: 'Cpu'
  },
  {
    id: 'local-leads-pro',
    name: 'Local Leads PRO',
    category: 'Automação',
    shortDescription: 'Extrator automático de leads locais com informações completas do Google Maps.',
    longDescription: 'Encontre milhares de clientes B2B em segundos. Basta escolher a categoria e a cidade, e o Local Leads PRO fará uma varredura completa extraindo nome comercial, telefone, WhatsApp direto, e-mail público, site, redes sociais e notas de avaliação. O gerador de listas ideal para agências e vendedores.',
    price: 147,
    rating: 4.7,
    salesCount: 1650,
    badge: 'MAIS VENDIDO',
    features: [
      'Busca ilimitada de empresas por palavra-chave',
      'Extração de contatos (e-mail, telefone, redes)',
      'Exportação fácil para CSV / Excel',
      'Verificador de WhatsApp ativo automático',
      'Sistema anti-bloqueio integrado'
    ],
    techStack: ['Electron', 'React', 'Puppeteer', 'TypeScript', 'Node.js'],
    gradient: 'from-yellow-600/20 via-amber-600/30 to-brand-black',
    iconName: 'Search'
  },
  {
    id: 'maquina-pro',
    name: 'Máquina PRO Vendas',
    category: 'Automação',
    shortDescription: 'Módulo de prospecção fria automatizada multicanal (LinkedIn, E-mail e Zap).',
    longDescription: 'Estruture uma máquina automática de prospecção ativa. Crie cadências de contato alternando disparos de e-mails profissionais com validação de caixa postal, visitas e conexões no LinkedIn, além de mensagens de aproximação no WhatsApp de forma 100% autônoma e segura.',
    price: 247,
    rating: 4.8,
    salesCount: 940,
    badge: 'HOT',
    features: [
      'Fluxo de cadência visual sequencial',
      'Automação de ações de conta no LinkedIn',
      'Spam filter prevention para e-mails',
      'Integração com Hubspot e ActiveCampaign',
      'Painel de conversões e respostas'
    ],
    techStack: ['Node.js', 'React', 'PostgreSQL', 'TailwindCSS', 'RabbitMQ'],
    gradient: 'from-orange-600/25 via-red-700/30 to-brand-black',
    iconName: 'Zap'
  },
  {
    id: 'finance-pro',
    name: 'Finance PRO Dashboard',
    category: 'Financeiro',
    shortDescription: 'Plataforma para gestão financeira empresarial com DRE, fluxo de caixa e conciliação.',
    longDescription: 'Monitore a saúde financeira do seu negócio em tempo real. O Finance PRO automatiza a importação de extratos bancários (OFX), gera DRE automática, gráficos detalhados de fluxo de caixa projetado, conciliação inteligente de boletos e faturas geradas pelos gateways de pagamento.',
    price: 289,
    rating: 4.9,
    salesCount: 730,
    badge: 'NOVO',
    features: [
      'Importação automática de arquivos OFX',
      'Relatórios contábeis DRE e Balanço customizados',
      'Controle de contas a pagar e receber com alertas',
      'Integração com bancos via Open Finance',
      'Exportação simplificada para o contador'
    ],
    techStack: ['Next.js', 'Python', 'PostgreSQL', 'TailwindCSS', 'Chart.js'],
    gradient: 'from-emerald-500/20 via-teal-600/30 to-brand-black',
    iconName: 'TrendingUp'
  },
  {
    id: 'dashboard-pro',
    name: 'Dashboard Admin PRO',
    category: 'Dashboard',
    shortDescription: 'Template administrativo Next.js / React ultra moderno com componentes prontos.',
    longDescription: 'Poupe centenas de horas de desenvolvimento com a estrutura definitiva de dashboard. Contém mais de 100 componentes modulares desenvolvidos em React + TypeScript + TailwindCSS, incluindo charts interativos, tabelas de dados inteligentes, autenticação pré-configurada, Dark/Light mode nativos e animações com Framer Motion.',
    price: 97,
    rating: 4.88,
    salesCount: 1890,
    badge: 'MAIS VENDIDO',
    features: [
      '100+ componentes de UI personalizáveis',
      'Dark Mode e Light Mode nativos e configurados',
      'Integração fácil com NextAuth e JWT',
      'Design baseado no Figma oficial incluso',
      'Atualizações vitalícias sem custos'
    ],
    techStack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Recharts'],
    gradient: 'from-violet-600/20 via-purple-600/30 to-brand-black',
    iconName: 'Layout'
  },
  {
    id: 'crm-pro',
    name: 'CRM PRO Pipeline',
    category: 'CRM',
    shortDescription: 'Gestão visual de oportunidades, metas comerciais e histórico de clientes.',
    longDescription: 'Coloque ordem na sua equipe comercial. O CRM PRO Pipeline oferece controle visual de negociações através do estilo Kanban (Drag & Drop), metas de vendas por vendedor, registro histórico detalhado de todas as interações (chamadas, e-mails, reuniões) e relatórios automáticos de conversão de funil.',
    price: 199,
    rating: 4.78,
    salesCount: 840,
    badge: null,
    features: [
      'Múltiplos funis de vendas ilimitados',
      'Integração automática com formulários web',
      'Histórico unificado com linha do tempo',
      'Notificações em tempo real no Telegram/Slack',
      'Previsão de vendas automatizada'
    ],
    techStack: ['React', 'NestJS', 'PostgreSQL', 'TypeScript', 'Redis'],
    gradient: 'from-indigo-600/25 via-blue-700/30 to-brand-black',
    iconName: 'UserCheck'
  },
  {
    id: 'ultra-zap',
    name: 'Ultra Zap Automações',
    category: 'WhatsApp',
    shortDescription: 'Ferramenta avançada para envios em lote e rotas de aquecimento de chips.',
    longDescription: 'Reduza drasticamente o risco de bloqueio ao prospectar no WhatsApp. O Ultra Zap possui uma inteligência artificial que realiza conversas internas simuladas para aquecer novos números, rotação dinâmica de chips de disparo, atraso variável inteligente (delay) e importação inteligente de contatos sem perda de tags.',
    price: 159,
    rating: 4.82,
    salesCount: 1045,
    badge: 'HOT',
    features: [
      'Aquecedor de chips automático integrado',
      'Rotação inteligente de múltiplos remetentes',
      'Relatórios e métricas de entregabilidade',
      'Validador de listas de números ativos',
      'Envio de mídias de forma nativa'
    ],
    techStack: ['Node.js', 'Express', 'React', 'Puppeteer', 'TailwindCSS'],
    gradient: 'from-green-600/20 via-teal-600/30 to-brand-black',
    iconName: 'Zap'
  },
  {
    id: 'saas-delivery',
    name: 'SaaS Delivery Multi-Tenant',
    category: 'SaaS',
    shortDescription: 'Plataforma completa para você vender assinaturas de cardápio digital whitelabel.',
    longDescription: 'Monte seu próprio negócio bilionário de delivery. O SaaS Delivery Multi-Tenant é um código-fonte pronto e customizável para você lançar seu próprio sistema de criação de cardápios e cobrar assinaturas mensais de restaurantes da sua região. Contém controle de planos, faturamento Stripe/Asaas automático e painel admin geral.',
    price: 799,
    rating: 4.94,
    salesCount: 310,
    badge: 'MAIS VENDIDO',
    features: [
      'Subdomínios automáticos para cada lojista',
      'Gateway de assinatura recorrente nativo',
      'Configuração fácil de logo e marca (White Label)',
      'Painel geral do administrador de alta performance',
      'Banco de dados multi-tenant isolado'
    ],
    techStack: ['Laravel', 'Vue.js', 'MySQL', 'Inertia.js', 'Stripe API'],
    gradient: 'from-red-600/20 via-orange-600/30 to-brand-black',
    iconName: 'Grid'
  },
  {
    id: 'auto-lead-ia',
    name: 'Auto Lead IA',
    category: 'IA',
    shortDescription: 'Agente autônomo que escreve e-mails de vendas hiper-personalizados baseados no site da empresa.',
    longDescription: 'Esqueça os e-mails frios genéricos. O Auto Lead IA analisa o site de um lead em tempo real, extrai a proposta de valor deles, redige um e-mail de abordagem único mostrando como o seu sistema se encaixa no negócio do lead e realiza o envio automático. Vendas B2B em piloto automático.',
    price: 297,
    rating: 4.9,
    salesCount: 520,
    badge: 'IA',
    features: [
      'Escaneador inteligente de URL do lead',
      'Escrita de e-mails hiper-personalizados com IA',
      'Sistema de testes A/B integrados',
      'Rastreamento de aberturas e cliques',
      'Cadência automática com gatilhos de atraso'
    ],
    techStack: ['Python', 'Django', 'React', 'OpenAI GPT-4', 'PostgreSQL'],
    gradient: 'from-pink-600/20 via-purple-700/30 to-brand-black',
    iconName: 'Mail'
  },
  {
    id: 'zapbot-web',
    name: 'ZapBot Builder Web',
    category: 'WhatsApp',
    shortDescription: 'Painel visual de arrastar e soltar para criar fluxos de conversa automáticos.',
    longDescription: 'Um editor de fluxo do tipo no-code idêntico ao Typebot, mas focado especificamente em construir sequências interativas e eficientes de mensagens para o WhatsApp. Integre com APIs de rastreio de correios, IA do OpenAI, planilhas do Google Sheets e webhooks em minutos.',
    price: 189,
    rating: 4.87,
    salesCount: 780,
    badge: 'NOVO',
    features: [
      'Editor visual no-code arrastar e soltar',
      'Integração simples com Google Sheets',
      'Integração nativa com ChatGPT API',
      'Envio de áudio simulando gravação em tempo real',
      'Controle e estatísticas de engajamento do funil'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    gradient: 'from-green-500/20 via-emerald-600/30 to-brand-black',
    iconName: 'GitFork'
  },
  {
    id: 'mindmap-ai',
    name: 'MindMap AI',
    category: 'IA',
    shortDescription: 'Criação instantânea de mapas mentais e organogramas a partir de prompts simples.',
    longDescription: 'Organize suas ideias ou crie planos de estudo com velocidade recorde. Insira um tópico ou cole um texto longo e o MindMap AI criará um mapa mental expansível, visualmente impecável e focado na facilidade de aprendizado. Ideal para infoprodutores, estudantes e profissionais de estratégia.',
    price: 129,
    rating: 4.76,
    salesCount: 450,
    badge: 'IA',
    features: [
      'Geração inteligente a partir de prompts ou PDFs',
      'Editor manual de nós interativo e colorido',
      'Exportação para PDF, PNG, SVG e markdown',
      'Colaboração em equipe em tempo real',
      'Módulo de apresentação nativo'
    ],
    techStack: ['React', 'TypeScript', 'ReactFlow', 'Python', 'TailwindCSS'],
    gradient: 'from-fuchsia-600/20 via-purple-700/30 to-brand-black',
    iconName: 'Network'
  },
  {
    id: 'taskflow-saas',
    name: 'TaskFlow Planner',
    category: 'SaaS',
    shortDescription: 'Gestão visual de projetos com faturamento dinâmico por hora trabalhada.',
    longDescription: 'Gerencie projetos complexos com mais clareza. O TaskFlow une a organização de boards ágeis com o rastreamento financeiro de horas de desenvolvimento, gerando notas de cobrança automatizadas para o cliente final e controle de rentabilidade por projeto e desenvolvedor.',
    price: 349,
    rating: 4.8,
    salesCount: 395,
    badge: null,
    features: [
      'Visualização Kanban, Lista e Gantt interativos',
      'Time-tracker com extensão desktop inclusa',
      'Geração automática de invoices de horas extras',
      'Portal exclusivo para clientes externos acompanharem',
      'Integração com Slack e GitHub'
    ],
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    gradient: 'from-indigo-600/20 via-blue-700/30 to-brand-black',
    iconName: 'Clock'
  },
  {
    id: 'invoicer-pro',
    name: 'Invoicer Automações',
    category: 'Financeiro',
    shortDescription: 'Emissão automática de notas fiscais de serviço e recibos de vendas integrados.',
    longDescription: 'Acabe com o trabalho manual de emitir notas para seus alunos de cursos ou clientes de SaaS. O Invoicer integra com gateways de pagamento (Hotmart, Stripe, Kiwify, Asaas) e emite a Nota Fiscal de Serviço (NFS-e) diretamente na prefeitura da cidade do cliente de forma imediata.',
    price: 249,
    rating: 4.72,
    salesCount: 489,
    badge: null,
    features: [
      'Integração direta com 1200+ prefeituras brasileiras',
      'Suporte para emissão agendada ou no checkout',
      'Envio automático do PDF da nota por e-mail',
      'Dashboards fiscais com tributação mensal simulada',
      'Configuração simplificada Whitelabel'
    ],
    techStack: ['Node.js', 'Express', 'React', 'MongoDB', 'AWS Lambda'],
    gradient: 'from-emerald-600/20 via-green-600/30 to-brand-black',
    iconName: 'FileText'
  },
  {
    id: 'real-estate-saas',
    name: 'Imobiliária PRO SaaS',
    category: 'SaaS',
    shortDescription: 'Sistema completo whitelabel para gestão de imóveis, corretores e propostas.',
    longDescription: 'Uma plataforma definitiva para imobiliárias e corretores independentes. Inclui catálogo online integrado, ferramenta de cadastro rápido de imóveis por fotos tiradas diretamente do celular, controle de visitas físicas com assinatura de presença digital e canal direto para envio de propostas comerciais.',
    price: 449,
    rating: 4.83,
    salesCount: 280,
    badge: 'HOT',
    features: [
      'Catálogo interativo com filtros geográficos avançados',
      'Gestão de comissões por corretores parceiros',
      'Ficha de visitas em formato digital legal',
      'Integração rápida para portais como Zap Imóveis',
      'Painel intuitivo de propostas e contratos'
    ],
    techStack: ['React', 'Laravel', 'MySQL', 'TailwindCSS', 'Google Maps API'],
    gradient: 'from-blue-600/20 via-cyan-600/30 to-brand-black',
    iconName: 'Home'
  },
  {
    id: 'academify',
    name: 'Academify LMS',
    category: 'Landing Pages',
    shortDescription: 'Plataforma moderna de infoprodutos com área de membros estilo Netflix.',
    longDescription: 'Ofereça uma experiência premium e viciante para seus alunos. A Academify é uma área de membros de alto padrão visual, permitindo carregar vídeo-aulas com proteção contra pirataria, trilha de aprendizado gameficada com badges e emissão automatizada de certificados digitais.',
    price: 299,
    rating: 4.96,
    salesCount: 620,
    badge: 'MAIS VENDIDO',
    features: [
      'Layout premium no estilo streaming (Netflix style)',
      'Player de vídeo nativo criptografado anti-pirataria',
      'Sistema completo de gamificação e conquistas',
      'Módulo de fórum integrado por aula',
      'Emissão automática de certificados modernos'
    ],
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Mux Video'],
    gradient: 'from-violet-600/20 via-purple-700/30 to-brand-black',
    iconName: 'PlayCircle'
  },
  {
    id: 'leadhunter',
    name: 'LeadHunter Agent',
    category: 'Automação',
    shortDescription: 'Robô inteligente que mapeia e-mails e contatos comerciais via redes sociais.',
    longDescription: 'Identifique tomadores de decisão em empresas corporativas de forma rápida. O LeadHunter realiza varreduras filtradas em perfis corporativos do LinkedIn, Twitter e Instagram buscando os cargos-chave e cruzando com emails de negócios validados para otimizar campanhas frias de prospecção.',
    price: 179,
    rating: 4.68,
    salesCount: 899,
    badge: null,
    features: [
      'Filtro dinâmico por cargos e localizações',
      'Sistema avançado de validação de e-mails (bounce rate <1%)',
      'Integração direta com o Máquina PRO e CRM PRO',
      'Configuração fácil de rotinas de coleta',
      'Relatórios com estatísticas de mercado'
    ],
    techStack: ['Node.js', 'Python', 'React', 'MongoDB', 'Puppeteer'],
    gradient: 'from-amber-600/20 via-orange-600/30 to-brand-black',
    iconName: 'UserPlus'
  },
  {
    id: 'botpress-pro',
    name: 'BotPress Pro IA',
    category: 'IA',
    shortDescription: 'Construtor de agentes virtuais inteligentes integrados ao ChatGPT e Claude API.',
    longDescription: 'Construa chatbots ultra inteligentes capazes de raciocinar e agir. Ideal para integrar em canais oficiais de grandes marcas, permitindo que a IA consulte APIs em tempo real (como verificar rastreio ou estoque de loja) e tome decisões guiadas por regras operacionais estritas.',
    price: 379,
    rating: 4.9,
    salesCount: 460,
    badge: 'IA',
    features: [
      'Execução de funções API nativas no chatbot',
      'Treinamento híbrido usando IA e regras base',
      'Logs avançados de chamadas e consumo de tokens',
      'Configuração simplificada multi-idiomas',
      'Templates de fluxos de checkout automático'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'LangChain', 'OpenAI / Claude API'],
    gradient: 'from-purple-600/25 via-pink-700/30 to-brand-black',
    iconName: 'MessageCircle'
  },
  {
    id: 'webscraper-ai',
    name: 'WebScraper AI Extrações',
    category: 'Automação',
    shortDescription: 'Extrator de dados da web visual no-code impulsionado por IA para contornar Captchas.',
    longDescription: 'Colete dados estruturados de qualquer e-commerce ou portal de notícias sem precisar programar. A IA do WebScraper analisa a página, entende quais dados são relevantes (ex: preços, títulos, avaliações) e cria a rotina de coleta contornando captchas e bloqueios de IP de forma autônoma.',
    price: 197,
    rating: 4.81,
    salesCount: 670,
    badge: 'NOVO',
    features: [
      'Reconhecimento inteligente de tabelas de dados',
      'Proxy rotativo residencial incluso por padrão',
      'Resolução automática de captchas difíceis',
      'Exportador para planilhas e banco de dados via API',
      'Agendador de extrações automáticas recorrentes'
    ],
    techStack: ['React', 'TypeScript', 'Python', 'Scrapy', 'Selenium', 'AWS'],
    gradient: 'from-yellow-600/20 via-amber-700/30 to-brand-black',
    iconName: 'Database'
  },
  {
    id: 'support-desk',
    name: 'Support Desk Whitelabel',
    category: 'CRM',
    shortDescription: 'Sistema completo para gestão de chamados com base de conhecimento integrada.',
    longDescription: 'Melhore o atendimento ao cliente e reduza chamados repetitivos. O Support Desk une um painel ágil para atendentes de tickets com uma base de conhecimento corporativa inteligente e auto-explicativa, reduzindo o tempo de resolução e o esforço do time de suporte.',
    price: 299,
    rating: 4.76,
    salesCount: 390,
    badge: null,
    features: [
      'Gestão de tickets por prioridade e categorias',
      'Base de conhecimento pesquisável estilo Google',
      'Módulo de chat em tempo real personalizável',
      'Pesquisa de satisfação NPS integrada pós-atendimento',
      'Configuração de domínios personalizados para lojistas'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    gradient: 'from-blue-600/20 via-indigo-600/30 to-brand-black',
    iconName: 'HelpCircle'
  },
  {
    id: 'easy-billing',
    name: 'Easy Billing Assinaturas',
    category: 'Financeiro',
    shortDescription: 'Gerenciador de cobranças recorrentes, assinaturas e recuperação por WhatsApp.',
    longDescription: 'Aumente o faturamento recorrente do seu negócio reduzindo a inadimplência. O Easy Billing conecta-se às suas contas de pagamento e gerencia o envio de faturas recorrentes, lembretes de expiração de cartão e executa fluxos de cobrança e recuperação de vendas via WhatsApp e e-mail.',
    price: 269,
    rating: 4.85,
    salesCount: 512,
    badge: 'HOT',
    features: [
      'Geração de faturas e links de pagamento simples',
      'Lembretes de cobrança automáticos por WhatsApp',
      'Gestão de re-tentativa de cobrança inteligente',
      'Suporte para múltiplos planos e cupons de desconto',
      'Relatório detalhado de MRR e Churn Rate'
    ],
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe & Asaas APIs', 'TailwindCSS'],
    gradient: 'from-emerald-500/20 via-green-600/30 to-brand-black',
    iconName: 'CreditCard'
  },
  {
    id: 'smart-analytics',
    name: 'Smart Analytics Pro',
    category: 'Dashboard',
    shortDescription: 'Estatísticas e análise de tráfego de sites focada em privacidade, alternativa ao GA4.',
    longDescription: 'Uma ferramenta leve e elegante para analisar o tráfego dos seus sites. Sem cookies invasivos de rastreamento, o Smart Analytics exibe visitas, taxas de conversão de funis, origens de referência e cliques de forma simples, direta e em um dashboard ultra moderno com tempos de carregamento instantâneos.',
    price: 149,
    rating: 4.91,
    salesCount: 710,
    badge: 'NOVO',
    features: [
      'Script de monitoramento ultra leve (<2kb)',
      'Sem conformidade chata de cookies (100% GDPR)',
      'Acompanhamento de conversão de metas em tempo real',
      'Mapas de calor de cliques de usuários na página',
      'Relatórios automáticos enviados por e-mail/Telegram'
    ],
    techStack: ['React', 'ClickHouse', 'Node.js', 'TypeScript', 'TailwindCSS'],
    gradient: 'from-violet-600/20 via-pink-700/30 to-brand-black',
    iconName: 'BarChart'
  },
  {
    id: 'social-planner',
    name: 'Social Planner AI',
    category: 'Agência',
    shortDescription: 'Agendador de publicações integrado a um redator de posts de IA automatizado.',
    longDescription: 'Mantenha suas redes sociais movimentadas sem esforço diário. O Social Planner AI gera posts completos (imagem conceitual, texto de legenda e hashtags corretas) e agenda as publicações de forma direta e nativa no Instagram, LinkedIn, Facebook e TikTok a partir de comandos simples.',
    price: 199,
    rating: 4.74,
    salesCount: 580,
    badge: 'IA',
    features: [
      'Geração inteligente de textos e imagens conceituais',
      'Calendário visual de publicações no modelo arrastar e soltar',
      'Aprovação prévia de publicações simplificada',
      'Relatório unificado de alcance e engajamento',
      'Suporte para múltiplos perfis corporativos'
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'OpenAI & Midjourney APIs', 'TailwindCSS'],
    gradient: 'from-amber-600/20 via-orange-600/30 to-brand-black',
    iconName: 'Calendar'
  },
  {
    id: 'ecom-engine',
    name: 'E-com Engine Whitelabel',
    category: 'E-commerce',
    shortDescription: 'Código-fonte pronto para loja virtual premium com checkout integrado de um clique.',
    longDescription: 'Monte uma loja virtual premium em minutos. O E-com Engine é um boilerplate completo contendo sistema de catálogo com variações de atributos de produtos, carrinho de compras moderno, checkout de página única focado em alta conversão com pagamento Pix e cálculo automático de frete.',
    price: 349,
    rating: 4.88,
    salesCount: 460,
    badge: null,
    features: [
      'Checkout de uma página ultra otimizado',
      'Suporte para variações complexas de produtos',
      'Cálculo de frete em tempo real (Correios/Melhor Envio)',
      'Integração simples com Pixel do Facebook e TikTok',
      'Painel de cupons de descontos e promoções em lote'
    ],
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Prisma'],
    gradient: 'from-blue-600/20 via-indigo-700/30 to-brand-black',
    iconName: 'ShoppingBag'
  },
  {
    id: 'landing-convert',
    name: 'Landing Pack Neon',
    category: 'Landing Pages',
    shortDescription: 'Pacote com 10 templates de Landing Pages de alta conversão no estilo dark mode premium.',
    longDescription: 'Uma coleção de templates HTML/React prontos e editáveis feitos com o design system mais moderno do mercado. Inclui seções otimizadas para venda de infoprodutos, agências de marketing, SaaS, ferramentas locais e serviços premium. Layout responsivo com efeitos de glow e glassmorphism nativos.',
    price: 89,
    rating: 4.93,
    salesCount: 1490,
    badge: 'MAIS VENDIDO',
    features: [
      '10 designs exclusivos focados em nichos de alta renda',
      'Desenvolvido com código limpo em React e TailwindCSS',
      'Estruturas prontas de formulário com validação inclusa',
      'Animações suaves e responsividade nativa completa',
      'Arquivos originais do Figma para ajustes inclusos'
    ],
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
    gradient: 'from-orange-600/25 via-brand-neonOrange/30 to-brand-black',
    iconName: 'FileCode'
  },
  {
    id: 'cyber-auth',
    name: 'Cyber Auth Boilerplate',
    category: 'Landing Pages',
    shortDescription: 'Módulo de autenticação segura e registro com 2FA e login social integrado.',
    longDescription: 'Não perca tempo configurando sistemas de login. O Cyber Auth oferece um módulo pronto de autenticação de usuários contendo recuperação de senha, login social (Google, GitHub, Facebook), confirmação por e-mail, autenticação de dois fatores (2FA) e telas prontas no estilo premium cyberpunk.',
    price: 79,
    rating: 4.79,
    salesCount: 920,
    badge: 'NOVO',
    features: [
      'Integração rápida com NextAuth, Firebase ou JWT',
      'Telas de registro e login com design premium inclusas',
      'Autenticação multifator (2FA) nativa configurada',
      'Configuração simplificada de envio de e-mails transacionais',
      'Módulo de controle de acessos por papéis (RBAC)'
    ],
    techStack: ['React', 'TypeScript', 'NextAuth', 'TailwindCSS', 'Prisma'],
    gradient: 'from-cyan-600/20 via-blue-700/30 to-brand-black',
    iconName: 'ShieldAlert'
  },
  {
    id: 'multitenant-base',
    name: 'Next SaaS Boilerplate',
    category: 'SaaS',
    shortDescription: 'Estrutura base multi-tenant para novos projetos SaaS com planos e Stripe integrados.',
    longDescription: 'Acelere o lançamento do seu produto. Esse boilerplate vem com toda a infraestrutura base configurada: banco de dados isolado por cliente, painel do administrador, faturamento mensal/anual via Stripe Billing, telas de perfil de usuário e configuração de domínios personalizados. Prontinho para colocar sua regra de negócio e vender.',
    price: 497,
    rating: 4.97,
    salesCount: 380,
    badge: 'HOT',
    features: [
      'Isolamento completo de banco de dados (Multitenancy)',
      'Integração completa com Stripe Billing (Checkout/Assinaturas)',
      'Design do painel principal responsivo e moderno',
      'Autenticação segura JWT com sessões persistentes',
      'Infraestrutura para domínios próprios de lojistas'
    ],
    techStack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Prisma', 'Stripe', 'Docker'],
    gradient: 'from-violet-600/25 via-indigo-700/30 to-brand-black',
    iconName: 'Box'
  },
  {
    id: 'seo-boost-ia',
    name: 'SEO Boost IA Escritor',
    category: 'IA',
    shortDescription: 'Ferramenta de criação de artigos de blog otimizados e prontos para ranquear no Google.',
    longDescription: 'Escreva conteúdos que geram cliques reais no buscador. O SEO Boost IA analisa as principais palavras-chave dos concorrentes que estão no topo do Google, extrai a estrutura ideal do post e redige um texto de alto valor informativo, otimizando tags H1, H2, alt de imagens e links automáticos.',
    price: 199,
    rating: 4.84,
    salesCount: 615,
    badge: 'IA',
    features: [
      'Pesquisa de palavras-chave integrada via APIs SEO',
      'Escrita assistida por Inteligência Artificial avançada',
      'Verificador de legibilidade e densidade de palavras-chave',
      'Integração direta com o WordPress e Webflow',
      'Monitor automático de posições no ranking de pesquisas'
    ],
    techStack: ['React', 'Python', 'PostgreSQL', 'OpenAI API', 'TailwindCSS'],
    gradient: 'from-purple-600/20 via-pink-600/30 to-brand-black',
    iconName: 'PenTool'
  },
  {
    id: 'stock-manager',
    name: 'Stock Manager ERP',
    category: 'E-commerce',
    shortDescription: 'ERP para controle de estoque físico e digital com alertas de reposição inteligente.',
    longDescription: 'Mantenha seu inventário em perfeito alinhamento. O Stock Manager conecta-se aos seus canais de vendas (E-commerce e PDV físico), monitora as vendas de itens e emite notificações automáticas quando o estoque atinge o nível mínimo de segurança, além de calcular previsões de compras.',
    price: 229,
    rating: 4.7,
    salesCount: 412,
    badge: null,
    features: [
      'Integração multi-lojas e controle centralizado',
      'Painel de previsão inteligente de compras por histórico',
      'Geração e leitura fácil de etiquetas com código de barras',
      'Relatórios e gráficos de giro de estoque por produto',
      'Módulo de devoluções e trocas de mercadoria'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Express'],
    gradient: 'from-blue-600/20 via-cyan-600/30 to-brand-black',
    iconName: 'Package'
  },
  {
    id: 'voiceagent-ai',
    name: 'VoiceAgent AI Chamadas',
    category: 'IA',
    shortDescription: 'Agente de voz inteligente por telefone para qualificação de leads e suporte básico.',
    longDescription: 'Automatize suas ligações de qualificação comercial de forma impressionante. O VoiceAgent AI realiza chamadas ativas por telefone conversando com leads de forma humana, coletando dados de interesse, agendando reuniões diretamente na agenda do vendedor e salvando logs de conversa estruturados no CRM.',
    price: 497,
    rating: 4.93,
    salesCount: 290,
    badge: 'IA',
    features: [
      'Síntese de voz hiper-realista com baixa latência',
      'Integração de agenda via Google Calendar',
      'Transcrição instantânea e gravação de chamadas',
      'Criação de roteiros interativos estruturados por árvore',
      'Conexão com plataformas Twilio e Vonage'
    ],
    techStack: ['Node.js', 'Python', 'Twilio API', 'Vapi / ElevenLabs', 'MongoDB'],
    gradient: 'from-fuchsia-600/20 via-purple-700/30 to-brand-black',
    iconName: 'PhoneCall'
  },
  {
    id: 'email-blast',
    name: 'Email Blast Marketing',
    category: 'Automação',
    shortDescription: 'Envio em massa de e-mail marketing com alta entregabilidade via SMTP próprio.',
    longDescription: 'Crie campanhas de e-mail marketing sem pagar fortunas por volume de envios. O Email Blast permite configurar seus próprios servidores SMTP (Amazon SES, SendGrid, Mailgun), gerencia listas de contatos com higienização automática e cria layouts de e-mails em um editor interativo de arrastar e soltar.',
    price: 139,
    rating: 4.78,
    salesCount: 805,
    badge: 'NOVO',
    features: [
      'Editor visual de e-mails responsivos (Mosaico)',
      'Higienizador automático de listas (remove e-mails falsos)',
      'Conexão ilimitada com múltiplos provedores SMTP',
      'Módulo avançado de automação por cliques/aberturas',
      'Formulários e popups de captura inclusos'
    ],
    techStack: ['React', 'Go', 'PostgreSQL', 'TailwindCSS', 'Redis'],
    gradient: 'from-orange-600/20 via-red-600/30 to-brand-black',
    iconName: 'Send'
  },
  {
    id: 'legal-docs',
    name: 'LegalDocs Assinaturas',
    category: 'Financeiro',
    shortDescription: 'Plataforma completa para assinatura digital e gestão de documentos jurídicos.',
    longDescription: 'Assine contratos e propostas com validade jurídica completa. O LegalDocs permite enviar documentos para assinatura por múltiplos destinatários por e-mail ou WhatsApp, gerando o relatório completo de logs de IP, data e hora com chave de assinatura criptografada e armazenamento em nuvem seguro.',
    price: 199,
    rating: 4.82,
    salesCount: 540,
    badge: null,
    features: [
      'Assinatura eletrônica e digital com validade legal',
      'Envio fácil de links de assinatura via WhatsApp/E-mail',
      'Criação de templates reutilizáveis de contratos',
      'Armazenamento criptografado na AWS com backup redundante',
      'Notificações de pendências automáticas'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Criptografia SHA-256'],
    gradient: 'from-emerald-500/20 via-teal-600/30 to-brand-black',
    iconName: 'CheckSquare'
  },
  {
    id: 'fitness-saas',
    name: 'Fitness PRO Manager',
    category: 'SaaS',
    shortDescription: 'Sistema completo para academias, estúdios de pilates e personal trainers.',
    longDescription: 'Gerencie treinos, avaliações físicas e mensalidades em um só lugar. O Fitness PRO inclui aplicativo web do aluno para visualizar treinos com vídeos explicativos dos exercícios, controle de catracas e presença física, cobrança recorrente de planos e agendamento de aulas experimentais de forma simples.',
    price: 297,
    rating: 4.75,
    salesCount: 330,
    badge: null,
    features: [
      'Montador visual de fichas de treino com biblioteca',
      'Aplicativo web responsivo otimizado para o aluno',
      'Gestão de mensalidades com faturamento Pix automático',
      'Módulo de avaliação física (anamnese, composição)',
      'Painel de controle financeiro do estúdio'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'MySQL', 'TailwindCSS'],
    gradient: 'from-blue-600/20 via-indigo-700/30 to-brand-black',
    iconName: 'Heart'
  },
  {
    id: 'cloud-backup',
    name: 'Cloud Backup Agent',
    category: 'Automação',
    shortDescription: 'Módulo automático para backups incrementais de bancos de dados e arquivos.',
    longDescription: 'Garanta a segurança dos dados do seu negócio sem esforço. O Cloud Backup instala-se no seu servidor Linux/Windows e realiza rotinas programadas de backup de arquivos e bancos de dados (Postgres, MySQL, Mongo), enviando os dados criptografados diretamente para o Google Drive, Dropbox ou AWS S3.',
    price: 119,
    rating: 4.86,
    salesCount: 680,
    badge: 'NOVO',
    features: [
      'Backups incrementais e diferenciais automáticos',
      'Criptografia de arquivos ponta a ponta antes do envio',
      'Suporte para as principais nuvens do mercado',
      'Alertas de falha ou sucesso no Telegram e e-mail',
      'Interface simples de restauração em um clique'
    ],
    techStack: ['Node.js', 'Go', 'SQLite', 'Criptografia AES-256', 'Shell Script'],
    gradient: 'from-amber-600/20 via-orange-600/30 to-brand-black',
    iconName: 'CloudLightning'
  },
  {
    id: 'dev-boilerplate',
    name: 'Dev Boilerplate Express',
    category: 'Dashboard',
    shortDescription: 'Template inicial React + Node.js estruturado com infraestrutura e deploy configurados.',
    longDescription: 'Pule a configuração chata de infraestrutura para novas aplicações. Este boilerplate vem com a arquitetura limpa (Clean Architecture) implementada em Node.js e React, incluindo Docker de desenvolvimento, fluxos CI/CD para GitHub Actions, testes unitários configurados e deploy em um clique no Render/Vercel.',
    price: 147,
    rating: 4.9,
    salesCount: 890,
    badge: 'MAIS VENDIDO',
    features: [
      'Arquitetura Limpa (Clean Architecture) estruturada',
      'Docker Compose e ambiente local pronto',
      'Pipeline de deploy configurado para GitHub Actions',
      'Suíte de testes configurada com Vitest/Jest',
      'Módulo básico de autenticação e logs embutido'
    ],
    techStack: ['React', 'Node.js', 'TypeScript', 'Vitest', 'Docker', 'GitHub Actions'],
    gradient: 'from-violet-600/20 via-indigo-600/30 to-brand-black',
    iconName: 'Code'
  },
  {
    id: 'chatbot-multicanal',
    name: 'Multicanal Chatbot SaaS',
    category: 'WhatsApp',
    shortDescription: 'Atendimento integrado conectando WhatsApp, direct do Instagram, Telegram e chat web.',
    longDescription: 'Centralize todos os canais de comunicação com o cliente em uma única tela. Este SaaS Whitelabel permite integrar caixas de entrada do WhatsApp, mensagens diretas do Instagram Business, Telegram e o chat do seu site em uma única fila de atendimento organizada, com respostas rápidas e transferências de setor.',
    price: 399,
    rating: 4.88,
    salesCount: 420,
    badge: 'HOT',
    features: [
      'Centralização de WhatsApp, Instagram, Telegram e Chat Web',
      'Módulo de chatbot interno por setor de atendimento',
      'Acompanhamento de métricas de tempo de resposta da equipe',
      'Faturamento recorrente Whitelabel integrado para revendedores',
      'API aberta para conexões com outros sistemas'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Redis', 'Socket.io', 'MySQL'],
    gradient: 'from-green-600/20 via-emerald-600/30 to-brand-black',
    iconName: 'Share2'
  }
];
