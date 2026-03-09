-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TRAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'IMPROVE_HEALTH', 'INCREASE_STRENGTH', 'IMPROVE_ENDURANCE');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'ABS', 'OBLIQUES', 'LOWER_BACK', 'GLUTES', 'QUADRICEPS', 'HAMSTRINGS', 'CALVES', 'FULL_BODY', 'CARDIO');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('NONE', 'BODYWEIGHT', 'DUMBBELLS', 'BARBELL', 'KETTLEBELL', 'CABLES', 'MACHINES', 'RESISTANCE_BANDS', 'TRX', 'PULL_UP_BAR', 'BENCH', 'STABILITY_BALL', 'FOAM_ROLLER', 'JUMP_ROPE', 'TREADMILL', 'BIKE', 'ROWING', 'HEAVY_BAG', 'BOXING_GLOVES', 'PADS', 'SHIN_GUARDS', 'ASSAULT_BIKE', 'PLYO_BOX', 'BATTLE_ROPES', 'SLED', 'WALL_BALL', 'RINGS', 'ROPE', 'GHD', 'SKI_ERG', 'MEDICINE_BALL');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'PLYOMETRIC', 'OLYMPIC', 'CALISTHENICS', 'YOGA', 'PILATES', 'MOBILITY', 'MARTIAL_ARTS', 'CROSSFIT');

-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('YOGA', 'CALISTHENICS', 'HIIT', 'STRETCHING', 'MEDITATION', 'STRENGTH', 'CARDIO', 'TUTORIAL');

-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'PREMIUM_PLUS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL');

-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TrainerTier" AS ENUM ('REGULAR', 'TRUSTED_PARTNER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'PROGRAM_PURCHASE', 'TIP', 'PAYOUT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PAID_OUT');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE', 'WORKOUT_SHARE', 'PROGRESS_SHARE');

-- CreateEnum
CREATE TYPE "AIQueryType" AS ENUM ('WORKOUT', 'NUTRITION', 'FORM', 'PROGRESS', 'GENERAL');

-- CreateEnum
CREATE TYPE "TrainingLocation" AS ENUM ('HOME', 'COMMERCIAL_GYM', 'HOME_GYM', 'OUTDOOR', 'HOTEL');

-- CreateEnum
CREATE TYPE "BenchType" AS ENUM ('FLAT', 'INCLINE', 'DECLINE', 'ADJUSTABLE');

-- CreateEnum
CREATE TYPE "InjuryBodyPart" AS ENUM ('NECK', 'SHOULDER', 'ROTATOR_CUFF', 'ELBOW', 'WRIST', 'HAND', 'UPPER_BACK', 'LOWER_BACK', 'SPINE_DISC', 'HIP', 'GROIN', 'KNEE', 'ACL', 'MCL', 'MENISCUS', 'ANKLE', 'ACHILLES', 'FOOT', 'OTHER');

-- CreateEnum
CREATE TYPE "InjuryType" AS ENUM ('STRAIN', 'SPRAIN', 'TEAR', 'TENDINITIS', 'BURSITIS', 'FRACTURE', 'IMPINGEMENT', 'HERNIATION', 'ARTHRITIS', 'CHRONIC_PAIN', 'POST_SURGERY', 'OTHER');

-- CreateEnum
CREATE TYPE "InjurySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'RECOVERING', 'FULLY_HEALED');

