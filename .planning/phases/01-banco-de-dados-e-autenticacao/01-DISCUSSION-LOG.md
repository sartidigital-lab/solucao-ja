# Phase 1: Banco de Dados & Autenticação - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-28
**Phase:** 1-Banco de Dados & Autenticação
**Areas discussed:** Autenticação Primária, Organização do Monorepo, Verificação de Documentos (CPF/CNPJ)

---

## Autenticação Primária

### Como os profissionais devem realizar o cadastro e login inicial no MVP?
| Option | Description | Selected |
|--------|-------------|----------|
| E-mail e senha padrão | Simplifica infraestrutura e tem custo zero no MVP | ✓ |
| Telefone via OTP / SMS | Ideal para o mercado brasileiro, mas requer integração paga de SMS | |
| Ambos | E-mail/senha como padrão, telefone OTP opcional no futuro | |

### Qual método de autenticação padrão para os clientes no MVP?
| Option | Description | Selected |
|--------|-------------|----------|
| Apenas e-mail e senha no MVP | Foco em simplicidade e escopo enxuto | |
| Incluir Login com Google já no MVP | Melhor conversão para clientes | ✓ |
| Login sem senha via Magic Link por e-mail | Conveniência, porém suscetível a spam | |

### Como deseja validar os dados de contato (e-mail e telefone) dos profissionais no MVP?
| Option | Description | Selected |
|--------|-------------|----------|
| Confirmar e-mail via Supabase + validação visual do telefone pelo admin | Custo zero e verificação inicial aceitável | ✓ |
| Exigir validação de telefone via SMS OTP no cadastro do profissional | Segurança máxima, mas tem custo recorrente | |
| Sem validação de e-mail/telefone no cadastro | Admin confere tudo apenas na fase de aprovação | |

### Como será gerenciado o controle de acesso e permissões baseados em papéis (roles)?
| Option | Description | Selected |
|--------|-------------|----------|
| Custom Claims no JWT do Supabase + Middleware de rota | Mais rápido, seguro e performático | ✓ |
| Row Level Security (RLS) consultando a tabela de profiles no banco | Clássico, porém gera consulta extra no banco | |
| Ambos combinados | Custom Claims para rotas + RLS para segurança no banco de dados | |

---

## Organização do Monorepo

### Como estruturar a organização do Monorepo do Solução Já?
| Option | Description | Selected |
|--------|-------------|----------|
| Turborepo + pnpm workspaces | Proporciona excelente isolamento de código e compartilhamento de tipos e constantes | ✓ |
| Único projeto Next.js | Admin e PWA no mesmo código usando subdomínios / subpastas | |

---

## Verificação de Documentos (CPF/CNPJ)

### Como deve ser o fluxo de verificação de documentos (CPF/CNPJ) dos profissionais?
| Option | Description | Selected |
|--------|-------------|----------|
| Validação via API pública (BrasilAPI/ReceitaWS) no cadastro + Aprovação manual do admin depois | Reduz erros de digitação e fraudes simples em tempo real | ✓ |
| Apenas digitação simples + Envio de foto do documento + Validação manual offline pelo admin | Sem integrações externas no MVP | |

---

## the agent's Discretion
- Escolha e setup detalhado das ferramentas do Monorepo (Turborepo, pnpm workspaces, ESLint, TypeScript).
- Detalhes de design das páginas de autenticação no frontend (reaproveitando shadcn/ui e paleta de cores institucional).

## Deferred Ideas
- Login via SMS OTP para profissionais.
- Chat interno no app.
