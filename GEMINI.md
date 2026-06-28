# Solução Já - Guia do Projeto

<!-- GSD:project-start source:PROJECT.md -->
## Project

Solução Já é um marketplace regional de serviços que conecta clientes a profissionais prestadores de serviço próximos na Grande Vitória/ES (Cariacica, Vila Velha, Vitória, Serra e Viana). O app funciona como uma plataforma de confiança local onde clientes encontram profissionais verificados por categoria, localização, disponibilidade e urgência, com o slogan "Chamou, resolveu."

### Core Value
O cliente deve conseguir encontrar, avaliar e contratar um profissional de confiança perto de si em poucos cliques — com rapidez, segurança e transparência.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui.
- **Backend & Database**: Supabase (PostgreSQL 15+ com PostGIS para consultas geoespaciais, Auth, Storage, Realtime e Edge Functions).
- **Pagamentos**: SDK do Mercado Pago (Pix como principal, cartões secundário).
- **Mapas**: Google Maps Platform (Maps JS API, Geocoding, Places API).
- **WhatsApp**: WhatsApp Cloud API oficial (Meta) para notificações e alertas automáticos.
- **Hospedagem**: Vercel (apps separados para o PWA principal e Painel Administrativo).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- **Componentes**: React Server Components (RSC) por padrão para renderização veloz e SEO. `'use client'` apenas onde houver interatividade (modais, formulários, mapas).
- **Estilos**: Tailwind CSS 4 usando a sintaxe nativa CSS-first (configurações no arquivo CSS principal, sem tailwind.config.js).
- **Formulários**: React Hook Form + validação com schemas Zod.
- **Escrita/Mutação de Dados**: Next.js Server Actions para todas as mutações e submissões de formulário do usuário.
- **Geolocalização**: Uso obrigatório do tipo `geography(POINT, 4326)` do PostGIS com indexação GiST para buscas rápidas por proximidade.
- **Segurança**: Habilitar RLS (Row Level Security) em todas as tabelas do Supabase. Evitar JOINs complexos dentro das políticas de RLS.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

- **Next.js App Router**: Uso de Route Groups para separar responsabilidades de rotas públicas `(public)`, autenticadas do cliente `(dashboard)` e painel do profissional `(profissional)`.
- **Monorepo**: Turborepo com workspaces `pnpm`. Estrutura com `apps/web`, `apps/admin`, `packages/database` e `packages/shared`.
- **Busca**: Consultas geoespaciais executadas via RPC Postgres encapsulado com filtros de proximidade PostGIS (`ST_DWithin` + índice GiST) e busca textual (FTS com `pg_trgm`).
- **Estado de Reservas**: Máquina de estados para status de agendamento (solicitado → aguardando confirmação → aguardando sinal → confirmado → concluído/cancelado).
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
