/**
 * Subscription Feature Matrix
 * Defines features available for each subscription tier
 */

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';

export interface TierPricing {
  monthly: number;
  yearly: number; // 20% discount
  currency: 'EGP';
}

export interface TierInfo {
  id: SubscriptionTier;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  pricing: TierPricing;
  badge?: string;
  badgeAr?: string;
  isPopular?: boolean;
}

export interface Feature {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: FeatureCategory;
  tiers: SubscriptionTier[];
  limit?: Record<SubscriptionTier, number | 'unlimited'>;
}

export type FeatureCategory =
  | 'workouts'
  | 'nutrition'
  | 'tracking'
  | 'ai'
  | 'social'
  | 'coaching'
  | 'content'
  | 'support';

// ===========================================
// TIER DEFINITIONS
// ===========================================

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierInfo> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    nameAr: 'مجاني',
    tagline: 'Get started on your fitness journey',
    taglineAr: 'ابدأ رحلتك في اللياقة البدنية',
    pricing: {
      monthly: 0,
      yearly: 0,
      currency: 'EGP',
    },
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    nameAr: 'بريميوم',
    tagline: 'Best value - everything you need to transform',
    taglineAr: 'أفضل قيمة - كل ما تحتاجه للتحول',
    pricing: {
      monthly: 79,
      yearly: 590, // ~38% off (79 * 12 = 948, save 358 EGP)
      currency: 'EGP',
    },
    badge: 'Best Deal',
    badgeAr: 'أفضل صفقة',
    isPopular: true,
  },
  PREMIUM_PLUS: {
    id: 'PREMIUM_PLUS',
    name: 'Premium+',
    nameAr: 'بريميوم+',
    tagline: 'VIP experience with AI & personal coaching',
    taglineAr: 'تجربة VIP مع الذكاء الاصطناعي والتدريب الشخصي',
    pricing: {
      monthly: 449,
      yearly: 4290, // ~20% off (449 * 12 = 5388)
      currency: 'EGP',
    },
    badge: 'VIP',
    badgeAr: 'VIP',
  },
};

// ===========================================
// FEATURE DEFINITIONS
// ===========================================

