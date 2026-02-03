import { PrismaClient, ExerciseCategory, DifficultyLevel, MuscleGroup, EquipmentType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

async function getJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(entry.path, entry.name));
}

async function seedExercises() {
  console.log('🌱 Starting exercise seed...');
  
  // Path to docs/exercises relative to apps/api
  const exercisesDir = path.resolve(__dirname, '../../../../docs/exercises');
  
  try {
    await fs.access(exercisesDir);
  } catch (e) {
    console.error(`❌ Exercises directory not found at: ${exercisesDir}`);
    return;
  }

  const files = await getJsonFiles(exercisesDir);
  console.log(`Found ${files.length} JSON files to process.`);

  let totalProcessed = 0;
  let totalErrors = 0;

  for (const file of files) {
    const relativePath = path.relative(exercisesDir, file);
    console.log(`\nProcessing: ${relativePath}`);
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const exercises = JSON.parse(content);
      
      if (!Array.isArray(exercises)) {
        console.warn(`⚠️  Skipping ${relativePath}: Root is not an array`);
        continue;
      }

      console.log(`   Importing ${exercises.length} exercises...`);

      for (const ex of exercises) {
        try {
          // Map string values to Enums if necessary, or assume JSON matches Schema
          await prisma.exercise.upsert({
            where: { externalId: ex.externalId },
            update: {
              nameEn: ex.nameEn,
              nameAr: ex.nameAr,
              descriptionEn: ex.descriptionEn,
              descriptionAr: ex.descriptionAr,
              category: ex.category as ExerciseCategory,
              primaryMuscle: ex.primaryMuscle as MuscleGroup,
              secondaryMuscles: ex.secondaryMuscles as MuscleGroup[],
              equipment: ex.equipment as EquipmentType[],
              difficulty: ex.difficulty as DifficultyLevel,
              instructionsEn: ex.instructionsEn,
              instructionsAr: ex.instructionsAr,
              tipsEn: ex.tipsEn,
              tipsAr: ex.tipsAr,
              videoUrl: ex.videoUrl,
              thumbnailUrl: ex.thumbnailUrl,
              // Default metrics if missing
              defaultSets: ex.defaultSets || 3,
              defaultReps: ex.defaultReps || 10,
              defaultRest: ex.defaultRest || 60,
            },
            create: {
              externalId: ex.externalId,
              nameEn: ex.nameEn,
              nameAr: ex.nameAr,
              descriptionEn: ex.descriptionEn,
              descriptionAr: ex.descriptionAr,
              category: ex.category as ExerciseCategory,
              primaryMuscle: ex.primaryMuscle as MuscleGroup,
              secondaryMuscles: ex.secondaryMuscles as MuscleGroup[],
              equipment: ex.equipment as EquipmentType[],
              difficulty: ex.difficulty as DifficultyLevel,
              instructionsEn: ex.instructionsEn,
              instructionsAr: ex.instructionsAr,
              tipsEn: ex.tipsEn,
              tipsAr: ex.tipsAr,
              videoUrl: ex.videoUrl,
              thumbnailUrl: ex.thumbnailUrl,
            },
          });
          totalProcessed++;
        } catch (err) {
          console.error(`   ❌ Failed to import ${ex.externalId}:`, err);
          totalErrors++;
        }
      }
    } catch (err) {
      console.error(`❌ Error reading file ${file}:`, err);
    }
  }

  console.log(`\n✅ Seeding complete!`);
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