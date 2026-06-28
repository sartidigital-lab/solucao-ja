# Phase 1: Banco de Dados & Autenticação - Context

**Gathered:** 2026-06-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase compreende a configuração inicial do banco de dados no Supabase, a criação do schema relacional correspondente e a implementação da autenticação segura no PWA Next.js 16 (App Router) e no aplicativo Admin separado, com restrição de acesso baseada no papel (role) do usuário.

</domain>

<decisions>
## Implementation Decisions

### Autenticação Primária
- **D-01:** Profissionais e Administradores farão cadastro/login usando **e-mail e senha** por padrão (custo zero, simplicidade de infraestrutura no MVP).
- **D-02:** Clientes contarão com a integração de **Login com Google** desde o início do MVP para maximizar a conversão de contratação.
- **D-03:** A validação dos dados de contato do profissional exigirá a confirmação de e-mail via Supabase Auth. O telefone será validado visualmente pelo administrador no painel de aprovação (sem custo extra com SMS no MVP).
- **D-04:** O controle de acesso a rotas privadas será baseado em **Custom Claims no JWT** injetados pelo Supabase Auth e validados pelo Next.js Middleware.

### Organização do Monorepo
- **D-05:** O projeto será organizado como um monorepo real usando **Turborepo e pnpm workspaces** (`apps/web` para o PWA, `apps/admin` para o painel admin, `packages/database` para schemas/types e `packages/shared` para validações/constantes).

### Verificação de Documentos (CPF/CNPJ)
- **D-06:** O cadastro de profissionais incluirá validação síncrona do CPF/CNPJ via API pública (BrasilAPI/ReceitaWS) para evitar erros de preenchimento, seguido de aprovação manual pelo administrador no painel.

### the agent's Discretion
- Escolha da biblioteca de ícones adequada para os botões do monorepo.
- Configuração do setup de testes iniciais e linters do monorepo.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento & Contexto
- `.planning/PROJECT.md` — Core values, target region, and scope boundaries.
- `.planning/REQUIREMENTS.md` — Requirement traceability and definitions.
- `.planning/ROADMAP.md` — Milestone timeline and phase dependencies.

### Pesquisa Técnica
- `.planning/research/STACK.md` — Recommended versions, Serwist PWA setup, and Turborepo instructions.
- `.planning/research/ARCHITECTURE.md` — Schema designs, middleware configuration, and data flows.
- `.planning/research/PITFALLS.md` — RLS performance caveats and LGPD compliance checklist.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- N/A — Greenfield project starting from an empty directory.

### Established Patterns
- N/A — This phase will establish the project's base monorepo structure, folder layout, and styling.

### Integration Points
- This phase sets up the database schema and custom triggers in Supabase, which will be integrated directly with Next.js Server Actions in all future phases.

</code_context>

<specifics>
## Specific Ideas

- O formulário de cadastro do profissional deve ser progressivo, começando apenas pelos dados básicos (Nome, Email, Telefone, Categoria e CPF/CNPJ) no primeiro passo para reduzir abandono.

</specifics>

<deferred>
## Deferred Ideas

- Login via SMS OTP / telefone para profissionais (planejado para v2+ ou pós-MVP).
- Chat em tempo real embutido no app (WhatsApp cobre essa função no MVP).

</deferred>

---

*Phase: 1-Banco de Dados & Autenticação*
*Context gathered: 2026-06-28*
