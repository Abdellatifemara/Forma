import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectPremiumToTrainer() {
  console.log('\n🔗 Connecting premium user to trainer...\n');

  // Find the trainer profile
  const trainer = await prisma.user.findUnique({
    where: { email: 'trainer@forma.fitness' },
    include: { trainerProfile: true },
  });

  if (!trainer || !trainer.trainerProfile) {
    console.error('❌ Trainer not found!');
    return;
  }

  // Find the premium user
  const premiumUser = await prisma.user.findUnique({
    where: { email: 'premium@forma.fitness' },
  });

  if (!premiumUser) {
    console.error('❌ Premium user not found!');
    return;
  }

  // Create the trainer-client relationship
  const trainerClient = await prisma.trainerClient.upsert({
    where: {
      trainerId_clientId: {
        trainerId: trainer.trainerProfile.id,
        clientId: premiumUser.id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      trainerId: trainer.trainerProfile.id,
      clientId: premiumUser.id,
      isActive: true,
      startDate: new Date(),
      complianceRate: 75,
    },
  });

  console.log('✅ Premium user connected to trainer!');
  console.log(`   Client ID: ${trainerClient.clientId}`);
  console.log(`   Trainer ID: ${trainerClient.trainerId}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   TEST CHAT BETWEEN:');
  console.log('   🏋️ TRAINER: trainer@forma.fitness (Password: Forma2024!)');
  console.log('   ⭐ PREMIUM:  premium@forma.fitness (Password: Forma2024!)');
  console.log('═══════════════════════════════════════════════════════\n');
}

connectPremiumToTrainer()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
