import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n📊 FORMA DATABASE STATUS\n');

  const exerciseCount = await prisma.exercise.count();
  const foodCount = await prisma.food.count();
  const egyptianFoodCount = await prisma.food.count({ where: { isEgyptian: true } });
  const supplementCount = await prisma.food.count({ where: { category: 'SUPPLEMENTS' } });
  const userCount = await prisma.user.count();
  const achievementCount = await prisma.achievement.count();

  console.log('═══════════════════════════════════════════════════════');
  console.log(`   💪 Exercises: ${exerciseCount}`);
  console.log(`   🍽️  Total Foods: ${foodCount}`);
  console.log(`   🇪🇬 Egyptian Foods: ${egyptianFoodCount}`);
  console.log(`   💊 Supplements: ${supplementCount}`);
  console.log(`   👤 Users: ${userCount}`);
  console.log(`   🏆 Achievements: ${achievementCount}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Sample exercises by muscle group
  const muscleGroups = await prisma.exercise.groupBy({
    by: ['primaryMuscle'],
    _count: true,
  });

  console.log('📋 Exercises by Muscle Group:');
  muscleGroups.forEach(mg => {
    console.log(`   ${mg.primaryMuscle}: ${mg._count}`);
  });

  // Sample food categories
  const foodCategories = await prisma.food.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('\n🍽️  Foods by Category:');
  foodCategories.forEach(fc => {
    console.log(`   ${fc.category}: ${fc._count}`);
  });
}

checkDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
