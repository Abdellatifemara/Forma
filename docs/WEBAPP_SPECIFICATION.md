# Forma Web Application Specification

## Overview

The Forma webapp serves different purposes than the mobile app:
1. **Admin Dashboard** - Platform management
2. **Trainer Dashboard** - Client management, program creation
3. **Marketing Website** - Landing pages, app store links
4. **User Web Portal** - Limited features for desktop users

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Zustand or Jotai
- **Charts:** Recharts or Chart.js
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod

### Backend (Shared with Mobile)
- **API:** NestJS (same as mobile)
- **Database:** PostgreSQL (shared)
- **Auth:** Same JWT system as mobile

### Deployment
- **Hosting:** Vercel or Cloudflare Pages
- **CDN:** Cloudflare
- **Domain:** formaeg.com

---

## 1. Marketing Website

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/features` | Feature overview |
| `/pricing` | Subscription tiers |
| `/trainers` | Become a trainer |
| `/about` | About Forma |
| `/contact` | Contact form |
| `/blog` | Fitness articles (SEO) |
| `/download` | App store links |

### Landing Page Sections

```
┌─────────────────────────────────────────────────┐
│  HERO                                           │
│  "Shape Your Future with Forma"                 │
│  [Download on iOS] [Get on Android]             │
├─────────────────────────────────────────────────┤
│  FEATURES (3-column grid)                       │
│  - AI-Powered Workouts                          │
│  - Egyptian Nutrition Database                  │
│  - Verified Trainers                            │
├─────────────────────────────────────────────────┤
│  HOW IT WORKS (4 steps)                         │
│  1. Set Goals → 2. Get Plan → 3. Train → 4. Win│
├─────────────────────────────────────────────────┤
│  TESTIMONIALS (carousel)                        │
│  Real Egyptian users, Arabic quotes             │
├─────────────────────────────────────────────────┤
│  PRICING TABLE                                  │
│  Free | Premium | Premium+                      │
├─────────────────────────────────────────────────┤
│  TRAINER CTA                                    │
│  "Are you a trainer? Join our marketplace"      │
├─────────────────────────────────────────────────┤
│  FOOTER                                         │
│  Links, Social, Legal                           │
└─────────────────────────────────────────────────┘
```

### SEO Requirements

- Meta tags for all pages
- Open Graph / Twitter cards
- Structured data (JSON-LD)
- Arabic and English versions
- Sitemap.xml
- robots.txt

---

## 2. User Web Portal

### Limited Feature Set

Users can access basic features via web, but mobile is primary:

| Feature | Web | Mobile |
|---------|-----|--------|
| View workout plan | ✓ | ✓ |
| Log workout | ✗ | ✓ |
| View meal plan | ✓ | ✓ |
| Log meals | ✗ | ✓ |
| View progress | ✓ | ✓ |
| Upload photos | ✗ | ✓ |
| Chat with trainer | ✓ | ✓ |
| Manage subscription | ✓ | ✓ |
| Account settings | ✓ | ✓ |
| View exercises | ✓ | ✓ |
| Watch videos | ✓ | ✓ |

### Web Portal Routes

| Route | Page |
|-------|------|
| `/app` | Dashboard redirect |
| `/app/workouts` | View workout plan |
| `/app/nutrition` | View meal plan |
| `/app/progress` | View progress charts |
| `/app/exercises` | Exercise library |
| `/app/messages` | Chat with trainer |
| `/app/settings` | Account settings |
| `/app/subscription` | Manage subscription |

### Authentication Flow

```
User visits /app
    ↓
Not logged in? → Redirect to /login
    ↓
Login options:
  - Email/Password
  - Google OAuth
  - Apple Sign-In
  - Phone (OTP)
    ↓
After login → /app/workouts (default)
```

---

## 3. Trainer Dashboard

### Purpose
Full-featured dashboard for trainers to manage their business.

### Routes

| Route | Page |
|-------|------|
| `/trainer` | Dashboard home |
| `/trainer/clients` | Client list |
| `/trainer/clients/:id` | Client detail |
| `/trainer/programs` | Program templates |
| `/trainer/programs/new` | Create program |
| `/trainer/calendar` | Schedule view |
| `/trainer/messages` | All conversations |
| `/trainer/earnings` | Revenue & payouts |
| `/trainer/profile` | Public profile editor |
| `/trainer/settings` | Account settings |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (fixed)          │  MAIN CONTENT            │
│  ───────────────          │                          │
│  🏠 Dashboard             │  ┌──────────────────────┐│
│  👥 Clients               │  │ Stats Cards          ││
│  📋 Programs              │  │ Active: 12           ││
│  📅 Calendar              │  │ Pending: 3           ││
│  💬 Messages (5)          │  │ Revenue: EGP 18,000  ││
│  💰 Earnings              │  └──────────────────────┘│
│  👤 Profile               │                          │
│  ⚙️ Settings              │  ┌──────────────────────┐│
│                           │  │ Client Activity      ││
│  ───────────────          │  │ [Chart]              ││
│  Ahmed Hassan             │  └──────────────────────┘│
│  Verified Trainer ✓       │                          │
│                           │  ┌──────────────────────┐│
│                           │  │ Recent Messages      ││
│                           │  │ ...                  ││
│                           │  └──────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Client Management

```
/trainer/clients/:id

