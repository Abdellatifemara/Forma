# FitApp - Complete Feature List

## 1. Nutrition System

### 1.1 Ingredient Database
- 500+ Egyptian ingredients with Arabic/English names
- Full nutritional data per 100g (calories, protein, carbs, fat, fiber)
- Micronutrients (vitamins, minerals)
- Categories: proteins, carbs, vegetables, fruits, dairy, legumes, oils, spices
- Seasonal availability markers
- Common local market names

### 1.2 Recipe Database
- 1000+ Egyptian and regional recipes
- Ingredient lists with quantities
- Auto-calculated nutrition per serving
- Prep time, cook time, difficulty
- Step-by-step instructions
- Recipe photos

### 1.3 AI Meal Generator
- Input available ingredients → get meal suggestions
- Smart ingredient substitution
- Portion calculation based on calorie/macro targets
- Natural language input ("I have chicken and rice")
- Dietary restriction filters (vegetarian, allergies, etc.)

### 1.4 Meal Tracking
- Log meals with portion sizes
- Daily/weekly calorie and macro summaries
- Visual progress charts
- Meal history

---

## 2. Workout System

### 2.1 Exercise Database
- 1000+ exercises with HD video demonstrations
- Muscle groups: primary and secondary
- Movement patterns: push, pull, squat, hinge, lunge, carry, rotation
- Difficulty levels: beginner, intermediate, advanced, expert
- Form cues and common mistakes
- Exercise variations

### 2.2 Training Styles Supported
- **Calisthenics** - Progressive bodyweight training, skills (muscle-up, handstand, planche)
- **Bodybuilding** - Hypertrophy focused, isolation exercises
- **Powerlifting** - Squat, bench, deadlift focus
- **CrossFit Style** - Functional fitness, WODs
- **HIIT** - High intensity intervals
- **Home Workouts** - Minimal/no equipment
- **Full Gym** - Machine and free weight programs

### 2.3 Add-On Programs (Combinable with Main Training)
Users can add these to their main workout program:

| Add-On | Description | Can Combine With |
|--------|-------------|------------------|
| **Kegel Exercises** | Pelvic floor strengthening, core stability, bladder control | Any program |
| **Yoga** | Flexibility, mobility, recovery, stress relief | Any program |
| **Stretching** | Pre/post workout flexibility routines | Any program |
| **Mobility Work** | Joint health, injury prevention | Any program |

**How it works:**
- User selects main program (e.g., PPL, Calisthenics)
- User adds optional add-ons (e.g., + Kegel + Yoga)
- App integrates add-ons into weekly schedule
- Example: "PPL 6-day + Yoga on rest days + Kegel daily"

### 2.4 Equipment System
- Complete equipment database (100+ items)
- Categories: bodyweight, resistance bands, dumbbells, barbells, machines, cardio, accessories
- User equipment inventory
- Dynamic workout adaptation based on available equipment
- "I just got X" instant recommendations

### 2.5 Program Generation
- Goal-based programs (fat loss, muscle gain, strength, endurance, maintenance)
- Split options: PPL, Upper/Lower, Full Body, Bro Split
- Frequency: 2-6 days per week
- Auto-progression suggestions

### 2.6 Workout Tracking
- Log sets, reps, weight
- Rest timer
- Workout history
- Personal records tracking
- Volume and progress analytics

---

## 3. Trainer Marketplace

### 3.1 Trainer Onboarding
- Signup as trainer (separate from client)
- Profile creation with **guided, prefilled form**:
  - Personal info, photo
  - Instagram handle
  - Certifications (upload documents)
  - Specializations (weight loss, muscle gain, calisthenics, etc.)
  - Experience and bio
  - Transformation photos of past clients (optional)
- Submit for verification

### 3.2 Trainer Form System (Prefilled + Editable)

**Philosophy:** Make it easy for trainers. Don't make them start from scratch.

| Feature | Description |
|---------|-------------|
| **Prefilled templates** | Forms come with suggested text/structure |
| **Edit anything** | Trainer can modify any prefilled content |
| **Clear form option** | "Start fresh" button to clear all prefilled content |
| **Save drafts** | Can save progress and continue later |
| **Preview** | See how profile will look before submitting |

**Example prefilled bio:**
```
"I'm a certified [CERTIFICATION] trainer with [X] years of experience
specializing in [SPECIALIZATIONS]. I help clients achieve [GOALS] through
personalized workout and nutrition plans. My approach focuses on..."
```
Trainer edits the brackets and customizes the rest.

### 3.3 Trainer Verification (Human Review)
- Admin reviews trainer application
- Verify certifications manually (no AI verification)
- Approve/reject with feedback
- Verified badge upon approval

