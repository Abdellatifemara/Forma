# Forma - Shape Your Future

Egyptian Fitness Application - AI-powered workout and nutrition tracking.

## Project Structure

```
forma/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── mobile/       # React Native (Expo) Mobile App
│   └── web/          # Next.js Web Application
├── packages/
│   ├── shared/       # Shared utilities
│   └── types/        # Shared TypeScript types
├── docs/             # Documentation
├── scripts/          # Build and utility scripts
└── data/             # Data files
```

## Tech Stack

### Backend (apps/api)
- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Vector Search:** pgvector for semantic search
- **Cache:** Redis
- **Authentication:** JWT with Passport.js

### Mobile (apps/mobile)
- **Framework:** React Native with Expo
- **State:** Zustand
- **Animations:** Reanimated 3
- **Local DB:** WatermelonDB

### Web (apps/web)
- **Framework:** Next.js 14+
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env.local
# Edit .env.local with your database credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev:api
```

## API Documentation

Once the server is running, visit http://localhost:3001/docs for Swagger documentation.

## Features

- 3,000+ exercises with Arabic translations
- Egyptian food database
- AI-powered workout generation
- Trainer marketplace
- Progress tracking with charts
- RTL Arabic support

## Brand

- **Name:** Forma
- **Tagline:** Shape Your Future / شكّل مستقبلك
- **Primary Color:** #00D4AA (Forma Teal)

## License

UNLICENSED - Proprietary
