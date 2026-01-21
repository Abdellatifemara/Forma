# FitApp - User Flows

## 1. Onboarding Flow

### 1.1 Initial Signup
```
App Open
    ↓
Welcome Screen
    ↓
"Join as..." → [Client] or [Trainer]
    ↓
    ├── Trainer → Trainer Onboarding Flow
    └── Client → Client Onboarding Flow
```

### 1.2 Client Onboarding
```
Create Account (email/phone + password)
    ↓
Verify email/phone (OTP)
    ↓
Basic Info
    - Name
    - Age
    - Gender
    ↓
Body Stats
    - Height
    - Current weight
    - Goal weight (optional)
    ↓
Fitness Goal
    - Lose weight
    - Build muscle
    - Get stronger
    - Improve endurance
    - Stay healthy
    ↓
Activity Level
    - Sedentary
    - Lightly active
    - Moderately active
    - Very active
    ↓
Training Location
    - Home (no equipment)
    - Home (some equipment)
    - Gym
    ↓
Equipment Selection (if applicable)
    - Checklist of common equipment
    - "Add custom equipment"
    ↓
Add-On Programs (optional, Premium+ only)
    - ☐ Kegel Exercises (pelvic floor)
    - ☐ Yoga (flexibility & recovery)
    - ☐ Stretching
    - ☐ Mobility Work
    - Shows lock icon for non-Premium+ users
    ↓
Weak Spots (Premium+ feature)
    - "Where do you want to get stronger?"
    - Visual body diagram (front + back view)
    - Tap to select weak areas (multiple allowed):
        - Upper/Lower Chest
        - Upper/Lower Back
        - Shoulders, Arms, Core
        - Glutes, Quads, Hamstrings, Calves
    - AI uses this to customize training
    ↓
Dietary Preferences (optional)
    - Any restrictions? (vegetarian, vegan, etc.)
    - Allergies? (nuts, dairy, gluten, etc.)
    ↓
Health Apps Popup (see 1.4)
    ↓
Notifications Permission
    ↓
Free Trial Activation
    ↓
→ Home Screen (7-Day Free Trial Active)
```

### 1.3 Trainer Onboarding (Prefilled Forms)
```
Create Account (email/phone + password)
    ↓
Verify email/phone (OTP)
    ↓
Welcome Message:
    "We'll help you set up your profile.
     Forms are prefilled to guide you.
     Edit anything or clear to start fresh."
    ↓
Personal Info (prefilled where possible)
    - Full name
    - Age
    - Gender
    - Profile photo (required)
    ↓
Professional Info (with prefilled templates)
    - Instagram handle
    - Years of experience
    - Short bio [PREFILLED TEMPLATE - editable]

    [Clear Form] button available
    ↓
Specializations (multi-select)
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
    ↓
Certifications
    - Upload certificate images
    - Certificate name [PREFILLED SUGGESTIONS]
    - Issuing organization [DROPDOWN + CUSTOM]
    - Year obtained
    ↓
Client Transformations (optional)
    - Before/after photos
    - Client testimonials
    ↓
Pricing (with market suggestions)
    - Set weekly rate (suggested: EGP X-Y)
    - Set monthly rate (suggested: EGP X-Y)
    - Currency (EGP)
    ↓
Availability
    - Accepting new clients? (Yes/No)
    - Max clients limit
    - Expected response time [PREFILLED: "Within 24 hours"]
    ↓
Review & Submit
    - Preview profile (see how clients will see you)
    - [Edit] any section
    - Agree to terms
    - Submit for verification
    ↓
→ Pending Verification Screen
    "Your application is under review.
     A human will verify your credentials.
     We'll notify you within 48-72 hours."
```