### 3.4 Trainer Profile (Post-Verification)
- Public profile with:
  - Photo, bio, specializations
  - Certifications (verified badge)
  - Instagram link
  - Pricing (set by trainer)
  - Availability status (accepting new clients)
  - Max clients limit (set by trainer)
  - Response time (written by trainer)
  - Client reviews and ratings
  - Years of experience

### 3.5 Trainer Discovery (Client Side)
- Browse trainers with filters:
  - Specialization
  - Price range
  - Rating
  - Availability
  - Gender preference
- View trainer profiles
- See reviews from past clients

### 3.6 Client-Trainer Matching
- **Premium/Premium+ clients only** can request trainers
- Client sends request to trainer
- Trainer sees client's basic info
- Trainer accepts or declines
- On accept → payment deducted → chat unlocked

### 3.7 Trainer Dashboard
- View all active clients
- See client details:
  - Height, weight, body measurements
  - Goals
  - Available equipment
  - Current fridge/ingredients (if shared)
  - Progress photos
  - Workout history
  - Meal logs
  - **Health graphs** (if client connected health apps)

### 3.8 Health Graphs for Trainers
When client connects wearable devices (Apple Watch, Whoop, OURA, Garmin, Fitbit, etc.), trainer sees visual graphs and insights:

| Graph | Data Shown | Timeframe |
|-------|------------|-----------|
| **Recovery Score** | Daily readiness for training (Whoop-style) | 7/30/90 days |
| **Sleep Analysis** | Duration, stages, quality score | 7/30/90 days |
| **Heart Rate & HRV** | Resting HR, HRV trend, zones | 7/30/90 days |
| **Strain & Activity** | Daily strain, steps, active calories | 7/30/90 days |
| **Body Composition** | Weight, body fat %, muscle mass trend | All time |
| **Stress Level** | HRV-based stress estimation | 7/30/90 days |
| **Training Load** | 7-day vs 28-day load ratio | 30/90 days |
| **VO2 Max** | Cardiovascular fitness trend | All time |
| **Blood Work** | Lab results over time (if shared) | All time |

**Privacy:** Client must explicitly enable sharing per metric category. Client can revoke at any time. Trainer gets alerts for significant changes (sudden weight drop, low recovery streak, etc.).

### 3.9 Trainer Tools (Simplified Workflow)
- **Pre-made templates** - Save workout/meal plans to reuse
- **Prefilled recommendations** - AI suggests plans based on client stats
- **Copy from library** - Use app's existing programs as base
- **AI suggestions** - "Based on this client's stats, recommend..."
- **Edit anything** - Trainer can modify all AI suggestions
- **Clear and start fresh** - Option to ignore prefilled content
- **Drag and drop** - Easy plan building
- **Bulk actions** - Assign same plan to multiple similar clients
- **Minimal typing** - Select from dropdowns, checkboxes where possible

### 3.10 Review System
- Clients rate trainers (1-5 stars)
- Written reviews
- Reviews visible on trainer profile
- Trainer can respond to reviews
- Report fake/abusive reviews

### 3.11 Premium Gifting (Partner Trainers Only)
- Partner trainers (0% commission) can gift Premium to their clients
- Cannot gift Premium+ (must be paid)
- Only for clients currently subscribed to that trainer
- Gift duration: 1 month
- Purpose: Reward loyal clients, increase retention

---

## 4. Communication

### 4.1 Real-Time Chat
- Text messaging between trainer and client
- Photo sharing (progress pics, food pics, form checks)
- Video sharing (exercise form videos)
- Read receipts
- Push notifications for new messages

### 4.2 Notifications
- New message from trainer/client
- Workout reminder
- Meal time reminder
- Hydration reminder
- Goal milestone achieved
- Streak maintenance
- Trainer accepted your request
- New review received (for trainers)
- Payment received (for trainers)
- Free trial ending soon (2 days before)
- Premium expiring soon

---

## 5. Health & Wearable Integration

Forma provides a comprehensive health dashboard inspired by the best wearable platforms:
Whoop (recovery/strain scoring), Apple Watch (activity rings, ECG, VO2 Max),
OURA Ring (readiness score, sleep staging), and Garmin (Body Battery, training readiness).

### 5.1 Supported Devices & Platforms

