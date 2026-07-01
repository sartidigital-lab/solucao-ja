# Roadmap: Solução Já

## Overview

O Solução Já será desenvolvido em 7 fases sequenciais focadas em construir um MVP robusto e de alta qualidade para PWA mobile-first na Grande Vitória/ES. O projeto inicia com a fundação do banco de dados e autenticação, avança para perfis e cadastro de serviços, implementa busca baseada em proximidade PostGIS, gerencia agenda e agendamentos de serviços, integra pagamentos de sinal via Pix (Mercado Pago), adiciona avaliações de ambas as partes, notificações automáticas de WhatsApp e um painel de administração separado para aprovação de prestadores, finalizando com o sistema de planos de assinatura.

## Phases

- [x] **Phase 1: Banco de Dados & Autenticação** - Setup do monorepo, schemas no Supabase e fluxos de cadastro/login com controle de acesso.
- [x] **Phase 2: Perfil Profissional & Serviços** - Cadastro de perfis, gerenciamento de serviços e fotos do portfólio.
- [x] **Phase 3: Busca, Geolocalização & "Preciso Agora"** - Busca inteligente por geolocalização e botão de atendimento imediato.
- [x] **Phase 4: Agenda & Agendamentos** - Configuração da agenda semanal e fluxo básico de solicitação de serviços.
- [ ] **Phase 5: Integração de Pagamento (Mercado Pago/Pix)** - Cobrança automática de sinal de reserva via Mercado Pago com confirmação instantânea.
- [ ] **Phase 6: Avaliações, Notificações & Admin Panel** - Avaliação bilateral, notificações por WhatsApp Cloud API e painel admin de moderação.
- [ ] **Phase 7: Planos & Destaques (Monetização)** - Planos de assinatura (Gratuito, Profissional, Destaque) com liberação de recursos.

## Phase Details

### Phase 1: Banco de Dados & Autenticação
**Goal**: Configurar o banco de dados PostgreSQL com Supabase, habilitar extensões (PostGIS, pg_trgm, unaccent) e estruturar a autenticação (login/registro) para clientes, profissionais e administradores com controle de permissões.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. Cliente e profissional conseguem se cadastrar e efetuar login com validação de dados.
  2. Rotas privadas são protegidas usando Next.js Middleware de acordo com o papel (role) do usuário.
  3. Estrutura de banco de dados and RLS ativados no Supabase.
**Plans**: 3 plans

Plans:
- [x] 01-01: Setup do projeto monorepo, Next.js 16 e Tailwind CSS 4.
- [x] 01-02: Criação de schemas de banco de dados e triggers de perfil no Supabase.
- [x] 01-03: Implementação de Supabase Auth, middleware de rotas e telas de Login/Cadastro.

### Phase 2: Perfil Profissional & Serviços
**Goal**: Implementar a criação de perfil público de profissionais, catálogo de serviços e fotos do portfólio.
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. Profissional consegue preencher sua bio, selecionar tipo de atendimento e cadastrar seus serviços com valores e duração.
  2. Profissional consegue fazer upload de fotos para o portfólio usando Supabase Storage.
  3. Cliente consegue visualizar o perfil público e portfólio do profissional.
**Plans**: 3 plans

Plans:
- [x] 02-01: Telas de edição de perfil de cliente e profissional.
- [x] 02-02: Gerenciamento do catálogo de serviços (CRUD) no painel do profissional.
- [x] 02-03: Portfólio de imagens com upload para Supabase Storage e otimização Sharp.

### Phase 3: Busca, Geolocalização & "Preciso Agora"
**Goal**: Criar o sistema de busca inteligente por geolocalização e o botão de atendimento imediato.
**Depends on**: Phase 2
**Requirements**: SCH-01, SCH-02, SCH-03, SCH-04, SCH-05, PROF-07
**Success Criteria** (what must be TRUE):
  1. Cliente consegue buscar profissionais por cidade/bairro e filtrar por distância aproximada (PostGIS).
  2. Tela inicial lista categorias principais e profissionais mais próximos com ordenação correta.
  3. Botão "Preciso Agora" lista somente profissionais com disponibilidade imediata ativa.
**Plans**: 3 plans

