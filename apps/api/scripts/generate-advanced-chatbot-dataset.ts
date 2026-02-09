/**
 * Advanced Training Dataset Generator for Fitness Chatbot
 *
 * Generates data in ShareGPT format for fine-tuning with Unsloth
 * Optimized for Qwen, Llama, Mistral base models
 *
 * Usage: npx ts-node scripts/generate-advanced-chatbot-dataset.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Message {
  from: 'human' | 'gpt';
  value: string;
}

interface ShareGPTConversation {
  conversations: Message[];
}

// System prompt for the model
const SYSTEM_PROMPT = `You are Forma AI, a knowledgeable fitness assistant created by Forma Fitness. You provide accurate, science-based advice on exercise, nutrition, and health based on guidelines from NSCA, ACSM, and NASM. You are friendly, supportive, and always prioritize user safety. If asked about medical conditions or injuries, you recommend consulting a healthcare professional. You can communicate in both English and Arabic.`;

// ============================================
// EXERCISE Q&A GENERATION
// ============================================

async function generateExerciseConversations(): Promise<ShareGPTConversation[]> {
  const exercises = await prisma.exercise.findMany({
    take: 300,
    orderBy: { id: 'asc' },
  });

  const conversations: ShareGPTConversation[] = [];

  for (const exercise of exercises) {
    // Basic "how to" conversation
    const instructions = exercise.instructionsEn?.join('\n') || '';
    if (instructions) {
      conversations.push({
        conversations: [
          { from: 'human', value: `How do I perform ${exercise.nameEn}?` },
          { from: 'gpt', value: instructions },
        ],
      });

      // Follow-up about muscles
      if (exercise.primaryMuscle) {
        const secondaryMuscles = exercise.secondaryMuscles || [];
        conversations.push({
          conversations: [
            { from: 'human', value: `How do I do ${exercise.nameEn}?` },
            { from: 'gpt', value: instructions },
            { from: 'human', value: `What muscles does it work?` },
            { from: 'gpt', value: `${exercise.nameEn} primarily targets the ${exercise.primaryMuscle}. ${secondaryMuscles.length > 0 ? `Secondary muscles include: ${secondaryMuscles.join(', ')}.` : ''} This makes it an excellent exercise for ${exercise.primaryMuscle.toLowerCase()} development.` },
          ],
        });
      }
    }

    // Equipment question
    if (exercise.equipment && exercise.equipment.length > 0) {
      conversations.push({
        conversations: [
          { from: 'human', value: `What equipment do I need for ${exercise.nameEn}?` },
          { from: 'gpt', value: `For ${exercise.nameEn}, you'll need: ${exercise.equipment.join(', ')}. ${exercise.difficulty === 'BEGINNER' ? 'This is a beginner-friendly exercise.' : exercise.difficulty === 'ADVANCED' ? 'This is an advanced movement - make sure you have proper form before adding weight.' : ''}` },
        ],
      });
    }

    // Difficulty-based recommendation
    if (exercise.difficulty) {
      const difficultyAdvice = {
        BEGINNER: `Yes, ${exercise.nameEn} is great for beginners! Start with light weight or just your bodyweight to master the movement pattern. Focus on controlled tempo: 2 seconds down, 1 second pause, 2 seconds up.`,
        INTERMEDIATE: `${exercise.nameEn} is an intermediate exercise. If you're new to training, I'd recommend building a foundation with simpler movements first. Once you can perform 3 sets of 10 reps with good form on basic exercises, you're ready to try this.`,
        ADVANCED: `${exercise.nameEn} is an advanced exercise that requires significant strength and coordination. Prerequisites: solid foundation in basic movement patterns, good mobility, and at least 6-12 months of consistent training. Start with lighter variations first.`,
      };

      conversations.push({
        conversations: [
          { from: 'human', value: `Is ${exercise.nameEn} suitable for beginners?` },
          { from: 'gpt', value: difficultyAdvice[exercise.difficulty as keyof typeof difficultyAdvice] || difficultyAdvice.INTERMEDIATE },
        ],
      });
    }
  }

  return conversations;
}

// ============================================
// NUTRITION Q&A GENERATION
// ============================================

async function generateNutritionConversations(): Promise<ShareGPTConversation[]> {
  const foods = await prisma.food.findMany({
    take: 200,
    orderBy: { proteinG: 'desc' },
  });

  const conversations: ShareGPTConversation[] = [];

  for (const food of foods) {
    // Basic nutrition info
    conversations.push({
      conversations: [
        { from: 'human', value: `What are the macros in ${food.nameEn}?` },
        { from: 'gpt', value: `${food.nameEn} (per ${food.servingSizeG}${food.servingUnit}):\n- Calories: ${food.calories} kcal\n- Protein: ${food.proteinG}g\n- Carbs: ${food.carbsG}g\n- Fat: ${food.fatG}g\n\n${food.proteinG && food.proteinG > 20 ? 'This is an excellent protein source for muscle building.' : ''} ${food.carbsG && food.carbsG > 30 ? 'Good source of carbohydrates for energy.' : ''}` },
      ],
    });

    // Protein source questions
    if (food.proteinG && food.proteinG > 15) {
      conversations.push({
        conversations: [
          { from: 'human', value: `Is ${food.nameEn} good for building muscle?` },
          { from: 'gpt', value: `Yes! ${food.nameEn} provides ${food.proteinG}g of protein per serving, making it a solid choice for muscle building. To maximize muscle protein synthesis, aim to consume 20-40g of protein per meal, spread across 4-5 meals throughout the day. ${food.nameEn} can definitely be part of your muscle-building nutrition plan.` },
        ],
      });
    }
  }

  return conversations;
}

// ============================================
// GENERAL FITNESS Q&A (Expert Knowledge)
// ============================================

function generateExpertConversations(): ShareGPTConversation[] {
  return [
    // TRAINING FUNDAMENTALS
    {
      conversations: [
        { from: 'human', value: 'How many days a week should I work out?' },
        { from: 'gpt', value: `The optimal training frequency depends on your goals and recovery capacity:\n\n**Beginners:** 3 days/week (full body)\n**Intermediate:** 4-5 days/week (upper/lower or PPL)\n**Advanced:** 5-6 days/week (specialized splits)\n\nKey principles:\n1. Each muscle group should be trained 2x per week for optimal growth\n2. Allow 48-72 hours between training the same muscle\n3. Quality > quantity - better to train 3 days intensely than 6 days poorly\n\nStart conservative and add days as your recovery improves.` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'How many sets and reps should I do?' },
        { from: 'gpt', value: `Here's the evidence-based guide:\n\n**For Muscle Growth (Hypertrophy):**\n- 10-20 sets per muscle group per WEEK\n- 6-12 reps per set\n- 60-90 seconds rest\n\n**For Strength:**\n- 3-5 sets of 1-5 reps\n- 3-5 minutes rest\n- Focus on compound lifts\n\n**For Endurance:**\n- 2-3 sets of 15-25 reps\n- 30-60 seconds rest\n\nProgressive overload is key - gradually increase weight, reps, or sets over time.` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'What is progressive overload?' },
        { from: 'gpt', value: `Progressive overload is the gradual increase of stress placed on your muscles over time. It's THE fundamental principle for building muscle and strength.\n\n**Ways to progressively overload:**\n1. **Add weight** - Most straightforward (2.5-5kg increments)\n2. **Add reps** - Go from 8 to 10 reps before adding weight\n3. **Add sets** - Increase weekly volume\n4. **Improve form** - Better range of motion, controlled tempo\n5. **Reduce rest** - Same work in less time (for conditioning)\n\n**Practical approach:**\nWeek 1: 3x8 @ 50kg\nWeek 2: 3x9 @ 50kg\nWeek 3: 3x10 @ 50kg\nWeek 4: 3x8 @ 52.5kg (repeat cycle)` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'What is the best workout split?' },
        { from: 'gpt', value: `The "best" split depends on your schedule and experience:\n\n**Full Body (3x/week)** - Best for beginners\n- Monday: Full Body A\n- Wednesday: Full Body B\n- Friday: Full Body A\n\n**Upper/Lower (4x/week)** - Great for intermediates\n- Mon: Upper\n- Tue: Lower\n- Thu: Upper\n- Fri: Lower\n\n**Push/Pull/Legs (6x/week)** - Advanced trainees\n- Push: Chest, shoulders, triceps\n- Pull: Back, biceps, rear delts\n- Legs: Quads, hamstrings, glutes, calves\n\n**My recommendation:** Start with full body 3x/week. Once you can't recover, switch to upper/lower.` },
      ],
    },
    // MUSCLE BUILDING
    {
      conversations: [
        { from: 'human', value: 'How do I build muscle?' },
        { from: 'gpt', value: `Building muscle requires these fundamentals:\n\n**1. Training (Mechanical Tension)**\n- Train each muscle 2x per week\n- 10-20 sets per muscle per week\n- Progressive overload over time\n- Focus on compound movements\n\n**2. Nutrition (Caloric Surplus)**\n- Eat 200-500 calories above maintenance\n- 1.6-2.2g protein per kg bodyweight\n- Spread protein across 4-5 meals\n\n**3. Recovery**\n- Sleep 7-9 hours per night\n- Manage stress levels\n- Take deload weeks every 4-8 weeks\n\n**4. Consistency**\n- This takes MONTHS, not weeks\n- Realistic expectation: 0.5-1kg muscle/month for beginners\n\nThe magic is in the basics done consistently.` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'I want to get bigger arms' },
        { from: 'gpt', value: `For bigger arms, focus on both biceps AND triceps (triceps are 2/3 of arm size!):\n\n**Biceps (2-3x/week):**\n- Barbell curls: 3x8-10 (heavy)\n- Incline dumbbell curls: 3x10-12 (stretch)\n- Hammer curls: 3x12-15 (brachialis)\n\n**Triceps (2-3x/week):**\n- Close-grip bench press: 3x8-10\n- Overhead extensions: 3x10-12 (long head)\n- Pushdowns: 3x12-15 (lateral head)\n\n**Key tips:**\n1. Full range of motion\n2. Control the eccentric (lowering)\n3. Don't neglect compound movements (bench, rows, pull-ups)\n4. Eat in a slight surplus\n\nArms respond well to higher frequency - hit them 2-3x per week with 10-15 sets total per muscle.` },
      ],
    },
    // FAT LOSS
    {
      conversations: [
        { from: 'human', value: 'How do I lose belly fat?' },
        { from: 'gpt', value: `I'll be honest: you can't spot-reduce fat from specific areas. Your body decides where fat comes off first (usually the last place you gained it).\n\n**What actually works:**\n\n1. **Caloric Deficit** (Most important)\n- Eat 300-500 calories below maintenance\n- Track your food for accuracy\n- Aim for 0.5-1% bodyweight loss per week\n\n2. **Resistance Training**\n- Preserves muscle during the cut\n- Increases metabolic rate\n- Train 3-4x per week\n\n3. **Protein Priority**\n- 2.0-2.4g per kg bodyweight when cutting\n- Keeps you full, preserves muscle\n\n4. **Cardio (Optional but helpful)**\n- 150-300 min/week moderate intensity\n- Or 2-3 HIIT sessions\n\n5. **Sleep & Stress**\n- Poor sleep = higher cortisol = more belly fat storage\n- Aim for 7-9 hours\n\nThe belly is often the last place fat leaves. Stay consistent and trust the process.` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'How many calories should I eat to lose weight?' },
        { from: 'gpt', value: `Here's how to calculate your calorie target:\n\n**Step 1: Calculate Maintenance (TDEE)**\nQuick estimate: Bodyweight (kg) × 28-35\n- Sedentary: ×28\n- Moderate activity: ×31\n- Very active: ×35\n\nExample: 80kg moderately active = 80 × 31 = 2,480 calories\n\n**Step 2: Create Deficit**\n- Conservative: -300 calories (slow, sustainable)\n- Moderate: -500 calories (0.5kg/week loss)\n- Aggressive: -750 calories (only if significantly overweight)\n\nExample: 2,480 - 500 = 1,980 calories/day\n\n**Step 3: Monitor & Adjust**\n- Weigh yourself weekly (same time, same conditions)\n- If no loss after 2 weeks, reduce by 100-200 more\n- If losing too fast (>1kg/week), add 200 back\n\n**Macros for fat loss:**\n- Protein: 2g per kg\n- Fat: 0.8-1g per kg\n- Carbs: remaining calories` },
      ],
    },
    // PROTEIN & NUTRITION
    {
      conversations: [
        { from: 'human', value: 'How much protein do I need?' },
        { from: 'gpt', value: `Protein recommendations based on your goal:\n\n**Building Muscle:**\n- 1.6-2.2g per kg bodyweight\n- Example: 80kg person = 128-176g daily\n\n**Losing Fat (while preserving muscle):**\n- 2.0-2.4g per kg bodyweight\n- Higher protein = more satiety and muscle preservation\n\n**Maintenance:**\n- 1.4-1.6g per kg bodyweight\n\n**Practical tips:**\n1. Spread across 4-5 meals (30-40g per meal)\n2. Include protein with every meal\n3. Complete proteins: meat, fish, eggs, dairy\n4. Plant-based: combine legumes + grains\n\n**Quality sources:**\n- Chicken breast: 31g per 100g\n- Greek yogurt: 10g per 100g\n- Eggs: 6g per egg\n- Lentils: 9g per 100g cooked\n- Whey protein: 24g per scoop` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'What should I eat before workout?' },
        { from: 'gpt', value: `Pre-workout nutrition depends on timing:\n\n**2-3 Hours Before:**\nComplete meal with:\n- Complex carbs: 40-60g (rice, oats, bread)\n- Protein: 25-40g (chicken, eggs, Greek yogurt)\n- Low fat (digests slower)\n\nExample: Chicken breast with rice and vegetables\n\n**30-60 Minutes Before:**\nLight, easily digestible:\n- Simple carbs: banana, rice cakes, dates\n- Optional small protein: 10-20g\n\nExample: Banana + small protein shake\n\n**Fasted Training:**\nPossible but not optimal for muscle building\n- Can take BCAAs/EAAs if you prefer fasted\n- Have protein within 2 hours after\n\n**Key principles:**\n1. Avoid heavy fats/fiber close to training\n2. Carbs = fuel for intense training\n3. What matters most: total daily intake\n\nExperiment to find what works for your stomach!` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'What should I eat after workout?' },
        { from: 'gpt', value: `Post-workout nutrition is important, but the "anabolic window" is more like an "anabolic barn door" - you have several hours, not 30 minutes.\n\n**Ideal Post-Workout Meal (within 2 hours):**\n\n**Protein: 20-40g**\n- Triggers muscle protein synthesis\n- Fast-digesting is fine but not required\n- Options: whey shake, chicken, eggs, Greek yogurt\n\n**Carbohydrates: 40-80g**\n- Replenishes glycogen stores\n- Higher if your workout was long/intense\n- Options: rice, potatoes, pasta, fruit\n\n**Example meals:**\n1. Protein shake + banana + oats\n2. Chicken breast + white rice + vegetables\n3. Eggs + toast + fruit\n4. Greek yogurt + granola + berries\n\n**What matters most:**\n- Total daily protein intake\n- Eating enough carbs to fuel next workout\n- The meal doesn't need to be immediate` },
      ],
    },
    // SUPPLEMENTS
    {
      conversations: [
        { from: 'human', value: 'What supplements should I take?' },
        { from: 'gpt', value: `Most supplements are unnecessary. Here's the evidence-based tier list:\n\n**Tier 1 - Actually Works:**\n- **Creatine Monohydrate** (5g daily) - Proven for strength/power\n- **Protein Powder** - Convenient, not magic\n- **Caffeine** (3-6mg/kg) - Pre-workout performance\n\n**Tier 2 - May Help If Deficient:**\n- **Vitamin D** (2000-5000 IU) - If you don't get sun\n- **Omega-3** (2-3g EPA+DHA) - If you don't eat fatty fish\n- **Magnesium** - If sleep/recovery is poor\n\n**Tier 3 - Skip These:**\n- BCAAs (just eat protein)\n- Fat burners (waste of money)\n- Testosterone boosters (don't work)\n- Most pre-workouts (just have coffee)\n\n**Priority order:**\n1. Dial in your diet first\n2. Get enough sleep\n3. Then consider creatine + protein powder\n4. Everything else is optimization` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'Is creatine safe?' },
        { from: 'gpt', value: `Yes! Creatine monohydrate is one of the most researched and safest supplements available.\n\n**The science:**\n- 500+ studies conducted\n- No serious side effects in healthy individuals\n- Used safely for 30+ years\n\n**What it does:**\n- Increases phosphocreatine stores in muscles\n- Improves high-intensity exercise performance\n- May increase strength gains by 5-10%\n- Some cognitive benefits too\n\n**How to take it:**\n- 3-5g daily (no need to load)\n- Take any time of day\n- Creatine monohydrate is the only form you need\n- Stay well hydrated\n\n**Common myths debunked:**\n- Does NOT damage kidneys (in healthy people)\n- Does NOT cause hair loss\n- Water retention is intracellular (in the muscle)\n\n**Who should avoid:**\n- Those with kidney disease (consult doctor)\n- Otherwise, it's safe for most adults` },
      ],
    },
    // RECOVERY
    {
      conversations: [
        { from: 'human', value: 'Why am I not seeing results?' },
        { from: 'gpt', value: `If you're not seeing results, one of these is usually the issue:\n\n**1. Not Tracking Progress**\n- Are you actually lifting more than last month?\n- Are you eating in a surplus/deficit?\n- What gets measured gets managed\n\n**2. Inconsistency**\n- Missing workouts adds up\n- Weekend eating undoing weekday effort\n- Results require months of consistency\n\n**3. Training Issues**\n- Not enough intensity (too easy)\n- Too much intensity (can't recover)\n- No progressive overload\n- Program hopping\n\n**4. Nutrition Problems**\n- Eating more than you think (not tracking)\n- Not enough protein\n- Wrong calorie target for your goal\n\n**5. Recovery Issues**\n- Not sleeping 7-9 hours\n- High stress\n- Training too frequently\n\n**6. Unrealistic Expectations**\n- Muscle gain: 0.5-1kg per month (beginners)\n- Fat loss: 0.5-1% bodyweight per week\n- Visible changes take 8-12 weeks\n\nWhich of these might apply to you?` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'How important is sleep for building muscle?' },
        { from: 'gpt', value: `Sleep is CRITICAL for muscle building. It's when the magic happens:\n\n**During sleep:**\n- Growth hormone peaks (first 3-4 hours)\n- Muscle protein synthesis increases\n- Glycogen stores replenish\n- Central nervous system recovers\n\n**What poor sleep does:**\n- Increases cortisol (catabolic hormone)\n- Decreases testosterone\n- Reduces insulin sensitivity\n- Impairs recovery and performance\n- Increases injury risk\n- Makes you hungrier (ghrelin increases)\n\n**Studies show:**\n- Sleep-deprived individuals gained 55% less muscle\n- Lost more muscle during weight loss\n- Reduced strength and power output\n\n**How to optimize sleep:**\n1. 7-9 hours per night\n2. Consistent bed/wake times\n3. Cool, dark room (18-20°C)\n4. No screens 1 hour before bed\n5. No caffeine after 2pm\n6. Consider magnesium supplement\n\nPrioritize sleep as much as your training!` },
      ],
    },
    // MULTI-TURN CONVERSATIONS
    {
      conversations: [
        { from: 'human', value: 'I want to lose fat and build muscle at the same time' },
        { from: 'gpt', value: `This is called "body recomposition" and it IS possible, but with caveats:\n\n**Who can recomp effectively:**\n1. Beginners (first 1-2 years of training)\n2. Returning after a break ("muscle memory")\n3. Those with higher body fat (20%+)\n4. Those on performance-enhancing drugs\n\n**If you fit these criteria:**\n- Eat at maintenance or slight deficit (-200 to -300)\n- High protein: 2.2-2.4g per kg\n- Train hard with progressive overload\n- Prioritize sleep and recovery\n\n**If you don't fit these criteria:**\nI'd recommend alternating phases:\n1. Cut for 8-12 weeks (lose fat)\n2. Maintain for 2-4 weeks\n3. Bulk for 12-16 weeks (build muscle)\n\nThis is more efficient for trained individuals.` },
        { from: 'human', value: 'I am a beginner with about 25% body fat' },
        { from: 'gpt', value: `Perfect! You're in the ideal position for body recomposition. Here's your game plan:\n\n**Training (3-4x per week):**\n- Full body or upper/lower split\n- Focus on compound movements: squat, deadlift, bench, rows, overhead press\n- 3-4 sets of 8-12 reps\n- Progressive overload each week\n\n**Nutrition:**\n- Calories: Maintenance or slight deficit (maybe 200-300 below)\n- Protein: 2.0-2.2g per kg bodyweight\n- Track your food for the first few weeks to learn portions\n\n**What to expect:**\n- Weight may stay similar (losing fat, gaining muscle)\n- Clothes will fit differently\n- Strength will increase\n- Visible changes in 8-12 weeks\n\n**How to track progress:**\n- Take progress photos every 2 weeks\n- Track your lifts (are they going up?)\n- Measurements (waist, chest, arms)\n- Don't obsess over the scale\n\nWant me to suggest a specific workout program?` },
        { from: 'human', value: 'Yes please suggest a workout program' },
        { from: 'gpt', value: `Here's a beginner-friendly 3-day full body program:\n\n**Day A (Mon):**\n1. Barbell Squat - 3x8-10\n2. Bench Press - 3x8-10\n3. Barbell Row - 3x8-10\n4. Romanian Deadlift - 3x10-12\n5. Plank - 3x30-45 sec\n\n**Day B (Wed):**\n1. Deadlift - 3x5-6\n2. Overhead Press - 3x8-10\n3. Lat Pulldown - 3x10-12\n4. Leg Press - 3x10-12\n5. Face Pulls - 3x15\n\n**Day A (Fri):**\n(Same as Monday)\n\n**Next week: B-A-B, then repeat**\n\n**Progressive overload:**\n- Week 1: 3x8 @ starting weight\n- Week 2: 3x9 @ same weight\n- Week 3: 3x10 @ same weight\n- Week 4: 3x8 @ add 2.5-5kg\n\n**Rest between sets:**\n- Compounds: 2-3 minutes\n- Accessories: 1-2 minutes\n\nFollow this for 12 weeks, then we can adjust. Track all your lifts!` },
      ],
    },
    // ARABIC SUPPORT
    {
      conversations: [
        { from: 'human', value: 'كيف أبني عضلات؟' },
        { from: 'gpt', value: `لبناء العضلات، اتبع هذه الأساسيات:\n\n**١. التدريب:**\n- درّب كل عضلة مرتين في الأسبوع\n- ١٠-٢٠ مجموعة لكل عضلة أسبوعياً\n- ركز على التمارين المركبة: سكوات، ديدليفت، بنش برس، تجديف\n\n**٢. التغذية:**\n- كُل ٢٠٠-٥٠٠ سعرة فوق احتياجك اليومي\n- ١.٦-٢.٢ جرام بروتين لكل كيلو من وزنك\n- وزع البروتين على ٤-٥ وجبات\n\n**٣. الراحة:**\n- نم ٧-٩ ساعات يومياً\n- خذ أسبوع راحة كل ٤-٨ أسابيع\n\n**٤. الاستمرارية:**\n- النتائج تأخذ شهوراً وليس أسابيع\n- توقع ٠.٥-١ كيلو عضلات شهرياً للمبتدئين\n\nالسر في الأساسيات المنفذة باستمرار!` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'كم احتاج بروتين في اليوم؟' },
        { from: 'gpt', value: `كمية البروتين اليومية حسب هدفك:\n\n**لبناء العضلات:**\n- ١.٦-٢.٢ جرام لكل كيلو من وزنك\n- مثال: شخص ٨٠ كيلو = ١٢٨-١٧٦ جرام يومياً\n\n**لخسارة الدهون:**\n- ٢.٠-٢.٤ جرام لكل كيلو\n- البروتين العالي يحافظ على العضلات ويشبعك\n\n**مصادر البروتين:**\n- صدر دجاج: ٣١ جرام لكل ١٠٠ جرام\n- بيض: ٦ جرام للبيضة\n- زبادي يوناني: ١٠ جرام لكل ١٠٠ جرام\n- عدس: ٩ جرام لكل ١٠٠ جرام مطبوخ\n- بودرة بروتين: ٢٤ جرام للسكوب\n\n**نصائح:**\n١. وزع البروتين على ٤-٥ وجبات\n٢. ٣٠-٤٠ جرام لكل وجبة\n٣. اشمل بروتين مع كل وجبة` },
      ],
    },
    // INJURY & SAFETY
    {
      conversations: [
        { from: 'human', value: 'I have lower back pain when I deadlift' },
        { from: 'gpt', value: `Lower back pain during deadlifts is common and usually indicates a technique issue. Let me help:\n\n**Common causes:**\n1. **Rounding the lower back** - Most common\n2. **Bar too far from body** - Increases lever arm\n3. **Hips rising too fast** - "Stripper deadlift"\n4. **Starting position too low/high**\n5. **Weak core/bracing**\n\n**Immediate steps:**\n1. Stop if there's sharp pain\n2. Reduce weight significantly (50%)\n3. Film yourself from the side\n\n**Form fixes:**\n1. Brace your core HARD before lifting\n2. Keep the bar touching your shins\n3. Push the floor away, don't pull the bar\n4. Chest up, shoulders back\n5. Hips and shoulders rise together\n\n**Alternative exercises while you fix form:**\n- Trap bar deadlifts (easier on lower back)\n- Romanian deadlifts (lighter, focused)\n- Hip hinge drills with dowel\n\n**When to see a professional:**\n- Pain persists beyond a few days\n- Radiating pain down legs\n- Numbness or tingling\n\nWould you like specific cues for any of these fixes?` },
      ],
    },
    {
      conversations: [
        { from: 'human', value: 'How do I warm up before lifting?' },
        { from: 'gpt', value: `A proper warm-up prepares your body and reduces injury risk. Here's my protocol:\n\n**Phase 1: General Warm-up (5 min)**\n- Light cardio: rowing, bike, or jump rope\n- Goal: Raise body temperature, increase blood flow\n\n**Phase 2: Dynamic Stretching (5 min)**\n- Leg swings (front/back, side to side)\n- Hip circles\n- Arm circles\n- World's greatest stretch\n- Cat-cow stretches\n- Bodyweight squats\n\n**Phase 3: Movement-Specific Warm-up**\nGradually work up to your working weight:\n\n*Example for 100kg squat:*\n- Empty bar x 10\n- 40kg x 8\n- 60kg x 5\n- 80kg x 3\n- 90kg x 2\n- 100kg (working sets)\n\n**Key principles:**\n1. Never skip the warm-up\n2. Don't fatigue yourself before working sets\n3. Increase weight in ~20% jumps\n4. Reduce reps as weight increases\n5. Rest 1-2 min between warm-up sets\n\nA good warm-up takes 10-15 minutes and is worth every second!` },
      ],
    },
  ];
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('🏋️ Generating Advanced Training Dataset for Fitness Chatbot...\n');

  // Generate conversations from different sources
  console.log('📚 Generating exercise conversations...');
  const exerciseConvos = await generateExerciseConversations();
  console.log(`   Generated ${exerciseConvos.length} exercise conversations`);

  console.log('🥗 Generating nutrition conversations...');
  const nutritionConvos = await generateNutritionConversations();
  console.log(`   Generated ${nutritionConvos.length} nutrition conversations`);

  console.log('🧠 Adding expert knowledge conversations...');
  const expertConvos = generateExpertConversations();
  console.log(`   Added ${expertConvos.length} expert conversations`);

  // Combine all conversations
  const allConversations = [...exerciseConvos, ...nutritionConvos, ...expertConvos];
  console.log(`\n📊 Total conversations: ${allConversations.length}`);

  // Create output directory
  const outputDir = path.join(__dirname, '../training-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save in ShareGPT format (for Unsloth)
  const sharegptPath = path.join(outputDir, 'fitness-sharegpt.json');
  fs.writeFileSync(sharegptPath, JSON.stringify(allConversations, null, 2));
  console.log(`\n✅ Saved ShareGPT format to: ${sharegptPath}`);

  // Also create Alpaca format for compatibility
  const alpacaData = allConversations.map((conv) => ({
    instruction: conv.conversations[0].value,
    input: '',
    output: conv.conversations.length > 1 ? conv.conversations[1].value : '',
    // Include full conversation for multi-turn
    history: conv.conversations.length > 2
      ? conv.conversations.slice(0, -1).map((m, i) =>
          i % 2 === 0 ? [m.value, conv.conversations[i + 1]?.value || ''] : null
        ).filter(Boolean)
      : [],
  }));

  const alpacaPath = path.join(outputDir, 'fitness-alpaca.json');
  fs.writeFileSync(alpacaPath, JSON.stringify(alpacaData, null, 2));
  console.log(`✅ Saved Alpaca format to: ${alpacaPath}`);

  // Create formatted text for direct fine-tuning
  const formattedData = allConversations.map((conv) => {
    let text = '';
    for (const msg of conv.conversations) {
      if (msg.from === 'human') {
        text += `<|im_start|>user\n${msg.value}<|im_end|>\n`;
      } else {
        text += `<|im_start|>assistant\n${msg.value}<|im_end|>\n`;
      }
    }
    return { text };
  });

  const formattedPath = path.join(outputDir, 'fitness-chatml.jsonl');
  fs.writeFileSync(formattedPath, formattedData.map(d => JSON.stringify(d)).join('\n'));
  console.log(`✅ Saved ChatML format to: ${formattedPath}`);

  // Save statistics
  const stats = {
    totalConversations: allConversations.length,
    exerciseConversations: exerciseConvos.length,
    nutritionConversations: nutritionConvos.length,
    expertConversations: expertConvos.length,
    multiTurnConversations: allConversations.filter(c => c.conversations.length > 2).length,
    arabicConversations: allConversations.filter(c =>
      c.conversations.some(m => /[\u0600-\u06FF]/.test(m.value))
    ).length,
    generatedAt: new Date().toISOString(),
    systemPrompt: SYSTEM_PROMPT,
  };

  const statsPath = path.join(outputDir, 'dataset-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`✅ Saved stats to: ${statsPath}`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   TRAINING DATASET GENERATED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total Conversations: ${stats.totalConversations}`);
  console.log(`   Multi-turn: ${stats.multiTurnConversations}`);
  console.log(`   Arabic: ${stats.arabicConversations}`);
  console.log('');
  console.log('   Files created:');
  console.log('   • fitness-sharegpt.json (for Unsloth)');
  console.log('   • fitness-alpaca.json (alternative format)');
  console.log('   • fitness-chatml.jsonl (ChatML format)');
  console.log('');
  console.log('   Next: Run the Unsloth training notebook!');
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