export const FEATURES: Feature[] = [
  // WORKOUTS
  {
    id: 'workout_tracking',
    name: 'Basic Workout Tracking',
    nameAr: 'تتبع التمارين الأساسي',
    description: 'Log sets, reps, and weights for your workouts',
    descriptionAr: 'سجل المجموعات والتكرارات والأوزان لتمارينك',
    category: 'workouts',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'exercise_library',
    name: 'Exercise Library',
    nameAr: 'مكتبة التمارين',
    description: 'Access to exercise database with video demonstrations',
    descriptionAr: 'الوصول إلى قاعدة بيانات التمارين مع مقاطع فيديو توضيحية',
    category: 'workouts',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 50, PREMIUM: 'unlimited', PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'custom_workouts',
    name: 'Custom Workout Plans',
    nameAr: 'خطط تمارين مخصصة',
    description: 'Create and save your own workout routines',
    descriptionAr: 'أنشئ واحفظ روتين التمارين الخاص بك',
    category: 'workouts',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 0, PREMIUM: 10, PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'workout_programs',
    name: 'Pre-built Workout Programs',
    nameAr: 'برامج تمارين جاهزة',
    description: 'Access curated multi-week training programs',
    descriptionAr: 'الوصول إلى برامج تدريبية منسقة متعددة الأسابيع',
    category: 'workouts',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'rest_timer',
    name: 'Smart Rest Timer',
    nameAr: 'مؤقت الراحة الذكي',
    description: 'Auto-adjusting rest periods based on exercise type',
    descriptionAr: 'فترات راحة تتكيف تلقائياً حسب نوع التمرين',
    category: 'workouts',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'superset_tracking',
    name: 'Superset & Circuit Tracking',
    nameAr: 'تتبع السوبرسيت والدوائر',
    description: 'Track complex workout structures',
    descriptionAr: 'تتبع هياكل التمارين المعقدة',
    category: 'workouts',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },

  // NUTRITION
  {
    id: 'food_logging',
    name: 'Food Logging',
    nameAr: 'تسجيل الطعام',
    description: 'Log meals and track calories',
    descriptionAr: 'سجل الوجبات وتتبع السعرات الحرارية',
    category: 'nutrition',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 3, PREMIUM: 'unlimited', PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'barcode_scanner',
    name: 'Barcode Scanner',
    nameAr: 'ماسح الباركود',
    description: 'Scan food barcodes for instant nutrition info',
    descriptionAr: 'امسح باركود الطعام للحصول على معلومات غذائية فورية',
    category: 'nutrition',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'meal_plans',
    name: 'Custom Meal Plans',
    nameAr: 'خطط وجبات مخصصة',
    description: 'AI-generated meal plans based on your goals',
    descriptionAr: 'خطط وجبات مولدة بالذكاء الاصطناعي حسب أهدافك',
    category: 'nutrition',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'macro_tracking',
    name: 'Advanced Macro Tracking',
    nameAr: 'تتبع الماكرو المتقدم',
    description: 'Track protein, carbs, fats with detailed breakdowns',
    descriptionAr: 'تتبع البروتين والكربوهيدرات والدهون مع تفصيل مفصل',
    category: 'nutrition',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'water_tracking',
    name: 'Water Intake Tracking',
    nameAr: 'تتبع استهلاك الماء',
    description: 'Track daily water consumption with reminders',
    descriptionAr: 'تتبع استهلاك الماء اليومي مع التذكيرات',
    category: 'nutrition',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'recipe_database',
    name: 'Egyptian Recipe Database',
    nameAr: 'قاعدة بيانات الوصفات المصرية',
    description: 'Access local Egyptian recipes with full nutrition data',
    descriptionAr: 'الوصول إلى وصفات مصرية محلية مع بيانات غذائية كاملة',
    category: 'nutrition',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },

  // TRACKING & ANALYTICS
  {
    id: 'progress_photos',
    name: 'Progress Photos',
    nameAr: 'صور التقدم',
    description: 'Take and compare progress photos over time',
    descriptionAr: 'التقط وقارن صور التقدم بمرور الوقت',
    category: 'tracking',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 2, PREMIUM: 'unlimited', PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'body_measurements',
    name: 'Body Measurements',
    nameAr: 'قياسات الجسم',
    description: 'Track weight, body fat, and measurements',
    descriptionAr: 'تتبع الوزن ونسبة الدهون والقياسات',
    category: 'tracking',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'detailed_analytics',
    name: 'Detailed Analytics',
    nameAr: 'تحليلات مفصلة',
    description: 'Charts, trends, and insights about your progress',
    descriptionAr: 'رسوم بيانية واتجاهات ورؤى حول تقدمك',
    category: 'tracking',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'strength_tracking',
    name: 'Strength Progress Tracking',
    nameAr: 'تتبع تقدم القوة',
    description: 'Track PRs and strength gains over time',
    descriptionAr: 'تتبع الأرقام القياسية ومكاسب القوة بمرور الوقت',
    category: 'tracking',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'export_data',
    name: 'Data Export',
    nameAr: 'تصدير البيانات',
    description: 'Export your fitness data in CSV or PDF format',
    descriptionAr: 'صدّر بيانات اللياقة في صيغة CSV أو PDF',
    category: 'tracking',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },

  // AI FEATURES (Premium+ exclusive - the premium features)
  {
    id: 'ai_coach_basic',
    name: 'AI Coach (Basic)',
    nameAr: 'المدرب الذكي (أساسي)',
    description: 'Get basic workout suggestions',
    descriptionAr: 'احصل على اقتراحات تمارين أساسية',
    category: 'ai',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 3, PREMIUM: 20, PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'ai_coach_advanced',
    name: 'AI Coach (Unlimited)',
    nameAr: 'المدرب الذكي (غير محدود)',
    description: 'Personalized AI coaching with adaptive recommendations',
    descriptionAr: 'تدريب ذكاء اصطناعي شخصي مع توصيات متكيفة',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'form_checker',
    name: 'AI Form Checker',
    nameAr: 'مدقق الشكل بالذكاء الاصطناعي',
    description: 'Get feedback on your exercise form via video',
    descriptionAr: 'احصل على ملاحظات حول شكل التمارين عبر الفيديو',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
    limit: { FREE: 0, PREMIUM: 0, PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'ai_meal_suggestions',
    name: 'AI Meal Planning',
    nameAr: 'تخطيط الوجبات بالذكاء الاصطناعي',
    description: 'Full AI-generated meal plans tailored to your goals',
    descriptionAr: 'خطط وجبات كاملة مولدة بالذكاء الاصطناعي مخصصة لأهدافك',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'ai_workout_generator',
    name: 'AI Workout Generator',
    nameAr: 'مولد التمارين بالذكاء الاصطناعي',
    description: 'Generate custom workouts based on your equipment and goals',
    descriptionAr: 'أنشئ تمارين مخصصة بناءً على معداتك وأهدافك',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'ai_progress_insights',
    name: 'AI Progress Insights',
    nameAr: 'رؤى التقدم بالذكاء الاصطناعي',
    description: 'AI-powered analysis of your fitness journey',
    descriptionAr: 'تحليل مدعوم بالذكاء الاصطناعي لرحلتك في اللياقة',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },

  // SOCIAL
  {
    id: 'community_access',
    name: 'Community Access',
    nameAr: 'الوصول للمجتمع',
    description: 'Join the Forma fitness community',
    descriptionAr: 'انضم إلى مجتمع فورما للياقة',
    category: 'social',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'squad_challenges',
    name: 'Squad Challenges',
    nameAr: 'تحديات الفريق',
    description: 'Compete with friends in fitness challenges',
    descriptionAr: 'تنافس مع الأصدقاء في تحديات اللياقة',
    category: 'social',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'leaderboards',
    name: 'Leaderboards',
    nameAr: 'لوحات المتصدرين',
    description: 'See how you rank against other users',
    descriptionAr: 'شاهد ترتيبك مقارنة بالمستخدمين الآخرين',
    category: 'social',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },

  // COACHING (Premium+ exclusive)
  {
    id: 'trainer_matching',
    name: 'Personal Trainer Matching',
    nameAr: 'مطابقة المدرب الشخصي',
    description: 'Get matched with certified Egyptian trainers',
    descriptionAr: 'احصل على مطابقة مع مدربين مصريين معتمدين',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'trainer_chat',
    name: 'Direct Trainer Chat',
    nameAr: 'محادثة مباشرة مع المدرب',
    description: 'Chat directly with your assigned trainer',
    descriptionAr: 'تحدث مباشرة مع مدربك المعين',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'video_consultations',
    name: 'Video Consultations',
    nameAr: 'استشارات فيديو',
    description: 'Monthly video calls with your trainer',
    descriptionAr: 'مكالمات فيديو شهرية مع مدربك',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
    limit: { FREE: 0, PREMIUM: 0, PREMIUM_PLUS: 2 },
  },
  {
    id: 'personalized_programs',
    name: 'Personalized Training Programs',
    nameAr: 'برامج تدريب شخصية',
    description: 'Custom programs designed by your trainer',
    descriptionAr: 'برامج مخصصة صممها مدربك',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'nutrition_coaching',
    name: 'Nutrition Coaching',
    nameAr: 'تدريب التغذية',
    description: 'Get personalized nutrition advice from experts',
    descriptionAr: 'احصل على نصائح غذائية شخصية من خبراء',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'weekly_checkins',
    name: 'Weekly Check-ins',
    nameAr: 'متابعات أسبوعية',
    description: 'Regular progress reviews with your trainer',
    descriptionAr: 'مراجعات تقدم منتظمة مع مدربك',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'form_video_reviews',
    name: 'Form Video Reviews',
    nameAr: 'مراجعات فيديو الشكل',
    description: 'Submit videos for trainer feedback on your form',
    descriptionAr: 'أرسل مقاطع فيديو للحصول على ملاحظات المدرب على شكلك',
    category: 'coaching',
    tiers: ['PREMIUM_PLUS'],
    limit: { FREE: 0, PREMIUM: 0, PREMIUM_PLUS: 10 },
  },

  // CONTENT
  {
    id: 'educational_content',
    name: 'Educational Content',
    nameAr: 'محتوى تعليمي',
    description: 'Access fitness and nutrition articles',
    descriptionAr: 'الوصول إلى مقالات اللياقة والتغذية',
    category: 'content',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'exclusive_content',
    name: 'Exclusive Content',
    nameAr: 'محتوى حصري',
    description: 'Premium articles and video tutorials',
    descriptionAr: 'مقالات ودروس فيديو حصرية',
    category: 'content',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'workout_videos',
    name: 'HD Workout Videos',
    nameAr: 'فيديوهات تمارين عالية الجودة',
    description: 'Full-length workout videos with trainers',
    descriptionAr: 'فيديوهات تمارين كاملة مع مدربين',
    category: 'content',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },

  // SUPPORT
  {
    id: 'email_support',
    name: 'Email Support',
    nameAr: 'دعم البريد الإلكتروني',
    description: 'Get help via email',
    descriptionAr: 'احصل على المساعدة عبر البريد الإلكتروني',
    category: 'support',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    nameAr: 'دعم أولوية',
    description: '24-hour response time guarantee',
    descriptionAr: 'ضمان وقت استجابة 24 ساعة',
    category: 'support',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'whatsapp_support',
    name: 'WhatsApp Support',
    nameAr: 'دعم واتساب',
    description: 'Direct support via WhatsApp',
    descriptionAr: 'دعم مباشر عبر واتساب',
    category: 'support',
    tiers: ['PREMIUM_PLUS'],
  },

  // APP EXPERIENCE
  {
    id: 'ad_free',
    name: 'Ad-Free Experience',
    nameAr: 'تجربة بدون إعلانات',
    description: 'No advertisements in the app',
    descriptionAr: 'بدون إعلانات في التطبيق',
    category: 'content',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
  {
    id: 'offline_mode',
    name: 'Offline Mode',
    nameAr: 'وضع عدم الاتصال',
    description: 'Use the app without internet connection',
    descriptionAr: 'استخدم التطبيق بدون اتصال بالإنترنت',
    category: 'content',
    tiers: ['PREMIUM', 'PREMIUM_PLUS'],
  },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Check if a feature is available for a given tier
 */
export function hasFeature(featureId: string, tier: SubscriptionTier): boolean {
  const feature = FEATURES.find((f) => f.id === featureId);
  if (!feature) return false;
  return feature.tiers.includes(tier);
}

/**
 * Get the limit for a feature at a given tier
 */
export function getFeatureLimit(
  featureId: string,
  tier: SubscriptionTier
): number | 'unlimited' | null {
  const feature = FEATURES.find((f) => f.id === featureId);
  if (!feature || !feature.limit) return null;
  return feature.limit[tier];
}

/**
 * Get all features for a specific tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): Feature[] {
  return FEATURES.filter((f) => f.tiers.includes(tier));
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: FeatureCategory): Feature[] {
  return FEATURES.filter((f) => f.category === category);
}

/**
 * Get all features for a tier, grouped by category
 */
export function getGroupedFeaturesForTier(
  tier: SubscriptionTier
): Record<FeatureCategory, Feature[]> {
  const features = getFeaturesForTier(tier);
  return features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<FeatureCategory, Feature[]>
  );
}

/**
 * Get features exclusive to a tier (not available in lower tiers)
 */
export function getExclusiveFeatures(tier: SubscriptionTier): Feature[] {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];
  const tierIndex = tierOrder.indexOf(tier);

  return FEATURES.filter((feature) => {
    // Feature must be available in this tier
    if (!feature.tiers.includes(tier)) return false;

    // Feature must NOT be available in any lower tier
    const lowerTiers = tierOrder.slice(0, tierIndex);
    return !lowerTiers.some((lowerTier) => feature.tiers.includes(lowerTier));
  });
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTierForFeature(
  featureId: string
): SubscriptionTier | null {
  const feature = FEATURES.find((f) => f.id === featureId);
  if (!feature) return null;

  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];
  for (const tier of tierOrder) {
    if (feature.tiers.includes(tier)) return tier;
  }
  return null;
}

/**
 * Compare two tiers - returns positive if tier1 > tier2
 */
export function compareTiers(
  tier1: SubscriptionTier,
  tier2: SubscriptionTier
): number {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];
  return tierOrder.indexOf(tier1) - tierOrder.indexOf(tier2);
}

