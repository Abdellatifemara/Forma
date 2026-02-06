import * as fs from 'fs';
import * as path from 'path';

interface FoodItem {
  id: string;
  name_en: string;
  name_ar: string;
  brand_en: string | null;
  brand_ar: string | null;
  category: string;
  subcategory: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_egyptian: boolean;
  barcode: string | null;
  available_at: string[];
}

function generateFoodId(category: string, name: string, index: number): string {
  const catPrefix: Record<string, string> = {
    'proteins': 'PRO',
    'carbohydrates': 'CARB',
    'fats': 'FAT',
    'vegetables': 'VEG',
    'fruits': 'FRT',
    'dairy': 'DRY',
    'beverages': 'BEV',
    'traditional': 'TRAD',
    'snacks': 'SNK',
    'supplements': 'SUP'
  };
  const prefix = catPrefix[category.toLowerCase()] || 'FOOD';
  return `${prefix}${String(index).padStart(4, '0')}`;
}

function parseNutrition(value: string): number {
  // Remove 'g' suffix and parse number
  const cleaned = value.replace(/[g%]/gi, '').trim();
  return parseFloat(cleaned) || 0;
}

function parseFoodMarkdown(content: string): FoodItem[] {
  const foods: FoodItem[] = [];
  let currentSection = '';
  let currentSubsection = '';
  let idCounter = 1;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track sections
    if (line.startsWith('# SECTION')) {
      const match = line.match(/SECTION \d+:\s*(.+)/i);
      if (match) currentSection = match[1].trim();
      continue;
    }

    if (line.startsWith('## ')) {
      currentSubsection = line.replace('## ', '').replace(/\d+\.\d+\s*/, '').trim();
      continue;
    }

    // Parse table rows (skip headers)
    if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('food') && !line.toLowerCase().includes('calories/')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);

      if (cells.length >= 5) {
        // Parse standard food table: | Food | Arabic | Calories | Protein | Carbs | Fat | ...
        const nameEn = cells[0];
        const nameAr = cells[1] || nameEn;

        // Skip if this looks like a header
        if (nameEn.toLowerCase() === 'food' || nameEn.includes('---')) continue;

        // Find calorie column (usually index 2)
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        let fiber = 0;

        // Try to parse nutritional values
        for (let j = 2; j < cells.length && j < 7; j++) {
          const val = parseNutrition(cells[j]);
          if (j === 2) calories = val;
          else if (j === 3) protein = val;
          else if (j === 4) carbs = val;
          else if (j === 5) fat = val;
          else if (j === 6) fiber = val;
        }

        // Only add if we have valid data
        if (nameEn && calories > 0) {
          foods.push({
            id: generateFoodId(currentSection, nameEn, idCounter++),
            name_en: nameEn.replace(/\([^)]*\)/g, '').trim(),
            name_ar: nameAr,
            brand_en: null,
            brand_ar: null,
            category: mapCategory(currentSection),
            subcategory: currentSubsection,
            serving_size_g: 100, // Default per 100g
            calories: Math.round(calories),
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            fiber_g: fiber,
            is_egyptian: true,
            barcode: null,
            available_at: ['Egyptian Markets']
          });
        }
      }
    }
  }

  return foods;
}

function mapCategory(section: string): string {
  const lower = section.toLowerCase();
  if (lower.includes('protein')) return 'PROTEIN';
  if (lower.includes('carb')) return 'CARBS';
  if (lower.includes('fat') || lower.includes('oil')) return 'FATS';
  if (lower.includes('vegetable')) return 'VEGETABLES';
  if (lower.includes('fruit')) return 'FRUITS';
  if (lower.includes('dairy')) return 'DAIRY';
  if (lower.includes('beverage') || lower.includes('drink')) return 'BEVERAGES';
  if (lower.includes('snack')) return 'SNACKS';
  if (lower.includes('supplement')) return 'SUPPLEMENTS';
  return 'OTHER';
}

interface SupplementItem {
  id: string;
  name_en: string;
  name_ar: string;
  brand_en: string;
  brand_ar: string | null;
  category: string;
  subcategory: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  price_egp: number | null;
  where_to_buy: string[];
  is_supplement: boolean;
}