| Device/Platform | Type | Key Metrics |
|-----------------|------|-------------|
| **Apple Watch** | Smartwatch | HR, HRV, ECG, SpO2, VO2 Max, activity rings, sleep stages, training load |
| **Whoop** | Fitness band | Recovery score, strain, HRV, sleep performance, WHOOP Age |
| **OURA Ring** | Smart ring | Readiness score, sleep stages, HRV, body temperature, resilience |
| **Garmin** | Smartwatch | Body Battery, training readiness, HRV status, stress, VO2 Max |
| **Fitbit** | Fitness tracker | HR, sleep score, SpO2, Active Zone Minutes, stress |
| **Apple Health** | Platform | Aggregated data from all iOS health sources |
| **Google Fit** | Platform | Aggregated data from all Android health sources |
| **Samsung Health** | Platform | Samsung-specific data, Galaxy Watch integration |

### 5.2 Connection Flow (Permission-First)
- User is ALWAYS asked first — never auto-connect
- Choice of sync scope: Everything / Sleep+Recovery only / Heart+Activity only / Workouts only
- Sync frequency options: Realtime / Hourly / Every 6 hours / Daily / Manual
- Clear privacy policy before connecting
- Can disconnect or delete synced data at any time
- Connection UI available in: Chat → Devices menu, Settings → Health, Onboarding

### 5.3 Recovery Score (Whoop-Inspired)
Daily score (0-100%) showing how ready your body is for training:
- **Green (67-100%)**: Fully recovered, train hard
- **Yellow (34-66%)**: Moderate recovery, train normally
- **Red (0-33%)**: Low recovery, take it easy or rest

**Factors:**
- Sleep quality & duration (weighted 30%)
- Heart Rate Variability (HRV) trend (weighted 25%)
- Resting heart rate vs baseline (weighted 20%)
- Previous day's strain/activity (weighted 15%)
- Stress levels (weighted 10%)

**Features:**
- Factor breakdown with individual scores
- Recovery history (7/30/90 day trends)
- Recovery tips based on current score
- Smart training recommendations ("Your recovery is 42% — consider light cardio or stretching")

### 5.4 Sleep Analysis (OURA + Whoop Inspired)
Comprehensive sleep tracking and staging:

| Metric | Description |
|--------|-------------|
| **Sleep Score** | Overall quality (0-100) |
| **Total Duration** | Time in bed vs actual sleep |
| **Sleep Stages** | Awake, Light, Deep (SWS), REM |
| **Sleep Efficiency** | % of time in bed actually sleeping |
| **Latency** | How long to fall asleep |
| **Restfulness** | Movement/disturbances during sleep |
| **Respiratory Rate** | Breaths per minute during sleep |
| **Body Temperature** | Deviation from baseline (OURA-style) |

**Features:**
- Last night's sleep breakdown with stages graph
- Deep sleep tips (optimal: 1.5-2 hours)
- Sleep consistency score (regularity of sleep/wake times)
- 7/30/90 day sleep trends
- Manual sleep logging for users without devices
- Sleep quality rating (1-5 stars) for subjective tracking
- Pre-sleep routine suggestions
- Nap tracking

### 5.5 Heart Rate & HRV
Advanced cardiovascular monitoring:

| Metric | Description | Optimal Range |
|--------|-------------|---------------|
| **Resting HR** | Morning/baseline heart rate | 50-70 bpm (athletes: 40-55) |
| **HRV (RMSSD)** | Heart rate variability | Higher = better recovery |
| **HRV Trend** | 7-day rolling average | Upward = improving fitness |
| **Max HR** | Peak during workouts | Age-dependent |
| **Recovery HR** | HR drop after exercise | >20 bpm in 1 min = good |

**HR Zones:**
- Zone 1 (50-60% max): Recovery / warm-up
- Zone 2 (60-70% max): Fat burn / base endurance
- Zone 3 (70-80% max): Cardio / aerobic
- Zone 4 (80-90% max): Threshold / lactate
- Zone 5 (90-100% max): VO2 Max / anaerobic

**Features:**
- HRV explained in simple terms (English + Egyptian Arabic)
- Log manual resting HR
- HR zone calculator based on age
- Improvement tips
- Historical trends with graphs

### 5.6 Strain & Activity (Whoop + Garmin Inspired)
Daily activity and exertion tracking:

| Metric | Source | Description |
|--------|--------|-------------|
| **Strain Score** | Whoop-style | Cardiovascular load (0-21 scale) |
| **Body Battery** | Garmin-style | Energy reserve (0-100) |
| **Training Load** | Apple Watch-style | 7-day vs 28-day load ratio |
| **Steps** | All devices | Daily step count |
| **Active Calories** | All devices | Calories from movement |
| **Activity Rings** | Apple Watch-style | Move / Exercise / Stand goals |

