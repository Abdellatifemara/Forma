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
    name: '7-Day Trial',
    nameAr: 'تجربة 7 أيام',
    tagline: 'Try everything free for 7 days',
    taglineAr: 'جرب كل شيء مجاناً لمدة 7 أيام',
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
      monthly: 299,
      yearly: 2990, // 10 months price (2 months free)
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
    tagline: 'VIP experience with personal coaching & smart features',
    taglineAr: 'تجربة VIP مع التدريب الشخصي والميزات الذكية',
    pricing: {
      monthly: 999,
      yearly: 9990, // 10 months price (2 months free)
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
    description: 'Meal plans tailored to your goals and preferences',
    descriptionAr: 'خطط وجبات مصممة حسب أهدافك وتفضيلاتك',
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

  // SMART FEATURES (Premium+ exclusive - the premium features)
  {
    id: 'ai_coach_basic',
    name: 'Personal Recommendations',
    nameAr: 'توصيات شخصية',
    description: 'Get workout suggestions tailored to your body and goals',
    descriptionAr: 'احصل على اقتراحات تمارين مخصصة لجسمك وأهدافك',
    category: 'ai',
    tiers: ['FREE', 'PREMIUM', 'PREMIUM_PLUS'],
    limit: { FREE: 3, PREMIUM: 20, PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'ai_coach_advanced',
    name: 'Unlimited Recommendations',
    nameAr: 'توصيات غير محدودة',
    description: 'Unlimited personalized guidance that adapts as you progress',
    descriptionAr: 'توجيه شخصي غير محدود يتكيف مع تقدمك',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'form_checker',
    name: 'Expert Form Review',
    nameAr: 'مراجعة الفورم من خبراء',
    description: 'Send videos to trainers for personalized form feedback within 24h',
    descriptionAr: 'أرسل فيديوهات للمدربين للحصول على ملاحظات مخصصة خلال 24 ساعة',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
    limit: { FREE: 0, PREMIUM: 0, PREMIUM_PLUS: 'unlimited' },
  },
  {
    id: 'ai_meal_suggestions',
    name: 'Personalized Meal Planning',
    nameAr: 'تخطيط وجبات مخصص',
    description: 'Get meal plans designed by nutrition experts for your goals',
    descriptionAr: 'احصل على خطط وجبات مصممة من خبراء التغذية لأهدافك',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'ai_workout_generator',
    name: 'Custom Workout Builder',
    nameAr: 'منشئ التمارين المخصص',
    description: 'Workouts tailored to your equipment and fitness level',
    descriptionAr: 'تمارين مخصصة حسب معداتك ومستواك',
    category: 'ai',
    tiers: ['PREMIUM_PLUS'],
  },
  {
    id: 'ai_progress_insights',
    name: 'Progress Analytics',
    nameAr: 'تحليلات التقدم',
    description: 'Charts and trends showing your fitness journey',
    descriptionAr: 'رسوم بيانية واتجاهات توضح رحلتك في اللياقة',
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
  ai: { name: 'Personalized Features', nameAr: 'ميزات مخصصة لك', icon: 'Sparkles' },
  social: { name: 'Social & Community', nameAr: 'المجتمع', icon: 'Users' },
  coaching: { name: 'Personal Coaching', nameAr: 'التدريب الشخصي', icon: 'GraduationCap' },
  content: { name: 'Content & Experience', nameAr: 'المحتوى والتجربة', icon: 'PlayCircle' },
  support: { name: 'Support', nameAr: 'الدعم', icon: 'HeadphonesIcon' },
};

// ===========================================
// EXERCISE CATEGORY ACCESS TIERS
// ===========================================

export interface ExerciseCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string; // Lucide icon name
  minimumTier: SubscriptionTier;
  searchTags: string[]; // used to filter exercises by category
}

/**
 * Exercise categories with tier access.
 * Premium: gym, crossfit, pre-workout supplements
 * Premium+: everything else (martial arts, yoga, swimming, etc.)
 */
export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  // ---- PREMIUM (gym basics) ----
  {
    id: 'gym',
    name: 'Gym & Weights',
    nameAr: 'جيم وأوزان',
    icon: 'Dumbbell',
    minimumTier: 'FREE',
    searchTags: ['barbell', 'dumbbell', 'machine', 'cable', 'gym', 'weight'],
  },
  {
    id: 'crossfit',
    name: 'CrossFit',
    nameAr: 'كروسفيت',
    icon: 'Timer',
    minimumTier: 'FREE',
    searchTags: ['crossfit', 'wod', 'amrap', 'emom'],
  },
  {
    id: 'preworkout',
    name: 'Pre & Post Workout',
    nameAr: 'قبل وبعد التمرين',
    icon: 'Zap',
    minimumTier: 'FREE',
    searchTags: ['preworkout', 'pre-workout', 'post-workout', 'supplement', 'warmup', 'cooldown'],
  },
  // ---- PREMIUM+ (specialty) ----
  {
    id: 'boxing',
    name: 'Boxing',
    nameAr: 'ملاكمة',
    icon: 'Swords',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['boxing', 'punch', 'bag', 'sparring'],
  },
  {
    id: 'kickboxing',
    name: 'Kickboxing & Muay Thai',
    nameAr: 'كيك بوكسينج ومواي تاي',
    icon: 'Flame',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['kickboxing', 'muay thai', 'kick', 'elbow', 'knee strike'],
  },
  {
    id: 'bjj',
    name: 'BJJ & Grappling',
    nameAr: 'جوجيتسو',
    icon: 'Shield',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['bjj', 'jiu-jitsu', 'grappling', 'submission', 'guard'],
  },
  {
    id: 'wrestling',
    name: 'Wrestling',
    nameAr: 'مصارعة',
    icon: 'Users',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['wrestling', 'takedown', 'sprawl'],
  },
  {
    id: 'mma',
    name: 'MMA & Martial Arts',
    nameAr: 'فنون قتالية',
    icon: 'Target',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['mma', 'martial arts', 'combat', 'fighting'],
  },
  {
    id: 'yoga',
    name: 'Yoga & Flexibility',
    nameAr: 'يوجا ومرونة',
    icon: 'Leaf',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['yoga', 'flexibility', 'stretch', 'pose'],
  },
  {
    id: 'swimming',
    name: 'Swimming',
    nameAr: 'سباحة',
    icon: 'Waves',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['swimming', 'pool', 'aqua', 'water'],
  },
  {
    id: 'olympic',
    name: 'Olympic Lifting',
    nameAr: 'رفع أثقال أولمبي',
    icon: 'Trophy',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['olympic', 'snatch', 'clean and jerk', 'clean', 'jerk'],
  },
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    nameAr: 'كاليسثنكس',
    icon: 'PersonStanding',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['calisthenics', 'bodyweight', 'planche', 'handstand', 'muscle up'],
  },
  {
    id: 'mobility',
    name: 'Mobility & Rehab',
    nameAr: 'حركة وتأهيل',
    icon: 'Heart',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['mobility', 'rehab', 'physical therapy', 'recovery', 'foam roll'],
  },
  {
    id: 'sport',
    name: 'Sport-Specific',
    nameAr: 'تمارين رياضية',
    icon: 'Medal',
    minimumTier: 'PREMIUM_PLUS',
    searchTags: ['sport', 'agility', 'speed', 'plyometric', 'conditioning'],
  },
];

