# FitApp - Database Schema

## Overview

The database is designed for:
- **Offline-first**: Core data (ingredients, exercises) cached locally
- **Relational integrity**: Proper foreign keys and relationships
- **Scalability**: Ready for growth from 1K to 100K+ users
- **Privacy**: Trainer can only access their own clients' data

---

## Core Tables

### users
Primary user table for both clients and trainers.

```sql
users
├── id                  UUID PRIMARY KEY
├── email               VARCHAR(255) UNIQUE
├── phone               VARCHAR(20) UNIQUE
├── password_hash       VARCHAR(255)
├── role                ENUM('client', 'trainer', 'admin')
├── is_premium          BOOLEAN DEFAULT FALSE
├── premium_expires_at  TIMESTAMP
├── created_at          TIMESTAMP
├── updated_at          TIMESTAMP
└── deleted_at          TIMESTAMP (soft delete)
```

### client_profiles
Extended profile for clients.

```sql
client_profiles
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── name                VARCHAR(100)
├── photo_url           VARCHAR(500)
├── birth_date          DATE
├── gender              ENUM('male', 'female', 'other')
├── height_cm           INTEGER
├── weight_kg           DECIMAL(5,2)
├── goal_weight_kg      DECIMAL(5,2)
├── goal                ENUM('lose_weight', 'build_muscle', 'get_stronger', 'endurance', 'maintain')
├── activity_level      ENUM('sedentary', 'light', 'moderate', 'very_active')
├── training_location   ENUM('home_none', 'home_equipped', 'gym')
├── dietary_restrictions TEXT (JSON array)
├── language            ENUM('en', 'ar') DEFAULT 'ar'
├── units               ENUM('metric', 'imperial') DEFAULT 'metric'
└── current_trainer_id  UUID FK → trainer_profiles.id (nullable)
```

### trainer_profiles
Extended profile for trainers.

```sql
trainer_profiles
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── name                VARCHAR(100)
├── photo_url           VARCHAR(500)
├── bio                 TEXT
├── instagram_handle    VARCHAR(50)
├── years_experience    INTEGER
├── specializations     TEXT (JSON array)
├── price_weekly        DECIMAL(10,2)
├── price_monthly       DECIMAL(10,2)
├── currency            VARCHAR(3) DEFAULT 'EGP'
├── is_accepting        BOOLEAN DEFAULT TRUE
├── max_clients         INTEGER DEFAULT 20
├── response_time       VARCHAR(100) -- "Usually within 24 hours"
├── verification_status ENUM('pending', 'approved', 'rejected')
├── verified_at         TIMESTAMP
├── verified_by         UUID FK → users.id (admin)
├── rejection_reason    TEXT
├── rating_avg          DECIMAL(2,1)
├── rating_count        INTEGER DEFAULT 0
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### trainer_certifications
Uploaded certifications for verification.

```sql
trainer_certifications
├── id                  UUID PRIMARY KEY
├── trainer_id          UUID FK → trainer_profiles.id
├── name                VARCHAR(200)
├── issuing_org         VARCHAR(200)
├── year_obtained       INTEGER
├── document_url        VARCHAR(500)
├── is_verified         BOOLEAN DEFAULT FALSE
└── created_at          TIMESTAMP
```

### trainer_transformations
Before/after photos from past clients.

```sql
trainer_transformations
├── id                  UUID PRIMARY KEY
├── trainer_id          UUID FK → trainer_profiles.id
├── before_photo_url    VARCHAR(500)
├── after_photo_url     VARCHAR(500)
├── description         TEXT
├── duration_weeks      INTEGER
└── created_at          TIMESTAMP
```

---

## Trainer-Client Relationship

### trainer_client_requests
Request queue before acceptance.

```sql
trainer_client_requests
├── id                  UUID PRIMARY KEY
├── client_id           UUID FK → client_profiles.id
├── trainer_id          UUID FK → trainer_profiles.id
├── status              ENUM('pending', 'accepted', 'declined')
├── decline_reason      TEXT
├── requested_at        TIMESTAMP
├── responded_at        TIMESTAMP
└── expires_at          TIMESTAMP
```

### trainer_client_relationships
Active trainer-client pairings.

```sql
trainer_client_relationships
├── id                  UUID PRIMARY KEY
├── client_id           UUID FK → client_profiles.id
├── trainer_id          UUID FK → trainer_profiles.id
├── started_at          TIMESTAMP
├── ended_at            TIMESTAMP (nullable)
├── status              ENUM('active', 'paused', 'ended')
├── end_reason          TEXT
└── created_at          TIMESTAMP
```

### trainer_reviews
Client reviews of trainers.

```sql
trainer_reviews
├── id                  UUID PRIMARY KEY
├── relationship_id     UUID FK → trainer_client_relationships.id
├── client_id           UUID FK → client_profiles.id
├── trainer_id          UUID FK → trainer_profiles.id
├── rating              INTEGER (1-5)
├── review_text         TEXT
├── trainer_response    TEXT
├── is_visible          BOOLEAN DEFAULT TRUE
├── reported            BOOLEAN DEFAULT FALSE
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

