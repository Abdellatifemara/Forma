import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// NUTRITION & DIET DOMAIN (~55 states)
// ═══════════════════════════════════════════════════════════════

export const nutritionStates: ChatState[] = [
  // ─── Main Nutrition Menu ──────────────────────────────────
  {
    id: 'NT_MENU',
    domain: 'nutrition',
    text: { en: 'Nutrition & Diet', ar: 'التغذية والدايت' },
    botMessage: {
      en: 'Let\'s talk nutrition! What do you need?',
      ar: 'يلا نتكلم عن التغذية! محتاج ايه؟',
    },
    back: 'ROOT',
    options: [
      { id: 'nt1', label: { en: 'Log a Meal', ar: 'سجّل وجبة' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'nt2', label: { en: 'Today\'s Nutrition', ar: 'تغذية النهارده' }, icon: '📊', nextState: 'NT_TODAY' },
      { id: 'nt3', label: { en: 'Search Food', ar: 'دوّر على أكل' }, icon: '🔍', nextState: 'NT_SEARCH' },
      { id: 'nt4', label: { en: 'Meal Plan', ar: 'خطة الوجبات' }, icon: '📋', nextState: 'NT_PLAN_MENU' },
      { id: 'nt5', label: { en: 'Calorie Calculator', ar: 'حاسبة السعرات' }, icon: '🔢', nextState: 'NT_CALC' },
      { id: 'nt6', label: { en: 'Water Tracking', ar: 'تتبع المية' }, icon: '💧', nextState: 'NT_WATER' },
      { id: 'nt7', label: { en: 'Egyptian Food Guide', ar: 'دليل الأكل المصري' }, icon: '🇪🇬', nextState: 'NT_EGYPTIAN' },
      { id: 'nt8', label: { en: 'Healthy Alternatives', ar: 'بدائل صحية' }, icon: '🔄', nextState: 'NT_ALTERNATIVES' },
      { id: 'nt9', label: { en: 'Pre/Post Workout Meals', ar: 'أكل قبل/بعد التمرين' }, icon: '🍌', nextState: 'NT_WORKOUT_MEALS' },
      { id: 'nt_ai1', label: { en: 'AI Meal Plan', ar: 'خطة وجبات AI' }, icon: '🧠', nextState: 'NT_AI_MEAL_PLAN',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'nt_ai2', label: { en: 'AI Nutrition Analysis', ar: 'تحليل AI للتغذية' }, icon: '🧠', nextState: 'NT_AI_ANALYSIS',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'nt10', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Log a Meal ───────────────────────────────────────────
  {
    id: 'NT_LOG_MEAL',
    domain: 'nutrition',
    text: { en: 'Log a Meal', ar: 'سجّل وجبة' },
    botMessage: {
      en: 'Which meal are you logging?',
      ar: 'بتسجّل أي وجبة؟',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntl1', label: { en: 'Breakfast', ar: 'فطار' }, icon: '🌅', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'breakfast' } } },
      { id: 'ntl2', label: { en: 'Lunch', ar: 'غدا' }, icon: '☀️', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'lunch' } } },
      { id: 'ntl3', label: { en: 'Dinner', ar: 'عشا' }, icon: '🌙', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'dinner' } } },
      { id: 'ntl4', label: { en: 'Snack', ar: 'سناك' }, icon: '🍎', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'snack' } } },
      { id: 'ntl5', label: { en: 'Pre-workout', ar: 'قبل التمرين' }, icon: '🍌', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'pre_workout' } } },
      { id: 'ntl6', label: { en: 'Post-workout', ar: 'بعد التمرين' }, icon: '🍗', nextState: 'NT_LOG_FOOD',
        action: { type: 'write', params: { mealType: 'post_workout' } } },
      { id: 'ntl7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_LOG_FOOD',
    domain: 'nutrition',
    text: { en: 'Select Food', ar: 'اختار الأكل' },
    botMessage: {
      en: 'What did you eat? Choose a category:',
      ar: 'أكلت ايه؟ اختار فئة:',
    },
    back: 'NT_LOG_MEAL',
    options: [
      { id: 'ntlf1', label: { en: 'Egyptian food', ar: 'أكل مصري' }, icon: '🇪🇬', nextState: 'NT_LOG_EGYPTIAN' },
      { id: 'ntlf2', label: { en: 'Protein (meat/chicken/fish)', ar: 'بروتين (لحمة/فراخ/سمك)' }, icon: '🥩', nextState: 'NT_LOG_PROTEIN' },
      { id: 'ntlf3', label: { en: 'Carbs (rice/bread/pasta)', ar: 'كارب (رز/عيش/مكرونة)' }, icon: '🍚', nextState: 'NT_LOG_CARBS' },
      { id: 'ntlf4', label: { en: 'Fruits & Vegetables', ar: 'فاكهة وخضار' }, icon: '🥗', nextState: 'NT_LOG_VEGGIES' },
      { id: 'ntlf5', label: { en: 'Dairy', ar: 'ألبان' }, icon: '🥛', nextState: 'NT_LOG_DAIRY' },
      { id: 'ntlf6', label: { en: 'Fast food', ar: 'فاست فود' }, icon: '🍔', nextState: 'NT_LOG_FAST' },
      { id: 'ntlf7', label: { en: 'Snacks & Sweets', ar: 'سناكس وحلويات' }, icon: '🍫', nextState: 'NT_LOG_SNACKS' },
      { id: 'ntlf8', label: { en: 'Drinks', ar: 'مشروبات' }, icon: '🥤', nextState: 'NT_LOG_DRINKS' },
      { id: 'ntlf9', label: { en: 'Search all foods', ar: 'دوّر في كل الأكل' }, icon: '🔍', nextState: 'NT_SEARCH' },
      { id: 'ntlf10', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_LOG_MEAL' },
    ],
  },

  // Food category states (8 states — each fetches from DB)
  ...([
    { id: 'EGYPTIAN', en: 'Egyptian Food', ar: 'أكل مصري', cat: 'egyptian' },
    { id: 'PROTEIN', en: 'Protein Sources', ar: 'مصادر بروتين', cat: 'meat,poultry,seafood' },
    { id: 'CARBS', en: 'Carb Sources', ar: 'مصادر كارب', cat: 'grains,bread,rice,pasta' },
    { id: 'VEGGIES', en: 'Fruits & Vegetables', ar: 'فاكهة وخضار', cat: 'fruits,vegetables' },
    { id: 'DAIRY', en: 'Dairy', ar: 'ألبان', cat: 'dairy' },
    { id: 'FAST', en: 'Fast Food', ar: 'فاست فود', cat: 'fast_food' },
    { id: 'SNACKS', en: 'Snacks & Sweets', ar: 'سناكس وحلويات', cat: 'snacks,sweets,dessert' },
    { id: 'DRINKS', en: 'Drinks', ar: 'مشروبات', cat: 'beverages,drinks,juice' },
  ] as const).map(cat => ({
    id: `NT_LOG_${cat.id}`,
    domain: 'nutrition' as const,
    text: { en: cat.en, ar: cat.ar },
    botMessage: {
      en: `Select from ${cat.en.toLowerCase()}:`,
      ar: `اختار من ${cat.ar}:`,
    },
    dynamic: true,
    onEnter: { type: 'fetch' as const, endpoint: '/foods', params: { category: cat.cat } },
    back: 'NT_LOG_FOOD',
    options: [
      { id: `ntl${cat.id}1`, label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION',
        action: { type: 'write' as const, endpoint: '/nutrition/log',
          requiresConfirmation: true, confirmText: { en: 'Log this food?', ar: 'تسجّل الأكل ده؟' } } },
      { id: `ntl${cat.id}2`, label: { en: 'View nutrition info', ar: 'شوف المعلومات الغذائية' }, icon: '📊', nextState: 'NT_FOOD_DETAIL' },
      { id: `ntl${cat.id}3`, label: { en: 'Search more', ar: 'دوّر أكتر' }, icon: '🔍', nextState: 'NT_SEARCH' },
      { id: `ntl${cat.id}4`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_LOG_FOOD' },
    ],
  } as ChatState)),

  {
    id: 'NT_LOG_PORTION',
    domain: 'nutrition',
    text: { en: 'Select Portion', ar: 'اختار الحصة' },
    botMessage: {
      en: 'How much did you eat?',
      ar: 'أكلت قد ايه؟',
    },
    back: 'NT_LOG_FOOD',
    options: [
      { id: 'ntlp1', label: { en: 'Small (0.5 serving)', ar: 'صغير (نص حصة)' }, icon: '🔹', nextState: 'NT_LOG_CONFIRM',
        action: { type: 'write', params: { portion: '0.5' } } },
      { id: 'ntlp2', label: { en: 'Regular (1 serving)', ar: 'عادي (حصة واحدة)' }, icon: '🔷', nextState: 'NT_LOG_CONFIRM',
        action: { type: 'write', params: { portion: '1' } } },
      { id: 'ntlp3', label: { en: 'Large (1.5 servings)', ar: 'كبير (حصة ونص)' }, icon: '🔶', nextState: 'NT_LOG_CONFIRM',
        action: { type: 'write', params: { portion: '1.5' } } },
      { id: 'ntlp4', label: { en: 'Double (2 servings)', ar: 'دبل (حصتين)' }, icon: '🟠', nextState: 'NT_LOG_CONFIRM',
        action: { type: 'write', params: { portion: '2' } } },
      { id: 'ntlp5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_LOG_FOOD' },
    ],
  },

  {
    id: 'NT_LOG_CONFIRM',
    domain: 'nutrition',
    text: { en: 'Meal Logged', ar: 'الوجبة اتسجلت' },
    botMessage: {
      en: '✅ Meal logged! Here\'s your daily total so far:',
      ar: '✅ الوجبة اتسجلت! ده إجمالي يومك لحد دلوقتي:',
    },
    dynamic: true,
    back: 'NT_MENU',
    options: [
      { id: 'ntlc1', label: { en: 'Log another food', ar: 'سجّل أكل تاني' }, icon: '➕', nextState: 'NT_LOG_FOOD' },
      { id: 'ntlc2', label: { en: 'View today\'s nutrition', ar: 'شوف تغذية النهارده' }, icon: '📊', nextState: 'NT_TODAY' },
      { id: 'ntlc3', label: { en: 'Log water', ar: 'سجّل مية' }, icon: '💧', nextState: 'NT_WATER' },
      { id: 'ntlc4', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Today's Nutrition ────────────────────────────────────
  {
    id: 'NT_TODAY',
    domain: 'nutrition',
    text: { en: 'Today\'s Nutrition', ar: 'تغذية النهارده' },
    botMessage: {
      en: 'Here\'s your nutrition summary for today:',
      ar: 'ده ملخص تغذيتك النهارده:',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/nutrition/today' },
    back: 'NT_MENU',
    options: [
      { id: 'ntt1', label: { en: 'Log a meal', ar: 'سجّل وجبة' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'ntt2', label: { en: 'What should I eat next?', ar: 'آكل ايه بعد كده؟' }, icon: '🤔', nextState: 'NT_SUGGEST' },
      { id: 'ntt3', label: { en: 'View macro breakdown', ar: 'تفصيل الماكروز' }, icon: '📊', nextState: 'NT_MACROS',
        action: { type: 'navigate', route: '/nutrition' } },
      { id: 'ntt4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_SUGGEST',
    domain: 'nutrition',
    text: { en: 'Meal Suggestions', ar: 'اقتراحات وجبات' },
    botMessage: {
      en: 'Based on what you\'ve eaten today, here\'s what you need:',
      ar: 'بناءً على اللي أكلته النهارده، ده اللي محتاجه:',
    },
    back: 'NT_TODAY',
    options: [
      { id: 'nts1', label: { en: 'High protein meals', ar: 'وجبات عالية بروتين' }, icon: '🥩', nextState: 'NT_HIGH_PROTEIN' },
      { id: 'nts2', label: { en: 'Low calorie options', ar: 'أكل قليل سعرات' }, icon: '🥗', nextState: 'NT_LOW_CAL' },
      { id: 'nts3', label: { en: 'Quick & easy', ar: 'سريع وسهل' }, icon: '⚡', nextState: 'NT_QUICK_MEALS' },
      { id: 'nts4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_TODAY' },
    ],
  },

  {
    id: 'NT_MACROS',
    domain: 'nutrition',
    text: { en: 'Macro Breakdown', ar: 'تفصيل الماكروز' },
    botMessage: { en: 'Opening your nutrition dashboard...', ar: 'بفتحلك صفحة التغذية...' },
    back: 'NT_TODAY',
    options: [
      { id: 'ntm1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'NT_MENU' },
      { id: 'ntm2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_TODAY' },
    ],
  },

  // ─── Food Search ──────────────────────────────────────────
  {
    id: 'NT_SEARCH',
    domain: 'nutrition',
    text: { en: 'Search Food', ar: 'دوّر على أكل' },
    botMessage: {
      en: 'What type of food are you looking for?',
      ar: 'بتدوّر على ايه؟',
    },
    back: 'NT_MENU',
    options: [
      { id: 'nts1', label: { en: 'Egyptian foods', ar: 'أكل مصري' }, icon: '🇪🇬', nextState: 'NT_SEARCH_EG',
        action: { type: 'fetch', endpoint: '/foods', params: { isEgyptian: 'true' } } },
      { id: 'nts2', label: { en: 'High protein foods', ar: 'أكل عالي بروتين' }, icon: '🥩', nextState: 'NT_HIGH_PROTEIN',
        action: { type: 'fetch', endpoint: '/foods', params: { highProtein: 'true' } } },
      { id: 'nts3', label: { en: 'Low calorie foods', ar: 'أكل قليل سعرات' }, icon: '🥗', nextState: 'NT_LOW_CAL',
        action: { type: 'fetch', endpoint: '/foods', params: { lowCal: 'true' } } },
      { id: 'nts4', label: { en: 'Supplements', ar: 'مكملات' }, icon: '💊', nextState: 'SP_MENU' },
      { id: 'nts5', label: { en: 'By restaurant/brand', ar: 'حسب المطعم/البراند' }, icon: '🏪', nextState: 'NT_SEARCH_BRAND' },
      { id: 'nts6', label: { en: 'Browse all categories', ar: 'تصفّح كل الفئات' }, icon: '📋', nextState: 'NT_LOG_FOOD' },
      { id: 'nts7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_SEARCH_EG',
    domain: 'nutrition',
    text: { en: 'Egyptian Foods', ar: 'أكل مصري' },
    botMessage: { en: 'Egyptian food results:', ar: 'نتايج الأكل المصري:' },
    dynamic: true,
    back: 'NT_SEARCH',
    options: [
      { id: 'ntse1', label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: 'ntse2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📊', nextState: 'NT_FOOD_DETAIL' },
      { id: 'ntse3', label: { en: 'Search more', ar: 'دوّر أكتر' }, icon: '🔍', nextState: 'NT_SEARCH' },
      { id: 'ntse4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SEARCH' },
    ],
  },

  {
    id: 'NT_SEARCH_BRAND',
    domain: 'nutrition',
    text: { en: 'By Restaurant/Brand', ar: 'حسب المطعم/البراند' },
    botMessage: {
      en: 'Select a restaurant or brand:',
      ar: 'اختار مطعم أو براند:',
    },
    back: 'NT_SEARCH',
    options: [
      { id: 'ntsb1', label: { en: 'McDonald\'s', ar: 'ماكدونالدز' }, icon: '🍔', nextState: 'NT_BRAND_RESULTS',
        action: { type: 'fetch', endpoint: '/foods', params: { brand: 'mcdonalds' } } },
      { id: 'ntsb2', label: { en: 'KFC', ar: 'كنتاكي' }, icon: '🍗', nextState: 'NT_BRAND_RESULTS',
        action: { type: 'fetch', endpoint: '/foods', params: { brand: 'kfc' } } },
      { id: 'ntsb3', label: { en: 'Hardee\'s/Carl\'s Jr', ar: 'هارديز' }, icon: '🍔', nextState: 'NT_BRAND_RESULTS',
        action: { type: 'fetch', endpoint: '/foods', params: { brand: 'hardees' } } },
      { id: 'ntsb4', label: { en: 'Shawerma/Koshary', ar: 'شاورما/كشري' }, icon: '🌯', nextState: 'NT_BRAND_RESULTS',
        action: { type: 'fetch', endpoint: '/foods', params: { brand: 'egyptian_street' } } },
      { id: 'ntsb5', label: { en: 'Juhayna/Labanita', ar: 'جهينة/لبانيتا' }, icon: '🥛', nextState: 'NT_BRAND_RESULTS',
        action: { type: 'fetch', endpoint: '/foods', params: { brand: 'juhayna' } } },
      { id: 'ntsb6', label: { en: 'Other', ar: 'تاني' }, icon: '🏪', nextState: 'NT_SEARCH' },
      { id: 'ntsb7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SEARCH' },
    ],
  },

  {
    id: 'NT_BRAND_RESULTS',
    domain: 'nutrition',
    text: { en: 'Brand Results', ar: 'نتائج البراند' },
    botMessage: { en: 'Here\'s what I found:', ar: 'ده اللي لقيته:' },
    dynamic: true,
    back: 'NT_SEARCH_BRAND',
    options: [
      { id: 'ntbr1', label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: 'ntbr2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📊', nextState: 'NT_FOOD_DETAIL' },
      { id: 'ntbr3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SEARCH_BRAND' },
    ],
  },

  {
    id: 'NT_FOOD_DETAIL',
    domain: 'nutrition',
    text: { en: 'Food Details', ar: 'تفاصيل الأكل' },
    botMessage: { en: 'Nutrition details:', ar: 'المعلومات الغذائية:' },
    dynamic: true,
    back: 'NT_SEARCH',
    options: [
      { id: 'ntfd1', label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: 'ntfd2', label: { en: 'Healthier alternatives', ar: 'بدائل صحية' }, icon: '🔄', nextState: 'NT_ALTERNATIVES' },
      { id: 'ntfd3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SEARCH' },
    ],
  },

  // ─── Calorie Calculator ───────────────────────────────────
  {
    id: 'NT_CALC',
    domain: 'nutrition',
    text: { en: 'Calorie Calculator', ar: 'حاسبة السعرات' },
    botMessage: {
      en: 'What\'s your goal? I\'ll calculate your daily calorie needs.',
      ar: 'هدفك ايه؟ هحسبلك احتياجك اليومي من السعرات.',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntc1', label: { en: 'Lose weight', ar: 'أنحف' }, icon: '📉', nextState: 'NT_CALC_RESULT',
        action: { type: 'fetch', endpoint: '/nutrition/calculate', params: { goal: 'lose' } } },
      { id: 'ntc2', label: { en: 'Maintain weight', ar: 'أثبّت وزني' }, icon: '⚖️', nextState: 'NT_CALC_RESULT',
        action: { type: 'fetch', endpoint: '/nutrition/calculate', params: { goal: 'maintain' } } },
      { id: 'ntc3', label: { en: 'Gain muscle', ar: 'أزوّد عضل' }, icon: '📈', nextState: 'NT_CALC_RESULT',
        action: { type: 'fetch', endpoint: '/nutrition/calculate', params: { goal: 'gain' } } },
      { id: 'ntc4', label: { en: 'Lean bulk', ar: 'Lean bulk' }, icon: '💪', nextState: 'NT_CALC_RESULT',
        action: { type: 'fetch', endpoint: '/nutrition/calculate', params: { goal: 'lean_bulk' } } },
      { id: 'ntc5', label: { en: 'Aggressive cut', ar: 'كت عنيف' }, icon: '🔥', nextState: 'NT_CALC_RESULT',
        action: { type: 'fetch', endpoint: '/nutrition/calculate', params: { goal: 'aggressive_cut' } } },
      { id: 'ntc6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_CALC_RESULT',
    domain: 'nutrition',
    text: { en: 'Your Calorie Needs', ar: 'احتياجك من السعرات' },
    botMessage: { en: 'Based on your profile, here are your recommended daily targets:', ar: 'بناءً على بروفايلك، دي الأهداف اليومية المقترحة:' },
    dynamic: true,
    back: 'NT_CALC',
    options: [
      { id: 'ntcr1', label: { en: 'Apply to my profile', ar: 'طبّق على بروفايلي' }, icon: '✅', nextState: 'NT_CALC_APPLIED',
        action: { type: 'write', endpoint: '/nutrition/set-targets',
          requiresConfirmation: true, confirmText: { en: 'Apply these calorie targets to your profile?', ar: 'تطبّق أهداف السعرات دي على بروفايلك؟' } } },
      { id: 'ntcr2', label: { en: 'Try different goal', ar: 'جرّب هدف تاني' }, icon: '🔄', nextState: 'NT_CALC' },
      { id: 'ntcr3', label: { en: 'Sample meal plan', ar: 'خطة وجبات نموذجية' }, icon: '📋', nextState: 'NT_PLAN_MENU' },
      { id: 'ntcr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_CALC' },
    ],
  },

  {
    id: 'NT_CALC_APPLIED',
    domain: 'nutrition',
    text: { en: 'Targets Applied', ar: 'الأهداف اتطبقت' },
    botMessage: {
      en: '✅ Daily calorie and macro targets updated! Your nutrition dashboard will now show these goals.',
      ar: '✅ أهداف السعرات والماكروز اتحدثت! صفحة التغذية هتوريك الأهداف دي.',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntca1', label: { en: 'View nutrition page', ar: 'شوف صفحة التغذية' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/nutrition' } },
      { id: 'ntca2', label: { en: 'Meal plan ideas', ar: 'أفكار وجبات' }, icon: '📋', nextState: 'NT_PLAN_MENU' },
      { id: 'ntca3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Water Tracking ───────────────────────────────────────
  {
    id: 'NT_WATER',
    domain: 'nutrition',
    text: { en: 'Water Tracking', ar: 'تتبع المية' },
    botMessage: {
      en: '💧 How much water did you drink?',
      ar: '💧 شربت مية قد ايه؟',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntw1', label: { en: '1 glass (250ml)', ar: 'كوباية (250مل)' }, icon: '🥛', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '250' },
          requiresConfirmation: true, confirmText: { en: 'Log 250ml water?', ar: 'تسجّل 250مل مية؟' } } },
      { id: 'ntw2', label: { en: '2 glasses (500ml)', ar: 'كوبايتين (500مل)' }, icon: '💧', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '500' },
          requiresConfirmation: true, confirmText: { en: 'Log 500ml water?', ar: 'تسجّل 500مل مية؟' } } },
      { id: 'ntw3', label: { en: 'Bottle (750ml)', ar: 'ازازة (750مل)' }, icon: '🍶', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '750' },
          requiresConfirmation: true, confirmText: { en: 'Log 750ml water?', ar: 'تسجّل 750مل مية؟' } } },
      { id: 'ntw4', label: { en: 'Large bottle (1L)', ar: 'ازازة كبيرة (1لتر)' }, icon: '🫗', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '1000' },
          requiresConfirmation: true, confirmText: { en: 'Log 1L water?', ar: 'تسجّل 1لتر مية؟' } } },
      { id: 'ntw5', label: { en: 'View today\'s total', ar: 'شوف إجمالي النهارده' }, icon: '📊', nextState: 'NT_WATER_TOTAL' },
      { id: 'ntw6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_WATER_LOGGED',
    domain: 'nutrition',
    text: { en: 'Water Logged', ar: 'المية اتسجلت' },
    botMessage: {
      en: '💧 Water logged! Keep drinking — aim for 2-3L per day.',
      ar: '💧 المية اتسجلت! كمّل اشرب — الهدف 2-3 لتر يومياً.',
    },
    dynamic: true,
    back: 'NT_WATER',
    options: [
      { id: 'ntwl1', label: { en: 'Log more water', ar: 'سجّل مية تاني' }, icon: '💧', nextState: 'NT_WATER' },
      { id: 'ntwl2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'NT_WATER_TOTAL',
    domain: 'nutrition',
    text: { en: 'Water Today', ar: 'مية النهارده' },
    botMessage: { en: 'Here\'s your water intake today:', ar: 'ده اللي شربته النهارده:' },
    onEnter: { type: 'fetch', endpoint: '/nutrition/water-today' },
    back: 'NT_WATER',
    options: [
      { id: 'ntwt1', label: { en: 'Log more water', ar: 'سجّل مية تاني' }, icon: '💧', nextState: 'NT_WATER' },
      { id: 'ntwt2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_WATER' },
    ],
  },

  {
    id: 'NT_LOG_WATER',
    domain: 'nutrition',
    text: { en: 'Log Water', ar: 'سجّل مية' },
    botMessage: { en: '💧 Quick water log:', ar: '💧 تسجيل مية سريع:' },
    back: 'ROOT',
    options: [
      { id: 'ntlw1', label: { en: '1 glass (250ml)', ar: 'كوباية (250مل)' }, icon: '🥛', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '250' },
          requiresConfirmation: true, confirmText: { en: 'Log 250ml water?', ar: 'تسجّل 250مل مية؟' } } },
      { id: 'ntlw2', label: { en: 'Bottle (500ml)', ar: 'ازازة (500مل)' }, icon: '💧', nextState: 'NT_WATER_LOGGED',
        action: { type: 'write', endpoint: '/nutrition/log-water', params: { ml: '500' },
          requiresConfirmation: true, confirmText: { en: 'Log 500ml water?', ar: 'تسجّل 500مل مية؟' } } },
      { id: 'ntlw3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'QA_MENU' },
    ],
  },

  // ─── Meal Plans ───────────────────────────────────────────
  {
    id: 'NT_PLAN_MENU',
    domain: 'nutrition',
    text: { en: 'Meal Plans', ar: 'خطط الوجبات' },
    botMessage: {
      en: 'What kind of meal plan are you looking for?',
      ar: 'عايز خطة وجبات زي ايه؟',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntpm1', label: { en: 'Weight loss plan', ar: 'خطة تنحيف' }, icon: '📉', nextState: 'NT_PLAN_LOSS' },
      { id: 'ntpm2', label: { en: 'Muscle gain plan', ar: 'خطة زيادة عضل' }, icon: '📈', nextState: 'NT_PLAN_GAIN' },
      { id: 'ntpm3', label: { en: 'Maintenance plan', ar: 'خطة ثبات' }, icon: '⚖️', nextState: 'NT_PLAN_MAINTAIN' },
      { id: 'ntpm4', label: { en: 'Budget-friendly (Egyptian)', ar: 'اقتصادي (مصري)' }, icon: '💰', nextState: 'NT_PLAN_BUDGET' },
      { id: 'ntpm5', label: { en: 'High protein plan', ar: 'خطة عالية بروتين' }, icon: '🥩', nextState: 'NT_PLAN_PROTEIN' },
      { id: 'ntpm6', label: { en: 'View my current plan', ar: 'شوف خطتي الحالية' }, icon: '📋', nextState: 'NT_PLAN_CURRENT',
        action: { type: 'navigate', route: '/nutrition' } },
      { id: 'ntpm7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  // Meal plan result states (5 states)
  ...([
    { id: 'LOSS', en: 'Weight Loss Plan', ar: 'خطة تنحيف', goal: 'lose',
      msg_en: '📉 Weight Loss Meal Plan (~1500-1800 cal/day):\n\n🌅 Breakfast: 3 eggs + 1 toast + cucumber\n☀️ Lunch: Grilled chicken breast + rice (1 cup) + salad\n🍎 Snack: Greek yogurt + handful of nuts\n🌙 Dinner: Tuna salad + 2 toast\n\nTips: High protein, moderate carbs, drink 3L water.',
      msg_ar: '📉 خطة تنحيف (~1500-1800 سعرة/يوم):\n\n🌅 فطار: 3 بيض + توست + خيار\n☀️ غدا: صدور فراخ مشوية + رز (كوباية) + سلطة\n🍎 سناك: زبادي يوناني + حبة مكسرات\n🌙 عشا: سلطة تونة + 2 توست\n\nنصايح: بروتين عالي، كارب معتدل، اشرب 3 لتر مية.' },
    { id: 'GAIN', en: 'Muscle Gain Plan', ar: 'خطة زيادة عضل', goal: 'gain',
      msg_en: '📈 Muscle Gain Meal Plan (~2500-3000 cal/day):\n\n🌅 Breakfast: 4 eggs + oats + banana + peanut butter\n☀️ Lunch: 200g chicken + 2 cups rice + vegetables\n🍎 Snack: Protein shake + toast + honey\n🏋️ Post-workout: Whey + banana + oats\n🌙 Dinner: 200g beef/fish + sweet potato + salad\n🌃 Before bed: Cottage cheese + nuts\n\nTips: Eat every 3 hours, 2g protein per kg bodyweight.',
      msg_ar: '📈 خطة زيادة عضل (~2500-3000 سعرة/يوم):\n\n🌅 فطار: 4 بيض + شوفان + موز + زبدة فول سوداني\n☀️ غدا: 200 جم فراخ + 2 كوباية رز + خضار\n🍎 سناك: بروتين شيك + توست + عسل\n🏋️ بعد التمرين: واي + موز + شوفان\n🌙 عشا: 200 جم لحمة/سمك + بطاطا حلوة + سلطة\n🌃 قبل النوم: جبنة قريش + مكسرات\n\nنصايح: كل كل 3 ساعات، 2 جم بروتين لكل كجم من وزنك.' },
    { id: 'MAINTAIN', en: 'Maintenance Plan', ar: 'خطة ثبات', goal: 'maintain',
      msg_en: '⚖️ Maintenance Plan (~2000-2200 cal/day):\n\n🌅 Breakfast: 3 eggs + toast + cheese + fruit\n☀️ Lunch: Protein (150g) + complex carbs (1.5 cups) + vegetables\n🍎 Snack: Yogurt + granola or protein bar\n🌙 Dinner: Light protein + salad + healthy fats\n\nTips: Balance macros, eat intuitively, adjust if weight changes.',
      msg_ar: '⚖️ خطة ثبات (~2000-2200 سعرة/يوم):\n\n🌅 فطار: 3 بيض + توست + جبنة + فاكهة\n☀️ غدا: بروتين (150 جم) + كارب (كوباية ونص) + خضار\n🍎 سناك: زبادي + جرانولا أو بروتين بار\n🌙 عشا: بروتين خفيف + سلطة + دهون صحية\n\nنصايح: وازن الماكروز، كل بالحدس، عدّل لو الوزن اتغير.' },
    { id: 'BUDGET', en: 'Budget-Friendly (Egyptian)', ar: 'اقتصادي (مصري)', goal: 'budget',
      msg_en: '💰 Budget-Friendly Egyptian Meal Plan:\n\n🌅 Breakfast: Foul medames + ta3meya + bread\n☀️ Lunch: Koshary (large) OR chicken quarter + rice\n🍎 Snack: Eggs (2) + cheese\n🌙 Dinner: Lentil soup + bread + salad\n\nProtein sources on a budget:\n• Eggs (cheapest protein)\n• Foul/lentils\n• Canned tuna\n• Chicken quarters\n• Cottage cheese (areesh)',
      msg_ar: '💰 خطة أكل اقتصادي مصري:\n\n🌅 فطار: فول + طعمية + عيش\n☀️ غدا: كشري (كبير) أو ربع فرخة + رز\n🍎 سناك: بيض (2) + جبنة\n🌙 عشا: شوربة عدس + عيش + سلطة\n\nمصادر بروتين رخيصة:\n• بيض (أرخص بروتين)\n• فول/عدس\n• تونة معلبات\n• فراخ أرباع\n• جبنة قريش' },
    { id: 'PROTEIN', en: 'High Protein Plan', ar: 'خطة عالية بروتين', goal: 'high_protein',
      msg_en: '🥩 High Protein Plan (180-200g protein/day):\n\n🌅 Breakfast: 5 egg whites + 2 whole eggs + oats\n🥤 Shake: Whey protein + banana + milk\n☀️ Lunch: 250g chicken breast + rice + vegetables\n🍎 Snack: Greek yogurt + protein bar\n🌙 Dinner: 200g fish/beef + sweet potato + salad\n🌃 Before bed: Casein shake or cottage cheese\n\nPrioritize lean protein at every meal.',
      msg_ar: '🥩 خطة عالية بروتين (180-200 جم بروتين/يوم):\n\n🌅 فطار: 5 بياض بيض + 2 بيض كامل + شوفان\n🥤 شيك: واي بروتين + موز + لبن\n☀️ غدا: 250 جم صدور فراخ + رز + خضار\n🍎 سناك: زبادي يوناني + بروتين بار\n🌙 عشا: 200 جم سمك/لحمة + بطاطا حلوة + سلطة\n🌃 قبل النوم: كازين شيك أو جبنة قريش\n\nأولوية البروتين في كل وجبة.' },
  ] as const).map(plan => ({
    id: `NT_PLAN_${plan.id}`,
    domain: 'nutrition' as const,
    text: { en: plan.en, ar: plan.ar },
    botMessage: { en: plan.msg_en, ar: plan.msg_ar },
    back: 'NT_PLAN_MENU',
    options: [
      { id: `ntp${plan.id}1`, label: { en: 'Apply this plan', ar: 'طبّق الخطة دي' }, icon: '✅', nextState: 'NT_PLAN_APPLIED',
        action: { type: 'write' as const, endpoint: '/nutrition/set-plan', params: { goal: plan.goal },
          requiresConfirmation: true, confirmText: { en: 'Apply this meal plan?', ar: 'تطبّق خطة الوجبات دي؟' } } },
      { id: `ntp${plan.id}2`, label: { en: 'Try different plan', ar: 'جرّب خطة تانية' }, icon: '🔄', nextState: 'NT_PLAN_MENU' },
      { id: `ntp${plan.id}3`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_PLAN_MENU' },
    ],
  } as ChatState)),

  {
    id: 'NT_PLAN_APPLIED',
    domain: 'nutrition',
    text: { en: 'Plan Applied', ar: 'الخطة اتطبقت' },
    botMessage: {
      en: '✅ Meal plan applied! Check your nutrition page for your daily targets.',
      ar: '✅ خطة الوجبات اتطبقت! شوف صفحة التغذية للأهداف اليومية.',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntpa1', label: { en: 'Go to nutrition', ar: 'روح للتغذية' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/nutrition' } },
      { id: 'ntpa2', label: { en: 'Log a meal', ar: 'سجّل وجبة' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'ntpa3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'NT_PLAN_CURRENT',
    domain: 'nutrition',
    text: { en: 'Current Plan', ar: 'الخطة الحالية' },
    botMessage: { en: 'Opening your nutrition plan...', ar: 'بفتحلك خطة التغذية...' },
    back: 'NT_PLAN_MENU',
    options: [
      { id: 'ntpc1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'NT_PLAN_MENU' },
      { id: 'ntpc2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_PLAN_MENU' },
    ],
  },

  // ─── Pre/Post Workout Meals ───────────────────────────────
  {
    id: 'NT_WORKOUT_MEALS',
    domain: 'nutrition',
    text: { en: 'Workout Meals', ar: 'أكل التمرين' },
    botMessage: {
      en: 'When do you need meal ideas?',
      ar: 'محتاج أفكار أكل لمتى؟',
    },
    back: 'NT_MENU',
    options: [
      { id: 'ntwm1', label: { en: 'Pre-workout (before)', ar: 'قبل التمرين' }, icon: '⬆️', nextState: 'NT_PRE_WORKOUT' },
      { id: 'ntwm2', label: { en: 'Post-workout (after)', ar: 'بعد التمرين' }, icon: '⬇️', nextState: 'NT_POST_WORKOUT' },
      { id: 'ntwm3', label: { en: 'Rest day nutrition', ar: 'أكل يوم الراحة' }, icon: '😴', nextState: 'NT_REST_DAY' },
      { id: 'ntwm4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  {
    id: 'NT_PRE_WORKOUT',
    domain: 'nutrition',
    text: { en: 'Pre-Workout Meals', ar: 'أكل قبل التمرين' },
    botMessage: {
      en: '🍌 Pre-Workout Meal Ideas (eat 1-2 hours before):\n\n**Quick options (30 min before):**\n• Banana + coffee\n• Rice cakes + honey\n• Toast + jam\n\n**Full meal (1-2 hours before):**\n• Oats + banana + honey\n• Rice + chicken breast (small)\n• Toast + eggs + fruit\n• Sweet potato + protein\n\n**Key:** Carbs for energy + some protein. Low fat, low fiber (easy to digest).',
      ar: '🍌 أفكار أكل قبل التمرين (كل قبل بساعة-ساعتين):\n\n**أوبشنز سريعة (قبل بنص ساعة):**\n• موز + قهوة\n• رايس كيك + عسل\n• توست + مربى\n\n**وجبة كاملة (قبل بساعة-ساعتين):**\n• شوفان + موز + عسل\n• رز + صدور فراخ (صغيرة)\n• توست + بيض + فاكهة\n• بطاطا حلوة + بروتين\n\n**المفتاح:** كارب للطاقة + شوية بروتين. دهون قليلة، ألياف قليلة (سهل الهضم).',
    },
    back: 'NT_WORKOUT_MEALS',
    options: [
      { id: 'ntpw1', label: { en: 'Pre-workout supplements', ar: 'مكملات قبل التمرين' }, icon: '💊', nextState: 'SP_PRE_WORKOUT' },
      { id: 'ntpw2', label: { en: 'Log pre-workout meal', ar: 'سجّل أكل قبل التمرين' }, icon: '📝', nextState: 'NT_LOG_MEAL' },
      { id: 'ntpw3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_WORKOUT_MEALS' },
    ],
  },

  {
    id: 'NT_POST_WORKOUT',
    domain: 'nutrition',
    text: { en: 'Post-Workout Meals', ar: 'أكل بعد التمرين' },
    botMessage: {
      en: '🍗 Post-Workout Meal Ideas (eat within 1 hour):\n\n**Quick options:**\n• Whey protein shake + banana\n• Chocolate milk (surprisingly good!)\n• Yogurt + granola\n\n**Full meal:**\n• Chicken breast + rice + vegetables\n• Eggs + toast + avocado\n• Salmon + sweet potato\n• Tuna + pasta\n\n**Key:** Protein for recovery + carbs to replenish glycogen. The "anabolic window" is less critical than total daily intake.',
      ar: '🍗 أفكار أكل بعد التمرين (كل خلال ساعة):\n\n**أوبشنز سريعة:**\n• واي بروتين شيك + موز\n• لبن شوكولاتة (مفيد فعلاً!)\n• زبادي + جرانولا\n\n**وجبة كاملة:**\n• صدور فراخ + رز + خضار\n• بيض + توست + أفوكادو\n• سلمون + بطاطا حلوة\n• تونة + مكرونة\n\n**المفتاح:** بروتين للريكفري + كارب لتعويض الجلايكوجين. "النافذة الأنابوليكية" مش حرجة أوي — المهم إجمالي أكلك اليومي.',
    },
    back: 'NT_WORKOUT_MEALS',
    options: [
      { id: 'ntpow1', label: { en: 'Post-workout supplements', ar: 'مكملات بعد التمرين' }, icon: '💊', nextState: 'SP_POST_WORKOUT' },
      { id: 'ntpow2', label: { en: 'Log post-workout meal', ar: 'سجّل أكل بعد التمرين' }, icon: '📝', nextState: 'NT_LOG_MEAL' },
      { id: 'ntpow3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_WORKOUT_MEALS' },
    ],
  },

  {
    id: 'NT_REST_DAY',
    domain: 'nutrition',
    text: { en: 'Rest Day Nutrition', ar: 'أكل يوم الراحة' },
    botMessage: {
      en: '😴 Rest Day Nutrition Tips:\n\n• Reduce carbs slightly (20-30% less)\n• Keep protein the same (or slightly higher)\n• Eat at maintenance or slight deficit\n• Focus on anti-inflammatory foods\n• Stay hydrated (2-3L water)\n\n**Good rest day foods:**\n• Eggs + vegetables\n• Fish + salad\n• Greek yogurt + berries\n• Lean protein + vegetables\n• Nuts and seeds (moderate)',
      ar: '😴 نصايح أكل يوم الراحة:\n\n• قلّل الكارب شوية (20-30% أقل)\n• خلّي البروتين زي ما هو (أو زوّد شوية)\n• كل على الـ maintenance أو عجز خفيف\n• ركّز على أكل مضاد للالتهاب\n• اشرب مية (2-3 لتر)\n\n**أكل كويس ليوم الراحة:**\n• بيض + خضار\n• سمك + سلطة\n• زبادي يوناني + فراولة\n• بروتين خفيف + خضار\n• مكسرات (باعتدال)',
    },
    back: 'NT_WORKOUT_MEALS',
    options: [
      { id: 'ntrd1', label: { en: 'Log a meal', ar: 'سجّل وجبة' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'ntrd2', label: { en: 'Recovery tips', ar: 'نصايح ريكفري' }, icon: '😴', nextState: 'RC_MENU' },
      { id: 'ntrd3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_WORKOUT_MEALS' },
    ],
  },

  // ─── Egyptian Food Guide ──────────────────────────────────
  {
    id: 'NT_EGYPTIAN',
    domain: 'nutrition',
    text: { en: 'Egyptian Food Guide', ar: 'دليل الأكل المصري' },
    botMessage: {
      en: '🇪🇬 Egyptian Food Categories:',
      ar: '🇪🇬 فئات الأكل المصري:',
    },
    back: 'NT_MENU',
    options: [
      { id: 'nte1', label: { en: 'Breakfast (Foul, Ta3meya)', ar: 'فطار (فول، طعمية)' }, icon: '🌅', nextState: 'NT_EG_BREAKFAST' },
      { id: 'nte2', label: { en: 'Street food (Koshary, Shawerma)', ar: 'أكل الشارع (كشري، شاورما)' }, icon: '🌯', nextState: 'NT_EG_STREET' },
      { id: 'nte3', label: { en: 'Home cooking', ar: 'أكل بيتي' }, icon: '🍲', nextState: 'NT_EG_HOME' },
      { id: 'nte4', label: { en: 'Grills & Meats', ar: 'مشويات ولحوم' }, icon: '🥩', nextState: 'NT_EG_GRILLS' },
      { id: 'nte5', label: { en: 'Desserts', ar: 'حلويات' }, icon: '🍰', nextState: 'NT_EG_DESSERTS' },
      { id: 'nte6', label: { en: 'Drinks (Juice, Sahlab)', ar: 'مشروبات (عصير، سحلب)' }, icon: '🥤', nextState: 'NT_EG_DRINKS' },
      { id: 'nte7', label: { en: 'Ramadan (Iftar/Suhoor)', ar: 'رمضان (إفطار/سحور)' }, icon: '🌙', nextState: 'NT_EG_RAMADAN' },
      { id: 'nte8', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  // Egyptian food sub-categories (7 states)
  ...([
    { id: 'BREAKFAST', en: 'Egyptian Breakfast', ar: 'فطار مصري', cat: 'egyptian_breakfast' },
    { id: 'STREET', en: 'Street Food', ar: 'أكل الشارع', cat: 'egyptian_street' },
    { id: 'HOME', en: 'Home Cooking', ar: 'أكل بيتي', cat: 'egyptian_home' },
    { id: 'GRILLS', en: 'Grills & Meats', ar: 'مشويات ولحوم', cat: 'egyptian_grills' },
    { id: 'DESSERTS', en: 'Desserts', ar: 'حلويات', cat: 'egyptian_desserts' },
    { id: 'DRINKS_EG', en: 'Egyptian Drinks', ar: 'مشروبات مصرية', cat: 'egyptian_drinks' },
    { id: 'RAMADAN', en: 'Ramadan Foods', ar: 'أكل رمضان', cat: 'ramadan' },
  ] as const).map(sub => ({
    id: `NT_EG_${sub.id}`,
    domain: 'nutrition' as const,
    text: { en: sub.en, ar: sub.ar },
    botMessage: { en: `${sub.en} with calorie counts:`, ar: `${sub.ar} مع السعرات:` },
    dynamic: true,
    onEnter: { type: 'fetch' as const, endpoint: '/foods', params: { category: sub.cat, isEgyptian: 'true' } },
    back: 'NT_EGYPTIAN',
    options: [
      { id: `nteg${sub.id}1`, label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: `nteg${sub.id}2`, label: { en: 'Healthier version', ar: 'نسخة صحية' }, icon: '🔄', nextState: 'NT_ALTERNATIVES' },
      { id: `nteg${sub.id}3`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_EGYPTIAN' },
    ],
  } as ChatState)),

  // ─── Healthy Alternatives ─────────────────────────────────
  {
    id: 'NT_ALTERNATIVES',
    domain: 'nutrition',
    text: { en: 'Healthy Alternatives', ar: 'بدائل صحية' },
    botMessage: {
      en: '🔄 Popular Healthy Swaps:\n\n• White rice → Brown rice / Quinoa\n• Bread → Whole wheat bread / Oat bread\n• Sugar → Stevia / Honey (moderate)\n• Soda → Sparkling water + lemon\n• Frying → Air frying / Grilling\n• Mayo → Greek yogurt + mustard\n• Chips → Baked sweet potato chips\n• Ice cream → Frozen banana blend\n• White pasta → Whole wheat / Lentil pasta\n• Juice → Whole fruit + water',
      ar: '🔄 بدائل صحية شائعة:\n\n• رز أبيض → رز بني / كينوا\n• عيش أبيض → عيش سن / عيش شوفان\n• سكر → ستيفيا / عسل (باعتدال)\n• مشروبات غازية → مياه غازية + ليمون\n• قلي → Air fryer / شوي\n• مايونيز → زبادي يوناني + مسطردة\n• شيبسي → شيبسي بطاطا حلوة مشوية\n• آيس كريم → موز مجمد مضروب\n• مكرونة بيضاء → مكرونة سن / مكرونة عدس\n• عصير → فاكهة كاملة + مية',
    },
    back: 'NT_MENU',
    options: [
      { id: 'nta1', label: { en: 'Search specific food', ar: 'دوّر على أكل معين' }, icon: '🔍', nextState: 'NT_SEARCH' },
      { id: 'nta2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_MENU' },
    ],
  },

  // ─── Stub states referenced by other domains ──────────────
  {
    id: 'NT_HIGH_PROTEIN',
    domain: 'nutrition',
    text: { en: 'High Protein Foods', ar: 'أكل عالي بروتين' },
    botMessage: { en: 'High protein food results:', ar: 'نتايج أكل عالي بروتين:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/foods', params: { highProtein: 'true' } },
    back: 'NT_SUGGEST',
    options: [
      { id: 'nthp1', label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: 'nthp2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SUGGEST' },
    ],
  },

  {
    id: 'NT_LOW_CAL',
    domain: 'nutrition',
    text: { en: 'Low Calorie Foods', ar: 'أكل قليل سعرات' },
    botMessage: { en: 'Low calorie food results:', ar: 'نتايج أكل قليل سعرات:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/foods', params: { lowCal: 'true' } },
    back: 'NT_SUGGEST',
    options: [
      { id: 'ntlc1', label: { en: 'Log this food', ar: 'سجّل الأكل ده' }, icon: '✅', nextState: 'NT_LOG_PORTION' },
      { id: 'ntlc2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SUGGEST' },
    ],
  },

  {
    id: 'NT_QUICK_MEALS',
    domain: 'nutrition',
    text: { en: 'Quick & Easy Meals', ar: 'وجبات سريعة وسهلة' },
    botMessage: {
      en: '⚡ Quick Meal Ideas (5-10 min):\n\n1. Greek yogurt + protein powder + granola\n2. Tuna + toast + cucumber\n3. Eggs (scrambled) + cheese + toast\n4. Protein shake + banana + oats\n5. Cottage cheese + fruit + honey\n6. Avocado toast + eggs\n7. Chicken wrap (pre-cooked chicken)\n8. Rice cakes + peanut butter + banana',
      ar: '⚡ أفكار وجبات سريعة (5-10 دقايق):\n\n1. زبادي يوناني + بروتين باودر + جرانولا\n2. تونة + توست + خيار\n3. بيض مقلي + جبنة + توست\n4. بروتين شيك + موز + شوفان\n5. جبنة قريش + فاكهة + عسل\n6. أفوكادو توست + بيض\n7. راب فراخ (فراخ مطبوخة جاهزة)\n8. رايس كيك + زبدة فول سوداني + موز',
    },
    back: 'NT_SUGGEST',
    options: [
      { id: 'ntqm1', label: { en: 'Log a meal', ar: 'سجّل وجبة' }, icon: '📝', nextState: 'NT_LOG_MEAL' },
      { id: 'ntqm2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'NT_SUGGEST' },
    ],
  },
];
