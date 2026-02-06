import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   🔍 CHECKING FOR DUPLICATES                          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Total exercises
  const total = await prisma.exercise.count();
  console.log(`📊 Total exercises in database: ${total}`);

  // Check for duplicate externalIds
  const duplicateIds = await prisma.$queryRaw<{externalId: string, count: bigint}[]>`
    SELECT "externalId", COUNT(*) as count
    FROM "Exercise"
    GROUP BY "externalId"
    HAVING COUNT(*) > 1
  `;

  if (duplicateIds.length > 0) {
    console.log(`\n⚠️  Found ${duplicateIds.length} duplicate externalIds:`);
    for (const dup of duplicateIds) {
      console.log(`   - ${dup.externalId}: ${dup.count} times`);
    }
  } else {
    console.log('\n✅ No duplicate externalIds - all exercises are unique!');
  }

  // Check for duplicate names (informational)
  const duplicateNames = await prisma.$queryRaw<{nameEn: string, count: bigint}[]>`
    SELECT "nameEn", COUNT(*) as count
    FROM "Exercise"
    GROUP BY "nameEn"
    HAVING COUNT(*) > 1
    LIMIT 5
  `;

  if (duplicateNames.length > 0) {
    console.log(`\n⚠️  Found exercises with same name (different IDs):`);
    for (const dup of duplicateNames) {
      console.log(`   - "${dup.nameEn}": ${dup.count} times`);
    }
    console.log('   (This is OK if they have different externalIds)');
  }

  // Check foods
  const totalFoods = await prisma.food.count();
  console.log(`\n📊 Total foods in database: ${totalFoods}`);

  const duplicateFoods = await prisma.$queryRaw<{externalId: string, count: bigint}[]>`
    SELECT "externalId", COUNT(*) as count
    FROM "Food"
    WHERE "externalId" IS NOT NULL
    GROUP BY "externalId"
    HAVING COUNT(*) > 1
  `;

  if (duplicateFoods.length > 0) {
    console.log(`⚠️  Found ${duplicateFoods.length} duplicate food externalIds`);
  } else {
    console.log('✅ No duplicate food externalIds');
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