---

## Nutrition Tables

### ingredients
Master ingredient database.

```sql
ingredients
├── id                  UUID PRIMARY KEY
├── name_en             VARCHAR(100)
├── name_ar             VARCHAR(100)
├── category            ENUM('protein', 'carbs', 'vegetable', 'fruit', 'dairy', 'legume', 'fat', 'spice', 'other')
├── calories_per_100g   INTEGER
├── protein_g           DECIMAL(5,2)
├── carbs_g             DECIMAL(5,2)
├── fat_g               DECIMAL(5,2)
├── fiber_g             DECIMAL(5,2)
├── sodium_mg           DECIMAL(7,2)
├── sugar_g             DECIMAL(5,2)
├── is_egyptian         BOOLEAN DEFAULT TRUE
├── season              TEXT (JSON array or null)
├── image_url           VARCHAR(500)
└── created_at          TIMESTAMP
```

### recipes
Recipe database.

```sql
recipes
├── id                  UUID PRIMARY KEY
├── name_en             VARCHAR(200)
├── name_ar             VARCHAR(200)
├── description         TEXT
├── cuisine_type        ENUM('egyptian', 'levantine', 'gulf', 'moroccan', 'international', 'other')
├── meal_type           ENUM('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
├── prep_time_min       INTEGER
├── cook_time_min       INTEGER
├── servings            INTEGER
├── difficulty          ENUM('easy', 'medium', 'hard')
├── instructions        TEXT
├── calories_per_serving INTEGER
├── protein_per_serving  DECIMAL(5,2)
├── carbs_per_serving    DECIMAL(5,2)
├── fat_per_serving      DECIMAL(5,2)
├── image_url           VARCHAR(500)
├── is_verified         BOOLEAN DEFAULT TRUE
└── created_at          TIMESTAMP
```

### recipe_ingredients
Junction table for recipe ingredients.

```sql
recipe_ingredients
├── id                  UUID PRIMARY KEY
├── recipe_id           UUID FK → recipes.id
├── ingredient_id       UUID FK → ingredients.id
├── quantity            DECIMAL(7,2)
├── unit                VARCHAR(20) -- 'g', 'ml', 'cup', 'tbsp', 'piece'
└── notes               VARCHAR(100) -- 'diced', 'minced', etc.
```

### ingredient_substitutions
Smart substitution mapping.

```sql
ingredient_substitutions
├── id                  UUID PRIMARY KEY
├── ingredient_id       UUID FK → ingredients.id
├── substitute_id       UUID FK → ingredients.id
├── similarity_score    DECIMAL(3,2) -- 0.00 to 1.00
├── context             VARCHAR(100) -- 'baking', 'cooking', 'any'
└── notes               TEXT
```

---

## Workout Tables

### exercises
Master exercise database.

