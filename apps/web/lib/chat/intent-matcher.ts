/**
 * Smart Intent Matcher — Maps natural language to chat state transitions
 *
 * Works 100% locally, no API calls. Matches user text to the best
 * state/action in the guided chat state machine.
 *
 * Supports: English, Arabic (Egyptian dialect), Franco-Arab (Arabizi)
 *
 * v6 — 200+ intent rules, compound queries, synonym expansion, follow-ups,
 *       food name detection, fitness Q&A, contextual Egyptian patterns
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

// ─── Synonym Expansion ───────────────────────────────────────
// Maps casual/slang phrases to canonical keywords for better matching
const SYNONYMS: Record<string, string> = {
  'shed weight': 'lose weight', 'drop weight': 'lose weight', 'slim down': 'lose weight',
  'get lean': 'lose weight', 'shred': 'lose weight', 'trim down': 'lose weight',
  'gain mass': 'build muscle', 'get jacked': 'build muscle', 'get big': 'build muscle',
  'get swole': 'build muscle', 'put on muscle': 'build muscle', 'get ripped': 'build muscle',
  'get shredded': 'lose weight', 'get toned': 'lose weight',
  'guns': 'biceps', 'pythons': 'biceps', 'pipes': 'biceps',
  'lats': 'back', 'wing': 'back', 'wings': 'back',
  'pec': 'chest', 'pecs': 'chest', 'titties': 'chest',
  'rear delt': 'shoulders', 'front delt': 'shoulders', 'side delt': 'shoulders', 'lateral raise': 'shoulders',
  'wheels': 'legs', 'pins': 'legs',
  'tummy': 'abs', 'belly': 'abs', 'stomach': 'abs', 'midsection': 'abs',
  'nap': 'sleep', 'slept': 'sleep',
  'cals': 'calories', 'kcal': 'calories',
  'carb': 'carbs', 'carbohydrate': 'carbs',
  'fats': 'fat',
  'supp': 'supplement', 'supps': 'supplements',
  'preworkout': 'pre workout', 'pre-workout': 'pre workout',
  'postworkout': 'post workout', 'post-workout': 'post workout',
  'bench': 'bench press', 'flat bench': 'bench press', 'incline bench': 'chest',
  'pull up': 'pull ups', 'pullup': 'pull ups', 'chin up': 'pull ups', 'chinup': 'pull ups',
  'dip': 'dips', 'parallel bar': 'dips',
  'overhead press': 'ohp', 'military press': 'ohp',
  'dl': 'deadlift', 'rdl': 'deadlift',
  'bb': 'barbell', 'db': 'dumbbell',
  // Arabic slang → standard
  'بطني': 'بطن', 'كرشي': 'بطن', 'كرش': 'بطن',
  'دراعي': 'دراع', 'رجلي': 'رجل', 'كتفي': 'كتف',
  'ضهري': 'ضهر', 'صدري': 'صدر',
  // Franco slang
  'batny': 'batn', 'karshy': 'batn', 'dra3y': 'dra3',
};

function expandSynonyms(text: string): string {
  let result = text;
  for (const [alias, canonical] of Object.entries(SYNONYMS)) {
    if (result.includes(alias)) {
      result = result.replace(alias, canonical);
    }
  }
  return result;
}

// ─── Negation Detection ──────────────────────────────────────
// Detect negative intent: "I don't want to train" should NOT match "start workout"
const NEGATION_PATTERNS = [
  /\b(?:don'?t|do not|no|not|never|stop|cancel|skip|avoid)\b/,
  /\b(?:مش عايز|مش محتاج|مش هـ|لأ|الغي|مش|ماعايزش)\b/,
  /\b(?:mesh 3ayez|msh me7tag|la2|mesh|cancel)\b/,
];

function hasNegation(text: string): boolean {
  return NEGATION_PATTERNS.some(p => p.test(text));
}

// Map negation + topic → correct state (instead of positive match)
const NEGATION_OVERRIDES: Array<{ pattern: RegExp; stateId: string; response: { en: string; ar: string } }> = [
  { pattern: /(?:don'?t|not|no|skip|مش عايز|مش هـ|mesh 3ayez)\s*(?:want to |wanna )?\s*(?:train|workout|exercise|اتمرن|at2amen|tamreen)/i,
    stateId: 'WK_SKIP_REASON', response: { en: "No worries! What's the reason?", ar: 'مفيش مشكلة! ايه السبب؟' } },
  { pattern: /(?:don'?t|not|no|مش عايز|mesh 3ayez)\s*(?:want to |wanna )?\s*(?:eat|food|meal|آكل|akol)/i,
    stateId: 'NT_SUGGEST', response: { en: "Not hungry? Here are some light options:", ar: 'مش جعان؟ دي أكلات خفيفة:' } },
  { pattern: /(?:stop|cancel|remove|delete|الغي|امسح|emsah)\s*(?:my )?\s*(?:subscription|plan|اشتراك|eshterak)/i,
    stateId: 'ST_SUBSCRIPTION', response: { en: 'Opening subscription settings...', ar: 'بفتحلك إعدادات الاشتراك...' } },
  { pattern: /(?:stop|cancel|الغي|وقف)\s*(?:my )?\s*(?:program|plan|برنامج|barnameg)/i,
    stateId: 'PG_ACTIVE', response: { en: 'Let me show your active program options:', ar: 'هوريك خيارات برنامجك النشط:' } },
];

// ─── Common Exercise Names (for direct exercise search) ──────
const EXERCISE_NAMES: string[] = [
  'bench press', 'squat', 'deadlift', 'overhead press', 'barbell row', 'pull up',
  'lat pulldown', 'cable fly', 'dumbbell curl', 'hammer curl', 'tricep pushdown',
  'skull crusher', 'leg press', 'leg extension', 'leg curl', 'calf raise',
  'lateral raise', 'face pull', 'cable row', 't-bar row', 'pendlay row',
  'romanian deadlift', 'hip thrust', 'lunges', 'lunge', 'step up',
  'dips', 'push up', 'pushup', 'plank', 'crunch', 'sit up',
  'cable crossover', 'pec deck', 'incline press', 'decline press',
  'preacher curl', 'concentration curl', 'cable curl', 'tricep extension',
  'front squat', 'goblet squat', 'bulgarian split squat', 'hack squat',
  'good morning', 'rack pull', 'farmers walk', 'shrug', 'upright row',
  'arnold press', 'military press', 'clean and jerk', 'snatch', 'power clean',
  'box jump', 'burpee', 'mountain climber', 'battle rope', 'kettlebell swing',
];

function detectExerciseQuery(text: string): string | null {
  const lower = text.toLowerCase();
  for (const ex of EXERCISE_NAMES) {
    if (lower === ex || lower.includes(ex)) {
      return ex;
    }
  }
  return null;
}

// ─── Common Food Names (for direct food search detection) ────
const FOOD_NAMES: string[] = [
  // Egyptian staples
  'rice', 'chicken', 'eggs', 'egg', 'bread', 'beans', 'lentils', 'pasta', 'oats', 'milk',
  'yogurt', 'cheese', 'tuna', 'salmon', 'beef', 'meat', 'fish', 'shrimp', 'turkey',
  'potato', 'potatoes', 'sweet potato', 'banana', 'apple', 'orange', 'dates', 'avocado',
  'peanut butter', 'almonds', 'nuts', 'honey', 'olive oil',
  // Egyptian dishes
  'foul', 'ful', 'koshari', 'koshary', 'taameya', 'falafel', 'molokhia', 'bamia',
  'mahshi', 'shawarma', 'kebab', 'kofta', 'feteer', 'hawawshi', 'besarah', 'fattah',
  'roz bel laban', 'om ali', 'konafa', 'basbousa', 'fiteer',
  // Supplements
  'whey', 'casein', 'bcaa', 'glutamine', 'multivitamin', 'omega 3', 'fish oil',
  'zinc', 'vitamin d', 'vitamin c', 'magnesium', 'collagen',
  // Arabic food names
  'فول', 'كشري', 'طعمية', 'ملوخية', 'بامية', 'محشي', 'شاورما', 'كباب', 'كفتة',
  'فتة', 'أرز', 'فراخ', 'بيض', 'عيش', 'جبنة', 'زبادي', 'تونة', 'لحمة', 'سمك',
  'بطاطس', 'موز', 'تفاح', 'برتقال', 'بلح', 'عسل', 'شوفان', 'لبن', 'مكرونة',
];

function detectFoodQuery(text: string): string | null {
  const lower = text.toLowerCase();
  // Direct food name match (2+ chars, not a common verb/action)
  for (const food of FOOD_NAMES) {
    if (lower === food || lower.startsWith(food + ' ') || lower.endsWith(' ' + food) || lower.includes(' ' + food + ' ')) {
      return food;
    }
  }
  // "how many calories in X" pattern — extract X
  const calorieIn = lower.match(/(?:calories? in|سعرات? في|كام سعر(?:ة)? في)\s+(.+)/);
  if (calorieIn) return calorieIn[1].trim();
  return null;
}

// ─── Compound Query Splitter ──────────────────────────────────
// "chest and triceps" → ["chest", "triceps"]
// "back and biceps workout" → ["back", "biceps"]
function splitCompound(text: string): string[] | null {
  const conjunctions = /\s+(?:and|&|و|w|,)\s+/;
  if (!conjunctions.test(text)) return null;
  const parts = text.split(conjunctions).map(s => s.trim()).filter(Boolean);
  return parts.length >= 2 ? parts : null;
}

// ─── Follow-up Suggestions ───────────────────────────────────
// Returns contextual follow-up actions based on what user just did
export function getFollowUpSuggestions(lastStateId: string, isAr: boolean): Array<{ label: string; stateId: string }> {
  const suggestions: Array<{ label: string; stateId: string }> = [];
  const prefix = lastStateId.split('_')[0];

  if (prefix === 'NT' || lastStateId.includes('MEAL') || lastStateId.includes('FOOD')) {
    suggestions.push({ label: isAr ? 'شوف ملخص اليوم' : 'View daily summary', stateId: 'NT_TODAY' });
    suggestions.push({ label: isAr ? 'سجل مية' : 'Log water', stateId: 'NT_LOG_WATER' });
    suggestions.push({ label: isAr ? 'سجل وجبة تانية' : 'Log another meal', stateId: 'NT_LOG_MEAL' });
  } else if (prefix === 'WK' || lastStateId.includes('WORKOUT')) {
    suggestions.push({ label: isAr ? 'سجل تمرين' : 'Log workout', stateId: 'WK_LOG' });
    suggestions.push({ label: isAr ? 'استرتش' : 'Stretch', stateId: 'WK_POST' });
    suggestions.push({ label: isAr ? 'أكل بعد التمرين' : 'Post-workout meal', stateId: 'NT_POST_WORKOUT' });
  } else if (prefix === 'PR' || lastStateId.includes('WEIGHT')) {
    suggestions.push({ label: isAr ? 'شوف تقدمي' : 'View progress', stateId: 'PR_MENU' });
    suggestions.push({ label: isAr ? 'سجل وجبة' : 'Log meal', stateId: 'NT_LOG_MEAL' });
  } else if (prefix === 'HL') {
    suggestions.push({ label: isAr ? 'ريكفري' : 'Recovery status', stateId: 'RC_MENU' });
    suggestions.push({ label: isAr ? 'سجل وجبة' : 'Log meal', stateId: 'NT_LOG_MEAL' });
  }

  return suggestions.slice(0, 3);
}

// ─── Intent Rules ────────────────────────────────────────────
// 200+ rules organized by domain. Most specific → least specific.

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

  // ── Context-Specific Deep Queries ──────────────────────────
  {
    keywords: ['how many calories in', 'calories in', 'nutrition info', 'nutrition facts', 'how many calories'],
    keywordsAr: ['كام سعرة في', 'سعرات', 'معلومات غذائية'],
    keywordsFranco: ['kam so3ra fe', 'calories fe'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Let me look that up for you:', ar: 'هشوفلك المعلومات الغذائية:' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['i ate', 'just ate', 'i had', 'i just had', 'ate for', 'eaten'],
    keywordsAr: ['أنا أكلت', 'اكلت', 'أكلت'],
    keywordsFranco: ['ana akalt', 'akalt'],
    stateId: 'NT_LOG_MEAL',
    route: '/nutrition',
    response: { en: "Let's log what you ate!", ar: 'يلا نسجل اللي أكلته!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['not hungry', "don't feel like eating", 'no appetite', 'lost appetite'],
    keywordsAr: ['مش جعان', 'مفيش شهية', 'فقدت شهيتي'],
    keywordsFranco: ['msh ga3an', 'mafesh shahya'],
    stateId: 'NT_SUGGEST',
    response: { en: "That's okay. Here are some light options to keep your energy up:", ar: 'مفيش مشكلة. دي أكلات خفيفة تحافظ على طاقتك:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['rest', 'take a rest', 'need rest', 'feeling sore'],
    keywordsAr: ['ارتاح', 'عايز ارتاح', 'جسمي موجعني'],
    keywordsFranco: ['arta7', '3ayez arta7', 'gesmy mewga3ny'],
    stateId: 'WK_SKIP_REST',
    response: { en: 'Rest is crucial for gains! Logging rest day...', ar: 'الراحة مهمة للنتايج! بسجل يوم راحة...' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['what did i do yesterday', 'yesterday workout', 'last workout', 'what did i eat yesterday'],
    keywordsAr: ['عملت ايه إمبارح', 'تمرين إمبارح', 'أكلت ايه إمبارح'],
    keywordsFranco: ['3amalt eh embareh', 'tamreen embareh', 'akalt eh embareh'],
    stateId: 'WK_HISTORY',
    response: { en: "Let me check yesterday's activity:", ar: 'هشوفلك نشاط إمبارح:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['body weight', 'bodyweight exercises', 'calisthenics', 'street workout'],
    keywordsAr: ['كاليستنكس', 'تمارين وزن الجسم'],
    keywordsFranco: ['calisthenics', 'street workout'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=BODYWEIGHT',
    response: { en: 'Calisthenics & bodyweight exercises:', ar: 'تمارين الكاليستنكس ووزن الجسم:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['swimming', 'swim workout', 'pool exercises'],
    keywordsAr: ['سباحة', 'تمارين سباحة'],
    keywordsFranco: ['seba7a'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Swimming exercises:', ar: 'تمارين السباحة:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['yoga', 'yoga routine', 'yoga poses', 'flexibility'],
    keywordsAr: ['يوجا', 'مرونة'],
    keywordsFranco: ['yoga'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Yoga & flexibility:', ar: 'يوجا ومرونة:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['boxing', 'mma', 'martial arts', 'kickboxing', 'muay thai'],
    keywordsAr: ['ملاكمة', 'فنون قتالية', 'كيك بوكسنج'],
    keywordsFranco: ['boxing', 'mma', 'kick boxing'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Combat & martial arts training:', ar: 'تمارين القتال والفنون القتالية:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['cardio', 'running', 'hiit', 'run', 'jogging', 'treadmill'],
    keywordsAr: ['كارديو', 'جري', 'مشاية'],
    keywordsFranco: ['cardio', 'gary', 'mashaya'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Cardio options:', ar: 'خيارات الكارديو:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['powerlifting', 'power lifting', 'strength training', 'get stronger', 'stronger'],
    keywordsAr: ['باور ليفتنج', 'تدريب قوة'],
    keywordsFranco: ['powerlifting', 'strength'],
    stateId: 'WK_FIND_TYPE',
    response: { en: 'Powerlifting & strength training:', ar: 'باور ليفتنج وتدريب القوة:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['how much protein', 'protein intake', 'daily protein', 'how much should i eat'],
    keywordsAr: ['كام بروتين', 'كمية البروتين', 'البروتين اليومي'],
    keywordsFranco: ['kam protein', 'kemyet el protein'],
    stateId: 'NT_CALC',
    response: { en: "Let's calculate your protein needs:", ar: 'يلا نحسب احتياجك من البروتين:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['budget', 'cheap food', 'affordable meals', 'eating cheap', 'on a budget'],
    keywordsAr: ['ميزانية', 'أكل رخيص', 'أكل بميزانية'],
    keywordsFranco: ['budget', 'akl re5is'],
    stateId: 'NT_PLAN_BUDGET',
    response: { en: 'Budget-friendly meal options:', ar: 'أكل صحي بميزانية معقولة:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['today summary', 'daily summary', 'day summary', 'what did i do today', 'today stats'],
    keywordsAr: ['ملخص اليوم', 'عملت ايه النهارده', 'إحصائيات اليوم'],
    keywordsFranco: ['mol5as el yom', '3amalt eh el naharda'],
    stateId: 'NT_TODAY',
    route: '/nutrition',
    response: { en: "Here's your daily summary:", ar: 'ده ملخص يومك:' },
    priority: 8,
    domain: 'nutrition',
  },

  // ══════════════════════════════════════════════════════════
  // ── Fitness Q&A (Common Questions) ─────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['is creatine safe', 'creatine side effects', 'should i take creatine'],
    keywordsAr: ['الكرياتين آمن', 'اعراض الكرياتين', 'اخد كرياتين'],
    keywordsFranco: ['creatine safe', 'a5od creatine'],
    stateId: 'SP_MENU',
    response: { en: 'Creatine is one of the most researched supplements — very safe. 5g/day is the standard dose. Let me show you more:', ar: 'الكرياتين من أكتر المكملات اللي اتعمل عليها أبحاث — آمن جداً. 5 جرام يومياً هي الجرعة المعتادة. خليني أوريك أكتر:' },
    priority: 9,
    domain: 'supplements',
  },
  {
    keywords: ['how often should i train', 'how many days', 'how many times a week', 'training frequency', 'workout frequency'],
    keywordsAr: ['اتمرن كام يوم', 'كام مرة في الاسبوع', 'عدد ايام التمرين'],
    keywordsFranco: ['at2amen kam yom', 'kam mara fel esbo3'],
    stateId: 'PG_MENU',
    response: { en: '3-5 days/week is ideal for most people. Beginners: 3 days, Intermediate: 4, Advanced: 5-6. Rest is part of training!', ar: '3-5 أيام في الأسبوع مثالي. مبتدئين: 3 أيام، متوسط: 4، متقدم: 5-6. الراحة جزء من التمرين!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['how much water should i drink', 'water intake', 'daily water', 'hydration needs'],
    keywordsAr: ['اشرب كام لتر', 'كمية المية', 'المية اليومية'],
    keywordsFranco: ['eshrab kam litr', 'kemyet el mayya'],
    stateId: 'NT_LOG_WATER',
    response: { en: 'Aim for 2.5-3.5 liters daily. More if you train hard or in hot weather. Track your intake:', ar: 'حاول 2.5-3.5 لتر يومياً. أكتر لو بتتمرن جامد أو الجو حر. سجل شربك:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['am i overtraining', 'overtraining', 'too much exercise', 'training too much'],
    keywordsAr: ['بتمرن كتير', 'أوفر ترينينج', 'تمرين زيادة'],
    keywordsFranco: ['overtraining', 'bat2amen keter'],
    stateId: 'RC_MENU',
    response: { en: 'Signs of overtraining: constant fatigue, strength loss, poor sleep, mood changes. Let me check your recovery:', ar: 'علامات الأوفر ترينينج: تعب مستمر، فقدان قوة، نوم وحش، تغيير مزاج. خليني أشوف الريكفري:' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['best time to workout', 'when to train', 'morning or evening workout', 'what time to exercise'],
    keywordsAr: ['احسن وقت للتمرين', 'اتمرن امتى', 'الصبح ولا بليل'],
    keywordsFranco: ['a7san wa2t lel tamreen', 'at2amen emta'],
    stateId: 'WK_MENU',
    response: { en: 'The best time to train is whenever you can be consistent! But strength peaks in late afternoon (4-6 PM). Pick what fits your schedule:', ar: 'أحسن وقت للتمرين هو الوقت اللي تقدر تلتزم بيه! بس القوة بتبقى في أعلاها بعد الظهر (4-6 مساءً). اختار اللي يناسب جدولك:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['how long to see results', 'when will i see results', 'how fast results', 'how long until'],
    keywordsAr: ['هشوف نتيجة امتى', 'النتايج هتبان امتى', 'كام شهر'],
    keywordsFranco: ['hashoof nateega emta', 'kam shahr'],
    stateId: 'PR_MENU',
    response: { en: 'Strength gains: 2-4 weeks. Visible muscle: 8-12 weeks. Significant transformation: 3-6 months. Consistency is king!', ar: 'زيادة القوة: 2-4 أسابيع. عضل ظاهر: 8-12 أسبوع. تحول كبير: 3-6 شهور. الالتزام هو المفتاح!' },
    priority: 7,
    domain: 'progress',
  },
  {
    keywords: ['what should i eat before bed', 'bedtime snack', 'eat before sleep', 'night snack'],
    keywordsAr: ['آكل ايه قبل النوم', 'سناك قبل النوم', 'أكل بليل'],
    keywordsFranco: ['akol eh 2abl el nom', 'snack 2abl el nom'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Before bed: casein protein, Greek yogurt, cottage cheese, or a small handful of nuts. Slow-digesting protein helps recovery!', ar: 'قبل النوم: كازين بروتين، زبادي يوناني، جبنة قريش، أو مكسرات قليلة. البروتين البطيء بيساعد في الريكفري!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['muscle not growing', 'plateau', 'stuck', 'no progress', 'not gaining', 'hit a wall'],
    keywordsAr: ['العضل مش بيكبر', 'واقف في مكاني', 'مفيش تقدم'],
    keywordsFranco: ['el 3adal msh byekbar', 'wa2ef fe makany', 'mafesh ta2adom'],
    stateId: 'PR_MENU',
    response: { en: "Plateaus are normal! Try: 1) Increase volume/intensity 2) Eat more protein 3) Sleep 7-9h 4) Deload then push harder. Let's analyze:", ar: 'الوقفات طبيعية! جرب: 1) زود الحجم/الشدة 2) كل بروتين أكتر 3) نام 7-9 ساعات 4) ديلود وبعدها اضغط أكتر. يلا نحلل:' },
    priority: 8,
    domain: 'progress',
  },
  {
    keywords: ['am i eating enough', 'eating too little', 'not eating enough', 'undereating'],
    keywordsAr: ['باكل كفاية', 'مش باكل كفاية', 'باكل قليل'],
    keywordsFranco: ['bakol kefaya', 'msh bakol kefaya'],
    stateId: 'NT_CALC',
    response: { en: "Let's check! I'll calculate your daily needs based on your profile:", ar: 'يلا نشوف! هحسبلك احتياجك اليومي بناءً على بروفايلك:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['can i eat junk food', 'cheat meal ok', 'is pizza ok', 'can i have sweets'],
    keywordsAr: ['اقدر آكل جانك', 'شيت ميل ماشي', 'حلويات ماشي'],
    keywordsFranco: ['a2dar akol junk', 'cheat meal mashy'],
    stateId: 'NT_ALTERNATIVES',
    response: { en: "80/20 rule! If 80% of your diet is clean, 20% flexible is fine. Balance is key. Want healthier alternatives?", ar: 'قاعدة 80/20! لو 80% من أكلك نظيف، 20% مرنة ماشي. التوازن هو المفتاح. عايز بدائل صحية؟' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['how to lose belly fat', 'reduce belly', 'flat stomach', 'lose tummy', 'spot reduce'],
    keywordsAr: ['ازاي اخس من بطني', 'انزل الكرش', 'بطن مسطح', 'اخس بطن'],
    keywordsFranco: ['ezay a5as men batny', 'anzal el karsh'],
    stateId: 'PR_MENU',
    response: { en: "You can't spot-reduce fat — it comes off everywhere through caloric deficit + strength training. Focus on: diet, compounds lifts, and cardio:", ar: 'مفيش حاجة اسمها تخسيس من مكان معين — الدهون بتنزل من كل الجسم بالعجز الحراري + تمارين المقاومة. ركز على: الأكل، تمارين مركبة، وكارديو:' },
    priority: 8,
    domain: 'progress',
  },
  {
    keywords: ['sore muscles', 'doms', 'muscle soreness', 'muscles ache', 'body ache'],
    keywordsAr: ['عضلاتي بتوجعني', 'تكسير', 'جسمي بيوجعني', 'وجع عضلات'],
    keywordsFranco: ['3adalaty betwga3ny', 'takseer', 'gesmy beyewga3ny'],
    stateId: 'RC_MENU',
    response: { en: 'Muscle soreness (DOMS) is normal 24-72h after training. It means your muscles are adapting! Recovery options:', ar: 'وجع العضلات (DOMS) طبيعي 24-72 ساعة بعد التمرين. ده معناه عضلاتك بتتأقلم! خيارات الريكفري:' },
    priority: 8,
    domain: 'recovery',
  },

  // ══════════════════════════════════════════════════════════
  // ── Smart Status Queries ───────────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['am i on track', 'on track', 'how am i doing today', "today's status", 'daily check'],
    keywordsAr: ['أنا ماشي صح', 'النهارده ايه', 'حالتي النهارده'],
    keywordsFranco: ['ana mashy sa7', 'el naharda eh'],
    stateId: 'NT_TODAY',
    route: '/nutrition',
    response: { en: "Let me check your daily progress:", ar: 'هشوفلك تقدمك النهارده:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['what did i eat today', 'meals today', 'food today', 'how much did i eat', "what's left to eat"],
    keywordsAr: ['أكلت ايه النهارده', 'وجباتي النهارده', 'فاضلي كام'],
    keywordsFranco: ['akalt eh el naharda', 'wagbaty el naharda', 'fadly kam'],
    stateId: 'NT_TODAY',
    route: '/nutrition',
    response: { en: "Here's what you've eaten today:", ar: 'ده اللي أكلته النهارده:' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['how much protein left', 'remaining protein', 'protein left', 'macros left', 'remaining calories'],
    keywordsAr: ['فاضلي كام بروتين', 'باقي البروتين', 'فاضلي كام سعر'],
    keywordsFranco: ['fadly kam protein', 'ba2y el protein'],
    stateId: 'NT_TODAY',
    route: '/nutrition',
    response: { en: "Let me check what's remaining in your daily targets:", ar: 'هشوفلك الباقي من أهدافك اليومية:' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['this week', 'weekly progress', 'week summary', 'this week summary'],
    keywordsAr: ['الأسبوع ده', 'تقدم الأسبوع', 'ملخص الأسبوع'],
    keywordsFranco: ['el esbo3 da', 'ta2adom el esbo3'],
    stateId: 'PR_MENU',
    route: '/progress',
    response: { en: "Here's your weekly summary:", ar: 'ده ملخص أسبوعك:' },
    priority: 8,
    domain: 'progress',
  },

  // ══════════════════════════════════════════════════════════
  // ── More Egyptian Casual Patterns ──────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['want abs', 'get abs', 'see abs', 'six pack abs', 'get a six pack', 'visible abs'],
    keywordsAr: ['عايز سكس باك', 'عايز بطن', 'ابان بطني'],
    keywordsFranco: ['3ayez six pack', '3ayez batn', 'aban batny'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=ABS',
    response: { en: 'Abs are made in the kitchen (diet) and revealed in the gym! Here are core exercises + nutrition tips:', ar: 'البطن بتتعمل في المطبخ (الدايت) وبتبان في الجيم! دي تمارين بطن + نصايح تغذية:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['too skinny', 'underweight', 'hard gainer', 'cant gain weight', "can't gain weight", 'skinny'],
    keywordsAr: ['نحيف', 'وزني قليل', 'مش قادر ازيد', 'هارد جينر'],
    keywordsFranco: ['na7if', 'wazny 2alil', 'msh 2ader azid', 'hard gainer'],
    stateId: 'NT_CALC',
    response: { en: "For gaining: eat in caloric surplus (300-500 above TDEE), high protein, strength training 3-4x/week. Let's calculate your needs:", ar: 'علشان تزيد: كل فوق احتياجك (300-500 فوق TDEE)، بروتين عالي، تمارين مقاومة 3-4 مرات في الأسبوع. يلا نحسب احتياجك:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['too fat', 'overweight', 'obese', 'need to lose', 'i hate my body', 'so fat'],
    keywordsAr: ['تخين', 'وزني زيادة', 'سمين', 'لازم اخس', 'مش طايق جسمي'],
    keywordsFranco: ['te5in', 'wazny zeyada', 'samin', 'lazem a5as'],
    stateId: 'NT_CALC',
    response: { en: "No shame — we all start somewhere. Caloric deficit + protein + consistency = results. Let's build your plan:", ar: 'مفيش حرج — كلنا بنبدأ من مكان. عجز حراري + بروتين + التزام = نتايج. يلا نعمل خطتك:' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['protein shake', 'protein smoothie', 'shake recipe', 'smoothie recipe'],
    keywordsAr: ['بروتين شيك', 'شيك بروتين', 'وصفة شيك'],
    keywordsFranco: ['protein shake', 'shake recipe'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Quick shake: 1 scoop whey + 1 banana + 250ml milk + oats. ~400 cal, 35g protein. More recipes:', ar: 'شيك سريع: سكوب واي + موزة + 250مل لبن + شوفان. ~400 سعر، 35 جرام بروتين. وصفات تانية:' },
    priority: 8,
    domain: 'nutrition',
  },

  // ══════════════════════════════════════════════════════════
  // ── Contextual Workout Queries ─────────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['how many sets', 'sets and reps', 'how many reps', 'rep range', 'set range'],
    keywordsAr: ['كام سيت', 'كام تكرار', 'عدد السيتات', 'عدد التكرارات'],
    keywordsFranco: ['kam set', 'kam tekrar'],
    stateId: 'WK_MENU',
    response: { en: 'General guide: Strength 3-5 reps x 4-5 sets. Hypertrophy 8-12 reps x 3-4 sets. Endurance 15-20 reps x 2-3 sets.', ar: 'دليل عام: قوة 3-5 تكرارات × 4-5 سيتات. تضخيم 8-12 تكرار × 3-4 سيتات. تحمل 15-20 تكرار × 2-3 سيتات.' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['how long should i rest', 'rest between sets', 'rest time', 'rest period'],
    keywordsAr: ['اريح كام', 'وقت الراحة بين السيتات', 'فترة الراحة'],
    keywordsFranco: ['are7 kam', 'wa2t el ra7a'],
    stateId: 'WK_MENU',
    response: { en: 'Rest between sets: Strength 2-5 min. Hypertrophy 60-90 sec. Endurance 30-60 sec. Compounds need more rest than isolation.', ar: 'الراحة بين السيتات: قوة 2-5 دقايق. تضخيم 60-90 ثانية. تحمل 30-60 ثانية. التمارين المركبة محتاجة راحة أكتر.' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['train same muscle twice', 'hit muscle twice', 'frequency per muscle', 'how often per muscle'],
    keywordsAr: ['امرن نفس العضلة مرتين', 'العضلة في الاسبوع'],
    keywordsFranco: ['amaren nafs el 3adala marteen'],
    stateId: 'PG_MENU',
    response: { en: 'Research shows 2x/week per muscle group is optimal for growth. PPL or Upper/Lower splits allow this naturally.', ar: 'الأبحاث بتقول مرتين في الأسبوع لكل عضلة أحسن للنمو. PPL أو Upper/Lower بيوفروا ده بشكل طبيعي.' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['do i need a belt', 'lifting belt', 'when to use belt', 'weight belt'],
    keywordsAr: ['محتاج حزام', 'حزام الأوزان', 'البلت'],
    keywordsFranco: ['me7tag 7ezam', 'el belt'],
    stateId: 'WK_MENU',
    response: { en: 'Belts help at 80%+ of your max on squats, deadlifts, overhead press. Not needed for everything. Learn to brace naturally first!', ar: 'الحزام بيساعد عند 80%+ من أقصى وزنك في السكوات والديدلفت والأوفرهيد. مش لازم لكل حاجة. اتعلم البريسينج الطبيعي الأول!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['should i do cardio', 'cardio kills gains', 'cardio and muscle', 'too much cardio'],
    keywordsAr: ['اعمل كارديو', 'الكارديو بيأثر على العضل', 'كارديو كتير'],
    keywordsFranco: ['a3mel cardio', 'cardio keter'],
    stateId: 'WK_FIND_TYPE',
    response: { en: "Cardio doesn't kill gains if managed right. 2-3 sessions of 20-30 min LISS or 1-2 HIIT sessions. Keep it moderate!", ar: 'الكارديو مش بيقتل العضل لو اتعمل صح. 2-3 جلسات 20-30 دقيقة LISS أو 1-2 HIIT. خليه معتدل!' },
    priority: 7,
    domain: 'workout',
  },

  // ── Notification / Reminder Patterns ────────────────────────
  {
    keywords: ['remind me', 'set reminder', 'reminder', 'notify me', 'alarm', 'alert me'],
    keywordsAr: ['فكرني', 'تنبيه', 'منبه', 'ريمايندر'],
    keywordsFranco: ['fakkarny', 'tanbeeh', 'reminder'],
    stateId: 'ST_MENU',
    response: { en: 'Reminders coming soon! For now, check your phone reminders app.', ar: 'التذكيرات جاية قريب! حالياً استخدم تطبيق المنبهات في تليفونك.' },
    priority: 6,
    domain: 'settings',
  },

  // ── Comparison / Versus Patterns ───────────────────────────
  {
    keywords: ['whey vs casein', 'whey or casein', 'which protein', 'best protein powder'],
    keywordsAr: ['واي ولا كازين', 'احسن بروتين باودر'],
    keywordsFranco: ['whey wala casein', 'a7san protein powder'],
    stateId: 'SP_MENU',
    response: { en: 'Whey: fast absorbing (post-workout). Casein: slow release (before bed). Both great — depends on timing!', ar: 'واي: سريع الامتصاص (بعد التمرين). كازين: بطيء (قبل النوم). الاتنين ممتازين — حسب التوقيت!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['full body vs split', 'full body or split', 'which is better', 'best workout split'],
    keywordsAr: ['فل بودي ولا سبليت', 'ايه احسن سبليت'],
    keywordsFranco: ['full body wala split', 'eh a7san split'],
    stateId: 'PG_MENU',
    response: { en: 'Beginners: Full Body 3x/week. Intermediate: Upper/Lower or PPL. Advanced: PPL 6 days. All work — consistency matters most!', ar: 'مبتدئين: فل بودي 3 مرات. متوسط: Upper/Lower أو PPL. متقدم: PPL 6 أيام. كلهم شغالين — الالتزام هو الأهم!' },
    priority: 7,
    domain: 'programs',
  },

  // ── Egyptian Context (Gym Culture) ─────────────────────────
  {
    keywords: ['gym near me', 'find gym', 'best gym', 'gym recommendation'],
    keywordsAr: ['جيم قريب', 'اقرب جيم', 'احسن جيم'],
    keywordsFranco: ['gym 2orayeb', 'a2rab gym', 'a7san gym'],
    stateId: 'ROOT',
    response: { en: "I can't search for gyms yet, but I can help you train anywhere! Try home workouts:", ar: 'مش بقدر ادور على جيمات لسه، بس أقدر أساعدك تتمرن في أي مكان! جرب تمارين البيت:' },
    priority: 5,
  },
  {
    keywords: ['personal trainer', 'find trainer', 'need coach', 'pt', 'hire trainer'],
    keywordsAr: ['مدرب خاص', 'عايز مدرب', 'بي تي'],
    keywordsFranco: ['modareb 5as', '3ayez modareb', 'pt'],
    stateId: 'ROOT',
    route: '/trainers',
    response: { en: "Check out our trainers page!", ar: 'شوف صفحة المدربين!' },
    priority: 7,
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
    keywords: ['go back', 'return', 'previous', 'go back please', 'never mind', 'nevermind'],
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

  // Pipeline: typos → synonyms → noise strip → stem
  normalized = fixTypos(normalized);
  normalized = expandSynonyms(normalized);
  const stripped = stripNoise(normalized); // "show me chest exercises" → "chest exercises"

  // Also create a stemmed version for fallback matching
  const stemmed = stemText(normalized);
  const stemmedStripped = stemText(stripped);

  // Extract numbers/units from text
  const extractedParams = extractNumbers(normalized);

  // ── Negation check: "I don't want to train" → skip, not start workout
  if (hasNegation(normalized)) {
    for (const override of NEGATION_OVERRIDES) {
      if (override.pattern.test(normalized)) {
        return {
          stateId: override.stateId,
          confidence: 0.85,
          response: override.response,
        };
      }
    }
  }

  // ── Direct exercise name → route to exercise search
  const exerciseQuery = detectExerciseQuery(stripped);
  if (exerciseQuery) {
    return {
      stateId: 'WK_FIND',
      confidence: 0.75,
      action: { type: 'navigate', route: `/exercises?search=${encodeURIComponent(exerciseQuery)}` },
      response: { en: `Searching for "${exerciseQuery}":`, ar: `بدور على "${exerciseQuery}":` },
    };
  }

  // ── Direct food name → route to food search
  const foodQuery = detectFoodQuery(stripped);
  if (foodQuery && !extractedParams.weight && !extractedParams.water_ml) {
    return {
      stateId: 'NT_SEARCH',
      confidence: 0.7,
      action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(foodQuery)}` },
      response: { en: `Looking up "${foodQuery}" for you:`, ar: `بدور على "${foodQuery}":` },
    };
  }

  const currentDomain = getDomainFromState(currentStateId);
  const result: { bestMatch: { rule: IntentRule; score: number } | null } = { bestMatch: null };

  // Score a text against all rules
  function scoreRules(inputText: string, inputStripped: string, inputStemmed: string, inputStemmedStripped: string) {
    for (const rule of INTENT_RULES) {
      let score = 0;

      // Check English keywords (against both original and stripped text)
      for (const kw of rule.keywords) {
        const kwLower = kw.toLowerCase();
        if (inputText.includes(kwLower) || inputStripped.includes(kwLower)) {
          const kwLen = kw.split(' ').length;
          score = Math.max(score, kwLen * 2 + (rule.priority || 0));
        }
        // Stemmed fallback: try stemmed versions of both
        else if (inputStemmed.includes(simpleStem(kwLower)) || inputStemmedStripped.includes(simpleStem(kwLower))) {
          const kwLen = kw.split(' ').length;
          score = Math.max(score, kwLen * 1.5 + (rule.priority || 0) * 0.8);
        }
      }

      // Check Arabic keywords (against both original and stripped)
      if (rule.keywordsAr) {
        for (const kw of rule.keywordsAr) {
          if (inputText.includes(kw) || inputStripped.includes(kw)) {
            const kwLen = kw.split(' ').length;
            score = Math.max(score, kwLen * 2 + (rule.priority || 0));
          }
        }
      }

      // Check Franco-Arab / Arabizi keywords (against both)
      if (rule.keywordsFranco) {
        for (const kw of rule.keywordsFranco) {
          const kwLower = kw.toLowerCase();
          if (inputText.includes(kwLower) || inputStripped.includes(kwLower)) {
            const kwLen = kw.split(' ').length;
            score = Math.max(score, kwLen * 2 + (rule.priority || 0));
          }
        }
      }

      // Word-level partial matching for short inputs
      if (score === 0) {
        const words = inputText.split(/\s+/);
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

      if (score > 0 && (!result.bestMatch || score > result.bestMatch.score)) {
        result.bestMatch = { rule, score };
      }
    }
  }

  // First pass: match against full text
  scoreRules(normalized, stripped, stemmed, stemmedStripped);

  // Compound query: if "chest and triceps", try matching first part
  if (!result.bestMatch || result.bestMatch.score < 5) {
    const parts = splitCompound(stripped);
    if (parts) {
      for (const part of parts) {
        const partStemmed = stemText(part);
        scoreRules(part, part, partStemmed, partStemmed);
      }
    }
  }

  if (!result.bestMatch || result.bestMatch.score < 2) return null;

  const bestMatch = result.bestMatch;
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
  let normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return [];

  normalized = fixTypos(normalized);
  const stripped = stripNoise(normalized);
  const stemmed = stemText(normalized);

  const matches: Array<{ label: string; labelAr: string; stateId: string; score: number }> = [];
  const seen = new Set<string>();

  for (const rule of INTENT_RULES) {
    let score = 0;
    const allKeywords = [...rule.keywords, ...(rule.keywordsAr || []), ...(rule.keywordsFranco || [])];

    for (const kw of allKeywords) {
      const kwLower = kw.toLowerCase();
      // Direct match
      if (kwLower.includes(normalized) || normalized.includes(kwLower) ||
          kwLower.includes(stripped) || stripped.includes(kwLower)) {
        score = Math.max(score, (rule.priority || 0) + 1);
      }
      // Stemmed match
      else if (simpleStem(kwLower).includes(stemmed) || stemmed.includes(simpleStem(kwLower))) {
        score = Math.max(score, (rule.priority || 0) * 0.8 + 0.5);
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