┌──────────────────────────────────────────────────────┐
│  ← Back to Clients                                   │
│                                                      │
│  Mohamed Ali                        [Chat] [Assign]  │
│  Day 14 of program                                   │
│                                                      │
│  ┌─────────────┬─────────────┬─────────────────────┐│
│  │ Stats       │ Progress    │ History             ││
│  └─────────────┴─────────────┴─────────────────────┘│
│                                                      │
│  TABS CONTENT:                                       │
│                                                      │
│  [Stats]                                             │
│  Height: 175cm  Weight: 85kg  Goal: 75kg            │
│  Equipment: Dumbbells, Pull-up bar, Bands           │
│                                                      │
│  [Progress Charts]                                   │
│  - Weight trend                                      │
│  - Workout compliance                               │
│  - Health data (if shared)                          │
│                                                      │
│  [History]                                          │
│  - Recent workouts                                  │
│  - Recent meals                                     │
│  - Timeline updates                                 │
└──────────────────────────────────────────────────────┘
```

### Program Builder

```
/trainer/programs/new

┌──────────────────────────────────────────────────────┐
│  Create New Program                    [Save Draft]  │
│                                                      │
│  Program Name: [____________________________]        │
│  Duration: [4 weeks ▼]  Days/Week: [4 ▼]            │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Week 1                                           ││
│  │ ┌──────────┬──────────┬──────────┬──────────┐  ││
│  │ │ Day 1    │ Day 2    │ Day 3    │ Day 4    │  ││
│  │ │ Upper    │ Lower    │ Rest     │ Upper    │  ││
│  │ │ [Edit]   │ [Edit]   │          │ [Edit]   │  ││
│  │ └──────────┴──────────┴──────────┴──────────┘  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Day 1: Upper Body                     [+ Exercise]  │
│  ┌──────────────────────────────────────────────────┐│
│  │ 1. Bench Press      3×10  60s  [↑] [↓] [✕]     ││
│  │ 2. Dumbbell Row     3×12  60s  [↑] [↓] [✕]     ││
│  │ 3. Shoulder Press   3×10  60s  [↑] [↓] [✕]     ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│                            [Cancel] [Save & Assign]  │
└──────────────────────────────────────────────────────┘
```

---

## 4. Admin Dashboard

### Purpose
Platform management for Forma team only.

### Routes

| Route | Page |
|-------|------|
| `/admin` | Dashboard home |
| `/admin/users` | User management |
| `/admin/trainers` | Trainer verification |
| `/admin/trainers/:id/review` | Review application |
| `/admin/content` | Content management |
| `/admin/reports` | Analytics & reports |
| `/admin/disputes` | Dispute resolution |
| `/admin/payments` | Payment overview |
| `/admin/settings` | Platform settings |

### Trainer Verification Queue

```
/admin/trainers

┌──────────────────────────────────────────────────────┐
│  Trainer Applications                                │
│                                                      │
│  [Pending (12)] [Under Review (3)] [All]            │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Ahmed Hassan                    Applied: 2 hrs   ││
│  │ NASM Certified | 5 years exp                     ││
│  │ Instagram: @ahmed_fitness (45k followers)        ││
│  │                                                  ││
│  │ [View Application] [Quick Approve] [Reject]      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Sara Mohamed                    Applied: 5 hrs   ││
│  │ CrossFit L1 | 3 years exp                        ││
│  │ Instagram: @sara_crossfit (12k followers)        ││
│  │                                                  ││
│  │ [View Application] [Quick Approve] [Reject]      ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Admin Analytics

