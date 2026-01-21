# FitApp - Complete Application Specification

## Executive Summary

FitApp is a premium fitness and nutrition mobile application built for the Egyptian market. The app combines AI-powered workout and meal planning with a trainer marketplace, creating a comprehensive fitness ecosystem.

**Core Value Proposition:**
- Egyptian food database with local ingredients and recipes
- AI that generates meals from available ingredients
- Equipment-adaptive workouts (gym, home, or no equipment)
- Verified trainer marketplace
- Health integration with visual graphs
- Premium feel with smooth animations

---

# PART 1: USER SYSTEM

## 1.1 User Types

| User Type | Description | Access Level |
|-----------|-------------|--------------|
| **Client (Free)** | Basic user with limited features | Database, basic logging, 7-day history |
| **Client (Trial)** | New user on 7-day free trial | Full Premium features |
| **Client (Premium)** | Paying subscriber | Trainer marketplace, AI features, warmups |
| **Client (Premium+)** | Higher tier subscriber | Unlimited AI, all add-ons, weak spot targeting |
| **Trainer (Standard)** | Verified fitness professional | Dashboard, client management, 15% fee |
| **Trainer (Partner)** | Invited famous trainer | 5% fee, can gift Premium |
| **Admin** | Platform staff | Verification, disputes, moderation |
| **Super Admin** | Founders (Abdellatif, Dodoelmahdy) | All powers, partner grants, Premium gifting |

## 1.2 Registration Flow

**All users must register. No guest access.**

```
App Launch
    ↓
Welcome Screen
    ↓
"Join as..." → [Client] or [Trainer]
    ↓
Create Account (email/phone + password)
    ↓
Verify (OTP)
    ↓
Role-specific onboarding
```

## 1.3 Client Onboarding

1. **Basic Info** - Name, age, gender
2. **Body Stats** - Height, weight, goal weight
3. **Fitness Goal** - Lose weight, build muscle, get stronger, improve endurance, stay healthy
4. **Activity Level** - Sedentary, lightly active, moderately active, very active
5. **Training Location** - Home (no equipment), Home (some equipment), Gym
6. **Equipment Selection** - Checklist of available equipment (if applicable)
7. **Add-on Programs** - Kegel, Yoga, Stretching, Mobility (Premium+ only, show locked)
8. **Weak Spots** - Body diagram to select areas to strengthen (Premium+ feature)
9. **Dietary Preferences** - Restrictions, allergies
10. **Health Apps** - Connect Apple Health, Google Fit, Samsung Health
11. **Notifications** - Permission request
12. **Trial Activation** - 7-day Premium trial starts

## 1.4 Trainer Onboarding

1. **Personal Info** - Name, age, gender, photo (required)
2. **Professional Info** - Instagram handle, years experience, bio (prefilled template)
3. **Specializations** - Multi-select from list
4. **Certifications** - Upload documents, issuing organization
5. **Transformations** - Before/after client photos (optional)
6. **Pricing** - Weekly/monthly rates with suggestions
7. **Availability** - Accepting clients?, max limit, response time
8. **Preview & Submit** - See profile as clients will see it
9. **Pending Verification** - Wait 48-72 hours for human review

---

# PART 2: SUBSCRIPTION SYSTEM

## 2.1 Free Tier

| Feature | Included |
|---------|----------|
| Food & exercise database | Yes |
| Basic logging | Yes |
| History | 7 days only |
| AI features | No |
| Trainer marketplace | No |
| Health graphs | No |
| Ads | Shown |

## 2.2 Free Trial (7 Days)

- All Premium features unlocked
- Available to new users only
- One-time per account
- No payment required
- Auto-converts to Free after expiry
- Notifications at Day 5 and Day 7

## 2.3 Premium Subscription

| Plan | Price (EGP) | Savings |
|------|-------------|---------|
| Monthly | 99 | - |
| Quarterly | 249 | 16% |
| Yearly | 799 | 33% |

