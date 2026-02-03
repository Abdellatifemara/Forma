# FORMA APP - COMPLETE GUIDE

## Quick Links
- **Live Site:** https://forma-web-nine.vercel.app
- **API:** https://forma-api-production.up.railway.app
- **Test Login:** admin@forma.app / Admin123!

---

## CURRENT STATUS (Feb 3, 2026)

### What's Working
| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ Working | /api/auth/register |
| User Login | ✅ Working | /api/auth/login |
| JWT Authentication | ✅ Working | Token in cookie |
| Database (Supabase) | ✅ Connected | PostgreSQL |
| API Deployment | ✅ Railway | forma-api-production.up.railway.app |
| Web Deployment | ✅ Vercel | forma-web-nine.vercel.app |
| Health Check | ✅ Working | /api/health |
| Stats Weekly | ✅ Working | /api/stats/weekly |
| Logout | ✅ Fixed | Now works |

### What's NOT Working / Missing
| Feature | Status | What's Needed |
|---------|--------|---------------|
| Nutrition Daily | ❌ 404 | Railway needs redeploy after code push |
| Demo Data | ❌ Empty | Need exercises, foods, workout plans |
| Profile Data | ❌ Hardcoded | Shows fake "Ahmed Mohamed" instead of real user |
| Workouts | ❌ Empty | No exercises in database |
| Foods | ❌ Empty | No food items in database |
| Trainer Features | ❌ Incomplete | Missing dashboard endpoints |
| Progress Tracking | ❌ Missing | No backend endpoints |
| Video Integration | ❌ Not wired | Endpoints exist but not connected |

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FORMA ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────┘

   USER (Browser/Mobile)
          │
          ▼
   ┌─────────────────────────────────────────┐
   │          VERCEL (Frontend)              │
   │  https://forma-web-nine.vercel.app      │
   │  - Next.js 14 (App Router)              │
   │  - React 18                             │
   │  - Tailwind CSS                         │
   │  - shadcn/ui components                 │
   └──────────────────┬──────────────────────┘
                      │ API Calls
                      ▼
   ┌─────────────────────────────────────────┐
   │          RAILWAY (Backend)              │
   │  https://forma-api-production.up.railway.app │
   │  - NestJS                               │
   │  - JWT Authentication                   │
   │  - Prisma ORM                           │
   │  - REST API                             │
   └──────────────────┬──────────────────────┘
                      │ SQL Queries
                      ▼
   ┌─────────────────────────────────────────┐
   │          SUPABASE (Database)            │
   │  PostgreSQL + pgvector                  │
   │  - Users                                │
   │  - Exercises (empty)                    │
   │  - Foods (empty)                        │
   │  - Workouts                             │
   │  - Meal Logs                            │
   │  - Achievements                         │
   └─────────────────────────────────────────┘
```

---

## DATABASE TABLES (31 tables)

### Core Tables
- **User** - User accounts and profiles
- **Exercise** - Exercise library (EMPTY - needs seeding)
- **Food** - Food database (EMPTY - needs seeding)
- **Workout** - Workout templates
- **WorkoutPlan** - User workout plans
- **WorkoutLog** - Completed workout logs
- **MealLog** - Logged meals
- **Achievement** - Gamification achievements

### Supporting Tables
- ExerciseLog, ExerciseSet, FoodEntry
- WeightLog, Streak, UserAchievement
- Trainer, TrainerApplication, TrainerReview
- Video, Subscription, Payment

---

## API ENDPOINTS

### Auth (/api/auth)
```
POST /auth/register     - Create new user
POST /auth/login        - Login (returns JWT token)
POST /auth/refresh      - Refresh token
GET  /auth/me           - Get current user
```

### Users (/api/users)
```
GET  /users/me          - Get profile
PUT  /users/me          - Update profile
GET  /users/me/stats    - Get user statistics
```

### Workouts (/api/workouts)
```
GET  /workouts/plans         - Get all plans
POST /workouts/plans         - Create plan
GET  /workouts/plans/active  - Get active plan
GET  /workouts/today         - Today's workout
POST /workouts/start/:id     - Start workout
PUT  /workouts/logs/:id/complete - Complete workout
GET  /workouts/history       - Workout history
```

### Exercises (/api/exercises)
```
GET  /exercises              - Search exercises
GET  /exercises/muscles      - Get muscle groups
GET  /exercises/:id          - Get exercise by ID
```

### Nutrition (/api/nutrition)
```
GET  /nutrition/foods        - Search foods
GET  /nutrition/foods/:id    - Get food by ID
POST /nutrition/meals        - Log meal
GET  /nutrition/meals        - Get meal logs
GET  /nutrition/daily        - Daily nutrition log
GET  /nutrition/summary      - Daily summary
```

### Stats (/api/stats)
```
GET  /stats/weekly           - Weekly summary
```

### Trainers (/api/trainers)
```
GET  /trainers               - Search trainers
GET  /trainers/:id           - Trainer profile
POST /trainers/apply         - Apply as trainer
```

---

## WHAT NEEDS TO BE FIXED NOW

### Priority 1: Railway Redeploy
The code has been pushed but Railway may need manual redeploy.
1. Go to Railway dashboard
2. Click on forma-api service
3. Click "Redeploy" button

### Priority 2: Seed Demo Data
Database is empty. Need to populate:
- 100+ exercises
- 100+ Egyptian foods
- 10+ workout plans
- Demo user with history

### Priority 3: Fix Profile Page
Currently shows hardcoded "Ahmed Mohamed". Should fetch real user data.

---

## GEMINI RESEARCH PROMPTS

Copy these prompts to Gemini to generate data:

### 1. Egyptian Foods (100 items)
```
Create a JSON array of 100 Egyptian foods with nutritional data.