```
/admin/reports

Key Metrics:
┌─────────┬─────────┬─────────┬─────────┐
│ Users   │ Trainers│ Revenue │ Churn   │
│ 15,234  │ 342     │ 125k EGP│ 4.2%    │
│ ↑ 12%   │ ↑ 8%    │ ↑ 23%   │ ↓ 0.5%  │
└─────────┴─────────┴─────────┴─────────┘

Charts:
- User growth (line)
- Revenue by tier (stacked bar)
- Trainer earnings distribution (histogram)
- Geographic distribution (map of Egypt)
- Feature usage (bar)
- Retention cohorts (heatmap)
```

---

## 5. Shared Components

### Design System (shadcn/ui based)

```typescript
// components/ui/
Button
Card
Input
Select
Tabs
Table
Dialog
DropdownMenu
Avatar
Badge
Progress
Skeleton
Toast
```

### Custom Components

```typescript
// components/
StatCard        // Dashboard metric card
ChartCard       // Chart with title/actions
ClientCard      // Client summary card
ExerciseCard    // Exercise in library
MessageThread   // Chat conversation
ProgramBuilder  // Drag-drop program creator
CalendarView    // Schedule calendar
```

---

## 6. Responsive Design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Layout Rules

| Screen | Sidebar | Content Width |
|--------|---------|---------------|
| < 768px | Hidden (hamburger) | Full width |
| 768-1024px | Collapsed (icons) | Full - 64px |
| > 1024px | Expanded (full) | Full - 256px |

### Mobile Web

- Marketing pages: Fully responsive
- User portal: Redirect to app store
- Trainer dashboard: Simplified mobile view
- Admin: Desktop only (warning on mobile)

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| Bundle size (initial) | < 200KB |

### Optimization Strategies

- Server-side rendering (Next.js)
- Image optimization (next/image)
- Code splitting by route
- Lazy load below-fold content
- Prefetch likely next pages
- Service worker for caching

---

## 8. Localization

### Language Support

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Primary |
| Arabic (Egyptian) | `ar-EG` | Required |

### RTL Implementation

```tsx
// app/layout.tsx
export default function RootLayout({ children, params }) {
  const dir = params.locale === 'ar-EG' ? 'rtl' : 'ltr';

  return (
    <html lang={params.locale} dir={dir}>
      <body className={dir === 'rtl' ? 'font-cairo' : 'font-sans'}>
        {children}
      </body>
    </html>
  );
}
```

### URL Structure

```
formaeg.com/            → English landing
formaeg.com/ar/         → Arabic landing
formaeg.com/app/        → English portal
formaeg.com/ar/app/     → Arabic portal
formaeg.com/trainer/    → English trainer
formaeg.com/ar/trainer/ → Arabic trainer
```

---

## 9. Security

### Authentication

- JWT tokens (same as mobile)
- HTTP-only cookies for web
- CSRF protection
- Rate limiting on auth endpoints

### Authorization

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin routes - require admin role
  if (path.startsWith('/admin')) {
    return checkAdminAuth(request);
  }

  // Trainer routes - require trainer role
  if (path.startsWith('/trainer')) {
    return checkTrainerAuth(request);
  }

  // User routes - require any auth
  if (path.startsWith('/app')) {
    return checkUserAuth(request);
  }

  // Public routes - no auth
  return NextResponse.next();
}
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://cdn.formaeg.com; ..."
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // ... more headers
];
```

---

## 10. Deployment

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:3000 | Local dev |
| Staging | staging.formaeg.com | Testing |
| Production | formaeg.com | Live |

### CI/CD Pipeline

```yaml
# .github/workflows/web.yml
name: Web Deploy

on:
  push:
    branches: [main]
    paths: ['apps/web/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.formaeg.com
NEXT_PUBLIC_CDN_URL=https://cdn.formaeg.com
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

---

## 11. Analytics & Monitoring

### Tools

- **Analytics:** Mixpanel or PostHog
- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics
- **Uptime:** Better Uptime

### Events to Track

```typescript
// User portal
trackEvent('workout_viewed', { workout_id, day });
trackEvent('exercise_video_played', { exercise_id });
trackEvent('subscription_started', { tier });

// Trainer dashboard
trackEvent('client_added', { trainer_id });
trackEvent('program_created', { program_id, duration });
trackEvent('payout_requested', { amount });

// Admin
trackEvent('trainer_approved', { trainer_id, reviewer });
trackEvent('dispute_resolved', { dispute_id, outcome });
```

---

## Summary

The Forma webapp consists of four main parts:

1. **Marketing Website** - Public landing pages for conversion
2. **User Portal** - Limited web access for desktop users
3. **Trainer Dashboard** - Full client management system
4. **Admin Dashboard** - Platform management tools

All parts share:
- Same API backend as mobile
- Same authentication system
- Same design language (adapted for web)
- Bilingual support (English + Arabic)