**Features:**
- Trainer marketplace access
- Automatic warmups (muscle-specific, can disable)
- Limited AI usage (equipment change, meal suggestions)
- Advanced analytics & health graphs
- Unlimited history
- Ad-free experience
- Priority support

## 2.4 Premium+ Subscription (The Ultimate Experience)

| Plan | Price (EGP) | Savings |
|------|-------------|---------|
| Monthly | 199 | - |
| Quarterly | 499 | 16% |
| Yearly | 1,599 | 33% |

**"Your body. Your goals. Zero limits."**

**Features:**
- Everything in Premium
- Unlimited AI usage
- Weak spot targeting (custom programs for weak areas)
- **All Add-on Programs:**
  - Kegel & Pelvic Power
  - Yoga & Flow Sessions
  - Post-Workout Recovery
  - Mobility Mastery
  - Recovery Protocols
  - Guided Meditation
  - Breathwork Training
  - Posture Perfection
  - Self-Massage & Foam Rolling
  - Balance & Coordination
  - Sport-Specific Training
- Lifetime data history
- Multiple trainers (nutrition + workout)
- Priority trainer matching
- Exclusive programs
- Early access to new features
- Export all data
- Premium+ badge

**Note:** Premium+ cannot be gifted - must always be paid.

---

# PART 3: NUTRITION SYSTEM

## 3.1 Ingredient Database

- 500+ Egyptian ingredients
- Arabic and English names
- Full nutritional data per 100g (calories, protein, carbs, fat, fiber)
- Micronutrients (vitamins, minerals)
- Categories: proteins, carbs, vegetables, fruits, dairy, legumes, oils, spices
- Seasonal availability markers
- Local market names
- All food is halal (implicit, not stated)

## 3.2 Recipe Database

- 1000+ Egyptian and regional recipes
- Ingredient lists with quantities
- Auto-calculated nutrition per serving
- Prep time, cook time, difficulty
- Step-by-step instructions
- Recipe photos

## 3.3 AI Meal Generator

**"What can I make?"**

User inputs available ingredients → AI generates meal suggestions

**Flow:**
1. Input ingredients (text, voice, or select from recent)
2. Set preferences (target calories, meal type, quick/elaborate)
3. AI generates 3-4 meal options
4. Select meal → View full recipe + nutrition
5. "Log this meal" or "Save for later"

**AI Capabilities:**
- Smart ingredient substitution
- Portion calculation based on calorie/macro targets
- Natural language input ("I have chicken and rice")
- Dietary restriction filters

## 3.4 Meal Logging

- Log meals by meal slot (Breakfast, Lunch, Dinner, Snacks)
- Search food/recipe database
- Quick add calories
- Barcode scanning (future feature)
- Daily/weekly summaries
- Macro tracking (protein, carbs, fat)
- Visual progress charts

---

# PART 4: WORKOUT SYSTEM

## 4.1 Exercise Database

- 1000+ exercises
- HD video demonstrations (auto-loop)
- Muscle groups: primary and secondary
- Movement patterns: push, pull, squat, hinge, lunge, carry, rotation
- Difficulty levels: beginner, intermediate, advanced, expert
- Equipment requirements
- Form cues and common mistakes
- Exercise variations

## 4.2 Training Styles

| Style | Description |
|-------|-------------|
| Calisthenics | Progressive bodyweight, skills (muscle-up, handstand, planche) |
| Bodybuilding | Hypertrophy focused, isolation exercises |
| Powerlifting | Squat, bench, deadlift focus |
| CrossFit Style | Functional fitness, WODs |
| HIIT | High intensity intervals |
| Home Workouts | Minimal/no equipment |
| Full Gym | Machine and free weight programs |

## 4.3 Add-On Programs (Premium+)

These can be combined with any main training program:

