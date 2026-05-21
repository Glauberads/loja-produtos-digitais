# Supabase Configuration

Esta pasta contém toda a estrutura do banco de dados do projeto **NexusSaaS**, seguindo um padrão Enterprise (compatível com multi-tenant).

## Estrutura de Diretórios
- **/migrations**: Contém todos os arquivos `.sql` que definem o schema do banco, tabelas, índices e triggers. Devem ser aplicados em ordem cronológica (pelo número do timestamp).
- **/functions**: Funções SQL e procedimentos genéricos que podem ser usados por triggers ou queries.
- **/policies**: Políticas de segurança a nível de linha (Row Level Security - RLS) isoladas por tabela para fácil leitura e manutenção.
- **/seed**: Scripts para popular o banco de dados inicial (categorias padrões, configurações, produtos base).
- **/types**: Tipagens em TypeScript (geradas a partir do schema) para uso no frontend.

## Ordem das Migrations (Setup Novo Banco)
Se for recriar o banco do zero ou aplicar em produção, certifique-se de executar os scripts de `/migrations` **na ordem numérica exata** (do 0001 ao 0014).

> **Atenção:** Os arquivos foram criados com `IF NOT EXISTS` para tornarem a execução idempotente e evitar erros caso você já tenha a tabela parcialmente criada.

## Multi-tenant
A estrutura foi desenhada já pensando em `multi-tenant`. Tabelas essenciais como `products`, `orders`, `customers`, `analytics` e `banners` possuem a coluna `organization_id`. Atualmente pode ser deixada como `NULL`, mas está pronta para escalabilidade futura.

## Aviso sobre `setup-db.cjs`
O arquivo `setup-db.cjs` na raiz do projeto é mantido apenas como legado/backup histórico. **Não modifique o schema por ele**. Todas as alterações de banco devem ocorrer via novas migrations nesta pasta `/supabase/migrations`.
