/**
 * Smart Intent Matcher — Maps natural language to chat state transitions
 *
 * Works 100% locally, no API calls. Matches user text to the best
 * state/action in the guided chat state machine.
 *
 * Supports: English, Arabic (Egyptian dialect), Franco-Arab (Arabizi)
 *
 * v2 — 150+ intent rules, context-aware scoring, fuzzy matching, Arabizi
 */

export interface IntentMatch {
  stateId: string;
  confidence: number; // 0-1
  action?: { type: 'navigate'; route: string };
  response?: { en: string; ar: string };
  // Extracted parameters from the text (e.g., weight value, water amount)
  extractedParams?: Record<string, string>;
}

interface IntentRule {
  keywords: string[];
  keywordsAr?: string[];
  // Franco-Arab / Arabizi keywords (e.g., "3ayez", "ta3ban")
  keywordsFranco?: string[];
  stateId: string;
  route?: string;
  response?: { en: string; ar: string };
  priority?: number;
  // Domain hint — gets boosted when user is already in this domain
  domain?: string;
}

// ─── Common Typo Map (fuzzy matching) ───────────────────────
const TYPO_MAP: Record<string, string> = {
  'exersice': 'exercise', 'exercize': 'exercise', 'excercise': 'exercise',
  'workou': 'workout', 'workotu': 'workout', 'wrokout': 'workout',
  'nutrtion': 'nutrition', 'nutriton': 'nutrition',
  'protien': 'protein', 'protine': 'protein',
  'calroies': 'calories', 'caloreis': 'calories', 'caloris': 'calories',
  'squatt': 'squat', 'deadlfit': 'deadlift', 'benchpress': 'bench press',
  'scheudle': 'schedule', 'schedual': 'schedule',
  'suplement': 'supplement', 'supplment': 'supplement',
  'creatien': 'creatine', 'creatin': 'creatine',
  'streching': 'stretching', 'strech': 'stretch',
  'progrss': 'progress', 'progres': 'progress',
  'recvery': 'recovery', 'recovry': 'recovery',
  'shoudler': 'shoulder', 'sholder': 'shoulder',
  'bicep': 'biceps', 'tricep': 'triceps',
  'weigth': 'weight', 'wieght': 'weight',
  'histry': 'history', 'histroy': 'history',
  'teh': 'the', 'taht': 'that',
};

function fixTypos(text: string): string {
  const words = text.split(/\s+/);
  return words.map(w => TYPO_MAP[w] || w).join(' ');
}

// ─── Noise Prefix Stripping ─────────────────────────────────
// "show me chest exercises" → "chest exercises"
// "I want to log my meal" → "log my meal"
// "can you find me back workouts" → "back workouts"
const NOISE_PREFIXES = [
  'show me', 'give me', 'find me', 'get me', 'take me to', 'open',
  'i want to', 'i want', 'i need to', 'i need', 'i wanna', "i'd like to", "i'd like",
  'can you', 'could you', 'please', 'can i', 'how do i', 'how to',
  'let me', "let's", 'lets', 'help me', 'help me with',
  'go to', 'navigate to', 'switch to',
  // Arabic noise
  'عايز', 'عاوز', 'محتاج', 'ممكن', 'خليني', 'وريني', 'هاتلي',
  // Franco
  '3ayez', '3awez', 'me7tag', 'momken', '5aliny', 'wareny', 'hatly',
];

function stripNoise(text: string): string {
  let result = text;
  for (const prefix of NOISE_PREFIXES) {
    if (result.startsWith(prefix + ' ')) {
      result = result.slice(prefix.length).trim();
    }
  }
  // Also strip trailing "please" / "من فضلك"
  result = result.replace(/\s+please$/i, '').replace(/\s+من فضلك$/, '').replace(/\s+plz$/i, '');
  return result;
}

// ─── Simple English Stemming ─────────────────────────────────
// Strips common suffixes so "exercising" matches "exercise", "logged" matches "log"
function simpleStem(word: string): string {
  if (word.length < 5) return word;
  if (word.endsWith('ting') && word.length > 6) return word.slice(0, -4) + 'te'; // exercising→exercis→exercise is caught by contains
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('tion')) return word.slice(0, -4) + 'te';
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('er') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ness') && word.length > 6) return word.slice(0, -4);
  if (word.endsWith('ies') && word.length > 5) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 4) return word.slice(0, -1);
  return word;
}

function stemText(text: string): string {
  return text.split(/\s+/).map(w => simpleStem(w)).join(' ');
}

// ─── Number Extraction ──────────────────────────────────────
// Extracts numbers + units from text (e.g., "85 kg", "500 ml", "3 sets")
function extractNumbers(text: string): Record<string, string> {
  const params: Record<string, string> = {};

  // Weight: "85 kg", "85kg", "I weigh 85", "وزني 85"
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|كيلو)/i) ||
    text.match(/(?:weigh|weight|وزني|وزن)\s*(?:is\s*)?(\d+(?:\.\d+)?)/i);
  if (weightMatch) params.weight = weightMatch[1];

  // Water: "500 ml", "500ml", "2 liters", "لتر"
  const waterMatch = text.match(/(\d+)\s*(?:ml|مل)/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:liter|litre|لتر)/i);
  if (waterMatch) {
    const val = waterMatch[0].includes('liter') || waterMatch[0].includes('لتر')
      ? String(parseFloat(waterMatch[1]) * 1000)
      : waterMatch[1];
    params.water_ml = val;
  }

  // Duration: "30 min", "1 hour", "ساعة"
  const durationMatch = text.match(/(\d+)\s*(?:min|minutes|دقيقة|دقايق)/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|ساعة|ساعات)/i);
  if (durationMatch) {
    const val = durationMatch[0].match(/hour|ساعة/i)
      ? String(parseFloat(durationMatch[1]) * 60)
      : durationMatch[1];
    params.duration_min = val;
  }

  // Calories: "1800 cal", "2000 calories"
  const calMatch = text.match(/(\d+)\s*(?:cal|calories|سعر|سعرة)/i);
  if (calMatch) params.calories = calMatch[1];

  // Steps: "10000 steps", "5000 خطوة"
  const stepsMatch = text.match(/(\d+)\s*(?:steps|step|خطوة|خطوات)/i);
  if (stepsMatch) params.steps = stepsMatch[1];

  return params;
}

// ─── Intent Rules ────────────────────────────────────────────
// 150+ rules organized by domain. Most specific → least specific.

