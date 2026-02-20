import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// SUPPLEMENTS DOMAIN (~30 states)
// ═══════════════════════════════════════════════════════════════

export const supplementStates: ChatState[] = [
  {
    id: 'SP_MENU',
    domain: 'supplements',
    text: { en: 'Supplements', ar: 'المكملات' },
    botMessage: { en: '💊 What do you want to know about supplements?', ar: '💊 عايز تعرف ايه عن المكملات؟' },
    back: 'ROOT',
    options: [
      { id: 'sp1', label: { en: 'What should I take?', ar: 'آخد ايه؟' }, icon: '❓', nextState: 'SP_RECOMMEND' },
      { id: 'sp2', label: { en: 'Pre-workout', ar: 'قبل التمرين' }, icon: '⚡', nextState: 'SP_PRE_WORKOUT' },
      { id: 'sp3', label: { en: 'Post-workout', ar: 'بعد التمرين' }, icon: '🏁', nextState: 'SP_POST_WORKOUT' },
      { id: 'sp4', label: { en: 'Protein powders', ar: 'بروتين باودر' }, icon: '🥤', nextState: 'SP_PROTEIN' },
      { id: 'sp5', label: { en: 'Creatine', ar: 'كرياتين' }, icon: '💪', nextState: 'SP_CREATINE' },
      { id: 'sp6', label: { en: 'Vitamins & Minerals', ar: 'فيتامينات ومعادن' }, icon: '💊', nextState: 'SP_VITAMINS' },
      { id: 'sp7', label: { en: 'Sleep supplements', ar: 'مكملات النوم' }, icon: '😴', nextState: 'SP_SLEEP' },
      { id: 'sp8', label: { en: 'Fat burners', ar: 'حوارق دهون' }, icon: '🔥', nextState: 'SP_FAT_BURN' },
      { id: 'sp9', label: { en: 'Where to buy (Egypt)', ar: 'فين أشتري (مصر)' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'sp10', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'SP_RECOMMEND',
    domain: 'supplements',
    text: { en: 'Supplement Recommendations', ar: 'مكملات مقترحة' },
    botMessage: {
      en: '💊 **Essential Supplements (what actually works):**\n\n**Tier 1 — Must-have:**\n1. 🥤 **Whey Protein** — fill your daily protein gap\n2. 💪 **Creatine Monohydrate** — 5g/day (most researched supplement ever)\n3. ☀️ **Vitamin D3** — 2000-5000 IU/day (especially in Egypt\'s indoor lifestyle)\n4. 🐟 **Omega-3 Fish Oil** — 1-2g EPA+DHA/day\n\n**Tier 2 — Nice to have:**\n5. 🧲 **Magnesium Glycinate** — 300-400mg before bed\n6. ☕ **Caffeine** — 200mg pre-workout\n7. 💊 **Multivitamin** — insurance policy\n\n**Skip these (waste of money):**\n❌ BCAAs (if you eat enough protein)\n❌ Fat burners\n❌ Testosterone boosters\n❌ Most "proprietary blends"',
      ar: '💊 **المكملات الأساسية (اللي بتفرق فعلاً):**\n\n**مستوى 1 — لازم:**\n1. 🥤 **واي بروتين** — كمّل احتياجك اليومي من البروتين\n2. 💪 **كرياتين مونوهيدرات** — 5 جم/يوم (أكتر مكمل متدروس)\n3. ☀️ **فيتامين D3** — 2000-5000 وحدة/يوم\n4. 🐟 **أوميجا 3** — 1-2 جم EPA+DHA/يوم\n\n**مستوى 2 — كويس تاخده:**\n5. 🧲 **ماغنسيوم** — 300-400 ملج قبل النوم\n6. ☕ **كافيين** — 200 ملج قبل التمرين\n7. 💊 **ملتي فيتامين** — تأمين\n\n**اتجنب دول (فلوس ضايعة):**\n❌ BCAAs (لو بتاكل بروتين كفاية)\n❌ حوارق دهون\n❌ رافعات تستوستيرون\n❌ معظم "الخلطات المسجلة"',
    },
    back: 'SP_MENU',
    options: [
      { id: 'spr1', label: { en: 'Protein details', ar: 'تفاصيل البروتين' }, icon: '🥤', nextState: 'SP_PROTEIN' },
      { id: 'spr2', label: { en: 'Creatine details', ar: 'تفاصيل الكرياتين' }, icon: '💪', nextState: 'SP_CREATINE' },
      { id: 'spr3', label: { en: 'Where to buy', ar: 'فين أشتري' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'spr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_PRE_WORKOUT',
    domain: 'supplements',
    text: { en: 'Pre-Workout', ar: 'قبل التمرين' },
    botMessage: {
      en: '⚡ **Pre-Workout Guide:**\n\n**Simple option:** Black coffee (200mg caffeine)\n\n**Pre-workout supplement — what to look for:**\n• Caffeine: 150-300mg\n• Citrulline: 6-8g\n• Beta-Alanine: 3-6g (causes tingling — normal)\n• Creatine: 5g (can take anytime)\n\n**Timing:** 30-45 minutes before training\n\n⚠️ Don\'t take after 4 PM (affects sleep)\n⚠️ Start with half scoop if new to it\n⚠️ Cycle off for 1-2 weeks every 8 weeks',
      ar: '⚡ **دليل البري وركاوت:**\n\n**الخيار البسيط:** قهوة سودا (200 ملج كافيين)\n\n**مكمل بري وركاوت — دوّر على:**\n• كافيين: 150-300 ملج\n• سيترولين: 6-8 جم\n• بيتا ألانين: 3-6 جم (بيعمل تنميل — طبيعي)\n• كرياتين: 5 جم (تقدر تاخده أي وقت)\n\n**التوقيت:** قبل التمرين بـ 30-45 دقيقة\n\n⚠️ متاخدوش بعد 4 العصر (بيأثر على النوم)\n⚠️ ابدأ بنص سكوب لو أول مرة\n⚠️ وقّفه أسبوع-أسبوعين كل 8 أسابيع',
    },
    back: 'SP_MENU',
    options: [
      { id: 'sppw1', label: { en: 'Browse pre-workouts', ar: 'تصفّح بري وركاوت' }, icon: '🔍', nextState: 'SP_BROWSE_PRE',
        action: { type: 'fetch', endpoint: '/foods', params: { category: 'supplement', tags: 'pre_workout' } } },
      { id: 'sppw2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_POST_WORKOUT',
    domain: 'supplements',
    text: { en: 'Post-Workout', ar: 'بعد التمرين' },
    botMessage: {
      en: '🏁 **Post-Workout Supplements:**\n\n**Must:**\n• 🥤 Whey Protein — 25-40g within 1 hour\n\n**Optional but helpful:**\n• 🍌 Fast carbs — banana, honey, dextrose (refuel glycogen)\n• 💪 Creatine — 5g (if not taken pre)\n• 🧲 Magnesium — aids recovery\n\n**Timing tip:** The "anabolic window" is a myth — total daily intake matters more. But protein within 2 hours is still good practice.',
      ar: '🏁 **مكملات بعد التمرين:**\n\n**لازم:**\n• 🥤 واي بروتين — 25-40 جم خلال ساعة\n\n**اختياري بس مفيد:**\n• 🍌 كارب سريع — موز، عسل (تعويض الجلايكوجين)\n• 💪 كرياتين — 5 جم (لو ماخدتوش قبل)\n• 🧲 ماغنسيوم — بيساعد الريكفري\n\n**نصيحة:** "النافذة الأنابوليكية" خرافة — إجمالي أكلك اليومي أهم. بس البروتين خلال ساعتين لسه ممارسة كويسة.',
    },
    back: 'SP_MENU',
    options: [
      { id: 'sppow1', label: { en: 'Best protein powders', ar: 'أحسن بروتين باودر' }, icon: '🥤', nextState: 'SP_PROTEIN' },
      { id: 'sppow2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_PROTEIN',
    domain: 'supplements',
    text: { en: 'Protein Powders', ar: 'بروتين باودر' },
    botMessage: {
      en: '🥤 **Protein Powder Guide:**\n\n**Types:**\n• **Whey Concentrate** — cheapest, 70-80% protein, good enough\n• **Whey Isolate** — purer, 90%+ protein, less lactose\n• **Casein** — slow-digesting, great before bed\n• **Plant-based** — pea, rice, hemp (for vegans)\n\n**How much?** Fill the gap between food protein and your target (1.6-2.2g/kg)\n\n**When?** Any time — post-workout, between meals, or before bed (casein)\n\n**Egypt-available brands:** Optimum Nutrition, Muscletech, Dymatize, Rule1',
      ar: '🥤 **دليل البروتين باودر:**\n\n**الأنواع:**\n• **واي كونسنتريت** — أرخص، 70-80% بروتين، كفاية\n• **واي أيزوليت** — أنقى، 90%+ بروتين، لاكتوز أقل\n• **كازين** — بطيء الهضم، ممتاز قبل النوم\n• **نباتي** — بازلاء، أرز (للنباتيين)\n\n**كام؟** كمّل الفرق بين بروتين أكلك وهدفك (1.6-2.2 جم/كجم)\n\n**امتى؟** أي وقت — بعد التمرين، بين الوجبات، أو قبل النوم (كازين)\n\n**براندات في مصر:** Optimum Nutrition, Muscletech, Dymatize, Rule1',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/foods', params: { category: 'supplement', tags: 'protein' } },
    back: 'SP_MENU',
    options: [
      { id: 'spp1', label: { en: 'Where to buy', ar: 'فين أشتري' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'spp2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_CREATINE',
    domain: 'supplements',
    text: { en: 'Creatine', ar: 'كرياتين' },
    botMessage: {
      en: '💪 **Creatine — The #1 Supplement:**\n\n**What:** Creatine monohydrate (most researched form)\n**Dose:** 5g per day, every day\n**When:** Any time (doesn\'t matter)\n**Loading?** Not necessary — just take 5g/day\n\n**Benefits:**\n• +5-10% strength gains\n• Better muscle recovery\n• Improved brain function\n• Safe long-term (100+ studies)\n\n**Side effects:**\n• Weight gain (water, not fat — 1-2kg)\n• Drink extra water\n\n**Myths debunked:**\n❌ Does NOT cause kidney damage (in healthy people)\n❌ Does NOT cause hair loss\n❌ You don\'t need to cycle it',
      ar: '💪 **كرياتين — المكمل رقم 1:**\n\n**ايه:** كرياتين مونوهيدرات (أكتر نوع متدروس)\n**الجرعة:** 5 جم يومياً، كل يوم\n**امتى:** أي وقت (مش فارقة)\n**تحميل؟** مش ضروري — خد 5 جم/يوم\n\n**الفوايد:**\n• +5-10% زيادة في القوة\n• ريكفري عضلات أحسن\n• تحسين وظائف المخ\n• آمن على المدى الطويل (100+ دراسة)\n\n**آثار جانبية:**\n• زيادة وزن (مية مش دهون — 1-2 كيلو)\n• اشرب مية زيادة\n\n**خرافات:**\n❌ مش بيضر الكلى (في الناس الصحية)\n❌ مش بيسبب صلع\n❌ مش محتاج توقفه',
    },
    back: 'SP_MENU',
    options: [
      { id: 'spc1', label: { en: 'Where to buy', ar: 'فين أشتري' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'spc2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_VITAMINS',
    domain: 'supplements',
    text: { en: 'Vitamins & Minerals', ar: 'فيتامينات ومعادن' },
    botMessage: {
      en: '💊 **Essential Vitamins & Minerals:**\n\n☀️ **Vitamin D3** — 2000-5000 IU/day (most Egyptians are deficient!)\n🧲 **Magnesium** — 300-400mg/day (glycinate form, before bed)\n🐟 **Omega-3** — 1-2g EPA+DHA/day\n💊 **Zinc** — 15-30mg/day (if deficient)\n🩸 **Iron** — only if blood test shows deficiency\n💊 **B12** — if vegetarian/vegan\n🍊 **Vitamin C** — 500-1000mg/day (immune support)\n\n**Get blood work first** — don\'t blindly supplement. Test Vitamin D, B12, Iron, and Zinc.',
      ar: '💊 **فيتامينات ومعادن أساسية:**\n\n☀️ **فيتامين D3** — 2000-5000 وحدة/يوم (معظم المصريين عندهم نقص!)\n🧲 **ماغنسيوم** — 300-400 ملج/يوم (نوع glycinate، قبل النوم)\n🐟 **أوميجا 3** — 1-2 جم EPA+DHA/يوم\n💊 **زنك** — 15-30 ملج/يوم (لو عندك نقص)\n🩸 **حديد** — بس لو التحليل بيقول نقص\n💊 **B12** — لو نباتي\n🍊 **فيتامين C** — 500-1000 ملج/يوم\n\n**اعمل تحاليل الأول** — متاخدش مكملات عشوائي. حلّل فيتامين D، B12، حديد، وزنك.',
    },
    back: 'SP_MENU',
    options: [
      { id: 'spv1', label: { en: 'Get blood work guide', ar: 'دليل التحاليل' }, icon: '🩸', nextState: 'HL_BLOOD_GUIDE' },
      { id: 'spv2', label: { en: 'Where to buy', ar: 'فين أشتري' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'spv3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_SLEEP',
    domain: 'supplements',
    text: { en: 'Sleep Supplements', ar: 'مكملات النوم' },
    botMessage: {
      en: '😴 **Sleep Supplements:**\n\n**Proven:**\n• 🧲 **Magnesium Glycinate** — 300-400mg, 30 min before bed\n• 🌙 **Melatonin** — 0.5-3mg (start LOW), 30 min before bed\n• 🍵 **L-Theanine** — 200mg, promotes relaxation\n\n**Herbal (mild):**\n• 🌿 Valerian root\n• 🌼 Chamomile tea\n• 🌾 Ashwagandha — also reduces cortisol\n\n⚠️ Don\'t rely on supplements alone — fix sleep hygiene first!\n⚠️ Melatonin is for timing, not sedation — keep dose low',
      ar: '😴 **مكملات النوم:**\n\n**مثبت:**\n• 🧲 **ماغنسيوم Glycinate** — 300-400 ملج، قبل النوم بنص ساعة\n• 🌙 **ميلاتونين** — 0.5-3 ملج (ابدأ قليل)، قبل النوم بنص ساعة\n• 🍵 **L-Theanine** — 200 ملج، بيساعد على الاسترخاء\n\n**أعشاب (خفيفة):**\n• 🌿 حشيشة الهر\n• 🌼 شاي بابونج\n• 🌾 اشواغاندا — كمان بتقلل الكورتيزول\n\n⚠️ متعتمدش على المكملات بس — صلّح عادات النوم الأول!\n⚠️ الميلاتونين للتوقيت مش للتخدير — خلّي الجرعة قليلة',
    },
    back: 'SP_MENU',
    options: [
      { id: 'sps1', label: { en: 'Sleep improvement tips', ar: 'نصايح تحسين النوم' }, icon: '💡', nextState: 'HL_SLEEP_TIPS' },
      { id: 'sps2', label: { en: 'Where to buy', ar: 'فين أشتري' }, icon: '🏪', nextState: 'SP_BUY' },
      { id: 'sps3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_FAT_BURN',
    domain: 'supplements',
    text: { en: 'Fat Burners', ar: 'حوارق دهون' },
    botMessage: {
      en: '🔥 **The Truth About Fat Burners:**\n\n⚠️ Most fat burners are a WASTE of money.\n\nThe only thing that burns fat is a **calorie deficit**.\n\n**What actually helps:**\n• ☕ Caffeine (200-400mg) — slight metabolic boost\n• 🍵 Green tea extract — minor effect\n• 💪 Building muscle — increases BMR\n• 🏃 Exercise — creates deficit\n• 😴 Sleep — poor sleep = more hunger\n\n**What doesn\'t work:**\n❌ "Thermogenic" pills\n❌ CLA\n❌ Garcinia cambogia\n❌ Raspberry ketones\n❌ Anything promising "fast weight loss"\n\n💡 Save your money — spend it on quality food instead.',
      ar: '🔥 **الحقيقة عن حوارق الدهون:**\n\n⚠️ معظم حوارق الدهون فلوس ضايعة.\n\nالحاجة الوحيدة اللي بتحرق دهون هي **عجز سعرات**.\n\n**اللي بيفرق فعلاً:**\n• ☕ كافيين (200-400 ملج) — تحسين طفيف في الأيض\n• 🍵 شاي أخضر — تأثير بسيط\n• 💪 بناء عضل — بيزوّد الأيض\n• 🏃 تمارين — بتعمل عجز\n• 😴 نوم — نوم سيء = جوع أكتر\n\n**اللي مش بيفرق:**\n❌ حبوب "thermogenic"\n❌ CLA\n❌ جارسينيا\n❌ كيتونات التوت\n❌ أي حاجة بتوعد بـ "خسارة وزن سريعة"\n\n💡 وفّر فلوسك — صرفها على أكل كويس أحسن.',
    },
    back: 'SP_MENU',
    options: [
      { id: 'spfb1', label: { en: 'Calorie calculator', ar: 'حاسبة السعرات' }, icon: '🔢', nextState: 'NT_CALC' },
      { id: 'spfb2', label: { en: 'Weight loss meal plan', ar: 'خطة تنحيف' }, icon: '📋', nextState: 'NT_PLAN_LOSS' },
      { id: 'spfb3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_MENU' },
    ],
  },

  {
    id: 'SP_BUY',
    domain: 'supplements',
    text: { en: 'Where to Buy (Egypt)', ar: 'فين أشتري (مصر)' },
    botMessage: {
      en: '🏪 **Where to Buy Supplements in Egypt:**\n\n**Online:**\n• iHerb.com — international brands, ships to Egypt\n• Amazon.eg\n• Sporter.com\n• Protein.eg\n\n**Physical stores:**\n• GNC stores\n• Body Zone\n• Protein House\n• Gym shops (most gyms sell basics)\n\n**Tips:**\n• Always check expiry dates\n• Buy from authorized retailers\n• Beware of fake/counterfeit products\n• Compare prices across stores\n• iHerb often has the best prices for vitamins',
      ar: '🏪 **فين تشتري مكملات في مصر:**\n\n**أونلاين:**\n• iHerb.com — براندات عالمية، بيوصّل مصر\n• Amazon.eg\n• Sporter.com\n• Protein.eg\n\n**محلات:**\n• GNC\n• Body Zone\n• Protein House\n• محلات الجيم (معظم الجيمات بتبيع الأساسيات)\n\n**نصايح:**\n• دايماً شيك تاريخ الصلاحية\n• اشتري من وكلاء معتمدين\n• خلّي بالك من المنتجات المقلدة\n• قارن الأسعار بين المحلات\n• iHerb غالباً أرخص للفيتامينات',
    },
    back: 'SP_MENU',
    options: [
      { id: 'spb1', label: { en: 'Back to Supplements', ar: 'رجوع للمكملات' }, icon: '💊', nextState: 'SP_MENU' },
      { id: 'spb2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'SP_BROWSE_PRE',
    domain: 'supplements',
    text: { en: 'Pre-Workout Products', ar: 'منتجات بري وركاوت' },
    botMessage: { en: 'Pre-workout supplements from our database:', ar: 'مكملات بري وركاوت من قاعدة بياناتنا:' },
    dynamic: true,
    back: 'SP_PRE_WORKOUT',
    options: [
      { id: 'spbp1', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'SP_PRE_WORKOUT' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// PROGRAMS & PLANS DOMAIN (~25 states)
// ═══════════════════════════════════════════════════════════════

export const programStates: ChatState[] = [
  {
    id: 'PG_MENU',
    domain: 'programs',
    text: { en: 'Programs & Plans', ar: 'البرامج والخطط' },
    botMessage: { en: '📋 Workout programs and training plans:', ar: '📋 برامج تمارين وخطط تدريب:' },
    back: 'ROOT',
    options: [
      { id: 'pg1', label: { en: 'Browse programs', ar: 'تصفّح البرامج' }, icon: '📖', nextState: 'PG_BROWSE' },
      { id: 'pg2', label: { en: 'My active program', ar: 'برنامجي الحالي' }, icon: '📋', nextState: 'PG_ACTIVE' },
      { id: 'pg3', label: { en: 'Find by goal', ar: 'دوّر حسب الهدف' }, icon: '🎯', nextState: 'PG_BY_GOAL' },
      { id: 'pg4', label: { en: 'Find by level', ar: 'دوّر حسب المستوى' }, icon: '📊', nextState: 'PG_BY_LEVEL' },
      { id: 'pg5', label: { en: 'Find by duration', ar: 'دوّر حسب المدة' }, icon: '📅', nextState: 'PG_BY_DURATION' },
      { id: 'pg6', label: { en: 'Popular programs', ar: 'برامج شائعة' }, icon: '🔥', nextState: 'PG_POPULAR' },
      { id: 'pg7', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'PG_BROWSE',
    domain: 'programs',
    text: { en: 'Browse Programs', ar: 'تصفّح البرامج' },
    botMessage: { en: 'All available programs:', ar: 'كل البرامج المتاحة:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/programs' },
    back: 'PG_MENU',
    options: [
      { id: 'pgb1', label: { en: 'Start this program', ar: 'ابدأ البرنامج ده' }, icon: '▶️', nextState: 'PG_START_CONFIRM',
        action: { type: 'write', endpoint: '/programs/start',
          requiresConfirmation: true, confirmText: { en: 'Start this workout program?', ar: 'تبدأ البرنامج ده؟' } } },
      { id: 'pgb2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📖', nextState: 'PG_DETAIL' },
      { id: 'pgb3', label: { en: 'Filter', ar: 'فلتر' }, icon: '🔍', nextState: 'PG_BY_GOAL' },
      { id: 'pgb4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_ACTIVE',
    domain: 'programs',
    text: { en: 'My Active Program', ar: 'برنامجي الحالي' },
    botMessage: { en: 'Your current active program:', ar: 'برنامجك الحالي:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/programs/active' },
    back: 'PG_MENU',
    options: [
      { id: 'pga1', label: { en: 'Today\'s workout', ar: 'تمرين النهارده' }, icon: '📅', nextState: 'WK_TODAY' },
      { id: 'pga2', label: { en: 'View full program', ar: 'شوف البرنامج كله' }, icon: '📖', nextState: 'PG_DETAIL' },
      { id: 'pga3', label: { en: 'Switch program', ar: 'غيّر البرنامج' }, icon: '🔄', nextState: 'PG_BROWSE',
        action: { type: 'write', requiresConfirmation: true,
          confirmText: { en: 'Switch to a different program? Current progress will be saved.', ar: 'تغيّر لبرنامج تاني؟ تقدمك الحالي هيتحفظ.' } } },
      { id: 'pga4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_BY_GOAL',
    domain: 'programs',
    text: { en: 'Programs by Goal', ar: 'برامج حسب الهدف' },
    botMessage: { en: 'What\'s your main goal?', ar: 'هدفك الأساسي ايه؟' },
    back: 'PG_MENU',
    options: [
      { id: 'pgg1', label: { en: 'Muscle gain', ar: 'زيادة عضل' }, icon: '💪', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'muscle_gain' } } },
      { id: 'pgg2', label: { en: 'Fat loss', ar: 'حرق دهون' }, icon: '🔥', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'fat_loss' } } },
      { id: 'pgg3', label: { en: 'Strength', ar: 'قوة' }, icon: '🏋️', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'strength' } } },
      { id: 'pgg4', label: { en: 'Endurance', ar: 'تحمل' }, icon: '🏃', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'endurance' } } },
      { id: 'pgg5', label: { en: 'General fitness', ar: 'لياقة عامة' }, icon: '🎯', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'general' } } },
      { id: 'pgg6', label: { en: 'Body recomposition', ar: 'إعادة تشكيل الجسم' }, icon: '📊', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { goal: 'recomp' } } },
      { id: 'pgg7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_BY_LEVEL',
    domain: 'programs',
    text: { en: 'Programs by Level', ar: 'برامج حسب المستوى' },
    botMessage: { en: 'What\'s your experience level?', ar: 'مستوى خبرتك ايه؟' },
    back: 'PG_MENU',
    options: [
      { id: 'pgl1', label: { en: 'Beginner (0-6 months)', ar: 'مبتدئ (0-6 شهور)' }, icon: '🟢', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { level: 'beginner' } } },
      { id: 'pgl2', label: { en: 'Intermediate (6-24 months)', ar: 'متوسط (6-24 شهر)' }, icon: '🟡', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { level: 'intermediate' } } },
      { id: 'pgl3', label: { en: 'Advanced (2+ years)', ar: 'متقدم (2+ سنة)' }, icon: '🔴', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { level: 'advanced' } } },
      { id: 'pgl4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_BY_DURATION',
    domain: 'programs',
    text: { en: 'Programs by Duration', ar: 'برامج حسب المدة' },
    botMessage: { en: 'How long of a program?', ar: 'عايز برنامج مدته قد ايه؟' },
    back: 'PG_MENU',
    options: [
      { id: 'pgd1', label: { en: '4 weeks', ar: '4 أسابيع' }, icon: '📅', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { weeks: '4' } } },
      { id: 'pgd2', label: { en: '8 weeks', ar: '8 أسابيع' }, icon: '📅', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { weeks: '8' } } },
      { id: 'pgd3', label: { en: '12 weeks', ar: '12 أسبوع' }, icon: '📅', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { weeks: '12' } } },
      { id: 'pgd4', label: { en: '16+ weeks', ar: '16+ أسبوع' }, icon: '📅', nextState: 'PG_RESULTS',
        action: { type: 'fetch', endpoint: '/programs', params: { weeks: '16' } } },
      { id: 'pgd5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_POPULAR',
    domain: 'programs',
    text: { en: 'Popular Programs', ar: 'برامج شائعة' },
    botMessage: { en: 'Most popular programs:', ar: 'أشهر البرامج:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/programs', params: { sort: 'popular' } },
    back: 'PG_MENU',
    options: [
      { id: 'pgp1', label: { en: 'Start program', ar: 'ابدأ البرنامج' }, icon: '▶️', nextState: 'PG_START_CONFIRM',
        action: { type: 'write', endpoint: '/programs/start',
          requiresConfirmation: true, confirmText: { en: 'Start this program?', ar: 'تبدأ البرنامج ده؟' } } },
      { id: 'pgp2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📖', nextState: 'PG_DETAIL' },
      { id: 'pgp3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_RESULTS',
    domain: 'programs',
    text: { en: 'Program Results', ar: 'نتائج البرامج' },
    botMessage: { en: 'Programs matching your criteria:', ar: 'البرامج اللي بتناسب معاييرك:' },
    dynamic: true,
    back: 'PG_MENU',
    options: [
      { id: 'pgr1', label: { en: 'Start program', ar: 'ابدأ البرنامج' }, icon: '▶️', nextState: 'PG_START_CONFIRM',
        action: { type: 'write', endpoint: '/programs/start',
          requiresConfirmation: true, confirmText: { en: 'Start this program?', ar: 'تبدأ البرنامج ده؟' } } },
      { id: 'pgr2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📖', nextState: 'PG_DETAIL' },
      { id: 'pgr3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_MENU' },
    ],
  },

  {
    id: 'PG_DETAIL',
    domain: 'programs',
    text: { en: 'Program Details', ar: 'تفاصيل البرنامج' },
    botMessage: { en: 'Program details:', ar: 'تفاصيل البرنامج:' },
    dynamic: true,
    back: 'PG_BROWSE',
    options: [
      { id: 'pgdt1', label: { en: 'Start this program', ar: 'ابدأ البرنامج ده' }, icon: '▶️', nextState: 'PG_START_CONFIRM',
        action: { type: 'write', endpoint: '/programs/start',
          requiresConfirmation: true, confirmText: { en: 'Start this program?', ar: 'تبدأ البرنامج ده؟' } } },
      { id: 'pgdt2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PG_BROWSE' },
    ],
  },

  {
    id: 'PG_START_CONFIRM',
    domain: 'programs',
    text: { en: 'Program Started', ar: 'البرنامج بدأ' },
    botMessage: {
      en: '✅ Program started! Your workout schedule has been updated. Check "Today\'s Workout" to see what\'s next.',
      ar: '✅ البرنامج بدأ! جدول تمارينك اتحدث. شوف "تمرين النهارده" عشان تعرف الجاي.',
    },
    back: 'PG_MENU',
    options: [
      { id: 'pgsc1', label: { en: 'Today\'s workout', ar: 'تمرين النهارده' }, icon: '📅', nextState: 'WK_TODAY' },
      { id: 'pgsc2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// PROGRESS & GOALS DOMAIN (~20 states)
// ═══════════════════════════════════════════════════════════════

export const progressStates: ChatState[] = [
  {
    id: 'PR_MENU',
    domain: 'progress',
    text: { en: 'Progress & Goals', ar: 'التقدم والأهداف' },
    botMessage: { en: '📊 Track your progress and goals:', ar: '📊 تابع تقدمك وأهدافك:' },
    back: 'ROOT',
    options: [
      { id: 'pr1', label: { en: 'View progress', ar: 'شوف التقدم' }, icon: '📈', nextState: 'PR_OVERVIEW' },
      { id: 'pr2', label: { en: 'Log weight', ar: 'سجّل الوزن' }, icon: '⚖️', nextState: 'PR_LOG_WEIGHT' },
      { id: 'pr3', label: { en: 'Set a goal', ar: 'حدد هدف' }, icon: '🎯', nextState: 'PR_SET_GOAL' },
      { id: 'pr4', label: { en: 'Weekly check-in', ar: 'تشيك إن أسبوعي' }, icon: '✅', nextState: 'PR_CHECKIN' },
      { id: 'pr5', label: { en: 'Achievements', ar: 'الإنجازات' }, icon: '🏆', nextState: 'PR_ACHIEVEMENTS' },
      { id: 'pr6', label: { en: 'Body measurements', ar: 'قياسات الجسم' }, icon: '📏', nextState: 'PR_MEASUREMENTS' },
      { id: 'pr7', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'PR_OVERVIEW',
    domain: 'progress',
    text: { en: 'Progress Overview', ar: 'ملخص التقدم' },
    botMessage: { en: 'Opening your progress dashboard...', ar: 'بفتحلك لوحة التقدم...' },
    back: 'PR_MENU',
    options: [
      { id: 'pro1', label: { en: 'Go to progress page', ar: 'روح لصفحة التقدم' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'pro2', label: { en: 'Log weight', ar: 'سجّل الوزن' }, icon: '⚖️', nextState: 'PR_LOG_WEIGHT' },
      { id: 'pro3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  {
    id: 'PR_LOG_WEIGHT',
    domain: 'progress',
    text: { en: 'Log Weight', ar: 'سجّل الوزن' },
    botMessage: { en: '⚖️ What\'s your weight today? (in kg)', ar: '⚖️ وزنك النهارده كام؟ (بالكيلو)' },
    back: 'PR_MENU',
    options: [
      ...([50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110].map((w, i) => ({
        id: `prlw${i}`,
        label: { en: `~${w} kg`, ar: `~${w} كجم` },
        icon: '⚖️',
        nextState: 'PR_WEIGHT_LOGGED',
        action: { type: 'write' as const, endpoint: '/health/log', params: { type: 'WEIGHT', value: String(w) },
          requiresConfirmation: true, confirmText: { en: `Log weight as ${w}kg?`, ar: `تسجّل الوزن ${w} كجم؟` } },
      }))),
      { id: 'prlw_exact', label: { en: 'Enter exact weight', ar: 'أدخل الوزن بالظبط' }, icon: '📝', nextState: 'ROOT',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'prlw_back', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  {
    id: 'PR_WEIGHT_LOGGED',
    domain: 'progress',
    text: { en: 'Weight Logged', ar: 'الوزن اتسجل' },
    botMessage: { en: '✅ Weight logged! Consistency in tracking is key.', ar: '✅ الوزن اتسجل! الاستمرارية في التتبع مفتاح النجاح.' },
    back: 'PR_MENU',
    options: [
      { id: 'prwl1', label: { en: 'View weight trend', ar: 'شوف اتجاه الوزن' }, icon: '📈', nextState: 'PR_OVERVIEW',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'prwl2', label: { en: 'Log body fat', ar: 'سجّل نسبة الدهون' }, icon: '📊', nextState: 'HL_BODY_FAT_LOG' },
      { id: 'prwl3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'PR_SET_GOAL',
    domain: 'progress',
    text: { en: 'Set a Goal', ar: 'حدد هدف' },
    botMessage: { en: 'What\'s your primary goal?', ar: 'هدفك الأساسي ايه؟' },
    back: 'PR_MENU',
    options: [
      { id: 'prsg1', label: { en: 'Lose weight', ar: 'أنحف' }, icon: '📉', nextState: 'PR_GOAL_CONFIRM',
        action: { type: 'write', endpoint: '/profile/set-goal', params: { goal: 'WEIGHT_LOSS' },
          requiresConfirmation: true, confirmText: { en: 'Set weight loss as your goal?', ar: 'تحدد التنحيف كهدفك؟' } } },
      { id: 'prsg2', label: { en: 'Gain muscle', ar: 'أزوّد عضل' }, icon: '💪', nextState: 'PR_GOAL_CONFIRM',
        action: { type: 'write', endpoint: '/profile/set-goal', params: { goal: 'MUSCLE_GAIN' },
          requiresConfirmation: true, confirmText: { en: 'Set muscle gain as your goal?', ar: 'تحدد زيادة العضل كهدفك؟' } } },
      { id: 'prsg3', label: { en: 'Get stronger', ar: 'أبقى أقوى' }, icon: '🏋️', nextState: 'PR_GOAL_CONFIRM',
        action: { type: 'write', endpoint: '/profile/set-goal', params: { goal: 'STRENGTH' },
          requiresConfirmation: true, confirmText: { en: 'Set strength as your goal?', ar: 'تحدد القوة كهدفك؟' } } },
      { id: 'prsg4', label: { en: 'Improve fitness', ar: 'أحسّن لياقتي' }, icon: '🏃', nextState: 'PR_GOAL_CONFIRM',
        action: { type: 'write', endpoint: '/profile/set-goal', params: { goal: 'GENERAL_FITNESS' },
          requiresConfirmation: true, confirmText: { en: 'Set general fitness as your goal?', ar: 'تحدد اللياقة العامة كهدفك؟' } } },
      { id: 'prsg5', label: { en: 'Body recomposition', ar: 'إعادة تشكيل الجسم' }, icon: '📊', nextState: 'PR_GOAL_CONFIRM',
        action: { type: 'write', endpoint: '/profile/set-goal', params: { goal: 'RECOMPOSITION' },
          requiresConfirmation: true, confirmText: { en: 'Set body recomp as your goal?', ar: 'تحدد إعادة تشكيل الجسم كهدفك؟' } } },
      { id: 'prsg6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  {
    id: 'PR_GOAL_CONFIRM',
    domain: 'progress',
    text: { en: 'Goal Set', ar: 'الهدف اتحدد' },
    botMessage: { en: '✅ Goal updated! Your workout and nutrition recommendations will adjust accordingly.', ar: '✅ الهدف اتحدث! توصيات التمارين والتغذية هتتظبط عليه.' },
    back: 'PR_MENU',
    options: [
      { id: 'prgc1', label: { en: 'Get a program', ar: 'ابدأ برنامج' }, icon: '📋', nextState: 'PG_BY_GOAL' },
      { id: 'prgc2', label: { en: 'Meal plan', ar: 'خطة وجبات' }, icon: '🥗', nextState: 'NT_PLAN_MENU' },
      { id: 'prgc3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'PR_CHECKIN',
    domain: 'progress',
    text: { en: 'Weekly Check-in', ar: 'تشيك إن أسبوعي' },
    botMessage: { en: 'Opening weekly check-in...', ar: 'بفتحلك التشيك إن الأسبوعي...' },
    back: 'PR_MENU',
    options: [
      { id: 'prci1', label: { en: 'Go to check-in page', ar: 'روح لصفحة التشيك إن' }, icon: '✅', nextState: 'ROOT',
        action: { type: 'navigate', route: '/check-in' } },
      { id: 'prci2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  {
    id: 'PR_ACHIEVEMENTS',
    domain: 'progress',
    text: { en: 'Achievements', ar: 'الإنجازات' },
    botMessage: { en: 'Opening achievements...', ar: 'بفتحلك الإنجازات...' },
    back: 'PR_MENU',
    options: [
      { id: 'pra1', label: { en: 'Go to achievements', ar: 'روح للإنجازات' }, icon: '🏆', nextState: 'ROOT',
        action: { type: 'navigate', route: '/achievements' } },
      { id: 'pra2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },

  {
    id: 'PR_MEASUREMENTS',
    domain: 'progress',
    text: { en: 'Body Measurements', ar: 'قياسات الجسم' },
    botMessage: { en: 'Opening body measurements...', ar: 'بفتحلك قياسات الجسم...' },
    back: 'PR_MENU',
    options: [
      { id: 'prms1', label: { en: 'Go to progress page', ar: 'روح لصفحة التقدم' }, icon: '📏', nextState: 'ROOT',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'prms2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'PR_MENU' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// RECOVERY & REST DOMAIN (~20 states)
// ═══════════════════════════════════════════════════════════════

export const recoveryStates: ChatState[] = [
  {
    id: 'RC_MENU',
    domain: 'recovery',
    text: { en: 'Recovery & Rest', ar: 'الريكفري والراحة' },
    botMessage: { en: '😴 Recovery is when gains happen. What do you need?', ar: '😴 الريكفري هو لما النتايج بتحصل. محتاج ايه؟' },
    back: 'ROOT',
    options: [
      { id: 'rc1', label: { en: 'Recovery score', ar: 'سكور الريكفري' }, icon: '🔋', nextState: 'HL_RECOVERY' },
      { id: 'rc2', label: { en: 'Stretching routines', ar: 'تمارين إطالة' }, icon: '🧘', nextState: 'RC_STRETCH_MENU' },
      { id: 'rc3', label: { en: 'Foam rolling', ar: 'Foam Rolling' }, icon: '🔄', nextState: 'RC_FOAM' },
      { id: 'rc4', label: { en: 'Sleep optimization', ar: 'تحسين النوم' }, icon: '😴', nextState: 'HL_SLEEP_TIPS' },
      { id: 'rc5', label: { en: 'Active recovery', ar: 'ريكفري نشط' }, icon: '🚶', nextState: 'RC_ACTIVE' },
      { id: 'rc6', label: { en: 'Cold/Heat therapy', ar: 'العلاج بالبرد/الحرارة' }, icon: '🧊', nextState: 'RC_COLD_HEAT' },
      { id: 'rc7', label: { en: 'Post-workout recovery', ar: 'ريكفري بعد التمرين' }, icon: '🏁', nextState: 'RC_POST_WORKOUT' },
      { id: 'rc8', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'RC_STRETCH_MENU',
    domain: 'recovery',
    text: { en: 'Stretching Routines', ar: 'تمارين إطالة' },
    botMessage: { en: 'When do you want to stretch?', ar: 'عايز تعمل إطالة امتى؟' },
    back: 'RC_MENU',
    options: [
      { id: 'rcs1', label: { en: 'Morning routine (5 min)', ar: 'روتين الصبح (5 دقايق)' }, icon: '🌅', nextState: 'RC_STRETCH_MORNING' },
      { id: 'rcs2', label: { en: 'Pre-workout (5 min)', ar: 'قبل التمرين (5 دقايق)' }, icon: '🏋️', nextState: 'WK_WARMUP' },
      { id: 'rcs3', label: { en: 'Post-workout (5 min)', ar: 'بعد التمرين (5 دقايق)' }, icon: '🏁', nextState: 'WK_COOLDOWN' },
      { id: 'rcs4', label: { en: 'Before bed (10 min)', ar: 'قبل النوم (10 دقايق)' }, icon: '🌙', nextState: 'RC_STRETCH_NIGHT' },
      { id: 'rcs5', label: { en: 'Full body (15 min)', ar: 'كل الجسم (15 دقيقة)' }, icon: '🧘', nextState: 'RC_STRETCH_FULL' },
      { id: 'rcs6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_MENU' },
    ],
  },

  {
    id: 'RC_STRETCH_MORNING',
    domain: 'recovery',
    text: { en: 'Morning Stretch', ar: 'إطالة الصبح' },
    botMessage: {
      en: '🌅 5-Minute Morning Stretch:\n\n1. Cat-cow — 30s\n2. Thread the needle (each side) — 30s\n3. Hip flexor stretch (each side) — 30s\n4. Standing forward fold — 30s\n5. Chest opener — 30s\n6. Neck rolls — 30s\n7. Side body stretch (each side) — 30s\n8. 3 deep breaths',
      ar: '🌅 إطالة الصبح 5 دقايق:\n\n1. Cat-cow — 30 ثانية\n2. Thread the needle (كل جنب) — 30 ثانية\n3. إطالة hip flexor (كل جنب) — 30 ثانية\n4. الانحناء للأمام واقف — 30 ثانية\n5. فتح الصدر — 30 ثانية\n6. دوران الرقبة — 30 ثانية\n7. إطالة الجنب (كل جنب) — 30 ثانية\n8. 3 أنفاس عميقة',
    },
    back: 'RC_STRETCH_MENU',
    options: [
      { id: 'rcsm1', label: { en: 'Done!', ar: 'خلصت!' }, icon: '✅', nextState: 'RC_MENU' },
      { id: 'rcsm2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_STRETCH_MENU' },
    ],
  },

  {
    id: 'RC_STRETCH_NIGHT',
    domain: 'recovery',
    text: { en: 'Bedtime Stretch', ar: 'إطالة قبل النوم' },
    botMessage: {
      en: '🌙 10-Minute Bedtime Stretch:\n\n1. Child\'s pose — 60s\n2. Supine twist (each side) — 60s\n3. Figure-4 stretch (each side) — 60s\n4. Happy baby — 60s\n5. Legs up the wall — 2 min\n6. Butterfly stretch — 60s\n7. Neck release (each side) — 30s\n8. Body scan meditation — 2 min\n\nBreathe deeply and let go of the day\'s tension.',
      ar: '🌙 إطالة قبل النوم 10 دقايق:\n\n1. Child\'s pose — 60 ثانية\n2. لف الجسم ونت نايم (كل جنب) — 60 ثانية\n3. Figure-4 (كل جنب) — 60 ثانية\n4. Happy baby — 60 ثانية\n5. رجلين على الحيطة — دقيقتين\n6. إطالة الفراشة — 60 ثانية\n7. تحرير الرقبة (كل جنب) — 30 ثانية\n8. تأمل body scan — دقيقتين\n\nتنفّس عميق وسيب توتر اليوم.',
    },
    back: 'RC_STRETCH_MENU',
    options: [
      { id: 'rcsn1', label: { en: 'Done! Goodnight', ar: 'خلصت! تصبح على خير' }, icon: '😴', nextState: 'ROOT' },
      { id: 'rcsn2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_STRETCH_MENU' },
    ],
  },

  {
    id: 'RC_STRETCH_FULL',
    domain: 'recovery',
    text: { en: 'Full Body Stretch', ar: 'إطالة كل الجسم' },
    botMessage: {
      en: '🧘 15-Minute Full Body Stretch:\n\n**Upper body (5 min):**\n1. Neck rolls — 30s each direction\n2. Shoulder rolls — 30s\n3. Cross-body shoulder — 30s each\n4. Tricep overhead — 30s each\n5. Chest doorway — 30s\n6. Lat stretch — 30s each\n\n**Lower body (5 min):**\n7. Quad stretch — 30s each\n8. Hamstring stretch — 30s each\n9. Calf stretch — 30s each\n10. Hip flexor lunge — 30s each\n11. Figure-4 glute — 30s each\n\n**Spine & core (5 min):**\n12. Cat-cow — 60s\n13. Cobra — 30s\n14. Child\'s pose — 60s\n15. Supine twist — 30s each\n16. Happy baby — 60s',
      ar: '🧘 إطالة كل الجسم 15 دقيقة:\n\n**جزء علوي (5 دقايق):**\n1. دوران رقبة — 30 ثانية كل اتجاه\n2. دوران كتف — 30 ثانية\n3. إطالة كتف عرضية — 30 ثانية كل جنب\n4. إطالة تراي فوق الراس — 30 ثانية كل جنب\n5. إطالة صدر — 30 ثانية\n6. إطالة لات — 30 ثانية كل جنب\n\n**جزء سفلي (5 دقايق):**\n7. إطالة كوادز — 30 ثانية كل رجل\n8. إطالة هامسترنج — 30 ثانية كل رجل\n9. إطالة سمانة — 30 ثانية كل رجل\n10. لانج hip flexor — 30 ثانية كل رجل\n11. Figure-4 — 30 ثانية كل رجل\n\n**عمود فقري وبطن (5 دقايق):**\n12. Cat-cow — 60 ثانية\n13. كوبرا — 30 ثانية\n14. Child\'s pose — 60 ثانية\n15. لف الجسم — 30 ثانية كل جنب\n16. Happy baby — 60 ثانية',
    },
    back: 'RC_STRETCH_MENU',
    options: [
      { id: 'rcsf1', label: { en: 'Done!', ar: 'خلصت!' }, icon: '✅', nextState: 'RC_MENU' },
      { id: 'rcsf2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_STRETCH_MENU' },
    ],
  },

  {
    id: 'RC_FOAM',
    domain: 'recovery',
    text: { en: 'Foam Rolling', ar: 'Foam Rolling' },
    botMessage: {
      en: '🔄 **Foam Rolling Guide (10 min):**\n\n1. **Quads** — 60s (roll slowly, pause on tight spots)\n2. **IT Band** — 60s each side\n3. **Hamstrings** — 60s\n4. **Calves** — 60s\n5. **Glutes** — 60s (sit on roller)\n6. **Upper back** — 60s\n7. **Lats** — 30s each side\n\n**Tips:**\n• Roll slowly (2-3 inches per second)\n• Pause 20-30s on trigger points\n• Breathe through the discomfort\n• Avoid rolling directly on joints or lower back\n• Do this after every workout for best results',
      ar: '🔄 **دليل Foam Rolling (10 دقايق):**\n\n1. **كوادز** — 60 ثانية (اتحرك ببطء، وقّف على الأماكن المشدودة)\n2. **IT Band** — 60 ثانية كل جنب\n3. **هامسترنج** — 60 ثانية\n4. **سمانة** — 60 ثانية\n5. **مؤخرة** — 60 ثانية (اقعد على الرولر)\n6. **ضهر علوي** — 60 ثانية\n7. **لات** — 30 ثانية كل جنب\n\n**نصايح:**\n• اتحرك ببطء (2-3 بوصة في الثانية)\n• وقّف 20-30 ثانية على النقاط المشدودة\n• تنفّس خلال الألم\n• متعملش foam roll على المفاصل أو الضهر السفلي\n• اعمله بعد كل تمرين لأحسن نتيجة',
    },
    back: 'RC_MENU',
    options: [
      { id: 'rcf1', label: { en: 'Done!', ar: 'خلصت!' }, icon: '✅', nextState: 'RC_MENU' },
      { id: 'rcf2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_MENU' },
    ],
  },

  {
    id: 'RC_ACTIVE',
    domain: 'recovery',
    text: { en: 'Active Recovery', ar: 'ريكفري نشط' },
    botMessage: {
      en: '🚶 **Active Recovery Ideas:**\n\nLight activities that promote recovery without adding training stress:\n\n• 🚶 Light walk (20-30 min)\n• 🏊 Swimming (easy pace)\n• 🚴 Cycling (Zone 1-2)\n• 🧘 Yoga or mobility work\n• 🔄 Foam rolling\n• 🧘 Dynamic stretching\n\n**Why it works:**\n• Increases blood flow to muscles\n• Reduces muscle soreness (DOMS)\n• Promotes waste removal\n• Maintains movement patterns\n• Reduces stress',
      ar: '🚶 **أفكار ريكفري نشط:**\n\nأنشطة خفيفة بتساعد الريكفري من غير ضغط تدريبي:\n\n• 🚶 مشي خفيف (20-30 دقيقة)\n• 🏊 سباحة (سرعة مريحة)\n• 🚴 عجلة (Zone 1-2)\n• 🧘 يوجا أو تمارين مرونة\n• 🔄 Foam rolling\n• 🧘 إطالة ديناميكية\n\n**ليه بيفرق:**\n• بيزوّد تدفق الدم للعضلات\n• بيقلل وجع العضلات (DOMS)\n• بيساعد في التخلص من السموم\n• بيحافظ على أنماط الحركة\n• بيقلل التوتر',
    },
    back: 'RC_MENU',
    options: [
      { id: 'rca1', label: { en: 'Log light walk', ar: 'سجّل مشي خفيف' }, icon: '🚶', nextState: 'WK_LIGHT_WALK' },
      { id: 'rca2', label: { en: 'Stretching routine', ar: 'تمارين إطالة' }, icon: '🧘', nextState: 'RC_STRETCH_MENU' },
      { id: 'rca3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_MENU' },
    ],
  },

  {
    id: 'RC_COLD_HEAT',
    domain: 'recovery',
    text: { en: 'Cold/Heat Therapy', ar: 'العلاج بالبرد/الحرارة' },
    botMessage: {
      en: '🧊🔥 **Cold & Heat Therapy:**\n\n**Cold (ice bath, cold shower):**\n• ✅ Reduces inflammation\n• ✅ Speeds recovery after intense training\n• ✅ Improves HRV and sleep\n• ⏱️ 2-5 min cold shower or 10-15 min ice bath\n• 🌡️ 10-15°C (50-60°F)\n\n**Heat (sauna, hot bath):**\n• ✅ Increases blood flow\n• ✅ Relaxes muscles\n• ✅ Improves flexibility\n• ✅ Promotes sleep\n• ⏱️ 15-20 min sauna or hot bath\n\n**Protocol:** After training → cold first, then heat (contrast therapy). Before bed → heat only.',
      ar: '🧊🔥 **العلاج بالبرد والحرارة:**\n\n**البرد (حمام ثلج، دش بارد):**\n• ✅ بيقلل الالتهاب\n• ✅ بيسرّع الريكفري بعد التمرين الشديد\n• ✅ بيحسّن HRV والنوم\n• ⏱️ 2-5 دقايق دش بارد أو 10-15 دقيقة حمام ثلج\n• 🌡️ 10-15°C\n\n**الحرارة (ساونا، حمام سخن):**\n• ✅ بتزوّد تدفق الدم\n• ✅ بترخي العضلات\n• ✅ بتحسّن المرونة\n• ✅ بتساعد على النوم\n• ⏱️ 15-20 دقيقة ساونا أو حمام سخن\n\n**البروتوكول:** بعد التمرين → برد الأول، بعدين حرارة. قبل النوم → حرارة بس.',
    },
    back: 'RC_MENU',
    options: [
      { id: 'rcch1', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_MENU' },
    ],
  },

  {
    id: 'RC_POST_WORKOUT',
    domain: 'recovery',
    text: { en: 'Post-Workout Recovery', ar: 'ريكفري بعد التمرين' },
    botMessage: {
      en: '🏁 **Post-Workout Recovery Protocol:**\n\n**Immediately (0-30 min):**\n1. Cool-down stretches (5 min)\n2. Hydrate (500ml water)\n3. Protein shake (25-40g whey)\n\n**Within 1-2 hours:**\n4. Full meal (protein + carbs)\n5. More water\n\n**Evening:**\n6. Foam rolling (10 min)\n7. Hot shower/bath\n8. Magnesium supplement\n9. Sleep 7-9 hours\n\n**Next day:**\n10. Active recovery or rest\n11. Track soreness\n12. Continue hydrating',
      ar: '🏁 **بروتوكول الريكفري بعد التمرين:**\n\n**فوراً (0-30 دقيقة):**\n1. إطالة بعد التمرين (5 دقايق)\n2. اشرب مية (500مل)\n3. بروتين شيك (25-40 جم واي)\n\n**خلال ساعة-ساعتين:**\n4. وجبة كاملة (بروتين + كارب)\n5. مية أكتر\n\n**بالليل:**\n6. Foam rolling (10 دقايق)\n7. دش/حمام سخن\n8. ماغنسيوم\n9. نوم 7-9 ساعات\n\n**اليوم اللي بعده:**\n10. ريكفري نشط أو راحة\n11. تابع الوجع\n12. كمّل اشرب مية',
    },
    back: 'RC_MENU',
    options: [
      { id: 'rcpw1', label: { en: 'Post-workout meal', ar: 'أكل بعد التمرين' }, icon: '🍗', nextState: 'NT_POST_WORKOUT' },
      { id: 'rcpw2', label: { en: 'Stretching routine', ar: 'تمارين إطالة' }, icon: '🧘', nextState: 'WK_COOLDOWN' },
      { id: 'rcpw3', label: { en: 'Foam rolling', ar: 'Foam Rolling' }, icon: '🔄', nextState: 'RC_FOAM' },
      { id: 'rcpw4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'RC_MENU' },
    ],
  },
];
