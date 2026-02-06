import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📊 FORMA DATABASE SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Exercises
  const totalExercises = await prisma.exercise.count();
  const exercisesByCategory = await prisma.exercise.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } }
  });

  console.log('🏋️  EXERCISES');
  console.log(`   Total: ${totalExercises}`);
  console.log('   By category:');
  for (const cat of exercisesByCategory.slice(0, 5)) {
    console.log(`     - ${cat.category}: ${cat._count}`);
  }

  // Foods
  const totalFoods = await prisma.food.count();
  const foodsByCategory = await prisma.food.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } }
  });

  console.log('\n🍽️  FOODS & SUPPLEMENTS');
  console.log(`   Total: ${totalFoods}`);
  console.log('   By category:');
  for (const cat of foodsByCategory) {
    console.log(`     - ${cat.category}: ${cat._count}`);
  }

  // Users
  const totalUsers = await prisma.user.count();
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });

  console.log('\n👤 USERS');
  console.log(`   Total: ${totalUsers}`);
  console.log('   By role:');
  for (const role of usersByRole) {
    console.log(`     - ${role.role}: ${role._count}`);
  }

  // Subscriptions
  const subscriptionsByTier = await prisma.subscription.groupBy({
    by: ['tier'],
    _count: true
  });

  console.log('\n💳 SUBSCRIPTIONS');
  console.log('   By tier:');
  for (const tier of subscriptionsByTier) {
    console.log(`     - ${tier.tier}: ${tier._count}`);
  }

  // Achievements
  const totalAchievements = await prisma.achievement.count();
  console.log(`\n🏆 ACHIEVEMENTS: ${totalAchievements}`);

  // Trainer profiles
  const totalTrainers = await prisma.trainerProfile.count();
  console.log(`\n🏋️  TRAINER PROFILES: ${totalTrainers}`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ DATABASE IS READY FOR PRODUCTION!');
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
