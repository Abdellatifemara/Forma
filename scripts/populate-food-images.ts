/**
 * Populate food imageUrl fields using free external CDN images
 *
 * Sources:
 * 1. Spoonacular CDN: https://img.spoonacular.com/ingredients_250x250/{name}.jpg
 *    - Free, no API key, reliable CDN for ingredient images
 *    - ~2000+ ingredients with clean studio photos
 *
 * 2. Open Food Facts: images from product pages
 *    - Used for branded/packaged products (already in import script)
 *
 * Run: npx ts-node scripts/populate-food-images.ts
 * Updates all food JSON files in seed-data/ with imageUrl field
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPOONACULAR_CDN = 'https://img.spoonacular.com/ingredients_250x250';

// Comprehensive mapping: food name keywords → spoonacular image filename
// Verified filenames from spoonacular's ingredient database
const INGREDIENT_IMAGE_MAP: Record<string, string> = {
  // === PROTEINS ===
  'chicken breast': 'chicken-breasts.jpg',
  'chicken thigh': 'chicken-thighs.jpg',
  'chicken': 'whole-chicken.jpg',
  'chicken liver': 'chicken-livers.jpg',
  'chicken wing': 'chicken-wings.jpg',
  'chicken shawarma': 'chicken-breasts.jpg',
  'grilled chicken': 'chicken-breasts.jpg',
  'beef': 'beef-cubes.jpg',
  'beef liver': 'beef-liver.jpg',
  'steak': 'beef-steak.jpg',
  'ribeye': 'ribeye-steak.jpg',
  'tenderloin': 'beef-tenderloin.jpg',
  'ground beef': 'ground-beef.jpg',
  'veal': 'veal.jpg',
  'lamb': 'lamb-loin-chops.jpg',
  'lamb chop': 'lamb-loin-chops.jpg',
  'kofta': 'ground-beef.jpg',
  'kebab': 'beef-cubes.jpg',
  'turkey': 'turkey-breast.jpg',

  // === FISH & SEAFOOD ===
  'fish': 'fish-fillets.jpg',
  'tilapia': 'tilapia-fillets.jpg',
  'salmon': 'salmon.jpg',
  'tuna': 'canned-tuna.jpg',
  'sardine': 'sardines.jpg',
  'shrimp': 'shrimp.jpg',
  'calamari': 'squid.jpg',
  'crab': 'crabmeat.jpg',
  'sea bass': 'sea-bass.jpg',
  'mackerel': 'mackerel.jpg',
  'cod': 'cod-fillets.jpg',

  // === EGGS ===
  'egg': 'egg.png',
  'whole egg': 'egg.png',
  'egg white': 'egg-white.jpg',
  'egg yolk': 'egg-yolk.jpg',
  'fried egg': 'fried-egg.jpg',
  'boiled egg': 'hard-boiled-egg.jpg',
  'omelette': 'egg.png',
  'scrambled egg': 'egg.png',

  // === DAIRY ===
  'milk': 'milk.jpg',
  'yogurt': 'yogurt.jpg',
  'zabadi': 'yogurt.jpg',
  'greek yogurt': 'greek-yogurt.jpg',
  'cheese': 'cheddar-cheese.jpg',
  'white cheese': 'feta-cheese.jpg',
  'feta': 'feta-cheese.jpg',
  'mozzarella': 'mozzarella.jpg',
  'cream cheese': 'cream-cheese.jpg',
  'cottage cheese': 'cottage-cheese.jpg',
  'areesh': 'cottage-cheese.jpg',
  'labneh': 'yogurt.jpg',
  'butter': 'butter.jpg',
  'cream': 'heavy-cream.jpg',
  'ice cream': 'ice-cream.jpg',

  // === GRAINS & BREAD ===
  'rice': 'rice.jpg',
  'white rice': 'white-rice.jpg',
  'brown rice': 'brown-rice.jpg',
  'bread': 'bread.jpg',
  'toast': 'bread-slices.jpg',
  'pita': 'pita-bread.jpg',
  'baladi bread': 'pita-bread.jpg',
  'fino': 'bread.jpg',
  'pasta': 'pasta.jpg',
  'spaghetti': 'spaghetti.jpg',
  'macaroni': 'macaroni.jpg',
  'oat': 'oats.jpg',
  'oatmeal': 'oatmeal.jpg',
  'cereal': 'cereal.jpg',
  'cornflakes': 'corn-flakes.jpg',
  'quinoa': 'quinoa.jpg',
  'couscous': 'couscous.jpg',
  'flour': 'flour.jpg',
  'corn': 'corn.jpg',
  'tortilla': 'flour-tortilla.jpg',

  // === LEGUMES ===
  'lentil': 'lentils.jpg',
  'fava bean': 'fava-beans.jpg',
  'ful medames': 'fava-beans.jpg',
  'ful': 'fava-beans.jpg',
  'chickpea': 'chickpeas.jpg',
  'hummus': 'hummus.jpg',
  'falafel': 'falafel.jpg',
  "ta'ameya": 'falafel.jpg',
  'taamiya': 'falafel.jpg',
  'white bean': 'white-beans.jpg',
  'kidney bean': 'kidney-beans.jpg',
  'black bean': 'black-beans.jpg',
  'pea': 'peas.jpg',

  // === FRUITS ===
  'apple': 'apple.jpg',
  'banana': 'bananas.jpg',
  'orange': 'orange.jpg',
  'mango': 'mango.jpg',
  'strawberry': 'strawberries.jpg',
  'grape': 'grapes.jpg',
  'watermelon': 'watermelon.jpg',
  'date': 'dates.jpg',
  'fig': 'figs.jpg',
  'pomegranate': 'pomegranate.jpg',
  'guava': 'guava.jpg',
  'pineapple': 'pineapple.jpg',
  'peach': 'peach.jpg',
  'pear': 'pear.jpg',
  'lemon': 'lemon.jpg',
  'lime': 'lime.jpg',
  'coconut': 'coconut.jpg',
  'avocado': 'avocado.jpg',
  'kiwi': 'kiwi.jpg',
  'cherry': 'cherries.jpg',
  'blueberry': 'blueberries.jpg',
  'raspberry': 'raspberries.jpg',
  'cantaloupe': 'cantaloupe.jpg',
  'plum': 'plum.jpg',
  'apricot': 'apricots.jpg',

  // === VEGETABLES ===
  'tomato': 'tomato.jpg',
  'potato': 'potatoes.jpg',
  'sweet potato': 'sweet-potato.jpg',
  'onion': 'onion.jpg',
  'garlic': 'garlic.jpg',
  'carrot': 'carrots.jpg',
  'cucumber': 'cucumber.jpg',
  'pepper': 'bell-pepper.jpg',
  'lettuce': 'lettuce.jpg',
  'spinach': 'spinach.jpg',
  'broccoli': 'broccoli.jpg',
  'cauliflower': 'cauliflower.jpg',
  'cabbage': 'cabbage.jpg',
  'zucchini': 'zucchini.jpg',
  'eggplant': 'eggplant.jpg',
  'okra': 'okra.jpg',
  'green bean': 'green-beans.jpg',
  'mushroom': 'mushrooms.jpg',
  'celery': 'celery.jpg',
  'beet': 'beets.jpg',
  'radish': 'radishes.jpg',
  'turnip': 'turnip.jpg',
  'artichoke': 'artichoke.jpg',
  'asparagus': 'asparagus.jpg',
  'molokhia': 'spinach.jpg',
  'bamia': 'okra.jpg',

  // === NUTS & SEEDS ===
  'almond': 'almonds.jpg',
  'walnut': 'walnuts.jpg',
  'peanut': 'peanuts.jpg',
  'peanut butter': 'peanut-butter.jpg',
  'cashew': 'cashews.jpg',
  'pistachio': 'pistachios.jpg',
  'hazelnut': 'hazelnuts.jpg',
  'sunflower seed': 'sunflower-seeds.jpg',
  'chia seed': 'chia-seeds.jpg',
  'flax': 'flaxseed.jpg',
  'sesame': 'sesame-seeds.jpg',
  'tahini': 'tahini.jpg',
  'coconut oil': 'coconut-oil.jpg',

  // === OILS & CONDIMENTS ===
  'olive oil': 'olive-oil.jpg',
  'vegetable oil': 'vegetable-oil.jpg',
  'honey': 'honey.jpg',
  'sugar': 'sugar.jpg',
  'salt': 'salt.jpg',
  'vinegar': 'vinegar.jpg',
  'soy sauce': 'soy-sauce.jpg',
  'ketchup': 'ketchup.jpg',
  'mustard': 'mustard.jpg',
  'mayonnaise': 'mayonnaise.jpg',
  'hot sauce': 'hot-sauce.jpg',
  'tomato sauce': 'tomato-sauce.jpg',
  'tomato paste': 'tomato-paste.jpg',

  // === BEVERAGES ===
  'coffee': 'brewed-coffee.jpg',
  'tea': 'tea-bags.jpg',
  'green tea': 'green-tea-bags.jpg',
  'juice': 'orange-juice.jpg',
  'orange juice': 'orange-juice.jpg',
  'water': 'water.jpg',
  'coconut water': 'coconut-water.jpg',
  'smoothie': 'smoothie.jpg',

  // === SUPPLEMENTS ===
  'whey protein': 'protein-powder.jpg',
  'protein powder': 'protein-powder.jpg',
  'creatine': 'protein-powder.jpg',
  'bcaa': 'protein-powder.jpg',
  'pre-workout': 'protein-powder.jpg',
  'multivitamin': 'vitamins.jpg',
  'omega': 'fish-oil.jpg',
  'fish oil': 'fish-oil.jpg',

  // === EGYPTIAN DISHES ===
  'koshari': 'macaroni.jpg',
  'fiteer': 'pita-bread.jpg',
  'shawarma': 'chicken-breasts.jpg',
  'hawawshi': 'ground-beef.jpg',
  'mahshi': 'zucchini.jpg',
  'moussaka': 'eggplant.jpg',
  'fattah': 'rice.jpg',
  'basbousa': 'semolina.jpg',
  'kunafa': 'vermicelli.jpg',
  'konafa': 'vermicelli.jpg',
  'baklava': 'phyllo-dough.jpg',
  'roz bel laban': 'rice-pudding.jpg',

  // === SNACKS & SWEETS ===
  'chocolate': 'chocolate.jpg',
  'biscuit': 'cookies.jpg',
  'cookie': 'cookies.jpg',
  'cake': 'cake.jpg',
  'chips': 'potato-chips.jpg',
  'popcorn': 'popcorn.jpg',
  'granola': 'granola.jpg',
  'protein bar': 'granola-bar.jpg',
  'energy bar': 'granola-bar.jpg',
  'brownie': 'brownies.jpg',
  'croissant': 'croissants.jpg',
  'danish': 'danish-pastry.jpg',
  'muffin': 'muffins.jpg',
  'donut': 'doughnut.jpg',
  'waffle': 'waffles.jpg',
  'pancake': 'pancakes.jpg',
  'crepe': 'crepes.jpg',
  'bounty': 'chocolate.jpg',
  'snickers': 'chocolate.jpg',
  'twix': 'chocolate.jpg',
  'kitkat': 'chocolate.jpg',
  'mars': 'chocolate.jpg',
  'candy': 'candy.jpg',
  'crackers': 'crackers.jpg',
  'ritz': 'crackers.jpg',
  'cotton candy': 'sugar.jpg',

  // === MORE EGYPTIAN FOODS ===
  'aish': 'pita-bread.jpg',
  'baladi': 'pita-bread.jpg',
  'baba ghanoush': 'eggplant.jpg',
  'ghanoush': 'eggplant.jpg',
  'balah el sham': 'doughnut.jpg',
  'atayef': 'crepes.jpg',
  'qatayef': 'crepes.jpg',
  'ashura': 'rice-pudding.jpg',
  'koshary': 'macaroni.jpg',
  'molasses': 'molasses.jpg',
  'asal': 'honey.jpg',
  'kharroub': 'carob.jpg',
  'carob': 'carob.jpg',
  'ghazl': 'sugar.jpg',
  'sambousek': 'dumplings.jpg',
  'dim sum': 'dumplings.jpg',
  'dumpling': 'dumplings.jpg',
  'spring roll': 'spring-rolls.jpg',
  'bulgur': 'bulgur.jpg',
  'borgol': 'bulgur.jpg',
  'freekeh': 'bulgur.jpg',

  // === DRINKS & BRANDS ===
  'coca-cola': 'cola.jpg',
  'cola': 'cola.jpg',
  'pepsi': 'cola.jpg',
  'sprite': 'lemon-lime-soda.jpg',
  'fanta': 'orange-juice.jpg',
  'latte': 'brewed-coffee.jpg',
  'cappuccino': 'brewed-coffee.jpg',
  'espresso': 'brewed-coffee.jpg',
  'americano': 'brewed-coffee.jpg',
  'mocha': 'brewed-coffee.jpg',
  'macchiato': 'brewed-coffee.jpg',
  'frappuccino': 'brewed-coffee.jpg',
  'chai': 'tea-bags.jpg',
  'malt': 'malt-syrup.jpg',
  'birell': 'malt-syrup.jpg',
  'energy drink': 'energy-drink.jpg',
  'red bull': 'energy-drink.jpg',
  'monster': 'energy-drink.jpg',
  'cocoa': 'cocoa-powder.jpg',
  'hot chocolate': 'cocoa-powder.jpg',

  // === MORE SUPPLEMENTS ===
  'collagen': 'protein-powder.jpg',
  'casein': 'protein-powder.jpg',
  'ashwagandha': 'vitamins.jpg',
  'beta-alanine': 'protein-powder.jpg',
  'cla': 'fish-oil.jpg',
  'dextrose': 'sugar.jpg',
  'glutamine': 'protein-powder.jpg',
  'l-carnitine': 'protein-powder.jpg',
  'caffeine': 'brewed-coffee.jpg',
  'vitamin': 'vitamins.jpg',
  'capsule': 'vitamins.jpg',
  'tablet': 'vitamins.jpg',
  'powder': 'protein-powder.jpg',
  'scoop': 'protein-powder.jpg',
  'formula': 'milk.jpg',
  'cerelac': 'oatmeal.jpg',

  // === INTERNATIONAL ===
  'burrito': 'flour-tortilla.jpg',
  'taco': 'taco-shells.jpg',
  'sushi': 'sushi.jpg',
  'ramen': 'ramen.jpg',
  'noodle': 'noodles.jpg',
  'pad thai': 'noodles.jpg',
  'curry': 'curry-paste.jpg',
  'pho': 'noodles.jpg',
  'fajita': 'flour-tortilla.jpg',
  'quesadilla': 'flour-tortilla.jpg',
  'bbq': 'bbq-sauce.jpg',
  'dressing': 'salad-dressing.jpg',
  'caesar': 'salad-dressing.jpg',
  'vinaigrette': 'vinegar.jpg',
  'acai': 'blueberries.jpg',
  'chia pudding': 'chia-seeds.jpg',
  'bone broth': 'chicken-broth.jpg',
  'broth': 'chicken-broth.jpg',
  'soup': 'chicken-broth.jpg',
  'stew': 'beef-cubes.jpg',
  'salad': 'mixed-vegetables.jpg',

  // === MISC INGREDIENTS ===
  'brazil nut': 'brazil-nuts.jpg',
  'broad bean': 'fava-beans.jpg',
  'foul': 'fava-beans.jpg',
  'bee pollen': 'honey.jpg',
  'baobab': 'protein-powder.jpg',
  'cacao': 'cocoa-powder.jpg',
  'black seed': 'sesame-seeds.jpg',
  'habba': 'sesame-seeds.jpg',
  'trail mix': 'trail-mix.jpg',
  'mixed nut': 'mixed-nuts.jpg',
  'gel': 'protein-powder.jpg',
  'cinnabon': 'cinnamon-roll.jpg',
  'roll': 'bread.jpg',

  // === OILS ===
  'sunflower oil': 'vegetable-oil.jpg',
  'crystal': 'vegetable-oil.jpg',
  'ghee': 'ghee.jpg',
  'samna': 'ghee.jpg',

  // === SPICES ===
  'cumin': 'cumin.jpg',
  'turmeric': 'turmeric.jpg',
  'cinnamon': 'cinnamon.jpg',
  'paprika': 'paprika.jpg',
  'ginger': 'ginger.jpg',
  'black pepper': 'black-pepper.jpg',
  'chili': 'chili-powder.jpg',
  'coriander': 'coriander.jpg',
  'parsley': 'parsley.jpg',
  'mint': 'mint.jpg',
  'dill': 'dill.jpg',
  'basil': 'basil.jpg',
  'oregano': 'oregano.jpg',
  'thyme': 'thyme.jpg',

  // === FAST FOOD ===
  'burger': 'hamburger-patties.jpg',
  'pizza': 'pizza.jpg',
  'fries': 'french-fries.jpg',
  'french fries': 'french-fries.jpg',
  'hot dog': 'hot-dogs.jpg',
  'sandwich': 'bread.jpg',
  'wrap': 'flour-tortilla.jpg',
  'nugget': 'chicken-tenders.jpg',
};

// Category fallback images (when no ingredient match found)
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'PROTEIN': 'chicken-breasts.jpg',
  'DAIRY': 'milk.jpg',
  'GRAINS': 'rice.jpg',
  'FRUITS_VEGETABLES': 'apple.jpg',
  'FRUITS': 'apple.jpg',
  'VEGETABLES': 'broccoli.jpg',
  'LEGUMES': 'lentils.jpg',
  'NUTS_SEEDS': 'almonds.jpg',
  'CONDIMENTS': 'olive-oil.jpg',
  'OILS': 'olive-oil.jpg',
  'BEVERAGES': 'brewed-coffee.jpg',
  'SUPPLEMENTS': 'protein-powder.jpg',
  'SNACKS': 'potato-chips.jpg',
  'DESSERTS': 'chocolate.jpg',
  'SWEETS': 'chocolate.jpg',
  'FROZEN': 'ice-cream.jpg',
  'FAST_FOOD': 'hamburger-patties.jpg',
  'BAKERY': 'bread.jpg',
  'BREAKFAST': 'egg.png',
  'SEAFOOD': 'fish-fillets.jpg',
  'MEAT': 'beef-cubes.jpg',
  'EGYPTIAN': 'falafel.jpg',
  'OTHER': 'mixed-vegetables.jpg',
};

function findBestImage(nameEn: string, category?: string): string | null {
  const nameLower = nameEn.toLowerCase();

  // 1. Try exact ingredient match (longest match first for specificity)
  const sortedKeys = Object.keys(INGREDIENT_IMAGE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (nameLower.includes(key)) {
      return `${SPOONACULAR_CDN}/${INGREDIENT_IMAGE_MAP[key]}`;
    }
  }

  // 2. Try category fallback
  if (category) {
    const catUpper = category.toUpperCase();
    if (CATEGORY_IMAGE_MAP[catUpper]) {
      return `${SPOONACULAR_CDN}/${CATEGORY_IMAGE_MAP[catUpper]}`;
    }
  }

  return null;
}

async function main() {
  const seedDataDir = path.join(__dirname, '..', 'apps', 'api', 'prisma', 'seed-data');
  const files = fs.readdirSync(seedDataDir).filter(f => f.endsWith('.json'));

  let totalFoods = 0;
  let imagesAdded = 0;
  let alreadyHadImage = 0;
  let noMatch = 0;

  for (const filename of files) {
    const filepath = path.join(seedDataDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    let data: any;
    try {
      data = JSON.parse(content);
    } catch {
      continue;
    }

    const items: any[] = Array.isArray(data) ? data : (data.foods || data.items || []);
    if (!Array.isArray(items) || items.length === 0) continue;

    // Check if these are food items (must have calories or name_en)
    const isFood = items.some(
      (item: any) =>
        (item.calories !== undefined || item.protein_g !== undefined || item.proteinG !== undefined) &&
        (item.name_en || item.nameEn || item.name),
    );
    if (!isFood) continue;

    let fileChanged = false;
    let fileAdded = 0;

    for (const item of items) {
      totalFoods++;
      const nameEn = item.name_en || item.nameEn || item.name || '';
      const category = item.category || '';

      // Skip if already has an image
      if (item.imageUrl || item.image_url) {
        alreadyHadImage++;
        continue;
      }

      const imageUrl = findBestImage(nameEn, category);
      if (imageUrl) {
        item.imageUrl = imageUrl;
        fileChanged = true;
        imagesAdded++;
        fileAdded++;
      } else {
        noMatch++;
      }
    }

    if (fileChanged) {
      const output = Array.isArray(data) ? items : data;
      fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`  ✅ ${filename}: ${fileAdded} images added`);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Total food items: ${totalFoods}`);
  console.log(`  Images added: ${imagesAdded}`);
  console.log(`  Already had image: ${alreadyHadImage}`);
  console.log(`  No match found: ${noMatch}`);
  console.log(`  Coverage: ${Math.round(((imagesAdded + alreadyHadImage) / totalFoods) * 100)}%`);
}

main().catch(console.error);
