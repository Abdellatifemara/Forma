# Forma - Shape Your Future | فورما - شكّل مستقبلك

Egyptian-first AI fitness platform. Bilingual (EN/AR), culturally aware, affordable.

**Live:** [formaeg.com](https://formaeg.com) | **API:** [api.formaeg.com](https://api.formaeg.com)

## Stack

- **Frontend:** Next.js 14 → Cloudflare Workers
- **Backend:** NestJS + Prisma → VPS (PM2)
- **Database:** PostgreSQL 16 + PgBouncer + Redis
- **AI Chat:** State machine (180+ states) + intent matcher (280+ rules)
- **Auth:** Supabase | **Storage:** Cloudflare R2 | **Email:** Resend

## Quick Start

```bash
# Install
npm install

# API
cd apps/api
cp .env.example .env.local    # configure DB credentials
npx prisma generate && npx prisma migrate deploy
npm run start:dev

# Web
cd apps/web
npm run dev
```

## Deploy

```bash
# Frontend → Cloudflare
npx wrangler deploy

# API → VPS
ssh deploy@82.38.64.61
cd /var/www/apps/forma/api-repo && git pull
cd apps/api && npx prisma generate && npx nest build && pm2 restart forma-api
```

## Project Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for full status, goals, and tracker.

## Structure

```
apps/api/     NestJS backend (40+ modules)
apps/web/     Next.js frontend
docs/         Reference data (exercises, food, research)
localization/ Arabic translations
scripts/      Utilities
```

## License

UNLICENSED - Proprietary
