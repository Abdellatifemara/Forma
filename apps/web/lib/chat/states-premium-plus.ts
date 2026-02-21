import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// PREMIUM+ EXCLUSIVE STATES — Deeper navigation + GPT at leaves
// These states are only shown to PREMIUM_PLUS subscribers.
// They extend the base state machine with AI-powered features.
//
// ARCHITECTURE:
// 1. User navigates through guided options (same as Premium)
// 2. At "leaf" states, we know EXACTLY what they want
// 3. We make ONE targeted GPT call with:
//    - User's profile/data as context
//    - A precise prompt (not open-ended)
//    - Known output format → can parse and display beautifully
// 4. Result: "0 fail" — predictable, fast, useful
//
// GPT CALL BUDGET:
// - gpt-4o-mini: ~$0.15/1M input, $0.60/1M output (fast, cheap)
// - gpt-4o: ~$2.50/1M input, $10/1M output (quality, expensive)
// - Rule: Use gpt-4o-mini for most things, gpt-4o for plan generation
// ═══════════════════════════════════════════════════════════════

export const premiumPlusStates: ChatState[] = [

  // ─── WORKOUT: AI Exercise Alternatives ──────────────────
  {
    id: 'WK_AI_ALTERNATIVES',
    domain: 'workout',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Exercise Swap', ar: 'بديل تمرين بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Analyzing your current workout and finding alternatives based on your equipment and injuries...',
      ar: 'بحلل التمرين بتاعك ودور على بدائل حسب الأجهزة المتاحة والإصابات...',
    },
    back: 'WK_TODAY',
    gptEnhanced: {
      contextSources: [
        { type: 'todayWorkout', key: 'workout' },
        { type: 'preferences', key: 'prefs' },
        { type: 'injuries', key: 'injuries' },
      ],
      promptTemplate: `The user wants exercise alternatives for their workout.
Current workout: {workout}
Preferences: {prefs}
Injuries/limitations: {injuries}

For each exercise, suggest 1 alternative that:
- Targets the same muscle group
- Avoids aggravating injuries
- Matches available equipment
Return as a numbered list: "Original → Alternative (reason)"`,
      outputFormat: 'list',
      model: 'gpt-4o-mini',
      maxTokens: 400,
      cacheTtlMinutes: 30,
    },
    options: [
      { id: 'wkai1', label: { en: 'Apply Swaps', ar: 'طبّق البدائل' }, icon: '✅', nextState: 'WK_TODAY',
        action: { type: 'write', endpoint: '/workouts/swap-exercise', requiresConfirmation: true,
          confirmText: { en: 'Swap exercises?', ar: 'تبدّل التمارين؟' } } },
      { id: 'wkai2', label: { en: 'Try Different Swaps', ar: 'جرّب بدائل تانية' }, icon: '🔄', nextState: 'WK_AI_ALTERNATIVES' },
      { id: 'wkai3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_TODAY' },
    ],
  },

  // ─── WORKOUT: AI Workout Rating & Feedback ─────────────
  {
    id: 'WK_AI_FEEDBACK',
    domain: 'workout',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Workout Review', ar: 'تقييم التمرين بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Reviewing your last workout and providing personalized feedback...',
      ar: 'بحلل آخر تمرين بتاعك وبجهزلك ملاحظات شخصية...',
    },
    back: 'WK_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'workoutHistory', key: 'history' },
        { type: 'profile', key: 'profile' },
        { type: 'activePlan', key: 'plan' },
      ],
      promptTemplate: `Review the user's recent workout performance.
Workout history (last 7 days): {history}
User profile: {profile}
Active plan: {plan}

Provide brief feedback on:
1. Volume progression (are they improving?)
2. Recovery between sessions (enough rest?)
3. One specific tip to improve next session
Keep it conversational and encouraging. 3-4 sentences max.`,
      outputFormat: 'text',
      model: 'gpt-4o-mini',
      maxTokens: 300,
    },
    options: [
      { id: 'wkfb1', label: { en: 'Start Today\'s Workout', ar: 'ابدأ تمرين النهارده' }, icon: '💪', nextState: 'WK_TODAY',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkfb2', label: { en: 'Adjust My Plan', ar: 'عدّل الخطة' }, icon: '📋', nextState: 'PG_MENU' },
      { id: 'wkfb3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // ─── NUTRITION: AI Meal Suggestion ──────────────────────
  {
    id: 'NT_AI_MEAL_PLAN',
    domain: 'nutrition',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Meal Suggestion', ar: 'اقتراح وجبة بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Calculating your remaining macros and suggesting meals from Egyptian food options...',
      ar: 'بحسب الماكروز المتبقية وبقترح وجبات من الأكل المصري...',
    },
    back: 'NT_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'nutritionToday', key: 'todayNutrition' },
        { type: 'profile', key: 'profile' },
        { type: 'preferences', key: 'prefs' },
      ],
      promptTemplate: `Suggest the next meal for this user.
Today's nutrition so far: {todayNutrition}
Profile (age, weight, goal): {profile}
Preferences: {prefs}

Rules:
- Suggest 2-3 Egyptian/available food options
- Hit remaining macro targets
- Include calorie and macro breakdown
- Keep portions realistic
Format: meal name, items with portions, total macros`,
      outputFormat: 'plan',
      model: 'gpt-4o-mini',
      maxTokens: 400,
      cacheTtlMinutes: 15,
    },
    options: [
      { id: 'ntai1', label: { en: 'Log This Meal', ar: 'سجّل الوجبة دي' }, icon: '✅', nextState: 'NT_LOG_MEAL' },
      { id: 'ntai2', label: { en: 'Different Options', ar: 'خيارات تانية' }, icon: '🔄', nextState: 'NT_AI_MEAL_PLAN' },
      { id: 'ntai3', label: { en: 'See All Foods', ar: 'شوف كل الأكل' }, icon: '🍽️', nextState: 'NT_BROWSE_FOODS' },
      { id: 'ntai4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  // ─── NUTRITION: AI Diet Analysis ────────────────────────
  {
    id: 'NT_AI_ANALYSIS',
    domain: 'nutrition',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Diet Analysis', ar: 'تحليل الدايت بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Analyzing your nutrition patterns over the past week...',
      ar: 'بحلل نظامك الغذائي خلال الأسبوع اللي فات...',
    },
    back: 'NT_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'nutritionToday', key: 'nutrition' },
        { type: 'profile', key: 'profile' },
        { type: 'weightHistory', key: 'weight' },
      ],
      promptTemplate: `Analyze this user's nutrition habits.
Recent nutrition data: {nutrition}
Profile & goals: {profile}
Weight trend: {weight}

Provide:
1. Are they hitting their calorie/macro targets?
2. What's missing (common deficiency)?
3. One actionable tip for improvement
Keep it brief (4-5 sentences), conversational, encouraging.`,
      outputFormat: 'analysis',
      model: 'gpt-4o-mini',
      maxTokens: 350,
    },
    options: [
      { id: 'ntana1', label: { en: 'Adjust My Targets', ar: 'عدّل الأهداف' }, icon: '🎯', nextState: 'NT_SET_TARGETS' },
      { id: 'ntana2', label: { en: 'Suggest a Meal', ar: 'اقترح وجبة' }, icon: '🍱', nextState: 'NT_AI_MEAL_PLAN' },
      { id: 'ntana3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  // ─── HEALTH: AI Recovery Analysis ──────────────────────
  {
    id: 'HL_AI_RECOVERY',
    domain: 'health',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Recovery Analysis', ar: 'تحليل الريكفري بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Analyzing your recovery data to give you today\'s recommendation...',
      ar: 'بحلل بيانات الريكفري عشان أديك توصية النهارده...',
    },
    back: 'HL_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'healthMetrics', key: 'health' },
        { type: 'workoutHistory', key: 'workouts' },
        { type: 'profile', key: 'profile' },
      ],
      promptTemplate: `Analyze recovery status and recommend today's training intensity.
Health metrics (sleep, HRV, resting HR, strain): {health}
Recent workouts (last 5 days): {workouts}
Profile: {profile}

Provide:
1. Recovery score assessment (good/moderate/low)
2. Should they train hard, moderate, or rest today?
3. Specific recommendation (e.g., "do upper body at 70%" or "rest day + light walk")
Keep it short and actionable (3-4 sentences).`,
      outputFormat: 'analysis',
      model: 'gpt-4o-mini',
      maxTokens: 300,
    },
    options: [
      { id: 'hlai1', label: { en: 'Start Recommended Workout', ar: 'ابدأ التمرين المقترح' }, icon: '💪', nextState: 'WK_TODAY',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'hlai2', label: { en: 'Log Rest Day', ar: 'سجّل يوم راحة' }, icon: '😴', nextState: 'WK_LOG_REST' },
      { id: 'hlai3', label: { en: 'View Health Dashboard', ar: 'شوف لوحة الصحة' }, icon: '📊', nextState: 'HL_DASHBOARD',
        action: { type: 'navigate', route: '/health' } },
      { id: 'hlai4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  // ─── PROGRESS: AI Weekly Report ────────────────────────
  {
    id: 'PR_AI_WEEKLY',
    domain: 'progress',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Weekly Report', ar: 'تقرير أسبوعي بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Generating your personalized weekly progress report...',
      ar: 'بجهزلك تقرير التقدم الأسبوعي الشخصي...',
    },
    back: 'PR_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'workoutHistory', key: 'workouts' },
        { type: 'nutritionToday', key: 'nutrition' },
        { type: 'weightHistory', key: 'weight' },
        { type: 'healthMetrics', key: 'health' },
        { type: 'profile', key: 'profile' },
      ],
      promptTemplate: `Generate a weekly progress report for this user.
Workouts this week: {workouts}
Nutrition data: {nutrition}
Weight trend: {weight}
Health metrics: {health}
Profile & goals: {profile}

Structure:
1. **Highlights** — what went well (1-2 points)
2. **Areas to Improve** — one specific thing (1 point)
3. **Next Week Focus** — one actionable goal
Keep it brief, motivational, and data-driven.`,
      outputFormat: 'analysis',
      model: 'gpt-4o',
      maxTokens: 500,
      cacheTtlMinutes: 60,
    },
    options: [
      { id: 'prai1', label: { en: 'Set Next Week\'s Goal', ar: 'حدد هدف الأسبوع الجاي' }, icon: '🎯', nextState: 'PR_SET_GOAL' },
      { id: 'prai2', label: { en: 'View Full Progress', ar: 'شوف التقدم الكامل' }, icon: '📊', nextState: 'PR_OVERVIEW',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'prai3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  // ─── PROGRAMS: AI Program Recommendation ────────────────
  {
    id: 'PG_AI_RECOMMEND',
    domain: 'programs',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Program Match', ar: 'مطابقة برنامج بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Finding the best program for your goals, experience, and schedule...',
      ar: 'بدور على أحسن برنامج لأهدافك وخبرتك وجدولك...',
    },
    back: 'PG_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'profile', key: 'profile' },
        { type: 'preferences', key: 'prefs' },
        { type: 'workoutHistory', key: 'history' },
        { type: 'injuries', key: 'injuries' },
      ],
      promptTemplate: `Recommend the top 3 workout programs for this user.
Profile (age, weight, experience, goal): {profile}
Preferences (equipment, days/week, time): {prefs}
Recent workout history: {history}
Injuries: {injuries}

For each program recommendation:
- Program name and type
- Why it fits them
- Expected duration
- Difficulty rating
Keep it actionable.`,
      outputFormat: 'list',
      model: 'gpt-4o-mini',
      maxTokens: 400,
    },
    options: [
      { id: 'pgai1', label: { en: 'Browse All Programs', ar: 'استعرض كل البرامج' }, icon: '📋', nextState: 'PG_BROWSE' },
      { id: 'pgai2', label: { en: 'Start Recommended', ar: 'ابدأ المقترح' }, icon: '🚀', nextState: 'PG_START' },
      { id: 'pgai3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  // ─── SUPPLEMENTS: AI Supplement Recommendation ──────────
  {
    id: 'SP_AI_RECOMMEND',
    domain: 'supplements',
    tier: 'PREMIUM_PLUS',
    text: { en: 'AI Supplement Guide', ar: 'دليل المكملات بالذكاء الاصطناعي' },
    botMessage: {
      en: 'Analyzing your nutrition gaps and recommending supplements...',
      ar: 'بحلل النقص في تغذيتك وبقترح مكملات...',
    },
    back: 'SP_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'nutritionToday', key: 'nutrition' },
        { type: 'profile', key: 'profile' },
        { type: 'preferences', key: 'prefs' },
      ],
      promptTemplate: `Recommend supplements based on this user's profile and nutrition.
Nutrition intake: {nutrition}
Profile: {profile}
Preferences: {prefs}

Rules:
- Only recommend supplements available in Egypt
- Include dosage and timing
- Explain WHY they need it
- Max 3 recommendations
- Include budget-friendly options`,
      outputFormat: 'list',
      model: 'gpt-4o-mini',
      maxTokens: 400,
      cacheTtlMinutes: 120,
    },
    options: [
      { id: 'spai1', label: { en: 'Where to Buy', ar: 'منين أشتري' }, icon: '🛒', nextState: 'SP_SOURCES' },
      { id: 'spai2', label: { en: 'More Details', ar: 'تفاصيل أكتر' }, icon: '📖', nextState: 'SP_INFO' },
      { id: 'spai3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  // ─── PRE/POST WORKOUT: AI Guidance ─────────────────────
  {
    id: 'WK_AI_PREWORKOUT',
    domain: 'workout',
    tier: 'PREMIUM_PLUS',
    text: { en: 'Pre-Workout Guidance', ar: 'إرشادات قبل التمرين' },
    botMessage: {
      en: 'Preparing your pre-workout checklist based on today\'s session...',
      ar: 'بجهزلك قائمة التحضير حسب تمرين النهارده...',
    },
    back: 'WK_TODAY',
    gptEnhanced: {
      contextSources: [
        { type: 'todayWorkout', key: 'workout' },
        { type: 'nutritionToday', key: 'nutrition' },
        { type: 'healthMetrics', key: 'health' },
      ],
      promptTemplate: `Give pre-workout guidance for today's session.
Today's workout: {workout}
Nutrition so far today: {nutrition}
Health/recovery status: {health}

Provide:
1. Warm-up recommendation (specific to today's muscle groups)
2. Pre-workout nutrition (what to eat if they haven't)
3. Hydration check
4. Any caution based on recovery status
Keep it practical, 4-5 bullet points.`,
      outputFormat: 'list',
      model: 'gpt-4o-mini',
      maxTokens: 300,
    },
    options: [
      { id: 'wkpre1', label: { en: 'Start Workout', ar: 'ابدأ التمرين' }, icon: '🏋️', nextState: 'WK_TODAY',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkpre2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_TODAY' },
    ],
  },

  {
    id: 'WK_AI_POSTWORKOUT',
    domain: 'workout',
    tier: 'PREMIUM_PLUS',
    text: { en: 'Post-Workout Recovery', ar: 'ريكفري بعد التمرين' },
    botMessage: {
      en: 'Analyzing your workout and preparing recovery recommendations...',
      ar: 'بحلل التمرين وبجهزلك توصيات الريكفري...',
    },
    back: 'WK_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'todayWorkout', key: 'workout' },
        { type: 'nutritionToday', key: 'nutrition' },
        { type: 'profile', key: 'profile' },
      ],
      promptTemplate: `Give post-workout recovery guidance.
Completed workout: {workout}
Today's nutrition: {nutrition}
Profile: {profile}

Provide:
1. Post-workout meal suggestion (hitting protein window)
2. Stretching/cooldown recommendation
3. Next session timing recommendation
4. Any specific recovery tips (foam rolling, ice, etc.)
Keep it practical, 4-5 bullet points.`,
      outputFormat: 'list',
      model: 'gpt-4o-mini',
      maxTokens: 300,
    },
    options: [
      { id: 'wkpost1', label: { en: 'Log Post-Workout Meal', ar: 'سجّل وجبة بعد التمرين' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'wkpost2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // ─── INBODY: AI Body Composition Analysis ──────────────
  {
    id: 'HL_AI_INBODY',
    domain: 'health',
    tier: 'PREMIUM_PLUS',
    text: { en: 'InBody Analysis', ar: 'تحليل InBody' },
    botMessage: {
      en: 'Analyzing your body composition data and providing insights...',
      ar: 'بحلل بيانات تكوين الجسم وبجهزلك نتائج...',
    },
    back: 'HL_MENU',
    gptEnhanced: {
      contextSources: [
        { type: 'healthMetrics', key: 'bodyComp' },
        { type: 'weightHistory', key: 'weight' },
        { type: 'profile', key: 'profile' },
      ],
      promptTemplate: `Analyze InBody/body composition data.
Body composition: {bodyComp}
Weight history: {weight}
Profile: {profile}

Provide:
1. Current body composition assessment
2. Muscle-to-fat ratio analysis
3. Recommended adjustments to training/nutrition
4. Realistic timeline for goal
Keep it data-driven but encouraging.`,
      outputFormat: 'analysis',
      model: 'gpt-4o',
      maxTokens: 400,
    },
    options: [
      { id: 'hlinb1', label: { en: 'Adjust Nutrition', ar: 'عدّل التغذية' }, icon: '🥗', nextState: 'NT_AI_ANALYSIS' },
      { id: 'hlinb2', label: { en: 'Change Program', ar: 'غيّر البرنامج' }, icon: '📋', nextState: 'PG_AI_RECOMMEND' },
      { id: 'hlinb3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },
];
