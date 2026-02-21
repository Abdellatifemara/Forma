/**
 * Smart Intent Matcher — Maps natural language to chat state transitions
 *
 * Works 100% locally, no API calls. Matches user text to the best
 * state/action in the guided chat state machine.
 *
 * Supports English and Arabic (Egyptian dialect).
 */

export interface IntentMatch {
  stateId: string;
  confidence: number; // 0-1
  action?: { type: 'navigate'; route: string };
  response?: { en: string; ar: string };
}

interface IntentRule {
  // Keywords that trigger this intent (any match = candidate)
  keywords: string[];
  // Arabic keywords
  keywordsAr?: string[];
  // Target state in the state machine
  stateId: string;
  // Optional direct navigation (skip state machine, go to page)
  route?: string;
  // Custom response when matched
  response?: { en: string; ar: string };
  // Priority boost (higher = preferred when multiple match)
  priority?: number;
}

// ─── Intent Rules ────────────────────────────────────────────
// Organized from most specific to least specific.
// Each rule maps natural language patterns to state machine states.

const INTENT_RULES: IntentRule[] = [
  // ── Profile & Settings ──────────────────────────────────
  {
    keywords: ['change name', 'edit name', 'update name', 'my name', 'rename'],
    keywordsAr: ['غير اسمي', 'عدل اسمي', 'اسمي', 'تغيير الاسم'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: "I'll take you to edit your profile — you can change your name there.", ar: 'هوديك على صفحة تعديل البروفايل — تقدر تغير اسمك من هناك.' },
    priority: 10,
  },
  {
    keywords: ['edit profile', 'update profile', 'my profile', 'change profile', 'profile settings'],
    keywordsAr: ['تعديل البروفايل', 'بروفايلي', 'ملفي', 'تعديل ملفي'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'Opening your profile editor...', ar: 'بفتحلك صفحة تعديل البروفايل...' },
    priority: 8,
  },
  {
    keywords: ['change password', 'update password', 'reset password', 'security', 'password'],
    keywordsAr: ['غير الباسورد', 'كلمة السر', 'الأمان', 'تغيير كلمة المرور'],
    stateId: 'ST_SECURITY',
    route: '/profile/security',
    response: { en: 'Opening security settings...', ar: 'بفتحلك إعدادات الأمان...' },
    priority: 8,
  },
  {
    keywords: ['change language', 'switch language', 'arabic', 'english', 'language'],
    keywordsAr: ['غير اللغة', 'اللغة', 'عربي', 'انجليزي'],
    stateId: 'ST_LANGUAGE',
    response: { en: 'Choose your preferred language:', ar: 'اختار اللغة:' },
    priority: 7,
  },
  {
    keywords: ['subscription', 'my plan', 'upgrade', 'billing', 'payment'],
    keywordsAr: ['الاشتراك', 'اشتراكي', 'ترقية', 'الدفع', 'الفلوس'],
    stateId: 'ST_SUBSCRIPTION',
    route: '/settings/subscription',
    response: { en: 'Opening subscription settings...', ar: 'بفتحلك إعدادات الاشتراك...' },
    priority: 7,
  },
  {
    keywords: ['settings', 'preferences', 'options'],
    keywordsAr: ['الإعدادات', 'التفضيلات', 'الخيارات'],
    stateId: 'ST_MENU',
    response: { en: 'Here are your settings options:', ar: 'دي خيارات الإعدادات:' },
    priority: 5,
  },

  // ── Workouts ────────────────────────────────────────────
  {
    keywords: ['start workout', 'begin workout', 'let\'s train', 'start training', 'today workout', 'today\'s workout'],
    keywordsAr: ['ابدأ تمرين', 'تمرين النهارده', 'يلا نتمرن', 'ابدأ التدريب'],
    stateId: 'WK_TODAY',
    route: '/workouts',
    response: { en: 'Let\'s get started! Taking you to your workouts...', ar: 'يلا نبدأ! بوديك على التمارين...' },
    priority: 9,
  },
  {
    keywords: ['my workouts', 'workout list', 'all workouts', 'browse workouts', 'exercises', 'exercise library'],
    keywordsAr: ['تماريني', 'كل التمارين', 'مكتبة التمارين', 'التمارين'],
    stateId: 'WK_MENU',
    route: '/workouts',
    response: { en: 'Here are your workout options:', ar: 'دي خيارات التمارين:' },
    priority: 7,
  },
  {
    keywords: ['workout history', 'past workouts', 'previous workouts', 'training history'],
    keywordsAr: ['تاريخ التمارين', 'التمارين السابقة', 'تمارين الفاتت'],
    stateId: 'WK_HISTORY',
    response: { en: 'Let me check your workout history...', ar: 'هشوفلك تاريخ تمارينك...' },
    priority: 8,
  },
  {
    keywords: ['chest', 'chest workout', 'chest exercises', 'bench press'],
    keywordsAr: ['صدر', 'تمارين صدر', 'بنش'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=CHEST',
    response: { en: 'Taking you to chest exercises!', ar: 'بوديك على تمارين الصدر!' },
    priority: 8,
  },
  {
    keywords: ['back', 'back workout', 'back exercises', 'pull ups', 'rows'],
    keywordsAr: ['ضهر', 'تمارين ضهر', 'بول اب'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BACK',
    response: { en: 'Taking you to back exercises!', ar: 'بوديك على تمارين الضهر!' },
    priority: 8,
  },
  {
    keywords: ['legs', 'leg workout', 'leg exercises', 'squats', 'leg day'],
    keywordsAr: ['رجل', 'تمارين رجل', 'سكوات', 'يوم رجل'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=QUADRICEPS',
    response: { en: 'Taking you to leg exercises!', ar: 'بوديك على تمارين الرجل!' },
    priority: 8,
  },
  {
    keywords: ['shoulders', 'shoulder workout', 'shoulder exercises', 'delts'],
    keywordsAr: ['كتف', 'تمارين كتف'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=SHOULDERS',
    response: { en: 'Taking you to shoulder exercises!', ar: 'بوديك على تمارين الكتف!' },
    priority: 8,
  },
  {
    keywords: ['arms', 'biceps', 'triceps', 'arm workout', 'bicep', 'tricep'],
    keywordsAr: ['دراع', 'باي', 'تراي', 'تمارين دراع'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BICEPS',
    response: { en: 'Taking you to arm exercises!', ar: 'بوديك على تمارين الدراع!' },
    priority: 8,
  },
  {
    keywords: ['abs', 'core', 'ab workout', 'six pack', 'abdominal'],
    keywordsAr: ['بطن', 'كور', 'تمارين بطن', 'سكس باك'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=ABS',
    response: { en: 'Taking you to core exercises!', ar: 'بوديك على تمارين البطن!' },
    priority: 8,
  },
  {
    keywords: ['create workout', 'make workout', 'custom workout', 'new workout', 'build workout'],
    keywordsAr: ['اعمل تمرين', 'تمرين جديد', 'تمرين مخصوص'],
    stateId: 'WK_CREATE',
    route: '/workouts/create',
    response: { en: 'Let\'s create a workout for you!', ar: 'يلا نعملك تمرين!' },
    priority: 9,
  },

  // ── Nutrition ───────────────────────────────────────────
  {
    keywords: ['log meal', 'add meal', 'track food', 'log food', 'what i ate', 'record meal'],
    keywordsAr: ['سجل وجبة', 'أضف أكل', 'سجل أكل', 'اكلت'],
    stateId: 'NT_LOG_MEAL',
    route: '/nutrition',
    response: { en: 'Let\'s log your meal!', ar: 'يلا نسجل وجبتك!' },
    priority: 9,
  },
  {
    keywords: ['nutrition', 'my diet', 'calories today', 'macros', 'food', 'daily intake'],
    keywordsAr: ['التغذية', 'الدايت', 'كالوري', 'ماكرو', 'أكلي'],
    stateId: 'NT_MENU',
    route: '/nutrition',
    response: { en: 'Here are your nutrition options:', ar: 'دي خيارات التغذية:' },
    priority: 7,
  },
  {
    keywords: ['water', 'drink water', 'log water', 'hydration'],
    keywordsAr: ['مية', 'اشرب مية', 'سجل مية', 'ترطيب'],
    stateId: 'NT_LOG_WATER',
    response: { en: 'Logging water intake...', ar: 'بسجل شرب المية...' },
    priority: 8,
  },
  {
    keywords: ['meal plan', 'diet plan', 'eating plan', 'what should i eat', 'suggest food'],
    keywordsAr: ['خطة أكل', 'خطة دايت', 'آكل ايه', 'اقتراح أكل'],
    stateId: 'NT_PLAN_MENU',
    response: { en: 'Let me help with your meal plan:', ar: 'هساعدك في خطة الأكل:' },
    priority: 8,
  },

  // ── Health & Body ───────────────────────────────────────
  {
    keywords: ['my weight', 'log weight', 'record weight', 'weigh in', 'how much i weigh'],
    keywordsAr: ['وزني', 'سجل الوزن', 'كم وزني'],
    stateId: 'PR_LOG_WEIGHT',
    response: { en: 'Let\'s log your weight:', ar: 'يلا نسجل وزنك:' },
    priority: 9,
  },
  {
    keywords: ['health', 'body stats', 'health data', 'vitals', 'heart rate', 'sleep'],
    keywordsAr: ['صحتي', 'بيانات الجسم', 'نبض', 'نوم'],
    stateId: 'HL_MENU',
    response: { en: 'Here are your health options:', ar: 'دي خيارات الصحة:' },
    priority: 7,
  },
  {
    keywords: ['recovery', 'rest day', 'how recovered', 'recovery score'],
    keywordsAr: ['ريكفري', 'يوم راحة', 'الاستشفاء'],
    stateId: 'RC_MENU',
    response: { en: 'Here are your recovery options:', ar: 'دي خيارات الريكفري:' },
    priority: 7,
  },

  // ── Progress ────────────────────────────────────────────
  {
    keywords: ['my progress', 'progress', 'how am i doing', 'stats', 'results', 'goals'],
    keywordsAr: ['تقدمي', 'التقدم', 'النتايج', 'الأهداف', 'إحصائيات'],
    stateId: 'PR_MENU',
    route: '/progress',
    response: { en: 'Let me show you your progress:', ar: 'هوريك تقدمك:' },
    priority: 7,
  },
  {
    keywords: ['weekly check', 'check in', 'weekly review'],
    keywordsAr: ['تشيك إن', 'مراجعة أسبوعية'],
    stateId: 'PR_CHECKIN',
    route: '/check-in',
    response: { en: 'Time for your weekly check-in!', ar: 'وقت التشيك إن الأسبوعي!' },
    priority: 8,
  },

  // ── Programs ────────────────────────────────────────────
  {
    keywords: ['programs', 'workout plan', 'training plan', 'routine', 'program'],
    keywordsAr: ['البرامج', 'خطة تمارين', 'روتين', 'برنامج'],
    stateId: 'PG_MENU',
    response: { en: 'Here are your program options:', ar: 'دي خيارات البرامج:' },
    priority: 7,
  },
  {
    keywords: ['my program', 'active program', 'current plan', 'what program'],
    keywordsAr: ['برنامجي', 'البرنامج النشط', 'خطتي الحالية'],
    stateId: 'PG_ACTIVE',
    response: { en: 'Checking your active program...', ar: 'بشوف برنامجك النشط...' },
    priority: 8,
  },

  // ── Supplements ─────────────────────────────────────────
  {
    keywords: ['supplements', 'protein powder', 'creatine', 'vitamins', 'bcaa', 'whey'],
    keywordsAr: ['مكملات', 'بروتين باودر', 'كرياتين', 'فيتامينات'],
    stateId: 'SP_MENU',
    response: { en: 'Here are supplement options:', ar: 'دي خيارات المكملات:' },
    priority: 7,
  },

  // ── Devices ─────────────────────────────────────────────
  {
    keywords: ['connect device', 'apple watch', 'garmin', 'fitbit', 'whoop', 'wearable', 'smartwatch'],
    keywordsAr: ['وصل جهاز', 'ساعة ذكية', 'أبل واتش', 'جارمين', 'فيتبت'],
    stateId: 'DV_MENU',
    response: { en: 'Here are your device options:', ar: 'دي خيارات الأجهزة:' },
    priority: 7,
  },

  // ── General / Greeting ──────────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'sup', 'yo'],
    keywordsAr: ['اهلا', 'مرحبا', 'صباح الخير', 'مساء الخير', 'ازيك', 'يو'],
    stateId: 'ROOT',
    response: { en: 'Hey! What would you like to do today?', ar: 'أهلاً! عايز تعمل ايه النهارده؟' },
    priority: 1,
  },
  {
    keywords: ['help', 'what can you do', 'options', 'menu', 'home'],
    keywordsAr: ['مساعدة', 'تقدر تعمل ايه', 'القائمة', 'الرئيسية'],
    stateId: 'ROOT',
    response: { en: 'Here\'s what I can help you with:', ar: 'دي الحاجات اللي أقدر أساعدك فيها:' },
    priority: 1,
  },
  {
    keywords: ['back', 'go back', 'return', 'previous'],
    keywordsAr: ['رجوع', 'ارجع', 'السابق'],
    stateId: '__BACK__', // Special: go back in state stack
    response: { en: 'Going back...', ar: 'راجع...' },
    priority: 3,
  },
];

/**
 * Match user text to the best intent.
 * Returns null if no confident match found.
 */
export function matchIntent(text: string, currentStateId: string): IntentMatch | null {
  const normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return null;

  let bestMatch: { rule: IntentRule; score: number } | null = null;

  for (const rule of INTENT_RULES) {
    let score = 0;

    // Check English keywords
    for (const kw of rule.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        // Exact phrase match gets higher score
        const kwLen = kw.split(' ').length;
        score = Math.max(score, kwLen * 2 + (rule.priority || 0));
      }
    }

    // Check Arabic keywords
    if (rule.keywordsAr) {
      for (const kw of rule.keywordsAr) {
        if (normalized.includes(kw)) {
          const kwLen = kw.split(' ').length;
          score = Math.max(score, kwLen * 2 + (rule.priority || 0));
        }
      }
    }

    // Word-level partial matching for short inputs
    if (score === 0) {
      const words = normalized.split(/\s+/);
      for (const kw of [...rule.keywords, ...(rule.keywordsAr || [])]) {
        const kwWords = kw.toLowerCase().split(/\s+/);
        const matchedWords = kwWords.filter(kw => words.some(w => w.includes(kw) || kw.includes(w)));
        if (matchedWords.length >= Math.ceil(kwWords.length * 0.6)) {
          score = Math.max(score, matchedWords.length + (rule.priority || 0) * 0.5);
        }
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { rule, score };
    }
  }

  if (!bestMatch || bestMatch.score < 2) return null;

  const confidence = Math.min(bestMatch.score / 15, 1);

  return {
    stateId: bestMatch.rule.stateId,
    confidence,
    action: bestMatch.rule.route ? { type: 'navigate', route: bestMatch.rule.route } : undefined,
    response: bestMatch.rule.response,
  };
}

/**
 * Get smart suggestions based on partial text input.
 * Returns up to 3 quick-match labels the user might mean.
 */
export function getSuggestions(text: string, limit = 3): Array<{ label: string; labelAr: string; stateId: string }> {
  const normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return [];

  const matches: Array<{ label: string; labelAr: string; stateId: string; score: number }> = [];

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (kw.toLowerCase().includes(normalized) || normalized.includes(kw.toLowerCase())) {
        score = Math.max(score, (rule.priority || 0) + 1);
      }
    }
    if (rule.keywordsAr) {
      for (const kw of rule.keywordsAr) {
        if (kw.includes(normalized) || normalized.includes(kw)) {
          score = Math.max(score, (rule.priority || 0) + 1);
        }
      }
    }

    if (score > 0 && rule.response) {
      matches.push({
        label: rule.response.en.replace(/[.!]$/, ''),
        labelAr: rule.response.ar.replace(/[.!]$/, ''),
        stateId: rule.stateId,
        score,
      });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ label, labelAr, stateId }) => ({ label, labelAr, stateId }));
}
