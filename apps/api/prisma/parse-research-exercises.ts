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

// Category mappings
const categoryMap: Record<string, string> = {
  'chest': 'STRENGTH',
  'back': 'STRENGTH',
  'shoulder': 'STRENGTH',
  'arm': 'STRENGTH',
  'leg': 'STRENGTH',
  'core': 'STRENGTH',
  'calisthenics': 'CALISTHENICS',
  'warmup': 'MOBILITY',
  'kegel': 'STRENGTH',
  'pelvic': 'STRENGTH',
  'yoga': 'YOGA',
  'mobility': 'MOBILITY',
  'recovery': 'MOBILITY',
  'foam': 'MOBILITY',
  'stretch': 'FLEXIBILITY',
  'meditation': 'MOBILITY',
  'breathing': 'MOBILITY',
};

// Muscle mappings
const muscleMap: Record<string, string> = {
  'upper chest': 'CHEST',
  'middle chest': 'CHEST',
  'lower chest': 'CHEST',
  'chest': 'CHEST',
  'pectoralis': 'CHEST',
  'pec': 'CHEST',
  'upper back': 'BACK',
  'lats': 'BACK',
  'latissimus': 'BACK',
  'lower back': 'LOWER_BACK',
  'erector': 'LOWER_BACK',
  'traps': 'BACK',
  'rhomboid': 'BACK',
  'back': 'BACK',
  'front delt': 'SHOULDERS',
  'side delt': 'SHOULDERS',
  'rear delt': 'SHOULDERS',
  'shoulder': 'SHOULDERS',
  'deltoid': 'SHOULDERS',
  'bicep': 'BICEPS',
  'tricep': 'TRICEPS',
  'forearm': 'FOREARMS',
  'quad': 'QUADRICEPS',
  'hamstring': 'HAMSTRINGS',
  'glute': 'GLUTES',
  'calf': 'CALVES',
  'calves': 'CALVES',
  'hip flexor': 'QUADRICEPS',
  'hip': 'GLUTES',
  'ab': 'ABS',
  'rectus': 'ABS',
  'oblique': 'OBLIQUES',
  'transverse': 'ABS',
  'core': 'ABS',
  'pelvic': 'ABS',
  'full body': 'FULL_BODY',
};

// Equipment mappings
const equipmentMap: Record<string, string> = {
  'barbell': 'BARBELL',
  'dumbbell': 'DUMBBELLS',
  'dumbbells': 'DUMBBELLS',
  'cable': 'CABLES',
  'machine': 'MACHINES',
  'bodyweight': 'BODYWEIGHT',
  'body weight': 'BODYWEIGHT',
  'kettlebell': 'KETTLEBELL',
  'resistance band': 'RESISTANCE_BANDS',
  'band': 'RESISTANCE_BANDS',
  'pull-up bar': 'PULL_UP_BAR',
  'pullup bar': 'PULL_UP_BAR',
  'dip bar': 'PULL_UP_BAR',
  'bench': 'BENCH',
  'incline bench': 'BENCH',
  'stability ball': 'STABILITY_BALL',
  'swiss ball': 'STABILITY_BALL',
  'foam roller': 'FOAM_ROLLER',
  'trx': 'TRX',
  'suspension': 'TRX',
  'rings': 'TRX',
  'landmine': 'BARBELL',
  'ez bar': 'BARBELL',
  'smith': 'MACHINES',
  'floor': 'BODYWEIGHT',
  'mat': 'BODYWEIGHT',
  'none': 'NONE',
};

// Difficulty mappings
const difficultyMap: Record<string, string> = {
  'beginner': 'BEGINNER',
  'intermediate': 'INTERMEDIATE',
  'advanced': 'ADVANCED',
  'expert': 'EXPERT',
};

function extractEquipment(text: string): string[] {
  const equipment: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, value] of Object.entries(equipmentMap)) {
    if (lowerText.includes(key)) {
      if (!equipment.includes(value)) {
        equipment.push(value);
      }
    }
  }

  return equipment.length > 0 ? equipment : ['BODYWEIGHT'];
}

