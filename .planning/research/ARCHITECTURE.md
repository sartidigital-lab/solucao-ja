# Architecture Research: Solução Já

**Domain:** Regional service marketplace
**Researched:** 2026-06-28

## Component Architecture

### Monorepo Structure

```
solucao-ja/
├── apps/
│   ├── web/                    # Client + Professional PWA (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, register, role selection
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   ├── (client)/       # Client-facing pages
│   │   │   │   ├── page.tsx    # Home (categories, nearby, featured)
│   │   │   │   ├── busca/      # Search with filters
│   │   │   │   ├── profissional/[id]/ # Professional profile
│   │   │   │   ├── agendar/    # Booking flow
│   │   │   │   ├── meus-agendamentos/
│   │   │   │   ├── favoritos/
│   │   │   │   └── perfil/     # Client profile
│   │   │   ├── (professional)/ # Professional dashboard
│   │   │   │   ├── painel/     # Dashboard home
│   │   │   │   ├── servicos/   # Manage services
│   │   │   │   ├── agenda/     # Schedule management
│   │   │   │   ├── portfolio/  # Portfolio management
│   │   │   │   ├── solicitacoes/ # Incoming requests
│   │   │   │   └── configuracoes/ # Settings
│   │   │   ├── api/
│   │   │   │   ├── webhooks/
│   │   │   │   │   ├── mercadopago/route.ts
│   │   │   │   │   └── whatsapp/route.ts
│   │   │   │   └── cron/       # Scheduled tasks
│   │   │   ├── manifest.ts     # PWA manifest
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # Shared components
│   │   ├── lib/                # Utilities, Supabase client, etc.
│   │   ├── hooks/              # Custom React hooks
│   │   ├── actions/            # Server Actions
│   │   └── types/              # TypeScript types
│   └── admin/                  # Admin panel (separate Next.js app)
│       ├── app/
│       │   ├── profissionais/  # Professional approval
│       │   ├── denuncias/      # Reports management
│       │   ├── categorias/     # Category management
│       │   ├── usuarios/       # User management
│       │   ├── metricas/       # Analytics dashboard
│       │   └── layout.tsx
│       └── ...
├── packages/
│   ├── database/               # Supabase types, migrations, seed data
│   │   ├── migrations/
│   │   ├── seed/
│   │   └── types.ts            # Generated types from Supabase
│   ├── shared/                 # Shared utilities, constants, validators
│   │   ├── constants/          # Categories, cities, status enums
│   │   ├── validators/         # Zod schemas
│   │   └── utils/              # Shared helper functions
│   └── ui/                     # Shared UI components (if any)
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge Functions (Deno)
│   └── config.toml
├── turbo.json                  # Turborepo config
├── package.json
└── pnpm-workspace.yaml
```

### Middleware Architecture

```typescript
// apps/web/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Get session from Supabase
  // 2. Check route group:
  //    - (auth)/* → redirect to dashboard if logged in
  //    - (professional)/* → require role=professional
  //    - (client)/* → allow authenticated users
  // 3. Redirect unauthorized to login
}
```

## Data Flow

### Search Flow
```
Client browser
  → Server Component (fetch with Supabase server client)
    → PostGIS query: ST_DWithin + category filter + availability filter
      → RLS: only approved professionals visible
    → Return professional cards (photo, name, rating, distance, price)
  → Client Component: interactive filters (re-fetch via TanStack Query)
```

### Booking Flow
```
Client selects service + date/time
  → Server Action: create appointment (status=solicitado)
    → Supabase insert with RLS
    → Supabase Realtime → Professional dashboard notification
  → Professional accepts/rejects
    → Server Action: update status
    → If requires deposit:
      → Server Action: create Mercado Pago payment
      → Client pays Pix
      → Webhook → Edge Function → update deposit_status
      → Status: confirmado
    → If no deposit:
      → Status: confirmado
  → WhatsApp notification to both parties
```

### Payment Flow (Mercado Pago)
```
Server Action creates preference
  → Mercado Pago API returns payment data (Pix QR code or card form)
  → Client renders payment UI
  → Client pays
  → Mercado Pago sends webhook to /api/webhooks/mercadopago
    → Verify webhook signature
    → Update appointment.deposit_status
    → If paid → update appointment.status to 'confirmado'
    → Send WhatsApp confirmation to both parties
```

## Database Design

### PostGIS Setup

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search
CREATE EXTENSION IF NOT EXISTS unaccent; -- For accent-insensitive search (Portuguese)

-- Geography columns on professionals table
ALTER TABLE professionals ADD COLUMN location geography(POINT, 4326);

