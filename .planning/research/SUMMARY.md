# Research Summary: Solução Já

**Synthesized:** 2026-06-28
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

## Stack Recommendation

| Layer | Choice | Confidence |
|-------|--------|------------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui | ⬤⬤⬤ High |
| Backend | Supabase (PostgreSQL 15+ with PostGIS, Auth, Storage, Realtime, Edge Functions) | ⬤⬤⬤ High |
| Payments | Mercado Pago SDK + Pix (primary) + Card (secondary) | ⬤⬤⬤ High |
| Maps | Google Maps Platform (Maps JS API, Geocoding, Places) | ⬤⬤⬤ High |
| WhatsApp | WhatsApp Cloud API (Meta official) | ⬤⬤○ Medium |
| Hosting | Vercel (web) + Vercel (admin) — separate deployments | ⬤⬤⬤ High |
| Forms | React Hook Form + Zod validation | ⬤⬤⬤ High |
| PWA | Serwist (next-pwa successor) | ⬤⬤○ Medium |
| Testing | Vitest + Testing Library + Playwright | ⬤⬤⬤ High |
| Monorepo | Turborepo + pnpm workspaces | ⬤⬤⬤ High |

## Table Stakes (Must Ship)

1. **Auth & Registration** — Email/phone signup, role selection, session persistence
2. **Professional Profiles** — Bio, photo, services, prices, portfolio, verification badge
3. **Search & Filters** — Category, city/bairro, distance, rating, price, availability
4. **Booking System** — Request → Accept/Reject → Confirm → Complete state machine
5. **Reviews** — Bidirectional (client ↔ professional), post-completion only
6. **WhatsApp Contact** — Deep link with pre-filled message
7. **Admin Approval** — Professional verification workflow
8. **LGPD** — Privacy policy, consent, data deletion

## Key Differentiators

1. **"Preciso Agora"** — Urgent availability matching (is_available_now flag + same-day filter)
2. **Regional Focus** — Neighborhood-level search in Grande Vitória
3. **Deposit System** — Configurable Pix deposit to confirm bookings
4. **Semi-automatic Verification** — CPF/CNPJ API + admin confirmation
5. **Two-way Reviews** — Professional rates client too (trust both sides)

## Architecture Decisions

1. **Monorepo** — `apps/web` + `apps/admin` + `packages/database` + `packages/shared`
2. **PostGIS** — `geography(POINT, 4326)` with GiST indexes for proximity queries
3. **Server Actions** — All mutations via Next.js Server Actions
4. **RLS** — Simple policies on all tables (avoid JOINs in policies)
5. **State Machine** — Database functions enforce valid appointment transitions
6. **Materialized Views** — Pre-computed search data for performance
7. **Middleware** — Role-based route protection at edge

## Critical Watch-Outs

| Pitfall | Severity | Phase | Prevention |
|---------|----------|-------|------------|
| Cold start (no pros → no clients) | ⬤⬤⬤ Critical | Pre-launch | Seed 50+ real professionals before launch |
| Geolocation accuracy | ⬤⬤⬤ High | Phase 5 | Neighborhood fallback, never rely solely on GPS |
| Professional onboarding friction | ⬤⬤⬤ High | Phase 3 | Progressive profile completion (3 tiers) |
| LGPD non-compliance | ⬤⬤⬤ Critical | Phase 1-2 | Privacy policy, consent, EXIF stripping, data deletion |
| Location data exposure | ⬤⬤⬤ Critical | Phase 5 | Never return exact lat/lng in API, round to neighborhood |
| Pix edge cases | ⬤⬤⬤ High | Phase 8 | Expiration handling, idempotency, refund flow |
| Supabase RLS slowness | ⬤⬤○ Medium | Phase 1 | Simple policies only, materialized views for search |
| Review gaming | ⬤⬤○ Medium | Phase 9 | Require completed appointment, min comment length |
| Disintermediation | ⬤⬤⬤ High | Ongoing | Accept WhatsApp as feature, add value platform provides |

## Build Order

```
Phase 1: Database + Auth Foundation
Phase 2: Professional Profile + Services
Phase 3: Categories + Search + Geolocation
Phase 4: Booking + Schedule System
Phase 5: Payments (Mercado Pago/Pix)
Phase 6: Reviews + Trust
Phase 7: Communication (WhatsApp API)
Phase 8: Admin Panel
```

## Anti-Patterns to Avoid

- ❌ Don't build in-app chat (WhatsApp handles it)
- ❌ Don't build AI matching (manual search is fine for MVP)
- ❌ Don't build native app yet (PWA first)
- ❌ Don't process full service payments (only deposits)
- ❌ Don't build multi-region (Grande Vitória only)
- ❌ Don't use Pages Router, Firebase, Prisma, Redux, or custom auth

---
*Synthesized: 2026-06-28*
