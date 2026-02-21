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

  // ── Conversational Workout Intents ─────────────────────
  {
    keywords: ['skip workout', 'don\'t want to train', 'skip today', 'rest day', 'take a break', 'no workout'],
    keywordsAr: ['اسكب التمرين', 'مش عايز اتمرن', 'يوم راحة', 'مش هتمرن'],
    stateId: 'WK_SKIP_REASON',
    response: { en: 'No worries! What\'s the reason for skipping today?', ar: 'مفيش مشكلة! ايه السبب اللي خلاك تسكب النهارده؟' },
    priority: 8,
  },
  {
    keywords: ['i\'m tired', 'tired', 'exhausted', 'no energy', 'fatigue'],
    keywordsAr: ['تعبان', 'مرهق', 'مفيش طاقة'],
    stateId: 'WK_SKIP_TIRED',
    response: { en: 'I understand you\'re tired. Let me suggest what to do:', ar: 'فاهم انك تعبان. خليني اقترحلك حاجة:' },
    priority: 8,
  },
  {
    keywords: ['i\'m injured', 'injury', 'hurt', 'pain', 'sore'],
    keywordsAr: ['متأذي', 'إصابة', 'بوجعني', 'ألم'],
    stateId: 'WK_SKIP_INJURY',
    response: { en: 'Sorry to hear that. Let\'s handle this carefully:', ar: 'سلامتك! خليني اساعدك:' },
    priority: 9,
  },
  {
    keywords: ['warm up', 'warmup', 'pre workout', 'before workout'],
    keywordsAr: ['تسخين', 'ورم اب', 'قبل التمرين'],
    stateId: 'WK_PRE',
    response: { en: 'Let\'s get you warmed up properly!', ar: 'يلا نسخن كويس!' },
    priority: 8,
  },
  {
    keywords: ['cool down', 'cooldown', 'stretch', 'after workout', 'post workout'],
    keywordsAr: ['تبريد', 'كول داون', 'استرتش', 'بعد التمرين'],
    stateId: 'WK_POST',
    response: { en: 'Time to cool down!', ar: 'وقت التبريد!' },
    priority: 8,
  },
  {
    keywords: ['swap exercise', 'change exercise', 'replace exercise', 'different exercise'],
    keywordsAr: ['غير التمرين', 'بدل التمرين', 'تمرين تاني'],
    stateId: 'WK_CHANGE',
    response: { en: 'Let\'s swap out an exercise:', ar: 'يلا نبدل التمرين:' },
    priority: 8,
  },
  {
    keywords: ['rate workout', 'how was workout', 'workout feedback'],
    keywordsAr: ['قيم التمرين', 'التمرين كان ايه'],
    stateId: 'WK_RATE',
    response: { en: 'How was your workout?', ar: 'التمرين كان ايه النهارده؟' },
    priority: 7,
  },
  {
    keywords: ['crossfit', 'wod', 'amrap', 'emom', 'for time'],
    keywordsAr: ['كروسفت', 'كروس فت'],
    stateId: 'WK_CROSSFIT',
    response: { en: 'CrossFit options:', ar: 'خيارات الكروسفت:' },
    priority: 8,
  },
  {
    keywords: ['form check', 'proper form', 'technique', 'how to do', 'correct form'],
    keywordsAr: ['الفورم', 'الطريقة الصح', 'تكنيك', 'ازاي اعمل'],
    stateId: 'WK_FORM_MENU',
    response: { en: 'Let\'s check your form:', ar: 'يلا نشوف الفورم:' },
    priority: 8,
  },

  // ── Conversational Nutrition Intents ──────────────────
  {
    keywords: ['what should i eat', 'hungry', 'meal suggestion', 'suggest meal', 'what to eat'],
    keywordsAr: ['آكل ايه', 'جعان', 'اقترح أكل', 'اقتراح وجبة'],
    stateId: 'NT_SUGGEST',
    response: { en: 'Let me suggest something for you:', ar: 'خليني اقترحلك حاجة:' },
    priority: 9,
  },
  {
    keywords: ['high protein food', 'protein rich', 'protein foods', 'high protein meals'],
    keywordsAr: ['أكل بروتين عالي', 'أكل فيه بروتين', 'بروتين عالي'],
    stateId: 'NT_HIGH_PROTEIN',
    response: { en: 'Here are high-protein options:', ar: 'دي أكلات بروتين عالي:' },
    priority: 8,
  },
  {
    keywords: ['low calorie', 'diet food', 'low cal', 'light food', 'healthy food'],
    keywordsAr: ['سعرات قليلة', 'أكل دايت', 'أكل خفيف', 'أكل صحي'],
    stateId: 'NT_LOW_CAL',
    response: { en: 'Here are low-calorie options:', ar: 'دي أكلات سعرات قليلة:' },
    priority: 8,
  },
  {
    keywords: ['egyptian food', 'local food', 'egyptian meals', 'baladi'],
    keywordsAr: ['أكل مصري', 'أكل بلدي', 'وجبات مصرية'],
    stateId: 'NT_EGYPTIAN',
    response: { en: 'Here\'s Egyptian food options:', ar: 'دي أكلات مصرية:' },
    priority: 8,
  },
  {
    keywords: ['pre workout meal', 'eat before workout', 'before gym'],
    keywordsAr: ['أكل قبل التمرين', 'قبل الجيم'],
    stateId: 'NT_PRE_WORKOUT',
    response: { en: 'Pre-workout nutrition:', ar: 'أكل قبل التمرين:' },
    priority: 8,
  },
  {
    keywords: ['post workout meal', 'eat after workout', 'after gym', 'recovery meal'],
    keywordsAr: ['أكل بعد التمرين', 'بعد الجيم'],
    stateId: 'NT_POST_WORKOUT',
    response: { en: 'Post-workout nutrition:', ar: 'أكل بعد التمرين:' },
    priority: 8,
  },
  {
    keywords: ['calculate calories', 'how many calories', 'calorie calculator', 'tdee', 'bmr'],
    keywordsAr: ['حساب السعرات', 'كام سعر', 'حاسبة السعرات'],
    stateId: 'NT_CALC',
    response: { en: 'Let\'s calculate your calories:', ar: 'يلا نحسب سعراتك:' },
    priority: 8,
  },
  {
    keywords: ['quick meals', 'fast food', 'quick food', 'easy meal', '5 minute meal'],
    keywordsAr: ['أكل سريع', 'وجبة سريعة', 'أكل سهل'],
    stateId: 'NT_QUICK_MEALS',
    response: { en: 'Quick meal ideas:', ar: 'أفكار وجبات سريعة:' },
    priority: 7,
  },
  {
    keywords: ['food alternatives', 'substitute', 'swap food', 'instead of', 'healthy alternative'],
    keywordsAr: ['بدائل', 'بديل', 'بدل', 'بديل صحي'],
    stateId: 'NT_ALTERNATIVES',
    response: { en: 'Let me find healthier alternatives:', ar: 'خليني اجبلك بدائل صحية:' },
    priority: 7,
  },

  // ── Health Conversational ─────────────────────────────
  {
    keywords: ['how much sleep', 'sleep tracker', 'sleep quality', 'last night sleep', 'insomnia'],
    keywordsAr: ['النوم', 'نمت كام ساعة', 'جودة النوم', 'أرق'],
    stateId: 'HL_MENU',
    response: { en: 'Let me check your sleep data:', ar: 'هشوفلك بيانات النوم:' },
    priority: 8,
  },
  {
    keywords: ['body fat', 'bmi', 'body composition', 'inbody', 'dexa'],
    keywordsAr: ['نسبة الدهون', 'انبودي', 'تكوين الجسم'],
    stateId: 'HL_MENU',
    response: { en: 'Body composition analysis:', ar: 'تحليل تكوين الجسم:' },
    priority: 8,
  },
  {
    keywords: ['how am i recovering', 'recovery status', 'am i recovered', 'can i train'],
    keywordsAr: ['حالة الريكفري', 'اتعافيت', 'أقدر اتمرن'],
    stateId: 'RC_MENU',
    response: { en: 'Let me check your recovery status:', ar: 'هشوفلك حالة الريكفري:' },
    priority: 8,
  },

  // ── Weight & Progress Conversational ──────────────────
  {
    keywords: ['i weigh', 'my weight is', 'current weight', 'weight update'],
    keywordsAr: ['وزني', 'وزني النهارده', 'وزني دلوقتي'],
    stateId: 'PR_LOG_WEIGHT',
    response: { en: 'Let\'s record your weight:', ar: 'يلا نسجل وزنك:' },
    priority: 9,
  },
  {
    keywords: ['weight loss', 'lose weight', 'fat loss', 'cut', 'cutting', 'slim down'],
    keywordsAr: ['خسارة وزن', 'تنشيف', 'كت', 'نزل وزن'],
    stateId: 'PR_MENU',
    response: { en: 'Let\'s work on your weight loss goals:', ar: 'يلا نشتغل على هدف خسارة الوزن:' },
    priority: 7,
  },
  {
    keywords: ['gain weight', 'bulk', 'bulking', 'mass', 'gain muscle', 'build muscle'],
    keywordsAr: ['زيادة وزن', 'بلك', 'تضخيم', 'بناء عضل'],
    stateId: 'PR_MENU',
    response: { en: 'Let\'s work on building muscle:', ar: 'يلا نشتغل على بناء العضل:' },
    priority: 7,
  },

  // ── Navigation Shortcuts ──────────────────────────────
  {
    keywords: ['go to dashboard', 'home page', 'main page', 'dashboard'],
    keywordsAr: ['الصفحة الرئيسية', 'الداشبورد', 'الهوم'],
    stateId: 'ROOT',
    route: '/dashboard',
    response: { en: 'Taking you to the dashboard...', ar: 'بوديك على الصفحة الرئيسية...' },
    priority: 6,
  },
  {
    keywords: ['go to exercises', 'browse exercises', 'exercise library', 'find exercise'],
    keywordsAr: ['مكتبة التمارين', 'تصفح التمارين', 'دور على تمرين'],
    stateId: 'WK_FIND',
    route: '/exercises',
    response: { en: 'Opening exercise library...', ar: 'بفتحلك مكتبة التمارين...' },
    priority: 7,
  },
  {
    keywords: ['go to nutrition', 'nutrition page', 'food tracker', 'meal tracker'],
    keywordsAr: ['صفحة التغذية', 'متابعة الأكل'],
    stateId: 'NT_MENU',
    route: '/nutrition',
    response: { en: 'Opening nutrition tracker...', ar: 'بفتحلك متابعة التغذية...' },
    priority: 6,
  },
  {
    keywords: ['go to profile', 'my account', 'account settings', 'view profile'],
    keywordsAr: ['بروفايلي', 'حسابي', 'اعدادات الحساب'],
    stateId: 'ST_PROFILE',
    route: '/profile',
    response: { en: 'Opening your profile...', ar: 'بفتحلك البروفايل...' },
    priority: 6,
  },

  // ── Egyptian Slang & Casual ───────────────────────────
  {
    keywords: ['what now', 'what should i do', 'what next', 'bored'],
    keywordsAr: ['اعمل ايه', 'ايه دلوقتي', 'زهقت', 'عايز اعمل حاجة'],
    stateId: 'QA_MENU',
    response: { en: 'Here are some quick actions:', ar: 'دي حاجات سريعة ممكن تعملها:' },
    priority: 5,
  },
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate it', 'great'],
    keywordsAr: ['شكرا', 'تسلم', 'يسلمو', 'تمام'],
    stateId: 'ROOT',
    response: { en: 'You\'re welcome! Anything else I can help with?', ar: 'العفو! محتاج حاجة تانية؟' },
    priority: 2,
  },
  {
    keywords: ['change goal', 'update goal', 'set goal', 'fitness goal', 'my goal'],
    keywordsAr: ['غير الهدف', 'هدفي', 'حدد هدف'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'Let\'s update your fitness goal:', ar: 'يلا نعدل هدف اللياقة:' },
    priority: 8,
  },
  {
    keywords: ['change email', 'update email', 'my email'],
    keywordsAr: ['غير الايميل', 'الايميل'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your email in profile settings.', ar: 'تقدر تغير الإيميل من إعدادات البروفايل.' },
    priority: 8,
  },
  {
    keywords: ['change photo', 'update photo', 'profile picture', 'avatar', 'my picture'],
    keywordsAr: ['غير الصورة', 'صورتي', 'صورة البروفايل'],
    stateId: 'ST_PROFILE',
    route: '/profile/edit',
    response: { en: 'You can update your photo in profile settings.', ar: 'تقدر تغير صورتك من إعدادات البروفايل.' },
    priority: 8,
  },
  {
    keywords: ['logout', 'log out', 'sign out', 'exit'],
    keywordsAr: ['تسجيل خروج', 'خروج', 'اطلع'],
    stateId: 'ST_MENU',
    response: { en: 'You can log out from Settings > Security.', ar: 'تقدر تسجل خروج من الإعدادات > الأمان.' },
    priority: 6,
  },
  {
    keywords: ['delete account', 'remove account', 'cancel account'],
    keywordsAr: ['حذف الحساب', 'امسح حسابي', 'الغي حسابي'],
    stateId: 'ST_SECURITY',
    route: '/profile/security',
    response: { en: 'Account deletion can be found in Security settings.', ar: 'حذف الحساب من إعدادات الأمان.' },
    priority: 8,
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
