import { PrismaClient, ExerciseCategory, DifficultyLevel, MuscleGroup, EquipmentType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

// Map folder/category names to ExerciseCategory enum
function mapToExerciseCategory(folder: string, category: string): ExerciseCategory {
  const lowerFolder = folder.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (lowerFolder.includes('cardio') || lowerCat === 'cardio') return 'CARDIO';
  if (lowerFolder.includes('mobility') || lowerFolder.includes('stretches')) return 'MOBILITY';
  if (lowerFolder.includes('yoga')) return 'YOGA';
  if (lowerFolder.includes('power') || lowerFolder.includes('plyometrics')) return 'PLYOMETRIC';
  if (lowerFolder.includes('recovery') || lowerFolder.includes('meditation')) return 'FLEXIBILITY';
  if (lowerFolder.includes('calisthenics') || lowerCat === 'calisthenics') return 'CALISTHENICS';

  // Default most exercises to STRENGTH
  return 'STRENGTH';
}

// Map string to MuscleGroup enum
function mapToMuscleGroup(muscle: string): MuscleGroup {
  const muscleMap: Record<string, MuscleGroup> = {
    'CHEST': 'CHEST',
    'BACK': 'BACK',
    'LATS': 'BACK',
    'UPPER_BACK': 'BACK',
    'LOWER_BACK': 'LOWER_BACK',
    'SHOULDERS': 'SHOULDERS',
    'FRONT_DELTS': 'SHOULDERS',
    'SIDE_DELTS': 'SHOULDERS',
    'REAR_DELTS': 'SHOULDERS',
    'BICEPS': 'BICEPS',
    'TRICEPS': 'TRICEPS',
    'FOREARMS': 'FOREARMS',
    'ABS': 'ABS',
    'CORE': 'ABS',
    'DEEP_CORE': 'ABS',
    'OBLIQUES': 'OBLIQUES',
    'GLUTES': 'GLUTES',
    'QUADS': 'QUADRICEPS',
    'QUADRICEPS': 'QUADRICEPS',
    'HAMSTRINGS': 'HAMSTRINGS',
    'CALVES': 'CALVES',
    'HIP_FLEXORS': 'GLUTES',
    'PELVIC_FLOOR': 'ABS',
    'FULL_BODY': 'FULL_BODY',
    'CARDIO': 'CARDIO',
  };

  const upper = muscle.toUpperCase().replace(/-/g, '_');
  return muscleMap[upper] || 'FULL_BODY';
}

// Map string to EquipmentType enum
function mapToEquipment(equip: string): EquipmentType {
  const equipMap: Record<string, EquipmentType> = {
    'NONE': 'NONE',
    'BODYWEIGHT': 'BODYWEIGHT',
    'DUMBBELLS': 'DUMBBELLS',
    'DUMBBELL': 'DUMBBELLS',
    'BARBELL': 'BARBELL',
    'KETTLEBELL': 'KETTLEBELL',
    'CABLES': 'CABLES',
    'CABLE': 'CABLES',
    'MACHINES': 'MACHINES',
    'MACHINE': 'MACHINES',
    'RESISTANCE_BANDS': 'RESISTANCE_BANDS',
    'RESISTANCE_BAND': 'RESISTANCE_BANDS',
    'TRX': 'TRX',
    'PULL_UP_BAR': 'PULL_UP_BAR',
    'BENCH': 'BENCH',
    'STABILITY_BALL': 'STABILITY_BALL',
    'FOAM_ROLLER': 'FOAM_ROLLER',
    'JUMP_ROPE': 'JUMP_ROPE',
    'TREADMILL': 'TREADMILL',
    'BIKE': 'BIKE',
    'ROWING': 'ROWING',
  };

  const upper = equip.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  return equipMap[upper] || 'NONE';
}

// Map string to DifficultyLevel enum
function mapToDifficulty(diff: string): DifficultyLevel {
  const diffMap: Record<string, DifficultyLevel> = {
    'BEGINNER': 'BEGINNER',
    'EASY': 'BEGINNER',
    'INTERMEDIATE': 'INTERMEDIATE',
    'MEDIUM': 'INTERMEDIATE',
    'ADVANCED': 'ADVANCED',
    'HARD': 'ADVANCED',
    'EXPERT': 'EXPERT',
  };

  return diffMap[diff.toUpperCase()] || 'INTERMEDIATE';
}

async function getJsonFiles(dir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  }

  await walk(dir);
  return results;
}