function extractDifficulty(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('advanced') || lowerText.includes('expert')) return 'ADVANCED';
  if (lowerText.includes('intermediate')) return 'INTERMEDIATE';
  return 'BEGINNER';
}

function extractMuscle(text: string, section: string): string {
  const lowerText = text.toLowerCase();
  const lowerSection = section.toLowerCase();

  // Check text first
  for (const [key, value] of Object.entries(muscleMap)) {
    if (lowerText.includes(key)) {
      return value;
    }
  }

  // Fall back to section name
  for (const [key, value] of Object.entries(muscleMap)) {
    if (lowerSection.includes(key)) {
      return value;
    }
  }

  return 'FULL_BODY';
}

function extractCategory(section: string): string {
  const lowerSection = section.toLowerCase();

  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerSection.includes(key)) {
      return value;
    }
  }

  return 'STRENGTH';
}

function generateId(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(4, '0')}`;
}

function parseTableRow(row: string): string[] {
  return row.split('|').map(cell => cell.trim()).filter(cell => cell && cell !== '---');
}

function parseResearchMarkdown(content: string): Exercise[] {
  const exercises: Exercise[] = [];
  const lines = content.split('\n');

  let currentMainSection = '';
  let currentSubSection = '';
  let exerciseCounter = 0;
  let inTable = false;
  let tableHeaders: string[] = [];

  const idPrefixes: Record<string, string> = {
    'chest': 'CHT',
    'back': 'BCK',
    'shoulder': 'SHD',
    'bicep': 'BIC',
    'tricep': 'TRI',
    'forearm': 'FRM',
    'quad': 'QAD',
    'hamstring': 'HAM',
    'glute': 'GLT',
    'calf': 'CLF',
    'hip': 'HIP',
    'ab': 'ABS',
    'oblique': 'OBL',
    'core': 'COR',
    'calisthenics': 'CAL',
    'warmup': 'WRM',
    'yoga': 'YGA',
    'mobility': 'MOB',
    'recovery': 'RCV',
    'foam': 'FRM',
    'stretch': 'STR',
    'kegel': 'KEG',
    'pelvic': 'PEL',
    'breathing': 'BRT',
    'meditation': 'MED',
  };

  function getPrefix(section: string): string {
    const lower = section.toLowerCase();
    for (const [key, prefix] of Object.entries(idPrefixes)) {
      if (lower.includes(key)) return prefix;
    }
    return 'EXR';
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track main sections
    if (line.startsWith('## ')) {
      currentMainSection = line.replace('## ', '').replace(/^\d+\.\d+\s*/, '');
      inTable = false;
      continue;
    }

    // Track subsections
    if (line.startsWith('### ')) {
      currentSubSection = line.replace('### ', '');
      inTable = false;
      continue;
    }

    // Detect table start
    if (line.startsWith('| ') && line.includes('|')) {
      const cells = parseTableRow(line);

      // Check if this is a header row
      if (cells.some(c => c.toLowerCase().includes('exercise') || c.toLowerCase().includes('name'))) {
        tableHeaders = cells.map(c => c.toLowerCase());
        inTable = true;
        continue;
      }

      // Skip separator row
      if (cells.every(c => c.includes('-'))) {
        continue;
      }

      // Parse exercise row
      if (inTable && tableHeaders.length > 0) {
        const exerciseNameIndex = tableHeaders.findIndex(h =>
          h.includes('exercise') || h.includes('name') || h.includes('movement')
        );
        const equipmentIndex = tableHeaders.findIndex(h => h.includes('equipment'));
        const difficultyIndex = tableHeaders.findIndex(h => h.includes('difficulty'));
        const primaryIndex = tableHeaders.findIndex(h => h.includes('primary'));
        const secondaryIndex = tableHeaders.findIndex(h => h.includes('secondary'));
        const tipsIndex = tableHeaders.findIndex(h => h.includes('tip') || h.includes('note') || h.includes('cue'));

        if (exerciseNameIndex >= 0 && cells[exerciseNameIndex]) {
          let exerciseName = cells[exerciseNameIndex]
            .replace(/\*\*/g, '')
            .replace(/\([^)]*\)$/g, '')
            .trim();

          if (!exerciseName || exerciseName.length < 3) continue;
          if (exerciseName.toLowerCase().includes('exercise') && exerciseName.length < 15) continue;

          exerciseCounter++;
          const prefix = getPrefix(currentMainSection + currentSubSection);

          const equipment = equipmentIndex >= 0 && cells[equipmentIndex]
            ? extractEquipment(cells[equipmentIndex])
            : extractEquipment(exerciseName);

          const difficulty = difficultyIndex >= 0 && cells[difficultyIndex]
            ? extractDifficulty(cells[difficultyIndex])
            : 'BEGINNER';

          const primaryMuscle = primaryIndex >= 0 && cells[primaryIndex]
            ? extractMuscle(cells[primaryIndex], currentSubSection)
            : extractMuscle(exerciseName, currentSubSection);

          const secondaryMuscles: string[] = [];
          if (secondaryIndex >= 0 && cells[secondaryIndex]) {
            const secText = cells[secondaryIndex].toLowerCase();
            for (const [key, value] of Object.entries(muscleMap)) {
              if (secText.includes(key) && value !== primaryMuscle) {
                if (!secondaryMuscles.includes(value)) {
                  secondaryMuscles.push(value);
                }
              }
            }
          }

          const tips: string[] = [];
          if (tipsIndex >= 0 && cells[tipsIndex]) {
            tips.push(cells[tipsIndex].replace(/\*\*/g, '').trim());
          }

          exercises.push({
            id: generateId(prefix, exerciseCounter),
            name_en: exerciseName,
            name_ar: exerciseName + ' (AR)',
            description_en: `A ${currentMainSection.toLowerCase()} exercise targeting the ${currentSubSection.toLowerCase()}.`,
            description_ar: `تمرين ${currentMainSection} يستهدف ${currentSubSection}.`,
            category: extractCategory(currentMainSection),
            primary_muscle: primaryMuscle,
            secondary_muscles: secondaryMuscles.slice(0, 3),
            equipment: equipment,
            difficulty: difficulty,
            instructions_en: ['Assume starting position.', 'Perform the movement with control.', 'Return to starting position.'],
            instructions_ar: ['اتخذ وضعية البداية.', 'قم بأداء الحركة بتحكم.', 'عد إلى وضعية البداية.'],
            tips_en: tips,
            tips_ar: [],
            is_time_based: currentMainSection.toLowerCase().includes('stretch') ||
                          currentMainSection.toLowerCase().includes('yoga') ||
                          currentMainSection.toLowerCase().includes('hold'),
            default_sets: 3,
            default_reps: currentMainSection.toLowerCase().includes('yoga') ? 1 : 12,
            default_duration: currentMainSection.toLowerCase().includes('stretch') ? 30 : null,
            default_rest: 60,
            tags: [currentMainSection.toLowerCase(), currentSubSection.toLowerCase()].filter(Boolean)
          });
        }
      }
    } else {
      inTable = false;
    }
  }

  return exercises;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📝 PARSING RESEARCH FILE FOR EXERCISES              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const researchPath = path.join(__dirname, '../../../docs/10-RESEARCHES.md');

  if (!fs.existsSync(researchPath)) {
    console.log('❌ Research file not found:', researchPath);
    return;
  }

  const content = fs.readFileSync(researchPath, 'utf-8');
  console.log(`📂 Read ${(content.length / 1024).toFixed(1)}KB from research file\n`);

  const exercises = parseResearchMarkdown(content);

  // Remove duplicates by name
  const uniqueExercises = new Map<string, Exercise>();
  for (const ex of exercises) {
    const key = ex.name_en.toLowerCase();
    if (!uniqueExercises.has(key)) {
      uniqueExercises.set(key, ex);
    }
  }

  const finalExercises = Array.from(uniqueExercises.values());

  // Save to JSON
  const outputPath = path.join(__dirname, 'seed-data/research-exercises.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalExercises, null, 2));

  // Summary by category
  const byCategory: Record<string, number> = {};
  for (const ex of finalExercises) {
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
  }

  console.log('📊 PARSED EXERCISES BY CATEGORY:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ TOTAL UNIQUE EXERCISES PARSED: ${finalExercises.length}`);
  console.log(`   Output: ${outputPath}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
