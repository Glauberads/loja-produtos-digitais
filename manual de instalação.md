# 🛠️ Manual de Instalação e Configuração

Bem-vindo ao **Manual de Instalação do NexusSaaS**. Este guia o levará desde o ambiente de desenvolvimento vazio até a plataforma totalmente operacional na sua máquina, incluindo o banco de dados e as inteligências artificiais.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que você possui:

1. **Node.js** instalado (Versão 18 ou superior).
2. Uma conta ativa no **[Supabase](https://supabase.com/)** (onde nosso banco de dados será hospedado).
3. **Git** instalado (opcional, para clonar o repositório).
4. Uma chave de API para o chatbot (Google Gemini, Groq, OpenRouter ou OpenAI).

---

## 🚀 Passo 1: Preparando o Repositório

1. Baixe o projeto e abra a pasta raiz (`Nexus SaaS Vitrine Inteligente`) em seu editor de código (como o VS Code).
2. Abra o terminal integrado do VS Code.
3. Execute o comando para instalar todas as bibliotecas necessárias:
   ```bash
   npm install
   ```

---

## 🗄️ Passo 2: Configurando o Banco de Dados (Supabase)

O NexusSaaS precisa de um banco de dados para armazenar os produtos, leads, histórico de IA e acessos administrativos.

1. Acesse o [painel do Supabase](https://supabase.com/dashboard) e crie um novo **Projeto**.
2. Guarde a senha segura gerada; você poderá precisar dela mais tarde.
3. Após o provisionamento (cerca de 2 minutos), vá até as configurações do seu projeto no Supabase (**Project Settings > API**).
4. Você vai precisar de duas informações cruciais:
   - A **URL do Projeto** (Project URL)
   - A **Chave Pública/Anônima** (Project API Keys > `anon` `public`)

Na pasta raiz do projeto, você encontrará um arquivo chamado `.env` (ou `.env.example`). Certifique-se de que ele exista com o seguinte formato:

```env
VITE_SUPABASE_URL=Sua_Project_URL_aqui
VITE_SUPABASE_ANON_KEY=Sua_Chave_Anon_aqui
```

> **Aviso:** Substitua `Sua_Project_URL_aqui` e `Sua_Chave_Anon_aqui` pelos dados copiados do Supabase. Salve o arquivo.

---

## 🛠️ Passo 3: Criando as Tabelas e Alimentando o Banco

Agora que o sistema sabe como se conectar ao seu Supabase, vamos criar automaticamente toda a estrutura e adicionar produtos de exemplo.

No terminal, execute:

```bash
node setup-db.cjs
```
> *Este comando criará tabelas de produtos, usuários e leads, além de inserir 42+ itens na sua vitrine para teste imediato.*

---

## 🔑 Passo 4: Criando o seu Acesso de Administrador

Para acessar o painel de gerenciamento, criar novos produtos, visualizar métricas e leads, você precisa ter uma conta de Administrador.

No terminal, execute:

```bash
node register-admin.cjs
```

- Digite um e-mail válido (ex: `admin@meusaas.com`).
- Defina uma senha forte.
- Aguarde a confirmação. Este script garantirá que seu usuário receba as devidas permissões no banco de dados.

---

## 🧠 Passo 5: Implantando a IA do Chat (Edge Functions)

Para que o Chat IA consiga processar respostas sem expor chaves sensíveis ao público, usamos as Edge Functions.

1. No terminal, certifique-se de estar logado na CLI do Supabase:
   ```bash
   npx supabase login
   ```
2. Após gerar e colar o token, conecte seu projeto local ao Supabase utilizando o **Reference ID** do seu projeto (que fica na URL do painel do Supabase, ex: `https://supabase.com/dashboard/project/SEU_ID_REF_AQUI`):
   ```bash
   npx supabase link --project-ref SEU_ID_REF_AQUI
   ```
3. Implante a função da Inteligência Artificial:
   ```bash
   npx supabase functions deploy ai-chat --no-verify-jwt
   ```
4. Se o chat não estiver respondendo, injete as variáveis secretas para a função diretamente via CLI:
   ```bash
   npx supabase secrets set SUPABASE_URL="SUA_URL_AQUI" SUPABASE_ANON_KEY="SUA_CHAVE_AQUI"
   ```

*(Para gerar chaves de API da IA, consulte o arquivo `implantação do agente de atendimento de ia.md`).*

---

## 🎨 Passo 6: Rodando a Loja Localmente

Tudo pronto! Para ligar a sua loja no ambiente de desenvolvimento:

```bash
npm run dev
```

1. Abra o navegador no link fornecido (geralmente `http://localhost:5173`).
2. Explore a sua nova vitrine pública. **Teste o botão de alternar tema (Claro/Escuro) no cabeçalho superior direito.**
3. Para acessar o painel de gestão, navegue para:
   `http://localhost:5173/admin/login`
4. Use o e-mail e a senha criados no **Passo 4**.

---

## 🎯 Conclusão e Produção

Quando você estiver pronto para colocar sua loja no ar (Vercel, Netlify ou Hostinger):

1. Gere o build final otimizado:
   ```bash
   npm run build
   ```
2. Certifique-se de injetar suas **variáveis de ambiente (`.env`)** no painel da Vercel ou hospedagem que escolher, senão sua aplicação online não conseguirá se comunicar com o Supabase.

Boas vendas! 🚀