/** Check if a category is accessible for a given tier */
export function isCategoryAccessible(categoryId: string, userTier: SubscriptionTier): boolean {
  const cat = EXERCISE_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return false;
  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(cat.minimumTier);
}

// ===========================================
// QUICK COMPARISON DATA FOR UI
// ===========================================

export const TIER_COMPARISON_HIGHLIGHTS = {
  FREE: [
    'Full access for 7 days',
    'All Premium features included',
    'No credit card required',
    'Cancel anytime',
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
    '20 personalized recommendations/month',
  ],
  PREMIUM_PLUS: [
    'Everything in Premium, plus:',
    'Unlimited personalized guidance',
    'Form Review (24h trainer response)',
    'Programs built for your body',
    'Meal plans for your goals',
    'Progress Analytics',
    'Health & Watch Sync',
    'Personal trainer matching',
    'Direct trainer chat',
    'Video consultations (2/month)',
    'Weekly trainer check-ins',
    'WhatsApp VIP support',
  ],
};

export const TIER_COMPARISON_HIGHLIGHTS_AR = {
  FREE: [
    'وصول كامل لمدة 7 أيام',
    'كل مميزات بريميوم متاحة',
    'بدون بطاقة ائتمان',
    'إلغاء في أي وقت',
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
    '20 توصية شخصية/شهر',
  ],
  PREMIUM_PLUS: [
    'كل شيء في بريميوم، بالإضافة إلى:',
    'توجيه شخصي غير محدود',
    'مراجعة الفورم (رد المدرب خلال 24 ساعة)',
    'برامج مصممة لجسمك',
    'خطط وجبات لأهدافك',
    'تحليلات التقدم',
    'مزامنة الساعات والأجهزة الصحية',
    'مطابقة المدرب الشخصي',
    'محادثة مباشرة مع المدرب',
    'استشارات فيديو (2/شهر)',
    'متابعات أسبوعية مع المدرب',
    'دعم واتساب VIP',
  ],
};
