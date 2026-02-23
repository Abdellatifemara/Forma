import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MuscleGroup,
  EquipmentType,
  DifficultyLevel,
  ExerciseCategory,
  FitnessGoal,
} from '@prisma/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/** Structured injury data from UserInjury table */
export interface InjuryData {
  bodyPart: string;
  side?: string;
  injuryType: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'RECOVERING' | 'FULLY_HEALED';
  painLevel: number;
  painTriggers: string[];
  avoidMovements: string[];
  isCurrentlyActive: boolean;
}

/** Supplement stack from UserNutritionProfile */
export interface SupplementStack {
  takesCreatine: boolean;
  takesPreWorkout: boolean;
  takesProteinPowder: boolean;
  takesBetaAlanine: boolean;
  takesOmega3: boolean;
  takesMultivitamin: boolean;
}

/** Readiness calculation result */
export interface ReadinessResult {
  score: number;       // 0-100
  color: 'green' | 'yellow-green' | 'yellow' | 'orange' | 'red';
  volumeModifier: number;
  rpeModifier: number;
  message: string;
  messageAr: string;
}

/** Supplement modifiers calculated from stack */
export interface SupplementModifiers {
  volumeModifier: number;
  intensityModifier: number;  // RPE adjustment
  recoveryModifier: number;
  notes: string;
}

/** Injury restrictions calculated from all active injuries */
export interface InjuryRestrictions {
  avoidMuscles: string[];        // SEVERE: completely remove
  reduceMuscles: string[];       // MODERATE: reduce volume
  modifyMuscles: string[];       // MILD: modify exercises
  avoidExerciseNames: string[];  // from avoidMovements
  volumeModifier: number;        // overall volume adjustment
  rehabExercises: RehabExercise[];
  modificationNotes: Map<string, string>; // muscleGroup -> note
}

/** Rehab exercise for the Recovery Corner */
export interface RehabExercise {
  name: string;
  nameAr: string;
  sets: number;
  reps: string;
  targetArea: string;
  notes: string;
  notesAr: string;
}

/** User profile data collected from multiple DB tables */
export interface UserProfile {
  userId: string;
  // Basic
  age: number;
  gender: 'MALE' | 'FEMALE';
  weightKg: number;
  heightCm: number;
  // Body composition
  bodyFatPercent?: number;
  bodyType?: 'ECTOMORPH' | 'MESOMORPH' | 'ENDOMORPH' | 'ECTO_MESO' | 'MESO_ENDO';
  bmi?: number;
  waistToHipRatio?: number;
  // Training
  experienceLevel: ExperienceLevel;
  fitnessGoal: GoalType;
  // Health — legacy string array kept for backward compat
  injuries: string[];
  healthConditions: HealthCondition[];
  // NEW: Structured injury data from UserInjury table
  injuryData: InjuryData[];
  // Equipment
  availableEquipment: string[];
  // Preferences
  preferredSplit?: string;
  preferredTrainingStyle?: string;
  // Fitness tests
  pushUpMax?: number;
  plankHoldSeconds?: number;
  pullUpMax?: number;
  restingHeartRate?: number;
  // PRs
  prBenchKg?: number;
  prSquatKg?: number;
  prDeadliftKg?: number;
  // Ramadan / Fasting
  ramadanMode?: boolean;
  ramadanWorkoutTiming?: string;
  // NEW: Supplement stack
  supplements: SupplementStack;
  // NEW: Lifestyle data for readiness
  sleepHours?: number;
  sleepQuality?: string;
  stressLevel?: string;
  // NEW: Workout history stats
  workoutLogCount: number;
  daysSinceLastWorkout: number;
  // NEW: Bilateral measurements for imbalance detection (InBody / tape)
  leftBicepCm?: number;
  rightBicepCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  leanMassKg?: number;
}

/** Session-specific inputs from the user */
export interface SessionInput {
  location: LocationType;
  availableMinutes: DurationType;
  energyLevel: EnergyLevel;
  dayOfWeek: number; // 1=Mon, 7=Sun
  recentMusclesWorked: string[]; // muscles hit in last 48h
  weekNumber?: number; // for periodization (1-4 typically)
  targetSplit?: string; // Override: e.g. 'CHEST', 'PUSH', 'UPPER' from chat flow
  maxExercises?: number; // Override: specific exercise count from chat flow
}

/** The complete generated workout output */
export interface GeneratedWorkout {
  type: 'quick_workout' | 'full_workout' | 'rest' | 'active_recovery';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationMinutes: number;
  format: WorkoutFormat;
  targetMuscles: string[];
  warmup: WarmupBlock;
  workingSets: ExerciseBlock[];
  cooldown: CooldownBlock;
  // NEW: Recovery Corner — rehab exercises for injured users
  rehabBlock?: { exercises: RehabExercise[] };
  progressionNotes: string;
  progressionNotesAr: string;
  splitType: string;
  periodizationPhase: string;
  estimatedCalories: number;
  reason: string;
  reasonAr: string;
  // NEW: Readiness score from energy/sleep/recovery data
  readinessScore?: number;
  readinessColor?: string;
  readinessMessage?: string;
  readinessMessageAr?: string;
  // NEW: Supplement notes
  supplementNotes?: string;
  supplementNotesAr?: string;
  // NEW: Active modifiers summary
  modifiers?: {
    bodyType?: string;
    readiness?: string;
    supplements?: string;
    ramadan?: boolean;
    injuries?: string[];
    effectiveLevel?: string;
    ageCategory?: string;
    bmiCategory?: string;
    imbalances?: { muscle: string; weakSide: string; diffPercent: number }[];
  };
}

export interface WarmupBlock {
  durationMinutes: number;
  exercises: WarmupExercise[];
}

export interface WarmupExercise {
  name: string;
  nameAr: string;
  duration: string; // "30 sec" or "10 reps"
  notes?: string;
}

export interface ExerciseBlock {
  exerciseId?: string; // DB exercise ID if available
  name: string;
  nameAr?: string;
  category: 'compound' | 'isolation' | 'accessory' | 'finisher';
  sets: number;
  reps: string; // "5" or "8-12" or "AMRAP" or "30 sec"
  restSeconds: number;
  tempo?: string; // "3-1-2-0" format
  rpeTarget?: number; // 1-10
  notes?: string;
  notesAr?: string;
  supersetWith?: string; // name of paired exercise
  muscleGroup: string;
  equipment: string[];
  // NEW: Injury-specific modification note
  modificationNote?: string;
  modificationNoteAr?: string;
}

export interface CooldownBlock {
  durationMinutes: number;
  exercises: WarmupExercise[];
}

export type ExperienceLevel = 'COMPLETE_BEGINNER' | 'BEGINNER' | 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type GoalType = 'BUILD_MUSCLE' | 'LOSE_WEIGHT' | 'MAINTAIN' | 'IMPROVE_HEALTH' | 'INCREASE_STRENGTH' | 'IMPROVE_ENDURANCE';
export type LocationType = 'gym' | 'home' | 'home_gym' | 'outdoor' | 'hotel';
export type DurationType = 10 | 15 | 20 | 30 | 45 | 60 | 75 | 90;
export type EnergyLevel = 'low' | 'medium' | 'high';
export type WorkoutFormat = 'EMOM' | 'TABATA' | 'CIRCUIT' | 'SUPERSET' | 'STRAIGHT_SETS' | 'CLUSTER' | 'REST_PAUSE' | 'TRADITIONAL';
export type HealthCondition = 'heart' | 'high_bp' | 'low_bp' | 'diabetes_1' | 'diabetes_2' | 'asthma' | 'arthritis' | 'osteoporosis' | 'hernia' | 'pregnancy';

// ============================================================================
// RESEARCH-BASED CONSTANTS & LOOKUP TABLES
// ============================================================================

/**
 * Sets per muscle group per WEEK by goal (research: 10-20 optimal for hypertrophy,
 * strength lower volume higher intensity, endurance higher reps lower sets)
 */
const WEEKLY_VOLUME_BY_GOAL: Record<GoalType, { min: number; max: number }> = {
  BUILD_MUSCLE:      { min: 12, max: 20 },  // Meta-analysis: 10-20 sets/muscle/week
  LOSE_WEIGHT:       { min: 8,  max: 15 },  // Maintain muscle in deficit
  MAINTAIN:          { min: 6,  max: 12 },  // Minimum effective dose
  IMPROVE_HEALTH:    { min: 6,  max: 10 },  // WHO: 2+ days muscle strengthening
  INCREASE_STRENGTH: { min: 8,  max: 15 },  // Lower reps, moderate sets
  IMPROVE_ENDURANCE: { min: 8,  max: 14 },  // Higher reps, moderate sets
};

/** Rep ranges by goal (NSCA/ACSM guidelines) */
const REP_RANGES_BY_GOAL: Record<GoalType, { compound: string; isolation: string; rpeTarget: number }> = {
  BUILD_MUSCLE:      { compound: '6-12',  isolation: '10-15', rpeTarget: 8 },
  LOSE_WEIGHT:       { compound: '10-15', isolation: '12-20', rpeTarget: 7 },
  MAINTAIN:          { compound: '8-12',  isolation: '10-15', rpeTarget: 7 },
  IMPROVE_HEALTH:    { compound: '10-15', isolation: '12-15', rpeTarget: 6 },
  INCREASE_STRENGTH: { compound: '3-6',   isolation: '6-10',  rpeTarget: 9 },
  IMPROVE_ENDURANCE: { compound: '15-25', isolation: '15-25', rpeTarget: 6 },
};

/** Rest periods in seconds by goal (research-based) */
const REST_BY_GOAL: Record<GoalType, { compound: number; isolation: number }> = {
  BUILD_MUSCLE:      { compound: 90,  isolation: 60 },   // 60-90s hypertrophy
  LOSE_WEIGHT:       { compound: 45,  isolation: 30 },   // Short rest, higher HR
  MAINTAIN:          { compound: 75,  isolation: 60 },
  IMPROVE_HEALTH:    { compound: 75,  isolation: 60 },
  INCREASE_STRENGTH: { compound: 180, isolation: 90 },   // 2-5min for strength
  IMPROVE_ENDURANCE: { compound: 30,  isolation: 20 },   // 20-60s endurance
};

/** Sets per exercise by experience (NSCA guidelines) */
const SETS_BY_EXPERIENCE: Record<ExperienceLevel, { compound: number; isolation: number }> = {
  COMPLETE_BEGINNER: { compound: 2, isolation: 2 },
  BEGINNER:          { compound: 3, isolation: 2 },
  NOVICE:            { compound: 3, isolation: 3 },
  INTERMEDIATE:      { compound: 4, isolation: 3 },
  ADVANCED:          { compound: 4, isolation: 4 },
  EXPERT:            { compound: 5, isolation: 4 },
};

/** Best split by experience level and available days */
const SPLIT_RECOMMENDATION: Record<ExperienceLevel, string[]> = {
  COMPLETE_BEGINNER: ['FULL_BODY'],                               // Full body 2-3x/week
  BEGINNER:          ['FULL_BODY'],                               // Full body 3x/week
  NOVICE:            ['FULL_BODY', 'UPPER_LOWER'],               // Transition period
  INTERMEDIATE:      ['UPPER_LOWER', 'PPL'],                      // 4-6 days
  ADVANCED:          ['PPL', 'ARNOLD_SPLIT', 'BRO_SPLIT'],       // 5-6 days
  EXPERT:            ['PPL', 'ARNOLD_SPLIT', 'SPECIALIZED'],     // 6 days
};

/**
 * Duration-based workout structure (from query.md + research)
 * Each duration has fundamentally different philosophy
 */
const DURATION_CONFIG: Record<DurationType, {
  warmupMinutes: number;
  cooldownMinutes: number;
  workingMinutes: number;
  maxExercises: number;
  format: WorkoutFormat[];
  philosophy: string;
}> = {
  10: {
    warmupMinutes: 0,    // First set IS the warmup (lighter)
    cooldownMinutes: 0,
    workingMinutes: 10,
    maxExercises: 2,
    format: ['EMOM', 'TABATA'],
    philosophy: 'metabolic_conditioning',
  },
  15: {
    warmupMinutes: 1,
    cooldownMinutes: 0,
    workingMinutes: 14,
    maxExercises: 4,
    format: ['CIRCUIT'],
    philosophy: 'circuit_conditioning',
  },
  20: {
    warmupMinutes: 2,
    cooldownMinutes: 0,
    workingMinutes: 18,
    maxExercises: 5,
    format: ['SUPERSET'],
    philosophy: 'mini_split',
  },
  30: {
    warmupMinutes: 3,
    cooldownMinutes: 0,
    workingMinutes: 27,
    maxExercises: 6,
    format: ['SUPERSET', 'STRAIGHT_SETS'],
    philosophy: 'focused_split',
  },
  45: {
    warmupMinutes: 5,
    cooldownMinutes: 3,
    workingMinutes: 37,
    maxExercises: 8,
    format: ['STRAIGHT_SETS', 'SUPERSET'],
    philosophy: 'full_session',
  },
  60: {
    warmupMinutes: 7,
    cooldownMinutes: 5,
    workingMinutes: 48,
    maxExercises: 9,
    format: ['TRADITIONAL', 'STRAIGHT_SETS'],
    philosophy: 'gold_standard',
  },
  75: {
    warmupMinutes: 8,
    cooldownMinutes: 5,
    workingMinutes: 62,
    maxExercises: 10,
    format: ['TRADITIONAL', 'REST_PAUSE'],
    philosophy: 'advanced_volume',
  },
  90: {
    warmupMinutes: 10,
    cooldownMinutes: 8,
    workingMinutes: 72,
    maxExercises: 12,
    format: ['TRADITIONAL', 'REST_PAUSE', 'CLUSTER'],
    philosophy: 'elite_volume',
  },
};

