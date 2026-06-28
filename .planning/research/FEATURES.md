# Features Research: Solução Já

**Domain:** Regional service marketplace
**Researched:** 2026-06-28

## Table Stakes (Must Have — Users Leave Without These)

### Search & Discovery
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Category browsing with icons | Low | Categories table |
| Location-based search (city/neighborhood) | Medium | Geolocation setup |
| Proximity-based results (km) | Medium | PostGIS |
| Search filters (price, rating, distance, availability) | Medium | Indexed queries |
| Professional listing cards (photo, name, rating, distance, price) | Low | Profile data |
| "Preciso Agora" button (urgent availability) | Medium | is_available_now flag, schedule logic |

### Professional Profiles
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Public profile page (name, bio, photo) | Low | Auth, storage |
| Service listing with prices | Low | Services table |
| Portfolio gallery (work photos) | Medium | Storage, image optimization |
| Verified badge display | Low | Verification status |
| Average rating display | Low | Reviews aggregation |
| Service area indicator | Low | City/neighborhood data |
| WhatsApp contact button | Low | Phone number |

### Booking Flow
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Service selection | Low | Services table |
| Date/time picker from available slots | High | Schedule system |
| Booking request submission | Medium | Appointments table |
| Booking status tracking | Medium | State machine |
| Booking confirmation/rejection by professional | Medium | Notifications |

### Reviews & Ratings
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Client → Professional review (1-5 stars + comment) | Medium | Completed appointment |
| Professional → Client review | Medium | Completed appointment |
| Review display on profile | Low | Reviews query |
| Average rating calculation | Low | Database aggregation |

### Trust & Safety
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Professional identity verification (CPF/CNPJ) | High | External API |
| Admin approval workflow | Medium | Admin panel |
| Content reporting system | Medium | Reports table |
| Terms of use / Privacy policy | Low | Legal content |

### Authentication
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Email/password signup | Low | Supabase Auth |
| Role selection (client/professional) | Low | Auth flow |
| Password reset | Low | Supabase Auth |
| Session persistence | Low | Supabase SSR |
| Phone verification | Medium | SMS provider |

## Differentiators (Competitive Advantage)

### Regional Focus
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Neighborhood-level search | Medium | PostGIS, neighborhood data |
| "Profissionais perto de você" section | Medium | Geolocation |
| Regional category emphasis (beauty popular in GV) | Low | Category prioritization |
| Local professional highlighting | Low | Location matching |

### Urgency System ("Preciso Agora")
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Real-time availability toggle for professionals | Low | is_available_now flag |
| Urgent request flow (category → location → available professionals) | Medium | Composite query |
| "Disponível hoje" filter | Medium | Schedule + date logic |
| Priority listing for available-now professionals | Low | Sort order |

### Deposit System
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Configurable deposit (none/percentage/fixed) | Medium | Service configuration |
| Pix payment for deposit | High | Mercado Pago integration |
| Deposit status tracking | Medium | Payment webhooks |
| Auto-confirm booking after deposit | Medium | State machine + webhooks |

### Professional Dashboard
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Incoming request management (accept/reject) | Medium | Appointments |
| Schedule configuration (weekdays/hours) | Medium | Schedules table |
| Portfolio management (add/remove photos) | Medium | Storage |
| Earnings overview | Medium | Appointments + payments |
| Availability toggle | Low | Profile update |

### Monetization
| Feature | Complexity | Dependencies |
|---------|-----------|-------------|
| Professional subscription plans | High | Plans, subscriptions, payments |
| Featured/promoted listings | Medium | Plan status checks |
| Admin-managed promotions | Medium | Admin panel |

## Anti-Features (Do NOT Build in MVP)

| Feature | Reason | Reconsider When |
|---------|--------|----------------|
| In-app chat | WhatsApp handles all messaging; building chat is massive effort for marginal gain | 1000+ daily bookings where WhatsApp disintermediation is measurable |
| AI matching/recommendation | Manual search is sufficient for regional marketplace; ML needs data volume | 10,000+ completed bookings for training data |
| Video calls | Services are physical/in-person; video adds no value | Expansion to remote services |
| Bidding/auction pricing | Overly complex; fixed/from-price is standard in Brazil | Market demands price competition |
| Real-time tracking | Unnecessary for scheduled appointments; not Uber | On-demand same-hour service model |
| Multi-language | Regional focus, 100% Portuguese speakers | National expansion |
| Loyalty points/gamification | Adds complexity, marginal retention benefit in MVP | 5000+ active users |
| Subscription auto-renewal | Legal complexity in Brazil (consumer protection) | Stable payment infrastructure |
| Social features (follow, share) | Favorites covers the use case | Community-building phase |
| Push notifications | PWA push has poor mobile support; use WhatsApp instead | Native app launch |
| Complex analytics dashboard | Basic metrics sufficient for MVP | Need data-driven decisions |

---
*Researched: 2026-06-28*