Include: Koshari, Foul Medames, Molokhia, Ta'ameya, Mahshi, Kofta,
Fatta, Hawawshi, Basbousa, Konafa, Om Ali, Feteer, Aish Baladi,
Gibna Domyati, Karkade, Egyptian rice, Egyptian bread varieties.

Format each food as:
{
  "name_en": "English name",
  "name_ar": "اسم عربي",
  "category": "PROTEIN|CARBS|VEGETABLES|FRUITS|DAIRY|GRAINS|DESSERTS",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "serving_size_g": number,
  "is_egyptian": true
}

Output as valid JSON array.
```

### 2. Exercises (100 items)
```
Create a JSON array of 100 gym exercises covering all muscle groups.

Muscle groups to include:
- CHEST: 15 exercises (bench press, flyes, pushups, etc.)
- BACK: 15 exercises (rows, pullups, lat pulldown, etc.)
- SHOULDERS: 12 exercises (press, lateral raises, etc.)
- BICEPS: 10 exercises (curls variations)
- TRICEPS: 10 exercises (extensions, dips, etc.)
- LEGS: 20 exercises (squats, lunges, leg press, etc.)
- CORE: 10 exercises (planks, crunches, etc.)
- GLUTES: 8 exercises (hip thrusts, bridges, etc.)

Format each exercise as:
{
  "id": "exercise-slug-name",
  "name_en": "Exercise Name",
  "name_ar": "اسم التمرين",
  "primary_muscle": "CHEST|BACK|SHOULDERS|BICEPS|TRICEPS|QUADRICEPS|HAMSTRINGS|GLUTES|ABS",
  "secondary_muscles": ["muscle1", "muscle2"],
  "equipment": ["BARBELL|DUMBBELL|CABLE|MACHINE|BODYWEIGHT"],
  "difficulty": "beginner|intermediate|advanced",
  "instructions_en": ["Step 1", "Step 2", "Step 3"],
  "instructions_ar": ["الخطوة 1", "الخطوة 2"],
  "tips_en": ["Tip 1", "Tip 2"],
  "default_sets": 3,
  "default_reps": 10
}

Output as valid JSON array.
```

### 3. Workout Plans (10 plans)
```
Create 10 workout plans in JSON format:

1. Beginner Full Body (3 days/week, 4 weeks)
2. Push/Pull/Legs (6 days/week, 8 weeks)
3. Upper/Lower Split (4 days/week, 8 weeks)
4. Home Bodyweight (4 days/week, 6 weeks)
5. Women's Glute Focus (4 days/week, 8 weeks)
6. Muscle Building (5 days/week, 12 weeks)
7. Fat Loss Circuit (4 days/week, 6 weeks)
8. Strength Training (4 days/week, 12 weeks)
9. Athletic Performance (5 days/week, 8 weeks)
10. Calisthenics (4 days/week, 12 weeks)

Format each plan as:
{
  "name": "Plan Name",
  "name_ar": "اسم الخطة",
  "description": "What this plan achieves",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "goal": "MUSCLE_GAIN|FAT_LOSS|STRENGTH|ENDURANCE",
  "duration_weeks": number,
  "days_per_week": number,
  "workouts": [
    {
      "day": 1,
      "name": "Day Name",
      "exercises": [
        { "name": "Exercise", "sets": 3, "reps": "8-12", "rest": 90 }
      ]
    }
  ]
}

Output as valid JSON array.
```

### 4. Pre-Generated AI Tips (For Offline/Free Tier)
```
Create JSON arrays for:

1. 30 Workout Tips for beginners (form, recovery, progression)
2. 30 Nutrition Tips (Egyptian diet, protein, hydration)
3. 20 Motivational Quotes (English and Arabic)
4. 20 FAQ answers (common fitness questions)

