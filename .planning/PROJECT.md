# Solução Já

## What This Is

Solução Já é um marketplace regional de serviços que conecta clientes a profissionais prestadores de serviço próximos na Grande Vitória/ES (Cariacica, Vila Velha, Vitória, Serra e Viana). O app funciona como uma plataforma de confiança local onde clientes encontram profissionais verificados por categoria, localização, disponibilidade e urgência, com o slogan "Chamou, resolveu."

## Core Value

O cliente deve conseguir encontrar, avaliar e contratar um profissional de confiança perto de si em poucos cliques — com rapidez, segurança e transparência.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Autenticação & Usuários:**
- [ ] Cadastro e login de cliente (email/telefone + senha)
- [ ] Cadastro e login de profissional
- [ ] Login de administrador
- [ ] Controle de permissões por tipo de usuário (client, professional, admin)
- [ ] Autenticação segura com senhas criptografadas
- [ ] Validação de e-mail ou telefone

**Perfil Profissional:**
- [ ] Perfil público com nome, bio, foto, cidade/bairro
- [ ] Cadastro de serviços por categoria com valores
- [ ] Portfólio de fotos dos trabalhos
- [ ] Região de atendimento (domicílio, espaço próprio ou ambos)
- [ ] Tempo médio de atendimento
- [ ] Selo "Profissional Verificado"
- [ ] Verificação semi-automática (CPF/CNPJ via API + confirmação admin)
- [ ] Disponibilidade imediata (toggle "disponível agora")

**Busca & Descoberta:**
- [ ] Busca por categoria, cidade, bairro
- [ ] Filtro por distância, avaliação, preço, disponibilidade
- [ ] Filtro "Profissional Verificado"
- [ ] Ordenação por proximidade (geolocalização)
- [ ] Página inicial com categorias principais
- [ ] Profissionais em destaque e próximos
- [ ] Botão "Preciso Agora" para serviços urgentes

**Agendamento:**
- [ ] Agenda configurável pelo profissional (dias/horários)
- [ ] Solicitação de agendamento pelo cliente
- [ ] Aceitar/recusar solicitações
- [ ] Status de agendamento (solicitado → confirmado → concluído)
- [ ] Política de sinal/reserva configurável pelo profissional
- [ ] Integração Mercado Pago/Pix para sinal

**Avaliação:**
- [ ] Cliente avalia profissional após atendimento
- [ ] Profissional avalia cliente após atendimento
- [ ] Média de avaliação no perfil

**Comunicação:**
- [ ] Botão "Chamar no WhatsApp"
- [ ] Integração WhatsApp Business API (notificações automáticas)

**Favoritos & Histórico:**
- [ ] Favoritar profissionais
- [ ] Histórico de serviços

**Administração:**
- [ ] Painel admin separado
- [ ] Aprovar/reprovar profissionais
- [ ] Gerenciar categorias
- [ ] Gerenciar denúncias
- [ ] Bloquear usuários
- [ ] Destacar profissionais
- [ ] Métricas do aplicativo

**Monetização:**
- [ ] Planos: Gratuito, Profissional, Destaque
- [ ] Cobrança de plano via pagamento
- [ ] Estrutura para taxa sobre agendamentos (futuro)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- App nativo (React Native/Expo) — MVP é PWA web-first, nativo planejado para v2+
- Chat interno no app — WhatsApp resolve comunicação, complexidade alta para MVP
- Pagamento completo do serviço pelo app — apenas sinal/reserva no MVP, pagamento direto futuro
- Taxa sobre agendamentos — estrutura preparada, mas não aplicada no MVP
- Múltiplos idiomas — apenas pt-BR para MVP regional
- Publicação em loja de apps — PWA funciona sem loja
- Sistema de cupons/descontos — complexidade desnecessária no MVP
- Matching automático por IA — busca manual é suficiente no MVP
- Videoconferência — não aplicável ao modelo de serviços presenciais

## Context

