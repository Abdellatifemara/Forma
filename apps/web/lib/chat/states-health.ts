import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// HEALTH & BODY METRICS DOMAIN (~60 states)
// Inspired by: Whoop, Apple Watch, OURA Ring, Garmin
// ═══════════════════════════════════════════════════════════════

export const healthStates: ChatState[] = [
  // ─── Main Health Menu ─────────────────────────────────────
  {
    id: 'HL_MENU',
    domain: 'health',
    text: { en: 'Health & Body', ar: 'الصحة والجسم' },
    botMessage: {
      en: 'Your health dashboard. What do you want to check?',
      ar: 'لوحة صحتك. عايز تشوف ايه؟',
    },
    back: 'ROOT',
    options: [
      { id: 'hl1', label: { en: 'Recovery Score', ar: 'سكور الريكفري' }, icon: '🔋', nextState: 'HL_RECOVERY' },
      { id: 'hl2', label: { en: 'Sleep Analysis', ar: 'تحليل النوم' }, icon: '😴', nextState: 'HL_SLEEP' },
      { id: 'hl3', label: { en: 'Heart Rate & HRV', ar: 'نبض القلب و HRV' }, icon: '❤️', nextState: 'HL_HEART' },
      { id: 'hl4', label: { en: 'Body Composition', ar: 'تكوين الجسم' }, icon: '⚖️', nextState: 'HL_BODY' },
      { id: 'hl5', label: { en: 'Strain & Activity', ar: 'الإجهاد والنشاط' }, icon: '🔥', nextState: 'HL_STRAIN' },
      { id: 'hl6', label: { en: 'Stress Level', ar: 'مستوى التوتر' }, icon: '😰', nextState: 'HL_STRESS' },
      { id: 'hl7', label: { en: 'Blood Work & Labs', ar: 'تحاليل الدم' }, icon: '🩸', nextState: 'HL_BLOOD' },
      { id: 'hl8', label: { en: 'VO2 Max & Fitness', ar: 'VO2 Max واللياقة' }, icon: '🫁', nextState: 'HL_VO2' },
      { id: 'hl9', label: { en: 'InBody Analysis', ar: 'تحليل InBody' }, icon: '📊', nextState: 'HL_INBODY' },
      { id: 'hl10', label: { en: 'Health Trends', ar: 'اتجاهات الصحة' }, icon: '📈', nextState: 'HL_TRENDS' },
      { id: 'hl11', label: { en: 'Log Health Data', ar: 'سجّل بيانات صحية' }, icon: '📝', nextState: 'HL_LOG' },
      { id: 'hl_ai1', label: { en: 'AI Recovery Analysis', ar: 'تحليل AI للريكفري' }, icon: '🧠', nextState: 'HL_AI_RECOVERY',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'hl_ai2', label: { en: 'AI InBody Insights', ar: 'تحليلات AI للـ InBody' }, icon: '🧠', nextState: 'HL_AI_INBODY',
        condition: { type: 'tier', tier: 'PREMIUM_PLUS' } },
      { id: 'hl12', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Recovery Score (Whoop-style) ─────────────────────────
  {
    id: 'HL_RECOVERY',
    domain: 'health',
    text: { en: 'Recovery Score', ar: 'سكور الريكفري' },
    botMessage: {
      en: '🔋 Your Recovery Score shows how ready your body is for training today.\n\nFactors that affect it:\n• Sleep quality & duration\n• Heart Rate Variability (HRV)\n• Resting heart rate\n• Previous day\'s strain\n• Stress levels',
      ar: '🔋 سكور الريكفري بيوريك جسمك جاهز للتمرين قد ايه النهارده.\n\nالعوامل اللي بتأثر:\n• جودة ومدة النوم\n• تقلب نبض القلب (HRV)\n• نبض القلب وانت مرتاح\n• إجهاد أمبارح\n• مستوى التوتر',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/recovery-score' },
    back: 'HL_MENU',
    options: [
      { id: 'hlr1', label: { en: 'View factors breakdown', ar: 'شوف العوامل بالتفصيل' }, icon: '📊', nextState: 'HL_RECOVERY_DETAIL' },
      { id: 'hlr2', label: { en: 'Improve recovery', ar: 'حسّن الريكفري' }, icon: '💡', nextState: 'HL_RECOVERY_TIPS' },
      { id: 'hlr3', label: { en: 'Recovery history', ar: 'تاريخ الريكفري' }, icon: '📈', nextState: 'HL_RECOVERY_HISTORY' },
      { id: 'hlr4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_RECOVERY_DETAIL',
    domain: 'health',
    text: { en: 'Recovery Factors', ar: 'عوامل الريكفري' },
    botMessage: { en: 'Recovery factor breakdown:', ar: 'تفصيل عوامل الريكفري:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/recovery-detail' },
    back: 'HL_RECOVERY',
    options: [
      { id: 'hlrd1', label: { en: 'Improve sleep', ar: 'حسّن النوم' }, icon: '😴', nextState: 'HL_SLEEP_TIPS' },
      { id: 'hlrd2', label: { en: 'Reduce stress', ar: 'قلّل التوتر' }, icon: '🧘', nextState: 'HL_STRESS_TIPS' },
      { id: 'hlrd3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_RECOVERY' },
    ],
  },

  {
    id: 'HL_RECOVERY_TIPS',
    domain: 'health',
    text: { en: 'Recovery Tips', ar: 'نصايح ريكفري' },
    botMessage: {
      en: '💡 How to Improve Recovery:\n\n1. **Sleep 7-9 hours** — most critical factor\n2. **Consistent sleep schedule** — same time every night\n3. **Hydrate** — 2-3L water daily\n4. **Nutrition** — protein within 2 hours of training\n5. **Active recovery** — light walking, stretching\n6. **Cold exposure** — cold shower (2-3 min)\n7. **Limit alcohol** — even 1 drink hurts recovery\n8. **Manage stress** — meditation, deep breathing\n9. **Avoid overtraining** — rest days matter\n10. **Track your data** — consistency is key',
      ar: '💡 إزاي تحسّن الريكفري:\n\n1. **نام 7-9 ساعات** — أهم عامل\n2. **جدول نوم ثابت** — نفس الميعاد كل يوم\n3. **اشرب مية** — 2-3 لتر يومياً\n4. **التغذية** — بروتين خلال ساعتين من التمرين\n5. **ريكفري نشط** — مشي خفيف، إطالة\n6. **تعرض للبرد** — دش بارد (2-3 دقايق)\n7. **قلّل الكحول** — حتى كاس واحد بيأثر\n8. **سيطر على التوتر** — تأمل، تنفس عميق\n9. **متتمرنش أوي** — أيام الراحة مهمة\n10. **تابع بياناتك** — الاستمرارية هي المفتاح',
    },
    back: 'HL_RECOVERY',
    options: [
      { id: 'hlrt1', label: { en: 'Sleep tips', ar: 'نصايح نوم' }, icon: '😴', nextState: 'HL_SLEEP_TIPS' },
      { id: 'hlrt2', label: { en: 'Stretching routine', ar: 'تمارين إطالة' }, icon: '🧘', nextState: 'RC_STRETCH_MENU' },
      { id: 'hlrt3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_RECOVERY' },
    ],
  },

  {
    id: 'HL_RECOVERY_HISTORY',
    domain: 'health',
    text: { en: 'Recovery History', ar: 'تاريخ الريكفري' },
    botMessage: { en: 'Your recovery score over time:', ar: 'سكور الريكفري على مدار الوقت:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/recovery-history' },
    back: 'HL_RECOVERY',
    options: [
      { id: 'hlrh1', label: { en: 'Last 7 days', ar: 'آخر 7 أيام' }, icon: '📅', nextState: 'HL_RECOVERY_HISTORY',
        action: { type: 'fetch', endpoint: '/health/recovery-history', params: { days: '7' } } },
      { id: 'hlrh2', label: { en: 'Last 30 days', ar: 'آخر 30 يوم' }, icon: '📅', nextState: 'HL_RECOVERY_HISTORY',
        action: { type: 'fetch', endpoint: '/health/recovery-history', params: { days: '30' } } },
      { id: 'hlrh3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_RECOVERY' },
    ],
  },

  // ─── Sleep Analysis (Whoop/OURA/Apple Watch-style) ────────
  {
    id: 'HL_SLEEP',
    domain: 'health',
    text: { en: 'Sleep Analysis', ar: 'تحليل النوم' },
    botMessage: {
      en: '😴 Sleep is the #1 recovery tool. Let me show you your sleep data.',
      ar: '😴 النوم هو أهم أداة ريكفري. خليني أوريك بيانات نومك.',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/sleep' },
    back: 'HL_MENU',
    options: [
      { id: 'hls1', label: { en: 'Last night\'s sleep', ar: 'نوم أمبارح' }, icon: '🌙', nextState: 'HL_SLEEP_LAST' },
      { id: 'hls2', label: { en: 'Sleep stages', ar: 'مراحل النوم' }, icon: '📊', nextState: 'HL_SLEEP_STAGES' },
      { id: 'hls3', label: { en: 'Sleep score trend', ar: 'اتجاه سكور النوم' }, icon: '📈', nextState: 'HL_SLEEP_TREND' },
      { id: 'hls4', label: { en: 'Log sleep manually', ar: 'سجّل النوم يدوياً' }, icon: '📝', nextState: 'HL_SLEEP_LOG' },
      { id: 'hls5', label: { en: 'Sleep improvement tips', ar: 'نصايح تحسين النوم' }, icon: '💡', nextState: 'HL_SLEEP_TIPS' },
      { id: 'hls6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_SLEEP_LAST',
    domain: 'health',
    text: { en: 'Last Night\'s Sleep', ar: 'نوم أمبارح' },
    botMessage: { en: 'Here\'s your sleep data from last night:', ar: 'ده بيانات نومك أمبارح:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/sleep/last-night' },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlsl1', label: { en: 'View stages', ar: 'شوف المراحل' }, icon: '📊', nextState: 'HL_SLEEP_STAGES' },
      { id: 'hlsl2', label: { en: 'Compare to average', ar: 'قارن بالمتوسط' }, icon: '📈', nextState: 'HL_SLEEP_TREND' },
      { id: 'hlsl3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP' },
    ],
  },

  {
    id: 'HL_SLEEP_STAGES',
    domain: 'health',
    text: { en: 'Sleep Stages', ar: 'مراحل النوم' },
    botMessage: {
      en: '📊 Sleep Stages Explained:\n\n**Light Sleep (N1/N2)** — 40-50% of night\n• Body starts to relax\n• Easy to wake up\n• Memory consolidation begins\n\n**Deep Sleep (N3/SWS)** — 15-25% of night\n• Hardest to wake from\n• Physical recovery happens here\n• Growth hormone released\n• Most important for athletes!\n\n**REM Sleep** — 20-25% of night\n• Brain is active, body paralyzed\n• Dreams occur\n• Mental recovery & learning\n• Emotional processing\n\n**Awake** — <5% (ideally)\n• Brief wake-ups are normal\n• Prolonged = poor sleep quality',
      ar: '📊 مراحل النوم:\n\n**نوم خفيف (N1/N2)** — 40-50% من الليل\n• الجسم بيبدأ يرتاح\n• سهل تصحى\n• الذاكرة بتبدأ تتثبت\n\n**نوم عميق (N3/SWS)** — 15-25% من الليل\n• أصعب مرحلة تصحى منها\n• الريكفري الجسدي بيحصل هنا\n• هرمون النمو بيتفرز\n• أهم مرحلة للرياضيين!\n\n**REM (حركة العين السريعة)** — 20-25% من الليل\n• المخ نشط، الجسم متشل\n• الأحلام بتحصل\n• الريكفري الذهني والتعلم\n\n**صاحي** — <5% (الأفضل)\n• لحظات صحيان قصيرة طبيعي\n• لو كتير = نوم سيء',
    },
    dynamic: true,
    back: 'HL_SLEEP',
    options: [
      { id: 'hlss1', label: { en: 'How to get more deep sleep', ar: 'إزاي أزوّد النوم العميق' }, icon: '💡', nextState: 'HL_SLEEP_DEEP_TIPS' },
      { id: 'hlss2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP' },
    ],
  },

  {
    id: 'HL_SLEEP_DEEP_TIPS',
    domain: 'health',
    text: { en: 'Deep Sleep Tips', ar: 'نصايح النوم العميق' },
    botMessage: {
      en: '🌊 How to Get More Deep Sleep:\n\n1. **Exercise regularly** — but not within 3 hours of bed\n2. **Cool bedroom** — 18-20°C (65-68°F)\n3. **Complete darkness** — blackout curtains + no screens\n4. **Consistent schedule** — same bedtime ± 30 min\n5. **Avoid caffeine** after 2 PM\n6. **Avoid alcohol** — reduces deep sleep by 20-40%\n7. **Hot bath/shower** before bed (90 min before)\n8. **White noise** or quiet environment\n9. **Magnesium supplement** (glycinate form, before bed)\n10. **Limit screen time** 1 hour before bed',
      ar: '🌊 إزاي تزوّد النوم العميق:\n\n1. **اتمرن بانتظام** — بس مش قبل النوم بـ 3 ساعات\n2. **أوضة باردة** — 18-20°C\n3. **ضلام كامل** — ستاير عاتمة + مفيش شاشات\n4. **جدول ثابت** — نفس ميعاد النوم ± 30 دقيقة\n5. **تجنب الكافيين** بعد 2 الضهر\n6. **تجنب الكحول** — بيقلل النوم العميق 20-40%\n7. **حمام سخن** قبل النوم (قبل بساعة ونص)\n8. **White noise** أو بيئة هادية\n9. **ماغنسيوم** (glycinate، قبل النوم)\n10. **قلل الشاشات** ساعة قبل النوم',
    },
    back: 'HL_SLEEP_STAGES',
    options: [
      { id: 'hlsdt1', label: { en: 'Set bedtime reminder', ar: 'حط تذكير نوم' }, icon: '⏰', nextState: 'HL_SLEEP_REMINDER',
        action: { type: 'write', endpoint: '/health/set-reminder', params: { type: 'bedtime' },
          requiresConfirmation: true, confirmText: { en: 'Set a bedtime reminder?', ar: 'تحط تذكير نوم؟' } } },
      { id: 'hlsdt2', label: { en: 'Supplements for sleep', ar: 'مكملات للنوم' }, icon: '💊', nextState: 'SP_SLEEP' },
      { id: 'hlsdt3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP_STAGES' },
    ],
  },

  {
    id: 'HL_SLEEP_REMINDER',
    domain: 'health',
    text: { en: 'Bedtime Reminder Set', ar: 'تذكير النوم اتحط' },
    botMessage: { en: '⏰ Bedtime reminder set! I\'ll remind you to wind down before bed.', ar: '⏰ تذكير النوم اتحط! هفكرك تهدي قبل النوم.' },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlsr1', label: { en: 'Back to Sleep', ar: 'رجوع للنوم' }, icon: '😴', nextState: 'HL_SLEEP' },
      { id: 'hlsr2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'HL_SLEEP_TREND',
    domain: 'health',
    text: { en: 'Sleep Score Trend', ar: 'اتجاه سكور النوم' },
    botMessage: { en: 'Your sleep score trend:', ar: 'اتجاه سكور نومك:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/sleep/trend' },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlst1', label: { en: 'Weekly view', ar: 'عرض أسبوعي' }, icon: '📅', nextState: 'HL_SLEEP_TREND' },
      { id: 'hlst2', label: { en: 'Monthly view', ar: 'عرض شهري' }, icon: '📅', nextState: 'HL_SLEEP_TREND' },
      { id: 'hlst3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP' },
    ],
  },

  {
    id: 'HL_SLEEP_LOG',
    domain: 'health',
    text: { en: 'Log Sleep', ar: 'سجّل النوم' },
    botMessage: {
      en: 'How many hours did you sleep last night?',
      ar: 'نمت كام ساعة أمبارح؟',
    },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlslg1', label: { en: 'Less than 5 hours', ar: 'أقل من 5 ساعات' }, icon: '😵', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '4' },
          requiresConfirmation: true, confirmText: { en: 'Log ~4 hours sleep?', ar: 'تسجّل ~4 ساعات نوم؟' } } },
      { id: 'hlslg2', label: { en: '5-6 hours', ar: '5-6 ساعات' }, icon: '😴', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '5.5' },
          requiresConfirmation: true, confirmText: { en: 'Log ~5.5 hours sleep?', ar: 'تسجّل ~5.5 ساعة نوم؟' } } },
      { id: 'hlslg3', label: { en: '6-7 hours', ar: '6-7 ساعات' }, icon: '🙂', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '6.5' },
          requiresConfirmation: true, confirmText: { en: 'Log ~6.5 hours sleep?', ar: 'تسجّل ~6.5 ساعة نوم؟' } } },
      { id: 'hlslg4', label: { en: '7-8 hours', ar: '7-8 ساعات' }, icon: '😊', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '7.5' },
          requiresConfirmation: true, confirmText: { en: 'Log ~7.5 hours sleep?', ar: 'تسجّل ~7.5 ساعة نوم؟' } } },
      { id: 'hlslg5', label: { en: '8-9 hours', ar: '8-9 ساعات' }, icon: '😌', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '8.5' },
          requiresConfirmation: true, confirmText: { en: 'Log ~8.5 hours sleep?', ar: 'تسجّل ~8.5 ساعة نوم؟' } } },
      { id: 'hlslg6', label: { en: '9+ hours', ar: '9+ ساعات' }, icon: '🥱', nextState: 'HL_SLEEP_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'SLEEP_HOURS', value: '9.5' },
          requiresConfirmation: true, confirmText: { en: 'Log ~9.5 hours sleep?', ar: 'تسجّل ~9.5 ساعة نوم؟' } } },
      { id: 'hlslg7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP' },
    ],
  },

  {
    id: 'HL_SLEEP_LOGGED',
    domain: 'health',
    text: { en: 'Sleep Logged', ar: 'النوم اتسجل' },
    botMessage: { en: '✅ Sleep data logged!', ar: '✅ بيانات النوم اتسجلت!' },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlslgd1', label: { en: 'Rate sleep quality', ar: 'قيّم جودة النوم' }, icon: '⭐', nextState: 'HL_SLEEP_QUALITY' },
      { id: 'hlslgd2', label: { en: 'Back to Health', ar: 'رجوع للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_SLEEP_QUALITY',
    domain: 'health',
    text: { en: 'Sleep Quality', ar: 'جودة النوم' },
    botMessage: { en: 'How did you feel when you woke up?', ar: 'حسيت بايه لما صحيت؟' },
    back: 'HL_SLEEP_LOGGED',
    options: [
      { id: 'hlsq1', label: { en: 'Terrible', ar: 'سيء جداً' }, icon: '😵', nextState: 'HL_SLEEP_TIPS',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'sleep_quality', value: '1' } } },
      { id: 'hlsq2', label: { en: 'Poor', ar: 'سيء' }, icon: '😩', nextState: 'HL_SLEEP_TIPS',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'sleep_quality', value: '2' } } },
      { id: 'hlsq3', label: { en: 'Okay', ar: 'عادي' }, icon: '😐', nextState: 'HL_MENU',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'sleep_quality', value: '3' } } },
      { id: 'hlsq4', label: { en: 'Good', ar: 'كويس' }, icon: '🙂', nextState: 'HL_MENU',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'sleep_quality', value: '4' } } },
      { id: 'hlsq5', label: { en: 'Great!', ar: 'ممتاز!' }, icon: '😊', nextState: 'HL_MENU',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'sleep_quality', value: '5' } } },
    ],
  },

  {
    id: 'HL_SLEEP_TIPS',
    domain: 'health',
    text: { en: 'Sleep Tips', ar: 'نصايح نوم' },
    botMessage: {
      en: '😴 Tips for Better Sleep:\n\n1. **Consistent schedule** — same time daily\n2. **Cool room** — 18-20°C\n3. **No screens** 1 hour before bed\n4. **No caffeine** after 2 PM\n5. **Dark room** — blackout curtains\n6. **White noise** if noisy area\n7. **Avoid big meals** 2 hours before bed\n8. **Regular exercise** (not late at night)\n9. **Relaxation routine** — reading, meditation\n10. **Magnesium + melatonin** if needed',
      ar: '😴 نصايح لنوم أحسن:\n\n1. **جدول ثابت** — نفس الميعاد كل يوم\n2. **أوضة باردة** — 18-20°C\n3. **مفيش شاشات** ساعة قبل النوم\n4. **مفيش كافيين** بعد 2 الضهر\n5. **أوضة ضلمة** — ستاير عاتمة\n6. **White noise** لو مكان دوشة\n7. **تجنب أكل كتير** قبل النوم بساعتين\n8. **تمارين منتظمة** (مش بالليل)\n9. **روتين استرخاء** — قراءة، تأمل\n10. **ماغنسيوم + ميلاتونين** لو محتاج',
    },
    back: 'HL_SLEEP',
    options: [
      { id: 'hlstp1', label: { en: 'Set bedtime reminder', ar: 'حط تذكير نوم' }, icon: '⏰', nextState: 'HL_SLEEP_REMINDER' },
      { id: 'hlstp2', label: { en: 'Sleep supplements', ar: 'مكملات للنوم' }, icon: '💊', nextState: 'SP_SLEEP' },
      { id: 'hlstp3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_SLEEP' },
    ],
  },

  // ─── Heart Rate & HRV ─────────────────────────────────────
  {
    id: 'HL_HEART',
    domain: 'health',
    text: { en: 'Heart Rate & HRV', ar: 'نبض القلب و HRV' },
    botMessage: {
      en: '❤️ Heart metrics are key indicators of your fitness and recovery.',
      ar: '❤️ مقاييس القلب مؤشرات مهمة على لياقتك وريكفريك.',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/heart' },
    back: 'HL_MENU',
    options: [
      { id: 'hlh1', label: { en: 'Resting Heart Rate', ar: 'نبض الراحة' }, icon: '💓', nextState: 'HL_HEART_RHR' },
      { id: 'hlh2', label: { en: 'HRV (Heart Rate Variability)', ar: 'HRV (تقلب نبض القلب)' }, icon: '📊', nextState: 'HL_HEART_HRV' },
      { id: 'hlh3', label: { en: 'Log heart rate', ar: 'سجّل النبض' }, icon: '📝', nextState: 'HL_HEART_LOG' },
      { id: 'hlh4', label: { en: 'Heart rate zones', ar: 'مناطق النبض' }, icon: '🎯', nextState: 'HL_HEART_ZONES' },
      { id: 'hlh5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_HEART_RHR',
    domain: 'health',
    text: { en: 'Resting Heart Rate', ar: 'نبض الراحة' },
    botMessage: {
      en: '💓 Resting Heart Rate (RHR):\n\nOptimal ranges:\n• Athletes: 40-60 bpm\n• Fit adults: 60-70 bpm\n• Average: 70-80 bpm\n• High: 80+ bpm\n\nLower RHR = better cardiovascular fitness\nRHR rising over time = potential overtraining or illness',
      ar: '💓 نبض القلب وقت الراحة (RHR):\n\nالمعدلات المثالية:\n• رياضيين: 40-60 نبضة/دقيقة\n• بالغين لياقتهم كويسة: 60-70\n• متوسط: 70-80\n• عالي: 80+\n\nنبض أقل = لياقة قلبية أحسن\nالنبض بيزيد مع الوقت = احتمال overtrain أو مرض',
    },
    dynamic: true,
    back: 'HL_HEART',
    options: [
      { id: 'hlrhr1', label: { en: 'Log RHR', ar: 'سجّل النبض' }, icon: '📝', nextState: 'HL_HEART_LOG' },
      { id: 'hlrhr2', label: { en: 'How to improve', ar: 'إزاي أحسنه' }, icon: '💡', nextState: 'HL_HEART_TIPS' },
      { id: 'hlrhr3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_HEART' },
    ],
  },

  {
    id: 'HL_HEART_HRV',
    domain: 'health',
    text: { en: 'HRV Explained', ar: 'شرح HRV' },
    botMessage: {
      en: '📊 HRV (Heart Rate Variability):\n\nThe variation in time between heartbeats. Higher HRV = better recovery.\n\n**Ranges (ms):**\n• Excellent: 60-100+\n• Good: 40-60\n• Fair: 20-40\n• Low: <20\n\n**What affects HRV:**\n✅ Good sleep, exercise, hydration, relaxation\n❌ Stress, alcohol, poor sleep, overtraining, illness\n\n**Why it matters:**\nHRV is the BEST single metric for recovery readiness.',
      ar: '📊 HRV (تقلب نبض القلب):\n\nالتغير في الوقت بين نبضات القلب. HRV أعلى = ريكفري أحسن.\n\n**المعدلات (ميلي ثانية):**\n• ممتاز: 60-100+\n• كويس: 40-60\n• متوسط: 20-40\n• ضعيف: <20\n\n**ايه اللي بيأثر على HRV:**\n✅ نوم كويس، تمارين، مية، استرخاء\n❌ توتر، كحول، نوم سيء، overtrain، مرض\n\n**ليه مهم:**\nHRV هو أفضل مقياس منفرد للريكفري.',
    },
    dynamic: true,
    back: 'HL_HEART',
    options: [
      { id: 'hlhrv1', label: { en: 'How to improve HRV', ar: 'إزاي أحسن HRV' }, icon: '💡', nextState: 'HL_HEART_TIPS' },
      { id: 'hlhrv2', label: { en: 'HRV trend', ar: 'اتجاه HRV' }, icon: '📈', nextState: 'HL_TRENDS' },
      { id: 'hlhrv3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_HEART' },
    ],
  },

  {
    id: 'HL_HEART_LOG',
    domain: 'health',
    text: { en: 'Log Heart Rate', ar: 'سجّل النبض' },
    botMessage: { en: 'What\'s your resting heart rate? (Check in the morning before getting up)', ar: 'نبضك وقت الراحة كام؟ (قيسه الصبح قبل ما تقوم)' },
    back: 'HL_HEART',
    options: [
      { id: 'hlhl1', label: { en: '40-50 bpm', ar: '40-50 نبضة/دقيقة' }, icon: '💚', nextState: 'HL_HEART_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'HEART_RATE_RESTING', value: '45' },
          requiresConfirmation: true, confirmText: { en: 'Log RHR as ~45 bpm?', ar: 'تسجّل النبض ~45؟' } } },
      { id: 'hlhl2', label: { en: '50-60 bpm', ar: '50-60 نبضة/دقيقة' }, icon: '💚', nextState: 'HL_HEART_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'HEART_RATE_RESTING', value: '55' },
          requiresConfirmation: true, confirmText: { en: 'Log RHR as ~55 bpm?', ar: 'تسجّل النبض ~55؟' } } },
      { id: 'hlhl3', label: { en: '60-70 bpm', ar: '60-70 نبضة/دقيقة' }, icon: '💛', nextState: 'HL_HEART_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'HEART_RATE_RESTING', value: '65' },
          requiresConfirmation: true, confirmText: { en: 'Log RHR as ~65 bpm?', ar: 'تسجّل النبض ~65؟' } } },
      { id: 'hlhl4', label: { en: '70-80 bpm', ar: '70-80 نبضة/دقيقة' }, icon: '🟡', nextState: 'HL_HEART_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'HEART_RATE_RESTING', value: '75' },
          requiresConfirmation: true, confirmText: { en: 'Log RHR as ~75 bpm?', ar: 'تسجّل النبض ~75؟' } } },
      { id: 'hlhl5', label: { en: '80+ bpm', ar: '80+ نبضة/دقيقة' }, icon: '🟠', nextState: 'HL_HEART_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'HEART_RATE_RESTING', value: '85' },
          requiresConfirmation: true, confirmText: { en: 'Log RHR as ~85 bpm?', ar: 'تسجّل النبض ~85؟' } } },
      { id: 'hlhl6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_HEART' },
    ],
  },

  {
    id: 'HL_HEART_LOGGED',
    domain: 'health',
    text: { en: 'Heart Rate Logged', ar: 'النبض اتسجل' },
    botMessage: { en: '✅ Heart rate logged!', ar: '✅ النبض اتسجل!' },
    back: 'HL_HEART',
    options: [
      { id: 'hlhrlgd1', label: { en: 'View trend', ar: 'شوف الاتجاه' }, icon: '📈', nextState: 'HL_TRENDS' },
      { id: 'hlhrlgd2', label: { en: 'Back to Health', ar: 'رجوع للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_HEART_ZONES',
    domain: 'health',
    text: { en: 'Heart Rate Zones', ar: 'مناطق النبض' },
    botMessage: {
      en: '🎯 Heart Rate Training Zones:\n\n**Zone 1 (50-60%)** — Warm-up, recovery\n**Zone 2 (60-70%)** — Fat burn, endurance base\n**Zone 3 (70-80%)** — Aerobic fitness\n**Zone 4 (80-90%)** — Lactate threshold\n**Zone 5 (90-100%)** — Max effort, sprints\n\n📝 Your max HR ≈ 220 - your age\n\nZone 2 is the most underrated — elite athletes spend 80% of training here!',
      ar: '🎯 مناطق نبض القلب:\n\n**منطقة 1 (50-60%)** — تسخين، ريكفري\n**منطقة 2 (60-70%)** — حرق دهون، قاعدة التحمل\n**منطقة 3 (70-80%)** — لياقة هوائية\n**منطقة 4 (80-90%)** — عتبة اللاكتات\n**منطقة 5 (90-100%)** — أقصى مجهود، سبرنت\n\n📝 أقصى نبض ≈ 220 - عمرك\n\nمنطقة 2 أكتر منطقة بتتجاهل — الرياضيين المحترفين بيقضوا 80% من تمرينهم فيها!',
    },
    back: 'HL_HEART',
    options: [
      { id: 'hlhz1', label: { en: 'Calculate my zones', ar: 'احسب مناطقي' }, icon: '🔢', nextState: 'HL_HEART_ZONES' },
      { id: 'hlhz2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_HEART' },
    ],
  },

  {
    id: 'HL_HEART_TIPS',
    domain: 'health',
    text: { en: 'Improve Heart Metrics', ar: 'حسّن مقاييس القلب' },
    botMessage: {
      en: '💡 How to Improve RHR & HRV:\n\n1. **Zone 2 cardio** — 150+ min/week (walking, cycling, swimming)\n2. **Sleep quality** — 7-9 hours\n3. **Hydration** — 2-3L water/day\n4. **Breathing exercises** — box breathing, 4-7-8\n5. **Cold exposure** — cold showers\n6. **Reduce alcohol** and processed food\n7. **Consistent training** — don\'t overtrain\n8. **Stress management** — meditation, nature\n9. **Omega-3 fish oil** supplement\n10. **Maintain healthy weight**',
      ar: '💡 إزاي تحسن RHR و HRV:\n\n1. **كارديو منطقة 2** — 150+ دقيقة/أسبوع\n2. **نوم كويس** — 7-9 ساعات\n3. **مية** — 2-3 لتر/يوم\n4. **تمارين تنفس** — box breathing\n5. **دش بارد**\n6. **قلل الكحول** والأكل المصنع\n7. **تمارين منتظمة** — متتمرنش أوي\n8. **سيطر على التوتر**\n9. **أوميجا 3** مكمل\n10. **حافظ على وزن صحي**',
    },
    back: 'HL_HEART',
    options: [
      { id: 'hlhtp1', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_HEART' },
    ],
  },

  // ─── Body Composition ─────────────────────────────────────
  {
    id: 'HL_BODY',
    domain: 'health',
    text: { en: 'Body Composition', ar: 'تكوين الجسم' },
    botMessage: { en: 'Track your body composition:', ar: 'تابع تكوين جسمك:' },
    back: 'HL_MENU',
    options: [
      { id: 'hlb1', label: { en: 'Log weight', ar: 'سجّل الوزن' }, icon: '⚖️', nextState: 'PR_LOG_WEIGHT' },
      { id: 'hlb2', label: { en: 'Log body fat %', ar: 'سجّل نسبة الدهون' }, icon: '📊', nextState: 'HL_BODY_FAT_LOG' },
      { id: 'hlb3', label: { en: 'Log measurements', ar: 'سجّل القياسات' }, icon: '📏', nextState: 'HL_BODY_MEASUREMENTS' },
      { id: 'hlb4', label: { en: 'Weight trend', ar: 'اتجاه الوزن' }, icon: '📈', nextState: 'PR_OVERVIEW' },
      { id: 'hlb5', label: { en: 'InBody analysis', ar: 'تحليل InBody' }, icon: '📋', nextState: 'HL_INBODY' },
      { id: 'hlb6', label: { en: 'Body fat guide', ar: 'دليل نسبة الدهون' }, icon: '📖', nextState: 'HL_BODY_FAT_GUIDE' },
      { id: 'hlb7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_BODY_FAT_LOG',
    domain: 'health',
    text: { en: 'Log Body Fat %', ar: 'سجّل نسبة الدهون' },
    botMessage: { en: 'What\'s your body fat percentage?', ar: 'نسبة الدهون عندك كام؟' },
    back: 'HL_BODY',
    options: [
      { id: 'hlbfl1', label: { en: '8-12% (very lean)', ar: '8-12% (لين جداً)' }, icon: '🏆', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '10' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~10%?', ar: 'تسجّل دهون ~10%؟' } } },
      { id: 'hlbfl2', label: { en: '12-16% (lean)', ar: '12-16% (لين)' }, icon: '💪', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '14' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~14%?', ar: 'تسجّل دهون ~14%؟' } } },
      { id: 'hlbfl3', label: { en: '16-20% (athletic)', ar: '16-20% (رياضي)' }, icon: '🏃', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '18' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~18%?', ar: 'تسجّل دهون ~18%؟' } } },
      { id: 'hlbfl4', label: { en: '20-25% (average)', ar: '20-25% (متوسط)' }, icon: '🙂', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '22' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~22%?', ar: 'تسجّل دهون ~22%؟' } } },
      { id: 'hlbfl5', label: { en: '25-30%', ar: '25-30%' }, icon: '📊', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '27' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~27%?', ar: 'تسجّل دهون ~27%؟' } } },
      { id: 'hlbfl6', label: { en: '30%+', ar: '30%+' }, icon: '📊', nextState: 'HL_BODY_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'BODY_FAT_PERCENTAGE', value: '33' },
          requiresConfirmation: true, confirmText: { en: 'Log body fat ~33%?', ar: 'تسجّل دهون ~33%؟' } } },
      { id: 'hlbfl7', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_BODY' },
    ],
  },

  {
    id: 'HL_BODY_LOGGED',
    domain: 'health',
    text: { en: 'Body Data Logged', ar: 'البيانات اتسجلت' },
    botMessage: { en: '✅ Body composition data logged!', ar: '✅ بيانات تكوين الجسم اتسجلت!' },
    back: 'HL_BODY',
    options: [
      { id: 'hlblgd1', label: { en: 'View trends', ar: 'شوف الاتجاهات' }, icon: '📈', nextState: 'PR_OVERVIEW' },
      { id: 'hlblgd2', label: { en: 'Back to Health', ar: 'رجوع للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_BODY_MEASUREMENTS',
    domain: 'health',
    text: { en: 'Body Measurements', ar: 'قياسات الجسم' },
    botMessage: { en: 'Opening measurement logging...', ar: 'بفتحلك تسجيل القياسات...' },
    back: 'HL_BODY',
    options: [
      { id: 'hlbm1', label: { en: 'Go to progress page', ar: 'روح لصفحة التقدم' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'hlbm2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_BODY' },
    ],
  },

  {
    id: 'HL_BODY_FAT_GUIDE',
    domain: 'health',
    text: { en: 'Body Fat Guide', ar: 'دليل نسبة الدهون' },
    botMessage: {
      en: '📖 Body Fat Percentage Guide (Men/Women):\n\n**Essential fat:** 2-5% / 10-13%\n**Athletes:** 6-13% / 14-20%\n**Fitness:** 14-17% / 21-24%\n**Average:** 18-24% / 25-31%\n**Obese:** 25%+ / 32%+\n\n⚠️ Going below essential fat is dangerous.\n💡 For visible abs: Men ~12-15%, Women ~18-22%\n📏 Most accurate: DEXA scan > InBody > calipers > mirror',
      ar: '📖 دليل نسبة الدهون (رجال/ستات):\n\n**دهون أساسية:** 2-5% / 10-13%\n**رياضيين:** 6-13% / 14-20%\n**لياقة:** 14-17% / 21-24%\n**متوسط:** 18-24% / 25-31%\n**سمنة:** 25%+ / 32%+\n\n⚠️ النزول تحت الدهون الأساسية خطير.\n💡 عشان البطن تبان: رجال ~12-15%، ستات ~18-22%\n📏 أدق قياس: DEXA > InBody > calipers > المراية',
    },
    back: 'HL_BODY',
    options: [
      { id: 'hlbfg1', label: { en: 'Log my body fat', ar: 'سجّل نسبة الدهون' }, icon: '📝', nextState: 'HL_BODY_FAT_LOG' },
      { id: 'hlbfg2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_BODY' },
    ],
  },

  // ─── Strain & Activity (Whoop/Garmin-style) ───────────────
  {
    id: 'HL_STRAIN',
    domain: 'health',
    text: { en: 'Strain & Activity', ar: 'الإجهاد والنشاط' },
    botMessage: {
      en: '🔥 Your strain score reflects how much physical stress you\'ve put on your body.\n\n• Steps & daily movement\n• Workout intensity\n• Active calories burned\n• Training load (acute & chronic)',
      ar: '🔥 سكور الإجهاد بيعكس الضغط الجسدي اللي حطيته على جسمك.\n\n• الخطوات والحركة اليومية\n• شدة التمرين\n• السعرات النشطة المحروقة\n• حمل التدريب (حاد ومزمن)',
    },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/strain' },
    back: 'HL_MENU',
    options: [
      { id: 'hls1', label: { en: 'Today\'s activity', ar: 'نشاط النهارده' }, icon: '📊', nextState: 'HL_STRAIN_TODAY' },
      { id: 'hls2', label: { en: 'Training load', ar: 'حمل التدريب' }, icon: '📈', nextState: 'HL_TRAINING_LOAD' },
      { id: 'hls3', label: { en: 'Log steps', ar: 'سجّل الخطوات' }, icon: '🚶', nextState: 'HL_LOG_STEPS' },
      { id: 'hls4', label: { en: 'Calories burned', ar: 'السعرات المحروقة' }, icon: '🔥', nextState: 'HL_CALORIES_BURNED' },
      { id: 'hls5', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_STRAIN_TODAY',
    domain: 'health',
    text: { en: 'Today\'s Activity', ar: 'نشاط النهارده' },
    botMessage: { en: 'Here\'s your activity for today:', ar: 'ده نشاطك النهارده:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/activity/today' },
    back: 'HL_STRAIN',
    options: [
      { id: 'hlsat1', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRAIN' },
    ],
  },

  {
    id: 'HL_TRAINING_LOAD',
    domain: 'health',
    text: { en: 'Training Load', ar: 'حمل التدريب' },
    botMessage: {
      en: '📈 Training Load (Garmin-style):\n\n**Acute Load** — Last 7 days of training stress\n**Chronic Load** — Last 28 days average\n**Ratio** — Acute/Chronic (optimal: 0.8-1.3)\n\n• <0.8 = Detraining (not enough)\n• 0.8-1.0 = Maintaining\n• 1.0-1.3 = Building fitness\n• >1.3 = Injury risk! Too much too fast\n\nThe key: progressive overload without spikes.',
      ar: '📈 حمل التدريب (زي Garmin):\n\n**حمل حاد** — آخر 7 أيام\n**حمل مزمن** — متوسط آخر 28 يوم\n**النسبة** — حاد/مزمن (مثالي: 0.8-1.3)\n\n• <0.8 = بتفقد لياقة (مش كفاية)\n• 0.8-1.0 = بتحافظ\n• 1.0-1.3 = بتبني لياقة\n• >1.3 = خطر إصابة! كتير بسرعة\n\nالمفتاح: زيادة تدريجية من غير قفزات.',
    },
    dynamic: true,
    back: 'HL_STRAIN',
    options: [
      { id: 'hltl1', label: { en: 'Readiness check', ar: 'فحص الجاهزية' }, icon: '🔋', nextState: 'HL_RECOVERY' },
      { id: 'hltl2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRAIN' },
    ],
  },

  {
    id: 'HL_LOG_STEPS',
    domain: 'health',
    text: { en: 'Log Steps', ar: 'سجّل الخطوات' },
    botMessage: { en: 'How many steps today?', ar: 'مشيت كام خطوة النهارده؟' },
    back: 'HL_STRAIN',
    options: [
      { id: 'hlls1', label: { en: '< 3,000', ar: '< 3,000' }, icon: '🔴', nextState: 'HL_STEPS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'STEPS', value: '2500' },
          requiresConfirmation: true, confirmText: { en: 'Log ~2,500 steps?', ar: 'تسجّل ~2,500 خطوة؟' } } },
      { id: 'hlls2', label: { en: '3,000-5,000', ar: '3,000-5,000' }, icon: '🟡', nextState: 'HL_STEPS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'STEPS', value: '4000' },
          requiresConfirmation: true, confirmText: { en: 'Log ~4,000 steps?', ar: 'تسجّل ~4,000 خطوة؟' } } },
      { id: 'hlls3', label: { en: '5,000-8,000', ar: '5,000-8,000' }, icon: '🟢', nextState: 'HL_STEPS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'STEPS', value: '6500' },
          requiresConfirmation: true, confirmText: { en: 'Log ~6,500 steps?', ar: 'تسجّل ~6,500 خطوة؟' } } },
      { id: 'hlls4', label: { en: '8,000-10,000', ar: '8,000-10,000' }, icon: '💚', nextState: 'HL_STEPS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'STEPS', value: '9000' },
          requiresConfirmation: true, confirmText: { en: 'Log ~9,000 steps?', ar: 'تسجّل ~9,000 خطوة؟' } } },
      { id: 'hlls5', label: { en: '10,000+', ar: '10,000+' }, icon: '🏆', nextState: 'HL_STEPS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'STEPS', value: '12000' },
          requiresConfirmation: true, confirmText: { en: 'Log ~12,000 steps?', ar: 'تسجّل ~12,000 خطوة؟' } } },
      { id: 'hlls6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRAIN' },
    ],
  },

  {
    id: 'HL_STEPS_LOGGED',
    domain: 'health',
    text: { en: 'Steps Logged', ar: 'الخطوات اتسجلت' },
    botMessage: { en: '✅ Steps logged!', ar: '✅ الخطوات اتسجلت!' },
    back: 'HL_STRAIN',
    options: [
      { id: 'hlslgd1', label: { en: 'Back to Health', ar: 'رجوع للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_CALORIES_BURNED',
    domain: 'health',
    text: { en: 'Calories Burned', ar: 'السعرات المحروقة' },
    botMessage: { en: 'Your calories burned today:', ar: 'السعرات اللي حرقتها النهارده:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/health/calories-burned' },
    back: 'HL_STRAIN',
    options: [
      { id: 'hlcb1', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRAIN' },
    ],
  },

  // ─── Stress ───────────────────────────────────────────────
  {
    id: 'HL_STRESS',
    domain: 'health',
    text: { en: 'Stress Level', ar: 'مستوى التوتر' },
    botMessage: {
      en: '😰 Stress tracking helps you understand when your body needs rest.\n\nHow are you feeling right now?',
      ar: '😰 تتبع التوتر بيساعدك تفهم جسمك امتى محتاج راحة.\n\nحاسس بايه دلوقتي؟',
    },
    back: 'HL_MENU',
    options: [
      { id: 'hlstr1', label: { en: 'Very relaxed', ar: 'مرتاح جداً' }, icon: '😌', nextState: 'HL_STRESS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'stress', value: '1' } } },
      { id: 'hlstr2', label: { en: 'Calm', ar: 'هادي' }, icon: '🙂', nextState: 'HL_STRESS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'stress', value: '2' } } },
      { id: 'hlstr3', label: { en: 'Moderate stress', ar: 'توتر متوسط' }, icon: '😐', nextState: 'HL_STRESS_LOGGED',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'stress', value: '3' } } },
      { id: 'hlstr4', label: { en: 'High stress', ar: 'توتر عالي' }, icon: '😰', nextState: 'HL_STRESS_TIPS',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'stress', value: '4' } } },
      { id: 'hlstr5', label: { en: 'Very stressed', ar: 'متوتر جداً' }, icon: '😵', nextState: 'HL_STRESS_TIPS',
        action: { type: 'write', endpoint: '/health/log', params: { type: 'stress', value: '5' } } },
      { id: 'hlstr6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_STRESS_LOGGED',
    domain: 'health',
    text: { en: 'Stress Logged', ar: 'التوتر اتسجل' },
    botMessage: { en: '✅ Stress level logged!', ar: '✅ مستوى التوتر اتسجل!' },
    back: 'HL_MENU',
    options: [
      { id: 'hlstl1', label: { en: 'Relaxation tips', ar: 'نصايح استرخاء' }, icon: '🧘', nextState: 'HL_STRESS_TIPS' },
      { id: 'hlstl2', label: { en: 'Back to Health', ar: 'رجوع للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_STRESS_TIPS',
    domain: 'health',
    text: { en: 'Stress Relief', ar: 'تخفيف التوتر' },
    botMessage: {
      en: '🧘 Stress Relief Techniques:\n\n**Immediate (2-5 min):**\n• Box breathing (4-4-4-4)\n• 4-7-8 breathing\n• Cold water on face/wrists\n• 5-minute walk outside\n\n**Daily habits:**\n• Regular exercise\n• 7-9 hours sleep\n• Limit social media\n• Sunlight exposure (morning)\n• Gratitude journaling\n• Socializing\n\n**Weekly:**\n• Nature time\n• Hobby time\n• Massage/sauna\n• Digital detox',
      ar: '🧘 تقنيات تخفيف التوتر:\n\n**فوري (2-5 دقايق):**\n• تنفس Box (4-4-4-4)\n• تنفس 4-7-8\n• مية باردة على الوش/الرسغ\n• مشي 5 دقايق بره\n\n**عادات يومية:**\n• تمارين منتظمة\n• نوم 7-9 ساعات\n• قلل السوشيال ميديا\n• شمس الصبح\n• كتابة الامتنان\n• تواصل اجتماعي\n\n**أسبوعي:**\n• وقت في الطبيعة\n• هوايات\n• مساج/ساونا\n• ديتوكس رقمي',
    },
    back: 'HL_STRESS',
    options: [
      { id: 'hlsttip1', label: { en: 'Breathing exercise now', ar: 'تمرين تنفس دلوقتي' }, icon: '🫁', nextState: 'HL_BREATHING' },
      { id: 'hlsttip2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRESS' },
    ],
  },

  {
    id: 'HL_BREATHING',
    domain: 'health',
    text: { en: 'Breathing Exercise', ar: 'تمرين تنفس' },
    botMessage: {
      en: '🫁 Box Breathing (4-4-4-4):\n\n1. Breathe IN for 4 seconds\n2. HOLD for 4 seconds\n3. Breathe OUT for 4 seconds\n4. HOLD for 4 seconds\n\nRepeat 4-6 times.\n\nUsed by Navy SEALs to control stress in high-pressure situations.',
      ar: '🫁 تنفس Box (4-4-4-4):\n\n1. شهيق 4 ثواني\n2. امسك 4 ثواني\n3. زفير 4 ثواني\n4. امسك 4 ثواني\n\nكرر 4-6 مرات.\n\nبيستخدمه الـ Navy SEALs عشان يتحكموا في التوتر.',
    },
    back: 'HL_STRESS_TIPS',
    options: [
      { id: 'hlbr1', label: { en: 'Done, feel better!', ar: 'خلصت، حاسس أحسن!' }, icon: '😊', nextState: 'HL_MENU' },
      { id: 'hlbr2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_STRESS_TIPS' },
    ],
  },

  // ─── Blood Work ───────────────────────────────────────────
  {
    id: 'HL_BLOOD',
    domain: 'health',
    text: { en: 'Blood Work & Labs', ar: 'تحاليل الدم' },
    botMessage: {
      en: '🩸 Track your lab results. Which values do you want to log?',
      ar: '🩸 تابع نتائج تحاليلك. عايز تسجّل ايه؟',
    },
    back: 'HL_MENU',
    options: [
      { id: 'hlbl1', label: { en: 'Cholesterol (Total/LDL/HDL)', ar: 'كولسترول (Total/LDL/HDL)' }, icon: '🫀', nextState: 'HL_BLOOD_CHOL' },
      { id: 'hlbl2', label: { en: 'Blood glucose', ar: 'سكر الدم' }, icon: '🍬', nextState: 'HL_BLOOD_GLUCOSE' },
      { id: 'hlbl3', label: { en: 'Vitamin D', ar: 'فيتامين D' }, icon: '☀️', nextState: 'HL_BLOOD_VITD' },
      { id: 'hlbl4', label: { en: 'Vitamin B12', ar: 'فيتامين B12' }, icon: '💊', nextState: 'HL_BLOOD_VITB' },
      { id: 'hlbl5', label: { en: 'Testosterone', ar: 'تستوستيرون' }, icon: '💪', nextState: 'HL_BLOOD_TESTO' },
      { id: 'hlbl6', label: { en: 'Thyroid (TSH)', ar: 'الغدة الدرقية (TSH)' }, icon: '🦋', nextState: 'HL_BLOOD_THYROID' },
      { id: 'hlbl7', label: { en: 'Hemoglobin', ar: 'هيموجلوبين' }, icon: '🩸', nextState: 'HL_BLOOD_HEMO' },
      { id: 'hlbl8', label: { en: 'What labs should I get?', ar: 'ايه التحاليل اللي أعملها؟' }, icon: '❓', nextState: 'HL_BLOOD_GUIDE' },
      { id: 'hlbl9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_BLOOD_GUIDE',
    domain: 'health',
    text: { en: 'Recommended Labs', ar: 'تحاليل مقترحة' },
    botMessage: {
      en: '🩸 Recommended Blood Tests for Athletes:\n\n**Every 6 months:**\n• Complete Blood Count (CBC)\n• Lipid Panel (cholesterol)\n• Fasting glucose + HbA1c\n• Vitamin D\n• Vitamin B12\n• Iron + Ferritin\n• Thyroid (TSH, T3, T4)\n\n**Annually:**\n• Testosterone (total + free)\n• Cortisol\n• Kidney function (Creatinine, BUN)\n• Liver function (ALT, AST)\n• Magnesium\n\nIn Egypt, you can get these at: Alpha Lab, El Borg Lab, or any hospital.',
      ar: '🩸 تحاليل مقترحة للرياضيين:\n\n**كل 6 شهور:**\n• صورة دم كاملة (CBC)\n• دهون الدم (كولسترول)\n• سكر صايم + HbA1c\n• فيتامين D\n• فيتامين B12\n• حديد + فيرتين\n• غدة درقية (TSH, T3, T4)\n\n**سنوياً:**\n• تستوستيرون (كلي + حر)\n• كورتيزول\n• وظائف كلى (كرياتينين، يوريا)\n• وظائف كبد (ALT, AST)\n• ماغنسيوم\n\nفي مصر تقدر تعمل التحاليل في: ألفا لاب، البرج، أو أي مستشفى.',
    },
    back: 'HL_BLOOD',
    options: [
      { id: 'hlbg1', label: { en: 'Log lab results', ar: 'سجّل نتائج التحاليل' }, icon: '📝', nextState: 'HL_BLOOD' },
      { id: 'hlbg2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_BLOOD' },
    ],
  },

  // Blood work sub-states (simplified — just confirm logging)
  ...(['CHOL', 'GLUCOSE', 'VITD', 'VITB', 'TESTO', 'THYROID', 'HEMO'] as const).map(test => {
    const names: Record<string, { en: string; ar: string; type: string }> = {
      CHOL: { en: 'Cholesterol', ar: 'كولسترول', type: 'TOTAL_CHOLESTEROL' },
      GLUCOSE: { en: 'Blood Glucose', ar: 'سكر الدم', type: 'BLOOD_GLUCOSE_FASTING' },
      VITD: { en: 'Vitamin D', ar: 'فيتامين D', type: 'VITAMIN_D' },
      VITB: { en: 'Vitamin B12', ar: 'فيتامين B12', type: 'VITAMIN_B12' },
      TESTO: { en: 'Testosterone', ar: 'تستوستيرون', type: 'TESTOSTERONE' },
      THYROID: { en: 'Thyroid (TSH)', ar: 'الغدة الدرقية (TSH)', type: 'TSH' },
      HEMO: { en: 'Hemoglobin', ar: 'هيموجلوبين', type: 'HEMOGLOBIN' },
    };
    const n = names[test];
    return {
      id: `HL_BLOOD_${test}`,
      domain: 'health' as const,
      text: { en: n.en, ar: n.ar },
      botMessage: {
        en: `Enter your ${n.en} value. Go to the health page to log the exact number.`,
        ar: `سجّل قيمة ${n.ar}. روح لصفحة الصحة عشان تسجّل الرقم بالظبط.`,
      },
      back: 'HL_BLOOD',
      options: [
        { id: `hlb${test}1`, label: { en: 'Go to health page', ar: 'روح لصفحة الصحة' }, icon: '📊', nextState: 'ROOT',
          action: { type: 'navigate' as const, route: '/health' } },
        { id: `hlb${test}2`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_BLOOD' },
      ],
    } as ChatState;
  }),

  // ─── VO2 Max ──────────────────────────────────────────────
  {
    id: 'HL_VO2',
    domain: 'health',
    text: { en: 'VO2 Max', ar: 'VO2 Max' },
    botMessage: {
      en: '🫁 VO2 Max — Your Cardio Fitness Score\n\nMeasures the max oxygen your body can use during exercise.\n\n**Ranges (ml/kg/min):**\n\nMen:\n• Excellent: 50+\n• Good: 40-50\n• Average: 35-40\n• Below avg: <35\n\nWomen:\n• Excellent: 45+\n• Good: 35-45\n• Average: 30-35\n• Below avg: <30\n\nHigher VO2 Max = longer life, better performance, faster recovery.',
      ar: '🫁 VO2 Max — سكور لياقتك القلبية\n\nبيقيس أقصى أكسجين جسمك بيستخدمه أثناء التمرين.\n\n**المعدلات (مل/كجم/دقيقة):**\n\nرجال:\n• ممتاز: 50+\n• كويس: 40-50\n• متوسط: 35-40\n• تحت المتوسط: <35\n\nستات:\n• ممتاز: 45+\n• كويس: 35-45\n• متوسط: 30-35\n• تحت المتوسط: <30\n\nVO2 Max أعلى = عمر أطول، أداء أحسن، ريكفري أسرع.',
    },
    back: 'HL_MENU',
    options: [
      { id: 'hlvo1', label: { en: 'How to improve VO2 Max', ar: 'إزاي أحسن VO2 Max' }, icon: '💡', nextState: 'HL_VO2_TIPS' },
      { id: 'hlvo2', label: { en: 'Log my VO2 Max', ar: 'سجّل VO2 Max' }, icon: '📝', nextState: 'ROOT',
        action: { type: 'navigate', route: '/health' } },
      { id: 'hlvo3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  {
    id: 'HL_VO2_TIPS',
    domain: 'health',
    text: { en: 'Improve VO2 Max', ar: 'حسّن VO2 Max' },
    botMessage: {
      en: '💡 How to Improve VO2 Max:\n\n1. **Zone 2 training** — 3-4x/week, 30-60 min\n2. **Interval training** — 1-2x/week (4x4 min hard, 3 min rest)\n3. **Consistent cardio** — running, cycling, swimming, rowing\n4. **Progressive overload** — gradually increase duration/intensity\n5. **Altitude training** or breath restriction\n6. **Lose excess body fat** (VO2 is per kg)\n7. **Iron-rich foods** (oxygen transport)\n8. **Don\'t overtrain** — recovery is essential\n\nExpect 10-15% improvement in 8-12 weeks with consistent Zone 2 + intervals.',
      ar: '💡 إزاي تحسن VO2 Max:\n\n1. **تمارين منطقة 2** — 3-4 مرات/أسبوع، 30-60 دقيقة\n2. **تمارين فترية** — 1-2 مرات/أسبوع (4×4 دقايق شديد، 3 دقايق راحة)\n3. **كارديو منتظم** — جري، عجلة، سباحة، تجديف\n4. **زيادة تدريجية** — زوّد المدة/الشدة تدريجياً\n5. **تدريب ارتفاعات** أو تقييد التنفس\n6. **انقص الدهون الزيادة** (VO2 بالنسبة للكيلو)\n7. **أكل غني بالحديد** (نقل الأكسجين)\n8. **متتمرنش أوي** — الريكفري ضروري\n\nتوقع تحسن 10-15% في 8-12 أسبوع مع Zone 2 + intervals.',
    },
    back: 'HL_VO2',
    options: [
      { id: 'hlvt1', label: { en: 'Zone 2 cardio plan', ar: 'خطة كارديو Zone 2' }, icon: '🏃', nextState: 'WK_FIND_TYPE' },
      { id: 'hlvt2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_VO2' },
    ],
  },

  // ─── InBody Analysis ──────────────────────────────────────
  {
    id: 'HL_INBODY',
    domain: 'health',
    text: { en: 'InBody Analysis', ar: 'تحليل InBody' },
    botMessage: {
      en: '📊 InBody Analysis shows your detailed body composition:\n\n• Total body water\n• Lean body mass (muscle)\n• Body fat mass\n• Segmental lean analysis (arms, legs, trunk)\n• Body fat percentage\n• Basal Metabolic Rate (BMR)\n• Visceral fat level\n\nGo to your nearest gym or clinic that has an InBody machine for the most accurate reading.',
      ar: '📊 تحليل InBody بيوريك تكوين جسمك بالتفصيل:\n\n• إجمالي مية الجسم\n• كتلة الجسم النحيفة (عضل)\n• كتلة الدهون\n• تحليل العضل القطعي (ذراع، رجل، جذع)\n• نسبة الدهون\n• معدل الأيض الأساسي (BMR)\n• مستوى الدهون الحشوية\n\nروح لأقرب جيم أو عيادة عندها جهاز InBody لأدق قراءة.',
    },
    back: 'HL_MENU',
    options: [
      { id: 'hlib1', label: { en: 'Log InBody results', ar: 'سجّل نتائج InBody' }, icon: '📝', nextState: 'ROOT',
        action: { type: 'navigate', route: '/health' } },
      { id: 'hlib2', label: { en: 'Body fat guide', ar: 'دليل نسبة الدهون' }, icon: '📖', nextState: 'HL_BODY_FAT_GUIDE' },
      { id: 'hlib3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  // ─── Health Trends ────────────────────────────────────────
  {
    id: 'HL_TRENDS',
    domain: 'health',
    text: { en: 'Health Trends', ar: 'اتجاهات الصحة' },
    botMessage: { en: 'View your health data trends:', ar: 'شوف اتجاهات بياناتك الصحية:' },
    back: 'HL_MENU',
    options: [
      { id: 'hltr1', label: { en: 'Go to health page', ar: 'روح لصفحة الصحة' }, icon: '📊', nextState: 'ROOT',
        action: { type: 'navigate', route: '/health' } },
      { id: 'hltr2', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },

  // ─── Log Health Data ──────────────────────────────────────
  {
    id: 'HL_LOG',
    domain: 'health',
    text: { en: 'Log Health Data', ar: 'سجّل بيانات صحية' },
    botMessage: { en: 'What do you want to log?', ar: 'عايز تسجّل ايه؟' },
    back: 'HL_MENU',
    options: [
      { id: 'hllg1', label: { en: 'Weight', ar: 'الوزن' }, icon: '⚖️', nextState: 'PR_LOG_WEIGHT' },
      { id: 'hllg2', label: { en: 'Body fat %', ar: 'نسبة الدهون' }, icon: '📊', nextState: 'HL_BODY_FAT_LOG' },
      { id: 'hllg3', label: { en: 'Sleep', ar: 'النوم' }, icon: '😴', nextState: 'HL_SLEEP_LOG' },
      { id: 'hllg4', label: { en: 'Heart rate', ar: 'النبض' }, icon: '❤️', nextState: 'HL_HEART_LOG' },
      { id: 'hllg5', label: { en: 'Steps', ar: 'الخطوات' }, icon: '🚶', nextState: 'HL_LOG_STEPS' },
      { id: 'hllg6', label: { en: 'Stress', ar: 'التوتر' }, icon: '😰', nextState: 'HL_STRESS' },
      { id: 'hllg7', label: { en: 'Blood work', ar: 'تحاليل' }, icon: '🩸', nextState: 'HL_BLOOD' },
      { id: 'hllg8', label: { en: 'Full health page', ar: 'صفحة الصحة كاملة' }, icon: '📋', nextState: 'ROOT',
        action: { type: 'navigate', route: '/health' } },
      { id: 'hllg9', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'HL_MENU' },
    ],
  },
];
