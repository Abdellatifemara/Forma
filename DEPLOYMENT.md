# Forma Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway       │────▶│   Supabase      │
│   (Next.js)     │     │   (NestJS)      │     │   (PostgreSQL)  │
│   $0/mo         │     │   $5/mo         │     │   $0-25/mo      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│   Expo          │     │   YouTube       │
│   (Mobile)      │     │   (Videos)      │
│   Local build   │     │   Unlisted IDs  │
└─────────────────┘     └─────────────────┘
```

---

## 1. Supabase Setup (Database)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project → Select region closest to users (eu-central-1 for Egypt)
3. Note your project password

### Get Connection Strings
1. Go to **Project Settings** → **Database**
2. Copy connection strings:

```env
# For app queries (use Transaction mode, port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For migrations (use Session mode, port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### Enable pgvector
1. Go to **SQL Editor**
2. Run: `CREATE EXTENSION IF NOT EXISTS vector;`

### Run Migrations
```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

---

## 2. Railway Setup (API)

### Create Project
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `FitApp` repo
4. Set root directory: `apps/api`

### Configure Build
```toml
# railway.toml (create in apps/api/)
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Environment Variables
Add in Railway dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | `[from Supabase]` |
| `DIRECT_URL` | `[from Supabase]` |
| `JWT_SECRET` | `[generate 32+ chars]` |
| `CORS_ORIGINS` | `https://forma.vercel.app,https://*.vercel.app` |
| `GEMINI_API_KEY` | `[your key]` |
| `STRIPE_SECRET_KEY` | `[your key]` |

### Custom Domain (Optional)
1. Settings → Domains
2. Add custom domain: `api.formaeg.com`

---

## 3. Vercel Setup (Web)

### Deploy
1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository → Select `FitApp`
3. Set root directory: `apps/web`
4. Framework: Next.js

### Environment Variables
Add in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-app.railway.app/api` |
| `NEXTAUTH_SECRET` | `[generate 32+ chars]` |
| `NEXTAUTH_URL` | `https://forma.vercel.app` |

### Custom Domain (Optional)
1. Settings → Domains
2. Add: `formaeg.com`

---

## 4. Expo Setup (Mobile)

### Configure API URL
Edit `apps/mobile/constants/config.ts`:
```typescript
export const API_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://your-app.railway.app/api';
```

### Build Commands
```bash
# Development
cd apps/mobile
npx expo start

# Build for stores
eas build --platform ios
eas build --platform android
```

---

## 5. YouTube Video Setup

### Upload Videos
1. Upload to YouTube as **Unlisted**
2. Get video ID from URL: `youtube.com/watch?v=VIDEO_ID`

### Seed Videos to Database
```typescript
// Use POST /api/videos/bulk
const videos = [
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Morning Yoga Flow",
    titleAr: "يوجا الصباح",
    category: "YOGA",
    tags: ["morning", "beginner", "flexibility"],
    durationSeconds: 900
  },
  // ... more videos
];

await fetch('https://api.formaeg.com/api/videos/bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(videos)
});
```

---

## Quick Commands

```bash
# Local Development
docker compose up -d postgres redis  # Start DB
cd apps/api && npm run dev           # Start API
cd apps/web && npm run dev           # Start Web
cd apps/mobile && npx expo start     # Start Mobile

# Database
cd apps/api
npx prisma migrate dev               # Create migration
npx prisma migrate deploy            # Deploy to production
npx prisma studio                    # GUI for DB
npx prisma db seed                   # Seed data

# Deploy
git push origin main                 # Auto-deploys to Railway + Vercel
```

---

## Cost Breakdown

| Service | Tier | Cost/Month |
|---------|------|------------|
| Supabase | Free | $0 |
| Railway | Hobby | $5 |
| Vercel | Hobby | $0 |
| YouTube | - | $0 |
| **Total** | | **$5/mo** |

*Scale up as needed. Supabase Pro ($25/mo) for production loads.*
