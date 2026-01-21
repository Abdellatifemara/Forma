import { PrismaClient, DifficultyLevel, MuscleGroup, EquipmentType, ExerciseCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Mapping functions for data normalization
function mapDifficulty(diff: string): DifficultyLevel {
  const map: Record<string, DifficultyLevel> = {
    'beginner': 'BEGINNER',
    'intermediate': 'INTERMEDIATE',
    'advanced': 'ADVANCED',
    'expert': 'EXPERT',
  };
  return map[diff?.toLowerCase()] || 'BEGINNER';
}

function mapMuscle(muscle: string): MuscleGroup {
  const map: Record<string, MuscleGroup> = {
    'chest': 'CHEST',
    'back': 'BACK',
    'shoulders': 'SHOULDERS',
    'biceps': 'BICEPS',
    'triceps': 'TRICEPS',
    'forearms': 'FOREARMS',
    'abs': 'ABS',
    'core': 'ABS',
    'obliques': 'OBLIQUES',
    'lower back': 'LOWER_BACK',
    'lower_back': 'LOWER_BACK',
    'glutes': 'GLUTES',
    'quadriceps': 'QUADRICEPS',
    'quads': 'QUADRICEPS',
    'hamstrings': 'HAMSTRINGS',
    'calves': 'CALVES',
    'full body': 'FULL_BODY',
    'full_body': 'FULL_BODY',
    'cardio': 'CARDIO',
  };
  return map[muscle?.toLowerCase()] || 'FULL_BODY';
}

function mapEquipment(equip: string): EquipmentType {
  const map: Record<string, EquipmentType> = {
    'none': 'NONE',
    'bodyweight': 'BODYWEIGHT',
    'body weight': 'BODYWEIGHT',
    'dumbbells': 'DUMBBELLS',
    'dumbbell': 'DUMBBELLS',
    'barbell': 'BARBELL',
    'kettlebell': 'KETTLEBELL',
    'cables': 'CABLES',
    'cable': 'CABLES',
    'machines': 'MACHINES',
    'machine': 'MACHINES',
    'resistance bands': 'RESISTANCE_BANDS',
    'bands': 'RESISTANCE_BANDS',
    'trx': 'TRX',
    'suspension': 'TRX',
    'pull-up bar': 'PULL_UP_BAR',
    'pull up bar': 'PULL_UP_BAR',
    'pullup bar': 'PULL_UP_BAR',
    'bench': 'BENCH',
    'stability ball': 'STABILITY_BALL',
    'swiss ball': 'STABILITY_BALL',
    'foam roller': 'FOAM_ROLLER',
    'jump rope': 'JUMP_ROPE',
    'treadmill': 'TREADMILL',
    'bike': 'BIKE',
    'rowing': 'ROWING',
  };
  return map[equip?.toLowerCase()] || 'NONE';
}

function mapCategory(cat: string): ExerciseCategory {
  const map: Record<string, ExerciseCategory> = {
    'strength': 'STRENGTH',
    'cardio': 'CARDIO',
    'flexibility': 'FLEXIBILITY',
    'balance': 'BALANCE',
    'plyometric': 'PLYOMETRIC',
    'olympic': 'OLYMPIC',
    'calisthenics': 'CALISTHENICS',
    'yoga': 'YOGA',
    'pilates': 'PILATES',
    'mobility': 'MOBILITY',
  };
  return map[cat?.toLowerCase()] || 'STRENGTH';
}

interface ExerciseData {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  category?: string;
  primary_muscle: string;
  secondary_muscles?: string[];
  equipment?: string[];
  difficulty: string;
  instructions_en?: string[];
  instructions_ar?: string[];
  tips_en?: string[];
  tips_ar?: string[];
  is_time_based?: boolean;
  default_sets?: number;
  default_reps?: number;
  default_duration?: number;
  default_rest?: number;
  tags?: string[];
}

interface FoodData {
  id?: string;
  name_en: string;
  name_ar: string;
  brand_en?: string;
  brand_ar?: string;
  is_egyptian?: boolean;
  available_at?: string[];
  category: string;
  subcategory?: string;
  serving_size_g: number;
  serving_unit?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  tags?: string[];
}

async function loadExercises() {
  console.log('🏋️ Loading exercises...');

  const exercisesDir = path.join(__dirname, '../../../docs/exercises');
  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'lower-back', 'glutes', 'quadriceps', 'hamstrings', 'calves',
    'full-body', 'cardio'
  ];

  let totalExercises = 0;

  for (const muscle of muscleGroups) {
    const muscleDir = path.join(exercisesDir, muscle);

    if (!fs.existsSync(muscleDir)) {
      console.log(`  ⚠️ Directory not found: ${muscle}`);
      continue;
    }

    const files = fs.readdirSync(muscleDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(muscleDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Handle both array and object formats
        const exercises: ExerciseData[] = Array.isArray(data) ? data : [data];

        for (const ex of exercises) {
          await prisma.exercise.upsert({
            where: { externalId: ex.id },
            update: {
              nameEn: ex.name_en,
              nameAr: ex.name_ar,
              descriptionEn: ex.description_en,
              descriptionAr: ex.description_ar,
              category: mapCategory(ex.category || 'strength'),
              primaryMuscle: mapMuscle(ex.primary_muscle),
              secondaryMuscles: (ex.secondary_muscles || []).map(mapMuscle),
              equipment: (ex.equipment || ['bodyweight']).map(mapEquipment),
              difficulty: mapDifficulty(ex.difficulty),
              instructionsEn: ex.instructions_en || [],
              instructionsAr: ex.instructions_ar || [],
              tipsEn: ex.tips_en || [],
              tipsAr: ex.tips_ar || [],
              isTimeBased: ex.is_time_based || false,
              defaultSets: ex.default_sets || 3,
              defaultReps: ex.default_reps || 10,
              defaultDuration: ex.default_duration,
              defaultRest: ex.default_rest || 60,
              tags: ex.tags || [],
            },
            create: {
              externalId: ex.id,
              nameEn: ex.name_en,
              nameAr: ex.name_ar,
              descriptionEn: ex.description_en,
              descriptionAr: ex.description_ar,
              category: mapCategory(ex.category || 'strength'),
              primaryMuscle: mapMuscle(ex.primary_muscle),
              secondaryMuscles: (ex.secondary_muscles || []).map(mapMuscle),
              equipment: (ex.equipment || ['bodyweight']).map(mapEquipment),
              difficulty: mapDifficulty(ex.difficulty),
              instructionsEn: ex.instructions_en || [],
              instructionsAr: ex.instructions_ar || [],
              tipsEn: ex.tips_en || [],
              tipsAr: ex.tips_ar || [],
              isTimeBased: ex.is_time_based || false,
              defaultSets: ex.default_sets || 3,
              defaultReps: ex.default_reps || 10,
              defaultDuration: ex.default_duration,
              defaultRest: ex.default_rest || 60,
              tags: ex.tags || [],
            },
          });
          totalExercises++;
        }
      } catch (error) {
        console.error(`  ❌ Error loading ${file}:`, error);
      }
    }

    console.log(`  ✅ Loaded exercises from ${muscle}`);
  }

  console.log(`🏋️ Total exercises loaded: ${totalExercises}`);
}

