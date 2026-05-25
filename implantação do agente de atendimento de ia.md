# Implantação do Agente de Atendimento de IA

Este guia passo a passo ajudará você a gerar as chaves de API necessárias para ativar o Chat Inteligente no seu sistema NexusSaaS. Escolha o provedor da sua preferência (recomendamos **Gemini** ou **Groq** por possuírem boas opções gratuitas).

---

## 1. Google Gemini (Recomendado - Possui plano Gratuito)

O Google Gemini é excelente e oferece acesso gratuito generoso para desenvolvedores, ideal para começar.

**Passo a passo:**
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Faça login com sua conta do Google.
3. No menu lateral esquerdo, clique em **"Get API key"** (Obter chave de API).
4. Clique no botão azul **"Create API key"** (Criar chave de API).
5. Se você não tem um projeto do Google Cloud, ele pode criar um automaticamente para você. Apenas clique em **"Create API key in new project"**.
6. Copie a chave gerada (ela começa com `AIzaSy...`).
7. Vá no painel Admin do NexusSaaS > **Configurações de IA**.
8. Selecione o Provedor `Google Gemini`.
9. Cole a chave em **API Key** e salve.

*Modelo sugerido:* `gemini-1.5-flash`

---

## 2. Groq (Ultra-rápido - Opções Gratuitas)

Groq é uma plataforma que roda modelos open-source (como o Llama 3 da Meta) em velocidades extremas.

**Passo a passo:**
1. Acesse o [GroqConsole](https://console.groq.com/).
2. Crie uma conta ou faça login.
3. No menu lateral esquerdo, vá em **"API Keys"**.
4. Clique em **"Create API Key"**.
5. Dê um nome para a chave (ex: `NexusChat`) e clique em Submit.
6. **Copie a chave imediatamente**, pois ela não será mostrada novamente. Começa com `gsk_`.
7. Vá no painel Admin do NexusSaaS > **Configurações de IA**.
8. Selecione o Provedor `Groq`.
9. Cole a chave em **API Key** e salve.

*Modelo sugerido:* `llama3-8b-8192` ou `llama3-70b-8192`

---

## 3. OpenRouter (Todos os modelos em um só lugar)

O OpenRouter permite acessar centenas de modelos diferentes, e possui dezenas de modelos 100% gratuitos.

**Passo a passo:**
1. Acesse o [OpenRouter](https://openrouter.ai/).
2. Faça login (pode usar a conta do Google ou Discord).
3. Clique em **"Keys"** no menu superior ou lateral.
4. Clique em **"Create Key"**.
5. Dê um nome e clique em Create. Copie a chave gerada (começa com `sk-or-v1-`).
6. Vá no painel Admin do NexusSaaS > **Configurações de IA**.
7. Selecione o Provedor `OpenRouter`.
8. Cole a chave em **API Key** e salve.

*Modelo sugerido gratuito:* `openrouter/auto` ou pesquisar por modelos marcados como "Free" no site.

---

## 4. OpenAI (ChatGPT - Pago)

A OpenAI é a criadora do ChatGPT, referência no mercado, mas não possui plano gratuito para a API.

**Passo a passo:**
1. Acesse o [OpenAI Platform](https://platform.openai.com/).
2. Faça login e coloque créditos (cartão de crédito) na seção de **Billing** (Faturamento). A API da OpenAI é pré-paga.
3. Vá no menu lateral esquerdo em **"API keys"**.
4. Clique em **"Create new secret key"**.
5. Dê um nome e crie a chave. Copie-a (começa com `sk-`).
6. Vá no painel Admin do NexusSaaS > **Configurações de IA**.
7. Selecione o Provedor `OpenAI`.
8. Cole a chave em **API Key** e salve.

*Modelo sugerido:* `gpt-4o-mini` (mais rápido e barato) ou `gpt-4o`.

---

## 🚀 Próximos Passos após configurar

Após configurar sua chave no Painel Admin:
1. Revise o campo **Mensagem de Boas-vindas**.
2. Revise o **Prompt do Sistema**. É nele que você dá a "personalidade" ao seu Agente. Instrua ele a ser um vendedor, listar os benefícios do SaaS e focar em converter visitantes em leads.
3. Se estiver usando o **Modo Híbrido**, preencha também o **WhatsApp para Leads**, para onde o usuário será enviado ao preencher o formulário.
4. Teste o chat na vitrine da loja! Se o agente falhar ao responder, certifique-se de que a API Key foi copiada corretamente sem espaços antes ou depois.
