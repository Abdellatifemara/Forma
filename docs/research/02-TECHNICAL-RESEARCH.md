# Technical Research: Critical Systems

## Purpose
Before implementing payment, offline, and notifications, we MUST understand the exact technical requirements.

---

# 1. PAYMENT INTEGRATION (Paymob Egypt)

## 1.1 Research Questions
- [ ] What's the sandbox registration process?
- [ ] What are the API authentication methods?
- [ ] What's the exact payment flow (sequence diagram)?
- [ ] How do webhooks work for payment confirmation?
- [ ] What payment methods are supported?
- [ ] What's the settlement period?
- [ ] What fees does Paymob charge?

## 1.2 Paymob Documentation Links
```
Main Docs: https://docs.paymob.com/
Accept API: https://docs.paymob.com/docs/accept-standard-redirect
Card Integration: https://docs.paymob.com/docs/card-payments
Mobile Wallets: https://docs.paymob.com/docs/mobile-wallets
Webhooks: https://docs.paymob.com/docs/transaction-callbacks
```

## 1.3 Payment Flow to Implement

### Card Payment Flow
```
1. User selects subscription plan
2. Frontend calls: POST /api/payments/create-intent
3. Backend creates Paymob payment token
4. Backend returns iFrame URL
5. Frontend shows Paymob iFrame
6. User enters card details
7. Paymob processes payment
8. Paymob sends webhook to our server
9. Backend updates subscription status
10. Frontend shows success/failure
```

### Vodafone Cash Flow
```
1. User selects Vodafone Cash
2. Backend creates mobile wallet payment
3. User gets SMS with payment request
4. User approves on their phone
5. Paymob sends webhook
6. Backend updates subscription
```

## 1.4 Database Schema Needed
```prisma
model Payment {
  id                String   @id @default(cuid())
  userId            String
  paymobOrderId     String   @unique
  amount            Float
  currency          String   @default("EGP")
  status            PaymentStatus
  paymentMethod     String   // CARD, VODAFONE_CASH, FAWRY
  subscriptionPlanId String?
  createdAt         DateTime @default(now())
  paidAt            DateTime?
  user              User     @relation(...)
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

## 1.5 Required Environment Variables
```
PAYMOB_API_KEY=xxx
PAYMOB_INTEGRATION_ID_CARD=xxx
PAYMOB_INTEGRATION_ID_WALLET=xxx
PAYMOB_HMAC_SECRET=xxx
PAYMOB_IFRAME_ID=xxx
```

## 1.6 Testing Checklist
- [ ] Sandbox payment with test card
- [ ] Webhook handling
- [ ] Failed payment handling
- [ ] Subscription activation after payment
- [ ] Receipt generation

---

# 2. OFFLINE CAPABILITY

## 2.1 What Must Work Offline
| Feature | Offline Support | Storage Needed |
|---------|-----------------|----------------|
| Exercise library | Full | ~50MB |
| Food database | Full | ~5MB |
| Active workout plan | Full | ~1MB |
| Start workout | Yes | Local |
| Log sets/reps | Yes | Queue |
| View past workouts | Last 30 days | ~2MB |
| Search exercises | Yes | Already cached |
| Log meals | Yes | Queue |
| View today's meals | Yes | Cached |

## 2.2 Technology Stack

### IndexedDB for Data Storage
```javascript
// Database structure
{
  exercises: [...], // All 2800 exercises
  foods: [...],     // All 800 foods
  workoutPlans: [...], // User's plans
  workoutLogs: [...], // History
  pendingSync: [...] // Actions to sync
}
```

### Service Worker for Caching
```javascript
// Cache strategies
- Static assets: Cache first
- API responses: Network first, fallback to cache
- Images: Cache first with background refresh
```

## 2.3 Sync Strategy

### When Online
1. Check pendingSync queue
2. Send pending workout logs
3. Send pending meal logs
4. Fetch latest data updates
5. Clear synced items from queue

### When Offline
1. Store actions in pendingSync
2. Show "Offline" indicator
3. Disable features that require live data (trainer chat)

## 2.4 Storage Estimation
```
Exercises (2800): ~30MB (with images)
Foods (800): ~2MB
User data: ~1MB
Total minimum: ~35MB
```

## 2.5 Implementation Steps
1. [ ] Create IndexedDB wrapper (idb library)
2. [ ] Seed exercises on first load
3. [ ] Seed foods on first load
4. [ ] Implement sync queue
5. [ ] Create service worker
6. [ ] Add offline detection hook
7. [ ] Show offline UI indicators

---

# 3. PUSH NOTIFICATIONS (FCM)

## 3.1 Notification Types
| Type | Trigger | Content |
|------|---------|---------|
| Workout reminder | Daily at user's preferred time | "Time to train! Your Push Day is waiting." |
| Streak warning | No workout in 2 days | "Don't break your streak! Quick 20-min workout?" |
| Chat message | New message from trainer | "Coach Ahmed sent you a message" |
| Payment confirmation | After successful payment | "Welcome to Premium! Start exploring." |
| Trainer accepted | Trainer accepts request | "Great news! Coach X accepted your request." |

## 3.2 FCM Setup Steps
1. [ ] Create Firebase project
2. [ ] Get FCM server key
3. [ ] Integrate FCM in backend
4. [ ] Add Firebase SDK to frontend
5. [ ] Request notification permission
6. [ ] Store FCM tokens in database
7. [ ] Send test notification

## 3.3 Required Environment Variables
```
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
```

## 3.4 Token Storage Schema
```prisma
model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   // WEB, IOS, ANDROID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
}
```

## 3.5 Backend Notification Service
```typescript
class NotificationService {
  async sendToUser(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  });

  async sendWorkoutReminder(userId: string);
  async sendStreakWarning(userId: string);
  async sendChatNotification(userId: string, senderName: string);
}
```

---

# 4. EMAIL SYSTEM

## 4.1 Email Types Needed
| Email | Trigger | Template |
|-------|---------|----------|
| Welcome | After registration | Welcome to FORMA |
| Verify email | Registration + resend | Verify your email |
| Password reset | Forgot password | Reset your password |
| Subscription confirmed | After payment | You're now Premium |
| Trainer approved | Admin approves | Your trainer profile is live |
| Trial ending | 2 days before trial ends | Your trial ends soon |

## 4.2 Email Provider Options
- **SendGrid** - Popular, good free tier
- **AWS SES** - Cheap at scale
- **Resend** - Modern, developer-friendly

## 4.3 Required Environment Variables
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=xxx
EMAIL_FROM=hello@forma.fitness
```

