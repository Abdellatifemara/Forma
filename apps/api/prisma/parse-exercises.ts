import * as fs from 'fs';
import * as path from 'path';

interface Exercise {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string[];
  difficulty: string;
  instructions_en: string[];
  instructions_ar: string[];
  tips_en: string[];
  tips_ar: string[];
  is_time_based: boolean;
  default_sets: number;
  default_reps: number;
  default_duration: number | null;
  default_rest: number;
  tags: string[];
}

function parseExerciseMD(content: string, category: string, muscle: string): Exercise[] {
  const exercises: Exercise[] = [];

  // Match exercise headers like: ### GL001 - Barbell Hip Thrust
  const exercisePattern = /###\s+([A-Z]{1,3}\d{3})\s+-\s+(.+?)(?=\n)/g;
  const tablePattern = /\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\s*\|/g;

  let match;
  const exerciseBlocks: { id: string; name: string; startIndex: number; endIndex: number }[] = [];

  // Find all exercise headers
  while ((match = exercisePattern.exec(content)) !== null) {
    exerciseBlocks.push({
      id: match[1],
      name: match[2].trim(),
      startIndex: match.index,
      endIndex: content.length
    });
  }

  // Set end indices
  for (let i = 0; i < exerciseBlocks.length - 1; i++) {
    exerciseBlocks[i].endIndex = exerciseBlocks[i + 1].startIndex;
  }

  // Parse each exercise block
  for (const block of exerciseBlocks) {
    const blockContent = content.substring(block.startIndex, block.endIndex);

    // Extract attributes from table
    const attributes: Record<string, string> = {};
    let tableMatch;
    while ((tableMatch = tablePattern.exec(blockContent)) !== null) {
      attributes[tableMatch[1].toLowerCase()] = tableMatch[2].trim();
    }

    // Extract form cues/instructions
    const instructionsMatch = blockContent.match(/\*\*Form Cues:\*\*\n([\s\S]*?)(?=\n\n|\*\*Common|$)/);
    const instructions: string[] = [];
    if (instructionsMatch) {
      const lines = instructionsMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^-\s*/, '').trim();
        if (cleaned) instructions.push(cleaned);
      }
    }

    // Extract tips from common mistakes
    const tipsMatch = blockContent.match(/\*\*Common Mistakes:\*\*\n([\s\S]*?)(?=\n###|$)/);
    const tips: string[] = [];
    if (tipsMatch) {
      const lines = tipsMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^-\s*/, '').trim();
        if (cleaned) tips.push(cleaned);
      }
    }

    // Map difficulty
    const difficultyMap: Record<string, string> = {
      'beginner': 'BEGINNER',
      'intermediate': 'INTERMEDIATE',
      'advanced': 'ADVANCED',
      'expert': 'EXPERT'
    };

    // Map equipment
    const equipmentMap: Record<string, string> = {
      'barbell': 'BARBELL',
      'dumbbell': 'DUMBBELLS',
      'dumbbells': 'DUMBBELLS',
      'bench': 'BENCH',
      'cable': 'CABLES',
      'cables': 'CABLES',
      'machine': 'MACHINES',
      'bodyweight': 'BODYWEIGHT',
      'kettlebell': 'KETTLEBELL',
      'bands': 'RESISTANCE_BANDS',
      'resistance bands': 'RESISTANCE_BANDS',
      'pull-up bar': 'PULL_UP_BAR',
      'trx': 'TRX',
      'none': 'NONE'
    };

    // Map muscle groups
    const muscleMap: Record<string, string> = {
      'gluteus maximus': 'GLUTES',
      'glutes': 'GLUTES',
      'hamstrings': 'HAMSTRINGS',
      'quadriceps': 'QUADRICEPS',
      'quads': 'QUADRICEPS',
      'calves': 'CALVES',
      'hip flexors': 'QUADRICEPS',
      'core': 'ABS',
      'abs': 'ABS',
      'obliques': 'OBLIQUES',
      'chest': 'CHEST',
      'back': 'BACK',
      'lats': 'BACK',
      'shoulders': 'SHOULDERS',
      'biceps': 'BICEPS',
      'triceps': 'TRICEPS',
      'forearms': 'FOREARMS',
      'lower back': 'LOWER_BACK'
    };

    // Parse equipment string
    const equipmentStr = attributes['equipment'] || 'bodyweight';
    const equipment = equipmentStr.split(',').map(e => {
      const cleaned = e.trim().toLowerCase();
      return equipmentMap[cleaned] || 'NONE';
    });

    // Parse primary muscle
    const primaryStr = (attributes['primary'] || muscle).toLowerCase();
    const primaryMuscle = muscleMap[primaryStr] || 'FULL_BODY';

    // Parse secondary muscles
    const secondaryStr = attributes['secondary'] || '';
    const secondaryMuscles = secondaryStr.split(',')
      .map(m => muscleMap[m.trim().toLowerCase()])
      .filter(Boolean);

    // Parse difficulty
    const difficultyStr = (attributes['difficulty'] || 'beginner').toLowerCase();
    const difficulty = difficultyMap[difficultyStr] || 'BEGINNER';

    // Create Arabic name (placeholder - would need translation)
    const nameAr = block.name + ' (AR)';

    // Create description
    const descriptionEn = `A ${category.toLowerCase()} exercise focusing on the ${primaryStr}.`;
    const descriptionAr = `تمرين ${category.toLowerCase()} يركز على ${primaryStr}.`;

    exercises.push({
      id: block.id,
      name_en: block.name,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      category: category.toUpperCase(),
      primary_muscle: primaryMuscle,
      secondary_muscles: secondaryMuscles,
      equipment: equipment,
      difficulty: difficulty,
      instructions_en: instructions.length > 0 ? instructions : [
        'Step 1: Assume starting position.',
        'Step 2: Perform the movement.',
        'Step 3: Return to start.'
      ],
      instructions_ar: [
        'الخطوة ١: اتخذ وضعية البداية.',
        'الخطوة ٢: قم بأداء الحركة.',
        'الخطوة ٣: عد إلى وضعية البداية.'
      ],
      tips_en: tips,
      tips_ar: [],
      is_time_based: false,
      default_sets: 3,
      default_reps: 12,
      default_duration: null,
      default_rest: 60,
      tags: [category.toLowerCase(), muscle.toLowerCase()]
    });
  }

  return exercises;
}

function findMdFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findMdFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📝 PARSING EXERCISE MARKDOWN FILES                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const docsDir = path.join(__dirname, '../../../docs/exercises');
  const mdFiles = findMdFiles(docsDir);

  console.log(`📂 Found ${mdFiles.length} markdown files\n`);

  let totalExercises = 0;

  for (const filePath of mdFiles) {
    const relativePath = path.relative(docsDir, filePath);
    const category = path.dirname(relativePath);
    const muscle = path.basename(filePath, '.md');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const exercises = parseExerciseMD(content, category, muscle);

      if (exercises.length > 0) {
        // Write JSON file
        const jsonPath = filePath.replace('.md', '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(exercises, null, 2));
        console.log(`  ✅ ${relativePath}: ${exercises.length} exercises`);
        totalExercises += exercises.length;
      } else {
        console.log(`  ⚠️ ${relativePath}: No exercises found`);
      }
    } catch (error: any) {
      console.error(`  ❌ ${relativePath}: ${error.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 TOTAL EXERCISES PARSED: ${totalExercises}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