-- Update location from lat/lng
CREATE OR REPLACE FUNCTION update_professional_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_MakePoint(NEW.longitude, NEW.latitude)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_professional_location();
```

### RLS Policies

```sql
-- Professionals: only approved ones visible to public
CREATE POLICY "Public can view approved professionals"
  ON professionals FOR SELECT
  USING (verification_status = 'approved');

-- Professionals: own profile management
CREATE POLICY "Professional can manage own profile"
  ON professionals FOR ALL
  USING (auth.uid() = user_id);

-- Appointments: client can see own appointments
CREATE POLICY "Client can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = client_id);

-- Appointments: professional can see own appointments
CREATE POLICY "Professional can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM professionals WHERE id = appointments.professional_id
  ));

-- Admin: full access via service role (Edge Functions)
```

### Appointment State Machine

```sql
-- Valid status transitions
CREATE OR REPLACE FUNCTION validate_appointment_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Define valid transitions
  IF OLD.status = 'solicitado' AND NEW.status NOT IN ('aguardando_confirmacao', 'cancelado_cliente') THEN
    RAISE EXCEPTION 'Invalid transition from solicitado to %', NEW.status;
  END IF;
  
  IF OLD.status = 'aguardando_confirmacao' AND NEW.status NOT IN ('aguardando_sinal', 'confirmado', 'cancelado_profissional') THEN
    RAISE EXCEPTION 'Invalid transition from aguardando_confirmacao to %', NEW.status;
  END IF;
  
  IF OLD.status = 'aguardando_sinal' AND NEW.status NOT IN ('confirmado', 'cancelado_cliente', 'cancelado_profissional') THEN
    RAISE EXCEPTION 'Invalid transition from aguardando_sinal to %', NEW.status;
  END IF;
  
  -- ... more transitions
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Materialized Views for Search

```sql
-- Pre-computed professional search view
CREATE MATERIALIZED VIEW professional_search AS
SELECT 
  p.id,
  p.professional_name,
  p.bio,
  p.city,
  p.neighborhood,
  p.location,
  p.average_rating,
  p.total_reviews,
  p.is_available_now,
  p.verified_badge,
  u.profile_photo,
  array_agg(DISTINCT c.name) AS category_names,
  array_agg(DISTINCT c.slug) AS category_slugs,
  min(s.price) AS min_price,
  max(s.price) AS max_price,
  ps.plan_id,
  ps.status AS subscription_status
FROM professionals p
JOIN users u ON p.user_id = u.id
JOIN services s ON s.professional_id = p.id AND s.active = true
JOIN categories c ON s.category_id = c.id
LEFT JOIN professional_subscriptions ps ON ps.professional_id = p.id AND ps.status = 'active'
WHERE p.verification_status = 'approved'
GROUP BY p.id, u.profile_photo, ps.plan_id, ps.status;

-- Refresh periodically (or on relevant changes)
REFRESH MATERIALIZED VIEW CONCURRENTLY professional_search;
```

## Real-time Architecture

```typescript
// Professional dashboard: listen for new booking requests
supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'appointments',
    filter: `professional_id=eq.${professionalId}`
  }, (payload) => {
    // Show notification: "Nova solicitação de agendamento!"
    showNotification(payload.new);
  })
  .subscribe();
```

## API Patterns

| Use Case | Pattern | Why |
|----------|---------|-----|
| Create booking | Server Action | Needs server-side validation + webhook calls |
| Update profile | Server Action | Needs auth verification + file upload |
| Search professionals | Supabase client + TanStack Query | Client-side filtering, caching, pagination |
| Fetch profile data | Server Component | SSR for SEO, single render |
| Process payment webhook | API Route | External callback, no Next.js context |
| WhatsApp notification | Edge Function | Async, doesn't block request |

## Build Order

```mermaid
graph TD
    A[1. Database Schema + Migrations] --> B[2. Auth + User Registration]
    B --> C[3. Professional Profile]
    B --> D[3. Client Profile]
    C --> E[4. Categories + Services]
    E --> F[5. Search + Geolocation]
    C --> G[6. Schedule Management]
    F --> H[7. Booking Flow]
    G --> H
    H --> I[8. Payments (Mercado Pago)]
    H --> J[9. Reviews & Ratings]
    I --> K[10. WhatsApp Notifications]
    J --> K
    K --> L[11. Admin Panel]
    L --> M[12. Monetization (Plans)]
```

**Dependencies are strict:** Each numbered item depends on everything above it.

## Admin Panel Architecture

- **Separate Next.js app** in `apps/admin/`
- **Shared database types** from `packages/database/`
- **Service role key** for admin operations (bypasses RLS)
- **Admin auth:** Separate Supabase project or admin-only role check
- **Deploy:** Separate Vercel project with restricted access (IP whitelist or VPN)

---
*Researched: 2026-06-28*