### 1.4 Health Apps Connection Popup
```
┌─────────────────────────────────────┐
│                                     │
│  📊 Connect Your Health Data        │
│                                     │
│  Sync your fitness data for better  │
│  tracking and trainer insights.     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ❤️ Apple Health             │   │
│  │ Steps, heart rate, sleep    │   │
│  │ [Connect]                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💚 Google Fit               │   │
│  │ Steps, activity, sleep      │   │
│  │ [Connect]                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔵 Samsung Health           │   │
│  │ Steps, heart rate, sleep    │   │
│  │ [Connect]                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Skip for now]                     │
│                                     │
│  You can always connect later in    │
│  Settings → Health Integration      │
│                                     │
└─────────────────────────────────────┘

After connecting:
    ↓
Permission screens (iOS/Android native)
    ↓
Sync confirmation
    "Connected! Your health data will sync automatically."
    ↓
Continue onboarding
```

### 1.5 Free Trial Flow
```
New user completes onboarding
    ↓
Free Trial Activated (7 days)
    ↓
Home Screen shows:
    "🎉 7 days of Premium - Free Trial"
    [See what's included]
    ↓
Day 5: Notification
    "Your free trial ends in 2 days.
     Subscribe to keep Premium features."
    ↓
Day 7: Trial ends
    ↓
Options:
    ├── Subscribe → Premium or Premium+
    └── Continue Free → Limited features, ads
    ↓
If no action: Auto-convert to Free tier
```

---

## 2. Client Daily Flow

### 2.1 Self-Guided Workout
```
Home Screen
    ↓
"Start Workout"
    ↓
Select Workout Type
    - Follow a program
    - Quick workout
    - Custom workout
    - Add-on only (Yoga/Kegel/Stretch)
    ↓
[If Program] → Select today's session
[If Quick] → Select muscle group + time
[If Custom] → Build from exercise library
[If Add-on] → Select add-on type
    ↓
Workout Active Screen
    - Current exercise (with video)
    - Sets/reps counter
    - Rest timer
    - Next exercise preview
    ↓
Complete Workout
    ↓
Workout Summary
    - Duration
    - Exercises completed
    - Volume
    - Personal records
    ↓
→ Home Screen (streak updated)
```

### 2.2 Meal Logging
```
Home Screen
    ↓
"Log Meal" or Tap meal slot
    ↓
Options:
    - Search food/recipe
    - Scan barcode (future)
    - Quick add calories
    - "What can I make?" (AI)
    ↓
[If Search] → Find item → Set portion → Add
[If AI] → Input ingredients → Get suggestions → Select → Add
    ↓
Meal logged → Daily summary updated
```

### 2.3 AI Meal Generator
```
"What can I make?"
    ↓
Input available ingredients
    - Type ingredients
    - Or select from recent/favorites
    ↓
Set preferences
    - Target calories
    - Meal type (breakfast/lunch/dinner)
    - Quick or elaborate
    ↓
AI generates options
    ↓
Select a meal
    ↓
View recipe + nutrition
    ↓
"Log this meal" or "Save for later"
```

### 2.4 Health Data & Graphs
```
Home Screen → "Health" tab
    ↓
View personal health graphs:
    - Steps (7/30/90 days)
    - Sleep (7/30/90 days)
    - Heart rate (7/30/90 days)
    - Active calories (7/30/90 days)
    - Weight trend (all time)
    ↓
If not connected:
    → Show Health Connection Popup
    ↓
If connected:
    - Auto-sync happens in background
    - Pull to refresh for manual sync
```

---

## 3. Subscription Flow

### 3.1 Subscribe to Premium
```
Home Screen → "Go Premium" or
Settings → "Subscription" or
Trial ending notification
    ↓
Subscription Options:
    ┌─────────────────────────────────┐
    │ PREMIUM                         │
    │ EGP XX/month                    │
    │ ✓ Trainer marketplace           │
    │ ✓ Advanced analytics            │
    │ ✓ Health graphs                 │
    │ ✓ Ad-free                       │
    │ ✓ Unlimited history             │
    │ [Subscribe]                     │
    └─────────────────────────────────┘

    ┌─────────────────────────────────┐
    │ PREMIUM+ ⭐                     │
    │ EGP XX/month                    │
    │ Everything in Premium, plus:    │
    │ ✓ Lifetime history              │
    │ ✓ Multiple trainers             │
    │ ✓ Priority matching             │
    │ ✓ Exclusive programs            │
    │ ✓ Export data                   │
    │ [Subscribe]                     │
    └─────────────────────────────────┘
    ↓
Select plan
    ↓
Payment method
    - Vodafone Cash
    - Fawry
    - InstaPay
    - Credit/Debit card
    ↓
Confirm payment
    ↓
Subscription active!
```

