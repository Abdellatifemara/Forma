/**
 * Generate Training Dataset for Offline Fitness Chatbot
 *
 * This script generates Q&A pairs from your existing exercise and food databases
 * for fine-tuning a small language model.
 *
 * Usage: npx ts-node scripts/generate-chatbot-dataset.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QAPair {
  prompt: string;
  completion: string;
}

async function generateExerciseQA(): Promise<QAPair[]> {
  const exercises = await prisma.exercise.findMany({
    take: 500, // Limit for initial dataset
    orderBy: { id: 'asc' },
  });

  const qaPairs: QAPair[] = [];

  for (const exercise of exercises) {
    // Question about how to do the exercise
    if (exercise.instructions) {
      qaPairs.push({
        prompt: `How do I perform ${exercise.nameEn}?`,
        completion: exercise.instructions,
      });
    }

    // Question about muscles worked
    if (exercise.primaryMuscles && exercise.primaryMuscles.length > 0) {
      const muscles = exercise.primaryMuscles.join(', ');
      const secondary = exercise.secondaryMuscles?.join(', ') || 'none';
      qaPairs.push({
        prompt: `What muscles does ${exercise.nameEn} target?`,
        completion: `${exercise.nameEn} primarily targets the ${muscles}. Secondary muscles involved: ${secondary}.`,
      });
    }

    // Question about equipment
    if (exercise.equipment) {
      qaPairs.push({
        prompt: `What equipment do I need for ${exercise.nameEn}?`,
        completion: `For ${exercise.nameEn}, you need: ${exercise.equipment}.`,
      });
    }

    // Question about difficulty
    if (exercise.difficulty) {
      qaPairs.push({
        prompt: `Is ${exercise.nameEn} suitable for beginners?`,
        completion: exercise.difficulty === 'BEGINNER'
          ? `Yes, ${exercise.nameEn} is a beginner-friendly exercise.`
          : exercise.difficulty === 'INTERMEDIATE'
          ? `${exercise.nameEn} is an intermediate exercise. Beginners should master basic movements first.`
          : `${exercise.nameEn} is an advanced exercise. Build a solid foundation before attempting it.`,
      });
    }
  }

  return qaPairs;
}

async function generateFoodQA(): Promise<QAPair[]> {
  const foods = await prisma.food.findMany({
    take: 300,
    orderBy: { id: 'asc' },
  });

  const qaPairs: QAPair[] = [];

  for (const food of foods) {
    // Nutrition info
    qaPairs.push({
      prompt: `What are the calories and macros in ${food.nameEn}?`,
      completion: `${food.nameEn} (per ${food.servingSize}${food.servingUnit}): ${food.calories} calories, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat.`,
    });

    // Is it good for protein
    if (food.protein && food.protein > 15) {
      qaPairs.push({
        prompt: `Is ${food.nameEn} a good source of protein?`,
        completion: `Yes, ${food.nameEn} is a good protein source with ${food.protein}g of protein per serving.`,
      });
    }

    // Category-based questions
    if (food.category) {
      qaPairs.push({
        prompt: `What type of food is ${food.nameEn}?`,
        completion: `${food.nameEn} is categorized as ${food.category}.`,
      });
    }
  }

  return qaPairs;
}

function generateGeneralFitnessQA(): QAPair[] {
  return [
    // Training fundamentals
    {
      prompt: "How many days a week should I work out?",
      completion: "For most people, 3-5 days per week is optimal. Beginners should start with 3 days, allowing rest between sessions. More advanced lifters can train 4-6 days with proper programming."
    },
    {
      prompt: "How long should my workout be?",
      completion: "An effective workout typically lasts 45-75 minutes. Focus on quality over duration. Warm-up for 5-10 minutes, train for 30-50 minutes, and cool down for 5-10 minutes."
    },
    {
      prompt: "Should I do cardio before or after weights?",
      completion: "Do weights before cardio if your goal is building muscle or strength. The order matters less for general fitness. For best results, separate cardio and weight sessions."
    },
    {
      prompt: "How much rest should I take between sets?",
      completion: "For strength (1-5 reps): 3-5 minutes. For hypertrophy (6-12 reps): 60-90 seconds. For endurance (15+ reps): 30-60 seconds. Compound exercises need more rest than isolation."
    },
    {
      prompt: "What is progressive overload?",
      completion: "Progressive overload means gradually increasing the demands on your muscles over time. This can be through more weight, more reps, more sets, or less rest. It's essential for continued progress."
    },
    {
      prompt: "How do I build muscle?",
      completion: "To build muscle: 1) Train each muscle 2-3x per week, 2) Use progressive overload, 3) Eat sufficient protein (1.6-2.2g per kg bodyweight), 4) Sleep 7-9 hours, 5) Be consistent for months."
    },
    {
      prompt: "How do I lose fat?",
      completion: "Fat loss requires a caloric deficit. Eat 300-500 calories below maintenance, prioritize protein, do resistance training to preserve muscle, add cardio for extra calorie burn, and be patient."
    },
    {
      prompt: "What should I eat before a workout?",
      completion: "Eat a balanced meal with carbs and protein 2-3 hours before training. If eating closer to workout time (30-60 min), choose easily digestible foods like a banana or rice cakes with honey."
    },
    {
      prompt: "What should I eat after a workout?",
      completion: "After training, consume protein (20-40g) and carbs within 2 hours. Good options: chicken with rice, protein shake with fruit, or eggs with toast. This aids recovery and muscle building."
    },
    {
      prompt: "How much protein do I need?",
      completion: "For muscle building: 1.6-2.2g protein per kg of bodyweight daily. For a 70kg person, that's 112-154g protein. Spread intake across 3-5 meals for optimal absorption."
    },
    {
      prompt: "Do I need supplements?",
      completion: "Most people don't need supplements if eating well. Useful ones: creatine monohydrate (proven for strength), vitamin D (if deficient), protein powder (for convenience). Skip fat burners and BCAAs."
    },
    {
      prompt: "Is creatine safe?",
      completion: "Yes, creatine monohydrate is one of the most researched and safest supplements. Take 3-5g daily. It helps with strength, power, and muscle growth. Stay hydrated while using it."
    },
    {
      prompt: "How do I warm up properly?",
      completion: "A good warm-up: 5 min light cardio, dynamic stretches for muscles you'll use, then 1-2 light sets of your first exercise. This increases blood flow, prepares joints, and reduces injury risk."
    },
    {
      prompt: "Why am I not seeing results?",
      completion: "Common reasons: inconsistent training, not enough protein, poor sleep, not tracking progress, unrealistic expectations, or not following progressive overload. Results take months, not weeks."
    },
    {
      prompt: "How do I stay motivated?",
      completion: "Set specific goals, track your progress, find a workout partner, vary your routine occasionally, celebrate small wins, remember your 'why', and focus on how exercise makes you feel."
    },
    // Nutrition
    {
      prompt: "How many calories should I eat?",
      completion: "Calculate your TDEE (Total Daily Energy Expenditure) based on age, weight, height, and activity. To lose weight: eat 300-500 below TDEE. To gain muscle: eat 200-300 above TDEE."
    },
    {
      prompt: "Is intermittent fasting effective?",
      completion: "Intermittent fasting can help with calorie control but isn't magic. Results come from the caloric deficit, not the fasting window itself. It works well for some people but isn't required."
    },
    {
      prompt: "Should I avoid carbs?",
      completion: "No, carbs are your body's preferred energy source for intense exercise. Instead of avoiding them, choose quality carbs: whole grains, fruits, vegetables. Timing matters more than elimination."
    },
    {
      prompt: "How much water should I drink?",
      completion: "Aim for 2-3 liters daily, more if you're active or in hot climates. During workouts, drink 200-300ml every 15-20 minutes. Urine color is a good indicator - aim for pale yellow."
    },
    // Recovery
    {
      prompt: "How important is sleep for fitness?",
      completion: "Sleep is crucial. During sleep, your body releases growth hormone, repairs muscle tissue, and consolidates motor learning. Aim for 7-9 hours. Poor sleep hurts gains and increases injury risk."
    },
    {
      prompt: "How do I recover faster?",
      completion: "For faster recovery: sleep 7-9 hours, eat enough protein, stay hydrated, manage stress, do light active recovery, and don't overtrain. Foam rolling and stretching can help too."
    },
    {
      prompt: "What is DOMS?",
      completion: "DOMS (Delayed Onset Muscle Soreness) is muscle pain 24-72 hours after exercise. It's normal, especially for new movements. Light activity, stretching, and proper nutrition help. It decreases as you adapt."
    },
    // Common mistakes
    {
      prompt: "What are common beginner mistakes?",
      completion: "Common mistakes: lifting too heavy too soon, neglecting form, not resting enough, skipping warm-ups, program hopping, neglecting nutrition, comparing to others, and expecting fast results."
    },
    {
      prompt: "Is muscle soreness necessary for growth?",
      completion: "No, soreness isn't required for muscle growth. It indicates your muscles did something new, not that you had an effective workout. Focus on progressive overload, not chasing soreness."
    },
  ];
}

async function main() {
  console.log('Generating training dataset for fitness chatbot...\n');

  // Generate Q&A pairs from different sources
  console.log('Generating exercise Q&A pairs...');
  const exerciseQA = await generateExerciseQA();
  console.log(`  Generated ${exerciseQA.length} exercise Q&A pairs`);

  console.log('Generating food Q&A pairs...');
  const foodQA = await generateFoodQA();
  console.log(`  Generated ${foodQA.length} food Q&A pairs`);

  console.log('Adding general fitness Q&A...');
  const generalQA = generateGeneralFitnessQA();
  console.log(`  Added ${generalQA.length} general fitness Q&A pairs`);

  // Combine all Q&A pairs
  const allQA = [...exerciseQA, ...foodQA, ...generalQA];
  console.log(`\nTotal Q&A pairs: ${allQA.length}`);

  // Create output directory
  const outputDir = path.join(__dirname, '../training-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save as JSONL (for fine-tuning)
  const jsonlPath = path.join(outputDir, 'fitness-chatbot-training.jsonl');
  const jsonlContent = allQA.map(qa => JSON.stringify(qa)).join('\n');
  fs.writeFileSync(jsonlPath, jsonlContent);
  console.log(`\nSaved JSONL to: ${jsonlPath}`);

  // Save as JSON (for easier viewing)
  const jsonPath = path.join(outputDir, 'fitness-chatbot-training.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allQA, null, 2));
  console.log(`Saved JSON to: ${jsonPath}`);

  // Save statistics
  const stats = {
    totalPairs: allQA.length,
    exercisePairs: exerciseQA.length,
    foodPairs: foodQA.length,
    generalPairs: generalQA.length,
    generatedAt: new Date().toISOString(),
  };
  const statsPath = path.join(outputDir, 'dataset-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`Saved stats to: ${statsPath}`);

  console.log('\n✅ Training dataset generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review and clean the generated data');
  console.log('2. Add more domain-specific Q&A pairs');
  console.log('3. Fine-tune a model using the JSONL file');
  console.log('   - For GPT-2: Use Hugging Face Transformers');
  console.log('   - For TinyLlama: Use llama.cpp or similar');
  console.log('   - For BERT-based: Use sentence-transformers');

  await prisma.$disconnect();
}

main().catch(console.error);
