# FitApp - Development Milestones

## Overview

This document breaks down the project into concrete deliverables. No time estimates—focus on what needs to be built.

---

## Phase 1: Foundation

### Milestone 1.1: Project Setup
- [ ] Initialize React Native / Flutter project
- [ ] Setup backend project (NestJS / FastAPI)
- [ ] Configure PostgreSQL database
- [ ] Setup Redis for caching
- [ ] Configure development environment
- [ ] Setup CI/CD pipeline basics
- [ ] Create project documentation structure
- [ ] **Setup Vector Database (Pinecone/pgvector) for RAG**

### Milestone 1.2: Authentication System
- [ ] User registration (email + phone)
- [ ] Login with email/phone + password
- [ ] OTP verification for phone
- [ ] JWT token management
- [ ] Password reset flow
- [ ] Role-based access (client, trainer, admin, super admin)
- [ ] Secure token storage on mobile

### Milestone 1.3: Core Database
- [ ] Design and create all database tables
- [ ] Setup indexes for performance
- [ ] Seed ingredient database (100 items first)
- [ ] Seed exercise database (100 items first)
- [ ] Seed equipment database (50 items)
- [ ] **Seed Egyptian Products database (Supplements & Brands)**
- [ ] Create migration system

---

## Phase 2: Client Features

### Milestone 2.1: User Profile & Onboarding
- [ ] Client onboarding flow UI
- [ ] "Join as Client or Trainer" selection
- [ ] Profile creation and editing
- [ ] Body stats input (height, weight, etc.)
- [ ] Goal selection
- [ ] Equipment inventory management
- [ ] **Add-on program selection (Kegel, Yoga, Stretching, Mobility)**
- [ ] Dietary preferences and restrictions
- [ ] Settings (language, units, notifications)

### Milestone 2.2: Free Trial System
- [ ] 7-day free trial activation on signup
- [ ] Trial countdown display on home screen
- [ ] Day 5 reminder notification ("2 days left")
- [ ] Trial expiry handling
- [ ] Auto-convert to Free tier if no subscription
- [ ] One-time trial per account enforcement

### Milestone 2.3: Nutrition - Basic
- [ ] Ingredient search and browse
- [ ] Recipe search and browse
- [ ] View ingredient nutritional info
- [ ] View recipe details and instructions
- [ ] Basic meal logging
- [ ] Daily nutrition summary

### Milestone 2.4: Nutrition - AI Features
- [ ] "What can I make?" ingredient input
- [ ] AI meal generation integration
- [ ] Smart ingredient substitution
- [ ] **Local Brand/Product mapping (AI suggests local alternatives)**
- [ ] Portion calculation for targets
- [ ] Save favorite meals
- [ ] Meal history and patterns

### Milestone 2.5: Workout - Basic
- [ ] Exercise search and browse
- [ ] Filter by muscle group, equipment
- [ ] View exercise details
- [ ] Watch exercise videos
- [ ] Basic workout logging
- [ ] Workout history

### Milestone 2.6: Workout - Programs
- [ ] View workout templates/programs
- [ ] Filter by goal, equipment, days/week
- [ ] Follow a program
- [ ] Active workout screen with timer
- [ ] Log sets, reps, weight
- [ ] Personal records tracking

### Milestone 2.7: Workout - Calisthenics
- [ ] Calisthenics-specific exercises
- [ ] Skill progressions (muscle-up, handstand, planche, etc.)
- [ ] Bodyweight program templates
- [ ] Progress tracking for skills
- [ ] No-equipment workout generation

### Milestone 2.8: Add-On Programs
- [ ] **Kegel/pelvic floor exercise library**
- [ ] **Kegel daily routine generator**
- [ ] **Yoga session library**
- [ ] **Stretching routines (pre/post workout)**
- [ ] **Mobility work routines**
- [ ] **Integration with main workout schedule**
- [ ] **"Add-on only" quick workout option**