/** Tempo prescriptions by goal (eccentric-pause-concentric-pause) */
const TEMPO_BY_GOAL: Record<GoalType, string> = {
  BUILD_MUSCLE:      '3-1-2-0',   // Slow eccentric for hypertrophy
  LOSE_WEIGHT:       '2-0-1-0',   // Faster for metabolic effect
  MAINTAIN:          '2-1-1-0',
  IMPROVE_HEALTH:    '2-1-2-0',   // Controlled for safety
  INCREASE_STRENGTH: '2-1-1-0',   // Controlled but not slow
  IMPROVE_ENDURANCE: '1-0-1-0',   // Fast reps, high volume
};

/** Body type adjustments */
const BODY_TYPE_ADJUSTMENTS: Record<string, {
  volumeModifier: number;    // multiply weekly volume
  restModifier: number;      // multiply rest periods
  cardioMinutes: number;     // extra cardio per session
  repRangeShift: number;     // + or - to rep range
  notes: string;
}> = {
  ECTOMORPH:  { volumeModifier: 0.8, restModifier: 1.2, cardioMinutes: 0,  repRangeShift: -2, notes: 'Focus on compound movements, minimize cardio, caloric surplus essential' },
  ECTO_MESO: { volumeModifier: 0.9, restModifier: 1.1, cardioMinutes: 5,  repRangeShift: -1, notes: 'Moderate volume, balanced approach' },
  MESOMORPH:  { volumeModifier: 1.0, restModifier: 1.0, cardioMinutes: 10, repRangeShift: 0,  notes: 'Responds well to variety, mix strength and hypertrophy' },
  MESO_ENDO: { volumeModifier: 1.1, restModifier: 0.9, cardioMinutes: 12, repRangeShift: 1,  notes: 'Higher volume, shorter rest, include metabolic finishers' },
  ENDOMORPH:  { volumeModifier: 1.2, restModifier: 0.8, cardioMinutes: 15, repRangeShift: 2,  notes: 'Higher reps, shorter rest, HIIT finishers, compound focus for calorie burn' },
};

/** Energy level adjustments */
const ENERGY_ADJUSTMENTS: Record<EnergyLevel, {
  volumeModifier: number;
  intensityModifier: number; // RPE adjustment
  restModifier: number;
  maxExerciseModifier: number;
}> = {
  low:    { volumeModifier: 0.7, intensityModifier: -2, restModifier: 1.3, maxExerciseModifier: 0.7 },
  medium: { volumeModifier: 1.0, intensityModifier: 0,  restModifier: 1.0, maxExerciseModifier: 1.0 },
  high:   { volumeModifier: 1.15, intensityModifier: 1,  restModifier: 0.85, maxExerciseModifier: 1.15 },
};

/** Location-based equipment availability */
const EQUIPMENT_BY_LOCATION: Record<LocationType, EquipmentType[]> = {
  gym: [
    'BARBELL', 'DUMBBELLS', 'CABLES', 'MACHINES', 'BENCH', 'PULL_UP_BAR',
    'KETTLEBELL', 'RESISTANCE_BANDS', 'TRX', 'STABILITY_BALL', 'FOAM_ROLLER',
    'TREADMILL', 'BIKE', 'ROWING', 'PLYO_BOX', 'BATTLE_ROPES',
  ] as EquipmentType[],
  home: [
    'BODYWEIGHT', 'NONE',
  ] as EquipmentType[],
  home_gym: [
    'BODYWEIGHT', 'DUMBBELLS', 'RESISTANCE_BANDS', 'BENCH', 'PULL_UP_BAR', 'KETTLEBELL',
  ] as EquipmentType[],
  outdoor: [
    'BODYWEIGHT', 'NONE', 'PULL_UP_BAR',
  ] as EquipmentType[],
  hotel: [
    'BODYWEIGHT', 'NONE',
  ] as EquipmentType[],
};

/**
 * Muscle group split definitions — what muscles to train together
 * Based on: PPL, Upper/Lower, Full Body, Arnold, Bro Split research
 */
const SPLIT_DEFINITIONS: Record<string, string[][]> = {
  // Full body: every session hits everything (beginners, 3x/week)
  FULL_BODY: [
    ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS', 'HAMSTRINGS', 'ABS'],
  ],
  // Upper/Lower: 4 day split (intermediates)
  UPPER_LOWER: [
    ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'],
    ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS'],
  ],
  // PPL: 6 day split (intermediate to advanced)
  PPL: [
    ['CHEST', 'SHOULDERS', 'TRICEPS'],
    ['BACK', 'BICEPS'],
    ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
  ],
  // Arnold: 6 day split (advanced)
  ARNOLD_SPLIT: [
    ['CHEST', 'BACK'],
    ['SHOULDERS', 'BICEPS', 'TRICEPS'],
    ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
  ],
  // Bro Split: 5 day (advanced bodybuilding)
  BRO_SPLIT: [
    ['CHEST'],
    ['BACK'],
    ['SHOULDERS'],
    ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
    ['BICEPS', 'TRICEPS'],
  ],
};

/** Direct muscle targeting from chat split selection */
const CHAT_SPLIT_TO_MUSCLES: Record<string, string[]> = {
  CHEST:     ['CHEST', 'TRICEPS'],
  BACK:      ['BACK', 'BICEPS'],
  SHOULDERS: ['SHOULDERS', 'TRICEPS'],
  ARMS:      ['BICEPS', 'TRICEPS', 'FOREARMS'],
  PUSH:      ['CHEST', 'SHOULDERS', 'TRICEPS'],
  PULL:      ['BACK', 'BICEPS'],
  LEGS:      ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
  UPPER:     ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'],
  LOWER:     ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
  FULL:      ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS', 'HAMSTRINGS', 'ABS'],
  CORE:      ['ABS'],
};

/** Injury → muscles to avoid mapping (comprehensive) */
const INJURY_MUSCLE_MAP: Record<string, string[]> = {
  NECK:          ['SHOULDERS'],
  SHOULDER:      ['SHOULDERS', 'CHEST'],
  ROTATOR_CUFF:  ['SHOULDERS', 'CHEST'],
  ELBOW:         ['BICEPS', 'TRICEPS', 'FOREARMS'],
  WRIST:         ['BICEPS', 'TRICEPS', 'FOREARMS', 'CHEST'],
  HAND:          ['BICEPS', 'TRICEPS', 'FOREARMS'],
  UPPER_BACK:    ['BACK', 'SHOULDERS'],
  LOWER_BACK:    ['BACK', 'HAMSTRINGS', 'GLUTES'],
  SPINE_DISC:    ['BACK', 'HAMSTRINGS', 'ABS'],
  HIP:           ['GLUTES', 'QUADRICEPS', 'HAMSTRINGS'],
  GROIN:         ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'],
  KNEE:          ['QUADRICEPS', 'HAMSTRINGS', 'CALVES'],
  ACL:           ['QUADRICEPS', 'HAMSTRINGS', 'CALVES'],
  MCL:           ['QUADRICEPS', 'HAMSTRINGS'],
  MENISCUS:      ['QUADRICEPS', 'HAMSTRINGS', 'CALVES'],
  ANKLE:         ['CALVES', 'QUADRICEPS'],
  ACHILLES:      ['CALVES'],
  FOOT:          ['CALVES'],
};

/** Health condition → exercise restrictions */
const HEALTH_RESTRICTIONS: Record<HealthCondition, {
  avoidCategories: ExerciseCategory[];
  maxRPE: number;
  avoidValsalva: boolean;
  maxHeartRatePercent: number;
  notes: string;
}> = {
  heart:      { avoidCategories: ['PLYOMETRIC', 'CROSSFIT'], maxRPE: 7, avoidValsalva: true,  maxHeartRatePercent: 70, notes: 'No heavy isometrics, avoid breath holding' },
  high_bp:    { avoidCategories: ['PLYOMETRIC'],              maxRPE: 7, avoidValsalva: true,  maxHeartRatePercent: 75, notes: 'Lighter loads 30-40% upper, 50-60% lower 1RM. Breathe continuously' },
  low_bp:     { avoidCategories: [],                          maxRPE: 8, avoidValsalva: false, maxHeartRatePercent: 85, notes: 'Avoid rapid position changes, stay hydrated' },
  diabetes_1: { avoidCategories: [],                          maxRPE: 8, avoidValsalva: false, maxHeartRatePercent: 85, notes: 'Do resistance before cardio to avoid hypoglycemia. Monitor blood sugar' },
  diabetes_2: { avoidCategories: [],                          maxRPE: 8, avoidValsalva: false, maxHeartRatePercent: 85, notes: 'Resistance training improves insulin sensitivity. Monitor blood sugar' },
  asthma:     { avoidCategories: [],                          maxRPE: 7, avoidValsalva: false, maxHeartRatePercent: 80, notes: 'Keep inhaler nearby, warm up thoroughly, avoid cold air' },
  arthritis:  { avoidCategories: ['PLYOMETRIC'],              maxRPE: 7, avoidValsalva: false, maxHeartRatePercent: 80, notes: 'Low-impact exercises, full ROM when pain-free, avoid joint stress' },
  osteoporosis: { avoidCategories: ['PLYOMETRIC'],            maxRPE: 7, avoidValsalva: false, maxHeartRatePercent: 80, notes: 'Weight-bearing exercises good but avoid spinal flexion under load' },
  hernia:     { avoidCategories: ['OLYMPIC'],                 maxRPE: 6, avoidValsalva: true,  maxHeartRatePercent: 75, notes: 'Avoid heavy intra-abdominal pressure, no heavy deadlifts/squats' },
  pregnancy:  { avoidCategories: ['PLYOMETRIC', 'OLYMPIC', 'CROSSFIT'], maxRPE: 6, avoidValsalva: true, maxHeartRatePercent: 70, notes: 'No supine exercises after T1, no heavy loads, stay cool/hydrated' },
};

/** Ramadan training adjustments (research-based) */
const RAMADAN_ADJUSTMENTS = {
  volumeModifier: 0.75,      // Reduce volume by 25%
  intensityModifier: -1,     // Lower RPE targets by 1
  restModifier: 1.25,        // 25% longer rest
  maxDuration: 45,           // Cap at 45 min
  preferredTiming: 'after_iftar', // 1-2 hours after iftar is optimal
  notes: 'Hydrate well between iftar and suhoor. Protein within 30 min post-workout.',
  notesAr: 'اشرب كتير بين الإفطار والسحور. بروتين خلال 30 دقيقة بعد التمرين.',
};

/** Fitness test → experience level mapping (ACSM norms) */
const FITNESS_TEST_THRESHOLDS = {
  pushups: {
    male:   { poor: 15, belowAvg: 20, average: 25, good: 35, excellent: 45 },
    female: { poor: 5,  belowAvg: 10, average: 15, good: 25, excellent: 35 },
  },
  plankSeconds: {
    male:   { poor: 20, belowAvg: 40, average: 60,  good: 90,  excellent: 120 },
    female: { poor: 15, belowAvg: 30, average: 50,  good: 75,  excellent: 100 },
  },
  restingHR: {
    // Lower is better
    male:   { excellent: 55, good: 62, average: 70, belowAvg: 78, poor: 85 },
    female: { excellent: 58, good: 65, average: 73, belowAvg: 80, poor: 88 },
  },
};

/** Supplement stack → capacity modifiers (ISSN position stand) */
const SUPPLEMENT_CAPACITY_MATRIX: Record<string, { volume: number; intensity: number; recovery: number }> = {
  // key = sorted supplement flags joined by '+'
  'none':                          { volume: 1.0,  intensity: 0,  recovery: 1.0 },
  'creatine':                      { volume: 1.10, intensity: 0,  recovery: 1.05 },
  'preworkout':                    { volume: 1.0,  intensity: 1,  recovery: 1.0 },
  'creatine+preworkout':           { volume: 1.10, intensity: 1,  recovery: 1.05 },
  'betaalanine':                   { volume: 1.05, intensity: 0,  recovery: 1.0 },
  'creatine+betaalanine':          { volume: 1.12, intensity: 0,  recovery: 1.05 },
  'creatine+betaalanine+preworkout': { volume: 1.15, intensity: 1,  recovery: 1.10 },
};