Plans:
- [x] 03-01: Configuração do PostGIS e funções de proximidade no banco de dados.
- [x] 03-02: Tela de busca avançada com filtros e ordenação por distância.
- [x] 03-03: Implementação do botão "Preciso Agora" e toggle de disponibilidade imediata.

### Phase 4: Agenda & Agendamentos
**Goal**: Implementar o sistema de agendamento de horários e controle da agenda do profissional.
**Depends on**: Phase 3
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, PROF-06, COMM-01
**Success Criteria** (what must be TRUE):
  1. Profissional consegue configurar seus horários de atendimento na agenda semanal.
  2. Cliente consegue solicitar agendamento selecionando data/horário disponível.
  3. Profissional recebe solicitações e pode aceitar/recusar, mudando o status no banco de dados.
  4. Botão "Chamar no WhatsApp" funciona com mensagem contendo contexto do serviço solicitado.
**Plans**: 3 plans

Plans:
- [x] 04-01: Configuração de agenda semanal de horários disponíveis.
- [x] 04-02: Criação de agendamentos pelo cliente e visualização no dashboard.
- [x] 04-03: Painel de gerenciamento de solicitações de agendamento do profissional e link WhatsApp.

### Phase 5: Integração de Pagamento (Mercado Pago/Pix)
**Goal**: Adicionar o pagamento de sinal de reserva via Pix integrado com o Mercado Pago.
**Depends on**: Phase 4
**Requirements**: BOOK-05, BOOK-03
**Success Criteria** (what must be TRUE):
  1. Agendamento exige pagamento de sinal (se configurado pelo profissional).
  2. Cliente realiza pagamento do sinal via Pix do Mercado Pago dentro do fluxo do app.
  3. Webhook do Mercado Pago atualiza o status do agendamento para "confirmado" automaticamente.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Configuração do SDK Mercado Pago e criação de preferências de pagamento de sinal.
- [ ] 05-02: Implementação do webhook de pagamentos e transição automática de status de agendamento.

### Phase 6: Avaliações, Notificações & Admin Panel
**Goal**: Criar o sistema de avaliação mútua, notificações automatizadas no WhatsApp e o Painel Administrativo.
**Depends on**: Phase 5
**Requirements**: REV-01, REV-02, REV-03, REV-04, COMM-02, ADM-01, ADM-02, ADM-03, ADM-04, ADM-05
**Success Criteria** (what must be TRUE):
  1. Cliente e profissional conseguem se avaliar após o serviço concluído.
  2. Notificações do WhatsApp são enviadas automaticamente em status críticos do agendamento.
  3. Administrador consegue aprovar profissionais com envio de documentos e moderar denúncias/categorias em painel separado.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Sistema de avaliações bilaterais e denúncias de conduta.
- [ ] 06-02: Integração com WhatsApp Cloud API para notificações automáticas de status.
- [ ] 06-03: Painel administrativo para moderação, métricas e verificação de profissionais.

### Phase 7: Planos & Destaques (Monetização)
**Goal**: Implementar os planos de assinatura do profissional (Gratuito, Profissional, Destaque).
**Depends on**: Phase 6
**Requirements**: MON-01
**Success Criteria** (what must be TRUE):
  1. Profissional consegue alterar seu plano (Gratuito, Profissional, Destaque).
  2. Profissionais com plano Destaque aparecem em posições privilegiadas na busca.
**Plans**: 2 plans

Plans:
- [ ] 07-01: Configuração da tabela de planos e telas de assinatura do profissional.
- [ ] 07-02: Gating de features de planos e ordenação prioritária na busca.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Banco de Dados & Autenticação | 3/3 | Complete | 2026-06-28 |
| 2. Perfil Profissional & Serviços | 3/3 | Complete | 2026-06-30 |
| 3. Busca, Geolocalização & "Preciso Agora" | 3/3 | Complete | 2026-07-01 |
| 4. Agenda & Agendamentos | 3/3 | Complete | 2026-07-01 |
| 5. Integração de Pagamento | 0/2 | Not started | - |
| 6. Avaliações, Notificações & Admin | 0/3 | Not started | - |
| 7. Planos & Destaques | 0/2 | Not started | - |
