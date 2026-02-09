# User Flows: Detailed Step-by-Step

## Purpose
Define EXACTLY how each user flow works. No ambiguity. Use this as the spec for implementation.

---

# FLOW 1: New User Registration → First Workout

## Step 1.1: Registration Page
**URL:** `/signup`

**UI Elements:**
- Email input
- Password input (with show/hide toggle)
- Confirm password input
- First name input
- Last name input
- "Create Account" button
- "Already have an account? Log in" link
- "Sign up with Google" button (optional)

**Validation:**
- Email: valid format, not already registered
- Password: min 8 chars, 1 uppercase, 1 number
- Confirm password: must match
- First/Last name: min 2 chars each

**On Submit:**
1. Call `POST /api/auth/register`
2. If success → Show "Check your email" message
3. If error → Show error message

## Step 1.2: Email Verification
**Email Content:**
```
Subject: Verify your FORMA account

Hi [First Name],

Welcome to FORMA! Click below to verify your email:

[VERIFY EMAIL BUTTON]

This link expires in 24 hours.

- The FORMA Team
```

**On Click:**
1. User clicks link → Opens `/verify-email?token=xxx`
2. Frontend calls `POST /api/auth/verify-email` with token
3. If success → Redirect to login with "Email verified!" message
4. If expired → Show "Link expired, request new one" with button

## Step 1.3: Login
**URL:** `/login`

**On Submit:**
1. Call `POST /api/auth/login`
2. Store tokens in cookies
3. Check if onboarding complete: `GET /api/users/me`
4. If `onboardingCompletedAt` is null → Redirect to `/onboarding`
5. Else → Redirect to `/dashboard`

## Step 1.4: Onboarding
**URL:** `/onboarding`

**Screen 1: Personal Info**
```
"Let's personalize your experience"

- Gender selection (Male/Female)
- Date of birth picker
- Height (cm) slider
- Current weight (kg) slider

[Next]
```

**Screen 2: Fitness Goal**
```
"What's your main goal?"

[ ] Lose weight
[ ] Build muscle
[ ] Get stronger
[ ] Improve fitness
[ ] Maintain weight

[Next]
```

**Screen 3: Activity Level**
```
"How active are you?"

[ ] Sedentary (desk job)
[ ] Lightly active (1-2 days exercise)
[ ] Moderately active (3-4 days exercise)
[ ] Very active (5+ days exercise)

[Next]
```

**Screen 4: Equipment**
```
"What equipment do you have?"

[x] Bodyweight only
[ ] Dumbbells
[ ] Barbell & weights
[ ] Pull-up bar
[ ] Resistance bands
[ ] Full gym access

[Next]
```

**Screen 5: Workout Frequency**
```
"How many days per week can you train?"

( ) 2 days
( ) 3 days
( ) 4 days
( ) 5 days
( ) 6 days

[Complete Setup]
```

**On Complete:**
1. Call `PATCH /api/users/me/onboarding` with all data
2. Backend generates initial workout plan based on:
   - Goal
   - Equipment
   - Frequency
   - Level (assume beginner for new users)
3. Set `onboardingCompletedAt` to now
4. Redirect to `/dashboard`

## Step 1.5: Dashboard (First Time)
**URL:** `/dashboard`

**What User Sees:**
```
Good morning, Ahmed!                          [Profile Icon]

┌─────────────────────────────────────────────┐
│  🎉 Your Plan is Ready!                     │
│                                              │
│  We created a 4-week Beginner Full Body     │
│  program just for you.                       │
│                                              │
│  [Start Day 1 →]                            │
└─────────────────────────────────────────────┘

Today: Day 1 - Full Body A
━━━━━━━━━━━━━━━━━━━━━━━━━
• Squats - 3x10
• Push-ups - 3x10
• Dumbbell Rows - 3x10
• Plank - 3x30s

[Start Workout]
```

---

# FLOW 2: Complete a Workout

## Step 2.1: Start Workout
**From Dashboard:** Click "Start Workout"

**What Happens:**
1. Navigate to `/workout/session/[workout-id]`
2. Load workout data
3. Show workout overview

