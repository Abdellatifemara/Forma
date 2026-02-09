import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive personalization surveys with engaging names
const surveys = [
  // ============================================
  // 1. FITNESS PROFILE - Know Your Starting Point
  // ============================================
  {
    code: 'fitness_profile',
    title: 'Your Fitness Journey',
    titleAr: 'رحلتك الرياضية',
    description: "Let's understand where you are today",
    descriptionAr: 'دعنا نفهم أين أنت اليوم',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'experience_level',
        text: 'How would you describe your fitness experience?',
        textAr: 'كيف تصف خبرتك الرياضية؟',
        type: 'single_choice',
        options: [
          { value: 'beginner', label: "I'm just starting out", labelAr: 'أنا مبتدئ' },
          { value: 'some_experience', label: "I've worked out on and off", labelAr: 'تمرنت بشكل متقطع' },
          { value: 'intermediate', label: 'I train regularly (6+ months)', labelAr: 'أتمرن بانتظام (6+ شهور)' },
          { value: 'advanced', label: 'I have years of experience', labelAr: 'لدي سنوات من الخبرة' },
        ],
      },
      {
        code: 'current_activity',
        text: 'How active are you right now?',
        textAr: 'ما مدى نشاطك الحالي؟',
        type: 'single_choice',
        options: [
          { value: 'sedentary', label: 'Mostly sitting (desk job, little movement)', labelAr: 'جالس معظم الوقت (عمل مكتبي)' },
          { value: 'lightly_active', label: 'Light activity (walking, light chores)', labelAr: 'نشاط خفيف (مشي، أعمال منزلية)' },
          { value: 'moderately_active', label: 'Moderate (exercise 2-3x/week)', labelAr: 'نشاط متوسط (تمرين 2-3 مرات/أسبوع)' },
          { value: 'very_active', label: 'Very active (exercise 4-5x/week)', labelAr: 'نشاط عالي (تمرين 4-5 مرات/أسبوع)' },
          { value: 'athlete', label: 'Athlete level (daily intense training)', labelAr: 'مستوى رياضي (تدريب مكثف يومي)' },
        ],
      },
      {
        code: 'past_injuries',
        text: 'Do you have any injuries or physical limitations?',
        textAr: 'هل لديك أي إصابات أو قيود جسدية؟',
        type: 'multi_choice',
        options: [
          { value: 'none', label: 'No injuries or limitations', labelAr: 'لا إصابات أو قيود' },
          { value: 'back', label: 'Back problems', labelAr: 'مشاكل في الظهر' },
          { value: 'knee', label: 'Knee issues', labelAr: 'مشاكل في الركبة' },
          { value: 'shoulder', label: 'Shoulder problems', labelAr: 'مشاكل في الكتف' },
          { value: 'wrist', label: 'Wrist/hand issues', labelAr: 'مشاكل في الرسغ/اليد' },
          { value: 'ankle', label: 'Ankle/foot problems', labelAr: 'مشاكل في الكاحل/القدم' },
          { value: 'heart', label: 'Heart condition', labelAr: 'مشاكل في القلب' },
          { value: 'other', label: 'Other', labelAr: 'أخرى' },
        ],
      },
      {
        code: 'fitness_tests',
        text: "Quick test: How many push-ups can you do without stopping?",
        textAr: 'اختبار سريع: كم عدد تمارين الضغط التي يمكنك القيام بها؟',
        type: 'single_choice',
        options: [
          { value: '0-5', label: '0-5', labelAr: '0-5' },
          { value: '6-15', label: '6-15', labelAr: '6-15' },
          { value: '16-30', label: '16-30', labelAr: '16-30' },
          { value: '31-50', label: '31-50', labelAr: '31-50' },
          { value: '50+', label: '50+', labelAr: '+50' },
        ],
      },
    ],
  },

  // ============================================
  // 2. BODY GOALS - Your Dream Physique
  // ============================================
  {
    code: 'body_goals',
    title: 'Your Body Goals',
    titleAr: 'أهداف جسمك',
    description: 'What transformation are you looking for?',
    descriptionAr: 'ما التحول الذي تبحث عنه؟',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'primary_goal',
        text: "What's your #1 fitness goal?",
        textAr: 'ما هو هدفك الرئيسي؟',
        type: 'single_choice',
        options: [
          { value: 'lose_fat', label: 'Lose fat & get lean', labelAr: 'خسارة الدهون والحصول على جسم رشيق' },
          { value: 'build_muscle', label: 'Build muscle & size', labelAr: 'بناء العضلات وزيادة الحجم' },
          { value: 'get_stronger', label: 'Get stronger (strength focus)', labelAr: 'زيادة القوة' },
          { value: 'tone_up', label: 'Tone up & get defined', labelAr: 'شد الجسم وإبراز العضلات' },
          { value: 'improve_health', label: 'Improve overall health', labelAr: 'تحسين الصحة العامة' },
          { value: 'athletic', label: 'Improve athletic performance', labelAr: 'تحسين الأداء الرياضي' },
          { value: 'maintain', label: 'Maintain current fitness', labelAr: 'الحفاظ على اللياقة الحالية' },
        ],
      },
      {
        code: 'weight_goal',
        text: 'What about your weight?',
        textAr: 'ماذا عن وزنك؟',
        type: 'single_choice',
        options: [
          { value: 'lose_10plus', label: 'Lose 10+ kg', labelAr: 'خسارة 10+ كجم' },
          { value: 'lose_5_10', label: 'Lose 5-10 kg', labelAr: 'خسارة 5-10 كجم' },
          { value: 'lose_few', label: 'Lose a few kg', labelAr: 'خسارة بضع كيلوغرامات' },
          { value: 'maintain', label: 'Maintain my weight', labelAr: 'الحفاظ على وزني' },
          { value: 'gain_few', label: 'Gain a few kg (muscle)', labelAr: 'زيادة بضع كيلوغرامات (عضلات)' },
          { value: 'gain_5_10', label: 'Gain 5-10 kg (muscle)', labelAr: 'زيادة 5-10 كجم (عضلات)' },
          { value: 'gain_10plus', label: 'Gain 10+ kg (muscle)', labelAr: 'زيادة 10+ كجم (عضلات)' },
        ],
      },
      {
        code: 'problem_areas',
        text: 'Any areas you want to focus on? (Select all)',
        textAr: 'أي مناطق تريد التركيز عليها؟ (اختر الكل)',
        type: 'multi_choice',
        options: [
          { value: 'belly', label: 'Belly fat', labelAr: 'دهون البطن' },
          { value: 'chest', label: 'Chest', labelAr: 'الصدر' },
          { value: 'arms', label: 'Arms', labelAr: 'الذراعين' },
          { value: 'back', label: 'Back', labelAr: 'الظهر' },
          { value: 'shoulders', label: 'Shoulders', labelAr: 'الأكتاف' },
          { value: 'legs', label: 'Legs', labelAr: 'الساقين' },
          { value: 'glutes', label: 'Glutes', labelAr: 'المؤخرة' },
          { value: 'overall', label: 'Overall body', labelAr: 'الجسم بالكامل' },
        ],
      },
      {
        code: 'timeline',
        text: 'When do you want to see results?',
        textAr: 'متى تريد رؤية النتائج؟',
        type: 'single_choice',
        options: [
          { value: '1_month', label: 'Within 1 month (quick wins)', labelAr: 'خلال شهر (نتائج سريعة)' },
          { value: '3_months', label: '3 months (realistic change)', labelAr: '3 أشهر (تغيير واقعي)' },
          { value: '6_months', label: '6 months (major transformation)', labelAr: '6 أشهر (تحول كبير)' },
          { value: 'year', label: '1 year (lifestyle change)', labelAr: 'سنة (تغيير نمط الحياة)' },
          { value: 'no_rush', label: "No rush, it's a journey", labelAr: 'لا استعجال، إنها رحلة' },
        ],
      },
    ],
  },

  // ============================================
  // 3. TRAINING STYLE - How You Like to Move
  // ============================================
  {
    code: 'training_style',
    title: 'Your Training Style',
    titleAr: 'أسلوب تدريبك',
    description: 'How do you like to work out?',
    descriptionAr: 'كيف تحب التمرين؟',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'workout_types',
        text: 'What types of training do you enjoy? (Select all)',
        textAr: 'ما أنواع التدريب التي تستمتع بها؟ (اختر الكل)',
        type: 'multi_choice',
        options: [
          { value: 'weight_training', label: 'Weight training', labelAr: 'تمارين الأثقال' },
          { value: 'bodyweight', label: 'Bodyweight/Calisthenics', labelAr: 'تمارين وزن الجسم' },
          { value: 'cardio', label: 'Cardio (running, cycling)', labelAr: 'كارديو (جري، دراجة)' },
          { value: 'hiit', label: 'HIIT workouts', labelAr: 'تمارين HIIT' },
          { value: 'crossfit', label: 'CrossFit style', labelAr: 'كروس فيت' },
          { value: 'yoga', label: 'Yoga/Stretching', labelAr: 'يوجا/إطالة' },
          { value: 'sports', label: 'Sports (football, basketball)', labelAr: 'رياضات (كرة قدم، سلة)' },
          { value: 'swimming', label: 'Swimming', labelAr: 'سباحة' },
          { value: 'martial_arts', label: 'Martial arts/Boxing', labelAr: 'فنون قتالية/ملاكمة' },
        ],
      },
      {
        code: 'workout_location',
        text: 'Where will you work out?',
        textAr: 'أين ستتمرن؟',
        type: 'single_choice',
        options: [
          { value: 'full_gym', label: 'Full gym with all equipment', labelAr: 'صالة كاملة بكل المعدات' },
          { value: 'basic_gym', label: 'Basic gym (limited equipment)', labelAr: 'صالة أساسية (معدات محدودة)' },
          { value: 'home_equipped', label: 'Home gym (I have equipment)', labelAr: 'صالة منزلية (لدي معدات)' },
          { value: 'home_minimal', label: 'Home with minimal equipment', labelAr: 'المنزل بمعدات قليلة' },
          { value: 'no_equipment', label: 'No equipment (bodyweight only)', labelAr: 'بدون معدات (وزن الجسم فقط)' },
          { value: 'outdoor', label: 'Outdoors (park, street)', labelAr: 'في الخارج (حديقة، شارع)' },
        ],
      },
      {
        code: 'available_equipment',
        text: 'What equipment do you have access to? (Select all)',
        textAr: 'ما المعدات المتاحة لديك؟ (اختر الكل)',
        type: 'multi_choice',
        options: [
          { value: 'dumbbells', label: 'Dumbbells', labelAr: 'دمبلز' },
          { value: 'barbell', label: 'Barbell + plates', labelAr: 'بار + أوزان' },
          { value: 'kettlebells', label: 'Kettlebells', labelAr: 'كيتل بيل' },
          { value: 'pull_up_bar', label: 'Pull-up bar', labelAr: 'بار عقلة' },
          { value: 'bands', label: 'Resistance bands', labelAr: 'أحزمة مقاومة' },
          { value: 'bench', label: 'Bench', labelAr: 'بنش' },
          { value: 'squat_rack', label: 'Squat rack', labelAr: 'رف السكوات' },
          { value: 'cables', label: 'Cable machines', labelAr: 'أجهزة كيبل' },
          { value: 'machines', label: 'Gym machines', labelAr: 'أجهزة الجيم' },
          { value: 'cardio_machines', label: 'Treadmill/Bike', labelAr: 'مشاية/دراجة' },
          { value: 'none', label: 'None/Bodyweight only', labelAr: 'لا شيء/وزن الجسم فقط' },
        ],
      },
      {
        code: 'workout_duration',
        text: 'How long can you work out?',
        textAr: 'كم من الوقت يمكنك التمرين؟',
        type: 'single_choice',
        options: [
          { value: '15_20', label: '15-20 minutes', labelAr: '15-20 دقيقة' },
          { value: '30', label: '30 minutes', labelAr: '30 دقيقة' },
          { value: '45', label: '45 minutes', labelAr: '45 دقيقة' },
          { value: '60', label: '60 minutes', labelAr: '60 دقيقة' },
          { value: '90', label: '90 minutes', labelAr: '90 دقيقة' },
          { value: '120_plus', label: '2+ hours', labelAr: 'ساعتين أو أكثر' },
        ],
      },
      {
        code: 'intensity',
        text: 'How intense do you want your workouts?',
        textAr: 'ما مدى شدة التمارين التي تريدها؟',
        type: 'single_choice',
        options: [
          { value: 'light', label: 'Light (easy, low sweat)', labelAr: 'خفيف (سهل، تعرق قليل)' },
          { value: 'moderate', label: 'Moderate (challenging but doable)', labelAr: 'متوسط (تحدي لكن ممكن)' },
          { value: 'hard', label: 'Hard (push my limits)', labelAr: 'صعب (تحدي حدودي)' },
          { value: 'intense', label: 'Intense (leave it all on the floor)', labelAr: 'مكثف (أعطي كل شيء)' },
        ],
      },
    ],
  },

  // ============================================
  // 4. SCHEDULE & AVAILABILITY
  // ============================================
  {
    code: 'schedule',
    title: 'Your Schedule',
    titleAr: 'جدولك',
    description: "Let's find the best time for you",
    descriptionAr: 'دعنا نجد أفضل وقت لك',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'weekly_days',
        text: 'How many days per week can you train?',
        textAr: 'كم يوم في الأسبوع يمكنك التدريب؟',
        type: 'single_choice',
        options: [
          { value: '1-2', label: '1-2 days', labelAr: '1-2 يوم' },
          { value: '3', label: '3 days', labelAr: '3 أيام' },
          { value: '4', label: '4 days', labelAr: '4 أيام' },
          { value: '5', label: '5 days', labelAr: '5 أيام' },
          { value: '6-7', label: '6-7 days', labelAr: '6-7 أيام' },
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
          { value: 'evening', label: 'Evening (6-9 PM)', labelAr: 'مساءً (6-9)' },
          { value: 'night', label: 'Night (9 PM+)', labelAr: 'ليلاً (9+)' },
          { value: 'flexible', label: 'Flexible/Changes daily', labelAr: 'مرن/يتغير يومياً' },
        ],
      },
      {
        code: 'work_schedule',
        text: "What's your work/life situation?",
        textAr: 'ما هو وضعك الوظيفي/الحياتي؟',
        type: 'single_choice',
        options: [
          { value: 'office_9_5', label: 'Office job (9-5)', labelAr: 'عمل مكتبي (9-5)' },
          { value: 'remote', label: 'Work from home', labelAr: 'عمل من المنزل' },
          { value: 'shift_work', label: 'Shift work (changing hours)', labelAr: 'عمل بنظام الورديات' },
          { value: 'student', label: 'Student', labelAr: 'طالب' },
          { value: 'parent', label: 'Stay-at-home parent', labelAr: 'أب/أم في المنزل' },
          { value: 'flexible', label: 'Flexible schedule', labelAr: 'جدول مرن' },
          { value: 'busy', label: 'Very busy/unpredictable', labelAr: 'مشغول جداً/غير متوقع' },
        ],
      },
    ],
  },

  // ============================================
  // 5. NUTRITION PROFILE
  // ============================================
  {
    code: 'nutrition_profile',
    title: 'Your Eating Habits',
    titleAr: 'عاداتك الغذائية',
    description: "Food is fuel - let's get it right",
    descriptionAr: 'الطعام وقود - دعنا نحسنه',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'diet_type',
        text: 'How would you describe your current diet?',
        textAr: 'كيف تصف نظامك الغذائي الحالي؟',
        type: 'single_choice',
        options: [
          { value: 'no_diet', label: "I don't follow any diet", labelAr: 'لا أتبع أي نظام' },
          { value: 'trying', label: "I try to eat healthy", labelAr: 'أحاول الأكل الصحي' },
          { value: 'balanced', label: 'Balanced diet', labelAr: 'نظام متوازن' },
          { value: 'high_protein', label: 'High protein', labelAr: 'عالي البروتين' },
          { value: 'low_carb', label: 'Low carb', labelAr: 'قليل الكربوهيدرات' },
          { value: 'keto', label: 'Keto', labelAr: 'كيتو' },
          { value: 'vegetarian', label: 'Vegetarian', labelAr: 'نباتي' },
          { value: 'vegan', label: 'Vegan', labelAr: 'نباتي صرف' },
        ],
      },
      {
        code: 'dietary_restrictions',
        text: 'Any dietary restrictions or preferences? (Select all)',
        textAr: 'أي قيود أو تفضيلات غذائية؟ (اختر الكل)',
        type: 'multi_choice',
        options: [
          { value: 'none', label: 'None', labelAr: 'لا يوجد' },
          { value: 'halal', label: 'Halal', labelAr: 'حلال' },
          { value: 'no_pork', label: 'No pork', labelAr: 'بدون لحم خنزير' },
          { value: 'gluten_free', label: 'Gluten-free', labelAr: 'خالي من الغلوتين' },
          { value: 'lactose_free', label: 'Lactose-free', labelAr: 'خالي من اللاكتوز' },
          { value: 'nut_allergy', label: 'Nut allergy', labelAr: 'حساسية المكسرات' },
          { value: 'seafood_allergy', label: 'Seafood allergy', labelAr: 'حساسية المأكولات البحرية' },
        ],
      },
      {
        code: 'meals_per_day',
        text: 'How many meals do you typically eat?',
        textAr: 'كم وجبة تأكل عادة؟',
        type: 'single_choice',
        options: [
          { value: '1-2', label: '1-2 meals', labelAr: '1-2 وجبة' },
          { value: '3', label: '3 meals', labelAr: '3 وجبات' },
          { value: '4-5', label: '4-5 meals (with snacks)', labelAr: '4-5 وجبات (مع سناكس)' },
          { value: '6+', label: '6+ small meals', labelAr: '6+ وجبات صغيرة' },
          { value: 'irregular', label: 'Irregular/varies', labelAr: 'غير منتظم/يختلف' },
        ],
      },
      {
        code: 'cooking_skill',
        text: 'How are your cooking skills?',
        textAr: 'كيف هي مهاراتك في الطبخ؟',
        type: 'single_choice',
        options: [
          { value: 'none', label: "Can't cook at all", labelAr: 'لا أستطيع الطبخ' },
          { value: 'basic', label: 'Basic (eggs, simple meals)', labelAr: 'أساسي (بيض، وجبات بسيطة)' },
          { value: 'moderate', label: 'Moderate (can follow recipes)', labelAr: 'متوسط (أتبع الوصفات)' },
          { value: 'good', label: 'Good (comfortable cooking)', labelAr: 'جيد (مرتاح في الطبخ)' },
          { value: 'chef', label: 'Excellent (love cooking)', labelAr: 'ممتاز (أحب الطبخ)' },
        ],
      },
      {
        code: 'supplements',
        text: 'Do you use any supplements?',
        textAr: 'هل تستخدم أي مكملات؟',
        type: 'multi_choice',
        options: [
          { value: 'none', label: 'None', labelAr: 'لا شيء' },
          { value: 'protein', label: 'Protein powder', labelAr: 'بروتين بودر' },
          { value: 'creatine', label: 'Creatine', labelAr: 'كرياتين' },
          { value: 'preworkout', label: 'Pre-workout', labelAr: 'بري وورك أوت' },
          { value: 'vitamins', label: 'Vitamins/Multivitamin', labelAr: 'فيتامينات' },
          { value: 'omega3', label: 'Omega-3/Fish oil', labelAr: 'أوميجا 3/زيت سمك' },
          { value: 'bcaa', label: 'BCAAs', labelAr: 'أحماض أمينية' },
          { value: 'other', label: 'Other', labelAr: 'أخرى' },
        ],
      },
    ],
  },

  // ============================================
  // 6. LIFESTYLE & RECOVERY
  // ============================================
  {
    code: 'lifestyle',
    title: 'Your Lifestyle',
    titleAr: 'نمط حياتك',
    description: 'Recovery is where gains are made',
    descriptionAr: 'التعافي هو مفتاح التقدم',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'sleep_hours',
        text: 'How much sleep do you get on average?',
        textAr: 'كم ساعة نوم تحصل عليها في المتوسط؟',
        type: 'single_choice',
        options: [
          { value: 'less_5', label: 'Less than 5 hours', labelAr: 'أقل من 5 ساعات' },
          { value: '5_6', label: '5-6 hours', labelAr: '5-6 ساعات' },
          { value: '7_8', label: '7-8 hours', labelAr: '7-8 ساعات' },
          { value: '9_plus', label: '9+ hours', labelAr: '9+ ساعات' },
          { value: 'irregular', label: 'Very irregular', labelAr: 'غير منتظم جداً' },
        ],
      },
      {
        code: 'stress_level',
        text: 'How would you rate your stress level?',
        textAr: 'كيف تقيم مستوى التوتر لديك؟',
        type: 'single_choice',
        options: [
          { value: 'low', label: 'Low (pretty chill)', labelAr: 'منخفض (هادئ)' },
          { value: 'moderate', label: 'Moderate (manageable)', labelAr: 'متوسط (يمكن التحكم فيه)' },
          { value: 'high', label: 'High (often stressed)', labelAr: 'عالي (متوتر كثيراً)' },
          { value: 'very_high', label: 'Very high (constant stress)', labelAr: 'عالي جداً (توتر مستمر)' },
        ],
      },
      {
        code: 'water_intake',
        text: 'How much water do you drink daily?',
        textAr: 'كم ماء تشرب يومياً؟',
        type: 'single_choice',
        options: [
          { value: 'little', label: 'Not much (often forget)', labelAr: 'قليل (أنسى كثيراً)' },
          { value: '1_2L', label: '1-2 liters', labelAr: '1-2 لتر' },
          { value: '2_3L', label: '2-3 liters', labelAr: '2-3 لتر' },
          { value: '3plus', label: '3+ liters', labelAr: '3+ لتر' },
        ],
      },
      {
        code: 'energy_level',
        text: "How's your energy throughout the day?",
        textAr: 'كيف هي طاقتك خلال اليوم؟',
        type: 'single_choice',
        options: [
          { value: 'low', label: 'Low (always tired)', labelAr: 'منخفضة (متعب دائماً)' },
          { value: 'ups_downs', label: 'Ups and downs', labelAr: 'صعود وهبوط' },
          { value: 'moderate', label: 'Moderate (okay most days)', labelAr: 'متوسطة (جيد معظم الأيام)' },
          { value: 'high', label: 'High (energetic)', labelAr: 'عالية (نشيط)' },
        ],
      },
    ],
  },

  // ============================================
  // 7. MOTIVATION & MINDSET
  // ============================================
  {
    code: 'motivation',
    title: 'What Drives You',
    titleAr: 'ما الذي يحفزك',
    description: "Let's understand your motivation",
    descriptionAr: 'دعنا نفهم دوافعك',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'why_fitness',
        text: 'Why do you want to get fit?',
        textAr: 'لماذا تريد الحصول على لياقة؟',
        type: 'multi_choice',
        options: [
          { value: 'look_better', label: 'Look better', labelAr: 'المظهر الأفضل' },
          { value: 'feel_better', label: 'Feel better/healthier', labelAr: 'الشعور الأفضل/صحة أفضل' },
          { value: 'confidence', label: 'Build confidence', labelAr: 'بناء الثقة' },
          { value: 'energy', label: 'More energy', labelAr: 'طاقة أكثر' },
          { value: 'stress_relief', label: 'Stress relief', labelAr: 'التخلص من التوتر' },
          { value: 'strength', label: 'Get stronger', labelAr: 'القوة' },
          { value: 'sport', label: 'Better at sports', labelAr: 'التفوق في الرياضة' },
          { value: 'event', label: 'Upcoming event (wedding, vacation)', labelAr: 'حدث قادم (زفاف، إجازة)' },
          { value: 'health', label: 'Health concerns', labelAr: 'مخاوف صحية' },
        ],
      },
      {
        code: 'past_challenges',
        text: "What's stopped you before?",
        textAr: 'ما الذي أوقفك من قبل؟',
        type: 'multi_choice',
        options: [
          { value: 'none', label: "Nothing, I'm new", labelAr: 'لا شيء، أنا جديد' },
          { value: 'time', label: 'Not enough time', labelAr: 'عدم وجود وقت كافٍ' },
          { value: 'motivation', label: 'Lost motivation', labelAr: 'فقدان الحافز' },
          { value: 'knowledge', label: "Didn't know what to do", labelAr: 'لم أكن أعرف ماذا أفعل' },
          { value: 'injury', label: 'Got injured', labelAr: 'أصبت' },
          { value: 'results', label: "Didn't see results", labelAr: 'لم أرَ نتائج' },
          { value: 'expensive', label: 'Too expensive', labelAr: 'مكلف جداً' },
          { value: 'boring', label: 'Got bored', labelAr: 'شعرت بالملل' },
          { value: 'life', label: 'Life got in the way', labelAr: 'الحياة تدخلت' },
        ],
      },
      {
        code: 'accountability',
        text: 'What helps you stay on track?',
        textAr: 'ما الذي يساعدك على الاستمرار؟',
        type: 'multi_choice',
        options: [
          { value: 'reminders', label: 'Reminders & notifications', labelAr: 'تذكيرات وإشعارات' },
          { value: 'tracking', label: 'Tracking progress', labelAr: 'تتبع التقدم' },
          { value: 'buddy', label: 'Workout buddy/partner', labelAr: 'شريك تمرين' },
          { value: 'coach', label: 'Having a coach', labelAr: 'وجود مدرب' },
          { value: 'community', label: 'Community support', labelAr: 'دعم المجتمع' },
          { value: 'streaks', label: 'Streaks & achievements', labelAr: 'سلسلة الإنجازات' },
          { value: 'music', label: 'Good music', labelAr: 'موسيقى جيدة' },
          { value: 'self', label: 'Self-motivation', labelAr: 'تحفيز ذاتي' },
        ],
      },
    ],
  },

  // ============================================
  // 8. TRACKING PREFERENCES
  // ============================================
  {
    code: 'tracking_preferences',
    title: 'How You Track',
    titleAr: 'كيف تتابع',
    description: 'Customize your experience',
    descriptionAr: 'خصص تجربتك',
    triggerEvent: 'onboarding',
    questions: [
      {
        code: 'workout_tracking',
        text: 'How detailed do you want workout tracking?',
        textAr: 'ما مدى التفصيل الذي تريده في تتبع التمرين؟',
        type: 'single_choice',
        options: [
          { value: 'simple', label: 'Simple (just log workouts)', labelAr: 'بسيط (فقط سجل التمارين)' },
          { value: 'moderate', label: 'Moderate (sets, reps, weight)', labelAr: 'متوسط (مجموعات، تكرارات، أوزان)' },
          { value: 'detailed', label: 'Detailed (+ rest times, notes)', labelAr: 'مفصل (+ أوقات راحة، ملاحظات)' },
          { value: 'advanced', label: 'Advanced (RPE, tempo, everything)', labelAr: 'متقدم (RPE، إيقاع، كل شيء)' },
        ],
      },
      {
        code: 'food_tracking',
        text: 'How do you want to track food?',
        textAr: 'كيف تريد تتبع الطعام؟',
        type: 'single_choice',
        options: [
          { value: 'none', label: "Don't want to track food", labelAr: 'لا أريد تتبع الطعام' },
          { value: 'simple', label: 'Simple (just calories)', labelAr: 'بسيط (السعرات فقط)' },
          { value: 'macros', label: 'Track macros (protein, carbs, fat)', labelAr: 'تتبع الماكروز' },
          { value: 'detailed', label: 'Detailed (macros + micros)', labelAr: 'مفصل (ماكروز + ميكروز)' },
        ],
      },
      {
        code: 'body_tracking',
        text: 'What body measurements do you want to track?',
        textAr: 'ما قياسات الجسم التي تريد تتبعها؟',
        type: 'multi_choice',
        options: [
          { value: 'weight', label: 'Weight', labelAr: 'الوزن' },
          { value: 'body_fat', label: 'Body fat %', labelAr: 'نسبة الدهون' },
          { value: 'measurements', label: 'Body measurements (chest, waist, etc)', labelAr: 'قياسات الجسم (صدر، خصر)' },
          { value: 'photos', label: 'Progress photos', labelAr: 'صور التقدم' },
          { value: 'none', label: "Don't want to track", labelAr: 'لا أريد التتبع' },
        ],
      },
      {
        code: 'notifications',
        text: 'How often do you want reminders?',
        textAr: 'كم مرة تريد التذكيرات؟',
        type: 'single_choice',
        options: [
          { value: 'none', label: 'No notifications', labelAr: 'بدون إشعارات' },
          { value: 'minimal', label: 'Minimal (important only)', labelAr: 'قليل (المهم فقط)' },
          { value: 'moderate', label: 'Moderate (daily reminders)', labelAr: 'متوسط (تذكيرات يومية)' },
          { value: 'frequent', label: 'Frequent (keep me accountable)', labelAr: 'متكرر (أبقني ملتزماً)' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   📋 SEEDING COMPREHENSIVE PERSONALIZATION SURVEYS               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  // Clear existing surveys first
  await prisma.surveyResponse.deleteMany({});
  await prisma.survey.deleteMany({});
  console.log('  🗑️  Cleared existing surveys\n');

  for (const survey of surveys) {
    await prisma.survey.create({
      data: survey as any,
    });
    const questionCount = survey.questions.length;
    console.log(`  ✅ ${survey.title} (${questionCount} questions)`);
  }

  const total = await prisma.survey.count();
  const totalQuestions = surveys.reduce((acc, s) => acc + s.questions.length, 0);

  console.log(`\n╔═══════════════════════════════════════════════════════════════════╗`);
  console.log(`║   📊 SUMMARY                                                      ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════════╣`);
  console.log(`║   Total Surveys: ${total.toString().padEnd(48)}║`);
  console.log(`║   Total Questions: ${totalQuestions.toString().padEnd(46)}║`);
  console.log(`╚═══════════════════════════════════════════════════════════════════╝\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