### Milestone 2.9: Progress Tracking
- [ ] Weight logging with graph
- [ ] Body measurements logging
- [ ] Progress photos (private)
- [ ] Before/after comparison
- [ ] Achievements and badges
- [ ] Streak tracking

### Milestone 2.10: Health Integration
- [ ] **Health connection popup UI**
- [ ] Apple Health connection
- [ ] Google Fit connection
- [ ] Samsung Health connection
- [ ] Import steps
- [ ] Import active calories
- [ ] Import sleep data
- [ ] Import resting heart rate
- [ ] **Visual health graphs (7/30/90 days)**
- [ ] **Steps trend graph**
- [ ] **Sleep pattern graph**
- [ ] **Heart rate trend graph**
- [ ] **Calorie burn trend graph**
- [ ] Display in dashboard
- [ ] Pull-to-refresh manual sync

---

## Phase 3: Trainer Features

### Milestone 3.1: Trainer Onboarding (Prefilled Forms)
- [ ] "Sign up as trainer" flow
- [ ] **Prefilled bio template (editable)**
- [ ] **Prefilled pricing suggestions**
- [ ] **"Clear form" option to start fresh**
- [ ] Guided profile creation form
- [ ] Certification upload
- [ ] Transformation photos upload
- [ ] Instagram handle input
- [ ] Specialization selection (multi-select)
- [ ] Pricing setup (weekly/monthly)
- [ ] Availability settings (accepting clients, max limit)
- [ ] Expected response time
- [ ] **Profile preview before submission**
- [ ] Submit for verification

### Milestone 3.2: Admin - Trainer Verification
- [ ] Admin panel setup
- [ ] Pending verifications queue
- [ ] Trainer application review UI
- [ ] Document viewer for certificates
- [ ] Instagram link verification
- [ ] Verification checklist UI
- [ ] Approve/reject flow
- [ ] Rejection reason templates
- [ ] Request more info option
- [ ] Verification notification to trainer
- [ ] **[Super Admin] Option to grant Partner status on approval**

### Milestone 3.3: Trainer Discovery
- [ ] Trainer listing page
- [ ] Filters (specialization, price, rating, gender)
- [ ] Sort by rating, price, availability
- [ ] Trainer profile view
- [ ] Review display
- [ ] Certification badges (verified)
- [ ] **Partner trainer badge**
- [ ] "Request trainer" button (Premium/Premium+ only)

### Milestone 3.4: Trainer-Client Matching
- [ ] Client sends request
- [ ] Trainer receives notification
- [ ] Trainer views client preview (stats, goals, equipment)
- [ ] **Trainer sees client health graphs preview (if shared)**
- [ ] Accept/decline flow
- [ ] Payment processing on accept
- [ ] Relationship activation
- [ ] Chat unlock

### Milestone 3.5: Trainer Dashboard
- [ ] Dashboard home with stats
- [ ] Active clients list
- [ ] Pending requests list
- [ ] Earnings summary widget
- [ ] **Commission tier display**
- [ ] Client detail view
- [ ] View client stats and history
- [ ] View client progress photos
- [ ] **View client health graphs (steps, sleep, HR, calories)**

### Milestone 3.6: Progress Timeline
- [ ] **Separate timeline view (not in chat)**
- [ ] **Day-tagged entries**
- [ ] **Photo upload with day tag**
- [ ] **Video upload with day tag**
- [ ] **Trainer can view/comment**
- [ ] **Client can view their own timeline**
- [ ] **Chronological organization**
- [ ] **Filter by media type**

### Milestone 3.7: Trainer Tools (Prefilled System)
- [ ] **AI recommendations based on client data**
- [ ] **Prefilled workout plans (editable)**
- [ ] **Prefilled meal plans (editable)**
- [ ] **"Clear all" option for fresh start**
- [ ] Assign workout to client
- [ ] Assign meal plan to client
- [ ] Template creation and saving
- [ ] Copy from app library
- [ ] **Dropdown/checkbox selection (minimal typing)**
- [ ] **AI "Vibe Check" for Arabic messages (Formal vs Casual)**
- [ ] Quick-assign workflow
- [ ] Bulk actions for similar clients

