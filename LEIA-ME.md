# AK Tech Gestão — primeira versão

Este pacote contém uma primeira versão web do sistema, preparada para conectar ao Supabase. A logo enviada foi incluída sem alterações.

## O que já está preparado
- Login e criação de conta por e-mail e senha (Supabase Auth).
- Painel com entradas recebidas, saídas pagas, resultado do mês e valores a receber.
- Registro de entradas e saídas, inclusive pagamentos pendentes.
- Cadastro de clientes.
- Ordens de serviço com valor combinado, valor recebido, saldo pendente e status.
- Banco de dados com políticas de segurança por usuário (RLS).

## Importante
O pacote ainda **não está publicado na internet nem conectado a um banco**. Para funcionar online e sincronizar entre celular e computador, é necessário criar/configurar uma conta Supabase e publicar os arquivos em um serviço de hospedagem. Não envie sua senha do Supabase nem credenciais privadas por chat.

## Configuração do banco (Supabase)
1. Acesse https://supabase.com/ e crie um projeto.
2. No painel do projeto, abra SQL Editor.
3. Abra `supabase-schema.sql`, copie todo o conteúdo e execute no SQL Editor.
4. Em Project Settings > API, copie o Project URL e a chave `anon`/`publishable` (nunca use `service_role` no navegador).
5. Abra `app.js` e substitua:
   - `COLE_AQUI_A_URL_DO_SUPABASE` pela Project URL.
   - `COLE_AQUI_A_CHAVE_ANON_PUBLIC` pela chave anon/public.
6. Em Authentication > URL Configuration, configure a URL do site depois de publicar.

## Publicação
Você pode publicar a pasta em um host estático como Netlify ou Vercel. Como o app usa módulos JavaScript, publique a pasta do projeto como site estático e mantenha a estrutura:
- `index.html`
- `app.js`
- `assets/logo-ak-tech.jpeg`

Depois de publicar, abra o endereço no iPhone e computador. Os dados ficam no Supabase e são isolados por conta.

## Primeiros testes
1. Abra o endereço publicado.
2. Crie sua conta com seu e-mail.
3. Faça login.
4. Cadastre um cliente.
5. Abra uma ordem de serviço.
6. Registre recebimentos e despesas no Financeiro.

## Limitações desta versão inicial
- Ainda não tem edição/exclusão de registros pela interface.
- A tela de ordem de serviço não cria automaticamente lançamentos financeiros: registre cada valor efetivamente recebido na aba Financeiro para manter o caixa correto.
- O valor "a receber" é estimado pelas ordens não entregues/canceladas.
- Não há módulo de estoque nesta primeira etapa; podemos adicioná-lo depois, já que você compra peças conforme cada serviço.
- Para uso real, habilite confirmação de e-mail e configure as URLs autorizadas do Supabase.
