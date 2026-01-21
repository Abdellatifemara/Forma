# FitApp - Technical Requirements

## 1. Technology Stack (Recommended)

### 1.1 Mobile App

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React Native or Flutter | Cross-platform, single codebase |
| **State Management** | Redux/Zustand (RN) or Riverpod (Flutter) | Scalable state |
| **Local Database** | SQLite / WatermelonDB | Offline-first |
| **UI Components** | Native Base / Tamagui (RN) or Material (Flutter) | Consistent design |
| **Video Player** | react-native-video / video_player | Exercise videos |
| **Chat** | Stream Chat SDK or custom WebSocket | Real-time messaging |
| **Push Notifications** | Firebase Cloud Messaging | Cross-platform |
| **Health Integration** | react-native-health / health package | Apple Health, Google Fit |

### 1.2 Backend

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | Node.js (NestJS) or Python (FastAPI) | Fast development, scalable |
| **API** | REST + WebSocket | Standard + real-time |
| **Database** | PostgreSQL | Relational, robust |
| **Cache** | Redis | Session, caching, pub/sub |
| **Queue** | Bull (Node) or Celery (Python) | Background jobs |
| **Search** | PostgreSQL Full-Text or Elasticsearch | Food/exercise search |

### 1.3 Infrastructure

| Component | Service | Why |
|-----------|---------|-----|
| **Hosting** | AWS / DigitalOcean / Railway | Scalable, reliable |
| **Video Storage** | Cloudflare R2 | Zero egress fees |
| **CDN** | Cloudflare | Fast global delivery |
| **Video Streaming** | Cloudflare Stream or Mux | Optimized video delivery |
| **Database Hosting** | AWS RDS / Supabase / PlanetScale | Managed PostgreSQL |
| **File Storage** | Cloudflare R2 / AWS S3 | Images, documents |
| **Payment Gateway** | Paymob | Egyptian payment methods |
| **Email** | SendGrid / AWS SES | Transactional emails |
| **SMS** | Twilio / Vonage | OTP verification |

### 1.4 AI/ML

| Purpose | Technology | Why |
|---------|------------|-----|
| **Meal Recommendations** | OpenAI API / Local LLM | Intelligent suggestions |
| **Workout Generation** | Rule-based + ML | Equipment-based adaptation |
| **Search** | Vector embeddings (future) | Semantic food search |

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ iOS App  │  │Android   │  │Admin Web │              │
│  │          │  │App       │  │Panel     │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer                          │
│                   (Cloudflare)                           │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ API       │  │ API       │  │ WebSocket │
│ Server 1  │  │ Server 2  │  │ Server    │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │  Queue   │
│ Database │  │  Cache   │  │ (Bull)   │
└──────────┘  └──────────┘  └──────────┘
                                  │
                                  ▼
                           ┌──────────┐
                           │ Workers  │
                           │(AI, Jobs)│
                           └──────────┘
```

### 2.2 Data Flow

```
Mobile App
    │
    ├── API Requests ─────────────► API Server
    │                                   │
    │                                   ├── Auth ──► JWT Validation
    │                                   │
    │                                   ├── Read ──► PostgreSQL
    │                                   │
    │                                   ├── Write ─► PostgreSQL + Cache Invalidation
    │                                   │
    │                                   └── AI ────► Queue ──► Worker ──► OpenAI
    │
    ├── WebSocket ────────────────► WebSocket Server
    │   (Chat, real-time)               │
    │                                   └── Redis Pub/Sub
    │
    ├── Video Streaming ──────────► Cloudflare R2/Stream
    │
    └── Local SQLite ─────────────► Offline data (synced)
