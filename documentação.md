# 📘 Documentação Completa — Loja NexusSaaS

> **Versão:** 1.0.0  
> **Última atualização:** 21 de Maio de 2026  
> **Stack:** React 19 · TypeScript · Vite · TailwindCSS · Supabase · Framer Motion

---

## 📑 Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura e Estrutura de Pastas](#2-arquitetura-e-estrutura-de-pastas)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Instalação e Configuração](#4-instalação-e-configuração)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Banco de Dados (Supabase)](#6-banco-de-dados-supabase)
7. [Autenticação e Autorização](#7-autenticação-e-autorização)
8. [Vitrine Pública (Front-end)](#8-vitrine-pública-front-end)
9. [Painel Administrativo](#9-painel-administrativo)
10. [Integrações](#10-integrações)
11. [Componentes Principais](#11-componentes-principais)
12. [Roteamento](#12-roteamento)
13. [Scripts Utilitários](#13-scripts-utilitários)
14. [Build e Deploy](#14-build-e-deploy)
15. [Solução de Problemas](#15-solução-de-problemas)
16. [Licença e Créditos](#16-licença-e-créditos)

---

## 1. Visão Geral do Projeto

A **Loja NexusSaaS** é um marketplace digital premium para venda de sistemas SaaS, automações, dashboards, templates e ferramentas digitais. A plataforma funciona como uma vitrine estilo ThemeForest/CodeCanyon, 100% focada no mercado brasileiro.

### Principais Funcionalidades

| Área | Funcionalidade |
|------|---------------|
| **Vitrine** | Catálogo de produtos com filtros, busca, categorias e modal de detalhes |
| **Carrinho** | Adição/remoção de produtos com simulação de checkout |
| **Admin** | Dashboard completo com métricas, gerenciamento de produtos, pedidos, clientes e avaliações |
| **Integrações** | Gateways de pagamento (Stripe, Mercado Pago, Asaas, Pagar.me), Marketing (Meta Pixel, Google Tag), Comunicação (Resend) |
| **Banco de Dados** | Supabase (PostgreSQL) com RLS ativado |

---

## 2. Arquitetura e Estrutura de Pastas

```
Loja ex Afcode/
├── public/                     # Arquivos estáticos públicos
├── src/
│   ├── App.tsx                 # Componente principal da vitrine pública
│   ├── App.css                 # Estilos globais da aplicação
│   ├── main.tsx                # Ponto de entrada (ReactDOM.createRoot)
│   ├── router.tsx              # Configuração de rotas (React Router v7)
│   ├── index.css               # Estilos base (TailwindCSS directives)
│   │
│   ├── assets/                 # Imagens e recursos estáticos
│   │
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Header.tsx          # Cabeçalho com busca e navegação
│   │   ├── Hero.tsx            # Seção hero da página inicial
│   │   ├── CategoryGrid.tsx    # Grade de categorias
│   │   ├── FeaturedSection.tsx  # Seção de produtos em destaque
│   │   ├── BestSellers.tsx     # Seção de mais vendidos
│   │   ├── TrendingSection.tsx  # Seção de tendências
│   │   ├── ProductGrid.tsx     # Grade de produtos
│   │   ├── ProductCard.tsx     # Card individual de produto
│   │   ├── ProductDetailsModal.tsx  # Modal detalhado do produto
│   │   ├── SidebarFilters.tsx  # Filtros laterais
│   │   ├── TechIcon.tsx        # Ícone de tecnologia
│   │   ├── FAQ.tsx             # Seção de perguntas frequentes
│   │   ├── Footer.tsx          # Rodapé
│   │   └── admin/              # Componentes do painel admin
│   │       ├── AdminStats.tsx        # Cards de estatísticas
│   │       ├── ProductFormModal.tsx   # Modal de criação/edição de produtos
│   │       ├── ProductTable.tsx      # Tabela de produtos
│   │       └── layout/
│   │           ├── AdminLayout.tsx    # Layout geral do admin
│   │           ├── AdminHeader.tsx    # Cabeçalho do admin
│   │           └── AdminSidebar.tsx   # Sidebar de navegação do admin
│   │
│   ├── data/
│   │   └── products.ts         # Dados/tipos dos produtos (fallback local)
│   │
│   ├── hooks/
│   │   ├── useAdminAuth.ts     # Hook de autenticação do admin
│   │   └── useProducts.ts      # Hook de busca de produtos (Supabase)
│   │
│   ├── lib/
│   │   └── supabase.ts         # Inicialização do cliente Supabase
│   │
│   └── pages/
│       └── admin/
│           ├── AdminLogin.tsx       # Tela de login do administrador
│           ├── DashboardPage.tsx     # Dashboard com KPIs e gráficos
│           ├── AnalyticsPage.tsx     # Página de análises
│           ├── ProductsPage.tsx      # Gerenciamento de produtos
│           ├── MarketingPage.tsx     # Ferramentas de marketing
│           ├── IntegrationsPage.tsx  # Configuração de integrações
│           ├── OrdersPage.tsx        # Gerenciamento de pedidos
│           ├── CustomersPage.tsx     # Gerenciamento de clientes
│           ├── ReviewsPage.tsx       # Gerenciamento de avaliações
│           ├── SettingsPage.tsx      # Configurações da loja
│           └── LogsPage.tsx         # Logs de atividades
│
├── supabase/                   # Configuração do Supabase
│   ├── README.md
│   ├── functions/              # Edge Functions
│   ├── migrations/             # Migrações do banco de dados
│   ├── policies/               # Políticas de RLS
│   ├── seed/                   # Dados iniciais (seed)
│   └── types/                  # Tipos gerados do banco
│
├── .env                        # Variáveis de ambiente (NÃO comitar em produção)
├── setup-db.cjs                # Script de setup completo do banco de dados
├── register-admin.cjs          # Script para registrar um novo admin
├── set-admin.cjs               # Script para definir um usuário como admin
├── package.json                # Dependências e scripts NPM
├── vite.config.ts              # Configuração do Vite
├── tailwind.config.js          # Configuração do TailwindCSS
├── tsconfig.json               # Configuração do TypeScript
└── contexto.md                 # Contexto de negócio da plataforma
```

---

## 3. Pré-requisitos

| Requisito | Versão Mínima |
|-----------|---------------|
| **Node.js** | 18.x ou superior |
| **npm** | 9.x ou superior |
| **Conta Supabase** | Projeto criado em [supabase.com](https://supabase.com) |
| **Navegador** | Chrome, Firefox, Edge ou Safari (versão recente) |

---

## 4. Instalação e Configuração

### 4.1 Clonar e instalar dependências

```bash
# Clonar o repositório (ou descompactar o .zip)
git clone <url-do-repositorio>
cd "Loja ex Afcode"

# Instalar dependências
npm install
```

### 4.2 Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (ou edite o existente):

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> ⚠️ **Importante:** Nunca comite o `.env` com credenciais reais. Use `.env.example` como template.

### 4.3 Configurar o banco de dados

```bash
# Executa o setup completo: cria tabelas, RLS e insere produtos
node setup-db.cjs
```

### 4.4 Registrar o primeiro administrador

```bash
# Registra um novo usuário admin via Supabase Auth
node register-admin.cjs
```

Ou, se o usuário já existe no Supabase Auth:

```bash
# Define um usuário existente como admin
node set-admin.cjs
```

### 4.5 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:5173**

---

## 5. Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (pública) do Supabase | ✅ Sim |

> **Nota:** Todas as variáveis prefixadas com `VITE_` ficam expostas no cliente. Para chaves secretas de gateways de pagamento, use as Edge Functions do Supabase ou um backend separado.

---

## 6. Banco de Dados (Supabase)

### 6.1 Tabelas

#### `products`
Armazena todos os produtos do marketplace.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` (PK) | Identificador único, gerado automaticamente |
| `slug` | `text` (unique) | Identificador amigável para URLs |
| `name` | `text` | Nome do produto |
| `category` | `text` | Categoria (WhatsApp, SaaS, IA, etc.) |
| `short_description` | `text` | Descrição curta para o card |
| `long_description` | `text` | Descrição longa para o modal |
| `price` | `numeric` | Preço em R$ |
| `rating` | `numeric` | Avaliação média (0-5) |
| `sales_count` | `integer` | Total de vendas |
| `badge` | `text` | Badge especial (MAIS VENDIDO, HOT, IA, NOVO) |
| `features` | `jsonb` | Array JSON com lista de funcionalidades |
| `tech_stack` | `jsonb` | Array JSON com tecnologias usadas |
| `gradient` | `text` | Classes CSS de gradiente do card |
| `icon_name` | `text` | Nome do ícone Lucide |
| `image_url` | `text` | URL da imagem do produto (opcional) |
| `active` | `boolean` | Se o produto está visível na vitrine |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Data da última atualização |

#### `admin_users`
Controle de acesso administrativo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `user_id` | `uuid` (PK) | ID do usuário no Supabase Auth |
| `email` | `text` | E-mail do administrador |
| `role` | `text` | Papel (padrão: `super_admin`) |
| `created_at` | `timestamptz` | Data de criação do registro |

### 6.2 Row Level Security (RLS)

O RLS está habilitado em todas as tabelas:

| Tabela | Política | Regra |
|--------|----------|-------|
| `products` | Produtos ativos são públicos | `SELECT` onde `active = true` (qualquer um) |
| `products` | Somente admins podem gerenciar | `ALL` para usuários na tabela `admin_users` |
| `admin_users` | Admin pode ler seu registro | `SELECT` onde `user_id = auth.uid()` |

---

## 7. Autenticação e Autorização

### Fluxo de Login do Admin

```
Usuário acessa /admin/login
        ↓
Insere e-mail e senha
        ↓
supabase.auth.signInWithPassword()
        ↓
Verifica se o user_id existe na tabela admin_users
        ↓
  ✅ É admin → redireciona para /admin/dashboard
  ❌ Não é admin → exibe "Acesso negado" e faz signOut
```

### Hook `useAdminAuth`

**Localização:** `src/hooks/useAdminAuth.ts`

Fornece:
- `user` — Objeto do usuário autenticado
- `session` — Sessão ativa
- `isAdmin` — Boolean indicando se é admin
- `loading` — Estado de carregamento
- `error` — Mensagem de erro, se houver
- `login(email, password)` — Função de login
- `logout()` — Função de logout

---

## 8. Vitrine Pública (Front-end)

A vitrine é a página principal acessada em `/`. Consiste nas seguintes seções:

| Seção | Componente | Descrição |
|-------|-----------|-----------|
| **Cabeçalho** | `Header.tsx` | Logo, barra de busca, carrinho e link para admin |
| **Hero** | `Hero.tsx` | Banner principal com chamada de ação e animações |
| **Categorias** | `CategoryGrid.tsx` | Grade de categorias clicáveis com ícones |
| **Destaques** | `FeaturedSection.tsx` | Carrossel de produtos em destaque |
| **Mais Vendidos** | `BestSellers.tsx` | Lista dos produtos com maior número de vendas |
| **Tendências** | `TrendingSection.tsx` | Produtos em alta com base em atividade recente |
| **Catálogo Completo** | `ProductGrid.tsx` | Grade completa de todos os produtos com filtros |
| **Filtros** | `SidebarFilters.tsx` | Filtros laterais (categoria, faixa de preço, rating) |
| **FAQ** | `FAQ.tsx` | Perguntas e respostas frequentes com acordeão |
| **Rodapé** | `Footer.tsx` | Links úteis, redes sociais e informações legais |

### Funcionalidades do Carrinho

- Adição de produtos com proteção contra duplicatas
- Remoção individual de itens
- Cálculo dinâmico do total
- Simulação de checkout com animação de sucesso
- Notificações toast para feedback ao usuário

### Modal de Detalhes do Produto

O componente `ProductDetailsModal.tsx` exibe:
- Nome, descrição longa e preço
- Lista de funcionalidades
- Stack tecnológica com ícones
- Badge do produto
- Botões de "Adicionar ao Carrinho" e "Ver Demo"

---

## 9. Painel Administrativo

Acessível em `/admin/*`, requer autenticação.

### 9.1 Páginas do Admin

| Rota | Página | Funcionalidade |
|------|--------|----------------|
| `/admin/login` | `AdminLogin` | Tela de login com autenticação Supabase |
| `/admin/dashboard` | `DashboardPage` | KPIs principais, gráficos de vendas, receita e métricas |
| `/admin/analytics` | `AnalyticsPage` | Análises detalhadas de tráfego e conversão |
| `/admin/products` | `ProductsPage` | CRUD completo de produtos (criar, editar, ativar/desativar) |
| `/admin/marketing` | `MarketingPage` | Ferramentas de marketing e campanhas |
| `/admin/integrations` | `IntegrationsPage` | Configuração de gateways, rastreamento e comunicação |
| `/admin/orders` | `OrdersPage` | Listagem e gestão de pedidos |
| `/admin/customers` | `CustomersPage` | Base de clientes com detalhes e histórico |
| `/admin/reviews` | `ReviewsPage` | Moderação de avaliações dos produtos |
| `/admin/settings` | `SettingsPage` | Configurações gerais da loja |
| `/admin/logs` | `LogsPage` | Logs de atividades do sistema |

### 9.2 Layout do Admin

O layout do painel é composto por:
- **`AdminLayout.tsx`** — Wrapper principal com proteção de rota
- **`AdminSidebar.tsx`** — Barra lateral com navegação entre módulos
- **`AdminHeader.tsx`** — Cabeçalho com informações do usuário logado

### 9.3 Dashboard — Métricas Exibidas

- Receita Total do período
- Número de vendas
- Ticket Médio
- Total de clientes
- Gráficos de receita por período (via Recharts)
- Produtos mais vendidos

---

## 10. Integrações

A página de integrações (`/admin/integrations`) permite configurar serviços externos. As credenciais são salvas no `localStorage` do navegador com a chave `nexus_integration_configs`.

### 10.1 Gateways de Pagamento

| Gateway | Campos | Taxa |
|---------|--------|------|
| **Stripe** | Publishable Key, Secret Key, Webhook Secret (opcional) | 2,9% + R$ 0,30 |
| **Mercado Pago** | Public Key, Access Token | 4,99% cartão · PIX grátis |
| **Asaas** | API Key, Ambiente, Webhook Token (opcional) | 1% PIX · 1,99% boleto · 2,99% cartão |
| **Pagar.me** | Secret Key, Public Key, Account ID (opcional) | 2,49% + R$ 0,09 PIX · 3,29% cartão |

### 10.2 Marketing e Rastreamento

| Serviço | Campos | Custo |
|---------|--------|-------|
| **Meta Pixel & CAPI** | ID do Pixel, Token CAPI (opcional) | Gratuito |
| **Google Tag (GTM/GA4)** | ID da Tag (GTM-xxx ou G-xxx) | Gratuito |

### 10.3 Comunicação

| Serviço | Campos | Custo |
|---------|--------|-------|
| **Resend API** | API Key, E-mail Remetente | Até 3.000 e-mails/mês grátis |

### 10.4 Como as Integrações Funcionam

1. O usuário clica no card da integração desejada
2. Um modal é aberto com os campos de configuração
3. Campos secretos possuem toggle de visibilidade (olho)
4. Ao clicar em "Salvar e Ativar", as credenciais são salvas no `localStorage`
5. O card exibe um badge verde "Conectado" quando configurado
6. O botão "Desconectar" remove as credenciais salvas

> ⚠️ **Importante para Produção:** As credenciais sensíveis (Secret Keys, API Keys) devem ser armazenadas em um backend seguro, não no localStorage. Use Supabase Edge Functions, Supabase Vault, ou um servidor próprio para gerenciar chaves em ambiente de produção.

---

## 11. Componentes Principais

### 11.1 Componentes da Vitrine

| Componente | Tamanho | Descrição |
|------------|---------|-----------|
| `ProductDetailsModal.tsx` | ~19KB | Modal completo com todas as informações do produto |
| `ProductCard.tsx` | ~12KB | Card de produto com hover, animações e ações |
| `Header.tsx` | ~8KB | Navegação principal com busca e carrinho |
| `Hero.tsx` | ~8KB | Seção hero animada com gradientes |
| `Footer.tsx` | ~8KB | Rodapé com links e redes sociais |
| `SidebarFilters.tsx` | ~7KB | Filtros de categoria, preço e avaliação |
| `CategoryGrid.tsx` | ~6.5KB | Grade responsiva de categorias |
| `ProductGrid.tsx` | ~6KB | Grade de produtos com paginação |
| `FeaturedSection.tsx` | ~5.5KB | Produtos destacados em destaque |
| `TrendingSection.tsx` | ~5KB | Produtos em tendência |
| `FAQ.tsx` | ~5KB | Acordeão de perguntas frequentes |
| `BestSellers.tsx` | ~3.7KB | Ranking dos mais vendidos |

### 11.2 Componentes do Admin

| Componente | Tamanho | Descrição |
|------------|---------|-----------|
| `IntegrationsPage.tsx` | ~32KB | Página completa de configuração de integrações |
| `ProductFormModal.tsx` | ~15KB | Modal de criação/edição de produtos |
| `DashboardPage.tsx` | ~11.5KB | Dashboard com gráficos e estatísticas |
| `SettingsPage.tsx` | ~11KB | Configurações da loja |
| `ProductTable.tsx` | ~11KB | Tabela de produtos com ações |
| `CustomersPage.tsx` | ~9KB | Gerenciamento de clientes |
| `OrdersPage.tsx` | ~8KB | Gerenciamento de pedidos |
| `ReviewsPage.tsx` | ~7.5KB | Moderação de avaliações |
| `AdminLogin.tsx` | ~7.4KB | Tela de login com design premium |
| `AdminSidebar.tsx` | ~6KB | Sidebar de navegação com ícones |
| `LogsPage.tsx` | ~6KB | Logs de atividades |

---

## 12. Roteamento

A aplicação utiliza **React Router v7** (`react-router-dom`).

### Mapa de Rotas

```
/                          → App.tsx (Vitrine pública)
/admin/login               → AdminLogin.tsx
/admin/                    → AdminLayout.tsx (wrapper protegido)
  ├── dashboard            → DashboardPage.tsx
  ├── analytics            → AnalyticsPage.tsx
  ├── products             → ProductsPage.tsx
  ├── marketing            → MarketingPage.tsx
  ├── integrations         → IntegrationsPage.tsx
  ├── orders               → OrdersPage.tsx
  ├── customers            → CustomersPage.tsx
  ├── reviews              → ReviewsPage.tsx
  ├── settings             → SettingsPage.tsx
  ├── logs                 → LogsPage.tsx
  └── *                    → Redireciona para /admin/dashboard
/*                         → Redireciona para /
```

---

## 13. Scripts Utilitários

### `setup-db.cjs`
Configura o banco de dados completo:
1. Cria as tabelas `products` e `admin_users`
2. Habilita RLS com políticas de segurança
3. Insere 42+ produtos com dados realistas (seed)

```bash
node setup-db.cjs
```

### `register-admin.cjs`
Registra um novo usuário admin no Supabase Auth e na tabela `admin_users`.

```bash
node register-admin.cjs
```

### `set-admin.cjs`
Define um usuário já existente no Supabase Auth como administrador.

```bash
node set-admin.cjs
```

---

## 14. Build e Deploy

### 14.1 Build de Produção

```bash
# Verifica tipos TypeScript e gera o bundle otimizado
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### 14.2 Preview Local

```bash
# Serve o build de produção localmente
npm run preview
```

### 14.3 Deploy

A aplicação pode ser implantada em qualquer serviço que suporte sites estáticos:

| Plataforma | Comando de Deploy |
|------------|-------------------|
| **Vercel** | `npx vercel --prod` |
| **Netlify** | Arraste a pasta `dist/` para o painel Netlify |
| **Railway** | Conecte o repositório Git |
| **Hostinger** | Upload via FTP ou Git |
| **GitHub Pages** | Configure o workflow no GitHub Actions |

### 14.4 Configuração do Vercel (recomendado)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> **Nota:** Como é uma SPA (Single Page Application), é necessário configurar o redirecionamento de todas as rotas para `index.html` em qualquer servidor.

---

## 15. Solução de Problemas

### O `localhost:5173` não abre

1. Verifique se o servidor de desenvolvimento está rodando (`npm run dev`)
2. Certifique-se de que a porta 5173 não está em uso por outro processo
3. Verifique erros no terminal — erros de sintaxe em `.tsx` impedem a compilação

### Erro de importação / módulo não encontrado

```bash
# Limpe o cache e reinstale as dependências
rm -rf node_modules
npm install
npm run dev
```

### Erro "Variáveis de ambiente do Supabase não encontradas"

- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que as variáveis estão prefixadas com `VITE_`
- Reinicie o servidor de desenvolvimento após alterar o `.env`

### Erro de RLS no Supabase (sem permissão)

- Execute `node setup-db.cjs` para recriar as políticas de RLS
- Verifique se o usuário admin está registrado na tabela `admin_users`

### Produtos não aparecem na vitrine

- Confirme que os produtos possuem `active = true` no banco de dados
- O sistema possui um fallback local em `src/data/products.ts` caso o Supabase não esteja acessível

### Integrações não salvam

- As credenciais das integrações são salvas no `localStorage` do navegador
- Limpar os dados do site apaga as configurações
- A chave usada é `nexus_integration_configs`

---

## 16. Licença e Créditos

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19.2.6 | Framework de UI |
| React Router | 7.15.1 | Roteamento SPA |
| TypeScript | 6.0.2 | Tipagem estática |
| Vite | 8.0.12 | Bundler e Dev Server |
| TailwindCSS | 3.4.1 | Framework de estilos |
| Framer Motion | 12.39.0 | Animações |
| Supabase | 2.106.1 | Backend-as-a-Service (Auth + DB) |
| Recharts | 3.8.1 | Gráficos e visualizações |
| Lucide React | 1.16.0 | Ícones |

### Dependências de Desenvolvimento

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ESLint | 10.3.0 | Linting de código |
| PostCSS | 8.5.15 | Processamento de CSS |
| Autoprefixer | 10.5.0 | Prefixos CSS automáticos |

---

> 📌 **Dica Final:** Para contribuir ou personalizar o projeto, mantenha a arquitetura de componentes existente. Todos os componentes do admin seguem o padrão de design com tema escuro, usando variáveis de cor consistentes (`zinc-800`, `zinc-900`, `zinc-700` para bordas, com acentos em `violet`, `indigo`, `emerald` etc.).

---

*Documentação gerada em 21 de Maio de 2026 — NexusSaaS © 2026*
