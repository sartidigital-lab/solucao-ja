# Pitfalls Research: Solução Já

**Domain:** Regional service marketplace (Brazil)
**Researched:** 2026-06-28

## Critical Technical Pitfalls

### 1. Geolocation Accuracy in Brazil
**Risk:** ⬤⬤⬤ High
**Phase:** 5 (Search + Geolocation)

**Warning signs:** Users report wrong distances, professionals not appearing in nearby search.

**Prevention:**
- Use neighborhood as primary fallback, not just GPS coordinates
- Store both: precise lat/lng AND city/neighborhood text
- When GPS unavailable (common on desktop), allow manual city/bairro selection
- Use bounding box pre-filter (cheaper) before precise distance calculation
- Test with real addresses in Cariacica, Vila Velha, Vitória, Serra, Viana

**Mitigation:** Allow users to manually set their neighborhood. Show "~3 km" (approximate) not "2.847 km" (false precision).

### 2. Supabase RLS Performance
**Risk:** ⬤⬤○ Medium
**Phase:** 1 (Database Schema)

**Warning signs:** Search queries taking >500ms, dashboard loading slowly.

**Prevention:**
- Keep RLS policies simple (avoid JOINs in policies)
- Use `auth.uid()` comparisons only (fast)
- For complex access patterns, use database functions with `SECURITY DEFINER`
- Pre-compute data in materialized views (search results)
- Test with 1000+ rows to catch performance issues early

### 3. PostGIS N+1 Query Problem
**Risk:** ⬤⬤⬤ High
**Phase:** 5 (Search)

**Warning signs:** Search page takes 3+ seconds, database CPU spikes.

**Prevention:**
- Always use `ST_DWithin()` with spatial index (GiST), never `ST_Distance()` alone for filtering
- Use bounding box pre-filter: `WHERE location && ST_Expand(ST_MakePoint(...)::geography, 10000)`
- Paginate results (20 per page max)
- Use materialized view for search (pre-joined data)
- Index: `CREATE INDEX ON professionals USING GIST (location);`

### 4. Next.js PWA Service Worker Conflicts
**Risk:** ⬤⬤○ Medium
**Phase:** All (setup early)

**Warning signs:** Stale data after profile update, Supabase Realtime disconnects.

**Prevention:**
- Configure service worker to NOT cache API routes and Supabase endpoints
- Use `networkFirst` strategy for dynamic content
- Use `cacheFirst` only for static assets (images, fonts, CSS)
- Test PWA behavior in Chrome DevTools Application tab
- Add version header to force cache bust on deploy

### 5. Image Upload Without Processing
**Risk:** ⬤⬤○ Medium
**Phase:** 3 (Professional Profile)

**Warning signs:** Page loads slowly (unoptimized 5MB photos), storage costs spike.

**Prevention:**
- Compress images client-side before upload (use browser-image-compression)
- Set max file size: 2MB after compression
- Strip EXIF metadata (contains GPS data — LGPD concern)
- Use Supabase Storage image transformations for display (thumbnails, WebP)
- Validate MIME type server-side (not just extension)

## Product Pitfalls

### 6. Cold Start Problem (Chicken-and-Egg)
**Risk:** ⬤⬤⬤ Critical
**Phase:** Pre-launch

**Warning signs:** Clients search and find 0 professionals; professionals sign up and get 0 requests.

**Prevention:**
- Seed with 50+ real professionals in Grande Vitória BEFORE public launch
- Start with 1-2 categories only (e.g., Beleza + Manutenção)
- Offer free "Plano Destaque" for first 100 professionals
- Allow professionals to list WITHOUT verification initially (flag as "em verificação")
- Manually onboard professionals from existing WhatsApp groups/Facebook groups in the region
- Show "coming soon" for categories with <3 professionals

### 7. Professional Onboarding Friction
**Risk:** ⬤⬤⬤ High
**Phase:** 3 (Professional Profile)

**Warning signs:** High signup-to-completion drop-off, professionals abandon during registration.

**Prevention:**
- Allow progressive profile completion:
  1. Step 1 (required): Name, phone, CPF, category → immediately visible as "Perfil Incompleto"
  2. Step 2 (encouraged): Bio, photo, services, prices → visible but no badge
  3. Step 3 (optional): Portfolio, schedule, documents → Verified badge eligible
- Never require schedule setup to be listed
- Show completion percentage on professional dashboard
- Send WhatsApp reminder to complete profile after 3 days

### 8. Review Gaming
**Risk:** ⬤⬤○ Medium
**Phase:** 9 (Reviews)

**Warning signs:** New accounts with 5-star reviews, same IP/device patterns.

**Prevention:**
- Only allow review AFTER completed appointment (verified by state machine)
- One review per appointment (enforced by unique constraint)
- Minimum 10-word comment to submit (prevents "bom" spam)
- Admin moderation queue for first reviews of each professional
- Show "X avaliações verificadas" (verified reviews count)