### Milestone 3.8: Chat System
- [ ] Real-time messaging (WebSocket)
- [ ] Text messages
- [ ] Photo sharing
- [ ] Video sharing
- [ ] Push notifications for messages
- [ ] Unread message counts
- [ ] Message history
- [ ] Read receipts

### Milestone 3.9: Reviews
- [ ] Client submits review after period ends
- [ ] 1-5 star rating
- [ ] Written review
- [ ] Review display on profile
- [ ] Trainer response to review
- [ ] Average rating calculation
- [ ] Report review option
- [ ] **Rating requirements for commission tiers**

---

## Phase 4: Payments & Premium

### Milestone 4.1: Free Tier
- [ ] Limited features (7-day history only)
- [ ] No trainer marketplace access
- [ ] No health graphs
- [ ] Ad display integration
- [ ] Upgrade prompts

### Milestone 4.2: Premium Subscription
- [ ] **Premium tier display (EGP 99/249/799)**
- [ ] Subscription plans UI
- [ ] Payment method selection
- [ ] Paymob integration
- [ ] Vodafone Cash support
- [ ] Fawry support
- [ ] InstaPay support
- [ ] Credit/Debit card support
- [ ] Subscription activation
- [ ] Premium features unlock
- [ ] Trainer marketplace access
- [ ] Health graphs unlock
- [ ] Ad-free experience
- [ ] Unlimited history
- [ ] Subscription management (cancel)
- [ ] Auto-renewal handling
- [ ] Expiry notifications

### Milestone 4.3: Premium+ Subscription
- [ ] **Premium+ tier display (EGP 199/499/1,599)**
- [ ] All Premium features
- [ ] **Lifetime data history**
- [ ] **Multiple trainer support (nutrition + workout)**
- [ ] **Priority trainer matching**
- [ ] **Exclusive workout programs**
- [ ] **Early access to new features**
- [ ] **Export all data feature**
- [ ] **Premium+ badge on profile**

### Milestone 4.4: Commission Structure
- [ ] **Tier 1: 0-20 clients = 25% commission**
- [ ] **Tier 2: 21-50 clients (4.0+ rating) = 20% commission**
- [ ] **Tier 3: 51-100 clients (4.3+ rating) = 18% commission**
- [ ] **Tier 4: 100+ clients (4.5+ rating) = 15% commission**
- [ ] **Automatic tier progression**
- [ ] **Tier display on trainer dashboard**
- [ ] **Commission calculation based on tier**

### Milestone 4.5: Partner Trainer Program
- [ ] **0% commission for partners**
- [ ] **Partner badge on profile**
- [ ] **Featured placement in discovery**
- [ ] **Premium gifting ability**
- [ ] **Partner earnings tracking (admin)**
- [ ] **Partner-specific dashboard features**

### Milestone 4.6: Premium Gifting
- [ ] **Super Admin: Gift Premium to any user**
- [ ] **Partner Trainer: Gift Premium to their clients only**
- [ ] **Gift duration: 1 month**
- [ ] **Premium+ cannot be gifted (enforced)**
- [ ] **Gift extends existing subscription**
- [ ] **Gift notification to recipient**
- [ ] **Gift tracking in admin panel**

### Milestone 4.7: Trainer Payments
- [ ] Payment on trainer accept
- [ ] Payment hold (7 days minimum)
- [ ] Commission calculation by tier
- [ ] Trainer earnings dashboard
- [ ] Available vs pending balance display
- [ ] Withdrawal request (min EGP 100)
- [ ] Payout methods (bank, Vodafone Cash, InstaPay)
- [ ] Payout processing (1-3 days)
- [ ] Transaction history
- [ ] Monthly earnings statement

