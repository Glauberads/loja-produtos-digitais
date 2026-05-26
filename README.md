# NexusSaaS Platform

Bem-vindo ao repositório do **NexusSaaS**, a vitrine digital premium focada na venda de sistemas, automações, templates e ferramentas digitais com código-fonte whitelabel.

---

## 🚀 Funcionalidades Inclusas

O NexusSaaS foi desenhado para maximizar a conversão de visitantes em clientes e leads, através de um design premium e ferramentas nativas de retenção.

1. **Catálogo Premium e Tema Global:** Design moderno com alternância entre **Modo Claro** e **Modo Escuro** (Dark/Light Mode) com persistência nativa.
2. **Web Chat IA:** Assistente conversacional inteligente movido a Edge Functions (suporte a Gemini, Groq, OpenRouter, OpenAI), capaz de capturar leads e redirecionar para o WhatsApp.
3. **Roleta Gamificada:** Oferta dinâmica para atrair a atenção e converter em compra através de cupons com limite de tempo.
4. **Vitrine Dinâmica de Vídeos:** Modal responsivo para reproduzir embeds automáticos de YouTube, Vimeo, Loom e vídeos nativos diretamente na loja.
5. **Painel Admin Integrado:** Controle completo de métricas, produtos, leads capturados, avaliações, clientes e chaves de integração.

---

## ⚙️ Stack Tecnológica

- **Front-end:** React 19, TypeScript, Vite, TailwindCSS (variáveis baseadas no tema), Framer Motion.
- **Back-end:** Supabase (PostgreSQL, Row Level Security, Edge Functions para IA).
- **Gerenciamento de Estado:** React Hooks e LocalStorage (para persistência do tema e configurações).
- **Pagamentos & Trackers:** Suporte nativo a Stripe, Mercado Pago, Asaas, Meta Pixel e Google Tag Manager.

---

## 📚 Documentação

Neste repositório você encontra manuais detalhados para facilitar o seu trabalho de implantação e operação:

- [`manual de instalação.md`](./manual%20de%20instalação.md): Passo a passo inicial de como configurar o ambiente, o banco de dados e as credenciais necessárias.
- [`contexto.md`](./contexto.md): O escopo de negócio e como lucrar usando esta infraestrutura.
- [`documentação.md`](./documentação.md): Especificações técnicas sobre arquivos, componentes e tabelas do banco.
- [`implantação do agente de atendimento de ia.md`](./implantação%20do%20agente%20de%20atendimento%20de%20ia.md): Como gerar chaves nas principais IAs do mercado.

---

## 🛠️ Começando Rápido

Para um setup completo, siga o **`manual de instalação.md`**.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o banco de dados e Inserir dados de exemplo (Seed)
node setup-db.cjs

# 3. Registrar o primeiro administrador
node register-admin.cjs

# 4. Rodar o projeto localmente
npm run dev
```

> **ATENÇÃO: Estrutura de Banco de Dados**
> O arquivo `setup-db.cjs` é mantido para inicialização rápida do ambiente de desenvolvimento. Novas configurações do banco de dados (Migrations, Policies, Tipagens) estão organizadas profissionalmente dentro da pasta `/supabase`.

---
*NexusSaaS Inc. © 2026. Todos os direitos reservados.*
