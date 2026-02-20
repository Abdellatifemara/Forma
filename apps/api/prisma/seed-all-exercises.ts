import { PrismaClient, DifficultyLevel, MuscleGroup, EquipmentType, ExerciseCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
    'lats': 'BACK',
    'traps': 'BACK',
    'rhomboids': 'BACK',
    'upper_back': 'BACK',
    'rear_delts': 'SHOULDERS',
    'rear delts': 'SHOULDERS',
    'rotator_cuff': 'SHOULDERS',
    'hip_flexors': 'QUADRICEPS',
    'hip_abductors': 'GLUTES',
    'adductors': 'QUADRICEPS',
    'neck': 'FULL_BODY',
    'grip': 'FOREARMS',
    'serratus_anterior': 'ABS',
    'brachioradialis': 'FOREARMS',
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
    'resistance_bands': 'RESISTANCE_BANDS',
    'bands': 'RESISTANCE_BANDS',
    'trx': 'TRX',
    'suspension': 'TRX',
    'pull-up bar': 'PULL_UP_BAR',
    'pull up bar': 'PULL_UP_BAR',
    'pull_up_bar': 'PULL_UP_BAR',
    'pullup bar': 'PULL_UP_BAR',
    'bench': 'BENCH',
    'stability ball': 'STABILITY_BALL',
    'stability_ball': 'STABILITY_BALL',
    'swiss ball': 'STABILITY_BALL',
    'foam roller': 'FOAM_ROLLER',
    'foam_roller': 'FOAM_ROLLER',
    'jump rope': 'JUMP_ROPE',
    'jump_rope': 'JUMP_ROPE',
    'treadmill': 'TREADMILL',
    'bike': 'BIKE',
    'rowing': 'ROWING',
    'rowing_machine': 'ROWING',
    'resistance_band': 'RESISTANCE_BANDS',
    'resistance band': 'RESISTANCE_BANDS',
    'ab_wheel': 'NONE',
    'medicine_ball': 'NONE',
    'battle_ropes': 'NONE',
    'sled': 'NONE',
    'tire': 'NONE',
    'plyo_box': 'NONE',
    'assault_bike': 'BIKE',
    'ski_erg': 'ROWING',
    'heavy_bag': 'NONE',
    'speed_bag': 'NONE',
    'parallel_bars': 'NONE',
    'smith_machine': 'MACHINES',
    'specialty_bar': 'BARBELL',
    'ez_bar': 'BARBELL',
    'plate': 'BARBELL',
    'chair': 'NONE',
    'step': 'NONE',
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
    'chest': 'STRENGTH',
    'back': 'STRENGTH',
    'legs': 'STRENGTH',
    'shoulders': 'STRENGTH',
    'arms': 'STRENGTH',
    'core': 'STRENGTH',
    'powerlifting': 'STRENGTH',
    'olympic_weightlifting': 'OLYMPIC',
    'resistance_band': 'STRENGTH',
    'machine': 'STRENGTH',
    'dumbbell': 'STRENGTH',
    'barbell': 'STRENGTH',
    'conditioning': 'CARDIO',
    'seniors': 'BALANCE',
    'home': 'STRENGTH',
    'crossfit': 'PLYOMETRIC',
    'sport_specific': 'PLYOMETRIC',
  };
  return map[cat?.toLowerCase()] || 'STRENGTH';
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

interface ExerciseData {
  id: string;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  category?: string;
  primary_muscle?: string;
  secondary_muscles?: string[];
  equipment?: string | string[];
  difficulty?: string;
  instructions_en?: string[];
  instructions_ar?: string[];
  tips_en?: string[];
  tips_ar?: string[];
  is_time_based?: boolean;
  default_sets?: number;
  default_reps?: number | string;
  default_duration?: number;
  default_rest?: number;
  tags?: string[];
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   🏋️  LOADING ALL 5000+ EXERCISES                      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Search both docs/exercises and prisma/seed-data for exercise files
  const exercisesDir = path.join(__dirname, '../../../docs/exercises');
  const seedDataDir = path.join(__dirname, 'seed-data');

  // Exercise keywords to match files in seed-data
  const exerciseKeywords = [
    'exercise', 'powerlifting', 'yoga', 'calisthenics', 'stretching',
    'crossfit', 'olympic', 'resistance-band', 'machine-cable', 'core-abs',
    'mobility-rehab', 'dumbbell-exercises', 'barbell-compound', 'sport-conditioning',
    'seniors-beginners', 'sport-agility', 'kettlebell', 'boxing', 'martial-arts',
    'swimming', 'rehab-physio', 'office-senior', 'band-trx', 'functional-mobility',
    'home-bodyweight', 'gym-machine', 'drills'
  ];

  const jsonFiles = [
    ...findJsonFiles(exercisesDir),
    ...(fs.existsSync(seedDataDir)
      ? fs.readdirSync(seedDataDir)
          .filter(f => f.endsWith('.json') && exerciseKeywords.some(kw => f.toLowerCase().includes(kw)))
          .map(f => path.join(seedDataDir, f))
      : [])
  ];

  console.log(`📂 Found ${jsonFiles.length} exercise JSON files\n`);

  let totalLoaded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const seenIds = new Set<string>();