### Milestone 4.8: Recurring Payments
- [ ] Weekly/monthly auto-renewal
- [ ] Payment retry on failure
- [ ] 3-day grace period
- [ ] Relationship pause on non-payment
- [ ] Renewal notifications

### Milestone 4.9: Refunds & Disputes
- [ ] Dispute submission form
- [ ] Reason selection
- [ ] Evidence upload
- [ ] Admin dispute queue
- [ ] Dispute review interface
- [ ] Chat history access for admin
- [ ] **Timeline access for admin**
- [ ] Full/partial refund processing
- [ ] Resolution notifications
- [ ] Refund impact on trainer

---

## Phase 5: Admin & Operations

### Milestone 5.1: Admin Panel - Core
- [ ] Admin authentication
- [ ] **Role hierarchy (Super Admin, Ops, Support, Finance, Content)**
- [ ] Role-based permissions
- [ ] Dashboard with key metrics
- [ ] User search and management
- [ ] Suspend/ban functionality
- [ ] Activity feed

### Milestone 5.2: Super Admin Powers
- [ ] **Only for: Abdellatif & Dodoelmahdy**
- [ ] **Grant Partner status UI**
- [ ] **Revoke Partner status UI**
- [ ] **Gift Premium UI (not Premium+)**
- [ ] **Override trainer verification**
- [ ] **Manage admin accounts**
- [ ] **Platform settings access**
- [ ] **Full analytics access**

### Milestone 5.3: Partner Management
- [ ] **Partner trainers list**
- [ ] **Partner statistics**
- [ ] **Premium gifts tracking per partner**
- [ ] **Partner earnings report (0% commission)**
- [ ] **Grant partner flow with reason**
- [ ] **Revoke partner flow with reason**

### Milestone 5.4: Admin Panel - Content
- [ ] Reported content queue
- [ ] Content moderation actions
- [ ] Review moderation
- [ ] Chat report handling
- [ ] **Timeline report handling**

### Milestone 5.5: Admin Panel - Analytics
- [ ] User growth charts
- [ ] **Breakdown: Free, Trial, Premium, Premium+**
- [ ] Revenue metrics
- [ ] **Revenue by source (subscriptions vs commissions)**
- [ ] **Commission revenue by tier**
- [ ] **Partner trainer earnings (no commission)**
- [ ] Trainer metrics
- [ ] **Trial conversion rate**
- [ ] **Premium to Premium+ upgrade rate**
- [ ] Engagement metrics
- [ ] Export reports

### Milestone 5.6: Admin Panel - Settings
- [ ] **Commission rate settings per tier**
- [ ] **Premium pricing configuration**
- [ ] **Premium+ pricing configuration**
- [ ] **Free trial duration setting**
- [ ] **Trainer payout settings**
- [ ] Feature toggles
- [ ] Announcement system
- [ ] **Comprehensive audit log**

---

## Phase 6: Notifications & Polish

### Milestone 6.1: Push Notifications
- [ ] Firebase Cloud Messaging setup
- [ ] **Free trial ending (Day 5)**
- [ ] **Free trial ended**
- [ ] **Premium expiring soon**
- [ ] Workout reminders
- [ ] Meal reminders
- [ ] Trainer/client messages
- [ ] Payment notifications
- [ ] **Funds available to withdraw**
- [ ] Achievement notifications
- [ ] **Premium gifted notification**
- [ ] **Partner status granted notification**
- [ ] Streak at risk notification
- [ ] Notification preferences

### Milestone 6.2: Offline Mode
- [ ] Local database sync
- [ ] Offline workout logging
- [ ] Offline meal logging
- [ ] Offline exercise/ingredient database
- [ ] Queue for sync when online
- [ ] Conflict resolution

### Milestone 6.3: Performance & Polish
- [ ] Image optimization
- [ ] Video caching
- [ ] API response caching
- [ ] App loading optimization
- [ ] Error handling improvements
- [ ] Accessibility improvements
- [ ] Dark mode support

