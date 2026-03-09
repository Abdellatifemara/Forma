import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ──────────────────────────────────────────────
// EQUIPMENT INVENTORY
// ──────────────────────────────────────────────

enum PrimaryLocation {
  HOME = 'HOME',
  GYM = 'GYM',
  OUTDOOR = 'OUTDOOR',
}

export class UpdateEquipmentDto {
  @IsOptional() @IsEnum(PrimaryLocation) primaryLocation?: PrimaryLocation;
  @IsOptional() @IsBoolean() hasGymAccess?: boolean;
  @IsOptional() @IsBoolean() hasPullUpBar?: boolean;
  @IsOptional() @IsBoolean() hasDumbbells?: boolean;
  @IsOptional() @IsBoolean() hasBarbell?: boolean;
  @IsOptional() @IsBoolean() hasBench?: boolean;
  @IsOptional() @IsBoolean() hasResistanceBands?: boolean;
  @IsOptional() @IsBoolean() hasYogaMat?: boolean;
  @IsOptional() @IsBoolean() hasKettlebell?: boolean;
  @IsOptional() @IsBoolean() hasCableMachine?: boolean;
  @IsOptional() @IsBoolean() hasCardioEquipment?: boolean;
}

// ──────────────────────────────────────────────
// EXERCISE CAPABILITY
// ──────────────────────────────────────────────

export class UpdateCapabilityDto {
  @IsOptional() @IsInt() @Min(0) @Max(500) pushUpMaxReps?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) pullUpMaxReps?: number;
  @IsOptional() @IsInt() @Min(0) @Max(3600) plankHoldSeconds?: number;
  @IsOptional() @IsInt() @Min(0) @Max(500) bodyweightSquatMaxReps?: number;
  @IsOptional() @IsBoolean() canTouchToes?: boolean;
  @IsOptional() @IsNumber() @Min(0) benchPressKg?: number;
  @IsOptional() @IsNumber() @Min(0) squatKg?: number;
  @IsOptional() @IsNumber() @Min(0) deadliftKg?: number;
}

// ──────────────────────────────────────────────
// MOVEMENT SCREENING
// ──────────────────────────────────────────────

export class UpdateMovementDto {
  @IsOptional() @IsInt() @Min(0) @Max(3) deepSquatScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(3) shoulderMobilityScoreL?: number;
  @IsOptional() @IsInt() @Min(0) @Max(3) shoulderMobilityScoreR?: number;
  @IsOptional() @IsBoolean() limitedAnkleDorsiflexion?: boolean;
  @IsOptional() @IsBoolean() limitedShoulderFlexion?: boolean;
  @IsOptional() @IsBoolean() roundedShoulders?: boolean;
  @IsOptional() @IsBoolean() anteriorPelvicTilt?: boolean;
  @IsOptional() @IsBoolean() kneeValgus?: boolean;
}

// ──────────────────────────────────────────────
// HEALTH PROFILE
// ──────────────────────────────────────────────

export class UpdateHealthDto {
  @IsOptional() @IsBoolean() hasHeartCondition?: boolean;
  @IsOptional() @IsBoolean() hasDiabetes?: boolean;
  @IsOptional() @IsBoolean() hasHypertension?: boolean;
  @IsOptional() @IsBoolean() hasAsthma?: boolean;
  @IsOptional() @IsBoolean() hasOsteoporosis?: boolean;
  @IsOptional() @IsBoolean() isPregnant?: boolean;
  @IsOptional() @IsBoolean() hasBackPain?: boolean;
  @IsOptional() @IsBoolean() hasKneeIssues?: boolean;
  @IsOptional() @IsBoolean() hasShoulderIssues?: boolean;
  @IsOptional() @IsString() medicalNotes?: string;
  // injuries is stripped server-side — not accepted here
}

export class AddInjuryDto {
  @IsString() bodyPart!: string;
  @IsOptional() @IsString() injuryType?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateInjuryDto {
  @IsOptional() @IsString() bodyPart?: string;
  @IsOptional() @IsString() injuryType?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() recoveredAt?: string;
}

// ──────────────────────────────────────────────
// NUTRITION PROFILE
// ──────────────────────────────────────────────

enum CookingSkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

enum BudgetLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
}

export class UpdateNutritionDto {
  @IsOptional() @IsBoolean() isHalal?: boolean;
  @IsOptional() @IsBoolean() isVegetarian?: boolean;
  @IsOptional() @IsBoolean() isVegan?: boolean;
  @IsOptional() @IsEnum(CookingSkillLevel) cookingSkillLevel?: CookingSkillLevel;
  @IsOptional() @IsInt() @Min(10) @Max(120) maxCookingTimeMin?: number;
  @IsOptional() @IsEnum(BudgetLevel) budgetLevel?: BudgetLevel;
  @IsOptional() @IsInt() @Min(1) @Max(8) mealsPerDay?: number;
  @IsOptional() @IsBoolean() preferLocalEgyptianFood?: boolean;
  @IsOptional() @IsInt() @Min(500) @Max(10000) dailyCalorieTarget?: number;
  @IsOptional() @IsInt() @Min(0) @Max(500) dailyProteinTargetG?: number;
}

// ──────────────────────────────────────────────
// LIFESTYLE PROFILE
// ──────────────────────────────────────────────