/** Injury rehab exercise library (from research file 14) */
const INJURY_REHAB_MAP: Record<string, RehabExercise[]> = {
  SHOULDER: [
    { name: 'Face Pulls', nameAr: 'سحب للوجه', sets: 3, reps: '15', targetArea: 'SHOULDER', notes: 'Light band, focus on external rotation', notesAr: 'باند خفيف، ركّز على الدوران الخارجي' },
    { name: 'External Rotation', nameAr: 'دوران خارجي', sets: 3, reps: '12 each', targetArea: 'SHOULDER', notes: 'Use light dumbbell or band', notesAr: 'دمبل خفيف أو باند' },
    { name: 'Wall Slides', nameAr: 'انزلاق على الحيطة', sets: 2, reps: '10', targetArea: 'SHOULDER', notes: 'Keep back flat against wall', notesAr: 'ظهرك على الحيطة' },
  ],
  ROTATOR_CUFF: [
    { name: 'External Rotation', nameAr: 'دوران خارجي', sets: 3, reps: '12 each', targetArea: 'SHOULDER', notes: 'Light resistance, slow tempo', notesAr: 'مقاومة خفيفة، بطيء' },
    { name: 'Internal Rotation', nameAr: 'دوران داخلي', sets: 3, reps: '12 each', targetArea: 'SHOULDER', notes: 'Use band at elbow height', notesAr: 'باند على مستوى الكوع' },
  ],
  KNEE: [
    { name: 'Terminal Knee Extension (TKE)', nameAr: 'مد الركبة الطرفي', sets: 3, reps: '15 each', targetArea: 'KNEE', notes: 'Band behind knee, extend to lockout', notesAr: 'باند ورا الركبة، افرد لآخرها' },
    { name: 'Wall Sits', nameAr: 'جلوس على الحيطة', sets: 3, reps: '20-30 sec', targetArea: 'KNEE', notes: 'Knees at 90 degrees, back against wall', notesAr: 'ركبك 90 درجة، ظهرك ع الحيطة' },
    { name: 'Straight Leg Raises', nameAr: 'رفع الرجل مفرودة', sets: 3, reps: '12 each', targetArea: 'KNEE', notes: 'Strengthen VMO quad muscle', notesAr: 'تقوية عضلة الفخذ الداخلية' },
  ],
  ACL: [
    { name: 'Quarter Squats', nameAr: 'ربع سكوات', sets: 3, reps: '12', targetArea: 'KNEE', notes: 'Shallow depth only, no deep knee bend', notesAr: 'عمق قليل فقط' },
    { name: 'Terminal Knee Extension (TKE)', nameAr: 'مد الركبة الطرفي', sets: 3, reps: '15 each', targetArea: 'KNEE', notes: 'Band behind knee', notesAr: 'باند ورا الركبة' },
    { name: 'Single Leg Balance', nameAr: 'توازن على رجل واحدة', sets: 3, reps: '30 sec each', targetArea: 'KNEE', notes: 'Proprioception training', notesAr: 'تدريب التوازن' },
  ],
  LOWER_BACK: [
    { name: 'Bird Dogs', nameAr: 'تمرين الطائر-الكلب', sets: 3, reps: '10 each side', targetArea: 'LOWER_BACK', notes: 'Anti-extension core stability', notesAr: 'ثبات الجذع' },
    { name: 'McKenzie Press-ups', nameAr: 'ضغط ماكينزي', sets: 3, reps: '10', targetArea: 'LOWER_BACK', notes: 'Relax lower back, push with arms only', notesAr: 'ريّح الظهر، ادفع بالذراعين بس' },
    { name: 'Glute Bridges', nameAr: 'بريدج للأرداف', sets: 3, reps: '12', targetArea: 'LOWER_BACK', notes: 'Activate glutes, reduce back load', notesAr: 'فعّل الأرداف' },
  ],
  SPINE_DISC: [
    { name: 'Bird Dogs', nameAr: 'تمرين الطائر-الكلب', sets: 3, reps: '10 each side', targetArea: 'LOWER_BACK', notes: 'Anti-extension core stability', notesAr: 'ثبات الجذع' },
    { name: 'Dead Bugs', nameAr: 'تمرين الحشرة الميتة', sets: 3, reps: '8 each side', targetArea: 'ABS', notes: 'Press lower back into floor', notesAr: 'اضغط ظهرك على الأرض' },
  ],
  ELBOW: [
    { name: 'Wrist Curls', nameAr: 'ثني المعصم', sets: 3, reps: '15', targetArea: 'FOREARMS', notes: 'Very light weight, high reps', notesAr: 'وزن خفيف جدا' },
    { name: 'Eccentric Wrist Extensions', nameAr: 'مد المعصم', sets: 3, reps: '12', targetArea: 'FOREARMS', notes: 'Slow lowering phase (3 sec)', notesAr: 'مرحلة النزول بطيئة 3 ثواني' },
  ],
  HIP: [
    { name: 'Clamshells', nameAr: 'تمرين الصدفة', sets: 3, reps: '15 each', targetArea: 'HIP', notes: 'Band above knees, feet together', notesAr: 'باند فوق الركب، القدمين مع بعض' },
    { name: 'Hip Circles on All Fours', nameAr: 'دوائر بالورك', sets: 2, reps: '10 each direction', targetArea: 'HIP', notes: 'Controlled movement', notesAr: 'حركة مضبوطة' },
  ],
  ANKLE: [
    { name: 'Ankle Alphabet', nameAr: 'أبجدية الكاحل', sets: 2, reps: 'Full alphabet', targetArea: 'ANKLE', notes: 'Trace letters with toe', notesAr: 'ارسم حروف بصوابعك' },
    { name: 'Calf Raises (Slow)', nameAr: 'رفع السمانة بطيء', sets: 3, reps: '15', targetArea: 'CALVES', notes: '3 sec up, 3 sec down', notesAr: '3 ثواني طلوع، 3 نزول' },
  ],
};

/** BMI-based training category */
function getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

/** Body fat % → training category */
function getBodyFatCategory(bf: number, gender: string): 'essential' | 'athletic' | 'fit' | 'acceptable' | 'overweight' | 'obese' {
  if (gender === 'MALE') {
    if (bf < 6)  return 'essential';
    if (bf < 14) return 'athletic';
    if (bf < 18) return 'fit';
    if (bf < 25) return 'acceptable';
    if (bf < 32) return 'overweight';
    return 'obese';
  } else {
    if (bf < 14) return 'essential';
    if (bf < 21) return 'athletic';
    if (bf < 25) return 'fit';
    if (bf < 32) return 'acceptable';
    if (bf < 39) return 'overweight';
    return 'obese';
  }
}

/** Age-based training adjustments (research: ACSM, NSCA senior guidelines) */
const AGE_ADJUSTMENTS: Record<string, { volumeModifier: number; maxRPE: number; avoidExplosive: boolean; notes: string; notesAr: string }> = {
  youth:    { volumeModifier: 0.8,  maxRPE: 7,  avoidExplosive: false, notes: 'Focus on technique and bodyweight mastery', notesAr: 'ركّز على التكنيك والتمارين بوزن الجسم' },
  adult:    { volumeModifier: 1.0,  maxRPE: 10, avoidExplosive: false, notes: '', notesAr: '' },
  mature:   { volumeModifier: 0.9,  maxRPE: 9,  avoidExplosive: false, notes: 'Extended warm-up recommended', notesAr: 'إحماء أطول مستحسن' },
  senior:   { volumeModifier: 0.75, maxRPE: 7,  avoidExplosive: true,  notes: 'No explosive movements, seated alternatives preferred, monitor BP', notesAr: 'بلاش حركات انفجارية، تمارين قاعد أحسن، راقب الضغط' },
  elderly:  { volumeModifier: 0.6,  maxRPE: 6,  avoidExplosive: true,  notes: 'Chair-based exercises preferred, balance work essential, no heavy loads', notesAr: 'تمارين على كرسي أفضل، تمارين توازن ضرورية، بلاش أوزان تقيلة' },
};

function getAgeCategory(age: number): keyof typeof AGE_ADJUSTMENTS {
  if (age < 16) return 'youth';
  if (age < 50) return 'adult';
  if (age < 65) return 'mature';
  if (age < 75) return 'senior';
  return 'elderly';
}

/** BMI-based exercise restrictions */
const BMI_ADJUSTMENTS: Record<string, { avoidHighImpact: boolean; preferSeated: boolean; maxRPE: number; notes: string; notesAr: string }> = {
  underweight: { avoidHighImpact: false, preferSeated: false, maxRPE: 10, notes: 'Focus on compounds and progressive overload to gain mass', notesAr: 'ركّز على التمارين المركبة وزيادة الأحمال لزيادة الوزن' },
  normal:      { avoidHighImpact: false, preferSeated: false, maxRPE: 10, notes: '', notesAr: '' },
  overweight:  { avoidHighImpact: false, preferSeated: false, maxRPE: 9,  notes: 'Combine resistance with metabolic conditioning', notesAr: 'ادمج تمارين المقاومة مع الكارديو' },
  obese:       { avoidHighImpact: true,  preferSeated: true,  maxRPE: 8,  notes: 'Low-impact exercises, seated alternatives, avoid jumping/running', notesAr: 'تمارين بدون تأثير على المفاصل، كرسي أفضل، بلاش قفز أو جري' },
};

/** Estimate daily calorie burn from workout */
function estimateCalories(durationMin: number, weightKg: number, intensity: EnergyLevel): number {
  // MET-based estimation: resistance training ≈ 3-6 METs
  const metMap: Record<EnergyLevel, number> = { low: 3, medium: 5, high: 6.5 };
  const met = metMap[intensity];
  return Math.round((met * 3.5 * weightKg / 200) * durationMin);
}

// ============================================================================
// MUSCLE GROUP ARABIC NAMES
// ============================================================================

const MUSCLE_AR: Record<string, string> = {
  CHEST: 'صدر', BACK: 'ظهر', SHOULDERS: 'أكتاف', BICEPS: 'باي',
  TRICEPS: 'تراي', FOREARMS: 'ساعد', ABS: 'بطن', OBLIQUES: 'جوانب',
  LOWER_BACK: 'أسفل الظهر', GLUTES: 'أرداف', QUADRICEPS: 'فخذ أمامي',
  HAMSTRINGS: 'فخذ خلفي', CALVES: 'سمانة', FULL_BODY: 'جسم كامل',
  CARDIO: 'كارديو',
};

// ============================================================================
// WARMUP & COOLDOWN TEMPLATES
// ============================================================================

