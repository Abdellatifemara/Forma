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
  'chest-bench-press': {
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
      { question: 'What is the correct grip width?', answer: 'Grip the bar about 1.5 times shoulder-width apart. Your forearms should be vertical at the bottom of the movement.' },
      { question: 'How deep should I lower the bar?', answer: 'Lower the bar until it touches your mid-chest, just below your nipple line. Full range of motion is key for muscle development.' },
      { question: 'Should I arch my back?', answer: 'A slight natural arch in your lower back is fine and helps with stability. Avoid excessive arching which can strain your back.' },
      { question: 'What if I cannot lift the weight?', answer: 'Always use a spotter when bench pressing heavy weights. You can also use safety pins in a power rack.' },
      { question: 'How often should I bench press?', answer: 'Most people benefit from bench pressing 2-3 times per week, allowing at least 48 hours between sessions for recovery.' }
    ],
    faqsAr: [
      { question: 'ما هو عرض القبضة الصحيح؟', answer: 'امسك البار بحوالي 1.5 ضعف عرض الكتفين. يجب أن تكون ساعديك عمودية في أسفل الحركة.' },
      { question: 'إلى أي عمق يجب أن أنزل البار؟', answer: 'أنزل البار حتى يلمس منتصف صدرك، أسفل خط الحلمة. النطاق الكامل للحركة مهم لنمو العضلات.' },
      { question: 'هل يجب أن أقوّس ظهري؟', answer: 'تقوس طبيعي خفيف في أسفل ظهرك مقبول ويساعد في الثبات. تجنب التقوس المفرط الذي يمكن أن يضر ظهرك.' },
      { question: 'ماذا لو لم أستطع رفع الوزن؟', answer: 'استخدم دائماً مساعداً عند رفع أوزان ثقيلة. يمكنك أيضاً استخدام قضبان الأمان في رف القوة.' },
      { question: 'كم مرة يجب أن أمارس ضغط البنش؟', answer: 'معظم الناس يستفيدون من ممارسة ضغط البنش 2-3 مرات أسبوعياً، مع 48 ساعة على الأقل بين الجلسات للتعافي.' }
    ],
  },
  'back-deadlift': {
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
      { question: 'Is deadlift bad for your back?', answer: 'No, when performed correctly, deadlifts strengthen your back. The key is maintaining a neutral spine throughout the lift.' },
      { question: 'Should I use a belt?', answer: 'A belt can help with heavy lifts by providing something to brace against. Learn to brace properly without a belt first.' },
      { question: 'What grip should I use?', answer: 'Start with double overhand grip. Switch to mixed grip or use straps when grip becomes limiting.' },
      { question: 'How do I avoid rounding my back?', answer: 'Focus on pushing your chest up, engaging your lats, and keeping your core tight. If you cannot maintain position, reduce the weight.' },
      { question: 'Can I do deadlifts with back pain?', answer: 'Consult a doctor first. Often, proper deadlifts can help strengthen a weak back, but start very light and focus on form.' }
    ],
    faqsAr: [
      { question: 'هل رفعة الميتة سيئة للظهر؟', answer: 'لا، عند أدائها بشكل صحيح، رفعات الميتة تقوي ظهرك. المفتاح هو الحفاظ على عمود فقري محايد طوال الرفع.' },
      { question: 'هل يجب أن أستخدم حزاماً؟', answer: 'الحزام يمكن أن يساعد في الرفعات الثقيلة بتوفير شيء للتثبيت ضده. تعلم التثبيت بشكل صحيح بدون حزام أولاً.' },
      { question: 'أي قبضة يجب أن أستخدم؟', answer: 'ابدأ بقبضة علوية مزدوجة. انتقل لقبضة مختلطة أو استخدم أحزمة عندما تصبح القبضة محدودة.' },
      { question: 'كيف أتجنب تقوس ظهري؟', answer: 'ركز على دفع صدرك للأعلى، إشراك اللاتس، وإبقاء جذعك مشدوداً. إذا لم تستطع الحفاظ على الوضع، قلل الوزن.' },
      { question: 'هل يمكنني ممارسة رفعة الميتة مع آلام الظهر؟', answer: 'استشر طبيباً أولاً. غالباً، رفعات الميتة الصحيحة يمكن أن تساعد في تقوية ظهر ضعيف، لكن ابدأ بأوزان خفيفة جداً وركز على الأسلوب.' }
    ],
  },
  'legs-squat': {
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
      { question: 'How deep should I squat?', answer: 'Ideally, squat until your hip crease goes below your knee (below parallel). This ensures full quad and glute activation.' },
      { question: 'Are squats bad for your knees?', answer: 'No, properly performed squats actually strengthen the muscles around your knees. Pain usually indicates a form issue.' },
      { question: 'Should I use weightlifting shoes?', answer: 'Shoes with a raised heel can help if you have limited ankle mobility. They help keep your torso more upright.' },
      { question: 'What is butt wink and how do I fix it?', answer: 'Butt wink is when your pelvis tucks under at the bottom. Work on hip mobility and only squat as deep as you can maintain a neutral spine.' },
      { question: 'High bar or low bar squat?', answer: 'High bar is more quad-dominant and upright. Low bar allows more weight and hits glutes/hamstrings more. Both are valid.' }
    ],
    faqsAr: [
      { question: 'إلى أي عمق يجب أن أنزل في السكوات؟', answer: 'من الأفضل النزول حتى تصبح ثنية الورك أسفل الركبة (تحت التوازي). هذا يضمن تفعيل كامل للفخذ والمؤخرة.' },
      { question: 'هل السكوات سيء للركبتين؟', answer: 'لا، السكوات المؤدى بشكل صحيح يقوي العضلات حول ركبتيك. الألم عادة يشير لمشكلة في الأسلوب.' },
      { question: 'هل يجب أن أستخدم أحذية رفع الأثقال؟', answer: 'الأحذية ذات الكعب المرتفع يمكن أن تساعد إذا كان لديك مرونة كاحل محدودة. تساعد في إبقاء جذعك أكثر استقامة.' },
      { question: 'ما هو butt wink وكيف أصلحه؟', answer: 'هو عندما يلتف حوضك للأسفل في القاع. اعمل على مرونة الورك وانزل فقط بالعمق الذي يمكنك فيه الحفاظ على عمود فقري محايد.' },
      { question: 'سكوات عالي أم منخفض؟', answer: 'العالي أكثر هيمنة للفخذ ومنتصب. المنخفض يسمح بوزن أكبر ويستهدف المؤخرة/الهامسترينج أكثر. كلاهما صالح.' }
    ],
  },
  'back-pullup': {
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
      { question: 'I cannot do a pull-up. Where do I start?', answer: 'Start with assisted pull-ups using a band or machine, negative pull-ups (jump up and lower slowly), or inverted rows.' },
      { question: 'What is the difference between pull-up and chin-up?', answer: 'Pull-ups use an overhand (palms away) grip targeting more back. Chin-ups use underhand (palms toward you) grip hitting biceps more.' },
      { question: 'How do I increase my pull-up numbers?', answer: 'Practice frequently (greasing the groove), add weight progressively, and work on negative reps. Lose body fat if needed.' },
      { question: 'Is wide grip better than narrow?', answer: 'Wide grip emphasizes lats and back width. Narrow grip allows more bicep involvement. Use both for complete development.' },
      { question: 'Should I go all the way down?', answer: 'Yes, full range of motion is important. Extend arms completely at bottom, but keep shoulders engaged (not completely relaxed).' }
    ],
    faqsAr: [
      { question: 'لا أستطيع عمل سحب عقلة. من أين أبدأ؟', answer: 'ابدأ بسحب العقلة بمساعدة باستخدام حزام أو جهاز، سحب سلبي (اقفز للأعلى وانزل ببطء)، أو تجديف معكوس.' },
      { question: 'ما الفرق بين سحب العقلة وتشين أب؟', answer: 'سحب العقلة يستخدم قبضة علوية (الكفين بعيداً) يستهدف الظهر أكثر. تشين أب يستخدم قبضة سفلية (الكفين نحوك) يضرب الباي أكثر.' },
      { question: 'كيف أزيد عدد سحبات العقلة؟', answer: 'تدرب بشكل متكرر، أضف وزناً تدريجياً، واعمل على التكرارات السلبية. اخسر دهون الجسم إذا لزم الأمر.' },
      { question: 'هل القبضة العريضة أفضل من الضيقة؟', answer: 'القبضة العريضة تؤكد على اللاتس وعرض الظهر. القبضة الضيقة تسمح بمشاركة أكثر للباي. استخدم كلاهما لتطوير كامل.' },
      { question: 'هل يجب أن أنزل بالكامل؟', answer: 'نعم، النطاق الكامل للحركة مهم. افرد ذراعيك بالكامل في الأسفل، لكن أبقِ الكتفين مشغولين (غير مسترخيين تماماً).' }
    ],
  },
  'shoulders-overhead-press': {
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
      { question: 'Standing or seated overhead press?', answer: 'Standing requires more core stability and is more functional. Seated isolates shoulders more but limits weight due to less leg drive.' },
      { question: 'Why is my overhead press so weak?', answer: 'Overhead pressing uses smaller muscles than bench press. It is normal for it to be about 60-70% of your bench press.' },
      { question: 'Is overhead press bad for shoulders?', answer: 'No, when done correctly it actually strengthens the shoulder joint. Avoid extreme flaring of elbows and maintain proper form.' },
      { question: 'Should I use a barbell or dumbbells?', answer: 'Barbell allows more weight. Dumbbells require more stabilization and can help fix imbalances. Use both for complete development.' },
      { question: 'How do I avoid lower back pain?', answer: 'Keep your core braced, squeeze your glutes, and avoid excessive backward lean. Do not use momentum or heaving.' }
    ],
    faqsAr: [
      { question: 'ضغط علوي واقف أم جالس؟', answer: 'الواقف يتطلب ثبات جذع أكثر وأكثر وظيفية. الجالس يعزل الكتفين أكثر لكن يحد الوزن بسبب قلة دفع الساقين.' },
      { question: 'لماذا الضغط العلوي ضعيف جداً؟', answer: 'الضغط العلوي يستخدم عضلات أصغر من ضغط البنش. من الطبيعي أن يكون حوالي 60-70% من ضغط البنش.' },
      { question: 'هل الضغط العلوي سيء للكتفين؟', answer: 'لا، عند أدائه بشكل صحيح يقوي مفصل الكتف فعلياً. تجنب فتح المرفقين المفرط وحافظ على الأسلوب الصحيح.' },
      { question: 'هل أستخدم بار أم دمبلز؟', answer: 'البار يسمح بوزن أكثر. الدمبلز تتطلب تثبيتاً أكثر ويمكن أن تساعد في إصلاح الاختلالات. استخدم كلاهما لتطوير كامل.' },
      { question: 'كيف أتجنب آلام أسفل الظهر؟', answer: 'أبقِ جذعك مشدوداً، اضغط مؤخرتك، وتجنب الميل للخلف المفرط. لا تستخدم الزخم أو الرفع بقوة.' }
    ],
  },
  'chest-pushup': {
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
      { question: 'How many push-ups should I do?', answer: 'Start with as many as you can with good form. Work up to 3 sets of 15-20. Then progress to harder variations.' },
      { question: 'I cannot do a push-up. Where do I start?', answer: 'Start with incline push-ups (hands on a bench or wall), then progress to knee push-ups, then full push-ups.' },
      { question: 'What muscles do push-ups work?', answer: 'Primarily chest, front shoulders, and triceps. Also works core for stabilization.' },
      { question: 'How do I make push-ups harder?', answer: 'Try decline push-ups, diamond push-ups, archer push-ups, one-arm push-ups, or add a weight vest.' },
      { question: 'Is it bad to do push-ups every day?', answer: 'It is okay if you are not going to failure. For muscle growth, allow 48 hours recovery between intense sessions.' }
    ],
    faqsAr: [
      { question: 'كم عدد تمارين الضغط التي يجب أن أفعلها؟', answer: 'ابدأ بأكبر عدد يمكنك بأسلوب جيد. اعمل للوصول إلى 3 مجموعات من 15-20. ثم تقدم لتنويعات أصعب.' },
      { question: 'لا أستطيع عمل ضغطة. من أين أبدأ؟', answer: 'ابدأ بالضغط المائل (اليدين على بنش أو حائط)، ثم تقدم لضغط الركبة، ثم الضغط الكامل.' },
      { question: 'ما العضلات التي يعملها الضغط؟', answer: 'أساساً الصدر والكتف الأمامي والترايسبس. يعمل أيضاً الجذع للتثبيت.' },
      { question: 'كيف أجعل الضغط أصعب؟', answer: 'جرب ضغط منحدر، ضغط الماسة، ضغط الرامي، ضغط ذراع واحدة، أو أضف سترة ثقيلة.' },
      { question: 'هل من السيء عمل ضغط كل يوم؟', answer: 'مقبول إذا لم تصل للفشل. لنمو العضلات، اسمح بـ 48 ساعة تعافي بين الجلسات المكثفة.' }
    ],
  },
  'core-plank': {
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

  // Generate basic content for exercises without descriptions
  const emptyExercises = await prisma.exercise.findMany({
    where: {
      OR: [
        { descriptionEn: '' },
        { descriptionEn: null },
      ],
    },
    select: {
      id: true,
      externalId: true,
      nameEn: true,
      primaryMuscle: true,
      difficulty: true,
      equipment: true,
    },
  });

  console.log(`\n📊 Generating basic content for ${emptyExercises.length} remaining exercises...`);

  for (const ex of emptyExercises) {
    const muscle = ex.primaryMuscle.toLowerCase().replace('_', ' ');
    const diff = ex.difficulty.toLowerCase();
    const equip = ex.equipment.length > 0 ? ex.equipment[0].toLowerCase().replace('_', ' ') : 'no equipment';

    const descEn = `${ex.nameEn} is a ${diff}-level exercise targeting your ${muscle}. This ${equip} exercise helps build strength and muscle definition.`;
    const descAr = `${ex.nameEn} هو تمرين ${diff === 'beginner' ? 'للمبتدئين' : diff === 'intermediate' ? 'متوسط' : 'متقدم'} يستهدف ${muscle}. هذا التمرين يساعد في بناء القوة وتعريف العضلات.`;

    const basicFaqsEn = [
      { question: `What muscles does ${ex.nameEn} work?`, answer: `${ex.nameEn} primarily targets the ${muscle} muscles.` },
      { question: 'How many sets and reps should I do?', answer: 'Start with 3 sets of 8-12 reps. Adjust based on your fitness level and goals.' },
      { question: 'How often should I do this exercise?', answer: 'Include this exercise in your routine 2-3 times per week, allowing adequate recovery between sessions.' },
    ];

    const basicFaqsAr = [
      { question: `ما العضلات التي يعملها ${ex.nameEn}؟`, answer: `${ex.nameEn} يستهدف أساساً عضلات ${muscle}.` },
      { question: 'كم مجموعة وتكرار يجب أن أفعل؟', answer: 'ابدأ بـ 3 مجموعات من 8-12 تكرار. اضبط بناءً على مستوى لياقتك وأهدافك.' },
      { question: 'كم مرة يجب أن أمارس هذا التمرين؟', answer: 'أضف هذا التمرين لروتينك 2-3 مرات أسبوعياً، مع السماح بتعافي كافٍ بين الجلسات.' },
    ];

    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        descriptionEn: descEn,
        descriptionAr: descAr,
        faqsEn: basicFaqsEn,
        faqsAr: basicFaqsAr,
      },
    });
  }

  const totalExercises = await prisma.exercise.count();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Updated ${updated} exercises with detailed content`);
  console.log(`📝 Generated basic content for ${emptyExercises.length} exercises`);
  console.log(`⚠️ ${notFound} exercises not found`);
  console.log(`📊 Total exercises in database: ${totalExercises}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