Format:
{
  "workout_tips": [
    { "tip_en": "...", "tip_ar": "...", "category": "form|recovery|progression" }
  ],
  "nutrition_tips": [
    { "tip_en": "...", "tip_ar": "...", "category": "protein|carbs|hydration" }
  ],
  "quotes": [
    { "quote_en": "...", "quote_ar": "...", "author": "..." }
  ],
  "faq": [
    { "question_en": "...", "question_ar": "...", "answer_en": "...", "answer_ar": "..." }
  ]
}
```

---

## APP FEATURES (Planned vs Reality)

### User Features
| Feature | Planned | Reality |
|---------|---------|---------|
| Registration/Login | ✅ | ✅ Working |
| Profile Management | ✅ | ⚠️ Partial (hardcoded data) |
| Workout Tracking | ✅ | ❌ No exercises in DB |
| Meal Logging | ✅ | ❌ No foods in DB |
| Progress Photos | ✅ | ❌ Not implemented |
| Weight Tracking | ✅ | ❌ No endpoint |
| Achievements | ✅ | ⚠️ Backend only |
| AI Coach | ✅ | ❌ Not connected |

### Trainer Features
| Feature | Planned | Reality |
|---------|---------|---------|
| Trainer Application | ✅ | ✅ Working |
| Client Management | ✅ | ❌ Missing endpoints |
| Program Creation | ✅ | ❌ Missing |
| Earnings Dashboard | ✅ | ❌ Missing |

### Admin Features
| Feature | Planned | Reality |
|---------|---------|---------|
| User Management | ✅ | ❌ Missing |
| Trainer Approvals | ✅ | ✅ Working |
| Analytics | ✅ | ⚠️ Basic |

---

## MONETIZATION (Planned)

### Free Tier
- Basic workout logging
- Food search (limited)
- Pre-generated tips ("Offline AI")
- Basic stats

### Pro Tier ($9.99/month)
- Unlimited workouts
- Full food database
- Real-time AI coach (Gemini)
- Progress tracking
- Custom workout plans

### Elite Tier ($19.99/month)
- Everything in Pro
- Personal trainer matching
- Video form analysis
- Priority support

---

## FILE STRUCTURE

```
FitApp/
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/     # Authentication
│   │   │   │   ├── users/    # User management
│   │   │   │   ├── workouts/ # Workout features
│   │   │   │   ├── nutrition/# Food & meals
│   │   │   │   ├── exercises/# Exercise library
│   │   │   │   ├── trainers/ # Trainer features
│   │   │   │   ├── stats/    # Statistics
│   │   │   │   ├── admin/    # Admin features
│   │   │   │   ├── ai/       # AI integration
│   │   │   │   └── videos/   # Video content
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma # Database schema
│   │       └── seed.ts       # Data seeding
│   │
│   ├── web/                  # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (app)/        # Protected routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── workouts/
│   │   │   │   ├── nutrition/
│   │   │   │   ├── exercises/
│   │   │   │   ├── profile/
│   │   │   │   └── trainers/
│   │   │   ├── (auth)/       # Auth routes
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   └── admin/        # Admin routes
│   │   ├── components/
│   │   ├── lib/
│   │   │   └── api.ts        # API client
│   │   └── hooks/
│   │
│   └── mobile/               # Expo React Native (not started)
│
├── docs/
│   ├── exercises/            # Exercise JSON files
│   └── nutrition/            # Food JSON files
│
└── FORMA_COMPLETE_GUIDE.md   # This file
```

---

## ENVIRONMENT VARIABLES

### Railway (API)
```
DATABASE_URL=postgresql://postgres.dfztxvbdruksednaucdq:RHvw5Xw4IyD3xouY@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.dfztxvbdruksednaucdq:RHvw5Xw4IyD3xouY@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=forma-jwt-secret-key-change-this
NODE_ENV=production
PORT=3001
```

### Vercel (Web)
```
NEXT_PUBLIC_API_URL=https://forma-api-production.up.railway.app/api
```

---

## IMMEDIATE ACTION ITEMS

### For Investor Demo Tomorrow

1. **Redeploy Railway** - Make sure latest code is deployed
2. **Test login flow** - Verify it works end-to-end
3. **Add demo data manually** via Supabase dashboard:
   - Add 10 sample exercises
   - Add 10 sample foods
   - Create a demo user with stats

### After Demo

1. Use Gemini to generate full exercise database (100+ items)
2. Use Gemini to generate Egyptian food database (100+ items)
3. Fix profile page to show real user data
4. Implement progress tracking endpoints
5. Complete trainer dashboard
6. Integrate AI coach with Gemini API

---

## TESTING

### Test API Health
```bash
curl https://forma-api-production.up.railway.app/api/health
```

### Test Login
```bash
curl -X POST https://forma-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@forma.app","password":"Admin123!"}'
```

### Test Stats (with token)
```bash
curl https://forma-api-production.up.railway.app/api/stats/weekly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## CONTACTS & RESOURCES

- **Supabase Dashboard:** https://supabase.com/dashboard/project/dfztxvbdruksednaucdq
- **Railway Dashboard:** https://railway.app (forma-api project)
- **Vercel Dashboard:** https://vercel.com (web project)
- **GitHub:** https://github.com/Abdellatifemara/Forma

---

Last Updated: February 3, 2026