**Região alvo:** Grande Vitória/ES — Cariacica, Vila Velha, Vitória, Serra e Viana. Mercado regional com alta demanda por serviços domésticos e de beleza. Público-alvo inclui pessoas que buscam praticidade e profissionais que querem expandir sua clientela.

**Categorias iniciais:**
- **Beleza:** Manicure, Nail designer, Cabeleireira, Maquiagem, Sobrancelhas, Depilação
- **Casa:** Faxina, Diarista, Passadeira, Organização residencial
- **Manutenção:** Eletricista, Encanador, Pedreiro, Pintor, Montador de móveis, Marido de aluguel
- **Urgência:** Serviços disponíveis hoje, disponíveis agora, atendimento rápido

**Identidade visual:**
- Nome: Solução Já | Slogan: "Chamou, resolveu."
- Tom: moderno, confiável, regional, prático, imponente
- Cores: Azul escuro (confiança), Verde/Amarelo-dourado (ação/destaque), Branco (limpeza visual)
- Logo: elementos como pin de localização, check, raio de rapidez, símbolo de conexão
- Interface: moderna, limpa, responsiva, aparência de app, botões grandes, textos claros, poucos cliques

**Público-alvo:** Pessoas da Grande Vitória (baixa a média renda) que precisam de serviços domésticos/manutenção e profissionais autônomos locais que buscam mais clientes.

**Modelo de negócio (futuro):**
- Planos de assinatura para profissionais (Gratuito → Profissional → Destaque)
- Taxa sobre agendamentos confirmados (modelo marketplace)
- Ambos: planos + comissão

**LGPD:** O app lidará com dados pessoais, localização, telefone, fotos e informações de pagamento. Adequação à LGPD é obrigatória.

**Funcionalidade "Preciso Agora":**
1. Cliente clica em "Preciso Agora"
2. Escolhe categoria
3. Informa cidade/bairro ou usa localização
4. Sistema lista profissionais disponíveis (flag `is_available_now`)
5. Cliente pode chamar WhatsApp, solicitar orçamento ou agendar

**Fluxo de agendamento com sinal:**
- Profissional configura: sem sinal / 30% / 50% / valor fixo
- Status: Solicitado → Aguardando confirmação → Aguardando sinal → Confirmado → Em atendimento → Concluído / Cancelado
- Pagamento do sinal via Mercado Pago/Pix

## Constraints

- **Stack:** Next.js (PWA) + Supabase (PostgreSQL, Auth, Storage) + Vercel — decisão firme
- **Pagamentos:** Mercado Pago com Pix — integração desde o MVP para sinal
- **Mapas:** Google Maps API para geolocalização e cálculo de distância
- **WhatsApp:** WhatsApp Business API para notificações automáticas básicas
- **Idioma:** Português (BR) apenas
- **Admin:** Painel administrativo como app separado
- **Região:** Grande Vitória/ES como mercado inicial
- **Verificação:** Semi-automática (API de validação CPF/CNPJ + aprovação manual do admin)
- **Segurança:** Autenticação segura, LGPD, criptografia, controle de permissões

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA web-first com Next.js | Deploy rápido na Vercel, funciona em celular sem loja, menor custo para MVP regional | — Pending |
| Supabase como backend | PostgreSQL + Auth + Storage integrados, acelera desenvolvimento do MVP, escalável | — Pending |
| Mercado Pago/Pix desde o MVP | Integração de pagamento real para sinal, padrão brasileiro, confiável | — Pending |
| Google Maps API | Mais familiar no Brasil, boa cobertura da Grande Vitória, cálculo de distância preciso | — Pending |
| WhatsApp Business API básica | Notificações automáticas melhoram UX, WhatsApp é o canal dominante no Brasil | — Pending |
| Painel admin separado | Separação de concerns, segurança, pode evoluir independentemente | — Pending |
| Verificação semi-automática | CPF/CNPJ via API reduz trabalho manual, admin confirma para confiança | — Pending |
| Modelo taxa + planos | Diversifica receita: planos para profissionais + comissão por agendamento | — Pending |
| Português apenas | MVP regional para Grande Vitória, simplifica desenvolvimento | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-28 after initialization*
