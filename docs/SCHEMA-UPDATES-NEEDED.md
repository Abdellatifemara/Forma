# Schema Updates Needed for Forma v2

## 1. Food Model Updates

Add to existing `Food` model:
```prisma
// Add these fields to Food model
ingredients       String[]          // List of ingredients in the food
preparationTime   Int?              // Minutes to prepare (for home cooking)
isHomemade        Boolean           @default(false)
isPreparedMeal    Boolean           @default(true)  // vs raw ingredient
```

## 2. NEW: Supplement Model (Trainer-Controlled)

```prisma
model Supplement {
  id                String                  @id @default(cuid())
  externalId        String?                 @unique
  nameEn            String
  nameAr            String
  brandEn           String
  brandAr           String?
  category          SupplementCategory
  subcategory       String?

  // Serving info
  servingSize       Float
  servingUnit       String                  @default("scoop")
  servingsPerContainer Int?

  // Nutrition per serving
  calories          Float                   @default(0)
  proteinG          Float                   @default(0)
  carbsG            Float                   @default(0)
  fatG              Float                   @default(0)

  // Key ingredients/amounts
  keyIngredients    Json?                   // { "creatine": "5g", "caffeine": "200mg" }

  // Product info
  flavors           String[]
  sizes             String[]                // ["2lb", "5lb", "10lb"]
  priceRangeEGP     String?                 // "1800-2200"
  whereToBuy        String[]
  availability      String                  @default("Common") // Common, Sometimes, Rare

  imageUrl          String?
  productUrl        String?

  // Warnings
  warnings          String[]
  contraindications String[]

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  // Relations
  trainerRecommendations TrainerSupplementRecommendation[]

  @@index([category])
  @@index([brandEn])
}

enum SupplementCategory {
  PROTEIN_POWDER
  MASS_GAINER
  PRE_WORKOUT
  CREATINE
  BCAA_EAA
  FAT_BURNER
  TESTOSTERONE_BOOSTER
  VITAMIN
  MINERAL
  OMEGA_FISH_OIL
  JOINT_SUPPORT
  SLEEP_RECOVERY
  GREENS
  MEAL_REPLACEMENT
  PROTEIN_BAR
  ENERGY_DRINK
  OTHER
}

// Trainer recommends supplements to clients
model TrainerSupplementRecommendation {
  id              String          @id @default(cuid())
  trainerId       String
  clientId        String
  supplementId    String

  dosage          String          // "1 scoop"
  frequency       String          // "post-workout" or "daily"
  timing          String?         // "within 30 min of workout"
  duration        String?         // "8 weeks"
  notes           String?

  isActive        Boolean         @default(true)
  startDate       DateTime        @default(now())
  endDate         DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  trainer         TrainerProfile  @relation(fields: [trainerId], references: [id])
  client          User            @relation(fields: [clientId], references: [id])
  supplement      Supplement      @relation(fields: [supplementId], references: [id])

  @@unique([trainerId, clientId, supplementId])
  @@index([clientId])
  @@index([trainerId])
}
```

## 3. NEW: Workout Program Templates

```prisma
model WorkoutProgramTemplate {
  id              String                    @id @default(cuid())
  externalId      String?                   @unique

  // Names
  nameEn          String                    // Cool marketing name
  nameAr          String
  slug            String                    @unique

  // Description
  descriptionEn   String
  descriptionAr   String

  // Classification
  programType     ProgramType               // BASE, ADDON, PACKAGE
  category        ProgramCategory
  tier            SubscriptionTier          @default(FREE)

  // Details
  durationWeeks   Int
  daysPerWeek     Int
  sessionMinutes  Int                       @default(60)
  difficulty      DifficultyLevel

  // Goals & Requirements
  goals           FitnessGoal[]
  targetGender    Gender?                   // null = both
  equipmentNeeded String[]
  prerequisites   String[]                  // Experience or other programs

  // For BASE programs
  compatibleAddons String[]                 // IDs of compatible addon modules

  // For PACKAGE programs
  includedPrograms String[]                 // IDs of base + addons

  // Content
  workoutSchedule Json                      // Full workout details
  progressionPlan Json?                     // How to progress
  deloadProtocol  Json?                     // When/how to deload

  // Source
  originalAuthor  String?                   // "Mark Rippetoe", "Reddit r/Fitness"
  sourceUrl       String?

  // Media
  imageUrl        String?
  thumbnailUrl    String?

  // Stats
  timesStarted    Int                       @default(0)
  averageRating   Float?
  totalReviews    Int                       @default(0)

  isActive        Boolean                   @default(true)
  isFeatured      Boolean                   @default(false)

  createdAt       DateTime                  @default(now())
  updatedAt       DateTime                  @updatedAt

  @@index([programType])
  @@index([category])
  @@index([tier])
  @@index([difficulty])
}

enum ProgramType {
  BASE            // Main program (Iron Foundation, Muscle Architect, etc.)
  ADDON           // Add-on module (Yoga Flow, Core Crusher, etc.)
  PACKAGE         // Pre-made combination (The Phoenix, Beast Mode, etc.)
}

enum ProgramCategory {
  STRENGTH
  HYPERTROPHY
  FAT_LOSS
  CALISTHENICS
  YOGA
  MOBILITY
  CORE
  CARDIO_HIIT
  SPORT_SPECIFIC
  REHABILITATION
  HOME_WORKOUT
  SPECIALIZATION  // Arms, Legs, Back, etc.
}
```

## 4. Update User Model

Add relation for supplement recommendations:
```prisma
// Add to User model
supplementRecommendations TrainerSupplementRecommendation[] @relation("ClientSupplements")
```

## 5. Update TrainerProfile Model

Add relation for supplement recommendations:
```prisma
// Add to TrainerProfile model
supplementRecommendations TrainerSupplementRecommendation[]
```

---

## Migration Steps

1. Create migration for Food model updates
2. Create Supplement model and enum
3. Create TrainerSupplementRecommendation model
4. Create WorkoutProgramTemplate model and enums
5. Update User and TrainerProfile relations
6. Run `npx prisma migrate dev`
7. Seed new data

## Important Notes

- Supplements are COMPLETELY SEPARATE from Food
- Supplements require trainer approval to access
- Trainer takes full responsibility for recommendations
- Programs are templates that get copied to user's WorkoutPlan when started
- Add-ons can be combined with base programs
- Packages are pre-defined combinations with cool names
