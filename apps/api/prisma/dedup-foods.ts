/**
 * Dedup Foods Script
 *
 * Finds duplicate foods by nameEn (case-insensitive) and keeps only the one
 * with the most complete data (highest calorie count as proxy for data quality).
 * Deletes duplicates that aren't referenced by any food logs.
 *
 * Run: npx ts-node prisma/dedup-foods.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding duplicate foods by name...');

  // Get all foods grouped by lowercase nameEn
  const allFoods = await prisma.food.findMany({
    select: {
      id: true,
      externalId: true,
      nameEn: true,
      nameAr: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      category: true,
    },
    orderBy: { nameEn: 'asc' },
  });

  // Group by lowercase name
  const groups = new Map<string, typeof allFoods>();
  for (const food of allFoods) {
    const key = food.nameEn.toLowerCase().trim();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(food);
  }

  // Find duplicates
  const duplicateGroups = [...groups.entries()].filter(([, items]) => items.length > 1);
  console.log(`Found ${duplicateGroups.length} foods with duplicates`);

  let totalDeleted = 0;
  let skipped = 0;

  for (const [name, items] of duplicateGroups) {
    // Sort by data completeness: prefer items with calories > 0, more macros filled
    const scored = items.map((item) => ({
      ...item,
      score:
        (item.calories > 0 ? 10 : 0) +
        (item.proteinG > 0 ? 3 : 0) +
        (item.carbsG > 0 ? 2 : 0) +
        (item.fatG > 0 ? 2 : 0) +
        (item.nameAr && item.nameAr !== item.nameEn ? 5 : 0),
    }));

    scored.sort((a, b) => b.score - a.score);
    const keep = scored[0];
    const toDelete = scored.slice(1);

    for (const dup of toDelete) {
      // Check if this food is referenced in any food logs
      const logCount = await prisma.foodLog.count({
        where: { foodId: dup.id },
      });

      if (logCount > 0) {
        // Don't delete — it's referenced. Update the log to point to the keeper instead.
        await prisma.foodLog.updateMany({
          where: { foodId: dup.id },
          data: { foodId: keep.id },
        });
        console.log(`  📎 ${name}: moved ${logCount} logs from ${dup.externalId} → ${keep.externalId}`);
      }

      await prisma.food.delete({ where: { id: dup.id } });
      totalDeleted++;
    }
  }

  console.log(`\n✅ Done! Deleted ${totalDeleted} duplicate foods, skipped ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
