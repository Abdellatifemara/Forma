import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface FoodData {
  name_en: string;
  name_ar: string;
  brand_en?: string | null;
  brand_ar?: string | null;
  category: string;
  subcategory?: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  is_egyptian?: boolean;
  available_at?: string[];
  // Supplement-specific fields
  price_egp_min?: number;
  price_egp_max?: number;
  servings_per_container?: number;
  coach_notes?: string;
  benefits?: string[];
}

async function seedFoods() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   🍽️  FORMA FOOD DATABASE SEED                         ║');
  console.log('║   Comprehensive Egyptian & International Foods        ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  let totalLoaded = 0;
  let totalSkipped = 0;

  // Load expanded foods
  const expandedFoodsPath = path.join(__dirname, 'seed-data/expanded-foods.json');
  if (fs.existsSync(expandedFoodsPath)) {
    const foods: FoodData[] = JSON.parse(fs.readFileSync(expandedFoodsPath, 'utf-8'));
    console.log(`📦 Loading ${foods.length} foods from expanded-foods.json...`);

    for (const food of foods) {
      const id = `food-${food.name_en.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      try {
        await prisma.food.upsert({
          where: { externalId: id },
          update: {
            nameEn: food.name_en,
            nameAr: food.name_ar,
            brandEn: food.brand_en || null,
            brandAr: food.brand_ar || null,
            category: food.category,
            subcategory: food.subcategory || null,
            servingSizeG: food.serving_size_g,
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g || 0,
            sugarG: food.sugar_g || null,
            sodiumMg: food.sodium_mg || null,
            isEgyptian: food.is_egyptian || false,
            availableAt: food.available_at || [],
            tags: [food.category, food.subcategory || ''].filter(Boolean),
          },
          create: {
            externalId: id,
            nameEn: food.name_en,
            nameAr: food.name_ar,
            brandEn: food.brand_en || null,
            brandAr: food.brand_ar || null,
            category: food.category,
            subcategory: food.subcategory || null,
            servingSizeG: food.serving_size_g,
            calories: food.calories,
            proteinG: food.protein_g,
            carbsG: food.carbs_g,
            fatG: food.fat_g,
            fiberG: food.fiber_g || 0,
            sugarG: food.sugar_g || null,
            sodiumMg: food.sodium_mg || null,
            isEgyptian: food.is_egyptian || false,
            availableAt: food.available_at || [],
            tags: [food.category, food.subcategory || ''].filter(Boolean),
          },
        });
        totalLoaded++;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${food.name_en}: ${(e as Error).message}`);
        totalSkipped++;
      }
    }
    console.log(`✅ Loaded ${totalLoaded} foods from expanded-foods.json`);
  } else {
    console.log('⚠️ expanded-foods.json not found');
  }

  // Load supplements (stored as foods with SUPPLEMENTS category)
  const supplementsPath = path.join(__dirname, 'seed-data/supplements.json');
  if (fs.existsSync(supplementsPath)) {
    const supplements: FoodData[] = JSON.parse(fs.readFileSync(supplementsPath, 'utf-8'));
    console.log(`💊 Loading ${supplements.length} supplements...`);

    let suppLoaded = 0;
    for (const supp of supplements) {
      const id = `supp-${supp.name_en.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      try {
        await prisma.food.upsert({
          where: { externalId: id },
          update: {
            nameEn: supp.name_en,
            nameAr: supp.name_ar,
            brandEn: supp.brand_en || null,
            brandAr: supp.brand_ar || null,
            category: 'SUPPLEMENTS',
            subcategory: supp.subcategory || null,
            servingSizeG: supp.serving_size_g,
            calories: supp.calories,
            proteinG: supp.protein_g,
            carbsG: supp.carbs_g,
            fatG: supp.fat_g,
            fiberG: supp.fiber_g || 0,
            isEgyptian: supp.is_egyptian || false,
            availableAt: supp.available_at || [],
            tags: [
              'SUPPLEMENTS',
              supp.subcategory || '',
              ...(supp.benefits || []),
            ].filter(Boolean),
          },
          create: {
            externalId: id,
            nameEn: supp.name_en,
            nameAr: supp.name_ar,
            brandEn: supp.brand_en || null,
            brandAr: supp.brand_ar || null,
            category: 'SUPPLEMENTS',
            subcategory: supp.subcategory || null,
            servingSizeG: supp.serving_size_g,
            calories: supp.calories,
            proteinG: supp.protein_g,
            carbsG: supp.carbs_g,
            fatG: supp.fat_g,
            fiberG: supp.fiber_g || 0,
            isEgyptian: supp.is_egyptian || false,
            availableAt: supp.available_at || [],
            tags: [
              'SUPPLEMENTS',
              supp.subcategory || '',
              ...(supp.benefits || []),
            ].filter(Boolean),
          },
        });
        suppLoaded++;
        totalLoaded++;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${supp.name_en}: ${(e as Error).message}`);
        totalSkipped++;
      }
    }
    console.log(`✅ Loaded ${suppLoaded} supplements`);
  } else {
    console.log('⚠️ supplements.json not found');
  }

  // Load original egyptian foods (backward compatibility)
  const egyptianFoodsPath = path.join(__dirname, 'seed-data/egyptian-foods.json');
  if (fs.existsSync(egyptianFoodsPath)) {
    const foods: FoodData[] = JSON.parse(fs.readFileSync(egyptianFoodsPath, 'utf-8'));
    console.log(`🇪🇬 Checking ${foods.length} foods from egyptian-foods.json for duplicates...`);

    let origLoaded = 0;
    for (const food of foods) {
      const id = `food-${food.name_en.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      // Check if already exists (from expanded-foods.json)
      const existing = await prisma.food.findUnique({ where: { externalId: id } });
      if (existing) {
        continue; // Skip duplicates
      }

      try {
        await prisma.food.create({
          data: {
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
        origLoaded++;
        totalLoaded++;
      } catch (e) {
        totalSkipped++;
      }
    }
    if (origLoaded > 0) {
      console.log(`✅ Added ${origLoaded} additional foods from egyptian-foods.json`);
    }
  }

  // Count results
  const foodCount = await prisma.food.count();
  const egyptianCount = await prisma.food.count({ where: { isEgyptian: true } });
  const supplementCount = await prisma.food.count({ where: { category: 'SUPPLEMENTS' } });

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 FOOD DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total Foods: ${foodCount}`);
  console.log(`   Egyptian Foods: ${egyptianCount}`);
  console.log(`   Supplements: ${supplementCount}`);
  console.log(`   Loaded this run: ${totalLoaded}`);
  console.log(`   Skipped: ${totalSkipped}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('✨ Food database seed complete!');
}

seedFoods()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