---

## 4. Trainer Marketplace Flow

### 4.1 Client Finds Trainer (Premium/Premium+ Only)
```
Home Screen (Premium Client)
    ↓
"Find a Trainer"
    ↓
[If Free user] → "Upgrade to Premium to access trainers"
    ↓
[If Premium/Premium+] →
Browse Trainers
    - Filter: specialization, price, rating, gender
    - Sort: rating, price, availability
    ↓
View Trainer Profile
    - Photo, bio, specializations
    - Certifications (verified badge)
    - Pricing
    - Reviews from clients
    - Instagram link
    ↓
"Request This Trainer"
    ↓
Confirm Request
    - Show pricing
    - Show what trainer will see about you
    ↓
Request Sent → Waiting for trainer response
```

### 4.2 Trainer Accepts Client
```
Trainer receives notification
    ↓
View Request
    - Client name, photo
    - Basic stats (height, weight, age)
    - Goals
    - Equipment
    - Health graphs preview (if shared)
    ↓
[Accept] or [Decline]
    ↓
[If Accept]
    - Payment deducted from client
    - Chat unlocked
    - Client added to trainer's dashboard
    - Notification sent to client
    ↓
[If Decline]
    - Optional: send reason
    - Client notified
    - No charge
```

### 4.3 Trainer Manages Client
```
Trainer Dashboard
    ↓
Select Client
    ↓
Client Overview
    - Stats: height, weight, measurements
    - Goals
    - Equipment
    - Progress photos
    - Workout history
    - Meal logs
    - Health graphs (if shared):
        - Steps trend
        - Sleep trend
        - Heart rate trend
        - Weight trend
    ↓
Actions:
    ├── Chat → Real-time messaging
    ├── Assign Workout → Prefilled or custom
    ├── Assign Meal Plan → Prefilled or custom
    ├── View Progress → Charts and photos
    └── Get AI Suggestions → "Recommend for this client"
```

### 4.4 Trainer Creates Plan for Client (Prefilled System)
```
"Assign Workout"
    ↓
Options:
    ┌─────────────────────────────────┐
    │ 📋 My Templates                 │
    │ Use a plan you've saved         │
    └─────────────────────────────────┘

    ┌─────────────────────────────────┐
    │ 📚 App Library                  │
    │ Start from a standard plan      │
    └─────────────────────────────────┘

    ┌─────────────────────────────────┐
    │ 🤖 AI Recommendation            │
    │ Prefilled based on client data  │
    │ [RECOMMENDED]                   │
    └─────────────────────────────────┘

    ┌─────────────────────────────────┐
    │ ✏️ Start Fresh                  │
    │ Build from scratch              │
    └─────────────────────────────────┘
    ↓
[If AI Recommendation]
    - System analyzes client: goals, equipment, level
    - Generates PREFILLED program
    - All fields editable
    - [Clear All] to start fresh
    ↓
Review/Edit
    - Add/remove exercises
    - Adjust sets/reps
    - Add notes
    - Include add-ons (Kegel, Yoga, etc.)
    ↓
Assign to Client
    ↓
Client receives notification
"Your trainer assigned a new workout plan"
```

---

## 5. Payment Flow

### 5.1 Client Pays for Trainer
```
Client requests trainer
    ↓
Trainer accepts
    ↓
Payment screen
    - Amount: [Trainer's rate]
    - Period: [1 week / 1 month]
    - Payment method: [Select]
        - Vodafone Cash
        - Fawry
        - InstaPay
        - Credit/Debit card
    ↓
Confirm payment
    ↓
Payment processed
    - Amount held (7-day minimum)
    - Chat unlocked
    - Period starts
    ↓
After 7 days:
    - Trainer can withdraw (minus commission)
    - Commission based on trainer tier
```

