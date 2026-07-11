# Guia de Deploy em Produção: Solução Já

Este documento orienta o processo de deploy e a preparação de infraestrutura de produção para as duas aplicações do monorepo: o **PWA Principal (apps/web)** e o **Painel Administrativo (apps/admin)**.

---

## 1. Banco de Dados e Realtime (Supabase)

### A. Criação do Banco de Dados
1. Crie uma nova organização e um novo projeto em produção no [Supabase Dashboard](https://supabase.com/).
2. Anote as credenciais:
   * **Project URL** (usada em `NEXT_PUBLIC_SUPABASE_URL`)
   * **API Key `anon public`** (usada em `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   * **Database Connection String** (para aplicar as migrações locais)

### B. Aplicação de Migrações
Existem duas formas de aplicar a estrutura e funções de banco locais no seu projeto Supabase de produção:

#### Método 1: Supabase CLI (Recomendado)
Execute o comando a partir do diretório raiz para linkar seu projeto local ao de produção e aplicar as migrações:
```bash
# Efetuar login no Supabase
npx supabase login

# Linkar o projeto local com o ID do projeto de produção (obtido nas configurações do Supabase)
npx supabase link --project-ref seu-project-ref-de-producao

# Aplicar todas as migrações pendentes no banco de produção
npx supabase db push
```

#### Método 2: SQL Editor (Manual)
Caso prefira não usar a CLI, copie e execute o conteúdo das migrações na ordem numérica dos arquivos contidos na pasta [supabase/migrations](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/supabase/migrations) diretamente no **SQL Editor** do painel do Supabase:
1. `20260630000000_search_professionals_function.sql`
2. `20260704000001_update_search_professionals_ordering.sql`
3. `20260711000000_add_chat_system.sql`
4. `20260711000001_add_location_fields_to_search.sql`

### C. Configuração do Supabase Realtime (Chat)
Para que o chat interno funcione instantaneamente em tempo real nas aplicações, você precisa habilitar os canais Realtime nas tabelas relevantes:
1. Acesse **Database** > **Replication** no dashboard do Supabase.
2. Localize a publicação chamada `supabase_realtime` e clique em **Edit**.
3. Ative a replicação de tempo real para as seguintes tabelas:
   * `chat_rooms`
   * `chat_messages`
   * `bookings`
4. Clique em salvar. Sem esta configuração, o chat só atualizará as mensagens quando a página for recarregada.

---

## 2. Hospedagem do Frontend e Backend (Vercel)

A hospedagem do front-end em Next.js é feita na Vercel através de dois projetos separados linkados ao mesmo repositório do Turborepo (Git).

### A. Deploy do PWA Principal (`apps/web`)
1. No dashboard da Vercel, clique em **Add New** > **Project** e importe seu repositório Git.
2. Na seção **Configure Project**:
   * **Project Name**: `solucao-ja-app` (ou de sua escolha)
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Mude para `apps/web` (marque a opção "Keep as root directory")
3. Expanda **Build and Development Settings**:
   * O comando de build deve ser preenchido automaticamente como `next build` (ou modificado se usar caches específicos do Turbo).
4. Expanda **Environment Variables** e adicione as variáveis documentadas em [apps/web/.env.example](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/.env.example) com os valores de produção.

### B. Deploy do Painel Administrativo (`apps/admin`)
1. No dashboard da Vercel, clique em **Add New** > **Project** e importe o mesmo repositório Git.
2. Na seção **Configure Project**:
   * **Project Name**: `solucao-ja-admin` (ou de sua escolha)
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Mude para `apps/admin`
3. Expanda **Environment Variables** e adicione as variáveis listadas em [apps/admin/.env.example](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/admin/.env.example):
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL` (apontando para a URL do PWA Principal que você gerou na etapa anterior)

---

## 3. APIs e Serviços de Terceiros

### A. Google Maps Platform
1. Vá até o [Google Cloud Console](https://console.cloud.google.com/).
2. Ative as seguintes APIs para o seu projeto:
   * **Maps JavaScript API** (renderização do mapa no front)
   * **Geocoding API** (conversão de endereço/bairro para coordenadas na criação de perfil)
   * **Places API** (autocomplete de bairros/regiões)
3. Crie duas chaves de API distintas por segurança:
   * **Chave Pública (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)**: Adicione restrições de HTTP Referer no console do Cloud para permitir chamadas exclusivamente a partir do domínio de produção (ex: `https://app.solucaoja.com.br/*` e localhost para testes).
   * **Chave Privada (`GOOGLE_MAPS_API_KEY`)**: Não adicione restrições de HTTP Referer (por rodar em ambiente server-side na Vercel). Restrinja-a no nível de API para ser usada apenas pelo *Geocoding API* e *Places API*.

### B. WhatsApp Cloud API (Meta)
1. Crie uma conta de desenvolvedor em [Meta developers](https://developers.facebook.com/) e crie um aplicativo do tipo "Business".
2. Adicione o produto "WhatsApp" ao aplicativo.
3. Configure o número de telefone da empresa para receber os disparos.
4. Gere um **Token de Acesso Permanente** (System User Token) para produção (o token provisório expira em 24 horas!).
5. Copie o **Phone Number ID** e insira nas variáveis da Vercel do PWA (`apps/web`).

### C. Mercado Pago (SDK de Pagamento Pix)
1. Acesse o portal de desenvolvedores do [Mercado Pago](https://www.mercadopago.com.br/developers/).
2. Vá em **Suas Aplicações** e selecione ou crie sua aplicação.
3. Ative as **Credenciais de Produção**:
   * Copie a **Public Key** (`MERCADO_PAGO_PUBLIC_KEY`) e o **Access Token** (`MERCADO_PAGO_ACCESS_TOKEN`) de produção para a Vercel.
4. **Configuração de Webhooks (Instant Payment Notifications - IPN)**:
   * Nas configurações do Mercado Pago, configure o Webhook para ouvir eventos de pagamentos (`payment`) apontando para a URL pública gerada na Vercel do seu PWA: `https://seu-dominio-pwa.com.br/api/webhooks/mercadopago`.
   * Essa URL é crucial para atualizar automaticamente o status do agendamento de "Aguardando Sinal" para "Confirmado" assim que o Pix for pago pelo cliente.