**Features:**
- Today's strain vs recommended based on recovery
- Training load trend (under/optimal/over-training indicators)
- Steps and calorie trends
- Weekly activity summary

### 5.7 VO2 Max & Cardiovascular Fitness
Aerobic fitness estimation:

| Level | VO2 Max (Men) | VO2 Max (Women) |
|-------|---------------|-----------------|
| Poor | < 35 | < 27 |
| Fair | 35-40 | 27-31 |
| Good | 40-48 | 31-37 |
| Excellent | 48-55 | 37-44 |
| Elite | > 55 | > 44 |

**Features:**
- Current VO2 Max estimate (from device or manual test)
- Fitness age vs actual age
- Improvement tips (HIIT, zone 2 training, etc.)
- Historical trend

### 5.8 Body Composition & InBody Analysis
Detailed body metrics:

| Metric | Source | Description |
|--------|--------|-------------|
| **Weight** | Scale/manual | Daily/weekly tracking |
| **Body Fat %** | InBody/calipers/DEXA | Fat mass percentage |
| **Muscle Mass** | InBody | Skeletal muscle mass (kg) |
| **BMR** | Calculated | Basal metabolic rate |
| **Body Water %** | InBody | Total body water |
| **Visceral Fat** | InBody | Internal organ fat level |
| **Bone Mass** | InBody | Bone mineral content |
| **Segmental Analysis** | InBody | Per-limb muscle/fat |

**Features:**
- InBody result upload and analysis
- Body fat % ranges by age/gender
- Measurement tracking (chest, waist, hip, arms, legs)
- Progress photos with body composition overlay
- Weight trend with moving average

### 5.9 Stress & Mental Wellness
Stress monitoring and management:

| Level | Score | Recommendation |
|-------|-------|----------------|
| Low | 1-25 | Normal, good to train |
| Moderate | 26-50 | Monitor, moderate training |
| High | 51-75 | Consider lighter training, focus on recovery |
| Very High | 76-100 | Prioritize rest, breathing exercises |

**Features:**
- Stress level logging (5 levels)
- Guided breathing exercises (4-7-8 method, box breathing)
- Stress tips based on current level
- Correlation with training performance
- HRV-based stress estimation (from wearables)

### 5.10 Blood Work & Lab Results
Track medical lab results over time:

| Test | Unit | Optimal Range |
|------|------|---------------|
| Total Cholesterol | mg/dL | < 200 |
| LDL | mg/dL | < 100 |
| HDL | mg/dL | > 40 (men), > 50 (women) |
| Triglycerides | mg/dL | < 150 |
| Fasting Glucose | mg/dL | 70-100 |
| HbA1c | % | < 5.7 |
| Vitamin D | ng/mL | 30-50 |
| Vitamin B12 | pg/mL | 200-900 |
| Testosterone | ng/dL | 300-1000 (men) |
| TSH | mIU/L | 0.4-4.0 |
| Hemoglobin | g/dL | 13.5-17.5 (men), 12-16 (women) |
| Creatinine | mg/dL | 0.7-1.3 |

**Features:**
- Log lab results with date
- Trend graphs per metric
- Color-coded ranges (green/yellow/red)
- Recommended lab tests guide
- How training affects blood markers

### 5.11 Health Trends Dashboard
Unified view across all health metrics:
- 7 / 30 / 90 day / All time views
- Cross-metric correlation (sleep vs recovery, stress vs HRV)
- Weekly health summary report
- Monthly health score
- Exportable health reports (PDF)

### 5.12 Data Sharing with Trainer
- Client controls what trainer can see (granular toggles per metric category)
- Can revoke access at any time
- Trainer sees visual graphs, not raw data
- Privacy toggles: Sleep / Heart / Activity / Body / Stress / Labs
- Trainer gets alerts for significant changes (sudden weight drop, low recovery streak)

### 5.13 Data Privacy & Security
- All health data encrypted at rest
- Option to delete all synced data
- No sharing with third parties
- GDPR-compliant data handling
- Clear data retention policies

---

## 6. Progress Tracking

### 6.1 Body Metrics
- Weight (with graph over time)
- Body measurements (chest, waist, hips, arms, legs)
- Body fat percentage (manual input or smart scale sync)
- BMI calculation

### 6.2 Progress Photos
- Take and store progress photos
- Side-by-side comparison tool
- Share with trainer (optional)
- Private by default

### 6.3 Achievements
- Workout streaks
- Weight milestones
- Strength PRs
- Consistency badges

---

## 7. User Profiles