---

## Phase 7: Content Population

### Milestone 7.1: Ingredient Database
- [ ] Expand to 500+ ingredients
- [ ] Egyptian ingredients focus
- [ ] Verify nutritional data
- [ ] Add Arabic names
- [ ] Add images
- [ ] **Scrape/Import Egyptian Supermarket Data**

### Milestone 7.2: Recipe Database
- [ ] Create 500+ recipes
- [ ] Egyptian cuisine focus
- [ ] Nutrition calculation
- [ ] Recipe photos
- [ ] Step-by-step instructions

### Milestone 7.3: Exercise Database
- [ ] Expand to 1000+ exercises
- [ ] Cover all muscle groups
- [ ] All difficulty levels
- [ ] Calisthenics skills
- [ ] **Kegel exercises**
- [ ] **Yoga poses and flows**
- [ ] **Stretching exercises**
- [ ] **Mobility drills**
- [ ] Form tips and cues

### Milestone 7.4: Exercise Videos
- [ ] Record/source 1000+ videos
- [ ] Multiple angles where needed
- [ ] Consistent quality
- [ ] Upload to CDN (Cloudflare R2)
- [ ] **Setup AI Video Generation Pipeline (SVD/Runway)**
- [ ] Thumbnail generation
- [ ] **Kegel exercise videos**
- [ ] **Yoga session videos**

### Milestone 7.5: Workout Templates
- [ ] Create 50+ programs
- [ ] Various goals (fat loss, muscle, strength)
- [ ] Various equipment levels
- [ ] Various training styles
- [ ] Calisthenics progressions
- [ ] **Kegel programs (daily routines)**
- [ ] **Yoga programs (beginner to advanced)**
- [ ] **Stretching routines**
- [ ] **Mobility programs**

---

## Phase 8: Launch Preparation

### Milestone 8.1: Testing
- [ ] Unit tests for critical paths
- [ ] Integration tests for API
- [ ] End-to-end tests for main flows
- [ ] **Payment flow testing**
- [ ] **Commission calculation testing**
- [ ] **Partner gifting testing**
- [ ] Performance testing
- [ ] Security audit
- [ ] Beta testing with real users

### Milestone 8.2: Launch
- [ ] App store submissions (iOS, Android)
- [ ] Landing page / website
- [ ] Marketing materials
- [ ] Support system setup
- [ ] Monitoring and alerting
- [ ] **Recruit initial Partner trainers**
- [ ] Launch!

---

## Post-Launch Roadmap

### Future Features (Prioritized)
1. Barcode scanner for packaged foods
2. Social features (challenges, leaderboards)
3. Wearable deep integration (Apple Watch, etc.)
4. AI form analysis from video
5. Voice input for logging
6. Trainer video calls
7. Group training sessions
8. Corporate wellness programs
9. Arabic voice assistant
10. Expansion to other MENA countries
11. Orange Money / Etisalat Cash / Meeza support
12. Fitbit / Garmin integration

---

## Feature Dependencies

### Must Complete Before Launch
1. Phase 1 (Foundation) - All milestones
2. Phase 2 (Client Features) - All milestones
3. Phase 3 (Trainer Features) - All milestones
4. Phase 4 (Payments) - All milestones
5. Phase 5 (Admin) - Milestones 5.1, 5.2, 5.3
6. Phase 6 - Milestone 6.1 (Notifications)
7. Phase 7 - Minimum content (200 ingredients, 200 recipes, 500 exercises)

### Can Launch Without (Add Later)
- Offline mode (Phase 6.2)
- Full content population
- Some Phase 8 polish items

### Critical Path
```
Authentication → Database → Client Onboarding → Free Trial →
Nutrition/Workout Basic → Health Integration → Premium Subscription →
Trainer Onboarding → Verification → Matching → Chat → Timeline →
Trainer Payments → Commission Tiers → Partner Program → Admin Panel →
Launch
```