```

---

## 3. API Design

### 3.1 Authentication Endpoints

```
POST   /auth/register          # Register new user
POST   /auth/login             # Login with email/phone
POST   /auth/verify-otp        # Verify phone OTP
POST   /auth/refresh           # Refresh access token
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
POST   /auth/logout            # Logout (invalidate token)
```

### 3.2 User Endpoints

```
GET    /users/me               # Get current user
PATCH  /users/me               # Update profile
POST   /users/me/photo         # Upload profile photo
GET    /users/me/equipment     # Get user's equipment
POST   /users/me/equipment     # Add equipment
DELETE /users/me/equipment/:id # Remove equipment
```

### 3.3 Nutrition Endpoints

```
GET    /ingredients            # List/search ingredients
GET    /ingredients/:id        # Get ingredient details
GET    /recipes                # List/search recipes
GET    /recipes/:id            # Get recipe details
POST   /meals                  # Log a meal
GET    /meals                  # Get user's meal history
POST   /meals/generate         # AI meal generation
```

### 3.4 Workout Endpoints

```
GET    /exercises              # List/search exercises
GET    /exercises/:id          # Get exercise details
GET    /equipment              # List all equipment
GET    /templates              # Get workout templates
POST   /workouts               # Log a workout
GET    /workouts               # Get workout history
POST   /workouts/generate      # Generate workout based on equipment
```

### 3.5 Trainer Endpoints

```
# Public
GET    /trainers               # List/search trainers
GET    /trainers/:id           # Get trainer profile

# Trainer only
POST   /trainers/apply         # Apply as trainer
GET    /trainers/me            # Get own trainer profile
PATCH  /trainers/me            # Update profile
GET    /trainers/me/clients    # Get all clients
GET    /trainers/me/clients/:id # Get client details
GET    /trainers/me/earnings   # Get earnings
POST   /trainers/me/withdraw   # Request withdrawal
GET    /trainers/me/requests   # Get pending requests
POST   /trainers/requests/:id/accept  # Accept client
POST   /trainers/requests/:id/decline # Decline client

# Client only
POST   /trainers/:id/request   # Request trainer
GET    /trainers/my-trainer    # Get current trainer
```

### 3.6 Chat Endpoints

```
GET    /conversations          # List conversations
GET    /conversations/:id      # Get conversation messages
POST   /conversations/:id/messages # Send message
POST   /conversations/:id/read # Mark as read
```

### 3.7 Payment Endpoints

```
GET    /subscriptions/plans    # Get subscription plans
POST   /subscriptions          # Start subscription
GET    /subscriptions/current  # Get current subscription
POST   /subscriptions/cancel   # Cancel subscription

POST   /payments/trainer       # Pay for trainer
GET    /payments/history       # Payment history
```

### 3.8 Admin Endpoints

```
GET    /admin/trainers/pending # Pending verifications
POST   /admin/trainers/:id/approve # Approve trainer
POST   /admin/trainers/:id/reject  # Reject trainer

GET    /admin/disputes         # List disputes
GET    /admin/disputes/:id     # Get dispute details
POST   /admin/disputes/:id/resolve # Resolve dispute

GET    /admin/users            # List users
POST   /admin/users/:id/suspend # Suspend user
POST   /admin/users/:id/ban    # Ban user

GET    /admin/analytics        # Get analytics
```

---

## 4. Database Indexes

### 4.1 Critical Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Trainers
CREATE INDEX idx_trainers_verification ON trainer_profiles(verification_status);
CREATE INDEX idx_trainers_accepting ON trainer_profiles(is_accepting);
CREATE INDEX idx_trainers_rating ON trainer_profiles(rating_avg DESC);
CREATE INDEX idx_trainers_specializations ON trainer_profiles USING GIN(specializations);

-- Ingredients
CREATE INDEX idx_ingredients_name_en ON ingredients(name_en);
CREATE INDEX idx_ingredients_name_ar ON ingredients(name_ar);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_search ON ingredients USING GIN(
    to_tsvector('english', name_en) || to_tsvector('arabic', name_ar)
);

-- Exercises
CREATE INDEX idx_exercises_muscle ON exercises(primary_muscle);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_search ON exercises USING GIN(
    to_tsvector('english', name_en)
);

-- User activity
CREATE INDEX idx_user_workouts_user ON user_workouts(user_id);
CREATE INDEX idx_user_workouts_date ON user_workouts(completed_at);
CREATE INDEX idx_user_meals_user ON user_meals(user_id);
CREATE INDEX idx_user_meals_date ON user_meals(logged_at);

-- Chat
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);

-- Relationships
CREATE INDEX idx_relationships_trainer ON trainer_client_relationships(trainer_id);
CREATE INDEX idx_relationships_client ON trainer_client_relationships(client_id);
```

