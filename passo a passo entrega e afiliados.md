# 📦 Manual Explicativo: Entrega Digital e Sistema de Afiliados

Este documento detalha o fluxo exato de como a plataforma NexusSaaS gerencia a **Entrega Digital (Liberação de Acessos)** para o cliente final e como funciona a esteira inteligente de **Afiliados e Comissões**.

---

## 1. O Fluxo de Entrega Digital Automática

Quando um cliente decide comprar um produto (seja e-book, curso, SaaS ou template) em sua loja, não há intervenção humana. Tudo ocorre em milissegundos.

### Passo 1: O Checkout e o Gateway
- O cliente clica em "Comprar Agora" e preenche os dados no modal de checkout rápido.
- O sistema gera um PIX (através do Mercado Pago) via a Edge Function `create-payment`.
- O pedido (`orders`) é gravado no banco de dados com status `pending`.

### Passo 2: O Webhook (O Cérebro da Operação)
- Assim que o cliente paga o PIX pelo aplicativo do banco dele, o Mercado Pago avisa o nosso sistema imediatamente através da Edge Function `payment-webhook`.
- O webhook verifica o valor pago e, sendo válido, altera o status do pedido para `approved`.

### Passo 3: Liberação do Acesso (`product_access`)
Com a ordem aprovada, o webhook faz três coisas simultâneas para garantir a entrega:
1. **Criação de Conta Silenciosa**: Se o e-mail do cliente for novo, o Supabase Auth cria uma conta invisível para ele, gerando um token seguro.
2. **Concessão de Acesso**: Registra uma linha na tabela `product_access`, dizendo que o cliente `A` agora possui licença vitalícia (ou anual) para o produto `B`.
3. **Upsell e Bump**: Se o cliente comprou um **Order Bump** (adicional no checkout) ou um **Upsell Pós-Compra**, o webhook rastreia a hierarquia de vendas e libera o acesso para esses produtos extras também.

### Passo 4: Notificação (Área de Membros e E-mail)
- O front-end da loja, que estava aguardando o WebSocket, detecta a aprovação em tempo real e redireciona o cliente para a tela de Sucesso ou para a Área de Membros (`/minha-area`).
- Na Área de Membros, o cliente já enxerga o produto liberado com a tag **Acesso Liberado**.
- Em background, uma notificação/e-mail pode ser disparada (se integrado via N8N ou fila de eventos) com os dados de login.

---

## 2. O Fluxo do Sistema de Afiliados

O NexusSaaS possui uma mecânica de afiliados *First-Click/Last-Click* baseada em parâmetros de URL (`?ref=`), garantindo atribuição precisa de vendas.

### Passo 1: Criação do Afiliado (Painel Admin)
- Você (Admin) acessa o painel de **Afiliados**.
- Clica em "Novo Afiliado" e cadastra o nome, e-mail e a comissão base (ex: 50%).
- O sistema gera um código único (ex: `joao123`).
- O afiliado recebe um link no formato: `https://sua-loja.com/?ref=joao123` ou `https://sua-loja.com/produto/nome-do-produto?ref=joao123`.

### Passo 2: Captura do Tráfego (Frontend Tracking)
- Quando um cliente clica no link do afiliado, ele cai na página.
- O script do front-end (`TrackingContext.tsx` e `paymentService.ts`) lê o código `joao123` na URL e salva-o na memória temporária da venda (ou LocalStorage).
- Mesmo se o cliente navegar pela loja, o código do afiliado continua grampeado nele.

### Passo 3: Gravação da Autoria na Venda
- No momento em que o cliente gera o PIX, a Edge Function `create-payment` recebe o parâmetro `affiliate_code`.
- O backend consulta o banco: "Existe um afiliado ativo com o código `joao123`?".
- Se sim, o backend vincula o ID do afiliado no registro do pedido e calcula instantaneamente a comissão financeira, salvando tudo na tabela `orders`.

### Passo 4: Liberação e Divisão da Comissão
- Lembra do webhook da Entrega Digital? Ele entra em cena novamente.
- Quando o pagamento for **Aprovado**, o webhook olha o pedido e pergunta: "Essa venda tem um afiliado?".
- Se sim, ele processa a proteção de **Idempotência** (para não pagar a comissão duas vezes por erro de conexão) e cadastra a dívida financeira na tabela `commissions`, com status `approved`.
- Agora o saldo de `50%` do lucro aparece no painel do João.

### Passo 5: Proteção Anti-Fraude e Reembolso
- Se o cliente pediu reembolso de um pedido, você no painel vai marcar o status como "Refunded".
- O sistema vasculhará as comissões daquela ordem e também mudará o status da comissão do afiliado para `refunded` ou `canceled`, estornando o saldo dele automaticamente para você não ficar no prejuízo.

---

### 💡 Resumo do Funil Inteligente
1. Link com `?ref=` gera visita.
2. Venda `pending` salva comissão pre-calculada.
3. Webhook de Aprovação -> **Libera Produto** (Entrega) + **Confirma Comissão** (Afiliados).
4. Afiliado feliz, Cliente com acesso na mão, e você analisa tudo na aba Dashboard.