async function loadFoods() {
  console.log('🍽️ Loading foods...');

  const foodsDir = path.join(__dirname, '../../../docs/nutrition');
  let totalFoods = 0;

  // Load main food database
  const foodFiles = [
    'egyptian-food-database.json',
    'supplements-database.json',
  ];

  for (const file of foodFiles) {
    const filePath = path.join(foodsDir, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ File not found: ${file}`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const foods: FoodData[] = Array.isArray(data) ? data : data.foods || data.items || [data];

      for (const food of foods) {
        const externalId = food.id || `food-${food.name_en.toLowerCase().replace(/\s+/g, '-')}`;

        await prisma.food.upsert({
          where: { externalId },
          update: {
            nameEn: food.name_en,
            nameAr: food.name_ar,
            brandEn: food.brand_en,
            brandAr: food.brand_ar,
            isEgyptian: food.is_egyptian || false,
            availableAt: food.available_at || [],
            category: food.category,
            subcategory: food.subcategory,
            servingSizeG: food.serving_size_g,
            servingUnit: food.serving_unit || 'g',
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g,
            sugarG: food.sugar_g,
            sodiumMg: food.sodium_mg,
            tags: food.tags || [],
          },
          create: {
            externalId,
            nameEn: food.name_en,
            nameAr: food.name_ar,
            brandEn: food.brand_en,
            brandAr: food.brand_ar,
            isEgyptian: food.is_egyptian || false,
            availableAt: food.available_at || [],
            category: food.category,
            subcategory: food.subcategory,
            servingSizeG: food.serving_size_g,
            servingUnit: food.serving_unit || 'g',
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g,
            sugarG: food.sugar_g,
            sodiumMg: food.sodium_mg,
            tags: food.tags || [],
          },
        });
        totalFoods++;
      }

      console.log(`  ✅ Loaded foods from ${file}`);
    } catch (error) {
      console.error(`  ❌ Error loading ${file}:`, error);
    }
  }

  console.log(`🍽️ Total foods loaded: ${totalFoods}`);
}

async function loadAchievements() {
  console.log('🏆 Loading achievements...');

  const achievements = [
    // Workout achievements
    { code: 'FIRST_WORKOUT', nameEn: 'First Step', nameAr: 'الخطوة الأولى', descriptionEn: 'Complete your first workout', descriptionAr: 'أكمل أول تمرين لك', category: 'workout', requirement: { type: 'workouts_completed', value: 1 }, xpReward: 50 },
    { code: 'WORKOUT_10', nameEn: 'Getting Started', nameAr: 'بداية الطريق', descriptionEn: 'Complete 10 workouts', descriptionAr: 'أكمل 10 تمارين', category: 'workout', requirement: { type: 'workouts_completed', value: 10 }, xpReward: 100 },
    { code: 'WORKOUT_50', nameEn: 'Dedicated', nameAr: 'مثابر', descriptionEn: 'Complete 50 workouts', descriptionAr: 'أكمل 50 تمرين', category: 'workout', requirement: { type: 'workouts_completed', value: 50 }, xpReward: 250 },
    { code: 'WORKOUT_100', nameEn: 'Century Club', nameAr: 'نادي المئة', descriptionEn: 'Complete 100 workouts', descriptionAr: 'أكمل 100 تمرين', category: 'workout', requirement: { type: 'workouts_completed', value: 100 }, xpReward: 500 },

    // Streak achievements
    { code: 'STREAK_7', nameEn: 'Week Warrior', nameAr: 'محارب الأسبوع', descriptionEn: '7 day workout streak', descriptionAr: 'سلسلة تمارين 7 أيام', category: 'streak', requirement: { type: 'workout_streak', value: 7 }, xpReward: 150 },
    { code: 'STREAK_30', nameEn: 'Monthly Master', nameAr: 'سيد الشهر', descriptionEn: '30 day workout streak', descriptionAr: 'سلسلة تمارين 30 يوم', category: 'streak', requirement: { type: 'workout_streak', value: 30 }, xpReward: 500 },

    // Nutrition achievements
    { code: 'FIRST_MEAL', nameEn: 'Fuel Up', nameAr: 'زود طاقتك', descriptionEn: 'Log your first meal', descriptionAr: 'سجل أول وجبة لك', category: 'nutrition', requirement: { type: 'meals_logged', value: 1 }, xpReward: 25 },
    { code: 'PROTEIN_GOAL', nameEn: 'Protein King', nameAr: 'ملك البروتين', descriptionEn: 'Hit protein goal 7 days in a row', descriptionAr: 'حقق هدف البروتين 7 أيام متتالية', category: 'nutrition', requirement: { type: 'protein_streak', value: 7 }, xpReward: 200 },

    // Progress achievements
    { code: 'FIRST_PROGRESS', nameEn: 'Tracking Progress', nameAr: 'تتبع التقدم', descriptionEn: 'Log your first progress photo', descriptionAr: 'سجل أول صورة تقدم', category: 'progress', requirement: { type: 'progress_photos', value: 1 }, xpReward: 50 },
    { code: 'WEIGHT_GOAL', nameEn: 'Goal Getter', nameAr: 'محقق الأهداف', descriptionEn: 'Reach your target weight', descriptionAr: 'وصلت لوزنك المستهدف', category: 'progress', requirement: { type: 'weight_goal_reached', value: 1 }, xpReward: 1000 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`🏆 Loaded ${achievements.length} achievements`);
}

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   🌱 FORMA DATABASE SEED                              ║');
  console.log('║   Shape Your Future                                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  try {
    await loadExercises();
    await loadFoods();
    await loadAchievements();

    console.log('');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
