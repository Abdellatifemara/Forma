# Handoff: Architecture Pivot to Supabase + Railway
**From:** Claude
**To:** Gemini (or next Claude session)
**Date:** 2026-01-22 13:30
**Session Duration:** Starting now

## What Was Done
- [x] Created .env files for local development
- [x] Set up Docker with PostgreSQL (pgvector) + Redis
- [x] Database containers running and healthy
- [x] Created AIlogs folder and handoff protocol

## Architecture Decision (USER CONFIRMED)
**OLD:** Local Docker PostgreSQL
**NEW:**
- **Database:** Supabase (PostgreSQL)
- **Backend:** NestJS on Railway ($5/mo)
- **Frontend:** Next.js on Vercel (free)
- **Videos:** YouTube unlisted IDs stored in DB
- **Mobile:** Expo connecting to Railway

## What's Working
- Docker containers (can be stopped now - moving to Supabase)
- Project structure intact
- 5,145 exercise JSON files ready

## What's Broken / Blocked
- Prisma schema needs Video model
- No Supabase connection yet
- No YouTube integration yet

## Next Steps (Priority Order)
1. Update Prisma schema with Video model
2. Configure Supabase DATABASE_URL + DIRECT_URL
3. Set up CORS for Vercel/Expo
4. Create VideoService
5. Add Gemini exponential backoff

## Files Changed
| File | Change Type | Notes |
|------|-------------|-------|
| .env | Created | Local dev config |
| apps/api/.env | Created | API config |
| docker-compose.yml | Modified | Changed to pgvector image |
| AIlogs/ | Created | Handoff folder |

## Environment State
- Database: Docker running (will switch to Supabase)
- API: Not started yet
- Web: Not started yet
- Docker: UP (postgres + redis)

## Commands to Resume
```bash
# Current Docker state
cd C:\Users\pc\Desktop\G\FitApp
docker compose ps

# To stop Docker (when switching to Supabase)
docker compose down

# To start API
cd apps/api && npm run dev

# To start Web
cd apps/web && npm run dev
```

## Context for Next AI
- User has ADHD - use bullet points, tables, minimal prose
- User wants status table at END of every message
- Moving to cloud infra (Supabase/Railway/Vercel)
- YouTube videos will be stored as unlisted IDs
- Need exponential backoff for Gemini API (429 errors)