```sql
exercises
├── id                  UUID PRIMARY KEY
├── name_en             VARCHAR(100)
├── name_ar             VARCHAR(100)
├── description         TEXT
├── primary_muscle      ENUM('chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body')
├── secondary_muscles   TEXT (JSON array)
├── movement_pattern    ENUM('push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'anti_rotation', 'isolation')
├── exercise_type       ENUM('compound', 'isolation', 'cardio', 'plyometric', 'static', 'skill')
├── difficulty          ENUM('beginner', 'intermediate', 'advanced', 'expert')
├── training_style      TEXT (JSON array) -- ['calisthenics', 'bodybuilding', 'powerlifting']
├── video_url           VARCHAR(500)
├── thumbnail_url       VARCHAR(500)
├── instructions        TEXT
├── tips                TEXT
├── common_mistakes     TEXT
└── created_at          TIMESTAMP
```

### equipment
Equipment database.

```sql
equipment
├── id                  UUID PRIMARY KEY
├── name_en             VARCHAR(100)
├── name_ar             VARCHAR(100)
├── category            ENUM('bodyweight', 'free_weights', 'machines', 'cables', 'cardio', 'bands', 'accessories', 'other')
├── subcategory         VARCHAR(50) -- 'dumbbells', 'barbells', etc.
├── description         TEXT
├── is_portable         BOOLEAN
├── price_range         ENUM('free', 'budget', 'moderate', 'expensive')
├── image_url           VARCHAR(500)
└── created_at          TIMESTAMP
```

### exercise_equipment
Junction table for exercise-equipment requirements.

```sql
exercise_equipment
├── id                  UUID PRIMARY KEY
├── exercise_id         UUID FK → exercises.id
├── equipment_id        UUID FK → equipment.id
├── is_required         BOOLEAN DEFAULT TRUE -- false = optional
└── alternatives        TEXT (JSON array of equipment_ids)
```

### user_equipment
Equipment owned by user.

```sql
user_equipment
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── equipment_id        UUID FK → equipment.id
├── acquired_date       DATE
├── notes               TEXT
└── created_at          TIMESTAMP
```

---

## Workout Programs & Templates

### workout_templates
Pre-built or trainer-created templates.

```sql
workout_templates
├── id                  UUID PRIMARY KEY
├── creator_id          UUID FK → users.id (null for system templates)
├── name                VARCHAR(200)
├── description         TEXT
├── training_style      VARCHAR(50)
├── goal                ENUM('lose_weight', 'build_muscle', 'strength', 'endurance', 'general')
├── difficulty          ENUM('beginner', 'intermediate', 'advanced')
├── days_per_week       INTEGER
├── duration_weeks      INTEGER
├── is_public           BOOLEAN DEFAULT FALSE
├── is_system           BOOLEAN DEFAULT FALSE -- app's built-in templates
└── created_at          TIMESTAMP
```

### workout_template_days
Days within a template.

```sql
workout_template_days
├── id                  UUID PRIMARY KEY
├── template_id         UUID FK → workout_templates.id
├── day_number          INTEGER
├── name                VARCHAR(100) -- "Push Day", "Upper Body", etc.
├── focus               TEXT (JSON array of muscles)
└── rest_day            BOOLEAN DEFAULT FALSE
```

### workout_template_exercises
Exercises within a template day.

```sql
workout_template_exercises
├── id                  UUID PRIMARY KEY
├── template_day_id     UUID FK → workout_template_days.id
├── exercise_id         UUID FK → exercises.id
├── order_index         INTEGER
├── sets                INTEGER
├── reps                VARCHAR(20) -- "8-12", "AMRAP", "30 sec"
├── rest_seconds        INTEGER
├── notes               TEXT
└── superset_group      INTEGER -- null or group number
```

---

## User Activity Logs

### user_workouts
Logged workout sessions.

