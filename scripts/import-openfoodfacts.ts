/**
 * Import foods from Open Food Facts (Egyptian products)
 *
 * Queries the Open Food Facts API for products sold in Egypt
 * that have images and complete nutrition data.
 *
 * Run on VPS (needs network): npx ts-node scripts/import-openfoodfacts.ts
 * Output: apps/api/prisma/seed-data/openfoodfacts-egypt-{N}.json
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';
const OUTPUT_DIR = path.join(__dirname, '..', 'apps', 'api', 'prisma', 'seed-data');
const BATCH_SIZE = 100; // items per API page
const MAX_PAGES = 30;   // up to 3000 products

interface OFFProduct {
  product_name?: string;
  product_name_ar?: string;
  product_name_en?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
  countries_tags?: string[];
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  code?: string; // barcode
}

interface FoodItem {
  id: string;
  name_en: string;
  name_ar: string;
  brand_en: string | null;
  brand_ar: string | null;
  category: string;
  subcategory: string | null;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_egyptian: boolean;
  barcode: string | null;
  imageUrl: string | null;
  available_at: string[];
  tags: string[];
}

// Map OFF categories to our categories
function mapCategory(categoryTags: string[]): string {
  const cats = categoryTags.join(',').toLowerCase();
  if (cats.includes('dairy') || cats.includes('milk') || cats.includes('cheese') || cats.includes('yogurt')) return 'DAIRY';
  if (cats.includes('meat') || cats.includes('chicken') || cats.includes('beef') || cats.includes('poultry')) return 'PROTEIN';
  if (cats.includes('fish') || cats.includes('seafood') || cats.includes('tuna')) return 'PROTEIN';
  if (cats.includes('snack') || cats.includes('chip') || cats.includes('biscuit') || cats.includes('cookie')) return 'SNACKS';
  if (cats.includes('beverage') || cats.includes('drink') || cats.includes('juice') || cats.includes('water')) return 'BEVERAGES';
  if (cats.includes('bread') || cats.includes('cereal') || cats.includes('grain') || cats.includes('pasta') || cats.includes('rice')) return 'GRAINS';
  if (cats.includes('fruit') || cats.includes('vegetable')) return 'FRUITS_VEGETABLES';
  if (cats.includes('oil') || cats.includes('sauce') || cats.includes('condiment')) return 'CONDIMENTS';
  if (cats.includes('chocolate') || cats.includes('sweet') || cats.includes('candy') || cats.includes('dessert')) return 'DESSERTS';
  if (cats.includes('supplement') || cats.includes('protein') || cats.includes('whey')) return 'SUPPLEMENTS';
  if (cats.includes('frozen')) return 'FROZEN';
  if (cats.includes('nut') || cats.includes('seed')) return 'NUTS_SEEDS';
  if (cats.includes('legume') || cats.includes('bean') || cats.includes('lentil')) return 'LEGUMES';
  return 'OTHER';
}

function parseServingSize(servingStr?: string): number {
  if (!servingStr) return 100;
  const match = servingStr.match(/(\d+\.?\d*)\s*g/i);
  return match ? parseFloat(match[1]) : 100;
}

async function fetchPage(page: number): Promise<OFFProduct[]> {
  const url = `${API_BASE}?` + new URLSearchParams({
    tagtype_0: 'countries',
    tag_contains_0: 'contains',
    tag_0: 'Egypt',
    action: 'process',
    json: '1',
    page_size: String(BATCH_SIZE),
    page: String(page),
    // Only get products with images and nutrition
    fields: 'product_name,product_name_ar,product_name_en,brands,image_url,image_front_url,image_front_small_url,categories_tags,countries_tags,nutriments,serving_size,code',
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.products || [];
}

function isValidProduct(p: OFFProduct): boolean {
  // Must have a name
  const name = p.product_name_en || p.product_name || '';
  if (!name || name.length < 2) return false;

  // Must have an image
  if (!p.image_url && !p.image_front_url) return false;

  // Must have calories
  const cal = p.nutriments?.['energy-kcal_100g'];
  if (!cal || cal <= 0) return false;

  // Must have at least one macro
  const prot = p.nutriments?.proteins_100g || 0;
  const carbs = p.nutriments?.carbohydrates_100g || 0;
  const fat = p.nutriments?.fat_100g || 0;
  if (prot === 0 && carbs === 0 && fat === 0) return false;

  // Sanity check: calories shouldn't be absurd
  if (cal > 1000) return false;

  return true;
}

function convertProduct(p: OFFProduct, index: number): FoodItem {
  const nameEn = (p.product_name_en || p.product_name || '').trim();
  const nameAr = (p.product_name_ar || nameEn).trim();
  const brand = (p.brands || '').trim() || null;
  const imageUrl = p.image_front_url || p.image_url || null;
  const barcode = p.code || null;

  return {
    id: `OFF-EG-${barcode || String(index).padStart(5, '0')}`,
    name_en: nameEn,
    name_ar: nameAr,
    brand_en: brand,
    brand_ar: brand, // Same brand name usually
    category: mapCategory(p.categories_tags || []),
    subcategory: null,
    serving_size_g: parseServingSize(p.serving_size),
    calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
    protein_g: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
    carbs_g: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
    fat_g: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
    fiber_g: Math.round((p.nutriments?.fiber_100g || 0) * 10) / 10,
    is_egyptian: true,
    barcode,
    imageUrl,
    available_at: ['Egyptian Markets', 'Supermarkets'],
    tags: ['openfoodfacts', 'egyptian'],
  };
}

async function main() {
  console.log('🌍 Importing Egyptian foods from Open Food Facts...\n');

  const allFoods: FoodItem[] = [];
  const seenNames = new Set<string>();
  const seenBarcodes = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      console.log(`📄 Fetching page ${page}/${MAX_PAGES}...`);
      const products = await fetchPage(page);

      if (products.length === 0) {
        console.log('  No more products. Done fetching.');
        break;
      }

      let added = 0;
      for (const p of products) {
        if (!isValidProduct(p)) continue;

        // Dedup by name
        const nameKey = (p.product_name_en || p.product_name || '').toLowerCase().trim();
        if (seenNames.has(nameKey)) continue;

        // Dedup by barcode
        if (p.code && seenBarcodes.has(p.code)) continue;

        seenNames.add(nameKey);
        if (p.code) seenBarcodes.add(p.code);

        allFoods.push(convertProduct(p, allFoods.length));
        added++;
      }

      console.log(`  Got ${products.length} products, ${added} valid & unique. Total: ${allFoods.length}`);

      // Rate limit: 100ms between requests
      await new Promise(r => setTimeout(r, 100));
    } catch (err: any) {
      console.error(`  ❌ Page ${page} failed: ${err.message}`);
      // Wait longer on error
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n📊 Total valid Egyptian foods: ${allFoods.length}`);

  // Split into files of 200 items each
  const ITEMS_PER_FILE = 200;
  const fileCount = Math.ceil(allFoods.length / ITEMS_PER_FILE);

  for (let i = 0; i < fileCount; i++) {
    const start = i * ITEMS_PER_FILE;
    const end = Math.min(start + ITEMS_PER_FILE, allFoods.length);
    const batch = allFoods.slice(start, end);
    const filename = `openfoodfacts-egypt-${i + 1}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(batch, null, 2), 'utf-8');
    console.log(`  💾 ${filename}: ${batch.length} items`);
  }

  // Also output stats
  const categories: Record<string, number> = {};
  const withImages = allFoods.filter(f => f.imageUrl).length;
  for (const f of allFoods) {
    categories[f.category] = (categories[f.category] || 0) + 1;
  }

  console.log(`\n📈 Stats:`);
  console.log(`  With images: ${withImages}/${allFoods.length} (${Math.round(100 * withImages / allFoods.length)}%)`);
  console.log(`  Categories:`);
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`);
  }

  console.log('\n✅ Done! Run seed-all-foods.ts to load into database.');
}

main().catch(console.error);