## Step 2.2: Workout Overview Screen
```
Day 1 - Full Body A                           [X Close]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4 Exercises • ~45 min

1. Squats                              3 sets
2. Push-ups                            3 sets
3. Dumbbell Rows                       3 sets
4. Plank                               3 sets

[Begin Workout]
```

## Step 2.3: Active Exercise Screen
```
◀                Exercise 1 of 4              ▶
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SQUATS
[Video Player - Loop]

Previous: 3x10 @ bodyweight

Set 1    [ 10 ]  reps   [ BW ] kg   [✓]
Set 2    [ __ ]  reps   [ __ ] kg   [ ]
Set 3    [ __ ]  reps   [ __ ] kg   [ ]

[Skip Exercise]                    [Next ▶]
```

**Interaction:**
- Tap rep box → Number keyboard appears
- Tap weight box → Number keyboard appears
- Tap ✓ → Marks set complete, starts rest timer
- Tap Next → Goes to next exercise (after all sets or skip)

## Step 2.4: Rest Timer
```
┌─────────────────────────────────────────────┐
│                                              │
│              REST TIME                       │
│                                              │
│              01:30                           │
│              ━━━━━━━━━━━━                    │
│                                              │
│  Next: Set 2 - Squats                       │
│                                              │
│  [Skip Rest]           [+30s]               │
│                                              │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Default rest: 60-90 seconds based on exercise
- Vibrate/sound when timer ends
- Auto-dismiss after timer, show next set

## Step 2.5: Workout Complete Screen
```
🎉 Workout Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration        Exercises       Volume
32 min          4/4             1,200 kg

┌─────────────────────────────────────────────┐
│  🔥 New Personal Record!                    │
│  Squats: 12 reps @ 20kg                     │
└─────────────────────────────────────────────┘

How was this workout?
[ 😴 ] [ 😐 ] [ 💪 ] [ 🔥 ] [ ⚡ ]

[Save Workout]                    [Discard]
```

**On Save:**
1. Call `POST /api/workouts/log` with:
   - All sets logged
   - Duration
   - Difficulty rating
2. Update streak
3. Check for new PRs
4. Redirect to dashboard with success message

---

# FLOW 3: Log a Meal

## Step 3.1: Nutrition Page
**URL:** `/nutrition`

```
Today                                    [< >] Date Nav
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Calories: 1,240 / 2,000
━━━━━━━━━━━━━━━━━ 62%

Protein    Carbs      Fat
45g/150g   120g/250g  35g/70g

Breakfast                               [+ Add]
├─ 2 بيض مسلوق (150 cal)
└─ فول مدمس (200 cal)

Lunch                                   [+ Add]
└─ No foods logged

Dinner                                  [+ Add]
└─ No foods logged

Snacks                                  [+ Add]
└─ No foods logged
```

## Step 3.2: Add Food Modal
**Click "+ Add" on Lunch:**

```
Add to Lunch                                [X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🔍 Search foods...                        ]

Recent
─────
• فول مدمس                           + Add
• كشري                               + Add
• بيض مسلوق                          + Add

