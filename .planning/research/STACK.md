# Stack Research: Solução Já

**Domain:** Regional service marketplace (PWA)
**Researched:** 2026-06-28

## Recommended Stack

### Frontend

| Technology | Version | Purpose | Confidence |
|-----------|---------|---------|------------|
| Next.js | 15.x | Framework (App Router) | ⬤⬤⬤ High |
| React | 19.x | UI library | ⬤⬤⬤ High |
| TypeScript | 5.x | Type safety | ⬤⬤⬤ High |
| Tailwind CSS | 4.x | Utility-first styling | ⬤⬤⬤ High |
| shadcn/ui | latest | Component library (Radix-based) | ⬤⬤⬤ High |
| Radix UI | latest | Accessible primitives | ⬤⬤⬤ High |
| React Hook Form | 7.x | Form handling | ⬤⬤⬤ High |
| Zod | 3.x | Schema validation | ⬤⬤⬤ High |
| TanStack Query | 5.x | Server state/caching | ⬤⬤○ Medium |
| Serwist/next-pwa | latest | PWA support | ⬤⬤○ Medium |
| Lucide React | latest | Icon library | ⬤⬤⬤ High |
| date-fns | 3.x | Date manipulation (pt-BR) | ⬤⬤⬤ High |
| nuqs | latest | URL search params state | ⬤⬤○ Medium |

**Rationale:** Next.js 15 App Router with Server Components gives optimal performance for SEO (important for service discovery) and reduces client bundle. shadcn/ui provides accessible, customizable components without vendor lock-in. Tailwind 4 is the standard for rapid UI development.

**PWA Setup:** Use Serwist (successor to next-pwa) for service worker generation. Configure:
- Offline fallback page
- Cache API responses (categories, professional profiles)
- Web app manifest with Solução Já branding
- Push notifications (future)

### Backend (Supabase)

| Technology | Purpose | Confidence |
|-----------|---------|------------|
| Supabase | BaaS (PostgreSQL + Auth + Storage + Realtime + Edge Functions) | ⬤⬤⬤ High |
| PostgreSQL | 15+ with PostGIS | ⬤⬤⬤ High |
| PostGIS | Geospatial queries | ⬤⬤⬤ High |
| Row Level Security | Multi-tenant data isolation | ⬤⬤⬤ High |
| Supabase Edge Functions | Webhook handlers (Deno) | ⬤⬤○ Medium |
| Server Actions | Mutations (Next.js) | ⬤⬤⬤ High |
| Supabase Realtime | Live booking updates | ⬤⬤○ Medium |

**When to use what:**
- **Server Actions:** All mutations (create booking, update profile, etc.)
- **Supabase Client (browser):** Read queries where RLS handles security
- **Server Components:** Initial data fetching with Supabase server client
- **Edge Functions:** Webhook handlers (Mercado Pago, WhatsApp) that need to run outside Next.js

### Database (PostgreSQL + PostGIS)

**Geospatial approach:** Use PostGIS with `geography(POINT, 4326)` columns.

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column
ALTER TABLE professionals ADD COLUMN location geography(POINT, 4326);

-- Create spatial index
CREATE INDEX idx_professionals_location ON professionals USING GIST (location);