function generateWarmup(durationMin: number, targetMuscles: string[], location: LocationType): WarmupBlock {
  if (durationMin <= 0) {
    return { durationMinutes: 0, exercises: [] };
  }

  const exercises: WarmupExercise[] = [];

  // General warmup (light cardio)
  if (durationMin >= 3) {
    if (location === 'gym') {
      exercises.push({ name: 'Light Treadmill Walk/Jog', nameAr: 'مشي/جري خفيف على السير', duration: '2 min' });
    } else {
      exercises.push({ name: 'Jumping Jacks', nameAr: 'قفز مع فتح اليدين', duration: '1 min' });
      exercises.push({ name: 'High Knees', nameAr: 'رفع الركب', duration: '30 sec' });
    }
  }

  // Dynamic stretches based on target muscles
  const hasUpper = targetMuscles.some(m => ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'].includes(m));
  const hasLower = targetMuscles.some(m => ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'].includes(m));

  if (hasUpper) {
    exercises.push({ name: 'Arm Circles', nameAr: 'دوائر بالذراعين', duration: '20 sec each direction' });
    exercises.push({ name: 'Band Pull-Aparts / Shoulder Dislocates', nameAr: 'تمديد الأكتاف', duration: '10 reps' });
  }
  if (hasLower) {
    exercises.push({ name: 'Bodyweight Squats', nameAr: 'سكوات بوزن الجسم', duration: '10 reps' });
    exercises.push({ name: 'Walking Lunges', nameAr: 'لنج مشي', duration: '8 each leg' });
    exercises.push({ name: 'Hip Circles', nameAr: 'دوائر بالورك', duration: '10 each direction' });
  }

  // Core activation
  if (durationMin >= 5) {
    exercises.push({ name: 'Dead Bug', nameAr: 'تمرين الحشرة الميتة', duration: '8 each side' });
  }

  return { durationMinutes: durationMin, exercises };
}

function generateCooldown(durationMin: number, targetMuscles: string[]): CooldownBlock {
  if (durationMin <= 0) {
    return { durationMinutes: 0, exercises: [] };
  }

  const exercises: WarmupExercise[] = [];

  const hasUpper = targetMuscles.some(m => ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'].includes(m));
  const hasLower = targetMuscles.some(m => ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'].includes(m));

  if (hasUpper) {
    exercises.push({ name: 'Chest Doorway Stretch', nameAr: 'تمدد الصدر عند الباب', duration: '30 sec each side' });
    exercises.push({ name: 'Cross-Body Shoulder Stretch', nameAr: 'تمدد الكتف المقابل', duration: '30 sec each' });
    exercises.push({ name: 'Tricep Overhead Stretch', nameAr: 'تمدد التراي فوق الرأس', duration: '30 sec each' });
  }
  if (hasLower) {
    exercises.push({ name: 'Standing Quad Stretch', nameAr: 'تمدد الفخذ واقف', duration: '30 sec each' });
    exercises.push({ name: 'Seated Hamstring Stretch', nameAr: 'تمدد الفخذ الخلفي جالس', duration: '30 sec each' });
    exercises.push({ name: 'Hip Flexor Stretch (Kneeling)', nameAr: 'تمدد عضلات الورك', duration: '30 sec each' });
  }

  // General
  exercises.push({ name: 'Cat-Cow Stretch', nameAr: 'تمدد القطة-البقرة', duration: '8 reps' });

  if (durationMin >= 5) {
    exercises.push({ name: 'Child\'s Pose', nameAr: 'وضع الطفل', duration: '30 sec' });
    exercises.push({ name: 'Deep Breathing', nameAr: 'تنفس عميق', duration: '1 min', notes: 'Inhale 4s, hold 4s, exhale 6s' });
  }

  return { durationMinutes: durationMin, exercises };
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

@Injectable()
export class WorkoutGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  // ════════════════════════════════════════════
  // NEW ALGORITHM METHODS (Plan Phase 1)
  // ════════════════════════════════════════════

  /**
   * Calculate readiness score (0-100) from energy, sleep, recovery, stress
   */
  calculateReadinessScore(profile: UserProfile, session: SessionInput): ReadinessResult {
    // Energy level component (0-90)
    const energyMap: Record<EnergyLevel, number> = { low: 30, medium: 60, high: 90 };
    const energyScore = energyMap[session.energyLevel];

    // Sleep component (0-95)
    const sleepHours = profile.sleepHours ?? 7;
    let sleepScore = 70; // default
    if (sleepHours < 5) sleepScore = 20;
    else if (sleepHours < 6) sleepScore = 40;
    else if (sleepHours < 7) sleepScore = 60;
    else if (sleepHours < 8) sleepScore = 75;
    else if (sleepHours < 9) sleepScore = 85;
    else sleepScore = 95;

    // Muscle recovery component (0-90)
    const daysSince = profile.daysSinceLastWorkout;
    let muscleRecovery = 70;
    if (daysSince === 0) muscleRecovery = 30;
    else if (daysSince === 1) muscleRecovery = 50;
    else if (daysSince === 2) muscleRecovery = 70;
    else muscleRecovery = 90;

    // Stress inverse component (0-90)
    const stressMap: Record<string, number> = { LOW: 90, MODERATE: 65, HIGH: 40, VERY_HIGH: 20 };
    const stressScore = stressMap[profile.stressLevel || 'MODERATE'] ?? 60;

    // Weighted sum
    const score = Math.round(
      energyScore * 0.25 +
      sleepScore * 0.30 +
      muscleRecovery * 0.25 +
      stressScore * 0.20
    );

    // Zone mapping
    let color: ReadinessResult['color'];
    let volumeModifier: number;
    let rpeModifier: number;
    let message: string;
    let messageAr: string;

    if (score >= 80) {
      color = 'green';
      volumeModifier = 1.1;
      rpeModifier = 1;
      message = 'Your body is fully recovered — push hard today!';
      messageAr = 'جسمك مرتاح تماماً — ادفع بقوة النهارده!';
    } else if (score >= 60) {
      color = 'yellow-green';
      volumeModifier = 1.0;
      rpeModifier = 0;
      message = 'Good recovery — follow your planned workout.';
      messageAr = 'تعافي كويس — كمّل التمرين المخطط.';
    } else if (score >= 40) {
      color = 'yellow';
      volumeModifier = 0.85;
      rpeModifier = -1;
      message = 'Moderate recovery — we\'ve reduced intensity for you.';
      messageAr = 'تعافي متوسط — خففنا الشدة عشانك.';
    } else if (score >= 20) {
      color = 'orange';
      volumeModifier = 0.6;
      rpeModifier = -2;
      message = 'Your body needs rest. Light session recommended.';
      messageAr = 'جسمك محتاج راحة. جلسة خفيفة أفضل.';
    } else {
      color = 'red';
      volumeModifier = 0;
      rpeModifier = -3;
      message = 'Full rest recommended. Recovery is when you grow.';
      messageAr = 'راحة كاملة أفضل. التعافي هو وقت النمو.';
    }

    return { score, color, volumeModifier, rpeModifier, message, messageAr };
  }

  /**
   * Calculate effective experience level — min(selfReported, fitnessTest, logBased)
   * Never expose the override to the user.
   */
  calculateEffectiveLevel(profile: UserProfile): ExperienceLevel {
    const levelOrder: ExperienceLevel[] = ['COMPLETE_BEGINNER', 'BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

    // Self-reported level
    const selfIdx = levelOrder.indexOf(profile.experienceLevel);

    // Fitness test derived level
    let testIdx = selfIdx; // default to self-reported if no tests
    const gender = profile.gender === 'MALE' ? 'male' : 'female';
    const thresholds = FITNESS_TEST_THRESHOLDS.pushups[gender];
    if (profile.pushUpMax !== undefined) {
      if (profile.pushUpMax < thresholds.poor) testIdx = Math.min(testIdx, 0); // COMPLETE_BEGINNER
      else if (profile.pushUpMax < thresholds.belowAvg) testIdx = Math.min(testIdx, 1); // BEGINNER
      else if (profile.pushUpMax < thresholds.average) testIdx = Math.min(testIdx, 2); // NOVICE
      else if (profile.pushUpMax < thresholds.good) testIdx = Math.min(testIdx, 3); // INTERMEDIATE
      else testIdx = Math.min(testIdx, 4); // ADVANCED
    }

    // Log-based level cap
    let logIdx = 5; // no cap by default
    if (profile.workoutLogCount === 0) logIdx = 1; // max BEGINNER
    else if (profile.workoutLogCount < 50) logIdx = 2; // max NOVICE
    else if (profile.workoutLogCount < 200) logIdx = 3; // max INTERMEDIATE
    // 200+ = allow anything

    const effectiveIdx = Math.min(selfIdx, testIdx, logIdx);
    return levelOrder[Math.max(0, effectiveIdx)];
  }

  /**
   * Calculate supplement stack modifiers
   */
  getSupplementModifiers(stack: SupplementStack, healthConditions: HealthCondition[]): SupplementModifiers {
    // Build key from active supplements
    const parts: string[] = [];
    if (stack.takesCreatine) parts.push('creatine');
    if (stack.takesBetaAlanine) parts.push('betaalanine');
    if (stack.takesPreWorkout) parts.push('preworkout');

    const key = parts.length > 0 ? parts.sort().join('+') : 'none';
    const matrix = SUPPLEMENT_CAPACITY_MATRIX[key] || SUPPLEMENT_CAPACITY_MATRIX['none'];

    let volume = matrix.volume;
    let intensity = matrix.intensity;
    let recovery = matrix.recovery;
    const notes: string[] = [];

    // Health conditions override supplements
    const hasHypertension = healthConditions.includes('high_bp');
    const hasHeart = healthConditions.includes('heart');

    if ((hasHypertension || hasHeart) && stack.takesPreWorkout) {
      intensity = 0; // Zero out pre-workout RPE boost
      notes.push('Pre-workout intensity boost disabled (blood pressure safety)');
    }

    // Cap maximums
    volume = Math.min(volume, 1.20);
    intensity = Math.min(intensity, 1);
    recovery = Math.min(recovery, 1.15);

    if (stack.takesCreatine) notes.push('Creatine: +volume capacity');
    if (stack.takesPreWorkout && intensity > 0) notes.push('Pre-workout: +1 RPE push');
    if (stack.takesBetaAlanine) notes.push('Beta-alanine: endurance buffer');

    return {
      volumeModifier: volume,
      intensityModifier: intensity,
      recoveryModifier: recovery,
      notes: notes.join('. '),
    };
  }

  /**
   * Calculate injury restrictions from structured injury data
   */
  getInjuryRestrictions(injuries: InjuryData[]): InjuryRestrictions {
    const avoidMuscles = new Set<string>();
    const reduceMuscles = new Set<string>();
    const modifyMuscles = new Set<string>();
    const avoidExerciseNames = new Set<string>();
    const rehabExercises: RehabExercise[] = [];
    const modificationNotes = new Map<string, string>();
    let volumeModifier = 1.0;

    for (const injury of injuries) {
      if (!injury.isCurrentlyActive) continue;

      const affectedMuscles = INJURY_MUSCLE_MAP[injury.bodyPart.toUpperCase()] || [];

      // Severity-based handling
      switch (injury.severity) {
        case 'SEVERE':
          affectedMuscles.forEach(m => avoidMuscles.add(m));
          volumeModifier = Math.min(volumeModifier, 0.5);
          break;
        case 'MODERATE':
          affectedMuscles.forEach(m => reduceMuscles.add(m));
          volumeModifier = Math.min(volumeModifier, 0.75);
          for (const m of affectedMuscles) {
            modificationNotes.set(m, `Modified for ${injury.bodyPart.toLowerCase()} injury — use reduced ROM, lighter load`);
          }
          break;
        case 'MILD':
        case 'RECOVERING':
          affectedMuscles.forEach(m => modifyMuscles.add(m));
          volumeModifier = Math.min(volumeModifier, 0.9);
          for (const m of affectedMuscles) {
            modificationNotes.set(m, `Mild ${injury.bodyPart.toLowerCase()} issue — watch form, neutral grip preferred`);
          }
          break;
      }

      // Collect user's avoidMovements
      for (const mov of (injury.avoidMovements || [])) {
        avoidExerciseNames.add(mov.toLowerCase());
      }

      // Add rehab exercises for this injury type
      const rehabKey = injury.bodyPart.toUpperCase();
      const rehabs = INJURY_REHAB_MAP[rehabKey];
      if (rehabs && !rehabExercises.some(r => r.targetArea === rehabKey)) {
        // Add max 3 rehab exercises per injury area
        rehabExercises.push(...rehabs.slice(0, 3));
      }
    }

    // Remove avoidMuscles from reduce/modify (avoid takes priority)
    avoidMuscles.forEach(m => { reduceMuscles.delete(m); modifyMuscles.delete(m); });

    return {
      avoidMuscles: Array.from(avoidMuscles),
      reduceMuscles: Array.from(reduceMuscles),
      modifyMuscles: Array.from(modifyMuscles),
      avoidExerciseNames: Array.from(avoidExerciseNames),
      volumeModifier,
      rehabExercises,
      modificationNotes,
    };
  }

  /**
   * Detect bilateral muscle imbalances from body measurements (InBody / tape)
   * Returns muscle groups that need extra unilateral work
   */
  detectImbalances(profile: UserProfile): { muscle: string; weakSide: 'left' | 'right'; diffPercent: number }[] {
    const imbalances: { muscle: string; weakSide: 'left' | 'right'; diffPercent: number }[] = [];
    const threshold = 5; // 5% difference = significant imbalance

    // Bicep imbalance
    if (profile.leftBicepCm && profile.rightBicepCm) {
      const diff = Math.abs(profile.leftBicepCm - profile.rightBicepCm);
      const avg = (profile.leftBicepCm + profile.rightBicepCm) / 2;
      const pct = (diff / avg) * 100;
      if (pct >= threshold) {
        imbalances.push({
          muscle: 'BICEPS',
          weakSide: profile.leftBicepCm < profile.rightBicepCm ? 'left' : 'right',
          diffPercent: Math.round(pct),
        });
      }
    }

    // Thigh (quad/ham) imbalance
    if (profile.leftThighCm && profile.rightThighCm) {
      const diff = Math.abs(profile.leftThighCm - profile.rightThighCm);
      const avg = (profile.leftThighCm + profile.rightThighCm) / 2;
      const pct = (diff / avg) * 100;
      if (pct >= threshold) {
        imbalances.push({
          muscle: 'QUADRICEPS',
          weakSide: profile.leftThighCm < profile.rightThighCm ? 'left' : 'right',
          diffPercent: Math.round(pct),
        });
      }
    }

    // Calf imbalance
    if (profile.leftCalfCm && profile.rightCalfCm) {
      const diff = Math.abs(profile.leftCalfCm - profile.rightCalfCm);
      const avg = (profile.leftCalfCm + profile.rightCalfCm) / 2;
      const pct = (diff / avg) * 100;
      if (pct >= threshold) {
        imbalances.push({
          muscle: 'CALVES',
          weakSide: profile.leftCalfCm < profile.rightCalfCm ? 'left' : 'right',
          diffPercent: Math.round(pct),
        });
      }
    }

    return imbalances;
  }

  /**
   * Build rehab block from injury data
   */
  buildRehabBlock(injuries: InjuryData[]): { exercises: RehabExercise[] } | undefined {
    const activeInjuries = injuries.filter(i => i.isCurrentlyActive);
    if (activeInjuries.length === 0) return undefined;

    const exercises: RehabExercise[] = [];
    const addedAreas = new Set<string>();

    for (const injury of activeInjuries) {
      const key = injury.bodyPart.toUpperCase();
      if (addedAreas.has(key)) continue;
      addedAreas.add(key);

      const rehabs = INJURY_REHAB_MAP[key];
      if (rehabs) {
        exercises.push(...rehabs.slice(0, 2)); // 2 per area, max 4 total
      }
      if (exercises.length >= 4) break;
    }

    return exercises.length > 0 ? { exercises } : undefined;
  }

  // ════════════════════════════════════════════

  /**
   * MAIN ENTRY POINT: Generate a complete, research-based workout
   */
  async generateWorkout(profile: UserProfile, session: SessionInput): Promise<GeneratedWorkout> {
    // ──────────────────────────────────────────────
    // STEP 0: Calculate readiness score
    // ──────────────────────────────────────────────
    const readiness = this.calculateReadinessScore(profile, session);

    // Red zone = full rest
    if (readiness.color === 'red') {
      return {
        type: 'rest',
        title: 'Rest Day — Your Body Needs Recovery',
        titleAr: 'يوم راحة — جسمك محتاج يرتاح',
        description: 'Your readiness score is very low. Rest is when muscles grow.',
        descriptionAr: 'نسبة جاهزيتك منخفضة جدا. الراحة هي وقت نمو العضلات.',
        durationMinutes: 0, format: 'TRADITIONAL', targetMuscles: [],
        warmup: { durationMinutes: 0, exercises: [] }, workingSets: [],
        cooldown: { durationMinutes: 0, exercises: [] },
        progressionNotes: 'Full rest day. Resume training tomorrow.',
        progressionNotesAr: 'يوم راحة كاملة. كمّل تمرين بكرة.',
        splitType: 'REST', periodizationPhase: 'deload', estimatedCalories: 0,
        reason: 'Low readiness score — rest prevents overtraining.',
        reasonAr: 'نسبة جاهزية منخفضة — الراحة بتمنع الإرهاق.',
        readinessScore: readiness.score, readinessColor: readiness.color,
        readinessMessage: readiness.message, readinessMessageAr: readiness.messageAr,
      };
    }

    // Backward-compat rest check
    const restCheck = this.checkIfShouldRest(profile, session);
    if (restCheck) return restCheck;

    // ──────────────────────────────────────────────
    // STEP 1: Calculate effective experience level
    // ──────────────────────────────────────────────
    const effectiveLevel = this.calculateEffectiveLevel(profile);

    // ──────────────────────────────────────────────
    // STEP 2: Duration configuration
    // ──────────────────────────────────────────────
    const dur = DURATION_CONFIG[session.availableMinutes] || DURATION_CONFIG[30];

    // ──────────────────────────────────────────────
    // STEP 3: 8-Layer Modifier Stack
    // ──────────────────────────────────────────────
    // Layer 1: Body type
    const bodyTypeAdj = BODY_TYPE_ADJUSTMENTS[profile.bodyType || 'MESOMORPH'] || BODY_TYPE_ADJUSTMENTS.MESOMORPH;
    // Layer 2: Readiness (already calculated)
    // Layer 3: Supplements
    const suppMods = this.getSupplementModifiers(profile.supplements, profile.healthConditions);
    // Layer 4: Ramadan
    const isRamadan = profile.ramadanMode || false;

    // Layer 5: Health condition caps
    let maxRPE = 10;
    let avoidValsalva = false;
    const avoidCategories: ExerciseCategory[] = [];
    for (const condition of profile.healthConditions) {
      const restriction = HEALTH_RESTRICTIONS[condition];
      if (restriction) {
        maxRPE = Math.min(maxRPE, restriction.maxRPE);
        if (restriction.avoidValsalva) avoidValsalva = true;
        avoidCategories.push(...restriction.avoidCategories);
      }
    }
    // Layer 6: Injury restrictions
    const injuryRestrictions = this.getInjuryRestrictions(profile.injuryData);
    // Layer 7: Age-based adjustments (seniors 65+, elderly 75+)
    const ageCategory = getAgeCategory(profile.age);
    const ageAdj = AGE_ADJUSTMENTS[ageCategory];
    maxRPE = Math.min(maxRPE, ageAdj.maxRPE);
    if (ageAdj.avoidExplosive) {
      avoidCategories.push('PLYOMETRIC' as ExerciseCategory, 'OLYMPIC' as ExerciseCategory);
    }
    // Layer 8: BMI-based adjustments (obese users get low-impact, seated)
    const bmiCategory = getBMICategory(profile.bmi || 22);
    const bmiAdj = BMI_ADJUSTMENTS[bmiCategory];
    maxRPE = Math.min(maxRPE, bmiAdj.maxRPE);
    if (bmiAdj.avoidHighImpact) {
      avoidCategories.push('PLYOMETRIC' as ExerciseCategory);
    }
    // Imbalance detection (for unilateral exercise selection)
    const imbalances = this.detectImbalances(profile);

    // Composite energy adjustment
    const energyAdj = ENERGY_ADJUSTMENTS[session.energyLevel];

    // ──────────────────────────────────────────────
    // STEP 4: Determine split & target muscles
    // ──────────────────────────────────────────────
    const profileForSplit = { ...profile, experienceLevel: effectiveLevel };
    const splitType = this.determineSplit(profileForSplit, session);
    let targetMuscles = this.selectTargetMuscles(splitType, session, profileForSplit);

    // Filter out SEVERE injury muscles
    if (injuryRestrictions.avoidMuscles.length > 0) {
      targetMuscles = targetMuscles.filter(m => !injuryRestrictions.avoidMuscles.includes(m));
      if (targetMuscles.length === 0) {
        targetMuscles = this.pickNeglectedMuscles(session.recentMusclesWorked, injuryRestrictions.avoidMuscles, 3);
      }
    }

    // ──────────────────────────────────────────────
    // STEP 5: Equipment pool
    // ──────────────────────────────────────────────
    const baseEquipment = EQUIPMENT_BY_LOCATION[session.location] || EQUIPMENT_BY_LOCATION.gym;
    const userEquipment = profile.availableEquipment.length > 0
      ? [...new Set([...baseEquipment, ...profile.availableEquipment])]
      : baseEquipment;

    // ──────────────────────────────────────────────
    // STEP 6: Fetch exercises from DB
    // ──────────────────────────────────────────────
    const exercisesFromDB = await this.fetchExercises(
      targetMuscles,
      userEquipment as EquipmentType[],
      { ...profile, experienceLevel: effectiveLevel },
      [...new Set(avoidCategories)] as ExerciseCategory[],
    );

    // Filter out exercises in user's avoidMovements list
    const safeExercises = injuryRestrictions.avoidExerciseNames.length > 0
      ? exercisesFromDB.filter(ex => {
          const name = (ex.nameEn || '').toLowerCase();
          return !injuryRestrictions.avoidExerciseNames.some(avoid => name.includes(avoid));
        })
      : exercisesFromDB;

    // ──────────────────────────────────────────────
    // STEP 7: Build exercise blocks
    // ──────────────────────────────────────────────
    const goalConfig = REP_RANGES_BY_GOAL[profile.fitnessGoal];
    const restConfig = REST_BY_GOAL[profile.fitnessGoal];
    const setsConfig = SETS_BY_EXPERIENCE[effectiveLevel];

    // Max exercises with ALL modifiers (8-layer stack)
    let maxExercises = session.maxExercises
      ? session.maxExercises
      : Math.round(dur.maxExercises * energyAdj.maxExerciseModifier);
    if (isRamadan) maxExercises = Math.max(2, maxExercises - 2);
    if (readiness.color === 'orange') maxExercises = Math.max(2, Math.round(maxExercises * 0.7));
    // Age-based volume reduction (seniors/elderly)
    if (ageAdj.volumeModifier < 1.0) maxExercises = Math.max(2, Math.round(maxExercises * ageAdj.volumeModifier));
    maxExercises = Math.max(1, maxExercises);

    const selectedExercises = this.selectAndOrderExercises(
      safeExercises,
      targetMuscles,
      maxExercises,
      session.availableMinutes,
      profile.fitnessGoal,
    );

    const format = this.determineFormat(dur, { ...profile, experienceLevel: effectiveLevel }, session);

    // Apply readiness + supplement RPE modifiers
    const adjustedMaxRPE = Math.max(5, Math.min(maxRPE, maxRPE + readiness.rpeModifier + suppMods.intensityModifier));

    // Calculate periodization phase BEFORE building blocks (so phase affects rep scheme)
    const weekNum = session.weekNumber || 1;
    const periodPhase = this.getPeriodizationPhase(weekNum, effectiveLevel, profile.fitnessGoal);

    const workingSets = this.buildExerciseBlocks(
      selectedExercises,
      {
        goalConfig,
        restConfig,
        setsConfig,
        bodyTypeAdj,
        energyAdj,
        maxRPE: adjustedMaxRPE,
        avoidValsalva,
        isRamadan,
        format,
        tempo: TEMPO_BY_GOAL[profile.fitnessGoal],
        periodPhase,
      },
    );

    // Apply injury modification notes to exercise blocks
    for (const block of workingSets) {
      const note = injuryRestrictions.modificationNotes.get(block.muscleGroup);
      if (note) {
        block.modificationNote = note;
        block.modificationNoteAr = note;
      }
      if (injuryRestrictions.reduceMuscles.includes(block.muscleGroup)) {
        block.sets = Math.max(2, block.sets - 1);
      }
      // Add imbalance notes — prefer unilateral for imbalanced muscles
      const imbalance = imbalances.find(i => i.muscle === block.muscleGroup);
      if (imbalance) {
        const uniNote = `Imbalance detected (${imbalance.weakSide} side ${imbalance.diffPercent}% smaller) — use unilateral version, start with weak side`;
        const uniNoteAr = `اكتشفنا عدم توازن (الجانب ${imbalance.weakSide === 'left' ? 'الشمال' : 'اليمين'} أصغر ${imbalance.diffPercent}%) — استخدم تمرين يد واحدة، ابدأ بالجانب الضعيف`;
        block.modificationNote = block.modificationNote ? `${block.modificationNote}. ${uniNote}` : uniNote;
        block.modificationNoteAr = block.modificationNoteAr ? `${block.modificationNoteAr}. ${uniNoteAr}` : uniNoteAr;
      }
    }

    // ──────────────────────────────────────────────
    // STEP 8: Warmup, Cooldown, Rehab
    // ──────────────────────────────────────────────
    const warmup = generateWarmup(dur.warmupMinutes, targetMuscles, session.location);
    const cooldown = generateCooldown(dur.cooldownMinutes, targetMuscles);
    const rehabBlock = this.buildRehabBlock(profile.injuryData);

    // ──────────────────────────────────────────────
    // STEP 9: Build final output with ALL new fields
    // ──────────────────────────────────────────────
    const muscleNames = targetMuscles.map(m => m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' '));
    const muscleNamesAr = targetMuscles.map(m => MUSCLE_AR[m] || m);

    const title = this.generateTitle(session.availableMinutes, targetMuscles, format, profile.fitnessGoal);
    const titleAr = this.generateTitleAr(session.availableMinutes, targetMuscles, format, profile.fitnessGoal);

    // Effective duration: cap for Ramadan
    const effectiveDuration = isRamadan
      ? Math.min(session.availableMinutes, RAMADAN_ADJUSTMENTS.maxDuration as DurationType)
      : session.availableMinutes;

    return {
      type: effectiveDuration < 20 ? 'quick_workout' : 'full_workout',
      title,
      titleAr,
      description: this.generateDescription(session, { ...profile, experienceLevel: effectiveLevel }, muscleNames, format, periodPhase),
      descriptionAr: this.generateDescriptionAr(session, { ...profile, experienceLevel: effectiveLevel }, muscleNamesAr, format, periodPhase),
      durationMinutes: effectiveDuration,
      format,
      targetMuscles,
      warmup,
      workingSets,
      cooldown,
      rehabBlock,
      progressionNotes: this.getProgressionNotes(effectiveLevel, profile.fitnessGoal, weekNum),
      progressionNotesAr: this.getProgressionNotesAr(effectiveLevel, profile.fitnessGoal, weekNum),
      splitType,
      periodizationPhase: periodPhase,
      estimatedCalories: estimateCalories(effectiveDuration, profile.weightKg, session.energyLevel),
      reason: this.generateReason(targetMuscles, session, profile),
      reasonAr: this.generateReasonAr(targetMuscles, session, profile),
      // Readiness
      readinessScore: readiness.score,
      readinessColor: readiness.color,
      readinessMessage: readiness.message,
      readinessMessageAr: readiness.messageAr,
      // Supplement notes
      supplementNotes: suppMods.notes || undefined,
      supplementNotesAr: suppMods.notes || undefined,
      // Active modifiers summary
      modifiers: {
        bodyType: profile.bodyType || undefined,
        readiness: `${readiness.score}/100 (${readiness.color})`,
        supplements: suppMods.notes || undefined,
        ramadan: isRamadan || undefined,
        injuries: injuryRestrictions.avoidMuscles.length > 0 ? injuryRestrictions.avoidMuscles : undefined,
        effectiveLevel,
        ageCategory: ageCategory !== 'adult' ? ageCategory : undefined,
        bmiCategory: bmiCategory !== 'normal' ? bmiCategory : undefined,
        imbalances: imbalances.length > 0 ? imbalances : undefined,
      },
    };
  }

  /**
   * Load full user profile from DB tables
   */
  /**
   * Generate a complete 4-week personalized program
   * Research sources: Arnold Blueprint (weekly undulation), Jordan Peters (progressive phases),
   * Natural BB (phase cycling), IAFS Lee Haney (periodization)
   *
   * Returns an array of 4 weeks × N sessions/week, each with full workout details.
   */
  async generateProgram(
    profile: UserProfile,
    options: {
      daysPerWeek: number;          // 3-6
      minutesPerSession: DurationType;
      location: LocationType;
      programName?: string;
      programNameAr?: string;
    },
  ): Promise<{
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    durationWeeks: number;
    daysPerWeek: number;
    weeks: Array<{
      weekNumber: number;
      phase: string;
      sessions: GeneratedWorkout[];
    }>;
  }> {
    const { daysPerWeek, minutesPerSession, location } = options;

    // Determine split based on days/week and experience
    const effectiveLevel = this.calculateEffectiveLevel(profile);
    let splitType: string;
    if (daysPerWeek <= 3) splitType = 'FULL_BODY';
    else if (daysPerWeek === 4) splitType = 'UPPER_LOWER';
    else if (daysPerWeek === 5) splitType = 'PPL'; // PPL + Upper + Lower
    else splitType = effectiveLevel === 'ADVANCED' || effectiveLevel === 'EXPERT' ? 'ARNOLD_SPLIT' : 'PPL';

    const splitDef = SPLIT_DEFINITIONS[splitType] || SPLIT_DEFINITIONS.FULL_BODY;
    const recentMuscles = await this.getRecentMusclesWorked(profile.userId);

    const weeks: Array<{ weekNumber: number; phase: string; sessions: GeneratedWorkout[] }> = [];

    for (let week = 1; week <= 4; week++) {
      const phase = this.getPeriodizationPhase(week, effectiveLevel, profile.fitnessGoal);
      const sessions: GeneratedWorkout[] = [];

      for (let day = 0; day < daysPerWeek; day++) {
        // Rotate through split definition
        const splitDay = day % splitDef.length;
        const dayMuscles = splitDef[splitDay];

        // Build session input for this day
        const sessionInput: SessionInput = {
          location,
          availableMinutes: minutesPerSession,
          energyLevel: 'medium', // Programs assume normal energy
          dayOfWeek: day + 1,
          recentMusclesWorked: day === 0 ? recentMuscles : sessions.flatMap(s => s.targetMuscles),
          weekNumber: week,
          targetSplit: undefined,
          maxExercises: undefined,
        };

        // Generate workout for this session
        const workout = await this.generateWorkout(profile, sessionInput);

        // Override target muscles to follow the split plan
        if (workout.type !== 'rest' && workout.type !== 'active_recovery') {
          workout.targetMuscles = dayMuscles;
        }

        sessions.push(workout);
      }

      weeks.push({ weekNumber: week, phase, sessions });
    }

    // Program metadata
    const splitLabel = splitType.replace('_', '/').toLowerCase();
    const name = options.programName || `4-Week ${splitLabel} Program`;
    const nameAr = options.programNameAr || `برنامج 4 أسابيع — ${splitLabel}`;

    return {
      name,
      nameAr,
      description: `A personalized ${daysPerWeek}-day/week program with ${splitType.replace('_', '/')} split. ` +
        `Designed for ${effectiveLevel.toLowerCase().replace('_', ' ')} level, goal: ${profile.fitnessGoal.toLowerCase().replace('_', ' ')}. ` +
        `Each week has a different training phase for maximum adaptation.`,
      descriptionAr: `برنامج شخصي ${daysPerWeek} أيام/أسبوع بنظام ${splitLabel}. ` +
        `مصمم لمستوى ${effectiveLevel === 'BEGINNER' ? 'مبتدئ' : effectiveLevel === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}. ` +
        `كل أسبوع مرحلة تدريب مختلفة لأقصى تكيّف.`,
      durationWeeks: 4,
      daysPerWeek,
      weeks,
    };
  }

  async loadUserProfile(userId: string): Promise<UserProfile> {
    const [user, prefs, bodyComp, training, goals, health, exerciseCap, nutritionProfile, lifestyle, fastingProfile, logCount, lastLog] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.userAIPreference.findUnique({ where: { userId } }),
      this.prisma.userBodyComposition.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userTrainingHistory.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userGoalsProfile.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userHealthProfile.findUnique({ where: { userId }, include: { injuries: { where: { isCurrentlyActive: true } } } }).catch(() => null),
      this.prisma.userExerciseCapability.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userNutritionProfile.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userLifestyleProfile.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.userFastingProfile.findUnique({ where: { userId } }).catch(() => null),
      this.prisma.workoutLog.count({ where: { userId, status: 'COMPLETED' } }).catch(() => 0),
      this.prisma.workoutLog.findFirst({ where: { userId, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' }, select: { completedAt: true } }).catch(() => null),
    ]);

    if (!user) throw new Error('User not found');

    // Calculate age
    const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25;

    // Map fitness goal
    const goalMap: Record<string, GoalType> = {
      LOSE_WEIGHT: 'LOSE_WEIGHT',
      BUILD_MUSCLE: 'BUILD_MUSCLE',
      MAINTAIN: 'MAINTAIN',
      IMPROVE_HEALTH: 'IMPROVE_HEALTH',
      INCREASE_STRENGTH: 'INCREASE_STRENGTH',
      IMPROVE_ENDURANCE: 'IMPROVE_ENDURANCE',
    };

    // Map experience level
    const expMap: Record<string, ExperienceLevel> = {
      COMPLETE_BEGINNER: 'COMPLETE_BEGINNER',
      BEGINNER: 'BEGINNER',
      NOVICE: 'NOVICE',
      INTERMEDIATE: 'INTERMEDIATE',
      ADVANCED: 'ADVANCED',
      EXPERT: 'EXPERT',
    };

    // Derive experience from fitness level + training history
    let experience: ExperienceLevel = 'BEGINNER';
    if (training?.currentLevel) {
      experience = expMap[training.currentLevel] || 'BEGINNER';
    } else if (user.fitnessLevel) {
      const levelMap: Record<string, ExperienceLevel> = {
        BEGINNER: 'BEGINNER',
        INTERMEDIATE: 'INTERMEDIATE',
        ADVANCED: 'ADVANCED',
        EXPERT: 'EXPERT',
      };
      experience = levelMap[user.fitnessLevel] || 'BEGINNER';
    }

    // Detect health conditions
    const healthConditions: HealthCondition[] = [];
    if (health) {
      if (health.hasHeartCondition) healthConditions.push('heart');
      if (health.hasHighBloodPressure) healthConditions.push('high_bp');
      if (health.hasLowBloodPressure) healthConditions.push('low_bp');
      if (health.hasDiabetes) {
        healthConditions.push(health.diabetesType === 1 ? 'diabetes_1' : 'diabetes_2');
      }
      if (health.hasAsthma) healthConditions.push('asthma');
      if (health.hasArthritis) healthConditions.push('arthritis');
      if (health.hasOsteoporosis) healthConditions.push('osteoporosis');
      if (health.hasHerniaHistory) healthConditions.push('hernia');
      if (health.isPregnant) healthConditions.push('pregnancy');
    }

    // Calculate BMI
    const weightKg = bodyComp?.currentWeightKg || user.currentWeightKg || 75;
    const heightCm = bodyComp?.heightCm || user.heightCm || 170;
    const bmi = weightKg / ((heightCm / 100) ** 2);

    return {
      userId,
      age,
      gender: (user.gender === 'MALE' ? 'MALE' : 'FEMALE') as 'MALE' | 'FEMALE',
      weightKg,
      heightCm,
      bodyFatPercent: bodyComp?.bodyFatPercent || undefined,
      bodyType: (bodyComp?.bodyType as any) || undefined,
      bmi,
      waistToHipRatio: bodyComp?.waistToHipRatio || undefined,
      experienceLevel: experience,
      fitnessGoal: goalMap[user.fitnessGoal || goals?.primaryGoal || 'BUILD_MUSCLE'] || 'BUILD_MUSCLE',
      injuries: prefs?.injuries || [],
      healthConditions,
      availableEquipment: prefs?.availableEquipment || [],
      preferredSplit: training?.preferredSplitType || undefined,
      preferredTrainingStyle: training?.preferredTrainingStyle || undefined,
      pushUpMax: exerciseCap?.pushUpMaxReps || undefined,
      plankHoldSeconds: exerciseCap?.plankHoldSeconds || undefined,
      restingHeartRate: undefined, // From connected devices in future
      prBenchKg: training?.prBenchPressKg || undefined,
      prSquatKg: training?.prSquatKg || undefined,
      prDeadliftKg: training?.prDeadliftKg || undefined,
      ramadanMode: fastingProfile?.ramadanActive || prefs?.ramadanModeEnabled || false,
      ramadanWorkoutTiming: fastingProfile?.ramadanWorkoutTiming || prefs?.ramadanWorkoutTiming || 'after_iftar',
      // Structured injury data from health profile
      injuryData: ((health as any)?.injuries || []).map((inj: any) => ({
        bodyPart: inj.bodyPart,
        side: inj.side || undefined,
        injuryType: inj.injuryType || 'OTHER',
        severity: inj.severity || 'MILD',
        painLevel: inj.painLevel || 0,
        painTriggers: inj.painTriggers || [],
        avoidMovements: inj.avoidMovements || [],
        isCurrentlyActive: inj.isCurrentlyActive ?? true,
      })),
      // Supplement stack
      supplements: {
        takesCreatine: nutritionProfile?.takesCreatine || false,
        takesPreWorkout: nutritionProfile?.takesPreWorkout || false,
        takesProteinPowder: nutritionProfile?.takesProteinPowder || false,
        takesBetaAlanine: (nutritionProfile as any)?.takesBetaAlanine || false,
        takesOmega3: (nutritionProfile as any)?.takesOmega3 || false,
        takesMultivitamin: (nutritionProfile as any)?.takeMultivitamin || false,
      },
      // Lifestyle
      sleepHours: lifestyle?.averageSleepHours || undefined,
      sleepQuality: lifestyle?.sleepQuality || undefined,
      stressLevel: lifestyle?.currentStressLevel || undefined,
      // Workout history
      workoutLogCount: logCount || 0,
      daysSinceLastWorkout: lastLog?.completedAt
        ? Math.floor((Date.now() - new Date(lastLog.completedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
      // Pull-up max
      pullUpMax: exerciseCap?.pullUpMaxReps || undefined,
      // Bilateral measurements for imbalance detection
      leftBicepCm: bodyComp?.leftBicepCm || undefined,
      rightBicepCm: bodyComp?.rightBicepCm || undefined,
      leftThighCm: bodyComp?.leftThighCm || undefined,
      rightThighCm: bodyComp?.rightThighCm || undefined,
      leftCalfCm: bodyComp?.leftCalfCm || undefined,
      rightCalfCm: bodyComp?.rightCalfCm || undefined,
      leanMassKg: bodyComp?.leanMassKg || undefined,
    };
  }

  /**
   * Get recent muscles worked (last 48h) for split rotation
   */
  async getRecentMusclesWorked(userId: string): Promise<string[]> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const recentLogs = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: twoDaysAgo },
      },
      include: {
        exerciseLogs: {
          include: { exercise: { select: { primaryMuscle: true, secondaryMuscles: true } } },
        },
      },
    });

    const muscles = new Set<string>();
    for (const log of recentLogs) {
      for (const exLog of log.exerciseLogs) {
        if (exLog.exercise?.primaryMuscle) muscles.add(exLog.exercise.primaryMuscle);
        if (exLog.exercise?.secondaryMuscles) {
          for (const m of exLog.exercise.secondaryMuscles) muscles.add(m);
        }
      }
    }

    return Array.from(muscles);
  }

  // ──────────────────────────────────────────────
  // PRIVATE: Core Decision Logic
  // ──────────────────────────────────────────────

  private checkIfShouldRest(profile: UserProfile, session: SessionInput): GeneratedWorkout | null {
    // Overtrained: 4+ workouts in 3 days + low energy
    if (session.energyLevel === 'low' && session.recentMusclesWorked.length > 12) {
      return {
        type: 'rest',
        title: 'Rest Day — Your Body Needs Recovery',
        titleAr: 'يوم راحة — جسمك محتاج يرتاح',
        description: 'You\'ve been training hard. Rest is when muscles grow. Hydrate, stretch gently, sleep well.',
        descriptionAr: 'إنت بتتمرن كتير. الراحة هي وقت نمو العضلات. اشرب مية، اتمدد، ونام كويس.',
        durationMinutes: 0,
        format: 'TRADITIONAL',
        targetMuscles: [],
        warmup: { durationMinutes: 0, exercises: [] },
        workingSets: [],
        cooldown: { durationMinutes: 0, exercises: [] },
        progressionNotes: 'Take a full rest day. Resume training tomorrow.',
        progressionNotesAr: 'خد راحة كاملة. كمّل تمرين بكرة.',
        splitType: 'REST',
        periodizationPhase: 'deload',
        estimatedCalories: 0,
        reason: 'High training volume detected with low energy — rest prevents overtraining.',
        reasonAr: 'حجم تدريب عالي مع طاقة منخفضة — الراحة بتمنع الإرهاق.',
      };
    }

    // Active recovery on low energy
    if (session.energyLevel === 'low') {
      return {
        type: 'active_recovery',
        title: 'Active Recovery Session',
        titleAr: 'جلسة تعافي نشط',
        description: 'Light movement to aid recovery. Focus on mobility, stretching, and blood flow.',
        descriptionAr: 'حركة خفيفة للتعافي. ركّز على المرونة والتمدد وتدفق الدم.',
        durationMinutes: Math.min(session.availableMinutes, 20),
        format: 'TRADITIONAL',
        targetMuscles: ['FULL_BODY'],
        warmup: { durationMinutes: 0, exercises: [] },
        workingSets: [
          { name: 'Foam Rolling (Full Body)', nameAr: 'تدليك بالأسطوانة', category: 'accessory', sets: 1, reps: '5 min', restSeconds: 0, muscleGroup: 'FULL_BODY', equipment: ['FOAM_ROLLER'] },
          { name: 'Cat-Cow Stretch', nameAr: 'تمدد القطة-البقرة', category: 'accessory', sets: 2, reps: '10 reps', restSeconds: 0, muscleGroup: 'LOWER_BACK', equipment: ['NONE'] },
          { name: 'Hip Flexor Stretch', nameAr: 'تمدد عضلات الورك', category: 'accessory', sets: 2, reps: '30 sec each', restSeconds: 0, muscleGroup: 'GLUTES', equipment: ['NONE'] },
          { name: 'Thoracic Spine Rotation', nameAr: 'دوران العمود الفقري', category: 'accessory', sets: 2, reps: '10 each side', restSeconds: 0, muscleGroup: 'BACK', equipment: ['NONE'] },
          { name: 'Light Walk', nameAr: 'مشي خفيف', category: 'accessory', sets: 1, reps: '10 min', restSeconds: 0, muscleGroup: 'CARDIO', equipment: ['NONE'] },
        ],
        cooldown: { durationMinutes: 0, exercises: [] },
        progressionNotes: 'Active recovery maintains blood flow without adding training stress.',
        progressionNotesAr: 'التعافي النشط بيحافظ على تدفق الدم من غير ضغط إضافي.',
        splitType: 'RECOVERY',
        periodizationPhase: 'deload',
        estimatedCalories: estimateCalories(20, profile.weightKg, 'low'),
        reason: 'Low energy detected. Active recovery helps without adding stress.',
        reasonAr: 'طاقة منخفضة. التعافي النشط بيساعد من غير ضغط.',
      };
    }

    return null;
  }

  private determineSplit(profile: UserProfile, session: SessionInput): string {
    // Chat flow override: user explicitly chose a split (CHEST, PUSH, UPPER, etc.)
    if (session.targetSplit && CHAT_SPLIT_TO_MUSCLES[session.targetSplit]) {
      return `CHAT_${session.targetSplit}`;
    }

    // If user has a preferred split, use it
    if (profile.preferredSplit && SPLIT_DEFINITIONS[profile.preferredSplit]) {
      return profile.preferredSplit;
    }

    // Short workouts always target specific muscles, not a traditional split
    if (session.availableMinutes <= 20) {
      return 'TARGETED';
    }

    // Use experience level to determine best split
    const options = SPLIT_RECOMMENDATION[profile.experienceLevel];
    return options[0]; // Default to first recommended split
  }

  private selectTargetMuscles(splitType: string, session: SessionInput, profile: UserProfile): string[] {
    const injured = this.getInjuredMuscles(profile.injuries);

    // Chat flow override: direct muscle targeting
    if (splitType.startsWith('CHAT_')) {
      const chatKey = splitType.replace('CHAT_', '');
      const muscles = CHAT_SPLIT_TO_MUSCLES[chatKey] || [];
      const filtered = muscles.filter(m => !injured.includes(m));
      return filtered.length > 0 ? filtered : this.pickNeglectedMuscles(session.recentMusclesWorked, injured, 3);
    }

    if (splitType === 'TARGETED') {
      // For short workouts: pick 1-2 neglected muscle groups
      return this.pickNeglectedMuscles(session.recentMusclesWorked, injured, 2);
    }

    const splitDef = SPLIT_DEFINITIONS[splitType];
    if (!splitDef) {
      return this.pickNeglectedMuscles(session.recentMusclesWorked, injured, 3);
    }

    // Rotate through the split based on day of week and recent work
    const dayIndex = this.getSplitDayIndex(splitDef, session.recentMusclesWorked, session.dayOfWeek);
    let muscles = splitDef[dayIndex];

    // Filter out injured muscles
    muscles = muscles.filter(m => !injured.includes(m));

    return muscles.length > 0 ? muscles : this.pickNeglectedMuscles(session.recentMusclesWorked, injured, 3);
  }

  private getSplitDayIndex(splitDef: string[][], recentMuscles: string[], dayOfWeek: number): number {
    // Find the split day that has the LEAST overlap with recently worked muscles
    let bestIndex = 0;
    let leastOverlap = Infinity;

    for (let i = 0; i < splitDef.length; i++) {
      const overlap = splitDef[i].filter(m => recentMuscles.includes(m)).length;
      if (overlap < leastOverlap) {
        leastOverlap = overlap;
        bestIndex = i;
      }
    }

    // If all equal overlap, use day of week modulo
    if (leastOverlap === Infinity || splitDef.every(s => s.filter(m => recentMuscles.includes(m)).length === leastOverlap)) {
      return (dayOfWeek - 1) % splitDef.length;
    }

    return bestIndex;
  }

  private pickNeglectedMuscles(recentMuscles: string[], injured: string[], count: number): string[] {
    const allMuscles = ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'BICEPS', 'TRICEPS', 'ABS', 'CALVES'];
    const available = allMuscles.filter(m => !injured.includes(m));
    const neglected = available.filter(m => !recentMuscles.includes(m));

    if (neglected.length >= count) return neglected.slice(0, count);
    return available.slice(0, count);
  }

  private getInjuredMuscles(injuries: string[]): string[] {
    const result = new Set<string>();
    for (const injury of injuries) {
      const affected = INJURY_MUSCLE_MAP[injury.toUpperCase()] || [];
      affected.forEach(m => result.add(m));
    }
    return Array.from(result);
  }

  private async fetchExercises(
    targetMuscles: string[],
    equipment: EquipmentType[],
    profile: UserProfile,
    avoidCategories: ExerciseCategory[],
  ) {
    const difficultyFilter = this.getDifficultyFilter(profile.experienceLevel);

    const whereClause: any = {
      primaryMuscle: { in: targetMuscles as MuscleGroup[] },
      difficulty: { in: difficultyFilter },
    };

    if (equipment.length > 0) {
      whereClause.equipment = { hasSome: equipment };
    }

    if (avoidCategories.length > 0) {
      whereClause.category = { notIn: avoidCategories };
    }

    return this.prisma.exercise.findMany({
      where: whereClause,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        category: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        equipment: true,
        difficulty: true,
      },
      orderBy: { id: 'asc' },
      take: 100, // Fetch pool of exercises to choose from
    });
  }

  private getDifficultyFilter(experience: ExperienceLevel): DifficultyLevel[] {
    switch (experience) {
      case 'COMPLETE_BEGINNER':
      case 'BEGINNER':
        return ['BEGINNER'] as DifficultyLevel[];
      case 'NOVICE':
        return ['BEGINNER', 'INTERMEDIATE'] as DifficultyLevel[];
      case 'INTERMEDIATE':
        return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as DifficultyLevel[];
      case 'ADVANCED':
      case 'EXPERT':
        return ['INTERMEDIATE', 'ADVANCED', 'EXPERT'] as DifficultyLevel[];
    }
  }

  private selectAndOrderExercises(
    exercises: any[],
    targetMuscles: string[],
    maxExercises: number,
    duration: DurationType,
    goal: GoalType,
  ): any[] {
    // Group by muscle
    const byMuscle = new Map<string, any[]>();
    for (const ex of exercises) {
      const muscle = ex.primaryMuscle;
      if (!byMuscle.has(muscle)) byMuscle.set(muscle, []);
      byMuscle.get(muscle)!.push(ex);
    }

    // Separate compound vs isolation
    const compounds: any[] = [];
    const isolations: any[] = [];

    for (const muscle of targetMuscles) {
      const pool = byMuscle.get(muscle) || [];
      // Shuffle the pool for variety
      const shuffled = this.shuffleArray([...pool]);

      for (const ex of shuffled) {
        const isCompound = ['STRENGTH', 'OLYMPIC', 'CROSSFIT', 'CALISTHENICS'].includes(ex.category) ||
          (ex.secondaryMuscles && ex.secondaryMuscles.length >= 1);
        if (isCompound) {
          compounds.push(ex);
        } else {
          isolations.push(ex);
        }
      }
    }

    // Order: compounds first (bigger movements), then isolations
    // For strength goal: more compounds. For endurance/fat loss: more variety
    const compoundCount = goal === 'INCREASE_STRENGTH'
      ? Math.ceil(maxExercises * 0.7)
      : goal === 'IMPROVE_ENDURANCE' || goal === 'LOSE_WEIGHT'
        ? Math.ceil(maxExercises * 0.5)
        : Math.ceil(maxExercises * 0.6);

    const isolationCount = maxExercises - compoundCount;

    const selected: any[] = [];

    // Pick compounds ensuring muscle variety
    const usedMuscles = new Set<string>();
    for (const ex of compounds) {
      if (selected.length >= compoundCount) break;
      if (!usedMuscles.has(ex.primaryMuscle)) {
        selected.push(ex);
        usedMuscles.add(ex.primaryMuscle);
      }
    }
    // Fill remaining compound slots
    for (const ex of compounds) {
      if (selected.length >= compoundCount) break;
      if (!selected.includes(ex)) {
        selected.push(ex);
      }
    }

    // Pick isolations for remaining muscles
    for (const ex of isolations) {
      if (selected.length >= maxExercises) break;
      if (!selected.includes(ex)) {
        selected.push(ex);
      }
    }

    return selected;
  }

  private determineFormat(dur: typeof DURATION_CONFIG[10], profile: UserProfile, session: SessionInput): WorkoutFormat {
    const formats = dur.format;

    // 10 min: EMOM for strength goal, Tabata for fat loss/endurance
    if (session.availableMinutes === 10) {
      if (profile.fitnessGoal === 'INCREASE_STRENGTH') return 'EMOM';
      return 'TABATA';
    }

    // 15 min: always circuit
    if (session.availableMinutes === 15) return 'CIRCUIT';

    // 20-30 min: supersets for time efficiency
    if (session.availableMinutes <= 30) return 'SUPERSET';

    // 45-60 min: traditional with some supersets for accessories
    if (session.availableMinutes <= 60) {
      if (profile.fitnessGoal === 'LOSE_WEIGHT') return 'SUPERSET';
      return 'STRAIGHT_SETS';
    }

    // 75-90 min: advanced techniques
    if (profile.experienceLevel === 'ADVANCED' || profile.experienceLevel === 'EXPERT') {
      return 'REST_PAUSE';
    }

    return 'TRADITIONAL';
  }

  private buildExerciseBlocks(
    exercises: any[],
    config: {
      goalConfig: typeof REP_RANGES_BY_GOAL.BUILD_MUSCLE;
      restConfig: typeof REST_BY_GOAL.BUILD_MUSCLE;
      setsConfig: typeof SETS_BY_EXPERIENCE.BEGINNER;
      bodyTypeAdj: typeof BODY_TYPE_ADJUSTMENTS.MESOMORPH;
      energyAdj: typeof ENERGY_ADJUSTMENTS.medium;
      maxRPE: number;
      avoidValsalva: boolean;
      isRamadan: boolean;
      format: WorkoutFormat;
      tempo: string;
      periodPhase?: string;
    },
  ): ExerciseBlock[] {
    const blocks: ExerciseBlock[] = [];

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const isCompound = ['STRENGTH', 'OLYMPIC', 'CROSSFIT', 'CALISTHENICS'].includes(ex.category) ||
        (ex.secondaryMuscles && ex.secondaryMuscles.length >= 1);
      const category: 'compound' | 'isolation' | 'accessory' = isCompound ? 'compound' : (i >= exercises.length - 1 ? 'accessory' : 'isolation');

      // Base sets & reps
      let sets = isCompound ? config.setsConfig.compound : config.setsConfig.isolation;
      let reps = isCompound ? config.goalConfig.compound : config.goalConfig.isolation;
      let rpe = config.goalConfig.rpeTarget + config.energyAdj.intensityModifier;
      let techniqueNote = '';
      let techniqueNoteAr = '';

      // Phase-specific rep scheme override (Arnold undulation, JP HIT, etc.)
      if (config.periodPhase && !['linear_progression', 'accumulation'].includes(config.periodPhase)) {
        const phaseScheme = this.getPhaseRepScheme(config.periodPhase, reps, isCompound);
        if (phaseScheme.sets > 0) sets = phaseScheme.sets; // 0 = use base
        if (phaseScheme.reps !== reps) reps = phaseScheme.reps;
        if (phaseScheme.rpe > 0) rpe = phaseScheme.rpe;
        if (phaseScheme.technique) techniqueNote = phaseScheme.technique;
        if (phaseScheme.techniqueAr) techniqueNoteAr = phaseScheme.techniqueAr;
      }

      // Apply energy/body-type/Ramadan modifiers on top
      sets = Math.round(sets * config.energyAdj.volumeModifier);
      if (config.isRamadan) sets = Math.max(2, Math.round(sets * RAMADAN_ADJUSTMENTS.volumeModifier));
      sets = Math.max(1, sets);

      // Base rest
      let rest = isCompound ? config.restConfig.compound : config.restConfig.isolation;
      rest = Math.round(rest * config.bodyTypeAdj.restModifier * config.energyAdj.restModifier);
      if (config.isRamadan) rest = Math.round(rest * RAMADAN_ADJUSTMENTS.restModifier);

      // RPE target with modifiers
      if (config.isRamadan) rpe += RAMADAN_ADJUSTMENTS.intensityModifier;
      rpe = Math.min(rpe, config.maxRPE);
      rpe = Math.max(5, Math.min(10, rpe));

      // Format-specific adjustments
      let formatNotes = '';
      if (config.format === 'EMOM') {
        formatNotes = `EMOM: Complete reps within 60s, rest remaining time`;
      } else if (config.format === 'TABATA') {
        formatNotes = `Tabata: 20s max effort, 10s rest, 8 rounds`;
      } else if (config.format === 'CIRCUIT') {
        formatNotes = `Circuit: Move to next exercise immediately, rest 60s between rounds`;
      }

      // Superset pairing
      let supersetPartner: string | undefined;
      if (config.format === 'SUPERSET' && i < exercises.length - 1 && i % 2 === 0) {
        supersetPartner = exercises[i + 1]?.nameEn;
      }

      const block: ExerciseBlock = {
        exerciseId: ex.id,
        name: ex.nameEn,
        nameAr: ex.nameAr,
        category,
        sets,
        reps: config.format === 'TABATA' ? '20 sec' : reps,
        restSeconds: config.format === 'CIRCUIT' ? 0 : rest,
        tempo: config.avoidValsalva ? '2-0-2-0' : config.tempo,
        rpeTarget: rpe,
        notes: [
          formatNotes,
          techniqueNote,
          config.avoidValsalva ? 'Breathe continuously — do NOT hold breath' : '',
          isCompound && category === 'compound' ? 'Start with 1-2 warm-up sets at lighter weight' : '',
        ].filter(Boolean).join('. ') || undefined,
        supersetWith: supersetPartner,
        muscleGroup: ex.primaryMuscle,
        equipment: ex.equipment,
      };

      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Get periodization phase — research-backed from PDF analysis:
   * - Arnold Blueprint: 4-week weekly undulation (12-10-8-6 → 8-6-4-2 → 5×5 → max+backoff)
   * - Jordan Peters: accumulate → intensify → deload
   * - Natural BB: 3-week phase cycling (5×5 → 4×8 → 3×12)
   * - DUP: Daily rep variation within week (heavy/moderate/light)
   */
  private getPeriodizationPhase(weekNumber: number, experience: ExperienceLevel, goal: GoalType): string {
    // Beginners: always linear progression (add weight each session)
    if (['COMPLETE_BEGINNER', 'BEGINNER'].includes(experience)) {
      return 'linear_progression';
    }

    // 4-week block periodization cycle
    const weekInCycle = ((weekNumber - 1) % 4) + 1;

    if (goal === 'INCREASE_STRENGTH') {
      // Strength: accumulation(2w) → intensification(1w) → deload(1w)
      // Based on powerlifting research + Jordan Peters progressive overload
      if (weekInCycle <= 2) return 'accumulation';
      if (weekInCycle === 3) return 'intensification';
      return 'deload';
    }

    if (goal === 'BUILD_MUSCLE') {
      // Arnold-style weekly undulation for hypertrophy:
      // Week 1: Volume (12-10-8-6 pyramid)
      // Week 2: Intensity (8-6-4-2 + strip sets)
      // Week 3: Density (5×5 straight sets)
      // Week 4: Peak + Deload (max + backoff 20-15-12)
      if (weekInCycle === 1) return 'volume';
      if (weekInCycle === 2) return 'intensity';
      if (weekInCycle === 3) return 'density';
      return 'peak_deload';
    }

    // Fat loss / endurance / general: accumulation(3w) → deload(1w)
    if (weekInCycle <= 3) return 'accumulation';
    return 'deload';
  }

  /**
   * Get rep scheme adjustments based on periodization phase
   * Research source: Arnold Blueprint weekly undulation + Jordan Peters HIT
   */
  private getPhaseRepScheme(phase: string, baseReps: string, isCompound: boolean): { reps: string; sets: number; rpe: number; technique?: string; techniqueAr?: string } {
    switch (phase) {
      case 'volume':
        // Arnold Week 1: Pyramid 12-10-8-6 (compounds), 12-10-8 (isolation)
        return {
          reps: isCompound ? '12, 10, 8, 6' : '12, 10, 8',
          sets: isCompound ? 4 : 3,
          rpe: 7,
        };
      case 'intensity':
        // Arnold Week 2: Heavy pyramid 8-6-4-2 + stripping method
        return {
          reps: isCompound ? '8, 6, 4, 2' : '8, 6, 4',
          sets: isCompound ? 4 : 3,
          rpe: 9,
          technique: 'Strip set on last set: reduce weight 20%, 5-10 more reps',
          techniqueAr: 'ستريب سيت على آخر مجموعة: نقّص الوزن 20%، 5-10 عدات كمان',
        };
      case 'density':
        // Arnold Week 3: 5×5 straight sets (max weight for 5)
        return {
          reps: '5',
          sets: isCompound ? 5 : 4,
          rpe: 8,
          technique: '5×5: Same weight all sets, heavy and controlled',
          techniqueAr: '5×5: نفس الوزن كل السيتات، تقيل ومضبوط',
        };
      case 'peak_deload':
        // Arnold Week 4: One max attempt + high-rep backoff
        return {
          reps: isCompound ? '3, 1, 1, 15' : '15, 12, 10',
          sets: isCompound ? 4 : 3,
          rpe: isCompound ? 10 : 6,
          technique: isCompound ? 'Work up to 1RM attempt, then backoff at 60%' : 'Light pump work — focus on contraction',
          techniqueAr: isCompound ? 'اوصل لأقصى وزن ممكن، بعدها نزّل 60% وكمّل' : 'شغل خفيف — ركّز على الانقباض',
        };
      case 'intensification':
        // Jordan Peters HIT style: 2 work sets to failure
        return {
          reps: isCompound ? '5-8' : '10-12',
          sets: 2,
          rpe: 10,
          technique: 'Top set to failure + back-off set to failure (reduce weight 15%)',
          techniqueAr: 'مجموعة أولى للفشل + مجموعة ثانية بوزن أقل 15% للفشل',
        };
      default:
        // accumulation / linear_progression — use base config
        return { reps: baseReps, sets: 0, rpe: 0 }; // 0 = use base config
    }
  }

  private getProgressionNotes(exp: ExperienceLevel, goal: GoalType, week: number): string {
    if (['COMPLETE_BEGINNER', 'BEGINNER'].includes(exp)) {
      return 'Linear progression: Add 2.5kg to upper body lifts and 5kg to lower body lifts each session when you complete all sets. Focus on form first.';
    }

    const phase = this.getPeriodizationPhase(week, exp, goal);

    switch (phase) {
      case 'volume':
        return 'Volume phase (Arnold-style): Pyramid sets 12→10→8→6 on compounds. Focus on progressive overload — beat last week\'s numbers. Log every set.';
      case 'intensity':
        return 'Intensity phase: Heavy pyramid 8→6→4→2, strip set on final set. Push hard — this is your growth week. RPE 9.';
      case 'density':
        return 'Density phase: 5×5 straight sets — same heavy weight all sets. Focus on bar speed and power. Rest 2-3 min between sets.';
      case 'peak_deload':
        return 'Peak + Deload: Test your max on main compound, then light pump work (15-12-10). Celebrate progress, prepare for next cycle.';
      case 'intensification':
        return 'Intensification (HIT-style): 2 working sets to FAILURE per exercise. Top set 5-8 reps, back-off set 10-12 reps. Log book everything.';
      case 'deload':
        return 'Deload: -40% volume, -10% intensity. Maintain frequency. Focus on movement quality and recovery (sleep, nutrition).';
      case 'accumulation':
        return 'Accumulation: Progressive overload through reps or sets. RPE 7-8. Auto-regulate based on daily readiness.';
      default:
        return 'Follow the planned workout. Log your sets and RPE for tracking.';
    }
  }

  private getProgressionNotesAr(exp: ExperienceLevel, goal: GoalType, week: number): string {
    if (['COMPLETE_BEGINNER', 'BEGINNER'].includes(exp)) {
      return 'تقدم خطي: زوّد 2.5 كيلو على تمارين الجزء العلوي و5 كيلو على السفلي كل جلسة لما تكمّل كل السيتات. ركّز على الفورم الأول.';
    }

    const phase = this.getPeriodizationPhase(week, exp, goal);

    switch (phase) {
      case 'volume':
        return 'مرحلة الحجم (أسلوب أرنولد): سيتات هرمية 12→10→8→6 على التمارين المركبة. ركّز على زيادة الأحمال — اضرب أرقام الأسبوع اللي فات.';
      case 'intensity':
        return 'مرحلة الشدة: هرمي تقيل 8→6→4→2، ستريب سيت على آخر مجموعة. ادفع بقوة — ده أسبوع النمو. RPE 9.';
      case 'density':
        return 'مرحلة الكثافة: 5×5 — نفس الوزن التقيل كل السيتات. ركّز على سرعة الرفع والقوة. راحة 2-3 دقائق.';
      case 'peak_deload':
        return 'القمة + راحة: جرّب أقصى وزن على التمرين الأساسي، بعدها شغل خفيف (15-12-10). احتفل بتقدمك واستعد للدورة الجاية.';
      case 'intensification':
        return 'مرحلة التكثيف (HIT): مجموعتين شغل للفشل لكل تمرين. المجموعة الأولى 5-8 عدات، الثانية 10-12 بوزن أقل.';
      case 'deload':
        return 'أسبوع تخفيف: ناقص 40% حجم، ناقص 10% شدة. حافظ على التكرار. ركّز على التعافي (نوم، أكل).';
      case 'accumulation':
        return 'مرحلة التراكم: تقدم من خلال العدّات أو السيتات. RPE 7-8. عدّل حسب جاهزيتك اليومية.';
      default:
        return 'كمّل التمرين المخطط. سجّل السيتات و RPE للمتابعة.';
    }
  }

  // ──────────────────────────────────────────────
  // PRIVATE: Title & Description Generation
  // ──────────────────────────────────────────────

  private generateTitle(duration: DurationType, muscles: string[], format: WorkoutFormat, goal: GoalType): string {
    const muscleStr = muscles.slice(0, 2).map(m => m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' ')).join(' & ');
    const formatStr: Record<WorkoutFormat, string> = {
      EMOM: 'EMOM', TABATA: 'Tabata', CIRCUIT: 'Circuit', SUPERSET: 'Superset',
      STRAIGHT_SETS: '', CLUSTER: 'Cluster', REST_PAUSE: 'Intensity', TRADITIONAL: '',
    };
    const prefix = formatStr[format] ? `${formatStr[format]} ` : '';
    return `${duration}-min ${prefix}${muscleStr} Session`;
  }

  private generateTitleAr(duration: DurationType, muscles: string[], format: WorkoutFormat, goal: GoalType): string {
    const muscleStr = muscles.slice(0, 2).map(m => MUSCLE_AR[m] || m).join(' و');
    return `جلسة ${duration} دقيقة — ${muscleStr}`;
  }

  private generateDescription(session: SessionInput, profile: UserProfile, muscleNames: string[], format: WorkoutFormat, phase: string): string {
    return `A ${session.availableMinutes}-minute ${format.toLowerCase().replace('_', ' ')} workout targeting ${muscleNames.join(', ')}. ` +
      `Phase: ${phase}. Location: ${session.location}. ` +
      `Designed for ${profile.experienceLevel.toLowerCase().replace('_', ' ')} level, goal: ${profile.fitnessGoal.toLowerCase().replace('_', ' ')}.`;
  }

  private generateDescriptionAr(session: SessionInput, profile: UserProfile, muscleNamesAr: string[], format: WorkoutFormat, phase: string): string {
    return `تمرين ${session.availableMinutes} دقيقة يستهدف ${muscleNamesAr.join(' و')}. ` +
      `مصمم لمستوى ${profile.experienceLevel === 'BEGINNER' ? 'مبتدئ' : profile.experienceLevel === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}.`;
  }

  private generateReason(muscles: string[], session: SessionInput, profile: UserProfile): string {
    const muscleStr = muscles.map(m => m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' ')).join(' and ');
    if (session.recentMusclesWorked.length === 0) {
      return `You haven't worked out recently. This ${muscleStr} workout is perfect to get back on track!`;
    }
    const freshMuscles = muscles.filter(m => !session.recentMusclesWorked.includes(m));
    if (freshMuscles.length > 0) {
      return `Your ${freshMuscles.map(m => m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' ')).join(' and ')} haven't been trained in 48+ hours — they're fully recovered and ready!`;
    }
    return `Based on your ${session.availableMinutes}-minute window and ${session.energyLevel} energy, this is the optimal workout for you right now.`;
  }

  private generateReasonAr(muscles: string[], session: SessionInput, profile: UserProfile): string {
    const muscleStr = muscles.map(m => MUSCLE_AR[m] || m).join(' و');
    if (session.recentMusclesWorked.length === 0) {
      return `لم تتمرن مؤخراً. تمرين ${muscleStr} مثالي للعودة!`;
    }
    return `${muscleStr} مرتاحين ومستعدين — أحسن وقت تتمرنهم!`;
  }

  // ──────────────────────────────────────────────
  // UTILITY
  // ──────────────────────────────────────────────

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