enum WorkType {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

enum SleepQuality {
  POOR = 'POOR',
  FAIR = 'FAIR',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
}

enum StressLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export class UpdateLifestyleDto {
  @IsOptional() @IsEnum(WorkType) workType?: WorkType;
  @IsOptional() @IsNumber() @Min(3) @Max(12) averageSleepHours?: number;
  @IsOptional() @IsEnum(SleepQuality) sleepQuality?: SleepQuality;
  @IsOptional() @IsEnum(StressLevel) currentStressLevel?: StressLevel;
  @IsOptional() @IsInt() @Min(1) @Max(7) targetWorkoutsPerWeek?: number;
  @IsOptional() @IsInt() @Min(15) @Max(240) maxWorkoutMinutes?: number;
  @IsOptional() @IsString() preferredWorkoutTime?: string;
}

// ──────────────────────────────────────────────
// BODY COMPOSITION
// ──────────────────────────────────────────────

export class UpdateBodyDto {
  @IsOptional() @IsNumber() @Min(20) @Max(300) currentWeightKg?: number;
  @IsOptional() @IsNumber() @Min(100) @Max(250) heightCm?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(70) bodyFatPercent?: number;
  @IsOptional() @IsNumber() @Min(30) @Max(200) waistCm?: number;
  @IsOptional() @IsNumber() @Min(50) @Max(200) hipsGlutesCm?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(100) chestCm?: number;
  @IsOptional() @IsNumber() @Min(15) @Max(80) armCm?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(100) thighCm?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(100) calfCm?: number;
  @IsOptional() @IsNumber() @Min(30) @Max(300) targetWeightKg?: number;
}

// ──────────────────────────────────────────────
// DAILY READINESS
// ──────────────────────────────────────────────

export class LogReadinessDto {
  @IsOptional() @IsInt() @Min(1) @Max(10) overallReadiness?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) energyLevel?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) motivationLevel?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) moodLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10) sorenessLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10) painIntensity?: number;
  @IsOptional() @IsBoolean() feelingIll?: boolean;
  @IsOptional() @IsString() notes?: string;
}

// ──────────────────────────────────────────────
// WORKOUT FEEDBACK
// ──────────────────────────────────────────────

export class LogWorkoutFeedbackDto {
  @IsOptional() @IsInt() @Min(1) @Max(10) difficultyRating?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) enjoymentRating?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) energyAfterRating?: number;
  @IsOptional() @IsBoolean() completedAllSets?: boolean;
  @IsOptional() @IsString() notes?: string;
}

// ──────────────────────────────────────────────
// MUSCLE RECOVERY
// ──────────────────────────────────────────────

export class UpdateMuscleRecoveryDto {
  @IsInt() @Min(0) @Max(100) sets!: number;
  @IsInt() @Min(1) @Max(10) rpe!: number;
}

// ──────────────────────────────────────────────
// TRAINING HISTORY
// ──────────────────────────────────────────────

enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ELITE = 'ELITE',
}

enum TrainingStyle {
  TRADITIONAL = 'TRADITIONAL',
  CIRCUIT = 'CIRCUIT',
  HIIT = 'HIIT',
  CALISTHENICS = 'CALISTHENICS',
  POWERLIFTING = 'POWERLIFTING',
  CROSSFIT = 'CROSSFIT',
}

enum SplitType {
  FULL_BODY = 'FULL_BODY',
  UPPER_LOWER = 'UPPER_LOWER',
  PUSH_PULL_LEGS = 'PUSH_PULL_LEGS',
  BRO_SPLIT = 'BRO_SPLIT',
  OTHER = 'OTHER',
}

export class UpdateTrainingHistoryDto {
  @IsOptional() @IsNumber() @Min(0) @Max(60) totalYearsTraining?: number;
  @IsOptional() @IsEnum(FitnessLevel) currentLevel?: FitnessLevel;
  @IsOptional() @IsEnum(TrainingStyle) preferredTrainingStyle?: TrainingStyle;
  @IsOptional() @IsEnum(SplitType) preferredSplitType?: SplitType;
  @IsOptional() @IsInt() @Min(0) consistencyScore?: number;
}

// ──────────────────────────────────────────────
// GOALS PROFILE
// ──────────────────────────────────────────────

export class UpdateGoalsDto {
  @IsOptional() @IsString() primaryGoal?: string;
  @IsOptional() @IsString() secondaryGoal?: string;
  @IsOptional() @IsNumber() @Min(20) @Max(300) targetWeightKg?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(70) targetBodyFatPercent?: number;
  @IsOptional() @IsString() targetDate?: string;
  @IsOptional() @IsString() motivation?: string;
  @IsOptional() @IsInt() @Min(1) @Max(10) commitmentLevel?: number;
}

// ──────────────────────────────────────────────
// FASTING PROFILE
// ──────────────────────────────────────────────

export class UpdateFastingDto {
  @IsOptional() @IsBoolean() doesIntermittentFasting?: boolean;
  @IsOptional() @IsString() fastingSchedule?: string;
  @IsOptional() @IsBoolean() observesRamadan?: boolean;
  @IsOptional() @IsBoolean() ramadanActive?: boolean;
  @IsOptional() @IsString() iftarTime?: string;
  @IsOptional() @IsString() suhoorTime?: string;
}