const INTENT_RULES: IntentRule[] = [
  // ══════════════════════════════════════════════════════════
  // ── Profile & Settings ────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['change name', 'edit name', 'update name', 'my name', 'rename', 'change my name'],
    keywordsAr: ['غير اسمي', 'عدل اسمي', 'اسمي', 'تغيير الاسم'],
    keywordsFranco: ['ghayar esmy', 'esmy', '3ayez aghayar esmy'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: "I'll take you to edit your profile — you can change your name there.", ar: 'هوديك على صفحة تعديل البروفايل — تقدر تغير اسمك من هناك.' },
    priority: 10,
    domain: 'settings',
  },
  {
    keywords: ['edit profile', 'update profile', 'my profile', 'change profile', 'profile settings', 'profile info'],
    keywordsAr: ['تعديل البروفايل', 'بروفايلي', 'ملفي', 'تعديل ملفي'],
    keywordsFranco: ['profile', 'el profile', 'el profil'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'Opening your profile editor...', ar: 'بفتحلك صفحة تعديل البروفايل...' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change password', 'update password', 'reset password', 'security', 'password', 'new password'],
    keywordsAr: ['غير الباسورد', 'كلمة السر', 'الأمان', 'تغيير كلمة المرور', 'باسورد'],
    keywordsFranco: ['password', 'el password', 'ghayar el password'],
    stateId: 'ST_SECURITY',
    route: '/profile/security',
    response: { en: 'Opening security settings...', ar: 'بفتحلك إعدادات الأمان...' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change language', 'switch language', 'arabic', 'english', 'language'],
    keywordsAr: ['غير اللغة', 'اللغة', 'عربي', 'انجليزي'],
    keywordsFranco: ['3araby', 'english', 'el logha'],
    stateId: 'ST_LANGUAGE',
    response: { en: 'Choose your preferred language:', ar: 'اختار اللغة:' },
    priority: 7,
    domain: 'settings',
  },
  {
    keywords: ['subscription', 'my plan', 'upgrade', 'billing', 'payment', 'premium', 'renew', 'cancel subscription'],
    keywordsAr: ['الاشتراك', 'اشتراكي', 'ترقية', 'الدفع', 'الفلوس', 'بريميوم'],
    keywordsFranco: ['el eshterak', 'premium', 'upgrade'],
    stateId: 'ST_SUBSCRIPTION',
    route: '/settings/subscription',
    response: { en: 'Opening subscription settings...', ar: 'بفتحلك إعدادات الاشتراك...' },
    priority: 7,
    domain: 'settings',
  },
  {
    keywords: ['settings', 'preferences', 'options', 'account settings'],
    keywordsAr: ['الإعدادات', 'التفضيلات', 'الخيارات'],
    keywordsFranco: ['settings', 'el settings'],
    stateId: 'ST_MENU',
    response: { en: 'Here are your settings options:', ar: 'دي خيارات الإعدادات:' },
    priority: 5,
    domain: 'settings',
  },
  {
    keywords: ['change goal', 'update goal', 'set goal', 'fitness goal', 'my goal', 'change my goal'],
    keywordsAr: ['غير الهدف', 'هدفي', 'حدد هدف', 'عايز اغير هدفي'],
    keywordsFranco: ['el hadaf', 'ghayar el hadaf', '3ayez aghayar hadafy'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: "Let's update your fitness goal:", ar: 'يلا نعدل هدف اللياقة:' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change email', 'update email', 'my email', 'new email'],
    keywordsAr: ['غير الايميل', 'الايميل'],
    keywordsFranco: ['el email', 'ghayar el email'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your email in profile settings.', ar: 'تقدر تغير الإيميل من إعدادات البروفايل.' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change photo', 'update photo', 'profile picture', 'avatar', 'my picture', 'upload photo'],
    keywordsAr: ['غير الصورة', 'صورتي', 'صورة البروفايل'],
    keywordsFranco: ['el sora', 'ghayar el sora', 'sorti'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your photo in profile settings.', ar: 'تقدر تغير صورتك من إعدادات البروفايل.' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change height', 'update height', 'my height', 'how tall'],
    keywordsAr: ['غير الطول', 'طولي'],
    keywordsFranco: ['tooly', 'el tool'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your height in profile settings.', ar: 'تقدر تغير طولك من إعدادات البروفايل.' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['change age', 'update age', 'birthday', 'date of birth'],
    keywordsAr: ['عمري', 'تاريخ الميلاد'],
    keywordsFranco: ['3omry', 'el birthday'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your age in profile settings.', ar: 'تقدر تعدل عمرك من إعدادات البروفايل.' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['logout', 'log out', 'sign out', 'exit app'],
    keywordsAr: ['تسجيل خروج', 'خروج', 'اطلع'],
    keywordsFranco: ['logout', 'log out', 'sign out'],
    stateId: 'ST_MENU',
    response: { en: 'You can log out from Settings > Security.', ar: 'تقدر تسجل خروج من الإعدادات > الأمان.' },
    priority: 6,
    domain: 'settings',
  },
  {
    keywords: ['delete account', 'remove account', 'cancel account', 'close account'],
    keywordsAr: ['حذف الحساب', 'امسح حسابي', 'الغي حسابي'],
    keywordsFranco: ['delete account', 'emsah 7esaby'],
    stateId: 'ST_SECURITY',
    route: '/profile/security',
    response: { en: 'Account deletion can be found in Security settings.', ar: 'حذف الحساب من إعدادات الأمان.' },
    priority: 8,
    domain: 'settings',
  },
  {
    keywords: ['workout preferences', 'training preferences', 'exercise preferences'],
    keywordsAr: ['تفضيلات التمرين'],
    stateId: 'ST_WORKOUT_PREFS',
    response: { en: 'Opening workout preferences...', ar: 'بفتحلك تفضيلات التمرين...' },
    priority: 7,
    domain: 'settings',
  },

  // ══════════════════════════════════════════════════════════
  // ── Workouts — General ────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['start workout', 'begin workout', "let's train", 'start training', 'today workout', "today's workout", 'lets go', "let's go"],
    keywordsAr: ['ابدأ تمرين', 'تمرين النهارده', 'يلا نتمرن', 'ابدأ التدريب', 'يلا نبدأ'],
    keywordsFranco: ['yala net2amen', 'tamreen el naharda', 'yala nebda2', 'start workout', '3ayez at2amen'],
    stateId: 'WK_TODAY',
    route: '/workouts',
    response: { en: "Let's get started! Taking you to your workouts...", ar: 'يلا نبدأ! بوديك على التمارين...' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['my workouts', 'workout list', 'all workouts', 'browse workouts'],
    keywordsAr: ['تماريني', 'كل التمارين', 'التمارين'],
    keywordsFranco: ['tamariny', 'kol el tamarin'],
    stateId: 'WK_MENU',
    route: '/workouts',
    response: { en: 'Here are your workout options:', ar: 'دي خيارات التمارين:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['exercise library', 'exercises', 'find exercise', 'search exercise', 'browse exercises'],
    keywordsAr: ['مكتبة التمارين', 'تصفح التمارين', 'دور على تمرين'],
    keywordsFranco: ['maktabet el tamarin', 'tamarin'],
    stateId: 'WK_FIND',
    route: '/exercises',
    response: { en: 'Opening exercise library...', ar: 'بفتحلك مكتبة التمارين...' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['workout history', 'past workouts', 'previous workouts', 'training history', 'last workout'],
    keywordsAr: ['تاريخ التمارين', 'التمارين السابقة', 'تمارين الفاتت', 'آخر تمرين'],
    keywordsFranco: ['el tamarin ely fatet', 'akher tamreen'],
    stateId: 'WK_HISTORY',
    response: { en: 'Let me check your workout history...', ar: 'هشوفلك تاريخ تمارينك...' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['create workout', 'make workout', 'custom workout', 'new workout', 'build workout', 'design workout'],
    keywordsAr: ['اعمل تمرين', 'تمرين جديد', 'تمرين مخصوص'],
    keywordsFranco: ['e3mel tamreen', 'tamreen gedid'],
    stateId: 'WK_CREATE',
    route: '/workouts/create',
    response: { en: "Let's create a workout for you!", ar: 'يلا نعملك تمرين!' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['log workout', 'record workout', 'finished workout', 'done workout', 'complete workout'],
    keywordsAr: ['سجل تمرين', 'خلصت التمرين', 'التمرين خلص'],
    keywordsFranco: ['khalast el tamreen', 'seggel tamreen'],
    stateId: 'WK_LOG',
    response: { en: "Let's log your workout!", ar: 'يلا نسجل تمرينك!' },
    priority: 9,
    domain: 'workout',
  },

  // ── Muscle Groups ─────────────────────────────────────────
  {
    keywords: ['chest', 'chest workout', 'chest exercises', 'bench press', 'chest day', 'pec', 'pecs'],
    keywordsAr: ['صدر', 'تمارين صدر', 'بنش', 'يوم صدر'],
    keywordsFranco: ['sadr', 'tamarin sadr', 'bench', 'chest'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=CHEST',
    response: { en: 'Taking you to chest exercises!', ar: 'بوديك على تمارين الصدر!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['back', 'back workout', 'back exercises', 'pull ups', 'rows', 'back day', 'lats', 'lat pulldown'],
    keywordsAr: ['ضهر', 'تمارين ضهر', 'بول اب', 'يوم ضهر'],
    keywordsFranco: ['dahr', 'tamarin dahr', 'pull ups'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BACK',
    response: { en: 'Taking you to back exercises!', ar: 'بوديك على تمارين الضهر!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['legs', 'leg workout', 'leg exercises', 'squats', 'leg day', 'quads', 'quadriceps'],
    keywordsAr: ['رجل', 'تمارين رجل', 'سكوات', 'يوم رجل'],
    keywordsFranco: ['regl', 'tamarin regl', 'squat', 'yom regl', 'leg day'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=QUADRICEPS',
    response: { en: 'Taking you to leg exercises!', ar: 'بوديك على تمارين الرجل!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['hamstrings', 'hamstring', 'ham', 'leg curl'],
    keywordsAr: ['عضلة خلفية', 'هامسترنج'],
    keywordsFranco: ['hamstring'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=HAMSTRINGS',
    response: { en: 'Taking you to hamstring exercises!', ar: 'بوديك على تمارين العضلة الخلفية!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['glutes', 'glute', 'butt', 'hip thrust', 'booty'],
    keywordsAr: ['مؤخرة', 'جلوت'],
    keywordsFranco: ['glutes', 'hip thrust'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=GLUTES',
    response: { en: 'Taking you to glute exercises!', ar: 'بوديك على تمارين الجلوت!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['calves', 'calf', 'calf raise'],
    keywordsAr: ['سمانة', 'بطة الرجل'],
    keywordsFranco: ['samana', 'calf'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=CALVES',
    response: { en: 'Taking you to calf exercises!', ar: 'بوديك على تمارين السمانة!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['shoulders', 'shoulder workout', 'shoulder exercises', 'delts', 'deltoids', 'shoulder day', 'overhead press', 'ohp'],
    keywordsAr: ['كتف', 'تمارين كتف', 'يوم كتف'],
    keywordsFranco: ['ketf', 'tamarin ketf', 'yom ketf'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=SHOULDERS',
    response: { en: 'Taking you to shoulder exercises!', ar: 'بوديك على تمارين الكتف!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['arms', 'biceps', 'triceps', 'arm workout', 'arm day', 'arm exercises', 'curls'],
    keywordsAr: ['دراع', 'باي', 'تراي', 'تمارين دراع', 'يوم دراع'],
    keywordsFranco: ['dra3', 'tamarin dra3', 'biceps', 'triceps'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BICEPS',
    response: { en: 'Taking you to arm exercises!', ar: 'بوديك على تمارين الدراع!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['forearms', 'forearm', 'grip', 'grip strength', 'wrist curl'],
    keywordsAr: ['ساعد', 'قبضة'],
    keywordsFranco: ['sa3ed', 'forearm'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=FOREARMS',
    response: { en: 'Taking you to forearm exercises!', ar: 'بوديك على تمارين الساعد!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['abs', 'core', 'ab workout', 'six pack', 'abdominal', 'abs workout', 'core exercises'],
    keywordsAr: ['بطن', 'كور', 'تمارين بطن', 'سكس باك'],
    keywordsFranco: ['batn', 'tamarin batn', 'six pack', 'abs'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=ABS',
    response: { en: 'Taking you to core exercises!', ar: 'بوديك على تمارين البطن!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['traps', 'trapezius', 'shrugs', 'trap exercises'],
    keywordsAr: ['ترابيز', 'شراجز'],
    keywordsFranco: ['traps', 'shrugs'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=TRAPS',
    response: { en: 'Taking you to trap exercises!', ar: 'بوديك على تمارين الترابيز!' },
    priority: 8,
    domain: 'workout',
  },

  // ── Equipment-Based ───────────────────────────────────────
  {
    keywords: ['dumbbell', 'dumbbell exercises', 'dumbbell workout', 'dumbbells'],
    keywordsAr: ['دمبل', 'تمارين دمبل'],
    keywordsFranco: ['dumbbell', 'dumbl'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=DUMBBELLS',
    response: { en: 'Dumbbell exercises:', ar: 'تمارين الدمبل:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['barbell', 'barbell exercises', 'barbell workout', 'bar exercises'],
    keywordsAr: ['بار', 'تمارين بار'],
    keywordsFranco: ['barbell', 'bar'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=BARBELL',
    response: { en: 'Barbell exercises:', ar: 'تمارين البار:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['bodyweight', 'no equipment', 'home exercises', 'home workout', 'at home', 'without equipment'],
    keywordsAr: ['بدون أدوات', 'تمارين البيت', 'في البيت'],
    keywordsFranco: ['fe el beit', 'men ghier adawat', 'bodyweight'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=BODYWEIGHT',
    response: { en: 'Bodyweight exercises (no equipment needed):', ar: 'تمارين بدون أدوات:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['resistance bands', 'bands', 'band exercises', 'band workout'],
    keywordsAr: ['باند', 'حبل مقاومة'],
    keywordsFranco: ['band', 'bands', 'resistance band'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=RESISTANCE_BANDS',
    response: { en: 'Resistance band exercises:', ar: 'تمارين الباند:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['kettlebell', 'kettlebell exercises', 'kettlebell workout', 'kb'],
    keywordsAr: ['كتل بل', 'كيتل بل'],
    keywordsFranco: ['kettlebell', 'kb'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=KETTLEBELL',
    response: { en: 'Kettlebell exercises:', ar: 'تمارين الكيتل بل:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['machine', 'machine exercises', 'cable', 'cable exercises', 'gym machines'],
    keywordsAr: ['مكنة', 'تمارين مكنة', 'كابل'],
    keywordsFranco: ['makana', 'cable', 'machine'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=MACHINE',
    response: { en: 'Machine & cable exercises:', ar: 'تمارين المكنة والكابل:' },
    priority: 7,
    domain: 'workout',
  },

  // ── Workout Conversational ────────────────────────────────
  {
    keywords: ['skip workout', "don't want to train", 'skip today', 'no workout', "can't workout", "can't train", 'not training today'],
    keywordsAr: ['اسكب التمرين', 'مش عايز اتمرن', 'مش هتمرن', 'مش هعمل تمرين'],
    keywordsFranco: ['mesh 3ayez at2amen', 'msh hat2amen', 'skip'],
    stateId: 'WK_SKIP_REASON',
    response: { en: "No worries! What's the reason for skipping today?", ar: 'مفيش مشكلة! ايه السبب اللي خلاك تسكب النهارده؟' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ["i'm tired", 'tired', 'exhausted', 'no energy', 'fatigue', 'so tired', 'low energy'],
    keywordsAr: ['تعبان', 'مرهق', 'مفيش طاقة'],
    keywordsFranco: ['ta3ban', 'mar7a2', 'mafesh ta2a', 'ana ta3ban'],
    stateId: 'WK_SKIP_TIRED',
    response: { en: "I understand you're tired. Let me suggest what to do:", ar: 'فاهم انك تعبان. خليني اقترحلك حاجة:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ["i'm injured", 'injury', 'hurt', 'pain', 'sore', 'pulled muscle', 'sprain', 'strained'],
    keywordsAr: ['متأذي', 'إصابة', 'بوجعني', 'ألم', 'شد عضلي'],
    keywordsFranco: ['ana met2azy', 'esaba', 'bewga3ny', 'alam', 'shad 3adaly'],
    stateId: 'WK_SKIP_INJURY',
    response: { en: "Sorry to hear that. Let's handle this carefully:", ar: 'سلامتك! خليني اساعدك:' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['rest day', 'take a break', 'day off', 'need rest'],
    keywordsAr: ['يوم راحة', 'عايز اريح', 'محتاج راحة'],
    keywordsFranco: ['yom ra7a', '3ayez are7', 'rest day'],
    stateId: 'WK_SKIP_REST',
    response: { en: 'Rest is important! Logging your rest day...', ar: 'الراحة مهمة! بسجل يوم الراحة...' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['warm up', 'warmup', 'pre workout', 'before workout', 'get ready'],
    keywordsAr: ['تسخين', 'ورم اب', 'قبل التمرين'],
    keywordsFranco: ['warm up', 'tas5in', '2abl el tamreen'],
    stateId: 'WK_PRE',
    response: { en: "Let's get you warmed up properly!", ar: 'يلا نسخن كويس!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['cool down', 'cooldown', 'stretch', 'after workout', 'post workout', 'stretching'],
    keywordsAr: ['تبريد', 'كول داون', 'استرتش', 'بعد التمرين'],
    keywordsFranco: ['cool down', 'ba3d el tamreen', 'stretch'],
    stateId: 'WK_POST',
    response: { en: 'Time to cool down!', ar: 'وقت التبريد!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['swap exercise', 'change exercise', 'replace exercise', 'different exercise', 'alternative exercise'],
    keywordsAr: ['غير التمرين', 'بدل التمرين', 'تمرين تاني', 'بديل'],
    keywordsFranco: ['ghayar el tamreen', 'badel el tamreen', 'tamreen tany'],
    stateId: 'WK_CHANGE',
    response: { en: "Let's swap out an exercise:", ar: 'يلا نبدل التمرين:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['rate workout', 'how was workout', 'workout feedback', 'rate my workout'],
    keywordsAr: ['قيم التمرين', 'التمرين كان ايه'],
    keywordsFranco: ['2ayem el tamreen'],
    stateId: 'WK_RATE',
    response: { en: 'How was your workout?', ar: 'التمرين كان ايه النهارده؟' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['form check', 'proper form', 'technique', 'how to do', 'correct form', 'exercise form'],
    keywordsAr: ['الفورم', 'الطريقة الصح', 'تكنيك', 'ازاي اعمل'],
    keywordsFranco: ['el form', 'el tari2a el sa7', 'ezay a3mel'],
    stateId: 'WK_FORM_MENU',
    response: { en: "Let's check your form:", ar: 'يلا نشوف الفورم:' },
    priority: 8,
    domain: 'workout',
  },

  // ── Fitness Jargon ────────────────────────────────────────
  {
    keywords: ['pr', 'personal record', 'new pr', 'pb', 'personal best', '1rm', 'one rep max', 'max out', 'test max'],
    keywordsAr: ['رقم شخصي', 'أقصى وزن', 'بي آر'],
    keywordsFranco: ['pr', 'personal record', '1rm'],
    stateId: 'WK_LOG',
    response: { en: "Let's log your PR! What exercise?", ar: 'يلا نسجل رقمك الشخصي! ايه التمرين؟' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['deload', 'deload week', 'light week', 'recovery week', 'easy week'],
    keywordsAr: ['ديلود', 'أسبوع خفيف'],
    keywordsFranco: ['deload', 'week 5afif'],
    stateId: 'WK_SKIP_REST',
    response: { en: 'Smart move! A deload week helps recovery. Want a light routine?', ar: 'قرار ذكي! أسبوع الديلود بيساعد في الريكفري. عايز روتين خفيف؟' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['superset', 'super set', 'giant set', 'drop set', 'compound set'],
    keywordsAr: ['سوبر سيت', 'دروب سيت'],
    keywordsFranco: ['superset', 'drop set'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Let me find superset-friendly exercises:', ar: 'هجبلك تمارين مناسبة للسوبر سيت:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['push pull legs', 'ppl', 'push day', 'pull day', 'upper lower', 'split'],
    keywordsAr: ['بوش بول ليج', 'سبليت'],
    keywordsFranco: ['push pull legs', 'ppl', 'split'],
    stateId: 'PG_MENU',
    response: { en: 'Looking for workout splits? Check out programs:', ar: 'بتدور على سبليت؟ شوف البرامج:' },
    priority: 7,
    domain: 'workout',
  },

  // ── CrossFit ──────────────────────────────────────────────
  {
    keywords: ['crossfit', 'wod', 'amrap', 'emom', 'for time', 'metcon'],
    keywordsAr: ['كروسفت', 'كروس فت'],
    keywordsFranco: ['crossfit', 'cross fit', 'wod'],
    stateId: 'WK_CROSSFIT',
    response: { en: 'CrossFit options:', ar: 'خيارات الكروسفت:' },
    priority: 8,
    domain: 'workout',
  },

  // ── Specific Lifts ────────────────────────────────────────
  {
    keywords: ['deadlift', 'dead lift', 'conventional deadlift', 'sumo deadlift'],
    keywordsAr: ['ديدلفت', 'ديد لفت'],
    keywordsFranco: ['deadlift'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BACK',
    response: { en: 'Here are deadlift variations:', ar: 'دي أنواع الديدلفت:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['squat', 'back squat', 'front squat', 'goblet squat'],
    keywordsAr: ['سكوات', 'اسكوات'],
    keywordsFranco: ['squat', 'sqwat'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=QUADRICEPS',
    response: { en: 'Here are squat variations:', ar: 'دي أنواع السكوات:' },
    priority: 8,
    domain: 'workout',
  },

  // ══════════════════════════════════════════════════════════
  // ── Nutrition ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['log meal', 'add meal', 'track food', 'log food', 'what i ate', 'record meal', 'add food'],
    keywordsAr: ['سجل وجبة', 'أضف أكل', 'سجل أكل', 'اكلت'],
    keywordsFranco: ['seggel wagba', 'seggel akl', 'akalt'],
    stateId: 'NT_LOG_MEAL',
    route: '/nutrition',
    response: { en: "Let's log your meal!", ar: 'يلا نسجل وجبتك!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['nutrition', 'my diet', 'calories today', 'macros', 'daily intake', 'macro tracking'],
    keywordsAr: ['التغذية', 'الدايت', 'كالوري', 'ماكرو', 'أكلي'],
    keywordsFranco: ['el taghzya', 'el diet', 'calories', 'macros', 'akly'],
    stateId: 'NT_MENU',
    route: '/nutrition',
    response: { en: 'Here are your nutrition options:', ar: 'دي خيارات التغذية:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['food', 'search food', 'find food', 'look up food'],
    keywordsAr: ['أكل', 'دور على أكل'],
    keywordsFranco: ['akl', 'dawer 3ala akl'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Search for any food:', ar: 'دور على أي أكل:' },
    priority: 6,
    domain: 'nutrition',
  },
  {
    keywords: ['water', 'drink water', 'log water', 'hydration', 'how much water'],
    keywordsAr: ['مية', 'اشرب مية', 'سجل مية', 'ترطيب'],
    keywordsFranco: ['mayya', 'eshrab mayya', 'seggel mayya'],
    stateId: 'NT_LOG_WATER',
    response: { en: 'Logging water intake...', ar: 'بسجل شرب المية...' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['meal plan', 'diet plan', 'eating plan', 'weekly plan', 'meal prep'],
    keywordsAr: ['خطة أكل', 'خطة دايت', 'بلان أكل'],
    keywordsFranco: ['5etat akl', 'diet plan', 'meal plan'],
    stateId: 'NT_PLAN_MENU',
    response: { en: "Let me help with your meal plan:", ar: 'هساعدك في خطة الأكل:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['what should i eat', 'hungry', 'meal suggestion', 'suggest meal', 'what to eat', 'suggest food', 'recommend food'],
    keywordsAr: ['آكل ايه', 'جعان', 'اقترح أكل', 'اقتراح وجبة'],
    keywordsFranco: ['akol eh', 'ga3an', 'e2tra7 akl', 'ana ga3an'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Let me suggest something for you:', ar: 'خليني اقترحلك حاجة:' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['high protein food', 'protein rich', 'protein foods', 'high protein meals', 'need protein', 'more protein'],
    keywordsAr: ['أكل بروتين عالي', 'أكل فيه بروتين', 'بروتين عالي', 'محتاج بروتين'],
    keywordsFranco: ['akl protein 3aly', 'me7tag protein'],
    stateId: 'NT_HIGH_PROTEIN',
    response: { en: 'Here are high-protein options:', ar: 'دي أكلات بروتين عالي:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['low calorie', 'diet food', 'low cal', 'light food', 'healthy food', 'low carb', 'keto'],
    keywordsAr: ['سعرات قليلة', 'أكل دايت', 'أكل خفيف', 'أكل صحي', 'كيتو'],
    keywordsFranco: ['akl diet', 'akl 5afif', 'akl se7y', 'keto', 'low carb'],
    stateId: 'NT_LOW_CAL',
    response: { en: 'Here are low-calorie options:', ar: 'دي أكلات سعرات قليلة:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['egyptian food', 'local food', 'egyptian meals', 'baladi', 'masri food'],
    keywordsAr: ['أكل مصري', 'أكل بلدي', 'وجبات مصرية', 'أكل مصري صحي'],
    keywordsFranco: ['akl masry', 'akl balady', 'masry'],
    stateId: 'NT_EGYPTIAN',
    response: { en: "Here's Egyptian food options:", ar: 'دي أكلات مصرية:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['foul', 'fava beans', 'koshari', 'koshary', 'ful', 'taameya', 'falafel'],
    keywordsAr: ['فول', 'كشري', 'طعمية', 'فلافل'],
    keywordsFranco: ['fool', 'koshary', 'ta3meya'],
    stateId: 'NT_EGYPTIAN',
    route: '/nutrition',
    response: { en: 'Egyptian staples! Let me find nutritional info:', ar: 'أكل مصري أصيل! هجبلك المعلومات الغذائية:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['pre workout meal', 'eat before workout', 'before gym', 'pre workout food'],
    keywordsAr: ['أكل قبل التمرين', 'قبل الجيم'],
    keywordsFranco: ['akl 2abl el tamreen', '2abl el gym'],
    stateId: 'NT_PRE_WORKOUT',
    response: { en: 'Pre-workout nutrition:', ar: 'أكل قبل التمرين:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['post workout meal', 'eat after workout', 'after gym', 'recovery meal', 'post workout food'],
    keywordsAr: ['أكل بعد التمرين', 'بعد الجيم'],
    keywordsFranco: ['akl ba3d el tamreen', 'ba3d el gym'],
    stateId: 'NT_POST_WORKOUT',
    response: { en: 'Post-workout nutrition:', ar: 'أكل بعد التمرين:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['calculate calories', 'how many calories', 'calorie calculator', 'tdee', 'bmr', 'calculate macros'],
    keywordsAr: ['حساب السعرات', 'كام سعر', 'حاسبة السعرات'],
    keywordsFranco: ['7esab el so3rat', 'kam so3r', 'calorie calculator'],
    stateId: 'NT_CALC',
    response: { en: "Let's calculate your calories:", ar: 'يلا نحسب سعراتك:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['quick meals', 'easy meal', '5 minute meal', 'fast meal', 'simple meal'],
    keywordsAr: ['أكل سريع', 'وجبة سريعة', 'أكل سهل'],
    keywordsFranco: ['akl sare3', 'wagba sare3a'],
    stateId: 'NT_QUICK_MEALS',
    response: { en: 'Quick meal ideas:', ar: 'أفكار وجبات سريعة:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['food alternatives', 'substitute', 'swap food', 'instead of', 'healthy alternative', 'healthier option'],
    keywordsAr: ['بدائل', 'بديل', 'بدل', 'بديل صحي'],
    keywordsFranco: ['badayel', 'badil', 'badil se7y'],
    stateId: 'NT_ALTERNATIVES',
    response: { en: 'Let me find healthier alternatives:', ar: 'خليني اجبلك بدائل صحية:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['breakfast', 'breakfast ideas', 'morning meal', 'what for breakfast'],
    keywordsAr: ['فطار', 'افطر ايه', 'فطور'],
    keywordsFranco: ['fetar', 'aftar eh', 'breakfast'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Breakfast ideas:', ar: 'أفكار فطار:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['snack', 'snacks', 'healthy snack', 'what snack'],
    keywordsAr: ['سناك', 'سناكس', 'وجبة خفيفة'],
    keywordsFranco: ['snack', 'snacks'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Healthy snack ideas:', ar: 'أفكار سناكات صحية:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['ramadan', 'suhoor', 'iftar', 'fasting', 'intermittent fasting'],
    keywordsAr: ['رمضان', 'سحور', 'فطار رمضان', 'صيام'],
    keywordsFranco: ['ramadan', 'su7oor', 'iftar', 'seyam'],
    stateId: 'NT_EGYPTIAN',
    response: { en: 'Ramadan nutrition guide:', ar: 'دليل تغذية رمضان:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['cheat meal', 'cheat day', 'treat meal', 'junk food', 'pizza', 'burger'],
    keywordsAr: ['شيت ميل', 'يوم فري', 'أكل حرام'],
    keywordsFranco: ['cheat meal', 'cheat day', 'yom free'],
    stateId: 'NT_ALTERNATIVES',
    response: { en: "Craving something? Let's find a healthier version:", ar: 'نفسك في حاجة؟ خليني ألاقيلك بديل صحي:' },
    priority: 7,
    domain: 'nutrition',
  },

  // ══════════════════════════════════════════════════════════
  // ── Health & Body ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['my weight', 'log weight', 'record weight', 'weigh in', 'how much i weigh', 'weight update', 'i weigh', 'current weight'],
    keywordsAr: ['وزني', 'سجل الوزن', 'كم وزني', 'وزني النهارده'],
    keywordsFranco: ['wazny', 'seggel el wazn', 'kam wazny', 'wazny el naharda'],
    stateId: 'PR_LOG_WEIGHT',
    response: { en: "Let's log your weight:", ar: 'يلا نسجل وزنك:' },
    priority: 9,
    domain: 'progress',
  },
  {
    keywords: ['health', 'body stats', 'health data', 'vitals', 'health dashboard'],
    keywordsAr: ['صحتي', 'بيانات الجسم', 'داشبورد الصحة'],
    keywordsFranco: ['se7ty', 'bayanat el gesm', 'health'],
    stateId: 'HL_MENU',
    response: { en: 'Here are your health options:', ar: 'دي خيارات الصحة:' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['sleep', 'how much sleep', 'sleep tracker', 'sleep quality', 'last night sleep', 'insomnia', 'sleep data', 'sleep hours'],
    keywordsAr: ['النوم', 'نمت كام ساعة', 'جودة النوم', 'أرق', 'ساعات النوم'],
    keywordsFranco: ['el nom', 'nemt kam sa3a', 'godet el nom', 'ara2'],
    stateId: 'HL_SLEEP',
    response: { en: 'Let me check your sleep data:', ar: 'هشوفلك بيانات النوم:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['heart rate', 'heart', 'resting heart rate', 'hrv', 'heart rate variability', 'pulse'],
    keywordsAr: ['نبض', 'معدل نبض القلب', 'القلب'],
    keywordsFranco: ['nabd', 'heart rate', 'el 2alb'],
    stateId: 'HL_HEART',
    response: { en: 'Heart rate data:', ar: 'بيانات نبض القلب:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['body fat', 'bmi', 'body composition', 'inbody', 'dexa', 'fat percentage'],
    keywordsAr: ['نسبة الدهون', 'انبودي', 'تكوين الجسم'],
    keywordsFranco: ['nesbet el do7oon', 'inbody', 'body fat'],
    stateId: 'HL_BODY',
    response: { en: 'Body composition analysis:', ar: 'تحليل تكوين الجسم:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['stress', 'stressed', 'stress level', 'anxiety', 'overwhelmed'],
    keywordsAr: ['ضغط', 'متوتر', 'قلق', 'مضغوط'],
    keywordsFranco: ['daght', 'metwatter', '2ala2', 'stressed'],
    stateId: 'HL_STRESS',
    response: { en: 'Let me check your stress levels:', ar: 'هشوفلك مستوى الضغط:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['breathing', 'breathe', 'breathing exercise', 'meditation', 'mindfulness', 'calm down', 'relax'],
    keywordsAr: ['تنفس', 'تمارين تنفس', 'تأمل', 'استرخاء'],
    keywordsFranco: ['tanaffos', 'ta2amol', 'relax'],
    stateId: 'HL_BREATHING',
    response: { en: "Let's do a breathing exercise:", ar: 'يلا نعمل تمرين تنفس:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['steps', 'step count', 'walking', 'how many steps', 'daily steps', 'log steps'],
    keywordsAr: ['خطوات', 'المشي', 'كام خطوة', 'سجل خطوات'],
    keywordsFranco: ['5atwat', 'mashy', 'kam 5atwa'],
    stateId: 'HL_LOG_STEPS',
    response: { en: 'Step tracking:', ar: 'تتبع الخطوات:' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['vo2 max', 'vo2', 'cardio fitness', 'aerobic fitness'],
    keywordsAr: ['الاستهلاك الأقصى', 'لياقة قلبية'],
    stateId: 'HL_VO2',
    response: { en: 'VO2 Max data:', ar: 'بيانات الاستهلاك الأقصى:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['blood work', 'blood test', 'labs', 'lab results', 'blood pressure'],
    keywordsAr: ['تحاليل', 'تحليل دم', 'ضغط الدم'],
    keywordsFranco: ['ta7alil', 'ta7lil dam', 'daght el dam'],
    stateId: 'HL_BLOOD',
    response: { en: 'Blood work & labs:', ar: 'التحاليل والمعامل:' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['measurements', 'body measurements', 'measure', 'waist', 'chest measurement'],
    keywordsAr: ['قياسات', 'قياسات الجسم'],
    keywordsFranco: ['2eyasat', '2eyasat el gesm'],
    stateId: 'HL_BODY_MEASUREMENTS',
    response: { en: 'Body measurements:', ar: 'قياسات الجسم:' },
    priority: 7,
    domain: 'health',
  },

  // ── Recovery ──────────────────────────────────────────────
  {
    keywords: ['recovery', 'how recovered', 'recovery score', 'recovery status', 'am i recovered', 'can i train'],
    keywordsAr: ['ريكفري', 'الاستشفاء', 'حالة الريكفري', 'اتعافيت', 'أقدر اتمرن'],
    keywordsFranco: ['recovery', 'el este2fa2', '7alet el recovery'],
    stateId: 'RC_MENU',
    response: { en: 'Let me check your recovery status:', ar: 'هشوفلك حالة الريكفري:' },
    priority: 7,
    domain: 'recovery',
  },
  {
    keywords: ['foam roll', 'foam roller', 'foam rolling', 'myofascial release'],
    keywordsAr: ['فوم رولر', 'فوم رول'],
    keywordsFranco: ['foam roller', 'foam roll'],
    stateId: 'RC_FOAM',
    response: { en: 'Foam rolling guide:', ar: 'دليل الفوم رولر:' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['ice bath', 'cold therapy', 'cold shower', 'heat therapy', 'sauna'],
    keywordsAr: ['حمام تلج', 'علاج بارد', 'دش بارد', 'ساونا'],
    keywordsFranco: ['ice bath', 'dosh bared', 'sauna'],
    stateId: 'RC_COLD_HEAT',
    response: { en: 'Cold & heat therapy options:', ar: 'خيارات العلاج بالبرودة والحرارة:' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['morning stretch', 'wake up stretch', 'morning routine'],
    keywordsAr: ['استرتش الصبح', 'تمارين الصبح'],
    keywordsFranco: ['stretch el sob7', 'tamarin el sob7'],
    stateId: 'RC_STRETCH_MORNING',
    response: { en: 'Morning stretch routine:', ar: 'روتين استرتش الصبح:' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['bedtime stretch', 'night stretch', 'sleep stretch', 'evening stretch'],
    keywordsAr: ['استرتش قبل النوم', 'تمارين قبل النوم'],
    keywordsFranco: ['stretch 2abl el nom'],
    stateId: 'RC_STRETCH_NIGHT',
    response: { en: 'Bedtime stretch routine:', ar: 'روتين استرتش قبل النوم:' },
    priority: 8,
    domain: 'recovery',
  },

  // ══════════════════════════════════════════════════════════
  // ── Progress ──────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['my progress', 'progress', 'how am i doing', 'stats', 'results', 'goals', 'show progress'],
    keywordsAr: ['تقدمي', 'التقدم', 'النتايج', 'الأهداف', 'إحصائيات'],
    keywordsFranco: ['ta2adomy', 'el natayeg', 'el ahdaf', 'stats'],
    stateId: 'PR_MENU',
    route: '/progress',
    response: { en: 'Let me show you your progress:', ar: 'هوريك تقدمك:' },
    priority: 7,
    domain: 'progress',
  },
  {
    keywords: ['weekly check', 'check in', 'weekly review', 'weekly update'],
    keywordsAr: ['تشيك إن', 'مراجعة أسبوعية'],
    keywordsFranco: ['check in', 'weekly check'],
    stateId: 'PR_CHECKIN',
    route: '/check-in',
    response: { en: 'Time for your weekly check-in!', ar: 'وقت التشيك إن الأسبوعي!' },
    priority: 8,
    domain: 'progress',
  },
  {
    keywords: ['weight loss', 'lose weight', 'fat loss', 'cut', 'cutting', 'slim down', 'burn fat'],
    keywordsAr: ['خسارة وزن', 'تنشيف', 'كت', 'نزل وزن', 'حرق دهون'],
    keywordsFranco: ['5asaret wazn', 'tanshif', 'cut', 'nazzel wazn', '7ar2 do7oon'],
    stateId: 'PR_MENU',
    response: { en: "Let's work on your weight loss goals:", ar: 'يلا نشتغل على هدف خسارة الوزن:' },
    priority: 7,
    domain: 'progress',
  },
  {
    keywords: ['gain weight', 'bulk', 'bulking', 'mass', 'gain muscle', 'build muscle', 'get bigger'],
    keywordsAr: ['زيادة وزن', 'بلك', 'تضخيم', 'بناء عضل'],
    keywordsFranco: ['ziyadet wazn', 'bulk', 'tad5im', 'bena2 3adal'],
    stateId: 'PR_MENU',
    response: { en: "Let's work on building muscle:", ar: 'يلا نشتغل على بناء العضل:' },
    priority: 7,
    domain: 'progress',
  },
  {
    keywords: ['achievements', 'badges', 'milestones', 'trophies'],
    keywordsAr: ['إنجازات', 'شارات'],
    keywordsFranco: ['engazat', 'achievements'],
    stateId: 'PR_ACHIEVEMENTS',
    response: { en: 'Your achievements:', ar: 'إنجازاتك:' },
    priority: 7,
    domain: 'progress',
  },

  // ══════════════════════════════════════════════════════════
  // ── Programs ──────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['programs', 'workout plan', 'training plan', 'routine', 'program', 'training program'],
    keywordsAr: ['البرامج', 'خطة تمارين', 'روتين', 'برنامج'],
    keywordsFranco: ['el barameg', '5etat tamarin', 'routine', 'barnameg'],
    stateId: 'PG_MENU',
    response: { en: 'Here are your program options:', ar: 'دي خيارات البرامج:' },
    priority: 7,
    domain: 'programs',
  },
  {
    keywords: ['my program', 'active program', 'current plan', 'what program', 'current program'],
    keywordsAr: ['برنامجي', 'البرنامج النشط', 'خطتي الحالية'],
    keywordsFranco: ['barnamgy', 'el barnameg el nashet'],
    stateId: 'PG_ACTIVE',
    response: { en: 'Checking your active program...', ar: 'بشوف برنامجك النشط...' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['beginner program', 'beginner workout', 'new to gym', 'just started', 'starting out'],
    keywordsAr: ['برنامج مبتدئين', 'لسه بادئ', 'جديد في الجيم'],
    keywordsFranco: ['barnameg mobtade2in', 'lessa bade2', 'gedid fe el gym'],
    stateId: 'PG_BY_LEVEL',
    response: { en: 'Great starting point! Here are beginner programs:', ar: 'بداية ممتازة! دي برامج المبتدئين:' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['advanced program', 'advanced workout', 'harder', 'challenge me', 'need challenge'],
    keywordsAr: ['برنامج متقدم', 'عايز تحدي', 'اصعب'],
    keywordsFranco: ['barnameg mota2adem', '3ayez ta7addy'],
    stateId: 'PG_BY_LEVEL',
    response: { en: 'Ready for a challenge! Advanced programs:', ar: 'جاهز للتحدي! برامج متقدمة:' },
    priority: 8,
    domain: 'programs',
  },

  // ══════════════════════════════════════════════════════════
  // ── Supplements ───────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['supplements', 'protein powder', 'creatine', 'vitamins', 'bcaa', 'whey', 'pre workout supplement', 'supplement store'],
    keywordsAr: ['مكملات', 'بروتين باودر', 'كرياتين', 'فيتامينات', 'مكملات غذائية'],
    keywordsFranco: ['mokamelat', 'protein powder', 'creatine', 'vitamins'],
    stateId: 'SP_MENU',
    response: { en: 'Here are supplement options:', ar: 'دي خيارات المكملات:' },
    priority: 7,
    domain: 'supplements',
  },
  {
    keywords: ['where to buy supplements', 'supplement shop', 'buy creatine', 'buy protein'],
    keywordsAr: ['اشتري مكملات', 'فين اشتري', 'محل مكملات'],
    keywordsFranco: ['eshtary mokamelat', 'fen eshtary'],
    stateId: 'SP_BUY',
    response: { en: 'Where to buy supplements:', ar: 'أماكن شراء المكملات:' },
    priority: 8,
    domain: 'supplements',
  },

  // ══════════════════════════════════════════════════════════
  // ── Devices ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['connect device', 'apple watch', 'garmin', 'fitbit', 'whoop', 'wearable', 'smartwatch', 'oura', 'oura ring'],
    keywordsAr: ['وصل جهاز', 'ساعة ذكية', 'أبل واتش', 'جارمين', 'فيتبت'],
    keywordsFranco: ['wassel gihaz', 'apple watch', 'garmin', 'fitbit', 'whoop'],
    stateId: 'DV_MENU',
    response: { en: 'Here are your device options:', ar: 'دي خيارات الأجهزة:' },
    priority: 7,
    domain: 'device',
  },
  {
    keywords: ['my devices', 'connected devices', 'manage devices'],
    keywordsAr: ['أجهزتي', 'الأجهزة الموصلة'],
    stateId: 'DV_MY_DEVICES',
    response: { en: 'Your connected devices:', ar: 'أجهزتك الموصلة:' },
    priority: 7,
    domain: 'device',
  },

  // ══════════════════════════════════════════════════════════
  // ── Navigation Shortcuts ──────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['go to dashboard', 'home page', 'main page', 'dashboard', 'go home'],
    keywordsAr: ['الصفحة الرئيسية', 'الداشبورد', 'الهوم'],
    keywordsFranco: ['el home', 'dashboard', 'el safha el ra2isya'],
    stateId: 'ROOT',
    route: '/dashboard',
    response: { en: 'Taking you to the dashboard...', ar: 'بوديك على الصفحة الرئيسية...' },
    priority: 6,
  },
  {
    keywords: ['go to exercises', 'open exercises'],
    keywordsAr: ['افتح التمارين'],
    stateId: 'WK_FIND',
    route: '/exercises',
    response: { en: 'Opening exercise library...', ar: 'بفتحلك مكتبة التمارين...' },
    priority: 7,
  },
  {
    keywords: ['go to nutrition', 'nutrition page', 'food tracker', 'meal tracker', 'open nutrition'],
    keywordsAr: ['صفحة التغذية', 'متابعة الأكل', 'افتح التغذية'],
    stateId: 'NT_MENU',
    route: '/nutrition',
    response: { en: 'Opening nutrition tracker...', ar: 'بفتحلك متابعة التغذية...' },
    priority: 6,
  },
  {
    keywords: ['go to profile', 'my account', 'account settings', 'view profile', 'open profile'],
    keywordsAr: ['بروفايلي', 'حسابي', 'اعدادات الحساب', 'افتح البروفايل'],
    stateId: 'ST_PROFILE',
    route: '/profile',
    response: { en: 'Opening your profile...', ar: 'بفتحلك البروفايل...' },
    priority: 6,
  },
  {
    keywords: ['go to chat', 'open chat', 'ai coach', 'talk to coach'],
    keywordsAr: ['افتح الشات', 'الكوتش', 'كلم الكوتش'],
    keywordsFranco: ['efta7 el chat', 'el coach', 'kalem el coach'],
    stateId: 'ROOT',
    route: '/chat',
    response: { en: "You're already here! What can I help with?", ar: 'إنت هنا أصلاً! تحب أساعدك في ايه؟' },
    priority: 4,
  },

  // ══════════════════════════════════════════════════════════
  // ── Egyptian Casual / Slang / Arabizi ─────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['what now', 'what should i do', 'what next', 'bored', "i'm bored", "what's next"],
    keywordsAr: ['اعمل ايه', 'ايه دلوقتي', 'زهقت', 'عايز اعمل حاجة'],
    keywordsFranco: ['a3mel eh', 'eh delwa2ty', 'zehi2t', '3ayez a3mel 7aga'],
    stateId: 'QA_MENU',
    response: { en: 'Here are some quick actions:', ar: 'دي حاجات سريعة ممكن تعملها:' },
    priority: 5,
  },
  {
    keywords: ['motivate me', 'motivation', 'inspire me', "i don't feel like it", 'no motivation'],
    keywordsAr: ['حفزني', 'مش حاسس', 'مش عايز'],
    keywordsFranco: ['7afezny', 'msh 7ases', 'mesh 3ayez'],
    stateId: 'QA_MENU',
    response: { en: "Every rep counts! Even a light session beats doing nothing. Let's find something easy to start with:", ar: 'كل تكرار بيفرق! حتى تمرين خفيف أحسن من مفيش. يلا نلاقي حاجة سهلة نبدأ بيها:' },
    priority: 6,
  },
  {
    keywords: ['busy', "i'm busy", 'no time', 'short on time', 'quick workout', '15 minutes', '20 minutes', 'short workout'],
    keywordsAr: ['مشغول', 'مفيش وقت', 'عايز حاجة سريعة', 'تمرين قصير'],
    keywordsFranco: ['mashghool', 'mafesh wa2t', '3ayez 7aga sare3a'],
    stateId: 'WK_SKIP_BUSY',
    response: { en: "Short on time? Let's find a quick workout:", ar: 'مفيش وقت؟ يلا نلاقي تمرين سريع:' },
    priority: 8,
    domain: 'workout',
  },

  // ── Common greetings & polite phrases ─────────────────────
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate it', 'great', 'awesome', 'perfect', 'nice', 'cool'],
    keywordsAr: ['شكرا', 'تسلم', 'يسلمو', 'تمام', 'حلو'],
    keywordsFranco: ['shokran', 'teslam', 'tamam', '7elw'],
    stateId: 'ROOT',
    response: { en: "You're welcome! Anything else I can help with?", ar: 'العفو! محتاج حاجة تانية؟' },
    priority: 2,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'sup', 'yo', 'morning', "what's up"],
    keywordsAr: ['اهلا', 'مرحبا', 'صباح الخير', 'مساء الخير', 'ازيك', 'يو'],
    keywordsFranco: ['ahlan', 'saba7 el 5eir', 'masa2 el 5eir', 'ezayak', 'yo', 'hey'],
    stateId: 'ROOT',
    response: { en: 'Hey! What would you like to do today?', ar: 'أهلاً! عايز تعمل ايه النهارده؟' },
    priority: 1,
  },
  {
    keywords: ['help', 'what can you do', 'options', 'menu', 'home', 'show menu', 'main menu'],
    keywordsAr: ['مساعدة', 'تقدر تعمل ايه', 'القائمة', 'الرئيسية'],
    keywordsFranco: ['mosa3da', 'te2dar te3mel eh', 'el 2a2ema'],
    stateId: 'ROOT',
    response: { en: "Here's what I can help you with:", ar: 'دي الحاجات اللي أقدر أساعدك فيها:' },
    priority: 1,
  },
  {
    keywords: ['back', 'go back', 'return', 'previous'],
    keywordsAr: ['رجوع', 'ارجع', 'السابق'],
    keywordsFranco: ['erga3', 'rogo3'],
    stateId: '__BACK__',
    response: { en: 'Going back...', ar: 'راجع...' },
    priority: 3,
  },

  // ── Catch-all conversational patterns ─────────────────────
  {
    keywords: ['how are you', "how's it going", 'how u doing'],
    keywordsAr: ['ازيك', 'عامل ايه', 'ايه الأخبار'],
    keywordsFranco: ['ezayak', '3amel eh', 'eh el a5bar'],
    stateId: 'ROOT',
    response: { en: "I'm great, thanks for asking! Ready to help you crush your goals. What would you like to do?", ar: 'تمام الحمد لله! جاهز أساعدك تحقق أهدافك. عايز تعمل ايه؟' },
    priority: 2,
  },
  {
    keywords: ['who are you', 'what are you', 'your name'],
    keywordsAr: ['مين انت', 'ايه انت', 'اسمك ايه'],
    keywordsFranco: ['min enta', 'esmak eh'],
    stateId: 'ROOT',
    response: { en: "I'm your Forma AI coach! I can help with workouts, nutrition, health tracking, and more. What do you need?", ar: 'أنا كوتش فورما الذكي! أقدر أساعدك في التمارين والتغذية والصحة وكتير. محتاج ايه؟' },
    priority: 3,
  },
];

// ─── Domain extraction from state ID ─────────────────────────
function getDomainFromState(stateId: string): string {
  const prefix = stateId.split('_')[0];
  const map: Record<string, string> = {
    WK: 'workout', NT: 'nutrition', HL: 'health', PR: 'progress',
    PG: 'programs', SP: 'supplements', DV: 'device', RC: 'recovery',
    ST: 'settings', QA: 'root',
  };
  return map[prefix] || 'root';
}

/**
 * Match user text to the best intent.
 * Context-aware: boosts matches relevant to the current domain.
 * Returns null if no confident match found.
 */
export function matchIntent(text: string, currentStateId: string): IntentMatch | null {
  let normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return null;

  // Apply typo corrections, then strip conversational noise
  normalized = fixTypos(normalized);
  const stripped = stripNoise(normalized); // "show me chest exercises" → "chest exercises"

  // Also create a stemmed version for fallback matching
  const stemmed = stemText(normalized);
  const stemmedStripped = stemText(stripped);

  // Extract numbers/units from text
  const extractedParams = extractNumbers(normalized);

  const currentDomain = getDomainFromState(currentStateId);
  let bestMatch: { rule: IntentRule; score: number } | null = null;

  for (const rule of INTENT_RULES) {
    let score = 0;

    // Check English keywords (against both original and stripped text)
    for (const kw of rule.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized.includes(kwLower) || stripped.includes(kwLower)) {
        const kwLen = kw.split(' ').length;
        score = Math.max(score, kwLen * 2 + (rule.priority || 0));
      }
      // Stemmed fallback: try stemmed versions of both
      else if (stemmed.includes(simpleStem(kwLower)) || stemmedStripped.includes(simpleStem(kwLower))) {
        const kwLen = kw.split(' ').length;
        score = Math.max(score, kwLen * 1.5 + (rule.priority || 0) * 0.8);
      }
    }

    // Check Arabic keywords (against both original and stripped)
    if (rule.keywordsAr) {
      for (const kw of rule.keywordsAr) {
        if (normalized.includes(kw) || stripped.includes(kw)) {
          const kwLen = kw.split(' ').length;
          score = Math.max(score, kwLen * 2 + (rule.priority || 0));
        }
      }
    }

    // Check Franco-Arab / Arabizi keywords (against both)
    if (rule.keywordsFranco) {
      for (const kw of rule.keywordsFranco) {
        const kwLower = kw.toLowerCase();
        if (normalized.includes(kwLower) || stripped.includes(kwLower)) {
          const kwLen = kw.split(' ').length;
          score = Math.max(score, kwLen * 2 + (rule.priority || 0));
        }
      }
    }

    // Word-level partial matching for short inputs
    if (score === 0) {
      const words = normalized.split(/\s+/);
      const allKeywords = [...rule.keywords, ...(rule.keywordsAr || []), ...(rule.keywordsFranco || [])];
      for (const kw of allKeywords) {
        const kwWords = kw.toLowerCase().split(/\s+/);
        const matchedWords = kwWords.filter(kw => words.some(w => w.includes(kw) || kw.includes(w)));
        if (matchedWords.length >= Math.ceil(kwWords.length * 0.6)) {
          score = Math.max(score, matchedWords.length + (rule.priority || 0) * 0.5);
        }
      }
    }

    // Context boost: same domain gets +3
    if (score > 0 && rule.domain && rule.domain === currentDomain) {
      score += 3;
    }

    // Param-aware boost: if user typed a number related to the rule's domain
    if (score > 0) {
      if (extractedParams.weight && (rule.stateId === 'PR_LOG_WEIGHT')) score += 4;
      if (extractedParams.water_ml && (rule.stateId === 'NT_LOG_WATER')) score += 4;
      if (extractedParams.steps && (rule.stateId === 'HL_LOG_STEPS')) score += 4;
      if (extractedParams.duration_min && rule.domain === 'workout') score += 2;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { rule, score };
    }
  }

  if (!bestMatch || bestMatch.score < 2) return null;

  const confidence = Math.min(bestMatch.score / 15, 1);

  // Build smart response with extracted params
  let response = bestMatch.rule.response;
  if (response && Object.keys(extractedParams).length > 0) {
    // Enhance response with extracted value
    if (extractedParams.weight && bestMatch.rule.stateId === 'PR_LOG_WEIGHT') {
      response = {
        en: `Got it! Logging your weight: ${extractedParams.weight} kg`,
        ar: `تمام! بسجل وزنك: ${extractedParams.weight} كيلو`,
      };
    }
    if (extractedParams.water_ml && bestMatch.rule.stateId === 'NT_LOG_WATER') {
      response = {
        en: `Logging ${extractedParams.water_ml} ml of water!`,
        ar: `بسجل ${extractedParams.water_ml} مل مية!`,
      };
    }
  }

  return {
    stateId: bestMatch.rule.stateId,
    confidence,
    action: bestMatch.rule.route ? { type: 'navigate', route: bestMatch.rule.route } : undefined,
    response,
    extractedParams: Object.keys(extractedParams).length > 0 ? extractedParams : undefined,
  };
}

/**
 * Get smart suggestions based on partial text input.
 * Returns up to `limit` quick-match labels the user might mean.
 */
export function getSuggestions(text: string, limit = 3): Array<{ label: string; labelAr: string; stateId: string }> {
  const normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return [];

  const matches: Array<{ label: string; labelAr: string; stateId: string; score: number }> = [];
  const seen = new Set<string>();

  for (const rule of INTENT_RULES) {
    let score = 0;
    const allKeywords = [...rule.keywords, ...(rule.keywordsAr || []), ...(rule.keywordsFranco || [])];

    for (const kw of allKeywords) {
      if (kw.toLowerCase().includes(normalized) || normalized.includes(kw.toLowerCase())) {
        score = Math.max(score, (rule.priority || 0) + 1);
      }
    }

    if (score > 0 && rule.response && !seen.has(rule.stateId)) {
      seen.add(rule.stateId);
      matches.push({
        label: rule.response.en.replace(/[.!:]$/, ''),
        labelAr: rule.response.ar.replace(/[.!:]$/, ''),
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