/**
 * Check if user can upgrade from their current tier
 */
export function canUpgrade(currentTier: SubscriptionTier): boolean {
  return currentTier !== 'PREMIUM_PLUS';
}

/**
 * Get the next tier for upgrade
 */
export function getNextTier(
  currentTier: SubscriptionTier
): SubscriptionTier | null {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex >= tierOrder.length - 1) return null;
  return tierOrder[currentIndex + 1];
}

// ===========================================
// CATEGORY DISPLAY INFO
// ===========================================

export const CATEGORY_INFO: Record<
  FeatureCategory,
  { name: string; nameAr: string; icon: string }
> = {
  workouts: { name: 'Workouts', nameAr: 'التمارين', icon: 'Dumbbell' },
  nutrition: { name: 'Nutrition', nameAr: 'التغذية', icon: 'Apple' },
  tracking: { name: 'Tracking & Analytics', nameAr: 'التتبع والتحليلات', icon: 'BarChart3' },
  ai: { name: 'AI Features', nameAr: 'ميزات الذكاء الاصطناعي', icon: 'Brain' },
  social: { name: 'Social & Community', nameAr: 'المجتمع', icon: 'Users' },
  coaching: { name: 'Personal Coaching', nameAr: 'التدريب الشخصي', icon: 'GraduationCap' },
  content: { name: 'Content & Experience', nameAr: 'المحتوى والتجربة', icon: 'PlayCircle' },
  support: { name: 'Support', nameAr: 'الدعم', icon: 'HeadphonesIcon' },
};