## 4.4 Email Templates
Each email needs:
- HTML version (styled)
- Text version (fallback)
- Arabic version
- English version

---

# 5. ERROR MONITORING (Sentry)

## 5.1 What to Track
- JavaScript errors (frontend)
- API errors (backend)
- Slow API responses (>2s)
- Failed payments
- Auth failures

## 5.2 Setup Steps
1. [ ] Create Sentry project
2. [ ] Install @sentry/nextjs
3. [ ] Install @sentry/node for API
4. [ ] Configure source maps
5. [ ] Set up error alerts

## 5.3 Environment Variables
```
SENTRY_DSN=xxx
SENTRY_AUTH_TOKEN=xxx
```

---

# 6. ANALYTICS

## 6.1 Events to Track
| Event | Properties |
|-------|------------|
| signup_completed | signup_method, referral_code |
| onboarding_completed | goal, equipment_count |
| workout_started | workout_id, plan_id |
| workout_completed | duration, exercises_count |
| meal_logged | meal_type, foods_count |
| subscription_started | plan_id, payment_method |
| trainer_requested | trainer_id |

## 6.2 Analytics Provider
- **Mixpanel** - Good for product analytics
- **Amplitude** - Similar, good free tier
- **PostHog** - Open source option

---

# ACTION ITEMS

## Immediate Research
1. [ ] Create Paymob sandbox account
2. [ ] Test Paymob payment flow with test cards
3. [ ] Document exact API sequence
4. [ ] Create Firebase project for FCM
5. [ ] Test FCM web push

## Code Research
1. [ ] Look at idb-keyval for IndexedDB
2. [ ] Look at workbox for Service Worker
3. [ ] Look at @sendgrid/mail for emails
4. [ ] Look at firebase-admin for FCM

---

# RESEARCH NOTES

## Paymob Notes
```
[Add notes after researching Paymob documentation]
```

## FCM Notes
```
[Add notes after testing FCM]
```

## Offline Notes
```
[Add notes after testing offline strategies]
```