### 9. Disintermediation (Users Leave Platform)
**Risk:** ⬤⬤⬤ High (inherent to marketplace)
**Phase:** Ongoing

**Warning signs:** High first-booking rate, low repeat booking rate.

**Prevention (accept and add value):**
- WhatsApp integration IS the feature (don't fight it)
- Add value that WhatsApp alone can't provide: scheduling, reminders, portfolio, reviews, discovery
- Track but don't prevent WhatsApp sharing
- In v2: loyalty features, booking history, auto-reminders that keep users coming back

## Brazilian Market Specifics

### 10. Pix Edge Cases
**Risk:** ⬤⬤⬤ High
**Phase:** 8 (Payments)

**Warning signs:** Payments stuck as "pending", QR codes expired, double payments.

**Prevention:**
- Set Pix QR code expiration: 30 minutes (default)
- Implement polling for payment status (Mercado Pago webhook + client polling)
- Handle "pending" state gracefully (show timer, allow re-generation)
- Test with real Pix in sandbox (Mercado Pago test accounts)
- Handle idempotency: same appointment can't generate multiple payments
- Handle refund flow: if professional cancels after Pix paid

### 11. CPF/CNPJ Validation
**Risk:** ⬤⬤○ Medium
**Phase:** 3 (Professional Profile + Verification)

**Warning signs:** Informal workers can't register, validation API downtime blocks signup.

**Prevention:**
- Accept BOTH CPF and CNPJ (many professionals are informal/MEI)
- Use CPF validation as format check (algorithm validation), not as identity verification
- Make document validation async (don't block registration)
- Allow professional to appear as "em verificação" while documents are processed
- Use API like ReceitaWS or BrasilAPI for CNPJ lookup (free tier available)
- Have fallback: if API is down, queue for manual admin review

### 12. LGPD Compliance
**Risk:** ⬤⬤⬤ Critical
**Phase:** 1-2 (Foundation)

**Warning signs:** No privacy policy, location data stored without consent, no data deletion flow.

**Prevention:**
- Display privacy policy and terms before registration (checkbox required)
- Explain what data is collected and why (location, phone, photos)
- Implement "right to delete" — user can delete account and all associated data
- Strip EXIF from uploaded images (contains GPS)
- Don't expose exact coordinates in API responses (round to neighborhood)
- Store consent timestamps
- Cookie banner for web analytics
- Audit data retention: auto-delete old appointment data after 2 years

### 13. WhatsApp API Restrictions
**Risk:** ⬤⬤○ Medium
**Phase:** 10 (Notifications)

**Warning signs:** Template messages rejected by Meta, messages not delivered.

**Prevention:**
- Submit template messages for approval EARLY (24-48h approval time)
- Keep templates simple: booking confirmation, reminder, review request
- Session messages (free-form) only work within 24h of user's last message
- Don't send marketing messages without opt-in (WhatsApp policy violation)
- Have fallback: email notification if WhatsApp fails
- Rate limits: 80 messages/second for new numbers (scales with quality)

## Security Pitfalls

### 14. Location Data Exposure
**Risk:** ⬤⬤⬤ Critical
**Phase:** 5 (Search)

**Warning signs:** Exact home addresses visible in network tab, stalking risk.

**Prevention:**
- NEVER return exact lat/lng in search results API
- Round coordinates to ~500m for distance display
- Show "Bairro X, Cidade Y" instead of street address
- Exact address only shared after booking confirmed (and only to the other party)
- Use server-side distance calculation, don't send coordinates to client for calculation
- Professional controls what address info is public

### 15. PII in URLs and Logs
**Risk:** ⬤⬤○ Medium
**Phase:** 2 (Auth)

**Warning signs:** Phone numbers in URL params, emails in error logs.

**Prevention:**
- Use UUIDs for all public-facing identifiers (professional profile URLs)
- Never put phone, email, CPF in URL parameters
- Sanitize error logs (mask PII before logging)
- Use Supabase row-level security to prevent unauthorized data access
- Professional page: `/profissional/[uuid]` not `/profissional/[phone]`

### 16. Unvalidated File Uploads
**Risk:** ⬤⬤⬤ High
**Phase:** 3 (Portfolio)

**Warning signs:** Server crashes from malformed files, XSS via SVG upload.

**Prevention:**
- Validate MIME type server-side (not just Content-Type header)
- Block SVG uploads (XSS vector)
- Allow only: JPEG, PNG, WebP
- Max file size: 5MB before compression, 2MB after
- Use Supabase Storage policies to restrict upload to own bucket
- Scan for malware if budget allows (or use Cloudflare WAF)

---
*Researched: 2026-06-28*