-- Proximity query (within 10km)
SELECT *, ST_Distance(location, ST_MakePoint(-40.3128, -20.3155)::geography) AS distance_meters
FROM professionals
WHERE ST_DWithin(location, ST_MakePoint(-40.3128, -20.3155)::geography, 10000)
ORDER BY distance_meters;
```

**Indexing strategy:**
- GiST index on geography columns (proximity search)
- B-tree indexes on category_id, city, neighborhood (filter search)
- Composite index on (category_id, city, is_available_now) for "Preciso Agora"
- GIN index on name/bio for full-text search (pg_trgm)

### Authentication (Supabase Auth)

- Email/password signup (primary)
- Phone OTP via SMS (Brazilian phone numbers)
- Custom claims for roles: `{ role: 'client' | 'professional' | 'admin' }`
- Next.js Middleware for route protection at edge
- Supabase `@supabase/ssr` for server-side session management

### Storage (Supabase Storage)

- **Buckets:** `avatars`, `portfolios`, `documents` (for verification)
- **Image optimization:** Use Supabase image transformation (resize, WebP)
- **Access control:** RLS on storage buckets (professionals upload own portfolio)
- **CDN:** Supabase Storage serves via CDN automatically
- **Limits:** Set max file size (5MB images), allowed MIME types
- **EXIF stripping:** Remove GPS metadata from uploaded images (privacy/LGPD)

### Payments (Mercado Pago)

| Component | Purpose |
|-----------|---------|
| `mercadopago` (Node SDK) | Server-side payment creation |
| `@mercadopago/sdk-react` | Client-side checkout components |
| Pix | Primary payment method (instant, no fees for buyer) |
| Credit card | Secondary payment method |
| Webhooks | Payment status updates |

**Integration pattern:**
1. Server Action creates payment preference via Mercado Pago API
2. Client renders Pix QR code or card form
3. Mercado Pago sends webhook to Edge Function on status change
4. Edge Function updates appointment deposit_status
5. Supabase Realtime notifies both parties

**Sandbox:** Use Mercado Pago sandbox credentials for development. Test Pix with sandbox test users.

### Maps (Google Maps Platform)

| API | Purpose | Pricing |
|-----|---------|---------|
| Maps JavaScript API | Interactive maps on professional profile | $7/1000 loads |
| Geocoding API | Address → lat/lng conversion | $5/1000 requests |
| Places API | Address autocomplete | $17/1000 sessions |
| Distance Matrix API | Travel time estimates | $5/1000 elements |

**Cost optimization:**
- Use server-side geocoding (cache results in DB)
- Only load Maps JS API on pages that show maps (profile, search)
- Use Haversine formula for basic distance calculation (free, in PostGIS)
- Reserve Distance Matrix for "travel time" feature (not MVP)

### WhatsApp Business API

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| WhatsApp Cloud API (Meta) | Official, free tier, direct | Setup complexity, template approval | ✓ Recommended |
| Twilio | Easy integration, SDKs | Cost per message, middleman | Alternative |
| 360dialog | Good pricing, Brazil focus | Smaller company | Alternative |

**For MVP:** Use WhatsApp Cloud API directly.
- Template messages for: booking confirmation, booking reminder, review request
- Session messages (24h window) for interactive conversations
- Webhook via Edge Function for incoming messages

### Hosting (Vercel)

- **Deployment:** Automatic from git push
- **Environment variables:** Supabase URL/keys, Mercado Pago credentials, Google Maps API key, WhatsApp token
- **Edge Config:** Feature flags for A/B testing
- **Analytics:** Vercel Analytics for Web Vitals
- **Domains:** Custom domain for production

### Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit tests |
| Testing Library | Component tests |
| Playwright | E2E tests |
| MSW | API mocking |

## What NOT to Use

| Technology | Reason |
|-----------|--------|
| Pages Router (Next.js) | Legacy pattern, App Router is standard |
| Firebase | No PostGIS, vendor lock-in, worse PostgreSQL ecosystem |
| Prisma | Unnecessary layer over Supabase, adds complexity, doesn't support PostGIS well |
| Redux/Zustand | Over-engineering for server-state app, use TanStack Query + React context |
| Custom auth | Security risk, Supabase Auth is battle-tested |
| MongoDB | Relational data (bookings, reviews) needs PostgreSQL |
| GraphQL | REST/RPC via Supabase is simpler for this use case |
| Chakra UI / MUI | Heavier than shadcn/ui, harder to customize |
| Socket.io | Supabase Realtime handles WebSocket needs |
| Cloudinary | Supabase Storage handles images with transformations |

---
*Researched: 2026-06-28*