---

## 5. Caching Strategy

### 5.1 Cache Layers

| Data | Cache Duration | Invalidation |
|------|----------------|--------------|
| Ingredient list | 24 hours | On update |
| Exercise list | 24 hours | On update |
| Trainer profiles | 1 hour | On profile update |
| User session | Until logout | On logout |
| Meal suggestions | 5 minutes | - |

### 5.2 Redis Keys

```
user:{id}:session         # User session data
user:{id}:equipment       # User's equipment list
trainer:{id}:profile      # Cached trainer profile
trainer:{id}:clients      # Trainer's client IDs
ingredients:all           # Full ingredient list
exercises:all             # Full exercise list
chat:{conv_id}:recent     # Recent messages
```

---

## 6. Real-Time Features

### 6.1 WebSocket Events

```javascript
// Client → Server
{ event: 'join_conversation', data: { conversationId } }
{ event: 'send_message', data: { conversationId, content, type } }
{ event: 'typing', data: { conversationId } }
{ event: 'mark_read', data: { conversationId } }

// Server → Client
{ event: 'new_message', data: { message } }
{ event: 'user_typing', data: { conversationId, userId } }
{ event: 'message_read', data: { conversationId, messageId } }
{ event: 'notification', data: { type, title, body } }
```

### 6.2 Scaling WebSockets

- Use Redis Pub/Sub for multi-server sync
- Sticky sessions for connection persistence
- Heartbeat for connection health
- Reconnection with exponential backoff

---

## 7. Offline Sync

### 7.1 Sync Strategy

```
App Start
    │
    ├── Check local data version
    │
    ├── If stale or first launch:
    │   └── Download: ingredients, exercises, equipment
    │
    ├── Sync user data:
    │   ├── Upload queued workouts
    │   ├── Upload queued meals
    │   └── Download latest from server
    │
    └── Continue with fresh data
```

### 7.2 Conflict Resolution

- **Last-write-wins** for user data
- **Server-authoritative** for payments, relationships
- **Merge** for workout logs (append-only)

---

## 8. Security Requirements

### 8.1 Authentication

- JWT with short expiry (15 min)
- Refresh tokens (30 days)
- Secure token storage (Keychain/Keystore)
- OTP for phone verification

### 8.2 Authorization

- Role-based access control (RBAC)
- Trainers can only access their clients
- Clients can only access their data
- Admins have scoped permissions

### 8.3 Data Protection

- HTTPS everywhere
- Encrypt sensitive data at rest
- Secure file uploads (signed URLs)
- PCI compliance for payments

### 8.4 Rate Limiting

```
Authentication:     5 attempts per minute
API (general):      100 requests per minute
AI generation:      10 requests per minute
File uploads:       10 per hour
```

---

## 9. Monitoring & Logging

### 9.1 Application Monitoring

- Error tracking: Sentry
- Performance: New Relic / DataDog
- Uptime: Better Uptime / Pingdom

### 9.2 Logging

```
Logs to capture:
- API requests (method, path, duration, status)
- Authentication events
- Payment events
- Admin actions
- Errors with stack traces
```

### 9.3 Alerts

- Error rate > 1%
- Response time > 500ms
- Failed payments
- Server down
- Database connection issues

---

## 10. Deployment

### 10.1 Environments

| Environment | Purpose |
|-------------|---------|
| Development | Local development |
| Staging | Testing before production |
| Production | Live users |

### 10.2 CI/CD Pipeline

```
Push to main
    │
    ├── Run tests
    ├── Build app
    ├── Security scan
    │
    └── Deploy to staging
        │
        └── Manual approval → Deploy to production
```

### 10.3 Database Migrations

- Use migration tools (Prisma, Knex, Alembic)
- Never delete columns immediately (deprecate first)
- Backward-compatible changes only
- Test migrations on staging first
