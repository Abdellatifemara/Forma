/**
 * Smart Intent Matcher — Maps natural language to chat state transitions
 *
 * Works 100% locally, no API calls. Matches user text to the best
 * state/action in the guided chat state machine.
 *
 * Supports: English, Arabic (Egyptian dialect), Franco-Arab (Arabizi)
 *
 * v11 — 280+ intent rules, compound queries, synonym expansion, follow-ups,
 *        food name detection, fitness Q&A, contextual Egyptian patterns,
 *        portion-aware food parsing, cooking method queries, exercise alternatives,
 *        deep nutrition/exercise/food coverage
 */

export interface IntentMatch {
  stateId: string;
  confidence: number; // 0-1
  action?: { type: 'navigate'; route: string };
  response?: { en: string; ar: string };
  // Extracted parameters from the text (e.g., weight value, water amount)
  extractedParams?: Record<string, string>;
  // Optional follow-up tip (shown as a subtle hint after the response)
  tip?: { en: string; ar: string };
}

// ─── Conversation Topic Tracker ──────────────────────────────
// Tracks last 3 matched domains for multi-turn context awareness
const recentDomains: string[] = [];
// Tracks last 3 matched intents for pronoun resolution & follow-ups
const recentIntents: Array<{ stateId: string; domain: string; keywords: string[] }> = [];

export function trackDomain(domain: string) {
  recentDomains.unshift(domain);
  if (recentDomains.length > 3) recentDomains.pop();
}

export function trackIntent(stateId: string, domain: string, keywords: string[]) {
  recentIntents.unshift({ stateId, domain, keywords });
  if (recentIntents.length > 3) recentIntents.pop();
}

export function getRecentDomains(): string[] {
  return [...recentDomains];
}

export function getRecentIntents() {
  return [...recentIntents];
}

export function isRepeatingDomain(domain: string): boolean {
  return recentDomains.length >= 2 && recentDomains[0] === domain && recentDomains[1] === domain;
}

// ─── Pronoun / Follow-Up Resolution ──────────────────────────
// "what about for back?" → recognize "what about" as a follow-up pattern
// "show me more" → repeat last search with different params
// "how much is it" → refers to last food/exercise mentioned
const FOLLOW_UP_PATTERNS: Array<{ pattern: RegExp; type: 'swap_topic' | 'more_info' | 'refer_last' }> = [
  // "what about X", "how about X", "and for X"
  { pattern: /^(?:what about|how about|and for|and|ok (?:what about|and)|ايه بقى|وايه|طيب و|tayeb w)\s+(.+)/i, type: 'swap_topic' },
  // "show me more", "more options", "anything else", "more", "تاني"
  { pattern: /^(?:show me more|more options|anything else|more|تاني|كمان|غيرهم|others|other options)$/i, type: 'more_info' },
  // "how much is it", "calories in it", "is it healthy"
  { pattern: /(?:how much|calories|protein|carbs|سعرات|بروتين)\s+(?:is it|in it|in that|فيه|فيها)/i, type: 'refer_last' },
];

function resolveFollowUp(text: string, currentStateId: string): IntentMatch | null {
  if (recentIntents.length === 0) return null;
  const last = recentIntents[0];

  for (const fp of FOLLOW_UP_PATTERNS) {
    const match = text.match(fp.pattern);

    if (fp.type === 'swap_topic' && match) {
      // User wants same action but different topic: "what about back?"
      // Try matching the extracted topic with the previous intent's domain context
      const newTopic = match[1]?.trim();
      if (!newTopic) continue;

      // Check if newTopic is a muscle group
      const muscleGroups: Record<string, string> = {
        'chest': 'CHEST', 'back': 'BACK', 'legs': 'QUADRICEPS', 'shoulders': 'SHOULDERS',
        'arms': 'BICEPS', 'biceps': 'BICEPS', 'triceps': 'TRICEPS', 'abs': 'ABS',
        'glutes': 'GLUTES', 'hamstrings': 'HAMSTRINGS', 'calves': 'CALVES', 'traps': 'TRAPS',
        'forearms': 'FOREARMS',
        'صدر': 'CHEST', 'ضهر': 'BACK', 'رجل': 'QUADRICEPS', 'كتف': 'SHOULDERS',
        'دراع': 'BICEPS', 'بطن': 'ABS',
      };
      const muscle = muscleGroups[newTopic.toLowerCase()];
      if (muscle && last.domain === 'workout') {
        return {
          stateId: 'WK_FIND_MUSCLE',
          confidence: 0.8,
          action: { type: 'navigate', route: `/exercises?muscle=${muscle}` },
          response: { en: `Switching to ${newTopic} exercises:`, ar: `بحولك على تمارين ${newTopic}:` },
        };
      }

      // Check if newTopic is a food
      const isFood = FOOD_NAMES.includes(newTopic.toLowerCase());
      if (isFood && last.domain === 'nutrition') {
        return {
          stateId: 'NT_SEARCH',
          confidence: 0.8,
          action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(newTopic)}` },
          response: { en: `Looking up ${newTopic}:`, ar: `بدور على ${newTopic}:` },
        };
      }
    }

    if (fp.type === 'more_info' && fp.pattern.test(text)) {
      // User wants more of the same — return last intent
      return {
        stateId: last.stateId,
        confidence: 0.7,
        response: { en: 'Here are more options:', ar: 'دي خيارات تانية:' },
      };
    }

    if (fp.type === 'refer_last' && fp.pattern.test(text)) {
      // User referring to last thing mentioned
      if (last.domain === 'nutrition') {
        const lastFood = last.keywords[0] || 'that food';
        return {
          stateId: 'NT_SEARCH',
          confidence: 0.75,
          action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(lastFood)}` },
          response: { en: `Let me get the nutritional details:`, ar: `هجبلك التفاصيل الغذائية:` },
        };
      }
    }
  }
  return null;
}

// ─── Domain-Aware No-Match Hints ────────────────────────────
// When no match is found, suggest based on current domain
export function getNoMatchHint(currentStateId: string, isAr: boolean): string {
  const domain = getDomainFromState(currentStateId);
  const hints: Record<string, { en: string; ar: string }> = {
    workout: { en: 'Try asking about a specific muscle (chest, back, legs), exercise, or workout type.', ar: 'جرب تسأل عن عضلة معينة (صدر، ضهر، رجل)، تمرين، أو نوع تمرين.' },
    nutrition: { en: 'Try asking about a food name, calories, meal suggestions, or your daily intake.', ar: 'جرب تسأل عن اسم أكل، سعرات، اقتراحات وجبات، أو أكلك اليومي.' },
    health: { en: 'Try asking about sleep, heart rate, body composition, or stress levels.', ar: 'جرب تسأل عن النوم، نبض القلب، تكوين الجسم، أو الضغط.' },
    supplements: { en: 'Try asking about creatine, protein powder, vitamins, or where to buy.', ar: 'جرب تسأل عن كرياتين، بروتين باودر، فيتامينات، أو فين تشتري.' },
    progress: { en: 'Try asking about your weight, weekly check-in, or goals.', ar: 'جرب تسأل عن وزنك، التشيك إن الأسبوعي، أو أهدافك.' },
    recovery: { en: 'Try asking about stretching, foam rolling, ice baths, or how recovered you are.', ar: 'جرب تسأل عن الاسترتش، فوم رولر، حمام تلج، أو حالة الريكفري.' },
  };
  const hint = hints[domain];
  if (hint) return isAr ? hint.ar : hint.en;
  return isAr ? 'جرب تسأل عن تمارين، أكل، صحة، أو تقدم.' : 'Try asking about workouts, nutrition, health, or progress.';
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
  // Exercise variants
  'exersice': 'exercise', 'exercize': 'exercise', 'excercise': 'exercise', 'excersize': 'exercise',
  'exersize': 'exercise', 'excersise': 'exercise', 'exercis': 'exercise',
  'workou': 'workout', 'workotu': 'workout', 'wrokout': 'workout', 'wokrout': 'workout',
  'worout': 'workout', 'wroklout': 'workout',
  // Nutrition
  'nutrtion': 'nutrition', 'nutriton': 'nutrition', 'nutitrion': 'nutrition',
  'protien': 'protein', 'protine': 'protein', 'protin': 'protein', 'proteing': 'protein',
  'calroies': 'calories', 'caloreis': 'calories', 'caloris': 'calories', 'calries': 'calories',
  'calores': 'calories', 'caloriees': 'calories',
  // Exercises
  'squatt': 'squat', 'sqaut': 'squat', 'sqauts': 'squats',
  'deadlfit': 'deadlift', 'deadlif': 'deadlift', 'deadlit': 'deadlift',
  'benchpress': 'bench press', 'benshpress': 'bench press',
  'pullup': 'pull ups', 'pushup': 'push up',
  // General
  'scheudle': 'schedule', 'schedual': 'schedule', 'shedule': 'schedule',
  'suplement': 'supplement', 'supplment': 'supplement', 'suppliment': 'supplement',
  'creatien': 'creatine', 'creatin': 'creatine', 'creatinee': 'creatine',
  'streching': 'stretching', 'strech': 'stretch', 'streatch': 'stretch',
  'progrss': 'progress', 'progres': 'progress', 'progess': 'progress',
  'recvery': 'recovery', 'recovry': 'recovery', 'recovey': 'recovery',
  'shoudler': 'shoulder', 'sholder': 'shoulder', 'shouder': 'shoulder',
  'bicep': 'biceps', 'tricep': 'triceps',
  'weigth': 'weight', 'wieght': 'weight', 'wight': 'weight', 'weght': 'weight',
  'histry': 'history', 'histroy': 'history', 'histori': 'history',
  'teh': 'the', 'taht': 'that', 'adn': 'and', 'hte': 'the',
  // Body parts
  'stomache': 'stomach', 'abdominals': 'abs', 'abdominal': 'abs',
  'sholders': 'shoulders', 'shouldrs': 'shoulders',
  'hamstirng': 'hamstring', 'harmstring': 'hamstring',
  // Food typos
  'chiken': 'chicken', 'chickin': 'chicken', 'chciken': 'chicken',
  'brocoli': 'broccoli', 'brocolli': 'broccoli', 'broccolli': 'broccoli',
  'avacado': 'avocado', 'avocato': 'avocado', 'avacato': 'avocado',
  'bananana': 'banana', 'bannana': 'banana',
  'yougurt': 'yogurt', 'yoghurt': 'yogurt', 'yougrt': 'yogurt',
  'samon': 'salmon', 'salamon': 'salmon',
  'omlet': 'omelette', 'omlette': 'omelette', 'omelet': 'omelette',
  'snadwich': 'sandwich', 'sandwhich': 'sandwich', 'sanwich': 'sandwich',
  'smoothe': 'smoothie', 'smootie': 'smoothie',
  'qunioa': 'quinoa', 'qinoa': 'quinoa',
  'koshri': 'koshari', 'kushary': 'koshari', 'kushri': 'koshari',
  'molukhia': 'molokhia', 'molokhya': 'molokhia',
  'hummous': 'hummus', 'homos': 'hummus', 'homus': 'hummus',
  // Exercise typos
  'burpees': 'burpee', 'birpee': 'burpee',
  'plnk': 'plank', 'plnak': 'plank',
  'luneg': 'lunge', 'longue': 'lunge',
  'cruntch': 'crunch', 'curnch': 'crunch',
  'shuolder': 'shoulder', 'bicpes': 'biceps', 'tirpceps': 'triceps',
  'latreal': 'lateral', 'laterla': 'lateral',
  // App-related
  'subcription': 'subscription', 'subsciption': 'subscription',
  'prefernces': 'preferences', 'preferances': 'preferences',
  'dashbaord': 'dashboard', 'dahsboard': 'dashboard',
  'pasword': 'password', 'passowrd': 'password', 'passwrod': 'password',
  // v21: More food typos
  'oatmeel': 'oatmeal', 'oatmel': 'oatmeal', 'otmeal': 'oatmeal',
  'beff': 'beef', 'beaf': 'beef', 'beeb': 'beef',
  'chees': 'cheese', 'chese': 'cheese', 'cheeze': 'cheese',
  'riice': 'rice', 'rize': 'rice',
  'potatoe': 'potato', 'potatos': 'potatoes', 'potateo': 'potato',
  'chocolat': 'chocolate', 'choclate': 'chocolate', 'choocolate': 'chocolate',
  'peanutbutter': 'peanut butter', 'penut butter': 'peanut butter',
  'lentil': 'lentils', 'lentles': 'lentils',
  'almonts': 'almonds', 'amlonds': 'almonds',
  'tunna': 'tuna', 'tinna': 'tuna',
  'watermellon': 'watermelon', 'watrmelon': 'watermelon',
  'straberry': 'strawberry', 'strawbery': 'strawberry',
  'pinapple': 'pineapple', 'pineaple': 'pineapple',
  'spinich': 'spinach', 'spinnach': 'spinach',
  'letuce': 'lettuce', 'lettuse': 'lettuce',
  'mushrom': 'mushroom', 'mashroom': 'mushroom',
  'cucmber': 'cucumber', 'cucumer': 'cucumber',
  'garlick': 'garlic', 'garlik': 'garlic',
  // v21: More exercise typos
  'benchpres': 'bench press', 'bechpress': 'bench press',
  'ohp': 'overhead press', 'overhed press': 'overhead press',
  'curlz': 'curl', 'kurls': 'curls',
  'latpulldown': 'lat pulldown', 'latpuldown': 'lat pulldown',
  'legpress': 'leg press', 'legpres': 'leg press',
  'legcurl': 'leg curl', 'legextension': 'leg extension',
  'calfrase': 'calf raise', 'calfraise': 'calf raise',
  'facepull': 'face pull', 'facepulls': 'face pulls',
  'hipthrust': 'hip thrust', 'hipthrusts': 'hip thrusts',
  'romenian': 'romanian', 'romainian': 'romanian',
  'dumbel': 'dumbbell', 'dumbell': 'dumbbell', 'dumbble': 'dumbbell',
  'barbel': 'barbell', 'barbal': 'barbell',
  'ketlebell': 'kettlebell', 'kettlbell': 'kettlebell', 'kettelbell': 'kettlebell',
  // v21: More general typos
  'muscel': 'muscle', 'muscels': 'muscles', 'musle': 'muscle',
  'stomack': 'stomach', 'stomuch': 'stomach',
  'breakfest': 'breakfast', 'brekfast': 'breakfast', 'brekfest': 'breakfast',
  'dineer': 'dinner', 'diner': 'dinner', 'dinne': 'dinner',
  'lonch': 'lunch', 'launh': 'lunch',
  'injery': 'injury', 'injuri': 'injury', 'injry': 'injury',
  'flexability': 'flexibility', 'flexibilty': 'flexibility',
  'endurnce': 'endurance', 'endurence': 'endurance',
  'hypertrofy': 'hypertrophy', 'hypertrophie': 'hypertrophy',
  'metabilism': 'metabolism', 'metbolism': 'metabolism',
  // v27: More food typos
  'yogart': 'yogurt', 'youghart': 'yogurt', 'yghurt': 'yogurt',
  'coffe': 'coffee', 'cofee': 'coffee', 'cofffe': 'coffee',
  'choclat': 'chocolate', 'choklate': 'chocolate',
  'pumkin': 'pumpkin', 'punkin': 'pumpkin',
  'cinamon': 'cinnamon', 'cinnammon': 'cinnamon', 'cinemon': 'cinnamon',
  'coliflower': 'cauliflower', 'cauliflauer': 'cauliflower',
  'avokado': 'avocado', 'avogado': 'avocado',
  'grapfruit': 'grapefruit', 'grapefrut': 'grapefruit',
  'rawberry': 'strawberry', 'strawbry': 'strawberry',
  'tilaipa': 'tilapia', 'talipia': 'tilapia',
  'sardeen': 'sardine', 'sardins': 'sardines',
  'hummos': 'hummus', 'hammous': 'hummus',
  'felafel': 'falafel', 'falafal': 'falafel',
  // v27: More exercise typos
  'sholderpres': 'shoulder press', 'shoulderpress': 'shoulder press',
  'tricepextension': 'tricep extension', 'tricepext': 'tricep extension',
  'bicepcurl': 'bicep curl', 'bicecurl': 'bicep curl',
  'cableraise': 'cable raise', 'cablerow': 'cable row',
  'romaniandl': 'romanian deadlift', 'rdl': 'romanian deadlift',
  'inclinepres': 'incline press', 'inclinepress': 'incline press',
  'declinepres': 'decline press', 'declinepress': 'decline press',
  'chestfly': 'chest fly', 'chestflies': 'chest flyes',
  'preachercurl': 'preacher curl', 'preachrcurl': 'preacher curl',
  // v27: More general typos
  'streangth': 'strength', 'strengh': 'strength', 'stregth': 'strength',
  'resistence': 'resistance', 'resistanse': 'resistance',
  'fatigue': 'fatigue', 'fatigu': 'fatigue',
  'diarhea': 'diarrhea', 'diarrhoea': 'diarrhea',
  'absorbtion': 'absorption', 'absorbsion': 'absorption',
  'deficency': 'deficiency', 'deficiensy': 'deficiency',
  'hormon': 'hormone', 'hormones': 'hormones',
  'testosteron': 'testosterone', 'testosteroen': 'testosterone',
  'cardoi': 'cardio', 'cradio': 'cardio', 'cadrio': 'cardio',
  'motivaton': 'motivation', 'motiviation': 'motivation',
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
  // Filler words/starters
  'yo', 'bro', 'dude', 'man', 'listen', 'btw', 'by the way', 'basically',
  'actually', 'so', 'well', 'ok so', 'alright', 'hey',
  // Arabic noise
  'عايز', 'عاوز', 'محتاج', 'ممكن', 'خليني', 'وريني', 'هاتلي',
  'يعني', 'طيب', 'خلاص', 'بص',
  // Franco
  '3ayez', '3awez', 'me7tag', 'momken', '5aliny', 'wareny', 'hatly',
  'ya3ny', 'tayeb', '5alas', 'bos',
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

// ─── Arabic Number Words ─────────────────────────────────────
// Converts Arabic number words to digits: "خمسة وتمانين" → 85
const AR_NUMBERS: Record<string, number> = {
  'واحد': 1, 'اتنين': 2, 'تلاتة': 3, 'اربعة': 4, 'خمسة': 5,
  'ستة': 6, 'سبعة': 7, 'تمنية': 8, 'تمانية': 8, 'تسعة': 9, 'عشرة': 10,
  'عشر': 10, 'عشرين': 20, 'تلاتين': 30, 'اربعين': 40, 'خمسين': 50,
  'ستين': 60, 'سبعين': 70, 'تمانين': 80, 'تسعين': 90, 'مية': 100, 'ميتين': 200,
  // Franco-Arab number words
  'wa7ed': 1, 'etnin': 2, 'talata': 3, 'arba3a': 4, '5amsa': 5,
  'setta': 6, 'sab3a': 7, 'tamanya': 8, 'tes3a': 9, '3ashara': 10,
  '3eshrin': 20, 'talateen': 30, 'arba3in': 40, '5amseen': 50,
  'settin': 60, 'sab3in': 70, 'tamanin': 80, 'tes3in': 90, 'meyya': 100,
};

function parseArabicNumber(text: string): number | null {
  // Try compound: "خمسة وتمانين" → 5 + 80 = 85
  let total = 0;
  let found = false;
  const words = text.split(/[\s,و]+/);
  for (const w of words) {
    const trimmed = w.trim();
    if (AR_NUMBERS[trimmed] !== undefined) {
      total += AR_NUMBERS[trimmed];
      found = true;
    }
  }
  return found ? total : null;
}

// ─── Number Extraction ──────────────────────────────────────
// Extracts numbers + units from text (e.g., "85 kg", "500 ml", "3 sets")
function extractNumbers(text: string): Record<string, string> {
  const params: Record<string, string> = {};

  // Weight: "85 kg", "85kg", "I weigh 85", "وزني 85"
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|كيلو)/i) ||
    text.match(/(?:weigh|weight|وزني|وزن)\s*(?:is\s*)?(\d+(?:\.\d+)?)/i);
  if (weightMatch) params.weight = weightMatch[1];

  // Arabic word numbers for weight: "وزني خمسة وتمانين كيلو"
  if (!params.weight) {
    const arWeightMatch = text.match(/(?:وزني|وزن|weigh|weight)\s+(.+?)(?:\s*(?:kg|kilo|كيلو)|\s*$)/i);
    if (arWeightMatch) {
      const num = parseArabicNumber(arWeightMatch[1]);
      if (num && num >= 30 && num <= 300) params.weight = String(num);
    }
  }

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
  // Food synonyms
  'oatmeal': 'oats', 'porridge': 'oats',
  'greek yogurt': 'yogurt', 'plain yogurt': 'yogurt',
  'sweet potatoes': 'sweet potato', 'yams': 'sweet potato',
  'protein powder': 'whey', 'whey protein': 'whey',
  'mass gainer': 'whey', 'weight gainer': 'whey',
  'breast': 'chicken breast', 'chicken breast': 'chicken',
  'mince': 'ground beef', 'minced beef': 'ground beef', 'minced meat': 'ground beef',
  'tuna can': 'tuna', 'canned tuna': 'tuna',
  'skim milk': 'milk', 'whole milk': 'milk', 'low fat milk': 'milk',
  'brown bread': 'whole wheat bread', 'white bread': 'bread',
  'chips': 'fries', 'french fries': 'fries',
  'soda': 'soft drink', 'pop': 'soft drink', 'cola': 'soft drink',
  // Exercise synonyms
  'chin ups': 'pull ups', 'wide grip pulldown': 'lat pulldown',
  'seated row': 'cable row', 'low row': 'cable row',
  'rope pushdown': 'tricep pushdown', 'v bar pushdown': 'tricep pushdown',
  'leg raise': 'hanging leg raise', 'knee raise': 'hanging leg raise',
  'hyper extension': 'back extension', 'back raise': 'back extension',
  'glute ham raise': 'nordic curl', 'ghr': 'nordic curl',
  // Quantity shortcuts
  'half kilo': '500g', 'quarter kilo': '250g', 'double portion': '2 servings',
  'half plate': '0.5 plate', 'نص كيلو': '500 جرام', 'ربع كيلو': '250 جرام',
  // Egyptian gym slang
  'بلانك': 'plank', 'بوش اب': 'push up', 'بول اب': 'pull up',
  'كيرل': 'curl', 'بريس': 'press', 'رو': 'row', 'فلاي': 'fly',
  'فليكس': 'flex', 'ريبس': 'reps', 'سيتات': 'sets',
  'جين': 'gym', 'الجين': 'gym', 'الجيم': 'gym',
  // Egyptian food slang
  'سندوتش': 'sandwich', 'سندويتش': 'sandwich',
  'عصير': 'juice', 'ميلك شيك': 'milkshake',
  'فريك': 'freekeh', 'بليلة': 'milk with grains',
  'ترمس': 'lupini beans', 'سوبيا': 'coconut drink',
  // Franco slang
  'batny': 'batn', 'karshy': 'batn', 'dra3y': 'dra3',
  // v21: More fitness synonyms
  'gym session': 'workout', 'training session': 'workout', 'workout session': 'workout',
  'lifting session': 'workout', 'weight training': 'workout', 'resistance training': 'workout',
  'cardio session': 'cardio', 'aerobic': 'cardio', 'aerobics': 'cardio',
  'body composition': 'body fat', 'lean mass': 'muscle mass', 'fat mass': 'body fat',
  'weight loss': 'lose weight', 'fat loss': 'lose weight', 'slimming': 'lose weight',
  'weight gain': 'build muscle', 'mass building': 'build muscle',
  'glute': 'glutes', 'booty': 'glutes', 'butt': 'glutes', 'behind': 'glutes',
  'quads': 'quadriceps', 'quad': 'quadriceps', 'thigh': 'quadriceps', 'thighs': 'quadriceps',
  'hammy': 'hamstrings', 'hammies': 'hamstrings',
  'delts': 'shoulders', 'deltoids': 'shoulders',
  'trap': 'traps', 'trapezius': 'traps',
  'core': 'abs', 'six pack': 'abs', 'sixpack': 'abs',
  'forearm': 'forearms', 'grip': 'forearms',
  'calf': 'calves',
  // v21: More food synonyms
  'grilled meat': 'steak', 'beefsteak': 'steak',
  'scramble': 'scrambled eggs', 'sunny side': 'fried eggs',
  'pita': 'bread', 'naan': 'bread', 'flatbread': 'bread',
  'macaroni': 'pasta', 'spaghetti': 'pasta', 'penne': 'pasta', 'noodles': 'pasta',
  'basmati': 'rice', 'jasmine rice': 'rice', 'wild rice': 'rice',
  'almond milk': 'milk', 'oat milk': 'milk', 'soy milk': 'milk',
  'cottage cheese': 'cheese', 'ricotta': 'cheese',
  'prawn': 'shrimp', 'lobster': 'seafood', 'calamari': 'seafood',
  'granola bar': 'protein bar', 'energy bar': 'protein bar',
  'smoothie bowl': 'smoothie', 'acai bowl': 'smoothie',
  // v21: Egyptian food synonyms
  'مكرونة بشاميل': 'macarona bechamel', 'مكرونة بالبشاميل': 'macarona bechamel',
  'رز معمر': 'rice', 'رز بالخلطة': 'rice', 'رز بسمتي': 'rice',
  'بيتزا': 'pizza', 'برجر': 'burger', 'هوت دوج': 'hot dog',
  'آيس كريم': 'ice cream', 'جيلاتي': 'ice cream',
  // v21: More supplement synonyms
  'fish oils': 'fish oil', 'omega3': 'omega 3', 'omega-3': 'omega 3',
  'vit d': 'vitamin d', 'vit c': 'vitamin c', 'vit b': 'vitamin b',
  'multi vitamin': 'multivitamin', 'multi-vitamin': 'multivitamin',
  'protein pwdr': 'whey', 'shake': 'protein shake',
  // v27: More workout synonyms
  'warm up': 'warmup', 'cool down': 'cooldown',
  'strength training': 'resistance training', 'powerlifting': 'strength',
  'bodybuilding': 'hypertrophy',
  'progressive overload': 'overload', 'time under tension': 'tut',
  'rest period': 'rest time', 'rest between sets': 'rest time',
  'one rep max': '1rm', '1 rep max': '1rm',
  'personal record': 'pr', 'personal best': 'pr',
  'conditioning': 'cardio', 'stamina': 'endurance',
  'plyometric': 'plyo', 'plyometrics': 'plyo',
  'compound lift': 'compound exercise', 'isolation lift': 'isolation exercise',
  // v27: More body synonyms
  'lower back': 'lumbar', 'upper back': 'traps',
  'hip flexor': 'hip', 'hip flexors': 'hips',
  'rotator cuff': 'shoulder', 'rotator': 'shoulder',
  'oblique': 'obliques', 'love handle': 'obliques', 'love handles': 'obliques',
  'inner thigh': 'adductors', 'outer thigh': 'abductors',
  // v27: More Egyptian slang
  'ماشين': 'machine', 'كابل': 'cable', 'بار': 'barbell',
  'دمبل': 'dumbbell', 'بالط': 'plate', 'ديسك': 'plate',
  'سيت': 'set', 'ريب': 'rep', 'ريست': 'rest',
  'ماكس': 'max', 'بي آر': 'pr', 'وارم اب': 'warmup',
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
  // Compound lifts
  'bench press', 'squat', 'deadlift', 'overhead press', 'barbell row', 'pull up',
  'front squat', 'goblet squat', 'bulgarian split squat', 'hack squat',
  'good morning', 'rack pull', 'farmers walk', 'shrug', 'upright row',
  'arnold press', 'military press', 'clean and jerk', 'snatch', 'power clean',
  'sumo deadlift', 'trap bar deadlift', 'deficit deadlift', 'pause squat',
  // Chest
  'cable fly', 'cable crossover', 'pec deck', 'incline press', 'decline press',
  'dumbbell fly', 'incline dumbbell press', 'decline dumbbell press', 'chest dip',
  'svend press', 'landmine press',
  // Back
  'lat pulldown', 'cable row', 't-bar row', 'pendlay row', 'bent over row',
  'meadows row', 'seal row', 'chest supported row', 'single arm row',
  'straight arm pulldown', 'pullover',
  // Arms
  'dumbbell curl', 'hammer curl', 'tricep pushdown', 'skull crusher',
  'preacher curl', 'concentration curl', 'cable curl', 'tricep extension',
  'bayesian curl', 'spider curl', 'incline curl', 'ez bar curl',
  'overhead tricep extension', 'tricep kickback', 'close grip bench press',
  'reverse curl', 'wrist curl', 'zottman curl',
  // Legs
  'leg press', 'leg extension', 'leg curl', 'calf raise',
  'romanian deadlift', 'hip thrust', 'lunges', 'lunge', 'step up',
  'walking lunge', 'reverse lunge', 'sissy squat', 'pistol squat',
  'nordic curl', 'glute bridge', 'hip abduction', 'hip adduction',
  'seated calf raise', 'donkey calf raise', 'leg press calf raise',
  // Shoulders
  'lateral raise', 'face pull', 'rear delt fly', 'front raise',
  'cable lateral raise', 'reverse pec deck', 'lu raise',
  // Core
  'plank', 'crunch', 'sit up', 'russian twist', 'hanging leg raise',
  'cable crunch', 'ab rollout', 'dead bug', 'pallof press',
  'woodchopper', 'dragon flag', 'v up', 'bicycle crunch', 'toe touch',
  'side plank', 'copenhagen plank',
  // Bodyweight/Calisthenics
  'dips', 'push up', 'pushup', 'diamond push up', 'pike push up',
  'handstand push up', 'muscle up', 'l sit', 'pistol squat',
  'box jump', 'burpee', 'mountain climber', 'battle rope', 'kettlebell swing',
  'jump squat', 'jump lunge', 'tuck jump', 'broad jump',
  // Sport-specific
  'sled push', 'sled pull', 'tire flip', 'rope climb', 'bear crawl',
  'wall ball', 'thrusters', 'man maker', 'devil press',
  // Mobility/Rehab
  'band pull apart', 'wall slide', 'cat cow', 'bird dog', 'clamshell',
  'fire hydrant', 'world greatest stretch', 'foam roll',
  // v21: More exercises (machines, cables, variations)
  'chest press machine', 'shoulder press machine', 'smith machine squat',
  'smith machine bench', 'cable fly low', 'cable fly high',
  'cable lateral raise', 'cable curl', 'cable tricep', 'cable crunch',
  'leg press machine', 'hack squat machine', 'pendulum squat',
  'assisted pull up', 'assisted dip', 'smith machine row',
  'reverse grip pulldown', 'close grip pulldown', 'wide grip pulldown',
  'preacher curl machine', 'tricep dip machine',
  'pec fly machine', 'rear delt machine',
  'adductor machine', 'abductor machine',
  'hip flexor raise', 'decline crunch', 'incline sit up',
  'landmine squat', 'landmine row', 'landmine press',
  'zercher squat', 'jefferson squat', 'anderson squat',
  'floor press', 'spoto press', 'larsen press',
  'snatch grip deadlift', 'jefferson deadlift',
  'ez bar preacher curl', 'incline hammer curl', 'cross body hammer curl',
  'lying tricep extension', 'jm press',
  'bulgarian split squat', 'rear foot elevated split squat',
  'belt squat', 'safety bar squat', 'tempo squat',
  'single leg press', 'single leg rdl', 'single leg hip thrust',
  'standing calf raise', 'smith machine calf raise',
  // v21: Stretches & mobility
  'quad stretch', 'hamstring stretch', 'chest stretch', 'lat stretch',
  'hip flexor stretch', 'piriformis stretch', 'calf stretch',
  'shoulder stretch', 'tricep stretch', 'wrist stretch',
  'neck stretch', 'lower back stretch', 'groin stretch',
  'butterfly stretch', 'seated forward fold', 'standing toe touch',
  'doorway stretch', 'wall pec stretch', 'cross body stretch',
  // v27: More compound movements
  'zercher squat', 'jefferson squat', 'sissy squat', 'belt squat',
  'pendlay row', 'yates row', 'meadows row', 'seal row',
  'floor press', 'pin press', 'board press', 'spoto press',
  'push press', 'z press', 'viking press', 'log press',
  'deficit deadlift', 'block pull', 'paused deadlift', 'snatch grip deadlift',
  // v27: More isolation
  'concentration curl', 'bayesian curl', 'drag curl', 'scott curl',
  'jm press', 'tate press', 'california press',
  'pec deck', 'cable crossover', 'svend press', 'pullover',
  'leg adduction', 'leg abduction', 'glute kickback', 'donkey kick',
  'cable crunch', 'ab wheel', 'dragon flag', 'windshield wiper',
  'neck curl', 'neck extension', 'neck rotation',
  // v27: More functional
  'battle ropes', 'sled push', 'sled pull', 'prowler push',
  'tire flip', 'atlas stone', 'sandbag carry', 'rope climb',
  'box jump', 'broad jump', 'depth jump', 'tuck jump',
  'wall ball', 'ball slam', 'medicine ball throw',
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
  // Proteins
  'chicken', 'chicken breast', 'chicken thigh', 'grilled chicken',
  'eggs', 'egg', 'boiled eggs', 'scrambled eggs', 'fried eggs', 'egg whites',
  'beef', 'meat', 'steak', 'ground beef', 'minced meat', 'liver',
  'fish', 'salmon', 'tuna', 'tilapia', 'shrimp', 'prawns', 'sardines', 'mackerel',
  'turkey', 'turkey breast', 'duck',
  // Dairy
  'milk', 'yogurt', 'greek yogurt', 'cheese', 'cottage cheese', 'cream cheese',
  'mozzarella', 'cheddar', 'feta', 'labneh', 'butter', 'ghee',
  // Grains & Carbs
  'rice', 'brown rice', 'white rice', 'bread', 'whole wheat bread', 'toast',
  'pasta', 'oats', 'oatmeal', 'quinoa', 'couscous', 'corn', 'tortilla',
  'cereal', 'granola', 'rice cake',
  // Legumes
  'beans', 'lentils', 'chickpeas', 'hummus', 'black beans', 'kidney beans',
  // Vegetables
  'potato', 'potatoes', 'sweet potato', 'broccoli', 'spinach', 'kale',
  'cucumber', 'tomato', 'lettuce', 'carrots', 'peppers', 'onion', 'garlic',
  'zucchini', 'eggplant', 'cauliflower', 'green beans', 'peas', 'mushrooms',
  'cabbage', 'celery', 'asparagus', 'beets',
  // Fruits
  'banana', 'apple', 'orange', 'dates', 'avocado', 'mango', 'watermelon',
  'grapes', 'strawberry', 'blueberry', 'pineapple', 'kiwi', 'pomegranate',
  'fig', 'guava', 'peach', 'pear', 'lemon', 'grapefruit', 'coconut',
  // Nuts & Seeds
  'peanut butter', 'almonds', 'nuts', 'walnuts', 'cashews', 'pistachios',
  'chia seeds', 'flax seeds', 'sunflower seeds', 'pumpkin seeds', 'tahini',
  // Fats & Oils
  'honey', 'olive oil', 'coconut oil',
  // Egyptian dishes
  'foul', 'ful', 'koshari', 'koshary', 'taameya', 'falafel', 'molokhia', 'bamia',
  'mahshi', 'shawarma', 'kebab', 'kofta', 'feteer', 'hawawshi', 'besarah', 'fattah',
  'roz bel laban', 'om ali', 'konafa', 'basbousa', 'fiteer', 'kushari',
  'ful medames', 'ta3meya', 'molokheya', 'macarona bechamel', 'mombar',
  'kaware3', 'kabab halla', 'torly', 'shakshuka', 'menemen',
  // Egyptian street food
  'batates', 'sweet corn', 'tirmis', 'sobia', 'kharoub', 'tamr hindi',
  'sugarcane juice', 'licorice', 'sahlab', 'halabessa',
  // Egyptian desserts
  'kunafa', 'qatayef', 'zalabya', 'balah el sham', 'baklava', 'halawa',
  'meshabek', 'gullash', 'rice pudding',
  // Fast food
  'pizza', 'burger', 'fries', 'fried chicken', 'nuggets', 'hot dog',
  'sandwich', 'wrap', 'sub', 'sushi', 'ramen',
  // Drinks
  'coffee', 'tea', 'green tea', 'juice', 'smoothie', 'protein shake',
  'water', 'lemonade', 'hibiscus', 'karkade',
  // Supplements
  'whey', 'casein', 'bcaa', 'glutamine', 'multivitamin', 'omega 3', 'fish oil',
  'zinc', 'vitamin d', 'vitamin c', 'magnesium', 'collagen', 'creatine',
  'pre workout', 'mass gainer', 'protein bar',
  // Arabic food names
  'فول', 'كشري', 'طعمية', 'ملوخية', 'بامية', 'محشي', 'شاورما', 'كباب', 'كفتة',
  'فتة', 'أرز', 'فراخ', 'بيض', 'عيش', 'جبنة', 'زبادي', 'تونة', 'لحمة', 'سمك',
  'بطاطس', 'موز', 'تفاح', 'برتقال', 'بلح', 'عسل', 'شوفان', 'لبن', 'مكرونة',
  'فتير', 'حواوشي', 'كنافة', 'بسبوسة', 'قطايف', 'بقلاوة', 'أم علي',
  'شكشوكة', 'فول مدمس', 'بصارة', 'ممبار', 'كوارع', 'مسقعة',
  'سلطة', 'فاكهة', 'خضار', 'ورق عنب', 'بابا غنوج',
  'كبدة', 'سجق', 'بسطرمة', 'لانشون', 'جمبري', 'كابوريا',
  'دقة', 'مش', 'حلاوة طحينية', 'عسل اسود',
  // Franco food names
  'fool', 'koshary', 'ta3meya', 'molo5eya', 'ma7shy', 'konafa',
  // v21: More proteins
  'lamb', 'veal', 'rabbit', 'goat', 'organ meat', 'bone broth',
  'smoked salmon', 'grilled fish', 'fried fish', 'fish fillet',
  'rotisserie chicken', 'chicken wings', 'chicken liver',
  'beef jerky', 'biltong', 'corned beef',
  'tofu', 'tempeh', 'seitan', 'edamame', 'soy protein',
  // v21: More dairy
  'kefir', 'skyr', 'ayran', 'paneer', 'halloumi', 'brie', 'gouda',
  'cream', 'heavy cream', 'sour cream', 'whipped cream',
  'ice cream', 'frozen yogurt',
  // v21: More grains
  'freekeh', 'bulgur', 'barley', 'millet', 'amaranth', 'buckwheat',
  'sourdough', 'rye bread', 'bagel', 'croissant', 'muffin',
  'pancake', 'waffle', 'crepe', 'french toast',
  // v21: More veggies
  'artichoke', 'arugula', 'bell pepper', 'bok choy', 'brussels sprouts',
  'butternut squash', 'corn', 'edamame', 'fennel', 'green onion',
  'jalapeño', 'leek', 'okra', 'parsley', 'radish', 'turnip',
  'sweet corn', 'snow peas', 'sugar snap', 'water chestnuts',
  // v21: More fruits
  'cantaloupe', 'cherry', 'cranberry', 'dragonfruit', 'jackfruit',
  'lychee', 'mandarin', 'nectarine', 'papaya', 'passion fruit',
  'persimmon', 'plum', 'raspberry', 'starfruit', 'tangerine',
  // v21: More nuts & seeds
  'hazelnut', 'macadamia', 'pine nuts', 'pecan', 'brazil nut',
  'hemp seeds', 'sesame seeds', 'poppy seeds',
  // v21: More Egyptian food
  'gibna rumi', 'gibna bayda', 'gibna domyati', 'gibna istanboly',
  'laban rayeb', 'laban 3yran', 'zabady',
  'roz mo3amar', 'macarona', 'fatta', 'meshaltet',
  'ta3leya', 'domiati', 'meshwi', 'ma2ly',
  'basterma', 'sougoq', 'lunchon',
  'sahlab', 'qamar el din', 'licorice juice', 'dom juice',
  // v21: Arabic food names expansion
  'فريك', 'برغل', 'كينوا', 'شعرية', 'لسان عصفور',
  'روبيان', 'سردين', 'ماكريل', 'بوري', 'قاروص',
  'أرانب', 'حمام', 'بط', 'ديك رومي',
  'فشار', 'شيبسي', 'بسكويت', 'كعك', 'كيك',
  'تين', 'جوافة', 'خوخ', 'كمثرى', 'فراولة', 'عنب', 'بطيخ', 'كانتلوب',
  'توت', 'رمان', 'مشمش', 'يوسفي',
  'لوز', 'جوز', 'كاجو', 'فستق', 'بندق', 'سوداني',
  'زبيب', 'مشمش مجفف', 'تين مجفف', 'قراصيا',
  // v27: More proteins
  'venison', 'bison', 'elk', 'ostrich', 'quail', 'duck breast',
  'anchovies', 'mussels', 'oysters', 'scallops', 'crab', 'lobster',
  'cottage cheese', 'ricotta', 'paneer',
  // v27: More carb sources
  'jasmine rice', 'basmati rice', 'arborio rice', 'wild rice',
  'whole wheat pasta', 'gluten free pasta', 'rice noodles',
  'sweet potato fries', 'potato wedges', 'mashed potato',
  'english muffin', 'ciabatta', 'focaccia', 'naan', 'pita',
  'corn tortilla', 'flour tortilla', 'taco shell',
  // v27: More veggies
  'swiss chard', 'collard greens', 'watercress', 'endive',
  'radicchio', 'kohlrabi', 'parsnip', 'rutabaga', 'daikon',
  'jicama', 'chayote', 'plantain', 'taro', 'cassava',
  // v27: More fruits
  'acai', 'goji berry', 'mulberry', 'boysenberry', 'blackberry',
  'gooseberry', 'rhubarb', 'kumquat', 'blood orange', 'clementine',
  // v27: More snacks & processed
  'protein cookie', 'rice cake', 'popcorn', 'trail mix', 'jerky',
  'dark chocolate', 'dried mango', 'dried cranberry', 'fruit leather',
  'pita chips', 'veggie chips', 'seaweed snack',
  // v27: More Egyptian specific
  'feteer meshaltet', 'roz bel laban', 'mehallabeyya', 'ataif',
  'sambousek', 'spring roll', 'cheese roll', 'beid bel basterma',
  'shakshuka', 'eggs with pastrami', 'foul with tahini',
  'koshari special', 'alexandrian liver', 'hawawshi roll',
  // v27: Arabic additions
  'سمبوسك', 'لقمة القاضي', 'أم علي', 'مهلبية', 'أرز باللبن',
  'عطايف', 'فتير مشلتت', 'بيض بالبسطرمة', 'كبدة اسكندراني',
  'حواوشي رول', 'فول بالطحينة', 'كشري سبيشال',
  'شوربة عدس', 'شوربة فراخ', 'سلطة خضرا', 'سلطة فواكه',
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

// ─── Multi-Food Detection ──────────────────────────────────────
// "rice and chicken and salad" → ["rice", "chicken", "salad"]
// "eggs, toast, and juice" → ["eggs", "toast", "juice"]
function detectMultipleFoods(text: string): string[] {
  const lower = text.toLowerCase();
  const parts = lower.split(/\s*(?:and|&|,|و|with|مع|w)\s*/);
  const foods: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length < 2) continue;
    // Check if this part contains a known food
    const food = FOOD_NAMES.find(f =>
      trimmed === f || trimmed.startsWith(f + ' ') || trimmed.endsWith(' ' + f) || trimmed.includes(' ' + f + ' ')
    );
    if (food) foods.push(food);
    else if (FOOD_NAMES.includes(trimmed)) foods.push(trimmed);
  }
  return foods;
}

// ─── Food Comparison Detection ─────────────────────────────────
// "chicken vs beef", "rice or pasta", "فول ولا بيض"
function detectFoodComparison(text: string): { food1: string; food2: string } | null {
  const lower = text.toLowerCase();
  const vsMatch = lower.match(/(.+?)\s+(?:vs\.?|versus|or|compared to|ولا|wala|better than|احسن من|a7san men)\s+(.+)/);
  if (!vsMatch) return null;
  const left = vsMatch[1].trim();
  const right = vsMatch[2].trim();
  const food1 = FOOD_NAMES.find(f => left.includes(f) || f.includes(left));
  const food2 = FOOD_NAMES.find(f => right.includes(f) || f.includes(right));
  if (food1 && food2) return { food1, food2 };
  return null;
}

// ─── Meal Quality Assessment ────────────────────────────────────
// "is rice and chicken good", "is this a good meal"
function detectMealQualityQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return /(?:is (?:this |it )?(?:a )?good|is (?:this |it )?healthy|هل ده كويس|كويس|صحي|ده صح|da kwais|se7y)/.test(lower)
    && /(?:meal|food|أكل|وجبة|akl|wagba)/.test(lower);
}

// ─── Portion-Aware Food Parsing ─────────────────────────────────
// Detects "3 eggs", "200g chicken", "a plate of koshari", "كيلو فراخ"
interface FoodPortion {
  food: string;
  quantity?: string;
  unit?: string;
}

function parseFoodPortion(text: string): FoodPortion | null {
  const lower = text.toLowerCase();

  // Pattern: <number> <unit> <food> → "200g chicken", "500ml milk", "2 scoops whey"
  const numUnitFood = lower.match(/(\d+(?:\.\d+)?)\s*(g|gm|gram|grams|kg|kilo|ml|liter|litre|cup|cups|tbsp|tsp|scoop|scoops|piece|pieces|slice|slices|plate|plates|serving|servings|حتة|حتت|طبق|معلقة|كوب|كيلو|جرام)\s+(?:of\s+)?(.+)/);
  if (numUnitFood) {
    const food = numUnitFood[3].trim();
    if (FOOD_NAMES.some(f => food.includes(f) || f.includes(food))) {
      return { food, quantity: numUnitFood[1], unit: numUnitFood[2] };
    }
  }

  // Pattern: <number> <food> → "3 eggs", "2 bananas"
  const numFood = lower.match(/^(\d+)\s+(.+)/);
  if (numFood) {
    const food = numFood[2].trim();
    if (FOOD_NAMES.some(f => food.includes(f) || f.includes(food))) {
      return { food, quantity: numFood[1] };
    }
  }

  // Pattern: "a/an <food>" → "a banana", "an apple"
  const aFood = lower.match(/^(?:a|an)\s+(.+)/);
  if (aFood) {
    const food = aFood[1].trim();
    if (FOOD_NAMES.some(f => food.includes(f) || f.includes(food))) {
      return { food, quantity: '1' };
    }
  }

  // Pattern: "a plate of X", "a bowl of Y", "a cup of Z", "طبق كشري"
  const servingMatch = lower.match(/(?:a |one )?(plate|bowl|cup|handful|glass|bottle|can|طبق|طاسة|كوب|قطعة|علبة|ازازة)\s+(?:of\s+)?(.+)/);
  if (servingMatch) {
    const food = servingMatch[2].trim();
    if (FOOD_NAMES.some(f => food.includes(f) || f.includes(food))) {
      return { food, quantity: '1', unit: servingMatch[1] };
    }
  }

  // Arabic: "طبق كشري", "كيلو فراخ", "٣ بيضات"
  const arPortion = text.match(/(\d+|[٠-٩]+)\s*(.+)/);
  if (arPortion) {
    const food = arPortion[2].trim();
    if (FOOD_NAMES.some(f => food.includes(f) || f.includes(food))) {
      return { food, quantity: arPortion[1] };
    }
  }

  return null;
}

// ─── Cooking Method Detection ────────────────────────────────────
// "grilled vs fried chicken", "boiled eggs or scrambled", "مشوي ولا مقلي"
const COOKING_METHODS: Record<string, string> = {
  'grilled': 'grilled', 'grilling': 'grilled', 'مشوي': 'grilled',
  'fried': 'fried', 'frying': 'fried', 'deep fried': 'fried', 'مقلي': 'fried',
  'boiled': 'boiled', 'مسلوق': 'boiled',
  'baked': 'baked', 'في الفرن': 'baked',
  'steamed': 'steamed', 'مطهي بالبخار': 'steamed',
  'raw': 'raw', 'ني': 'raw',
  'roasted': 'roasted', 'محمص': 'roasted',
  'sauteed': 'sauteed', 'مشوح': 'sauteed',
  'air fried': 'air fried', 'اير فراير': 'air fried',
};

function detectCookingMethodQuery(text: string): { method1: string; method2?: string; food?: string } | null {
  const lower = text.toLowerCase();
  // "grilled vs fried chicken" or "مشوي ولا مقلي فراخ"
  const vsMatch = lower.match(/(\w+)\s+(?:vs|versus|or|ولا|wala|vs\.)\s+(\w+)\s*(.*)/);
  if (vsMatch) {
    const m1 = COOKING_METHODS[vsMatch[1]];
    const m2 = COOKING_METHODS[vsMatch[2]];
    if (m1 && m2) return { method1: m1, method2: m2, food: vsMatch[3]?.trim() || undefined };
  }
  // "is grilled chicken healthier" or "calories in fried eggs"
  for (const [keyword, method] of Object.entries(COOKING_METHODS)) {
    if (lower.includes(keyword)) {
      const foodAfter = lower.split(keyword)[1]?.trim();
      if (foodAfter) {
        const food = FOOD_NAMES.find(f => foodAfter.includes(f));
        if (food) return { method1: method, food };
      }
    }
  }
  return null;
}

// ─── Exercise Alternative Detection ──────────────────────────────
// "easier than deadlift", "alternative to bench press", "بديل للسكوات"
function detectExerciseAlternative(text: string): { exercise: string; type: 'easier' | 'harder' | 'alternative' } | null {
  const lower = text.toLowerCase();
  // "easier than X", "alternative to X", "can't do X"
  const easierMatch = lower.match(/(?:easier|simpler|lighter|beginner|اسهل|أسهل|بديل أسهل)\s+(?:than|for|version|من)\s+(.+)/);
  if (easierMatch) {
    const ex = EXERCISE_NAMES.find(e => easierMatch[1].includes(e));
    if (ex) return { exercise: ex, type: 'easier' };
  }
  const harderMatch = lower.match(/(?:harder|advanced|heavier|اصعب|أصعب|بديل أصعب)\s+(?:than|version|من)\s+(.+)/);
  if (harderMatch) {
    const ex = EXERCISE_NAMES.find(e => harderMatch[1].includes(e));
    if (ex) return { exercise: ex, type: 'harder' };
  }
  const altMatch = lower.match(/(?:alternative|replace|substitute|instead of|swap|بديل|بديل لـ|بدل)\s+(?:to|for|of)?\s*(.+)/);
  if (altMatch) {
    const ex = EXERCISE_NAMES.find(e => altMatch[1].includes(e));
    if (ex) return { exercise: ex, type: 'alternative' };
  }
  const cantMatch = lower.match(/(?:can'?t do|unable to|مش قادر|مقدرش)\s+(.+)/);
  if (cantMatch) {
    const ex = EXERCISE_NAMES.find(e => cantMatch[1].includes(e));
    if (ex) return { exercise: ex, type: 'easier' };
  }
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

  // ── Exercise Form Cues (v14) ─────────────────────────────────
  {
    keywords: ['squat form', 'how to squat', 'squat technique', 'squat cues'],
    keywordsAr: ['فورم السكوات', 'ازاي اعمل سكوات'],
    keywordsFranco: ['form el squat', 'ezay a3mel squat'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Squat cues: 1) Feet shoulder-width, toes slightly out 2) Brace core, deep breath 3) Sit back like a chair 4) Knees track over toes 5) Drive through full foot 6) Chest up, back neutral', ar: 'فورم السكوات: 1) القدم بعرض الكتف، الأصابع للبرا شوية 2) شد الكور، خد نفس عميق 3) قعد ورا زي الكرسي 4) الركبة في اتجاه الأصابع 5) ادفع بالقدم كلها 6) صدرك لفوق، الضهر مستقيم' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['deadlift form', 'how to deadlift', 'deadlift technique', 'deadlift cues'],
    keywordsAr: ['فورم الديدلفت', 'ازاي اعمل ديدلفت'],
    keywordsFranco: ['form el deadlift', 'ezay a3mel deadlift'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Deadlift cues: 1) Bar over mid-foot 2) Hip-width stance 3) Grip just outside knees 4) Flat back, chest up 5) Push floor away 6) Lock hips at top, don\'t hyperextend 7) Lower in reverse', ar: 'فورم الديدلفت: 1) البار فوق نص القدم 2) القدم بعرض الحوض 3) امسك البار برا الركبة 4) ضهر مفرود، صدر لفوق 5) ادفع الأرض بعيد 6) اقفل الحوض فوق من غير ما تعمل قوس' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['bench press form', 'how to bench', 'bench technique', 'bench cues'],
    keywordsAr: ['فورم البنش', 'ازاي اعمل بنش'],
    keywordsFranco: ['form el bench', 'ezay a3mel bench'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Bench press cues: 1) Eyes under bar 2) Arch back slightly, retract shoulder blades 3) Feet flat on floor 4) Grip 1.5x shoulder width 5) Lower to mid-chest 6) Drive through feet, push up & slightly back', ar: 'فورم البنش: 1) العين تحت البار 2) قوّس ضهرك شوية، ارجع الكتف لورا 3) القدم مسطحة على الأرض 4) امسك 1.5 عرض الكتف 5) نزّل لنص الصدر 6) ادفع من الرجل واضغط لفوق' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['pull up form', 'how to pull up', 'pull up technique', 'pullup form'],
    keywordsAr: ['فورم العقلة', 'ازاي اعمل عقلة', 'فورم بول اب'],
    keywordsFranco: ['form el pull up', 'ezay a3mel 3a2la'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Pull-up cues: 1) Dead hang, shoulder-width grip 2) Engage lats (think: put shoulder blades in back pockets) 3) Pull elbows to hips 4) Chin over bar 5) Lower controlled. Can\'t do one? Start with negatives or band-assisted!', ar: 'فورم العقلة: 1) ابدأ من وضع التعلق 2) فعّل اللاتس (فكر: حط الكتف في جيبك الخلفي) 3) اسحب الكوع للحوض 4) الدقن فوق البار 5) انزل ببطء. مش قادر تعمل واحدة؟ ابدأ بالنيجاتيف أو بالباند!' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['overhead press form', 'how to ohp', 'shoulder press form', 'ohp technique'],
    keywordsAr: ['فورم الأوفرهيد', 'ازاي اعمل شولدر بريس'],
    keywordsFranco: ['form el overhead', 'ezay a3mel shoulder press'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'OHP cues: 1) Feet hip-width 2) Bar at collarbone level 3) Brace core, squeeze glutes 4) Press up & slightly back (clear your head) 5) Lock out overhead 6) Bar over mid-foot at top', ar: 'فورم الأوفرهيد: 1) القدم بعرض الحوض 2) البار عند الترقوة 3) شد الكور والجلوت 4) اضغط لفوق وورا شوية (عدّي الراس) 5) اقفل فوق 6) البار فوق نص القدم' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['hip thrust form', 'how to hip thrust', 'glute bridge form'],
    keywordsAr: ['فورم الهيب ثراست', 'ازاي اعمل هيب ثراست'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Hip thrust cues: 1) Upper back on bench 2) Bar on hip crease (use pad) 3) Feet shoulder-width, knees 90° at top 4) Drive through heels 5) Squeeze glutes hard at top 6) Chin tucked (don\'t hyperextend neck)', ar: 'فورم الهيب ثراست: 1) أعلى الضهر على البنش 2) البار على الحوض (استخدم باد) 3) القدم بعرض الكتف 4) ادفع بالكعب 5) اعصر الجلوت فوق 6) الدقن لتحت (متمدش رقبتك)' },
    priority: 10,
    domain: 'workout',
  },
  {
    keywords: ['row form', 'barbell row form', 'how to row', 'row technique'],
    keywordsAr: ['فورم الرو', 'ازاي اعمل رو'],
    keywordsFranco: ['form el row', 'ezay a3mel row'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Row cues: 1) Hinge at hips, 45° torso 2) Let arms hang straight 3) Pull to lower chest/upper abs 4) Squeeze shoulder blades together 5) Lower controlled 6) Don\'t use momentum — if you jerk, lower the weight', ar: 'فورم الرو: 1) اتكي من الحوض، الجسم 45 درجة 2) سيب الدراع يتعلق 3) اسحب لأسفل الصدر/فوق البطن 4) اعصر الكتف لبعض 5) نزّل ببطء 6) متستخدمش سوينج — لو بتهز، خفف الوزن' },
    priority: 10,
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
  {
    keywords: ['how to take creatine', 'creatine dosage', 'creatine loading', 'when to take creatine'],
    keywordsAr: ['ازاي اخد كرياتين', 'جرعة الكرياتين', 'اخد كرياتين امتى'],
    keywordsFranco: ['ezay a5od creatine', 'ger3et el creatine'],
    stateId: 'SP_MENU',
    response: { en: 'Creatine: 5g daily, every day (even rest days). No loading needed. Mix in water/shake. Take anytime — timing doesn\'t matter much.', ar: 'كرياتين: 5 جرام يومياً، كل يوم (حتى أيام الراحة). مش محتاج لودنج. حطه في مية/شيك. في أي وقت — التوقيت مش مهم أوي.' },
    priority: 9,
    domain: 'supplements',
  },
  {
    keywords: ['which whey', 'best whey', 'whey isolate', 'whey concentrate', 'protein brand'],
    keywordsAr: ['احسن واي', 'واي ايزوليت', 'واي كونسنتريت'],
    keywordsFranco: ['a7san whey', 'whey isolate', 'whey concentrate'],
    stateId: 'SP_MENU',
    response: { en: 'Isolate: purer (90%+ protein), less lactose, more expensive. Concentrate: 70-80% protein, cheaper, fine for most people. Both work — pick what fits your budget!', ar: 'ايزوليت: أنقى (90%+ بروتين)، لاكتوز أقل، أغلى. كونسنتريت: 70-80% بروتين، أرخص، كويس لمعظم الناس. الاتنين شغالين — اختار حسب ميزانيتك!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['vitamin d', 'vitamin d3', 'sunshine vitamin', 'do i need vitamin d'],
    keywordsAr: ['فيتامين دي', 'فيتامين د'],
    keywordsFranco: ['vitamin d', 'vitamin d3'],
    stateId: 'SP_MENU',
    response: { en: 'Vitamin D: Most people are deficient. 2000-4000 IU daily with a fatty meal. Important for bones, immunity, and muscle function. Get tested!', ar: 'فيتامين دي: معظم الناس عندهم نقص. 2000-4000 وحدة يومياً مع وجبة فيها دهون. مهم للعظام والمناعة والعضلات. اعمل تحليل!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['omega 3', 'fish oil', 'omega benefits', 'do i need omega'],
    keywordsAr: ['أوميجا 3', 'زيت سمك', 'فوايد الأوميجا'],
    keywordsFranco: ['omega 3', 'fish oil', 'fawayed el omega'],
    stateId: 'SP_MENU',
    response: { en: 'Omega-3: Anti-inflammatory, heart health, joint support. 1-3g EPA+DHA daily. Best from fatty fish (2-3x/week) or a quality fish oil supplement.', ar: 'أوميجا 3: مضاد التهابات، صحة القلب، دعم المفاصل. 1-3 جرام EPA+DHA يومياً. أحسن من السمك الدهني (2-3 مرات/أسبوع) أو مكمل زيت سمك كويس.' },
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

  // ══════════════════════════════════════════════════════════
  // ── Egyptian Food Intelligence (v12) ──────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['molokhia', 'molokheia', 'molokhiya', 'molokheya', 'jute leaves'],
    keywordsAr: ['ملوخية', 'ملوخيه'],
    keywordsFranco: ['molo5eya', 'molo5ia'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Molokhia: ~50 cal/cup, rich in iron, calcium, vitamins A & C. Low cal but paired with rice + chicken = full meal. Searching...', ar: 'ملوخية: ~50 سعر/كوب، غنية بالحديد والكالسيوم وفيتامين A و C. سعرات قليلة بس مع أرز + فراخ = وجبة كاملة. بدور...' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['mahshi', 'stuffed grape leaves', 'stuffed peppers', 'stuffed vegetables', 'wara2 enab'],
    keywordsAr: ['محشي', 'ورق عنب', 'محشي كرنب', 'محشي فلفل'],
    keywordsFranco: ['ma7shy', 'wara2 3enab'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Mahshi (stuffed veggies): ~150-200 cal per portion. Great source of fiber + carbs. Rice-stuffed grape leaves are a classic!', ar: 'محشي: ~150-200 سعر للحصة. مصدر ممتاز للألياف والكارب. ورق العنب كلاسيك!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['fattah', 'fattet hummus', 'egyptian fattah'],
    keywordsAr: ['فتة', 'فتة الحمص', 'فتة لحمة'],
    keywordsFranco: ['fatta', 'fattet'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Fattah: High calorie (~400-600/portion) — rice, bread, meat, garlic vinegar sauce. Great post-workout if you need a caloric surplus!', ar: 'فتة: سعرات عالية (~400-600/حصة) — أرز، عيش، لحمة، صلصة خل وتوم. ممتازة بعد التمرين لو محتاج سعرات زيادة!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['hawawshi', 'hawawshy'],
    keywordsAr: ['حواوشي'],
    keywordsFranco: ['7awawshy', 'hawawshy'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Hawawshi: ~350-500 cal per piece. High protein from minced meat + carbs from bread. Consider half portion if cutting!', ar: 'حواوشي: ~350-500 سعر لكل واحدة. بروتين عالي من اللحمة المفرومة + كارب من العيش. خد نص واحدة لو بتنشف!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['fiteer', 'feteer', 'egyptian pie', 'fiteer meshaltet'],
    keywordsAr: ['فطير', 'فطير مشلتت'],
    keywordsFranco: ['feteer', 'fiteer meshaltet'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Fiteer: Very high calorie (~500-800/piece) — layers of butter and dough. Occasional treat, not daily. Savory fiteer with cheese is better than sweet.', ar: 'فطير: سعرات عالية جداً (~500-800/قطعة) — طبقات سمنة وعجينة. يبقى ترييت مش يومي. الفطير المالح بالجبنة أحسن من الحلو.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['shawarma calories', 'shawarma healthy', 'is shawarma ok'],
    keywordsAr: ['سعرات الشاورما', 'الشاورما صحية'],
    keywordsFranco: ['so3rat el shawarma', 'shawarma se7ya'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Shawarma: ~400-600 cal/sandwich. Chicken shawarma is leaner (~25g protein). Skip the garlic sauce for fewer calories. Ask for extra veggies!', ar: 'شاورما: ~400-600 سعر/ساندويتش. شاورما فراخ أخف (~25 جرام بروتين). سيب صلصة الثوم لسعرات أقل. اطلب خضار زيادة!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['liver', 'liver healthy', 'kibda', 'liver calories'],
    keywordsAr: ['كبدة', 'كبدة صحية', 'سعرات الكبدة'],
    keywordsFranco: ['kebda', 'kibda'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Liver (kibda): ~135 cal/100g, 20g protein. Incredibly rich in iron, B12, vitamin A. One of the most nutrient-dense foods! Great for bulking.', ar: 'كبدة: ~135 سعر/100 جرام، 20 جرام بروتين. غنية جداً بالحديد وB12 وفيتامين A. من أغنى الأكلات بالعناصر الغذائية! ممتازة للبلك.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['koshari healthy', 'koshari calories', 'koshary calories', 'is koshari good'],
    keywordsAr: ['سعرات الكشري', 'الكشري صحي'],
    keywordsFranco: ['so3rat el koshary', 'koshary se7y'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Koshari: ~500-700 cal/plate. Good carb source (rice + pasta + lentils). Add more lentils for protein! A vegan-friendly Egyptian classic.', ar: 'كشري: ~500-700 سعر/طبق. مصدر كارب كويس (أرز + مكرونة + عدس). زود العدس لبروتين أكتر! كلاسيك مصري مناسب للنباتيين.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['foul calories', 'ful calories', 'is foul healthy', 'foul protein', 'ful medames healthy'],
    keywordsAr: ['سعرات الفول', 'الفول صحي', 'بروتين الفول'],
    keywordsFranco: ['so3rat el fool', 'el fool se7y'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Ful Medames: ~230 cal/cup, 13g protein, 33g carbs, 8g fiber. Cheap, filling, and nutritious! Add eggs for a complete amino acid profile.', ar: 'فول مدمس: ~230 سعر/كوب، 13 جرام بروتين، 33 جرام كارب، 8 جرام ألياف. رخيص ومشبع ومغذي! ضيف بيض للبروتين الكامل.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['ta3meya calories', 'taameya calories', 'falafel healthy', 'falafel calories'],
    keywordsAr: ['سعرات الطعمية', 'الطعمية صحية'],
    keywordsFranco: ['so3rat el ta3meya', 'ta3meya se7ya'],
    stateId: 'NT_SEARCH',
    route: '/nutrition',
    response: { en: 'Taameya/Falafel: ~60 cal per piece (fried), ~40 if baked/air-fried. Made from fava beans — decent protein. Bake for a healthier option!', ar: 'طعمية: ~60 سعر للواحدة (مقلية)، ~40 لو مشوية/اير فراير. من الفول — بروتين معقول. اشويها لخيار أصح!' },
    priority: 9,
    domain: 'nutrition',
  },

  // ── Deep Nutrition Coverage (v11) ──────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['lunch ideas', 'what for lunch', 'lunch meal', 'lunch options'],
    keywordsAr: ['غدا ايه', 'اتغدى ايه', 'وجبة غدا'],
    keywordsFranco: ['ghadda eh', 'etghadda eh', 'lunch'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Lunch ideas:', ar: 'أفكار غدا:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['dinner ideas', 'what for dinner', 'dinner meal', 'dinner options', 'evening meal'],
    keywordsAr: ['عشا ايه', 'اتعشى ايه', 'وجبة عشا'],
    keywordsFranco: ['3asha eh', 'et3asha eh', 'dinner'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Dinner ideas:', ar: 'أفكار عشا:' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['food for energy', 'energy foods', 'need energy', 'feel weak', 'low energy food'],
    keywordsAr: ['أكل للطاقة', 'محتاج طاقة', 'حاسس بضعف'],
    keywordsFranco: ['akl lel ta2a', 'me7tag ta2a'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Energy-boosting foods: complex carbs (oats, sweet potato), bananas, dates, nuts. Need something quick or a full meal?', ar: 'أكل يزود الطاقة: كربوهيدرات معقدة (شوفان، بطاطا)، موز، بلح، مكسرات. محتاج حاجة سريعة ولا وجبة كاملة؟' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['bloated', 'bloating', 'gas', 'stomach issues', 'digestion', 'digestive problems'],
    keywordsAr: ['انتفاخ', 'غازات', 'هضم', 'معدتي'],
    keywordsFranco: ['ente5a5', 'ghazat', 'hadm', 'ma3dety'],
    stateId: 'NT_SUGGEST',
    response: { en: 'For bloating: avoid carbonated drinks, eat slowly, reduce dairy if intolerant, try ginger tea. High-fiber foods help long-term.', ar: 'للانتفاخ: تجنب المشروبات الغازية، كل ببطء، قلل الألبان لو عندك حساسية، جرب شاي الزنجبيل. الألياف بتساعد على المدى الطويل.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['high fiber', 'fiber foods', 'constipation', 'need fiber'],
    keywordsAr: ['ألياف', 'أكل فيه ألياف', 'امساك'],
    keywordsFranco: ['alyaf', 'emsak'],
    stateId: 'NT_SUGGEST',
    response: { en: 'High-fiber foods: oats, beans, lentils, broccoli, berries, whole grains, chia seeds. Aim for 25-35g/day.', ar: 'أكل فيه ألياف: شوفان، فول، عدس، بروكلي، توت، حبوب كاملة، بذور شيا. حاول 25-35 جرام يومياً.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['iron rich', 'iron foods', 'anemia', 'low iron'],
    keywordsAr: ['حديد', 'أكل فيه حديد', 'انيميا'],
    keywordsFranco: ['7adid', 'anemia'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Iron-rich foods: red meat, liver, spinach, lentils, eggs, dark chocolate. Pair with vitamin C for better absorption!', ar: 'أكل فيه حديد: لحمة حمرا، كبدة، سبانخ، عدس، بيض، شوكولاتة دارك. كل معاهم فيتامين سي للامتصاص!' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['calcium', 'calcium foods', 'bones', 'bone health'],
    keywordsAr: ['كالسيوم', 'أكل فيه كالسيوم', 'عظام'],
    keywordsFranco: ['calcium', '3edam'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Calcium-rich: milk, yogurt, cheese, sardines (with bones), broccoli, almonds, fortified foods.', ar: 'غني بالكالسيوم: لبن، زبادي، جبنة، سردين (بالعظم)، بروكلي، لوز، أكل مدعم.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['healthy fats', 'good fats', 'omega', 'fat sources'],
    keywordsAr: ['دهون صحية', 'دهون مفيدة', 'أوميجا'],
    keywordsFranco: ['do7oon se7ya', 'omega'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Healthy fats: avocado, olive oil, nuts, salmon, eggs, dark chocolate. 20-35% of daily calories should come from fat.', ar: 'دهون صحية: أفوكادو، زيت زيتون، مكسرات، سلمون، بيض، شوكولاتة دارك. 20-35% من سعراتك لازم من الدهون.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['complex carbs', 'good carbs', 'slow carbs', 'carb sources'],
    keywordsAr: ['كربوهيدرات معقدة', 'كارب مفيد', 'مصادر كارب'],
    keywordsFranco: ['carb mofid', 'complex carbs'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Best carb sources: oats, sweet potato, brown rice, quinoa, whole wheat bread, beans, lentils. These digest slowly and keep you full.', ar: 'أحسن مصادر كارب: شوفان، بطاطا حلوة، أرز بني، كينوا، عيش سن، فول، عدس. بتتهضم ببطء وبتشبعك.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['protein sources', 'where to get protein', 'protein foods list', 'best protein foods'],
    keywordsAr: ['مصادر بروتين', 'بروتين منين', 'أكل فيه بروتين'],
    keywordsFranco: ['masader protein', 'protein mnin'],
    stateId: 'NT_HIGH_PROTEIN',
    response: { en: 'Top protein sources: chicken (31g/100g), eggs (6g each), tuna (26g/can), Greek yogurt (10g/cup), lentils (9g/cup), cottage cheese (14g/cup).', ar: 'أفضل مصادر بروتين: فراخ (31جم/100جم)، بيض (6جم لكل واحدة)، تونة (26جم/علبة)، زبادي يوناني (10جم/كوب)، عدس (9جم/كوب)، جبنة قريش (14جم/كوب).' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['how to count macros', 'macro counting', 'track macros', 'count calories'],
    keywordsAr: ['ازاي احسب الماكرو', 'حساب الماكرو', 'ازاي اعد سعرات'],
    keywordsFranco: ['ezay a7seb el macros', '7esab el macros'],
    stateId: 'NT_CALC',
    response: { en: 'Quick macro guide: 1) Calculate TDEE 2) Set protein (2g/kg body weight) 3) Set fat (25% of cals) 4) Fill rest with carbs. Use our tracker to log!', ar: 'دليل سريع: 1) احسب TDEE 2) حدد بروتين (2جم/كيلو وزن) 3) حدد دهون (25% من السعرات) 4) الباقي كارب. استخدم التراكر بتاعنا!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['refeed', 'refeed day', 'carb refeed', 'high carb day', 'diet break'],
    keywordsAr: ['ريفيد', 'يوم كارب عالي', 'بريك دايت'],
    keywordsFranco: ['refeed', 'yom carb 3aly'],
    stateId: 'NT_PLAN_MENU',
    response: { en: 'Refeed days: eat at maintenance or slight surplus with high carbs (60%+). Helps leptin, mood, and gym performance. Usually 1-2x/week during a cut.', ar: 'أيام الريفيد: كل عند الصيانة أو فوقها شوية مع كارب عالي (60%+). بيساعد في اللبتين والمزاج والأداء. عادةً 1-2 مرة في الأسبوع وقت الكت.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['water weight', 'water retention', 'retaining water', 'puffy', 'weight fluctuation'],
    keywordsAr: ['مية زيادة', 'احتباس مية', 'وزني زاد فجأة'],
    keywordsFranco: ['mayya zeyada', 'e7tebas mayya'],
    stateId: 'PR_MENU',
    response: { en: 'Water weight fluctuates 1-3 kg daily. High sodium, carbs, stress, and menstrual cycle cause it. Don\'t panic — track weekly averages instead.', ar: 'وزن المية بيتغير 1-3 كيلو يومياً. الملح والكارب والضغط بيسببوا ده. متقلقش — تابع المتوسط الأسبوعي.' },
    priority: 7,
    domain: 'progress',
  },
  {
    keywords: ['meal timing', 'when to eat', 'eating window', 'nutrient timing'],
    keywordsAr: ['مواعيد الأكل', 'آكل امتى', 'نافذة الأكل'],
    keywordsFranco: ['mawa3id el akl', 'akol emta'],
    stateId: 'NT_PLAN_MENU',
    response: { en: 'Meal timing tips: 1) Pre-workout: carbs + protein 1-2h before 2) Post-workout: protein within 2h 3) Space meals 3-4h apart 4) Total daily intake matters most!', ar: 'نصايح مواعيد الأكل: 1) قبل التمرين: كارب + بروتين قبلها 1-2 ساعة 2) بعد التمرين: بروتين خلال ساعتين 3) فرق بين الوجبات 3-4 ساعات 4) المجموع اليومي أهم حاجة!' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['food allergy', 'lactose intolerant', 'gluten free', 'dairy free', 'allergies'],
    keywordsAr: ['حساسية أكل', 'حساسية لاكتوز', 'خالي من الجلوتين', 'حساسية'],
    keywordsFranco: ['7asaseya akl', 'lactose', 'gluten free'],
    stateId: 'NT_ALTERNATIVES',
    response: { en: 'I can help find alternatives! What are you allergic to or avoiding? Dairy-free, gluten-free, nut-free — we have options.', ar: 'أقدر أساعدك تلاقي بدائل! عندك حساسية من ايه؟ بدون ألبان، بدون جلوتين، بدون مكسرات — عندنا خيارات.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['vegan', 'vegetarian', 'plant based', 'no meat', 'vegan protein'],
    keywordsAr: ['نباتي', 'بدون لحوم', 'بروتين نباتي'],
    keywordsFranco: ['nabaty', 'vegan', 'plant based'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Plant-based protein sources: lentils (18g/cup), chickpeas (15g/cup), tofu (20g/cup), tempeh (31g/cup), quinoa (8g/cup), nuts, seeds. Combine for complete amino acids!', ar: 'مصادر بروتين نباتي: عدس (18جم/كوب)، حمص (15جم/كوب)، توفو (20جم/كوب)، كينوا (8جم/كوب)، مكسرات، بذور. نوع بينهم للأحماض الأمينية الكاملة!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['grocery list', 'shopping list', 'what to buy', 'supermarket', 'food to buy'],
    keywordsAr: ['قائمة مشتريات', 'اشتري ايه', 'السوبر ماركت', 'هشتري ايه'],
    keywordsFranco: ['2a2emet moshtaryat', 'eshtary eh', 'supermarket'],
    stateId: 'NT_PLAN_MENU',
    response: { en: 'Fitness grocery essentials: chicken breast, eggs, oats, rice, sweet potato, broccoli, bananas, nuts, Greek yogurt, olive oil. Want a detailed weekly list?', ar: 'أساسيات شراء الفتنس: صدور فراخ، بيض، شوفان، أرز، بطاطا حلوة، بروكلي، موز، مكسرات، زبادي يوناني، زيت زيتون. عايز قائمة أسبوعية مفصلة؟' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['eat out', 'eating out', 'restaurant', 'restaurant food', 'dining out'],
    keywordsAr: ['آكل برا', 'مطعم', 'أكل مطاعم', 'هآكل برا'],
    keywordsFranco: ['akol barra', 'mat3am', 'akl mata3em'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Eating out tips: Choose grilled over fried. Ask for sauce on the side. Skip the bread basket. Pick protein + veggies. Track your best estimate!', ar: 'نصايح الأكل برا: اختار مشوي مش مقلي. اطلب الصوص على جنب. سيب العيش. اختار بروتين + خضار. سجل أقرب تقدير!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ══════════════════════════════════════════════════════════
  // ── Deep Exercise Coverage (v11) ──────────────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['trx', 'trx exercises', 'suspension training', 'suspension exercises'],
    keywordsAr: ['تي ار اكس', 'تمارين تعليق'],
    keywordsFranco: ['trx', 'suspension'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=TRX',
    response: { en: 'TRX / Suspension exercises:', ar: 'تمارين الـ TRX:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['smith machine', 'smith exercises'],
    keywordsAr: ['سميث', 'مكنة سميث'],
    keywordsFranco: ['smith machine', 'smith'],
    stateId: 'WK_FIND_EQUIP',
    route: '/exercises?equipment=SMITH_MACHINE',
    response: { en: 'Smith machine exercises:', ar: 'تمارين مكنة السميث:' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['full body workout', 'total body', 'full body routine'],
    keywordsAr: ['تمرين كل الجسم', 'فل بودي'],
    keywordsFranco: ['full body', 'tamreen kol el gesm'],
    stateId: 'WK_CREATE',
    response: { en: "Full body workouts hit everything in one session — great for 3x/week schedules:", ar: 'تمارين الفل بودي بتشتغل على كل حاجة في جلسة واحدة — ممتازة لجداول 3 مرات في الأسبوع:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['upper body', 'upper body workout', 'upper day'],
    keywordsAr: ['جزء علوي', 'تمرين علوي', 'يوم علوي'],
    keywordsFranco: ['upper body', 'yom 3olwy'],
    stateId: 'WK_CREATE',
    response: { en: 'Upper body day: chest, back, shoulders, arms all in one session:', ar: 'يوم الجزء العلوي: صدر، ضهر، كتف، دراع في جلسة واحدة:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['lower body', 'lower body workout', 'lower day'],
    keywordsAr: ['جزء سفلي', 'تمرين سفلي', 'يوم سفلي'],
    keywordsFranco: ['lower body', 'yom sofly'],
    stateId: 'WK_CREATE',
    response: { en: 'Lower body day: quads, hamstrings, glutes, calves:', ar: 'يوم الجزء السفلي: أمامية، خلفية، جلوت، سمانة:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['muscle mind connection', 'mind muscle', 'feel the muscle', 'activation'],
    keywordsAr: ['الاحساس بالعضلة', 'مش حاسس بالعضلة', 'تفعيل العضلة'],
    keywordsFranco: ['el e7sas bel 3adala', 'msh 7ases bel 3adala'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Tips for mind-muscle connection: 1) Lighter weight, slower reps 2) Squeeze at peak contraction 3) Watch the muscle in mirror 4) Touch the muscle during sets.', ar: 'نصايح للإحساس بالعضلة: 1) وزن أخف، تكرارات أبطأ 2) اعصر عند القمة 3) اتفرج على العضلة في المرايا 4) امسك العضلة وأنت بتتمرن.' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['progressive overload', 'how to get stronger', 'increase weight', 'progress in gym'],
    keywordsAr: ['زيادة تدريجية', 'ازاي ازود الوزن', 'التقدم في الجيم'],
    keywordsFranco: ['progressive overload', 'ezay azawed el wazn'],
    stateId: 'WK_MENU',
    response: { en: 'Progressive overload methods: 1) Add weight (2.5kg) 2) Add reps 3) Add sets 4) Slow the tempo 5) Reduce rest time. Aim for small progress weekly!', ar: 'طرق الزيادة التدريجية: 1) زود وزن (2.5 كيلو) 2) زود تكرارات 3) زود سيتات 4) بطّء السرعة 5) قلل الراحة. استهدف تقدم صغير كل أسبوع!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['chest not growing', 'weak chest', 'chest lagging', 'flat chest'],
    keywordsAr: ['صدري مش بيكبر', 'صدري ضعيف'],
    keywordsFranco: ['sadry msh byekbar', 'sadry da3if'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=CHEST',
    response: { en: 'Chest growth tips: 1) Focus on stretch at bottom 2) Try incline dumbbell press 3) Cable flies for constant tension 4) Slow eccentric (3-sec negative)', ar: 'نصايح لنمو الصدر: 1) ركز على الاستطالة في الأسفل 2) جرب انكلاين دمبل 3) كابل فلاي للضغط المستمر 4) تكرار بطيء (3 ثوان نزول)' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['back not growing', 'weak back', 'back lagging', 'narrow back', 'wider back', 'v taper'],
    keywordsAr: ['ضهري مش بيكبر', 'ضهري ضعيف', 'عايز ضهر عريض'],
    keywordsFranco: ['dahry msh byekbar', 'dahry da3if', '3ayez dahr 3arid'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BACK',
    response: { en: 'Back width: lat pulldowns, pull-ups, wide rows. Back thickness: barbell rows, T-bar rows, deadlifts. Focus on pulling with elbows, not hands!', ar: 'عرض الضهر: لات بولداون، عقلة، تجديف واسع. سُمك الضهر: باربل رو، T-بار رو، ديدلفت. ركز على الشد بالكوع مش الإيد!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['arms not growing', 'weak arms', 'bigger arms', 'arm size', 'grow arms'],
    keywordsAr: ['دراعي مش بيكبر', 'دراعي ضعيف', 'عايز دراع كبير'],
    keywordsFranco: ['dra3y msh byekbar', '3ayez dra3 kbir'],
    stateId: 'WK_FIND_MUSCLE',
    route: '/exercises?muscle=BICEPS',
    response: { en: 'Arm growth: triceps are 2/3 of arm size! Hit both: heavy compounds (close-grip bench, dips) + isolation (curls, pushdowns). Train arms 2-3x/week.', ar: 'نمو الدراع: التراي ⅔ من حجم الدراع! اشتغل على الاتنين: مركبات ثقيلة (بنش ضيق، ديبس) + عزل (كيرل، بوشداون). مرن الدراع 2-3 مرات في الأسبوع.' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['shoulder pain', 'shoulder hurts', 'rotator cuff', 'shoulder injury'],
    keywordsAr: ['كتفي بيوجعني', 'ألم كتف', 'إصابة كتف'],
    keywordsFranco: ['ketfy byewga3ny', 'alam ketf'],
    stateId: 'WK_SKIP_INJURY',
    response: { en: 'Shoulder pain: 1) Skip overhead pressing temporarily 2) Do band pull-aparts & face pulls daily 3) Strengthen rotator cuff 4) See a physiotherapist if persistent.', ar: 'وجع الكتف: 1) سيب الأوفرهيد مؤقتاً 2) اعمل باند بول أبارت وفيس بول يومياً 3) قوّي الروتيتور كف 4) روح لعلاج طبيعي لو مستمر.' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['knee pain', 'knee hurts', 'knee injury', 'bad knees'],
    keywordsAr: ['ركبتي بتوجعني', 'ألم ركبة'],
    keywordsFranco: ['rokbety betwga3ny', 'alam rokba'],
    stateId: 'WK_SKIP_INJURY',
    response: { en: 'Knee pain: 1) Skip deep squats temporarily 2) Do leg press with limited range 3) Strengthen VMO (terminal knee extensions) 4) See a physio if it persists.', ar: 'وجع الركبة: 1) سيب السكوات العميق مؤقتاً 2) ليج بريس بمدى محدود 3) قوّي العضلة فوق الركبة 4) روح لعلاج طبيعي لو مستمر.' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['lower back pain', 'back pain', 'back hurts', 'spine'],
    keywordsAr: ['ضهري بيوجعني', 'ألم في الضهر', 'أسفل الضهر'],
    keywordsFranco: ['dahry byewga3ny', 'alam fel dahr'],
    stateId: 'WK_SKIP_INJURY',
    response: { en: 'Lower back pain: 1) Stop deadlifts/squats temporarily 2) Do cat-cow, bird-dog, dead bugs daily 3) Strengthen core 4) Check your bracing technique. See a doctor if severe.', ar: 'وجع أسفل الضهر: 1) وقف ديدلفت/سكوات مؤقتاً 2) اعمل كات-كاو، بيرد-دوج، ديد باجز يومياً 3) قوّي الكور 4) شيك على البريسينج بتاعك. روح لدكتور لو شديد.' },
    priority: 9,
    domain: 'workout',
  },
  {
    keywords: ['how to warm up for', 'warmup for', 'warm up before squat', 'warm up before deadlift', 'warm up before bench'],
    keywordsAr: ['تسخين قبل', 'ازاي اسخن'],
    keywordsFranco: ['tas5in 2abl', 'ezay asa5an'],
    stateId: 'WK_PRE',
    response: { en: 'Warm-up protocol: 5 min light cardio → dynamic stretches → 2-3 warm-up sets (50%, 70%, 85% of working weight). Never skip warm-ups!', ar: 'بروتوكول التسخين: 5 دقايق كارديو خفيف → استطالة ديناميكية → 2-3 سيتات تسخين (50%، 70%، 85% من وزن التمرين). متفوتش التسخين أبداً!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['train fasted', 'fasted workout', 'workout empty stomach', 'train hungry'],
    keywordsAr: ['اتمرن صايم', 'تمرين وأنا صايم', 'اتمرن على معدة فاضية'],
    keywordsFranco: ['at2amen sayem', 'tamreen wa ana sayem'],
    stateId: 'NT_PRE_WORKOUT',
    response: { en: 'Fasted training is fine for light cardio but not ideal for heavy lifting. If you must, have BCAAs or a small protein shake. Better: eat a small meal 1h before.', ar: 'التمرين صايم ماشي للكارديو الخفيف بس مش مثالي للأوزان. لو لازم، خد BCAAs أو شيك بروتين صغير. أحسن: كل وجبة صغيرة قبلها بساعة.' },
    priority: 8,
    domain: 'nutrition',
  },

  // ══════════════════════════════════════════════════════════
  // ── Smart Calorie & Meal Estimation (v15) ───────────────────
  // ══════════════════════════════════════════════════════════
  {
    keywords: ['how many calories do i need', 'my calorie needs', 'daily calories', 'tdee calculator', 'what is my tdee'],
    keywordsAr: ['محتاج كام سعرة', 'سعراتي اليومية', 'حساب TDEE'],
    keywordsFranco: ['me7tag kam so3ra', 'so3raty el yomya'],
    stateId: 'NT_CALC',
    response: { en: 'Quick estimate: bodyweight (kg) × 28-33 for maintenance. × 24-26 for cutting, × 34-37 for bulking. Example: 80kg × 30 = 2400 cal/day maintenance. Let me calculate yours exactly:', ar: 'تقدير سريع: الوزن (كيلو) × 28-33 للصيانة. × 24-26 للتنشيف، × 34-37 للتضخيم. مثال: 80 كيلو × 30 = 2400 سعر/يوم صيانة. خليني أحسبلك بالظبط:' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['1500 calorie', '1500 cal meal plan', '1500 plan'],
    keywordsAr: ['خطة 1500 سعر'],
    stateId: 'NT_PLAN_MENU',
    response: { en: '1500 cal/day plan: Breakfast ~400 (eggs + toast + fruit), Lunch ~500 (chicken + rice + salad), Dinner ~400 (fish + sweet potato), Snack ~200 (yogurt + nuts).', ar: 'خطة 1500 سعر/يوم: فطار ~400 (بيض + توست + فاكهة)، غدا ~500 (فراخ + أرز + سلطة)، عشا ~400 (سمك + بطاطا حلوة)، سناك ~200 (زبادي + مكسرات).' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['2000 calorie', '2000 cal meal plan', '2000 plan'],
    keywordsAr: ['خطة 2000 سعر'],
    stateId: 'NT_PLAN_MENU',
    response: { en: '2000 cal/day plan: Breakfast ~500 (oats + protein + banana), Lunch ~650 (chicken breast + rice + veggies), Dinner ~550 (salmon + sweet potato + salad), Snacks ~300 (protein bar + fruit).', ar: 'خطة 2000 سعر/يوم: فطار ~500 (شوفان + بروتين + موز)، غدا ~650 (صدور فراخ + أرز + خضار)، عشا ~550 (سلمون + بطاطا + سلطة)، سناكات ~300 (بروتين بار + فاكهة).' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['2500 calorie', '2500 cal meal plan', '2500 plan', '3000 calorie', '3000 cal'],
    keywordsAr: ['خطة 2500 سعر', 'خطة 3000 سعر'],
    stateId: 'NT_PLAN_MENU',
    response: { en: '2500-3000 cal/day (bulking): 5-6 meals. Add: extra rice, oats, peanut butter, whole milk, olive oil drizzle. Protein at every meal (40g+). High-cal Egyptian: koshari + eggs, foul + tahini.', ar: '2500-3000 سعر/يوم (تضخيم): 5-6 وجبات. زود: أرز زيادة، شوفان، زبدة فول سوداني، لبن كامل الدسم، زيت زيتون. بروتين كل وجبة (40 جرام+). مصري عالي السعرات: كشري + بيض، فول + طحينة.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['egyptian meal plan', 'egyptian diet plan', 'cheap meal plan egypt', 'budget egyptian diet'],
    keywordsAr: ['خطة أكل مصري', 'دايت مصري', 'أكل مصري صحي رخيص'],
    keywordsFranco: ['5etat akl masry', 'diet masry'],
    stateId: 'NT_PLAN_MENU',
    response: { en: 'Budget Egyptian meal plan (~50 LE/day): Breakfast: foul + eggs + bread. Lunch: chicken + rice + salad. Dinner: lentil soup + bread. Snacks: banana, yogurt. ~2000 cal, 120g protein.', ar: 'خطة أكل مصري رخيصة (~50 جنيه/يوم): فطار: فول + بيض + عيش. غدا: فراخ + أرز + سلطة. عشا: شوربة عدس + عيش. سناكات: موز، زبادي. ~2000 سعر، 120 جرام بروتين.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['supplement timing', 'when to take supplements', 'supplement schedule'],
    keywordsAr: ['مواعيد المكملات', 'اخد المكملات امتى'],
    keywordsFranco: ['mawa3id el mokamelat', 'a5od el mokamelat emta'],
    stateId: 'SP_MENU',
    response: { en: 'Supplement timing: Morning: vitamin D + omega-3 (with food). Pre-workout: caffeine (30min before). Post-workout: whey protein (within 2h). Anytime: creatine (5g), magnesium (before bed).', ar: 'مواعيد المكملات: الصبح: فيتامين دي + أوميجا 3 (مع الأكل). قبل التمرين: كافيين (قبل بنص ساعة). بعد التمرين: واي بروتين (خلال ساعتين). أي وقت: كرياتين (5 جرام)، ماغنسيوم (قبل النوم).' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['what split should i do', 'best split for me', 'choose a split', 'which split', 'workout split recommendation'],
    keywordsAr: ['اعمل ايه سبليت', 'احسن سبليت ليا', 'اختار سبليت'],
    keywordsFranco: ['a3mel eh split', 'a7san split leya'],
    stateId: 'PG_MENU',
    response: { en: 'Split recommendations by experience: Beginner (0-1yr): Full Body 3x/week. Intermediate (1-3yr): Upper/Lower 4x or PPL 3x. Advanced (3+yr): PPL 6x or Arnold Split. More days ≠ more gains — recovery matters!', ar: 'سبليت حسب الخبرة: مبتدئ (0-1 سنة): فل بودي 3 مرات. متوسط (1-3 سنين): Upper/Lower 4 مرات أو PPL 3 مرات. متقدم (3+ سنين): PPL 6 مرات أو أرنولد سبليت. أيام أكتر ≠ نتايج أكتر — الريكفري مهم!' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['3 day split', '3 day workout', 'three day', '3x week', 'three times a week'],
    keywordsAr: ['3 أيام في الاسبوع', 'تلات أيام'],
    keywordsFranco: ['3 ayam', 'talat ayam'],
    stateId: 'PG_MENU',
    response: { en: '3-day options: A) Full Body 3x B) Push/Pull/Legs C) Upper/Lower/Full. Full body 3x is best for beginners — hits each muscle 3x/week!', ar: 'خيارات 3 أيام: أ) فل بودي 3 مرات ب) Push/Pull/Legs ج) Upper/Lower/Full. فل بودي 3 مرات أحسن حاجة للمبتدئين — كل عضلة 3 مرات في الأسبوع!' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['4 day split', '4 day workout', 'four day', '4x week', 'four times a week'],
    keywordsAr: ['4 أيام في الاسبوع', 'اربع أيام'],
    keywordsFranco: ['4 ayam', 'arba3 ayam'],
    stateId: 'PG_MENU',
    response: { en: '4-day options: A) Upper/Lower/Upper/Lower (most popular) B) Push/Pull/Upper/Lower C) Chest+Tri/Back+Bi/Legs/Shoulders. ULUL hits each muscle 2x/week — optimal for growth!', ar: 'خيارات 4 أيام: أ) Upper/Lower/Upper/Lower (الأشهر) ب) Push/Pull/Upper/Lower ج) صدر+تراي/ضهر+باي/رجل/كتف. ULUL بتشتغل على كل عضلة مرتين — مثالي للنمو!' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['5 day split', '5 day workout', 'five day', '5x week', 'bro split'],
    keywordsAr: ['5 أيام في الاسبوع', 'خمس أيام', 'برو سبليت'],
    keywordsFranco: ['5 ayam', '5ams ayam', 'bro split'],
    stateId: 'PG_MENU',
    response: { en: '5-day options: A) PPL + Upper + Lower B) Chest/Back/Shoulders/Arms/Legs (bro split) C) PHAT (power + hypertrophy). PPL+UL gives best frequency; bro split gives max volume per muscle.', ar: 'خيارات 5 أيام: أ) PPL + Upper + Lower ب) صدر/ضهر/كتف/دراع/رجل (برو سبليت) ج) PHAT (قوة + تضخيم). PPL+UL أحسن تردد؛ برو سبليت أكتر حجم لكل عضلة.' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['women workout', 'female workout', 'women exercises', 'girl gym', 'female gym plan'],
    keywordsAr: ['تمارين بنات', 'تمارين للستات', 'تمرين للبنات'],
    keywordsFranco: ['tamarin banat', 'tamarin lel setat'],
    stateId: 'PG_MENU',
    response: { en: 'Women benefit from the SAME exercises as men! Focus on: hip thrusts, squats, deadlifts, rows, overhead press. Women can train the same muscles 3-4x/week. Strength training builds shape, not bulk!', ar: 'البنات بيستفيدوا من نفس التمارين! ركزي على: هيب ثراست، سكوات، ديدلفت، رو، أوفرهيد بريس. تقدري تتمرني نفس العضلات 3-4 مرات في الأسبوع. تمارين القوة بتبني شكل، مش حجم!' },
    priority: 8,
    domain: 'programs',
  },
  {
    keywords: ['home workout plan', 'no gym', 'workout without gym', 'train at home', 'home program'],
    keywordsAr: ['برنامج بيت', 'بدون جيم', 'تمرين في البيت'],
    keywordsFranco: ['barnameg beit', 'men ghir gym', 'tamreen fe el beit'],
    stateId: 'PG_MENU',
    response: { en: 'Home plan: Push-ups, squats, lunges, planks, dips (chair), rows (backpack with books). 3x/week, 3 sets × 15-20 reps. Add resistance bands for next level!', ar: 'خطة البيت: بوش اب، سكوات، لانجز، بلانك، ديبس (كرسي)، رو (شنطة كتب). 3 مرات/أسبوع، 3 سيتات × 15-20 تكرار. ضيف باندات مقاومة للمستوى اللي بعده!' },
    priority: 8,
    domain: 'programs',
  },

  // ── v16: Recovery Intelligence ──────────────────────────────
  {
    keywords: ['recovery tips', 'how to recover', 'recovery after workout', 'muscle recovery', 'post workout recovery', 'speed up recovery'],
    keywordsAr: ['نصائح ريكفري', 'ازاي اتعافي', 'ريكفري بعد التمرين', 'تعافي العضلات'],
    keywordsFranco: ['nasa2e7 recovery', 'ezay at3afy', 'recovery ba3d el tamreen'],
    stateId: 'RC_MENU',
    response: { en: 'Top recovery tips: 1) Sleep 7-9 hours 2) Eat protein within 2hrs post-workout 3) Stay hydrated (3-4L/day) 4) Active recovery (light walk/stretching) 5) Foam rolling 10min 6) Manage stress. Recovery is where gains happen!', ar: 'أهم نصائح الريكفري: 1) نوم 7-9 ساعات 2) بروتين خلال ساعتين بعد التمرين 3) ميه كتير (3-4 لتر/يوم) 4) ريكفري نشط (مشي خفيف/استرتش) 5) فوم رولر 10 دقايق 6) قلل التوتر. الريكفري هو اللي بيبني العضلات!' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['doms', 'sore muscles', 'muscle soreness', 'body ache', 'still sore', 'cant move', 'hurting after workout'],
    keywordsAr: ['عضلاتي بتوجعني', 'تيبس', 'وجع العضلات', 'مش قادر اتحرك', 'جسمي بيوجعني'],
    keywordsFranco: ['3adalaty betoga3ny', 'tebs', 'waga3 el 3adalat', 'gesmy beyoga3ny'],
    stateId: 'RC_MENU',
    response: { en: 'DOMS (Delayed Onset Muscle Soreness) is normal 24-72hrs post-workout! Tips: 1) Light movement (walk, swim) 2) Foam rolling 3) Warm bath/Epsom salt 4) Protein + anti-inflammatory foods (ginger, turmeric) 5) Gentle stretching. DON\'T skip the next workout — moving helps!', ar: 'وجع العضلات بعد التمرين (DOMS) طبيعي 24-72 ساعة! نصائح: 1) حركة خفيفة (مشي، سباحة) 2) فوم رولر 3) حمام دافي/ملح إبسوم 4) بروتين + أكل مضاد للالتهابات (زنجبيل، كركم) 5) استرتش خفيف. متفوتش التمرين الجاي — الحركة بتساعد!' },
    priority: 9,
    domain: 'recovery',
  },
  {
    keywords: ['rest day', 'day off', 'off day', 'should i rest', 'take a break', 'need rest'],
    keywordsAr: ['يوم راحة', 'راحة', 'لازم اريح', 'محتاج بريك'],
    keywordsFranco: ['yom ra7a', 'ra7a', 'lazem are7', 'me7tag break'],
    stateId: 'RC_MENU',
    response: { en: 'Rest days are essential! On rest days: 1) Light walking (20-30min) 2) Stretching/mobility 3) Foam rolling 4) Extra protein + sleep 5) Meal prep for the week. Rest ≠ lazy. Rest = grow!', ar: 'أيام الراحة مهمة جداً! في يوم الراحة: 1) مشي خفيف (20-30 دقيقة) 2) استرتش/موبيليتي 3) فوم رولر 4) بروتين زيادة + نوم 5) حضر أكل الأسبوع. الراحة مش كسل. الراحة = نمو!' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['overtraining', 'overtrained', 'training too much', 'too many workouts', 'burned out', 'burnout gym'],
    keywordsAr: ['تمرين زيادة', 'بتمرن كتير', 'مرهق من التمرين', 'احتراق'],
    keywordsFranco: ['tamreen zyada', 'batamren ketir', 'morha2 men el tamreen'],
    stateId: 'RC_MENU',
    response: { en: 'Overtraining signs: constant fatigue, strength loss, poor sleep, mood swings, frequent illness. Fix: 1) Take a deload week (50% volume) 2) Sleep 8+ hours 3) Eat at maintenance calories 4) Reduce training to 3-4 days 5) Add yoga/stretching. Listen to your body!', ar: 'علامات الأوفرتريننج: إرهاق مستمر، فقدان قوة، نوم وحش، تقلب مزاج، مرض كتير. الحل: 1) أسبوع ديلود (نص الحمل) 2) نوم 8+ ساعات 3) أكل كالوريز صيانة 4) قلل ل3-4 أيام 5) زود يوجا/استرتش. اسمع جسمك!' },
    priority: 9,
    domain: 'recovery',
  },
  {
    keywords: ['deload', 'deload week', 'what is deload', 'when to deload', 'lighten the load'],
    keywordsAr: ['ديلود', 'اسبوع ديلود', 'ايه الديلود', 'امتى ادلود'],
    keywordsFranco: ['deload', 'osboo3 deload', 'eh el deload', 'emta a-deload'],
    stateId: 'RC_MENU',
    response: { en: 'Deload = planned light week every 4-8 weeks. Reduce weight by 40-50% but keep same exercises. Purpose: joints recover, CNS resets, come back stronger. You don\'t lose gains — you unlock them!', ar: 'ديلود = أسبوع خفيف مخطط كل 4-8 أسابيع. خفف الأوزان 40-50% بس نفس التمارين. الهدف: المفاصل تتعافى، الجهاز العصبي يرتاح، ترجع أقوى. مش هتخسر مكاسب — هتفتحها!' },
    priority: 8,
    domain: 'recovery',
  },
  {
    keywords: ['foam roller', 'foam rolling', 'how to foam roll', 'myofascial release', 'self massage'],
    keywordsAr: ['فوم رولر', 'تدليك عضلات', 'مساج ذاتي'],
    keywordsFranco: ['foam roller', 'tadlik 3adalat', 'massage zaty'],
    stateId: 'RC_MENU',
    response: { en: 'Foam rolling guide: 1) Roll slowly (1 inch/sec) 2) Pause on tender spots 30-60sec 3) Don\'t roll directly on joints or spine 4) Do it before workout (activate) and after (recover) 5) Key areas: quads, IT band, glutes, lats, upper back. 10min daily = game changer!', ar: 'دليل الفوم رولر: 1) لف ببطء 2) وقف على الأماكن المؤلمة 30-60 ثانية 3) متلفش على المفاصل أو العمود الفقري 4) قبل التمرين (تنشيط) وبعده (ريكفري) 5) أماكن مهمة: كواد، IT band، مؤخرة، لاتس، أعلى الضهر. 10 دقايق يومياً = فرق كبير!' },
    priority: 7,
    domain: 'recovery',
  },
  {
    keywords: ['ice bath', 'cold shower', 'cold therapy', 'cold plunge', 'cold water'],
    keywordsAr: ['حمام تلج', 'دش بارد', 'علاج البرد', 'ميه ساقعة'],
    keywordsFranco: ['7amam talg', 'dosh bared', '3elag el bard', 'maya sa23a'],
    stateId: 'RC_MENU',
    response: { en: 'Cold therapy: cold showers (2-5min) reduce inflammation and improve recovery. Ice baths (10-15min at 10-15°C) are more intense. Start with cold showers and work up. Best after hard training, NOT before (can reduce gains if done pre-workout).', ar: 'العلاج بالبرد: دش بارد (2-5 دقايق) بيقلل الالتهابات وبيحسن الريكفري. حمام تلج (10-15 دقيقة عند 10-15°م) أقوى. ابدأ بالدش البارد. أحسن بعد التمرين الصعب، مش قبله (ممكن يقلل المكاسب لو قبل).' },
    priority: 7,
    domain: 'recovery',
  },
  {
    keywords: ['sauna', 'steam room', 'heat therapy', 'hot bath'],
    keywordsAr: ['ساونا', 'غرفة بخار', 'حمام ساخن'],
    keywordsFranco: ['sauna', 'ghorfa bo5ar', '7amam so5n'],
    stateId: 'RC_MENU',
    response: { en: 'Sauna benefits: improves blood flow, reduces DOMS, helps relaxation, may boost growth hormone. Use 15-20min at 80-100°C, 2-3x/week. Hydrate well before and after! Pair with cold shower for contrast therapy.', ar: 'فوايد الساونا: بتحسن الدورة الدموية، بتقلل وجع العضلات، بتساعد على الاسترخاء. 15-20 دقيقة عند 80-100°م، 2-3 مرات/أسبوع. اشرب ميه كتير قبل وبعد! جربها مع دش بارد (contrast therapy).' },
    priority: 7,
    domain: 'recovery',
  },

  // ── v16: Sleep Intelligence ─────────────────────────────────
  {
    keywords: ['sleep tips', 'how to sleep better', 'improve sleep', 'sleep quality', 'cant sleep', 'insomnia', 'trouble sleeping', 'sleep for gains'],
    keywordsAr: ['نصائح نوم', 'ازاي انام كويس', 'تحسين النوم', 'مش بنام', 'أرق', 'مش قادر انام'],
    keywordsFranco: ['nasa2e7 noom', 'ezay anam kwais', 'ta7sin el noom', 'msh banam', 'ara2'],
    stateId: 'HL_MENU',
    response: { en: 'Sleep is the #1 recovery tool! Tips: 1) Same bedtime daily (even weekends) 2) Room dark + cool (18-20°C) 3) No screens 1hr before bed 4) No caffeine after 2pm 5) Magnesium glycinate before bed 6) No heavy meals 2hrs before sleep 7) 7-9 hours minimum. Poor sleep = poor gains!', ar: 'النوم هو أهم أداة ريكفري! نصائح: 1) نفس ميعاد النوم يومياً 2) الأوضة ضلمة + باردة (18-20°م) 3) بلاش شاشات ساعة قبل النوم 4) بلاش كافيين بعد 2 الضهر 5) ماغنيسيوم جلايسينات قبل النوم 6) بلاش أكل تقيل ساعتين قبل النوم 7) 7-9 ساعات minimum. نوم وحش = مكاسب وحشة!' },
    priority: 9,
    domain: 'health',
  },
  {
    keywords: ['how many hours sleep', 'sleep duration', 'how much sleep', 'enough sleep', 'minimum sleep'],
    keywordsAr: ['كام ساعة نوم', 'مدة النوم', 'نوم كام ساعة'],
    keywordsFranco: ['kam sa3a noom', 'modet el noom', 'noom kam sa3a'],
    stateId: 'HL_MENU',
    response: { en: 'For muscle growth: 7-9 hours. Studies show <6hrs sleep = 60% less muscle protein synthesis and higher cortisol. Athletes need 8-10hrs. Your muscles literally grow while you sleep!', ar: 'لنمو العضلات: 7-9 ساعات. الدراسات بتقول أقل من 6 ساعات = 60% أقل بناء عضلات وكورتيزول أعلى. الرياضيين محتاجين 8-10 ساعات. عضلاتك حرفياً بتكبر وانت نايم!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['nap', 'power nap', 'afternoon nap', 'should i nap', 'napping benefits'],
    keywordsAr: ['قيلولة', 'نوم الضهر', 'باور ناب'],
    keywordsFranco: ['2ayloola', 'noom el dohr', 'power nap'],
    stateId: 'HL_MENU',
    response: { en: 'Power naps are great! 20-30min max (longer = groggy). Best time: 1-3pm. Benefits: improved alertness, better workout performance, enhanced recovery. Set an alarm! Don\'t nap after 4pm or it hurts nighttime sleep.', ar: 'القيلولة ممتازة! 20-30 دقيقة ماكس (أكتر = تيبس). أحسن وقت: 1-3 العصر. فوايد: يقظة أحسن، أداء تمرين أفضل، ريكفري أحسن. حط منبه! متنامش بعد 4 العصر عشان متأثرش على نوم الليل.' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['melatonin', 'sleep supplement', 'sleep aid', 'zma', 'magnesium for sleep'],
    keywordsAr: ['ميلاتونين', 'مكمل نوم', 'ماغنيسيوم للنوم'],
    keywordsFranco: ['melatonin', 'mokamel noom', 'magnesium lel noom'],
    stateId: 'SP_MENU',
    response: { en: 'Sleep supplements: 1) Magnesium Glycinate (400mg) — relaxes muscles, best overall 2) Melatonin (0.5-3mg) — resets clock, don\'t use daily 3) ZMA (Zinc+Mag+B6) — popular combo 4) L-Theanine (200mg) — calming without drowsiness. Start with magnesium, it\'s safest.', ar: 'مكملات النوم: 1) ماغنيسيوم جلايسينات (400مج) — بيريح العضلات، أفضل اختيار 2) ميلاتونين (0.5-3مج) — بيظبط الساعة البيولوجية، متستخدمهوش يومياً 3) ZMA (زنك+ماغنيسيوم+B6) 4) L-Theanine (200مج) — هدوء من غير نعاس. ابدأ بالماغنيسيوم، أأمن حاجة.' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['sleep and muscle', 'sleep affects gains', 'sleep for bodybuilding', 'growth hormone sleep'],
    keywordsAr: ['النوم والعضلات', 'النوم بيأثر على المكاسب', 'هرمون النمو والنوم'],
    keywordsFranco: ['el noom wel 3adalat', 'el noom bye2aser 3ala el gains', 'hormon el nomo wel noom'],
    stateId: 'HL_MENU',
    response: { en: 'Sleep-muscle connection: 70% of growth hormone released during deep sleep. Poor sleep → higher cortisol → muscle breakdown. Sleep debt accumulates — you can\'t "make up" lost sleep. Prioritize sleep like you prioritize training!', ar: 'علاقة النوم بالعضلات: 70% من هرمون النمو بيتفرز في النوم العميق. نوم وحش → كورتيزول أعلى → تكسير عضلات. ديون النوم بتتراكم — مش هتعوض نوم فات. أهتم بالنوم زي ما بتهتم بالتمرين!' },
    priority: 8,
    domain: 'health',
  },

  // ── v16: Hydration Intelligence ─────────────────────────────
  {
    keywords: ['how much water', 'water intake', 'daily water', 'hydration', 'stay hydrated', 'water for gym', 'dehydrated'],
    keywordsAr: ['كام لتر ميه', 'كمية الميه', 'ميه يومياً', 'الترطيب', 'مش بشرب ميه كفاية', 'عطشان'],
    keywordsFranco: ['kam letr maya', 'kamyet el maya', 'maya yomyan', 'el tartib', 'msh bashrab maya kefaya'],
    stateId: 'HL_MENU',
    response: { en: 'Water guide: Base = 35ml per kg bodyweight. Training days add 500-1000ml. Hot weather add 500ml. Signs of dehydration: dark urine, headache, fatigue, low strength. Aim for 3-4L/day if you train. Your urine should be pale yellow!', ar: 'دليل الميه: الأساس = 35 مل × وزنك بالكيلو. أيام التمرين زود 500-1000 مل. حر زود 500 مل. علامات الجفاف: بول غامق، صداع، إرهاق، ضعف. استهدف 3-4 لتر/يوم لو بتتمرن. البول لازم يبقى أصفر فاتح!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['water during workout', 'drink during exercise', 'how much water gym', 'sip water training'],
    keywordsAr: ['ميه أثناء التمرين', 'اشرب ميه في الجيم', 'كام ميه في التمرين'],
    keywordsFranco: ['maya asna2 el tamreen', 'ashrab maya fe el gym', 'kam maya fe el tamreen'],
    stateId: 'HL_MENU',
    response: { en: 'During workout: sip 200-300ml every 15-20min. Don\'t chug — it causes bloating. For sessions >60min, add electrolytes (pinch of salt + lemon). Pre-workout: drink 500ml 30min before. Post: drink 500ml within 30min after.', ar: 'أثناء التمرين: اشرب 200-300 مل كل 15-20 دقيقة. متشربش كتير مرة واحدة — بتنفخ. لو التمرين أكتر من ساعة، ضيف إلكتروليتس (رشة ملح + ليمون). قبل: 500 مل قبل بنص ساعة. بعد: 500 مل خلال نص ساعة.' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['electrolytes', 'electrolyte drink', 'salt water', 'sodium potassium', 'mineral water'],
    keywordsAr: ['إلكتروليتس', 'أملاح معدنية', 'ملح وميه', 'صوديوم بوتاسيوم'],
    keywordsFranco: ['electrolytes', 'amla7 ma3daneya', 'mel7 we maya', 'sodium potassium'],
    stateId: 'HL_MENU',
    response: { en: 'Electrolytes matter for performance! DIY: 1L water + 1/4 tsp salt + juice of 1 lemon + honey. Or buy: Hydralyte, LMNT, Gatorade (watch sugar). Key minerals: sodium, potassium, magnesium. You lose them in sweat — replace them!', ar: 'الإلكتروليتس مهمة للأداء! اصنعها: 1 لتر ميه + ربع معلقة ملح + عصير ليمونة + عسل. أو اشتري: Hydralyte, LMNT, Gatorade (بس خلي بالك من السكر). المعادن المهمة: صوديوم، بوتاسيوم، ماغنيسيوم. بتخسرهم في العرق — عوضهم!' },
    priority: 7,
    domain: 'health',
  },

  // ── v16: Stress & Mental Health ─────────────────────────────
  {
    keywords: ['stress management', 'reduce stress', 'too stressed', 'cortisol', 'stress and gains', 'anxious gym'],
    keywordsAr: ['إدارة التوتر', 'قلل التوتر', 'متوتر', 'كورتيزول', 'قلقان'],
    keywordsFranco: ['edaret el tawator', '2alel el tawator', 'metwter', 'cortisol', '2al2an'],
    stateId: 'HL_MENU',
    response: { en: 'Stress kills gains! High cortisol → muscle breakdown + fat storage. Manage it: 1) Exercise (best stress relief!) 2) Deep breathing (4-7-8 pattern) 3) Walk in nature 20min 4) Sleep 7-9hrs 5) Limit caffeine after noon 6) Talk to someone. Gym IS therapy!', ar: 'التوتر بيقتل المكاسب! كورتيزول عالي → تكسير عضلات + تخزين دهون. الحل: 1) تمرين (أحسن علاج توتر!) 2) تنفس عميق (4-7-8) 3) مشي في الطبيعة 20 دقيقة 4) نوم 7-9 ساعات 5) قلل كافيين بعد الضهر 6) اتكلم مع حد. الجيم هو العلاج!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['motivation', 'lost motivation', 'not motivated', 'dont feel like working out', 'lazy', 'cant be bothered'],
    keywordsAr: ['تحفيز', 'فقدت الحافز', 'مش متحفز', 'مش عايز اتمرن', 'كسلان'],
    keywordsFranco: ['ta7fiz', 'fa2adt el 7afez', 'msh met7afez', 'msh 3ayez atamren', 'kaslan'],
    stateId: 'WK_MENU',
    response: { en: 'Motivation is temporary — discipline is forever! Tips: 1) Just show up (even 20min counts) 2) Track progress (photos, weights) 3) Find a training partner 4) Remember WHY you started 5) Change your routine every 6-8 weeks 6) Reward yourself. "The best workout is the one you didn\'t want to do."', ar: 'التحفيز مؤقت — الانضباط للأبد! نصائح: 1) بس روح (حتى 20 دقيقة بتفرق) 2) تابع تقدمك (صور، أوزان) 3) دور على partner 4) افتكر ليه بدأت 5) غير روتينك كل 6-8 أسابيع 6) كافئ نفسك. "أحسن تمرين هو اللي مكنتش عايز تعمله."' },
    priority: 7,
    domain: 'workout',
  },

  // ── v16: Injury Prevention & Management ─────────────────────
  {
    keywords: ['pulled muscle', 'muscle strain', 'muscle tear', 'tweaked', 'something popped'],
    keywordsAr: ['شد عضلي', 'تمزق عضلي', 'حاجة طقت', 'عضلة اتشدت'],
    keywordsFranco: ['shad 3adaly', 'tamazok 3adaly', '7aga to2et', '3adala etshadt'],
    stateId: 'RC_MENU',
    response: { en: 'RICE protocol: Rest, Ice (15min on/off), Compression, Elevation. First 48hrs: no heat, no stretching the injured area. Mild strain: back in 1-2 weeks. Moderate: 3-6 weeks. If pain is severe or doesn\'t improve in 3 days, SEE A DOCTOR. Don\'t train through sharp pain!', ar: 'بروتوكول RICE: راحة، تلج (15 دقيقة on/off)، ضغط، رفع. أول 48 ساعة: بلاش حرارة، بلاش استرتش للمنطقة المصابة. شد خفيف: ترجع في 1-2 أسبوع. متوسط: 3-6 أسابيع. لو الألم شديد أو مش بيتحسن في 3 أيام، روح دكتور! متتمرنش على ألم حاد!' },
    priority: 10,
    domain: 'recovery',
  },
  {
    keywords: ['tendonitis', 'tendon pain', 'elbow pain gym', 'wrist pain gym', 'tennis elbow', 'golfer elbow'],
    keywordsAr: ['التهاب وتر', 'ألم في الكوع', 'ألم في الرسغ', 'وتر ملتهب'],
    keywordsFranco: ['eltehab watar', 'alam fe el koo3', 'alam fe el rosg', 'watar moltaheb'],
    stateId: 'RC_MENU',
    response: { en: 'Tendonitis tips: 1) Reduce weight, increase reps temporarily 2) Ice after workout (15min) 3) Eccentric exercises (slow negatives) help healing 4) Wrist curls + reverse curls for elbow issues 5) Adjust grip width 6) Use wrist wraps if needed. Usually takes 4-8 weeks to heal with proper management.', ar: 'نصائح التهاب الأوتار: 1) خفف الوزن، زود التكرارات مؤقتاً 2) تلج بعد التمرين (15 دقيقة) 3) تمارين eccentric (نزول بطيء) بتساعد الشفاء 4) wrist curls للكوع 5) غير عرض القبضة 6) استخدم wrist wraps لو محتاج. بياخد 4-8 أسابيع للشفاء مع العناية.' },
    priority: 9,
    domain: 'recovery',
  },
  {
    keywords: ['warm up', 'warming up', 'how to warm up', 'pre workout warm up', 'warmup routine'],
    keywordsAr: ['تسخين', 'ازاي اسخن', 'تسخين قبل التمرين', 'روتين تسخين'],
    keywordsFranco: ['tas5in', 'ezay asa5an', 'tas5in 2abl el tamreen', 'routine tas5in'],
    stateId: 'WK_MENU',
    response: { en: 'Warm-up protocol: 1) 5min light cardio (walking, cycling) 2) Dynamic stretches (arm circles, leg swings, hip circles) 3) 2 warm-up sets of first exercise (50%, then 70% of working weight) 4) Total: 8-12min. NEVER skip warm-up — injury prevention is cheaper than rehab!', ar: 'بروتوكول التسخين: 1) 5 دقايق كارديو خفيف (مشي، عجلة) 2) استرتش ديناميكي (دوائر ذراعين، أرجحة أرجل) 3) 2 سيتات تسخين من أول تمرين (50%، بعدين 70% من وزن الشغل) 4) المجموع: 8-12 دقيقة. متفوتش التسخين أبداً — الوقاية أرخص من العلاج!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v16: Egyptian Bodybuilding Culture ───────────────────────
  {
    keywords: ['big ramy', 'ramy elssbiay', 'mamdouh elssbiay', 'egyptian bodybuilder', 'mr olympia egypt'],
    keywordsAr: ['بيج رامي', 'رامي السبيعي', 'ممدوح السبيعي', 'لاعب كمال اجسام مصري'],
    keywordsFranco: ['big ramy', 'ramy el sbe3y', 'mamdou7 el sbe3y'],
    stateId: 'QA_MENU',
    response: { en: 'Big Ramy (Mamdouh Elssbiay) — Egypt\'s pride! 2x Mr. Olympia (2020, 2021). From a small village to the world\'s biggest stage. His work ethic and size are legendary. Fun fact: he started at 60kg! Proof that genetics + work = greatness.', ar: 'بيج رامي (ممدوح السبيعي) — فخر مصر! 2× مستر أولمبيا (2020, 2021). من قرية صغيرة لأكبر مسرح في العالم. أخلاقه في الشغل وحجمه أسطوريين. معلومة: بدأ 60 كيلو! دليل إن الجينات + شغل = عظمة.' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['gym in egypt', 'egyptian gym culture', 'gym scene egypt', 'best gym egypt', 'bodybuilding egypt'],
    keywordsAr: ['جيمات مصر', 'ثقافة الجيم في مصر', 'كمال اجسام مصر'],
    keywordsFranco: ['gymat masr', 'sa2afet el gym fe masr', 'kamal agsam masr'],
    stateId: 'QA_MENU',
    response: { en: 'Egyptian gym culture is booming! Cairo alone has 5000+ gyms. The scene went from "lifting is for weirdos" to everyone wanting gains. Gold\'s Gym, Oxygen, Samia Allouba — big chains everywhere. Home of Big Ramy, and more champions coming!', ar: 'ثقافة الجيم في مصر بتزدهر! القاهرة لوحدها فيها 5000+ جيم. المشهد اتحول من "الحديد للغريبين" لكل الناس عايزة مكاسب. Gold\'s Gym, Oxygen, ساميه علوبة — سلاسل كبيرة في كل مكان. بلد بيج رامي، وفي أبطال تانيين جايين!' },
    priority: 6,
    domain: 'root',
  },
  {
    keywords: ['gym slang', 'gym lingo', 'what does pr mean', 'gym terms', 'fitness terms'],
    keywordsAr: ['مصطلحات جيم', 'كلام الجيم', 'يعني ايه بي ار'],
    keywordsFranco: ['mostala7at gym', 'kalam el gym', 'ya3ny eh pr'],
    stateId: 'QA_MENU',
    response: { en: 'Gym lingo: PR = Personal Record, 1RM = max weight for 1 rep, Superset = 2 exercises back-to-back, Drop set = reduce weight each set, AMRAP = As Many Reps As Possible, RPE = Rate of Perceived Exertion (1-10), Spotter = person helping you, Natty = natural (no steroids).', ar: 'مصطلحات الجيم: PR = رقم شخصي جديد, 1RM = أقصى وزن لتكرار واحد, Superset = تمرينين ورا بعض, Drop set = خفف الوزن كل سيت, AMRAP = أكتر تكرارات ممكنة, RPE = مقياس الصعوبة (1-10), Spotter = اللي بيساعدك, Natty = طبيعي (بدون منشطات).' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['gym etiquette', 'gym rules', 'gym manners', 'wipe equipment', 're rack weights'],
    keywordsAr: ['اتيكيت الجيم', 'قوانين الجيم', 'ادب الجيم', 'ارجع الاوزان'],
    keywordsFranco: ['etiquette el gym', '2awanin el gym', 'adab el gym', 'erga3 el awzan'],
    stateId: 'QA_MENU',
    response: { en: 'Gym etiquette: 1) Re-rack your weights 2) Wipe equipment after use 3) Don\'t hog machines (no 30min phone breaks) 4) Don\'t stand in front of the dumbbell rack 5) Ask to work in, don\'t just stare 6) Use headphones for music 7) Respect personal space. Golden rule: leave it better than you found it!', ar: 'إتيكيت الجيم: 1) ارجع الأوزان مكانها 2) امسح الجهاز بعد ما تخلص 3) متحجزش الجهاز (بلاش 30 دقيقة تليفون) 4) متقفش قدام رف الدمبل 5) اطلب تشارك، متبصش وخلاص 6) استخدم سماعات 7) احترم المساحة الشخصية. القاعدة الذهبية: سيبها أحسن مما لقيتها!' },
    priority: 6,
    domain: 'root',
  },
  {
    keywords: ['gym anxiety', 'scared of gym', 'intimidated gym', 'first time gym', 'nervous gym', 'shy gym'],
    keywordsAr: ['خوف من الجيم', 'متوتر من الجيم', 'أول مرة جيم', 'كسوف في الجيم'],
    keywordsFranco: ['5of men el gym', 'metwter men el gym', 'awel mara gym', 'kasof fe el gym'],
    stateId: 'QA_MENU',
    response: { en: 'Gym anxiety is 100% normal! Tips: 1) Everyone was a beginner once 2) Nobody\'s watching you (they\'re busy) 3) Go during off-peak hours first 4) Have a written plan so you\'re not lost 5) Start with machines (easier) 6) Bring headphones 7) Ask staff for help. After 2 weeks, you\'ll feel like you own the place!', ar: 'القلق من الجيم طبيعي 100%! نصائح: 1) كل واحد كان مبتدئ قبل كده 2) محدش بيبصلك (كل واحد مشغول) 3) روح في أوقات هادية الأول 4) خد خطة مكتوبة 5) ابدأ بالأجهزة (أسهل) 6) خد سماعات 7) اطلب مساعدة من الموظفين. بعد أسبوعين هتحس إنك صاحب المكان!' },
    priority: 8,
    domain: 'root',
  },

  // ── v16: Supplement Timing & Stacking ───────────────────────
  {
    keywords: ['pre workout supplement', 'pre workout drink', 'what to take before workout', 'caffeine before gym', 'c4 pre workout'],
    keywordsAr: ['مكمل قبل التمرين', 'بري وركاوت', 'اخد ايه قبل التمرين', 'كافيين قبل الجيم'],
    keywordsFranco: ['mokamel 2abl el tamreen', 'pre workout', 'a5od eh 2abl el tamreen', 'caffeine 2abl el gym'],
    stateId: 'SP_MENU',
    response: { en: 'Pre-workout guide: 1) Caffeine (200-400mg) 30min before — the king 2) Citrulline (6-8g) — better pump 3) Beta-alanine (3-5g) — endurance 4) Creatine (5g) — can be anytime. DIY: coffee + banana works great! Avoid pre-workout after 4pm (sleep killer).', ar: 'دليل البري وركاوت: 1) كافيين (200-400مج) قبل ب30 دقيقة — الملك 2) سيترولين (6-8ج) — بمب أحسن 3) بيتا ألانين (3-5ج) — تحمل 4) كرياتين (5ج) — أي وقت. بديل: قهوة + موزة ممتاز! بلاش بري بعد 4 العصر (بيبوظ النوم).' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['post workout supplement', 'after workout', 'what to take after gym', 'recovery shake'],
    keywordsAr: ['مكمل بعد التمرين', 'بوست وركاوت', 'اخد ايه بعد التمرين', 'شيك ريكفري'],
    keywordsFranco: ['mokamel ba3d el tamreen', 'post workout', 'a5od eh ba3d el tamreen', 'shake recovery'],
    stateId: 'SP_MENU',
    response: { en: 'Post-workout essentials: 1) Whey protein (25-40g) within 2hrs 2) Fast carbs (banana, rice, dates) — replenish glycogen 3) Creatine (5g) if not taken pre 4) Water + electrolytes. The "anabolic window" is bigger than people think — don\'t stress about minutes, focus on daily totals.', ar: 'أساسيات بعد التمرين: 1) واي بروتين (25-40ج) خلال ساعتين 2) كربوهيدرات سريعة (موزة، رز، تمر) — تعويض الجلايكوجين 3) كرياتين (5ج) لو مخدتوش قبل 4) ميه + إلكتروليتس. "النافذة الأنابوليكية" أكبر مما الناس فاكرة — متقلقش من الدقايق، ركز على المجموع اليومي.' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['supplement stack', 'what supplements should i take', 'best supplements', 'beginner supplements', 'essential supplements'],
    keywordsAr: ['ستاك مكملات', 'اخد ايه مكملات', 'احسن مكملات', 'مكملات للمبتدئين'],
    keywordsFranco: ['stack mokamelat', 'a5od eh mokamelat', 'a7san mokamelat', 'mokamelat lel mobtade2in'],
    stateId: 'SP_MENU',
    response: { en: 'Essential stack (priority order): 1) Whey Protein — fill protein gaps 2) Creatine Monohydrate (5g/day) — most researched, safest 3) Vitamin D (2000-4000 IU) — most Egyptians are deficient 4) Omega-3 (2-3g/day) — joint & heart health 5) Magnesium (400mg) — sleep + recovery. That\'s 90% of what you need. Everything else is optional!', ar: 'الستاك الأساسي (بالأولوية): 1) واي بروتين — يكمل البروتين 2) كرياتين مونوهيدرات (5ج/يوم) — أكتر مكمل مدروس وآمن 3) فيتامين D (2000-4000 وحدة) — أغلب المصريين عندهم نقص 4) أوميجا 3 (2-3ج/يوم) — مفاصل وقلب 5) ماغنيسيوم (400مج) — نوم + ريكفري. ده 90% اللي محتاجه. كل حاجة تانية اختيارية!' },
    priority: 9,
    domain: 'supplements',
  },
  {
    keywords: ['bcaa', 'amino acids', 'eaa', 'branched chain', 'amino drink'],
    keywordsAr: ['بي سي ايه ايه', 'أحماض أمينية', 'امينو', 'مشروب امينو'],
    keywordsFranco: ['bcaa', 'a7mad amineya', 'amino', 'mashroob amino'],
    stateId: 'SP_MENU',
    response: { en: 'BCAAs vs EAAs: If you eat enough protein (1.6-2.2g/kg), you DON\'T need BCAAs — they\'re already in your food and whey. EAAs are slightly better (all 9 essential). Save your money — whole protein sources are superior. Only useful if training fasted.', ar: 'BCAAs ضد EAAs: لو بتاكل بروتين كفاية (1.6-2.2ج/كيلو)، مش محتاج BCAAs — هم أصلاً في الأكل والواي. EAAs أحسن شوية (ال9 أساسيين). وفر فلوسك — مصادر البروتين الكاملة أفضل. بس مفيدة لو بتتمرن صايم.' },
    priority: 7,
    domain: 'supplements',
  },

  // ── v16: Body Composition & Goals ───────────────────────────
  {
    keywords: ['body fat percentage', 'body fat', 'how to measure body fat', 'bf percentage', 'whats my body fat'],
    keywordsAr: ['نسبة الدهون', 'نسبة دهون الجسم', 'ازاي اقيس الدهون'],
    keywordsFranco: ['nesbet el dohon', 'nesbet dohon el gesm', 'ezay a2is el dohon'],
    stateId: 'HL_MENU',
    response: { en: 'Body fat ranges: Men — 10-14% (lean/visible abs), 15-19% (fit), 20-24% (average), 25%+ (overweight). Women — 18-22% (lean), 23-27% (fit), 28-32% (average). Measuring: DEXA scan (gold standard), InBody (good), calipers (OK), visual estimate. Track trends, not exact numbers!', ar: 'نسب الدهون: رجال — 10-14% (مقطع/بطن واضح)، 15-19% (فيت)، 20-24% (متوسط)، 25%+ (وزن زيادة). ستات — 18-22% (مقطعة)، 23-27% (فيت)، 28-32% (متوسط). القياس: DEXA (أدق)، InBody (كويس)، كاليبرز (مقبول). تابع الاتجاه، مش الأرقام بالظبط!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['bulk', 'bulking', 'how to bulk', 'gaining weight', 'mass gain', 'dirty bulk', 'clean bulk', 'lean bulk'],
    keywordsAr: ['بالك', 'بالكينج', 'ازاي ازود وزن', 'زيادة وزن', 'تضخيم'],
    keywordsFranco: ['bulk', 'bulking', 'ezay azawed wazn', 'zyada wazn', 'tad5im'],
    stateId: 'NT_MENU',
    response: { en: 'Bulking guide: 1) Calorie surplus: +300-500 above TDEE (lean bulk) 2) Protein: 1.6-2.2g/kg 3) Train heavy (progressive overload) 4) Weight gain target: 0.5-1kg/month 5) Track calories weekly. Lean bulk > dirty bulk — less fat to cut later. Egyptian budget: rice, bread, eggs, foul, lentils, chicken!', ar: 'دليل البالكينج: 1) فائض كالوريز: +300-500 فوق TDEE (لين بالك) 2) بروتين: 1.6-2.2ج/كيلو 3) تمرن بأوزان تقيلة (زود تدريجياً) 4) هدف الزيادة: 0.5-1 كيلو/شهر 5) تابع الكالوريز أسبوعياً. لين بالك أحسن من ديرتي بالك — دهون أقل تقطعها بعدين. ميزانية مصرية: رز، عيش، بيض، فول، عدس، فراخ!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['cut', 'cutting', 'how to cut', 'lose fat', 'shred', 'get shredded', 'fat loss', 'get lean'],
    keywordsAr: ['كت', 'كاتينج', 'ازاي انشف', 'خسارة دهون', 'تنشيف', 'تجفيف'],
    keywordsFranco: ['cut', 'cutting', 'ezay anashef', '5asaret dohon', 'tanshif'],
    stateId: 'NT_MENU',
    response: { en: 'Cutting guide: 1) Calorie deficit: -500 below TDEE 2) HIGH protein: 2-2.5g/kg (preserve muscle) 3) Keep lifting heavy (don\'t switch to light weights!) 4) Add cardio gradually (start 2x/week) 5) Target: lose 0.5-1kg/week 6) Refeed 1 day/week (eat at maintenance). Patience > crash diets!', ar: 'دليل التنشيف: 1) عجز كالوريز: -500 تحت TDEE 2) بروتين عالي: 2-2.5ج/كيلو (حافظ على العضلات) 3) كمل رفع أوزان تقيلة (متحولش لخفيف!) 4) زود كارديو تدريجياً (ابدأ مرتين/أسبوع) 5) الهدف: خسارة 0.5-1 كيلو/أسبوع 6) ريفيد يوم/أسبوع (كل صيانة). الصبر أهم من الكراش دايت!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['body recomp', 'recomposition', 'lose fat gain muscle', 'can i build muscle and lose fat', 'recomp'],
    keywordsAr: ['ريكومب', 'خسارة دهون وبناء عضلات', 'ينفع انشف وابني عضل'],
    keywordsFranco: ['recomp', '5asaret dohon we bena2 3adalat', 'yanfa3 anashef we abny 3adal'],
    stateId: 'NT_MENU',
    response: { en: 'Body recomp IS possible, especially for: beginners, returning lifters, or those with higher body fat. How: 1) Eat at maintenance or slight deficit 2) HIGH protein (2g/kg+) 3) Train hard with progressive overload 4) Sleep 8+ hours 5) Be patient — scale may not move but body changes. Takes 3-6 months to see results.', ar: 'الريكومب ممكن فعلاً، خصوصاً لو: مبتدئ، راجع بعد انقطاع، أو نسبة دهون عالية. ازاي: 1) كل صيانة أو عجز خفيف 2) بروتين عالي (2ج/كيلو+) 3) تمرن بجد مع زيادة تدريجية 4) نوم 8+ ساعات 5) اصبر — الميزان ممكن ميتحركش بس الجسم بيتغير. بياخد 3-6 شهور تشوف نتايج.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['plateau', 'stuck', 'not progressing', 'cant gain strength', 'no progress', 'weight not going up', 'stalled'],
    keywordsAr: ['بلاتو', 'واقف', 'مش بتقدم', 'مش بزود أوزان', 'تقدم واقف'],
    keywordsFranco: ['plateau', 'wa2ef', 'msh bata2adam', 'msh bazawed awzan', 'ta2adom wa2ef'],
    stateId: 'WK_MENU',
    response: { en: 'Break the plateau: 1) Deload for a week 2) Change rep ranges (if doing 8-12, try 5-8 or 15-20) 3) Add a new exercise variation 4) Increase food (you might be undereating) 5) Sleep more 6) Try different training split 7) Add pauses/tempos. Plateaus mean your body adapted — time to switch things up!', ar: 'اكسر البلاتو: 1) ديلود أسبوع 2) غير التكرارات (لو 8-12، جرب 5-8 أو 15-20) 3) ضيف تمرين جديد 4) زود الأكل (ممكن بتاكل قليل) 5) نام أكتر 6) جرب سبليت مختلف 7) ضيف pauses/tempos. البلاتو معناه جسمك اتأقلم — وقت التغيير!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v17: Cardio Intelligence ────────────────────────────────
  {
    keywords: ['cardio', 'best cardio', 'cardio for fat loss', 'how much cardio', 'cardio and muscle', 'does cardio kill gains'],
    keywordsAr: ['كارديو', 'احسن كارديو', 'كارديو للتنشيف', 'كام كارديو', 'الكارديو بيخسر عضلات'],
    keywordsFranco: ['cardio', 'a7san cardio', 'cardio lel tanshif', 'kam cardio', 'el cardio bey5aser 3adalat'],
    stateId: 'WK_MENU',
    response: { en: 'Cardio doesn\'t kill gains IF done right! Guidelines: 1) Separate cardio from legs by 24hrs 2) 2-4 sessions/week, 20-40min 3) Low intensity (walking, cycling) preserves muscle best 4) HIIT is time-efficient but more fatiguing 5) Don\'t exceed 200min/week total. Walking 10k steps daily = best "cardio" for lifters!', ar: 'الكارديو مش بيخسر عضلات لو اتعمل صح! قواعد: 1) افصل الكارديو عن الرجل 24 ساعة 2) 2-4 حصص/أسبوع، 20-40 دقيقة 3) كارديو خفيف (مشي، عجلة) أحسن للعضلات 4) HIIT بيوفر وقت بس بيتعب أكتر 5) متعديش 200 دقيقة/أسبوع. مشي 10 آلاف خطوة يومياً = أحسن "كارديو" للرافعين!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['hiit', 'high intensity interval', 'hiit vs liss', 'interval training', 'tabata', 'sprint intervals'],
    keywordsAr: ['هيت', 'تدريب متقطع عالي الشدة', 'هيت ولا ليس', 'تاباتا'],
    keywordsFranco: ['hiit', 'tadrib mota2te3', 'hiit wala liss', 'tabata'],
    stateId: 'WK_MENU',
    response: { en: 'HIIT vs LISS: HIIT (20-30min, 30sec sprint/60sec rest) = more calories burned per minute, EPOC effect. LISS (40-60min walking/cycling) = less fatigue, better recovery. Best approach: 1-2 HIIT + 2-3 LISS per week. Beginners start with LISS only!', ar: 'HIIT ضد LISS: HIIT (20-30 دقيقة، 30ث سبرنت/60ث راحة) = كالوريز أكتر في الدقيقة، تأثير EPOC. LISS (40-60 دقيقة مشي/عجلة) = إرهاق أقل، ريكفري أحسن. أحسن خطة: 1-2 HIIT + 2-3 LISS في الأسبوع. المبتدئين يبدأوا LISS بس!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['running', 'how to start running', 'couch to 5k', 'running program', 'treadmill', 'jogging'],
    keywordsAr: ['جري', 'ازاي ابدأ جري', 'برنامج جري', 'تريدميل', 'هرولة'],
    keywordsFranco: ['gary', 'ezay abda2 gary', 'barnameg gary', 'treadmill', 'harwala'],
    stateId: 'WK_MENU',
    response: { en: 'Running beginner plan: Week 1-2: Walk 5min, jog 1min, repeat ×6. Week 3-4: Walk 3min, jog 2min, repeat ×6. Week 5-6: Walk 2min, jog 3min. Week 7-8: Jog 20min straight. Get proper running shoes! Start slow, increase by 10%/week max.', ar: 'خطة جري للمبتدئين: أسبوع 1-2: مشي 5 دقايق، جري 1 دقيقة، كرر ×6. أسبوع 3-4: مشي 3، جري 2، كرر ×6. أسبوع 5-6: مشي 2، جري 3. أسبوع 7-8: جري 20 دقيقة متواصل. اشتري حذاء جري كويس! ابدأ ببطء، زود 10% ماكس كل أسبوع.' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['jumping rope', 'skip rope', 'skipping', 'jump rope workout', 'rope cardio'],
    keywordsAr: ['نط حبل', 'حبل', 'تمرين نط الحبل'],
    keywordsFranco: ['nat 7abl', '7abl', 'tamreen nat el 7abl'],
    stateId: 'WK_MENU',
    response: { en: 'Jump rope is incredible cardio! Burns 10-16 cal/min. Beginner: 30sec jump/30sec rest × 10 rounds. Intermediate: 1min/30sec × 10. Advanced: 3min rounds. Benefits: coordination, calf strength, bone density, portable. Start with a basic jump, master timing before tricks!', ar: 'نط الحبل كارديو رهيب! بيحرق 10-16 كالوري/دقيقة. مبتدئ: 30ث نط/30ث راحة × 10 جولات. متوسط: 1 دقيقة/30ث × 10. متقدم: 3 دقايق جولات. فوايد: تنسيق، قوة سمانة، كثافة عظام، محمول. ابدأ بالنط الأساسي، اتقن التوقيت قبل الحركات!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['walking', 'steps', '10000 steps', 'daily steps', 'walking for weight loss', 'step count'],
    keywordsAr: ['مشي', 'خطوات', '10 آلاف خطوة', 'خطوات يومياً', 'مشي للتخسيس'],
    keywordsFranco: ['mashy', '5otowat', '10000 5otwa', '5otowat yomyan', 'mashy lel ta5sis'],
    stateId: 'HL_MENU',
    response: { en: 'Walking is underrated! 10,000 steps = ~400-500 cal burned. Benefits: low stress on joints, improves recovery, reduces cortisol, boosts mood. Tips: walk after meals (helps digestion + blood sugar), take phone calls walking, park far away. Start at 7k steps, build to 10k+!', ar: 'المشي مش واخد حقه! 10,000 خطوة = ~400-500 كالوري. فوايد: ضغط قليل على المفاصل، بيحسن الريكفري، بيقلل الكورتيزول، بيحسن المزاج. نصائح: امشي بعد الأكل (بيساعد الهضم والسكر)، رد على التليفون وانت ماشي. ابدأ ب7 آلاف، وصل ل10 آلاف+!' },
    priority: 7,
    domain: 'health',
  },

  // ── v17: Flexibility & Mobility ─────────────────────────────
  {
    keywords: ['stretching', 'how to stretch', 'when to stretch', 'stretching routine', 'static stretch', 'dynamic stretch'],
    keywordsAr: ['استرتش', 'ازاي اعمل استرتش', 'امتى اعمل استرتش', 'روتين استرتش'],
    keywordsFranco: ['stretch', 'ezay a3mel stretch', 'emta a3mel stretch', 'routine stretch'],
    stateId: 'WK_MENU',
    response: { en: 'Stretching guide: BEFORE workout = Dynamic (arm circles, leg swings, hip openers) — 5min. AFTER workout = Static (hold 30-60sec per stretch). Key stretches: hip flexors, hamstrings, chest opener, lat stretch, quad stretch. Never static stretch cold muscles!', ar: 'دليل الاسترتش: قبل التمرين = ديناميكي (دوائر ذراعين، أرجحة أرجل) — 5 دقايق. بعد التمرين = ثابت (امسك 30-60 ثانية). أهم استرتشات: hip flexors، هامسترنج، فتح صدر، لاتس، كواد. متعملش استرتش ثابت على عضلات باردة!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['mobility', 'mobility work', 'joint mobility', 'hip mobility', 'shoulder mobility', 'ankle mobility'],
    keywordsAr: ['موبيليتي', 'مرونة المفاصل', 'موبيليتي الورك', 'موبيليتي الكتف'],
    keywordsFranco: ['mobility', 'moronet el mafasel', 'mobility el werk', 'mobility el ketf'],
    stateId: 'WK_MENU',
    response: { en: 'Mobility > Flexibility! Mobility = strength through range of motion. Daily routine (10min): 1) Cat-cow ×10 2) World\'s greatest stretch ×5/side 3) Deep squat hold 60sec 4) Shoulder CARs ×10 5) Hip 90/90 switches ×10. Do this every morning and your lifts will improve!', ar: 'الموبيليتي أهم من المرونة! الموبيليتي = قوة خلال مدى الحركة. روتين يومي (10 دقايق): 1) Cat-cow ×10 2) أعظم استرتش ×5/جانب 3) Deep squat hold 60ث 4) دوائر كتف ×10 5) Hip 90/90 ×10. اعمل ده كل صبح وهتلاقي رفعاتك اتحسنت!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['tight hips', 'hip pain', 'hip opener', 'pigeon stretch', 'hip flexor tight'],
    keywordsAr: ['ورك مشدود', 'ألم في الورك', 'فتح الورك', 'hip flexor مشدود'],
    keywordsFranco: ['werk mashdood', 'alam fe el werk', 'fat7 el werk', 'hip flexor mashdood'],
    stateId: 'WK_MENU',
    response: { en: 'Tight hips = common from sitting! Fix: 1) Hip flexor stretch (kneel, push hip forward) 30sec/side 2) Pigeon pose 60sec/side 3) Deep squat hold 60sec 4) 90/90 rotations ×10 5) Glute bridges ×15. Do this daily + stand up every 30min if desk job. Game changer for squats/deadlifts!', ar: 'الورك المشدود = مشكلة القعدة! الحل: 1) استرتش hip flexor (اركع، ادفع الورك لقدام) 30ث/جانب 2) Pigeon 60ث/جانب 3) Deep squat hold 60ث 4) 90/90 ×10 5) Glute bridges ×15. اعمل ده يومياً + قوم كل 30 دقيقة لو شغل مكتبي. فرق كبير في السكوات والديدلفت!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['yoga for lifters', 'yoga benefits gym', 'should i do yoga', 'yoga and weightlifting'],
    keywordsAr: ['يوجا لرافعي الأثقال', 'فوايد اليوجا', 'اعمل يوجا', 'يوجا مع الحديد'],
    keywordsFranco: ['yoga lel raf3in', 'fawayed el yoga', 'a3mel yoga', 'yoga ma3 el 7adid'],
    stateId: 'WK_MENU',
    response: { en: 'Yoga is great for lifters! Benefits: improved mobility, better mind-muscle connection, reduced injury risk, enhanced recovery, stress relief. Try 1-2 sessions/week on rest days. Focus on: Vinyasa (flow), Yin (deep stretch), or just 15min mobility yoga on YouTube.', ar: 'اليوجا ممتازة لرافعي الأثقال! فوايد: موبيليتي أحسن، اتصال عقل-عضلة أفضل، إصابات أقل، ريكفري أحسن، تقليل توتر. جرب 1-2 حصة/أسبوع أيام الراحة. ركز على: Vinyasa (تدفق)، Yin (استرتش عميق)، أو 15 دقيقة يوجا على يوتيوب.' },
    priority: 7,
    domain: 'workout',
  },

  // ── v17: Supplement Myths & Facts ───────────────────────────
  {
    keywords: ['fat burner', 'do fat burners work', 'thermogenic', 'l carnitine fat', 'fat burning supplement'],
    keywordsAr: ['حارق دهون', 'فات بيرنر شغال', 'ثيرموجينيك', 'مكمل حرق الدهون'],
    keywordsFranco: ['7are2 dohon', 'fat burner shaghal', 'thermogenic', 'mokamel 7ar2 dohon'],
    stateId: 'SP_MENU',
    response: { en: 'Fat burners are 95% marketing! They add ~50-100 cal/day burn at best. What works: calorie deficit + training + sleep. L-Carnitine may help slightly (2g/day). Caffeine is the best legal "fat burner." Save your money and fix your diet instead!', ar: 'حوارق الدهون 95% تسويق! بتزود حرق ~50-100 كالوري/يوم في أحسن الأحوال. اللي شغال: عجز كالوريز + تمرين + نوم. L-Carnitine ممكن يساعد شوية (2ج/يوم). الكافيين أحسن "حارق دهون" قانوني. وفر فلوسك وظبط أكلك!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['testosterone booster', 'test booster', 'tribulus', 'ashwagandha testosterone', 'boost test naturally'],
    keywordsAr: ['رافع تستوستيرون', 'تيست بوستر', 'ترايبولس', 'زيادة التستوستيرون'],
    keywordsFranco: ['rafe3 testosterone', 'test booster', 'tribulus', 'zyada el testosterone'],
    stateId: 'SP_MENU',
    response: { en: 'Most "test boosters" don\'t work. What DOES boost testosterone naturally: 1) Sleep 7-9hrs 2) Lift heavy compounds 3) Eat enough fat (0.8-1g/kg) 4) Reduce stress 5) Vitamin D + Zinc 6) Maintain healthy body fat (10-20%). Ashwagandha has decent evidence for reducing cortisol. Skip tribulus!', ar: 'أغلب "رافعات التستوستيرون" مش شغالة. اللي فعلاً بيزود التستوستيرون طبيعياً: 1) نوم 7-9 ساعات 2) ارفع أوزان تقيلة (compound) 3) كل دهون كفاية (0.8-1ج/كيلو) 4) قلل التوتر 5) فيتامين D + زنك 6) حافظ على نسبة دهون صحية. Ashwagandha عندها أدلة كويسة لتقليل الكورتيزول. سيب الترايبولس!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['is creatine safe', 'creatine side effects', 'creatine kidney', 'creatine hair loss', 'creatine water retention'],
    keywordsAr: ['الكرياتين آمن', 'أضرار الكرياتين', 'كرياتين والكلى', 'كرياتين وسقوط الشعر'],
    keywordsFranco: ['el creatine amen', 'adrar el creatine', 'creatine wel kola', 'creatine we so2ot el sha3r'],
    stateId: 'SP_MENU',
    response: { en: 'Creatine is THE most studied supplement — extremely safe! Myths debunked: 1) Kidney damage: NO (in healthy kidneys) 2) Hair loss: weak evidence, likely genetic 3) Water retention: initial 1-2kg, then stabilizes 4) Bloating: use monohydrate, drink water. Just take 5g/day, every day. Don\'t cycle it.', ar: 'الكرياتين أكتر مكمل مدروس — آمن جداً! خرافات: 1) ضرر الكلى: لأ (في الكلى السليمة) 2) سقوط الشعر: أدلة ضعيفة، غالباً جيني 3) احتباس ميه: 1-2 كيلو أول كام يوم، بعدين يستقر 4) انتفاخ: استخدم مونوهيدرات، اشرب ميه. بس خد 5ج/يوم، كل يوم. مش محتاج cycling.' },
    priority: 9,
    domain: 'supplements',
  },
  {
    keywords: ['collagen supplement', 'collagen', 'joint supplement', 'glucosamine', 'joint health'],
    keywordsAr: ['كولاجين', 'مكمل مفاصل', 'جلوكوزامين', 'صحة المفاصل'],
    keywordsFranco: ['collagen', 'mokamel mafasel', 'glucosamine', 'se7et el mafasel'],
    stateId: 'SP_MENU',
    response: { en: 'Joint supplements: Collagen (10-15g/day + Vitamin C) — best evidence for tendons/joints. Glucosamine (1500mg) — mixed evidence, some people swear by it. Fish oil (2-3g) — anti-inflammatory. Turmeric/Curcumin — natural anti-inflammatory. Best joint protection: proper warm-up + controlled form!', ar: 'مكملات المفاصل: كولاجين (10-15ج/يوم + فيتامين C) — أحسن أدلة للأوتار/المفاصل. جلوكوزامين (1500مج) — أدلة مختلطة، بعض الناس بتمدحه. زيت سمك (2-3ج) — مضاد التهابات. كركم — مضاد التهابات طبيعي. أحسن حماية للمفاصل: تسخين كويس + فورم مضبوط!' },
    priority: 7,
    domain: 'supplements',
  },

  // ── v17: Egyptian Diet Patterns ─────────────────────────────
  {
    keywords: ['ramadan diet', 'ramadan workout', 'training in ramadan', 'iftar', 'suhoor', 'fasting workout'],
    keywordsAr: ['دايت رمضان', 'تمرين في رمضان', 'إفطار', 'سحور', 'تمرين صيام'],
    keywordsFranco: ['diet ramadan', 'tamreen fe ramadan', 'iftar', 'su7oor', 'tamreen seyam'],
    stateId: 'NT_MENU',
    response: { en: 'Ramadan fitness guide: Train 30-60min before iftar (use stored energy). Suhoor: slow carbs + protein + water (oats, eggs, cheese, banana). Iftar: break fast light (dates + water), then meal. Don\'t skip suhoor! Reduce volume 20-30%, keep intensity. Hydrate well between iftar-suhoor (2-3L).', ar: 'دليل رمضان الرياضي: تمرن 30-60 دقيقة قبل الإفطار. السحور: كارب بطيء + بروتين + ميه (شوفان، بيض، جبنة، موزة). الإفطار: افتح خفيف (تمر + ميه)، بعدين الوجبة. متفوتش السحور! قلل الحجم 20-30%، حافظ على الشدة. اشرب كويس بين الإفطار والسحور (2-3 لتر).' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['egyptian breakfast', 'foul for gym', 'taameya protein', 'foul medames', 'egyptian protein breakfast'],
    keywordsAr: ['فطار مصري', 'فول للجيم', 'طعمية بروتين', 'فول مدمس'],
    keywordsFranco: ['fetar masry', 'fool lel gym', 'ta3meya protein', 'fool medames'],
    stateId: 'NT_MENU',
    response: { en: 'Egyptian breakfast for gains: Foul medames (1 cup) = 13g protein, 40g carbs. Add 2-3 eggs for extra protein. Taameya = deep fried (high fat), limit to 2-3 pieces. Better: foul + eggs + tahini + bread = balanced macro meal under 500 cal. Skip the excess bread and oil!', ar: 'فطار مصري للمكاسب: فول مدمس (كوب) = 13ج بروتين، 40ج كارب. ضيف 2-3 بيضات لبروتين أكتر. الطعمية = مقلية (دهون عالية)، اكتفي ب2-3 حبات. أحسن: فول + بيض + طحينة + عيش = وجبة متوازنة تحت 500 كالوري. قلل العيش والزيت الزيادة!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['cheap protein egypt', 'budget protein', 'protein on budget', 'cheap gains', 'protein for poor'],
    keywordsAr: ['بروتين رخيص', 'بروتين بميزانية', 'بروتين ببلاش', 'مكاسب رخيصة'],
    keywordsFranco: ['protein r5is', 'protein be mizaneya', 'gains r5isa'],
    stateId: 'NT_MENU',
    response: { en: 'Cheap protein in Egypt: 1) Eggs (30 eggs ~60-70 LE) = best value 2) Foul/lentils (1kg ~15-20 LE) 3) Canned tuna (can ~20 LE) 4) Chicken liver (1kg ~50-60 LE) 5) Milk (1L ~25 LE) 6) White cheese (1kg ~70 LE) 7) Frozen chicken breast on sale. Budget: 50 LE/day can get you 120g+ protein easily!', ar: 'بروتين رخيص في مصر: 1) بيض (30 بيضة ~60-70 جنيه) = أحسن قيمة 2) فول/عدس (كيلو ~15-20 جنيه) 3) تونة معلبة (علبة ~20 جنيه) 4) كبدة فراخ (كيلو ~50-60 جنيه) 5) لبن (لتر ~25 جنيه) 6) جبنة بيضاء (كيلو ~70 جنيه) 7) صدور فراخ فريزر عروض. بميزانية 50 جنيه/يوم تقدر تاخد 120ج+ بروتين!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['egyptian street food healthy', 'is koshari healthy', 'is fiteer healthy', 'healthy egyptian food'],
    keywordsAr: ['أكل شارع صحي', 'الكشري صحي', 'الفطير صحي', 'أكل مصري صحي'],
    keywordsFranco: ['akl share3 se7y', 'el koshari se7y', 'el fiteer se7y', 'akl masry se7y'],
    stateId: 'NT_MENU',
    response: { en: 'Egyptian street food health guide: Koshari (medium) ~600 cal, high carb, moderate protein — OK post-workout. Fiteer = 800-1200 cal (butter bomb!) — cheat meal only. Shawarma = decent if grilled (avoid extra bread/fries). Hawawshi = OK in moderation. Best choices: grilled chicken sandwich, foul plate, grilled corn. Worst: fiteer, liver sandwich with butter.', ar: 'دليل أكل الشارع المصري: كشري (وسط) ~600 كالوري، كارب عالي، بروتين معتدل — كويس بعد التمرين. فطير = 800-1200 كالوري (قنبلة زبدة!) — cheat meal بس. شاورما = كويسة لو مشوية (بلاش عيش/بطاطس زيادة). حواوشي = كويس باعتدال. أحسن اختيار: ساندوتش فراخ مشوية، طبق فول، ذرة مشوية.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['meal prep', 'meal prepping', 'food prep', 'cook for the week', 'batch cooking'],
    keywordsAr: ['تحضير وجبات', 'ميل بريب', 'طبخ للأسبوع', 'تحضير أكل'],
    keywordsFranco: ['ta7dir wagabat', 'meal prep', 'tob5 lel osboo3', 'ta7dir akl'],
    stateId: 'NT_MENU',
    response: { en: 'Meal prep like a pro: 1) Pick 1 day (Sunday works) 2) Cook 3 proteins (chicken, beef, eggs) 3) Cook 2-3 carbs (rice, sweet potato, pasta) 4) Prep veggies (wash, chop, store) 5) Use containers, label with day 6) Most foods last 4-5 days in fridge. Time saved = consistency gained!', ar: 'ميل بريب زي البرو: 1) اختار يوم (الأحد كويس) 2) طبخ 3 بروتينات (فراخ، لحمة، بيض) 3) طبخ 2-3 كاربز (رز، بطاطا، مكرونة) 4) حضر خضار (اغسل، قطع، خزن) 5) استخدم حافظات، اكتب اليوم 6) أغلب الأكل بيعيش 4-5 أيام في التلاجة. الوقت اللي بتوفره = التزام أكتر!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v17: Common Fitness Myths ───────────────────────────────
  {
    keywords: ['spot reduction', 'lose belly fat', 'target belly', 'burn stomach fat', 'abs to lose belly'],
    keywordsAr: ['خسارة دهون البطن', 'تنشيف البطن', 'حرق دهون الكرش', 'تمارين البطن للتخسيس'],
    keywordsFranco: ['5asaret dohon el batn', 'tanshif el batn', '7ar2 dohon el kersh', 'tamarin el batn lel ta5sis'],
    stateId: 'QA_MENU',
    response: { en: 'MYTH: You can\'t spot-reduce fat! Doing 1000 crunches won\'t burn belly fat specifically. Fat loss happens overall through calorie deficit. Where your body loses fat first is genetic. To lose belly: 1) Calorie deficit 2) Strength training 3) Cardio 4) Reduce stress (cortisol stores belly fat) 5) Be patient!', ar: 'خرافة: مش ممكن تنشف منطقة معينة! 1000 كرانش مش هيحرق دهون البطن بالتحديد. خسارة الدهون بتحصل كلها مع بعض من عجز كالوريز. المكان اللي جسمك بيخس منه الأول جيني. للبطن: 1) عجز كالوريز 2) تمارين قوة 3) كارديو 4) قلل التوتر (الكورتيزول بيخزن دهون البطن) 5) اصبر!' },
    priority: 9,
    domain: 'root',
  },
  {
    keywords: ['eating late makes fat', 'eating at night', 'eat after 6pm', 'midnight snack bad', 'late night eating'],
    keywordsAr: ['الأكل بالليل بيتخن', 'أكل بعد 6', 'أكل متأخر'],
    keywordsFranco: ['el akl beleil beyeta5en', 'akl ba3d 6', 'akl meta25er'],
    stateId: 'QA_MENU',
    response: { en: 'MYTH: Eating late doesn\'t make you fat! What matters is TOTAL daily calories, not timing. Your body doesn\'t have a "fat storage clock." Late eating is only bad if it causes: overeating, poor food choices, or bad sleep. If your macros fit, eat whenever works for you!', ar: 'خرافة: الأكل بالليل مش بيتخن! اللي مهم هو إجمالي الكالوريز اليومية، مش التوقيت. جسمك معندوش "ساعة تخزين دهون." الأكل المتأخر وحش بس لو: بتاكل زيادة، اختيارات وحشة، أو بيبوظ النوم. لو الماكروز مضبوطة، كل في أي وقت!' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['lifting stunts growth', 'weights make you short', 'gym at young age', 'teenager gym', 'teens gym safe'],
    keywordsAr: ['الحديد بيقصر', 'الأوزان بتقصر الطول', 'الجيم في سن صغير', 'مراهقين جيم'],
    keywordsFranco: ['el 7adid bey2aser', 'el awzan bet2aser el tool', 'el gym fe sen soghayar', 'morahqin gym'],
    stateId: 'QA_MENU',
    response: { en: 'MYTH: Lifting does NOT stunt growth! Studies prove it. Safe for teens 14+ with proper form. Benefits for teens: stronger bones, better coordination, injury prevention in sports, confidence. Just: learn form first, avoid 1RM tests, have supervision, and progressive overload.', ar: 'خرافة: الحديد مش بيقصر الطول! الدراسات بتثبت كده. آمن للمراهقين 14+ بفورم صح. فوايد للمراهقين: عظام أقوى، تنسيق أحسن، وقاية من الإصابات، ثقة. بس: اتعلم الفورم الأول، بلاش 1RM، خد إشراف، وزود تدريجياً.' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['muscle turns to fat', 'muscle becomes fat', 'stop training fat'],
    keywordsAr: ['العضلات بتتحول دهون', 'لو وقفت تمرين هتخن'],
    keywordsFranco: ['el 3adalat betet7awel dohon', 'lo wa2aft tamreen hate5en'],
    stateId: 'QA_MENU',
    response: { en: 'MYTH: Muscle CANNOT turn into fat! They\'re completely different tissues. What happens when you stop: muscle shrinks (atrophy) and if you eat the same, you gain fat. They just happen at the same time — not conversion. Stay active even if you can\'t lift!', ar: 'خرافة: العضلات مش ممكن تتحول لدهون! هم أنسجة مختلفة تماماً. اللي بيحصل لو وقفت: العضلات بتصغر وبتبطل تحرق كالوريز، ولو أكلت نفس الكمية بتخزن دهون. بيحصلوا في نفس الوقت — مش تحويل. حافظ على النشاط حتى لو مش بترفع!' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['high reps toning', 'light weight toning', 'toning exercises', 'tone not bulk'],
    keywordsAr: ['تكرارات عالية للتشكيل', 'أوزان خفيفة للتشكيل', 'تمارين تشكيل', 'شكل مش حجم'],
    keywordsFranco: ['tekrarat 3alya lel tashkil', 'awzan 5afifa lel tashkil', 'tamarin tashkil'],
    stateId: 'QA_MENU',
    response: { en: 'MYTH: "Toning" isn\'t real! There\'s only: building muscle or losing fat. Light weights + high reps DON\'T "tone" — they just don\'t build much. For that "toned" look: lift challenging weights (8-15 reps) + lose fat through calorie deficit. The "toned" look = muscle + low body fat.', ar: 'خرافة: "التشكيل" مش حقيقي! في بس: بناء عضلات أو خسارة دهون. أوزان خفيفة + تكرارات عالية مش بت"شكل" — بس مش بتبني كتير. عشان الشكل "المشدود": ارفع أوزان تحدي (8-15 تكرار) + انشف بعجز كالوريز. الشكل "المشدود" = عضلات + دهون قليلة.' },
    priority: 8,
    domain: 'root',
  },

  // ── v17: Training Age & Periodization ───────────────────────
  {
    keywords: ['how long to see results', 'when will i see results', 'results timeline', 'how fast muscle', 'newbie gains'],
    keywordsAr: ['امتى هشوف نتيجة', 'كام شهر اشوف نتيجة', 'مكاسب المبتدئين'],
    keywordsFranco: ['emta hashoof natiga', 'kam shahr ashoof natiga', 'makaseb el mobtade2in'],
    stateId: 'QA_MENU',
    response: { en: 'Results timeline: 2 weeks = feel better. 4 weeks = you notice changes. 8 weeks = others notice. 12 weeks = serious transformation. Year 1: gain 8-12kg muscle (newbie gains). Year 2: 4-6kg. Year 3+: 2-3kg. First year is MAGICAL — don\'t waste it with bad diet!', ar: 'الجدول الزمني: 2 أسبوع = هتحس بتحسن. 4 أسابيع = هتلاحظ تغيير. 8 أسابيع = الناس هتلاحظ. 12 أسبوع = تحول جدي. السنة الأولى: 8-12 كيلو عضلات (مكاسب المبتدئين). السنة التانية: 4-6 كيلو. السنة 3+: 2-3 كيلو. السنة الأولى سحرية — متضيعهاش بأكل وحش!' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['periodization', 'training periodization', 'training block', 'mesocycle', 'training cycle'],
    keywordsAr: ['بيريودايزيشن', 'دورة تدريبية', 'بلوك تدريبي', 'ميزوسايكل'],
    keywordsFranco: ['periodization', 'dawra tadribia', 'block tadreby', 'mesocycle'],
    stateId: 'PG_MENU',
    response: { en: 'Periodization = planned training phases. Common model: 4-6 week blocks. Block 1: Hypertrophy (8-12 reps, moderate weight). Block 2: Strength (3-6 reps, heavy). Block 3: Peak/Power (1-3 reps, max). Then deload and repeat. This prevents plateaus and keeps gains coming!', ar: 'البيريودايزيشن = مراحل تدريب مخططة. النموذج الشائع: بلوكات 4-6 أسابيع. بلوك 1: تضخيم (8-12 تكرار، وزن معتدل). بلوك 2: قوة (3-6 تكرار، ثقيل). بلوك 3: ذروة/قوة (1-3 تكرار، ماكس). بعدين ديلود وكرر. ده بيمنع البلاتو وبيخلي المكاسب مستمرة!' },
    priority: 7,
    domain: 'programs',
  },

  // ── v18: Advanced Training Techniques ───────────────────────
  {
    keywords: ['drop set', 'drop sets', 'how to do drop sets', 'what is drop set', 'mechanical drop set'],
    keywordsAr: ['دروب سيت', 'ايه الدروب سيت', 'ازاي اعمل دروب سيت'],
    keywordsFranco: ['drop set', 'eh el drop set', 'ezay a3mel drop set'],
    stateId: 'WK_MENU',
    response: { en: 'Drop sets: do a set to failure, immediately reduce weight 20-30%, continue to failure again. Repeat 2-3 drops. Great for: hypertrophy, finishing last exercise, pump. Use 1-2 drop sets per workout max — they\'re very fatiguing. Best on machines (quick weight changes).', ar: 'دروب سيت: اعمل سيت لحد الفشل، خفف الوزن 20-30% فوراً، كمل لحد الفشل تاني. كرر 2-3 مرات. ممتاز لـ: التضخيم، آخر تمرين، البمب. استخدم 1-2 دروب سيت بالماكس في التمرين — بيتعبوا جداً. أحسن على الأجهزة (تغيير وزن سريع).' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['superset', 'supersets', 'how to superset', 'what is superset', 'compound set'],
    keywordsAr: ['سوبرسيت', 'ايه السوبرسيت', 'ازاي اعمل سوبرسيت'],
    keywordsFranco: ['superset', 'eh el superset', 'ezay a3mel superset'],
    stateId: 'WK_MENU',
    response: { en: 'Supersets: 2 exercises back-to-back, no rest between them. Types: 1) Antagonist (bicep curl → tricep pushdown) — best! 2) Same muscle (incline press → flyes) — intense! 3) Upper/Lower (bench → squats) — saves time. Rest 60-90sec between supersets. Great for time-efficient workouts!', ar: 'سوبرسيت: 2 تمرين ورا بعض، بدون راحة بينهم. أنواع: 1) متضاد (بايسب كيرل → ترايسب بوشداون) — أحسن حاجة! 2) نفس العضلة (إنكلاين بريس → فلاي) — مكثف! 3) أعلى/أسفل (بنش → سكوات) — بيوفر وقت. راحة 60-90ث بين السوبرسيتات.' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['rest pause', 'rest pause set', 'myo reps', 'cluster set', 'cluster sets'],
    keywordsAr: ['رست بوز', 'مايو ريبس', 'كلاستر سيت'],
    keywordsFranco: ['rest pause', 'myo reps', 'cluster set'],
    stateId: 'WK_MENU',
    response: { en: 'Rest-Pause: do a set to near failure, rest 10-15sec, do 3-5 more reps, rest 10-15sec, repeat. Gets more volume in less time. Cluster sets: heavy weight, 2-3 reps, 15-20sec rest, repeat ×4-5. Great for strength without fatigue. Both are advanced — master basics first!', ar: 'ريست بوز: اعمل سيت لقرب الفشل، راحة 10-15ث، 3-5 تكرارات تانية، راحة 10-15ث، كرر. حجم أكتر في وقت أقل. كلاستر سيت: وزن ثقيل، 2-3 تكرارات، 15-20ث راحة، كرر ×4-5. ممتاز للقوة بدون إرهاق. الاتنين متقدمين — اتقن الأساسيات الأول!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['time under tension', 'slow reps', 'tempo training', 'eccentric training', 'negative reps'],
    keywordsAr: ['وقت تحت التوتر', 'تكرارات بطيئة', 'تمرين بطيء', 'نيجاتيف'],
    keywordsFranco: ['wa2t ta7t el tawator', 'tekrarat bati2a', 'tamreen bati2', 'negative'],
    stateId: 'WK_MENU',
    response: { en: 'Time Under Tension (TUT): Slower reps = more muscle stimulus. Tempo: 3-1-2 (3sec down, 1sec pause, 2sec up). Negatives: 4-5sec on the lowering phase — causes more micro-tears = more growth. Use TUT for lagging body parts. Don\'t sacrifice weight — drop 20% and feel every rep!', ar: 'وقت تحت التوتر (TUT): تكرارات أبطأ = تحفيز عضلي أكتر. التيمبو: 3-1-2 (3ث نزول، 1ث ثبات، 2ث طلوع). نيجاتيف: 4-5ث في مرحلة النزول — بيسبب تمزقات أكتر = نمو أكتر. استخدم TUT للعضلات الضعيفة. متضحيش بالوزن — خفف 20% وحس بكل تكرار!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['giant set', 'giant sets', 'tri set', 'circuit training gym', 'circuit workout'],
    keywordsAr: ['جاينت سيت', 'تري سيت', 'سيركت ترينينج'],
    keywordsFranco: ['giant set', 'tri set', 'circuit training'],
    stateId: 'WK_MENU',
    response: { en: 'Giant sets: 3-4 exercises for the same muscle, no rest between. Example for shoulders: lateral raise → front raise → rear delt fly → overhead press. Rest 2min between rounds. Tri-sets: same idea but 3 exercises. Brutal pump, saves time, great for hypertrophy. Use lighter weights!', ar: 'جاينت سيت: 3-4 تمارين لنفس العضلة، بدون راحة بينهم. مثال للكتف: لاترال رايز → فرونت رايز → ريار دلت فلاي → أوفرهيد بريس. راحة 2 دقيقة بين الجولات. تري سيت: نفس الفكرة بس 3 تمارين. بمب وحشي، بيوفر وقت، ممتاز للتضخيم. استخدم أوزان أخف!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['blood flow restriction', 'bfr training', 'occlusion training', 'bands for pump'],
    keywordsAr: ['تدريب تقييد تدفق الدم', 'بي إف آر'],
    keywordsFranco: ['bfr training', 'occlusion training'],
    stateId: 'WK_MENU',
    response: { en: 'BFR (Blood Flow Restriction): wrap bands on upper arm/thigh at 6/10 tightness. Use 20-30% of 1RM. Do 30-15-15-15 reps with 30sec rest. Creates massive pump and growth stimulus with light weight. Great for: rehab, joint-friendly training, finishing exercises. Don\'t do on neck/torso!', ar: 'BFR (تقييد تدفق الدم): لف باندات على أعلى الذراع/الفخذ بضغط 6/10. استخدم 20-30% من الـ1RM. اعمل 30-15-15-15 تكرار مع 30ث راحة. بمب ضخم وتحفيز نمو بوزن خفيف. ممتاز لـ: إعادة التأهيل، تمرين صديق للمفاصل. متعملش على الرقبة/الجذع!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v18: Nutrition Timing & Strategy ────────────────────────
  {
    keywords: ['intermittent fasting', 'if diet', '16 8 fasting', 'fasting for fat loss', 'eating window'],
    keywordsAr: ['صيام متقطع', 'صيام 16 8', 'صيام للتنشيف', 'نافذة أكل'],
    keywordsFranco: ['seyam mota2te3', 'seyam 16 8', 'seyam lel tanshif', 'nafzet akl'],
    stateId: 'NT_MENU',
    response: { en: 'Intermittent Fasting (16:8): eat in 8hr window, fast 16hrs. Not magic — works because you eat less overall. OK for fat loss, harder for bulking. Tips: break fast with protein, train during eating window if possible, stay hydrated during fast. Don\'t force it if it hurts your training!', ar: 'الصيام المتقطع (16:8): كل في 8 ساعات، صوم 16 ساعة. مش سحر — بيشتغل عشان بتاكل أقل في المجمل. كويس للتنشيف، صعب للبالكينج. نصائح: افتح بالبروتين، تمرن في وقت الأكل لو ممكن، اشرب ميه كتير في الصيام. متجبرش نفسك لو بيأثر على تمرينك!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['carb cycling', 'carb timing', 'low carb days', 'high carb days', 'cycling carbs'],
    keywordsAr: ['تدوير الكاربز', 'توقيت الكارب', 'أيام كارب قليل', 'أيام كارب عالي'],
    keywordsFranco: ['tadwir el carbs', 'taw2it el carb', 'ayam carb 2alil', 'ayam carb 3aly'],
    stateId: 'NT_MENU',
    response: { en: 'Carb cycling: High carb on training days, low carb on rest days. Example: Training day = 3-4g/kg carbs. Rest day = 1-2g/kg carbs. Benefits: better performance on training days, increased fat burning on rest days. Keep protein constant (2g/kg). Not necessary but helpful for advanced athletes!', ar: 'تدوير الكاربز: كارب عالي أيام التمرين، كارب قليل أيام الراحة. مثال: يوم تمرين = 3-4ج/كيلو كارب. يوم راحة = 1-2ج/كيلو كارب. فوايد: أداء أحسن أيام التمرين، حرق دهون أكتر أيام الراحة. البروتين ثابت (2ج/كيلو). مش ضروري بس مفيد للمتقدمين!' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['cheat meal', 'cheat day', 'can i eat junk', 'refeed', 'refeed day', 'free meal'],
    keywordsAr: ['شيت ميل', 'يوم فري', 'ينفع اكل جانك', 'ريفيد', 'وجبة حرة'],
    keywordsFranco: ['cheat meal', 'yom free', 'yanfa3 akol junk', 'refeed', 'wagba 7orra'],
    stateId: 'NT_MENU',
    response: { en: 'Cheat meals vs refeeds: Refeed = planned high-carb day at maintenance calories (better approach). Cheat meal = eat whatever (risky for binge eaters). Guidelines: 1x/week max, one MEAL not a whole day, earn it with a good training week. Don\'t guilt trip — enjoy and get back on track next meal!', ar: 'شيت ميل ضد ريفيد: ريفيد = يوم كارب عالي مخطط عند كالوريز الصيانة (أحسن). شيت ميل = كل أي حاجة (خطر لو بتاكل كتير). قواعد: مرة/أسبوع ماكس، وجبة واحدة مش يوم كامل، استحقها بأسبوع تمرين كويس. متحسش بالذنب — استمتع وارجع للخطة الوجبة الجاية!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['pre workout meal', 'eat before gym', 'food before workout', 'what to eat before training'],
    keywordsAr: ['أكل قبل التمرين', 'وجبة قبل الجيم', 'اكل ايه قبل التمرين'],
    keywordsFranco: ['akl 2abl el tamreen', 'wagba 2abl el gym', 'akol eh 2abl el tamreen'],
    stateId: 'NT_MENU',
    response: { en: 'Pre-workout meal (1-2hrs before): Carbs + protein, low fat. Examples: rice + chicken, oats + whey, banana + peanut butter, bread + eggs. If <30min: just a banana or dates. Don\'t train on empty stomach if possible — you\'ll perform 20% better with fuel!', ar: 'وجبة قبل التمرين (1-2 ساعة قبل): كارب + بروتين، دهون قليلة. أمثلة: رز + فراخ، شوفان + واي، موزة + زبدة فول سوداني، عيش + بيض. لو أقل من 30 دقيقة: موزة أو تمر بس. متتمرنش على معدة فاضية لو ممكن — هتأدي 20% أحسن بالوقود!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['post workout meal', 'eat after gym', 'food after workout', 'what to eat after training', 'anabolic window'],
    keywordsAr: ['أكل بعد التمرين', 'وجبة بعد الجيم', 'اكل ايه بعد التمرين', 'النافذة الأنابوليكية'],
    keywordsFranco: ['akl ba3d el tamreen', 'wagba ba3d el gym', 'akol eh ba3d el tamreen'],
    stateId: 'NT_MENU',
    response: { en: 'Post-workout meal (within 2hrs): Protein (30-40g) + fast carbs. Examples: whey + banana, chicken + rice, eggs + bread, chocolate milk. The "anabolic window" is 2-4hrs, not 30min — don\'t stress. Daily protein total matters more than timing. But don\'t wait 6+ hours either!', ar: 'وجبة بعد التمرين (خلال ساعتين): بروتين (30-40ج) + كارب سريع. أمثلة: واي + موزة، فراخ + رز، بيض + عيش، لبن شوكولاتة. "النافذة الأنابوليكية" 2-4 ساعات، مش 30 دقيقة — متقلقش. مجموع البروتين اليومي أهم من التوقيت. بس متستناش 6+ ساعات!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v18: Women's Fitness ────────────────────────────────────
  {
    keywords: ['women strength training', 'girls lifting', 'will lifting make me bulky', 'women bulky', 'female lifting'],
    keywordsAr: ['بنات ورفع أثقال', 'الحديد هيكبرني', 'ستات وأوزان', 'البنات هتضخم'],
    keywordsFranco: ['banat we raf3 as2al', 'el 7adid haykabarny', 'setat we awzan'],
    stateId: 'QA_MENU',
    response: { en: 'Women WON\'T get bulky from lifting! Women have 15-20x less testosterone than men. Lifting gives you: toned shape, stronger bones, faster metabolism, better confidence. The "bulky" female bodybuilders use hormones — it won\'t happen naturally. Lift heavy, eat right, get the body you want!', ar: 'البنات مش هتضخم من الحديد! الستات عندهم 15-20 مرة تستوستيرون أقل من الرجالة. الحديد بيديكي: شكل مشدود، عظام أقوى، حرق أسرع، ثقة أحسن. لاعبات الكمال "الضخمة" بيستخدموا هرمونات — مش هيحصل طبيعياً. ارفعي أوزان، كلي صح، واحصلي على الجسم اللي عايزاه!' },
    priority: 9,
    domain: 'root',
  },
  {
    keywords: ['period workout', 'training on period', 'menstrual cycle gym', 'pms workout', 'exercise during period'],
    keywordsAr: ['تمرين في الدورة', 'تمرين أثناء الدورة الشهرية', 'الدورة والجيم'],
    keywordsFranco: ['tamreen fe el dawra', 'tamreen asna2 el dawra', 'el dawra wel gym'],
    stateId: 'QA_MENU',
    response: { en: 'Training around your cycle: Week 1-2 (follicular): estrogen rises — you\'re strongest! Push hard, PRs happen here. Week 3-4 (luteal): progesterone rises — energy drops, use lighter weights, more volume. Period days: listen to your body — light exercise helps cramps. Don\'t skip gym entirely — movement helps!', ar: 'التمرين حسب الدورة: أسبوع 1-2 (الجريبي): الإستروجين بيزيد — هتبقي أقوى! ادفعي بقوة، الأرقام الشخصية بتيجي هنا. أسبوع 3-4 (الأصفري): البروجسترون بيزيد — الطاقة بتنزل، أوزان أخف، حجم أكتر. أيام الدورة: اسمعي جسمك — تمرين خفيف بيساعد التقلصات. متفوتيش الجيم خالص — الحركة بتساعد!' },
    priority: 9,
    domain: 'root',
  },
  {
    keywords: ['pregnancy workout', 'exercise when pregnant', 'pregnant gym', 'postpartum exercise', 'after birth workout'],
    keywordsAr: ['تمرين في الحمل', 'تمرين أثناء الحمل', 'حامل والجيم', 'تمرين بعد الولادة'],
    keywordsFranco: ['tamreen fe el 7aml', 'tamreen asna2 el 7aml', '7amel wel gym', 'tamreen ba3d el welada'],
    stateId: 'QA_MENU',
    response: { en: 'Exercise during pregnancy is SAFE and recommended (with doctor approval)! Guidelines: avoid lying flat after 1st trimester, no contact sports, keep heart rate moderate, stay hydrated. Safe: walking, swimming, light weights, prenatal yoga. Postpartum: wait 6-8 weeks, start with walking, pelvic floor first!', ar: 'التمرين أثناء الحمل آمن ومطلوب (بموافقة الدكتور)! قواعد: بلاش تنامي على ضهرك بعد الترايمستر الأول، بلاش رياضات تلامس، خلي النبض معتدل، اشربي ميه. آمن: مشي، سباحة، أوزان خفيفة، يوجا حمل. بعد الولادة: استني 6-8 أسابيع، ابدأي بالمشي، قاع الحوض أولاً!' },
    priority: 9,
    domain: 'root',
  },
  {
    keywords: ['pcos workout', 'pcos diet', 'polycystic ovary', 'pcos and exercise'],
    keywordsAr: ['تكيس المبايض والتمرين', 'تكيس المبايض ودايت', 'بي سي أو إس'],
    keywordsFranco: ['takayos el mabayed wel tamreen', 'takayos el mabayed we diet', 'pcos'],
    stateId: 'QA_MENU',
    response: { en: 'PCOS & fitness: Exercise is one of the BEST treatments! Helps insulin sensitivity and hormone balance. Best: strength training 3-4x/week + moderate cardio 2-3x. Diet: reduce refined carbs, increase protein & fiber, anti-inflammatory foods. Avoid: extreme diets, over-exercising (raises cortisol). Consult your doctor for personalized advice!', ar: 'تكيس المبايض واللياقة: التمرين من أحسن العلاجات! بيحسن حساسية الإنسولين والتوازن الهرموني. أحسن: تمارين قوة 3-4 مرات/أسبوع + كارديو معتدل 2-3 مرات. الأكل: قللي الكارب المكرر، زودي البروتين والألياف. بلاش: دايت متطرف أو تمرين زيادة (بيزود الكورتيزول). استشيري الدكتور!' },
    priority: 9,
    domain: 'root',
  },

  // ── v18: Age-Specific Training ──────────────────────────────
  {
    keywords: ['training over 40', 'workout after 40', 'exercise over 40', 'fitness over 40', 'older lifter'],
    keywordsAr: ['تمرين فوق 40', 'رياضة بعد الأربعين', 'تمرين كبار السن'],
    keywordsFranco: ['tamreen fo2 40', 'reyada ba3d el arb3in'],
    stateId: 'QA_MENU',
    response: { en: 'Training over 40: You can ABSOLUTELY build muscle and strength! Adjustments: 1) Longer warm-ups (15min) 2) More recovery time between heavy sessions 3) Prioritize joint health (mobility work) 4) Moderate rep ranges (8-15) 5) Don\'t skip deloads 6) Sleep and nutrition become even MORE important. Age is not an excuse!', ar: 'تمرين فوق 40: تقدر بالتأكيد تبني عضلات وقوة! تعديلات: 1) تسخين أطول (15 دقيقة) 2) وقت ريكفري أكتر بين الحصص الثقيلة 3) أهتم بالمفاصل (موبيليتي) 4) تكرارات معتدلة (8-15) 5) متفوتش الديلود 6) النوم والتغذية بيبقوا أهم. العمر مش عذر!' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['training over 50', 'workout after 50', 'exercise over 50', 'senior fitness', 'senior workout'],
    keywordsAr: ['تمرين فوق 50', 'رياضة بعد الخمسين', 'تمرين لكبار السن'],
    keywordsFranco: ['tamreen fo2 50', 'reyada ba3d el 5amsin'],
    stateId: 'QA_MENU',
    response: { en: 'Fitness over 50: Focus on: 1) Functional strength (carrying, lifting, balance) 2) Bone density (weight-bearing exercise prevents osteoporosis) 3) Flexibility & mobility daily 4) 2-3 strength sessions/week 5) Walking 30min daily 6) Balance exercises (prevent falls). It\'s never too late to start — even 70+ year olds gain muscle!', ar: 'اللياقة فوق 50: ركز على: 1) قوة وظيفية (شيل، رفع، توازن) 2) كثافة العظام (التمارين بأوزان بتمنع هشاشة العظام) 3) مرونة وموبيليتي يومياً 4) 2-3 حصص قوة/أسبوع 5) مشي 30 دقيقة يومياً 6) تمارين توازن (منع السقوط). مش متأخر أبداً — حتى اللي فوق 70 بيبنوا عضلات!' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['kid exercise', 'child fitness', 'exercise for kids', 'children workout', 'youth training'],
    keywordsAr: ['تمارين أطفال', 'لياقة أطفال', 'رياضة للأطفال'],
    keywordsFranco: ['tamarin atfal', 'leya2a atfal', 'reyada lel atfal'],
    stateId: 'QA_MENU',
    response: { en: 'Kids fitness (6-13): Focus on FUN! 1) Sports (football, swimming, martial arts) 2) Bodyweight exercises (push-ups, pull-ups, squats) 3) Running & playground games 4) No heavy weights until 14+ 5) Aim for 60min activity daily 6) Teach form early. Let them discover what they enjoy — consistency comes from fun!', ar: 'لياقة الأطفال (6-13): ركز على المتعة! 1) رياضة (كرة قدم، سباحة، فنون قتالية) 2) تمارين جسم (بوش اب، بول اب، سكوات) 3) جري وألعاب 4) بلاش أوزان تقيلة لحد 14+ 5) استهدف 60 دقيقة نشاط يومياً 6) علمهم الفورم بدري. خليهم يكتشفوا اللي بيحبوه — الالتزام بييجي من المتعة!' },
    priority: 7,
    domain: 'root',
  },

  // ── v18: Common Health Metrics ──────────────────────────────
  {
    keywords: ['bmr', 'basal metabolic rate', 'how many calories do i burn', 'resting metabolism', 'metabolism'],
    keywordsAr: ['معدل الأيض الأساسي', 'كام كالوري بحرق', 'الأيض'],
    keywordsFranco: ['mo3adal el ayed el asasy', 'kam calorie ba7ra2', 'el ayed'],
    stateId: 'HL_MENU',
    response: { en: 'BMR = calories your body burns at rest. Formula (Mifflin-St Jeor): Men: 10×weight(kg) + 6.25×height(cm) - 5×age - 5. Women: same but -161. Then multiply by activity: Sedentary ×1.2, Light ×1.375, Moderate ×1.55, Very Active ×1.725. This gives your TDEE (total daily expenditure). Eat below for fat loss, above for muscle gain!', ar: 'BMR = كالوريز جسمك بيحرقها وهو مرتاح. المعادلة: رجال: 10×الوزن(كج) + 6.25×الطول(سم) - 5×العمر - 5. ستات: نفس بس -161. بعدين اضرب في النشاط: خامل ×1.2، خفيف ×1.375، معتدل ×1.55، نشيط جداً ×1.725. ده بيديك TDEE. كل أقل للتنشيف، أكتر للتضخيم!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['bmi', 'body mass index', 'am i overweight', 'what is my bmi', 'ideal weight'],
    keywordsAr: ['مؤشر كتلة الجسم', 'وزني زيادة', 'الوزن المثالي'],
    keywordsFranco: ['mo2asher ketlet el gesm', 'wazny zyada', 'el wazn el mesaly'],
    stateId: 'HL_MENU',
    response: { en: 'BMI = weight(kg) / height(m)². Ranges: <18.5 underweight, 18.5-24.9 normal, 25-29.9 overweight, 30+ obese. BUT BMI doesn\'t account for muscle! A muscular person can be "overweight" by BMI but very healthy. Better metrics: body fat %, waist circumference, how you look and feel.', ar: 'BMI = الوزن(كج) / الطول(م)². المدى: أقل من 18.5 نحافة، 18.5-24.9 طبيعي، 25-29.9 وزن زايد، 30+ سمنة. بس BMI مش بيحسب العضلات! شخص عضلي ممكن يبقى "وزن زايد" بالBMI بس صحي جداً. مقاييس أحسن: نسبة الدهون، محيط الوسط، شكلك وإحساسك.' },
    priority: 7,
    domain: 'health',
  },

  // ── v19: Sport-Specific Training ────────────────────────────
  {
    keywords: ['football training', 'soccer training', 'soccer gym', 'gym for football', 'football conditioning'],
    keywordsAr: ['تمرين كورة', 'تمرين لكرة القدم', 'جيم لكرة القدم', 'تكييف كورة'],
    keywordsFranco: ['tamreen kora', 'tamreen le koret el 2adam', 'gym le koret el 2adam'],
    stateId: 'WK_MENU',
    response: { en: 'Football/Soccer gym work: 1) Squats & deadlifts (power) 2) Single-leg exercises (lunges, Bulgarian split squats) 3) Plyometrics (box jumps, bounds) 4) Core work (anti-rotation, pallof press) 5) Sprint intervals 6) Hamstring focus (Nordic curls — injury prevention). Train 2-3x/week in-season, 4x off-season.', ar: 'تمرين جيم لكرة القدم: 1) سكوات وديدلفت (قوة) 2) تمارين رجل واحدة (لانجز، بلغاري) 3) بلايومتركس (بوكس جامبز) 4) كور (anti-rotation، pallof press) 5) سبرنت متقطع 6) هامسترنج (Nordic curls — وقاية إصابات). تمرن 2-3 مرات/أسبوع في الموسم، 4 مرات بره.' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['basketball training', 'basketball gym', 'vertical jump', 'jump higher', 'dunk training'],
    keywordsAr: ['تمرين باسكت', 'نط أعلى', 'تمرين العامودي'],
    keywordsFranco: ['tamreen basket', 'nat a3la', 'tamreen el 3amoody'],
    stateId: 'WK_MENU',
    response: { en: 'Basketball/Vertical jump training: 1) Squats & trap bar deadlifts (base strength) 2) Box jumps & depth jumps (explosive power) 3) Single-leg work (pistol squats, step-ups) 4) Calf raises (heavy) 5) Core & hip flexor work 6) Sprint drills. Increase squat to 1.5x bodyweight and your vertical will jump 4-6 inches!', ar: 'تمرين باسكت/نط عامودي: 1) سكوات وتراب بار ديدلفت (قوة أساسية) 2) بوكس جامبز ودبث جامبز (قوة انفجارية) 3) تمارين رجل واحدة 4) كاف رايز (ثقيل) 5) كور و hip flexor 6) سبرنت. زود السكوات ل1.5× وزنك وهتلاقي النط زاد 10-15 سم!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['swimming training', 'gym for swimming', 'swimming dryland', 'swimmer workout'],
    keywordsAr: ['تمرين سباحة', 'جيم للسباحة', 'تمرين سباحين'],
    keywordsFranco: ['tamreen seba7a', 'gym lel seba7a', 'tamreen saba7in'],
    stateId: 'WK_MENU',
    response: { en: 'Gym work for swimmers: 1) Lat pulldowns & pull-ups (back power) 2) Shoulder work (external rotation, face pulls — injury prevention) 3) Core (planks, pallof press, dead bugs) 4) Squats (start/turns power) 5) Plyometric push-ups. Focus on shoulder mobility and injury prevention!', ar: 'تمرين جيم للسباحين: 1) لات بولداون وبول اب (قوة الظهر) 2) كتف (روتيشن خارجي، فيس بولز — وقاية إصابات) 3) كور (بلانك، بالوف بريس، ديد باجز) 4) سكوات (قوة البداية/الدوران) 5) بوش اب بلايومتري. ركز على مرونة الكتف والوقاية من الإصابات!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['martial arts conditioning', 'boxing conditioning', 'mma training', 'fight conditioning', 'combat sport gym'],
    keywordsAr: ['تكييف فنون قتالية', 'تكييف ملاكمة', 'تمرين إم إم إيه'],
    keywordsFranco: ['takyif fonon 2etalya', 'takyif molakma', 'tamreen mma'],
    stateId: 'WK_MENU',
    response: { en: 'Combat sport conditioning: 1) Explosive movements (cleans, kettlebell swings, med ball slams) 2) Grip strength (farmer walks, dead hangs) 3) Neck training (safety!) 4) Rotational core (Russian twists, wood chops) 5) HIIT rounds (3min work/1min rest to simulate rounds) 6) Pull-ups & dips for grappling strength.', ar: 'تكييف رياضات قتالية: 1) حركات انفجارية (كلينز، كيتلبل سوينج، ميد بول) 2) قوة قبضة (فارمر ووك، ديد هانج) 3) تمرين رقبة (أمان!) 4) كور دوراني (روشن تويست، وود شوبز) 5) HIIT جولات (3 دقايق شغل/1 دقيقة راحة لمحاكاة الجولات) 6) بول اب وديبس لقوة المصارعة.' },
    priority: 7,
    domain: 'workout',
  },

  // ── v19: Mental Performance ─────────────────────────────────
  {
    keywords: ['mind muscle connection', 'feel the muscle', 'cant feel muscle', 'muscle activation', 'squeeze the muscle'],
    keywordsAr: ['اتصال عقل عضلة', 'مش حاسس بالعضلة', 'تفعيل العضلة', 'اعصر العضلة'],
    keywordsFranco: ['etesal 3a2l 3adala', 'msh 7ases bel 3adala', 'taf3il el 3adala', 'e3sor el 3adala'],
    stateId: 'WK_MENU',
    response: { en: 'Mind-muscle connection tips: 1) Lower the weight 20-30% 2) Close your eyes during the set 3) Touch the target muscle before the set 4) Squeeze at the top for 2sec 5) Use slow tempo (3sec down, 2sec up) 6) Pre-exhaust with isolation before compound. It\'s a skill — gets better with practice!', ar: 'نصائح اتصال عقل-عضلة: 1) خفف الوزن 20-30% 2) غمض عينك أثناء السيت 3) المس العضلة المستهدفة قبل السيت 4) اعصر في الأعلى 2 ثانية 5) تيمبو بطيء (3ث نزول، 2ث طلوع) 6) عزل قبل compound. ده مهارة — بتتحسن مع الممارسة!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['gym music', 'workout playlist', 'best music for gym', 'what to listen to gym'],
    keywordsAr: ['موسيقى الجيم', 'بلايليست تمرين', 'اسمع ايه في الجيم'],
    keywordsFranco: ['mose2a el gym', 'playlist tamreen', 'esma3 eh fe el gym'],
    stateId: 'QA_MENU',
    response: { en: 'Music boosts performance up to 15%! Best tempos: warm-up (120-130 BPM), heavy lifts (140-150+ BPM), cardio (130-150 BPM). Studies show aggressive music increases strength output. Egyptian gym favorites: Mahraganat for heavy sets, Amr Diab for cardio. Find YOUR hype song!', ar: 'الموسيقى بتزود الأداء لحد 15%! أحسن إيقاع: تسخين (120-130 BPM)، رفع ثقيل (140-150+ BPM)، كارديو (130-150 BPM). الدراسات بتقول الموسيقى العنيفة بتزود القوة. مفضلات الجيم المصرية: مهرجانات للرفع الثقيل، عمرو دياب للكارديو. لاقي أغنيتك المحفزة!' },
    priority: 5,
    domain: 'root',
  },
  {
    keywords: ['visualization', 'mental rehearsal', 'imagine workout', 'mental training', 'mental game gym'],
    keywordsAr: ['تصور ذهني', 'تدريب ذهني', 'تخيل التمرين'],
    keywordsFranco: ['tasawor zehny', 'tadrib zehny', 'ta5ayol el tamreen'],
    stateId: 'QA_MENU',
    response: { en: 'Visualization works! Studies show mentally rehearsing lifts improves performance. Before a heavy set: close your eyes, visualize yourself completing the lift with perfect form, feel the weight. Top athletes use this. Also: set goals, journal your workouts, celebrate wins. The gym is 50% mental!', ar: 'التصور الذهني بيشتغل! الدراسات بتقول تخيل الرفعات بيحسن الأداء. قبل السيت الثقيل: غمض عينك، تخيل نفسك بتكمل الرفعة بفورم مثالي، حس بالوزن. أقوى الرياضيين بيعملوا كده. كمان: حط أهداف، سجل تمارينك، احتفل بالإنجازات. الجيم 50% عقلي!' },
    priority: 6,
    domain: 'root',
  },

  // ── v19: Gym Equipment Guide ────────────────────────────────
  {
    keywords: ['home gym setup', 'home gym equipment', 'what to buy for home gym', 'garage gym', 'home gym budget'],
    keywordsAr: ['تجهيز جيم بيتي', 'معدات جيم البيت', 'اشتري ايه لجيم البيت'],
    keywordsFranco: ['taghiz gym bety', 'mo3edat gym el beit', 'ashtery eh le gym el beit'],
    stateId: 'QA_MENU',
    response: { en: 'Home gym essentials (priority order): 1) Adjustable dumbbells (most versatile) 2) Pull-up bar (door frame, $20) 3) Resistance bands set 4) Flat/incline bench 5) Barbell + plates (if space allows). Budget option: bands + pull-up bar + dumbbells = under 3000 LE and you can train everything!', ar: 'أساسيات جيم البيت (بالأولوية): 1) دمبل قابل للتعديل (أكتر حاجة متعددة) 2) بار عقلة (باب، رخيص) 3) مجموعة باندات مقاومة 4) بنش فلات/إنكلاين 5) بار + أوزان (لو في مساحة). ميزانية: باندات + عقلة + دمبلز = تحت 3000 جنيه وتقدر تتمرن كل حاجة!' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['lifting belt', 'weight belt', 'when to use belt', 'do i need a belt', 'gym belt'],
    keywordsAr: ['حزام رفع', 'حزام أوزان', 'امتى استخدم الحزام', 'محتاج حزام'],
    keywordsFranco: ['7ezam raf3', '7ezam awzan', 'emta asta5dem el 7ezam', 'me7tag 7ezam'],
    stateId: 'WK_MENU',
    response: { en: 'Lifting belt guide: Use when: squats/deadlifts at 80%+ of max. DON\'T use for everything — your core needs to work! How: take a big breath into your belly, push against the belt (Valsalva). Belt ≠ back protection — it\'s a bracing tool. 10mm, lever or prong buckle. Don\'t use for bicep curls!', ar: 'دليل حزام الرفع: استخدم لما: سكوات/ديدلفت عند 80%+ من الماكس. متستخدمهوش لكل حاجة — الكور محتاج يشتغل! ازاي: خد نفس كبير في بطنك، ادفع ضد الحزام (Valsalva). الحزام مش حماية للضهر — أداة bracing. 10مم، lever أو prong. متلبسوش للبايسب كيرل!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['wrist wraps', 'knee sleeves', 'gym accessories', 'lifting straps', 'gym gloves'],
    keywordsAr: ['رباط معصم', 'كم ركبة', 'اكسسوارات جيم', 'شرائط رفع', 'جلافز جيم'],
    keywordsFranco: ['rebat mo3sam', 'kom rokba', 'accessories gym', 'sharayed raf3', 'gloves gym'],
    stateId: 'QA_MENU',
    response: { en: 'Gym accessories guide: Wrist wraps: for heavy pressing (bench, OHP). Knee sleeves: warmth + mild support (squats). Lifting straps: for heavy pulls when grip fails (deadlift, rows). Gloves: not recommended (reduce grip strength). Chalk > gloves always. Buy in order of need, not all at once!', ar: 'دليل اكسسوارات الجيم: رباط معصم: للضغط الثقيل (بنش، OHP). كم ركبة: دفا + دعم خفيف (سكوات). شرائط رفع: للسحب الثقيل لما القبضة تتعب (ديدلفت، رو). جلافز: مش مستحسنة (بتقلل قوة القبضة). الطباشير أحسن من الجلافز دايماً. اشتري حسب الحاجة!' },
    priority: 6,
    domain: 'root',
  },
  {
    keywords: ['shoes for gym', 'lifting shoes', 'best gym shoes', 'squat shoes', 'flat shoes gym'],
    keywordsAr: ['حذاء الجيم', 'حذاء رفع', 'احسن حذاء جيم', 'حذاء سكوات'],
    keywordsFranco: ['7eza2 el gym', '7eza2 raf3', 'a7san 7eza2 gym', '7eza2 squat'],
    stateId: 'QA_MENU',
    response: { en: 'Gym shoes: For lifting: flat sole shoes (Converse, Vans) or dedicated lifting shoes (heeled for squats). AVOID running shoes for lifting — squishy soles = unstable. For deadlifts: flat or barefoot. For squats: heeled lifting shoes or flat with heel wedge. Budget: Converse work perfectly!', ar: 'حذاء الجيم: للرفع: حذاء نعل مسطح (كونفرس، فانز) أو حذاء رفع مخصوص (كعب للسكوات). بلاش أحذية جري للرفع — النعل الطري = مش مستقر. للديدلفت: مسطح أو حافي. للسكوات: حذاء رفع بكعب أو مسطح مع heel wedge. ميزانية: كونفرس ممتاز!' },
    priority: 6,
    domain: 'root',
  },

  // ── v19: Cooking for Athletes ───────────────────────────────
  {
    keywords: ['high protein recipe', 'protein recipe', 'bodybuilding recipe', 'gym food recipe', 'fitness recipe'],
    keywordsAr: ['وصفة بروتين عالي', 'وصفة بروتين', 'وصفة بودي بيلدنج', 'وصفة أكل جيم'],
    keywordsFranco: ['wasfa protein 3aly', 'wasfa protein', 'wasfa bodybuilding', 'wasfa akl gym'],
    stateId: 'NT_MENU',
    response: { en: 'Quick high-protein recipes: 1) Protein oats: oats + whey + banana + PB = 40g protein 2) Greek yogurt bowl: yogurt + honey + nuts + berries = 25g 3) Egg muffins: 6 eggs + veggies, bake 20min = 36g 4) Tuna rice bowl: tuna + rice + avocado = 35g 5) Chicken stir-fry: chicken + veggies + rice = 45g. All under 30min!', ar: 'وصفات بروتين سريعة: 1) شوفان بروتين: شوفان + واي + موزة + زبدة فول = 40ج 2) زبادي يوناني: زبادي + عسل + مكسرات = 25ج 3) مافن بيض: 6 بيضات + خضار، فرن 20 دقيقة = 36ج 4) بول تونة: تونة + رز + أفوكادو = 35ج 5) ستير فراي: فراخ + خضار + رز = 45ج. كلهم تحت 30 دقيقة!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['protein shake recipe', 'smoothie recipe', 'post workout shake', 'homemade shake', 'mass gainer shake'],
    keywordsAr: ['وصفة شيك بروتين', 'وصفة سموذي', 'شيك بعد التمرين', 'شيك بيتي'],
    keywordsFranco: ['wasfa shake protein', 'wasfa smoothie', 'shake ba3d el tamreen', 'shake bety'],
    stateId: 'NT_MENU',
    response: { en: 'Shake recipes: 1) Classic: whey + banana + milk + oats (500 cal, 40g protein) 2) Mass gainer: whey + PB + banana + oats + whole milk (800 cal, 50g) 3) Cutting: whey + water + ice + berries (150 cal, 30g) 4) Egyptian style: whey + full cream milk + dates + tahini (600 cal, 45g). Blend and enjoy!', ar: 'وصفات شيك: 1) كلاسيك: واي + موزة + لبن + شوفان (500 كالوري، 40ج بروتين) 2) ماس جينر: واي + زبدة فول + موزة + شوفان + لبن كامل (800 كالوري، 50ج) 3) تنشيف: واي + ميه + تلج + توت (150 كالوري، 30ج) 4) مصري: واي + لبن كامل + تمر + طحينة (600 كالوري، 45ج). اخلط واستمتع!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['snack ideas', 'healthy snack', 'gym snack', 'snack between meals', 'quick snack'],
    keywordsAr: ['أفكار سناك', 'سناك صحي', 'سناك جيم', 'سناك بين الوجبات'],
    keywordsFranco: ['afkar snack', 'snack se7y', 'snack gym', 'snack bein el wagabat'],
    stateId: 'NT_MENU',
    response: { en: 'Healthy gym snacks: 1) Greek yogurt + honey (20g protein) 2) Handful of nuts (healthy fats) 3) Boiled eggs (13g protein/2 eggs) 4) Apple + peanut butter 5) Tuna on crackers 6) Protein bar 7) Cottage cheese + fruits 8) Egyptian: ful sandwich, lupini (ترمس), roasted chickpeas. Keep snacks under 300 cal!', ar: 'سناكات صحية للجيم: 1) زبادي يوناني + عسل (20ج بروتين) 2) حفنة مكسرات (دهون صحية) 3) بيض مسلوق (13ج بروتين/2 بيضة) 4) تفاحة + زبدة فول سوداني 5) تونة على بسكوت 6) بروتين بار 7) جبنة قريش + فاكهة 8) مصري: ساندوتش فول، ترمس، حمص محمص. السناك تحت 300 كالوري!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v19: Weight Management Patterns ─────────────────────────
  {
    keywords: ['water weight', 'water retention', 'bloated', 'bloating', 'swollen', 'puffy face'],
    keywordsAr: ['احتباس ميه', 'ميه زيادة', 'منتفخ', 'انتفاخ', 'وشي منفوخ'],
    keywordsFranco: ['e7tebas maya', 'maya zyada', 'montefekh', 'entefakh', 'weshy manfookh'],
    stateId: 'HL_MENU',
    response: { en: 'Water retention causes: high sodium, low water intake, high carbs, stress, poor sleep, menstrual cycle. Fix: 1) DRINK MORE water (counterintuitive but works) 2) Reduce sodium 3) Increase potassium (bananas, potatoes) 4) Sweat (sauna/exercise) 5) Reduce stress. Weight can fluctuate 1-3kg daily from water — don\'t panic!', ar: 'أسباب احتباس الميه: صوديوم عالي، ميه قليلة، كارب عالي، توتر، نوم وحش، الدورة الشهرية. الحل: 1) اشرب ميه أكتر (عكسي بس بيشتغل) 2) قلل الملح 3) زود البوتاسيوم (موز، بطاطس) 4) اعرق (ساونا/تمرين) 5) قلل التوتر. الوزن بيتغير 1-3 كيلو يومياً من الميه — متقلقش!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['weight fluctuation', 'scale weight', 'why weight changes', 'weight up overnight', 'weigh in tips'],
    keywordsAr: ['تغير الوزن', 'الميزان', 'ليه الوزن بيتغير', 'الوزن زاد فجأة'],
    keywordsFranco: ['taghyor el wazn', 'el mizan', 'leh el wazn beyetghayar', 'el wazn zad fag2a'],
    stateId: 'HL_MENU',
    response: { en: 'Scale weight lies! Daily fluctuations of 1-3kg are NORMAL. Causes: water, food in stomach, sodium, carbs, fiber, bathroom timing, stress. Best practice: weigh daily, same time (morning, after bathroom, before food), track WEEKLY AVERAGE. The trend over weeks matters, not daily numbers!', ar: 'الميزان بيكدب! تغيرات يومية 1-3 كيلو طبيعية. الأسباب: ميه، أكل في المعدة، ملح، كارب، ألياف، توقيت الحمام، توتر. الصح: اتوزن يومياً، نفس الوقت (الصبح، بعد الحمام، قبل الأكل)، تابع المتوسط الأسبوعي. الاتجاه على الأسابيع هو المهم، مش الأرقام اليومية!' },
    priority: 7,
    domain: 'health',
  },

  // ── v20: Macro Counting & Tracking ──────────────────────────
  {
    keywords: ['how to count macros', 'count macros', 'macro tracking', 'what are macros', 'macros explained', 'iifym'],
    keywordsAr: ['ازاي احسب الماكروز', 'حساب الماكروز', 'ايه الماكروز', 'تتبع الماكروز'],
    keywordsFranco: ['ezay a7seb el macros', '7esab el macros', 'eh el macros', 'tatabo3 el macros'],
    stateId: 'NT_MENU',
    response: { en: 'Macro counting 101: Macros = Protein (4 cal/g) + Carbs (4 cal/g) + Fat (9 cal/g). Step 1: Calculate TDEE. Step 2: Set protein (2g/kg). Step 3: Set fat (0.8-1g/kg). Step 4: Fill rest with carbs. Track using this app! IIFYM = "If It Fits Your Macros" — flexible dieting. Accuracy > perfection!', ar: 'حساب الماكروز 101: الماكروز = بروتين (4 كالوري/ج) + كارب (4 كالوري/ج) + دهون (9 كالوري/ج). خطوة 1: احسب TDEE. خطوة 2: حدد البروتين (2ج/كيلو). خطوة 3: حدد الدهون (0.8-1ج/كيلو). خطوة 4: كمل الباقي كارب. تابع بالابلكيشن! IIFYM = دايت مرن. الدقة أهم من الكمال!' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['how much protein', 'protein per day', 'daily protein', 'protein intake', 'protein requirement'],
    keywordsAr: ['كام بروتين', 'بروتين في اليوم', 'بروتين يومي', 'كمية البروتين'],
    keywordsFranco: ['kam protein', 'protein fe el yom', 'protein yomy', 'kamyet el protein'],
    stateId: 'NT_MENU',
    response: { en: 'Protein needs: General fitness: 1.4-1.6g/kg. Building muscle: 1.6-2.2g/kg. Cutting: 2.0-2.5g/kg (higher to preserve muscle). Example: 80kg person building muscle = 128-176g/day. Spread across 4-5 meals (30-40g each). Protein sources: chicken, fish, eggs, dairy, legumes, whey.', ar: 'احتياج البروتين: لياقة عامة: 1.4-1.6ج/كيلو. بناء عضلات: 1.6-2.2ج/كيلو. تنشيف: 2.0-2.5ج/كيلو (أعلى للحفاظ على العضلات). مثال: 80 كيلو بناء عضلات = 128-176ج/يوم. وزعهم على 4-5 وجبات (30-40ج كل وجبة). مصادر: فراخ، سمك، بيض، ألبان، بقوليات، واي.' },
    priority: 9,
    domain: 'nutrition',
  },
  {
    keywords: ['how much fat', 'fat per day', 'daily fat', 'fat intake', 'healthy fats how much'],
    keywordsAr: ['كام دهون', 'دهون في اليوم', 'دهون يومي', 'كمية الدهون'],
    keywordsFranco: ['kam dohon', 'dohon fe el yom', 'dohon yomy', 'kamyet el dohon'],
    stateId: 'NT_MENU',
    response: { en: 'Fat intake: Minimum 0.5g/kg (don\'t go below — hormones need fat!). Optimal: 0.8-1.2g/kg. That\'s 20-35% of total calories. Healthy fats: olive oil, avocado, nuts, fatty fish, eggs. Limit: trans fats (fried food, margarine), excessive saturated fat. Fat doesn\'t make you fat — excess calories do!', ar: 'كمية الدهون: الحد الأدنى 0.5ج/كيلو (متنزلش تحت — الهرمونات محتاجة دهون!). مثالي: 0.8-1.2ج/كيلو. ده 20-35% من إجمالي الكالوريز. دهون صحية: زيت زيتون، أفوكادو، مكسرات، سمك دهني، بيض. قلل: دهون متحولة (مقلي، مارجرين). الدهون مش بتتخن — الكالوريز الزيادة هي اللي بتتخن!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['how much carbs', 'carbs per day', 'daily carbs', 'carb intake', 'are carbs bad'],
    keywordsAr: ['كام كارب', 'كارب في اليوم', 'كارب يومي', 'الكاربز وحشة'],
    keywordsFranco: ['kam carb', 'carb fe el yom', 'carb yomy', 'el carbs we7sha'],
    stateId: 'NT_MENU',
    response: { en: 'Carbs are NOT the enemy! They\'re your body\'s preferred fuel for intense training. Intake: Bulking: 3-5g/kg. Maintenance: 2-4g/kg. Cutting: 1-3g/kg. Best sources: rice, oats, potatoes, bread, fruits, pasta. Time them around workouts for best performance. Low carb = low energy in the gym!', ar: 'الكاربز مش العدو! هم وقود الجسم المفضل للتمرين المكثف. الكمية: بالكينج: 3-5ج/كيلو. صيانة: 2-4ج/كيلو. تنشيف: 1-3ج/كيلو. أحسن مصادر: رز، شوفان، بطاطس، عيش، فاكهة، مكرونة. وقتهم حوالين التمرين. كارب قليل = طاقة قليلة في الجيم!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['fiber intake', 'fiber foods', 'how much fiber', 'constipation diet', 'gut health diet'],
    keywordsAr: ['ألياف', 'أكل ألياف', 'كام ألياف', 'إمساك', 'صحة الأمعاء'],
    keywordsFranco: ['alyaf', 'akl alyaf', 'kam alyaf', 'emsak', 'se7et el am3a2'],
    stateId: 'NT_MENU',
    response: { en: 'Fiber guide: Target 25-35g/day. High-fiber foods: oats (4g/cup), lentils (15g/cup), broccoli (5g/cup), apples (4g), chia seeds (10g/oz), beans (8-10g/cup). Benefits: better digestion, fullness, blood sugar control. Increase slowly + drink more water or you\'ll get bloated!', ar: 'دليل الألياف: استهدف 25-35ج/يوم. أكل غني بالألياف: شوفان (4ج/كوب)، عدس (15ج/كوب)، بروكلي (5ج/كوب)، تفاح (4ج)، بذور شيا (10ج/أونصة)، فاصوليا (8-10ج/كوب). فوايد: هضم أحسن، شبع، تحكم في السكر. زود ببطء + اشرب ميه أكتر وإلا هتنتفخ!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v20: Posture & Desk Workers ─────────────────────────────
  {
    keywords: ['fix posture', 'bad posture', 'posture correction', 'rounded shoulders', 'forward head', 'desk posture'],
    keywordsAr: ['تصحيح الوقفة', 'وقفة غلط', 'أكتاف مدورة', 'رقبة مايلة', 'وقفة المكتب'],
    keywordsFranco: ['tas7i7 el wa2fa', 'wa2fa ghalat', 'aktaf medawara', 'ra2ba mayla', 'wa2fat el maktab'],
    stateId: 'HL_MENU',
    response: { en: 'Fix posture: 1) Strengthen back: face pulls, band pull-aparts, rows (3x/week) 2) Stretch chest: doorway stretch 30sec ×3 3) Chin tucks: 15 reps ×3/day (fixes forward head) 4) Wall angels: 10 reps/day 5) Stand up every 30min 6) Screen at eye level. Most posture issues come from weak back + tight chest!', ar: 'صحح الوقفة: 1) قوي الضهر: فيس بولز، باند بول-اپارت، رو (3 مرات/أسبوع) 2) استرتش الصدر: doorway stretch 30ث ×3 3) Chin tucks: 15 ×3/يوم (بيصلح الرأس الأمامي) 4) Wall angels: 10/يوم 5) قوم كل 30 دقيقة 6) الشاشة عند مستوى العين. أغلب مشاكل الوقفة من ضهر ضعيف + صدر مشدود!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['lower back pain', 'back pain desk', 'office back pain', 'sit all day back', 'sciatica exercise'],
    keywordsAr: ['ألم أسفل الظهر', 'وجع الضهر', 'ألم ضهر المكتب', 'عرق النسا'],
    keywordsFranco: ['alam asfal el dahr', 'waga3 el dahr', 'alam dahr el maktab', '3er2 el nasa'],
    stateId: 'HL_MENU',
    response: { en: 'Lower back pain (desk workers): 1) Bird dogs: 10/side ×3 2) Dead bugs: 10/side ×3 3) Glute bridges: 15 ×3 4) Cat-cow: 10 ×3 5) Hip flexor stretch: 30sec/side. Strengthen core + glutes, stretch hip flexors. AVOID: sit-ups, heavy deadlifts when in pain. If pain persists >2 weeks or radiates to legs, see a doctor!', ar: 'ألم أسفل الضهر (الموظفين): 1) Bird dogs: 10/جانب ×3 2) Dead bugs: 10/جانب ×3 3) Glute bridges: 15 ×3 4) Cat-cow: 10 ×3 5) استرتش hip flexor: 30ث/جانب. قوي الكور + المؤخرة، استرتش hip flexors. بلاش: sit-ups، ديدلفت ثقيل وانت بتوجعك. لو الألم مستمر أكتر من أسبوعين أو بينزل في الرجل، روح دكتور!' },
    priority: 9,
    domain: 'health',
  },
  {
    keywords: ['desk exercise', 'office exercise', 'exercise at work', 'stretches at desk', 'work break exercise'],
    keywordsAr: ['تمارين المكتب', 'تمارين في الشغل', 'استرتش في المكتب'],
    keywordsFranco: ['tamarin el maktab', 'tamarin fe el shogl', 'stretch fe el maktab'],
    stateId: 'WK_MENU',
    response: { en: 'Office exercises (no equipment): Every 30-60min: 1) Desk push-ups ×15 2) Chair squats ×15 3) Wall sit 30sec 4) Neck rolls 5) Wrist circles 6) Stand + calf raises ×20. Stretches: chest stretch in doorway, hip flexor stretch, hamstring stretch against wall. Small movements prevent stiffness!', ar: 'تمارين المكتب (بدون معدات): كل 30-60 دقيقة: 1) بوش اب على المكتب ×15 2) سكوات كرسي ×15 3) وول سيت 30ث 4) دوائر رقبة 5) دوائر رسغ 6) وقف + كاف رايز ×20. استرتش: صدر في الباب، hip flexor، هامسترنج على الحيطة. حركات صغيرة بتمنع التيبس!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v20: Competition Prep (Bodybuilding) ────────────────────
  {
    keywords: ['competition prep', 'bodybuilding competition', 'physique competition', 'stage ready', 'show prep'],
    keywordsAr: ['تحضير بطولة', 'بطولة كمال أجسام', 'بطولة فيزيك', 'جاهز للمسرح'],
    keywordsFranco: ['ta7dir batola', 'batolt kamal agsam', 'batolt physique', 'gahez lel masra7'],
    stateId: 'QA_MENU',
    response: { en: 'Competition prep basics: Start 12-16 weeks out. Phase 1 (12-8w): gradual calorie drop, increase cardio slowly. Phase 2 (8-4w): tighter diet, 4-5 cardio sessions. Phase 3 (4-1w): peak week, water/carb manipulation. GET A COACH for your first show! Prep is mentally and physically extreme — don\'t do it alone.', ar: 'أساسيات تحضير البطولة: ابدأ قبل 12-16 أسبوع. مرحلة 1 (12-8): نزول كالوريز تدريجي، زود الكارديو ببطء. مرحلة 2 (8-4): دايت أضيق، 4-5 حصص كارديو. مرحلة 3 (4-1): بيك ويك، تلاعب ميه/كارب. خد كوتش لأول بطولة! التحضير صعب ذهنياً وبدنياً — متعملهوش لوحدك.' },
    priority: 8,
    domain: 'root',
  },
  {
    keywords: ['posing', 'bodybuilding poses', 'how to pose', 'mandatory poses', 'stage posing'],
    keywordsAr: ['بوزنج', 'وقفات كمال أجسام', 'ازاي اعمل بوز', 'وقفات إجبارية'],
    keywordsFranco: ['posing', 'wa2fat kamal agsam', 'ezay a3mel pose', 'wa2fat egbarya'],
    stateId: 'QA_MENU',
    response: { en: 'Mandatory bodybuilding poses: Front double bicep, Front lat spread, Side chest, Side tricep, Rear double bicep, Rear lat spread, Abdominal & thigh, Most muscular. Practice posing 15-30min daily starting 8 weeks out. Posing IS a workout — it\'s exhausting! Film yourself and compare to pros.', ar: 'وقفات كمال الأجسام الإجبارية: فرونت دبل بايسب، فرونت لات سبريد، سايد تشست، سايد ترايسب، ريار دبل بايسب، ريار لات سبريد، بطن وفخذ، موست ماسكيولر. تمرن على البوزنج 15-30 دقيقة يومياً من 8 أسابيع. البوزنج تمرين بحد ذاته — بيتعب! صور نفسك وقارن بالمحترفين.' },
    priority: 6,
    domain: 'root',
  },

  // ── v20: Gut Health & Digestion ─────────────────────────────
  {
    keywords: ['digestive issues gym', 'stomach problems gym', 'gas gym', 'farting gym', 'protein farts', 'bloating protein'],
    keywordsAr: ['مشاكل هضم', 'معدة في الجيم', 'غازات', 'انتفاخ من البروتين'],
    keywordsFranco: ['mashakl hadm', 'me3da fe el gym', 'ghazat', 'entefakh men el protein'],
    stateId: 'HL_MENU',
    response: { en: 'Gym digestive issues: Protein farts? Switch to whey isolate (less lactose). Bloating? 1) Eat slowly 2) Reduce carbonation 3) Add digestive enzymes 4) Limit sugar alcohols in protein bars 5) Try probiotics. Don\'t train on a full stomach (wait 1-2hrs). Gas is normal with high-protein diets — fiber + water help!', ar: 'مشاكل هضم الجيم: غازات من البروتين؟ جرب واي أيزوليت (لاكتوز أقل). انتفاخ؟ 1) كل ببطء 2) قلل المشروبات الغازية 3) ضيف إنزيمات هاضمة 4) قلل سكريات كحولية في البروتين بارز 5) جرب بروبيوتكس. متتمرنش على معدة ملانة (استنى 1-2 ساعة). الغازات طبيعية مع بروتين عالي — ألياف + ميه بتساعد!' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['probiotics', 'gut health', 'microbiome', 'gut bacteria', 'fermented foods'],
    keywordsAr: ['بروبيوتكس', 'صحة الأمعاء', 'بكتيريا الأمعاء', 'أكل مخمر'],
    keywordsFranco: ['probiotics', 'se7et el am3a2', 'bacteria el am3a2', 'akl mo5amar'],
    stateId: 'HL_MENU',
    response: { en: 'Gut health for athletes: 1) Eat fermented foods daily (yogurt, pickles, kimchi) 2) Diverse fiber sources (veggies, fruits, grains) 3) Prebiotic foods (garlic, onion, banana) 4) Avoid excessive artificial sweeteners 5) Manage stress (gut-brain connection). Healthy gut = better nutrient absorption = better gains!', ar: 'صحة الأمعاء للرياضيين: 1) كل أكل مخمر يومياً (زبادي، مخللات) 2) ألياف متنوعة (خضار، فاكهة، حبوب) 3) بريبيوتكس (ثوم، بصل، موز) 4) قلل المحليات الصناعية 5) قلل التوتر (اتصال أمعاء-مخ). أمعاء صحية = امتصاص أحسن = مكاسب أحسن!' },
    priority: 7,
    domain: 'health',
  },

  // ── v20: Egyptian Gym Pricing & Reality ─────────────────────
  {
    keywords: ['gym price egypt', 'gym membership cost', 'how much gym egypt', 'gym fees', 'cheap gym egypt'],
    keywordsAr: ['سعر الجيم', 'اشتراك الجيم كام', 'كام الجيم في مصر', 'رسوم الجيم'],
    keywordsFranco: ['se3r el gym', 'eshterak el gym kam', 'kam el gym fe masr', 'rosom el gym'],
    stateId: 'QA_MENU',
    response: { en: 'Egypt gym prices (2024-2025): Budget gyms: 200-400 LE/month. Mid-range (Oxygen, etc): 500-800 LE/month. Premium (Gold\'s, etc): 1000-2000+ LE/month. University gyms: cheapest option. Look for: annual deals (save 20-30%), student discounts, off-peak pricing. Quality > fancy — find one close to home!', ar: 'أسعار الجيم في مصر (2024-2025): جيمات رخيصة: 200-400 جنيه/شهر. وسط (Oxygen، الخ): 500-800 جنيه/شهر. بريميوم (Gold\'s، الخ): 1000-2000+ جنيه/شهر. جيمات الجامعة: أرخص اختيار. دور على: عروض سنوية (توفر 20-30%)، خصم طلبة، أسعار أوقات هادية. الجودة أهم من الفخامة — لاقي واحد قريب!' },
    priority: 6,
    domain: 'root',
  },
  {
    keywords: ['supplement price egypt', 'whey price egypt', 'where to buy supplements', 'supplement store egypt'],
    keywordsAr: ['سعر المكملات', 'سعر الواي في مصر', 'اشتري مكملات منين', 'محل مكملات'],
    keywordsFranco: ['se3r el mokamelat', 'se3r el whey fe masr', 'ashtery mokamelat menen', 'ma7al mokamelat'],
    stateId: 'SP_MENU',
    response: { en: 'Supplements in Egypt: Whey protein (2.2kg): 1500-3000 LE. Creatine (500g): 400-800 LE. Buy from: official distributors (iHerb Egypt, care stores), verified gym shops. BEWARE of fakes! Check hologram, batch number, expiry. Never buy open/repackaged supplements. Budget tip: eggs + milk > expensive supplements!', ar: 'المكملات في مصر: واي بروتين (2.2 كيلو): 1500-3000 جنيه. كرياتين (500ج): 400-800 جنيه. اشتري من: موزعين رسميين (iHerb Egypt، محلات care)، محلات جيم موثوقة. حذاري من المضروب! شيك الهولوجرام، رقم الدفعة، الصلاحية. متشتريش مكملات مفتوحة/معاد تغليفها. نصيحة: بيض + لبن أحسن من مكملات غالية!' },
    priority: 7,
    domain: 'supplements',
  },

  // ── v21: Skin, Hair & Hormones ──────────────────────────────
  {
    keywords: ['acne gym', 'gym acne', 'pimples gym', 'breakout gym', 'skin gym', 'sweating acne'],
    keywordsAr: ['حبوب جيم', 'حبوب من الجيم', 'بشرة والجيم', 'عرق وحبوب'],
    keywordsFranco: ['7obob gym', '7obob men el gym', 'bashra wel gym'],
    stateId: 'HL_MENU',
    response: { en: 'Gym acne tips: 1) Shower immediately after training 2) Wear clean, breathable clothes 3) Wipe equipment before use 4) Don\'t touch your face 5) Wash face with gentle cleanser AM/PM 6) Change pillowcase weekly. High protein diets and whey can trigger some people — try isolate or plant protein if acne worsens.', ar: 'حبوب الجيم: 1) استحمى فوراً بعد التمرين 2) البس هدوم نضيفة وتنفس 3) امسح الأجهزة قبل الاستخدام 4) متلمسش وشك 5) اغسل وشك بغسول ناعم صبح ومسا 6) غير الكيس كل أسبوع. بروتين عالي وواي ممكن يجيبوا حبوب لبعض الناس — جرب أيزوليت أو بروتين نباتي.' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['hair loss gym', 'losing hair', 'gym hair loss', 'hairfall workout', 'baldness gym', 'hair thinning'],
    keywordsAr: ['سقوط شعر', 'شعري بيقع', 'صلع والجيم', 'شعري بيخف'],
    keywordsFranco: ['so2ot sha3r', 'sha3ry bey2a3', 'sal3 wel gym', 'sha3ry bey5ef'],
    stateId: 'HL_MENU',
    response: { en: 'Hair loss & gym: Lifting itself does NOT cause hair loss. What might: 1) Extreme dieting (nutrient deficiency) 2) Very high stress (cortisol) 3) Genetics (male pattern baldness) 4) Anabolic steroids (accelerate genetic hair loss). Fix: eat enough, take biotin + zinc, reduce stress, get enough protein. See a dermatologist if concerned!', ar: 'سقوط الشعر والجيم: الحديد نفسه مش بيسقط الشعر. اللي ممكن: 1) دايت متطرف (نقص مغذيات) 2) توتر عالي جداً (كورتيزول) 3) جينات (صلع وراثي) 4) منشطات (بتسرع الصلع الوراثي). الحل: كل كويس، خد بيوتين + زنك، قلل التوتر، بروتين كفاية. لو قلقان روح دكتور جلدية!' },
    priority: 7,
    domain: 'health',
  },
  {
    keywords: ['stretch marks', 'gym stretch marks', 'growth marks', 'muscle stretch marks'],
    keywordsAr: ['علامات تمدد', 'خطوط حمرا', 'علامات نمو'],
    keywordsFranco: ['3alamat tamadod', '5otoot 7amra', '3alamat nomo'],
    stateId: 'HL_MENU',
    response: { en: 'Stretch marks from gym = badge of honor! They happen when muscle grows faster than skin adapts. Common on: shoulders, chest, biceps, inner thighs. Prevention: 1) Gain weight slowly 2) Stay hydrated 3) Moisturize (cocoa butter, vitamin E) 4) They fade over time (red → white). They\'re normal and mean you\'re GROWING!', ar: 'علامات التمدد من الجيم = وسام شرف! بتحصل لما العضلات بتكبر أسرع من الجلد. شايعة في: الكتف، الصدر، البايسب، الفخذ الداخلي. الوقاية: 1) زود الوزن ببطء 2) اشرب ميه كتير 3) رطب البشرة (زبدة كاكاو، فيتامين E) 4) بتخف مع الوقت (أحمر → أبيض). طبيعية ومعناها إنك بتكبر!' },
    priority: 6,
    domain: 'health',
  },
  {
    keywords: ['testosterone levels', 'low testosterone', 'boost testosterone', 'testosterone food', 'testosterone exercise'],
    keywordsAr: ['مستوى التستوستيرون', 'تستوستيرون منخفض', 'زيادة التستوستيرون', 'أكل تستوستيرون'],
    keywordsFranco: ['mostawia el testosterone', 'testosterone mon5afed', 'zyada testosterone', 'akl testosterone'],
    stateId: 'HL_MENU',
    response: { en: 'Boost testosterone naturally: 1) Sleep 7-9hrs (most important!) 2) Lift heavy compounds (squats, deadlifts) 3) Eat enough fat (0.8-1g/kg) + zinc-rich foods (beef, oysters, pumpkin seeds) 4) Vitamin D (sunlight or supplement) 5) Manage stress 6) Maintain 10-20% body fat 7) Limit alcohol. If symptoms persist, get bloodwork done!', ar: 'زود التستوستيرون طبيعياً: 1) نوم 7-9 ساعات (الأهم!) 2) ارفع compound ثقيل (سكوات، ديدلفت) 3) كل دهون كفاية (0.8-1ج/كيلو) + أكل غني بالزنك (لحمة، بذور يقطين) 4) فيتامين D (شمس أو مكمل) 5) قلل التوتر 6) حافظ على دهون 10-20% 7) قلل الكحول. لو الأعراض مستمرة، اعمل تحاليل دم!' },
    priority: 8,
    domain: 'health',
  },

  // ── v21: Special Diets ──────────────────────────────────────
  {
    keywords: ['keto diet', 'ketogenic', 'keto and gym', 'keto bodybuilding', 'low carb diet'],
    keywordsAr: ['كيتو', 'كيتوجينيك', 'كيتو والجيم', 'كيتو بودي بيلدنج', 'لو كارب'],
    keywordsFranco: ['keto', 'ketogenic', 'keto wel gym', 'low carb'],
    stateId: 'NT_MENU',
    response: { en: 'Keto for gym-goers: works for fat loss but NOT ideal for high-intensity training. Carbs fuel heavy lifting. If you want to try keto: 1) Expect 2-3 weeks of reduced performance 2) High fat (70%), moderate protein (25%), very low carb (<50g) 3) Supplement sodium, potassium, magnesium 4) Consider Targeted Keto (small carb dose pre-workout). For most lifters, moderate carbs > keto.', ar: 'الكيتو للي بيتمرنوا: بيشتغل للتنشيف بس مش مثالي للتمرين المكثف. الكارب بيوقد الرفع الثقيل. لو عايز تجرب: 1) توقع 2-3 أسابيع أداء أقل 2) دهون عالية (70%)، بروتين معتدل (25%)، كارب قليل جداً (<50ج) 3) خد صوديوم، بوتاسيوم، ماغنيسيوم 4) جرب Targeted Keto (كارب صغير قبل التمرين). لأغلب الرافعين، كارب معتدل أحسن من الكيتو.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['vegan bodybuilding', 'vegan protein', 'plant based gym', 'vegan muscle', 'vegetarian gym'],
    keywordsAr: ['نباتي والجيم', 'بروتين نباتي', 'بناء عضلات نباتي'],
    keywordsFranco: ['nabaty wel gym', 'protein nabaty', 'bena2 3adalat nabaty'],
    stateId: 'NT_MENU',
    response: { en: 'Vegan bodybuilding IS possible! Protein sources: tofu (20g/cup), lentils (18g/cup), chickpeas (15g/cup), tempeh (30g/cup), seitan (25g/100g), pea protein powder. Combine sources for complete amino acids. Supplement: B12, iron, omega-3 (algae), creatine. Eat 10-15% more protein than meat-eaters to compensate.', ar: 'بودي بيلدنج نباتي ممكن! مصادر بروتين: توفو (20ج/كوب)، عدس (18ج/كوب)، حمص (15ج/كوب)، تمبيه (30ج/كوب)، سيتان (25ج/100ج)، بروتين بازلاء. امزج المصادر للأحماض الأمينية الكاملة. مكملات: B12، حديد، أوميجا 3 (طحالب)، كرياتين. كل 10-15% بروتين أكتر من آكلي اللحوم.' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['gluten free', 'celiac gym', 'gluten free bodybuilding', 'wheat allergy gym'],
    keywordsAr: ['خالي من الجلوتين', 'سيلياك والجيم', 'حساسية القمح'],
    keywordsFranco: ['5aly men el gluten', 'celiac wel gym', '7asaset el 2am7'],
    stateId: 'NT_MENU',
    response: { en: 'Gluten-free for lifters: easy! Great carbs without gluten: rice, potatoes, sweet potatoes, oats (certified GF), quinoa, corn, buckwheat. Protein: all meats, eggs, dairy are naturally GF. Watch out for: soy sauce, some protein bars, bread/pasta (get GF versions). You miss NOTHING nutritionally by skipping gluten!', ar: 'خالي من الجلوتين للرافعين: سهل! كاربز بدون جلوتين: رز، بطاطس، بطاطا، شوفان (GF)، كينوا، ذرة. بروتين: كل اللحوم، بيض، ألبان خالية من الجلوتين طبيعياً. خلي بالك من: صوص صويا، بعض البروتين بارز، عيش/مكرونة (خد نسخ GF). مش هتفقد أي حاجة غذائية!' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['dairy free', 'lactose intolerant', 'lactose free', 'milk allergy', 'no dairy diet'],
    keywordsAr: ['بدون ألبان', 'حساسية لاكتوز', 'لاكتوز فري', 'حساسية اللبن'],
    keywordsFranco: ['bedoon alban', '7asaset lactose', 'lactose free', '7asaset el laban'],
    stateId: 'NT_MENU',
    response: { en: 'Dairy-free fitness: Protein without dairy: chicken, fish, eggs, beef, tofu, legumes, pea protein powder. Calcium: broccoli, almonds, fortified plant milk. If only lactose intolerant (not allergic): lactose-free milk works, hard cheese is usually OK, Greek yogurt has less lactose. Whey isolate has minimal lactose too!', ar: 'لياقة بدون ألبان: بروتين بدون ألبان: فراخ، سمك، بيض، لحمة، توفو، بقوليات، بروتين بازلاء. كالسيوم: بروكلي، لوز، لبن نباتي مدعم. لو بس حساسية لاكتوز (مش حساسية لبن): لبن خالي اللاكتوز كويس، الجبنة الصلبة عادةً OK، زبادي يوناني لاكتوز أقل. واي أيزوليت لاكتوز قليل جداً!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v21: Alcohol & Social Life ──────────────────────────────
  {
    keywords: ['alcohol and gym', 'drinking and gains', 'beer and muscle', 'alcohol fitness', 'can i drink and train'],
    keywordsAr: ['كحول والجيم', 'شرب والمكاسب', 'بيرة والعضلات'],
    keywordsFranco: ['ko7ol wel gym', 'shorb wel makaseb', 'bira wel 3adalat'],
    stateId: 'QA_MENU',
    response: { en: 'Alcohol & gains: Alcohol reduces muscle protein synthesis by up to 37%, disrupts sleep quality, dehydrates you, increases estrogen. If you must drink: 1) Limit to 1-2 drinks 2) Avoid binge drinking 3) Don\'t drink on training days 4) Hydrate extra 5) Eat protein before/with alcohol. Best for gains: don\'t drink at all!', ar: 'الكحول والمكاسب: الكحول بيقلل بناء البروتين العضلي لحد 37%، بيبوظ جودة النوم، بيجفف، بيزود الإستروجين. لو لازم: 1) حد أقصى 1-2 كوب 2) بلاش إفراط 3) متشربش أيام التمرين 4) اشرب ميه زيادة 5) كل بروتين قبل/مع. أحسن حاجة: متشربش خالص!' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['social eating', 'eating out healthy', 'restaurant healthy', 'party diet', 'wedding diet'],
    keywordsAr: ['أكل بره', 'مطعم صحي', 'فرح ودايت', 'عزومة ودايت'],
    keywordsFranco: ['akl barra', 'mat3am se7y', 'fara7 we diet', '3azooma we diet'],
    stateId: 'NT_MENU',
    response: { en: 'Eating out while dieting: 1) Check menu online first 2) Start with salad/soup 3) Grilled > fried always 4) Ask for sauce on the side 5) Skip the bread basket 6) Share dessert 7) Don\'t "save calories" all day then binge. One meal won\'t ruin progress — consistency over perfection!', ar: 'أكل بره وانت في دايت: 1) شوف المنيو أونلاين الأول 2) ابدأ بسلطة/شوربة 3) مشوي أحسن من مقلي دايماً 4) اطلب الصوص جنب 5) سيب سلة العيش 6) شارك الحلو 7) متوفرش كالوريز كل اليوم وبعدين تاكل كتير. وجبة واحدة مش هتبوظ التقدم — الالتزام أهم من الكمال!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v22: Breathing Techniques ─────────────────────────────────
  {
    keywords: ['breathing technique', 'how to breathe gym', 'breathing during exercise', 'valsalva', 'bracing technique'],
    keywordsAr: ['تقنية تنفس', 'ازاي اتنفس في الجيم', 'تنفس أثناء التمرين', 'فالسالفا'],
    keywordsFranco: ['te2neyet tanafos', 'ezay atnafes fe el gym', 'tanafos asna2 el tamreen'],
    stateId: 'WK_MENU',
    response: { en: 'Breathing for lifting: Compound lifts (squat, deadlift): big belly breath in, brace core, hold during rep, exhale at top. This is the Valsalva maneuver — creates intra-abdominal pressure. Isolation exercises: exhale on effort (pushing/pulling), inhale on the eccentric. Never hold breath for 3+ reps straight!', ar: 'التنفس للرفع: التمارين المركبة (سكوات، ديدلفت): نفس كبير في البطن، شد الكور، امسك أثناء التكرار، ازفر في الأعلى. ده الفالسالفا — بيعمل ضغط داخلي. تمارين العزل: ازفر مع المجهود (دفع/سحب)، خد نفس في النزول. متمسكش نفسك 3+ تكرارات متواصلة!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['box breathing', 'deep breathing exercise', 'breathing for anxiety', '4 7 8 breathing', 'calm breathing'],
    keywordsAr: ['تنفس صندوقي', 'تمرين تنفس عميق', 'تنفس للقلق', 'تنفس 4 7 8'],
    keywordsFranco: ['tanafos sondo2y', 'tamreen tanafos 3amiq', 'tanafos lel 2ala2'],
    stateId: 'HL_MENU',
    response: { en: 'Calming breathing techniques: 1) Box breathing: 4sec in, 4sec hold, 4sec out, 4sec hold — Navy SEALs use this! 2) 4-7-8: inhale 4sec, hold 7sec, exhale 8sec — great before sleep 3) Physiological sigh: double inhale through nose, long exhale through mouth — instant calm. Do 5-10 cycles.', ar: 'تقنيات تنفس مهدئة: 1) تنفس صندوقي: 4ث شهيق، 4ث ثبات، 4ث زفير، 4ث ثبات — بيستخدمه Navy SEALs! 2) 4-7-8: شهيق 4ث، ثبات 7ث، زفير 8ث — ممتاز قبل النوم 3) تنهيدة فسيولوجية: شهيق مزدوج من الأنف، زفير طويل من الفم — هدوء فوري. 5-10 دورات.' },
    priority: 7,
    domain: 'health',
  },

  // ── v22: Training Logs & Progress ───────────────────────────
  {
    keywords: ['how to track progress', 'track workouts', 'training journal', 'log workouts', 'workout diary'],
    keywordsAr: ['ازاي اتابع تقدمي', 'تتبع التمارين', 'مذكرة تدريب', 'تسجيل التمارين'],
    keywordsFranco: ['ezay atabe3 ta2adomy', 'tatabo3 el tamarin', 'mozkera tadrib'],
    stateId: 'PR_MENU',
    response: { en: 'Track progress like a pro: 1) Log every workout (exercises, sets, reps, weight) — use this app! 2) Take progress photos monthly (same lighting, pose, time) 3) Weigh weekly (same day/time, track average) 4) Track strength PRs 5) Measure body parts monthly (arms, chest, waist, thighs). Data = motivation!', ar: 'تابع تقدمك زي البرو: 1) سجل كل تمرين (تمارين، سيتات، تكرارات، وزن) — استخدم الأبلكيشن! 2) صور تقدم شهرية (نفس الإضاءة، الوضع، الوقت) 3) اتوزن أسبوعياً (نفس اليوم/الوقت، تابع المتوسط) 4) تابع الأرقام الشخصية 5) قيس أجزاء الجسم شهرياً (ذراع، صدر، وسط، فخذ). البيانات = تحفيز!' },
    priority: 8,
    domain: 'progress',
  },
  {
    keywords: ['pr', 'personal record', 'new pr', 'hit a pr', 'personal best', 'one rep max', '1rm'],
    keywordsAr: ['رقم شخصي', 'بي آر', 'رقم جديد', 'أعلى وزن'],
    keywordsFranco: ['ra2m sha5sy', 'pr', 'ra2m gedid', 'a3la wazn'],
    stateId: 'WK_LOG',
    response: { en: 'Congrats on chasing PRs! Track them here. Estimate your 1RM: Weight × (1 + Reps/30). Example: 100kg × 5 reps ≈ 117kg 1RM. Focus on PRs in the 3-8 rep range for safety. Don\'t test true 1RM more than every 8-12 weeks!', ar: 'مبروك على مطاردة الأرقام! سجلهم هنا. قدر الـ1RM: الوزن × (1 + التكرارات/30). مثال: 100 كيلو × 5 تكرارات ≈ 117 كيلو 1RM. ركز على أرقام في نطاق 3-8 تكرارات للأمان. متختبرش 1RM حقيقي أكتر من كل 8-12 أسبوع!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['body measurement', 'measure arms', 'measure chest', 'measure waist', 'tape measure body'],
    keywordsAr: ['قياس الجسم', 'قياس الدراع', 'قياس الصدر', 'قياس الوسط'],
    keywordsFranco: ['2eyas el gesm', '2eyas el dra3', '2eyas el sadr', '2eyas el wast'],
    stateId: 'PR_MENU',
    response: { en: 'Body measurement guide: Arms: flexed, widest point. Chest: under armpits, tape over nipples. Waist: at navel, relaxed. Hips: widest point. Thighs: midpoint. Calves: widest point. Measure same time monthly (AM, before food). Track in this app for charts!', ar: 'دليل قياس الجسم: الذراع: مشدود، أعرض نقطة. الصدر: تحت الإبط، الشريط فوق الصدر. الوسط: عند السرة، مرتاح. الورك: أعرض نقطة. الفخذ: نقطة المنتصف. السمانة: أعرض نقطة. قيس نفس الوقت شهرياً (الصبح، قبل الأكل). تابع في الأبلكيشن!' },
    priority: 7,
    domain: 'progress',
  },

  // ── v22: Genetic Potential & Natural Limits ─────────────────
  {
    keywords: ['genetic potential', 'natural limit', 'how much muscle can i build', 'genetic limit', 'maximum muscle naturally'],
    keywordsAr: ['إمكانات وراثية', 'الحد الطبيعي', 'كام عضلات ممكن', 'الحد الجيني'],
    keywordsFranco: ['emkanat werasya', 'el 7ad el tabi3y', 'kam 3adalat momken', 'el 7ad el giny'],
    stateId: 'QA_MENU',
    response: { en: 'Natural muscle-building limits (research-based): Year 1: 8-12kg. Year 2: 4-6kg. Year 3: 2-3kg. Year 4+: 1-2kg. Total lifetime: ~20-25kg of muscle for avg male. Genetics affect: muscle insertions, frame size, testosterone, fiber type, recovery speed. But EVERYONE can make amazing progress with consistency!', ar: 'حدود بناء العضلات الطبيعية (مبنية على أبحاث): السنة 1: 8-12 كيلو. السنة 2: 4-6 كيلو. السنة 3: 2-3 كيلو. السنة 4+: 1-2 كيلو. المجموع: ~20-25 كيلو عضلات للرجل المتوسط. الجينات بتأثر على: شكل العضلات، حجم الهيكل، التستوستيرون، نوع الألياف، سرعة الريكفري. بس كل واحد يقدر يعمل تقدم مذهل بالالتزام!' },
    priority: 7,
    domain: 'root',
  },
  {
    keywords: ['ectomorph', 'endomorph', 'mesomorph', 'body type', 'somatotype', 'skinny hard gainer'],
    keywordsAr: ['إكتومورف', 'إندومورف', 'ميزومورف', 'نوع الجسم', 'نحيف صعب أزود'],
    keywordsFranco: ['ectomorph', 'endomorph', 'mesomorph', 'no3 el gesm', 'na7if sa3b azawed'],
    stateId: 'QA_MENU',
    response: { en: 'Body types are OVERSIMPLIFIED! "Ectomorph/Mesomorph/Endomorph" isn\'t real science — it\'s a spectrum. Skinny? You just need more calories. Chunky? You just need less. "Hard gainer" usually = not eating enough. Track your food for a week — you\'ll be surprised. ANYONE can build muscle with proper training + nutrition!', ar: 'أنواع الأجسام مبسطة أكتر من اللازم! "إكتو/ميزو/إندومورف" مش علم حقيقي — ده طيف. نحيف؟ محتاج كالوريز أكتر. ممتلئ؟ محتاج أقل. "صعب الزيادة" عادةً = مش بياكل كفاية. تابع أكلك أسبوع — هتتفاجأ. أي حد يقدر يبني عضلات بتمرين + تغذية صح!' },
    priority: 7,
    domain: 'root',
  },

  // ── v22: Training Partners & Community ───────────────────────
  {
    keywords: ['training partner', 'gym partner', 'gym buddy', 'workout partner', 'need a spotter'],
    keywordsAr: ['بارتنر تمرين', 'زميل جيم', 'بدي جيم', 'محتاج سبوتر'],
    keywordsFranco: ['partner tamreen', 'zamil gym', 'buddy gym', 'me7tag spotter'],
    stateId: 'QA_MENU',
    response: { en: 'Training partner benefits: 1) Accountability (show up!) 2) Motivation & competition 3) Safety (spotting on heavy lifts) 4) Learn from each other. Find one: gym regulars who train similar times, similar level & goals. Rules: match schedules, communicate honestly, push each other but respect limits!', ar: 'فوايد بارتنر التمرين: 1) مسؤولية (تروح!) 2) تحفيز ومنافسة 3) أمان (سبوتنج في الرفع الثقيل) 4) تعلم من بعض. لاقي واحد: ناس بتتمرن نفس الأوقات، نفس المستوى والأهداف. قواعد: نظموا المواعيد، اتكلموا بصراحة، ادفعوا بعض بس احترموا الحدود!' },
    priority: 6,
    domain: 'root',
  },

  // ── v22: Supplement Safety & Quality ────────────────────────
  {
    keywords: ['fake supplement', 'counterfeit supplement', 'how to check supplement', 'supplement quality', 'supplement real or fake'],
    keywordsAr: ['مكمل مغشوش', 'مكمل مضروب', 'ازاي اتأكد من المكمل', 'جودة المكمل'],
    keywordsFranco: ['mokamel maghsoosh', 'mokamel madrob', 'ezay at2aked men el mokamel', 'godet el mokamel'],
    stateId: 'SP_MENU',
    response: { en: 'Spot fake supplements: 1) Check hologram/seal (scratch to verify) 2) Batch number + expiry date must be printed (not sticker) 3) Scan barcode with manufacturer\'s app 4) Buy from authorized dealers only 5) If price is too good = probably fake 6) Check weight (fakes are often lighter). In Egypt: buy from verified stores, avoid Facebook sellers!', ar: 'اكتشف المكملات المضروبة: 1) شيك الهولوجرام (اخدشه للتأكد) 2) رقم الدفعة + الصلاحية لازم مطبوعة (مش ستيكر) 3) امسح الباركود بأبلكيشن الشركة 4) اشتري من موزعين معتمدين بس 5) لو السعر حلو أوي = غالباً مضروب 6) شيك الوزن (المضروب أخف عادةً). في مصر: اشتري من محلات موثوقة، بلاش بياعين فيسبوك!' },
    priority: 8,
    domain: 'supplements',
  },
  {
    keywords: ['when to take supplements', 'supplement schedule', 'supplement timing', 'morning supplements', 'night supplements'],
    keywordsAr: ['امتى اخد المكملات', 'جدول المكملات', 'توقيت المكملات'],
    keywordsFranco: ['emta a5od el mokamelat', 'gadwal el mokamelat', 'taw2it el mokamelat'],
    stateId: 'SP_MENU',
    response: { en: 'Supplement timing: MORNING: Vitamin D + Omega-3 (with breakfast/fats). PRE-WORKOUT (30min): caffeine, citrulline, beta-alanine. POST-WORKOUT: whey protein + creatine. BEFORE BED: magnesium glycinate, ZMA, casein. ANYTIME: creatine (daily, timing doesn\'t matter much), multivitamin (with food).', ar: 'توقيت المكملات: الصبح: فيتامين D + أوميجا 3 (مع الفطار/دهون). قبل التمرين (30 دقيقة): كافيين، سيترولين، بيتا ألانين. بعد التمرين: واي بروتين + كرياتين. قبل النوم: ماغنيسيوم جلايسينات، ZMA، كازين. أي وقت: كرياتين (يومياً، التوقيت مش مهم أوي)، ملتيفيتامين (مع أكل).' },
    priority: 8,
    domain: 'supplements',
  },

  // ── v22: Quick Fitness Tests ─────────────────────────────────
  {
    keywords: ['fitness test', 'how fit am i', 'test my fitness', 'benchmark workout', 'fitness level test'],
    keywordsAr: ['اختبار لياقة', 'اد ايه لياقتي', 'اختبر لياقتي'],
    keywordsFranco: ['e5tebar leya2a', 'ad eh leya2ty', 'e5taber leya2ty'],
    stateId: 'WK_MENU',
    response: { en: 'Quick fitness benchmarks: Push-ups (1min): <20=beginner, 20-40=intermediate, 40+=advanced. Plank hold: <30sec=beginner, 30-90sec=intermediate, 90+sec=advanced. 1 mile run: >12min=beginner, 8-12=intermediate, <8=advanced. Bodyweight squat (1min): <20=beginner, 20-40=intermediate, 40+=advanced. Test monthly!', ar: 'معايير اللياقة السريعة: بوش اب (1 دقيقة): أقل من 20=مبتدئ، 20-40=متوسط، 40+=متقدم. بلانك: أقل من 30ث=مبتدئ، 30-90ث=متوسط، 90+ث=متقدم. ميل جري: أكتر من 12 دقيقة=مبتدئ، 8-12=متوسط، أقل من 8=متقدم. سكوات بوزن الجسم (1 دقيقة): أقل من 20=مبتدئ، 20-40=متوسط، 40+=متقدم. اختبر شهرياً!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['strength standards', 'how strong should i be', 'bench press standard', 'squat standard', 'deadlift standard'],
    keywordsAr: ['معايير القوة', 'كام لازم ارفع', 'معيار البنش', 'معيار السكوات'],
    keywordsFranco: ['ma3ayir el 2owa', 'kam lazem arfa3', 'me3yar el bench', 'me3yar el squat'],
    stateId: 'WK_MENU',
    response: { en: 'Strength standards (× bodyweight): BEGINNER: Bench 0.5×, Squat 0.75×, Deadlift 1×. INTERMEDIATE: Bench 1×, Squat 1.5×, Deadlift 1.75×. ADVANCED: Bench 1.5×, Squat 2×, Deadlift 2.5×. ELITE: Bench 2×, Squat 2.5×, Deadlift 3×. These take years — enjoy the journey!', ar: 'معايير القوة (× وزن الجسم): مبتدئ: بنش 0.5×، سكوات 0.75×، ديدلفت 1×. متوسط: بنش 1×، سكوات 1.5×، ديدلفت 1.75×. متقدم: بنش 1.5×، سكوات 2×، ديدلفت 2.5×. نخبة: بنش 2×، سكوات 2.5×، ديدلفت 3×. دول بياخدوا سنين — استمتع بالرحلة!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v23: Travel Fitness ─────────────────────────────────────
  {
    keywords: ['travel workout', 'hotel workout', 'workout while traveling', 'gym while traveling', 'vacation workout'],
    keywordsAr: ['تمرين سفر', 'تمرين فندق', 'تمرين وانا مسافر', 'جيم وانا مسافر'],
    keywordsFranco: ['tamreen safar', 'tamreen fondo2', 'tamreen wana msafer', 'gym wana msafer'],
    stateId: 'WK_MENU',
    response: { en: 'Travel workout (no equipment): 1) Push-ups ×15 ×4 2) Bodyweight squats ×20 ×4 3) Lunges ×12/leg ×3 4) Planks 60sec ×3 5) Chair dips ×15 ×3 6) Burpees ×10 ×3. Full body in 25min! Pack resistance bands — they weigh nothing and add tons of options. Hotel room = your gym!', ar: 'تمرين السفر (بدون معدات): 1) بوش اب ×15 ×4 2) سكوات بوزن الجسم ×20 ×4 3) لانجز ×12/رجل ×3 4) بلانك 60ث ×3 5) ديبس كرسي ×15 ×3 6) بيربيز ×10 ×3. فل بودي في 25 دقيقة! خد باندات مقاومة — وزنها صفر وبتفتح خيارات كتير. أوضة الفندق = جيمك!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['jet lag workout', 'jet lag recovery', 'time zone training', 'travel fatigue gym'],
    keywordsAr: ['جت لاج', 'جت لاج وتمرين', 'إرهاق سفر'],
    keywordsFranco: ['jet lag', 'jet lag we tamreen', 'erha2 safar'],
    stateId: 'RC_MENU',
    response: { en: 'Jet lag recovery: 1) Light exercise (walk 30min in sunlight) 2) Don\'t train heavy first 24-48hrs 3) Hydrate extra (flying dehydrates) 4) Adjust meals to local time immediately 5) Sunlight exposure resets your clock 6) Melatonin 0.5-1mg at local bedtime. Give yourself 1 day per timezone crossed to fully adjust.', ar: 'ريكفري الجت لاج: 1) تمرين خفيف (مشي 30 دقيقة في الشمس) 2) متتمرنش ثقيل أول 24-48 ساعة 3) اشرب ميه زيادة (الطيران بيجفف) 4) ظبط الأكل على التوقيت المحلي فوراً 5) الشمس بتظبط الساعة البيولوجية 6) ميلاتونين 0.5-1مج وقت النوم المحلي. خد يوم لكل منطقة زمنية عديتها.' },
    priority: 6,
    domain: 'recovery',
  },

  // ── v23: Time Management ────────────────────────────────────
  {
    keywords: ['short workout', 'quick workout', 'no time for gym', 'busy schedule workout', '15 minute workout', '20 minute workout'],
    keywordsAr: ['تمرين قصير', 'تمرين سريع', 'مفيش وقت للجيم', 'تمرين 15 دقيقة', 'تمرين 20 دقيقة'],
    keywordsFranco: ['tamreen 2osayar', 'tamreen sari3', 'mafesh wa2t lel gym', 'tamreen 15 de2i2a'],
    stateId: 'WK_MENU',
    response: { en: 'Time-efficient workouts: 15min: pick 3 compound exercises, 3 sets each, superset them. 20min: 4 exercises, 3 sets, 60sec rest. 30min: full program with warm-up. Key: supersets (save 40% time), minimal rest (60-90sec), compound movements only. Short workouts > skipped workouts. Something is ALWAYS better than nothing!', ar: 'تمارين موفرة للوقت: 15 دقيقة: اختار 3 تمارين compound، 3 سيتات كل واحد، سوبرسيت. 20 دقيقة: 4 تمارين، 3 سيتات، 60ث راحة. 30 دقيقة: برنامج كامل مع تسخين. المفتاح: سوبرسيت (بيوفروا 40% وقت)، راحة قليلة (60-90ث)، compound بس. تمرين قصير أحسن من تمرين ملغي!' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['morning workout', 'workout before work', 'fajr workout', 'early morning gym', 'am workout'],
    keywordsAr: ['تمرين الصبح', 'تمرين قبل الشغل', 'تمرين بدري', 'جيم الصبح'],
    keywordsFranco: ['tamreen el sob7', 'tamreen 2abl el shogl', 'tamreen badry', 'gym el sob7'],
    stateId: 'WK_MENU',
    response: { en: 'Morning workout tips: 1) Sleep in gym clothes (seriously!) 2) Prep everything night before 3) Eat something small (banana, dates) or train fasted 4) Extra warm-up needed (body is cold) 5) Caffeine 30min before 6) You\'ll have MORE energy throughout the day. Morning lifters are more consistent — fewer excuses to skip!', ar: 'نصائح تمرين الصبح: 1) نام بهدوم الجيم (بجد!) 2) حضر كل حاجة بالليل 3) كل حاجة صغيرة (موزة، تمر) أو تمرن صايم 4) تسخين أكتر (الجسم بارد) 5) كافيين قبل ب30 دقيقة 6) هيبقى عندك طاقة أكتر طول اليوم. اللي بيتمرنوا الصبح أكتر التزاماً — أعذار أقل لتفويت!' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['night workout', 'late workout', 'workout after work', 'gym at night', 'evening workout'],
    keywordsAr: ['تمرين بالليل', 'تمرين متأخر', 'تمرين بعد الشغل', 'جيم بالليل'],
    keywordsFranco: ['tamreen beleil', 'tamreen meta25er', 'tamreen ba3d el shogl', 'gym beleil'],
    stateId: 'WK_MENU',
    response: { en: 'Evening workout tips: 1) Strength peaks 4-7pm (body temperature highest) 2) Good stress relief after work 3) Avoid intense training 2hrs before bed (disrupts sleep) 4) Have a pre-workout meal 1-2hrs before 5) Skip caffeine after 4pm. Both AM & PM work — pick what you\'ll do CONSISTENTLY. The best time = the time you actually go!', ar: 'نصائح تمرين بالليل: 1) القوة بتوصل الذروة 4-7 مساءً (حرارة الجسم الأعلى) 2) بيريح من ضغط الشغل 3) بلاش تمرين مكثف ساعتين قبل النوم (بيبوظ النوم) 4) كل وجبة قبل ب1-2 ساعة 5) بلاش كافيين بعد 4 العصر. الصبح والمسا الاتنين كويسين — اختار اللي هتلتزم بيه. أحسن وقت = الوقت اللي بتروح فيه فعلاً!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v23: Blood Work & Lab Tests ─────────────────────────────
  {
    keywords: ['blood work', 'lab test', 'blood test gym', 'what blood test', 'health check gym', 'check hormones'],
    keywordsAr: ['تحاليل دم', 'تحليل دم', 'تحاليل الجيم', 'فحص هرمونات'],
    keywordsFranco: ['ta7alil dam', 'ta7lil dam', 'ta7alil el gym', 'fa7s hormonat'],
    stateId: 'HL_MENU',
    response: { en: 'Blood work for athletes (get annually): 1) CBC (general health) 2) Testosterone (total + free) 3) Thyroid (TSH, T3, T4) 4) Vitamin D 5) Iron/ferritin 6) Lipid panel (cholesterol) 7) Liver + kidney function 8) Fasting glucose + HbA1c 9) CRP (inflammation). Cost in Egypt: ~500-1500 LE for full panel. Knowledge = power!', ar: 'تحاليل الدم للرياضيين (اعملها سنوياً): 1) صورة دم كاملة 2) تستوستيرون (كلي + حر) 3) غدة درقية (TSH, T3, T4) 4) فيتامين D 5) حديد/فيريتين 6) دهون (كولسترول) 7) وظائف كبد + كلى 8) سكر صايم + HbA1c 9) CRP (التهاب). التكلفة في مصر: ~500-1500 جنيه للفحص الكامل. المعرفة = قوة!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['vitamin d deficiency', 'low vitamin d', 'vitamin d level', 'vitamin d egypt', 'sunshine vitamin'],
    keywordsAr: ['نقص فيتامين دي', 'فيتامين دي منخفض', 'مستوى فيتامين دي'],
    keywordsFranco: ['na2s vitamin d', 'vitamin d mon5afed', 'mostawa vitamin d'],
    stateId: 'HL_MENU',
    response: { en: 'Vitamin D in Egypt: Despite sunshine, 60-80% of Egyptians are deficient! Why: indoor lifestyle, dark skin needs more sun, avoiding sun. Optimal level: 40-60 ng/mL. Supplement: 2000-4000 IU/day with fat. Benefits for gym: bone strength, testosterone, immune function, mood, muscle recovery. Get tested!', ar: 'فيتامين D في مصر: رغم الشمس، 60-80% من المصريين عندهم نقص! ليه: حياة داخلية، البشرة الداكنة محتاجة شمس أكتر. المستوى المثالي: 40-60 ng/mL. المكمل: 2000-4000 وحدة/يوم مع دهون. فوايد للجيم: قوة عظام، تستوستيرون، مناعة، مزاج، ريكفري عضلات. اعمل تحليل!' },
    priority: 8,
    domain: 'health',
  },

  // ── v23: Advanced Nutrition Concepts ─────────────────────────
  {
    keywords: ['reverse diet', 'reverse dieting', 'metabolic damage', 'after diet what', 'post diet'],
    keywordsAr: ['ريفرس دايت', 'بعد الدايت', 'ضرر الأيض', 'تدمير الأيض'],
    keywordsFranco: ['reverse diet', 'ba3d el diet', 'darar el ayed', 'tadmir el ayed'],
    stateId: 'NT_MENU',
    response: { en: 'Reverse dieting: After cutting, DON\'T jump back to high calories (you\'ll gain fat fast). Instead: add 50-100 cal/week until you reach maintenance. Takes 8-16 weeks. This rebuilds your metabolism, minimizes fat regain, and sets you up for your next bulk. Patience here = long-term success!', ar: 'ريفرس دايت: بعد التنشيف، متقفزش للكالوريز العالية فجأة (هتزود دهون بسرعة). بدلاً: زود 50-100 كالوري/أسبوع لحد ما توصل الصيانة. بياخد 8-16 أسبوع. ده بيعيد بناء الأيض، بيقلل استرداد الدهون، وبيجهزك للبالك الجاي. الصبر هنا = نجاح طويل المدى!' },
    priority: 8,
    domain: 'nutrition',
  },
  {
    keywords: ['metabolic adaptation', 'metabolism slow', 'slow metabolism', 'metabolism broken', 'starvation mode'],
    keywordsAr: ['تكيف أيضي', 'الأيض بطيء', 'أيض بطيء', 'وضع المجاعة'],
    keywordsFranco: ['takyf aydy', 'el ayed bati2', 'ayed bati2', 'wad3 el maga3a'],
    stateId: 'NT_MENU',
    response: { en: '"Starvation mode" is a myth but metabolic adaptation IS real. When you diet, your body burns fewer calories (NEAT drops, hormones adjust). It\'s 5-15% at most, NOT enough to stop fat loss. Fix: 1) Diet breaks (2 weeks at maintenance every 8-12 weeks) 2) Keep protein high 3) Maintain activity 4) Reverse diet after cutting.', ar: '"وضع المجاعة" خرافة بس التكيف الأيضي حقيقي. لما بتعمل دايت، جسمك بيحرق أقل (الحركة بتقل، الهرمونات بتتغير). ده 5-15% بالماكس، مش كفاية يوقف خسارة الدهون. الحل: 1) بريكات دايت (أسبوعين صيانة كل 8-12 أسبوع) 2) بروتين عالي 3) حافظ على النشاط 4) ريفرس دايت بعد التنشيف.' },
    priority: 7,
    domain: 'nutrition',
  },
  {
    keywords: ['food scale', 'weighing food', 'how to weigh food', 'portion accuracy', 'food measuring'],
    keywordsAr: ['ميزان أكل', 'وزن الأكل', 'ازاي اوزن الأكل', 'دقة الحصص'],
    keywordsFranco: ['mizan akl', 'wazn el akl', 'ezay awazn el akl', 'de2et el 7osas'],
    stateId: 'NT_MENU',
    response: { en: 'Food scale = game changer for tracking macros! Buy a digital kitchen scale (~100-200 LE). Weigh EVERYTHING raw when possible. Eyeballing portions can be off by 30-50%! Quick guide: Palm of hand ≈ 100g protein. Fist ≈ 1 cup carbs. Thumb ≈ 1 tbsp fat. But nothing beats a scale for accuracy!', ar: 'ميزان الأكل = فرق كبير لتتبع الماكروز! اشتري ميزان مطبخ ديجيتال (~100-200 جنيه). وزن كل حاجة نيئة لو ممكن. تقدير الحصص بالعين ممكن يغلط 30-50%! دليل سريع: كف اليد ≈ 100ج بروتين. القبضة ≈ كوب كارب. الإبهام ≈ ملعقة دهون. بس مفيش بديل عن الميزان للدقة!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v23: Grip Strength & Forearms ───────────────────────────
  {
    keywords: ['grip strength', 'weak grip', 'grip training', 'forearm training', 'cant hold weight', 'grip exercises'],
    keywordsAr: ['قوة القبضة', 'قبضة ضعيفة', 'تمرين القبضة', 'تمرين الساعد'],
    keywordsFranco: ['2owet el 2abda', '2abda da3ifa', 'tamreen el 2abda', 'tamreen el sa3ed'],
    stateId: 'WK_MENU',
    response: { en: 'Grip strength training: 1) Dead hangs (30-60sec, 3 sets) 2) Farmer walks (heavy, 30m) 3) Wrist curls + reverse curls 4) Plate pinches (hold 2 plates smooth side out) 5) Towel pull-ups 6) Fat grips on dumbbells. Do 2-3 grip exercises at end of pulling days. Strong grip = stronger deadlift, rows, and pulls!', ar: 'تمرين قوة القبضة: 1) ديد هانج (30-60ث، 3 سيتات) 2) فارمر ووك (ثقيل، 30م) 3) ريست كيرل + ريفرس كيرل 4) بليت بينش (امسك طبقين الناحية الملساء برا) 5) بول اب بمنشفة 6) فات جريبز على دمبلز. 2-3 تمارين قبضة آخر أيام السحب. قبضة قوية = ديدلفت ورو وسحب أقوى!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v23: Mindset & Discipline ───────────────────────────────
  {
    keywords: ['discipline', 'consistency', 'how to be consistent', 'stick to routine', 'habit building'],
    keywordsAr: ['انضباط', 'التزام', 'ازاي التزم', 'حافظ على الروتين', 'بناء عادات'],
    keywordsFranco: ['endebat', 'eltezam', 'ezay altezem', '7afez 3ala el routine', 'bena2 3adat'],
    stateId: 'QA_MENU',
    response: { en: 'Building discipline: 1) Start small (just 20min, 3x/week) 2) Never miss 2 days in a row 3) Track everything (what gets measured gets managed) 4) Make it a non-negotiable appointment 5) Remove decisions (same time, same gym, pre-planned workout) 6) Celebrate small wins. It takes 66 days to build a habit. You\'re not lazy — you just haven\'t built the system yet!', ar: 'بناء الانضباط: 1) ابدأ صغير (20 دقيقة بس، 3 مرات/أسبوع) 2) متفوتش يومين ورا بعض أبداً 3) سجل كل حاجة (اللي بيتقاس بيتدار) 4) خليه موعد ثابت 5) شيل القرارات (نفس الوقت، نفس الجيم، تمرين محضر) 6) احتفل بالإنجازات الصغيرة. بياخد 66 يوم تبني عادة. مش كسلان — بس لسه مبنيتش النظام!' },
    priority: 8,
    domain: 'root',
  },

  // ── v24: Diabetes & Fitness ─────────────────────────────────
  {
    keywords: ['diabetes workout', 'diabetic exercise', 'blood sugar exercise', 'type 2 diabetes gym', 'insulin resistance workout', 'sugar patient gym'],
    keywordsAr: ['تمرين سكر', 'رياضة لمريض السكر', 'سكر ورياضة', 'مقاومة الأنسولين', 'سكري وتمرين'],
    keywordsFranco: ['tamreen sokkar', 'reyada le marid el sokkar', 'sokkar w reyada', 'mo2awmet el insulin'],
    stateId: 'HP_MENU',
    response: { en: 'Exercise with diabetes: 1) Best: walking 30min + resistance training 3x/week 2) Check blood sugar before training (avoid if <100 or >300 mg/dL) 3) Keep fast carbs nearby (juice, dates) for lows 4) Resistance training IMPROVES insulin sensitivity 5) Post-workout: blood sugar drops 2-72hrs 6) Morning exercise = better all-day glucose control. Always consult your doctor first!', ar: 'تمرين مع السكر: 1) الأفضل: مشي 30 دقيقة + حديد 3 مرات/أسبوع 2) قيس السكر قبل التمرين (متتمرنش لو <100 أو >300) 3) خلي كارب سريع جنبك (عصير، تمر) للانخفاض 4) تمارين الحديد بتحسن حساسية الأنسولين 5) بعد التمرين: السكر بينزل 2-72 ساعة 6) تمرين الصبح = تحكم أفضل في السكر طول اليوم. استشير دكتورك الأول!' },
    priority: 8,
    domain: 'health',
  },
  {
    keywords: ['diabetes diet', 'diabetic food', 'low glycemic', 'glycemic index', 'blood sugar food', 'sugar free diet'],
    keywordsAr: ['أكل سكر', 'أكل لمريض السكر', 'مؤشر جلايسيمي', 'أكل بدون سكر', 'نظام سكري'],
    keywordsFranco: ['akl sokkar', 'akl le marid el sokkar', 'low glycemic', 'nizam sokkary'],
    stateId: 'NT_MENU',
    response: { en: 'Diabetic nutrition tips: LOW glycemic foods: oats, sweet potato, brown rice, lentils, most vegetables. AVOID: white bread, sugary drinks, fruit juice, white rice (large portions). GOOD combos: protein + fiber with every meal slows glucose spike. Egyptian picks: ful medames (great!), grilled chicken + salad, lentil soup. Eat smaller, more frequent meals. Time carbs around workouts for better control.', ar: 'نصايح أكل السكر: أكل جلايسيمي منخفض: شوفان، بطاطا، رز بني، عدس، خضار. تجنب: عيش أبيض، مشروبات سكر، عصير فاكهة، رز أبيض (كميات كبيرة). كومبو كويس: بروتين + ألياف مع كل وجبة بيبطئ ارتفاع السكر. اختيارات مصرية: فول (ممتاز!)، فراخ مشوية + سلطة، شوربة عدس. كل وجبات أصغر وأكتر. وقت الكارب حوالين التمرين لتحكم أفضل.' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v24: Heart Health & Training ──────────────────────────────
  {
    keywords: ['heart health', 'cardio for heart', 'heart rate training', 'high blood pressure exercise', 'hypertension workout', 'cholesterol exercise'],
    keywordsAr: ['صحة القلب', 'كارديو للقلب', 'ضغط عالي وتمرين', 'كوليسترول', 'ضغط دم مرتفع'],
    keywordsFranco: ['se7et el 2alb', 'cardio lel 2alb', 'dagt 3aly w tamreen', 'cholesterol'],
    stateId: 'HP_MENU',
    response: { en: 'Heart-healthy training: 1) Zone 2 cardio (can talk, slightly breathless) 150min/week = gold standard 2) Resistance training LOWERS blood pressure (moderate weight, higher reps) 3) Avoid heavy Valsalva with hypertension 4) Walking 10k steps/day reduces heart disease 30% 5) Omega-3, fiber, less sodium = dietary priorities 6) Morning exercise = best for blood pressure. Get clearance from cardiologist if you have conditions!', ar: 'تمرين لصحة القلب: 1) كارديو زون 2 (تقدر تتكلم، نفسك يقطع شوية) 150 دقيقة/أسبوع = المعيار الذهبي 2) تمارين الحديد بتنزل الضغط (وزن متوسط، تكرارات أعلى) 3) تجنب فالسالفا الثقيل مع الضغط العالي 4) مشي 10 آلاف خطوة/يوم بيقلل أمراض القلب 30% 5) أوميجا-3، ألياف، ملح أقل = أولويات الأكل 6) تمرين الصبح = الأفضل للضغط. خد موافقة دكتور القلب لو عندك حالات!' },
    priority: 8,
    domain: 'health',
  },

  // ── v24: Joint Health & Longevity ─────────────────────────────
  {
    keywords: ['joint health', 'joint pain workout', 'knee pain gym', 'shoulder pain exercise', 'elbow pain', 'joint supplements', 'glucosamine'],
    keywordsAr: ['صحة المفاصل', 'ألم مفاصل', 'ألم ركبة', 'ألم كتف', 'ألم كوع', 'مكملات مفاصل', 'جلوكوزامين'],
    keywordsFranco: ['se7et el mafasel', 'alam mafasel', 'alam rokba', 'alam ketf', 'alam ko3', 'glucosamine'],
    stateId: 'HP_MENU',
    response: { en: 'Joint health: 1) Warm up 5-10min (always!) 2) Full ROM exercises strengthen joints 3) Collagen (10g/day) + Vitamin C shown to help 4) Glucosamine + chondroitin: mixed evidence, try 3 months 5) Fish oil reduces inflammation 6) Knee pain: strengthen VMO (leg extensions, wall sits) 7) Shoulder: face pulls + band external rotations daily 8) Elbow: wrist curls + eccentric work. Reduce load on painful joints, don\'t stop training entirely!', ar: 'صحة المفاصل: 1) إحماء 5-10 دقايق (دايماً!) 2) تمارين نطاق حركة كامل بتقوي المفاصل 3) كولاجين (10ج/يوم) + فيتامين سي بيساعد 4) جلوكوزامين + كوندرويتين: أدلة مختلطة، جرب 3 شهور 5) زيت السمك بيقلل الالتهاب 6) ألم ركبة: قوي VMO (ليج اكستنشن، وول سيت) 7) كتف: فيس بولز + باند اكسترنال روتيشن يومياً 8) كوع: ريست كيرلز + عمل إكسنتريك. قلل الحمل على المفاصل المؤلمة، متوقفش تمرين خالص!' },
    priority: 8,
    domain: 'health',
  },

  // ── v24: Swimming Programs ────────────────────────────────────
  {
    keywords: ['swimming workout', 'swim training', 'pool workout', 'swimming for fat loss', 'learn swimming', 'swimming technique'],
    keywordsAr: ['تمرين سباحة', 'برنامج سباحة', 'تمرين حمام سباحة', 'سباحة لحرق الدهون', 'تعلم سباحة'],
    keywordsFranco: ['tamreen seba7a', 'barnameg seba7a', 'tamreen 7amam seba7a', 'seba7a le 7ar2 el dohon', 'et3alem seba7a'],
    stateId: 'WK_MENU',
    response: { en: 'Swimming workouts: BEGINNER: 20min, 25m laps with rest, focus on breathing. INTERMEDIATE: 30-40min, 4x100m freestyle + 4x50m backstroke + 200m kick. ADVANCED: 60min, 10x100m intervals (1:30 rest), mixed strokes + pull buoy sets. Swimming burns 400-700 cal/hr! Great for joints (zero impact). For fat loss: swim 3-4x/week + strength train 2x. Egyptian pools: most clubs have 25m pools, check Cairo/Alex sports clubs.', ar: 'تمارين سباحة: مبتدئ: 20 دقيقة، لفات 25م مع راحة، ركز على التنفس. متوسط: 30-40 دقيقة، 4×100م فري + 4×50م ظهر + 200م رجل. متقدم: 60 دقيقة، 10×100م فواصل (1:30 راحة)، ستايلات مختلفة + بول بوي. السباحة بتحرق 400-700 سعرة/ساعة! ممتازة للمفاصل (صفر تأثير). لحرق الدهون: اسبح 3-4 مرات/أسبوع + حديد مرتين. حمامات مصر: أغلب الأندية فيها 25م، شيك على أندية القاهرة/اسكندرية.' },
    priority: 7,
    domain: 'workout',
  },

  // ── v24: Warm-up & Cool-down Protocols ────────────────────────
  {
    keywords: ['warm up', 'warmup routine', 'how to warm up', 'dynamic warmup', 'cool down', 'cooldown', 'stretching before workout'],
    keywordsAr: ['إحماء', 'روتين إحماء', 'ازاي اسخن', 'إحماء ديناميكي', 'تبريد', 'استرتش قبل التمرين'],
    keywordsFranco: ['e7ma2', 'routine e7ma2', 'ezay asa5an', 'e7ma2 dynamic', 'tabreed', 'stretch 2abl el tamreen'],
    stateId: 'WK_MENU',
    response: { en: 'Warm-up protocol (10min): 1) Light cardio 3min (jump rope/bike) 2) Dynamic stretches: leg swings, arm circles, hip circles 3) Movement prep: bodyweight squats, lunges, push-ups 4) Activation: band work for target muscles 5) Ramp-up sets (50%, 70%, 85% of working weight). Cool-down (5-10min): 1) Walk 3min 2) Static stretches 30sec each (only AFTER training) 3) Foam roll tight areas. NEVER skip warm-up — injury risk 3x higher without it!', ar: 'بروتوكول الإحماء (10 دقايق): 1) كارديو خفيف 3 دقايق (حبل/عجلة) 2) استرتش ديناميكي: لفات رجل، دوائر ذراع، دوائر وسط 3) تحضير حركة: سكوات بوزن الجسم، لانجز، بوش اب 4) تفعيل: باند للعضلات المستهدفة 5) سيتات تصاعدية (50%، 70%، 85% من وزن الشغل). التبريد (5-10 دقايق): 1) مشي 3 دقايق 2) استرتش ثابت 30ث لكل عضلة (بعد التمرين بس) 3) فوم رول للمناطق المشدودة. متعديش الإحماء أبداً — خطر الإصابة 3 أضعاف بدونه!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v24: Plateau Breaking ─────────────────────────────────────
  {
    keywords: ['plateau', 'stuck', 'not gaining', 'no progress', 'not losing weight', 'hit a wall', 'stalled', 'stopped gaining'],
    keywordsAr: ['ثبات', 'واقف', 'مش بزيد', 'مفيش تقدم', 'مش بخس', 'توقف', 'مش بتغير'],
    keywordsFranco: ['sabat', 'wa2ef', 'msh bazeed', 'mafesh ta2adom', 'msh ba5as', 'tawa2of'],
    stateId: 'QA_MENU',
    response: { en: 'Breaking plateaus: STRENGTH: 1) Deload week (50% volume) 2) Change rep ranges (5→12 or 12→5) 3) Add pauses/tempos 4) Different exercise variations. WEIGHT LOSS: 1) Diet break (eat at maintenance 1-2 weeks) 2) Increase NEAT (steps, stairs) 3) Refeed days (high carb) 4) Check sleep & stress. MUSCLE: 1) Progressive overload (more weight/reps/sets) 2) New stimulus (cables→free weights) 3) More protein 4) Better recovery. Plateaus are NORMAL — usually break in 2-4 weeks!', ar: 'كسر الثبات: قوة: 1) أسبوع ديلود (50% حجم) 2) غير نطاق التكرارات (5→12 أو 12→5) 3) ضيف وقفات/تيمبو 4) تمارين مختلفة. خسارة وزن: 1) استراحة دايت (كل ميتننس 1-2 أسبوع) 2) زود NEAT (خطوات، سلالم) 3) أيام ريفيد (كارب عالي) 4) شيك على النوم والتوتر. عضلات: 1) حمل تصاعدي (وزن/تكرارات/سيتات أكتر) 2) محفز جديد (كابل→أوزان حرة) 3) بروتين أكتر 4) ريكفري أفضل. الثبات طبيعي — عادة بيتكسر في 2-4 أسابيع!' },
    priority: 9,
    domain: 'root',
  },

  // ── v24: Military/Police Fitness Tests ────────────────────────
  {
    keywords: ['military fitness', 'army test', 'police fitness test', 'military training', 'army workout', 'boot camp', 'military press up'],
    keywordsAr: ['لياقة عسكرية', 'اختبار جيش', 'اختبار شرطة', 'تمرين عسكري', 'معسكر تدريب'],
    keywordsFranco: ['leya2a 3askareya', 'e5tebar geish', 'e5tebar shorta', 'tamreen 3askary', 'mo3askar tadreeb'],
    stateId: 'WK_MENU',
    response: { en: 'Military fitness prep: Egyptian military test typically: push-ups (2min), sit-ups (2min), 1.5-mile run. Training plan: 1) Push-ups: grease the groove (sets throughout day, 50% max) 2) Sit-ups: 5x30 daily 3) Running: 3x/week (1 long run, 1 intervals, 1 tempo) 4) Add pull-ups, burpees, bear crawls for GPP 5) Practice the EXACT test format weekly. Target: 50+ push-ups, 50+ sit-ups, run under 12min. Start 8 weeks before test!', ar: 'تحضير لياقة عسكرية: اختبار الجيش المصري عادة: ضغط (2 دقيقة)، بطن (2 دقيقة)، جري 1.5 ميل. خطة تدريب: 1) ضغط: سيتات على مدار اليوم (50% من الماكس) 2) بطن: 5×30 يومياً 3) جري: 3 مرات/أسبوع (جرية طويلة، فواصل، تيمبو) 4) ضيف عقلة، بيربي، بير كرول 5) تمرن على شكل الاختبار بالظبط أسبوعياً. الهدف: 50+ ضغط، 50+ بطن، جري تحت 12 دقيقة. ابدأ قبل الاختبار 8 أسابيع!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v24: Home Cooking Healthy ─────────────────────────────────
  {
    keywords: ['healthy cooking', 'how to cook healthy', 'meal prep tips', 'cooking methods healthy', 'air fryer', 'steam food', 'best cooking method'],
    keywordsAr: ['طبخ صحي', 'ازاي اطبخ صحي', 'نصايح ميل بريب', 'طرق طبخ صحية', 'اير فراير', 'أكل مسلوق'],
    keywordsFranco: ['tab5 se7y', 'ezay atbo5 se7y', 'nasa2e7 meal prep', 'toro2 tab5 se7eya', 'air fryer', 'akl masloo2'],
    stateId: 'NT_MENU',
    response: { en: 'Healthy cooking methods (ranked): 1) Grilling/Broiling — adds flavor, no extra fat 2) Air frying — 80% less oil than deep frying 3) Steaming — preserves most nutrients 4) Baking — hands-off, good for batch prep 5) Sautéing with spray oil — quick, minimal fat. AVOID: deep frying, heavy cream sauces. Meal prep tips: Cook protein in bulk Sunday, prep veggies in containers, freeze portions. Air fryer is a GAME CHANGER for Egyptian food (kofta, chicken, potatoes taste great with zero oil)!', ar: 'طرق الطبخ الصحي (مرتبة): 1) شوي/جريل — نكهة بدون دهون إضافية 2) اير فراير — 80% زيت أقل من القلي 3) سلق بالبخار — بيحافظ على المغذيات 4) فرن — سهل، كويس للتحضير بالكمية 5) تشويح بسبراي زيت — سريع، دهون قليلة. تجنب: قلي غطس، صوصات كريمة. نصايح ميل بريب: اطبخ بروتين بالكمية الأحد، حضر خضار في علب، فريز حصص. الاير فراير = غير اللعبة للأكل المصري (كفتة، فراخ، بطاطس طعمهم حلو بدون زيت)!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v24: Caffeine & Pre-workout ───────────────────────────────
  {
    keywords: ['caffeine', 'coffee before workout', 'pre workout supplement', 'how much caffeine', 'caffeine tolerance', 'caffeine cycling'],
    keywordsAr: ['كافيين', 'قهوة قبل التمرين', 'بري وركاوت', 'كمية الكافيين', 'تحمل الكافيين'],
    keywordsFranco: ['caffeine', '2ahwa 2abl el tamreen', 'pre workout', 'kameyet el caffeine', 'ta7amol el caffeine'],
    stateId: 'SP_MENU',
    response: { en: 'Caffeine for training: Optimal dose: 3-6mg/kg bodyweight (200-400mg for most). Take 30-45min before training. Benefits: +strength, +endurance, +focus, +fat burning. Tolerance builds in 2-3 weeks → cycle off 1-2 weeks every 2 months. Coffee = 80-100mg per cup. Pre-workout: 150-300mg + other ingredients. AVOID: after 2pm (kills sleep), don\'t exceed 400mg/day. Egyptian coffee (ahwa) is great pre-workout! Nescafé = weaker (~60mg).', ar: 'الكافيين للتمرين: الجرعة المثالية: 3-6مج/كج وزن (200-400مج لأغلب الناس). خده 30-45 دقيقة قبل التمرين. فوايد: +قوة، +تحمل، +تركيز، +حرق دهون. التحمل بيزيد في 2-3 أسابيع → وقفه 1-2 أسبوع كل شهرين. القهوة = 80-100مج في الفنجان. بري وركاوت: 150-300مج + مكونات تانية. تجنب: بعد 2 الضهر (بيضرب النوم)، متعديش 400مج/يوم. القهوة المصرية ممتازة قبل التمرين! النسكافيه = أضعف (~60مج).' },
    priority: 7,
    domain: 'supplements',
  },

  // ── v25: Pregnancy & Postpartum Fitness ────────────────────
  {
    keywords: ['pregnancy workout', 'pregnant exercise', 'postpartum fitness', 'after birth workout', 'pelvic floor', 'diastasis recti', 'exercise while pregnant'],
    keywordsAr: ['تمرين حمل', 'رياضة للحامل', 'رياضة بعد الولادة', 'قاع الحوض', 'انفصال عضلات البطن'],
    keywordsFranco: ['tamreen 7aml', 'reyada lel 7amel', 'reyada ba3d el welada', '2a3 el 7od', 'enfsal 3adalat el batn'],
    stateId: 'HP_MENU',
    response: { en: 'Pregnancy fitness: SAFE: walking, swimming, prenatal yoga, light weights (modify as belly grows). AVOID: lying flat after 1st trimester, contact sports, heavy lifting, hot yoga. Pelvic floor: Kegels daily (10x10sec holds, 3 sets). POSTPARTUM: Wait 6 weeks (12 for C-section), start with walks + pelvic floor. Diastasis recti: avoid crunches, do dead bugs + bird dogs + breathing exercises. Always get doctor clearance! Every pregnancy is different.', ar: 'لياقة الحمل: آمن: مشي، سباحة، يوجا حوامل، أوزان خفيفة (عدل مع كبر البطن). تجنب: الرقود على الظهر بعد أول 3 شهور، رياضات تلامس، رفع ثقيل، هوت يوجا. قاع الحوض: كيجل يومياً (10×10ث، 3 سيتات). بعد الولادة: استنى 6 أسابيع (12 لقيصري)، ابدأ بمشي + قاع حوض. انفصال عضلات البطن: تجنب كرانشز، اعمل ديد باجز + بيرد دوجز + تمارين تنفس. خد موافقة الدكتور دايماً! كل حمل مختلف.' },
    priority: 9,
    domain: 'health',
  },

  // ── v25: Senior Fitness (60+) ─────────────────────────────────
  {
    keywords: ['senior workout', 'elderly exercise', 'over 60 training', 'old age fitness', 'grandparent exercise', 'aging fitness', 'exercise for old'],
    keywordsAr: ['تمرين كبار السن', 'رياضة لكبار السن', 'تمرين فوق 60', 'لياقة كبار', 'رياضة المسنين'],
    keywordsFranco: ['tamreen kobar el sen', 'reyada le kobar el sen', 'tamreen fo2 60', 'leya2et kobar'],
    stateId: 'WK_MENU',
    response: { en: 'Senior fitness (60+): PRIORITY: 1) Balance training (single leg stand, tai chi) — prevents falls 2) Resistance training 2-3x/week (machines are safer than free weights) 3) Walking 30min daily 4) Flexibility (chair yoga, stretching) 5) Grip strength (squeeze ball). Start LIGHT, progress slowly. Protein: 1.2-1.6g/kg (higher than younger adults!). Social exercise (group classes, walking groups) improves adherence. It\'s NEVER too late to start — studies show muscle growth even at 90+!', ar: 'لياقة كبار السن (60+): أولوية: 1) تمارين توازن (وقوف رجل واحدة، تاي تشي) — بيمنع الوقوع 2) تمارين مقاومة 2-3 مرات/أسبوع (الأجهزة أأمن من الأوزان الحرة) 3) مشي 30 دقيقة يومياً 4) مرونة (يوجا كرسي، استرتش) 5) قوة القبضة (كرة ضغط). ابدأ خفيف، تدرج ببطء. بروتين: 1.2-1.6ج/كج (أعلى من الشباب!). رياضة جماعية (كلاسات، مجموعات مشي) بتحسن الالتزام. مفيش وقت متأخر — دراسات أثبتت نمو عضلي حتى في التسعينات!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v25: Bodyweight Progressions ──────────────────────────────
  {
    keywords: ['bodyweight progression', 'calisthenics progression', 'push up progression', 'pull up progression', 'cant do pull up', 'pistol squat', 'handstand progression'],
    keywordsAr: ['تدرج تمارين الجسم', 'تدرج كاليسثنكس', 'تدرج ضغط', 'تدرج عقلة', 'مش قادر اعمل عقلة', 'بيستول سكوات'],
    keywordsFranco: ['tadrog tamreen el gesm', 'tadrog calisthenics', 'tadrog dagt', 'tadrog 3a2la', 'msh 2ader a3mel 3a2la', 'pistol squat'],
    stateId: 'WK_MENU',
    response: { en: 'Bodyweight progressions: PUSH-UP: wall → incline → knee → full → archer → one-arm. PULL-UP: dead hang → band assisted → negatives (5sec) → half → full → weighted. SQUAT: assisted → full → Bulgarian split → pistol. DIPS: bench dips → parallel bars → weighted. L-SIT: tuck → one leg → full. HANDSTAND: wall walks → stomach to wall → freestanding. Key: Master each level for 3x10 before progressing. Film yourself to check form!', ar: 'تدرج تمارين الجسم: ضغط: حيطة → مائل → ركبة → كامل → آرتشر → يد واحدة. عقلة: ديد هانج → باند مساعد → سلبي (5ث) → نص → كامل → بوزن. سكوات: بمساعدة → كامل → بلغاري → بيستول. ديبس: بنش ديبس → بارالل بار → بوزن. ال-سيت: تك → رجل واحدة → كامل. هاند ستاند: مشي حيطة → بطن للحيطة → حر. المفتاح: اتقن كل مستوى 3×10 قبل التدرج. صور نفسك تشيك على الفورم!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v25: Protein Timing & Distribution ────────────────────────
  {
    keywords: ['protein timing', 'when to eat protein', 'protein before bed', 'anabolic window', 'protein distribution', 'protein per meal', 'casein before bed'],
    keywordsAr: ['توقيت البروتين', 'امتى اكل بروتين', 'بروتين قبل النوم', 'نافذة الأنابوليك', 'توزيع البروتين'],
    keywordsFranco: ['taw2eet el protein', 'emta akol protein', 'protein 2abl el nom', 'nafzet el anabolic', 'tawzee3 el protein'],
    stateId: 'NT_MENU',
    response: { en: 'Protein timing science: 1) "Anabolic window" is a myth — total daily protein matters MORE 2) Distribute evenly: 30-50g per meal, 4-5 meals 3) Pre-workout (1-2hrs before): 25-40g protein + carbs 4) Post-workout (within 2hrs): 25-40g protein + carbs 5) Before bed: casein protein or cottage cheese (slow release, 8hrs of muscle building) 6) Morning: break the fast with protein. Your body can use 40g+ per meal — the "30g limit" is outdated!', ar: 'علم توقيت البروتين: 1) "نافذة الأنابوليك" خرافة — إجمالي البروتين اليومي أهم 2) وزع بالتساوي: 30-50ج في الوجبة، 4-5 وجبات 3) قبل التمرين (1-2 ساعة): 25-40ج بروتين + كارب 4) بعد التمرين (خلال ساعتين): 25-40ج بروتين + كارب 5) قبل النوم: كازين أو جبنة قريش (بطيء الإفراز، 8 ساعات بناء عضلي) 6) الصبح: اكسر الصيام ببروتين. جسمك يقدر يستخدم 40ج+ في الوجبة — حد "30ج" قديم!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v25: Egyptian Supplement Market ────────────────────────────
  {
    keywords: ['supplement brand egypt', 'best protein egypt', 'where to buy supplements egypt', 'supplement store egypt', 'whey price egypt', 'optimum nutrition egypt'],
    keywordsAr: ['أفضل بروتين مصر', 'فين اشتري مكملات', 'محل مكملات', 'سعر الواي مصر', 'ماركات مكملات مصر'],
    keywordsFranco: ['afdal protein masr', 'fen ashtary mokamalat', 'ma7al mokamalat', 'se3r el whey masr', 'markat mokamalat masr'],
    stateId: 'SP_MENU',
    response: { en: 'Egypt supplement market 2024: TOP brands: Optimum Nutrition (ON) Gold Standard (~2000-2500 LE/5lb), Dymatize ISO 100 (~2200 LE), Kevin Levrone (~1500-1800 LE). BUDGET: Rule 1, EVL, Applied Nutrition (~1200-1500 LE). WHERE TO BUY: iHerb (reliable, takes 1-2 weeks), local stores (Sports Zone, Care Supplements), Facebook groups (check authenticity!). BEWARE: fake supplements are common — check holograms, seals, batch numbers. Always buy sealed!', ar: 'سوق المكملات المصري 2024: أفضل ماركات: أوبتمم نيوتريشن (ON) جولد ستاندرد (~2000-2500 جنيه/5 باوند)، ديماتيز ISO 100 (~2200 جنيه)، كيفن ليفرون (~1500-1800 جنيه). اقتصادي: Rule 1، EVL، أبلايد نيوتريشن (~1200-1500 جنيه). فين تشتري: iHerb (موثوق، 1-2 أسبوع)، محلات محلية (سبورتس زون، كير سبليمنتس)، جروبات فيسبوك (شيك الأصالة!). احذر: المكملات المضروبة كتير — شيك الهولوجرام، الختم، رقم الباتش. اشتري مقفول دايماً!' },
    priority: 8,
    domain: 'supplements',
  },

  // ── v25: Gym Etiquette Deep Dive ──────────────────────────────
  {
    keywords: ['gym etiquette', 'gym manners', 'gym rules', 'sharing equipment', 'gym towel', 'rerack weights', 'gym respect'],
    keywordsAr: ['آداب الجيم', 'قوانين الجيم', 'مشاركة الأجهزة', 'منشفة الجيم', 'رجع الأوزان'],
    keywordsFranco: ['adab el gym', '2awaneen el gym', 'mosharka el agheza', 'manshafet el gym', 'raga3 el awzan'],
    stateId: 'QA_MENU',
    response: { en: 'Gym etiquette (Golden rules): 1) RERACK your weights (always!) 2) Wipe equipment after use (carry a towel) 3) Don\'t hog machines during peak hours (share, work in) 4) Ask "how many sets left?" not just stand and stare 5) Don\'t give unsolicited advice 6) Keep phone calls outside 7) Don\'t block the mirror or dumbbell rack 8) 3 minutes max rest during busy hours 9) Respect others\' space and headphones = "don\'t talk to me" 10) In Egypt: greeting everyone is nice but keep it brief!', ar: 'آداب الجيم (القواعد الذهبية): 1) رجع الأوزان مكانها (دايماً!) 2) امسح الجهاز بعد الاستخدام (شيل منشفة) 3) متحجزش الأجهزة في وقت الزحمة (شارك، اتبادل) 4) اسأل "فاضلك كام سيت؟" متقفش تتفرج 5) متديش نصايح محدش طلبها 6) المكالمات برا 7) متقفش قدام المراية أو رف الدمبلز 8) راحة 3 دقايق ماكس وقت الزحمة 9) احترم مساحة الناس وسماعات = "متكلمنيش" 10) في مصر: السلام حلو بس خليه سريع!' },
    priority: 7,
    domain: 'root',
  },

  // ── v25: Training Splits Explained ────────────────────────────
  {
    keywords: ['training split', 'workout split', 'bro split', 'ppl', 'push pull legs', 'upper lower', 'full body vs split', 'how many days'],
    keywordsAr: ['تقسيم التمرين', 'سبليت', 'برو سبليت', 'بوش بول ليج', 'اب لو', 'فول بادي', 'كام يوم اتمرن'],
    keywordsFranco: ['ta2seem el tamreen', 'split', 'bro split', 'push pull legs', 'upper lower', 'full body', 'kam yom atmarren'],
    stateId: 'WK_MENU',
    response: { en: 'Training splits: 2-3 days → FULL BODY (best for beginners, hits everything 2-3x/week). 4 days → UPPER/LOWER (great balance, each muscle 2x/week). 5-6 days → PPL Push/Pull/Legs (advanced, each muscle 2x/week). BRO SPLIT (chest day, back day, etc.) → 1x/week per muscle, least optimal for growth. BEST for most people: PPL or Upper/Lower. Egyptian gyms: most are open daily, so PPL works great. Rest at least 1 day/week!', ar: 'تقسيمات التمرين: 2-3 أيام → فول بادي (الأفضل للمبتدئين، كل عضلة 2-3 مرات/أسبوع). 4 أيام → أب/لو (توازن ممتاز، كل عضلة مرتين/أسبوع). 5-6 أيام → PPL بوش/بول/ليج (متقدم، كل عضلة مرتين/أسبوع). برو سبليت (يوم صدر، يوم ظهر، إلخ) → مرة/أسبوع لكل عضلة، أقل فعالية للنمو. الأفضل لأغلب الناس: PPL أو أب/لو. جيمات مصر: أغلبها مفتوح يومياً، PPL بيشتغل كويس. ريح يوم واحد على الأقل/أسبوع!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v25: Water & Electrolyte Deep Dive ────────────────────────
  {
    keywords: ['how much water', 'water intake', 'electrolytes', 'dehydration signs', 'sodium workout', 'salt before workout', 'water during workout'],
    keywordsAr: ['كمية المية', 'شرب مية', 'أملاح', 'علامات الجفاف', 'ملح قبل التمرين', 'مية أثناء التمرين'],
    keywordsFranco: ['kameyet el maya', 'shorb maya', 'amla7', '3alamat el gafaf', 'mel7 2abl el tamreen', 'maya asna2 el tamreen'],
    stateId: 'HP_MENU',
    response: { en: 'Water & electrolytes: DAILY: 35ml per kg bodyweight (80kg = 2.8L minimum). ADD 500ml per hour of exercise. SIGNS of dehydration: dark urine, headache, fatigue, cramps. ELECTROLYTES: sodium (most important for gym), potassium, magnesium. Pre-workout hack: pinch of salt in water (cheap, effective). During workout: sip every 15min. In Egypt summer heat: add 1L extra daily. After workout: replace 150% of sweat lost. Urine color should be light yellow — not clear (over-hydrated) or dark!', ar: 'المية والأملاح: يومياً: 35مل لكل كج وزن (80كج = 2.8 لتر على الأقل). ضيف 500مل لكل ساعة تمرين. علامات الجفاف: بول غامق، صداع، تعب، تقلصات. أملاح: صوديوم (الأهم للجيم)، بوتاسيوم، ماغنسيوم. ترك قبل التمرين: رشة ملح في المية (رخيص وفعال). أثناء التمرين: رشفة كل 15 دقيقة. في حر مصر: ضيف لتر إضافي يومياً. بعد التمرين: عوض 150% من العرق. لون البول لازم يكون أصفر فاتح — مش شفاف (مية زيادة) أو غامق!' },
    priority: 7,
    domain: 'health',
  },

  // ── v26: Chest Training Deep Dive ──────────────────────────
  {
    keywords: ['chest workout', 'how to grow chest', 'chest exercises', 'bench press form', 'incline bench', 'chest fly', 'upper chest', 'lower chest'],
    keywordsAr: ['تمرين صدر', 'ازاي اكبر الصدر', 'تمارين صدر', 'فورم بنش بريس', 'صدر علوي', 'صدر سفلي'],
    keywordsFranco: ['tamreen sadr', 'ezay akabar el sadr', 'tamareen sadr', 'form bench press', 'sadr 3olwy', 'sadr sofli'],
    stateId: 'WK_MENU',
    response: { en: 'Chest training deep dive: UPPER CHEST: incline bench 30° (barbell or DB), incline flyes, landmine press. MID CHEST: flat bench press, DB press, cable crossover (mid). LOWER CHEST: decline press, dips (lean forward), high-to-low cable fly. KEY TIPS: 1) Retract scapula ("put shoulder blades in back pockets") 2) Arch slightly for more chest activation 3) Full ROM — touch chest on bench 4) 12-20 sets/week total 5) Mind-muscle connection: squeeze at top. Most Egyptian gym bros overtrain chest — quality > quantity!', ar: 'تمرين صدر متعمق: صدر علوي: بنش مائل 30° (بار أو دمبل)، فلاي مائل، لاندماين بريس. صدر وسط: فلات بنش، دمبل بريس، كابل كروس أوفر (وسط). صدر سفلي: ديكلاين بريس، ديبس (ميل لقدام)، كابل فلاي من فوق لتحت. نصايح مهمة: 1) ارجع الأكتاف لورا ("حط اللوح في جيبك الخلفي") 2) قوس خفيف لتفعيل الصدر أكتر 3) نطاق حركة كامل — لمس الصدر 4) 12-20 سيت/أسبوع إجمالي 5) تواصل عضلي: اعصر في الأعلى. أغلب شباب الجيم في مصر بيبالغوا في الصدر — الجودة > الكمية!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v26: Back Training Deep Dive ──────────────────────────────
  {
    keywords: ['back workout', 'how to grow back', 'back exercises', 'lat pulldown', 'row form', 'back width', 'back thickness', 'v taper'],
    keywordsAr: ['تمرين ظهر', 'ازاي اكبر الظهر', 'تمارين ظهر', 'لات بول داون', 'عرض الظهر', 'سمك الظهر'],
    keywordsFranco: ['tamreen dahr', 'ezay akabar el dahr', 'tamareen dahr', 'lat pulldown', '3ard el dahr', 'somk el dahr'],
    stateId: 'WK_MENU',
    response: { en: 'Back training deep dive: WIDTH (lats): wide grip pulldowns, pull-ups, straight arm pulldowns. THICKNESS (traps/rhomboids): barbell rows, T-bar rows, seated cable rows (close grip). LOWER BACK: deadlifts (conventional/RDL), back extensions, good mornings. KEY TIPS: 1) Pull with ELBOWS, not hands 2) Squeeze shoulder blades together 3) Controlled negatives (2-3sec) 4) Mix grip widths and angles 5) Deadlift 1x/week is enough 6) 15-22 sets/week for advanced. V-taper = wide lats + small waist. Most underrated exercise: face pulls!', ar: 'تمرين ظهر متعمق: عرض (لاتس): بول داون واسع، عقلة، سترايت آرم بول داون. سمك (ترابس/رومبويدز): بنت أوفر رو، تي بار رو، سيتد كابل رو (ضيق). أسفل الظهر: ديدلفت (عادي/RDL)، باك اكستنشن، جود مورنينج. نصايح: 1) اسحب بالكوع مش الإيد 2) اعصر اللوح مع بعض 3) سلبي متحكم (2-3ث) 4) نوع في عرض القبضة والزوايا 5) ديدلفت مرة/أسبوع كفاية 6) 15-22 سيت/أسبوع للمتقدم. في-تيبر = لاتس عريض + وسط صغير. أكتر تمرين محدش بيعمله: فيس بولز!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v26: Leg Training Deep Dive ───────────────────────────────
  {
    keywords: ['leg workout', 'leg day', 'how to grow legs', 'squat form', 'leg press', 'hamstring', 'quad exercise', 'calf training', 'skip leg day'],
    keywordsAr: ['تمرين رجل', 'يوم رجل', 'ازاي اكبر الرجل', 'فورم سكوات', 'ليج بريس', 'عضلة خلفية', 'كواد', 'سمانة'],
    keywordsFranco: ['tamreen regl', 'yom regl', 'ezay akabar el regl', 'form squat', 'leg press', '3adala 5alfeya', 'quad', 'semana'],
    stateId: 'WK_MENU',
    response: { en: 'Leg training deep dive: QUADS: squats, leg press, leg extensions, Bulgarian split squats, hack squats. HAMSTRINGS: RDL, lying leg curls, seated leg curls, good mornings. GLUTES: hip thrusts, sumo deadlifts, lunges, step-ups. CALVES: standing calf raises (heavy, full ROM), seated calf raises (bent knee). KEY: 1) Squat depth: parallel minimum (hip crease at knee level) 2) Knees CAN go past toes 3) 15-20 sets/week per group 4) Train calves 3-4x/week (stubborn muscle) 5) Never skip leg day — it boosts testosterone! The "never skip leg day" meme is real!', ar: 'تمرين رجل متعمق: كواد: سكوات، ليج بريس، ليج اكستنشن، بلغاري سبليت، هاك سكوات. خلفية: RDL، لاينج ليج كيرل، سيتد ليج كيرل، جود مورنينج. أرداف: هيب ثرست، سومو ديدلفت، لانجز، ستيب اب. سمانة: كاف ريزز واقف (ثقيل، نطاق كامل)، سيتد كاف ريز (ركبة مثنية). المفتاح: 1) عمق السكوات: بارالل على الأقل 2) الركبة ممكن تعدي الصوابع 3) 15-20 سيت/أسبوع لكل مجموعة 4) سمانة 3-4 مرات/أسبوع (عضلة عنيدة) 5) متعديش يوم الرجل — بيرفع التستوستيرون! الميم "متعديش يوم الرجل" حقيقي!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v26: Supplement Stacking ───────────────────────────────────
  {
    keywords: ['supplement stack', 'what supplements together', 'beginner supplement stack', 'advanced supplement stack', 'supplement combo'],
    keywordsAr: ['ستاك مكملات', 'مكملات مع بعض', 'ستاك مبتدئ', 'ستاك متقدم', 'كومبو مكملات'],
    keywordsFranco: ['stack mokamalat', 'mokamalat ma3 ba3d', 'stack mobtade2', 'stack mota2adem', 'combo mokamalat'],
    stateId: 'SP_MENU',
    response: { en: 'Supplement stacks: BEGINNER (3 essentials): Whey protein + Creatine (5g/day) + Multivitamin. INTERMEDIATE: Add Omega-3, Vitamin D (5000IU), Magnesium. ADVANCED: Add pre-workout, ZMA (sleep), ashwagandha (stress/test), citrulline (pump). BUDGET Egyptian stack: Whey (Rule 1 ~1200LE) + Creatine (Universal ~300LE) + Vitamin D (pharmacy ~50LE) = ~1550LE/month for basics. DON\'T waste money on: BCAAs (if you have whey), mass gainers (just eat more), test boosters (mostly useless).', ar: 'ستاكات المكملات: مبتدئ (3 أساسيات): واي بروتين + كرياتين (5ج/يوم) + ملتي فيتامين. متوسط: ضيف أوميجا-3، فيتامين د (5000IU)، ماغنسيوم. متقدم: ضيف بري وركاوت، ZMA (نوم)، أشواغاندا (توتر/تست)، سيترولين (بامب). ستاك مصري اقتصادي: واي (Rule 1 ~1200جنيه) + كرياتين (يونيفرسال ~300جنيه) + فيتامين د (صيدلية ~50جنيه) = ~1550جنيه/شهر للأساسيات. متصرفش فلوس على: BCAAs (لو معاك واي)، ماس جينر (كل أكتر بس)، تست بوستر (مفيش فايدة).' },
    priority: 8,
    domain: 'supplements',
  },

  // ── v26: Body Recomposition ───────────────────────────────────
  {
    keywords: ['body recomp', 'recomposition', 'lose fat gain muscle same time', 'build muscle lose fat', 'maingaining', 'lean bulk'],
    keywordsAr: ['إعادة تكوين الجسم', 'خسارة دهون وبناء عضل', 'ريكومب', 'بناء عضل وحرق دهون', 'لين بالك'],
    keywordsFranco: ['e3adet takween el gesm', '5asaret dohon w bena2 3adal', 'recomp', 'lean bulk'],
    stateId: 'NT_MENU',
    response: { en: 'Body recomp (lose fat + gain muscle): WHO it works for: beginners, overweight, returning after break. HOW: Eat at maintenance or slight deficit (-200 cal), HIGH protein (2-2.5g/kg), train hard 4-5x/week, prioritize sleep. Timeline: slow (3-6 months for visible results). Lean bulk alternative: surplus of +200-300 cal (gain 0.5-1kg/month). Dirty bulk (eating everything): NOT recommended — you\'ll gain too much fat. Track progress with photos + measurements, NOT just the scale!', ar: 'ريكومب (خسارة دهون + بناء عضل): لمين بيشتغل: مبتدئين، وزن زيادة، راجع بعد انقطاع. ازاي: كل ميتننس أو عجز خفيف (-200 سعرة)، بروتين عالي (2-2.5ج/كج)، تمرن بجد 4-5 مرات/أسبوع، أولوية النوم. المدة: بطيء (3-6 شهور لنتايج واضحة). لين بالك بديل: فائض +200-300 سعرة (زيادة 0.5-1كج/شهر). ديرتي بالك (أكل كل حاجة): مش محبذ — هتزود دهون كتير. تابع التقدم بصور + قياسات، مش الميزان بس!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v26: Pain vs Soreness ─────────────────────────────────────
  {
    keywords: ['pain vs soreness', 'sharp pain workout', 'is this pain normal', 'when to stop exercise', 'injury vs doms', 'should i train sore'],
    keywordsAr: ['ألم ولا شد', 'ألم حاد', 'الألم ده طبيعي', 'امتى اوقف تمرين', 'إصابة ولا دومز', 'اتمرن وانا متكسر'],
    keywordsFranco: ['alam wala shad', 'alam 7ad', 'el alam da tabi3y', 'emta awa2af tamreen', 'esaba wala doms', 'atmarren w ana metkaser'],
    stateId: 'HP_MENU',
    response: { en: 'Pain vs Soreness: NORMAL DOMS: dull ache, both sides equally, peaks 24-48hrs, improves with movement. RED FLAGS (stop training): sharp/stabbing pain, one side only, pain during exercise, swelling, clicking/popping, numbness/tingling, pain that worsens with movement. TRAIN SORE? Light training helps! But reduce weight 30-50%. If pain is 7+/10, REST. Rule of thumb: muscle soreness = train lighter, joint/tendon pain = REST and see a doctor if >1 week.', ar: 'ألم ولا شد عضلي: دومز طبيعي: ألم خفيف، الناحيتين متساوي، الذروة 24-48 ساعة، بيتحسن بالحركة. علامات خطر (وقف التمرين): ألم حاد/طعن، ناحية واحدة بس، ألم أثناء التمرين، تورم، طقطقة/طرقعة، تنميل، ألم بيزيد مع الحركة. اتمرن وانت متكسر؟ تمرين خفيف بيساعد! بس قلل الوزن 30-50%. لو الألم 7+/10، ريح. قاعدة عامة: شد عضلي = تمرن أخف، ألم مفصل/وتر = ريح وروح دكتور لو >أسبوع.' },
    priority: 9,
    domain: 'health',
  },

  // ── v26: Workout Music & Performance ──────────────────────────
  {
    keywords: ['workout music', 'gym playlist', 'music for training', 'best gym songs', 'music motivation', 'headphones gym'],
    keywordsAr: ['موسيقى تمرين', 'بلايليست جيم', 'أغاني جيم', 'موسيقى تحفيز', 'سماعات جيم'],
    keywordsFranco: ['mosee2a tamreen', 'playlist gym', 'aghany gym', 'mosee2a ta7feez', 'sama3at gym'],
    stateId: 'QA_MENU',
    response: { en: 'Music & workout performance: Studies show music improves performance 5-15%! BPM guide: Warm-up: 100-120 BPM. Strength training: 130-150 BPM. HIIT/Cardio: 150-180 BPM. Stretching: 80-100 BPM. Genres that work: hip hop, EDM, metal, Arabic shaabi/mahraganat (high energy!). Noise-canceling headphones = focus mode (people won\'t interrupt). Save your PR playlist for heavy sets. Tip: create separate playlists for different workout types!', ar: 'الموسيقى وأداء التمرين: دراسات أثبتت إن الموسيقى بتحسن الأداء 5-15%! دليل BPM: إحماء: 100-120. حديد: 130-150. HIIT/كارديو: 150-180. استرتش: 80-100. أنواع بتشتغل: هيب هوب، EDM، ميتال، شعبي/مهرجانات (طاقة عالية!). سماعات نويز كانسلينج = وضع التركيز (محدش هيزعجك). خلي بلايليست البي آر للسيتات الثقيلة. نصيحة: اعمل بلايليستات مختلفة لأنواع التمرين!' },
    priority: 6,
    domain: 'root',
  },

  // ── v26: Egyptian Street Workout & Parks ──────────────────────
  {
    keywords: ['street workout egypt', 'outdoor gym egypt', 'calisthenics egypt', 'park workout', 'free workout egypt', 'outdoor exercise'],
    keywordsAr: ['ستريت وركاوت مصر', 'جيم برا', 'كاليسثنكس مصر', 'تمرين حديقة', 'تمرين مجاني', 'تمرين في الشارع'],
    keywordsFranco: ['street workout masr', 'gym barra', 'calisthenics masr', 'tamreen 7adee2a', 'tamreen magany', 'tamreen fel share3'],
    stateId: 'WK_MENU',
    response: { en: 'Street workout in Egypt: SPOTS: Corniche (Alex & Cairo), Al-Azhar Park, public gardens with bars, beach areas (North Coast summer). EQUIPMENT: Pull-up bars, parallel bars, benches = full workout! ROUTINE: Pull-ups, dips, push-ups, muscle-ups, leg raises, pistol squats. COMMUNITY: Egyptian calisthenics community is growing — check Instagram/Facebook groups. Best time: early morning (avoid heat). FREE alternative to gym! Combine with running on Corniche for complete fitness.', ar: 'ستريت وركاوت في مصر: أماكن: كورنيش (اسكندرية والقاهرة)، حديقة الأزهر، حدائق عامة فيها بارات، أماكن بحر (ساحل صيف). معدات: عقلة، بارالل بار، كراسي = تمرين كامل! روتين: عقلة، ديبس، ضغط، ماسل اب، رفع رجل، بيستول سكوات. مجتمع: مجتمع الكاليسثنكس المصري بيكبر — شيك انستجرام/فيسبوك. أفضل وقت: الصبح بدري (تجنب الحر). بديل مجاني للجيم! ادمجه مع جري على الكورنيش لياقة كاملة.' },
    priority: 7,
    domain: 'workout',
  },

  // ── v26: Shoulder Training Deep Dive ──────────────────────────
  {
    keywords: ['shoulder workout', 'how to grow shoulders', 'deltoid exercises', 'lateral raise', 'overhead press', 'rear delt', 'shoulder width', 'boulder shoulders'],
    keywordsAr: ['تمرين كتف', 'ازاي اكبر الكتف', 'تمارين كتف', 'لاترال ريز', 'أوفرهيد بريس', 'كتف خلفي', 'عرض الكتف'],
    keywordsFranco: ['tamreen ketf', 'ezay akabar el ketf', 'tamareen ketf', 'lateral raise', 'overhead press', 'ketf 5alfy', '3ard el ketf'],
    stateId: 'WK_MENU',
    response: { en: 'Shoulder training deep dive: FRONT DELT: overhead press (barbell/DB), front raises (already hit in chest work). SIDE DELT (key for width!): lateral raises (lean slightly, lift with elbows), cable laterals, machine laterals. REAR DELT: face pulls, reverse flyes, rear delt machine. KEY: 1) Side delts need HIGH volume (15-25 sets/week) 2) Light weight + high reps (15-25) for laterals 3) Don\'t ego lift laterals — use 5-10kg 4) Overhead press: moderate weight, full ROM 5) Rear delts every training day (3x15). Wide shoulders = V-taper illusion!', ar: 'تمرين كتف متعمق: أمامي: أوفرهيد بريس (بار/دمبل)، فرونت ريز (بيتمرن من تمرين الصدر). جانبي (المفتاح للعرض!): لاترال ريز (ميل شوية، ارفع بالكوع)، كابل لاترال، ماشين لاترال. خلفي: فيس بولز، ريفرس فلاي، ماشين رير ديلت. المفتاح: 1) الكتف الجانبي محتاج حجم عالي (15-25 سيت/أسبوع) 2) وزن خفيف + تكرارات عالية (15-25) للاترالز 3) متعاندش في وزن اللاترالز — استخدم 5-10كج 4) أوفرهيد بريس: وزن متوسط، نطاق كامل 5) كتف خلفي كل يوم تمرين (3×15). كتف عريض = خداع في-تيبر!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v26: Arm Training (Biceps & Triceps) ──────────────────────
  {
    keywords: ['arm workout', 'bicep workout', 'tricep workout', 'how to grow arms', 'bigger arms', 'bicep curl', 'arm day', 'arm exercises'],
    keywordsAr: ['تمرين ذراع', 'تمرين باي', 'تمرين تراي', 'ازاي اكبر الدراع', 'دراع اكبر', 'بايسبس كيرل', 'يوم دراع'],
    keywordsFranco: ['tamreen dera3', 'tamreen bicep', 'tamreen tricep', 'ezay akabar el dera3', 'dera3 akbar', 'bicep curl', 'yom dera3'],
    stateId: 'WK_MENU',
    response: { en: 'Arm training: BICEPS (2 heads): long head = incline curls, hammer curls. Short head = preacher curls, spider curls. Best overall: barbell curl, DB curl. TRICEPS (2/3 of arm size!): long head = overhead extension, skull crushers. Lateral head = pushdowns, close grip bench. KEY TIPS: 1) Triceps = 2/3 of arm — train them MORE 2) 10-15 sets/week each 3) Full ROM + squeeze at peak 4) Progressive overload still applies (don\'t just pump) 5) Cheat curls are okay occasionally for overload 6) Train arms 2x/week minimum for growth!', ar: 'تمرين دراع: باي (رأسين): طويل = إنكلاين كيرل، هامر كيرل. قصير = بريشر كيرل، سبايدر كيرل. الأفضل عموماً: باربل كيرل، دمبل كيرل. تراي (ثلثين حجم الدراع!): طويل = أوفرهيد اكستنشن، سكل كراشرز. جانبي = بوشداون، كلوز جريب بنش. نصايح: 1) التراي = ثلثين الدراع — مرنه أكتر 2) 10-15 سيت/أسبوع لكل 3) نطاق كامل + عصر في القمة 4) الحمل التصاعدي مهم (مش بس بامب) 5) تشييتنج كيرلز أوكي أحياناً للحمل الزايد 6) مرن الدراع مرتين/أسبوع على الأقل للنمو!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v27: Injury Prevention ─────────────────────────────────
  {
    keywords: ['injury prevention', 'prevent injury', 'avoid injury', 'stay safe gym', 'common gym injuries', 'safe training'],
    keywordsAr: ['منع الإصابة', 'تجنب الإصابة', 'أمان الجيم', 'إصابات شائعة', 'تمرين آمن'],
    keywordsFranco: ['man3 el esaba', 'tagannob el esaba', 'aman el gym', 'esabat sha2e3a', 'tamreen amen'],
    stateId: 'HP_MENU',
    response: { en: 'Injury prevention (Top 10): 1) ALWAYS warm up (5-10min) 2) Never ego lift — leave 1-2 reps in reserve 3) Use full ROM with control 4) Warm up to working weight (ramp up sets) 5) Deload every 4-6 weeks 6) Fix muscle imbalances (push = pull volume) 7) Stretch AFTER training, not before 8) Sleep 7-9hrs (recovery = injury prevention) 9) If something hurts, STOP — pain is a signal 10) Get a form check (film yourself or ask a trainer). 80% of gym injuries are from ego lifting or bad form!', ar: 'منع الإصابة (أهم 10): 1) إحماء دايماً (5-10 دقايق) 2) متعاندش في الوزن — خلي 1-2 تكرار احتياطي 3) نطاق حركة كامل بتحكم 4) سخن للوزن الشغل (سيتات تصاعدية) 5) ديلود كل 4-6 أسابيع 6) صلح اختلالات العضلات (دفع = سحب في الحجم) 7) استرتش بعد التمرين مش قبل 8) نام 7-9 ساعات (الريكفري = منع إصابة) 9) لو حاجة وجعتك وقف — الألم إشارة 10) شيك على الفورم (صور نفسك أو اسأل مدرب). 80% إصابات الجيم من التعند في الوزن أو الفورم الغلط!' },
    priority: 9,
    domain: 'health',
  },

  // ── v27: Ramadan Fitness ──────────────────────────────────────
  {
    keywords: ['ramadan workout', 'ramadan training', 'fasting workout', 'exercise while fasting', 'gym ramadan', 'training fasting'],
    keywordsAr: ['تمرين رمضان', 'رياضة في رمضان', 'تمرين صيام', 'جيم رمضان', 'تمرين وانا صايم'],
    keywordsFranco: ['tamreen ramadan', 'reyada fi ramadan', 'tamreen seyam', 'gym ramadan', 'tamreen w ana sayem'],
    stateId: 'WK_MENU',
    response: { en: 'Ramadan training guide: BEST TIME: 1-2hrs after iftar (eat, digest, train) or 30min before iftar (light session, break fast immediately after). AVOID: heavy training while fasting (dehydration risk). NUTRITION: Suhoor = slow carbs + protein + healthy fats (oats, eggs, avocado). Iftar = don\'t overeat, start with dates + water, then balanced meal. TRAINING: reduce volume 20-30%, maintain intensity, focus on compounds. Stay hydrated between iftar-suhoor (aim for 2-3L). It\'s okay to reduce frequency to 3-4x/week.', ar: 'دليل تمرين رمضان: أفضل وقت: 1-2 ساعة بعد الإفطار (كل، هضم، تمرن) أو 30 دقيقة قبل الإفطار (جلسة خفيفة، فطر بعدها على طول). تجنب: تمرين ثقيل وانت صايم (خطر جفاف). التغذية: السحور = كارب بطيء + بروتين + دهون صحية (شوفان، بيض، أفوكادو). الإفطار = متاكلش كتير، ابدأ بتمر + مية، بعدين وجبة متوازنة. التمرين: قلل الحجم 20-30%، حافظ على الشدة، ركز على الأساسيات. اشرب بين الإفطار والسحور (2-3 لتر). عادي تقلل ل3-4 مرات/أسبوع.' },
    priority: 9,
    domain: 'workout',
  },

  // ── v27: Ramadan Nutrition Deep Dive ──────────────────────────
  {
    keywords: ['ramadan diet', 'ramadan nutrition', 'suhoor meal', 'iftar meal', 'what to eat ramadan', 'ramadan meal plan', 'fasting nutrition'],
    keywordsAr: ['أكل رمضان', 'تغذية رمضان', 'وجبة سحور', 'وجبة إفطار', 'اكل ايه رمضان', 'خطة أكل رمضان'],
    keywordsFranco: ['akl ramadan', 'taghzeya ramadan', 'wagbet so7oor', 'wagbet eftar', 'akol eih ramadan'],
    stateId: 'NT_MENU',
    response: { en: 'Ramadan meal plan: SUHOOR (must eat!): Option A: Oats + eggs + dates + water. Option B: Ful medames + bread + yogurt. Option C: Cheese + honey + nuts + whole wheat. IFTAR: Start with 3 dates + water → soup → balanced plate (protein + carbs + veggies). BETWEEN: Snack with protein shake + fruits + nuts. KEY: 1) Don\'t skip suhoor 2) Drink 2-3L water (iftar to suhoor) 3) Protein at every eating opportunity 4) Avoid fried foods (sambousa, fried anything!) 5) Don\'t overeat at iftar — small meals work better!', ar: 'خطة أكل رمضان: السحور (لازم تاكل!): خيار أ: شوفان + بيض + تمر + مية. خيار ب: فول + عيش + زبادي. خيار ج: جبنة + عسل + مكسرات + عيش بلدي. الإفطار: ابدأ ب3 تمرات + مية → شوربة → طبق متوازن (بروتين + كارب + خضار). بين الوجبات: سناك بروتين شيك + فاكهة + مكسرات. المفتاح: 1) متعديش السحور 2) اشرب 2-3 لتر مية (من الإفطار للسحور) 3) بروتين في كل فرصة أكل 4) تجنب المقلي (سمبوسة، أي حاجة مقلية!) 5) متاكلش كتير على الإفطار — وجبات صغيرة أفضل!' },
    priority: 9,
    domain: 'nutrition',
  },

  // ── v27: Motivation & Goal Setting ────────────────────────────
  {
    keywords: ['motivation', 'no motivation', 'lost motivation', 'goal setting', 'how to set fitness goals', 'keep motivated', 'stay motivated'],
    keywordsAr: ['تحفيز', 'مفيش تحفيز', 'خسرت التحفيز', 'تحديد أهداف', 'ازاي احدد أهداف', 'فقدت الحماس'],
    keywordsFranco: ['ta7feez', 'mafesh ta7feez', '5asart el ta7feez', 'ta7deed ahdaf', 'ezay a7aded ahdaf', 'fa2adt el 7amas'],
    stateId: 'QA_MENU',
    response: { en: 'Motivation & goals: TRUTH: Motivation is temporary — build SYSTEMS instead. SMART goals: Specific (squat 100kg, not "get strong"), Measurable, Achievable, Relevant, Time-bound. Short-term (4 weeks) + Long-term (6-12 months). TIPS: 1) Track everything (app, photos, measurements) 2) Find a training partner 3) Join a community 4) Set process goals (3x gym/week) not just outcome goals (lose 10kg) 5) Review and adjust monthly 6) Remember: bad workout > no workout. Discipline beats motivation every time!', ar: 'التحفيز والأهداف: الحقيقة: التحفيز مؤقت — ابني أنظمة بدله. أهداف ذكية: محدد (سكوات 100كج، مش "اقوى")، قابل للقياس، قابل للتحقيق، مرتبط، محدد بوقت. قصير المدى (4 أسابيع) + طويل المدى (6-12 شهر). نصايح: 1) سجل كل حاجة (أبلكيشن، صور، قياسات) 2) لاقي شريك تمرين 3) انضم لمجتمع 4) حط أهداف عملية (3 مرات جيم/أسبوع) مش نتيجة بس (خس 10كج) 5) راجع وعدل شهرياً 6) تذكر: تمرين وحش > مفيش تمرين. الانضباط بيغلب التحفيز كل مرة!' },
    priority: 8,
    domain: 'root',
  },

  // ── v27: Beginner's Complete Guide ────────────────────────────
  {
    keywords: ['beginner guide', 'new to gym', 'first time gym', 'gym beginner', 'just started gym', 'starting gym', 'gym newbie', 'where to start'],
    keywordsAr: ['دليل مبتدئ', 'جديد في الجيم', 'أول مرة جيم', 'مبتدئ جيم', 'لسه بادئ', 'ابدأ منين'],
    keywordsFranco: ['daleel mobtade2', 'gedeed fel gym', 'awal marra gym', 'mobtade2 gym', 'lessa bade2', 'abda2 mneen'],
    stateId: 'WK_MENU',
    response: { en: 'Complete beginner guide: WEEK 1-4: Full body 3x/week (Mon/Wed/Fri). Each session: Squat 3x10, Bench 3x10, Row 3x10, OHP 3x10, Deadlift 3x8. Start with just the bar or light dumbbells. Add 2.5kg per week. NUTRITION: Eat protein with every meal, drink 2-3L water. RULES: 1) Form > weight (always!) 2) Rest 2-3min between sets 3) Sleep 7-8hrs 4) Don\'t skip legs 5) Ask gym staff for help 6) Don\'t compare yourself to others. Results take 8-12 weeks — trust the process!', ar: 'دليل المبتدئ الكامل: أسبوع 1-4: فول بادي 3 مرات/أسبوع (اتنين/أربع/جمعة). كل جلسة: سكوات 3×10، بنش 3×10، رو 3×10، OHP 3×10، ديدلفت 3×8. ابدأ بالبار بس أو دمبلز خفيفة. زود 2.5كج كل أسبوع. التغذية: كل بروتين مع كل وجبة، اشرب 2-3 لتر مية. قواعد: 1) الفورم > الوزن (دايماً!) 2) راحة 2-3 دقايق بين السيتات 3) نام 7-8 ساعات 4) متعديش الرجل 5) اسأل موظفين الجيم لو محتاج 6) متقارنش نفسك بحد. النتايج بتاخد 8-12 أسبوع — ثق في العملية!' },
    priority: 9,
    domain: 'workout',
  },

  // ── v27: Home Workout Without Equipment ───────────────────────
  {
    keywords: ['home workout', 'no equipment workout', 'bodyweight workout home', 'workout at home', 'no gym', 'cant go gym', 'home exercise'],
    keywordsAr: ['تمرين بيت', 'تمرين بدون أجهزة', 'تمرين في البيت', 'مش قادر اروح الجيم', 'تمرين بدون معدات'],
    keywordsFranco: ['tamreen beit', 'tamreen bdoon agheza', 'tamreen fel beit', 'msh 2ader aroo7 el gym', 'tamreen bdoon mo3edat'],
    stateId: 'WK_MENU',
    response: { en: 'No-equipment home workout: PUSH: push-ups (wide, diamond, pike, decline). PULL: towel rows (under table), resistance bands. LEGS: squats, lunges, Bulgarian splits, pistol squat progressions. CORE: plank, mountain climbers, leg raises, bicycle crunches. CARDIO: burpees, jumping jacks, high knees, mountain climbers. SAMPLE: 4 rounds of: 15 push-ups, 20 squats, 10 lunges each, 30sec plank, 15 burpees. Rest 60sec between rounds. Do 3-4x/week. Add a backpack with books for resistance!', ar: 'تمرين بيت بدون أجهزة: دفع: ضغط (واسع، دايموند، بايك، ديكلاين). سحب: رو بمنشفة (تحت ترابيزة)، باند مقاومة. رجل: سكوات، لانجز، بلغاري سبليت، بيستول سكوات. كور: بلانك، ماونتن كلايمرز، رفع رجل، بايسكل كرانش. كارديو: بيربي، جامبنج جاك، هاي نيز، ماونتن كلايمرز. نموذج: 4 جولات من: 15 ضغط، 20 سكوات، 10 لانجز لكل رجل، 30ث بلانك، 15 بيربي. راحة 60ث بين الجولات. 3-4 مرات/أسبوع. ضيف شنطة ظهر بكتب للمقاومة!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v27: Skinny Fat Solution ──────────────────────────────────
  {
    keywords: ['skinny fat', 'thin but fat', 'no muscle but fat', 'soft body', 'flabby', 'not muscular but not lean'],
    keywordsAr: ['نحيف بس فيه دهون', 'سكيني فات', 'جسم طري', 'مفيش عضل بس فيه كرش'],
    keywordsFranco: ['skinny fat', 'ne7eef bas feeh dohon', 'gesm tary', 'mafesh 3adal bas feeh karsh'],
    stateId: 'QA_MENU',
    response: { en: 'Skinny fat solution: Your #1 priority = BUILD MUSCLE (not lose fat first). Why? More muscle = higher metabolism = easier fat loss later. PLAN: 1) Eat at slight surplus (+200-300 cal) 2) HIGH protein (2g/kg bodyweight) 3) Lift weights 4x/week (focus on compounds) 4) Minimal cardio (2x/week, 20min) 5) Progressive overload every week. DON\'T: crash diet (you\'ll look worse), do only cardio (you\'ll stay skinny fat), or try to "tone" (not a real thing). Timeline: 3-6 months of building, then mini-cut if needed.', ar: 'حل السكيني فات: أولويتك رقم 1 = بناء عضل (مش خسارة دهون الأول). ليه؟ عضل أكتر = حرق أعلى = خسارة دهون أسهل بعدين. الخطة: 1) كل بفائض خفيف (+200-300 سعرة) 2) بروتين عالي (2ج/كج) 3) حديد 4 مرات/أسبوع (ركز على المركبات) 4) كارديو قليل (مرتين/أسبوع، 20 دقيقة) 5) حمل تصاعدي كل أسبوع. متعملش: دايت قاسي (هتبان أوحش)، كارديو بس (هتفضل سكيني فات)، أو "تونينج" (مش حاجة حقيقية). المدة: 3-6 شهور بناء، بعدين ميني كت لو محتاج.' },
    priority: 8,
    domain: 'root',
  },

  // ── v28: Ab Training Deep Dive ─────────────────────────────
  {
    keywords: ['ab workout', 'abs exercises', 'how to get abs', 'six pack workout', 'visible abs', 'lower abs', 'core workout'],
    keywordsAr: ['تمرين بطن', 'تمارين بطن', 'ازاي ابان سكس باك', 'تمرين سكس باك', 'بطن سفلي', 'تمرين كور'],
    keywordsFranco: ['tamreen batn', 'tamareen batn', 'ezay aban six pack', 'tamreen six pack', 'batn sofli', 'tamreen core'],
    stateId: 'WK_MENU',
    response: { en: 'Abs deep dive: TRUTH: Abs are made in the kitchen! You need ~12-15% body fat (men) or ~18-22% (women) for visible abs. EXERCISES: Upper abs: crunches, cable crunches. Lower abs: hanging leg raises, reverse crunches. Obliques: Russian twists, side planks, woodchops. PROGRAM: 3-4 ab exercises, 3x15-20, 3x/week. KEY: 1) You CANNOT spot reduce belly fat 2) Heavy compounds (squats, deadlifts) train core too 3) Diet is 80% of getting abs visible 4) Weighted ab work builds thicker abs 5) Plank variations > 100 crunches!', ar: 'تمرين بطن متعمق: الحقيقة: البطن بتتعمل في المطبخ! محتاج ~12-15% دهون (رجال) أو ~18-22% (ستات) لبطن واضح. التمارين: بطن علوي: كرانش، كابل كرانش. بطن سفلي: رفع رجل معلق، ريفرس كرانش. أوبليكس: روشن تويست، سايد بلانك، وودتشوب. البرنامج: 3-4 تمارين، 3×15-20، 3 مرات/أسبوع. المفتاح: 1) مش هتخسر دهون من البطن بس 2) التمارين المركبة (سكوات، ديدلفت) بتمرن الكور برضو 3) الأكل 80% من إظهار البطن 4) بطن بوزن بيبني عضلات أسمك 5) بلانك > 100 كرانش!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v28: Meal Frequency & Timing ──────────────────────────────
  {
    keywords: ['how many meals', 'meal frequency', 'how often eat', 'eating schedule', 'meal timing', 'eat every 3 hours', 'number of meals'],
    keywordsAr: ['كام وجبة', 'عدد الوجبات', 'كل كام ساعة', 'جدول الأكل', 'توقيت الوجبات'],
    keywordsFranco: ['kam wagba', '3adad el wagabat', 'kol kam sa3a', 'gadwal el akl', 'taw2eet el wagabat'],
    stateId: 'NT_MENU',
    response: { en: 'Meal frequency myths vs facts: MYTH: "You must eat every 3 hours." FACT: Total daily intake matters more than frequency. BUT: For muscle building, 4-5 meals works better (30-50g protein each). For fat loss: whatever you can sustain (3-6 meals). Intermittent fasting: fine for fat loss, not ideal for max muscle growth. PRACTICAL: Most people do well with 3 meals + 1-2 snacks. Pre and post workout meals matter most. Don\'t overthink it — consistency beats perfection!', ar: 'خرافات وحقائق تكرار الوجبات: خرافة: "لازم تاكل كل 3 ساعات." حقيقة: الإجمالي اليومي أهم من التكرار. بس: لبناء العضل، 4-5 وجبات أفضل (30-50ج بروتين لكل). لخسارة الدهون: أي حاجة تقدر تلتزم بيها (3-6 وجبات). صيام متقطع: كويس لخسارة الدهون، مش مثالي لأقصى نمو عضلي. عملياً: أغلب الناس بيمشوا كويس ب3 وجبات + 1-2 سناك. وجبات قبل وبعد التمرين الأهم. متفكرش كتير — الالتزام بيغلب الكمال!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v28: Progressive Overload Explained ───────────────────────
  {
    keywords: ['progressive overload', 'how to progressive overload', 'add weight', 'get stronger', 'increase weight', 'overload principle'],
    keywordsAr: ['حمل تصاعدي', 'ازاي ازود الحمل', 'زود وزن', 'ازاي اقوى', 'زيادة الوزن في التمرين'],
    keywordsFranco: ['7aml tasa3ody', 'ezay azawed el 7aml', 'zawed wazn', 'ezay a2wa', 'zyada el wazn fel tamreen'],
    stateId: 'WK_MENU',
    response: { en: 'Progressive overload (the #1 muscle building principle): WAYS to overload: 1) More weight (primary) — add 2.5kg when you hit all reps 2) More reps — 8→10→12 then increase weight, drop back to 8 3) More sets — add 1 set per exercise per week 4) Better form — slower negatives, fuller ROM 5) Less rest (for endurance) 6) More frequency. TRACK EVERYTHING: Log weights, reps, sets. If you\'re not progressing, you\'re not growing. Double progression method: 3x8-12 → when you hit 3x12, add weight, go back to 3x8.', ar: 'الحمل التصاعدي (مبدأ رقم 1 لبناء العضل): طرق الحمل: 1) وزن أكتر (الأساسي) — زود 2.5كج لما تعمل كل التكرارات 2) تكرارات أكتر — 8→10→12 بعدين زود الوزن، ارجع ل8 3) سيتات أكتر — ضيف سيت لكل تمرين/أسبوع 4) فورم أفضل — سلبي أبطأ، نطاق أكمل 5) راحة أقل (للتحمل) 6) تكرار أكتر. سجل كل حاجة: أوزان، تكرارات، سيتات. لو مش بتتقدم، مش هتكبر. طريقة التدرج المزدوج: 3×8-12 → لما توصل 3×12، زود الوزن، ارجع ل3×8.' },
    priority: 9,
    domain: 'workout',
  },

  // ── v28: Creatine Deep Dive ───────────────────────────────────
  {
    keywords: ['creatine guide', 'creatine loading', 'creatine monohydrate', 'creatine safe', 'creatine side effects', 'best creatine', 'how to take creatine'],
    keywordsAr: ['دليل كرياتين', 'تحميل كرياتين', 'كرياتين مونوهيدرات', 'كرياتين آمن', 'أضرار كرياتين', 'أفضل كرياتين'],
    keywordsFranco: ['daleel creatine', 'ta7meel creatine', 'creatine monohydrate', 'creatine amen', 'adrar creatine', 'afdal creatine'],
    stateId: 'SP_MENU',
    response: { en: 'Creatine complete guide: WHAT: Most researched supplement ever. DOSE: 5g/day, every day (training + rest days). Loading phase: optional (20g/day for 5 days). TYPE: Creatine monohydrate = best & cheapest. No need for HCL, buffered, etc. TIMING: Any time (before/after workout or with a meal). SAFETY: 100+ studies confirm safe for healthy adults. Water retention: 1-3kg initially (in muscles, not fat). MYTH: "Damages kidneys" — ZERO evidence in healthy people. PRICE in Egypt: ~200-400 LE for 60 servings. It works for EVERYONE!', ar: 'دليل الكرياتين الكامل: إيه: أكتر مكمل مدروس في التاريخ. الجرعة: 5ج/يوم، كل يوم (تمرين + راحة). فترة تحميل: اختيارية (20ج/يوم ل5 أيام). النوع: كرياتين مونوهيدرات = الأفضل والأرخص. مش محتاج HCL أو بافرد. التوقيت: أي وقت (قبل/بعد التمرين أو مع وجبة). الأمان: 100+ دراسة أكدت آمن للأصحاء. احتباس مية: 1-3كج في الأول (في العضلات، مش دهون). خرافة: "بيضر الكلى" — صفر دليل في الأصحاء. السعر في مصر: ~200-400 جنيه ل60 جرعة. بيشتغل مع كل الناس!' },
    priority: 8,
    domain: 'supplements',
  },

  // ── v28: Gym Anxiety ──────────────────────────────────────────
  {
    keywords: ['gym anxiety', 'scared of gym', 'gym intimidating', 'nervous gym', 'embarrassed gym', 'people watching gym', 'gym confidence'],
    keywordsAr: ['قلق الجيم', 'خايف من الجيم', 'الجيم مخيف', 'متوتر من الجيم', 'كسوف في الجيم', 'الناس بتتفرج عليا'],
    keywordsFranco: ['2ala2 el gym', '5ayef men el gym', 'el gym mo5eef', 'metwatar men el gym', 'kasoof fel gym', 'el nas betetfarag 3alaya'],
    stateId: 'QA_MENU',
    response: { en: 'Gym anxiety tips: 1) TRUTH: Nobody is watching you — everyone is focused on themselves 2) Go during off-peak hours (early AM, late PM) 3) Have a written plan (no wandering) 4) Wear headphones (barrier signal) 5) Start with machines (easier, no setup) 6) Watch YouTube tutorials before trying new exercises 7) Everyone was a beginner once — even the biggest guys 8) Gym regulars are usually the NICEST people 9) In Egyptian gyms: people are generally friendly and will help if asked 10) First 2 weeks are hardest — after that it becomes your comfort zone!', ar: 'نصايح لقلق الجيم: 1) الحقيقة: محدش بيتفرج عليك — كلهم مشغولين بنفسهم 2) روح في أوقات هادية (الصبح بدري، بالليل متأخر) 3) خد خطة مكتوبة (متلفش) 4) البس سماعات (إشارة حاجز) 5) ابدأ بالأجهزة (أسهل، مفيش سيتاب) 6) اتفرج على يوتيوب قبل ما تجرب تمارين جديدة 7) كلهم كانوا مبتدئين — حتى أكبر واحد 8) ناس الجيم الثابتين عادة ألطف الناس 9) في جيمات مصر: الناس ودودة وهتساعد لو سألت 10) أول أسبوعين الأصعب — بعديها بيبقى منطقة راحتك!' },
    priority: 8,
    domain: 'root',
  },

  // ── v28: Egyptian Gym Pricing Guide ───────────────────────────
  {
    keywords: ['gym price egypt', 'gym membership cost', 'how much gym egypt', 'cheap gym egypt', 'gym fees', 'gym subscription price'],
    keywordsAr: ['سعر الجيم مصر', 'اشتراك الجيم كام', 'جيم رخيص', 'مصاريف الجيم', 'سعر اشتراك جيم'],
    keywordsFranco: ['se3r el gym masr', 'eshtrak el gym kam', 'gym re5ees', 'masareef el gym', 'se3r eshtrak gym'],
    stateId: 'QA_MENU',
    response: { en: 'Egyptian gym pricing (2024): BUDGET (300-600 LE/mo): Neighborhood gyms, basic equipment, usually crowded. MID-RANGE (800-1500 LE/mo): Better equipment, AC, classes (Gold\'s, PowerHouse). PREMIUM (2000-5000 LE/mo): Full amenities, pool, spa, classes (Oxygen, Golds VIP). HOME: Basic setup ~3000-5000 LE (adjustable dumbbells + bench). Best value: mid-range gym with good equipment + a buddy. Ask about student discounts, annual plans (usually 20-30% off), and family memberships!', ar: 'أسعار الجيم في مصر (2024): اقتصادي (300-600 جنيه/شهر): جيمات الحي، معدات أساسية، عادة مزدحمة. متوسط (800-1500 جنيه/شهر): معدات أفضل، تكييف، كلاسات (جولدز، باورهاوس). بريميوم (2000-5000 جنيه/شهر): كل المميزات، حمام سباحة، سبا، كلاسات (أوكسجن، جولدز VIP). بيت: سيتاب أساسي ~3000-5000 جنيه (دمبلز قابلة للتعديل + بنش). أفضل قيمة: جيم متوسط بمعدات كويسة + صاحب. اسأل عن خصومات طلاب، خطط سنوية (عادة 20-30% أقل)، واشتراكات عائلية!' },
    priority: 7,
    domain: 'root',
  },

  // ── v28: Sleep & Recovery Deep Dive ────────────────────────────
  {
    keywords: ['sleep for muscle', 'how much sleep gym', 'sleep and recovery', 'sleep quality', 'better sleep', 'insomnia workout', 'nap for recovery'],
    keywordsAr: ['نوم للعضل', 'كام ساعة نوم', 'نوم وريكفري', 'جودة النوم', 'نوم أفضل', 'أرق', 'قيلولة'],
    keywordsFranco: ['nom lel 3adal', 'kam sa3a nom', 'nom w recovery', 'gawdet el nom', 'nom afdal', 'ara2', '2ayloola'],
    stateId: 'HP_MENU',
    response: { en: 'Sleep & muscle growth: 7-9 hours is ESSENTIAL (growth hormone peaks during deep sleep). TIPS for better sleep: 1) Same bedtime daily (±30min) 2) No screens 1hr before bed 3) Cool room (18-20°C) 4) No caffeine after 2pm 5) Magnesium before bed (300-400mg) 6) Dark room (blackout curtains) 7) No heavy meals 2hrs before bed. NAPS: 20min power nap = amazing for recovery (don\'t exceed 30min or you\'ll feel groggy). Poor sleep = 60% less testosterone, worse recovery, more injuries. PRIORITIZE SLEEP!', ar: 'النوم ونمو العضل: 7-9 ساعات ضروري (هرمون النمو بيبلغ الذروة في النوم العميق). نصايح لنوم أفضل: 1) نفس معاد النوم يومياً (±30 دقيقة) 2) مفيش شاشات ساعة قبل النوم 3) أوضة باردة (18-20°C) 4) بلاش كافيين بعد 2 الضهر 5) ماغنسيوم قبل النوم (300-400مج) 6) أوضة مظلمة (ستاير عاتمة) 7) مفيش أكل تقيل ساعتين قبل النوم. قيلولة: 20 دقيقة = ممتازة للريكفري (متعديش 30 دقيقة). نوم سيئ = 60% أقل تستوستيرون، ريكفري أسوأ، إصابات أكتر. الأولوية للنوم!' },
    priority: 8,
    domain: 'health',
  },

  // ── v28: Protein Sources Ranked ───────────────────────────────
  {
    keywords: ['best protein source', 'protein sources ranked', 'cheapest protein', 'protein foods list', 'high protein foods', 'protein per pound'],
    keywordsAr: ['أفضل مصدر بروتين', 'مصادر بروتين مرتبة', 'أرخص بروتين', 'أكل عالي البروتين', 'قائمة أكل بروتين'],
    keywordsFranco: ['afdal masdar protein', 'masader protein morattaba', 'ar5as protein', 'akl 3aly el protein', '2a2met akl protein'],
    stateId: 'NT_MENU',
    response: { en: 'Protein sources ranked by quality: TIER 1 (complete, high bioavailability): Eggs (whole), whey protein, chicken breast, fish (salmon, tuna), beef. TIER 2: Greek yogurt, cottage cheese, turkey, shrimp, milk. TIER 3: Lentils + rice (combined = complete), chickpeas, tofu, tempeh. CHEAPEST in Egypt: Eggs (~90LE/30), chicken (frozen ~150LE/kg), tuna cans (~25LE), ful medames (~5LE/plate), lentils (~30LE/kg), milk (~30LE/L). Budget target: aim for eggs + chicken + ful as protein staples!', ar: 'مصادر البروتين مرتبة بالجودة: فئة 1 (كامل، امتصاص عالي): بيض (كامل)، واي بروتين، صدر فراخ، سمك (سلمون، تونة)، لحم بقري. فئة 2: زبادي يوناني، جبنة قريش، ديك رومي، جمبري، لبن. فئة 3: عدس + رز (مع بعض = كامل)، حمص، توفو، تمبيه. الأرخص في مصر: بيض (~90 جنيه/30)، فراخ (فروزن ~150 جنيه/كج)، تونة (~25 جنيه/علبة)، فول (~5 جنيه/طبق)، عدس (~30 جنيه/كج)، لبن (~30 جنيه/لتر). هدف اقتصادي: ركز على بيض + فراخ + فول كأساس بروتين!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v29: Counting Calories Without a Scale ─────────────────
  {
    keywords: ['count calories without scale', 'estimate calories', 'eyeball portions', 'hand portion guide', 'calorie counting easy', 'track without measuring'],
    keywordsAr: ['حساب سعرات بدون ميزان', 'تقدير السعرات', 'حصص بالعين', 'دليل حصص اليد', 'عد سعرات سهل'],
    keywordsFranco: ['7esab so3rat bdoon mizan', 'ta2deer el so3rat', '7esas bel 3ein', 'daleel 7esas el eid'],
    stateId: 'NT_MENU',
    response: { en: 'Calorie counting without a scale (hand method): PROTEIN: Palm of hand = ~25-30g protein (chicken, fish, meat). CARBS: Cupped hand = ~1 serving carbs (~30g). VEGGIES: Fist = ~1 cup veggies. FATS: Thumb = ~1 tbsp fat (~14g). QUICK MEAL: 1 palm protein + 1 cupped hand carbs + 1 fist veggies + 1 thumb fat ≈ 400-500 cal. For men: double protein and carbs. Use MyFitnessPal app for exact tracking. The hand method is 80% accurate — good enough for most people!', ar: 'عد السعرات بدون ميزان (طريقة اليد): بروتين: كف اليد = ~25-30ج بروتين (فراخ، سمك، لحمة). كارب: اليد مقعرة = ~حصة كارب (~30ج). خضار: القبضة = ~كوب خضار. دهون: الإبهام = ~ملعقة دهون (~14ج). وجبة سريعة: كف بروتين + كف مقعر كارب + قبضة خضار + إبهام دهون ≈ 400-500 سعرة. للرجال: ضعف البروتين والكارب. استخدم ماي فيتنس بال للتتبع الدقيق. طريقة اليد دقة 80% — كفاية لأغلب الناس!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v29: Eating Disorders Awareness ───────────────────────────
  {
    keywords: ['eating disorder', 'anorexia', 'bulimia', 'binge eating', 'orthorexia', 'unhealthy relationship food', 'obsessed with food'],
    keywordsAr: ['اضطراب أكل', 'أنوركسيا', 'بوليميا', 'شراهة أكل', 'هوس بالأكل', 'علاقة غير صحية بالأكل'],
    keywordsFranco: ['edterab akl', 'anorexia', 'bulimia', 'sharaha akl', 'hawas bel akl', '3ala2a gher se7eya bel akl'],
    stateId: 'HP_MENU',
    response: { en: 'Eating disorders — important awareness: WARNING SIGNS: obsessive calorie counting, fear of certain foods, binge-restrict cycles, excessive exercise to "earn" food, feeling guilty after eating. IF THIS IS YOU: 1) You are NOT alone 2) This is a medical condition, not weakness 3) Talk to a mental health professional 4) Fitness should ADD to your life, not control it. In Egypt: seek help from a therapist (online therapy is available). The fitness industry can be toxic — abs are not worth your mental health. Recovery is possible!', ar: 'اضطرابات الأكل — توعية مهمة: علامات تحذير: هوس بعد السعرات، خوف من أكل معين، دورات إفراط-حرمان، تمرين مفرط "لتعويض" الأكل، ذنب بعد الأكل. لو ده انت: 1) مش لوحدك 2) ده حالة طبية مش ضعف 3) اتكلم مع متخصص صحة نفسية 4) الفيتنس لازم يضيف لحياتك مش يتحكم فيها. في مصر: اطلب مساعدة من معالج نفسي (علاج أونلاين متاح). صناعة الفيتنس ممكن تكون سامة — البطن مش تستاهل صحتك النفسية. التعافي ممكن!' },
    priority: 10,
    domain: 'health',
  },

  // ── v29: Resistance Bands Guide ───────────────────────────────
  {
    keywords: ['resistance band', 'band exercises', 'band workout', 'elastic band', 'tube band', 'band vs weights', 'resistance band routine'],
    keywordsAr: ['باند مقاومة', 'تمارين باند', 'تمرين باند', 'باند مطاط', 'باند ولا أوزان'],
    keywordsFranco: ['band mo2awama', 'tamareen band', 'tamreen band', 'band matat', 'band wala awzan'],
    stateId: 'WK_MENU',
    response: { en: 'Resistance bands guide: TYPES: Loop bands (for legs/glutes), tube bands (with handles, like cable machine), mini bands (warm-up/activation). EXERCISES: Banded squats, hip thrusts, lateral walks, pull-aparts, face pulls, bicep curls, tricep extensions, banded push-ups. ADVANTAGES: Cheap (~100-300 LE set), portable, progressive resistance (hardest at peak contraction). PROGRAM: Can do a full workout: 4 exercises, 3x15-20. Best USE: warm-up activation (especially glutes), travel workouts, rehab, and adding resistance to bodyweight moves!', ar: 'دليل باند المقاومة: أنواع: لوب باندز (للرجل/أرداف)، تيوب باندز (بمقابض، زي الكابل)، ميني باندز (إحماء/تفعيل). تمارين: سكوات بباند، هيب ثرست، لاترال ووك، بول اباتر، فيس بولز، بايسبس كيرل، ترايسبس اكستنشن، ضغط بباند. مميزات: رخيصة (~100-300 جنيه الطقم)، متنقلة، مقاومة تصاعدية (أصعب في الذروة). برنامج: تمرين كامل: 4 تمارين، 3×15-20. أفضل استخدام: تفعيل إحماء (خصوصاً أرداف)، تمرين سفر، تأهيل، وإضافة مقاومة لتمارين الجسم!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v29: Workout Duration ─────────────────────────────────────
  {
    keywords: ['how long workout', 'workout duration', 'how long should i train', 'optimal training time', 'how many hours gym', 'workout length'],
    keywordsAr: ['مدة التمرين', 'كام ساعة تمرين', 'كام ساعة في الجيم', 'وقت التمرين الأمثل', 'طول التمرين'],
    keywordsFranco: ['modet el tamreen', 'kam sa3a tamreen', 'kam sa3a fel gym', 'wa2t el tamreen el amsal', 'tool el tamreen'],
    stateId: 'QA_MENU',
    response: { en: 'Optimal workout duration: 45-75 minutes is the sweet spot. WHY: After 60-90min, cortisol rises (stress hormone, catabolic). BREAKDOWN: 10min warm-up + 45-60min lifting + 5-10min cool-down. If you\'re in the gym 2+ hours, you\'re either resting too long, talking too much, or doing too much volume. QUALITY > QUANTITY. Rest times: compounds 2-3min, isolation 1-2min. Cardio: separate from weights or after (never before heavy lifting). If short on time: 30min of focused training beats 90min of distracted training!', ar: 'مدة التمرين المثالية: 45-75 دقيقة هي الأفضل. ليه: بعد 60-90 دقيقة، الكورتيزول بيرتفع (هرمون توتر، هدام). التوزيع: 10 دقايق إحماء + 45-60 دقيقة حديد + 5-10 دقايق تبريد. لو في الجيم ساعتين+، يا بتريح كتير، يا بتتكلم كتير، يا حجم زيادة. الجودة > الكمية. أوقات الراحة: مركبات 2-3 دقايق، عزل 1-2 دقيقة. كارديو: منفصل عن الحديد أو بعده (أبداً قبل الحديد الثقيل). لو الوقت ضيق: 30 دقيقة مركزة أفضل من 90 دقيقة مشتتة!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v29: Egyptian Bodybuilding Legends ─────────────────────────
  {
    keywords: ['big ramy workout', 'egyptian bodybuilder', 'mamdouh elssbiay', 'bodybuilding egypt', 'mr olympia egypt', 'famous bodybuilder egypt'],
    keywordsAr: ['تمرين بيج رامي', 'لاعب كمال أجسام مصري', 'ممدوح السبيعي', 'كمال أجسام مصر', 'مستر أولمبيا مصر'],
    keywordsFranco: ['tamreen big ramy', 'la3eb kamal agsam masry', 'mamdou7 el sebie3y', 'kamal agsam masr', 'mr olympia masr'],
    stateId: 'QA_MENU',
    response: { en: 'Egyptian bodybuilding: Big Ramy (Mamdouh Elssbiay) — 2x Mr. Olympia (2020, 2021)! From a small town in Egypt to the biggest stage. His training: High volume, 5-6 days/week, focus on heavy compounds + isolation. Diet: 6000+ calories, 400g+ protein daily. Egypt has a STRONG bodybuilding culture — many local and regional champions. Other Egyptian pros: Alaa Makka, Mohamed Shaaban. The sport is growing in Egypt with more gyms, competitions, and awareness. Be inspired but remember: pros use methods not suitable for natural athletes!', ar: 'كمال الأجسام المصري: بيج رامي (ممدوح السبيعي) — مستر أولمبيا مرتين (2020، 2021)! من بلد صغيرة في مصر لأكبر مسرح. تمرينه: حجم عالي، 5-6 أيام/أسبوع، تركيز على المركبات الثقيلة + العزل. الأكل: 6000+ سعرة، 400+ جرام بروتين يومياً. مصر عندها ثقافة كمال أجسام قوية — بطولات محلية وإقليمية كتير. مصريين محترفين تانيين: علاء مكة، محمد شعبان. الرياضة بتكبر في مصر مع جيمات ومسابقات وتوعية أكتر. اتحمس بس افتكر: المحترفين بيستخدموا طرق مش مناسبة للناتشورال!' },
    priority: 7,
    domain: 'root',
  },

  // ── v29: Posture Correction Complete ───────────────────────────
  {
    keywords: ['fix posture', 'bad posture', 'rounded shoulders', 'forward head', 'anterior pelvic tilt', 'kyphosis', 'desk posture', 'hunchback'],
    keywordsAr: ['تصليح القوام', 'قوام سيئ', 'أكتاف مقوسة', 'رقبة للأمام', 'ميلان الحوض', 'تحدب', 'قوام المكتب'],
    keywordsFranco: ['taslee7 el 2awam', '2awam say2', 'aktaf me2awasa', 'ra2ba lelodam', 'mayalan el 7od', 'ta7adob', '2awam el maktab'],
    stateId: 'HP_MENU',
    response: { en: 'Posture correction guide: ROUNDED SHOULDERS: Strengthen: face pulls, band pull-aparts, rear delt flyes. Stretch: doorway stretch, pec stretch. FORWARD HEAD: Chin tucks (10x30sec daily), neck stretches. ANTERIOR PELVIC TILT: Strengthen: glute bridges, dead bugs, RKC planks. Stretch: hip flexors (couch stretch). DAILY HABITS: 1) Screen at eye level 2) Stand every 30min 3) Shoulders back cue 4) Strengthen your back MORE than chest 5) Sleep on your back. Fix takes 4-8 weeks of daily work. Most gym bros have bad posture from too much bench, not enough rows!', ar: 'دليل تصليح القوام: أكتاف مقوسة: قوي: فيس بولز، باند بول اباتر، رير ديلت فلاي. استرتش: ستريتش الباب، بيك ستريتش. رقبة للأمام: تشن تك (10×30ث يومياً)، ستريتش الرقبة. ميلان الحوض: قوي: جلوت بريدج، ديد باجز، RKC بلانك. استرتش: هيب فليكسور (كاوتش ستريتش). عادات يومية: 1) الشاشة على مستوى العين 2) قف كل 30 دقيقة 3) ارجع كتفك 4) قوي ظهرك أكتر من صدرك 5) نام على ظهرك. التصليح بياخد 4-8 أسابيع عمل يومي. أغلب شباب الجيم قوامهم وحش من بنش كتير وسحب قليل!' },
    priority: 8,
    domain: 'health',
  },

  // ── v29: Pre-Made Meal Plans ──────────────────────────────────
  {
    keywords: ['meal plan', 'give me meal plan', 'diet plan', 'what to eat daily', 'sample meal plan', 'easy meal plan', 'weekly meal plan'],
    keywordsAr: ['خطة أكل', 'اديني خطة أكل', 'خطة دايت', 'اكل ايه كل يوم', 'نموذج خطة أكل', 'خطة أسبوعية'],
    keywordsFranco: ['5ettet akl', 'edeny 5ettet akl', '5ettet diet', 'akol eih kol yom', 'namozag 5ettet akl'],
    stateId: 'NT_MENU',
    response: { en: 'Sample 2000 cal meal plan (cutting): BREAKFAST: 3 eggs + 2 toast + veggies (450 cal, 30g P). SNACK: Greek yogurt + handful almonds (250 cal, 20g P). LUNCH: Grilled chicken 200g + rice 1 cup + salad (550 cal, 45g P). SNACK: Protein shake + banana (300 cal, 30g P). DINNER: Fish 200g + sweet potato + veggies (450 cal, 35g P). TOTAL: ~2000 cal, ~160g protein. Egyptian version: Swap breakfast for ful + eggs, lunch for grilled chicken + rice + salad, dinner for fish + sweet potato. Adjust portions for your calorie target!', ar: 'نموذج خطة 2000 سعرة (تنشيف): فطار: 3 بيض + 2 توست + خضار (450 سعرة، 30ج بروتين). سناك: زبادي يوناني + حفنة لوز (250 سعرة، 20ج). غدا: فراخ مشوية 200ج + رز كوب + سلطة (550 سعرة، 45ج). سناك: بروتين شيك + موزة (300 سعرة، 30ج). عشا: سمك 200ج + بطاطا + خضار (450 سعرة، 35ج). الإجمالي: ~2000 سعرة، ~160ج بروتين. النسخة المصرية: بدل الفطار فول + بيض، الغدا فراخ مشوية + رز + سلطة، العشا سمك + بطاطا. عدل الحصص حسب هدفك!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v30: Glute Training Deep Dive ──────────────────────────
  {
    keywords: ['glute workout', 'how to grow glutes', 'butt workout', 'hip thrust', 'glute exercises', 'flat butt', 'bigger glutes', 'glute activation'],
    keywordsAr: ['تمرين أرداف', 'ازاي اكبر الأرداف', 'تمرين مؤخرة', 'هيب ثرست', 'تمارين أرداف', 'تفعيل الأرداف'],
    keywordsFranco: ['tamreen ardaf', 'ezay akabar el ardaf', 'tamreen mo2a5ra', 'hip thrust', 'tamareen ardaf', 'taf3eel el ardaf'],
    stateId: 'WK_MENU',
    response: { en: 'Glute training deep dive: TOP exercises: 1) Hip thrusts (THE best, go heavy) 2) Bulgarian split squats (deep, knee over toe) 3) Sumo deadlifts 4) Cable kickbacks 5) Lunges (walking or reverse) 6) Glute bridges (warm-up). ACTIVATION: Before leg day, do banded walks + clamshells (2x15). Volume: 15-20 sets/week. Train glutes 2-3x/week. KEY: Mind-muscle connection is CRITICAL — squeeze at top for 1sec. Most people don\'t grow glutes because they let quads take over. Go deep on squats & lunges!', ar: 'تمرين أرداف متعمق: أفضل تمارين: 1) هيب ثرست (الأفضل، ثقيل) 2) بلغاري سبليت (عميق، ركبة فوق الصوابع) 3) سومو ديدلفت 4) كابل كيكباك 5) لانجز (مشي أو عكسي) 6) جلوت بريدج (إحماء). تفعيل: قبل يوم الرجل، باند ووكس + كلامشلز (2×15). حجم: 15-20 سيت/أسبوع. مرن الأرداف 2-3 مرات/أسبوع. المفتاح: التواصل العضلي ضروري — اعصر في القمة ثانية. أغلب الناس مش بتكبر أرداف لأن الكواد بتاخد الشغل. انزل عميق في السكوات واللانجز!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v30: Trap & Neck Training ─────────────────────────────────
  {
    keywords: ['trap workout', 'how to grow traps', 'shrug exercise', 'trapezius training', 'neck training', 'bigger neck', 'yoke training'],
    keywordsAr: ['تمرين ترابس', 'ازاي اكبر الترابس', 'شراج', 'تمرين رقبة', 'رقبة أكبر'],
    keywordsFranco: ['tamreen traps', 'ezay akabar el traps', 'shrug', 'tamreen ra2ba', 'ra2ba akbar'],
    stateId: 'WK_MENU',
    response: { en: 'Traps & neck training: UPPER TRAPS: barbell shrugs (heavy, hold at top 2sec), DB shrugs, face pulls. MID TRAPS: chest-supported rows, band pull-aparts. LOWER TRAPS: Y-raises, prone I-T-Y raises. NECK: neck curls (plate on forehead), neck extensions (plate on back of head), neck harness. Train neck 2-3x/week, 3x15-20 each direction. IMPORTANT: Start neck training LIGHT — it\'s a small muscle group. Traps respond to heavy weight + high reps. Deadlifts and farmer walks hit traps hard too!', ar: 'تمرين ترابس ورقبة: ترابس علوي: شراج بار (ثقيل، امسك في القمة 2ث)، شراج دمبل، فيس بولز. ترابس وسط: رو بسند الصدر، باند بول اباتر. ترابس سفلي: واي ريز، I-T-Y ريز. رقبة: نيك كيرل (بلاط على الجبهة)، نيك اكستنشن (بلاط على الخلف)، نيك هارنس. مرن الرقبة 2-3 مرات/أسبوع، 3×15-20 كل اتجاه. مهم: ابدأ تمرين الرقبة خفيف — مجموعة عضلية صغيرة. الترابس بتستجيب للوزن الثقيل + تكرارات عالية. الديدلفت وفارمر ووك بيشغلوا الترابس برضو!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v30: Muscle Memory ────────────────────────────────────────
  {
    keywords: ['muscle memory', 'lost gains', 'regain muscle', 'coming back to gym', 'returning to training', 'took a break'],
    keywordsAr: ['ذاكرة العضلات', 'خسرت المكاسب', 'استرجاع العضل', 'راجع للجيم', 'راجع للتمرين', 'أخذت بريك'],
    keywordsFranco: ['zakret el 3adalat', '5asart el makaseb', 'esterg3a el 3adal', 'rage3 lel gym', 'rage3 lel tamreen', 'a5adt break'],
    stateId: 'QA_MENU',
    response: { en: 'Muscle memory is REAL! Science: When you build muscle, your cells gain extra nuclei (myonuclei) that STAY even when muscles shrink. Coming back? You\'ll regain muscle 2-3x faster than building it the first time. PLAN: Week 1-2: 50% of previous weights, 3x/week full body. Week 3-4: 70-80%, introduce your old split. Week 5+: Back to normal. KEY: 1) Don\'t jump back to old weights (injury risk!) 2) Soreness will be intense at first — that\'s normal 3) Most gains return in 2-3 months 4) Muscle memory lasts years, possibly decades!', ar: 'ذاكرة العضلات حقيقية! العلم: لما تبني عضل، الخلايا بتكسب نوى إضافية (ميونيوكلاي) بتفضل حتى لو العضلات صغرت. راجع؟ هتسترجع العضل 2-3 أضعاف أسرع من أول مرة. الخطة: أسبوع 1-2: 50% من أوزانك القديمة، 3 مرات/أسبوع فول بادي. أسبوع 3-4: 70-80%، رجع السبليت القديم. أسبوع 5+: عادي. المفتاح: 1) متقفزش لأوزانك القديمة (خطر إصابة!) 2) الشد هيبقى قوي في الأول — طبيعي 3) أغلب المكاسب بترجع في 2-3 شهور 4) ذاكرة العضلات بتستمر سنين!' },
    priority: 8,
    domain: 'root',
  },

  // ── v30: Calorie Deficit/Surplus Calculator ───────────────────
  {
    keywords: ['calorie deficit', 'how much deficit', 'calorie surplus', 'how much surplus', 'cutting calories', 'bulking calories', 'maintenance calories'],
    keywordsAr: ['عجز سعرات', 'كام عجز', 'فائض سعرات', 'كام فائض', 'سعرات التنشيف', 'سعرات التضخيم', 'سعرات الميتننس'],
    keywordsFranco: ['3agz so3rat', 'kam 3agz', 'fa2ed so3rat', 'kam fa2ed', 'so3rat el tanshif', 'so3rat el tadkheem', 'so3rat el maintenance'],
    stateId: 'NT_MENU',
    response: { en: 'Calorie targets: CUTTING (fat loss): 500 cal deficit = ~0.5kg/week loss. Aggressive: 750-1000 deficit (fast but lose some muscle). NEVER go below BMR. BULKING (muscle gain): 200-300 surplus = lean bulk (~0.25-0.5kg/month). 500+ surplus = faster but more fat. MAINTENANCE: TDEE (your daily burn). QUICK ESTIMATE: Bodyweight (kg) × 28-33 = maintenance range. ×24-26 = cutting. ×35-38 = bulking. Track for 2 weeks, then adjust based on scale + mirror. No calculator is perfect — your body is the real data!', ar: 'أهداف السعرات: تنشيف (خسارة دهون): عجز 500 سعرة = ~0.5كج/أسبوع خسارة. عدواني: 750-1000 عجز (سريع بس هتخسر عضل). أبداً تحت BMR. تضخيم (بناء عضل): فائض 200-300 = لين بالك (~0.25-0.5كج/شهر). 500+ فائض = أسرع بس دهون أكتر. ميتننس: TDEE (حرقك اليومي). تقدير سريع: الوزن (كج) × 28-33 = ميتننس. ×24-26 = تنشيف. ×35-38 = تضخيم. تتبع لأسبوعين بعدين عدل حسب الميزان + المراية. مفيش حاسبة كاملة — جسمك هو الداتا الحقيقية!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v30: Fitness Influencer Warning ───────────────────────────
  {
    keywords: ['fitness influencer', 'fake natty', 'natural limit', 'social media fitness', 'steroids', 'anabolic', 'trt', 'ped'],
    keywordsAr: ['مؤثر فيتنس', 'فيك ناتشورال', 'حد النمو الطبيعي', 'سوشيال ميديا فيتنس', 'ستيرويد', 'منشطات'],
    keywordsFranco: ['mo2aser fitness', 'fake natural', '7ad el nomo el tabi3y', 'social media fitness', 'steroid', 'monashetat'],
    stateId: 'QA_MENU',
    response: { en: 'Social media fitness reality check: 1) Most "transformation" posts are lighting, angles, pump, and timing 2) Many influencers are NOT natural (and won\'t admit it) 3) Natural limits: ~0.5-1kg muscle/month for beginners, less with experience 4) FFMI >25 is suspicious for naturals 5) Don\'t compare 1 year of training to someone\'s 10+ years 6) Supplements won\'t give you an influencer body 7) Genetics play a huge role in shape/insertions. Focus on YOUR progress, not others. The best physique is one built naturally with patience!', ar: 'فحص واقع فيتنس السوشيال ميديا: 1) أغلب بوستات "التحول" إضاءة وزوايا وبامب وتوقيت 2) مؤثرين كتير مش ناتشورال (ومش هيعترفوا) 3) حدود ناتشورال: ~0.5-1كج عضل/شهر للمبتدئين، أقل مع الخبرة 4) FFMI فوق 25 مشبوه للناتشورال 5) متقارنش سنة تمرين بـ10+ سنين لحد تاني 6) المكملات مش هتديك جسم مؤثر 7) الجينات ليها دور كبير في الشكل. ركز على تقدمك انت مش غيرك. أحلى جسم هو اللي اتبني ناتشورال بصبر!' },
    priority: 8,
    domain: 'root',
  },

  // ── v30: Egyptian Summer Fitness ──────────────────────────────
  {
    keywords: ['summer workout', 'summer body', 'beach body', 'summer diet', 'summer cut', 'hot weather workout', 'training in heat'],
    keywordsAr: ['تمرين صيف', 'جسم صيف', 'جسم بحر', 'دايت صيف', 'تنشيف صيف', 'تمرين في الحر'],
    keywordsFranco: ['tamreen seif', 'gesm seif', 'gesm ba7r', 'diet seif', 'tanshif seif', 'tamreen fel 7ar'],
    stateId: 'QA_MENU',
    response: { en: 'Egyptian summer fitness: TIMELINE: Start cutting 12-16 weeks before summer (March for June beach). TRAINING IN HEAT: 1) Train early AM or late PM (avoid 12-4pm) 2) Extra 1-2L water daily 3) Wear breathable clothes 4) Electrolytes are crucial (salt + potassium) 5) Outdoor runs: sunrise or sunset only. SUMMER DIET: Light meals, more salads, fruit smoothies, grilled proteins. North Coast prep: Start cutting April, maintain in June/July. Don\'t crash diet — you\'ll lose muscle and look worse. Consistent 500cal deficit for 3 months = beach ready!', ar: 'لياقة الصيف المصري: التوقيت: ابدأ التنشيف 12-16 أسبوع قبل الصيف (مارس لبحر يونيو). تمرين في الحر: 1) تمرن الصبح بدري أو بالليل (تجنب 12-4 الضهر) 2) لتر-2 مية إضافي يومياً 3) البس هدوم تسمح بالتهوية 4) الأملاح مهمة (ملح + بوتاسيوم) 5) جري في الشارع: شروق أو غروب بس. أكل الصيف: وجبات خفيفة، سلطات أكتر، سموذي فواكه، بروتين مشوي. تحضير الساحل: ابدأ التنشيف أبريل، حافظ في يونيو/يوليو. متعملش كراش دايت — هتخسر عضل وهتبان أوحش. عجز 500 سعرة ثابت 3 شهور = جاهز للبحر!' },
    priority: 7,
    domain: 'root',
  },

  // ── v30: Stretching Deep Dive ─────────────────────────────────
  {
    keywords: ['stretching routine', 'full body stretch', 'how to stretch', 'stretching benefits', 'daily stretching', 'should i stretch', 'stretching for flexibility'],
    keywordsAr: ['روتين استرتش', 'استرتش كامل', 'ازاي استرتش', 'فوائد الاسترتش', 'استرتش يومي', 'لازم استرتش'],
    keywordsFranco: ['routine stretch', 'stretch kamel', 'ezay astretch', 'fawa2ed el stretch', 'stretch yawmy', 'lazem astretch'],
    stateId: 'WK_MENU',
    response: { en: 'Stretching guide: TYPES: Dynamic (before workout) = movement-based: leg swings, arm circles, hip rotations. Static (after workout) = hold 30sec: hamstring stretch, quad stretch, chest doorway stretch, shoulder stretch. DAILY ROUTINE (10min): Neck rolls → Shoulder circles → Cat-cow → Hip circles → Hamstring stretch → Quad stretch → Calf stretch → Chest stretch. BENEFITS: Better ROM, less injury risk, reduced soreness, better posture. Hold each stretch 30sec, don\'t bounce. Breathe deeply. Stretch tight areas 2x daily for results!', ar: 'دليل الاسترتش: أنواع: ديناميكي (قبل التمرين) = حركي: لفات رجل، دوائر ذراع، دوائر وسط. ثابت (بعد التمرين) = امسك 30ث: استرتش خلفية، كواد، صدر، كتف. روتين يومي (10 دقايق): دوائر رقبة → دوائر كتف → كات-كاو → دوائر وسط → استرتش خلفية → استرتش كواد → استرتش سمانة → استرتش صدر. فوائد: نطاق حركة أفضل، إصابات أقل، شد أقل، قوام أفضل. امسك كل استرتش 30ث، متنطش. اتنفس عميق. استرتش المناطق المشدودة مرتين/يوم لنتايج!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v31: Superfoods Reality Check ──────────────────────────
  {
    keywords: ['superfoods', 'best foods health', 'healthiest food', 'power foods', 'miracle food', 'superfood list'],
    keywordsAr: ['سوبرفود', 'أفضل أكل صحي', 'أصح أكل', 'أكل معجزة', 'قائمة سوبرفود'],
    keywordsFranco: ['superfood', 'afdal akl se7y', 'as7 akl', 'akl mo3giza', '2a2met superfood'],
    stateId: 'NT_MENU',
    response: { en: 'Superfoods (evidence-based): REAL powerhouses: Eggs (nature\'s multivitamin), salmon (omega-3 king), blueberries (antioxidants), spinach, sweet potato, Greek yogurt, oats, almonds, avocado, broccoli. OVERHYPED: acai (fine but not magic), goji berries (expensive, just eat any berries), spirulina (minimal real benefit), activated charcoal (useless). EGYPTIAN SUPERFOODS: Ful medames (protein + fiber), molokheya (iron), tahini (healthy fats), dates (natural energy). Truth: No single food is "super" — a balanced diet beats any superfood!', ar: 'سوبرفود (حسب الأدلة): القوة الحقيقية: بيض (ملتي فيتامين الطبيعة)، سلمون (ملك الأوميجا-3)، توت أزرق (مضادات أكسدة)، سبانخ، بطاطا، زبادي يوناني، شوفان، لوز، أفوكادو، بروكلي. مبالغ فيهم: أساي (كويس بس مش سحر)، توت جوجي (غالي، كل أي توت)، سبيرولينا (فايدة قليلة)، فحم منشط (مفيش فايدة). سوبرفود مصري: فول (بروتين + ألياف)، ملوخية (حديد)، طحينة (دهون صحية)، بلح (طاقة طبيعية). الحقيقة: مفيش أكل واحد "سوبر" — نظام متوازن بيغلب أي سوبرفود!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v31: Periodization Deep Dive ──────────────────────────────
  {
    keywords: ['periodization', 'training phases', 'mesocycle', 'macrocycle', 'microcycle', 'training block', 'program design', 'how to program'],
    keywordsAr: ['دورية التدريب', 'مراحل التدريب', 'ميزوسايكل', 'ماكروسايكل', 'تصميم برنامج'],
    keywordsFranco: ['dawreyet el tadreeb', 'mara7el el tadreeb', 'mesocycle', 'macrocycle', 'tasmeem barnameg'],
    stateId: 'WK_MENU',
    response: { en: 'Periodization (programming science): MICROCYCLE: 1 week of training. MESOCYCLE: 4-6 week block with specific goal. MACROCYCLE: 3-12 month plan. COMMON MODELS: Linear (beginner): add weight every session. Undulating (intermediate): vary reps week to week (8→12→5). Block (advanced): 4 weeks hypertrophy → 4 weeks strength → 2 weeks peaking. DELOAD: Every 4-6 weeks, cut volume 40-50%. PRACTICAL: Run each mesocycle 4-6 weeks, change rep ranges, then deload. The BEST program is the one you follow consistently for 8+ weeks!', ar: 'الدورية (علم البرمجة): ميكروسايكل: أسبوع تدريب. ميزوسايكل: بلوك 4-6 أسابيع بهدف محدد. ماكروسايكل: خطة 3-12 شهر. نماذج شائعة: خطي (مبتدئ): زود الوزن كل جلسة. متموج (متوسط): نوع التكرارات أسبوعياً (8→12→5). بلوك (متقدم): 4 أسابيع هايبرتروفي → 4 أسابيع قوة → 2 أسابيع ذروة. ديلود: كل 4-6 أسابيع، قلل الحجم 40-50%. عملياً: شغل كل ميزوسايكل 4-6 أسابيع، غير نطاق التكرارات، بعدين ديلود. أفضل برنامج هو اللي بتلتزم بيه 8+ أسابيع!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v31: Knee Health ──────────────────────────────────────────
  {
    keywords: ['knee health', 'knee pain squat', 'knee injury prevention', 'bad knees workout', 'knee strengthening', 'patella pain', 'knee clicking'],
    keywordsAr: ['صحة الركبة', 'ألم ركبة سكوات', 'منع إصابة ركبة', 'تمرين ركبة ضعيفة', 'تقوية الركبة', 'طقطقة ركبة'],
    keywordsFranco: ['se7et el rokba', 'alam rokba squat', 'man3 esabet rokba', 'tamreen rokba da3ifa', 'ta2weyet el rokba', 'ta2ta2et rokba'],
    stateId: 'HP_MENU',
    response: { en: 'Knee health guide: STRENGTHENING: 1) Terminal knee extensions (TKEs with band) — #1 exercise 2) Wall sits (3x30-60sec) 3) Step-ups (controlled) 4) Leg press (short ROM if painful) 5) VMO focus: partial squats with heels elevated. IF KNEES CLICK: Painless clicking is usually NORMAL (gas bubbles). Painful clicking = see doctor. SQUAT TIPS: Knees CAN go past toes (it\'s a myth), warm up with bodyweight squats, use squat shoes or heel elevation. AVOID: Deep jump landings, running on hard surfaces, leg extensions at full load if painful.', ar: 'دليل صحة الركبة: تقوية: 1) TKEs بباند — التمرين رقم 1 2) وول سيت (3×30-60ث) 3) ستيب اب (متحكم) 4) ليج بريس (نطاق قصير لو مؤلم) 5) تركيز VMO: سكوات جزئي بالكعب مرفوع. لو الركبة بتطقطق: الطقطقة بدون ألم عادة طبيعية (فقاعات غاز). طقطقة مؤلمة = روح دكتور. نصايح سكوات: الركبة ممكن تعدي الصوابع (خرافة)، سخن بسكوات بوزن الجسم، استخدم حذاء سكوات أو كعب مرفوع. تجنب: نط من ارتفاع، جري على أسطح صلبة، ليج اكستنشن بحمل كامل لو مؤلم.' },
    priority: 8,
    domain: 'health',
  },

  // ── v31: Shoulder Health ──────────────────────────────────────
  {
    keywords: ['shoulder health', 'shoulder impingement', 'rotator cuff exercise', 'shoulder warmup', 'shoulder pain bench', 'shoulder rehab'],
    keywordsAr: ['صحة الكتف', 'انضغاط الكتف', 'تمرين الكفة المدورة', 'إحماء الكتف', 'ألم كتف بنش', 'تأهيل كتف'],
    keywordsFranco: ['se7et el ketf', 'endeghat el ketf', 'tamreen el kofa el mdawara', 'e7ma2 el ketf', 'alam ketf bench', 'ta2heel ketf'],
    stateId: 'HP_MENU',
    response: { en: 'Shoulder health (prevent & fix): WARM-UP (every session): Band pull-aparts 2x15, external rotations 2x15, face pulls 2x15, arm circles. STRENGTHENING: External rotations (cable or band), prone Y-T-W raises, serratus wall slides. COMMON ISSUES: Impingement = pain at ~90° lifting. Fix: avoid upright rows, reduce incline pressing, add rear delt work. BENCH PRESS: Retract scapula, arch slightly, touch below nipple line, elbows at 45° (not 90°). BALANCE: For every pressing exercise, do a pulling exercise. Shoulders are the most injured joint in the gym — prevention is key!', ar: 'صحة الكتف (منع وعلاج): إحماء (كل جلسة): باند بول اباتر 2×15، اكسترنال روتيشن 2×15، فيس بولز 2×15، دوائر ذراع. تقوية: اكسترنال روتيشن (كابل أو باند)، Y-T-W ريز، سيراتس وول سلايدز. مشاكل شائعة: انضغاط = ألم عند رفع ~90°. العلاج: تجنب أبرايت رو، قلل إنكلاين بريس، ضيف ريس ديلت. بنش بريس: ارجع اللوح، قوس خفيف، لمس تحت خط الحلمة، كوع 45° (مش 90°). توازن: لكل تمرين دفع، اعمل تمرين سحب. الكتف أكتر مفصل بيتصاب في الجيم — الوقاية هي المفتاح!' },
    priority: 8,
    domain: 'health',
  },

  // ── v31: Recovery Methods Ranked ──────────────────────────────
  {
    keywords: ['best recovery method', 'recovery ranked', 'ice bath vs sauna', 'foam rolling benefits', 'massage gun', 'recovery tools', 'how to recover faster'],
    keywordsAr: ['أفضل طريقة ريكفري', 'ريكفري مرتب', 'آيس باث ولا ساونا', 'فوم رول', 'مساج جان', 'أدوات ريكفري'],
    keywordsFranco: ['afdal tare2a recovery', 'recovery morattab', 'ice bath wala sauna', 'foam roll', 'massage gun', 'adawat recovery'],
    stateId: 'HP_MENU',
    response: { en: 'Recovery methods ranked (by evidence): TIER 1 (must-do): Sleep 7-9hrs, adequate protein (2g/kg), hydration, rest days. TIER 2 (helpful): Walking on rest days, light stretching, foam rolling (reduces soreness 20-30%). TIER 3 (nice to have): Contrast showers (hot/cold), massage/massage gun, sauna (20min post-workout). TIER 4 (overhyped): Ice baths (may reduce muscle growth!), compression garments (minimal effect), cryotherapy (expensive, minimal evidence). SAVE YOUR MONEY on fancy recovery tools — sleep and food are 80% of recovery!', ar: 'طرق الريكفري مرتبة (حسب الأدلة): فئة 1 (لازم): نوم 7-9 ساعات، بروتين كافي (2ج/كج)، مية، أيام راحة. فئة 2 (مفيد): مشي في أيام الراحة، استرتش خفيف، فوم رول (بيقلل الشد 20-30%). فئة 3 (حلو لو متاح): دش متباين (ساخن/بارد)، مساج/مساج جان، ساونا (20 دقيقة بعد التمرين). فئة 4 (مبالغ فيه): آيس باث (ممكن يقلل نمو العضل!)، ملابس ضغط (تأثير قليل)، كرايوثيرابي (غالي، أدلة قليلة). وفر فلوسك على أدوات ريكفري فاخرة — النوم والأكل 80% من الريكفري!' },
    priority: 8,
    domain: 'recovery',
  },

  // ── v31: Egyptian Budget Protein ──────────────────────────────
  {
    keywords: ['cheap protein egypt', 'protein on budget', 'affordable protein', 'protein for poor', 'cheapest protein source egypt', 'budget muscle building'],
    keywordsAr: ['بروتين رخيص مصر', 'بروتين باقل تكلفة', 'بروتين اقتصادي', 'أرخص بروتين مصر', 'بناء عضل بميزانية'],
    keywordsFranco: ['protein re5ees masr', 'protein ba2al taklefa', 'protein e2tesady', 'ar5as protein masr', 'bena2 3adal be mizaneya'],
    stateId: 'NT_MENU',
    response: { en: 'Budget protein in Egypt (cost per 30g protein): 1) EGGS: ~15 LE (5 eggs) — BEST value 2) FUL MEDAMES: ~5-10 LE/plate (incomplete, add bread) 3) CHICKEN (frozen): ~25 LE (150g) 4) CANNED TUNA: ~25 LE (1 can) 5) LENTILS: ~10 LE (1 cup cooked, incomplete) 6) MILK: ~15 LE (500ml) 7) CHEESE (white): ~15 LE (100g). BUDGET DAY: Breakfast: 4 eggs + bread (20 LE). Lunch: chicken 200g + rice (35 LE). Dinner: tuna + salad (30 LE). Snack: ful plate (10 LE). TOTAL: ~95 LE for 150g+ protein! That\'s ~2850 LE/month.', ar: 'بروتين اقتصادي في مصر (التكلفة لكل 30ج بروتين): 1) بيض: ~15 جنيه (5 بيضات) — أفضل قيمة 2) فول: ~5-10 جنيه/طبق (ناقص، ضيف عيش) 3) فراخ (فروزن): ~25 جنيه (150ج) 4) تونة معلبة: ~25 جنيه (علبة) 5) عدس: ~10 جنيه (كوب مطبوخ، ناقص) 6) لبن: ~15 جنيه (500مل) 7) جبنة (بيضا): ~15 جنيه (100ج). يوم اقتصادي: فطار: 4 بيض + عيش (20 جنيه). غدا: فراخ 200ج + رز (35 جنيه). عشا: تونة + سلطة (30 جنيه). سناك: طبق فول (10 جنيه). الإجمالي: ~95 جنيه ل150ج+ بروتين! يعني ~2850 جنيه/شهر.' },
    priority: 9,
    domain: 'nutrition',
  },

  // ── v31: Workout Accessories Guide ────────────────────────────
  {
    keywords: ['gym accessories', 'workout gloves', 'lifting straps', 'wrist wraps', 'knee sleeves', 'gym bag essentials', 'what to bring gym'],
    keywordsAr: ['اكسسوارات جيم', 'جلافز جيم', 'ستراب رفع', 'ريست راب', 'كني سليفز', 'أساسيات شنطة الجيم'],
    keywordsFranco: ['accessories gym', 'gloves gym', 'straps raf3', 'wrist wraps', 'knee sleeves', 'asasyat shantet el gym'],
    stateId: 'QA_MENU',
    response: { en: 'Gym accessories (actually worth buying): ESSENTIAL: Water bottle, towel, good shoes (flat for lifting). RECOMMENDED: Lifting straps (for heavy pulls, ~50 LE), wrist wraps (bench/OHP, ~80 LE), knee sleeves (squats, ~200 LE), lifting belt (heavy compounds, ~300 LE). OPTIONAL: Chalk/liquid chalk (grip, ~50 LE), resistance bands (~100 LE). NOT WORTH IT: Gloves (weaken grip), fancy shakers (any bottle works), most "fitness" clothing (wear anything comfortable). GYM BAG: water, towel, headphones, change of clothes, protein shake.', ar: 'اكسسوارات الجيم (اللي تستاهل الشرا): أساسي: بزازة مية، منشفة، حذاء كويس (فلات للحديد). موصى به: ستراب رفع (للسحب الثقيل، ~50 جنيه)، ريست راب (بنش/OHP، ~80 جنيه)، كني سليفز (سكوات، ~200 جنيه)، حزام رفع (مركبات ثقيلة، ~300 جنيه). اختياري: طباشير (قبضة، ~50 جنيه)، باند مقاومة (~100 جنيه). متستهلش: جلافز (بتضعف القبضة)، شيكرز فاخرة (أي بزازة تمشي)، هدوم "فيتنس" غالية (البس أي حاجة مريحة). شنطة الجيم: مية، منشفة، سماعات، هدوم تغيير، بروتين شيك.' },
    priority: 7,
    domain: 'root',
  },

  // ── v32: HIIT Workouts ─────────────────────────────────────
  {
    keywords: ['hiit workout', 'hiit routine', 'hiit exercises', 'tabata', 'interval training', 'hiit for fat loss', 'best hiit workout'],
    keywordsAr: ['تمرين هيت', 'روتين هيت', 'تابتا', 'تمرين فواصل', 'هيت لحرق الدهون'],
    keywordsFranco: ['tamreen HIIT', 'routine HIIT', 'tabata', 'tamreen fawasel', 'HIIT le 7ar2 el dohon'],
    stateId: 'WK_MENU',
    response: { en: 'HIIT workouts: BEGINNER (20min): 30sec work / 30sec rest × 10 rounds. Exercises: jumping jacks, bodyweight squats, push-ups, mountain climbers. INTERMEDIATE (25min): 40sec work / 20sec rest × 12 rounds. Add: burpees, jump squats, plank jacks. TABATA (4min killer): 20sec max effort / 10sec rest × 8 rounds. ADVANCED: 45sec work / 15sec rest + weighted exercises. FREQUENCY: 2-3x/week MAX (not daily — needs recovery). HIIT after weights, not before. Burns 25-30% more calories than steady cardio + EPOC (afterburn effect lasts 24-48hrs)!', ar: 'تمارين HIIT: مبتدئ (20 دقيقة): 30ث شغل / 30ث راحة × 10 جولات. تمارين: جامبنج جاك، سكوات، ضغط، ماونتن كلايمرز. متوسط (25 دقيقة): 40ث شغل / 20ث راحة × 12 جولة. ضيف: بيربي، جامب سكوات، بلانك جاك. تاباتا (4 دقايق قاتلة): 20ث ماكس / 10ث راحة × 8 جولات. متقدم: 45ث شغل / 15ث راحة + تمارين بوزن. التكرار: 2-3 مرات/أسبوع ماكس (مش يومي — محتاج ريكفري). HIIT بعد الحديد مش قبل. بيحرق 25-30% أكتر من كارديو ثابت + EPOC (تأثير الاحتراق بيستمر 24-48 ساعة)!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v32: Training While Sick ──────────────────────────────────
  {
    keywords: ['workout while sick', 'train with cold', 'gym when sick', 'exercise with flu', 'should i train sick', 'neck rule'],
    keywordsAr: ['تمرين وانا عيان', 'تمرين مع برد', 'جيم وانا عيان', 'تمرين مع انفلونزا', 'اتمرن وانا تعبان'],
    keywordsFranco: ['tamreen w ana 3ayan', 'tamreen ma3 bard', 'gym w ana 3ayan', 'tamreen ma3 enflwanza', 'atmarren w ana ta3ban'],
    stateId: 'HP_MENU',
    response: { en: 'Training while sick — the NECK RULE: ABOVE the neck (runny nose, mild sore throat, sneezing): Light exercise OK (walk, light lift at 50%). BELOW the neck (chest congestion, body aches, fever, fatigue): ABSOLUTE REST. NO training with fever — your heart rate is already elevated. FLU: REST completely, you risk myocarditis (heart inflammation). RETURN: Start at 50% intensity, build back over 1 week. HYDRATE extra. Don\'t be a hero — 3-5 days of rest won\'t kill your gains, but training sick can make you worse for weeks!', ar: 'التمرين وانت عيان — قاعدة الرقبة: فوق الرقبة (رشح، زور خفيف، عطس): تمرين خفيف أوكي (مشي، حديد خفيف 50%). تحت الرقبة (كحة صدر، آلام جسم، حرارة، إرهاق): راحة تامة. مفيش تمرين مع حرارة — نبض القلب بالفعل عالي. انفلونزا: ريح خالص، فيه خطر التهاب عضلة القلب. الرجوع: ابدأ 50% شدة، رجع تدريجياً خلال أسبوع. اشرب مية زيادة. متبقاش بطل — 3-5 أيام راحة مش هتضر مكاسبك، بس التمرين وانت عيان ممكن يوقفك أسابيع!' },
    priority: 9,
    domain: 'health',
  },

  // ── v32: Egyptian Healthy Snacks ──────────────────────────────
  {
    keywords: ['healthy snacks egypt', 'egyptian healthy snacks', 'gym snacks egypt', 'protein snacks egypt', 'snack ideas fitness'],
    keywordsAr: ['سناك صحي مصر', 'سناك مصري صحي', 'سناك جيم', 'سناك بروتين مصر', 'أفكار سناك'],
    keywordsFranco: ['snack se7y masr', 'snack masry se7y', 'snack gym', 'snack protein masr', 'afkar snack'],
    stateId: 'NT_MENU',
    response: { en: 'Healthy Egyptian snacks: HIGH PROTEIN: Boiled eggs (2-3), ful sandwich (small), labneh with cucumber, cheese triangle + bread, canned tuna. ENERGY: Dates + peanut butter, lupini (tirmis) — amazing protein!, mixed nuts (loz + soudany), fruit + yogurt. PRE-WORKOUT: Banana + coffee, dates + water, small koshari. POST-WORKOUT: Eggs + bread, protein shake, yogurt + honey + oats. AVOID: Chipsy, 3aseer manga (sugar bomb), croissant (empty calories), feteer (pure fat). Most Egyptian street snacks (tirmis, sweet potato) are actually healthy!', ar: 'سناك مصري صحي: عالي البروتين: بيض مسلوق (2-3)، سندوتش فول (صغير)، لبنة بخيار، مثلث جبنة + عيش، تونة. طاقة: بلح + زبدة فول سوداني، ترمس — بروتين مذهل!، مكسرات (لوز + سوداني)، فاكهة + زبادي. قبل التمرين: موزة + قهوة، بلح + مية، كشري صغير. بعد التمرين: بيض + عيش، بروتين شيك، زبادي + عسل + شوفان. تجنب: شيبسي، عصير مانجو (سكر صافي)، كرواسون (سعرات فاضية)، فطير (دهون صافية). أغلب سناك الشارع المصري (ترمس، بطاطا) صحي فعلاً!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v32: Foam Rolling Guide ───────────────────────────────────
  {
    keywords: ['foam rolling', 'how to foam roll', 'foam roller routine', 'foam rolling benefits', 'foam rolling muscles', 'trigger point', 'myofascial release'],
    keywordsAr: ['فوم رول', 'ازاي استخدم فوم رول', 'روتين فوم رول', 'فوائد فوم رول', 'نقاط تريجر'],
    keywordsFranco: ['foam roll', 'ezay asta5dem foam roll', 'routine foam roll', 'fawa2ed foam roll', 'no2at trigger'],
    stateId: 'HP_MENU',
    response: { en: 'Foam rolling guide: HOW: Roll slowly (1 inch/second), pause on tender spots 30-60sec. PRESSURE: Moderate (6-7/10 pain). WHEN: Before workout (30sec/muscle, increases blood flow) and after (60sec/muscle, reduces soreness). KEY AREAS: Quads, hamstrings, IT band (side of thigh), glutes, upper back, lats, calves. AVOID: Lower back (use a ball), neck, directly on joints/bones. TYPES: Smooth foam (beginner), textured (intermediate), PVC/hard (advanced). Budget: ~150-300 LE in Egypt. Reduces DOMS by 20-30% and improves flexibility!', ar: 'دليل الفوم رول: ازاي: لف ببطء (2سم/ثانية)، وقف على المناطق المؤلمة 30-60ث. الضغط: متوسط (6-7/10 ألم). امتى: قبل التمرين (30ث/عضلة، بيزود الدم) وبعده (60ث/عضلة، بيقلل الشد). مناطق رئيسية: كواد، خلفية، IT باند (جنب الفخد)، أرداف، ظهر علوي، لاتس، سمانة. تجنب: أسفل الظهر (استخدم كرة)، الرقبة، المفاصل/العظم مباشرة. أنواع: فوم ناعم (مبتدئ)، محبب (متوسط)، PVC/صلب (متقدم). السعر: ~150-300 جنيه في مصر. بيقلل الشد 20-30% وبيحسن المرونة!' },
    priority: 7,
    domain: 'health',
  },

  // ── v32: Protein Shake Recipes ────────────────────────────────
  {
    keywords: ['protein shake recipe', 'smoothie recipe', 'post workout shake', 'homemade protein shake', 'shake without protein powder', 'best protein shake'],
    keywordsAr: ['وصفة بروتين شيك', 'وصفة سموذي', 'شيك بعد التمرين', 'شيك بروتين بيتي', 'شيك بدون بودر'],
    keywordsFranco: ['wasfa protein shake', 'wasfa smoothie', 'shake ba3d el tamreen', 'shake protein beity', 'shake bdoon powder'],
    stateId: 'NT_MENU',
    response: { en: 'Protein shake recipes: CLASSIC: 1 scoop whey + 1 banana + 200ml milk + ice (350 cal, 35g P). CHOCOLATE PB: 1 scoop chocolate whey + 1 tbsp PB + 200ml milk + ice (400 cal, 38g P). OATS SHAKE: 1 scoop whey + 40g oats + 1 banana + 250ml milk (500 cal, 40g P). NO POWDER: 2 eggs + 1 banana + 200ml milk + 1 tbsp honey + cocoa (350 cal, 20g P). GREEK YOGURT: 200g Greek yogurt + berries + honey + oats (300 cal, 25g P). Egyptian special: Sahlab + whey + cinnamon + milk = warm protein drink for winter!', ar: 'وصفات بروتين شيك: كلاسيك: سكوب واي + موزة + 200مل لبن + ثلج (350 سعرة، 35ج بروتين). شوكلت PB: سكوب واي شوكلت + ملعقة زبدة فول سوداني + 200مل لبن + ثلج (400 سعرة، 38ج). شوفان شيك: سكوب واي + 40ج شوفان + موزة + 250مل لبن (500 سعرة، 40ج). بدون بودر: 2 بيضة + موزة + 200مل لبن + ملعقة عسل + كاكاو (350 سعرة، 20ج). زبادي يوناني: 200ج زبادي + توت + عسل + شوفان (300 سعرة، 25ج). سبيشال مصري: سحلب + واي + قرفة + لبن = مشروب بروتين دافي للشتاء!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v32: Gym After Surgery/Medical ────────────────────────────
  {
    keywords: ['gym after surgery', 'exercise after operation', 'return to gym after injury', 'post surgery workout', 'training after hospital'],
    keywordsAr: ['جيم بعد عملية', 'تمرين بعد جراحة', 'رجوع للجيم بعد إصابة', 'تمرين بعد المستشفى'],
    keywordsFranco: ['gym ba3d 3amaleya', 'tamreen ba3d gera7a', 'rogo3 lel gym ba3d esaba', 'tamreen ba3d el mostashfa'],
    stateId: 'HP_MENU',
    response: { en: 'Return to gym after surgery: RULE #1: Get WRITTEN clearance from your surgeon/doctor. GENERAL TIMELINE: Minor surgery (laparoscopic): 2-4 weeks. Major abdominal: 6-12 weeks. Orthopedic: varies (follow PT plan). RETURN PLAN: Week 1-2: Walking only. Week 3-4: Light machines, 50% weight. Week 5-8: Gradually increase to normal. NEVER: Lift heavy before cleared, rush the timeline, ignore pain. Work with a physiotherapist if available. Your body healed the wound but internal recovery takes longer. Patience = no setbacks!', ar: 'الرجوع للجيم بعد العملية: قاعدة رقم 1: خد موافقة مكتوبة من الجراح/الدكتور. جدول عام: عملية بسيطة (منظار): 2-4 أسابيع. بطن كبرى: 6-12 أسبوع. عظام: بيختلف (اتبع خطة العلاج الطبيعي). خطة الرجوع: أسبوع 1-2: مشي بس. أسبوع 3-4: أجهزة خفيفة، 50% وزن. أسبوع 5-8: زود تدريجياً للعادي. أبداً: ترفع ثقيل قبل الإذن، تستعجل الجدول، تتجاهل الألم. اشتغل مع أخصائي علاج طبيعي لو متاح. الجسم شفى الجرح بس التعافي الداخلي بياخد أكتر. الصبر = مفيش انتكاسات!' },
    priority: 9,
    domain: 'health',
  },

  // ── v32: Fitness for Couples ──────────────────────────────────
  {
    keywords: ['couple workout', 'workout with partner', 'gym with girlfriend', 'gym with wife', 'couples fitness', 'partner exercises'],
    keywordsAr: ['تمرين زوجين', 'تمرين مع شريك', 'جيم مع حبيبتي', 'جيم مع زوجتي', 'لياقة أزواج'],
    keywordsFranco: ['tamreen zogein', 'tamreen ma3 shareek', 'gym ma3 7abibty', 'gym ma3 zogty', 'leya2et azwag'],
    stateId: 'QA_MENU',
    response: { en: 'Couple workouts: BENEFITS: Built-in accountability, more fun, shared goals. PARTNER EXERCISES: Medicine ball throws, partner resisted band work, wheelbarrow walks, partner sit-up with ball toss. SEPARATE BUT TOGETHER: Train at same time but different programs (his upper body while she does lower). TIPS: 1) Don\'t force matching weights 2) Support, don\'t criticize form (leave that to trainers) 3) Celebrate each other\'s PRs 4) Meal prep together (biggest benefit!) 5) Respect different goals/pace. Many Egyptian couples train together now — it\'s becoming normalized and it\'s great!', ar: 'تمارين الأزواج: فوائد: التزام متبادل، أمتع، أهداف مشتركة. تمارين شريك: رمي كرة طبية، باند مع مقاومة شريك، ووكس. منفصل بس مع بعض: تمرنوا نفس الوقت بس برامج مختلفة (هو أب بادي وهي لو بادي). نصايح: 1) متفرضش نفس الأوزان 2) ادعم متنتقدش الفورم (سيبها للمدرب) 3) احتفلوا بإنجازات بعض 4) حضروا الأكل مع بعض (أكبر فايدة!) 5) احترموا أهداف وسرعة مختلفة. أزواج مصريين كتير بيتمرنوا مع بعض دلوقتي — بقت حاجة عادية وحلوة!' },
    priority: 6,
    domain: 'root',
  },

  // ── v33: NEAT & Daily Activity ─────────────────────────────
  {
    keywords: ['neat', 'non exercise activity', 'daily steps', 'steps for weight loss', 'fidgeting calories', 'move more', 'active lifestyle'],
    keywordsAr: ['نشاط يومي', 'خطوات يومية', 'خطوات لخسارة الوزن', 'تحرك أكتر', 'نمط حياة نشيط'],
    keywordsFranco: ['nashat yawmy', '5otowat yawmeya', '5otowat le 5osaret el wazn', 'et7arrak aktar', 'namat 7ayah nashit'],
    stateId: 'HP_MENU',
    response: { en: 'NEAT (Non-Exercise Activity Thermogenesis): Burns 200-800+ calories/day — MORE than your gym session! WAYS to increase NEAT: 1) 10,000 steps daily (burns ~400-500 cal) 2) Take stairs always 3) Stand while on phone 4) Walk after meals (15min = better digestion + glucose control) 5) Park far from entrance 6) Fidget more (yes, it counts!) 7) Walking meetings. NEAT is the SECRET weapon for fat loss — two people with same diet/workout can differ by 500 cal/day based on NEAT alone. Step goal: 8000-12000/day for optimal health!', ar: 'NEAT (حرق النشاط غير الرياضي): بيحرق 200-800+ سعرة/يوم — أكتر من جلسة الجيم! طرق زيادة NEAT: 1) 10,000 خطوة يومياً (بتحرق ~400-500 سعرة) 2) السلالم دايماً 3) قف وانت بتتكلم في التليفون 4) امشي بعد الأكل (15 دقيقة = هضم أفضل + تحكم سكر) 5) اركن بعيد عن المدخل 6) اتحرك أكتر (أيوا، بيحسب!) 7) اجتماعات مشي. NEAT هو السلاح السري لخسارة الدهون — اتنين نفس الأكل/التمرين ممكن يختلفوا 500 سعرة/يوم بسبب NEAT. هدف الخطوات: 8000-12000/يوم لصحة مثالية!' },
    priority: 8,
    domain: 'health',
  },

  // ── v33: Carb Sources Ranked ──────────────────────────────────
  {
    keywords: ['best carbs', 'carb sources', 'healthy carbs', 'complex carbs', 'simple carbs', 'which carbs to eat', 'carbs for workout'],
    keywordsAr: ['أفضل كارب', 'مصادر كارب', 'كارب صحي', 'كارب معقد', 'كارب بسيط', 'كارب للتمرين'],
    keywordsFranco: ['afdal carb', 'masader carb', 'carb se7y', 'carb mo3a2ad', 'carb baseet', 'carb lel tamreen'],
    stateId: 'NT_MENU',
    response: { en: 'Carb sources ranked: TIER 1 (complex, nutrient-dense): Oats, sweet potato, brown rice, quinoa, lentils, beans. TIER 2 (good): White rice (fine around workouts!), whole wheat bread, pasta, potatoes, fruits. TIER 3 (occasional): White bread, cereal, crackers. AVOID: Sugary drinks, candy, pastries (empty calories). PRE-WORKOUT (1-2hrs): Complex carbs + protein. POST-WORKOUT: Simple carbs OK (white rice, banana) for fast glycogen replenishment. Egyptian picks: Ful + bread, rice, koshari (carb bomb but great post-workout!).', ar: 'مصادر الكارب مرتبة: فئة 1 (معقد، مغذي): شوفان، بطاطا، رز بني، كينوا، عدس، فول. فئة 2 (كويس): رز أبيض (كويس حوالين التمرين!)، عيش بلدي، مكرونة، بطاطس، فواكه. فئة 3 (أحياناً): عيش أبيض، سيريال، كراكرز. تجنب: مشروبات سكر، حلويات، معجنات (سعرات فاضية). قبل التمرين (1-2 ساعة): كارب معقد + بروتين. بعد التمرين: كارب بسيط أوكي (رز أبيض، موز) لتعويض الجلايكوجين. اختيارات مصرية: فول + عيش، رز، كشري (كارب بومب بس ممتاز بعد التمرين!).' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v33: Rest Day Activities ──────────────────────────────────
  {
    keywords: ['rest day', 'what to do rest day', 'active recovery', 'off day workout', 'recovery day activities', 'should i rest'],
    keywordsAr: ['يوم راحة', 'اعمل ايه يوم الراحة', 'ريكفري نشيط', 'يوم أوف', 'نشاط يوم الراحة'],
    keywordsFranco: ['yom ra7a', 'a3mel eih yom el ra7a', 'recovery nashit', 'yom off', 'nashat yom el ra7a'],
    stateId: 'WK_MENU',
    response: { en: 'Rest day guide: ACTIVE RECOVERY (better than doing nothing): 1) Walking 30-60min 2) Light stretching/yoga 3) Swimming (easy laps) 4) Foam rolling 5) Cycling at low intensity. REST DAYS NEEDED: 1-2/week minimum (your muscles GROW during rest, not during training). SIGNS you need more rest: chronic fatigue, strength declining, mood changes, sleep issues, elevated resting heart rate. Rest ≠ lazy. Rest = strategic recovery for better performance. Elite athletes take rest VERY seriously — you should too!', ar: 'دليل يوم الراحة: ريكفري نشيط (أفضل من عدم عمل حاجة): 1) مشي 30-60 دقيقة 2) استرتش خفيف/يوجا 3) سباحة (لفات سهلة) 4) فوم رول 5) عجلة بشدة منخفضة. أيام الراحة المطلوبة: 1-2/أسبوع على الأقل (العضلات بتنمو في الراحة مش التمرين). علامات محتاج راحة أكتر: تعب مزمن، قوة بتنزل، تغيرات مزاج، مشاكل نوم، نبض راحة عالي. الراحة ≠ كسل. الراحة = ريكفري استراتيجي لأداء أفضل. الرياضيين النخبة بياخدوا الراحة بجدية — انت كمان لازم!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v33: Training Volume Guide ────────────────────────────────
  {
    keywords: ['training volume', 'how many sets', 'sets per muscle', 'optimal volume', 'too much volume', 'overtraining', 'junk volume'],
    keywordsAr: ['حجم التدريب', 'كام سيت', 'سيتات لكل عضلة', 'الحجم المثالي', 'حجم زيادة', 'تمرين زيادة'],
    keywordsFranco: ['7agm el tadreeb', 'kam set', 'sets le kol 3adala', 'el 7agm el mesaly', '7agm zyada', 'tamreen zyada'],
    stateId: 'WK_MENU',
    response: { en: 'Training volume guide (sets per muscle per week): BEGINNER: 10-12 sets/muscle/week. INTERMEDIATE: 14-18 sets. ADVANCED: 18-25 sets. MAXIMUM RECOVERABLE VOLUME (MRV): beyond this = junk volume, no growth. SIGNS of too much volume: strength dropping, always tired, joint pain, dreading the gym. START with minimum effective volume and ADD sets over time. Quality sets (close to failure) > lots of easy sets. 1-3 reps from failure = the sweet spot. PRACTICAL: Start at 12 sets/muscle/week, add 1-2 sets every 2 weeks, deload when you stall.', ar: 'دليل حجم التدريب (سيتات لكل عضلة في الأسبوع): مبتدئ: 10-12 سيت/عضلة/أسبوع. متوسط: 14-18 سيت. متقدم: 18-25 سيت. الحد الأقصى القابل للاستشفاء (MRV): بعده = حجم ضايع، مفيش نمو. علامات حجم زيادة: القوة بتنزل، تعبان دايماً، ألم مفاصل، مش عايز تتمرن. ابدأ بأقل حجم فعال وزود سيتات مع الوقت. سيتات جودة (قرب من الفشل) > سيتات كتير سهلة. 1-3 تكرارات من الفشل = المنطقة المثالية. عملياً: ابدأ 12 سيت/عضلة/أسبوع، زود 1-2 سيت كل أسبوعين، ديلود لما تقف.' },
    priority: 8,
    domain: 'workout',
  },

  // ── v33: Natural Testosterone Boost ───────────────────────────
  {
    keywords: ['boost testosterone', 'increase testosterone naturally', 'low testosterone', 'testosterone food', 'testosterone exercise', 'testosterone tips'],
    keywordsAr: ['زيادة التستوستيرون', 'رفع التستوستيرون طبيعي', 'تستوستيرون منخفض', 'أكل للتستوستيرون'],
    keywordsFranco: ['zyada el testosterone', 'raf3 el testosterone tabi3y', 'testosterone mon5afed', 'akl lel testosterone'],
    stateId: 'HP_MENU',
    response: { en: 'Natural testosterone optimization: PROVEN: 1) Sleep 7-9hrs (most important!) 2) Lift heavy compounds (squats, deadlifts) 3) Maintain healthy body fat (12-20%) 4) Zinc (oysters, beef, pumpkin seeds) 5) Vitamin D (3000-5000IU daily) 6) Minimize alcohol 7) Manage stress (cortisol kills testosterone) 8) Eat enough fat (20-35% of calories) 9) Don\'t crash diet 10) Cold showers (mild effect). MYTHS: Soy doesn\'t lower test. Masturbation doesn\'t affect test. No supplement significantly boosts test (save your money). If symptoms persist, get blood work done!', ar: 'تحسين التستوستيرون طبيعياً: مثبت: 1) نوم 7-9 ساعات (الأهم!) 2) رفع ثقيل مركب (سكوات، ديدلفت) 3) حافظ على نسبة دهون صحية (12-20%) 4) زنك (لحمة، بذور قرع) 5) فيتامين د (3000-5000IU يومياً) 6) قلل الكحول 7) تحكم في التوتر (الكورتيزول بيقتل التستوستيرون) 8) كل دهون كافية (20-35% من السعرات) 9) متعملش كراش دايت 10) دش بارد (تأثير خفيف). خرافات: الصويا مش بتنزل التست. مفيش مكمل بيرفع التست بشكل كبير (وفر فلوسك). لو الأعراض مستمرة، اعمل تحليل دم!' },
    priority: 8,
    domain: 'health',
  },

  // ── v33: Back Pain Prevention ─────────────────────────────────
  {
    keywords: ['back pain', 'lower back pain', 'back pain gym', 'back pain deadlift', 'herniated disc', 'slipped disc', 'back pain exercise'],
    keywordsAr: ['ألم ظهر', 'ألم أسفل الظهر', 'ألم ظهر جيم', 'ألم ظهر ديدلفت', 'انزلاق غضروفي', 'ديسك'],
    keywordsFranco: ['alam dahr', 'alam asfal el dahr', 'alam dahr gym', 'alam dahr deadlift', 'enzla2 ghodrofy', 'disc'],
    stateId: 'HP_MENU',
    response: { en: 'Back pain prevention & management: PREVENTION: 1) Core strengthening (planks, dead bugs, bird dogs) 2) Hip hinge pattern (learn proper deadlift form) 3) Don\'t round lower back under load 4) Strengthen glutes (weak glutes = back takes over) 5) Stretch hip flexors daily. IF YOU HAVE PAIN: McGill Big 3 (curl-up, side plank, bird dog) — evidence-based. Walking is the BEST medicine for back pain. AVOID: Sit-ups/crunches (bad for discs), heavy good mornings, loaded flexion. See a doctor if: pain radiates down legs, numbness/tingling, or pain >2 weeks.', ar: 'منع وإدارة ألم الظهر: الوقاية: 1) تقوية الكور (بلانك، ديد باجز، بيرد دوج) 2) نمط الهيب هينج (اتعلم فورم الديدلفت الصح) 3) متقوسش أسفل الظهر تحت حمل 4) قوي الأرداف (أرداف ضعيفة = الظهر بياخد الحمل) 5) استرتش الهيب فليكسور يومياً. لو عندك ألم: ماكجيل بيج 3 (كيرل اب، سايد بلانك، بيرد دوج) — مثبت علمياً. المشي أفضل دواء لألم الظهر. تجنب: سيت اب/كرانش (سيئة للديسك)، جود مورنينج ثقيل. روح دكتور لو: الألم بيمتد للرجل، تنميل، أو ألم >أسبوعين.' },
    priority: 9,
    domain: 'health',
  },

  // ── v33: Fitness Tracking Apps ────────────────────────────────
  {
    keywords: ['fitness app', 'best gym app', 'tracking app', 'calorie tracking app', 'workout log app', 'myfitnesspal', 'strong app'],
    keywordsAr: ['أبلكيشن فيتنس', 'أفضل أبلكيشن جيم', 'أبلكيشن تتبع', 'أبلكيشن سعرات', 'أبلكيشن تمرين'],
    keywordsFranco: ['app fitness', 'afdal app gym', 'app tatabo3', 'app so3rat', 'app tamreen'],
    stateId: 'QA_MENU',
    response: { en: 'Fitness apps guide: CALORIE TRACKING: MyFitnessPal (best database), Cronometer (most accurate). WORKOUT LOGGING: Strong (clean UI, free tier good), Hevy (social features). STEPS/ACTIVITY: Apple Health, Google Fit, Samsung Health. PROGRAMS: JEFIT, RP Hypertrophy (paid). BUT: You\'re already using FORMA — which combines workout tracking, nutrition, AI coaching, and programs! Our app is designed specifically for the Egyptian market with local foods, Arabic support, and culturally relevant content. Use Forma as your primary app!', ar: 'دليل أبلكيشنات الفيتنس: تتبع سعرات: MyFitnessPal (أكبر داتابيز)، Cronometer (أدق). تسجيل تمرين: Strong (واجهة نظيفة)، Hevy (ميزات اجتماعية). خطوات/نشاط: Apple Health، Google Fit، Samsung Health. برامج: JEFIT، RP Hypertrophy (مدفوع). بس: انت بالفعل بتستخدم FORMA — اللي بيجمع تتبع التمرين، التغذية، كوتشنج ذكي، وبرامج! الأبلكيشن بتاعنا مصمم خصيصاً للسوق المصري بأكل محلي، دعم عربي، ومحتوى ثقافي مناسب. استخدم فورما كأبلكيشنك الأساسي!' },
    priority: 7,
    domain: 'root',
  },

  // ── v34: Functional Training ───────────────────────────────
  {
    keywords: ['functional training', 'functional fitness', 'real world strength', 'functional exercises', 'everyday fitness', 'functional movement'],
    keywordsAr: ['تمرين وظيفي', 'لياقة وظيفية', 'قوة حقيقية', 'تمارين وظيفية', 'حركة وظيفية'],
    keywordsFranco: ['tamreen wazefy', 'leya2a wazefeya', '2owa 7a2e2eya', 'tamareen wazefeya'],
    stateId: 'WK_MENU',
    response: { en: 'Functional training: Exercises that improve real-life movement. TOP EXERCISES: Squats (sitting/standing), deadlifts (picking things up), overhead press (putting things on shelves), farmer walks (carrying groceries), Turkish get-up (getting off floor), lunges (stairs), push-ups, rows. PROGRAM: Combine 4-5 functional moves, 3x10-15, 3x/week. ADD: balance work (single leg), rotation (wood chops), carrying (farmer walks). Great for: injury prevention, aging well, sport performance. It\'s NOT just CrossFit — functional training is for everyone!', ar: 'التمرين الوظيفي: تمارين بتحسن الحركة في الحياة اليومية. أفضل التمارين: سكوات (قعود/وقوف)، ديدلفت (رفع حاجات)، أوفرهيد بريس (حط حاجات على الرف)، فارمر ووك (شيل أكياس)، تركش جت اب (قوم من الأرض)، لانجز (سلالم)، ضغط، رو. البرنامج: ادمج 4-5 تمارين وظيفية، 3×10-15، 3 مرات/أسبوع. ضيف: توازن (رجل واحدة)، دوران (وود تشوب)، حمل (فارمر ووك). ممتاز لـ: منع إصابات، شيخوخة صحية، أداء رياضي. مش كروس فيت بس — التمرين الوظيفي للكل!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v34: Mobility vs Flexibility ──────────────────────────────
  {
    keywords: ['mobility vs flexibility', 'what is mobility', 'mobility work', 'mobility routine', 'flexibility vs mobility', 'joint mobility'],
    keywordsAr: ['المرونة مقابل الحركية', 'ايه الموبيليتي', 'تمارين موبيليتي', 'روتين موبيليتي', 'حركية المفاصل'],
    keywordsFranco: ['mobility vs flexibility', 'eih el mobility', 'tamareen mobility', 'routine mobility', '7arakeyet el mafasel'],
    stateId: 'WK_MENU',
    response: { en: 'Mobility vs Flexibility: FLEXIBILITY = passive range (how far a muscle can stretch). MOBILITY = active range (how far you can move a joint with CONTROL). You need BOTH! MOBILITY ROUTINE (10min daily): 1) CARs (Controlled Articular Rotations) for each joint 2) Hip 90/90 switches 3) World\'s greatest stretch 4) Thoracic spine rotations 5) Ankle rocks 6) Shoulder pass-throughs with band. WHEN: Morning or pre-workout. CAN\'T squat deep? It\'s usually ankle or hip MOBILITY, not flexibility. Mobility work > static stretching for gym performance!', ar: 'موبيليتي مقابل فلكسبيليتي: المرونة = نطاق سلبي (قد ايه العضلة بتتمد). الحركية = نطاق نشط (قد ايه تقدر تحرك المفصل بتحكم). محتاج الاتنين! روتين موبيليتي (10 دقايق يومياً): 1) CARs (دوائر مفصلية متحكمة) لكل مفصل 2) هيب 90/90 3) أعظم استرتش في العالم 4) دورانات العمود الصدري 5) حركات الكاحل 6) شولدر باس ثرو بباند. امتى: الصبح أو قبل التمرين. مش قادر تنزل سكوات عميق؟ عادة موبيليتي الكاحل أو الوسط مش المرونة. تمارين الموبيليتي > الاسترتش الثابت لأداء الجيم!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v34: High Protein Breakfast ───────────────────────────────
  {
    keywords: ['high protein breakfast', 'protein breakfast ideas', 'best breakfast gym', 'breakfast for muscle', 'quick protein breakfast', 'what to eat morning'],
    keywordsAr: ['فطار عالي البروتين', 'أفكار فطار بروتين', 'أفضل فطار جيم', 'فطار للعضل', 'فطار سريع بروتين'],
    keywordsFranco: ['fatar 3aly el protein', 'afkar fatar protein', 'afdal fatar gym', 'fatar lel 3adal', 'fatar saree3 protein'],
    stateId: 'NT_MENU',
    response: { en: 'High protein breakfasts: QUICK (5min): 3-4 eggs any style + toast (25g P). Overnight oats + protein powder + PB (35g P). Greek yogurt + berries + nuts (25g P). EGYPTIAN STYLE: Ful medames + 2 boiled eggs + bread (35g P). Eggs with basterma (30g P). Cheese + eggs scramble (28g P). ON THE GO: Protein shake + banana (30g P). Ful sandwich from cart + boiled eggs (30g P). MEAL PREP: Egg muffins (make 12 on Sunday). KEY: 30g+ protein at breakfast = better muscle building, less hunger all day, more energy!', ar: 'فطار عالي البروتين: سريع (5 دقايق): 3-4 بيض أي طريقة + توست (25ج). أوفرنايت أوتس + بودر بروتين + زبدة فول سوداني (35ج). زبادي يوناني + توت + مكسرات (25ج). على الطريقة المصرية: فول + 2 بيض مسلوق + عيش (35ج). بيض بالبسطرمة (30ج). بيض مقلقل بجبنة (28ج). على الماشي: بروتين شيك + موزة (30ج). سندوتش فول من العربية + بيض مسلوق (30ج). ميل بريب: مافن بيض (اعمل 12 يوم الأحد). المفتاح: 30ج+ بروتين في الفطار = بناء عضل أفضل، جوع أقل طول اليوم، طاقة أكتر!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v34: Egyptian Street Food Calories ────────────────────────
  {
    keywords: ['street food calories egypt', 'koshari calories', 'ful calories', 'shawarma calories', 'egyptian food calories', 'hawawshi calories'],
    keywordsAr: ['سعرات أكل الشارع', 'سعرات كشري', 'سعرات فول', 'سعرات شاورما', 'سعرات الأكل المصري', 'سعرات حواوشي'],
    keywordsFranco: ['so3rat akl el share3', 'so3rat koshary', 'so3rat fool', 'so3rat shawarma', 'so3rat el akl el masry', 'so3rat 7awawshy'],
    stateId: 'NT_MENU',
    response: { en: 'Egyptian street food calories: Ful plate: ~300-400 cal (great protein!). Koshari (regular): ~600-800 cal. Taameya sandwich: ~350-450 cal. Shawarma sandwich: ~500-700 cal. Hawawshi: ~600-800 cal (high fat). Feteer meshaltet: ~800-1200 cal (fat bomb!). Liver (kebda) sandwich: ~400-500 cal. Grilled kofta plate: ~500-600 cal. Sweet potato (batata): ~200-300 cal. Tirmis (cup): ~150 cal (protein goldmine!). BEST choices: Ful, grilled anything, tirmis, batata. WORST: Feteer, fried taameya, heavy koshari. Egyptian food CAN be healthy — choose wisely!', ar: 'سعرات أكل الشارع المصري: طبق فول: ~300-400 سعرة (بروتين ممتاز!). كشري (عادي): ~600-800 سعرة. سندوتش طعمية: ~350-450 سعرة. سندوتش شاورما: ~500-700 سعرة. حواوشي: ~600-800 سعرة (دهون عالية). فطير مشلتت: ~800-1200 سعرة (قنبلة دهون!). سندوتش كبدة: ~400-500 سعرة. طبق كفتة مشوية: ~500-600 سعرة. بطاطا: ~200-300 سعرة. ترمس (كوباية): ~150 سعرة (منجم بروتين!). أفضل اختيارات: فول، أي حاجة مشوية، ترمس، بطاطا. أسوأ: فطير، طعمية مقلية، كشري تقيل. الأكل المصري ممكن يكون صحي — اختار بذكاء!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v34: Deload Week Guide ────────────────────────────────────
  {
    keywords: ['deload', 'deload week', 'how to deload', 'when to deload', 'recovery week', 'light week', 'should i deload'],
    keywordsAr: ['ديلود', 'أسبوع ديلود', 'ازاي اديلود', 'امتى اديلود', 'أسبوع ريكفري', 'أسبوع خفيف'],
    keywordsFranco: ['deload', 'osbo3 deload', 'ezay adeload', 'emta adeload', 'osbo3 recovery', 'osbo3 5afeef'],
    stateId: 'WK_MENU',
    response: { en: 'Deload guide: WHAT: 1 week of reduced training to recover. WHEN: Every 4-6 weeks, or when: strength plateaus, joint pain, poor sleep, dreading gym. HOW: Option A: Same exercises, 50% weight, same reps. Option B: Same weight, 50% sets. Option C: Completely different light activities (swimming, yoga). WHAT NOT TO DO: Skip gym entirely (active recovery is better), eat at huge deficit (recovery needs fuel). AFTER DELOAD: You should feel refreshed, stronger, and motivated. Think of it like sharpening an axe — you cut MORE wood after. Deloading is NOT weakness!', ar: 'دليل الديلود: إيه: أسبوع تمرين مخفف للريكفري. امتى: كل 4-6 أسابيع، أو لما: القوة تقف، ألم مفاصل، نوم سيئ، مش عايز تتمرن. ازاي: خيار أ: نفس التمارين، 50% وزن، نفس التكرارات. خيار ب: نفس الوزن، 50% سيتات. خيار ج: أنشطة خفيفة مختلفة (سباحة، يوجا). متعملش: تقطع الجيم خالص (ريكفري نشيط أفضل)، تقلل الأكل بزيادة (الريكفري محتاج وقود). بعد الديلود: لازم تحس بانتعاش، قوة، وتحفيز. فكر فيه زي تسنين الفأس — بتقطع خشب أكتر بعدها. الديلود مش ضعف!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v34: Ectomorph / Hard Gainer ──────────────────────────────
  {
    keywords: ['ectomorph', 'hard gainer', 'cant gain weight', 'too skinny', 'fast metabolism', 'how to gain weight', 'skinny guy gym'],
    keywordsAr: ['إكتومورف', 'صعب الزيادة', 'مش قادر ازود وزن', 'نحيف جداً', 'أيض سريع', 'ازاي ازود وزن'],
    keywordsFranco: ['ectomorph', 'sa3b el zyada', 'msh 2ader azawed wazn', 'ne7eef gedan', 'ayd saree3', 'ezay azawed wazn'],
    stateId: 'NT_MENU',
    response: { en: 'Hard gainer guide: TRUTH: You\'re not eating enough. Track calories for 1 week — you\'ll be shocked how little you eat. CALORIE BOOST: 1) Eat 500-700+ cal surplus 2) Eat every 3 hours (5-6 meals) 3) Drink calories (shakes: milk + oats + PB + banana + whey = 700cal) 4) Add olive oil to meals (120cal/tbsp) 5) Nuts as snacks (handful = 200cal). TRAINING: Focus on heavy compounds (squat, bench, deadlift, OHP), 3-4x/week, progressive overload. Don\'t do excessive cardio. Egyptian hack: Koshari + protein shake post-workout = massive calorie boost!', ar: 'دليل صعب الزيادة: الحقيقة: مش بتاكل كفاية. تتبع السعرات أسبوع — هتتفاجئ قد ايه بتاكل قليل. زيادة السعرات: 1) كل فائض 500-700+ سعرة 2) كل كل 3 ساعات (5-6 وجبات) 3) اشرب سعرات (شيك: لبن + شوفان + زبدة فول سوداني + موز + واي = 700 سعرة) 4) ضيف زيت زيتون للأكل (120 سعرة/ملعقة) 5) مكسرات سناك (حفنة = 200 سعرة). التمرين: ركز على المركبات الثقيلة (سكوات، بنش، ديدلفت، OHP)، 3-4 مرات/أسبوع، حمل تصاعدي. متعملش كارديو كتير. ترك مصري: كشري + بروتين شيك بعد التمرين = دفعة سعرات ضخمة!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v34: Gym Time Optimization ────────────────────────────────
  {
    keywords: ['gym time', 'efficient workout', 'fast workout', 'save time gym', 'busy schedule workout', '30 minute workout', 'quick gym session'],
    keywordsAr: ['وقت الجيم', 'تمرين فعال', 'تمرين سريع', 'وفر وقت جيم', 'تمرين جدول مشغول', 'تمرين 30 دقيقة'],
    keywordsFranco: ['wa2t el gym', 'tamreen fa3al', 'tamreen saree3', 'wafar wa2t gym', 'tamreen gadwal mashghool', 'tamreen 30 de2e2a'],
    stateId: 'WK_MENU',
    response: { en: 'Time-efficient gym strategies: 1) SUPERSETS: Pair opposing muscles (chest/back, biceps/triceps) — cut time 30% 2) REST-PAUSE: 1 set to failure, rest 15sec, more reps, rest 15sec, more reps — 3 sets in 1 3) DROP SETS: No rest, just reduce weight 3-4 times 4) COMPOUND FOCUS: Squat, bench, deadlift, OHP = whole body in 4 exercises 5) Timer: 90sec max rest between sets 6) Pre-plan: Write workout before arriving 7) Avoid peak hours (6-8pm). 30 MINUTE WORKOUT: 3 compound exercises, 3x8-10, supersetted = effective full body!', ar: 'استراتيجيات جيم موفرة للوقت: 1) سوبرسيتس: ادمج عضلات متقابلة (صدر/ظهر، باي/تراي) — وفر 30% وقت 2) ريست-بوز: سيت للفشل، راحة 15ث، تكرارات أكتر، راحة 15ث، تكرارات — 3 سيتات في 1 3) دروب سيتس: بدون راحة، قلل الوزن 3-4 مرات 4) تركيز مركبات: سكوات، بنش، ديدلفت، OHP = جسم كامل في 4 تمارين 5) تايمر: 90ث ماكس راحة 6) خطط قبل: اكتب التمرين قبل ما تروح 7) تجنب وقت الزحمة (6-8 مساءً). تمرين 30 دقيقة: 3 تمارين مركبة، 3×8-10، سوبرسيت = فول بادي فعال!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v35: Pre-Workout Meals ─────────────────────────────────
  {
    keywords: ['pre workout meal', 'what to eat before workout', 'eat before gym', 'pre workout food', 'best meal before training', 'fasted training'],
    keywordsAr: ['وجبة قبل التمرين', 'اكل ايه قبل التمرين', 'اكل قبل الجيم', 'أكل قبل التدريب', 'تمرين صايم'],
    keywordsFranco: ['wagba 2abl el tamreen', 'akol eih 2abl el tamreen', 'akl 2abl el gym', 'tamreen sayem'],
    stateId: 'NT_MENU',
    response: { en: 'Pre-workout meals: 2-3 HRS BEFORE (full meal): Chicken + rice + veggies. Oats + eggs + banana. Ful + bread + eggs (Egyptian classic!). 30-60 MIN BEFORE (snack): Banana + PB. Rice cake + honey. Dates + coffee. FASTED TRAINING: OK for fat loss cardio, NOT ideal for strength (you\'ll be weaker). Key nutrients: Carbs (energy) + Protein (muscle protection). Avoid: heavy fats (slow digestion), fiber-heavy foods (stomach issues), spicy food. Coffee 30min before = 5-10% performance boost!', ar: 'وجبات قبل التمرين: 2-3 ساعات قبل (وجبة كاملة): فراخ + رز + خضار. شوفان + بيض + موز. فول + عيش + بيض (كلاسيك مصري!). 30-60 دقيقة قبل (سناك): موز + زبدة فول سوداني. رايس كيك + عسل. بلح + قهوة. تمرين صايم: أوكي لكارديو حرق دهون، مش مثالي للقوة (هتبقى أضعف). مغذيات مهمة: كارب (طاقة) + بروتين (حماية العضل). تجنب: دهون تقيلة (هضم بطيء)، أكل عالي الألياف (مشاكل معدة)، أكل حار. قهوة 30 دقيقة قبل = 5-10% تحسن أداء!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v35: Post-Workout Meals ───────────────────────────────────
  {
    keywords: ['post workout meal', 'what to eat after workout', 'eat after gym', 'post workout food', 'after training meal', 'recovery meal'],
    keywordsAr: ['وجبة بعد التمرين', 'اكل ايه بعد التمرين', 'اكل بعد الجيم', 'وجبة ريكفري'],
    keywordsFranco: ['wagba ba3d el tamreen', 'akol eih ba3d el tamreen', 'akl ba3d el gym', 'wagba recovery'],
    stateId: 'NT_MENU',
    response: { en: 'Post-workout meals: EAT WITHIN 2 HOURS. Ideal ratio: 1:1 to 1:2 protein:carbs. QUICK OPTIONS: Protein shake + banana (fastest). Chicken + rice (classic). Eggs + toast. Greek yogurt + granola + honey. EGYPTIAN: Ful + bread + eggs. Koshary (carb reload!). Grilled chicken shawarma + rice. POST-WORKOUT DON\'Ts: Don\'t skip eating (recovery suffers), don\'t eat only protein (need carbs for glycogen), don\'t fast for hours after. Fat is OK but don\'t overdo it (slows absorption slightly). Your post-workout meal is the MOST important meal of the day!', ar: 'وجبات بعد التمرين: كل خلال ساعتين. النسبة المثالية: 1:1 إلى 1:2 بروتين:كارب. خيارات سريعة: بروتين شيك + موز (أسرع). فراخ + رز (كلاسيك). بيض + توست. زبادي يوناني + جرانولا + عسل. مصري: فول + عيش + بيض. كشري (إعادة تحميل كارب!). شاورما فراخ مشوي + رز. متعملش: تسكب الأكل (الريكفري بيتأثر)، تاكل بروتين بس (محتاج كارب للجلايكوجين)، تصوم ساعات بعد التمرين. الدهون أوكي بس متكترش (بتبطئ الامتصاص شوية). وجبة بعد التمرين أهم وجبة في اليوم!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v35: Cheat Day Strategy ───────────────────────────────────
  {
    keywords: ['cheat day', 'cheat meal', 'refeed day', 'can i eat junk food', 'diet break', 'free meal', 'eat whatever i want'],
    keywordsAr: ['يوم فري', 'وجبة فري', 'يوم ريفيد', 'ممكن اكل جانك', 'استراحة دايت', 'اكل اي حاجة'],
    keywordsFranco: ['yom free', 'wagba free', 'yom refeed', 'momken akol junk', 'estra7et diet', 'akol ay 7aga'],
    stateId: 'NT_MENU',
    response: { en: 'Cheat/refeed strategy: REFEED (better): Planned high-carb day at maintenance or slight surplus. Keeps metabolism up, refills glycogen, psychological break. Do 1x/week during a cut. CHEAT MEAL (not cheat day!): 1 meal where you eat what you want. Don\'t turn it into a 5000 calorie binge. RULES: 1) Earn it (be consistent 6 days) 2) One meal, not one day 3) Still hit protein target 4) Enjoy without guilt 5) Get back on track next meal (not "Monday"). BEST TIMING: After hardest workout of the week. A strategic refeed is a tool, not a failure!', ar: 'استراتيجية الفري/الريفيد: ريفيد (أفضل): يوم كارب عالي مخطط عند الميتننس أو فائض خفيف. بيحافظ على الحرق، بيملأ الجلايكوجين، استراحة نفسية. مرة/أسبوع في التنشيف. وجبة فري (مش يوم فري!): وجبة واحدة تاكل فيها اللي عايزه. متحولهاش لبينج 5000 سعرة. قواعد: 1) استحقها (التزم 6 أيام) 2) وجبة مش يوم 3) حقق هدف البروتين برضو 4) استمتع بدون ذنب 5) ارجع للمسار الوجبة الجاية (مش "الاتنين"). أفضل توقيت: بعد أصعب تمرين في الأسبوع. الريفيد الاستراتيجي أداة مش فشل!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v35: Cutting without Losing Muscle ────────────────────────
  {
    keywords: ['cut without losing muscle', 'preserve muscle cutting', 'lose fat keep muscle', 'cutting tips', 'how to cut properly', 'mini cut'],
    keywordsAr: ['تنشيف بدون خسارة عضل', 'حافظ على العضل تنشيف', 'خسارة دهون بدون عضل', 'نصايح تنشيف', 'ميني كت'],
    keywordsFranco: ['tanshif bdoon 5osaret 3adal', '7afez 3ala el 3adal tanshif', '5osaret dohon bdoon 3adal', 'nasa2e7 tanshif', 'mini cut'],
    stateId: 'NT_MENU',
    response: { en: 'Cutting without losing muscle: 1) Moderate deficit (500 cal max, NOT 1000) 2) HIGH protein (2.3-2.8g/kg — higher than bulking!) 3) Keep lifting heavy (don\'t switch to "light weight high reps" myth) 4) Reduce volume slightly (80% of bulking volume) 5) Prioritize sleep (7-9hrs) 6) Don\'t add excessive cardio (2-3x/week is enough) 7) Slow cut: 0.5-0.7% bodyweight loss per week 8) Refeed 1x/week (high carb day). MINI CUT: Aggressive 3-4 week cut (750 cal deficit) then return to maintenance. Lose 0.5-1kg/week on a proper cut. Muscle loss is minimal if protein is high!', ar: 'تنشيف بدون خسارة عضل: 1) عجز معتدل (500 سعرة ماكس مش 1000) 2) بروتين عالي (2.3-2.8ج/كج — أعلى من التضخيم!) 3) فضل ارفع ثقيل (متحولش ل"وزن خفيف تكرارات عالية" خرافة) 4) قلل الحجم شوية (80% من حجم التضخيم) 5) أولوية النوم (7-9 ساعات) 6) متضيفش كارديو مفرط (2-3 مرات/أسبوع كفاية) 7) تنشيف بطيء: 0.5-0.7% من الوزن/أسبوع 8) ريفيد مرة/أسبوع (يوم كارب عالي). ميني كت: تنشيف عدواني 3-4 أسابيع (750 سعرة عجز) بعدين ارجع ميتننس. خسارة 0.5-1كج/أسبوع في تنشيف صح. خسارة العضل قليلة لو البروتين عالي!' },
    priority: 9,
    domain: 'nutrition',
  },

  // ── v35: Egyptian Gym Slang Dictionary ────────────────────────
  {
    keywords: ['gym slang', 'gym terms', 'gym vocabulary', 'what does pr mean', 'what does rep mean', 'fitness terms', 'bodybuilding terms'],
    keywordsAr: ['مصطلحات جيم', 'كلمات جيم', 'مصطلحات كمال اجسام', 'يعني ايه بي آر', 'يعني ايه ريب'],
    keywordsFranco: ['mostal7at gym', 'kalemat gym', 'mostal7at kamal agsam', 'ya3ny eih PR', 'ya3ny eih rep'],
    stateId: 'QA_MENU',
    response: { en: 'Gym slang dictionary: REP = one repetition. SET = group of reps. PR = Personal Record (best ever). 1RM = 1 Rep Max (heaviest you can lift once). AMRAP = As Many Reps As Possible. SUPERSET = two exercises back to back. DROP SET = reduce weight, continue without rest. RPE = Rate of Perceived Exertion (1-10). RIR = Reps In Reserve. PUMP = blood flow making muscles look bigger. DOMS = Delayed Onset Muscle Soreness. GAINS = muscle growth. CUT = fat loss phase. BULK = muscle building phase. NATTY = natural (no steroids). Egyptian slang: "تحميل" = loading, "تنشيف" = cutting, "تضخيم" = bulking!', ar: 'قاموس مصطلحات الجيم: REP = تكرار واحد. SET = مجموعة تكرارات. PR = رقم شخصي (أفضل أداء). 1RM = أقصى تكرار واحد. AMRAP = أكتر عدد تكرارات ممكنة. SUPERSET = تمرينين ورا بعض. DROP SET = قلل الوزن واستمر بدون راحة. RPE = مقياس الجهد (1-10). RIR = تكرارات متبقية. PUMP = تدفق الدم بيكبر العضلة مؤقتاً. DOMS = ألم العضلات المتأخر. GAINS = نمو عضلي. CUT = مرحلة خسارة دهون. BULK = مرحلة بناء عضل. NATTY = ناتشورال (بدون منشطات). مصطلحات مصرية: تحميل = زيادة الوزن، تنشيف = cutting، تضخيم = bulking!' },
    priority: 7,
    domain: 'root',
  },

  // ── v35: Wrist Pain & Exercises ───────────────────────────────
  {
    keywords: ['wrist pain', 'wrist pain gym', 'wrist pain bench', 'wrist pain push up', 'wrist exercises', 'wrist strengthening', 'carpal tunnel gym'],
    keywordsAr: ['ألم معصم', 'ألم رسغ جيم', 'ألم رسغ بنش', 'ألم رسغ ضغط', 'تمارين معصم', 'تقوية المعصم'],
    keywordsFranco: ['alam me3sam', 'alam rosg gym', 'alam rosg bench', 'alam rosg dagt', 'tamareen me3sam', 'ta2weyet el me3sam'],
    stateId: 'HP_MENU',
    response: { en: 'Wrist pain solutions: BENCH PRESS: Keep wrists straight (not bent back), bar sits on heel of palm, use wrist wraps for heavy sets. PUSH-UPS: Use push-up handles or fists (neutral wrist). CURLS: Don\'t bend wrist excessively at top. STRENGTHENING: Wrist curls (light, 3x20), reverse wrist curls, rice bucket exercises (dig hands in rice bucket). STRETCHES: Prayer stretch, reverse prayer, wrist circles. PREVENTION: Warm up wrists before pressing, avoid excessive wrist flexion under load. If pain persists >2 weeks with swelling, see a doctor — could be a TFCC or tendon issue.', ar: 'حلول ألم المعصم: بنش بريس: خلي المعصم مستقيم (مش مثني لورا)، البار على كعب الكف، استخدم ريست راب للسيتات الثقيلة. ضغط: استخدم مقابض أو القبضة (معصم محايد). كيرلز: متثنيش المعصم بزيادة في القمة. تقوية: ريست كيرل (خفيف، 3×20)، ريفرس ريست كيرل، تمارين دلو الأرز (ادخل إيدك في دلو أرز). استرتش: بريير ستريتش، ريفرس بريير، دوائر معصم. وقاية: سخن المعصم قبل الدفع، تجنب ثني المعصم المفرط تحت حمل. لو الألم مستمر >أسبوعين مع تورم، روح دكتور.' },
    priority: 7,
    domain: 'health',
  },

  // ── v35: Alcohol and Fitness ──────────────────────────────────
  {
    keywords: ['alcohol and gains', 'drinking and muscle', 'beer and gym', 'alcohol calories', 'drinking and fitness', 'alcohol and fat loss', 'can i drink and workout'],
    keywordsAr: ['كحول ومكاسب', 'شرب وعضلات', 'بيرة وجيم', 'سعرات الكحول', 'شرب ولياقة'],
    keywordsFranco: ['ko7ol w makaseb', 'shorb w 3adalat', 'beera w gym', 'so3rat el ko7ol', 'shorb w leya2a'],
    stateId: 'NT_MENU',
    response: { en: 'Alcohol and fitness: THE TRUTH: Alcohol is the 4th macronutrient (7 cal/gram, 0 nutrients). EFFECTS: Reduces protein synthesis by 20-30%, disrupts sleep quality, increases cortisol, dehydrates you, lowers testosterone for 24-72hrs. DAMAGE CONTROL: If you drink: 1) Limit to 1-2 drinks 2) Avoid binge drinking (most damage) 3) Eat protein-rich food before/with 4) Extra water (1 glass per drink) 5) Never train hungover (injury risk). CALORIES: Beer ~150cal, wine ~120cal, spirits ~100cal + mixer. Occasional drinking = minimal impact. Regular = significant gains killer.', ar: 'الكحول واللياقة: الحقيقة: الكحول هو الماكرو الرابع (7 سعرات/جرام، 0 مغذيات). التأثيرات: بيقلل بناء البروتين 20-30%، بيخرب جودة النوم، بيزود الكورتيزول، بيجفف الجسم، بينزل التستوستيرون 24-72 ساعة. تقليل الضرر: لو بتشرب: 1) حدد 1-2 كوب 2) تجنب الإفراط (أكبر ضرر) 3) كل بروتين قبل/مع 4) مية زيادة (كوب لكل كوب كحول) 5) أبداً تتمرن وانت هانج أوفر (خطر إصابة). السعرات: بيرة ~150 سعرة، نبيذ ~120 سعرة. شرب أحياناً = تأثير قليل. منتظم = قاتل مكاسب كبير.' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v36: Fiber & Digestive Health ──────────────────────────
  {
    keywords: ['fiber', 'how much fiber', 'fiber foods', 'high fiber', 'constipation', 'digestion', 'digestive health', 'bloating gym'],
    keywordsAr: ['ألياف', 'كمية الألياف', 'أكل عالي الألياف', 'إمساك', 'هضم', 'صحة الجهاز الهضمي', 'انتفاخ'],
    keywordsFranco: ['alyaf', 'kameyet el alyaf', 'akl 3aly el alyaf', 'emsak', 'hadm', 'entefa5'],
    stateId: 'NT_MENU',
    response: { en: 'Fiber guide: TARGET: 25-35g/day (most people get only 15g!). HIGH FIBER FOODS: Oats (4g/cup), lentils (8g/cup), beans (7g/cup), broccoli (5g/cup), berries (8g/cup), chia seeds (10g/oz), sweet potato (4g/medium). BENEFITS: Better digestion, keeps you full longer (great for cutting), feeds gut bacteria, lowers cholesterol. TOO MUCH TOO FAST = bloating/gas — increase gradually over 2 weeks. Egyptian high-fiber: ful (excellent!), lentil soup, whole wheat bread. Drink MORE water as you increase fiber!', ar: 'دليل الألياف: الهدف: 25-35ج/يوم (أغلب الناس بياخدوا 15ج بس!). أكل عالي الألياف: شوفان (4ج/كوب)، عدس (8ج/كوب)، فول (7ج/كوب)، بروكلي (5ج/كوب)، توت (8ج/كوب)، بذور شيا (10ج/أونصة)، بطاطا (4ج/متوسطة). فوائد: هضم أفضل، بتشبع أكتر (ممتاز للتنشيف)، بتغذي بكتيريا الأمعاء، بتنزل الكوليسترول. كتير بسرعة = انتفاخ/غازات — زود تدريجياً خلال أسبوعين. ألياف مصرية: فول (ممتاز!)، شوربة عدس، عيش بلدي. اشرب مية أكتر لما تزود الألياف!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v36: Vitamin D Deep Dive ──────────────────────────────────
  {
    keywords: ['vitamin d', 'vitamin d deficiency', 'vitamin d dosage', 'sunshine vitamin', 'vitamin d egypt', 'low vitamin d'],
    keywordsAr: ['فيتامين د', 'نقص فيتامين د', 'جرعة فيتامين د', 'فيتامين الشمس', 'فيتامين د مصر'],
    keywordsFranco: ['vitamin d', 'na2s vitamin d', 'gor3et vitamin d', 'vitamin el shams', 'vitamin d masr'],
    stateId: 'HP_MENU',
    response: { en: 'Vitamin D (the gym vitamin): WHY: Boosts testosterone, improves strength, bone health, immune function, mood. DEFICIENCY: Extremely common in Egypt (despite the sun!) because: sunscreen, indoor lifestyle, dark skin needs more. DOSE: 2000-5000 IU daily (get blood test first, ideal level: 40-60 ng/mL). Take with a fatty meal (fat-soluble). FOOD SOURCES: Salmon, eggs, fortified milk — but supplementation is usually needed. Cost: ~50-100 LE/month from Egyptian pharmacies. Get tested: ask for "25-OH Vitamin D" blood test. Most athletes are deficient — and it KILLS performance!', ar: 'فيتامين د (فيتامين الجيم): ليه: بيرفع التستوستيرون، بيحسن القوة، صحة العظام، المناعة، المزاج. النقص: شائع جداً في مصر (رغم الشمس!) بسبب: صن سكرين، حياة داخلية، البشرة الغامقة محتاجة أكتر. الجرعة: 2000-5000 وحدة يومياً (اعمل تحليل الأول، المستوى المثالي: 40-60). خده مع وجبة فيها دهون (قابل للذوبان في الدهون). مصادر أكل: سلمون، بيض، لبن مدعم — بس المكمل عادة لازم. التكلفة: ~50-100 جنيه/شهر من الصيدلية. اتحلل: اطلب تحليل "25-OH Vitamin D". أغلب الرياضيين ناقصين — وبيقتل الأداء!' },
    priority: 8,
    domain: 'health',
  },

  // ── v36: Healthy Fats Guide ───────────────────────────────────
  {
    keywords: ['healthy fats', 'good fats', 'bad fats', 'fat sources', 'omega 3 foods', 'trans fat', 'saturated fat', 'how much fat daily'],
    keywordsAr: ['دهون صحية', 'دهون كويسة', 'دهون سيئة', 'مصادر دهون', 'أوميجا 3', 'دهون متحولة', 'كمية الدهون'],
    keywordsFranco: ['dohon se7eya', 'dohon kwaysa', 'dohon say2a', 'masader dohon', 'omega 3', 'dohon met7awla', 'kameyet el dohon'],
    stateId: 'NT_MENU',
    response: { en: 'Fats guide: HEALTHY (eat daily): Olive oil, avocado, nuts, seeds, fatty fish (omega-3), eggs, dark chocolate. MODERATE: Butter, ghee, coconut oil (saturated — not evil, but limit). AVOID: Trans fats (partially hydrogenated oils), deep fried food, margarine. HOW MUCH: 20-35% of total calories (0.8-1g/kg bodyweight minimum). Fat is ESSENTIAL for: testosterone production, vitamin absorption (A, D, E, K), brain health, joint health. Don\'t go below 50g/day. Egyptian picks: olive oil, tahini, nuts, eggs — all great fat sources!', ar: 'دليل الدهون: صحية (كل يومياً): زيت زيتون، أفوكادو، مكسرات، بذور، سمك دهني (أوميجا-3)، بيض، شوكلاتة غامقة. باعتدال: زبدة، سمنة، زيت جوز هند (مشبعة — مش شريرة بس حدد). تجنب: دهون متحولة (زيوت مهدرجة جزئياً)، مقلي غطس، مارجرين. الكمية: 20-35% من إجمالي السعرات (0.8-1ج/كج حد أدنى). الدهون ضرورية لـ: إنتاج التستوستيرون، امتصاص الفيتامينات (A, D, E, K)، صحة الدماغ، صحة المفاصل. متنزلش تحت 50ج/يوم. اختيارات مصرية: زيت زيتون، طحينة، مكسرات، بيض — كلهم مصادر دهون ممتازة!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v36: Exercise Form Checklist ──────────────────────────────
  {
    keywords: ['exercise form', 'proper form', 'form check', 'form tips', 'common mistakes gym', 'bad form', 'technique tips'],
    keywordsAr: ['فورم التمرين', 'فورم صح', 'شيك فورم', 'نصايح فورم', 'أخطاء شائعة جيم', 'فورم غلط'],
    keywordsFranco: ['form el tamreen', 'form sa7', 'check form', 'nasa2e7 form', 'a5ta2 sha2e3a gym', 'form ghalat'],
    stateId: 'WK_MENU',
    response: { en: 'Form checklist for top exercises: SQUAT: Feet shoulder width, toes slightly out, chest up, brace core, hips back then down, knees track over toes, depth to parallel+. BENCH: Feet flat, arch back, retract scapula, bar path J-curve, touch chest, elbows 45°. DEADLIFT: Bar over mid-foot, grip outside knees, chest up, FLAT back, push floor away, lockout with hips. OHP: Squeeze glutes, brace core, press straight up (head through at top). GENERAL: 1) Film yourself 2) Ego = injury 3) Full ROM always 4) Control the negative 5) Breathe (exhale on exertion).', ar: 'شيك ليست الفورم لأهم التمارين: سكوات: قدم بعرض الكتف، صوابع لبرا شوية، صدر مرفوع، شد الكور، الوسط لورا وتحت، الركبة تتبع الصوابع، عمق لبارالل+. بنش: قدم على الأرض، قوس الظهر، ارجع اللوح، مسار البار J، لمس الصدر، كوع 45°. ديدلفت: البار فوق نص القدم، قبضة برا الركبة، صدر مرفوع، ظهر مستقيم، ادفع الأرض، لوك اوت بالوسط. OHP: اعصر الأرداف، شد الكور، اضغط لفوق مستقيم (الراس يعدي في القمة). عام: 1) صور نفسك 2) التعند = إصابة 3) نطاق حركة كامل 4) تحكم في السلبي 5) اتنفس (زفير مع الجهد).' },
    priority: 9,
    domain: 'workout',
  },

  // ── v36: Gym Motivation Quotes ────────────────────────────────
  {
    keywords: ['motivational quote', 'gym quote', 'inspire me', 'motivation quote', 'fitness quote', 'i need motivation', 'pump me up'],
    keywordsAr: ['اقتباس تحفيزي', 'كلام تحفيز', 'حفزني', 'اقتباس جيم', 'محتاج تحفيز', 'حماسني'],
    keywordsFranco: ['e2tebas ta7feezy', 'kalam ta7feez', '7afezny', 'e2tebas gym', 'me7tag ta7feez', '7amasny'],
    stateId: 'QA_MENU',
    response: { en: 'Gym motivation: "The only bad workout is the one that didn\'t happen." "Your body can stand almost anything — it\'s your mind you have to convince." "Don\'t wish for a good body, work for it." "You don\'t have to be great to start, but you have to start to be great." "The pain you feel today will be the strength you feel tomorrow." "Train insane or remain the same." "Discipline is choosing between what you want NOW and what you want MOST." Now go lift something heavy! 💪 Your future self will thank you.', ar: 'تحفيز الجيم: "أسوأ تمرين هو اللي مش حصل." "جسمك يقدر يتحمل أي حاجة تقريباً — عقلك هو اللي محتاج تقنعه." "متتمناش جسم حلو، اشتغل عليه." "مش لازم تكون عظيم عشان تبدأ، بس لازم تبدأ عشان تبقى عظيم." "الألم اللي بتحسه النهاردا هيبقى القوة اللي هتحسها بكرة." "تمرن بجنون أو فضل زي ما انت." "الانضباط هو الاختيار بين اللي عايزه دلوقتي واللي عايزه أكتر." روح ارفع حاجة تقيلة! مستقبلك هيشكرك.' },
    priority: 6,
    domain: 'root',
  },

  // ── v36: Healthy Eating Out ───────────────────────────────────
  {
    keywords: ['eating out healthy', 'restaurant healthy', 'healthy restaurant choices', 'eating out diet', 'restaurant macros', 'fast food healthy'],
    keywordsAr: ['أكل صحي برا', 'مطعم صحي', 'اختيارات صحية مطعم', 'أكل برا ودايت', 'فاست فود صحي'],
    keywordsFranco: ['akl se7y barra', 'mat3am se7y', 'e5teyarat se7eya mat3am', 'akl barra w diet', 'fast food se7y'],
    stateId: 'NT_MENU',
    response: { en: 'Eating out while dieting: GENERAL RULES: 1) Check menu online before going 2) Grilled > fried always 3) Ask for dressing/sauce on the side 4) Protein first, then veggies, then carbs 5) Share dessert (don\'t skip social life for diet!). FAST FOOD: Grilled chicken sandwich (skip fries), salad with grilled protein. EGYPTIAN RESTAURANTS: Grilled kofta/kebab + salad + minimal bread, fish + rice, chicken shawarma (no fries). WORST: Feteer, pizza, deep fried anything. You can eat at 80% of restaurants and stay on track — it\'s about choices, not avoidance!', ar: 'الأكل برا وانت بتعمل دايت: قواعد عامة: 1) شيك المنيو أونلاين قبل ما تروح 2) مشوي > مقلي دايماً 3) اطلب الصوص على جنب 4) بروتين الأول، بعدين خضار، بعدين كارب 5) شارك الحلو (متلغيش الحياة الاجتماعية عشان الدايت!). فاست فود: سندوتش فراخ مشوي (بلاش بطاطس)، سلطة ببروتين مشوي. مطاعم مصرية: كفتة/كباب مشوي + سلطة + عيش قليل، سمك + رز، شاورما فراخ (بلاش بطاطس). الأسوأ: فطير، بيتزا، أي حاجة مقلية. تقدر تاكل في 80% من المطاعم وتفضل في المسار — الموضوع اختيارات مش تجنب!' },
    priority: 7,
    domain: 'nutrition',
  },

  // ── v36: CrossFit Explained ───────────────────────────────────
  {
    keywords: ['crossfit', 'what is crossfit', 'crossfit workout', 'wod', 'crossfit good or bad', 'crossfit vs gym', 'crossfit exercises'],
    keywordsAr: ['كروس فيت', 'ايه كروس فيت', 'تمرين كروس فيت', 'كروس فيت كويس ولا وحش', 'كروس فيت ولا جيم'],
    keywordsFranco: ['crossfit', 'eih crossfit', 'tamreen crossfit', 'crossfit kwais wala we7esh', 'crossfit wala gym'],
    stateId: 'WK_MENU',
    response: { en: 'CrossFit explained: WHAT: High-intensity functional training combining Olympic lifting, gymnastics, and cardio. GOOD: Community, varied workouts (never boring), great conditioning, builds functional strength. BAD: Injury risk if form suffers for speed, can be expensive, competitive pressure to push too hard. WHO IT\'S FOR: People who like variety, community, and competition. NOT FOR: Bodybuilders focused on aesthetics, those with existing injuries. TYPICAL WOD: "Fran" = 21-15-9 thrusters + pull-ups for time. CrossFit in Egypt is growing — several boxes in Cairo and Alex. Try a free class before committing!', ar: 'كروس فيت شرح: إيه: تمرين وظيفي عالي الشدة بيجمع رفع أولمبي، جمباز، وكارديو. الكويس: مجتمع، تمارين متنوعة (مش مملة أبداً)، كونديشنينج ممتاز، قوة وظيفية. الوحش: خطر إصابة لو الفورم اتأثر بالسرعة، ممكن يكون غالي، ضغط تنافسي. لمين: ناس بتحب التنوع، المجتمع، والمنافسة. مش لـ: لاعبي كمال أجسام بيركزوا على الشكل، اللي عندهم إصابات. WOD نموذجي: "فران" = 21-15-9 ثراسترز + عقلة على الوقت. كروس فيت في مصر بيكبر — بوكسات كتير في القاهرة واسكندرية. جرب كلاس مجاني قبل الالتزام!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v37: Yoga for Lifters ──────────────────────────────────
  {
    keywords: ['yoga for lifters', 'yoga and gym', 'yoga for muscle', 'yoga for flexibility', 'yoga recovery', 'yoga benefits gym'],
    keywordsAr: ['يوجا لرافعي الأثقال', 'يوجا وجيم', 'يوجا للعضلات', 'يوجا للمرونة', 'يوجا للريكفري'],
    keywordsFranco: ['yoga le raf3y el as2al', 'yoga w gym', 'yoga lel 3adalat', 'yoga lel morona', 'yoga lel recovery'],
    stateId: 'WK_MENU',
    response: { en: 'Yoga for lifters: WHY: Improves flexibility (deeper squats, better ROM), reduces injury, aids recovery, improves breathing/bracing. BEST POSES: Downward dog (hamstrings/calves), pigeon (hip opener), child\'s pose (back/lats), cobra (hip flexors), warrior 2 (hip mobility), thread the needle (thoracic rotation). ROUTINE: 15-20min on rest days, or 10min post-workout. Not a replacement for lifting, but an excellent complement. You DON\'T need to be flexible to start yoga — that\'s like saying you\'re too dirty to shower!', ar: 'يوجا لرافعي الأثقال: ليه: بتحسن المرونة (سكوات أعمق، نطاق أفضل)، بتقلل الإصابات، بتساعد الريكفري، بتحسن التنفس/الشد. أفضل أوضاع: داونورد دوج (خلفية/سمانة)، بيجون (فتح الوسط)، تشايلدز بوز (ظهر/لاتس)، كوبرا (هيب فليكسور)، واريور 2 (موبيليتي وسط)، ثريد ذا نيدل (دوران صدري). الروتين: 15-20 دقيقة في أيام الراحة، أو 10 دقايق بعد التمرين. مش بديل للحديد بس مكمل ممتاز. مش محتاج تكون مرن عشان تبدأ يوجا — ده زي ما تقول انت وسخ عشان تستحمى!' },
    priority: 7,
    domain: 'workout',
  },

  // ── v37: Running for Gym-Goers ────────────────────────────────
  {
    keywords: ['running and gym', 'running for lifters', 'should i run', 'running kills gains', 'cardio and muscle', 'couch to 5k', 'how to start running'],
    keywordsAr: ['جري وجيم', 'جري لرافعي الأثقال', 'لازم اجري', 'الجري بيقتل المكاسب', 'كارديو وعضل', 'ازاي ابدأ جري'],
    keywordsFranco: ['gary w gym', 'gary le raf3y el as2al', 'lazem agry', 'el gary bey2tel el makaseb', 'ezay abda2 gary'],
    stateId: 'WK_MENU',
    response: { en: 'Running + lifting guide: MYTH: "Running kills gains" — only if you run marathons or don\'t eat enough. IDEAL: 2-3 runs/week, 20-30min each. Run AFTER lifting or on separate days (never before heavy legs). BEGINNER PLAN: Week 1-2: Walk 5min → jog 1min → walk 1min, repeat 20min. Week 3-4: Jog 3min → walk 1min. Week 5+: Jog 10-15min continuous. TIPS: Good shoes matter (invest 500-800 LE), easy pace (can hold conversation), increase distance 10%/week max. EAT MORE if you add running to compensate for extra burn. Running improves heart health, mental health, and endurance for lifting!', ar: 'دليل الجري + الحديد: خرافة: "الجري بيقتل المكاسب" — بس لو بتجري ماراثونات أو مش بتاكل كفاية. المثالي: 2-3 مرات جري/أسبوع، 20-30 دقيقة. اجري بعد الحديد أو في أيام منفصلة (أبداً قبل يوم رجل ثقيل). خطة مبتدئ: أسبوع 1-2: مشي 5 دقايق → هرولة دقيقة → مشي دقيقة، كرر 20 دقيقة. أسبوع 3-4: هرولة 3 دقايق → مشي دقيقة. أسبوع 5+: هرولة 10-15 دقيقة متواصلة. نصايح: حذاء كويس مهم (500-800 جنيه)، سرعة سهلة (تقدر تتكلم)، زود المسافة 10%/أسبوع ماكس. كل أكتر لو ضيفت جري لتعويض الحرق الإضافي.' },
    priority: 7,
    domain: 'workout',
  },

  // ── v37: Mind-Muscle Connection ────────────────────────────────
  {
    keywords: ['mind muscle connection', 'feel the muscle', 'cant feel the muscle', 'muscle activation', 'focus on muscle', 'squeeze the muscle'],
    keywordsAr: ['تواصل عقلي عضلي', 'حس بالعضلة', 'مش حاسس بالعضلة', 'تفعيل العضلة', 'ركز على العضلة'],
    keywordsFranco: ['tawasol 3a2ly 3adaly', '7es bel 3adala', 'msh 7ases bel 3adala', 'taf3eel el 3adala', 'rakez 3ala el 3adala'],
    stateId: 'WK_MENU',
    response: { en: 'Mind-muscle connection (MMC): SCIENCE: Studies show 12% more muscle activation when you focus on the target muscle. HOW: 1) Slow down the rep (2-3sec negative) 2) Lighter weight with more control 3) Pre-activation: flex the muscle before the set 4) Close your eyes for isolation exercises 5) Touch the muscle between sets 6) Think about SQUEEZING, not just moving weight. WHERE IT MATTERS MOST: Isolation exercises (laterals, curls, flyes). LESS IMPORTANT for: Heavy compounds (just focus on moving the weight). It takes practice — start with bicep curls (easiest to feel) and build from there!', ar: 'التواصل العقلي العضلي (MMC): العلم: دراسات أثبتت 12% تفعيل عضلي أكتر لما تركز على العضلة المستهدفة. ازاي: 1) بطئ التكرار (2-3ث سلبي) 2) وزن أخف بتحكم أكتر 3) تفعيل مسبق: شد العضلة قبل السيت 4) غمض عينيك في تمارين العزل 5) لمس العضلة بين السيتات 6) فكر في العصر مش مجرد تحريك الوزن. أكتر أهمية في: تمارين العزل (لاترالز، كيرلز، فلايز). أقل أهمية في: المركبات الثقيلة (ركز على تحريك الوزن). محتاج تمرين — ابدأ بالبايسبس كيرل (أسهل تحس بيها) واتدرج!' },
    priority: 8,
    domain: 'workout',
  },

  // ── v37: Sodium & Water Retention ─────────────────────────────
  {
    keywords: ['sodium', 'salt and water retention', 'bloated', 'water weight', 'puffy face', 'retaining water', 'how to reduce bloating'],
    keywordsAr: ['صوديوم', 'ملح واحتباس مية', 'منتفخ', 'وزن مية', 'وش منتفخ', 'احتباس مية', 'تقليل الانتفاخ'],
    keywordsFranco: ['sodium', 'mel7 w e7tebas maya', 'montefekh', 'wazn maya', 'wesh montefekh', 'e7tebas maya', 'ta2leel el entefakh'],
    stateId: 'HP_MENU',
    response: { en: 'Sodium & water retention: WHY you retain water: 1) High sodium meal (can add 1-3kg overnight!) 2) Starting creatine 3) Carb loading 4) Menstrual cycle 5) Stress/cortisol 6) Flying/travel. HOW TO REDUCE: 1) Drink MORE water (counterintuitive but works) 2) Potassium-rich foods (banana, potato, spinach) 3) Reduce sodium to ~2300mg/day 4) Sweat (sauna, walking) 5) Time (usually resolves in 2-3 days). IMPORTANT: Water weight is NOT fat. Don\'t panic after a salty meal — your actual body fat didn\'t change. Egyptian food tends to be high sodium — be mindful of added salt.', ar: 'الصوديوم واحتباس المية: ليه بتحتبس مية: 1) وجبة عالية الصوديوم (ممكن تضيف 1-3كج بين يوم وليلة!) 2) بداية الكرياتين 3) تحميل كارب 4) الدورة الشهرية 5) التوتر/الكورتيزول 6) السفر بالطيران. ازاي تقلل: 1) اشرب مية أكتر (عكس المتوقع بس بيشتغل) 2) أكل غني بالبوتاسيوم (موز، بطاطس، سبانخ) 3) قلل الصوديوم لـ~2300مج/يوم 4) تعرق (ساونا، مشي) 5) الوقت (عادة بيتحل في 2-3 أيام). مهم: وزن المية مش دهون. متخضش بعد وجبة مالحة — الدهون الفعلية متغيرتش. الأكل المصري بيبقى عالي الصوديوم — خلي بالك من الملح الزيادة.' },
    priority: 7,
    domain: 'health',
  },

  // ── v37: Bulking Meal Plan ────────────────────────────────────
  {
    keywords: ['bulking meal plan', 'mass building diet', 'weight gain meal plan', '3000 calorie meal plan', 'bulking food', 'clean bulk diet'],
    keywordsAr: ['خطة أكل تضخيم', 'دايت بناء كتلة', 'خطة زيادة وزن', 'خطة 3000 سعرة', 'أكل تضخيم'],
    keywordsFranco: ['5ettet akl tadkheem', 'diet bena2 kotla', '5ettet zyada wazn', '5ettet 3000 so3ra', 'akl tadkheem'],
    stateId: 'NT_MENU',
    response: { en: 'Bulking meal plan (3000 cal): BREAKFAST: 4 eggs + oats 80g + banana + milk (700 cal, 45g P). SNACK: PB sandwich + shake (500 cal, 35g P). LUNCH: Chicken 250g + rice 2 cups + veggies + olive oil (800 cal, 55g P). SNACK: Yogurt + granola + honey + nuts (400 cal, 25g P). DINNER: Beef 200g + pasta + salad (600 cal, 45g P). TOTAL: ~3000 cal, ~205g protein. Egyptian version: Ful + eggs breakfast, koshary + chicken lunch, grilled meat dinner. KEY: Eat consistently (same times daily), never skip meals, keep a food log. If not gaining: add 200 cal/week!', ar: 'خطة تضخيم (3000 سعرة): فطار: 4 بيض + شوفان 80ج + موز + لبن (700 سعرة، 45ج بروتين). سناك: سندوتش زبدة فول سوداني + شيك (500 سعرة، 35ج). غدا: فراخ 250ج + رز كوبين + خضار + زيت زيتون (800 سعرة، 55ج). سناك: زبادي + جرانولا + عسل + مكسرات (400 سعرة، 25ج). عشا: لحمة 200ج + مكرونة + سلطة (600 سعرة، 45ج). الإجمالي: ~3000 سعرة، ~205ج بروتين. النسخة المصرية: فول + بيض فطار، كشري + فراخ غدا، لحمة مشوية عشا. المفتاح: كل بانتظام (نفس الأوقات يومياً)، متعديش وجبات، سجل أكلك. مش بتزود: ضيف 200 سعرة/أسبوع!' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── v37: Training Frequency per Muscle ────────────────────────
  {
    keywords: ['how often train muscle', 'training frequency', 'train muscle twice week', 'once a week enough', 'muscle recovery time', 'how many times train'],
    keywordsAr: ['كام مرة امرن العضلة', 'تكرار التدريب', 'تمرين العضلة مرتين', 'مرة في الأسبوع كفاية', 'وقت ريكفري العضلة'],
    keywordsFranco: ['kam marra amarren el 3adala', 'takrar el tadreeb', 'tamreen el 3adala marteen', 'marra fel osbo3 kefaya'],
    stateId: 'WK_MENU',
    response: { en: 'Training frequency: SCIENCE says 2x/week per muscle is OPTIMAL (vs 1x). WHY: Protein synthesis is elevated 24-48hrs after training — hitting muscle 2x catches 2 growth windows. RECOVERY TIME: Small muscles (biceps, triceps, shoulders): 48-72hrs. Large muscles (legs, back, chest): 72-96hrs. PRACTICAL: Full body 3x/week = each muscle 3x (beginner). Upper/Lower 4x = each muscle 2x (intermediate). PPL 6x = each muscle 2x (advanced). CAN you train daily? Yes, but different muscles each day. More isn\'t always better — recovery matters as much as training!', ar: 'تكرار التدريب: العلم بيقول مرتين/أسبوع لكل عضلة هو الأمثل (مقارنة بمرة). ليه: بناء البروتين مرتفع 24-48 ساعة بعد التمرين — تمرين العضلة مرتين بيمسك نافذتين نمو. وقت الريكفري: عضلات صغيرة (باي، تراي، كتف): 48-72 ساعة. عضلات كبيرة (رجل، ظهر، صدر): 72-96 ساعة. عملياً: فول بادي 3 مرات/أسبوع = كل عضلة 3 مرات (مبتدئ). أب/لو 4 مرات = كل عضلة مرتين (متوسط). PPL 6 مرات = كل عضلة مرتين (متقدم). تقدر تتمرن يومياً؟ أيوا بس عضلات مختلفة. أكتر مش دايماً أفضل — الريكفري مهم زي التمرين!' },
    priority: 8,
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

  // ── Mood Detection ──────────────────────────────────────────
  {
    keywords: ['feeling great', 'feel amazing', 'pumped', 'excited', 'i feel good', 'feeling strong', 'feeling motivated'],
    keywordsAr: ['حاسس اني كويس', 'متحمس', 'جاهز', 'قوي النهارده', 'نشيط'],
    keywordsFranco: ['7ases eny kwais', 'mot7ames', 'gahez', '2awi el naharda'],
    stateId: 'WK_TODAY',
    route: '/workouts',
    response: { en: "Love the energy! Let's channel it into a great workout:", ar: 'حبيت الطاقة دي! يلا نستغلها في تمرين جامد:' },
    priority: 6,
    domain: 'workout',
  },
  {
    keywords: ['feeling down', 'feeling sad', 'depressed', 'not feeling well', 'bad day', 'bad mood', 'upset'],
    keywordsAr: ['حاسس اني مش كويس', 'مكتئب', 'زعلان', 'يوم وحش', 'مضايق'],
    keywordsFranco: ['7ases eny msh kwais', 'za3lan', 'yom we7esh', 'mday2'],
    stateId: 'QA_MENU',
    response: { en: "Sorry to hear that. Exercise is a great mood booster! Even a 15-min walk helps. Or just tell me what you need:", ar: 'سلامتك. التمرين بيحسن المزاج جداً! حتى 15 دقيقة مشي بتفرق. أو قولي محتاج ايه:' },
    priority: 6,
  },
  {
    keywords: ['hungry after workout', 'starving', 'so hungry', 'extremely hungry', 'need food now'],
    keywordsAr: ['جعان جداً', 'مجوع', 'محتاج آكل دلوقتي'],
    keywordsFranco: ['ga3an gdn', 'megawa3', 'me7tag akol delwa2ty'],
    stateId: 'NT_POST_WORKOUT',
    response: { en: "Post-workout hunger is normal! Your body needs fuel to recover. Let's get you fed:", ar: 'الجوع بعد التمرين طبيعي! جسمك محتاج وقود للريكفري. يلا ناكلك:' },
    priority: 8,
    domain: 'nutrition',
  },

  // ── Egyptian Gym Bro Language ───────────────────────────────
  {
    keywords: ['pump', 'getting a pump', 'chasing the pump', 'good pump'],
    keywordsAr: ['بمب', 'الباميب', 'حاسس ببمب'],
    keywordsFranco: ['pump', 'bamb'],
    stateId: 'WK_LOG',
    response: { en: "Great pump! Don't forget to log your workout while the gains are fresh:", ar: 'بمب جامد! متنساش تسجل تمرينك والمكاسب لسه فريش:' },
    priority: 6,
    domain: 'workout',
  },
  {
    keywords: ['what muscle today', 'which muscle', 'what body part', 'what should i train today'],
    keywordsAr: ['امرن ايه النهارده', 'ايه العضلة', 'ايه الجزء'],
    keywordsFranco: ['amaren eh el naharda', 'eh el 3adala'],
    stateId: 'WK_TODAY',
    route: '/workouts',
    response: { en: "Let me check your program for today's muscle group:", ar: 'هشوفلك البرنامج عضلة ايه النهارده:' },
    priority: 8,
    domain: 'workout',
  },
  {
    keywords: ['how much should i lift', 'what weight', 'how heavy', 'right weight for me'],
    keywordsAr: ['ارفع كام', 'الوزن المناسب', 'كام كيلو ارفع'],
    keywordsFranco: ['arfa3 kam', 'el wazn el monaseb'],
    stateId: 'WK_MENU',
    response: { en: 'Choose a weight where the last 2-3 reps are challenging but form stays clean. If you can do 15+ reps easily, go heavier. If form breaks at rep 5, go lighter.', ar: 'اختار وزن آخر 2-3 تكرارات يبقوا صعبين بس الفورم تمام. لو بتعمل 15+ بسهولة، زود. لو الفورم بيبوظ عند 5، خفف.' },
    priority: 7,
    domain: 'workout',
  },
  {
    keywords: ['flex', 'show muscles', 'look jacked', 'mirror selfie', 'progress photo', 'progress pic'],
    keywordsAr: ['فليكس', 'صورة تقدم', 'صورة بروجرس'],
    keywordsFranco: ['flex', 'soret ta2adom', 'progress pic'],
    stateId: 'PR_MENU',
    response: { en: "Progress photos are great motivation! Take one monthly, same lighting, same pose. Let's track your progress:", ar: 'صور التقدم بتحفز جداً! خد صورة كل شهر، نفس الإضاءة، نفس الوضع. يلا نتابع تقدمك:' },
    priority: 6,
    domain: 'progress',
  },
  {
    keywords: ['ego lifting', 'ego lift', 'too heavy', 'form broke', 'bad form'],
    keywordsAr: ['ايجو ليفت', 'فورم وحش', 'وزن تقيل أوي'],
    keywordsFranco: ['ego lift', 'form we7esh', 'wazn te2il awy'],
    stateId: 'WK_FORM_MENU',
    response: { en: "Leave the ego at the door! Lower the weight 10-20%, nail the form, and you'll grow faster. Form > weight always.", ar: 'سيب الإيجو برا الجيم! خفف 10-20%، ظبط الفورم، وهتكبر أسرع. الفورم أهم من الوزن دايماً.' },
    priority: 8,
    domain: 'workout',
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
 * Normalize Arabic text — handle common spelling variations:
 * ة↔ه at end, ى↔ي, أ↔ا↔إ, etc.
 */
function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')   // all hamza forms → bare alef
    .replace(/ة$/g, 'ه')       // taa marbuta → ha at end
    .replace(/ة\s/g, 'ه ')     // taa marbuta before space → ha
    .replace(/ى$/g, 'ي')       // alef maqsura → ya at end
    .replace(/ؤ/g, 'و')        // waw hamza → waw
    .replace(/ئ/g, 'ي');        // ya hamza → ya
}

/**
 * Implicit context: when user types just a number in a domain, infer the intent.
 * "85" in health/progress → log weight 85 kg
 * "500" in nutrition → log 500 ml water
 * "300" in nutrition → look up 300 calorie meal
 */
function handleImplicitNumber(text: string, currentDomain: string): IntentMatch | null {
  const numOnly = text.match(/^\d+(?:\.\d+)?$/);
  if (!numOnly) return null;
  const num = parseFloat(numOnly[0]);

  if ((currentDomain === 'health' || currentDomain === 'progress') && num >= 30 && num <= 300) {
    return {
      stateId: 'PR_LOG_WEIGHT',
      confidence: 0.8,
      response: { en: `Logging your weight: ${num} kg`, ar: `بسجل وزنك: ${num} كيلو` },
      extractedParams: { weight: String(num) },
    };
  }
  if (currentDomain === 'nutrition' && num >= 100 && num <= 3000) {
    // Could be water (100-1000 ml) or calories
    if (num <= 1000) {
      return {
        stateId: 'NT_LOG_WATER',
        confidence: 0.7,
        response: { en: `Logging ${num} ml of water`, ar: `بسجل ${num} مل مية` },
        extractedParams: { water_ml: String(num) },
      };
    }
  }
  return null;
}

/**
 * Smart meal type from time of day — used when logging meals.
 */
export function getDefaultMealType(): 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'BREAKFAST';
  if (hour >= 11 && hour < 16) return 'LUNCH';
  if (hour >= 16 && hour < 21) return 'DINNER';
  return 'SNACK';
}

/**
 * Time-relative context responses
 */
function handleTimeQuery(text: string, isCurrentlyAr: boolean): IntentMatch | null {
  const lower = text.toLowerCase();
  const hour = new Date().getHours();

  // "is it too late to train"
  if (lower.match(/too late.*(?:train|workout|exercise|gym)/) || lower.match(/(?:اتمرن|تمرين).*متأخر/) || lower.match(/late.*(?:at2amen|tamreen)/)) {
    if (hour >= 22 || hour < 5) {
      return {
        stateId: 'WK_MENU',
        confidence: 0.8,
        response: { en: "It's pretty late. A light session is fine, but intense workouts may affect sleep. Try stretching or yoga instead.", ar: 'الوقت متأخر شوية. تمرين خفيف ماشي، بس تمرين جامد ممكن يأثر على النوم. جرب استرتش أو يوجا.' },
      };
    }
    return {
      stateId: 'WK_TODAY',
      confidence: 0.8,
      action: { type: 'navigate' as const, route: '/workouts' },
      response: { en: "Not at all! You still have time for a great workout. Let's go:", ar: 'لأ خالص! لسه عندك وقت لتمرين جامد. يلا:' },
    };
  }

  // "when should I eat" / "what time"
  if (lower.match(/when.*eat|what time.*eat|امتى.*آكل|وقت الأكل/) || lower.match(/emta.*akol/)) {
    const meals = [];
    if (hour < 10) meals.push(isCurrentlyAr ? 'فطار دلوقتي' : 'Breakfast now');
    else if (hour < 14) meals.push(isCurrentlyAr ? 'غدا دلوقتي' : 'Lunch now');
    else if (hour < 18) meals.push(isCurrentlyAr ? 'سناك خفيف' : 'Light snack');
    else meals.push(isCurrentlyAr ? 'عشا خفيف' : 'Light dinner');

    return {
      stateId: 'NT_SUGGEST',
      confidence: 0.75,
      response: { en: `Based on the time: ${meals[0]}. Space meals 3-4 hours apart. Pre-workout: eat 1-2h before training.`, ar: `بناءً على الوقت: ${meals[0]}. باعد بين الوجبات 3-4 ساعات. قبل التمرين: كل قبلها بساعة-ساعتين.` },
    };
  }

  return null;
}

/**
 * Match user text to the best intent.
 * Context-aware: boosts matches relevant to the current domain.
 * Returns null if no confident match found.
 */
export function matchIntent(text: string, currentStateId: string): IntentMatch | null {
  let normalized = text.toLowerCase().trim();
  if (normalized.length < 2) return null;

  // Pipeline: typos → synonyms → Arabic normalize → noise strip → stem
  normalized = fixTypos(normalized);
  normalized = expandSynonyms(normalized);
  normalized = normalizeArabic(normalized);
  const stripped = stripNoise(normalized); // "show me chest exercises" → "chest exercises"

  // Also create a stemmed version for fallback matching
  const stemmed = stemText(normalized);
  const stemmedStripped = stemText(stripped);

  // Extract numbers/units from text
  const extractedParams = extractNumbers(normalized);

  // ── Follow-up / pronoun resolution: "what about back?", "show me more"
  const followUpResult = resolveFollowUp(normalized, currentStateId);
  if (followUpResult) {
    if (followUpResult.stateId !== 'ROOT') {
      const domain = getDomainFromState(followUpResult.stateId);
      trackDomain(domain);
      trackIntent(followUpResult.stateId, domain, [stripped]);
    }
    return followUpResult;
  }

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

  // ── Implicit number in context: bare "85" in health domain → log weight
  const currentDomain = getDomainFromState(currentStateId);
  const implicitResult = handleImplicitNumber(stripped, currentDomain);
  if (implicitResult) return implicitResult;

  // ── Time-relative queries: "is it too late to train", "when should I eat"
  const timeResult = handleTimeQuery(normalized, /[\u0600-\u06FF]/.test(text));
  if (timeResult) return timeResult;

  // ── Food comparison: "chicken vs beef", "rice or pasta"
  const foodComp = detectFoodComparison(stripped);
  if (foodComp) {
    return {
      stateId: 'NT_SEARCH',
      confidence: 0.85,
      action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(foodComp.food1)}` },
      response: {
        en: `Comparing ${foodComp.food1} vs ${foodComp.food2} — both are good options! Let me show the nutritional breakdown:`,
        ar: `مقارنة ${foodComp.food1} مع ${foodComp.food2} — الاتنين خيارات كويسة! خليني أوريك التفاصيل الغذائية:`,
      },
    };
  }

  // ── Meal quality assessment: "is rice and chicken a good meal"
  if (detectMealQualityQuery(stripped)) {
    const foods = detectMultipleFoods(stripped);
    const foodList = foods.length > 0 ? foods.join(', ') : 'your meal';
    return {
      stateId: 'NT_CALC',
      confidence: 0.75,
      response: {
        en: `Let me evaluate ${foodList}. A balanced meal should have: protein (30%), carbs (40%), fats (30%), plus vegetables. Let me check:`,
        ar: `خليني أقيّم ${foodList}. الوجبة المتوازنة لازم فيها: بروتين (30%)، كارب (40%)، دهون (30%)، وخضار. هشوفلك:`,
      },
    };
  }

  // ── Multi-food meal detection: "I ate rice and chicken and salad"
  const multiFoods = detectMultipleFoods(stripped);
  if (multiFoods.length >= 2 && !extractedParams.weight && !extractedParams.water_ml) {
    const foodList = multiFoods.join(', ');
    return {
      stateId: 'NT_LOG_MEAL',
      confidence: 0.8,
      action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(multiFoods[0])}` },
      response: { en: `Got it! Logging: ${foodList}. Let me find the nutritional info:`, ar: `تمام! بسجل: ${foodList}. هجبلك المعلومات الغذائية:` },
      extractedParams: { foods: multiFoods.join(',') },
    };
  }

  // ── Exercise alternative detection: "easier than deadlift", "can't do pull ups"
  const altQuery = detectExerciseAlternative(stripped);
  if (altQuery) {
    const typeLabel = altQuery.type === 'easier' ? 'easier alternatives' : altQuery.type === 'harder' ? 'advanced variations' : 'alternatives';
    const typeLabelAr = altQuery.type === 'easier' ? 'بدائل أسهل' : altQuery.type === 'harder' ? 'تمارين أصعب' : 'بدائل';
    return {
      stateId: 'WK_FIND',
      confidence: 0.8,
      action: { type: 'navigate', route: `/exercises?search=${encodeURIComponent(altQuery.exercise)}` },
      response: { en: `Finding ${typeLabel} for ${altQuery.exercise}:`, ar: `بدور على ${typeLabelAr} لـ ${altQuery.exercise}:` },
    };
  }

  // ── Cooking method comparison: "grilled vs fried chicken"
  const cookQuery = detectCookingMethodQuery(stripped);
  if (cookQuery) {
    const foodName = cookQuery.food || 'food';
    if (cookQuery.method2) {
      return {
        stateId: 'NT_SEARCH',
        confidence: 0.8,
        action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(cookQuery.method1 + ' ' + foodName)}` },
        response: {
          en: `${cookQuery.method1} is almost always lower calorie than ${cookQuery.method2}. Grilled/baked > fried. Let me show the numbers:`,
          ar: `${cookQuery.method1} تقريباً دايماً سعرات أقل من ${cookQuery.method2}. مشوي/في الفرن > مقلي. خليني اوريك الأرقام:`,
        },
      };
    }
    return {
      stateId: 'NT_SEARCH',
      confidence: 0.75,
      action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(cookQuery.method1 + ' ' + foodName)}` },
      response: { en: `Looking up ${cookQuery.method1} ${foodName}:`, ar: `بدور على ${foodName} ${cookQuery.method1}:` },
    };
  }

  // ── Portion-aware food parsing: "3 eggs", "200g chicken"
  const portionQuery = parseFoodPortion(stripped);
  if (portionQuery && !extractedParams.weight && !extractedParams.water_ml) {
    const unitStr = portionQuery.unit ? ` ${portionQuery.unit}` : '';
    const qtyStr = portionQuery.quantity || '';
    return {
      stateId: 'NT_LOG_MEAL',
      confidence: 0.8,
      action: { type: 'navigate', route: `/nutrition?search=${encodeURIComponent(portionQuery.food)}` },
      response: { en: `Got it! ${qtyStr}${unitStr} ${portionQuery.food} — let me log that:`, ar: `تمام! ${qtyStr}${unitStr} ${portionQuery.food} — هسجلها:` },
      extractedParams: { food: portionQuery.food, quantity: qtyStr, unit: portionQuery.unit || '' },
    };
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

  // Track domain + intent for multi-turn context
  if (bestMatch.rule.domain) trackDomain(bestMatch.rule.domain);
  trackIntent(bestMatch.rule.stateId, bestMatch.rule.domain || 'root', bestMatch.rule.keywords.slice(0, 3));

  // Generate contextual tips based on the matched intent
  const tip = generateTip(bestMatch.rule.stateId, bestMatch.rule.domain);

  return {
    stateId: bestMatch.rule.stateId,
    confidence,
    action: bestMatch.rule.route ? { type: 'navigate', route: bestMatch.rule.route } : undefined,
    response,
    extractedParams: Object.keys(extractedParams).length > 0 ? extractedParams : undefined,
    tip,
  };
}

// ─── Contextual Tips ──────────────────────────────────────────
// Adds a subtle educational tip based on matched intent domain + time
function generateTip(stateId: string, domain?: string): { en: string; ar: string } | undefined {
  const hour = new Date().getHours();

  // Only show tips 30% of the time to not be annoying
  if (Math.random() > 0.3) return undefined;

  const tips: Array<{ condition: () => boolean; tip: { en: string; ar: string } }> = [
    { condition: () => domain === 'workout' && hour >= 5 && hour < 10,
      tip: { en: 'Tip: Morning workouts boost metabolism for the entire day!', ar: 'نصيحة: تمارين الصبح بترفع الحرق طول اليوم!' } },
    { condition: () => domain === 'workout' && hour >= 21,
      tip: { en: 'Tip: Finish intense workouts 2+ hours before bed for better sleep.', ar: 'نصيحة: خلص التمرين الجامد قبل النوم بساعتين على الأقل.' } },
    { condition: () => domain === 'nutrition' && stateId.includes('LOG'),
      tip: { en: 'Tip: Consistent tracking is more important than perfect accuracy.', ar: 'نصيحة: الانتظام في التسجيل أهم من الدقة المطلقة.' } },
    { condition: () => domain === 'nutrition' && stateId.includes('PROTEIN'),
      tip: { en: 'Tip: Spread protein across 4-5 meals for optimal absorption (30-40g each).', ar: 'نصيحة: وزع البروتين على 4-5 وجبات للامتصاص الأمثل (30-40 جرام كل وجبة).' } },
    { condition: () => stateId === 'PR_LOG_WEIGHT',
      tip: { en: 'Tip: Weigh yourself at the same time each day (morning, empty stomach) for consistency.', ar: 'نصيحة: اوزن نفسك نفس الوقت كل يوم (الصبح، بطن فاضية) للدقة.' } },
    { condition: () => domain === 'recovery',
      tip: { en: 'Tip: Sleep 7-9 hours. It\'s when your muscles actually grow!', ar: 'نصيحة: نام 7-9 ساعات. ده الوقت اللي العضلات بتكبر فيه فعلاً!' } },
    { condition: () => stateId.includes('WATER'),
      tip: { en: 'Tip: Drink 500ml water first thing in the morning to kickstart hydration.', ar: 'نصيحة: اشرب 500مل مية أول ما تصحى علشان تبدأ الترطيب.' } },
    { condition: () => domain === 'supplements',
      tip: { en: 'Tip: Supplements support a good diet — they don\'t replace it.', ar: 'نصيحة: المكملات بتدعم الأكل الكويس — مش بتبدله.' } },
    { condition: () => domain === 'nutrition' && stateId.includes('SUGGEST'),
      tip: { en: 'Tip: Eat the rainbow — different colored foods provide different micronutrients.', ar: 'نصيحة: كل ألوان مختلفة — كل لون فيه فيتامينات مختلفة.' } },
    { condition: () => domain === 'nutrition' && stateId.includes('EGYPTIAN'),
      tip: { en: 'Tip: Egyptian foul (ful) has ~13g protein per cup — great cheap protein source!', ar: 'نصيحة: الفول فيه ~13 جرام بروتين في الكوب — مصدر بروتين رخيص وممتاز!' } },
    { condition: () => domain === 'workout' && stateId.includes('FIND'),
      tip: { en: 'Tip: Compound exercises give you more bang for your buck — squats, deadlifts, bench, rows.', ar: 'نصيحة: التمارين المركبة بتشتغل على عضلات أكتر — سكوات، ديدلفت، بنش، رو.' } },
    { condition: () => domain === 'workout' && stateId.includes('FORM'),
      tip: { en: 'Tip: Film yourself from the side to check your form. Small fixes = big gains.', ar: 'نصيحة: صوّر نفسك من الجنب وشيك على الفورم. تعديلات صغيرة = مكاسب كبيرة.' } },
    { condition: () => stateId.includes('MEAL') || stateId.includes('FOOD'),
      tip: { en: 'Tip: Chewing slowly helps digestion and makes you feel fuller with less food.', ar: 'نصيحة: المضغ ببطء بيساعد في الهضم وبيخليك تشبع من أكل أقل.' } },
  ];

  const matching = tips.filter(t => t.condition());
  if (matching.length === 0) return undefined;
  return matching[Math.floor(Math.random() * matching.length)].tip;
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

/**
 * "Did you mean?" — Levenshtein-based fuzzy suggestions when matchIntent returns null.
 * Returns top 2-3 closest keyword matches across all rules.
 */
export function getDidYouMean(text: string, limit = 2): Array<{ label: string; labelAr: string; stateId: string }> {
  const normalized = fixTypos(text.toLowerCase().trim());
  if (normalized.length < 3) return [];

  const words = normalized.split(/\s+/);

  // Simple Levenshtein distance (max check length 20 to avoid perf issues)
  function levenshtein(a: string, b: string): number {
    if (a.length > 20 || b.length > 20) return 999;
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
    }
    return dp[m][n];
  }

  const candidates: Array<{ label: string; labelAr: string; stateId: string; dist: number }> = [];
  const seen = new Set<string>();

  for (const rule of INTENT_RULES) {
    if (!rule.response || seen.has(rule.stateId)) continue;

    let bestDist = 999;
    for (const kw of rule.keywords) {
      const kwLower = kw.toLowerCase();
      // Check each word against each keyword word
      for (const w of words) {
        if (w.length >= 3) {
          const kwWords = kwLower.split(/\s+/);
          for (const kww of kwWords) {
            if (kww.length >= 3) {
              const d = levenshtein(w, kww);
              bestDist = Math.min(bestDist, d);
            }
          }
        }
      }
      // Also check full phrase distance for short inputs
      if (normalized.length <= 15 && kwLower.length <= 15) {
        bestDist = Math.min(bestDist, levenshtein(normalized, kwLower));
      }
    }

    // Only suggest if edit distance is small enough (max 2 for short words, 3 for longer)
    const threshold = normalized.length <= 5 ? 2 : 3;
    if (bestDist <= threshold) {
      seen.add(rule.stateId);
      candidates.push({
        label: rule.response.en.replace(/[.!:]$/, ''),
        labelAr: rule.response.ar.replace(/[.!:]$/, ''),
        stateId: rule.stateId,
        dist: bestDist,
      });
    }
  }

  return candidates
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(({ label, labelAr, stateId }) => ({ label, labelAr, stateId }));
}