```sql
user_workouts
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── template_id         UUID FK → workout_templates.id (nullable)
├── assigned_by         UUID FK → trainer_profiles.id (nullable)
├── started_at          TIMESTAMP
├── completed_at        TIMESTAMP
├── duration_minutes    INTEGER
├── notes               TEXT
└── created_at          TIMESTAMP
```

### user_workout_sets
Individual sets within a workout.

```sql
user_workout_sets
├── id                  UUID PRIMARY KEY
├── workout_id          UUID FK → user_workouts.id
├── exercise_id         UUID FK → exercises.id
├── set_number          INTEGER
├── reps                INTEGER
├── weight_kg           DECIMAL(5,2)
├── duration_seconds    INTEGER (for timed exercises)
├── notes               TEXT
└── created_at          TIMESTAMP
```

### user_meals
Logged meals.

```sql
user_meals
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── meal_type           ENUM('breakfast', 'lunch', 'dinner', 'snack')
├── recipe_id           UUID FK → recipes.id (nullable)
├── assigned_by         UUID FK → trainer_profiles.id (nullable)
├── logged_at           TIMESTAMP
├── total_calories      INTEGER
├── total_protein       DECIMAL(5,2)
├── total_carbs         DECIMAL(5,2)
├── total_fat           DECIMAL(5,2)
├── notes               TEXT
└── created_at          TIMESTAMP
```

### user_meal_items
Individual items in a meal.

```sql
user_meal_items
├── id                  UUID PRIMARY KEY
├── meal_id             UUID FK → user_meals.id
├── ingredient_id       UUID FK → ingredients.id (nullable)
├── recipe_id           UUID FK → recipes.id (nullable)
├── name_custom         VARCHAR(200) (if not from database)
├── quantity            DECIMAL(7,2)
├── unit                VARCHAR(20)
├── calories            INTEGER
├── protein             DECIMAL(5,2)
├── carbs               DECIMAL(5,2)
├── fat                 DECIMAL(5,2)
└── created_at          TIMESTAMP
```

---

## Progress & Health

### user_measurements
Body measurements over time.

```sql
user_measurements
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── measured_at         DATE
├── weight_kg           DECIMAL(5,2)
├── body_fat_pct        DECIMAL(4,1)
├── chest_cm            DECIMAL(5,1)
├── waist_cm            DECIMAL(5,1)
├── hips_cm             DECIMAL(5,1)
├── arm_left_cm         DECIMAL(5,1)
├── arm_right_cm        DECIMAL(5,1)
├── thigh_left_cm       DECIMAL(5,1)
├── thigh_right_cm      DECIMAL(5,1)
├── notes               TEXT
└── created_at          TIMESTAMP
```

### user_progress_photos
Progress photos.

```sql
user_progress_photos
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── photo_url           VARCHAR(500)
├── photo_type          ENUM('front', 'side', 'back', 'other')
├── taken_at            DATE
├── is_shared           BOOLEAN DEFAULT FALSE -- shared with trainer
└── created_at          TIMESTAMP
```

### user_health_data
Synced health data from Apple Health / Google Fit.

```sql
user_health_data
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── date                DATE
├── steps               INTEGER
├── active_calories     INTEGER
├── resting_heart_rate  INTEGER
├── sleep_hours         DECIMAL(3,1)
├── source              VARCHAR(50) -- 'apple_health', 'google_fit'
└── synced_at           TIMESTAMP
```

---

## Communication

### chat_conversations
Chat threads between trainer and client.

```sql
chat_conversations
├── id                  UUID PRIMARY KEY
├── relationship_id     UUID FK → trainer_client_relationships.id
├── trainer_id          UUID FK → trainer_profiles.id
├── client_id           UUID FK → client_profiles.id
├── last_message_at     TIMESTAMP
├── trainer_unread      INTEGER DEFAULT 0
├── client_unread       INTEGER DEFAULT 0
└── created_at          TIMESTAMP
```

### chat_messages
Individual messages.

