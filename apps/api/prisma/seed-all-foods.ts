import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface FoodData {
  id?: string;
  name_en: string;
  name_ar?: string;
  brand_en?: string | null;
  brand_ar?: string | null;
  category?: string;
  subcategory?: string;
  serving_size_g?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  is_egyptian?: boolean;
  barcode?: string | null;
  available_at?: string[];
  tags?: string[];
  // Alternate field names
  externalId?: string;
  nameEn?: string;
  nameAr?: string;
  brandEn?: string | null;
  brandAr?: string | null;
  servingSizeG?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  isEgyptian?: boolean;
  availableAt?: string[];
}

function normalizeFood(raw: FoodData, index: number): any {
  // Handle both snake_case and camelCase field names
  const externalId = raw.id || raw.externalId || `FOOD${String(index).padStart(5, '0')}`;
  const nameEn = raw.name_en || raw.nameEn || 'Unknown Food';
  const nameAr = raw.name_ar || raw.nameAr || nameEn;
  const brandEn = raw.brand_en || raw.brandEn || null;
  const brandAr = raw.brand_ar || raw.brandAr || null;
  const category = (raw.category || 'OTHER').toUpperCase();
  const subcategory = raw.subcategory || null;
  const servingSizeG = raw.serving_size_g || raw.servingSizeG || 100;
  const calories = raw.calories || 0;
  const proteinG = raw.protein_g || raw.proteinG || 0;
  const carbsG = raw.carbs_g || raw.carbsG || 0;
  const fatG = raw.fat_g || raw.fatG || 0;
  const fiberG = raw.fiber_g || raw.fiberG || 0;
  const isEgyptian = raw.is_egyptian ?? raw.isEgyptian ?? true;
  const barcode = raw.barcode || null;
  const availableAt = raw.available_at || raw.availableAt || ['Egyptian Markets'];
  const tags = raw.tags || [category.toLowerCase()];

  return {
    externalId,
    nameEn,
    nameAr,
    brandEn,
    brandAr,
    category,
    subcategory,
    servingSizeG,
    servingUnit: 'g',
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    isEgyptian,
    barcode,
    availableAt,
    tags
  };
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (item.endsWith('.json') && (item.includes('food') || item.includes('supplement'))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   🍽️  LOADING ALL FOODS & SUPPLEMENTS                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const seedDataDir = path.join(__dirname, 'seed-data');
  const allFoods: any[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  let skipped = 0;

  // Load from seed-data directory
  console.log('\n📂 Loading from seed-data/...');
  const jsonFiles = [
    'egyptian-foods.json',
    'egyptian-foods-complete.json',
    'egyptian-foods-part2.json',
    'egyptian-foods-part3.json',
    'expanded-foods.json',
    'parsed-foods.json',
    'parsed-supplements.json',
    'parsed-food-docs.json'
  ];

  for (const filename of jsonFiles) {
    const filePath = path.join(seedDataDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const items: FoodData[] = Array.isArray(data) ? data : [data];

        let fileAdded = 0;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const normalized = normalizeFood(item, allFoods.length + 1);

          // Skip duplicates by ID
          if (seenIds.has(normalized.externalId)) {
            skipped++;
            continue;
          }

          // Skip duplicates by exact name+brand combo
          const nameKey = `${normalized.nameEn}|${normalized.brandEn || ''}`.toLowerCase();
          if (seenNames.has(nameKey)) {
            skipped++;
            continue;
          }

          // Skip invalid items
          if (!normalized.nameEn || normalized.nameEn === 'Unknown Food') {
            skipped++;
            continue;
          }

          seenIds.add(normalized.externalId);
          seenNames.add(nameKey);
          allFoods.push(normalized);
          fileAdded++;
        }

        console.log(`  ✅ ${filename}: ${fileAdded} items added`);
      } catch (error: any) {
        console.log(`  ⚠️ ${filename}: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ ${filename}: not found`);
    }
  }

  console.log(`\n📊 Total unique foods to load: ${allFoods.length}`);
  console.log(`   Duplicates/invalid skipped: ${skipped}`);

  // Load in batches
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(allFoods.length / BATCH_SIZE);
  let loaded = 0;
  let errors = 0;

  console.log('\n⏳ Loading into database...');

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allFoods.length);
    const batch = allFoods.slice(start, end);

    try {
      await prisma.$transaction(
        batch.map((food) =>
          prisma.food.upsert({
            where: { externalId: food.externalId },
            update: {
              nameEn: food.nameEn,
              nameAr: food.nameAr,
              brandEn: food.brandEn,
              brandAr: food.brandAr,
              category: food.category,
              subcategory: food.subcategory,
              servingSizeG: food.servingSizeG,
              calories: food.calories,
              proteinG: food.proteinG,
              carbsG: food.carbsG,
              fatG: food.fatG,
              fiberG: food.fiberG,
              isEgyptian: food.isEgyptian,
              availableAt: food.availableAt,
              tags: food.tags
            },
            create: food
          })
        )
      );
      loaded += batch.length;
    } catch (err: any) {
      // If batch fails, try one by one
      for (const food of batch) {
        try {
          await prisma.food.upsert({
            where: { externalId: food.externalId },
            update: {
              nameEn: food.nameEn,
              nameAr: food.nameAr,
              brandEn: food.brandEn,
              brandAr: food.brandAr,
              category: food.category,
              subcategory: food.subcategory,
              servingSizeG: food.servingSizeG,
              calories: food.calories,
              proteinG: food.proteinG,
              carbsG: food.carbsG,
              fatG: food.fatG,
              fiberG: food.fiberG,
              isEgyptian: food.isEgyptian,
              availableAt: food.availableAt,
              tags: food.tags
            },
            create: food
          });
          loaded++;
        } catch (e: any) {
          errors++;
          if (errors <= 5) {
            console.log(`\n    ❌ Error: ${food.nameEn} - ${e.message?.substring(0, 50)}`);
          }
        }
      }
    }

    process.stdout.write(`\r  Progress: ${loaded}/${allFoods.length} (${Math.round(loaded/allFoods.length*100)}%)`);
  }

  // Get final count
  const dbCount = await prisma.food.count();

  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 FOOD DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Files processed: ${jsonFiles.length}`);
  console.log(`   Unique items found: ${allFoods.length}`);
  console.log(`   Successfully loaded: ${loaded}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   ✅ TOTAL IN DATABASE: ${dbCount}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