### 5.2 Trainer Redeems Earnings
```
Trainer Dashboard
    ↓
"Earnings"
    ↓
View:
    - Available balance (redeemable)
    - Pending balance (in hold period)
    - Commission rate: X%
    - Total earned
    - Transaction history
    ↓
"Withdraw"
    ↓
Select amount (min EGP 100)
    ↓
Select payout method
    - Bank account
    - Vodafone Cash
    - InstaPay
    ↓
Confirm withdrawal
    ↓
Processing (1-3 business days)
    ↓
Funds received
```

### 5.3 Partner Trainer Gifts Premium
```
Partner Trainer Dashboard (0% commission)
    ↓
Select subscribed client
    ↓
"Gift Premium"
    ↓
Confirmation:
    "Gift 1 month of Premium to [Client]?
     Note: Premium+ cannot be gifted."
    ↓
Confirm
    ↓
Client receives notification:
    "Your trainer gifted you 1 month of Premium! 🎉"
    ↓
Client's Premium extended by 1 month
```

---

## 6. Admin Flow

### 6.1 Verify Trainer (Human Review)
```
Admin Dashboard
    ↓
"Pending Verifications" (with count)
    ↓
View Application
    - Trainer info
    - Profile photo
    - Uploaded certifications (view documents)
    - Instagram handle (click to check)
    - Bio and experience
    ↓
Verification Checklist:
    ☐ Photo is professional
    ☐ Instagram is legitimate
    ☐ Certifications are readable
    ☐ Certifications appear valid
    ☐ Bio is appropriate
    ↓
Actions:
    ├── Approve → Trainer notified, verified badge added
    ├── Reject → Select reason, trainer notified
    └── Request More Info → Message sent to trainer
```

### 6.2 Handle Dispute
```
Admin Dashboard
    ↓
"Disputes" (with count)
    ↓
View Dispute
    - Reporter (client or trainer)
    - Reason
    - Evidence
    - Chat history (if relevant)
    ↓
Actions:
    ├── Issue warning to party
    ├── Issue refund to client
    ├── Suspend user temporarily
    ├── Ban user permanently
    └── Dismiss dispute
```

### 6.3 Super Admin Actions (Founders Only)
```
Super Admin Dashboard
    ↓
Special Actions:
    ↓
"Grant Partner Status"
    - Search trainer
    - Set commission to 0%
    - Enable Premium gifting
    ↓
"Gift Premium"
    - Search user
    - Gift 1 month Premium
    - Note: Cannot gift Premium+
    ↓
"Manage Admins"
    - Add/remove admin accounts
    - Set admin permissions
```

---

## 7. Notification Triggers

| Event | Recipient | Message |
|-------|-----------|---------|
| Free trial started | Client | "Welcome! Your 7-day free trial has started." |
| Free trial ending | Client | "Your free trial ends in 2 days. Subscribe to keep Premium." |
| Free trial ended | Client | "Your trial ended. Subscribe or continue with Free." |
| Client requests trainer | Trainer | "New client request from [Name]" |
| Trainer accepts | Client | "[Trainer] accepted your request!" |
| Trainer declines | Client | "[Trainer] is not available right now" |
| New message | Both | "[Name] sent you a message" |
| Workout assigned | Client | "Your trainer assigned a new workout" |
| Meal plan assigned | Client | "Your trainer assigned a new meal plan" |
| Client completes workout | Trainer | "[Client] completed their workout" |
| Payment received | Trainer | "Payment received from [Client]" |
| Funds available | Trainer | "Your earnings are ready to withdraw" |
| New review | Trainer | "[Client] left you a review" |
| Trainer verified | Trainer | "Congratulations! You're now verified" |
| Trainer rejected | Trainer | "Your application needs updates: [reason]" |
| Partner status granted | Trainer | "You're now a Partner Trainer! 0% commission." |
| Premium gifted | Client | "Your trainer gifted you 1 month Premium!" |
| Workout reminder | Client | "Time for your workout!" |
| Streak at risk | Client | "Don't break your streak!" |
| Health sync successful | Client | "Health data synced successfully" |
| Premium expiring | Client | "Your Premium expires in 3 days" |
