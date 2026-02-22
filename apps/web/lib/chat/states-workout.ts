import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// WORKOUT & TRAINING DOMAIN (~65 states)
// ═══════════════════════════════════════════════════════════════

export const workoutStates: ChatState[] = [
  // ─── Main Workout Menu ────────────────────────────────────
  {
    id: 'WK_MENU',
    domain: 'workout',
    text: { en: 'Workouts & Training', ar: 'التمارين والتدريب' },
    botMessage: {
      en: 'Let\'s train! What do you need?',
      ar: 'يلا نتمرن! محتاج ايه؟',
    },
    back: 'ROOT',
    options: [
      { id: 'wk1', label: { en: 'Today\'s Workout', ar: 'تمرين النهارده' }, icon: '📅', nextState: 'WK_TODAY' },
      { id: 'wk2', label: { en: 'Find Exercises', ar: 'دوّر على تمارين' }, icon: '🔍', nextState: 'WK_FIND' },
      { id: 'wk3', label: { en: 'Create Workout', ar: 'اعمل تمرين جديد' }, icon: '➕', nextState: 'WK_CREATE' },
      { id: 'wk4', label: { en: 'Workout History', ar: 'تاريخ التمارين' }, icon: '📖', nextState: 'WK_HISTORY' },
      { id: 'wk5', label: { en: 'Pre-Workout Checklist', ar: 'تشيكلست قبل التمرين' }, icon: '✅', nextState: 'WK_PRE' },
      { id: 'wk6', label: { en: 'Post-Workout', ar: 'بعد التمرين' }, icon: '🏁', nextState: 'WK_POST' },
      { id: 'wk7', label: { en: 'Form & Technique', ar: 'الفورم والتكنيك' }, icon: '🎯', nextState: 'WK_FORM_MENU' },
      { id: 'wk9', label: { en: 'CrossFit', ar: 'كروس فت' }, icon: '🏋️‍♂️', nextState: 'WK_CROSSFIT' },
      { id: 'wk_ai1', label: { en: 'AI Pre-Workout Guidance', ar: 'إرشادات AI قبل التمرين' }, icon: '🧠', nextState: 'WK_AI_PREWORKOUT',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'wk_ai2', label: { en: 'AI Post-Workout Review', ar: 'مراجعة AI بعد التمرين' }, icon: '🧠', nextState: 'WK_AI_POSTWORKOUT',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'wk8', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Today's Workout ──────────────────────────────────────
  {
    id: 'WK_TODAY',
    domain: 'workout',
    text: { en: 'Today\'s Workout', ar: 'تمرين النهارده' },
    botMessage: {
      en: 'Here\'s what\'s on your schedule today:',
      ar: 'ده اللي عندك النهارده:',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/workouts/today' },
    back: 'WK_MENU',
    options: [
      { id: 'wkt1', label: { en: 'Start Workout', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_SESSION_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkt2', label: { en: 'Swap Exercise', ar: 'غيّر تمرين' }, icon: '🔄', nextState: 'WK_SWAP_SELECT' },
      { id: 'wkt_ai1', label: { en: 'AI Exercise Alternatives', ar: 'بدائل تمارين AI' }, icon: '🧠', nextState: 'WK_AI_ALTERNATIVES',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'wkt_ai2', label: { en: 'AI Form Feedback', ar: 'تقييم AI للفورم' }, icon: '🧠', nextState: 'WK_AI_FEEDBACK',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'wkt3', label: { en: 'Skip Today', ar: 'سكيب النهارده' }, icon: '⏭️', nextState: 'WK_SKIP_REASON' },
      { id: 'wkt4', label: { en: 'Change Workout', ar: 'غيّر التمرين كله' }, icon: '📝', nextState: 'WK_CHANGE' },
      { id: 'wkt5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // ─── Skip Workout Reason ──────────────────────────────────
  {
    id: 'WK_SKIP_REASON',
    domain: 'workout',
    text: { en: 'Why Skip?', ar: 'ليه سكيب؟' },
    botMessage: {
      en: 'No worries! Why are you skipping today?',
      ar: 'مفيش مشكلة! ليه مش هتتمرن النهارده؟',
    },
    back: 'WK_TODAY',
    options: [
      { id: 'wks1', label: { en: 'Feeling tired', ar: 'تعبان' }, icon: '😫', nextState: 'WK_SKIP_TIRED' },
      { id: 'wks2', label: { en: 'Injured/Pain', ar: 'إصابة/وجع' }, icon: '🤕', nextState: 'WK_SKIP_INJURY' },
      { id: 'wks3', label: { en: 'Too busy', ar: 'مشغول' }, icon: '⏰', nextState: 'WK_SKIP_BUSY' },
      { id: 'wks4', label: { en: 'Rest day', ar: 'يوم راحة' }, icon: '😴', nextState: 'WK_SKIP_REST' },
      { id: 'wks5', label: { en: 'Sore from yesterday', ar: 'عضلات واجعاني' }, icon: '💥', nextState: 'WK_SKIP_SORE' },
      { id: 'wks6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_TODAY' },
    ],
  },

  {
    id: 'WK_SKIP_TIRED',
    domain: 'workout',
    text: { en: 'Tired - Alternatives', ar: 'تعبان - بدائل' },
    botMessage: {
      en: 'That\'s okay! Here are some lighter alternatives:\n\n• 15-min light walk\n• Stretching routine (10 min)\n• Yoga/mobility session\n\nRest is part of the process. Your body recovers when you rest.',
      ar: 'مفيش مشكلة! جرّب حاجة خفيفة:\n\n• مشي 15 دقيقة\n• تمارين إطالة (10 دقايق)\n• يوجا أو تمارين مرونة\n\nالراحة جزء من العملية. جسمك بيتعافى وانت بترتاح.',
    },
    back: 'WK_SKIP_REASON',
    options: [
      { id: 'wkst1', label: { en: 'Do light walk', ar: 'أمشي مشي خفيف' }, icon: '🚶', nextState: 'WK_LIGHT_WALK' },
      { id: 'wkst2', label: { en: 'Do stretching', ar: 'أعمل إطالة' }, icon: '🧘', nextState: 'RC_STRETCH_MENU' },
      { id: 'wkst3', label: { en: 'Full rest today', ar: 'أرتاح النهارده' }, icon: '🛏️', nextState: 'WK_REST_LOGGED',
        action: { type: 'write', endpoint: '/workouts/log-rest', requiresConfirmation: true,
          confirmText: { en: 'Log today as a rest day?', ar: 'تسجّل النهارده يوم راحة؟' } } },
      { id: 'wkst4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_REASON' },
    ],
  },

  {
    id: 'WK_SKIP_INJURY',
    domain: 'workout',
    text: { en: 'Injury/Pain', ar: 'إصابة/وجع' },
    botMessage: {
      en: '⚠️ Where does it hurt? Let me suggest safe alternatives.',
      ar: '⚠️ فين الوجع؟ خليني أقترحلك بدائل آمنة.',
    },
    back: 'WK_SKIP_REASON',
    options: [
      { id: 'wki1', label: { en: 'Shoulder', ar: 'الكتف' }, icon: '💪', nextState: 'WK_INJ_SHOULDER' },
      { id: 'wki2', label: { en: 'Back/Spine', ar: 'الضهر/العمود الفقري' }, icon: '🦴', nextState: 'WK_INJ_BACK' },
      { id: 'wki3', label: { en: 'Knee', ar: 'الركبة' }, icon: '🦵', nextState: 'WK_INJ_KNEE' },
      { id: 'wki4', label: { en: 'Wrist/Elbow', ar: 'الرسغ/الكوع' }, icon: '🤲', nextState: 'WK_INJ_WRIST' },
      { id: 'wki5', label: { en: 'Hip', ar: 'الورك' }, icon: '🦴', nextState: 'WK_INJ_HIP' },
      { id: 'wki6', label: { en: 'Neck', ar: 'الرقبة' }, icon: '😣', nextState: 'WK_INJ_NECK' },
      { id: 'wki7', label: { en: 'Ankle/Foot', ar: 'الكاحل/القدم' }, icon: '🦶', nextState: 'WK_INJ_ANKLE' },
      { id: 'wki8', label: { en: 'Skip all training', ar: 'أوقف تمرين خالص' }, icon: '🛑', nextState: 'WK_REST_LOGGED' },
      { id: 'wki9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_REASON' },
    ],
  },

  // Injury-specific safe alternatives (7 states)
  ...(['SHOULDER', 'BACK', 'KNEE', 'WRIST', 'HIP', 'NECK', 'ANKLE'] as const).map(part => {
    const names: Record<string, { en: string; ar: string }> = {
      SHOULDER: { en: 'Shoulder', ar: 'الكتف' },
      BACK: { en: 'Back/Spine', ar: 'الضهر' },
      KNEE: { en: 'Knee', ar: 'الركبة' },
      WRIST: { en: 'Wrist/Elbow', ar: 'الرسغ' },
      HIP: { en: 'Hip', ar: 'الورك' },
      NECK: { en: 'Neck', ar: 'الرقبة' },
      ANKLE: { en: 'Ankle/Foot', ar: 'الكاحل' },
    };
    const safeExercises: Record<string, { en: string; ar: string }> = {
      SHOULDER: { en: 'Safe alternatives:\n• Leg exercises (squats, lunges)\n• Core work (planks, dead bugs)\n• Lower body cardio (cycling, walking)\n• Rotator cuff rehab with light bands', ar: 'بدائل آمنة:\n• تمارين رجل (سكوات، لانجز)\n• تمارين بطن (بلانك)\n• كارديو رجل (عجلة، مشي)\n• تمارين تأهيل الروتاتور كاف بالباند' },
      BACK: { en: 'Safe alternatives:\n• Swimming or water exercises\n• Cat-cow stretches\n• Bird dogs\n• Light walking\n⚠️ Avoid: deadlifts, heavy rows, overhead press', ar: 'بدائل آمنة:\n• سباحة أو تمارين في المية\n• تمرين القطة والبقرة\n• Bird dogs\n• مشي خفيف\n⚠️ تجنّب: ديدلفت، تجديف تقيل، ضغط فوق الراس' },
      KNEE: { en: 'Safe alternatives:\n• Upper body exercises\n• Seated exercises\n• Swimming\n• Straight leg raises\n⚠️ Avoid: squats, lunges, jumping', ar: 'بدائل آمنة:\n• تمارين جزء علوي\n• تمارين وانت قاعد\n• سباحة\n• رفع رجل مستقيمة\n⚠️ تجنّب: سكوات، لانجز، نط' },
      WRIST: { en: 'Safe alternatives:\n• Leg exercises\n• Machine exercises (no grip needed)\n• Cardio (walking, cycling)\n• Wrist stretches and mobility', ar: 'بدائل آمنة:\n• تمارين رجل\n• تمارين ماكينات (من غير قبضة)\n• كارديو (مشي، عجلة)\n• تمارين مرونة الرسغ' },
      HIP: { en: 'Safe alternatives:\n• Upper body exercises\n• Seated exercises\n• Light hip mobility drills\n• Swimming\n⚠️ Avoid: heavy squats, lunges', ar: 'بدائل آمنة:\n• تمارين جزء علوي\n• تمارين وانت قاعد\n• تمارين مرونة الورك الخفيفة\n• سباحة\n⚠️ تجنّب: سكوات تقيل، لانجز' },
      NECK: { en: 'Safe alternatives:\n• Lower body exercises\n• Light cardio (walking)\n• Gentle neck stretches\n• Core work (avoid crunches)\n⚠️ Avoid: overhead press, shrugs', ar: 'بدائل آمنة:\n• تمارين رجل\n• كارديو خفيف (مشي)\n• إطالة رقبة خفيفة\n• تمارين بطن (تجنب الكرنشز)\n⚠️ تجنّب: ضغط فوق الراس، شراجز' },
      ANKLE: { en: 'Safe alternatives:\n• Upper body exercises\n• Seated exercises\n• Swimming\n• Ankle mobility drills\n⚠️ Avoid: running, jumping, heavy squats', ar: 'بدائل آمنة:\n• تمارين جزء علوي\n• تمارين وانت قاعد\n• سباحة\n• تمارين مرونة الكاحل\n⚠️ تجنّب: جري، نط، سكوات تقيل' },
    };
    return {
      id: `WK_INJ_${part}`,
      domain: 'workout' as const,
      text: names[part],
      botMessage: safeExercises[part],
      back: 'WK_SKIP_INJURY',
      options: [
        { id: `wkinj${part}1`, label: { en: 'Find safe exercises', ar: 'دوّر على تمارين آمنة' }, icon: '🔍', nextState: 'WK_FIND_MUSCLE' },
        { id: `wkinj${part}2`, label: { en: 'Log injury', ar: 'سجّل الإصابة' }, icon: '📝', nextState: 'WK_INJ_LOG',
          action: { type: 'write', endpoint: '/health/log-injury', params: { bodyPart: part },
            requiresConfirmation: true, confirmText: { en: `Log ${names[part].en.toLowerCase()} injury?`, ar: `تسجّل إصابة ${names[part].ar}؟` } } },
        { id: `wkinj${part}3`, label: { en: 'Rest today', ar: 'أرتاح النهارده' }, icon: '🛏️', nextState: 'WK_REST_LOGGED' },
        { id: `wkinj${part}4`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_INJURY' },
      ],
    } as ChatState;
  }),

  {
    id: 'WK_INJ_LOG',
    domain: 'workout',
    text: { en: 'Injury Logged', ar: 'الإصابة اتسجلت' },
    botMessage: {
      en: '✅ Injury logged. Your future workouts will avoid exercises that stress this area. Get well soon!',
      ar: '✅ الإصابة اتسجلت. تمارينك الجاية هتتجنب التمارين اللي بتأثر على المنطقة دي. سلامتك!',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkil1', label: { en: 'Safe exercises for today', ar: 'تمارين آمنة النهارده' }, icon: '🏋️', nextState: 'WK_FIND' },
      { id: 'wkil2', label: { en: 'Rest today', ar: 'أرتاح النهارده' }, icon: '🛏️', nextState: 'WK_REST_LOGGED' },
      { id: 'wkil3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'WK_SKIP_BUSY',
    domain: 'workout',
    text: { en: 'Short on Time', ar: 'مشغول' },
    botMessage: {
      en: 'No time? Here are quick options:\n\n• 15-min HIIT (burns same as 30-min steady)\n• 10-min core blast\n• 20-min full body express\n\nSomething is always better than nothing!',
      ar: 'مفيش وقت؟ جرّب حاجة سريعة:\n\n• 15 دقيقة HIIT (بتحرق زي 30 دقيقة عادي)\n• 10 دقايق تمارين بطن\n• 20 دقيقة full body سريع\n\nأي حاجة أحسن من ولا حاجة!',
    },
    back: 'WK_SKIP_REASON',
    options: [
      { id: 'wkb1', label: { en: '15-min HIIT', ar: '15 دقيقة HIIT' }, icon: '🔥', nextState: 'WK_QUICK_HIIT' },
      { id: 'wkb2', label: { en: '10-min Core', ar: '10 دقايق بطن' }, icon: '💪', nextState: 'WK_QUICK_CORE' },
      { id: 'wkb3', label: { en: '20-min Full Body', ar: '20 دقيقة Full Body' }, icon: '🏋️', nextState: 'WK_QUICK_FULLBODY' },
      { id: 'wkb4', label: { en: 'Just skip', ar: 'سكيب خالص' }, icon: '⏭️', nextState: 'WK_REST_LOGGED' },
      { id: 'wkb5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_REASON' },
    ],
  },

  {
    id: 'WK_SKIP_REST',
    domain: 'workout',
    text: { en: 'Rest Day', ar: 'يوم راحة' },
    botMessage: {
      en: 'Rest days are essential! Your muscles grow during rest, not during training.\n\nTips for rest day:\n• Stay hydrated\n• Get 7-9 hours sleep\n• Light walking is fine\n• Eat enough protein',
      ar: 'أيام الراحة ضرورية! العضلات بتكبر وانت بترتاح، مش وانت بتتمرن.\n\nنصايح ليوم الراحة:\n• اشرب مية كتير\n• نام 7-9 ساعات\n• مشي خفيف مفيش مشكلة\n• كل بروتين كفاية',
    },
    back: 'WK_SKIP_REASON',
    options: [
      { id: 'wkr1', label: { en: 'Log rest day', ar: 'سجّل يوم راحة' }, icon: '📝', nextState: 'WK_REST_LOGGED',
        action: { type: 'write', endpoint: '/workouts/log-rest', requiresConfirmation: true,
          confirmText: { en: 'Log rest day?', ar: 'تسجّل يوم راحة؟' } } },
      { id: 'wkr2', label: { en: 'Stretching routine', ar: 'تمارين إطالة' }, icon: '🧘', nextState: 'RC_STRETCH_MENU' },
      { id: 'wkr3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_REASON' },
    ],
  },

  {
    id: 'WK_SKIP_SORE',
    domain: 'workout',
    text: { en: 'Muscle Soreness', ar: 'عضلات واجعاني' },
    botMessage: {
      en: 'Soreness (DOMS) is normal! Here\'s what helps:\n\n• Light movement (active recovery)\n• Foam rolling\n• Stretching\n• Hot bath/shower\n• Adequate protein\n\nYou can still train different muscle groups!',
      ar: 'الوجع (DOMS) طبيعي! اللي بيساعد:\n\n• حركة خفيفة (active recovery)\n• Foam rolling\n• إطالة\n• حمام سخن\n• بروتين كفاية\n\nتقدر تتمرن عضلات تانية!',
    },
    back: 'WK_SKIP_REASON',
    options: [
      { id: 'wkso1', label: { en: 'Train different muscles', ar: 'أتمرن عضلات تانية' }, icon: '💪', nextState: 'WK_FIND_MUSCLE' },
      { id: 'wkso2', label: { en: 'Recovery routine', ar: 'روتين ريكفري' }, icon: '🧘', nextState: 'RC_MENU' },
      { id: 'wkso3', label: { en: 'Foam rolling guide', ar: 'دليل Foam Rolling' }, icon: '🔄', nextState: 'RC_FOAM' },
      { id: 'wkso4', label: { en: 'Rest today', ar: 'أرتاح النهارده' }, icon: '🛏️', nextState: 'WK_REST_LOGGED' },
      { id: 'wkso5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_REASON' },
    ],
  },

  {
    id: 'WK_REST_LOGGED',
    domain: 'workout',
    text: { en: 'Rest Day Logged', ar: 'يوم الراحة اتسجل' },
    botMessage: {
      en: '✅ Rest day logged. Take it easy and come back stronger tomorrow! 💪',
      ar: '✅ يوم الراحة اتسجل. ارتاح كويس وارجع أقوى بكرة! 💪',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkrl1', label: { en: 'Recovery tips', ar: 'نصايح ريكفري' }, icon: '😴', nextState: 'RC_MENU' },
      { id: 'wkrl2', label: { en: 'Nutrition for rest day', ar: 'أكل يوم الراحة' }, icon: '🥗', nextState: 'NT_REST_DAY' },
      { id: 'wkrl3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'WK_LIGHT_WALK',
    domain: 'workout',
    text: { en: 'Light Walk', ar: 'مشي خفيف' },
    botMessage: {
      en: '🚶 Great choice! A 15-20 minute walk:\n\n• Burns 60-100 calories\n• Improves blood flow to muscles\n• Reduces stress\n• Aids recovery\n\nAim for a comfortable pace — you should be able to hold a conversation.',
      ar: '🚶 اختيار ممتاز! مشي 15-20 دقيقة:\n\n• بيحرق 60-100 سعرة\n• بيحسن الدورة الدموية للعضلات\n• بيقلل التوتر\n• بيساعد في الريكفري\n\nامشي بسرعة مريحة — لازم تقدر تتكلم وانت ماشي.',
    },
    back: 'WK_SKIP_TIRED',
    options: [
      { id: 'wklw1', label: { en: 'Log walk (15 min)', ar: 'سجّل مشي (15 دقيقة)' }, icon: '📝', nextState: 'WK_REST_LOGGED',
        action: { type: 'write', endpoint: '/workouts/log-activity', params: { type: 'walk', duration: '15' },
          requiresConfirmation: true, confirmText: { en: 'Log 15-min walk?', ar: 'تسجّل مشي 15 دقيقة؟' } } },
      { id: 'wklw2', label: { en: 'Log walk (30 min)', ar: 'سجّل مشي (30 دقيقة)' }, icon: '📝', nextState: 'WK_REST_LOGGED',
        action: { type: 'write', endpoint: '/workouts/log-activity', params: { type: 'walk', duration: '30' },
          requiresConfirmation: true, confirmText: { en: 'Log 30-min walk?', ar: 'تسجّل مشي 30 دقيقة؟' } } },
      { id: 'wklw3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_TIRED' },
    ],
  },

  // ─── Quick Workouts ───────────────────────────────────────
  ...(['HIIT', 'CORE', 'FULLBODY'] as const).map(type => {
    const info: Record<string, { en: string; ar: string; msg_en: string; msg_ar: string }> = {
      HIIT: { en: '15-min HIIT', ar: '15 دقيقة HIIT',
        msg_en: '🔥 15-Minute HIIT Blast:\n\n1. Jumping Jacks — 45s\n2. Burpees — 30s\n3. Mountain Climbers — 45s\n4. Squat Jumps — 30s\n5. Push-ups — 45s\n6. High Knees — 30s\n7. Plank — 45s\n\n30s rest between exercises. Repeat 2x.',
        msg_ar: '🔥 15 دقيقة HIIT:\n\n1. Jumping Jacks — 45 ثانية\n2. بيربي — 30 ثانية\n3. Mountain Climbers — 45 ثانية\n4. سكوات جامب — 30 ثانية\n5. بوش أب — 45 ثانية\n6. High Knees — 30 ثانية\n7. بلانك — 45 ثانية\n\n30 ثانية راحة بين كل تمرين. كرر 2 مرة.' },
      CORE: { en: '10-min Core', ar: '10 دقايق بطن',
        msg_en: '💪 10-Minute Core Blast:\n\n1. Plank — 60s\n2. Bicycle Crunches — 20 reps\n3. Leg Raises — 15 reps\n4. Russian Twists — 20 reps\n5. Dead Bugs — 12 each side\n6. Plank — 60s\n\nNo rest between exercises.',
        msg_ar: '💪 10 دقايق بطن:\n\n1. بلانك — 60 ثانية\n2. Bicycle Crunches — 20 مرة\n3. رفع رجل — 15 مرة\n4. Russian Twists — 20 مرة\n5. Dead Bugs — 12 كل جانب\n6. بلانك — 60 ثانية\n\nمن غير راحة بين التمارين.' },
      FULLBODY: { en: '20-min Full Body', ar: '20 دقيقة Full Body',
        msg_en: '🏋️ 20-Minute Full Body Express:\n\n1. Squats — 3x12\n2. Push-ups — 3x10\n3. Lunges — 3x10 each\n4. Dumbbell Rows — 3x10\n5. Plank — 3x30s\n6. Jumping Jacks — 3x30s\n\n30s rest between sets.',
        msg_ar: '🏋️ 20 دقيقة Full Body:\n\n1. سكوات — 3×12\n2. بوش أب — 3×10\n3. لانجز — 3×10 كل رجل\n4. تجديف دمبل — 3×10\n5. بلانك — 3×30 ثانية\n6. Jumping Jacks — 3×30 ثانية\n\n30 ثانية راحة بين السيتات.' },
    };
    const i = info[type];
    return {
      id: `WK_QUICK_${type}`,
      domain: 'workout' as const,
      text: { en: i.en, ar: i.ar },
      botMessage: { en: i.msg_en, ar: i.msg_ar },
      back: 'WK_SKIP_BUSY',
      options: [
        { id: `wkq${type}1`, label: { en: 'Start this workout', ar: 'ابدأ التمرين ده' }, icon: '▶️', nextState: 'WK_SESSION_START',
          action: { type: 'write', endpoint: '/workouts/create-quick', params: { type: type.toLowerCase() },
            requiresConfirmation: true, confirmText: { en: `Start ${i.en}?`, ar: `تبدأ ${i.ar}؟` } } },
        { id: `wkq${type}2`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_SKIP_BUSY' },
      ],
    } as ChatState;
  }),

  {
    id: 'WK_SESSION_START',
    domain: 'workout',
    text: { en: 'Workout Started', ar: 'التمرين بدأ' },
    botMessage: {
      en: '🏋️ Workout started! Opening your workout tracker...\n\nRemember:\n• Warm up first (5 min)\n• Control the movement\n• Breathe properly\n• Stay hydrated',
      ar: '🏋️ التمرين بدأ! بفتحلك تراكر التمرين...\n\nفاكر:\n• سخّن الأول (5 دقايق)\n• تحكّم في الحركة\n• تنفّس صح\n• اشرب مية',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkss1', label: { en: 'Go to workout', ar: 'روح للتمرين' }, icon: '🏋️', nextState: 'ROOT',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkss2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // ─── Find Exercises ───────────────────────────────────────
  {
    id: 'WK_FIND',
    domain: 'workout',
    text: { en: 'Find Exercises', ar: 'دوّر على تمارين' },
    botMessage: {
      en: 'How would you like to search?',
      ar: 'عايز تدوّر إزاي؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkf1', label: { en: 'By muscle group', ar: 'حسب العضلة' }, icon: '💪', nextState: 'WK_FIND_MUSCLE' },
      { id: 'wkf2', label: { en: 'By equipment', ar: 'حسب المعدات' }, icon: '🏋️', nextState: 'WK_FIND_EQUIP' },
      { id: 'wkf3', label: { en: 'By difficulty', ar: 'حسب المستوى' }, icon: '📊', nextState: 'WK_FIND_DIFF' },
      { id: 'wkf4', label: { en: 'By type', ar: 'حسب النوع' }, icon: '🏃', nextState: 'WK_FIND_TYPE' },
      { id: 'wkf5', label: { en: 'Browse all', ar: 'تصفّح الكل' }, icon: '📋', nextState: 'WK_BROWSE_ALL',
        action: { type: 'navigate', route: '/exercises' } },
      { id: 'wkf6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  {
    id: 'WK_FIND_MUSCLE',
    domain: 'workout',
    text: { en: 'Select Muscle Group', ar: 'اختار العضلة' },
    botMessage: {
      en: 'Which muscle group?',
      ar: 'عايز تمارين لأي عضلة؟',
    },
    back: 'WK_FIND',
    options: [
      { id: 'wkm1', label: { en: 'Chest', ar: 'صدر' }, icon: '🫁', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'CHEST' } } },
      { id: 'wkm2', label: { en: 'Back', ar: 'ضهر' }, icon: '🔙', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'BACK' } } },
      { id: 'wkm3', label: { en: 'Shoulders', ar: 'كتف' }, icon: '💪', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'SHOULDERS' } } },
      { id: 'wkm4', label: { en: 'Biceps', ar: 'باي' }, icon: '💪', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'BICEPS' } } },
      { id: 'wkm5', label: { en: 'Triceps', ar: 'تراي' }, icon: '💪', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'TRICEPS' } } },
      { id: 'wkm6', label: { en: 'Legs (Quads)', ar: 'رجل (كوادز)' }, icon: '🦵', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'QUADRICEPS' } } },
      { id: 'wkm7', label: { en: 'Hamstrings', ar: 'هامسترنج' }, icon: '🦵', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'HAMSTRINGS' } } },
      { id: 'wkm8', label: { en: 'Glutes', ar: 'مؤخرة' }, icon: '🍑', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'GLUTES' } } },
      { id: 'wkm9', label: { en: 'Core/Abs', ar: 'بطن' }, icon: '🎯', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'ABS' } } },
      { id: 'wkm10', label: { en: 'Calves', ar: 'سمانة' }, icon: '🦵', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'CALVES' } } },
      { id: 'wkm11', label: { en: 'Forearms', ar: 'ساعد' }, icon: '💪', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'FOREARMS' } } },
      { id: 'wkm12', label: { en: 'Traps', ar: 'ترابس' }, icon: '💪', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { muscle: 'TRAPS' } } },
      { id: 'wkm13', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FIND' },
    ],
  },

  {
    id: 'WK_FIND_EQUIP',
    domain: 'workout',
    text: { en: 'Select Equipment', ar: 'اختار المعدات' },
    botMessage: {
      en: 'What equipment do you have?',
      ar: 'عندك ايه من المعدات؟',
    },
    back: 'WK_FIND',
    options: [
      { id: 'wke1', label: { en: 'Bodyweight (none)', ar: 'بدون معدات' }, icon: '🤸', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'BODYWEIGHT' } } },
      { id: 'wke2', label: { en: 'Dumbbells', ar: 'دمبلز' }, icon: '🏋️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'DUMBBELLS' } } },
      { id: 'wke3', label: { en: 'Barbell', ar: 'بار' }, icon: '🏋️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'BARBELL' } } },
      { id: 'wke4', label: { en: 'Cables/Machines', ar: 'كابلات/ماكينات' }, icon: '🔧', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'CABLE' } } },
      { id: 'wke5', label: { en: 'Resistance Bands', ar: 'باندات مقاومة' }, icon: '🟡', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'RESISTANCE_BAND' } } },
      { id: 'wke6', label: { en: 'Kettlebell', ar: 'كيتل بل' }, icon: '🔔', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'KETTLEBELL' } } },
      { id: 'wke7', label: { en: 'Pull-up Bar', ar: 'بار عقلة' }, icon: '🪜', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { equipment: 'PULL_UP_BAR' } } },
      { id: 'wke8', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FIND' },
    ],
  },

  {
    id: 'WK_FIND_DIFF',
    domain: 'workout',
    text: { en: 'Select Difficulty', ar: 'اختار المستوى' },
    botMessage: {
      en: 'What\'s your level?',
      ar: 'مستواك ايه؟',
    },
    back: 'WK_FIND',
    options: [
      { id: 'wkd1', label: { en: 'Beginner', ar: 'مبتدئ' }, icon: '🟢', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { difficulty: 'BEGINNER' } } },
      { id: 'wkd2', label: { en: 'Intermediate', ar: 'متوسط' }, icon: '🟡', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { difficulty: 'INTERMEDIATE' } } },
      { id: 'wkd3', label: { en: 'Advanced', ar: 'متقدم' }, icon: '🔴', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { difficulty: 'ADVANCED' } } },
      { id: 'wkd4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FIND' },
    ],
  },

  {
    id: 'WK_FIND_TYPE',
    domain: 'workout',
    text: { en: 'Exercise Type', ar: 'نوع التمرين' },
    botMessage: {
      en: 'What type of exercise?',
      ar: 'عايز نوع ايه؟',
    },
    back: 'WK_FIND',
    options: [
      { id: 'wkft1', label: { en: 'Strength', ar: 'قوة' }, icon: '🏋️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'STRENGTH' } } },
      { id: 'wkft2', label: { en: 'Cardio', ar: 'كارديو' }, icon: '🏃', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'CARDIO' } } },
      { id: 'wkft3', label: { en: 'Stretching', ar: 'إطالة' }, icon: '🧘', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'STRETCHING' } } },
      { id: 'wkft4', label: { en: 'HIIT', ar: 'HIIT' }, icon: '🔥', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'HIIT' } } },
      { id: 'wkft5', label: { en: 'Yoga', ar: 'يوجا' }, icon: '🧘‍♀️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'YOGA' } } },
      { id: 'wkft6', label: { en: 'Calisthenics', ar: 'كاليسثنكس' }, icon: '🤸', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'CALISTHENICS' } } },
      { id: 'wkft7', label: { en: 'Olympic Lifts', ar: 'رفع أولمبي' }, icon: '🏋️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'OLYMPIC' } } },
      { id: 'wkft8', label: { en: 'Powerlifting', ar: 'باورلفتنج' }, icon: '🏋️', nextState: 'WK_RESULTS',
        action: { type: 'fetch', endpoint: '/exercises', params: { category: 'POWERLIFTING' } } },
      { id: 'wkft9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FIND' },
    ],
  },

  {
    id: 'WK_RESULTS',
    domain: 'workout',
    text: { en: 'Exercise Results', ar: 'نتائج التمارين' },
    botMessage: {
      en: 'Here are the exercises I found:',
      ar: 'دي التمارين اللي لقيتها:',
    },
    dynamic: true,
    back: 'WK_FIND',
    options: [
      { id: 'wkr1', label: { en: 'Add to workout', ar: 'أضيف للتمرين' }, icon: '➕', nextState: 'WK_ADD_CONFIRM',
        action: { type: 'write', endpoint: '/workouts/add-exercise', requiresConfirmation: true,
          confirmText: { en: 'Add this exercise to your workout?', ar: 'تضيف التمرين ده لتمرينك؟' } } },
      { id: 'wkr2', label: { en: 'View details', ar: 'تفاصيل' }, icon: '📖', nextState: 'WK_EXERCISE_DETAIL' },
      { id: 'wkr3', label: { en: 'Search again', ar: 'دوّر تاني' }, icon: '🔍', nextState: 'WK_FIND' },
      { id: 'wkr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FIND' },
    ],
  },

  {
    id: 'WK_EXERCISE_DETAIL',
    domain: 'workout',
    text: { en: 'Exercise Details', ar: 'تفاصيل التمرين' },
    botMessage: {
      en: 'Loading exercise details...',
      ar: 'بحمّل تفاصيل التمرين...',
    },
    dynamic: true,
    back: 'WK_RESULTS',
    options: [
      { id: 'wked1', label: { en: 'Add to workout', ar: 'أضيف للتمرين' }, icon: '➕', nextState: 'WK_ADD_CONFIRM',
        action: { type: 'write', endpoint: '/workouts/add-exercise', requiresConfirmation: true,
          confirmText: { en: 'Add to workout?', ar: 'تضيف للتمرين؟' } } },
      { id: 'wked2', label: { en: 'Watch video', ar: 'شوف الفيديو' }, icon: '📺', nextState: 'WK_EXERCISE_DETAIL' },
      { id: 'wked3', label: { en: 'Similar exercises', ar: 'تمارين مشابهة' }, icon: '🔄', nextState: 'WK_RESULTS' },
      { id: 'wked4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_RESULTS' },
    ],
  },

  {
    id: 'WK_ADD_CONFIRM',
    domain: 'workout',
    text: { en: 'Exercise Added', ar: 'التمرين اتضاف' },
    botMessage: {
      en: '✅ Exercise added to your workout!',
      ar: '✅ التمرين اتضاف لتمرينك!',
    },
    back: 'WK_RESULTS',
    options: [
      { id: 'wkac1', label: { en: 'Add another', ar: 'أضيف تاني' }, icon: '➕', nextState: 'WK_FIND' },
      { id: 'wkac2', label: { en: 'Start workout', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_SESSION_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkac3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'WK_BROWSE_ALL',
    domain: 'workout',
    text: { en: 'Browse All Exercises', ar: 'تصفّح كل التمارين' },
    botMessage: {
      en: 'Opening the full exercise library...',
      ar: 'بفتحلك مكتبة التمارين...',
    },
    back: 'WK_FIND',
    options: [
      { id: 'wkba1', label: { en: 'Done browsing', ar: 'خلصت' }, icon: '✅', nextState: 'WK_FIND' },
      { id: 'wkba2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Create Workout ───────────────────────────────────────
  {
    id: 'WK_CREATE',
    domain: 'workout',
    text: { en: 'Create Workout', ar: 'اعمل تمرين جديد' },
    botMessage: {
      en: 'Let\'s build a workout! What are you training today?',
      ar: 'يلا نعمل تمرين! هتشتغل على ايه النهارده؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkc1', label: { en: 'Chest & Shoulders Day', ar: 'يوم صدر وكتف' }, icon: '💪', nextState: 'WK_CREATE_PUSH' },
      { id: 'wkc2', label: { en: 'Back & Biceps Day', ar: 'يوم ضهر وباي' }, icon: '🏋️', nextState: 'WK_CREATE_PULL' },
      { id: 'wkc3', label: { en: 'Leg Day', ar: 'Leg Day (رجل)' }, icon: '🦵', nextState: 'WK_CREATE_LEGS' },
      { id: 'wkc4', label: { en: 'Upper Body', ar: 'جزء علوي' }, icon: '💪', nextState: 'WK_CREATE_UPPER' },
      { id: 'wkc5', label: { en: 'Lower Body', ar: 'جزء سفلي' }, icon: '🦵', nextState: 'WK_CREATE_LOWER' },
      { id: 'wkc6', label: { en: 'Full Body', ar: 'Full Body' }, icon: '🏃', nextState: 'WK_CREATE_FULL' },
      { id: 'wkc7', label: { en: 'Core/Abs', ar: 'بطن' }, icon: '🎯', nextState: 'WK_CREATE_CORE' },
      { id: 'wkc8', label: { en: 'Custom (pick exercises)', ar: 'مخصص (اختار تمارين)' }, icon: '🔧', nextState: 'WK_FIND_MUSCLE' },
      { id: 'wkc9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // Workout creation for each split (7 states)
  ...(['PUSH', 'PULL', 'LEGS', 'UPPER', 'LOWER', 'FULL', 'CORE'] as const).map(split => {
    const names: Record<string, { en: string; ar: string }> = {
      PUSH: { en: 'Chest & Shoulders', ar: 'صدر وكتف' },
      PULL: { en: 'Back & Biceps', ar: 'ضهر وباي' },
      LEGS: { en: 'Leg Day', ar: 'Leg Day' },
      UPPER: { en: 'Upper Body', ar: 'جزء علوي' },
      LOWER: { en: 'Lower Body', ar: 'جزء سفلي' },
      FULL: { en: 'Full Body', ar: 'Full Body' },
      CORE: { en: 'Core/Abs', ar: 'بطن' },
    };
    return {
      id: `WK_CREATE_${split}`,
      domain: 'workout' as const,
      text: names[split],
      botMessage: {
        en: `Great! I'll create a ${names[split].en} workout for you. How many exercises do you want?`,
        ar: `تمام! هعملك تمرين ${names[split].ar}. عايز كام تمرين؟`,
      },
      back: 'WK_CREATE',
      options: [
        { id: `wkcr${split}1`, label: { en: '4-5 exercises (30 min)', ar: '4-5 تمارين (30 دقيقة)' }, icon: '⏱️', nextState: 'WK_CREATE_CONFIRM',
          action: { type: 'write', endpoint: '/workouts/generate', params: { split: split, count: '5' },
            requiresConfirmation: true, confirmText: { en: `Create ${names[split].en} with 5 exercises?`, ar: `تعمل ${names[split].ar} بـ 5 تمارين؟` } } },
        { id: `wkcr${split}2`, label: { en: '6-8 exercises (45 min)', ar: '6-8 تمارين (45 دقيقة)' }, icon: '⏱️', nextState: 'WK_CREATE_CONFIRM',
          action: { type: 'write', endpoint: '/workouts/generate', params: { split: split, count: '7' },
            requiresConfirmation: true, confirmText: { en: `Create ${names[split].en} with 7 exercises?`, ar: `تعمل ${names[split].ar} بـ 7 تمارين؟` } } },
        { id: `wkcr${split}3`, label: { en: '9-10 exercises (60 min)', ar: '9-10 تمارين (60 دقيقة)' }, icon: '⏱️', nextState: 'WK_CREATE_CONFIRM',
          action: { type: 'write', endpoint: '/workouts/generate', params: { split: split, count: '10' },
            requiresConfirmation: true, confirmText: { en: `Create ${names[split].en} with 10 exercises?`, ar: `تعمل ${names[split].ar} بـ 10 تمارين؟` } } },
        { id: `wkcr${split}4`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CREATE' },
      ],
    } as ChatState;
  }),

  {
    id: 'WK_CREATE_CONFIRM',
    domain: 'workout',
    text: { en: 'Workout Created', ar: 'التمرين اتعمل' },
    botMessage: {
      en: '✅ Workout created! Here\'s what I put together for you:',
      ar: '✅ التمرين اتعمل! ده اللي عملتهولك:',
    },
    dynamic: true,
    back: 'WK_CREATE',
    options: [
      { id: 'wkcc1', label: { en: 'Start now', ar: 'ابدأ دلوقتي' }, icon: '▶️', nextState: 'WK_SESSION_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcc2', label: { en: 'Swap an exercise', ar: 'غيّر تمرين' }, icon: '🔄', nextState: 'WK_SWAP_SELECT' },
      { id: 'wkcc3', label: { en: 'Save for later', ar: 'احفظه لبعدين' }, icon: '💾', nextState: 'WK_MENU' },
      { id: 'wkcc4', label: { en: 'Start over', ar: 'ابدأ من الأول' }, icon: '🔄', nextState: 'WK_CREATE' },
      { id: 'wkcc5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CREATE' },
    ],
  },

  {
    id: 'WK_SWAP_SELECT',
    domain: 'workout',
    text: { en: 'Swap Exercise', ar: 'غيّر تمرين' },
    botMessage: {
      en: 'Which exercise do you want to swap? (Select from your current workout)',
      ar: 'عايز تغيّر أي تمرين؟ (اختار من تمرينك الحالي)',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/workouts/current-exercises' },
    back: 'WK_TODAY',
    options: [
      { id: 'wksw1', label: { en: 'Swap with similar', ar: 'غيّر بتمرين مشابه' }, icon: '🔄', nextState: 'WK_SWAP_CONFIRM',
        action: { type: 'write', endpoint: '/workouts/swap-exercise', requiresConfirmation: true,
          confirmText: { en: 'Swap this exercise with a similar one?', ar: 'تغيّر التمرين ده بتمرين مشابه؟' } } },
      { id: 'wksw2', label: { en: 'Pick specific', ar: 'اختار بنفسك' }, icon: '🔍', nextState: 'WK_FIND_MUSCLE' },
      { id: 'wksw3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_TODAY' },
    ],
  },

  {
    id: 'WK_SWAP_CONFIRM',
    domain: 'workout',
    text: { en: 'Exercise Swapped', ar: 'التمرين اتغيّر' },
    botMessage: {
      en: '✅ Exercise swapped!',
      ar: '✅ التمرين اتغيّر!',
    },
    back: 'WK_TODAY',
    options: [
      { id: 'wkswc1', label: { en: 'View workout', ar: 'شوف التمرين' }, icon: '👀', nextState: 'WK_TODAY' },
      { id: 'wkswc2', label: { en: 'Swap another', ar: 'غيّر تاني' }, icon: '🔄', nextState: 'WK_SWAP_SELECT' },
      { id: 'wkswc3', label: { en: 'Start workout', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_SESSION_START' },
    ],
  },

  {
    id: 'WK_CHANGE',
    domain: 'workout',
    text: { en: 'Change Today\'s Workout', ar: 'غيّر تمرين النهارده' },
    botMessage: {
      en: 'What would you like to do instead?',
      ar: 'عايز تعمل ايه بدل كده؟',
    },
    back: 'WK_TODAY',
    options: [
      { id: 'wkch1', label: { en: 'Different muscle group', ar: 'عضلة تانية' }, icon: '💪', nextState: 'WK_CREATE' },
      { id: 'wkch2', label: { en: 'Lighter workout', ar: 'تمرين أخف' }, icon: '🍃', nextState: 'WK_SKIP_BUSY' },
      { id: 'wkch3', label: { en: 'From programs', ar: 'من البرامج' }, icon: '📋', nextState: 'PG_MENU' },
      { id: 'wkch4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_TODAY' },
    ],
  },

  // ─── Workout History ──────────────────────────────────────
  {
    id: 'WK_HISTORY',
    domain: 'workout',
    text: { en: 'Workout History', ar: 'تاريخ التمارين' },
    botMessage: {
      en: 'How far back do you want to see?',
      ar: 'عايز تشوف لحد امتى؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkh1', label: { en: 'Last 7 days', ar: 'آخر 7 أيام' }, icon: '📅', nextState: 'WK_HISTORY_VIEW',
        action: { type: 'fetch', endpoint: '/workouts/history', params: { days: '7' } } },
      { id: 'wkh2', label: { en: 'Last 30 days', ar: 'آخر 30 يوم' }, icon: '📅', nextState: 'WK_HISTORY_VIEW',
        action: { type: 'fetch', endpoint: '/workouts/history', params: { days: '30' } } },
      { id: 'wkh3', label: { en: 'All time', ar: 'من الأول' }, icon: '📅', nextState: 'WK_HISTORY_VIEW',
        action: { type: 'fetch', endpoint: '/workouts/history', params: { days: 'all' } } },
      { id: 'wkh4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  {
    id: 'WK_HISTORY_VIEW',
    domain: 'workout',
    text: { en: 'History', ar: 'التاريخ' },
    botMessage: { en: 'Here\'s your workout history:', ar: 'ده تاريخ تمارينك:' },
    dynamic: true,
    back: 'WK_HISTORY',
    options: [
      { id: 'wkhv1', label: { en: 'View full history', ar: 'شوف التاريخ كله' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkhv2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_HISTORY' },
    ],
  },

  // ─── Pre-Workout ──────────────────────────────────────────
  {
    id: 'WK_PRE',
    domain: 'workout',
    text: { en: 'Pre-Workout Checklist', ar: 'تشيكلست قبل التمرين' },
    botMessage: {
      en: '✅ Pre-Workout Checklist:\n\n1. 💧 Hydration — Drink 500ml water 30 min before\n2. 🍌 Meal — Eat 1-2 hours before (carbs + protein)\n3. ☕ Caffeine — Optional: coffee/pre-workout 30 min before\n4. 🧘 Warm-up — 5-10 min light cardio + dynamic stretches\n5. 🎵 Music — Get your playlist ready\n6. 📱 Log — Open workout tracker',
      ar: '✅ تشيكلست قبل التمرين:\n\n1. 💧 مياه — اشرب 500مل مياه قبل التمرين بنص ساعة\n2. 🍌 أكل — كل قبل التمرين بساعة-ساعتين (كارب + بروتين)\n3. ☕ كافيين — اختياري: قهوة/بري وركاوت قبل بنص ساعة\n4. 🧘 تسخين — 5-10 دقايق كارديو خفيف + إطالة ديناميكية\n5. 🎵 ميوزك — جهّز البلاي لست\n6. 📱 تراكر — افتح تراكر التمرين',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkp1', label: { en: 'Pre-workout meal ideas', ar: 'أفكار أكل قبل التمرين' }, icon: '🍌', nextState: 'NT_PRE_WORKOUT' },
      { id: 'wkp2', label: { en: 'Warm-up routine', ar: 'روتين تسخين' }, icon: '🧘', nextState: 'WK_WARMUP' },
      { id: 'wkp3', label: { en: 'Pre-workout supplements', ar: 'مكملات قبل التمرين' }, icon: '💊', nextState: 'SP_PRE_WORKOUT' },
      { id: 'wkp4', label: { en: 'I\'m ready, start!', ar: 'جاهز، ابدأ!' }, icon: '▶️', nextState: 'WK_SESSION_START' },
      { id: 'wkp5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  {
    id: 'WK_WARMUP',
    domain: 'workout',
    text: { en: 'Warm-up Routine', ar: 'روتين تسخين' },
    botMessage: {
      en: '🧘 5-Minute Dynamic Warm-up:\n\n1. Arm circles — 30s each direction\n2. Hip circles — 30s each direction\n3. Leg swings — 10 each leg\n4. Walking lunges — 10 steps\n5. Jumping jacks — 30s\n6. High knees — 30s\n7. Bodyweight squats — 10 reps\n8. Push-up to downward dog — 5 reps',
      ar: '🧘 تسخين 5 دقايق:\n\n1. دوران ذراع — 30 ثانية كل اتجاه\n2. دوران ورك — 30 ثانية كل اتجاه\n3. أرجحة رجل — 10 كل رجل\n4. لانجز مشي — 10 خطوات\n5. Jumping jacks — 30 ثانية\n6. High knees — 30 ثانية\n7. سكوات بودي ويت — 10 مرات\n8. بوش أب + downward dog — 5 مرات',
    },
    back: 'WK_PRE',
    options: [
      { id: 'wkwu1', label: { en: 'Start workout now', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_SESSION_START' },
      { id: 'wkwu2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_PRE' },
    ],
  },

  // ─── Post-Workout ─────────────────────────────────────────
  {
    id: 'WK_POST',
    domain: 'workout',
    text: { en: 'Post-Workout', ar: 'بعد التمرين' },
    botMessage: {
      en: 'Good work! What do you want to do after your workout?',
      ar: 'شغل عظيم! عايز تعمل ايه بعد التمرين؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkpo1', label: { en: 'Cool-down stretches', ar: 'إطالة بعد التمرين' }, icon: '🧘', nextState: 'WK_COOLDOWN' },
      { id: 'wkpo2', label: { en: 'Post-workout meal', ar: 'أكل بعد التمرين' }, icon: '🍗', nextState: 'NT_POST_WORKOUT' },
      { id: 'wkpo3', label: { en: 'Log this workout', ar: 'سجّل التمرين' }, icon: '📝', nextState: 'WK_LOG',
        action: { type: 'navigate', route: '/workouts/log' } },
      { id: 'wkpo4', label: { en: 'Rate difficulty', ar: 'قيّم الصعوبة' }, icon: '⭐', nextState: 'WK_RATE' },
      { id: 'wkpo5', label: { en: 'Recovery tips', ar: 'نصايح ريكفري' }, icon: '😴', nextState: 'RC_POST_WORKOUT' },
      { id: 'wkpo6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  {
    id: 'WK_COOLDOWN',
    domain: 'workout',
    text: { en: 'Cool-down Stretches', ar: 'إطالة بعد التمرين' },
    botMessage: {
      en: '🧘 5-Minute Cool-down:\n\n1. Standing quad stretch — 30s each\n2. Standing hamstring stretch — 30s each\n3. Chest doorway stretch — 30s\n4. Cross-body shoulder stretch — 30s each\n5. Cat-cow — 10 reps\n6. Child\'s pose — 60s\n7. Deep breathing — 60s\n\nHold each stretch, don\'t bounce. Breathe deeply.',
      ar: '🧘 إطالة 5 دقايق:\n\n1. إطالة كوادز واقف — 30 ثانية كل رجل\n2. إطالة هامسترنج — 30 ثانية كل رجل\n3. إطالة صدر — 30 ثانية\n4. إطالة كتف — 30 ثانية كل جنب\n5. Cat-cow — 10 مرات\n6. Child\'s pose — 60 ثانية\n7. تنفس عميق — 60 ثانية\n\nامسك كل إطالة، متنططش. تنفّس عميق.',
    },
    back: 'WK_POST',
    options: [
      { id: 'wkcd1', label: { en: 'Post-workout meal', ar: 'أكل بعد التمرين' }, icon: '🍗', nextState: 'NT_POST_WORKOUT' },
      { id: 'wkcd2', label: { en: 'Log workout', ar: 'سجّل التمرين' }, icon: '📝', nextState: 'WK_LOG' },
      { id: 'wkcd3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_POST' },
    ],
  },

  {
    id: 'WK_RATE',
    domain: 'workout',
    text: { en: 'Rate Workout', ar: 'قيّم التمرين' },
    botMessage: {
      en: 'How hard was today\'s workout?',
      ar: 'التمرين النهارده كان صعب قد ايه؟',
    },
    back: 'WK_POST',
    options: [
      { id: 'wkrt1', label: { en: 'Too easy', ar: 'سهل أوي' }, icon: '😴', nextState: 'WK_RATE_DONE',
        action: { type: 'write', endpoint: '/workouts/rate', params: { rating: '1' },
          requiresConfirmation: true, confirmText: { en: 'Rate as too easy? (I\'ll make it harder next time)', ar: 'تقيّمه سهل أوي؟ (هزوّد الصعوبة المرة الجاية)' } } },
      { id: 'wkrt2', label: { en: 'Just right', ar: 'مظبوط' }, icon: '👌', nextState: 'WK_RATE_DONE',
        action: { type: 'write', endpoint: '/workouts/rate', params: { rating: '3' } } },
      { id: 'wkrt3', label: { en: 'Challenging', ar: 'صعب شوية' }, icon: '💪', nextState: 'WK_RATE_DONE',
        action: { type: 'write', endpoint: '/workouts/rate', params: { rating: '4' } } },
      { id: 'wkrt4', label: { en: 'Too hard', ar: 'صعب أوي' }, icon: '😵', nextState: 'WK_RATE_DONE',
        action: { type: 'write', endpoint: '/workouts/rate', params: { rating: '5' },
          requiresConfirmation: true, confirmText: { en: 'Rate as too hard? (I\'ll adjust next time)', ar: 'تقيّمه صعب أوي؟ (هخففه المرة الجاية)' } } },
      { id: 'wkrt5', label: { en: 'Skip rating', ar: 'سكيب' }, icon: '⏭️', nextState: 'WK_POST' },
    ],
  },

  {
    id: 'WK_RATE_DONE',
    domain: 'workout',
    text: { en: 'Rating Saved', ar: 'التقييم اتحفظ' },
    botMessage: {
      en: '✅ Rating saved! I\'ll use this to adjust your future workouts.',
      ar: '✅ التقييم اتحفظ! هستخدمه عشان أظبط تمارينك الجاية.',
    },
    back: 'WK_POST',
    options: [
      { id: 'wkrd1', label: { en: 'Post-workout meal', ar: 'أكل بعد التمرين' }, icon: '🍗', nextState: 'NT_POST_WORKOUT' },
      { id: 'wkrd2', label: { en: 'Recovery', ar: 'ريكفري' }, icon: '😴', nextState: 'RC_MENU' },
      { id: 'wkrd3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'WK_LOG',
    domain: 'workout',
    text: { en: 'Log Workout', ar: 'سجّل التمرين' },
    botMessage: {
      en: 'Opening workout log...',
      ar: 'بفتحلك تسجيل التمرين...',
    },
    back: 'WK_POST',
    options: [
      { id: 'wkl1', label: { en: 'Done logging', ar: 'خلصت' }, icon: '✅', nextState: 'WK_POST' },
      { id: 'wkl2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_POST' },
    ],
  },

  // ─── Form & Technique ─────────────────────────────────────
  {
    id: 'WK_FORM_MENU',
    domain: 'workout',
    text: { en: 'Form & Technique', ar: 'الفورم والتكنيك' },
    botMessage: {
      en: 'Which exercise do you need form tips for?',
      ar: 'عايز نصايح فورم لأي تمرين؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkfm1', label: { en: 'Squat form', ar: 'فورم السكوات' }, icon: '🦵', nextState: 'WK_FORM_SQUAT' },
      { id: 'wkfm2', label: { en: 'Deadlift form', ar: 'فورم الديدلفت' }, icon: '🏋️', nextState: 'WK_FORM_DEADLIFT' },
      { id: 'wkfm3', label: { en: 'Bench press form', ar: 'فورم البنش' }, icon: '💪', nextState: 'WK_FORM_BENCH' },
      { id: 'wkfm4', label: { en: 'Overhead press form', ar: 'فورم الأوفرهيد' }, icon: '🏋️', nextState: 'WK_FORM_OHP' },
      { id: 'wkfm5', label: { en: 'Row form', ar: 'فورم التجديف' }, icon: '💪', nextState: 'WK_FORM_ROW' },
      { id: 'wkfm6', label: { en: 'Pull-up form', ar: 'فورم العقلة' }, icon: '🪜', nextState: 'WK_FORM_PULLUP' },
      { id: 'wkfm7', label: { en: 'Common mistakes', ar: 'أخطاء شائعة' }, icon: '⚠️', nextState: 'WK_FORM_MISTAKES' },
      { id: 'wkfm8', label: { en: 'Search exercise form', ar: 'دوّر على فورم تمرين' }, icon: '🔍', nextState: 'WK_FIND' },
      { id: 'wkfm9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // Form tips for major lifts (6 states)
  ...([
    { id: 'SQUAT', en: 'Squat', ar: 'السكوات',
      tips_en: '🦵 Squat Form Tips:\n\n1. Feet shoulder-width apart, toes slightly out\n2. Chest up, core braced\n3. Push knees over toes (it\'s okay!)\n4. Go at least parallel (thighs parallel to floor)\n5. Drive through full foot, not just heels\n6. Keep back neutral — no rounding\n\n⚠️ Common mistakes:\n• Knees caving in\n• Rounding lower back\n• Rising on toes\n• Not going deep enough',
      tips_ar: '🦵 نصايح فورم السكوات:\n\n1. الرجلين على مستوى الكتف، الصوابع لبره شوية\n2. الصدر لفوق، البطن مشدودة\n3. ادفع الركبة فوق الصوابع (ده عادي!)\n4. انزل على الأقل لحد ما الفخذ يبقى موازي للأرض\n5. ادفع بالقدم كلها، مش الكعب بس\n6. الضهر مستقيم — متلفّوش\n\n⚠️ أخطاء شائعة:\n• الركبة بتدخل لجوا\n• الضهر بيتلف\n• بتقف على صوابعك\n• مش نازل كفاية' },
    { id: 'DEADLIFT', en: 'Deadlift', ar: 'الديدلفت',
      tips_en: '🏋️ Deadlift Form Tips:\n\n1. Bar over mid-foot\n2. Shoulder-width stance, grip just outside knees\n3. Chest up, shoulders back\n4. Push floor away with legs first\n5. Lock out with glutes at top\n6. Bar stays close to body entire lift\n\n⚠️ Common mistakes:\n• Rounding the back\n• Bar drifting away from body\n• Jerking the bar up\n• Hyperextending at lockout',
      tips_ar: '🏋️ نصايح فورم الديدلفت:\n\n1. البار فوق نص القدم\n2. رجلين على مستوى الكتف، القبضة بره الركبة\n3. الصدر لفوق، الكتف ورا\n4. ادفع الأرض برجلك الأول\n5. اقفل بالمؤخرة فوق\n6. البار قريب من الجسم طول الحركة\n\n⚠️ أخطاء شائعة:\n• الضهر بيتلف\n• البار بيبعد عن الجسم\n• بتشد البار بعنف\n• بتفرد أوي فوق' },
    { id: 'BENCH', en: 'Bench Press', ar: 'البنش',
      tips_en: '💪 Bench Press Form:\n\n1. Feet flat on floor\n2. Slight arch in upper back\n3. Squeeze shoulder blades together\n4. Grip just wider than shoulder width\n5. Bar path: slight diagonal (chest to lockout)\n6. Touch mid-chest, pause, press\n\n⚠️ Common mistakes:\n• Bouncing bar off chest\n• Flared elbows (keep 45°)\n• Butt coming off bench\n• Uneven grip',
      tips_ar: '💪 نصايح فورم البنش:\n\n1. الرجلين على الأرض\n2. انحناء خفيف في الضهر العلوي\n3. اضغط لوح الكتف على بعض\n4. القبضة أعرض من الكتف شوية\n5. مسار البار: مايل شوية\n6. نزّل على نص الصدر، وقفة، ادفع\n\n⚠️ أخطاء شائعة:\n• بتنطط البار من الصدر\n• الكوع مفتوح أوي (خليه 45°)\n• المؤخرة بتطلع من البنش\n• القبضة مش متساوية' },
    { id: 'OHP', en: 'Overhead Press', ar: 'الأوفرهيد بريس',
      tips_en: '🏋️ Overhead Press Form:\n\n1. Feet hip-width apart\n2. Bar on front shoulders\n3. Brace core tight\n4. Press straight up, move head back\n5. Lock out overhead\n6. Move head forward at top\n\n⚠️ Common mistakes:\n• Leaning back too much\n• Not bracing core\n• Bar path curving forward\n• Using leg drive (strict press)',
      tips_ar: '🏋️ نصايح فورم الأوفرهيد:\n\n1. الرجلين على مستوى الورك\n2. البار على الكتف من قدام\n3. اشد البطن\n4. ادفع لفوق على طول، حرّك الراس لورا\n5. اقفل فوق\n6. حرّك الراس لقدام فوق\n\n⚠️ أخطاء شائعة:\n• بتميل لورا أوي\n• مش شاد البطن\n• البار بيروح لقدام\n• بتستخدم الرجل (لو strict press)' },
    { id: 'ROW', en: 'Barbell Row', ar: 'تجديف بار',
      tips_en: '💪 Row Form:\n\n1. Hinge at hips, back at 45°\n2. Grip just wider than shoulder width\n3. Pull to lower chest/upper abs\n4. Squeeze shoulder blades at top\n5. Control the negative\n6. Keep core braced\n\n⚠️ Common mistakes:\n• Standing too upright\n• Using momentum/swinging\n• Not squeezing at top\n• Rounding lower back',
      tips_ar: '💪 نصايح فورم التجديف:\n\n1. اتني من الورك، الضهر 45°\n2. القبضة أعرض من الكتف شوية\n3. اسحب لنص الصدر السفلي\n4. اضغط لوح الكتف فوق\n5. تحكّم في النزول\n6. اشد البطن\n\n⚠️ أخطاء شائعة:\n• واقف عدل أوي\n• بتستخدم الزخم\n• مش بتضغط فوق\n• الضهر السفلي بيتلف' },
    { id: 'PULLUP', en: 'Pull-up', ar: 'العقلة',
      tips_en: '🪜 Pull-up Form:\n\n1. Full dead hang to start\n2. Depress shoulders (pull down)\n3. Drive elbows down and back\n4. Chin over bar\n5. Full range of motion\n6. Control the descent\n\n⚠️ Common mistakes:\n• Kipping/swinging\n• Partial reps\n• Not going all the way down\n• Using only arms (engage back)',
      tips_ar: '🪜 نصايح فورم العقلة:\n\n1. ابدأ من تعليق كامل\n2. نزّل الكتف (اسحب لتحت)\n3. ادفع الكوع لتحت ولورا\n4. الدقن فوق البار\n5. مدى حركة كامل\n6. تحكّم في النزول\n\n⚠️ أخطاء شائعة:\n• بتتأرجح\n• نص حركة\n• مش نازل لتحت خالص\n• بتستخدم الدراع بس (شغّل الضهر)' },
  ] as const).map(form => ({
    id: `WK_FORM_${form.id}`,
    domain: 'workout' as const,
    text: { en: form.en, ar: form.ar },
    botMessage: { en: form.tips_en, ar: form.tips_ar },
    back: 'WK_FORM_MENU',
    options: [
      { id: `wkf${form.id}1`, label: { en: 'Watch video', ar: 'شوف فيديو' }, icon: '📺', nextState: `WK_FORM_${form.id}` },
      { id: `wkf${form.id}2`, label: { en: 'Add to workout', ar: 'أضيف للتمرين' }, icon: '➕', nextState: 'WK_ADD_CONFIRM',
        action: { type: 'write', endpoint: '/workouts/add-exercise', params: { exercise: form.id.toLowerCase() },
          requiresConfirmation: true, confirmText: { en: `Add ${form.en} to workout?`, ar: `تضيف ${form.ar} للتمرين؟` } } },
      { id: `wkf${form.id}3`, label: { en: 'Other exercises', ar: 'تمارين تانية' }, icon: '🔍', nextState: 'WK_FORM_MENU' },
      { id: `wkf${form.id}4`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_FORM_MENU' },
    ],
  } as ChatState)),

  {
    id: 'WK_FORM_MISTAKES',
    domain: 'workout',
    text: { en: 'Common Mistakes', ar: 'أخطاء شائعة' },
    botMessage: {
      en: '⚠️ Top 10 Gym Mistakes:\n\n1. No warm-up → injury risk\n2. Ego lifting → bad form\n3. Skipping legs → imbalanced physique\n4. No progressive overload → no gains\n5. Training too much → overtraining\n6. Not enough sleep → poor recovery\n7. Ignoring nutrition → wasted effort\n8. Copying others → different bodies, different needs\n9. No tracking → no progress\n10. Inconsistency → #1 gains killer',
      ar: '⚠️ أكتر 10 أخطاء في الجيم:\n\n1. مفيش تسخين → إصابة\n2. أوزان تقيلة بفورم غلط → إصابة\n3. بتسكيب رجل → جسم مش متناسق\n4. مفيش زيادة تدريجية → مفيش نتايج\n5. تمرين كتير أوي → overtrain\n6. نوم قليل → ريكفري ضعيف\n7. تجاهل التغذية → مجهود ضايع\n8. بتقلد حد → كل جسم مختلف\n9. مفيش تراكينج → مفيش تقدم\n10. عدم انتظام → أكبر قاتل للنتايج',
    },
    back: 'WK_FORM_MENU',
    options: [
      { id: 'wkfmk1', label: { en: 'Proper form guides', ar: 'أدلة فورم صح' }, icon: '🎯', nextState: 'WK_FORM_MENU' },
      { id: 'wkfmk2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CROSSFIT SECTION — WODs, Benchmarks, Scaling, Challenges
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'WK_CROSSFIT',
    domain: 'workout',
    text: { en: 'CrossFit', ar: 'كروس فت' },
    botMessage: {
      en: '🏋️‍♂️ Welcome to CrossFit!\n\nTrack WODs, benchmark times, compete with yourself, and get scaling advice. What do you need?',
      ar: '🏋️‍♂️ أهلاً في كروس فت!\n\nتابع الـ WODs، أوقات البنشمارك، نافس نفسك، واحصل على نصايح تعديل. محتاج ايه؟',
    },
    back: 'WK_MENU',
    options: [
      { id: 'wkcf1', label: { en: 'Today\'s WOD', ar: 'تمرين النهارده' }, icon: '📅', nextState: 'WK_CF_WOD' },
      { id: 'wkcf2', label: { en: 'Benchmark WODs', ar: 'بنشمارك WODs' }, icon: '🏆', nextState: 'WK_CF_BENCHMARK' },
      { id: 'wkcf3', label: { en: 'Movement Scaling', ar: 'تعديل الحركات' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcf4', label: { en: 'My PR Board', ar: 'لوحة أرقامي القياسية' }, icon: '📊', nextState: 'WK_CF_PR' },
      { id: 'wkcf5', label: { en: 'CrossFit Programs', ar: 'برامج كروس فت' }, icon: '📋', nextState: 'WK_CF_PROGRAMS' },
      { id: 'wkcf6', label: { en: 'Challenges', ar: 'تحديات' }, icon: '🔥', nextState: 'WK_CF_CHALLENGES' },
      { id: 'wkcf7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_MENU' },
    ],
  },

  // ─── Today's WOD ────────────────────────────────────────────
  {
    id: 'WK_CF_WOD',
    domain: 'workout',
    text: { en: 'Today\'s WOD', ar: 'تمرين النهارده' },
    botMessage: {
      en: '📅 Here\'s your WOD for today! Choose a format:',
      ar: '📅 ده تمرين النهارده! اختار النوع:',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/crossfit/wod-of-day' },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfw1', label: { en: 'Random Girl WOD', ar: 'جيرل WOD عشوائي' }, icon: '👧', nextState: 'WK_CF_RANDOM_GIRL' },
      { id: 'wkcfw2', label: { en: 'Random Hero WOD', ar: 'هيرو WOD عشوائي' }, icon: '🦸', nextState: 'WK_CF_RANDOM_HERO' },
      { id: 'wkcfw3', label: { en: 'Quick AMRAP (15 min)', ar: 'AMRAP سريع (15 دقيقة)' }, icon: '⏱️', nextState: 'WK_CF_QUICK_AMRAP' },
      { id: 'wkcfw4', label: { en: 'For Time (under 20 min)', ar: 'فور تايم (أقل من 20 دقيقة)' }, icon: '🏃', nextState: 'WK_CF_FOR_TIME' },
      { id: 'wkcfw5', label: { en: 'EMOM Workout', ar: 'تمرين EMOM' }, icon: '⏰', nextState: 'WK_CF_EMOM' },
      { id: 'wkcfw6', label: { en: 'Chipper (Long)', ar: 'تشيبر (طويل)' }, icon: '💀', nextState: 'WK_CF_CHIPPER' },
      { id: 'wkcfw7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_RANDOM_GIRL',
    domain: 'workout',
    text: { en: 'Girl WOD', ar: 'جيرل WOD' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/crossfit/random-wod?type=girl' },
    botMessage: {
      en: '👧 Here\'s a Girl WOD! These are the classic CrossFit benchmarks. Record your time and compare next month.',
      ar: '👧 ده جيرل WOD! دي البنشماركات الكلاسيكية في كروس فت. سجّل وقتك وقارن الشهر الجاي.',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcfg1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcfg2', label: { en: 'Show scaling options', ar: 'عرض خيارات التعديل' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfg3', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcfg4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_RANDOM_HERO',
    domain: 'workout',
    text: { en: 'Hero WOD', ar: 'هيرو WOD' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/crossfit/random-wod?type=hero' },
    botMessage: {
      en: '🦸 Hero WODs honor fallen heroes. These are HARD — scale as needed but give max effort. It\'s about heart, not RX.',
      ar: '🦸 هيرو WODs بتكرّم الأبطال. دي صعبة — عدّل على حسب مستواك بس ادّي أقصى مجهود. الموضوع عن القلب، مش RX.',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcfh1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcfh2', label: { en: 'Show scaling options', ar: 'عرض خيارات التعديل' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfh3', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcfh4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_QUICK_AMRAP',
    domain: 'workout',
    text: { en: 'Quick AMRAP', ar: 'AMRAP سريع' },
    botMessage: {
      en: '⏱️ AMRAP 15:\n\n• 10 Power Cleans (61/43 kg)\n• 15 Wall Balls (9/6 kg)\n• 20 Calorie Row\n\nScore = total rounds + reps. Record and beat it next time!',
      ar: '⏱️ AMRAP 15:\n\n• 10 باور كلين (61/43 كجم)\n• 15 وول بول (9/6 كجم)\n• 20 كالوري تجديف\n\nالسكور = إجمالي الراوندات + التكرارات. سجّل واكسره المرة الجاية!',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcfa1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcfa2', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcfa3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_FOR_TIME',
    domain: 'workout',
    text: { en: 'For Time', ar: 'فور تايم' },
    botMessage: {
      en: '🏃 For Time:\n\n5 Rounds:\n• 12 Deadlifts (84/57 kg)\n• 9 Hang Power Cleans\n• 6 Push Jerks\n\nTime cap: 18 minutes. Go fast, stay safe!',
      ar: '🏃 فور تايم:\n\n5 راوندات:\n• 12 ديدلفت (84/57 كجم)\n• 9 هانج باور كلين\n• 6 بوش جيرك\n\nحد الوقت: 18 دقيقة. بسرعة بس بأمان!',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcft1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcft2', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcft3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_EMOM',
    domain: 'workout',
    text: { en: 'EMOM Workout', ar: 'تمرين EMOM' },
    botMessage: {
      en: '⏰ EMOM 20 (Every Minute On the Minute):\n\nMin 1: 5 Power Cleans (70/47 kg)\nMin 2: 10 Box Jumps (60/50 cm)\nMin 3: 15 Wall Balls (9/6 kg)\nMin 4: 20 Double-Unders\n\nRepeat x5. Rest = whatever\'s left in the minute.',
      ar: '⏰ EMOM 20 (كل دقيقة في الدقيقة):\n\nدقيقة 1: 5 باور كلين (70/47 كجم)\nدقيقة 2: 10 بوكس جمب (60/50 سم)\nدقيقة 3: 15 وول بول (9/6 كجم)\nدقيقة 4: 20 دبل أندر\n\nكرر x5. الراحة = الباقي من الدقيقة.',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcfe1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcfe2', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcfe3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_CHIPPER',
    domain: 'workout',
    text: { en: 'Chipper', ar: 'تشيبر' },
    botMessage: {
      en: '💀 The Chipper — For Time:\n\n50 Double-Unders\n40 Toes-to-Bar\n30 Box Jumps (60 cm)\n20 Power Cleans (61/43 kg)\n10 Muscle-Ups (or 20 C2B Pull-Ups)\n\nOne trip through. Pace yourself — this is a grinder.',
      ar: '💀 التشيبر — فور تايم:\n\n50 دبل أندر\n40 أصابع للبار\n30 بوكس جمب (60 سم)\n20 باور كلين (61/43 كجم)\n10 ماسل أب (أو 20 صدر للبار)\n\nمرة واحدة. وزّع مجهودك — ده تمرين طحن.',
    },
    back: 'WK_CF_WOD',
    options: [
      { id: 'wkcfc1', label: { en: 'Start WOD', ar: 'ابدأ التمرين' }, icon: '▶️', nextState: 'WK_CF_LOG_START',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'wkcfc2', label: { en: 'Different WOD', ar: 'WOD مختلف' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcfc3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_WOD' },
    ],
  },

  {
    id: 'WK_CF_LOG_START',
    domain: 'workout',
    text: { en: 'WOD Started', ar: 'التمرين بدأ' },
    botMessage: {
      en: '🔥 GO! Timer is running. Come back when you\'re done to log your score.',
      ar: '🔥 يلا! التايمر شغال. ارجع لما تخلّص تسجّل السكور بتاعك.',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfls1', label: { en: 'Log my score', ar: 'سجّل السكور' }, icon: '📝', nextState: 'WK_CF_LOG_SCORE',
        action: { type: 'write', endpoint: '/crossfit/log-score', requiresConfirmation: true,
          confirmText: { en: 'Ready to log your WOD score?', ar: 'جاهز تسجّل سكور الـ WOD?' } } },
      { id: 'wkcfls2', label: { en: 'Back to CrossFit', ar: 'رجوع لكروس فت' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_LOG_SCORE',
    domain: 'workout',
    text: { en: 'Score Logged', ar: 'السكور اتسجّل' },
    botMessage: {
      en: '✅ WOD score logged! Check your PR board to see how you\'re progressing over time. Keep grinding!',
      ar: '✅ سكور الـ WOD اتسجّل! شوف لوحة أرقامك القياسية تشوف تقدمك مع الوقت. كمّل اطحن!',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcflg1', label: { en: 'View PR Board', ar: 'شوف لوحة الأرقام' }, icon: '📊', nextState: 'WK_CF_PR' },
      { id: 'wkcflg2', label: { en: 'Another WOD', ar: 'WOD تاني' }, icon: '🔄', nextState: 'WK_CF_WOD' },
      { id: 'wkcflg3', label: { en: 'Back to CrossFit', ar: 'رجوع لكروس فت' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  // ─── Benchmark WODs ─────────────────────────────────────────
  {
    id: 'WK_CF_BENCHMARK',
    domain: 'workout',
    text: { en: 'Benchmark WODs', ar: 'بنشمارك WODs' },
    botMessage: {
      en: '🏆 Benchmark WODs are how you measure CrossFit progress. Pick a category:',
      ar: '🏆 البنشمارك WODs هي طريقة قياس تقدمك في كروس فت. اختار فئة:',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfb1', label: { en: 'Girl WODs', ar: 'جيرل WODs' }, icon: '👧', nextState: 'WK_CF_GIRLS' },
      { id: 'wkcfb2', label: { en: 'Hero WODs', ar: 'هيرو WODs' }, icon: '🦸', nextState: 'WK_CF_HEROES' },
      { id: 'wkcfb3', label: { en: 'Open WODs', ar: 'أوبن WODs' }, icon: '🌍', nextState: 'WK_CF_OPEN' },
      { id: 'wkcfb4', label: { en: 'My Benchmark History', ar: 'تاريخ بنشماركاتي' }, icon: '📈', nextState: 'WK_CF_BENCHMARK_HISTORY' },
      { id: 'wkcfb5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_GIRLS',
    domain: 'workout',
    text: { en: 'Girl WODs', ar: 'جيرل WODs' },
    botMessage: {
      en: '👧 The Girls — Classic CrossFit Benchmarks:\n\n• Fran: 21-15-9 Thrusters & Pull-Ups\n• Grace: 30 Clean & Jerks\n• Isabel: 30 Snatches\n• Diane: 21-15-9 Deadlifts & HSPU\n• Elizabeth: 21-15-9 Cleans & Ring Dips\n• Helen: 3 RFT Run, KB Swings, Pull-Ups\n• Jackie: Row, Thrusters, Pull-Ups\n• Karen: 150 Wall Balls\n• Annie: DUs & Sit-Ups\n• Cindy: AMRAP 20 Pull-Ups, Push-Ups, Squats\n• Mary: AMRAP 20 HSPU, Pistols, Pull-Ups\n• Nancy: 5 RFT Run & OHS\n\nPick one to start!',
      ar: '👧 الجيرلز — بنشماركات كروس فت الكلاسيكية:\n\n• فران: 21-15-9 ثرسترز وعقلة\n• جريس: 30 كلين آند جيرك\n• إيزابيل: 30 سناتش\n• ديان: 21-15-9 ديدلفت و HSPU\n• إليزابيث: 21-15-9 كلينز ورينج ديبس\n• هيلين: 3 راوند جري، كيتل بل سوينج، عقلة\n• جاكي: تجديف، ثرسترز، عقلة\n• كارين: 150 وول بول\n• آني: دبل أندرز وست أبز\n• سيندي: AMRAP 20 عقلة، ضغط، سكوات\n• ماري: AMRAP 20 HSPU، بيستول، عقلة\n• نانسي: 5 راوند جري و OHS\n\nاختار واحد تبدأ!',
    },
    back: 'WK_CF_BENCHMARK',
    options: [
      { id: 'wkcfgr1', label: { en: 'Do Fran', ar: 'عمل فران' }, icon: '🔥', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfgr2', label: { en: 'Do Cindy', ar: 'عمل سيندي' }, icon: '⏱️', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfgr3', label: { en: 'Do Grace', ar: 'عمل جريس' }, icon: '💪', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfgr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_BENCHMARK' },
    ],
  },

  {
    id: 'WK_CF_HEROES',
    domain: 'workout',
    text: { en: 'Hero WODs', ar: 'هيرو WODs' },
    botMessage: {
      en: '🦸 Hero WODs — In honor of fallen heroes:\n\n• Murph: 1mi Run, 100 Pull-Ups, 200 Push-Ups, 300 Squats, 1mi Run (w/ vest)\n• DT: 5 RFT Deadlifts, Hang Cleans, Push Jerks\n• Nate: AMRAP 20 Muscle-Ups, HSPU, KB Swings\n• Michael: 3 RFT Run, Back Extensions, Sit-Ups\n• Badger: 3 RFT Squat Cleans, Pull-Ups, Run\n\n⚠️ These are BRUTAL. Scale wisely. Honor the workout with max effort.',
      ar: '🦸 هيرو WODs — تكريماً للأبطال:\n\n• ميرف: 1 ميل جري، 100 عقلة، 200 ضغط، 300 سكوات، 1 ميل جري (بالفست)\n• DT: 5 راوند ديدلفت، هانج كلينز، بوش جيركس\n• نيت: AMRAP 20 ماسل أبز، HSPU، كيتل بل سوينج\n• مايكل: 3 راوند جري، باك إكستنشن، ست أبز\n• بادجر: 3 راوند سكوات كلينز، عقلة، جري\n\n⚠️ دي وحشية. عدّل بحكمة. كرّم التمرين بأقصى مجهود.',
    },
    back: 'WK_CF_BENCHMARK',
    options: [
      { id: 'wkcfhr1', label: { en: 'Do Murph', ar: 'عمل ميرف' }, icon: '🦸', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfhr2', label: { en: 'Do DT', ar: 'عمل DT' }, icon: '🏋️', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfhr3', label: { en: 'Do Nate', ar: 'عمل نيت' }, icon: '💀', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfhr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_BENCHMARK' },
    ],
  },

  {
    id: 'WK_CF_OPEN',
    domain: 'workout',
    text: { en: 'Open WODs', ar: 'أوبن WODs' },
    botMessage: {
      en: '🌍 CrossFit Open Classic WODs:\n\n• 12.1: AMRAP 7 Burpees\n• 14.5: 21-18-15-12-9-6-3 Thrusters & Burpees\n• 17.5: 10 RFT Thrusters & DUs\n• 20.1: 10 RFT Ground-to-OH & Bar-Facing Burpees\n• 23.1: AMRAP 14 Row, TTB, Wall Balls, Cleans, Muscle-Ups\n\nGreat way to measure your Open readiness!',
      ar: '🌍 WODs كروس فت أوبن الكلاسيكية:\n\n• 12.1: AMRAP 7 بيربي\n• 14.5: 21-18-15-12-9-6-3 ثرسترز وبيربي\n• 17.5: 10 راوند ثرسترز ودبل أندرز\n• 20.1: 10 راوند أرض لفوق الراس وبيربي\n• 23.1: AMRAP 14 تجديف، أصابع للبار، وول بول، كلينز، ماسل أبز\n\nطريقة ممتازة تقيس جاهزيتك للأوبن!',
    },
    back: 'WK_CF_BENCHMARK',
    options: [
      { id: 'wkcfo1', label: { en: 'Do 14.5', ar: 'عمل 14.5' }, icon: '🔥', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfo2', label: { en: 'Do 23.1', ar: 'عمل 23.1' }, icon: '💀', nextState: 'WK_CF_LOG_START' },
      { id: 'wkcfo3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_BENCHMARK' },
    ],
  },

  {
    id: 'WK_CF_BENCHMARK_HISTORY',
    domain: 'workout',
    text: { en: 'Benchmark History', ar: 'تاريخ البنشماركات' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/crossfit/benchmark-history' },
    botMessage: {
      en: '📈 Your benchmark WOD history and progress over time. See how you\'re improving!',
      ar: '📈 تاريخ بنشماركاتك وتقدمك مع الوقت. شوف ازاي بتتحسن!',
    },
    back: 'WK_CF_BENCHMARK',
    options: [
      { id: 'wkcfbh1', label: { en: 'Retest a benchmark', ar: 'أعد اختبار بنشمارك' }, icon: '🔄', nextState: 'WK_CF_BENCHMARK' },
      { id: 'wkcfbh2', label: { en: 'View PR Board', ar: 'شوف لوحة الأرقام' }, icon: '📊', nextState: 'WK_CF_PR' },
      { id: 'wkcfbh3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_BENCHMARK' },
    ],
  },

  // ─── Movement Scaling ───────────────────────────────────────
  {
    id: 'WK_CF_SCALE',
    domain: 'workout',
    text: { en: 'Movement Scaling', ar: 'تعديل الحركات' },
    botMessage: {
      en: '📏 Can\'t do a movement? No shame — scaling is how you GET there. Pick a movement:',
      ar: '📏 مش قادر تعمل حركة؟ عادي — التعديل هو الطريقة اللي توصلك. اختار حركة:',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfs1', label: { en: 'Muscle-Up', ar: 'ماسل أب' }, icon: '🔄', nextState: 'WK_CF_SCALE_MU' },
      { id: 'wkcfs2', label: { en: 'Handstand Push-Up', ar: 'HSPU' }, icon: '🤸', nextState: 'WK_CF_SCALE_HSPU' },
      { id: 'wkcfs3', label: { en: 'Double-Under', ar: 'دبل أندر' }, icon: '🪢', nextState: 'WK_CF_SCALE_DU' },
      { id: 'wkcfs4', label: { en: 'Pistol Squat', ar: 'بيستول سكوات' }, icon: '🦵', nextState: 'WK_CF_SCALE_PISTOL' },
      { id: 'wkcfs5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_SCALE_MU',
    domain: 'workout',
    text: { en: 'Muscle-Up Scaling', ar: 'تعديل ماسل أب' },
    botMessage: {
      en: '🔄 Muscle-Up Progression:\n\n1. Ring Rows → build pulling strength\n2. Strict Pull-Ups → 5+ unbroken\n3. Chest-to-Bar Pull-Ups → kipping ok\n4. Ring Dips → 5+ strict\n5. Banded Muscle-Up transitions\n6. Low Ring Muscle-Up (feet on ground)\n7. Full Ring Muscle-Up\n\n💡 Pro tip: The transition is the hard part. Practice jumping muscle-ups on low rings daily.',
      ar: '🔄 تدرج ماسل أب:\n\n1. رينج رو → بناء قوة سحب\n2. عقلة ستريكت → 5+ من غير وقف\n3. صدر للبار → كيبنج ممكن\n4. رينج ديبس → 5+ ستريكت\n5. انتقالات ماسل أب بالباند\n6. ماسل أب واطي (الرجل على الأرض)\n7. رينج ماسل أب كامل\n\n💡 نصيحة: الانتقال هو الجزء الصعب. تمرّن على ماسل أب بالنط على رينجز واطية كل يوم.',
    },
    back: 'WK_CF_SCALE',
    options: [
      { id: 'wkcfsm1', label: { en: 'Find progression exercises', ar: 'دوّر على تمارين التدرج' }, icon: '🔍', nextState: 'WK_FIND' },
      { id: 'wkcfsm2', label: { en: 'Other movements', ar: 'حركات تانية' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfsm3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_SCALE' },
    ],
  },

  {
    id: 'WK_CF_SCALE_HSPU',
    domain: 'workout',
    text: { en: 'HSPU Scaling', ar: 'تعديل HSPU' },
    botMessage: {
      en: '🤸 HSPU Progression:\n\n1. Pike Push-Up (feet on floor)\n2. Pike Push-Up (feet on box)\n3. Wall Walk\n4. Handstand Hold (nose to wall)\n5. Negative HSPU (slow lower)\n6. Kipping HSPU (with AbMat)\n7. Strict HSPU\n8. Deficit HSPU\n\n💡 Build overhead strength with strict presses 2x/week.',
      ar: '🤸 تدرج HSPU:\n\n1. بايك بوش أب (الرجل على الأرض)\n2. بايك بوش أب (الرجل على بوكس)\n3. وول ووك\n4. تعليق هاند ستاند (الأنف للحيط)\n5. HSPU سلبي (نزول بطيء)\n6. كيبنج HSPU (مع AbMat)\n7. ستريكت HSPU\n8. ديفيسيت HSPU\n\n💡 ابني قوة فوق الراس بضغط ستريكت مرتين في الأسبوع.',
    },
    back: 'WK_CF_SCALE',
    options: [
      { id: 'wkcfsh1', label: { en: 'Find progression exercises', ar: 'دوّر على تمارين التدرج' }, icon: '🔍', nextState: 'WK_FIND' },
      { id: 'wkcfsh2', label: { en: 'Other movements', ar: 'حركات تانية' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfsh3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_SCALE' },
    ],
  },

  {
    id: 'WK_CF_SCALE_DU',
    domain: 'workout',
    text: { en: 'Double-Under Scaling', ar: 'تعديل دبل أندر' },
    botMessage: {
      en: '🪢 Double-Under Progression:\n\n1. Single-Unders (3:1 ratio for WODs)\n2. Power jumps (higher bounce)\n3. Penguin taps (clap thighs mid-air)\n4. Single-single-double pattern\n5. 5 unbroken Double-Unders\n6. 20 unbroken\n7. 50+ unbroken\n\n💡 Use a speed rope (not a thick one). Wrists, not arms. Jump once — rope goes twice.',
      ar: '🪢 تدرج دبل أندر:\n\n1. سينجل أندرز (نسبة 3:1 في الـ WODs)\n2. نطات عالية (باونس أعلى)\n3. تصفيق الفخدين في الهوا\n4. نمط سينجل-سينجل-دبل\n5. 5 دبل أندر من غير وقف\n6. 20 من غير وقف\n7. 50+ من غير وقف\n\n💡 استخدم حبل سريع (مش تخين). الرسغ مش الدراع. انط مرة — الحبل يلف مرتين.',
    },
    back: 'WK_CF_SCALE',
    options: [
      { id: 'wkcfsd1', label: { en: 'Other movements', ar: 'حركات تانية' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfsd2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_SCALE' },
    ],
  },

  {
    id: 'WK_CF_SCALE_PISTOL',
    domain: 'workout',
    text: { en: 'Pistol Squat Scaling', ar: 'تعديل بيستول سكوات' },
    botMessage: {
      en: '🦵 Pistol Squat Progression:\n\n1. Air Squats (perfect depth)\n2. Box pistol (sit to box on one leg)\n3. Banded pistol (hold band for support)\n4. Counterbalance pistol (hold weight in front)\n5. Pistol to box (lower depth)\n6. Full pistol squat\n\n💡 Ankle mobility is usually the limiter. Stretch calves and work ankle dorsiflexion daily.',
      ar: '🦵 تدرج بيستول سكوات:\n\n1. اير سكوات (عمق مثالي)\n2. بوكس بيستول (اقعد على بوكس برجل واحدة)\n3. بيستول بالباند (امسك باند للدعم)\n4. بيستول بتوازن (امسك وزن قدامك)\n5. بيستول لبوكس (عمق أقل)\n6. بيستول سكوات كامل\n\n💡 مرونة الكاحل عادةً هي المشكلة. اعمل إطالة للسمانة واشتغل على مرونة الكاحل يومياً.',
    },
    back: 'WK_CF_SCALE',
    options: [
      { id: 'wkcfsp1', label: { en: 'Other movements', ar: 'حركات تانية' }, icon: '📏', nextState: 'WK_CF_SCALE' },
      { id: 'wkcfsp2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CF_SCALE' },
    ],
  },

  // ─── PR Board ───────────────────────────────────────────────
  {
    id: 'WK_CF_PR',
    domain: 'workout',
    text: { en: 'PR Board', ar: 'لوحة الأرقام القياسية' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/crossfit/pr-board' },
    botMessage: {
      en: '📊 Your CrossFit PR Board — Track everything:\n\n🏋️ Lifting PRs: Snatch, C&J, Back Squat, Front Squat, Deadlift, Strict Press\n⏱️ Benchmark Times: Fran, Grace, Isabel, Diane, Helen, Murph\n🔄 Gymnastics: Max Pull-Ups, Muscle-Ups, HSPU, T2B\n🚣 Cardio: 500m Row, 2k Row, 1mi Run, Assault Bike Cal\n\nYour numbers tell your story. Keep pushing!',
      ar: '📊 لوحة أرقامك القياسية — تابع كل حاجة:\n\n🏋️ أرقام الرفع: سناتش، C&J، باك سكوات، فرنت سكوات، ديدلفت، ستريكت بريس\n⏱️ أوقات البنشمارك: فران، جريس، إيزابيل، ديان، هيلين، ميرف\n🔄 جمباز: أقصى عقلة، ماسل أبز، HSPU، T2B\n🚣 كارديو: 500م تجديف، 2ك تجديف، 1 ميل جري، أسولت بايك كال\n\nأرقامك بتحكي قصتك. كمّل ادفع!',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfpr1', label: { en: 'Log a new PR', ar: 'سجّل رقم قياسي جديد' }, icon: '🆕', nextState: 'WK_CF_LOG_PR',
        action: { type: 'write', endpoint: '/crossfit/log-pr', requiresConfirmation: true,
          confirmText: { en: 'Log a new personal record?', ar: 'تسجّل رقم قياسي جديد?' } } },
      { id: 'wkcfpr2', label: { en: 'Compare with last month', ar: 'قارن بالشهر اللي فات' }, icon: '📈', nextState: 'WK_CF_BENCHMARK_HISTORY' },
      { id: 'wkcfpr3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_LOG_PR',
    domain: 'workout',
    text: { en: 'PR Logged', ar: 'الرقم القياسي اتسجّل' },
    botMessage: {
      en: '🎉 NEW PR LOGGED! That\'s what it\'s about. Your progress graph just got a new peak!',
      ar: '🎉 رقم قياسي جديد اتسجّل! ده المطلوب. جراف التقدم بتاعك عنده قمة جديدة!',
    },
    back: 'WK_CF_PR',
    options: [
      { id: 'wkcflp1', label: { en: 'View PR Board', ar: 'شوف لوحة الأرقام' }, icon: '📊', nextState: 'WK_CF_PR' },
      { id: 'wkcflp2', label: { en: 'Back to CrossFit', ar: 'رجوع لكروس فت' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  // ─── CrossFit Programs ─────────────────────────────────────
  {
    id: 'WK_CF_PROGRAMS',
    domain: 'workout',
    text: { en: 'CrossFit Programs', ar: 'برامج كروس فت' },
    botMessage: {
      en: '📋 Structured CrossFit programs for every level:\n\n🟢 Foundations (4 weeks) — New to CF? Start here\n🟡 WOD Program (8 weeks) — Classic 5-day split\n🔴 Competitor (12 weeks) — Double sessions, Open prep\n🟢 Fat Loss (6 weeks) — High-volume metcons\n🟡 Strength Hybrid (8 weeks) — 5/3/1 + daily WOD\n🔴 Open Prep (8 weeks) — Train for the Open',
      ar: '📋 برامج كروس فت منظمة لكل مستوى:\n\n🟢 أساسيات (4 أسابيع) — جديد على CF؟ ابدأ هنا\n🟡 برنامج WOD (8 أسابيع) — سبليت 5 أيام كلاسيكي\n🔴 كومبتيتور (12 أسبوع) — جلستين، تحضير أوبن\n🟢 حرق دهون (6 أسابيع) — ميتكون عالي الحجم\n🟡 قوة هايبرد (8 أسابيع) — 5/3/1 + WOD يومي\n🔴 تحضير أوبن (8 أسابيع) — تدريب للأوبن',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfp1', label: { en: 'Start Foundations', ar: 'ابدأ الأساسيات' }, icon: '🟢', nextState: 'WK_CF_PROGRAM_START',
        action: { type: 'write', endpoint: '/programs/enroll', params: { program: 'cfp-foundations' },
          requiresConfirmation: true, confirmText: { en: 'Start CrossFit Foundations program?', ar: 'تبدأ برنامج أساسيات كروس فت?' } } },
      { id: 'wkcfp2', label: { en: 'Start WOD Program', ar: 'ابدأ برنامج WOD' }, icon: '🟡', nextState: 'WK_CF_PROGRAM_START',
        action: { type: 'write', endpoint: '/programs/enroll', params: { program: 'cfp-wod-program' },
          requiresConfirmation: true, confirmText: { en: 'Start CrossFit WOD Program?', ar: 'تبدأ برنامج كروس فت WOD?' } } },
      { id: 'wkcfp3', label: { en: 'Start Competitor', ar: 'ابدأ كومبتيتور' }, icon: '🔴', nextState: 'WK_CF_PROGRAM_START',
        action: { type: 'write', endpoint: '/programs/enroll', params: { program: 'cfp-competitor' },
          requiresConfirmation: true, confirmText: { en: 'Start CrossFit Competitor program?', ar: 'تبدأ برنامج كروس فت كومبتيتور?' } } },
      { id: 'wkcfp4', label: { en: 'View all programs', ar: 'شوف كل البرامج' }, icon: '📋', nextState: 'WK_CF_PROGRAMS',
        action: { type: 'navigate', route: '/programs?filter=crossfit' } },
      { id: 'wkcfp5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_PROGRAM_START',
    domain: 'workout',
    text: { en: 'Program Started', ar: 'البرنامج بدأ' },
    botMessage: {
      en: '✅ Program enrolled! Your first workout is ready. Check your schedule — let\'s crush it!',
      ar: '✅ اتسجلت في البرنامج! أول تمرين جاهز. شوف الجدول — يلا نكسره!',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfps1', label: { en: 'Go to Today\'s Workout', ar: 'روح لتمرين النهارده' }, icon: '📅', nextState: 'WK_TODAY' },
      { id: 'wkcfps2', label: { en: 'Back to CrossFit', ar: 'رجوع لكروس فت' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  // ─── Challenges ─────────────────────────────────────────────
  {
    id: 'WK_CF_CHALLENGES',
    domain: 'workout',
    text: { en: 'CrossFit Challenges', ar: 'تحديات كروس فت' },
    botMessage: {
      en: '🔥 CrossFit Challenges — Push your limits!\n\nActive challenges you can join:\n\n• 30-Day Murph Challenge — Do Murph once a week, improve each time\n• 100 Pull-Up Challenge — Build to 100 unbroken\n• Double-Under September — 1000 DUs total this month\n• Squat Snatch PR Challenge — Beat your 1RM by end of month\n• WOD Streak — Complete a WOD every day for 30 days\n\nCompete with yourself. Track everything.',
      ar: '🔥 تحديات كروس فت — ادفع حدودك!\n\nتحديات نشطة تقدر تشارك فيها:\n\n• تحدي ميرف 30 يوم — اعمل ميرف مرة في الأسبوع، اتحسن كل مرة\n• تحدي 100 عقلة — وصّل لـ 100 من غير وقف\n• دبل أندر سبتمبر — 1000 دبل أندر إجمالي الشهر ده\n• تحدي سكوات سناتش PR — اكسر رقمك القياسي قبل آخر الشهر\n• WOD ستريك — خلّص WOD كل يوم لمدة 30 يوم\n\nنافس نفسك. تابع كل حاجة.',
    },
    back: 'WK_CROSSFIT',
    options: [
      { id: 'wkcfch1', label: { en: 'Join Murph Challenge', ar: 'انضم لتحدي ميرف' }, icon: '🦸', nextState: 'WK_CF_CHALLENGE_JOINED',
        action: { type: 'write', endpoint: '/challenges/join', params: { challenge: 'murph-30' },
          requiresConfirmation: true, confirmText: { en: 'Join 30-Day Murph Challenge?', ar: 'تنضم لتحدي ميرف 30 يوم?' } } },
      { id: 'wkcfch2', label: { en: 'Join WOD Streak', ar: 'انضم لـ WOD ستريك' }, icon: '🔥', nextState: 'WK_CF_CHALLENGE_JOINED',
        action: { type: 'write', endpoint: '/challenges/join', params: { challenge: 'wod-streak-30' },
          requiresConfirmation: true, confirmText: { en: 'Join 30-Day WOD Streak?', ar: 'تنضم لستريك WOD 30 يوم?' } } },
      { id: 'wkcfch3', label: { en: 'View my challenges', ar: 'شوف تحدياتي' }, icon: '📊', nextState: 'WK_CF_MY_CHALLENGES' },
      { id: 'wkcfch4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },

  {
    id: 'WK_CF_CHALLENGE_JOINED',
    domain: 'workout',
    text: { en: 'Challenge Joined', ar: 'انضممت للتحدي' },
    botMessage: {
      en: '✅ You\'re in! Challenge starts now. Track your progress in the Challenges section. Let\'s go!',
      ar: '✅ انت فيها! التحدي بيبدأ دلوقتي. تابع تقدمك في قسم التحديات. يلا!',
    },
    back: 'WK_CF_CHALLENGES',
    options: [
      { id: 'wkcfcj1', label: { en: 'Start first WOD', ar: 'ابدأ أول WOD' }, icon: '▶️', nextState: 'WK_CF_WOD' },
      { id: 'wkcfcj2', label: { en: 'Back to Challenges', ar: 'رجوع للتحديات' }, icon: '🔙', nextState: 'WK_CF_CHALLENGES' },
    ],
  },

  {
    id: 'WK_CF_MY_CHALLENGES',
    domain: 'workout',
    text: { en: 'My Challenges', ar: 'تحدياتي' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/challenges/my-challenges?type=crossfit' },
    botMessage: {
      en: '📊 Your active CrossFit challenges and progress. Keep pushing — consistency beats intensity.',
      ar: '📊 تحديات كروس فت النشطة وتقدمك. كمّل — الانتظام أهم من الشدة.',
    },
    back: 'WK_CF_CHALLENGES',
    options: [
      { id: 'wkcfmc1', label: { en: 'Join more challenges', ar: 'انضم لتحديات أكتر' }, icon: '➕', nextState: 'WK_CF_CHALLENGES' },
      { id: 'wkcfmc2', label: { en: 'Back to CrossFit', ar: 'رجوع لكروس فت' }, icon: '🔙', nextState: 'WK_CROSSFIT' },
    ],
  },
];
