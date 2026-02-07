import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestAccounts() {
  console.log('\n🚀 SEEDING TEST ACCOUNTS\n');

  const passwordHash = await bcrypt.hash('Forma2024!', 10);

  // ==========================================
  // 1. ADMIN ACCOUNT
  // ==========================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@forma.fitness' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@forma.fitness',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Forma',
      displayName: 'Admin',
      role: 'ADMIN',
      language: 'en',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });
  console.log(`✅ Admin account: admin@forma.fitness`);

  // ==========================================
  // 2. TRAINER ACCOUNT
  // ==========================================
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@forma.fitness' },
    update: { role: 'TRAINER' },
    create: {
      email: 'trainer@forma.fitness',
      passwordHash,
      firstName: 'Mohamed',
      lastName: 'Hassan',
      displayName: 'Coach Mo',
      gender: 'MALE',
      dateOfBirth: new Date('1990-05-15'),
      role: 'TRAINER',
      language: 'ar',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });

  // Create trainer profile
  const trainerProfile = await prisma.trainerProfile.upsert({
    where: { userId: trainer.id },
    update: {},
    create: {
      userId: trainer.id,
      bio: 'Certified personal trainer with 8+ years of experience. Specialized in body transformation and strength training. مدرب شخصي معتمد بخبرة أكثر من 8 سنوات.',
      specializations: ['STRENGTH', 'WEIGHT_LOSS', 'BODYBUILDING'],
      yearsExperience: 8,
      monthlyPrice: 500,
      status: 'APPROVED',
      averageRating: 4.8,
      totalReviews: 45,
      instagramHandle: 'coachmo_fitness',
      availableBalanceEGP: 2500,
      pendingPayoutEGP: 800,
    },
  });

  // Create trainer subscription (Premium+)
  await prisma.subscription.upsert({
    where: { userId: trainer.id },
    update: {},
    create: {
      userId: trainer.id,
      tier: 'PREMIUM_PLUS',
      status: 'ACTIVE',
      priceEGP: 0, // Trainers get free Premium+
      billingCycle: 'monthly',
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Trainer account: trainer@forma.fitness`);

  // ==========================================
  // 3. PREMIUM USER ACCOUNT
  // ==========================================
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@forma.fitness' },
    update: {},
    create: {
      email: 'premium@forma.fitness',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Khalil',
      displayName: 'Ahmed',
      gender: 'MALE',
      dateOfBirth: new Date('1995-08-20'),
      fitnessGoal: 'BUILD_MUSCLE',
      activityLevel: 'MODERATELY_ACTIVE',
      heightCm: 175,
      currentWeightKg: 78,
      targetWeightKg: 82,
      fitnessLevel: 'INTERMEDIATE',
      role: 'USER',
      language: 'en',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });

  // Create Premium subscription
  await prisma.subscription.upsert({
    where: { userId: premiumUser.id },
    update: {},
    create: {
      userId: premiumUser.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      priceEGP: 199,
      billingCycle: 'monthly',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Premium user account: premium@forma.fitness`);

  // ==========================================
  // 4. PREMIUM+ USER ACCOUNT
  // ==========================================
  const premiumPlusUser = await prisma.user.upsert({
    where: { email: 'vip@forma.fitness' },
    update: {},
    create: {
      email: 'vip@forma.fitness',
      passwordHash,
      firstName: 'Sara',
      lastName: 'Mostafa',
      displayName: 'Sara',
      gender: 'FEMALE',
      dateOfBirth: new Date('1992-03-10'),
      fitnessGoal: 'LOSE_WEIGHT',
      activityLevel: 'VERY_ACTIVE',
      heightCm: 165,
      currentWeightKg: 65,
      targetWeightKg: 58,
      fitnessLevel: 'ADVANCED',
      role: 'USER',
      language: 'ar',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });

  // Create Premium+ subscription
  await prisma.subscription.upsert({
    where: { userId: premiumPlusUser.id },
    update: {},
    create: {
      userId: premiumPlusUser.id,
      tier: 'PREMIUM_PLUS',
      status: 'ACTIVE',
      priceEGP: 699,
      billingCycle: 'monthly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Connect Premium+ user to trainer
  await prisma.trainerClient.upsert({
    where: {
      trainerId_clientId: {
        trainerId: trainerProfile.id,
        clientId: premiumPlusUser.id,
      },
    },
    update: {},
    create: {
      trainerId: trainerProfile.id,
      clientId: premiumPlusUser.id,
      isActive: true,
      complianceRate: 85,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Premium+ user account: vip@forma.fitness`);

  // Also connect Premium user to trainer (for testing)
  await prisma.trainerClient.upsert({
    where: {
      trainerId_clientId: {
        trainerId: trainerProfile.id,
        clientId: premiumUser.id,
      },
    },
    update: {},
    create: {
      trainerId: trainerProfile.id,
      clientId: premiumUser.id,
      isActive: true,
      complianceRate: 72,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`  ↳ Connected premium@forma.fitness to trainer`);

  // ==========================================
  // 5. FREE USER ACCOUNT
  // ==========================================
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@forma.fitness' },
    update: {},
    create: {
      email: 'free@forma.fitness',
      passwordHash,
      firstName: 'Omar',
      lastName: 'Ali',
      displayName: 'Omar',
      gender: 'MALE',
      dateOfBirth: new Date('2000-01-15'),
      fitnessGoal: 'IMPROVE_HEALTH',
      activityLevel: 'LIGHTLY_ACTIVE',
      heightCm: 180,
      currentWeightKg: 85,
      targetWeightKg: 75,
      fitnessLevel: 'BEGINNER',
      role: 'USER',
      language: 'en',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });

  // Create FREE subscription
  await prisma.subscription.upsert({
    where: { userId: freeUser.id },
    update: {},
    create: {
      userId: freeUser.id,
      tier: 'FREE',
      status: 'ACTIVE',
      priceEGP: 0,
    },
  });

  console.log(`✅ Free user account: free@forma.fitness`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   TEST ACCOUNTS CREATED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   All accounts use password: Forma2024!');
  console.log('');
  console.log('   👑 ADMIN:     admin@forma.fitness');
  console.log('   🏋️ TRAINER:   trainer@forma.fitness');
  console.log('   ⭐ PREMIUM:   premium@forma.fitness');
  console.log('   💎 PREMIUM+:  vip@forma.fitness');
  console.log('   🆓 FREE:      free@forma.fitness');
  console.log('═══════════════════════════════════════════════════════\n');
}

seedTestAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