```sql
chat_messages
├── id                  UUID PRIMARY KEY
├── conversation_id     UUID FK → chat_conversations.id
├── sender_id           UUID FK → users.id
├── message_type        ENUM('text', 'image', 'video', 'workout', 'meal')
├── content             TEXT
├── media_url           VARCHAR(500)
├── reference_id        UUID -- workout or meal plan ID if applicable
├── is_read             BOOLEAN DEFAULT FALSE
├── created_at          TIMESTAMP
└── deleted_at          TIMESTAMP
```

---

## Payments

### payments
All payment transactions.

```sql
payments
├── id                  UUID PRIMARY KEY
├── relationship_id     UUID FK → trainer_client_relationships.id
├── client_id           UUID FK → users.id
├── trainer_id          UUID FK → trainer_profiles.id
├── amount              DECIMAL(10,2)
├── currency            VARCHAR(3)
├── commission_pct      DECIMAL(4,2)
├── commission_amount   DECIMAL(10,2)
├── trainer_amount      DECIMAL(10,2)
├── payment_method      VARCHAR(50)
├── payment_reference   VARCHAR(200)
├── status              ENUM('pending', 'completed', 'failed', 'refunded')
├── period_start        DATE
├── period_end          DATE
├── hold_until          DATE -- 1 week minimum hold
├── created_at          TIMESTAMP
└── completed_at        TIMESTAMP
```

### trainer_payouts
Trainer withdrawal requests.

```sql
trainer_payouts
├── id                  UUID PRIMARY KEY
├── trainer_id          UUID FK → trainer_profiles.id
├── amount              DECIMAL(10,2)
├── currency            VARCHAR(3)
├── payout_method       VARCHAR(50)
├── payout_details      TEXT (JSON - bank details, wallet number)
├── status              ENUM('pending', 'processing', 'completed', 'failed')
├── requested_at        TIMESTAMP
├── completed_at        TIMESTAMP
└── notes               TEXT
```

### subscriptions
Premium subscriptions for clients.

```sql
subscriptions
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── plan                ENUM('monthly', 'quarterly', 'yearly')
├── amount              DECIMAL(10,2)
├── currency            VARCHAR(3)
├── status              ENUM('active', 'cancelled', 'expired')
├── started_at          TIMESTAMP
├── expires_at          TIMESTAMP
├── cancelled_at        TIMESTAMP
├── payment_method      VARCHAR(50)
└── created_at          TIMESTAMP
```

---

## Admin & Moderation

### disputes
User-reported issues.

```sql
disputes
├── id                  UUID PRIMARY KEY
├── reporter_id         UUID FK → users.id
├── reported_id         UUID FK → users.id
├── relationship_id     UUID FK → trainer_client_relationships.id (nullable)
├── type                ENUM('trainer_complaint', 'client_complaint', 'payment_issue', 'content_report', 'other')
├── description         TEXT
├── evidence_urls       TEXT (JSON array)
├── status              ENUM('open', 'investigating', 'resolved', 'dismissed')
├── resolution          TEXT
├── resolved_by         UUID FK → users.id (admin)
├── created_at          TIMESTAMP
└── resolved_at         TIMESTAMP
```

### admin_actions
Audit log of admin actions.

```sql
admin_actions
├── id                  UUID PRIMARY KEY
├── admin_id            UUID FK → users.id
├── action_type         VARCHAR(50) -- 'verify_trainer', 'ban_user', 'issue_refund'
├── target_user_id      UUID FK → users.id
├── details             TEXT (JSON)
├── created_at          TIMESTAMP
```

### notifications
Push notification queue.

```sql
notifications
├── id                  UUID PRIMARY KEY
├── user_id             UUID FK → users.id
├── type                VARCHAR(50)
├── title               VARCHAR(200)
├── body                TEXT
├── data                TEXT (JSON - deep link info)
├── is_read             BOOLEAN DEFAULT FALSE
├── sent_at             TIMESTAMP
├── read_at             TIMESTAMP
└── created_at          TIMESTAMP
```
