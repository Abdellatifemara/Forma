import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// ROOT MENU — Entry point for Premium Guided Chat
// ═══════════════════════════════════════════════════════════════

export const rootStates: ChatState[] = [
  {
    id: 'ROOT',
    domain: 'root',
    text: { en: 'Main Menu', ar: 'القائمة الرئيسية' },
    botMessage: {
      en: 'Hey! What would you like to do today?',
      ar: 'أهلاً! عايز تعمل ايه النهارده؟',
    },
    options: [
      { id: 'r1', label: { en: 'Workouts & Training', ar: 'التمارين والتدريب' }, icon: '💪', nextState: 'WK_MENU' },
      { id: 'r2', label: { en: 'Nutrition & Diet', ar: 'التغذية والدايت' }, icon: '🥗', nextState: 'NT_MENU' },
      { id: 'r3', label: { en: 'Health & Body', ar: 'الصحة والجسم' }, icon: '❤️', nextState: 'HL_MENU' },
      { id: 'r4', label: { en: 'Supplements', ar: 'المكملات' }, icon: '💊', nextState: 'SP_MENU' },
      { id: 'r5', label: { en: 'Programs & Plans', ar: 'البرامج والخطط' }, icon: '📋', nextState: 'PG_MENU' },
      { id: 'r6', label: { en: 'Progress & Goals', ar: 'التقدم والأهداف' }, icon: '📊', nextState: 'PR_MENU' },
      { id: 'r7', label: { en: 'Recovery & Rest', ar: 'الريكفري والراحة' }, icon: '😴', nextState: 'RC_MENU' },
      { id: 'r8', label: { en: 'Quick Actions', ar: 'إجراءات سريعة' }, icon: '⚡', nextState: 'QA_MENU' },
      { id: 'r9', label: { en: 'Connected Devices', ar: 'الأجهزة المتصلة' }, icon: '⌚', nextState: 'DV_MENU' },
      { id: 'r10', label: { en: 'Settings & Profile', ar: 'الإعدادات والبروفايل' }, icon: '⚙️', nextState: 'ST_MENU' },
    ],
  },

  // ─── Quick Actions Menu ───────────────────────────────────
  {
    id: 'QA_MENU',
    domain: 'quick',
    text: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
    botMessage: {
      en: 'Quick actions — pick one:',
      ar: 'إجراءات سريعة — اختار:',
    },
    back: 'ROOT',
    options: [
      { id: 'qa1', label: { en: 'Start Today\'s Workout', ar: 'ابدأ تمرين النهارده' }, icon: '🏋️', nextState: 'WK_TODAY',
        action: { type: 'navigate', route: '/workouts' } },
      { id: 'qa2', label: { en: 'Log a Meal', ar: 'سجّل وجبة' }, icon: '🍽️', nextState: 'NT_LOG_MEAL' },
      { id: 'qa3', label: { en: 'Log Weight', ar: 'سجّل الوزن' }, icon: '⚖️', nextState: 'PR_LOG_WEIGHT' },
      { id: 'qa4', label: { en: 'Log Water', ar: 'سجّل مياه' }, icon: '💧', nextState: 'NT_LOG_WATER' },
      { id: 'qa5', label: { en: 'Check Progress', ar: 'شوف التقدم' }, icon: '📈', nextState: 'PR_OVERVIEW',
        action: { type: 'navigate', route: '/progress' } },
      { id: 'qa6', label: { en: 'Weekly Check-in', ar: 'تشيك إن أسبوعي' }, icon: '✅', nextState: 'PR_CHECKIN',
        action: { type: 'navigate', route: '/check-in' } },
      { id: 'qa7', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Settings Menu ────────────────────────────────────────
  {
    id: 'ST_MENU',
    domain: 'settings',
    text: { en: 'Settings & Profile', ar: 'الإعدادات والبروفايل' },
    botMessage: {
      en: 'What would you like to update?',
      ar: 'عايز تعدّل ايه؟',
    },
    back: 'ROOT',
    options: [
      { id: 'st1', label: { en: 'Edit Profile', ar: 'تعديل البروفايل' }, icon: '👤', nextState: 'ST_PROFILE',
        action: { type: 'navigate', route: '/profile/edit' } },
      { id: 'st2', label: { en: 'Workout Preferences', ar: 'تفضيلات التمارين' }, icon: '🏋️', nextState: 'ST_WORKOUT_PREFS',
        action: { type: 'navigate', route: '/profile/workout-preferences' } },
      { id: 'st3', label: { en: 'Subscription', ar: 'الاشتراك' }, icon: '💳', nextState: 'ST_SUBSCRIPTION',
        action: { type: 'navigate', route: '/settings/subscription' } },
      { id: 'st4', label: { en: 'Change Language', ar: 'تغيير اللغة' }, icon: '🌍', nextState: 'ST_LANGUAGE' },
      { id: 'st5', label: { en: 'Security', ar: 'الأمان' }, icon: '🔒', nextState: 'ST_SECURITY',
        action: { type: 'navigate', route: '/profile/security' } },
      { id: 'st6', label: { en: 'Connected Devices', ar: 'الأجهزة المتصلة' }, icon: '⌚', nextState: 'DV_MENU' },
      { id: 'st7', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'ST_PROFILE',
    domain: 'settings',
    text: { en: 'Edit Profile', ar: 'تعديل البروفايل' },
    botMessage: {
      en: 'Opening your profile editor...',
      ar: 'بفتحلك صفحة تعديل البروفايل...',
    },
    back: 'ST_MENU',
    options: [
      { id: 'stp1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'ST_MENU' },
      { id: 'stp2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'ST_WORKOUT_PREFS',
    domain: 'settings',
    text: { en: 'Workout Preferences', ar: 'تفضيلات التمارين' },
    botMessage: {
      en: 'Opening workout preferences...',
      ar: 'بفتحلك تفضيلات التمارين...',
    },
    back: 'ST_MENU',
    options: [
      { id: 'stwp1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'ST_MENU' },
      { id: 'stwp2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'ST_SUBSCRIPTION',
    domain: 'settings',
    text: { en: 'Subscription', ar: 'الاشتراك' },
    botMessage: {
      en: 'Opening subscription settings...',
      ar: 'بفتحلك إعدادات الاشتراك...',
    },
    back: 'ST_MENU',
    options: [
      { id: 'sts1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'ST_MENU' },
      { id: 'sts2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'ST_LANGUAGE',
    domain: 'settings',
    text: { en: 'Change Language', ar: 'تغيير اللغة' },
    botMessage: {
      en: 'Choose your preferred language:',
      ar: 'اختار اللغة:',
    },
    back: 'ST_MENU',
    options: [
      { id: 'stl1', label: { en: 'English', ar: 'English' }, icon: '🇬🇧', nextState: 'ST_LANG_CONFIRM',
        action: { type: 'write', params: { language: 'en' }, requiresConfirmation: true,
          confirmText: { en: 'Switch to English?', ar: 'تغيير للإنجليزي؟' } } },
      { id: 'stl2', label: { en: 'العربية', ar: 'العربية' }, icon: '🇪🇬', nextState: 'ST_LANG_CONFIRM',
        action: { type: 'write', params: { language: 'ar' }, requiresConfirmation: true,
          confirmText: { en: 'Switch to Arabic?', ar: 'تغيير للعربي؟' } } },
      { id: 'stl3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'ST_MENU' },
    ],
  },

  {
    id: 'ST_LANG_CONFIRM',
    domain: 'settings',
    text: { en: 'Language Updated', ar: 'اللغة اتغيرت' },
    botMessage: {
      en: 'Language updated! The app will now use your new language.',
      ar: 'اللغة اتغيرت! التطبيق هيستخدم اللغة الجديدة.',
    },
    back: 'ST_MENU',
    options: [
      { id: 'stlc1', label: { en: 'Back to Settings', ar: 'رجوع للإعدادات' }, icon: '⚙️', nextState: 'ST_MENU' },
      { id: 'stlc2', label: { en: 'Main Menu', ar: 'القائمة الرئيسية' }, icon: '🏠', nextState: 'ROOT' },
    ],
  },

  {
    id: 'ST_SECURITY',
    domain: 'settings',
    text: { en: 'Security', ar: 'الأمان' },
    botMessage: {
      en: 'Opening security settings...',
      ar: 'بفتحلك إعدادات الأمان...',
    },
    back: 'ST_MENU',
    options: [
      { id: 'stsc1', label: { en: 'Done', ar: 'خلصت' }, icon: '✅', nextState: 'ST_MENU' },
      { id: 'stsc2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },
];