Popular Egyptian Foods
─────────────────────
• رز ابيض                            + Add
• فراخ مشوية                         + Add
• عيش بلدي                           + Add
```

## Step 3.3: Search & Add
**Type "فراخ":**

```
Search: فراخ                               [X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results
───────
• فراخ مشوية (100g)          165 cal   + Add
• فراخ مقلية (100g)          285 cal   + Add
• فراخ بانيه (1 قطعة)        250 cal   + Add
• صدور فراخ (100g)           120 cal   + Add
```

## Step 3.4: Serving Size
**Click "+ Add" on "صدور فراخ":**

```
صدور فراخ                                  [X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Per 100g:
├─ Calories: 120
├─ Protein: 26g
├─ Carbs: 0g
└─ Fat: 2g

Serving Size
[−]        150g        [+]

Total: 180 cal | 39g protein

[Add to Lunch]
```

**On Add:**
1. Call `POST /api/nutrition/meals` with:
   - foodId
   - mealType: "LUNCH"
   - servingSize: 150
   - date: today
2. Refresh nutrition page

---

# FLOW 4: Trainer Request

## Step 4.1: Browse Trainers
**URL:** `/trainers`

```
Find a Trainer                        [Filter]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│  [Photo]  Ahmed Hassan                      │
│           Weight Loss Specialist            │
│           ⭐ 4.9 (52 reviews)              │
│           500 EGP/month                     │
│                                             │
│           [View Profile]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [Photo]  Sarah Mohamed                     │
│           Calisthenics Coach               │
│           ⭐ 4.8 (38 reviews)              │
│           750 EGP/month                     │
│                                             │
│           [View Profile]                    │
└─────────────────────────────────────────────┘
```

## Step 4.2: Trainer Profile
**URL:** `/trainers/[id]`

```
◀ Back

[Large Photo]

Ahmed Hassan
━━━━━━━━━━━━
Weight Loss Specialist | 5 years experience
⭐ 4.9 (52 reviews) | 89 clients trained

About
─────
Certified personal trainer specializing in
sustainable weight loss for busy professionals.
I focus on habit building and nutrition coaching.

Certifications
──────────────
• ACE Personal Trainer
• Precision Nutrition Level 1

Pricing
───────
500 EGP/month
Includes: Custom workout plan, nutrition guidance,
weekly check-ins, chat support

[Request This Trainer]

Reviews
───────
⭐⭐⭐⭐⭐ "Best trainer ever!" - Mohamed A.
⭐⭐⭐⭐⭐ "Lost 15kg in 3 months" - Sara M.
```

## Step 4.3: Request Trainer
**Click "Request This Trainer":**

```
Request Ahmed Hassan                       [X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ahmed will see your:
• Profile information
• Fitness goals
• Current stats

Message (optional):
┌─────────────────────────────────────────────┐
│ Hi Ahmed! I want to lose 10kg and build    │
│ some muscle. I have dumbbells at home.     │
└─────────────────────────────────────────────┘

Monthly Fee: 500 EGP

[Send Request]
```

**On Send:**
1. Check if user has Premium subscription
2. If no → Show upgrade modal
3. If yes → Create trainer request in pending state
4. Trainer receives notification

---

# FLOW 5: Trainer Accepts Client

## Step 5.1: Trainer Dashboard
**URL:** `/trainer/dashboard`

```
Good morning, Ahmed!                 [Profile]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│  🔔 New Client Request                      │
│                                              │
│  Mohamed Fathy wants to work with you       │
│  Goal: Lose weight                          │
│                                              │
│  [View Request]                             │
└─────────────────────────────────────────────┘

Active Clients: 12
Pending Requests: 1
Monthly Earnings: 6,000 EGP
```

## Step 5.2: Review Request
**Click "View Request":**

```
Client Request                             [X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Photo]  Mohamed Fathy
         Male, 28 years old

Stats
─────
Height: 175 cm
Weight: 90 kg
Goal: Lose weight
Level: Beginner

Equipment
─────────
• Dumbbells
• Resistance bands

Message
───────
"Hi Ahmed! I want to lose 10kg and build
some muscle. I have dumbbells at home."

[Decline]                        [Accept]
```

## Step 5.3: Accept Client
**Click "Accept":**

1. Create TrainerClient relationship
2. Process payment (hold for 7 days)
3. Unlock chat between trainer and client
4. Client receives notification
5. Trainer redirected to client page

---

# END-TO-END SUCCESS CRITERIA

A user must be able to:
1. ✅ Register and verify email
2. ✅ Complete onboarding
3. ✅ See their personalized workout plan
4. ✅ Start a workout
5. ✅ Log all sets with weight and reps
6. ✅ See rest timer between sets
7. ✅ Complete workout and see summary
8. ✅ View workout in history
9. ✅ Search and add foods
10. ✅ See daily nutrition summary
11. ✅ Log weight and see progress
12. ✅ Purchase subscription
13. ✅ Browse and request trainer
14. ✅ Chat with trainer

If ANY of these don't work → App is not ready for launch.
