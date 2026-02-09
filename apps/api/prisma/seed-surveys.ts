import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All the personalization surveys/tests
const surveys = [
  {
    code: 'test_workout_logging',
    title: 'Workout Preferences',
    titleAr: 'تفضيلات التمرين',
    description: 'Tell us how you like to track your workouts',
    descriptionAr: 'أخبرنا كيف تحب تتبع تمارينك',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'tracking_detail',
        text: 'How detailed do you want your workout tracking?',
        textAr: 'ما مدى التفصيل الذي تريده في تتبع التمرين؟',
        type: 'single_choice',
        options: [
          { value: 'simple', label: 'Simple - just log exercises', labelAr: 'بسيط - فقط سجل التمارين' },
          { value: 'detailed', label: 'Detailed - track sets, reps, weight', labelAr: 'مفصل - تتبع المجموعات والتكرارات والوزن' },
          { value: 'advanced', label: 'Advanced - include rest times, tempo, RPE', labelAr: 'متقدم - تشمل أوقات الراحة والإيقاع' },
        ],
      },
      {
        code: 'workout_duration',
        text: 'How long are your typical workouts?',
        textAr: 'كم مدة تمارينك المعتادة؟',
        type: 'single_choice',
        options: [
          { value: '30min', label: '30 minutes or less', labelAr: '30 دقيقة أو أقل' },
          { value: '45min', label: '45 minutes', labelAr: '45 دقيقة' },
          { value: '60min', label: '60 minutes', labelAr: '60 دقيقة' },
          { value: '90min', label: '90+ minutes', labelAr: '90 دقيقة فأكثر' },
        ],
      },
    ],
  },
  {
    code: 'test_nutrition_tracking',
    title: 'Nutrition Preferences',
    titleAr: 'تفضيلات التغذية',
    description: 'How would you like to track your food?',
    descriptionAr: 'كيف تحب تتبع طعامك؟',
    triggerEvent: 'onboarding',
    
    questions: [
      {
        code: 'tracking_method',
        text: 'How do you prefer to log food?',
        textAr: 'كيف تفضل تسجيل الطعام؟',
        type: 'single_choice',
        options: [
          { value: 'scan', label: 'Scan barcodes', labelAr: 'مسح الباركود' },
          { value: 'search', label: 'Search database', labelAr: 'البحث في قاعدة البيانات' },
          { value: 'quick', label: 'Quick add calories only', labelAr: 'إضافة سريعة للسعرات فقط' },
          { value: 'photo', label: 'Take a photo', labelAr: 'التقاط صورة' },
        ],
      },
      {
        code: 'dietary_restrictions',
        text: 'Do you have any dietary restrictions?',
        textAr: 'هل لديك أي قيود غذائية؟',
        type: 'multi_choice',
        options: [
          { value: 'none', label: 'None', labelAr: 'لا يوجد' },
          { value: 'halal', label: 'Halal', labelAr: 'حلال' },
          { value: 'vegetarian', label: 'Vegetarian', labelAr: 'نباتي' },
          { value: 'vegan', label: 'Vegan', labelAr: 'نباتي صرف' },
          { value: 'gluten_free', label: 'Gluten-free', labelAr: 'خالي من الغلوتين' },
          { value: 'lactose_free', label: 'Lactose-free', labelAr: 'خالي من اللاكتوز' },
        ],
      },
    ],
  },
  {
    code: 'test_goals_motivation',
    title: 'Your Goals',
    titleAr: 'أهدافك',
    description: 'What are you working towards?',
    descriptionAr: 'ما الذي تسعى لتحقيقه؟',
    triggerEvent: 'onboarding',
    
    questions: [
      {
        code: 'primary_goal',
        text: 'What is your main fitness goal?',
        textAr: 'ما هو هدفك الرئيسي للياقة؟',
        type: 'single_choice',
        options: [
          { value: 'muscle', label: 'Build muscle', labelAr: 'بناء العضلات' },
          { value: 'fat_loss', label: 'Lose fat', labelAr: 'خسارة الدهون' },
          { value: 'strength', label: 'Get stronger', labelAr: 'زيادة القوة' },
          { value: 'health', label: 'General health', labelAr: 'الصحة العامة' },
          { value: 'athletic', label: 'Improve athletic performance', labelAr: 'تحسين الأداء الرياضي' },
        ],
      },
      {
        code: 'timeline',
        text: 'What is your target timeline?',
        textAr: 'ما هو الجدول الزمني المستهدف؟',
        type: 'single_choice',
        options: [
          { value: '1month', label: '1 month', labelAr: 'شهر واحد' },
          { value: '3months', label: '3 months', labelAr: '3 أشهر' },
          { value: '6months', label: '6 months', labelAr: '6 أشهر' },
          { value: 'ongoing', label: 'Long-term lifestyle', labelAr: 'نمط حياة طويل المدى' },
        ],
      },
    ],
  },
  {
    code: 'test_equipment',
    title: 'Your Equipment',
    titleAr: 'معداتك',
    description: 'What equipment do you have access to?',
    descriptionAr: 'ما المعدات المتاحة لديك؟',
    triggerEvent: 'onboarding',
    
    questions: [
      {
        code: 'workout_location',
        text: 'Where do you usually work out?',
        textAr: 'أين تتمرن عادة؟',
        type: 'single_choice',
        options: [
          { value: 'gym', label: 'Full gym', labelAr: 'صالة رياضية كاملة' },
          { value: 'home_equipped', label: 'Home with equipment', labelAr: 'منزل مع معدات' },
          { value: 'home_minimal', label: 'Home minimal equipment', labelAr: 'منزل بمعدات قليلة' },
          { value: 'outdoor', label: 'Outdoor/Calisthenics', labelAr: 'خارجي/كاليسثنيكس' },
        ],
      },
      {
        code: 'available_equipment',
        text: 'What equipment do you have? (Select all)',
        textAr: 'ما المعدات المتوفرة لديك؟ (اختر الكل)',
        type: 'multi_choice',
        options: [
          { value: 'dumbbells', label: 'Dumbbells', labelAr: 'دمبلز' },
          { value: 'barbell', label: 'Barbell', labelAr: 'بار' },
          { value: 'kettlebells', label: 'Kettlebells', labelAr: 'كيتل بيل' },
          { value: 'pull_up_bar', label: 'Pull-up bar', labelAr: 'بار عقلة' },
          { value: 'resistance_bands', label: 'Resistance bands', labelAr: 'أحزمة مقاومة' },
          { value: 'bench', label: 'Bench', labelAr: 'بنش' },
          { value: 'cables', label: 'Cable machine', labelAr: 'جهاز كيبل' },
          { value: 'none', label: 'None (bodyweight only)', labelAr: 'لا شيء (وزن الجسم فقط)' },
        ],
      },
    ],
  },
  {
    code: 'test_schedule_lifestyle',
    title: 'Your Schedule',
    titleAr: 'جدولك',
    description: 'Help us fit fitness into your life',
    descriptionAr: 'ساعدنا في ملاءمة اللياقة لحياتك',
    triggerEvent: 'onboarding',
    
    questions: [
      {
        code: 'weekly_frequency',
        text: 'How many days per week can you train?',
        textAr: 'كم يوم في الأسبوع يمكنك التدريب؟',
        type: 'single_choice',
        options: [
          { value: '2', label: '2 days', labelAr: 'يومين' },
          { value: '3', label: '3 days', labelAr: '3 أيام' },
          { value: '4', label: '4 days', labelAr: '4 أيام' },
          { value: '5', label: '5 days', labelAr: '5 أيام' },
          { value: '6', label: '6+ days', labelAr: '6 أيام فأكثر' },
        ],
      },
      {
        code: 'preferred_time',
        text: 'When do you prefer to work out?',
        textAr: 'متى تفضل التمرين؟',
        type: 'single_choice',
        options: [
          { value: 'early_morning', label: 'Early morning (5-7 AM)', labelAr: 'صباح باكر (5-7)' },
          { value: 'morning', label: 'Morning (7-10 AM)', labelAr: 'صباحاً (7-10)' },
          { value: 'midday', label: 'Midday (10 AM - 2 PM)', labelAr: 'منتصف النهار (10-2)' },
          { value: 'afternoon', label: 'Afternoon (2-6 PM)', labelAr: 'بعد الظهر (2-6)' },
          { value: 'evening', label: 'Evening (6-10 PM)', labelAr: 'مساءً (6-10)' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📋 SEEDING PERSONALIZATION SURVEYS                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  for (const survey of surveys) {
    await prisma.survey.upsert({
      where: { code: survey.code },
      update: survey,
      create: survey,
    });
    console.log(`  ✅ ${survey.title}`);
  }

  const total = await prisma.survey.count();
  console.log(`\n📊 Total surveys in database: ${total}\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
