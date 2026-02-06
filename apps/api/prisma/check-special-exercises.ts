import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('\n📊 SPECIAL EXERCISE CHECK\n');

  // Check kegel/pelvic exercises
  const pelvic = await prisma.exercise.findMany({
    where: { externalId: { startsWith: 'PF' } },
    select: { externalId: true, nameEn: true }
  });
  console.log(`🏃 Pelvic Floor (PF) exercises: ${pelvic.length}`);
  pelvic.slice(0, 5).forEach(e => console.log(`   - ${e.externalId}: ${e.nameEn}`));
  if (pelvic.length > 5) console.log(`   ... and ${pelvic.length - 5} more`);

  // Check calisthenics
  const calisthenics = await prisma.exercise.findMany({
    where: { externalId: { startsWith: 'CS' } },
    select: { externalId: true, nameEn: true }
  });
  console.log(`\n💪 Calisthenics (CS) exercises: ${calisthenics.length}`);
  calisthenics.slice(0, 5).forEach(e => console.log(`   - ${e.externalId}: ${e.nameEn}`));
  if (calisthenics.length > 5) console.log(`   ... and ${calisthenics.length - 5} more`);

  // Count by category
  const byCategory = await prisma.exercise.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } }
  });
  console.log('\n📊 All Categories:');
  byCategory.forEach(c => console.log(`   - ${c.category}: ${c._count}`));

  await prisma.$disconnect();
}

check().catch(console.error);
