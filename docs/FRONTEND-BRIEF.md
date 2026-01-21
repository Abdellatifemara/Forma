# FitApp - Frontend Design Brief

## For: Claude Web Frontend Collaboration

This document contains everything needed to design the FitApp mobile frontend. Read carefully before starting.

---

## 1. App Overview

**FitApp** is an AI-powered fitness and nutrition app for the Egyptian market.

### Design Philosophy: LOOKS FIRST, FUNCTIONALITY SECOND

**This app needs to feel like "WOW" from the first second.**

- Every screen should look like it belongs in a design portfolio
- Smooth animations everywhere
- Premium feel even for free users
- The kind of app people screenshot and share
- Think: Apple-level polish meets fitness motivation

**Core Features:**
- Egyptian food database with calories/macros
- Exercise database with videos
- AI meal generation ("What can I make with these ingredients?")
- AI workout generation (adapts to equipment)
- Trainer marketplace (hire personal trainers)
- Health integration (Apple Health, Google Fit)
- Chat between trainers and clients
- Progress tracking with photos/videos
- Trainer notes (general + day-specific)

**Target:** Egyptian users aged 18-45

**Languages:** Arabic (RTL) and English

---

## 2. User Types & Flows

### 2.1 Registration (Required for Everyone)

```
App Open
    |
Welcome Screen
    |
"Join as..." → [Client] or [Trainer]
    |
    ├── Client → Client Onboarding
    └── Trainer → Trainer Onboarding (needs verification)
```

### 2.2 Client Subscription Tiers

| Tier | Price | Key Features |
|------|-------|--------------|
| **Free** | EGP 0 | Basic logging, 7-day history, ads |
| **Free Trial** | 7 days | All Premium features (new users only) |
| **Premium** | EGP 99/mo | Trainer marketplace, warmups, limited AI |
| **Premium+** | EGP 199/mo | Unlimited AI, all add-ons (Kegel, Yoga, etc.) |

### 2.3 Trainer Types

| Type | Fee | Perks |
|------|-----|-------|
| **Standard** | 15% | Free Premium access |
| **Partner** | 5% | Can gift Premium to clients |

---

## 3. Core Screens to Design

### 3.1 Onboarding Flow (Client)

**Screen 1: Welcome**
- App logo
- "Join as Client" button
- "Join as Trainer" button
- Language toggle (AR/EN)

**Screen 2: Create Account**
- Email or Phone input
- Password
- "Sign up" button
- "Already have account? Login"

**Screen 3: Verify (OTP)**
- 6-digit OTP input
- "Resend code" link
- Timer countdown

**Screen 4: Basic Info**
- Name
- Age (date picker or number)
- Gender (Male/Female)

**Screen 5: Body Stats**
- Height (cm or ft/in toggle)
- Current weight (kg or lb toggle)
- Goal weight (optional)

**Screen 6: Fitness Goal**
- Selectable cards:
  - Lose weight
  - Build muscle
  - Get stronger
  - Improve endurance
  - Stay healthy

**Screen 7: Activity Level**
- Selectable options:
  - Sedentary (desk job)
  - Lightly active (1-2x/week)
  - Moderately active (3-4x/week)
  - Very active (5+/week)

**Screen 8: Training Location**
- Home (no equipment)
- Home (some equipment)
- Gym

**Screen 9: Equipment Selection** (if home with equipment)
- Checklist of common equipment
- "Add custom" option

**Screen 10: Add-on Programs** (optional)
- Checkboxes:
  - Kegel Exercises (Premium+ only - show lock icon)
  - Yoga (Premium+ only)
  - Stretching (Premium+ only)
  - Mobility Work (Premium+ only)
- Note: "Upgrade to Premium+ to unlock"

**Screen 10.5: Weak Spots** (Premium+ exclusive or show locked)
- "Where do you want to get stronger?"
- Visual body diagram (front + back)
- Tap to select weak areas:
  - Upper chest
  - Lower chest
  - Upper back
  - Lower back
  - Shoulders
  - Arms (biceps/triceps)
  - Core/Abs
  - Glutes
  - Quads
  - Hamstrings
  - Calves
- Multiple selections allowed
- "We'll build programs to strengthen these areas"
- Premium+ feature - show upgrade prompt for others

**Screen 11: Dietary Preferences**
- Any restrictions? (vegetarian, vegan, pescatarian, etc.)
- Allergies? (multi-select: nuts, dairy, gluten, shellfish, eggs, etc.)