  // Collect all exercises first
  const allExercises: any[] = [];

  for (const filePath of jsonFiles) {
    const relativePath = path.relative(exercisesDir, filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const exercises: ExerciseData[] = Array.isArray(data) ? data : [data];

      for (const ex of exercises) {
        if (!ex.id || !ex.name_en) {
          totalSkipped++;
          continue;
        }

        if (seenIds.has(ex.id)) {
          totalSkipped++;
          continue;
        }
        seenIds.add(ex.id);

        allExercises.push({
          externalId: ex.id,
          nameEn: ex.name_en,
          nameAr: ex.name_ar || ex.name_en,
          descriptionEn: ex.description_en || '',
          descriptionAr: ex.description_ar || '',
          category: mapCategory(ex.category || 'strength'),
          primaryMuscle: mapMuscle(ex.primary_muscle || 'full body'),
          secondaryMuscles: (ex.secondary_muscles || []).map(mapMuscle),
          equipment: Array.isArray(ex.equipment)
            ? ex.equipment.map(mapEquipment)
            : [mapEquipment(ex.equipment || 'bodyweight')],
          difficulty: mapDifficulty(ex.difficulty || 'beginner'),
          instructionsEn: ex.instructions_en || [],
          instructionsAr: ex.instructions_ar || [],
          tipsEn: ex.tips_en || [],
          tipsAr: ex.tips_ar || [],
          isTimeBased: ex.is_time_based || false,
          defaultSets: ex.default_sets || 3,
          defaultReps: typeof ex.default_reps === 'string'
            ? parseInt(ex.default_reps) || 10
            : ex.default_reps || 10,
          defaultDuration: ex.default_duration || null,
          defaultRest: ex.default_rest || 60,
          tags: ex.tags || [],
        });
      }

      console.log(`  ✅ ${relativePath}`);
    } catch (error: any) {
      console.error(`  ❌ ${relativePath}: ${error.message}`);
    }
  }

  console.log(`\n📊 Found ${allExercises.length} unique exercises to load\n`);

  // Process in batches of 100 using transactions
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(allExercises.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allExercises.length);
    const batch = allExercises.slice(start, end);

    try {
      await prisma.$transaction(
        batch.map((ex) =>
          prisma.exercise.upsert({
            where: { externalId: ex.externalId },
            update: {
              nameEn: ex.nameEn,
              nameAr: ex.nameAr,
              descriptionEn: ex.descriptionEn,
              descriptionAr: ex.descriptionAr,
              category: ex.category,
              primaryMuscle: ex.primaryMuscle,
              secondaryMuscles: ex.secondaryMuscles,
              equipment: ex.equipment,
              difficulty: ex.difficulty,
              instructionsEn: ex.instructionsEn,
              instructionsAr: ex.instructionsAr,
              tipsEn: ex.tipsEn,
              tipsAr: ex.tipsAr,
              isTimeBased: ex.isTimeBased,
              defaultSets: ex.defaultSets,
              defaultReps: ex.defaultReps,
              defaultDuration: ex.defaultDuration,
              defaultRest: ex.defaultRest,
              tags: ex.tags,
            },
            create: ex,
          })
        )
      );
      totalLoaded += batch.length;
      process.stdout.write(`\r  ⏳ Progress: ${totalLoaded}/${allExercises.length} (${Math.round(totalLoaded/allExercises.length*100)}%)`);
    } catch (err: any) {
      // If batch fails, try one by one
      for (const ex of batch) {
        try {
          await prisma.exercise.upsert({
            where: { externalId: ex.externalId },
            update: {
              nameEn: ex.nameEn,
              nameAr: ex.nameAr,
              descriptionEn: ex.descriptionEn,
              descriptionAr: ex.descriptionAr,
              category: ex.category,
              primaryMuscle: ex.primaryMuscle,
              secondaryMuscles: ex.secondaryMuscles,
              equipment: ex.equipment,
              difficulty: ex.difficulty,
              instructionsEn: ex.instructionsEn,
              instructionsAr: ex.instructionsAr,
              tipsEn: ex.tipsEn,
              tipsAr: ex.tipsAr,
              isTimeBased: ex.isTimeBased,
              defaultSets: ex.defaultSets,
              defaultReps: ex.defaultReps,
              defaultDuration: ex.defaultDuration,
              defaultRest: ex.defaultRest,
              tags: ex.tags,
            },
            create: ex,
          });
          totalLoaded++;
        } catch (e: any) {
          totalErrors++;
          console.error(`\n    ❌ Error on ${ex.externalId}: ${e.message}`);
        }
      }
      process.stdout.write(`\r  ⏳ Progress: ${totalLoaded}/${allExercises.length} (${Math.round(totalLoaded/allExercises.length*100)}%)`);
    }
  }

  // Get final count from database
  const dbCount = await prisma.exercise.count();

  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 EXERCISE DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Files processed: ${jsonFiles.length}`);
  console.log(`   Unique exercises found: ${allExercises.length}`);
  console.log(`   Successfully loaded: ${totalLoaded}`);
  console.log(`   Duplicates skipped: ${totalSkipped}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   ✅ TOTAL IN DATABASE: ${dbCount}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