| Add-On | Description |
|--------|-------------|
| Kegel & Pelvic Power | Core strength from the inside out |
| Yoga & Flow Sessions | Flexibility meets inner peace |
| Post-Workout Recovery | Cool down like a pro |
| Mobility Mastery | Move better, feel younger |
| Recovery Protocols | Bounce back faster |
| Guided Meditation | Clear mind, strong body |
| Breathwork Training | Oxygen is power |
| Posture Perfection | Stand tall, look confident |
| Self-Massage & Foam Rolling | Your personal recovery toolkit |
| Balance & Coordination | Athletic precision |
| Sport-Specific Training | Train like an athlete |

## 4.4 Warmups (Premium)

- Automatic before every workout
- Specific to today's target muscles
- User can disable if desired
- Dynamic stretching and activation

## 4.5 Equipment System

- 100+ equipment items in database
- Categories: bodyweight, resistance bands, dumbbells, barbells, machines, cardio, accessories
- User equipment inventory (saved in profile)
- Workouts adapt based on available equipment
- "No gym today" - AI regenerates workout for current equipment

## 4.6 Program Generation

- Goal-based: fat loss, muscle gain, strength, endurance, maintenance
- Split options: PPL, Upper/Lower, Full Body, Bro Split
- Frequency: 2-6 days per week
- AI generates personalized programs
- Auto-progression suggestions

## 4.7 Active Workout Screen

- Current exercise with video (auto-loop)
- Sets/reps counter
- Weight input
- Rest timer (auto-starts after set)
- Next exercise preview
- Progress indicator (exercises completed)
- Distraction-free UI (no nav bar during workout)

## 4.8 AI Day-by-Day Reveal

- AI generates full week/plan once
- Shows only current day in detail
- Tomorrow = hint only ("Tomorrow: Shoulder")
- Full details revealed when day arrives
- Reduces overwhelm, increases engagement

## 4.9 Workout Tracking

- Log sets, reps, weight
- Workout history
- Personal records tracking
- Volume analytics
- Progress over time

---

# PART 5: TRAINER MARKETPLACE

## 5.1 Trainer Types

### Standard Trainers
- Apply through app
- Human verification (48-72 hours)
- 15% platform fee
- Free Premium access
- Cannot gift Premium

### Partner Trainers
- Invited by Super Admins
- Instant/priority verification
- 5% platform fee only
- Can gift Premium to their subscribed clients
- Featured placement in discovery
- Purpose: Attract famous trainers for credibility

## 5.2 Trainer Discovery (Premium/Premium+ only)

**Browse & Filter:**
- Specialization (weight loss, muscle, calisthenics, etc.)
- Price range
- Rating
- Gender
- Availability

**Trainer Profile:**
- Photo, bio, specializations
- Verified badge
- Partner badge (if applicable)
- Instagram link
- Certifications (verified)
- Pricing (weekly/monthly)
- Reviews from clients
- Years of experience
- Max clients / availability

## 5.3 Client-Trainer Matching

```
Client browses trainers
    ↓
Client views profile
    ↓
Client clicks "Request This Trainer" (Premium only)
    ↓
Trainer receives notification
    ↓
Trainer views client preview (stats, goals, equipment, health graphs)
    ↓
Trainer accepts or declines
    ↓
If accepted:
    - Payment deducted from client
    - Chat unlocked
    - Timeline unlocked
    - Trainer can assign plans
```

## 5.4 Trainer Dashboard

**Home:**
- Earnings summary (available, pending)
- Commission tier display (15% or 5%)
- Active clients count
- Pending requests badge

**Clients:**
- Client cards with photo, name, days together, last active
- Client detail view:
  - Stats (height, weight, goal)
  - Equipment list
  - Weak spots (if Premium+ user)
  - Health graphs (if shared): steps, sleep, heart rate, calories, weight
  - Workout history
  - Meal logs
  - Progress photos
  - Timeline
  - Chat
  - Assigned plans
  - Notes section