// ===========================================
// QUICK COMPARISON DATA FOR UI
// ===========================================

export const TIER_COMPARISON_HIGHLIGHTS = {
  FREE: [
    'Basic workout tracking',
    'Food logging (3 meals/day)',
    'Progress photos (2/month)',
    '3 AI coach questions/month',
    'Community access',
  ],
  PREMIUM: [
    'Everything in Free, plus:',
    'Unlimited food logging & tracking',
    'Custom workout plans (10)',
    'Advanced analytics & charts',
    'Pre-built workout programs',
    'Squad challenges & leaderboards',
    'Ad-free experience',
    'Offline mode',
    '20 AI coach questions/month',
  ],
  PREMIUM_PLUS: [
    'Everything in Premium, plus:',
    'Unlimited AI Coach access',
    'AI Form Checker (video analysis)',
    'AI Workout Generator',
    'AI Meal Planning',
    'AI Progress Insights',
    'Personal trainer matching',
    'Direct trainer chat',
    'Video consultations (2/month)',
    'Weekly trainer check-ins',
    'WhatsApp VIP support',
  ],
};

export const TIER_COMPARISON_HIGHLIGHTS_AR = {
  FREE: [
    'تتبع التمارين الأساسي',
    'تسجيل الطعام (3 وجبات/يوم)',
    'صور التقدم (2/شهر)',
    '3 أسئلة للمدرب الذكي/شهر',
    'الوصول للمجتمع',
  ],
  PREMIUM: [
    'كل شيء في المجاني، بالإضافة إلى:',
    'تسجيل طعام وتتبع غير محدود',
    'خطط تمارين مخصصة (10)',
    'تحليلات ورسوم بيانية متقدمة',
    'برامج تمارين جاهزة',
    'تحديات الفريق ولوحات المتصدرين',
    'تجربة بدون إعلانات',
    'وضع عدم الاتصال',
    '20 سؤال للمدرب الذكي/شهر',
  ],
  PREMIUM_PLUS: [
    'كل شيء في بريميوم، بالإضافة إلى:',
    'وصول غير محدود للمدرب الذكي',
    'مدقق الشكل بالذكاء الاصطناعي',
    'مولد التمارين بالذكاء الاصطناعي',
    'تخطيط الوجبات بالذكاء الاصطناعي',
    'رؤى التقدم بالذكاء الاصطناعي',
    'مطابقة المدرب الشخصي',
    'محادثة مباشرة مع المدرب',
    'استشارات فيديو (2/شهر)',
    'متابعات أسبوعية مع المدرب',
    'دعم واتساب VIP',
  ],
};