function parseSupplementMarkdown(content: string): SupplementItem[] {
  const supplements: SupplementItem[] = [];
  let currentSection = '';
  let idCounter = 1;

  // Pattern to match supplement blocks
  const blockPattern = /####\s+(.+?)(?=\n)/g;
  const attributePattern = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;

  let match;
  const blocks: {name: string; startIndex: number; endIndex: number}[] = [];

  // Find all supplement headers
  while ((match = blockPattern.exec(content)) !== null) {
    blocks.push({
      name: match[1].trim(),
      startIndex: match.index,
      endIndex: content.length
    });
  }

  // Set end indices
  for (let i = 0; i < blocks.length - 1; i++) {
    blocks[i].endIndex = blocks[i + 1].startIndex;
  }

  // Parse each block
  for (const block of blocks) {
    const blockContent = content.substring(block.startIndex, block.endIndex);
    const attributes: Record<string, string> = {};

    let attrMatch;
    while ((attrMatch = attributePattern.exec(blockContent)) !== null) {
      const key = attrMatch[1].toLowerCase().trim();
      const value = attrMatch[2].trim();
      if (key !== 'attribute' && key !== '---') {
        attributes[key] = value;
      }
    }

    if (Object.keys(attributes).length > 0) {
      const brandEn = attributes['brand'] || 'Unknown';
      const productName = attributes['product'] || block.name;

      // Parse protein per scoop
      let protein = 0;
      if (attributes['protein/scoop']) {
        protein = parseNutrition(attributes['protein/scoop']);
      }

      // Parse price
      let price = null;
      for (const key of Object.keys(attributes)) {
        if (key.includes('price')) {
          const priceMatch = attributes[key].match(/[\d,]+/);
          if (priceMatch) {
            price = parseInt(priceMatch[0].replace(/,/g, ''));
          }
          break;
        }
      }

      supplements.push({
        id: `SUP${String(idCounter++).padStart(4, '0')}`,
        name_en: `${brandEn} ${productName}`,
        name_ar: attributes['arabic'] || productName,
        brand_en: brandEn,
        brand_ar: attributes['arabic'] || null,
        category: 'SUPPLEMENTS',
        subcategory: determineSupplementType(block.name, currentSection),
        serving_size_g: 30, // Typical scoop
        calories: protein > 0 ? protein * 4 + 10 : 120, // Rough estimate
        protein_g: protein,
        carbs_g: 3, // Typical for protein
        fat_g: 1,
        fiber_g: 0,
        price_egp: price,
        where_to_buy: (attributes['where to buy'] || 'Olympia, iHerb').split(',').map(s => s.trim()),
        is_supplement: true
      });
    }
  }

  return supplements;
}

function determineSupplementType(name: string, section: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('whey') || lower.includes('casein') || lower.includes('protein')) return 'Protein Powder';
  if (lower.includes('creatine')) return 'Creatine';
  if (lower.includes('bcaa') || lower.includes('amino')) return 'Amino Acids';
  if (lower.includes('pre-workout') || lower.includes('preworkout')) return 'Pre-Workout';
  if (lower.includes('omega') || lower.includes('fish oil')) return 'Omega-3';
  if (lower.includes('vitamin') || lower.includes('multi')) return 'Vitamins';
  if (lower.includes('mass') || lower.includes('gainer')) return 'Mass Gainer';
  if (lower.includes('fat burner') || lower.includes('thermogenic')) return 'Fat Burner';
  return 'Supplement';
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   🍽️  PARSING FOOD & SUPPLEMENT DATABASES              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const docsDir = path.join(__dirname, '../../../docs/nutrition');
  const outputDir = path.join(__dirname, 'seed-data');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalFoods = 0;
  let totalSupplements = 0;

  // Parse Egyptian food database
  const foodDbPath = path.join(docsDir, 'egyptian-food-database.md');
  if (fs.existsSync(foodDbPath)) {
    console.log('📂 Parsing egyptian-food-database.md...');
    const content = fs.readFileSync(foodDbPath, 'utf-8');
    const foods = parseFoodMarkdown(content);

    const outputPath = path.join(outputDir, 'parsed-foods.json');
    fs.writeFileSync(outputPath, JSON.stringify(foods, null, 2));
    console.log(`  ✅ Parsed ${foods.length} food items`);
    totalFoods += foods.length;
  }

  // Parse supplements database
  const supDbPath = path.join(docsDir, 'egyptian-market-supplements.md');
  if (fs.existsSync(supDbPath)) {
    console.log('📂 Parsing egyptian-market-supplements.md...');
    const content = fs.readFileSync(supDbPath, 'utf-8');
    const supplements = parseSupplementMarkdown(content);

    const outputPath = path.join(outputDir, 'parsed-supplements.json');
    fs.writeFileSync(outputPath, JSON.stringify(supplements, null, 2));
    console.log(`  ✅ Parsed ${supplements.length} supplement items`);
    totalSupplements += supplements.length;
  }

  // Also parse food folder markdown files
  const foodDocsDir = path.join(__dirname, '../../../docs/food');
  if (fs.existsSync(foodDocsDir)) {
    console.log('\n📂 Parsing docs/food/ markdown files...');
    const allFoodFolderItems: FoodItem[] = [];

    function parseDir(dir: string) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          parseDir(fullPath);
        } else if (item.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const foods = parseFoodMarkdown(content);
          if (foods.length > 0) {
            console.log(`  ✅ ${path.relative(foodDocsDir, fullPath)}: ${foods.length} items`);
            allFoodFolderItems.push(...foods);
          }
        }
      }
    }

    parseDir(foodDocsDir);

    if (allFoodFolderItems.length > 0) {
      const outputPath = path.join(outputDir, 'parsed-food-docs.json');
      fs.writeFileSync(outputPath, JSON.stringify(allFoodFolderItems, null, 2));
      totalFoods += allFoodFolderItems.length;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 PARSING SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total food items parsed: ${totalFoods}`);
  console.log(`   Total supplements parsed: ${totalSupplements}`);
  console.log(`   Output directory: ${outputDir}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
