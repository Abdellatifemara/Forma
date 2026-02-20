import { ChatState } from './types';

// ═══════════════════════════════════════════════════════════════
// CONNECTED DEVICES DOMAIN (~25 states)
// Supports: Apple Watch, Whoop, OURA Ring, Garmin, Apple Health, Google Fit
// ═══════════════════════════════════════════════════════════════

export const deviceStates: ChatState[] = [
  {
    id: 'DV_MENU',
    domain: 'device',
    text: { en: 'Connected Devices', ar: 'الأجهزة المتصلة' },
    botMessage: {
      en: '⌚ Connect your wearable or health app to sync data automatically.\n\nWhat would you like to do?',
      ar: '⌚ وصّل ساعتك أو تطبيق الصحة عشان تزامن بياناتك تلقائياً.\n\nعايز تعمل ايه؟',
    },
    back: 'ROOT',
    options: [
      { id: 'dv1', label: { en: 'Connect new device', ar: 'وصّل جهاز جديد' }, icon: '➕', nextState: 'DV_SELECT' },
      { id: 'dv2', label: { en: 'My connected devices', ar: 'أجهزتي المتصلة' }, icon: '📱', nextState: 'DV_MY_DEVICES' },
      { id: 'dv3', label: { en: 'Sync settings', ar: 'إعدادات المزامنة' }, icon: '🔄', nextState: 'DV_SYNC_SETTINGS' },
      { id: 'dv4', label: { en: 'What data do you collect?', ar: 'بتجمعوا ايه من بيانات؟' }, icon: '❓', nextState: 'DV_PRIVACY' },
      { id: 'dv5', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Select Device ────────────────────────────────────────
  {
    id: 'DV_SELECT',
    domain: 'device',
    text: { en: 'Select Device', ar: 'اختار الجهاز' },
    botMessage: {
      en: 'Which device or health app do you want to connect?',
      ar: 'عايز توصّل أي جهاز أو تطبيق صحة؟',
    },
    back: 'DV_MENU',
    options: [
      { id: 'dvs1', label: { en: 'Apple Watch', ar: 'Apple Watch' }, icon: '⌚', nextState: 'DV_APPLE_WATCH' },
      { id: 'dvs2', label: { en: 'Whoop', ar: 'Whoop' }, icon: '🟢', nextState: 'DV_WHOOP' },
      { id: 'dvs3', label: { en: 'OURA Ring', ar: 'OURA Ring' }, icon: '💍', nextState: 'DV_OURA' },
      { id: 'dvs4', label: { en: 'Garmin', ar: 'Garmin' }, icon: '🔵', nextState: 'DV_GARMIN' },
      { id: 'dvs5', label: { en: 'Apple Health', ar: 'Apple Health' }, icon: '🍎', nextState: 'DV_APPLE_HEALTH' },
      { id: 'dvs6', label: { en: 'Google Fit', ar: 'Google Fit' }, icon: '🟩', nextState: 'DV_GOOGLE_FIT' },
      { id: 'dvs7', label: { en: 'Fitbit', ar: 'Fitbit' }, icon: '🔷', nextState: 'DV_FITBIT' },
      { id: 'dvs8', label: { en: 'Samsung Health', ar: 'Samsung Health' }, icon: '🟦', nextState: 'DV_SAMSUNG' },
      { id: 'dvs9', label: { en: 'Other', ar: 'تاني' }, icon: '📱', nextState: 'DV_OTHER' },
      { id: 'dvs10', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_MENU' },
    ],
  },

  // Device-specific connection states (8 devices)
  ...([
    { id: 'APPLE_WATCH', en: 'Apple Watch', ar: 'Apple Watch', icon: '⌚',
      metrics_en: 'Heart rate, HRV, ECG, SpO2, sleep stages, VO2 Max, steps, calories, training load, activity rings, respiratory rate, wrist temperature',
      metrics_ar: 'نبض القلب، HRV، ECG، SpO2، مراحل النوم، VO2 Max، خطوات، سعرات، حمل التدريب، حلقات النشاط، معدل التنفس، حرارة الرسغ' },
    { id: 'WHOOP', en: 'Whoop', ar: 'Whoop', icon: '🟢',
      metrics_en: 'Recovery score, strain, sleep (4 stages), HRV, resting HR, respiratory rate, SpO2, skin temp, stress, WHOOP Age',
      metrics_ar: 'سكور الريكفري، الإجهاد، النوم (4 مراحل)، HRV، نبض الراحة، معدل التنفس، SpO2، حرارة الجلد، التوتر، عمر WHOOP' },
    { id: 'OURA', en: 'OURA Ring', ar: 'OURA Ring', icon: '💍',
      metrics_en: 'Readiness score, sleep (4 stages + score), HRV, resting HR, body temperature, activity score, stress, resilience, cardiovascular age',
      metrics_ar: 'سكور الجاهزية، النوم (4 مراحل + سكور)، HRV، نبض الراحة، حرارة الجسم، سكور النشاط، التوتر، المرونة، عمر القلب' },
    { id: 'GARMIN', en: 'Garmin', ar: 'Garmin', icon: '🔵',
      metrics_en: 'Body Battery, stress (0-100), VO2 Max, training load, training readiness, sleep score, HRV status, ECG, steps, calories',
      metrics_ar: 'Body Battery، التوتر (0-100)، VO2 Max، حمل التدريب، جاهزية التدريب، سكور النوم، HRV، ECG، خطوات، سعرات' },
    { id: 'APPLE_HEALTH', en: 'Apple Health', ar: 'Apple Health', icon: '🍎',
      metrics_en: 'Steps, heart rate, sleep, workouts, nutrition, body measurements, respiratory, cycle tracking',
      metrics_ar: 'خطوات، نبض القلب، نوم، تمارين، تغذية، قياسات الجسم، تنفس، تتبع الدورة' },
    { id: 'GOOGLE_FIT', en: 'Google Fit', ar: 'Google Fit', icon: '🟩',
      metrics_en: 'Steps, heart rate, sleep, workouts, calories, weight, blood pressure, blood glucose',
      metrics_ar: 'خطوات، نبض القلب، نوم، تمارين، سعرات، وزن، ضغط الدم، سكر الدم' },
    { id: 'FITBIT', en: 'Fitbit', ar: 'Fitbit', icon: '🔷',
      metrics_en: 'Steps, heart rate, sleep stages, SpO2, stress, Active Zone Minutes, calories, Daily Readiness',
      metrics_ar: 'خطوات، نبض القلب، مراحل النوم، SpO2، التوتر، دقائق النشاط، سعرات، الجاهزية اليومية' },
    { id: 'SAMSUNG', en: 'Samsung Health', ar: 'Samsung Health', icon: '🟦',
      metrics_en: 'Steps, heart rate, sleep, SpO2, stress, body composition (BIA), blood pressure, ECG',
      metrics_ar: 'خطوات، نبض القلب، نوم، SpO2، التوتر، تكوين الجسم (BIA)، ضغط الدم، ECG' },
  ] as const).map(device => ({
    id: `DV_${device.id}`,
    domain: 'device' as const,
    text: { en: device.en, ar: device.ar },
    botMessage: {
      en: `${device.icon} **${device.en}**\n\nData we can sync:\n${device.metrics_en}\n\nWould you like to connect?`,
      ar: `${device.icon} **${device.ar}**\n\nالبيانات اللي نقدر نزامنها:\n${device.metrics_ar}\n\nعايز توصّل؟`,
    },
    back: 'DV_SELECT',
    options: [
      { id: `dv${device.id}1`, label: { en: 'Connect', ar: 'وصّل' }, icon: '🔗', nextState: 'DV_CONNECT_PERMISSIONS',
        action: { type: 'write' as const, endpoint: '/devices/connect', params: { device: device.id },
          requiresConfirmation: true, confirmText: {
            en: `Connect ${device.en}? We'll ask for permission to read your health data.`,
            ar: `توصّل ${device.ar}؟ هنطلب إذنك عشان نقرأ بياناتك الصحية.`,
          } } },
      { id: `dv${device.id}2`, label: { en: 'What data exactly?', ar: 'ايه البيانات بالظبط؟' }, icon: '❓', nextState: 'DV_PRIVACY' },
      { id: `dv${device.id}3`, label: { en: 'Not now', ar: 'مش دلوقتي' }, icon: '⏭️', nextState: 'DV_SELECT' },
      { id: `dv${device.id}4`, label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_SELECT' },
    ],
  } as ChatState)),

  {
    id: 'DV_OTHER',
    domain: 'device',
    text: { en: 'Other Device', ar: 'جهاز تاني' },
    botMessage: {
      en: 'We\'re adding more devices soon! For now, you can:\n\n• Use Apple Health or Google Fit as a bridge (most devices sync to these)\n• Log data manually in the app\n\nWant to request a specific device?',
      ar: 'بنضيف أجهزة أكتر قريباً! دلوقتي تقدر:\n\n• تستخدم Apple Health أو Google Fit كوسيط (معظم الأجهزة بتزامن معاهم)\n• تسجّل البيانات يدوي في التطبيق\n\nعايز تطلب جهاز معين؟',
    },
    back: 'DV_SELECT',
    options: [
      { id: 'dvo1', label: { en: 'Use Apple Health bridge', ar: 'استخدم Apple Health' }, icon: '🍎', nextState: 'DV_APPLE_HEALTH' },
      { id: 'dvo2', label: { en: 'Use Google Fit bridge', ar: 'استخدم Google Fit' }, icon: '🟩', nextState: 'DV_GOOGLE_FIT' },
      { id: 'dvo3', label: { en: 'Log data manually', ar: 'سجّل يدوي' }, icon: '📝', nextState: 'HL_LOG' },
      { id: 'dvo4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_SELECT' },
    ],
  },

  // ─── Connection Flow ──────────────────────────────────────
  {
    id: 'DV_CONNECT_PERMISSIONS',
    domain: 'device',
    text: { en: 'Data Permissions', ar: 'صلاحيات البيانات' },
    botMessage: {
      en: '🔒 Choose what data to sync:\n\nYou control what we can access. You can change this anytime.',
      ar: '🔒 اختار ايه اللي يتزامن:\n\nانت بتتحكم في اللي نقدر نوصله. تقدر تغيره في أي وقت.',
    },
    back: 'DV_SELECT',
    options: [
      { id: 'dvcp1', label: { en: 'Sync everything', ar: 'زامن كل حاجة' }, icon: '✅', nextState: 'DV_CONNECT_SUCCESS',
        action: { type: 'write', endpoint: '/devices/set-permissions', params: { scope: 'all' },
          requiresConfirmation: true, confirmText: { en: 'Allow syncing all health data?', ar: 'تسمح بمزامنة كل البيانات الصحية؟' } } },
      { id: 'dvcp2', label: { en: 'Only sleep & recovery', ar: 'النوم والريكفري بس' }, icon: '😴', nextState: 'DV_CONNECT_SUCCESS',
        action: { type: 'write', endpoint: '/devices/set-permissions', params: { scope: 'sleep_recovery' },
          requiresConfirmation: true, confirmText: { en: 'Sync only sleep & recovery data?', ar: 'تزامن بيانات النوم والريكفري بس؟' } } },
      { id: 'dvcp3', label: { en: 'Only heart & activity', ar: 'القلب والنشاط بس' }, icon: '❤️', nextState: 'DV_CONNECT_SUCCESS',
        action: { type: 'write', endpoint: '/devices/set-permissions', params: { scope: 'heart_activity' },
          requiresConfirmation: true, confirmText: { en: 'Sync only heart & activity data?', ar: 'تزامن بيانات القلب والنشاط بس؟' } } },
      { id: 'dvcp4', label: { en: 'Only workouts', ar: 'التمارين بس' }, icon: '🏋️', nextState: 'DV_CONNECT_SUCCESS',
        action: { type: 'write', endpoint: '/devices/set-permissions', params: { scope: 'workouts' },
          requiresConfirmation: true, confirmText: { en: 'Sync only workout data?', ar: 'تزامن بيانات التمارين بس؟' } } },
      { id: 'dvcp5', label: { en: 'Cancel', ar: 'إلغاء' }, icon: '❌', nextState: 'DV_MENU' },
    ],
  },

  {
    id: 'DV_CONNECT_SUCCESS',
    domain: 'device',
    text: { en: 'Device Connected', ar: 'الجهاز اتوصّل' },
    botMessage: {
      en: '✅ Device connected! Your health data will sync automatically.\n\nFirst sync may take a few minutes. You\'ll see your data in the Health section.',
      ar: '✅ الجهاز اتوصّل! بياناتك الصحية هتتزامن تلقائياً.\n\nأول مزامنة ممكن تاخد كام دقيقة. هتشوف بياناتك في قسم الصحة.',
    },
    back: 'DV_MENU',
    options: [
      { id: 'dvcs1', label: { en: 'Go to Health', ar: 'روح للصحة' }, icon: '❤️', nextState: 'HL_MENU' },
      { id: 'dvcs2', label: { en: 'Connect another device', ar: 'وصّل جهاز تاني' }, icon: '➕', nextState: 'DV_SELECT' },
      { id: 'dvcs3', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── My Devices ───────────────────────────────────────────
  {
    id: 'DV_MY_DEVICES',
    domain: 'device',
    text: { en: 'My Devices', ar: 'أجهزتي' },
    botMessage: { en: 'Your connected devices:', ar: 'الأجهزة المتصلة:' },
    dynamic: true,
    onEnter: { type: 'fetch', endpoint: '/devices/my' },
    back: 'DV_MENU',
    options: [
      { id: 'dvmd1', label: { en: 'Connect new device', ar: 'وصّل جهاز جديد' }, icon: '➕', nextState: 'DV_SELECT' },
      { id: 'dvmd2', label: { en: 'Disconnect a device', ar: 'افصل جهاز' }, icon: '🔌', nextState: 'DV_DISCONNECT',
        action: { type: 'write', endpoint: '/devices/disconnect',
          requiresConfirmation: true, confirmText: { en: 'Disconnect this device? Your synced data will be kept.', ar: 'تفصل الجهاز ده؟ البيانات المتزامنة هتفضل محفوظة.' } } },
      { id: 'dvmd3', label: { en: 'Sync settings', ar: 'إعدادات المزامنة' }, icon: '🔄', nextState: 'DV_SYNC_SETTINGS' },
      { id: 'dvmd4', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_MENU' },
    ],
  },

  {
    id: 'DV_DISCONNECT',
    domain: 'device',
    text: { en: 'Device Disconnected', ar: 'الجهاز اتفصل' },
    botMessage: { en: '✅ Device disconnected. Your existing data is preserved.', ar: '✅ الجهاز اتفصل. بياناتك المحفوظة هتفضل.' },
    back: 'DV_MENU',
    options: [
      { id: 'dvdc1', label: { en: 'Reconnect', ar: 'وصّل تاني' }, icon: '🔗', nextState: 'DV_SELECT' },
      { id: 'dvdc2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  {
    id: 'DV_SYNC_SETTINGS',
    domain: 'device',
    text: { en: 'Sync Settings', ar: 'إعدادات المزامنة' },
    botMessage: {
      en: 'How often should we sync your data?',
      ar: 'نزامن بياناتك كل قد ايه؟',
    },
    back: 'DV_MENU',
    options: [
      { id: 'dvss1', label: { en: 'Real-time (battery intensive)', ar: 'لحظي (بيستهلك بطارية)' }, icon: '⚡', nextState: 'DV_SYNC_SAVED',
        action: { type: 'write', endpoint: '/devices/sync-frequency', params: { freq: 'realtime' },
          requiresConfirmation: true, confirmText: { en: 'Set real-time sync?', ar: 'تفعّل المزامنة اللحظية؟' } } },
      { id: 'dvss2', label: { en: 'Every hour', ar: 'كل ساعة' }, icon: '🕐', nextState: 'DV_SYNC_SAVED',
        action: { type: 'write', endpoint: '/devices/sync-frequency', params: { freq: 'hourly' } } },
      { id: 'dvss3', label: { en: 'Every 6 hours', ar: 'كل 6 ساعات' }, icon: '🕕', nextState: 'DV_SYNC_SAVED',
        action: { type: 'write', endpoint: '/devices/sync-frequency', params: { freq: '6h' } } },
      { id: 'dvss4', label: { en: 'Daily', ar: 'يومي' }, icon: '📅', nextState: 'DV_SYNC_SAVED',
        action: { type: 'write', endpoint: '/devices/sync-frequency', params: { freq: 'daily' } } },
      { id: 'dvss5', label: { en: 'Manual only', ar: 'يدوي بس' }, icon: '✋', nextState: 'DV_SYNC_SAVED',
        action: { type: 'write', endpoint: '/devices/sync-frequency', params: { freq: 'manual' } } },
      { id: 'dvss6', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_MENU' },
    ],
  },

  {
    id: 'DV_SYNC_SAVED',
    domain: 'device',
    text: { en: 'Sync Settings Saved', ar: 'إعدادات المزامنة اتحفظت' },
    botMessage: { en: '✅ Sync settings updated!', ar: '✅ إعدادات المزامنة اتحدثت!' },
    back: 'DV_MENU',
    options: [
      { id: 'dvssv1', label: { en: 'Back to Devices', ar: 'رجوع للأجهزة' }, icon: '⌚', nextState: 'DV_MENU' },
      { id: 'dvssv2', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },

  // ─── Privacy ──────────────────────────────────────────────
  {
    id: 'DV_PRIVACY',
    domain: 'device',
    text: { en: 'Data & Privacy', ar: 'البيانات والخصوصية' },
    botMessage: {
      en: '🔒 **Your Data, Your Control**\n\n• We only access data you explicitly allow\n• Your health data is encrypted end-to-end\n• We NEVER sell your data to third parties\n• You can delete all data at any time\n• You can disconnect devices at any time\n• We use your data ONLY to give you better fitness insights\n\nWhat we collect:\n✅ Health metrics (HR, sleep, activity)\n✅ Workout data\n✅ Nutrition logs\n\nWhat we DON\'T collect:\n❌ Location data\n❌ Contacts\n❌ Personal photos\n❌ Messages',
      ar: '🔒 **بياناتك، تحكمك**\n\n• بنوصل للبيانات اللي انت سمحت بيها بس\n• بياناتك الصحية مشفرة end-to-end\n• مبنبيعش بياناتك أبداً\n• تقدر تمسح كل بياناتك في أي وقت\n• تقدر تفصل الأجهزة في أي وقت\n• بنستخدم بياناتك عشان نديك رؤى صحية أحسن بس\n\nاللي بنجمعه:\n✅ مقاييس صحية (نبض، نوم، نشاط)\n✅ بيانات تمارين\n✅ سجلات تغذية\n\nاللي مش بنجمعه:\n❌ بيانات الموقع\n❌ جهات الاتصال\n❌ الصور الشخصية\n❌ الرسائل',
    },
    back: 'DV_MENU',
    options: [
      { id: 'dvp1', label: { en: 'Connect a device', ar: 'وصّل جهاز' }, icon: '➕', nextState: 'DV_SELECT' },
      { id: 'dvp2', label: { en: 'Delete my health data', ar: 'امسح بياناتي الصحية' }, icon: '🗑️', nextState: 'DV_DELETE_DATA',
        action: { type: 'write', endpoint: '/devices/delete-all-data',
          requiresConfirmation: true, confirmText: { en: '⚠️ Delete ALL your health data? This cannot be undone!', ar: '⚠️ تمسح كل بياناتك الصحية؟ مش هتقدر ترجعها!' } } },
      { id: 'dvp3', label: { en: 'Back', ar: 'رجوع' }, icon: '🔙', nextState: 'DV_MENU' },
    ],
  },

  {
    id: 'DV_DELETE_DATA',
    domain: 'device',
    text: { en: 'Data Deleted', ar: 'البيانات اتمسحت' },
    botMessage: { en: '✅ All health data deleted.', ar: '✅ كل البيانات الصحية اتمسحت.' },
    back: 'DV_MENU',
    options: [
      { id: 'dvdd1', label: { en: 'Back to Menu', ar: 'رجوع للقائمة' }, icon: '🔙', nextState: 'ROOT' },
    ],
  },
];