**Requests:**
- Pending client requests
- Client preview
- Accept/Decline buttons

**Earnings:**
- Available balance
- Pending balance (in 7-day hold)
- Transaction history
- Withdraw button (min EGP 100)

## 5.5 Trainer Tools

**Prefilled System - Don't make trainers start from scratch:**
- AI recommendations based on client data
- Prefilled workout plans (editable)
- Prefilled meal plans (editable)
- "Clear all" option for fresh start
- Templates library (save and reuse)
- Copy from app library
- Dropdown/checkbox selection (minimal typing)
- Bulk actions for similar clients

## 5.6 Progress Timeline (Separate from Chat)

**Purpose:** Document progress visually over time.

**Client uploads:**
- Progress photos
- Videos (form checks)
- Day tag (auto or manual): "Day 1", "Day 15", etc.

**Features:**
- Chronological organization
- Trainer can view and comment
- Filter by: Photos / Videos / All
- Separate from chat (not mixed with messages)

## 5.7 Trainer Notes

**Types:**
- General notes (always visible to client)
- Day-specific notes (appear on that workout day)

**Use cases:**
- "Push harder on chest today"
- "Focus on form"
- "Great progress this week!"
- Motivation and guidance

## 5.8 Chat System

- Real-time messaging (WebSocket)
- Text, photo, video sharing
- Read receipts
- Push notifications
- Message history
- Unread counts

## 5.9 Review System

- Clients rate trainers (1-5 stars)
- Written reviews
- Reviews visible on trainer profile
- Trainer can respond to reviews
- Report fake/abusive reviews
- Average rating calculation

---

# PART 6: HEALTH INTEGRATION

## 6.1 Supported Platforms

| Platform | Status |
|----------|--------|
| Apple Health | Launch |
| Google Fit | Launch |
| Samsung Health | Launch |
| Fitbit | Future |
| Garmin | Future |

## 6.2 Data Import

- Steps
- Heart rate (resting + workout)
- Sleep duration and quality
- Active calories burned
- Workouts from other apps
- Weight (from smart scales)

## 6.3 Health Connection Popup

Shown during onboarding and in Settings → Health Integration:
- Apple Health option
- Google Fit option
- Samsung Health option
- "Skip for now" option
- Can always connect later

## 6.4 Health Graphs (Premium)

| Graph | Data | Timeframes |
|-------|------|------------|
| Steps | Daily step count | 7/30/90 days |
| Sleep | Hours per night | 7/30/90 days |
| Heart Rate | Resting HR trend | 7/30/90 days |
| Calories | Active calories burned | 7/30/90 days |
| Weight | Weight over time | All time |

**Features:**
- Line charts with gradient fill
- Tap to see exact values
- Trend indicators (up/down arrows)
- Average calculations

## 6.5 Trainer View

When client connects health apps AND shares with trainer:
- Trainer sees visual graphs (not raw data)
- Client controls what trainer can see
- Can revoke access anytime

---

# PART 7: PAYMENT SYSTEM

## 7.1 Payment Methods (Egypt)

| Method | Type | Status |
|--------|------|--------|
| Credit/Debit Card | Visa, Mastercard | Launch |
| Vodafone Cash | Mobile Wallet | Launch |
| Fawry | Cash/Online | Launch |
| InstaPay | Bank Transfer | Launch |
| Orange Money | Mobile Wallet | Future |
| Etisalat Cash | Mobile Wallet | Future |
| Meeza | Debit Card | Future |

**Payment Gateway:** Paymob (covers all Egyptian methods)

## 7.2 Subscription Payments

```
User selects tier (Premium/Premium+)
    ↓
Select period (Monthly/Quarterly/Yearly)
    ↓
Select payment method
    ↓
Confirm payment
    ↓
Subscription active
    ↓
Auto-renewal set up
```

## 7.3 Trainer Payment Flow

