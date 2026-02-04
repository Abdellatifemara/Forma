import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting quick seed...');

  // Load and seed foods
  const foodsPath = path.join(__dirname, 'seed-data/egyptian-foods.json');
  if (fs.existsSync(foodsPath)) {
    const foods = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));
    console.log(`📦 Loading ${foods.length} foods...`);

    for (const food of foods) {
      const id = `food-${food.name_en.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      try {
        await prisma.food.upsert({
          where: { externalId: id },
          update: {
            nameEn: food.name_en,
            nameAr: food.name_ar,
            category: food.category,
            servingSizeG: food.serving_size_g,
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g || 0,
            isEgyptian: food.is_egyptian || false,
          },
          create: {
            externalId: id,
            nameEn: food.name_en,
            nameAr: food.name_ar,
            category: food.category,
            servingSizeG: food.serving_size_g,
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g || 0,
            isEgyptian: food.is_egyptian || false,
          },
        });
      } catch (e) {
        console.log(`  Skipped ${food.name_en}`);
      }
    }
    console.log('✅ Foods loaded!');
  }

  // Load and seed exercises
  const exercisesPath = path.join(__dirname, 'seed-data/exercises.json');
  if (fs.existsSync(exercisesPath)) {
    const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
    console.log(`💪 Loading ${exercises.length} exercises...`);

    for (const ex of exercises) {
      try {
        await prisma.exercise.upsert({
          where: { externalId: ex.id },
          update: {
            nameEn: ex.name_en,
            nameAr: ex.name_ar,
            primaryMuscle: ex.primary_muscle,
            secondaryMuscles: ex.secondary_muscles || [],
            equipment: ex.equipment || [],
            difficulty: ex.difficulty?.toUpperCase() || 'BEGINNER',
            defaultSets: ex.default_sets || 3,
            defaultReps: ex.default_reps || 10,
            isTimeBased: ex.is_time_based || false,
            defaultDuration: ex.default_duration,
          },
          create: {
            externalId: ex.id,
            nameEn: ex.name_en,
            nameAr: ex.name_ar,
            category: ex.category?.toUpperCase() || 'STRENGTH',
            primaryMuscle: ex.primary_muscle,
            secondaryMuscles: ex.secondary_muscles || [],
            equipment: ex.equipment || [],
            difficulty: ex.difficulty?.toUpperCase() || 'BEGINNER',
            defaultSets: ex.default_sets || 3,
            defaultReps: ex.default_reps || 10,
            isTimeBased: ex.is_time_based || false,
            defaultDuration: ex.default_duration,
          },
        });
      } catch (e) {
        console.log(`  Skipped ${ex.name_en}`);
      }
    }
    console.log('✅ Exercises loaded!');
  }

  // Count results
  const foodCount = await prisma.food.count();
  const exerciseCount = await prisma.exercise.count();

  console.log('');
  console.log('📊 Database now has:');
  console.log(`   Foods: ${foodCount}`);
  console.log(`   Exercises: ${exerciseCount}`);
  console.log('');
  console.log('✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