### 7.1 Client Profile
- Personal info (name, age, gender)
- Body stats (height, weight, measurements)
- Goals (lose weight, build muscle, etc.)
- Activity level
- Dietary restrictions/allergies
- Equipment inventory
- Current trainer (if any)
- Health app connections

### 7.2 Preferences
- Notification settings
- Privacy settings (what trainer can see)
- Language (Arabic/English)
- Units (metric/imperial)
- Theme (light/dark)

---

## 8. Subscription System

**NO FREE TIER** — Forma is a premium-only app. Not available for free to the public.

### 8.1 Free Trial (7 Days)
- All Premium features included
- Available to new users only
- Shows countdown: "X days left in trial"
- Prompt to subscribe before expiry
- Locks out after trial ends (must subscribe)
- One-time only per account

### 8.2 Premium (299 LE/month)
- **Guided AI Chat** — state machine with premade options (no free text). Fast, all local/DB, no GPT.
- Supplements recommendations embedded in nutrition page
- Healthy food book/guide with ingredient sourcing
- AI chat performs actions across app (create workout drafts, log meals, search exercises)
- Preset workout programs library
- Full exercise & food database access
- Workout & meal tracking with unlimited history
- Health dashboard with all wearable integrations (Whoop/Apple Watch/OURA/Garmin style)
- Recovery score, sleep analysis, HRV, strain tracking
- Body composition & InBody analysis
- Blood work & lab tracking
- Trainer marketplace access
- Ad-free experience

### 8.3 Premium+ (999 LE/month)
- Everything in Premium, PLUS:
- **Free AI Chat** — type anything, full GPT conversation with your complete fitness context
- Owner personally reviews and sets initial program
- Fast workout plan generation with custom exercise additions
- Pre-workout & post-workout personalized guidance
- Whoop-style health tables & advanced stats
- Walking tables from health data
- InBody statistics & deep analysis
- Priority trainer matching
- Multiple trainer support (nutrition + workout)
- Export all data (PDF health reports)
- Premium+ badge on profile
- Priority support

### 8.4 Yearly Packages
- Promotional pricing TBD
- Discount for annual commitment

---

## 9. Payment System

### 9.1 Trainer Payments
- Trainers set their own prices
- Minimum period: 1 week
- Payment flow:
  1. Client requests trainer
  2. Trainer accepts
  3. Payment deducted from client
  4. Held for 7 days minimum
  5. Trainer can withdraw after hold period
- Platform commission varies by trainer tier

### 9.2 Commission Structure

**Standard Trainers:**
| Clients Completed | Rating Required | Commission |
|-------------------|-----------------|------------|
| 0-20 | Any | 25% |
| 21-50 | 4.0+ | 20% |
| 51-100 | 4.3+ | 18% |
| 100+ | 4.5+ | 15% |

**Partner Trainers:** 0% commission (invited by founders)

### 9.3 Payment Methods (Egypt)
- Vodafone Cash
- Fawry
- InstaPay
- Credit/Debit cards
- Future: Orange Money, Etisalat Cash

### 9.4 Trainer Payouts
- Weekly payout option
- Minimum balance to withdraw: EGP 100
- Bank transfer or mobile wallet
- 7-day hold on all payments before withdrawal

---

## 10. Admin Panel

### 10.1 Trainer Verification
- Queue of pending trainer applications
- View submitted documents/certifications
- Human verification only (no AI)
- Approve with verified badge
- Reject with reason
- Request additional information

### 10.2 Dispute Resolution
- View reported issues
- Client complaints about trainers
- Trainer complaints about clients
- Review evidence (chat logs, etc.)
- Issue warnings, refunds, or bans

### 10.3 User Management
- Search users (clients and trainers)
- View user details and activity
- Suspend/ban users
- Password reset assistance

### 10.4 Content Moderation
- Reported reviews
- Reported chat messages
- Reported profile photos

### 10.5 Analytics Dashboard
- Total users (free, trial, premium, premium+, trainers)
- Revenue metrics
- Active trainer-client pairs
- Popular trainers
- User growth trends
- Retention rates
- Trial conversion rates

### 10.6 Platform Settings
- Commission percentage per tier
- Subscription pricing
- Featured trainers
- Announcements/notifications

### 10.7 Super Admin Powers (Founders Only)
- Grant/revoke Partner status (0% commission)
- Gift free Premium to any user
- Cannot gift Premium+ (must be paid)
- Override trainer verification
- Manage admin accounts

---

## 11. Offline Capabilities

- Full ingredient database available offline
- Full exercise database available offline
- Cached workout videos (recently viewed)
- Log workouts offline → sync when online
- Log meals offline → sync when online
- Chat requires internet
- Trainer features require internet
- Health sync requires internet