```
Client requests trainer
    ↓
Trainer accepts
    ↓
Payment screen shown to client
    ↓
Client pays trainer's rate (weekly/monthly)
    ↓
Payment processed
    ↓
Funds held in escrow (7 days)
    ↓
Receipt sent to client
    ↓
Trainer notified
    ↓
Chat & Timeline unlocked
```

## 7.4 Commission Structure

### Standard Trainers: 15%

| Component | Amount |
|-----------|--------|
| Payment processing | ~3% |
| AI/Server costs | ~5% |
| Platform operations | ~7% |
| **Total** | **15%** |

**Example:**
- Trainer charges: EGP 1,000/week
- Platform takes: EGP 150
- Trainer receives: EGP 850

### Partner Trainers: 5%

| Component | Amount |
|-----------|--------|
| Payment processing | ~3% |
| Minimal AI costs | ~2% |
| **Total** | **5%** |

**Example:**
- Trainer charges: EGP 1,000/week
- Platform takes: EGP 50
- Trainer receives: EGP 950

## 7.5 Payout Process

```
Trainer opens Earnings
    ↓
Sees available balance (past 7-day hold)
    ↓
Clicks Withdraw
    ↓
Enters amount (min EGP 100)
    ↓
Selects payout method (Bank, Vodafone Cash, InstaPay)
    ↓
Confirms withdrawal
    ↓
Processing (1-3 business days)
    ↓
Funds received
```

**Payout Limits:**
- Minimum: EGP 100
- Maximum per transaction: EGP 50,000
- Maximum per day: EGP 100,000
- Maximum per month: EGP 500,000

## 7.6 Premium Gifting

| Who Can Gift | Can Gift Premium? | Can Gift Premium+? |
|--------------|-------------------|-------------------|
| Super Admin | Yes (to anyone) | No |
| Partner Trainer | Yes (to their clients only) | No |
| Standard Trainer | No | No |
| Regular User | No | No |