-- CreateEnum
CREATE TYPE "CookingLevel" AS ENUM ('NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'NO_LIMIT');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "SleepQuality" AS ENUM ('POOR', 'FAIR', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "StressLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "WorkoutTimePreference" AS ENUM ('EARLY_MORNING', 'MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING', 'NIGHT', 'ANYTIME');

-- CreateEnum
CREATE TYPE "RecoveryCapacity" AS ENUM ('LOW', 'AVERAGE', 'HIGH');

-- CreateEnum
CREATE TYPE "BodyFatMethod" AS ENUM ('DEXA', 'BODPOD', 'BIA_SCALE', 'CALIPERS', 'NAVY_METHOD', 'VISUAL_ESTIMATE');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('ECTOMORPH', 'MESOMORPH', 'ENDOMORPH', 'ECTO_MESO', 'MESO_ENDO');

-- CreateEnum
CREATE TYPE "FrameSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "WorkoutIntensity" AS ENUM ('RECOVERY', 'LIGHT', 'MODERATE', 'HIGH', 'MAXIMUM');

-- CreateEnum
CREATE TYPE "PerformanceLevel" AS ENUM ('MUCH_WORSE', 'WORSE', 'SAME', 'BETTER', 'MUCH_BETTER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('COMPLETE_BEGINNER', 'BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "TrainingStyle" AS ENUM ('TRADITIONAL', 'CIRCUIT', 'SUPERSETS', 'HIIT', 'POWERLIFTING', 'BODYBUILDING', 'CALISTHENICS', 'CROSSFIT');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('FULL_BODY', 'UPPER_LOWER', 'PUSH_PULL_LEGS', 'BRO_SPLIT', 'HYBRID', 'CROSSFIT_WOD');

-- CreateEnum
CREATE TYPE "RepRange" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VARIED');

-- CreateEnum
CREATE TYPE "MotivationType" AS ENUM ('HEALTH', 'APPEARANCE', 'STRENGTH', 'PERFORMANCE', 'MENTAL_HEALTH', 'SOCIAL', 'COMPETITION', 'HABIT', 'MEDICAL');

-- CreateEnum
CREATE TYPE "AccountabilityType" AS ENUM ('SELF', 'PARTNER', 'TRAINER', 'GROUP', 'APP');

-- CreateEnum
CREATE TYPE "IFProtocol" AS ENUM ('IF_16_8', 'IF_18_6', 'IF_20_4', 'OMAD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RamadanWorkoutTime" AS ENUM ('BEFORE_FAJR', 'BEFORE_IFTAR', 'AFTER_IFTAR', 'AFTER_TARAWEEH', 'SKIP');

-- CreateEnum
CREATE TYPE "HealthMetricType" AS ENUM ('WEIGHT', 'BODY_FAT_PERCENTAGE', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC', 'HEART_RATE_RESTING', 'BLOOD_GLUCOSE_FASTING', 'BLOOD_GLUCOSE_POSTPRANDIAL', 'HBA1C', 'TOTAL_CHOLESTEROL', 'LDL_CHOLESTEROL', 'HDL_CHOLESTEROL', 'TRIGLYCERIDES', 'CREATININE', 'BUN', 'HEMOGLOBIN', 'VITAMIN_D', 'VITAMIN_B12', 'TESTOSTERONE', 'CORTISOL', 'TSH', 'WAIST_CIRCUMFERENCE', 'HIP_CIRCUMFERENCE', 'SLEEP_HOURS', 'WATER_INTAKE_ML', 'STEPS', 'CALORIES_BURNED');

-- CreateEnum
CREATE TYPE "ScheduledCallType" AS ENUM ('ONBOARDING', 'WEEKLY_CHECKIN', 'PROGRESS_REVIEW', 'PROGRAM_UPDATE', 'EMERGENCY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScheduledCallStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('REST_DAY', 'WALK', 'STRETCH', 'YOGA', 'LIGHT_CARDIO', 'SWIMMING', 'CYCLING', 'OTHER');

-- CreateEnum
CREATE TYPE "CrossfitWodType" AS ENUM ('GIRL', 'HERO', 'BENCHMARK', 'CUSTOM', 'AMRAP', 'FOR_TIME', 'EMOM', 'CHIPPER');

-- CreateEnum
CREATE TYPE "CrossfitScoreType" AS ENUM ('TIME', 'ROUNDS_REPS', 'REPS', 'WEIGHT', 'CALORIES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "googleId" TEXT,
    "appleId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "fitnessGoal" "FitnessGoal",
    "activityLevel" "ActivityLevel",
    "heightCm" DOUBLE PRECISION,
    "currentWeightKg" DOUBLE PRECISION,
    "targetWeightKg" DOUBLE PRECISION,
    "fitnessLevel" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "measurementUnit" TEXT NOT NULL DEFAULT 'metric',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingCompletedAt" TIMESTAMP(3),
    "bannedAt" TIMESTAMP(3),
    "uploadBanReason" TEXT,
    "canSeeMarketplace" BOOLEAN NOT NULL DEFAULT true,
    "invitedByCode" TEXT,
    "invitedByTrainerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEquipment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equipment" "EquipmentType" NOT NULL,

    CONSTRAINT "UserEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAIPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isKeto" BOOLEAN NOT NULL DEFAULT false,
    "isPescatarian" BOOLEAN NOT NULL DEFAULT false,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "healthConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferLocalFoods" BOOLEAN NOT NULL DEFAULT true,
    "budgetLevel" TEXT NOT NULL DEFAULT 'moderate',
    "cookingSkillLevel" TEXT NOT NULL DEFAULT 'intermediate',
    "maxCookingTime" INTEGER NOT NULL DEFAULT 30,
    "availableEquipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredWorkoutTime" TEXT,
    "ramadanFastingDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ramadanIftarTime" TEXT,
    "ramadanModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ramadanSuhoorTime" TEXT,
    "ramadanWorkoutTiming" TEXT NOT NULL DEFAULT 'after_iftar',
    "workoutDurationMins" INTEGER NOT NULL DEFAULT 45,

    CONSTRAINT "UserAIPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "category" "ExerciseCategory" NOT NULL,
    "primaryMuscle" "MuscleGroup" NOT NULL,
    "secondaryMuscles" "MuscleGroup"[],
    "equipment" "EquipmentType"[],
    "difficulty" "DifficultyLevel" NOT NULL,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "youtubeVideoId" TEXT,
    "blurPlaceholder" TEXT,
    "instructionsEn" TEXT[],
    "instructionsAr" TEXT[],
    "tipsEn" TEXT[],
    "tipsAr" TEXT[],
    "faqsEn" JSONB,
    "faqsAr" JSONB,
    "isTimeBased" BOOLEAN NOT NULL DEFAULT false,
    "defaultSets" INTEGER NOT NULL DEFAULT 3,
    "defaultReps" INTEGER DEFAULT 10,
    "defaultDuration" INTEGER,
    "defaultRest" INTEGER NOT NULL DEFAULT 60,
    "tags" TEXT[],
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "durationWeeks" INTEGER NOT NULL DEFAULT 4,
    "daysPerWeek" INTEGER NOT NULL DEFAULT 4,
    "difficulty" "DifficultyLevel" NOT NULL,
    "goal" "FitnessGoal" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "focusMuscles" "MuscleGroup"[],
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 45,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER,
    "duration" INTEGER,
    "restSeconds" INTEGER NOT NULL DEFAULT 60,
    "notesEn" TEXT,
    "notesAr" TEXT,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT,
    "manualName" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "WorkoutStatus" NOT NULL DEFAULT 'SCHEDULED',
    "totalVolume" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "caloriesBurned" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "duration" INTEGER,
    "rpe" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "brandEn" TEXT,
    "brandAr" TEXT,
    "isEgyptian" BOOLEAN NOT NULL DEFAULT false,
    "availableAt" TEXT[],
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "servingSizeG" DOUBLE PRECISION NOT NULL,
    "servingUnit" TEXT NOT NULL DEFAULT 'g',
    "calories" DOUBLE PRECISION NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbsG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "fiberG" DOUBLE PRECISION,
    "sugarG" DOUBLE PRECISION,
    "sodiumMg" DOUBLE PRECISION,
    "vitaminAIU" DOUBLE PRECISION,
    "vitaminCMg" DOUBLE PRECISION,
    "calciumMg" DOUBLE PRECISION,
    "ironMg" DOUBLE PRECISION,
    "potassiumMg" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "barcode" TEXT,
    "tags" TEXT[],
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "targetProteinG" INTEGER NOT NULL,
    "targetCarbsG" INTEGER NOT NULL,
    "targetFatG" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedMeal" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "mealType" "MealType" NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,

    CONSTRAINT "PlannedMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedMealFood" (
    "id" TEXT NOT NULL,
    "plannedMealId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "PlannedMealFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" "MealType" NOT NULL,
    "notes" TEXT,
    "photoUrl" TEXT,
    "totalCalories" DOUBLE PRECISION,
    "totalProteinG" DOUBLE PRECISION,
    "totalCarbsG" DOUBLE PRECISION,
    "totalFatG" DOUBLE PRECISION,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealFood" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "MealFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION,
    "bodyFatPercent" DOUBLE PRECISION,
    "chestCm" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipsCm" DOUBLE PRECISION,
    "thighCm" DOUBLE PRECISION,
    "bicepCm" DOUBLE PRECISION,
    "restingHR" INTEGER,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "stepsCount" INTEGER,
    "notes" TEXT,

    CONSTRAINT "ProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "angle" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "sharedWithTrainer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specializations" TEXT[],
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "instagramHandle" TEXT,
    "instagramFollowers" INTEGER,
    "monthlyPrice" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "status" "TrainerStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "maxClients" INTEGER NOT NULL DEFAULT 20,
    "acceptingClients" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canGiftPremium" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "inviteCode" TEXT,
    "inviteUses" INTEGER NOT NULL DEFAULT 0,
    "lastPayoutAt" TIMESTAMP(3),
    "tier" "TrainerTier" NOT NULL DEFAULT 'REGULAR',
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableBalanceEGP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingPayoutEGP" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TrainerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerAvailability" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerCertification" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "TrainerCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerClient" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "canSeeMarketplace" BOOLEAN NOT NULL DEFAULT true,
    "complianceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentProgramId" TEXT,
    "invitedVia" TEXT,
    "premiumGifted" BOOLEAN NOT NULL DEFAULT false,
    "programEndDate" TIMESTAMP(3),
    "programStartDate" TIMESTAMP(3),

    CONSTRAINT "TrainerClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerInvite" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "grantsPremium" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProgram" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "durationWeeks" INTEGER NOT NULL DEFAULT 4,
    "priceEGP" INTEGER,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT,
    "sourcePdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWorkoutDay" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "notesEn" TEXT,
    "notesAr" TEXT,

    CONSTRAINT "ProgramWorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExercise" (
    "id" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "customNameEn" TEXT,
    "customNameAr" TEXT,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" TEXT,
    "restSeconds" INTEGER NOT NULL DEFAULT 60,
    "notesEn" TEXT,
    "notesAr" TEXT,

    CONSTRAINT "ProgramExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramNutritionDay" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "notesEn" TEXT,
    "notesAr" TEXT,
    "targetCalories" INTEGER,
    "targetProteinG" INTEGER,
    "targetCarbsG" INTEGER,
    "targetFatG" INTEGER,

    CONSTRAINT "ProgramNutritionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramMeal" (
    "id" TEXT NOT NULL,
    "nutritionDayId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "calories" INTEGER,
    "proteinG" INTEGER,
    "carbsG" INTEGER,
    "fatG" INTEGER,

    CONSTRAINT "ProgramMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerTransaction" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amountEGP" DOUBLE PRECISION NOT NULL,
    "platformFeeEGP" DOUBLE PRECISION NOT NULL,
    "trainerEarningEGP" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "paidOutAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "TrainerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerReview" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "priceEGP" INTEGER NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amountEGP" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "iconUrl" TEXT,
    "badgeColor" TEXT,
    "category" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "longestCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "category" "VideoCategory" NOT NULL,
    "tags" TEXT[],
    "durationSeconds" INTEGER,
    "thumbnailUrl" TEXT,
    "vectorData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadMember" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadActivity" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadChallenge" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentViolation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "action" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "featureId" TEXT NOT NULL,
    "queryType" "AIQueryType" NOT NULL,
    "queryText" TEXT,
    "responseTimeMs" INTEGER,
    "successful" BOOLEAN NOT NULL DEFAULT true,
    "satisfaction" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "questions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerEvent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureUsageLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "limitHitAt" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureUsageLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEquipmentInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryLocation" "TrainingLocation" NOT NULL DEFAULT 'HOME',
    "hasGymAccess" BOOLEAN NOT NULL DEFAULT false,
    "gymName" TEXT,
    "hasFloorSpace" BOOLEAN NOT NULL DEFAULT true,
    "hasWallSpace" BOOLEAN NOT NULL DEFAULT true,
    "hasPullUpBar" BOOLEAN NOT NULL DEFAULT false,
    "hasDipStation" BOOLEAN NOT NULL DEFAULT false,
    "hasParallettesBars" BOOLEAN NOT NULL DEFAULT false,
    "hasDumbbells" BOOLEAN NOT NULL DEFAULT false,
    "dumbbellMinKg" DOUBLE PRECISION,
    "dumbbellMaxKg" DOUBLE PRECISION,
    "dumbbellIncrement" DOUBLE PRECISION,
    "hasBarbell" BOOLEAN NOT NULL DEFAULT false,
    "barbellWeightKg" DOUBLE PRECISION,
    "hasPlates" BOOLEAN NOT NULL DEFAULT false,
    "plateMaxTotalKg" DOUBLE PRECISION,
    "hasKettlebells" BOOLEAN NOT NULL DEFAULT false,
    "kettlebellWeights" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "hasEZBar" BOOLEAN NOT NULL DEFAULT false,
    "hasBench" BOOLEAN NOT NULL DEFAULT false,
    "benchType" "BenchType",
    "hasSquatRack" BOOLEAN NOT NULL DEFAULT false,
    "hasPowerRack" BOOLEAN NOT NULL DEFAULT false,
    "hasSmithMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasCableMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasLegPress" BOOLEAN NOT NULL DEFAULT false,
    "hasLegExtension" BOOLEAN NOT NULL DEFAULT false,
    "hasLegCurl" BOOLEAN NOT NULL DEFAULT false,
    "hasLatPulldown" BOOLEAN NOT NULL DEFAULT false,
    "hasSeatedRow" BOOLEAN NOT NULL DEFAULT false,
    "hasChestPress" BOOLEAN NOT NULL DEFAULT false,
    "hasShoulderPress" BOOLEAN NOT NULL DEFAULT false,
    "hasPecDeck" BOOLEAN NOT NULL DEFAULT false,
    "hasTreadmill" BOOLEAN NOT NULL DEFAULT false,
    "hasStatBike" BOOLEAN NOT NULL DEFAULT false,
    "hasRowingMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasResistanceBands" BOOLEAN NOT NULL DEFAULT false,
    "bandStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasTRX" BOOLEAN NOT NULL DEFAULT false,
    "hasAbWheel" BOOLEAN NOT NULL DEFAULT false,
    "hasFoamRoller" BOOLEAN NOT NULL DEFAULT false,
    "hasYogaMat" BOOLEAN NOT NULL DEFAULT false,
    "hasJumpRope" BOOLEAN NOT NULL DEFAULT false,
    "hasBox" BOOLEAN NOT NULL DEFAULT false,
    "boxHeightsCm" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "hasMedicineBall" BOOLEAN NOT NULL DEFAULT false,
    "medicineBallKg" DOUBLE PRECISION,
    "hasStabilityBall" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEquipmentInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExerciseCapability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pushUpMaxReps" INTEGER NOT NULL DEFAULT 0,
    "pushUpFromKnees" BOOLEAN NOT NULL DEFAULT false,
    "wallPushUp" BOOLEAN NOT NULL DEFAULT true,
    "declinePushUp" BOOLEAN NOT NULL DEFAULT false,
    "diamondPushUp" BOOLEAN NOT NULL DEFAULT false,
    "pikePushUp" BOOLEAN NOT NULL DEFAULT false,
    "handstandPushUp" BOOLEAN NOT NULL DEFAULT false,
    "dipMaxReps" INTEGER NOT NULL DEFAULT 0,
    "pullUpMaxReps" INTEGER NOT NULL DEFAULT 0,
    "chinUpMaxReps" INTEGER NOT NULL DEFAULT 0,
    "canHangFromBar" BOOLEAN NOT NULL DEFAULT false,
    "bodyweightRow" BOOLEAN NOT NULL DEFAULT false,
    "plankHoldSeconds" INTEGER NOT NULL DEFAULT 0,
    "sidePlankSeconds" INTEGER NOT NULL DEFAULT 0,
    "hollowBodyHold" BOOLEAN NOT NULL DEFAULT false,
    "hangingLegRaise" BOOLEAN NOT NULL DEFAULT false,
    "abWheelRollout" BOOLEAN NOT NULL DEFAULT false,
    "bodyweightSquatMaxReps" INTEGER NOT NULL DEFAULT 0,
    "canSquatBelowParallel" BOOLEAN NOT NULL DEFAULT false,
    "pistolSquat" BOOLEAN NOT NULL DEFAULT false,
    "bulgarianSplitSquat" BOOLEAN NOT NULL DEFAULT false,
    "lungeMaxReps" INTEGER NOT NULL DEFAULT 0,
    "boxJump" BOOLEAN NOT NULL DEFAULT false,
    "boxJumpMaxCm" INTEGER,
    "singleLegRDL" BOOLEAN NOT NULL DEFAULT false,
    "hipThrust" BOOLEAN NOT NULL DEFAULT false,
    "nordicCurl" BOOLEAN NOT NULL DEFAULT false,
    "singleLegStandSeconds" INTEGER NOT NULL DEFAULT 0,
    "canRun5Min" BOOLEAN NOT NULL DEFAULT false,
    "canRun20Min" BOOLEAN NOT NULL DEFAULT false,
    "burpeeMaxReps" INTEGER NOT NULL DEFAULT 0,
    "canTouchToes" BOOLEAN NOT NULL DEFAULT false,
    "canDeepSquatNoHeel" BOOLEAN NOT NULL DEFAULT false,
    "canOverheadSquat" BOOLEAN NOT NULL DEFAULT false,
    "benchPress1RM" DOUBLE PRECISION,
    "squat1RM" DOUBLE PRECISION,
    "deadlift1RM" DOUBLE PRECISION,
    "overheadPress1RM" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExerciseCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessTestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rating" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitnessTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMovementScreen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "screenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deepSquatScore" INTEGER NOT NULL DEFAULT 2,
    "shoulderMobilityScoreL" INTEGER NOT NULL DEFAULT 2,
    "shoulderMobilityScoreR" INTEGER NOT NULL DEFAULT 2,
    "activeSLRScoreL" INTEGER NOT NULL DEFAULT 2,
    "activeSLRScoreR" INTEGER NOT NULL DEFAULT 2,
    "limitedAnkleDorsiflexion" BOOLEAN NOT NULL DEFAULT false,
    "limitedHipFlexion" BOOLEAN NOT NULL DEFAULT false,
    "limitedHipExtension" BOOLEAN NOT NULL DEFAULT false,
    "limitedThoracicExtension" BOOLEAN NOT NULL DEFAULT false,
    "limitedShoulderFlexion" BOOLEAN NOT NULL DEFAULT false,
    "limitedShoulderRotationInt" BOOLEAN NOT NULL DEFAULT false,
    "limitedShoulderRotationExt" BOOLEAN NOT NULL DEFAULT false,
    "limitedHamstringFlexibility" BOOLEAN NOT NULL DEFAULT false,
    "limitedWristExtension" BOOLEAN NOT NULL DEFAULT false,
    "hasLeftRightImbalance" BOOLEAN NOT NULL DEFAULT false,
    "strongerSide" TEXT,
    "forwardHeadPosture" BOOLEAN NOT NULL DEFAULT false,
    "roundedShoulders" BOOLEAN NOT NULL DEFAULT false,
    "excessiveLordosis" BOOLEAN NOT NULL DEFAULT false,
    "anteriorPelvicTilt" BOOLEAN NOT NULL DEFAULT false,
    "kneeValgus" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMovementScreen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHealthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasHeartCondition" BOOLEAN NOT NULL DEFAULT false,
    "hasHighBloodPressure" BOOLEAN NOT NULL DEFAULT false,
    "hasLowBloodPressure" BOOLEAN NOT NULL DEFAULT false,
    "hasDiabetes" BOOLEAN NOT NULL DEFAULT false,
    "diabetesType" INTEGER,
    "hasAsthma" BOOLEAN NOT NULL DEFAULT false,
    "hasArthritis" BOOLEAN NOT NULL DEFAULT false,
    "arthritisJoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasOsteoporosis" BOOLEAN NOT NULL DEFAULT false,
    "hasHerniaHistory" BOOLEAN NOT NULL DEFAULT false,
    "hasJointReplacement" BOOLEAN NOT NULL DEFAULT false,
    "jointReplacementDetails" TEXT,
    "hasNerveIssues" BOOLEAN NOT NULL DEFAULT false,
    "nerveIssueDetails" TEXT,
    "hasVertigoBalance" BOOLEAN NOT NULL DEFAULT false,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyTrimester" INTEGER,
    "hadRecentSurgery" BOOLEAN NOT NULL DEFAULT false,
    "surgeryDetails" TEXT,
    "surgeryDate" TIMESTAMP(3),
    "clearedForExercise" BOOLEAN NOT NULL DEFAULT true,
    "takesBloodThinners" BOOLEAN NOT NULL DEFAULT false,
    "takesBetaBlockers" BOOLEAN NOT NULL DEFAULT false,
    "takesInsulin" BOOLEAN NOT NULL DEFAULT false,
    "medicationNotes" TEXT,
    "hasDoctorClearance" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserHealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInjury" (
    "id" TEXT NOT NULL,
    "healthProfileId" TEXT NOT NULL,
    "bodyPart" "InjuryBodyPart" NOT NULL,
    "side" TEXT,
    "injuryType" "InjuryType" NOT NULL,
    "severity" "InjurySeverity" NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "isCurrentlyActive" BOOLEAN NOT NULL DEFAULT true,
    "isFullyHealed" BOOLEAN NOT NULL DEFAULT false,
    "painLevel" INTEGER NOT NULL DEFAULT 0,
    "painTriggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidMovements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inPhysicalTherapy" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInjury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNutritionProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isHalal" BOOLEAN NOT NULL DEFAULT false,
    "isKosher" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isPescatarian" BOOLEAN NOT NULL DEFAULT false,
    "isKeto" BOOLEAN NOT NULL DEFAULT false,
    "isLowCarb" BOOLEAN NOT NULL DEFAULT false,
    "isPaleo" BOOLEAN NOT NULL DEFAULT false,
    "isLowSodium" BOOLEAN NOT NULL DEFAULT false,
    "allergyPeanuts" BOOLEAN NOT NULL DEFAULT false,
    "allergyTreeNuts" BOOLEAN NOT NULL DEFAULT false,
    "allergyMilk" BOOLEAN NOT NULL DEFAULT false,
    "allergyEggs" BOOLEAN NOT NULL DEFAULT false,
    "allergyGluten" BOOLEAN NOT NULL DEFAULT false,
    "allergySoy" BOOLEAN NOT NULL DEFAULT false,
    "allergyFish" BOOLEAN NOT NULL DEFAULT false,
    "allergyShellfish" BOOLEAN NOT NULL DEFAULT false,
    "allergySesame" BOOLEAN NOT NULL DEFAULT false,
    "otherAllergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lactoseIntolerant" BOOLEAN NOT NULL DEFAULT false,
    "glutenSensitive" BOOLEAN NOT NULL DEFAULT false,
    "fodmapSensitive" BOOLEAN NOT NULL DEFAULT false,
    "dislikedFoods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dislikedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cookingSkillLevel" "CookingLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "maxCookingTimeMin" INTEGER NOT NULL DEFAULT 30,
    "willingToBatchCook" BOOLEAN NOT NULL DEFAULT false,
    "hasKitchenAccess" BOOLEAN NOT NULL DEFAULT true,
    "hasBlender" BOOLEAN NOT NULL DEFAULT false,
    "hasAirFryer" BOOLEAN NOT NULL DEFAULT false,
    "budgetLevel" "BudgetLevel" NOT NULL DEFAULT 'MODERATE',
    "monthlyFoodBudgetEGP" INTEGER,
    "mealsPerDay" INTEGER NOT NULL DEFAULT 3,
    "snacksPerDay" INTEGER NOT NULL DEFAULT 1,
    "eatsBreakfast" BOOLEAN NOT NULL DEFAULT true,
    "breakfastTime" TEXT,
    "lunchTime" TEXT,
    "dinnerTime" TEXT,
    "doesIntermittentFasting" BOOLEAN NOT NULL DEFAULT false,
    "fastingWindowStart" TEXT,
    "fastingWindowEnd" TEXT,
    "preferLocalEgyptianFood" BOOLEAN NOT NULL DEFAULT true,
    "preferSimpleRecipes" BOOLEAN NOT NULL DEFAULT true,
    "likesSpicyFood" BOOLEAN NOT NULL DEFAULT true,
    "takesProteinPowder" BOOLEAN NOT NULL DEFAULT false,
    "proteinPowderType" TEXT,
    "takesCreatine" BOOLEAN NOT NULL DEFAULT false,
    "takesPreWorkout" BOOLEAN NOT NULL DEFAULT false,
    "otherSupplements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useCalculatedMacros" BOOLEAN NOT NULL DEFAULT true,
    "customCalories" INTEGER,
    "customProteinG" INTEGER,
    "customCarbsG" INTEGER,
    "customFatG" INTEGER,

    CONSTRAINT "UserNutritionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLifestyleProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT,
    "workType" "WorkType" NOT NULL DEFAULT 'SEDENTARY',
    "workHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "dailyStepsEstimate" INTEGER NOT NULL DEFAULT 5000,
    "hasPhysicalHobbies" BOOLEAN NOT NULL DEFAULT false,
    "physicalHobbies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "averageSleepHours" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "sleepQuality" "SleepQuality" NOT NULL DEFAULT 'FAIR',
    "typicalBedtime" TEXT,
    "typicalWakeTime" TEXT,
    "hasSleepDisorder" BOOLEAN NOT NULL DEFAULT false,
    "currentStressLevel" "StressLevel" NOT NULL DEFAULT 'MODERATE',
    "mainStressors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasAnxiety" BOOLEAN NOT NULL DEFAULT false,
    "preferredWorkoutTime" "WorkoutTimePreference" NOT NULL DEFAULT 'ANYTIME',
    "availableMonday" BOOLEAN NOT NULL DEFAULT true,
    "availableTuesday" BOOLEAN NOT NULL DEFAULT true,
    "availableWednesday" BOOLEAN NOT NULL DEFAULT true,
    "availableThursday" BOOLEAN NOT NULL DEFAULT true,
    "availableFriday" BOOLEAN NOT NULL DEFAULT true,
    "availableSaturday" BOOLEAN NOT NULL DEFAULT true,
    "availableSunday" BOOLEAN NOT NULL DEFAULT true,
    "maxWorkoutMinutes" INTEGER NOT NULL DEFAULT 60,
    "minWorkoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "targetWorkoutsPerWeek" INTEGER NOT NULL DEFAULT 4,
    "recoveryCapacity" "RecoveryCapacity" NOT NULL DEFAULT 'AVERAGE',
    "doesStretching" BOOLEAN NOT NULL DEFAULT false,
    "doesYogaMobility" BOOLEAN NOT NULL DEFAULT false,
    "caffeineIntakeDaily" INTEGER NOT NULL DEFAULT 2,
    "smoker" BOOLEAN NOT NULL DEFAULT false,
    "alcoholDrinksPerWeek" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserLifestyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBodyComposition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentWeightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION,
    "bodyFatPercent" DOUBLE PRECISION,
    "bodyFatMethod" "BodyFatMethod",
    "leanMassKg" DOUBLE PRECISION,
    "fatMassKg" DOUBLE PRECISION,
    "neckCm" DOUBLE PRECISION,
    "shouldersCm" DOUBLE PRECISION,
    "chestCm" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipsGlutesCm" DOUBLE PRECISION,
    "leftBicepCm" DOUBLE PRECISION,
    "rightBicepCm" DOUBLE PRECISION,
    "leftThighCm" DOUBLE PRECISION,
    "rightThighCm" DOUBLE PRECISION,
    "leftCalfCm" DOUBLE PRECISION,
    "rightCalfCm" DOUBLE PRECISION,
    "waistToHipRatio" DOUBLE PRECISION,
    "waistToHeightRatio" DOUBLE PRECISION,
    "bodyType" "BodyType",
    "frameSize" "FrameSize",

    CONSTRAINT "UserBodyComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReadinessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "energyLevel" INTEGER NOT NULL,
    "motivationLevel" INTEGER NOT NULL,
    "moodLevel" INTEGER NOT NULL,
    "overallReadiness" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "anyPainToday" BOOLEAN NOT NULL DEFAULT false,
    "painAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painIntensity" INTEGER,
    "musclesSore" BOOLEAN NOT NULL DEFAULT false,
    "soreAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sorenessLevel" INTEGER,
    "feelingIll" BOOLEAN NOT NULL DEFAULT false,
    "restingHeartRate" INTEGER,
    "hrvScore" INTEGER,
    "stressYesterday" INTEGER,
    "alcoholYesterday" BOOLEAN NOT NULL DEFAULT false,
    "hydratedWell" BOOLEAN NOT NULL DEFAULT true,
    "recommendedIntensity" "WorkoutIntensity",
    "shouldSkipWorkout" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "DailyReadinessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutFeedback" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallRating" INTEGER NOT NULL,
    "perceivedDifficulty" INTEGER NOT NULL,
    "enjoymentLevel" INTEGER NOT NULL,
    "performanceVsExpected" "PerformanceLevel" NOT NULL,
    "formQuality" INTEGER NOT NULL,
    "anyPainDuringWorkout" BOOLEAN NOT NULL DEFAULT false,
    "painExercises" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feltTooEasy" BOOLEAN NOT NULL DEFAULT false,
    "feltTooHard" BOOLEAN NOT NULL DEFAULT false,
    "favoriteExercise" TEXT,
    "leastFavoriteExercise" TEXT,
    "wantMoreOf" TEXT,
    "wantLessOf" TEXT,
    "notes" TEXT,

    CONSTRAINT "WorkoutFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleRecoveryStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "lastWorkedAt" TIMESTAMP(3),
    "lastWorkoutSets" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutRPE" INTEGER NOT NULL DEFAULT 5,
    "recoveryPercent" INTEGER NOT NULL DEFAULT 100,
    "estimatedFullRecoveryAt" TIMESTAMP(3),
    "currentSoreness" INTEGER NOT NULL DEFAULT 0,
    "setsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "targetSetsPerWeek" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuscleRecoveryStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTrainingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainingStartDate" TIMESTAMP(3),
    "totalYearsTraining" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentLevel" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "previousPrograms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sportsBackground" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredTrainingStyle" "TrainingStyle" NOT NULL DEFAULT 'TRADITIONAL',
    "preferredSplitType" "SplitType" NOT NULL DEFAULT 'FULL_BODY',
    "preferredRepRange" "RepRange" NOT NULL DEFAULT 'MODERATE',
    "bestProgressMade" TEXT,
    "whatWorkedBest" TEXT,
    "whatDidntWork" TEXT,
    "totalWorkoutsLogged" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "averageWorkoutsPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistencyScore" INTEGER NOT NULL DEFAULT 50,
    "prBenchPressKg" DOUBLE PRECISION,
    "prSquatKg" DOUBLE PRECISION,
    "prDeadliftKg" DOUBLE PRECISION,
    "prPullUps" INTEGER,
    "prPushUps" INTEGER,
    "prPlankSeconds" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTrainingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGoalsProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primaryGoal" "FitnessGoal" NOT NULL,
    "primaryGoalTarget" TEXT,
    "targetDate" TIMESTAMP(3),
    "secondaryGoals" "FitnessGoal"[],
    "targetWeightKg" DOUBLE PRECISION,
    "targetBodyFatPercent" DOUBLE PRECISION,
    "targetStrength" TEXT,
    "targetEndurance" TEXT,
    "mainMotivation" "MotivationType" NOT NULL,
    "secondaryMotivations" "MotivationType"[],
    "biggestBarriers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "previousFailures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accountabilityPreference" "AccountabilityType" NOT NULL DEFAULT 'SELF',
    "hasWorkoutPartner" BOOLEAN NOT NULL DEFAULT false,
    "wantsReminders" BOOLEAN NOT NULL DEFAULT true,
    "confidenceLevel" INTEGER NOT NULL DEFAULT 5,
    "commitmentLevel" INTEGER NOT NULL DEFAULT 7,
    "patienceForResults" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "UserGoalsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFastingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doesIntermittentFasting" BOOLEAN NOT NULL DEFAULT false,
    "ifProtocol" "IFProtocol",
    "eatingWindowStart" TEXT,
    "eatingWindowEnd" TEXT,
    "observesRamadan" BOOLEAN NOT NULL DEFAULT false,
    "ramadanActive" BOOLEAN NOT NULL DEFAULT false,
    "ramadanIftarTime" TEXT,
    "ramadanSuhoorTime" TEXT,
    "ramadanWorkoutTiming" "RamadanWorkoutTime" NOT NULL DEFAULT 'AFTER_IFTAR',
    "ramadanReduceIntensity" BOOLEAN NOT NULL DEFAULT true,
    "ramadanReduceVolume" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFastingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "HealthMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthDataLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hrv" DOUBLE PRECISION,
    "restingHeartRate" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" DOUBLE PRECISION,
    "sleepDeep" DOUBLE PRECISION,
    "sleepRem" DOUBLE PRECISION,
    "sleepLight" DOUBLE PRECISION,
    "sleepAwake" DOUBLE PRECISION,
    "steps" INTEGER,
    "activeCalories" DOUBLE PRECISION,
    "stressLevel" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthDataLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workoutCompleted" BOOLEAN,
    "workoutRating" INTEGER,
    "workoutNotes" TEXT,
    "nutritionCompleted" BOOLEAN,
    "nutritionRating" INTEGER,
    "nutritionNotes" TEXT,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "energyLevel" INTEGER,
    "stressLevel" INTEGER,
    "musclesoreness" INTEGER,
    "mood" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCall" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "type" "ScheduledCallType" NOT NULL,
    "status" "ScheduledCallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingUrl" TEXT,
    "roomName" TEXT,
    "agenda" TEXT,
    "trainerNotes" TEXT,
    "clientNotes" TEXT,
    "recordingUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyProgressReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT,
    "weekStartDate" DATE NOT NULL,
    "weekEndDate" DATE NOT NULL,
    "workoutsPlanned" INTEGER NOT NULL DEFAULT 0,
    "workoutsCompleted" INTEGER NOT NULL DEFAULT 0,
    "mealsLogged" INTEGER NOT NULL DEFAULT 0,
    "checkInsCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgWorkoutRating" DOUBLE PRECISION,
    "avgNutritionRating" DOUBLE PRECISION,
    "avgSleepHours" DOUBLE PRECISION,
    "avgEnergyLevel" DOUBLE PRECISION,
    "avgMood" DOUBLE PRECISION,
    "startWeight" DOUBLE PRECISION,
    "endWeight" DOUBLE PRECISION,
    "weightChange" DOUBLE PRECISION,
    "aiSummary" TEXT,
    "aiRecommendations" TEXT[],
    "reviewedByTrainer" BOOLEAN NOT NULL DEFAULT false,
    "trainerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyProgressReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerClientNote" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerClientNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "displayName" TEXT,
    "mockToken" TEXT,
    "syncFrequency" TEXT NOT NULL DEFAULT 'auto',
    "permissions" TEXT NOT NULL DEFAULT 'all',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "time" TEXT,
    "days" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ml" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "durationMinutes" INTEGER,
    "caloriesBurned" INTEGER,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossfitScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wodName" TEXT NOT NULL,
    "wodType" "CrossfitWodType" NOT NULL,
    "scoreType" "CrossfitScoreType" NOT NULL,
    "scoreValue" DOUBLE PRECISION NOT NULL,
    "rx" BOOLEAN NOT NULL DEFAULT false,
    "scaled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrossfitScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossfitPR" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movement" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrossfitPR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReceivedMessages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserEquipment_userId_equipment_key" ON "UserEquipment"("userId", "equipment");

-- CreateIndex
CREATE UNIQUE INDEX "UserAIPreference_userId_key" ON "UserAIPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_externalId_key" ON "Exercise"("externalId");

-- CreateIndex
CREATE INDEX "Exercise_primaryMuscle_idx" ON "Exercise"("primaryMuscle");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_isActive_idx" ON "WorkoutPlan"("isActive");

-- CreateIndex
CREATE INDEX "Workout_planId_idx" ON "Workout"("planId");

-- CreateIndex
CREATE INDEX "Workout_weekNumber_dayOfWeek_idx" ON "Workout"("weekNumber", "dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutId_idx" ON "WorkoutExercise"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_idx" ON "WorkoutLog"("userId");

-- CreateIndex
CREATE INDEX "WorkoutLog_scheduledDate_idx" ON "WorkoutLog"("scheduledDate");

-- CreateIndex
CREATE INDEX "WorkoutLog_status_idx" ON "WorkoutLog"("status");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_completedAt_idx" ON "WorkoutLog"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_status_scheduledDate_idx" ON "WorkoutLog"("userId", "status", "scheduledDate");

-- CreateIndex
CREATE INDEX "ExerciseLog_workoutLogId_idx" ON "ExerciseLog"("workoutLogId");

-- CreateIndex
CREATE INDEX "ExerciseLog_exerciseId_idx" ON "ExerciseLog"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseLog_workoutLogId_exerciseId_idx" ON "ExerciseLog"("workoutLogId", "exerciseId");

-- CreateIndex
CREATE INDEX "SetLog_exerciseLogId_idx" ON "SetLog"("exerciseLogId");

-- CreateIndex
CREATE UNIQUE INDEX "Food_externalId_key" ON "Food"("externalId");

-- CreateIndex
CREATE INDEX "Food_category_idx" ON "Food"("category");

-- CreateIndex
CREATE INDEX "Food_isEgyptian_idx" ON "Food"("isEgyptian");

-- CreateIndex
CREATE INDEX "Food_barcode_idx" ON "Food"("barcode");

-- CreateIndex
CREATE INDEX "MealPlan_userId_idx" ON "MealPlan"("userId");

-- CreateIndex
CREATE INDEX "MealPlan_isActive_idx" ON "MealPlan"("isActive");

-- CreateIndex
CREATE INDEX "PlannedMeal_planId_idx" ON "PlannedMeal"("planId");

-- CreateIndex
CREATE INDEX "PlannedMealFood_plannedMealId_idx" ON "PlannedMealFood"("plannedMealId");

-- CreateIndex
CREATE INDEX "MealLog_userId_idx" ON "MealLog"("userId");

-- CreateIndex
CREATE INDEX "MealLog_loggedAt_idx" ON "MealLog"("loggedAt");

-- CreateIndex
CREATE INDEX "MealFood_mealLogId_idx" ON "MealFood"("mealLogId");

-- CreateIndex
CREATE INDEX "ProgressLog_userId_idx" ON "ProgressLog"("userId");

-- CreateIndex
CREATE INDEX "ProgressLog_loggedAt_idx" ON "ProgressLog"("loggedAt");

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_idx" ON "ProgressPhoto"("userId");

-- CreateIndex
CREATE INDEX "ProgressPhoto_loggedAt_idx" ON "ProgressPhoto"("loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_userId_key" ON "TrainerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_inviteCode_key" ON "TrainerProfile"("inviteCode");

-- CreateIndex
CREATE INDEX "TrainerProfile_status_idx" ON "TrainerProfile"("status");

-- CreateIndex
CREATE INDEX "TrainerProfile_averageRating_idx" ON "TrainerProfile"("averageRating");

-- CreateIndex
CREATE INDEX "TrainerProfile_tier_idx" ON "TrainerProfile"("tier");

-- CreateIndex
CREATE INDEX "TrainerProfile_inviteCode_idx" ON "TrainerProfile"("inviteCode");

-- CreateIndex
CREATE INDEX "TrainerAvailability_trainerId_idx" ON "TrainerAvailability"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerAvailability_dayOfWeek_idx" ON "TrainerAvailability"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerAvailability_trainerId_dayOfWeek_startTime_key" ON "TrainerAvailability"("trainerId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "TrainerCertification_trainerId_idx" ON "TrainerCertification"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerClient_trainerId_idx" ON "TrainerClient"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerClient_clientId_idx" ON "TrainerClient"("clientId");

-- CreateIndex
CREATE INDEX "TrainerClient_isActive_idx" ON "TrainerClient"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerClient_trainerId_clientId_key" ON "TrainerClient"("trainerId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerInvite_code_key" ON "TrainerInvite"("code");

-- CreateIndex
CREATE INDEX "TrainerInvite_trainerId_idx" ON "TrainerInvite"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerInvite_code_idx" ON "TrainerInvite"("code");

-- CreateIndex
CREATE INDEX "TrainerProgram_trainerId_idx" ON "TrainerProgram"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerProgram_status_idx" ON "TrainerProgram"("status");

-- CreateIndex
CREATE INDEX "ProgramWorkoutDay_programId_idx" ON "ProgramWorkoutDay"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramWorkoutDay_programId_dayNumber_key" ON "ProgramWorkoutDay"("programId", "dayNumber");

-- CreateIndex
CREATE INDEX "ProgramExercise_workoutDayId_idx" ON "ProgramExercise"("workoutDayId");

-- CreateIndex
CREATE INDEX "ProgramNutritionDay_programId_idx" ON "ProgramNutritionDay"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramNutritionDay_programId_dayNumber_key" ON "ProgramNutritionDay"("programId", "dayNumber");

-- CreateIndex
CREATE INDEX "ProgramMeal_nutritionDayId_idx" ON "ProgramMeal"("nutritionDayId");

-- CreateIndex
CREATE INDEX "TrainerTransaction_trainerId_idx" ON "TrainerTransaction"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerTransaction_status_idx" ON "TrainerTransaction"("status");

-- CreateIndex
CREATE INDEX "TrainerTransaction_createdAt_idx" ON "TrainerTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "TrainerReview_trainerId_idx" ON "TrainerReview"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_tier_idx" ON "Subscription"("tier");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "Streak_userId_idx" ON "Streak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_type_key" ON "Streak"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");

-- CreateIndex
CREATE INDEX "Video_category_idx" ON "Video"("category");

-- CreateIndex
CREATE INDEX "Video_isActive_idx" ON "Video"("isActive");

-- CreateIndex
CREATE INDEX "Squad_isPublic_idx" ON "Squad"("isPublic");

-- CreateIndex
CREATE INDEX "SquadMember_userId_idx" ON "SquadMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMember_squadId_userId_key" ON "SquadMember"("squadId", "userId");

-- CreateIndex
CREATE INDEX "SquadActivity_squadId_idx" ON "SquadActivity"("squadId");

-- CreateIndex
CREATE INDEX "SquadActivity_createdAt_idx" ON "SquadActivity"("createdAt");

-- CreateIndex
CREATE INDEX "SquadChallenge_squadId_idx" ON "SquadChallenge"("squadId");

-- CreateIndex
CREATE INDEX "SquadChallenge_endDate_idx" ON "SquadChallenge"("endDate");

-- CreateIndex
CREATE INDEX "ContentViolation_userId_idx" ON "ContentViolation"("userId");

-- CreateIndex
CREATE INDEX "ContentViolation_createdAt_idx" ON "ContentViolation"("createdAt");

-- CreateIndex
CREATE INDEX "ContentViolation_reviewedAt_idx" ON "ContentViolation"("reviewedAt");

-- CreateIndex
CREATE INDEX "AIUsageEvent_userId_idx" ON "AIUsageEvent"("userId");

-- CreateIndex
CREATE INDEX "AIUsageEvent_tier_idx" ON "AIUsageEvent"("tier");

-- CreateIndex
CREATE INDEX "AIUsageEvent_queryType_idx" ON "AIUsageEvent"("queryType");

-- CreateIndex
CREATE INDEX "AIUsageEvent_createdAt_idx" ON "AIUsageEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_code_key" ON "Survey"("code");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_userId_idx" ON "SurveyResponse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_surveyId_userId_key" ON "SurveyResponse"("surveyId", "userId");

-- CreateIndex
CREATE INDEX "FeatureUsageLimit_userId_idx" ON "FeatureUsageLimit"("userId");

-- CreateIndex
CREATE INDEX "FeatureUsageLimit_featureId_idx" ON "FeatureUsageLimit"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsageLimit_userId_featureId_periodStart_key" ON "FeatureUsageLimit"("userId", "featureId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "UserEquipmentInventory_userId_key" ON "UserEquipmentInventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExerciseCapability_userId_key" ON "UserExerciseCapability"("userId");

-- CreateIndex
CREATE INDEX "FitnessTestResult_userId_testId_idx" ON "FitnessTestResult"("userId", "testId");

-- CreateIndex
CREATE INDEX "FitnessTestResult_userId_testedAt_idx" ON "FitnessTestResult"("userId", "testedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserMovementScreen_userId_key" ON "UserMovementScreen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHealthProfile_userId_key" ON "UserHealthProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInjury_healthProfileId_idx" ON "UserInjury"("healthProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNutritionProfile_userId_key" ON "UserNutritionProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLifestyleProfile_userId_key" ON "UserLifestyleProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBodyComposition_userId_key" ON "UserBodyComposition"("userId");

-- CreateIndex
CREATE INDEX "DailyReadinessLog_userId_idx" ON "DailyReadinessLog"("userId");

-- CreateIndex
CREATE INDEX "DailyReadinessLog_loggedAt_idx" ON "DailyReadinessLog"("loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutFeedback_workoutLogId_key" ON "WorkoutFeedback"("workoutLogId");

-- CreateIndex
CREATE INDEX "WorkoutFeedback_userId_idx" ON "WorkoutFeedback"("userId");

-- CreateIndex
CREATE INDEX "MuscleRecoveryStatus_userId_idx" ON "MuscleRecoveryStatus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleRecoveryStatus_userId_muscleGroup_key" ON "MuscleRecoveryStatus"("userId", "muscleGroup");

-- CreateIndex
CREATE UNIQUE INDEX "UserTrainingHistory_userId_key" ON "UserTrainingHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoalsProfile_userId_key" ON "UserGoalsProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFastingProfile_userId_key" ON "UserFastingProfile"("userId");

-- CreateIndex
CREATE INDEX "HealthMetric_userId_idx" ON "HealthMetric"("userId");

-- CreateIndex
CREATE INDEX "HealthMetric_type_idx" ON "HealthMetric"("type");

-- CreateIndex
CREATE INDEX "HealthMetric_date_idx" ON "HealthMetric"("date");

-- CreateIndex
CREATE INDEX "HealthDataLog_userId_idx" ON "HealthDataLog"("userId");

-- CreateIndex
CREATE INDEX "HealthDataLog_recordedAt_idx" ON "HealthDataLog"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HealthDataLog_userId_source_recordedAt_key" ON "HealthDataLog"("userId", "source", "recordedAt");

-- CreateIndex
CREATE INDEX "DailyCheckIn_userId_idx" ON "DailyCheckIn"("userId");

-- CreateIndex
CREATE INDEX "DailyCheckIn_date_idx" ON "DailyCheckIn"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "ScheduledCall_trainerId_idx" ON "ScheduledCall"("trainerId");

-- CreateIndex
CREATE INDEX "ScheduledCall_clientId_idx" ON "ScheduledCall"("clientId");

-- CreateIndex
CREATE INDEX "ScheduledCall_scheduledAt_idx" ON "ScheduledCall"("scheduledAt");

-- CreateIndex
CREATE INDEX "ScheduledCall_status_idx" ON "ScheduledCall"("status");

-- CreateIndex
CREATE INDEX "WeeklyProgressReport_userId_idx" ON "WeeklyProgressReport"("userId");

-- CreateIndex
CREATE INDEX "WeeklyProgressReport_trainerId_idx" ON "WeeklyProgressReport"("trainerId");

-- CreateIndex
CREATE INDEX "WeeklyProgressReport_weekStartDate_idx" ON "WeeklyProgressReport"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyProgressReport_userId_weekStartDate_key" ON "WeeklyProgressReport"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "TrainerClientNote_trainerId_idx" ON "TrainerClientNote"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerClientNote_clientId_idx" ON "TrainerClientNote"("clientId");

-- CreateIndex
CREATE INDEX "TrainerClientNote_createdAt_idx" ON "TrainerClientNote"("createdAt");

-- CreateIndex
CREATE INDEX "ConnectedDevice_userId_idx" ON "ConnectedDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedDevice_userId_deviceType_key" ON "ConnectedDevice"("userId", "deviceType");

-- CreateIndex
CREATE INDEX "NotificationReminder_userId_idx" ON "NotificationReminder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationReminder_userId_type_key" ON "NotificationReminder"("userId", "type");

-- CreateIndex
CREATE INDEX "WaterLog_userId_idx" ON "WaterLog"("userId");

-- CreateIndex
CREATE INDEX "WaterLog_createdAt_idx" ON "WaterLog"("createdAt");

-- CreateIndex
CREATE INDEX "WaterLog_userId_createdAt_idx" ON "WaterLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CrossfitScore_userId_idx" ON "CrossfitScore"("userId");

-- CreateIndex
CREATE INDEX "CrossfitScore_wodName_idx" ON "CrossfitScore"("wodName");

-- CreateIndex
CREATE INDEX "CrossfitScore_userId_wodName_idx" ON "CrossfitScore"("userId", "wodName");

-- CreateIndex
CREATE INDEX "CrossfitScore_createdAt_idx" ON "CrossfitScore"("createdAt");

-- CreateIndex
CREATE INDEX "CrossfitPR_userId_idx" ON "CrossfitPR"("userId");

-- CreateIndex
CREATE INDEX "CrossfitPR_movement_idx" ON "CrossfitPR"("movement");

-- CreateIndex
CREATE INDEX "CrossfitPR_userId_movement_idx" ON "CrossfitPR"("userId", "movement");

-- CreateIndex
CREATE INDEX "CrossfitPR_createdAt_idx" ON "CrossfitPR"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_ReceivedMessages_AB_unique" ON "_ReceivedMessages"("A", "B");

-- CreateIndex
CREATE INDEX "_ReceivedMessages_B_index" ON "_ReceivedMessages"("B");

-- AddForeignKey
ALTER TABLE "UserEquipment" ADD CONSTRAINT "UserEquipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAIPreference" ADD CONSTRAINT "UserAIPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedMeal" ADD CONSTRAINT "PlannedMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedMealFood" ADD CONSTRAINT "PlannedMealFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedMealFood" ADD CONSTRAINT "PlannedMealFood_plannedMealId_fkey" FOREIGN KEY ("plannedMealId") REFERENCES "PlannedMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFood" ADD CONSTRAINT "MealFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFood" ADD CONSTRAINT "MealFood_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerProfile" ADD CONSTRAINT "TrainerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAvailability" ADD CONSTRAINT "TrainerAvailability_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCertification" ADD CONSTRAINT "TrainerCertification_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_currentProgramId_fkey" FOREIGN KEY ("currentProgramId") REFERENCES "TrainerProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerInvite" ADD CONSTRAINT "TrainerInvite_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerProgram" ADD CONSTRAINT "TrainerProgram_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkoutDay" ADD CONSTRAINT "ProgramWorkoutDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExercise" ADD CONSTRAINT "ProgramExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExercise" ADD CONSTRAINT "ProgramExercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "ProgramWorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramNutritionDay" ADD CONSTRAINT "ProgramNutritionDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramMeal" ADD CONSTRAINT "ProgramMeal_nutritionDayId_fkey" FOREIGN KEY ("nutritionDayId") REFERENCES "ProgramNutritionDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerTransaction" ADD CONSTRAINT "TrainerTransaction_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMember" ADD CONSTRAINT "SquadMember_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadActivity" ADD CONSTRAINT "SquadActivity_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadChallenge" ADD CONSTRAINT "SquadChallenge_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentViolation" ADD CONSTRAINT "ContentViolation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageEvent" ADD CONSTRAINT "AIUsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureUsageLimit" ADD CONSTRAINT "FeatureUsageLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquipmentInventory" ADD CONSTRAINT "UserEquipmentInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExerciseCapability" ADD CONSTRAINT "UserExerciseCapability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessTestResult" ADD CONSTRAINT "FitnessTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMovementScreen" ADD CONSTRAINT "UserMovementScreen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHealthProfile" ADD CONSTRAINT "UserHealthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInjury" ADD CONSTRAINT "UserInjury_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "UserHealthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNutritionProfile" ADD CONSTRAINT "UserNutritionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifestyleProfile" ADD CONSTRAINT "UserLifestyleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBodyComposition" ADD CONSTRAINT "UserBodyComposition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReadinessLog" ADD CONSTRAINT "DailyReadinessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutFeedback" ADD CONSTRAINT "WorkoutFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutFeedback" ADD CONSTRAINT "WorkoutFeedback_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleRecoveryStatus" ADD CONSTRAINT "MuscleRecoveryStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrainingHistory" ADD CONSTRAINT "UserTrainingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoalsProfile" ADD CONSTRAINT "UserGoalsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFastingProfile" ADD CONSTRAINT "UserFastingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthDataLog" ADD CONSTRAINT "HealthDataLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedDevice" ADD CONSTRAINT "ConnectedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReminder" ADD CONSTRAINT "NotificationReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossfitScore" ADD CONSTRAINT "CrossfitScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossfitPR" ADD CONSTRAINT "CrossfitPR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceivedMessages" ADD CONSTRAINT "_ReceivedMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceivedMessages" ADD CONSTRAINT "_ReceivedMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