async function seedExercises() {
  console.log('Starting exercise seed...');

  const exercisesDir = path.resolve(__dirname, '../../../docs/exercises');

  try {
    await fs.access(exercisesDir);
  } catch {
    console.error(`Exercises directory not found at: ${exercisesDir}`);
    return;
  }

  const files = await getJsonFiles(exercisesDir);
  console.log(`Found ${files.length} JSON files to process.`);

  let totalProcessed = 0;
  let totalErrors = 0;

  for (const file of files) {
    const relativePath = path.relative(exercisesDir, file);
    const folderName = path.dirname(relativePath);
    console.log(`\nProcessing: ${relativePath}`);

    try {
      const content = await fs.readFile(file, 'utf-8');
      const exercises = JSON.parse(content);

      if (!Array.isArray(exercises)) {
        console.warn(`Skipping ${relativePath}: Root is not an array`);
        continue;
      }

      console.log(`   Importing ${exercises.length} exercises...`);

      for (const ex of exercises) {
        try {
          const externalId = ex.id || ex.externalId;
          if (!externalId) {
            console.warn(`   Skipping exercise without ID`);
            totalErrors++;
            continue;
          }

          // Map snake_case JSON to camelCase schema
          const data = {
            nameEn: ex.name_en || ex.nameEn || 'Unnamed',
            nameAr: ex.name_ar || ex.nameAr || ex.name_en || 'بدون اسم',
            descriptionEn: ex.description_en || ex.descriptionEn || null,
            descriptionAr: ex.description_ar || ex.descriptionAr || null,
            category: mapToExerciseCategory(folderName, ex.category || ''),
            primaryMuscle: mapToMuscleGroup(ex.primary_muscle || ex.primaryMuscle || 'FULL_BODY'),
            secondaryMuscles: (ex.secondary_muscles || ex.secondaryMuscles || []).map(mapToMuscleGroup),
            equipment: (ex.equipment || []).map(mapToEquipment),
            difficulty: mapToDifficulty(ex.difficulty || 'INTERMEDIATE'),
            instructionsEn: ex.instructions_en || ex.instructionsEn || [],
            instructionsAr: ex.instructions_ar || ex.instructionsAr || [],
            tipsEn: ex.tips_en || ex.tipsEn || [],
            tipsAr: ex.tips_ar || ex.tipsAr || [],
            videoUrl: ex.video_url || ex.videoUrl || null,
            thumbnailUrl: ex.thumbnail_url || ex.thumbnailUrl || null,
            isTimeBased: ex.is_time_based || ex.isTimeBased || false,
            defaultSets: ex.default_sets || ex.defaultSets || 3,
            defaultReps: ex.default_reps || ex.defaultReps || 10,
            defaultDuration: ex.default_duration || ex.defaultDuration || null,
            defaultRest: ex.default_rest || ex.defaultRest || 60,
            tags: ex.tags || [],
          };

          await prisma.exercise.upsert({
            where: { externalId },
            update: data,
            create: { externalId, ...data },
          });
          totalProcessed++;
        } catch (err) {
          const id = ex.id || ex.externalId || 'unknown';
          console.error(`   Failed to import ${id}:`, err instanceof Error ? err.message : err);
          totalErrors++;
        }
      }
    } catch (err) {
      console.error(`Error reading file ${file}:`, err);
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`   Processed: ${totalProcessed}`);
  console.log(`   Errors:    ${totalErrors}`);
}

seedExercises()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