**Gift Rules:**
- Duration: 1 month per gift
- Extends existing subscription (doesn't replace)
- Premium+ can NEVER be gifted

## 7.7 Refunds & Disputes

| Situation | Refund |
|-----------|--------|
| Trainer unresponsive (48+ hours) | Full |
| Client cancels within 24 hours | Full |
| Client cancels after 24 hours | Prorated |
| Trainer inappropriate behavior | Full + trainer action |
| Premium subscription | Prorated for unused time |

**Dispute Process:**
1. Client opens dispute
2. Selects reason + provides evidence
3. Trainer notified (48 hours to respond)
4. Admin reviews case
5. Decision: Dismiss / Partial refund / Full refund / Warning / Suspension / Ban

## 7.8 Taxes

- Trainers handle their own taxes
- Platform pays taxes on net profit (revenue - costs - payouts)
- Tax percentage: TBD (based on Egyptian regulations)

---

# PART 8: ADMIN SYSTEM

## 8.1 Admin Roles

| Role | Access |
|------|--------|
| Super Admin | Full access + special powers (founders only) |
| Operations Admin | Verifications, disputes, user management |
| Support Admin | View-only + respond to tickets |
| Finance Admin | Payments, payouts, refunds |
| Content Admin | Content moderation, reports |

## 8.2 Super Admin Powers (Founders Only)

**Only for: Abdellatif & Dodoelmahdy**

| Power | Description |
|-------|-------------|
| Grant Partner status | Give any trainer 0% commission |
| Revoke Partner status | Return trainer to standard commission |
| Gift Premium | Give free Premium to any user |
| Cannot gift Premium+ | Premium+ must always be paid |
| Override verification | Instantly approve/reject trainers |
| Manage admins | Create/remove admin accounts |
| Platform settings | All configuration options |

## 8.3 Trainer Verification (Human Only)

**No AI verification - humans review everything.**

**Checklist:**
- Photo is professional
- Instagram is legitimate and active
- Certifications are readable and valid
- Bio is appropriate
- Pricing is reasonable

**Actions:**
- Approve → Verified badge added
- Reject → Reason sent to trainer
- Request more info → Message sent

## 8.4 Dispute Resolution

**Admin can:**
- View full chat history
- View timeline
- View payment history
- Issue warnings
- Issue refunds (full/partial)
- Suspend users (7/14/30 days)
- Ban users permanently

## 8.5 Analytics Dashboard

**Metrics:**
- Total users (by tier: Free, Trial, Premium, Premium+, Trainers)
- Revenue (subscriptions vs commissions)
- Active trainer-client pairs
- Trial → Premium conversion rate
- Premium → Premium+ upgrade rate
- Retention rates
- Partner trainer earnings (0% commission tracked separately)

## 8.6 Audit Log

All admin actions logged:
- Trainer verifications
- Partner status grants/revocations
- Premium gifts
- User suspensions/bans
- Refunds issued
- Disputes resolved
- Settings changes

---

# PART 9: NOTIFICATIONS

| Event | Recipient | Message |
|-------|-----------|---------|
| Free trial started | Client | "Your 7-day Premium trial has started!" |
| Free trial ending (Day 5) | Client | "Your trial ends in 2 days" |
| Free trial ended | Client | "Your trial ended. Subscribe to continue." |
| Client requests trainer | Trainer | "New request from [Name]" |
| Trainer accepts | Client | "[Trainer] accepted your request!" |
| Trainer declines | Client | "[Trainer] is not available" |
| New message | Both | "[Name] sent you a message" |
| Workout assigned | Client | "Your trainer assigned a new workout" |
| Meal plan assigned | Client | "Your trainer assigned a new meal plan" |
| Client completes workout | Trainer | "[Client] completed their workout" |
| Payment received | Trainer | "Payment received from [Client]" |
| Funds available | Trainer | "Your earnings are ready to withdraw" |
| New review | Trainer | "[Client] left you a review" |
| Trainer verified | Trainer | "You're now verified!" |
| Trainer rejected | Trainer | "Your application needs updates" |
| Partner status granted | Trainer | "You're now a Partner Trainer!" |
| Premium gifted | Client | "Your trainer gifted you Premium!" |
| Workout reminder | Client | "Time for your workout!" |
| Streak at risk | Client | "Don't break your streak!" |
| Premium expiring | Client | "Your Premium expires in 3 days" |

---

# PART 10: TECHNICAL REQUIREMENTS

## 10.1 Platforms

- iOS (iPhone, iPad)
- Android (phones, tablets)

## 10.2 Tech Stack (Recommended)

**Mobile:**
- React Native or Flutter
- Cross-platform for iOS and Android

**Backend:**
- Node.js (NestJS) or Python (FastAPI)
- PostgreSQL database
- Redis for caching
- WebSocket for real-time chat

**Storage:**
- Cloudflare R2 for videos (zero egress fees)
- CDN for fast delivery

**AI:**
- OpenAI API or similar for meal/workout generation
- Custom models for recommendations

**Payments:**
- Paymob for Egyptian payment methods

**Health:**
- Apple HealthKit
- Google Fit API
- Samsung Health SDK

## 10.3 Offline Capabilities

**Available offline:**
- Full ingredient database
- Full exercise database
- Cached workout videos (recently viewed)
- Log workouts → sync when online
- Log meals → sync when online

**Requires internet:**
- Chat
- Trainer features
- AI features
- Health sync
- Payments

## 10.4 Performance Requirements

- App launch: < 3 seconds
- Screen transitions: < 300ms
- API responses: < 500ms
- Video start: < 2 seconds
- Smooth 60fps animations

## 10.5 Security

- PCI DSS compliant payment gateway
- No card data stored locally
- Tokenization for recurring payments
- 3D Secure for card payments
- Encrypted health data
- Secure trainer credentials storage
- Regular security audits

---

# PART 11: DESIGN REQUIREMENTS

## 11.1 Design Philosophy

**"LOOKS FIRST, FUNCTIONALITY SECOND"**

- Premium feel from first launch
- Smooth animations everywhere
- Dark theme by default (Gymshark-inspired)
- Clean, minimalist UI
- The app people screenshot and share

## 11.2 Key Design Elements

- Dark backgrounds (#0D0D0D)
- Bold, condensed typography (uppercase headers)
- Teal accent color (#00D4AA)
- Gradient buttons and progress rings
- Horizontal scrolling workout cards
- Built-in video timer during exercises
- Distraction-free workout mode
- Glassmorphism for modals
- Micro-animations on every interaction

## 11.3 Animation Requirements

- Page transitions: Slide + fade
- Button press: Scale 0.96 with spring
- Card tap: Subtle lift effect
- Success: Confetti burst
- Loading: Skeleton screens with shimmer
- Numbers: Count-up animation
- Graphs: Draw animation

See `FRONTEND-DESIGN-SYSTEM.md` for full specifications.

---

# PART 12: CONTENT REQUIREMENTS

## 12.1 Food Database

- 500+ Egyptian ingredients
- Arabic + English names
- Full nutritional data
- Images for each ingredient

## 12.2 Recipe Database

- 1000+ recipes
- Egyptian cuisine focus
- Photos for each recipe
- Step-by-step instructions

## 12.3 Exercise Database

- 1000+ exercises
- All muscle groups covered
- Video demonstrations
- Multiple difficulty levels
- Includes: standard exercises, calisthenics skills, kegel, yoga, mobility, stretching

## 12.4 Workout Programs

- 50+ pre-built programs
- Various goals and equipment levels
- Various training styles

---

# APPENDIX A: Database Schema Overview

See `04-DATABASE-SCHEMA.md` for full SQL schemas.

**Core Tables:**
- users (clients and trainers)
- subscriptions
- trainer_profiles
- trainer_verifications
- client_trainer_relationships
- workouts, exercises, workout_logs
- ingredients, recipes, meal_logs
- health_data
- messages, timeline_entries, trainer_notes
- payments, payouts, disputes
- reviews
- admin_users, audit_logs

---

# APPENDIX B: API Endpoints Overview

See `08-TECHNICAL-REQUIREMENTS.md` for full API documentation.

**Core Endpoints:**
- /auth/* (register, login, verify, reset)
- /users/* (profile, settings, preferences)
- /trainers/* (list, profile, apply, verify)
- /relationships/* (request, accept, decline)
- /workouts/* (programs, exercises, log)
- /nutrition/* (ingredients, recipes, meals, ai-generate)
- /health/* (sync, data, graphs)
- /payments/* (subscribe, pay, withdraw)
- /chat/* (messages, send, media)
- /timeline/* (entries, upload, comment)
- /admin/* (verify, disputes, users, analytics)

---

# APPENDIX C: Files Reference

| File | Purpose |
|------|---------|
| `01-PROJECT-OVERVIEW.md` | Business model, user types, revenue |
| `02-FEATURES.md` | Complete feature list |
| `03-USER-FLOWS.md` | All user journeys |
| `04-DATABASE-SCHEMA.md` | Full database design |
| `05-TRAINER-SYSTEM.md` | Trainer features deep dive |
| `06-PAYMENT-SYSTEM.md` | Payment flows, commissions |
| `07-ADMIN-PANEL.md` | Admin dashboard specs |
| `08-TECHNICAL-REQUIREMENTS.md` | Tech stack, APIs |
| `09-MILESTONES.md` | Development checklist |
| `10-RESEARCHES.md` | ChatGPT research database |
| `11-CHATGPT-QUERIES.md` | Research query list |
| `FRONTEND-BRIEF.md` | Frontend design handoff |
| `FRONTEND-DESIGN-SYSTEM.md` | UI specifications, colors, components |
| `COMPLETE-APP-SPECIFICATION.md` | This document |