**Screen 12: Health Apps Connection Popup**
```
┌─────────────────────────────────────┐
│  Connect Your Health Data           │
│                                     │
│  Sync for better tracking.          │
│                                     │
│  [Apple Health icon] Apple Health   │
│  Steps, heart rate, sleep           │
│  [Connect]                          │
│                                     │
│  [Google Fit icon] Google Fit       │
│  Steps, activity, sleep             │
│  [Connect]                          │
│                                     │
│  [Samsung icon] Samsung Health      │
│  Steps, heart rate, sleep           │
│  [Connect]                          │
│                                     │
│  [Skip for now]                     │
│  You can connect later in Settings  │
└─────────────────────────────────────┘
```

**Screen 13: Notifications Permission**
- System prompt for notifications

**Screen 14: Free Trial Activation**
- "Your 7-day Premium trial starts now!"
- Show what's included
- "Get Started" button

---

### 3.2 Home Screen (Client)

**Top Section:**
- Greeting: "Good morning, [Name]"
- Date
- Subscription badge (Free/Premium/Premium+)
- If trial: "6 days left in trial" banner

**Quick Stats Cards:**
- Calories today (consumed/target)
- Steps (if connected)
- Workout streak

**Today's Plan:**
- Today's workout preview
  - "Chest Day" with muscle icon
  - "Start Workout" button
- Warmup reminder (Premium+): "Warmup ready for today's muscles"

**Tomorrow Hint:**
- Small card: "Tomorrow: Shoulder Day"
- Just a hint, not full details

**Meal Log Section:**
- Breakfast / Lunch / Dinner / Snacks
- Tap to add
- Show logged calories

**Quick Actions:**
- "What can I make?" (AI meal generator)
- "Find a Trainer" (Premium only)
- "Log Weight"

**Bottom Navigation:**
- Home
- Workouts
- Nutrition
- Progress
- Profile

---

### 3.3 Workout Screen

**Browse Tab:**
- Search bar
- Filter chips: Muscle group, Equipment, Difficulty
- Exercise cards with:
  - Thumbnail from video
  - Exercise name
  - Equipment needed icon
  - Difficulty badge

**Programs Tab:**
- Program cards:
  - Program name
  - Duration (e.g., "8 weeks")
  - Frequency (e.g., "4x/week")
  - Goal badge (fat loss, muscle, strength)
  - Equipment needed

**My Plan Tab:**
- Today's workout
- Week view calendar
- Completed workouts checkmarks

---

### 3.4 Active Workout Screen

**Header:**
- Workout name
- Timer (elapsed)
- "End Workout" button

**Current Exercise:**
- Video player (auto-loop)
- Exercise name
- Target: "4 sets x 12 reps"
- Current set indicator

**Controls:**
- Weight input (optional)
- Reps completed input
- "Complete Set" button
- Rest timer (auto-starts after set)

**Next Exercise Preview:**
- Small card showing next exercise

**Progress Bar:**
- Shows exercises completed / total

---

### 3.5 Nutrition Screen

**Daily Summary:**
- Calories: consumed / target
- Macros circular progress:
  - Protein (g)
  - Carbs (g)
  - Fat (g)

**Meals:**
- Breakfast (tap to expand)
- Lunch
- Dinner
- Snacks

**Add Food Options:**
- Search database
- "What can I make?" (AI)
- Quick add calories
- Recent foods
- Favorites

---

### 3.6 AI Meal Generator ("What can I make?")

**Step 1: Input Ingredients**
- Text input or voice
- "I have chicken, rice, and tomatoes"
- Or select from recent ingredients
- Add from search

**Step 2: Preferences**
- Target calories (slider)
- Meal type: Breakfast/Lunch/Dinner
- Quick or elaborate?

**Step 3: Results**
- 3-4 meal suggestions
- Each shows:
  - Meal name
  - Photo (if available)
  - Calories
  - Prep time
  - Macros

**Step 4: Selected Meal**
- Full recipe
- Ingredients list
- Step-by-step instructions
- Nutrition breakdown
- "Log this meal" button
- "Save for later" button

---

### 3.7 Trainer Marketplace (Premium Only)

**Browse Trainers:**
- Search bar
- Filters:
  - Specialization (weight loss, muscle, calisthenics, etc.)
  - Price range
  - Rating
  - Gender

**Trainer Card:**
- Profile photo
- Name
- Verified badge (checkmark)
- Partner badge (star) if applicable
- Rating (stars)
- Specializations (tags)
- Price: "EGP X/week"
- "View Profile" button

