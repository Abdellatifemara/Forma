import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete exercise content with descriptions, instructions, tips, and FAQs
const exerciseContent: Record<string, {
  descriptionEn: string;
  descriptionAr: string;
  instructionsEn: string[];
  instructionsAr: string[];
  tipsEn: string[];
  tipsAr: string[];
  faqsEn: { question: string; answer: string }[];
  faqsAr: { question: string; answer: string }[];
}> = {
  // Flat Barbell Bench Press
  'MC001': {
    descriptionEn: 'The barbell bench press is the king of chest exercises, building strength and mass in the chest, shoulders, and triceps. It is a compound movement that engages multiple muscle groups simultaneously.',
    descriptionAr: 'ضغط البار على البنش هو ملك تمارين الصدر، يبني القوة والكتلة في الصدر والكتفين والترايسبس. هو تمرين مركب يشغل عدة مجموعات عضلية في آن واحد.',
    instructionsEn: [
      'Lie flat on a bench with your feet firmly on the floor',
      'Grip the bar slightly wider than shoulder-width apart',
      'Unrack the bar and hold it directly over your chest',
      'Lower the bar slowly to your mid-chest while keeping elbows at 45 degrees',
      'Press the bar back up explosively to the starting position',
      'Keep your shoulder blades retracted throughout the movement'
    ],
    instructionsAr: [
      'استلقِ على البنش مع تثبيت قدميك على الأرض',
      'امسك البار بمسافة أوسع قليلاً من عرض الكتفين',
      'ارفع البار وأمسكه فوق صدرك مباشرة',
      'أنزل البار ببطء نحو منتصف صدرك مع إبقاء المرفقين بزاوية 45 درجة',
      'ادفع البار للأعلى بقوة إلى وضع البداية',
      'أبقِ لوحي كتفك مسحوبين للخلف طوال الحركة'
    ],
    tipsEn: ['Keep shoulder blades pinched together for stability', 'Never bounce the bar off chest', 'Keep wrists straight', 'Drive through your legs for power'],
    tipsAr: ['أبقِ لوحي كتفك مضمومين للثبات', 'لا ترتد البار عن صدرك', 'أبقِ معصميك مستقيمين', 'ادفع بساقيك للقوة'],
    faqsEn: [
      { question: 'How do I avoid shoulder injury?', answer: 'Keep elbows at 45-degree angle, not flared out at 90 degrees. Retract your shoulder blades and do not bounce the bar. Warm up with lighter weights first.' },
      { question: 'My wrists hurt during bench press. What should I do?', answer: 'Keep your wrists straight, not bent back. The bar should rest on the heel of your palm. Consider using wrist wraps for heavy lifts.' },
      { question: 'Why does my shoulder click during bench press?', answer: 'Clicking often means your shoulder is not stable. Focus on retracting shoulder blades, use proper form, and reduce weight. See a doctor if there is pain.' },
      { question: 'How do I stop the bar from shaking?', answer: 'Start with lighter weight to build stabilizer muscles. Keep your core tight, squeeze the bar hard, and ensure even grip width on both sides.' },
      { question: 'What if I get stuck under the bar?', answer: 'Always use a spotter or safety pins. If stuck alone, tilt the bar to one side to slide weights off, or roll the bar down to your hips and sit up.' }
    ],
    faqsAr: [
      { question: 'كيف أتجنب إصابة الكتف؟', answer: 'أبقِ المرفقين بزاوية 45 درجة، ليس منفتحين بزاوية 90. اسحب لوحي الكتف ولا ترتد البار. سخّن بأوزان خفيفة أولاً.' },
      { question: 'معصمي يؤلمني أثناء البنش. ماذا أفعل؟', answer: 'أبقِ معصميك مستقيمين، ليسوا مثنيين للخلف. يجب أن يستقر البار على كعب راحة يدك. فكر في استخدام رباط المعصم للرفعات الثقيلة.' },
      { question: 'لماذا يصدر كتفي صوت طقطقة أثناء البنش؟', answer: 'الطقطقة غالباً تعني أن كتفك غير مستقر. ركز على سحب لوحي الكتف، استخدم الأسلوب الصحيح، وقلل الوزن. راجع طبيباً إذا كان هناك ألم.' },
      { question: 'كيف أوقف البار من الاهتزاز؟', answer: 'ابدأ بوزن أخف لبناء عضلات التثبيت. شد جذعك، اضغط البار بقوة، وتأكد من تساوي عرض القبضة على الجانبين.' },
      { question: 'ماذا لو علقت تحت البار؟', answer: 'استخدم دائماً مساعداً أو قضبان الأمان. إذا علقت وحدك، أمِل البار لجانب لإنزلاق الأوزان، أو دحرج البار لوركيك واجلس.' }
    ],
  },
  // Conventional Deadlift
  'LB001': {
    descriptionEn: 'The deadlift is the ultimate full-body strength exercise. It works your entire posterior chain including back, glutes, and hamstrings while also engaging your core, forearms, and traps.',
    descriptionAr: 'رفعة الميتة هي تمرين القوة الشامل للجسم كله. تعمل على السلسلة الخلفية بالكامل شاملة الظهر والمؤخرة والهامسترينج بينما تشغل أيضاً الجذع والساعدين والترابس.',
    instructionsEn: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar just outside your legs',
      'Push your chest up and flatten your back - create tension in your lats',
      'Take a big breath, brace your core',
      'Drive through your heels and stand up with the bar',
      'Lock out at the top with shoulders back and hips forward',
      'Lower the bar by pushing hips back first, then bending knees'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الورك، البار فوق منتصف القدم',
      'انحنِ من الوركين والركبتين لمسك البار خارج ساقيك',
      'ارفع صدرك وافرد ظهرك - اخلق توتراً في اللاتس',
      'خذ نفساً عميقاً، شد جذعك',
      'ادفع من كعبيك وقف مع البار',
      'اقفل في القمة مع الكتفين للخلف والوركين للأمام',
      'أنزل البار بدفع الوركين للخلف أولاً، ثم ثني الركبتين'
    ],
    tipsEn: ['Never round your lower back', 'Keep bar close to body', 'Lock out completely at top', 'Use mixed grip or straps for heavy weights'],
    tipsAr: ['لا تقوّس أسفل ظهرك أبداً', 'أبقِ البار قريباً من جسمك', 'اقفل بالكامل في القمة', 'استخدم قبضة مختلطة أو أحزمة للأوزان الثقيلة'],
    faqsEn: [
      { question: 'How do I protect my lower back?', answer: 'Never round your lower back. Brace your core like you are about to get punched, keep chest up, and if your back rounds, the weight is too heavy.' },
      { question: 'I feel it in my lower back, not my legs. Is this wrong?', answer: 'Yes, you are likely using your back too much. Push through your legs first, keep the bar close, and think about pushing the floor away.' },
      { question: 'Should I look up or down?', answer: 'Keep your neck neutral - look at a spot on the floor about 6-10 feet ahead. Looking up can strain your neck; looking down can round your back.' },
      { question: 'My grip gives out before my legs. What do I do?', answer: 'Use mixed grip (one palm forward, one back) or lifting straps. Also train your grip separately with farmer walks and dead hangs.' },
      { question: 'Is it normal to feel dizzy after heavy deadlifts?', answer: 'Some lightheadedness is normal from the effort. Breathe at the top of each rep, stay hydrated, and do not hold your breath too long.' }
    ],
    faqsAr: [
      { question: 'كيف أحمي أسفل ظهري؟', answer: 'لا تقوّس أسفل ظهرك أبداً. شد جذعك كأنك ستتلقى لكمة، أبقِ صدرك مرتفعاً، وإذا تقوّس ظهرك فالوزن ثقيل جداً.' },
      { question: 'أشعر به في أسفل ظهري، ليس ساقاي. هل هذا خطأ؟', answer: 'نعم، أنت تستخدم ظهرك كثيراً على الأرجح. ادفع بساقيك أولاً، أبقِ البار قريباً، وفكر في دفع الأرض بعيداً.' },
      { question: 'هل أنظر للأعلى أم للأسفل؟', answer: 'أبقِ رقبتك محايدة - انظر لنقطة على الأرض على بعد 2-3 أمتار. النظر للأعلى يمكن أن يجهد رقبتك؛ النظر للأسفل يمكن أن يقوّس ظهرك.' },
      { question: 'قبضتي تضعف قبل ساقاي. ماذا أفعل؟', answer: 'استخدم قبضة مختلطة (كف للأمام، كف للخلف) أو أحزمة الرفع. أيضاً درّب قبضتك بشكل منفصل بحمل الفارمر والتعلق.' },
      { question: 'هل من الطبيعي الشعور بالدوخة بعد رفعات ثقيلة؟', answer: 'بعض الدوار طبيعي من المجهود. تنفس في أعلى كل تكرار، ابقَ رطباً، ولا تحبس نفسك طويلاً.' }
    ],
  },
  // Back Squat - High Bar
  'QD001': {
    descriptionEn: 'The barbell back squat is the king of leg exercises. It builds massive quads, glutes, and hamstrings while also strengthening your core and developing overall lower body power.',
    descriptionAr: 'سكوات البار هو ملك تمارين الأرجل. يبني عضلات فخذ ومؤخرة ضخمة مع تقوية الجذع وتطوير قوة الجزء السفلي بالكامل.',
    instructionsEn: [
      'Position the bar on your upper traps (high bar) or rear delts (low bar)',
      'Stand with feet shoulder-width apart, toes pointed slightly outward',
      'Take a deep breath and brace your core tightly',
      'Initiate the descent by breaking at the hips and knees simultaneously',
      'Keep your chest up and back straight as you descend',
      'Go down until your hip crease is below your knee (at least parallel)',
      'Drive through your whole foot to stand back up',
      'Lock out hips at the top and repeat'
    ],
    instructionsAr: [
      'ضع البار على أعلى الترابس (عالي) أو الدالتويد الخلفي (منخفض)',
      'قف مع القدمين بعرض الكتفين، الأصابع للخارج قليلاً',
      'خذ نفساً عميقاً وشد جذعك بقوة',
      'ابدأ النزول بكسر الوركين والركبتين معاً',
      'أبقِ صدرك مرتفعاً وظهرك مستقيماً أثناء النزول',
      'انزل حتى يصبح ثنية الورك تحت ركبتك (موازي على الأقل)',
      'ادفع بكل قدمك للوقوف مرة أخرى',
      'اقفل الوركين في القمة وكرر'
    ],
    tipsEn: ['Keep knees tracking over toes', 'Do not let knees cave inward', 'Keep heels planted', 'Look forward not down'],
    tipsAr: ['أبقِ الركبتين تتبعان أصابع القدمين', 'لا تدع الركبتين تنهار للداخل', 'أبقِ الكعبين على الأرض', 'انظر للأمام لا للأسفل'],
    faqsEn: [
      { question: 'My knees hurt when I squat. What am I doing wrong?', answer: 'Common causes: knees caving inward, heels lifting off ground, or going too heavy too fast. Push knees out over toes, keep heels down, and reduce weight to fix form.' },
      { question: 'How do I prevent knee caving?', answer: 'Focus on pushing your knees out over your pinky toe. Strengthen your glutes with hip thrusts and banded squats. Consider wider stance.' },
      { question: 'My lower back rounds at the bottom (butt wink). Is this dangerous?', answer: 'Yes, it can cause disc issues over time. Work on hip and ankle mobility. Only squat as deep as you can maintain a flat back.' },
      { question: 'I lean forward too much. How do I stay upright?', answer: 'Usually caused by tight ankles or weak quads. Try heel wedges, work on ankle mobility, and strengthen quads with leg press and extensions.' },
      { question: 'The bar hurts my neck/back. What should I do?', answer: 'Create a shelf with your traps by squeezing shoulder blades together. Use a barbell pad if needed, or try front squats instead.' }
    ],
    faqsAr: [
      { question: 'ركبتي تؤلمني عند السكوات. ماذا أفعل خطأ؟', answer: 'أسباب شائعة: الركبتين تنهار للداخل، الكعبين يرتفعان، أو الذهاب ثقيل جداً بسرعة. ادفع الركبتين للخارج فوق أصابع القدم، أبقِ الكعبين على الأرض، وقلل الوزن لإصلاح الأسلوب.' },
      { question: 'كيف أمنع انهيار الركبة؟', answer: 'ركز على دفع ركبتيك للخارج فوق إصبع القدم الصغير. قوِّ المؤخرة بتمارين الهيب ثرست وسكوات بالمطاط. فكر في وقفة أوسع.' },
      { question: 'أسفل ظهري يتقوس في القاع. هل هذا خطير؟', answer: 'نعم، يمكن أن يسبب مشاكل في الديسك مع الوقت. اعمل على مرونة الورك والكاحل. انزل فقط بالعمق الذي يمكنك فيه الحفاظ على ظهر مسطح.' },
      { question: 'أميل للأمام كثيراً. كيف أبقى منتصباً؟', answer: 'عادة بسبب ضيق الكاحلين أو ضعف الكوادريسبس. جرب وضع شيء تحت الكعبين، اعمل على مرونة الكاحل، وقوِّ الفخذين بالليج برس والإكستنشن.' },
      { question: 'البار يؤلم رقبتي/ظهري. ماذا أفعل؟', answer: 'اصنع رفاً بالترابس بضم لوحي الكتف معاً. استخدم وسادة للبار إذا لزم الأمر، أو جرب السكوات الأمامي بدلاً.' }
    ],
  },
  // Pull-Up - Standard
  'LA001': {
    descriptionEn: 'The pull-up is the gold standard for back development. It builds a wide, strong upper back and biceps using just your bodyweight. Mastering pull-ups demonstrates true relative strength.',
    descriptionAr: 'سحب العقلة هو المعيار الذهبي لتطوير الظهر. يبني ظهراً علوياً عريضاً وقوياً مع الباي باستخدام وزن جسمك فقط. إتقان سحب العقلة يظهر قوة نسبية حقيقية.',
    instructionsEn: [
      'Grab the bar with palms facing away, slightly wider than shoulder-width',
      'Hang with arms fully extended and shoulders engaged (not relaxed)',
      'Initiate the pull by driving your elbows down and back',
      'Pull until your chin clears the bar',
      'Focus on squeezing your back muscles, not just pulling with arms',
      'Lower yourself under control with arms fully extended at bottom',
      'Avoid swinging or kipping'
    ],
    instructionsAr: [
      'امسك البار مع الكفين للخارج، أوسع قليلاً من عرض الكتفين',
      'تعلق مع فرد الذراعين بالكامل والكتفين مشغولين (غير مسترخيين)',
      'ابدأ السحب بدفع مرفقيك للأسفل وللخلف',
      'اسحب حتى يتجاوز ذقنك البار',
      'ركز على ضغط عضلات ظهرك، ليس فقط السحب بالذراعين',
      'أنزل نفسك بتحكم مع فرد الذراعين بالكامل في الأسفل',
      'تجنب التأرجح'
    ],
    tipsEn: ['Lead with elbows not hands', 'Squeeze lats at top', 'Control the negative', 'Start with assisted if needed'],
    tipsAr: ['قُد بالمرفقين لا باليدين', 'اضغط اللاتس في القمة', 'تحكم في النزول', 'ابدأ بمساعدة إذا لزم الأمر'],
    faqsEn: [
      { question: 'My shoulders hurt during pull-ups. How do I fix this?', answer: 'Start each rep from a dead hang with shoulders engaged (pull shoulders down and back). Do not let shoulders rise to ears. Avoid going behind the neck.' },
      { question: 'I feel it more in my arms than my back. Why?', answer: 'You are pulling with your biceps instead of your back. Focus on driving elbows down and back, imagine pulling your chest to the bar, not chin over bar.' },
      { question: 'My elbow hurts after pull-ups. What causes this?', answer: 'Usually golfer\'s elbow from overuse or bad form. Reduce volume, warm up properly, and try neutral grip (palms facing each other). Avoid full lockout at bottom.' },
      { question: 'Is kipping bad for you?', answer: 'Kipping uses momentum and is a different exercise (CrossFit). For muscle building, strict pull-ups are better. Kipping can strain shoulders if done wrong.' },
      { question: 'How do I avoid calluses and blisters?', answer: 'Grip with fingers at the base (not middle of palm). Use chalk to reduce friction. File down calluses regularly before they tear.' }
    ],
    faqsAr: [
      { question: 'كتفي يؤلمني أثناء سحب العقلة. كيف أصلح هذا؟', answer: 'ابدأ كل تكرار من تعلق ميت مع الكتفين مشغولين (اسحب الكتفين للأسفل والخلف). لا تدع الكتفين يرتفعان للأذنين. تجنب الذهاب خلف الرقبة.' },
      { question: 'أشعر به في ذراعي أكثر من ظهري. لماذا؟', answer: 'أنت تسحب بالباي بدلاً من الظهر. ركز على دفع المرفقين للأسفل والخلف، تخيل سحب صدرك للبار، ليس الذقن فوق البار.' },
      { question: 'مرفقي يؤلمني بعد سحب العقلة. ما السبب؟', answer: 'عادة مرفق لاعب الجولف من الإفراط أو الأسلوب السيء. قلل الحجم، سخّن جيداً، وجرب قبضة محايدة (الكفين يواجهان بعضهما). تجنب القفل الكامل في الأسفل.' },
      { question: 'هل الكيبينج سيء لك؟', answer: 'الكيبينج يستخدم الزخم وهو تمرين مختلف (كروسفت). لبناء العضلات، سحب العقلة الصارم أفضل. الكيبينج يمكن أن يجهد الكتفين إذا أُدي خطأ.' },
      { question: 'كيف أتجنب مسامير اللحم والبثور؟', answer: 'امسك بالأصابع عند القاعدة (ليس منتصف الكف). استخدم الطباشير لتقليل الاحتكاك. ابرد مسامير اللحم بانتظام قبل أن تتمزق.' }
    ],
  },
  // Standing Overhead Press
  'BB013': {
    descriptionEn: 'The overhead press is the ultimate shoulder builder. It develops all three heads of the deltoids while also strengthening the triceps and core. It is a true test of upper body pressing strength.',
    descriptionAr: 'الضغط العلوي هو بناء الكتف المثالي. يطور رؤوس الدالتويد الثلاثة بينما يقوي أيضاً الترايسبس والجذع. هو اختبار حقيقي لقوة الضغط للجزء العلوي.',
    instructionsEn: [
      'Stand with feet shoulder-width apart',
      'Clean the bar to your shoulders or unrack from a rack at shoulder height',
      'Grip the bar just outside shoulder-width with elbows in front of bar',
      'Take a deep breath and brace your core',
      'Press the bar straight up, moving your head back slightly to clear chin',
      'Lock out overhead with arms fully extended',
      'Push your head through once bar passes face',
      'Lower with control to starting position'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الكتفين',
      'نظف البار لكتفيك أو ارفعه من الرف على ارتفاع الكتف',
      'امسك البار خارج عرض الكتفين مباشرة مع المرفقين أمام البار',
      'خذ نفساً عميقاً وشد جذعك',
      'ادفع البار للأعلى مباشرة، حرك رأسك للخلف قليلاً لتجاوز الذقن',
      'اقفل فوق الرأس مع فرد الذراعين بالكامل',
      'ادفع رأسك للأمام بمجرد تجاوز البار للوجه',
      'أنزل بتحكم لوضع البداية'
    ],
    tipsEn: ['Keep core tight throughout', 'Do not lean back excessively', 'Push head through at top', 'Squeeze glutes for stability'],
    tipsAr: ['أبقِ الجذع مشدوداً طوال التمرين', 'لا تميل للخلف بشكل مفرط', 'ادفع رأسك للأمام في القمة', 'اضغط المؤخرة للثبات'],
    faqsEn: [
      { question: 'I get shoulder pain when pressing overhead. What is wrong?', answer: 'Usually poor mobility or impingement. Keep elbows slightly in front, not flared. Try warming up with band pull-aparts. See a physio if pain persists.' },
      { question: 'My lower back hurts after overhead press. Why?', answer: 'You are leaning back too much to compensate for weak shoulders. Squeeze glutes hard, brace core, and use less weight with strict form.' },
      { question: 'How do I avoid hitting my chin with the bar?', answer: 'Move your head back slightly as the bar goes up, then push your head through once the bar passes your forehead. The bar should travel in a straight line.' },
      { question: 'One arm is weaker than the other. How do I fix this?', answer: 'Do extra sets of single-arm dumbbell press on the weak side. Let the weak side dictate the weight. The imbalance will correct over time.' },
      { question: 'Is behind-the-neck press safe?', answer: 'Not recommended for most people - it puts the shoulder in a vulnerable position. Stick to pressing in front of your head.' }
    ],
    faqsAr: [
      { question: 'أحصل على ألم كتف عند الضغط العلوي. ما الخطأ؟', answer: 'عادة مرونة سيئة أو انحشار. أبقِ المرفقين للأمام قليلاً، ليس منفتحين. جرب التسخين بسحب المطاط. راجع أخصائي علاج طبيعي إذا استمر الألم.' },
      { question: 'أسفل ظهري يؤلم بعد الضغط العلوي. لماذا؟', answer: 'أنت تميل للخلف كثيراً للتعويض عن كتفين ضعيفين. اضغط المؤخرة بقوة، شد الجذع، واستخدم وزناً أقل بأسلوب صارم.' },
      { question: 'كيف أتجنب ضرب ذقني بالبار؟', answer: 'حرك رأسك للخلف قليلاً عندما يصعد البار، ثم ادفع رأسك للأمام بمجرد تجاوز البار لجبهتك. يجب أن يتحرك البار في خط مستقيم.' },
      { question: 'ذراع أضعف من الأخرى. كيف أصلح هذا؟', answer: 'أدِّ مجموعات إضافية من ضغط الدمبل بذراع واحدة على الجانب الضعيف. دع الجانب الضعيف يحدد الوزن. الاختلال سيصحح مع الوقت.' },
      { question: 'هل الضغط خلف الرقبة آمن؟', answer: 'غير موصى به لمعظم الناس - يضع الكتف في وضع ضعيف. التزم بالضغط أمام رأسك.' }
    ],
  },
  // Standard Push-Up
  'BW001': {
    descriptionEn: 'The push-up is the fundamental bodyweight chest exercise that builds chest, shoulder, and tricep strength. No equipment needed, can be done anywhere, and has countless variations for all fitness levels.',
    descriptionAr: 'تمرين الضغط هو تمرين الصدر الأساسي بوزن الجسم الذي يبني قوة الصدر والكتف والترايسبس. لا يحتاج معدات، يمكن عمله في أي مكان، وله تنويعات لا حصر لها لجميع مستويات اللياقة.',
    instructionsEn: [
      'Start in a plank position with hands slightly wider than shoulder-width',
      'Keep your body in a perfectly straight line from head to heels',
      'Engage your core by pulling belly button toward spine',
      'Lower your body by bending elbows until chest nearly touches floor',
      'Keep elbows at about 45 degrees from your body',
      'Push back up to starting position by extending arms fully',
      'Breathe in on the way down, out on the way up'
    ],
    instructionsAr: [
      'ابدأ في وضع البلانك مع اليدين أوسع قليلاً من عرض الكتفين',
      'أبقِ جسمك في خط مستقيم تماماً من الرأس للكعبين',
      'شد جذعك بسحب سرتك نحو عمودك الفقري',
      'أنزل جسمك بثني المرفقين حتى يقترب صدرك من الأرض',
      'أبقِ المرفقين بحوالي 45 درجة من جسمك',
      'ادفع للأعلى لوضع البداية بفرد الذراعين بالكامل',
      'تنفس شهيق عند النزول، زفير عند الصعود'
    ],
    tipsEn: ['Do not let hips sag or pike up', 'Keep neck neutral', 'Full range of motion', 'Progress to harder variations'],
    tipsAr: ['لا تدع الوركين يتدلى أو يرتفع', 'أبقِ الرقبة محايدة', 'نطاق حركة كامل', 'تقدم لتنويعات أصعب'],
    faqsEn: [
      { question: 'My wrists hurt during push-ups. What should I do?', answer: 'Use push-up handles or make fists on the floor. Stretch wrists before and after. If pain continues, try incline push-ups to reduce wrist angle.' },
      { question: 'My shoulders pop or click during push-ups. Is this bad?', answer: 'Clicking without pain is often okay. But if there is pain, narrow your hand position, keep elbows closer to body (45 degrees), and strengthen rotator cuff.' },
      { question: 'Why does my lower back hurt during push-ups?', answer: 'Your core is weak or you are not engaging it. Squeeze glutes, tighten abs, and do not let hips sag. Practice planks to build core strength.' },
      { question: 'I feel it more in my arms than my chest. Why?', answer: 'Your hands are probably too narrow. Widen your grip. Also focus on squeezing your chest as you push up, not just straightening arms.' },
      { question: 'How do I avoid neck strain?', answer: 'Keep your head in line with your spine - do not look up or tuck chin. Pick a spot on the floor about a foot ahead of your hands and look at it.' }
    ],
    faqsAr: [
      { question: 'معصمي يؤلمني أثناء الضغط. ماذا أفعل؟', answer: 'استخدم مقابض الضغط أو اصنع قبضات على الأرض. مدد المعصمين قبل وبعد. إذا استمر الألم، جرب الضغط المائل لتقليل زاوية المعصم.' },
      { question: 'كتفي يطقطق أثناء الضغط. هل هذا سيء؟', answer: 'الطقطقة بدون ألم غالباً مقبولة. لكن إذا كان هناك ألم، ضيّق وضع يديك، أبقِ المرفقين أقرب للجسم (45 درجة)، وقوِّ الكفة المدورة.' },
      { question: 'لماذا يؤلمني أسفل ظهري أثناء الضغط؟', answer: 'جذعك ضعيف أو أنت لا تشغله. اضغط المؤخرة، شد البطن، ولا تدع الوركين يتدلى. مارس البلانك لبناء قوة الجذع.' },
      { question: 'أشعر به في ذراعي أكثر من صدري. لماذا؟', answer: 'يداك ربما ضيقتان جداً. وسّع قبضتك. أيضاً ركز على ضغط صدرك أثناء الدفع، ليس فقط فرد الذراعين.' },
      { question: 'كيف أتجنب إجهاد الرقبة؟', answer: 'أبقِ رأسك في خط مع عمودك الفقري - لا تنظر للأعلى أو تثني ذقنك. اختر نقطة على الأرض على بعد قدم أمام يديك وانظر إليها.' }
    ],
  },
  // Plank
  'BW039': {
    descriptionEn: 'The plank is the foundational core exercise that builds total core stability, endurance, and strength. It works the entire core including abs, obliques, and lower back.',
    descriptionAr: 'البلانك هو تمرين الجذع الأساسي الذي يبني ثبات وتحمل وقوة الجذع الكلي. يعمل على الجذع بالكامل شاملاً البطن والأوبليك وأسفل الظهر.',
    instructionsEn: [
      'Start face down with forearms on the floor, elbows under shoulders',
      'Push up so your body forms a straight line from head to heels',
      'Engage your core by pulling belly button toward spine',
      'Squeeze your glutes and keep legs straight',
      'Keep your neck neutral by looking at the floor',
      'Breathe steadily and hold the position',
      'Do not let your hips sag or pike up'
    ],
    instructionsAr: [
      'ابدأ بوجهك للأسفل مع الساعدين على الأرض، المرفقين تحت الكتفين',
      'ادفع للأعلى بحيث يشكل جسمك خطاً مستقيماً من الرأس للكعبين',
      'شد جذعك بسحب سرتك نحو عمودك الفقري',
      'اضغط مؤخرتك وأبقِ الساقين مستقيمتين',
      'أبقِ رقبتك محايدة بالنظر للأرض',
      'تنفس بثبات وحافظ على الوضع',
      'لا تدع وركيك يتدلى أو يرتفع'
    ],
    tipsEn: ['Imagine bracing for a punch', 'Keep breathing steadily', 'Progress by adding time', 'Try side planks for variation'],
    tipsAr: ['تخيل أنك تستعد لضربة', 'استمر بالتنفس بثبات', 'تقدم بإضافة وقت', 'جرب البلانك الجانبي للتنويع'],
    faqsEn: [
      { question: 'How long should I hold a plank?', answer: 'Start with 20-30 seconds with perfect form. Work up to 60 seconds, then add difficulty rather than time.' },
      { question: 'Why do my arms shake during planks?', answer: 'Shaking indicates muscle fatigue. This is normal and will improve with practice as you build strength.' },
      { question: 'Are planks better than crunches?', answer: 'Planks work the entire core as a unit and are safer for the spine. They build functional stability rather than just ab strength.' },
      { question: 'How do I make planks harder?', answer: 'Try extending arms, lifting a leg, adding a tap, or doing side planks. You can also add weight on your back.' },
      { question: 'Why does my lower back hurt during planks?', answer: 'Your hips are probably sagging. Engage your core more and squeeze your glutes. Reduce time if needed to maintain form.' }
    ],
    faqsAr: [
      { question: 'كم يجب أن أمسك البلانك؟', answer: 'ابدأ بـ 20-30 ثانية بأسلوب مثالي. اعمل للوصول إلى 60 ثانية، ثم أضف صعوبة بدلاً من الوقت.' },
      { question: 'لماذا ترتجف ذراعاي أثناء البلانك؟', answer: 'الارتجاف يشير لإرهاق العضلات. هذا طبيعي وسيتحسن مع الممارسة كلما بنيت قوة.' },
      { question: 'هل البلانك أفضل من الكرانش؟', answer: 'البلانك يعمل الجذع بالكامل كوحدة وأكثر أماناً للعمود الفقري. يبني ثباتاً وظيفياً بدلاً من قوة البطن فقط.' },
      { question: 'كيف أجعل البلانك أصعب؟', answer: 'جرب فرد الذراعين، رفع ساق، إضافة لمسة، أو عمل بلانك جانبي. يمكنك أيضاً إضافة وزن على ظهرك.' },
      { question: 'لماذا يؤلمني أسفل ظهري أثناء البلانك؟', answer: 'وركيك ربما يتدليان. شد جذعك أكثر واضغط مؤخرتك. قلل الوقت إذا لزم الأمر للحفاظ على الأسلوب.' }
    ],
  },
};

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📝 UPDATING EXERCISE CONTENT WITH FAQS              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  let updated = 0;
  let notFound = 0;

  for (const [externalId, data] of Object.entries(exerciseContent)) {
    try {
      const result = await prisma.exercise.updateMany({
        where: { externalId },
        data: {
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          instructionsEn: data.instructionsEn,
          instructionsAr: data.instructionsAr,
          tipsEn: data.tipsEn,
          tipsAr: data.tipsAr,
          faqsEn: data.faqsEn,
          faqsAr: data.faqsAr,
        },
      });

      if (result.count > 0) {
        console.log(`  ✅ Updated: ${externalId}`);
        updated++;
      } else {
        console.log(`  ⚠️ Not found: ${externalId}`);
        notFound++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error updating ${externalId}: ${error.message}`);
    }
  }

  // Practical injury-prevention FAQs by muscle group
  const muscleFaqs: Record<string, { faqsEn: { question: string; answer: string }[]; faqsAr: { question: string; answer: string }[] }> = {
    CHEST: {
      faqsEn: [
        { question: 'How do I protect my shoulders during chest exercises?', answer: 'Keep shoulder blades retracted and pinched together. Do not let elbows flare out past 45 degrees. Warm up with light weights and band pull-aparts.' },
        { question: 'I feel it more in my shoulders than my chest. What am I doing wrong?', answer: 'Your shoulders are taking over. Focus on squeezing your chest, keep elbows at 45 degrees not 90, and make sure shoulder blades stay back.' },
        { question: 'My wrists hurt during pressing movements. How do I fix this?', answer: 'Keep wrists straight, not bent back. The weight should stack over your forearm. Use wrist wraps for heavy lifts if needed.' },
      ],
      faqsAr: [
        { question: 'كيف أحمي كتفي أثناء تمارين الصدر؟', answer: 'أبقِ لوحي الكتف مسحوبين ومضمومين. لا تدع المرفقين يتفتحان أكثر من 45 درجة. سخّن بأوزان خفيفة.' },
        { question: 'أشعر به في كتفي أكثر من صدري. ماذا أفعل خطأ؟', answer: 'كتفاك تتولى الحمل. ركز على ضغط صدرك، أبقِ المرفقين بزاوية 45 درجة، وتأكد من بقاء لوحي الكتف للخلف.' },
        { question: 'معصمي يؤلمني أثناء الضغط. كيف أصلح هذا؟', answer: 'أبقِ المعصمين مستقيمين، ليس مثنيين للخلف. الوزن يجب أن يكون فوق ساعدك. استخدم رباط المعصم للأوزان الثقيلة.' },
      ],
    },
    BACK: {
      faqsEn: [
        { question: 'How do I avoid lower back injury?', answer: 'Never round your lower back. Brace your core, keep chest up, and if your form breaks, the weight is too heavy. Use a belt for heavy lifts.' },
        { question: 'I feel it in my arms more than my back. Why?', answer: 'You are pulling with biceps instead of back. Focus on driving elbows back, squeeze shoulder blades together, and think about pulling with your elbows not hands.' },
        { question: 'My grip gives out before my back is tired. What should I do?', answer: 'Use lifting straps or mixed grip. Train grip separately with farmer walks and dead hangs. Do not let grip limit your back development.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب إصابة أسفل الظهر؟', answer: 'لا تقوّس أسفل ظهرك أبداً. شد جذعك، ارفع صدرك، وإذا انهار أسلوبك فالوزن ثقيل جداً. استخدم حزاماً للأوزان الثقيلة.' },
        { question: 'أشعر به في ذراعي أكثر من ظهري. لماذا؟', answer: 'أنت تسحب بالباي بدلاً من الظهر. ركز على دفع المرفقين للخلف، اضغط لوحي الكتف معاً، وفكر في السحب بمرفقيك لا يديك.' },
        { question: 'قبضتي تضعف قبل أن يتعب ظهري. ماذا أفعل؟', answer: 'استخدم أحزمة الرفع أو قبضة مختلطة. درّب القبضة بشكل منفصل. لا تدع القبضة تحد من تطور ظهرك.' },
      ],
    },
    SHOULDERS: {
      faqsEn: [
        { question: 'How do I avoid shoulder impingement?', answer: 'Warm up rotator cuff with band exercises. Avoid behind-the-neck movements. Keep elbows slightly in front, not directly to sides. Stop if you feel pinching.' },
        { question: 'One shoulder is weaker than the other. How do I fix this?', answer: 'Do extra unilateral work on the weak side. Let the weak side set the weight. The imbalance will correct over time with consistent work.' },
        { question: 'My neck hurts after shoulder exercises. Why?', answer: 'You are shrugging or tensing neck muscles. Keep shoulders down and away from ears. Focus on the target muscle, not lifting with traps.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب انحشار الكتف؟', answer: 'سخّن الكفة المدورة بتمارين المطاط. تجنب الحركات خلف الرقبة. أبقِ المرفقين للأمام قليلاً. توقف إذا شعرت بقرصة.' },
        { question: 'كتف أضعف من الآخر. كيف أصلح هذا؟', answer: 'أدِّ عملاً إضافياً بذراع واحدة على الجانب الضعيف. دع الجانب الضعيف يحدد الوزن. الاختلال سيصحح مع الوقت.' },
        { question: 'رقبتي تؤلمني بعد تمارين الكتف. لماذا؟', answer: 'أنت ترفع الكتفين أو تشد عضلات الرقبة. أبقِ الكتفين للأسفل بعيداً عن الأذنين. ركز على العضلة المستهدفة.' },
      ],
    },
    BICEPS: {
      faqsEn: [
        { question: 'How do I avoid elbow pain during curls?', answer: 'Do not fully lock out elbows at the bottom. Avoid swinging or using momentum. Warm up with light weights first and stretch forearms after.' },
        { question: 'I feel more forearm than bicep when curling. What is wrong?', answer: 'Your grip is too tight or wrists are bending. Relax grip slightly, keep wrists neutral, and focus on squeezing the bicep at the top.' },
        { question: 'My biceps are not growing. What should I change?', answer: 'Slow down the negative portion. Use full range of motion. Focus on mind-muscle connection and squeeze at the top of each rep.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب ألم المرفق أثناء الكيرل؟', answer: 'لا تقفل المرفقين بالكامل في الأسفل. تجنب التأرجح أو استخدام الزخم. سخّن بأوزان خفيفة أولاً.' },
        { question: 'أشعر بالساعد أكثر من الباي عند الكيرل. ما الخطأ؟', answer: 'قبضتك ضيقة جداً أو المعصمين يثنيان. أرخِ القبضة قليلاً، أبقِ المعصمين محايدين، واضغط الباي في القمة.' },
        { question: 'باي لا ينمو. ماذا أغير؟', answer: 'أبطئ الجزء السلبي. استخدم نطاق حركة كامل. ركز على اتصال العقل-العضلة واضغط في قمة كل تكرار.' },
      ],
    },
    TRICEPS: {
      faqsEn: [
        { question: 'How do I protect my elbows during tricep exercises?', answer: 'Warm up thoroughly. Avoid locking out explosively. Keep elbows tucked and stable. If you feel pain, reduce weight and check form.' },
        { question: 'I feel it in my shoulders instead of triceps. How do I fix this?', answer: 'Keep elbows pinned in place. Do not let them flare out. Focus on only moving at the elbow joint, not the shoulder.' },
        { question: 'Skull crushers hurt my elbows. What should I do?', answer: 'Try lowering the bar to behind your head instead of forehead. Use EZ bar to reduce wrist strain. Or switch to cable pushdowns.' },
      ],
      faqsAr: [
        { question: 'كيف أحمي مرفقي أثناء تمارين الترايسبس؟', answer: 'سخّن جيداً. تجنب القفل بشكل انفجاري. أبقِ المرفقين مثبتين ومستقرين. إذا شعرت بألم، قلل الوزن وراجع الأسلوب.' },
        { question: 'أشعر به في كتفي بدلاً من الترايسبس. كيف أصلح هذا؟', answer: 'أبقِ المرفقين مثبتين في مكانهما. لا تدعهما يتفتحان. ركز على الحركة فقط من مفصل المرفق لا الكتف.' },
        { question: 'سكل كراشر يؤلم مرفقي. ماذا أفعل؟', answer: 'جرب إنزال البار خلف رأسك بدلاً من الجبهة. استخدم بار EZ لتقليل إجهاد المعصم. أو انتقل لدفع الكيبل.' },
      ],
    },
    QUADRICEPS: {
      faqsEn: [
        { question: 'My knees hurt during leg exercises. What should I check?', answer: 'Ensure knees track over toes, not caving in. Check ankle mobility. Reduce depth if needed. Warm up thoroughly and consider knee sleeves.' },
        { question: 'How do I prevent knee caving?', answer: 'Push knees out over pinky toe throughout the movement. Strengthen glutes. Use resistance bands around knees during warm-up to build awareness.' },
        { question: 'I feel it in my lower back instead of legs. Why?', answer: 'Your core is not braced properly or you are leaning too far forward. Keep chest up, brace core hard, and consider heel elevation.' },
      ],
      faqsAr: [
        { question: 'ركبتي تؤلمني أثناء تمارين الأرجل. ماذا أراجع؟', answer: 'تأكد أن الركبتين تتبعان أصابع القدم، ليس منهارتين للداخل. راجع مرونة الكاحل. قلل العمق إذا لزم. سخّن جيداً.' },
        { question: 'كيف أمنع انهيار الركبة؟', answer: 'ادفع الركبتين للخارج فوق إصبع القدم الصغير طوال الحركة. قوِّ المؤخرة. استخدم مطاط حول الركبتين أثناء التسخين.' },
        { question: 'أشعر به في أسفل ظهري بدلاً من أرجلي. لماذا؟', answer: 'جذعك غير مشدود جيداً أو تميل للأمام كثيراً. أبقِ صدرك مرفوعاً، شد الجذع بقوة، وفكر في رفع الكعبين.' },
      ],
    },
    HAMSTRINGS: {
      faqsEn: [
        { question: 'How do I avoid hamstring strains?', answer: 'Always warm up with light cardio and dynamic stretches. Do not bounce at the bottom of stretches. Progress weight slowly and stop if you feel sharp pain.' },
        { question: 'I feel it in my lower back instead of hamstrings. What is wrong?', answer: 'You are rounding your lower back. Keep back flat, push hips back, and feel the stretch in your hamstrings not lower back.' },
        { question: 'My hamstrings cramp during exercises. How do I prevent this?', answer: 'Stay hydrated, ensure adequate electrolytes. Strengthen hamstrings gradually. Stretch after workouts. Cramps often indicate the muscle is weak.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب شد الهامسترينج؟', answer: 'سخّن دائماً بكارديو خفيف وإطالات ديناميكية. لا ترتد في أسفل الإطالات. تقدم بالوزن ببطء وتوقف إذا شعرت بألم حاد.' },
        { question: 'أشعر به في أسفل ظهري بدلاً من الهامسترينج. ما الخطأ؟', answer: 'أنت تقوّس أسفل ظهرك. أبقِ الظهر مسطحاً، ادفع الوركين للخلف، واشعر بالإطالة في الهامسترينج لا أسفل الظهر.' },
        { question: 'الهامسترينج يتشنج أثناء التمارين. كيف أمنع هذا؟', answer: 'ابقَ رطباً، تأكد من كفاية الإلكتروليتات. قوِّ الهامسترينج تدريجياً. مدد بعد التمارين. التشنجات غالباً تشير لضعف العضلة.' },
      ],
    },
    GLUTES: {
      faqsEn: [
        { question: 'I do not feel my glutes working. How do I activate them?', answer: 'Do glute activation exercises before your workout like glute bridges and clamshells. Squeeze glutes hard at the top of each rep. Mind-muscle connection is key.' },
        { question: 'My lower back hurts during glute exercises. Why?', answer: 'Your lower back is compensating for weak glutes. Reduce weight, focus on squeezing glutes not arching back. Strengthen core alongside glutes.' },
        { question: 'How do I prevent hip flexor tightness from glute work?', answer: 'Stretch hip flexors after glute exercises. Ensure full hip extension at the top of movements. Balance pushing exercises with hip flexor stretches.' },
      ],
      faqsAr: [
        { question: 'لا أشعر بالمؤخرة تعمل. كيف أنشطها؟', answer: 'أدِّ تمارين تنشيط المؤخرة قبل تمرينك مثل جسر المؤخرة. اضغط المؤخرة بقوة في قمة كل تكرار. اتصال العقل-العضلة مفتاح.' },
        { question: 'أسفل ظهري يؤلم أثناء تمارين المؤخرة. لماذا؟', answer: 'أسفل ظهرك يعوض عن ضعف المؤخرة. قلل الوزن، ركز على ضغط المؤخرة لا تقويس الظهر. قوِّ الجذع مع المؤخرة.' },
        { question: 'كيف أمنع ضيق ثني الورك من تمارين المؤخرة؟', answer: 'مدد ثني الورك بعد تمارين المؤخرة. تأكد من فرد الورك الكامل في قمة الحركات. وازن تمارين الدفع بإطالات ثني الورك.' },
      ],
    },
    CALVES: {
      faqsEn: [
        { question: 'How do I avoid Achilles tendon injury?', answer: 'Warm up calves with light raises first. Do not bounce at the bottom. Progress weight slowly. Stop if you feel sharp pain in the tendon.' },
        { question: 'My calves cramp during exercises. What should I do?', answer: 'Stay hydrated and ensure adequate potassium and magnesium. Stretch calves before and after. Start with lighter weight and build up.' },
        { question: 'I only feel it in one part of my calf. How do I target the whole muscle?', answer: 'Vary foot position - toes straight, pointed in, and pointed out. Do both seated (soleus) and standing (gastrocnemius) calf raises.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب إصابة وتر أخيل؟', answer: 'سخّن السمانة برفعات خفيفة أولاً. لا ترتد في الأسفل. تقدم بالوزن ببطء. توقف إذا شعرت بألم حاد في الوتر.' },
        { question: 'سمانتي تتشنج أثناء التمارين. ماذا أفعل؟', answer: 'ابقَ رطباً وتأكد من كفاية البوتاسيوم والمغنيسيوم. مدد السمانة قبل وبعد. ابدأ بوزن أخف وابنِ تدريجياً.' },
        { question: 'أشعر به في جزء واحد فقط من سمانتي. كيف أستهدف العضلة كلها؟', answer: 'نوّع وضع القدم - أصابع مستقيمة، للداخل، وللخارج. أدِّ رفعات جالس (سوليوس) وواقف (جاستروكنيميوس).' },
      ],
    },
    ABS: {
      faqsEn: [
        { question: 'My lower back hurts during ab exercises. What is wrong?', answer: 'Your lower back is taking over because abs are weak. Keep lower back pressed into floor. Reduce difficulty until you can maintain proper form.' },
        { question: 'My neck hurts during crunches. How do I fix this?', answer: 'Do not pull on your head. Keep chin tucked and look at ceiling. Support head lightly with hands or cross arms over chest instead.' },
        { question: 'How do I avoid hip flexor strain during ab work?', answer: 'Focus on using abs, not hip flexors. Keep lower back flat. If hip flexors burn, the exercise is too advanced - regress to an easier version.' },
      ],
      faqsAr: [
        { question: 'أسفل ظهري يؤلم أثناء تمارين البطن. ما الخطأ؟', answer: 'أسفل ظهرك يتولى الحمل لأن البطن ضعيفة. أبقِ أسفل الظهر مضغوطاً على الأرض. قلل الصعوبة حتى تحافظ على أسلوب صحيح.' },
        { question: 'رقبتي تؤلم أثناء الكرانش. كيف أصلح هذا؟', answer: 'لا تسحب رأسك. أبقِ الذقن مطوياً وانظر للسقف. ادعم الرأس بخفة باليدين أو ضع الذراعين على صدرك بدلاً.' },
        { question: 'كيف أتجنب شد ثني الورك أثناء تمارين البطن؟', answer: 'ركز على استخدام البطن، ليس ثني الورك. أبقِ أسفل الظهر مسطحاً. إذا احترق ثني الورك، التمرين متقدم جداً.' },
      ],
    },
    OBLIQUES: {
      faqsEn: [
        { question: 'How do I target obliques without bulking my waist?', answer: 'Use moderate weight and higher reps. Focus on twisting movements with control. Avoid heavy weighted side bends which can thicken the waist.' },
        { question: 'My lower back hurts during side exercises. Why?', answer: 'You are likely bending at the spine instead of rotating. Keep spine neutral and twist from the core. Reduce range of motion if needed.' },
        { question: 'I only feel one side working. How do I fix this?', answer: 'One side is likely stronger. Do extra reps on the weak side. Focus on equal contraction and use unilateral exercises.' },
      ],
      faqsAr: [
        { question: 'كيف أستهدف الأوبليك دون تضخيم الخصر؟', answer: 'استخدم وزناً معتدلاً وتكرارات أعلى. ركز على حركات الدوران بتحكم. تجنب الانحناءات الجانبية الثقيلة التي يمكن أن تثخّن الخصر.' },
        { question: 'أسفل ظهري يؤلم أثناء التمارين الجانبية. لماذا؟', answer: 'أنت على الأرجح تنحني من العمود الفقري بدلاً من الدوران. أبقِ العمود الفقري محايداً وادر من الجذع. قلل نطاق الحركة إذا لزم.' },
        { question: 'أشعر بجانب واحد فقط يعمل. كيف أصلح هذا؟', answer: 'جانب واحد على الأرجح أقوى. أدِّ تكرارات إضافية على الجانب الضعيف. ركز على انقباض متساوٍ واستخدم تمارين أحادية الجانب.' },
      ],
    },
    LOWER_BACK: {
      faqsEn: [
        { question: 'How do I strengthen my lower back without injury?', answer: 'Start with bodyweight exercises like bird dogs and supermans. Progress slowly and never round your back under load. Stop if you feel sharp pain.' },
        { question: 'My lower back hurts during these exercises. What should I do?', answer: 'Pain means something is wrong. Check your form, reduce intensity, and consider seeing a physio. Never push through lower back pain.' },
        { question: 'How often should I train lower back?', answer: 'Lower back gets worked in many exercises. Direct training 1-2 times per week is enough. Focus on endurance over strength.' },
      ],
      faqsAr: [
        { question: 'كيف أقوّي أسفل ظهري بدون إصابة؟', answer: 'ابدأ بتمارين وزن الجسم مثل كلب الطائر وسوبرمان. تقدم ببطء ولا تقوّس ظهرك أبداً تحت الحمل. توقف إذا شعرت بألم حاد.' },
        { question: 'أسفل ظهري يؤلم أثناء هذه التمارين. ماذا أفعل؟', answer: 'الألم يعني شيء خاطئ. راجع أسلوبك، قلل الشدة، وفكر في رؤية أخصائي علاج طبيعي. لا تدفع أبداً من خلال ألم أسفل الظهر.' },
        { question: 'كم مرة يجب أن أدرّب أسفل الظهر؟', answer: 'أسفل الظهر يُمرّن في تمارين كثيرة. التدريب المباشر 1-2 مرة أسبوعياً كافٍ. ركز على التحمل أكثر من القوة.' },
      ],
    },
    FOREARMS: {
      faqsEn: [
        { question: 'How do I avoid wrist pain during forearm exercises?', answer: 'Warm up wrists with circles and stretches. Use full range of motion but do not hyperextend. Start light and progress gradually.' },
        { question: 'My grip gives out quickly. How do I build endurance?', answer: 'Train grip specifically with dead hangs, farmer walks, and wrist curls. Consistency is key - train grip 2-3 times per week.' },
        { question: 'I feel elbow pain during forearm work. What should I check?', answer: 'You may be gripping too tight or using too much weight. Ensure elbows are stable. Consider if you have golfer\'s or tennis elbow.' },
      ],
      faqsAr: [
        { question: 'كيف أتجنب ألم المعصم أثناء تمارين الساعد؟', answer: 'سخّن المعصمين بدوائر وإطالات. استخدم نطاق حركة كامل لكن لا تفرط في الفرد. ابدأ خفيفاً وتقدم تدريجياً.' },
        { question: 'قبضتي تضعف بسرعة. كيف أبني التحمل؟', answer: 'درّب القبضة بشكل خاص بالتعلق، مشي الفارمر، وثني المعصم. الاستمرارية مفتاح - درّب القبضة 2-3 مرات أسبوعياً.' },
        { question: 'أشعر بألم مرفق أثناء تمارين الساعد. ماذا أراجع؟', answer: 'قد تقبض بقوة مفرطة أو تستخدم وزناً زائداً. تأكد أن المرفقين مستقرين. فكر إذا كان لديك مرفق لاعب الجولف أو التنس.' },
      ],
    },
  };

  // Default FAQs for muscles not in the list
  const defaultFaqs = {
    faqsEn: [
      { question: 'How do I avoid injury during this exercise?', answer: 'Warm up properly, use controlled movements, and start with lighter weight to master form. Stop if you feel sharp pain.' },
      { question: 'I feel pain during this exercise. What should I do?', answer: 'Stop immediately if you feel sharp pain. Check your form, reduce weight, and consult a professional if pain persists.' },
      { question: 'How do I know if I am using the correct form?', answer: 'The target muscle should feel the most work. No joint pain. Movement is controlled, not jerky. Consider recording yourself or asking someone to check.' },
    ],
    faqsAr: [
      { question: 'كيف أتجنب الإصابة أثناء هذا التمرين؟', answer: 'سخّن جيداً، استخدم حركات متحكم بها، وابدأ بوزن أخف لإتقان الأسلوب. توقف إذا شعرت بألم حاد.' },
      { question: 'أشعر بألم أثناء هذا التمرين. ماذا أفعل؟', answer: 'توقف فوراً إذا شعرت بألم حاد. راجع أسلوبك، قلل الوزن، واستشر متخصصاً إذا استمر الألم.' },
      { question: 'كيف أعرف إذا كنت أستخدم الأسلوب الصحيح؟', answer: 'العضلة المستهدفة يجب أن تشعر بمعظم العمل. لا ألم مفاصل. الحركة متحكم بها، ليست متقطعة. فكر في تصوير نفسك أو اطلب من شخص التحقق.' },
    ],
  };

  // Basic instructions by movement type
  const getBasicInstructions = (name: string, muscle: string, equipment: string[]): { en: string[]; ar: string[] } => {
    const equip = equipment.length > 0 ? equipment[0] : 'BODYWEIGHT';

    return {
      en: [
        'Set up with proper posture and brace your core',
        'Begin the movement with control, focusing on the target muscle',
        'Move through the full range of motion without using momentum',
        'Squeeze the target muscle at the point of peak contraction',
        'Return to the starting position with control',
        'Breathe out during the exertion phase, in during the return',
      ],
      ar: [
        'اتخذ وضعية صحيحة وشد جذعك',
        'ابدأ الحركة بتحكم، مركزاً على العضلة المستهدفة',
        'تحرك خلال نطاق الحركة الكامل بدون استخدام الزخم',
        'اضغط العضلة المستهدفة في نقطة الانقباض الأقصى',
        'عد لوضع البداية بتحكم',
        'تنفس زفير أثناء مرحلة الجهد، شهيق أثناء العودة',
      ],
    };
  };

  // Update ALL exercises with proper FAQs using batch updates by muscle group
  const detailedExerciseIds = Object.keys(exerciseContent);

  console.log(`\n📊 Updating exercises with practical FAQs by muscle group...`);

  let updatedCount = 0;

  // Update by muscle group using updateMany for better performance
  for (const [muscle, faqs] of Object.entries(muscleFaqs)) {
    const result = await prisma.exercise.updateMany({
      where: {
        primaryMuscle: muscle as any,
        externalId: { notIn: detailedExerciseIds },
      },
      data: {
        faqsEn: faqs.faqsEn,
        faqsAr: faqs.faqsAr,
      },
    });
    console.log(`  ✅ ${muscle}: ${result.count} exercises`);
    updatedCount += result.count;
  }

  // Update remaining exercises with default FAQs
  const remainingResult = await prisma.exercise.updateMany({
    where: {
      primaryMuscle: { notIn: Object.keys(muscleFaqs) as any[] },
      externalId: { notIn: detailedExerciseIds },
    },
    data: {
      faqsEn: defaultFaqs.faqsEn,
      faqsAr: defaultFaqs.faqsAr,
    },
  });
  console.log(`  ✅ Other muscles: ${remainingResult.count} exercises`);
  updatedCount += remainingResult.count;

  // Update exercises without instructions
  const basicInstructions = getBasicInstructions('', '', []);
  const instructionResult = await prisma.exercise.updateMany({
    where: {
      instructionsEn: { isEmpty: true },
      externalId: { notIn: detailedExerciseIds },
    },
    data: {
      instructionsEn: basicInstructions.en,
      instructionsAr: basicInstructions.ar,
    },
  });
  console.log(`  ✅ Added instructions to ${instructionResult.count} exercises`);

  const totalExercises = await prisma.exercise.count();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Updated ${updated} exercises with detailed content (7 key exercises)`);
  console.log(`📝 Updated ${updatedCount} exercises with injury-prevention FAQs`);
  console.log(`⚠️ ${notFound} exercises not found`);
  console.log(`📊 Total exercises in database: ${totalExercises}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