**Trainer Profile Screen:**
- Large photo
- Bio
- Instagram link
- Certifications (verified)
- Specializations
- Experience
- Reviews from clients
- Pricing
- "Request This Trainer" button

---

### 3.8 Client-Trainer Relationship

**After Matching:**

**Client View:**
- Trainer card at top of home
- Chat button
- Timeline button
- Current plan assigned

**Chat Screen:**
- Standard messaging UI
- Text, photo, video support
- Read receipts

**Progress Timeline (Separate from Chat):**
- Chronological feed
- Client uploads:
  - Progress photos
  - Videos (form checks)
  - Day tag (auto or manual): "Day 15"
- Trainer can comment
- Filter by: Photos / Videos / All

**Trainer Notes:**
- General notes (always visible to client)
- Day-specific notes (appear on that day's workout)
- Example: "Push harder on chest today" or "Remember to focus on form"
- Notes appear as cards in client's workout view

---

### 3.9 Trainer Dashboard

**Home:**
- Earnings summary
- Active clients count
- Pending requests badge
- Commission tier display (15% or 5%)

**Clients Tab:**
- Client cards showing:
  - Photo
  - Name
  - Days together
  - Last active
  - Unread messages badge

**Client Detail View:**
- Stats: height, weight, goal
- Equipment list
- **Weak spots** (if Premium+ user selected them)
- **Health Graphs** (if client shared):
  - Steps trend (7/30/90 days)
  - Sleep trend
  - Heart rate trend
  - Calorie burn trend
  - Weight trend
- Workout history
- Meal logs
- Progress photos
- Timeline
- Chat
- Assigned plans
- **Notes section:**
  - Add general note (always visible)
  - Add day-specific note (pick the day)
  - View all notes history

**Requests Tab:**
- Pending client requests
- Client preview (stats, goals, equipment)
- Accept / Decline buttons

**Earnings Tab:**
- Available balance
- Pending balance (in hold)
- Commission rate
- Transaction history
- "Withdraw" button

---

### 3.10 Progress Screen (Client)

**Weight Graph:**
- Line chart over time
- Add new entry button

**Body Measurements:**
- Chest, waist, hips, arms, legs
- Track changes

**Progress Photos:**
- Grid view
- Side-by-side comparison tool
- Private by default
- Share with trainer toggle

**Achievements:**
- Streak badges
- Milestone badges
- PR (personal record) badges

---

### 3.11 Health Graphs (Premium)

**Available Graphs:**
- Steps (daily/weekly trend)
- Sleep (hours per night)
- Resting Heart Rate
- Active Calories
- Weight trend

**Each Graph:**
- Toggle: 7 days / 30 days / 90 days
- Visual line/bar chart
- Average stat
- Trend indicator (up/down arrow)

---

### 3.12 Settings/Profile

**Account:**
- Edit profile
- Change password
- Subscription management

**Preferences:**
- Language (Arabic/English)
- Units (metric/imperial)
- Notifications settings

**Health:**
- Connected apps
- Privacy (what trainer can see)

**Support:**
- Help center
- Contact us

**Danger Zone:**
- Delete account

---

## 4. Trainer Onboarding Screens

**Screen 1: Personal Info**
- Full name
- Age
- Gender
- Profile photo (required)

**Screen 2: Professional Info**
- Instagram handle
- Years of experience
- Bio (PREFILLED TEMPLATE - editable)
- "Clear form" button to start fresh

**Screen 3: Specializations**
- Multi-select:
  - Weight loss
  - Muscle building
  - Calisthenics
  - Powerlifting
  - CrossFit
  - Bodybuilding
  - Sports specific
  - Rehabilitation
  - Nutrition coaching
  - Kegel/Pelvic Health
  - Yoga

**Screen 4: Certifications**
- Upload certificate images
- Certificate name (prefilled suggestions)
- Issuing organization (dropdown + custom)
- Year obtained

**Screen 5: Transformations** (optional)
- Before/after photos of past clients
- Client testimonials

**Screen 6: Pricing**
- Weekly rate input (with market suggestions)
- Monthly rate input
- Currency: EGP

**Screen 7: Availability**
- Accepting new clients? (toggle)
- Max clients limit (number)
- Expected response time (prefilled: "Within 24 hours")

**Screen 8: Review & Submit**
- Preview profile (see how clients will see you)
- Edit any section
- Agree to terms checkbox
- Submit for verification

**Screen 9: Pending Verification**
```
Your application is under review.
A human will verify your credentials.
We'll notify you within 48-72 hours.
```

---

## 5. Design Guidelines

### THE WOW FACTOR - This is Critical

**The app must look so good that users think "this is premium" before they even use it.**

**Visual Impact Principles:**
- Hero images/videos on key screens
- Gradient backgrounds (subtle, modern)
- Glassmorphism effects where appropriate
- Micro-animations on every interaction
- Parallax scrolling effects
- Smooth page transitions (not just simple fades)
- Loading animations that feel intentional
- Celebratory animations for achievements

**Inspiration Apps:**
- Nike Training Club (workout flow)
- Calm (meditation, premium feel)
- Apple Fitness+ (polish, animations)
- Strava (progress tracking)
- Headspace (friendly, inviting)

### Colors
- Primary: Bold, energetic (electric blue, vibrant teal, or powerful purple)
- Secondary: Warm accent (coral, orange, or gold)
- Gradients: Use gradients for premium feel
- Background: Clean whites with subtle gradients
- Dark mode: Rich blacks, not pure black
- Premium badge: Gold/amber gradient
- Premium+ badge: Platinum/iridescent effect

### Typography
- Arabic: Modern, clean Arabic font (Cairo, Tajawal)
- English: Premium sans-serif (SF Pro, Inter, Satoshi)
- Bold headlines that command attention
- Generous letter spacing
- Large touch targets

### Iconography
- Custom icon set if possible
- Consistent stroke width
- Animated icons for key actions
- Muscle group icons should look professional
- Food icons should look appetizing

### Cards & Components
- Large rounded corners (16-24px)
- Soft shadows with color tint
- Glassmorphism for overlays
- Generous padding (don't cramp)
- Card hover/press animations

### Animations (Essential)
- Page transitions: Slide + fade combinations
- Button press: Scale down slightly + haptic
- Card tap: Subtle lift effect
- Success: Confetti or checkmark burst
- Loading: Skeleton screens + shimmer
- Pull to refresh: Custom branded animation
- Scroll: Parallax on hero images
- Numbers: Count-up animations for stats

### RTL Support
- Full right-to-left for Arabic
- Mirrored layouts
- Proper text alignment
- Test everything in Arabic

### Dark Mode
- Not just inverted colors
- Rich, deep backgrounds
- Glowing accents
- Proper contrast for readability
- Premium feel in both modes

---

## 6. Key User Journeys to Design

1. **New user signup → Trial → First workout**
2. **User searches food → Logs meal → Sees daily summary**
3. **User uses AI meal generator → Gets suggestions → Logs meal**
4. **Premium user finds trainer → Requests → Gets accepted → Chats**
5. **Trainer receives request → Views client → Accepts → Assigns plan**
6. **User does workout → Completes sets → Sees summary**
7. **User uploads progress photo → Trainer comments**
8. **Trainer creates workout for client using AI prefill**

---

## 7. Empty States

Design empty states for:
- No workouts logged yet
- No meals logged today
- No trainers found (with filters)
- No messages yet
- No progress photos yet
- No clients yet (trainer)

---

## 8. Loading States

- Skeleton loaders for content
- Spinner for actions
- Progress bar for long operations
- Pull-to-refresh animation

---

## 9. Error States

- Network error
- Payment failed
- Upload failed
- Server error
- Form validation errors

---

## 10. Notifications (In-App)

- Trial ending soon
- New message from trainer/client
- Workout reminder
- Trainer accepted your request
- Payment received
- New review received

---

## 11. What to Deliver

Please provide:
1. **Wireframes** for all key screens
2. **User flow diagrams** for main journeys
3. **Component library** suggestions
4. **Color palette** recommendations
5. **Typography scale**
6. **Spacing/sizing system**
7. **Any questions** about unclear requirements

---

## 12. Questions for You

As you design, consider:
1. How to make Premium features feel valuable without annoying free users?
2. How to show "locked" Premium+ add-ons enticingly?
3. How to make trainer discovery feel trustworthy?
4. How to make the AI features feel magical but not confusing?
5. How to handle the day-by-day reveal of AI-generated plans?

---

## 13. Files to Reference

The full documentation is in these files:
- `01-PROJECT-OVERVIEW.md` - Business model, user types
- `02-FEATURES.md` - Complete feature list
- `03-USER-FLOWS.md` - Detailed user journeys
- `05-TRAINER-SYSTEM.md` - Trainer features
- `06-PAYMENT-SYSTEM.md` - Payment flows
- `09-MILESTONES.md` - Development checklist

---

**Ready to start? Let me know what screens you want to tackle first!**
