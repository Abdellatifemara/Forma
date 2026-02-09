import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exercise descriptions and instructions data
const exerciseData: Record<string, {
  descriptionEn: string;
  descriptionAr: string;
  instructionsEn: string[];
  instructionsAr: string[];
  tipsEn: string[];
  tipsAr: string[];
}> = {
  'chest-bench-press': {
    descriptionEn: 'The barbell bench press is the king of chest exercises, building strength and mass in the chest, shoulders, and triceps.',
    descriptionAr: 'ضغط البار على البنش هو ملك تمارين الصدر، يبني القوة والكتلة في الصدر والكتفين والترايسبس.',
    instructionsEn: [
      'Lie flat on a bench with your feet firmly on the floor',
      'Grip the bar slightly wider than shoulder-width apart',
      'Unrack the bar and hold it directly over your chest',
      'Lower the bar slowly to your mid-chest',
      'Press the bar back up to the starting position'
    ],
    instructionsAr: [
      'استلقِ على البنش مع تثبيت قدميك على الأرض',
      'امسك البار بمسافة أوسع قليلاً من عرض الكتفين',
      'ارفع البار وأمسكه فوق صدرك مباشرة',
      'أنزل البار ببطء نحو منتصف صدرك',
      'ادفع البار للأعلى إلى وضع البداية'
    ],
    tipsEn: ['Keep your shoulder blades pinched together', 'Do not bounce the bar off your chest', 'Keep your wrists straight'],
    tipsAr: ['أبقِ لوحي كتفك مضمومين معاً', 'لا ترتد البار عن صدرك', 'أبقِ معصميك مستقيمين'],
  },
  'chest-incline-press': {
    descriptionEn: 'The incline bench press targets the upper chest and front shoulders for complete chest development.',
    descriptionAr: 'ضغط البنش المائل يستهدف الجزء العلوي من الصدر والكتف الأمامي لتطوير صدري متكامل.',
    instructionsEn: [
      'Set the bench to a 30-45 degree incline',
      'Lie back with your feet flat on the floor',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack and lower the bar to your upper chest',
      'Press the bar back up explosively'
    ],
    instructionsAr: [
      'اضبط البنش على زاوية 30-45 درجة',
      'استلقِ للخلف مع قدميك مسطحتين على الأرض',
      'امسك البار أوسع قليلاً من عرض الكتفين',
      'أنزل البار إلى الجزء العلوي من صدرك',
      'ادفع البار للأعلى بقوة'
    ],
    tipsEn: ['Focus on squeezing your upper chest at the top', 'Keep your elbows at about 45 degrees'],
    tipsAr: ['ركز على ضغط الجزء العلوي من صدرك في القمة', 'أبقِ مرفقيك بزاوية 45 درجة تقريباً'],
  },
  'chest-dumbbell-press': {
    descriptionEn: 'The dumbbell bench press allows for greater range of motion and helps fix muscle imbalances between sides.',
    descriptionAr: 'ضغط الدمبل يسمح بمدى حركة أكبر ويساعد في إصلاح اختلالات العضلات بين الجانبين.',
    instructionsEn: [
      'Sit on a bench with a dumbbell in each hand',
      'Lie back and position the dumbbells at chest level',
      'Press the dumbbells up until your arms are extended',
      'Lower the dumbbells slowly to chest level',
      'Repeat for the desired number of reps'
    ],
    instructionsAr: [
      'اجلس على البنش مع دمبل في كل يد',
      'استلقِ للخلف وضع الدمبلز على مستوى الصدر',
      'ادفع الدمبلز للأعلى حتى تمتد ذراعيك',
      'أنزل الدمبلز ببطء لمستوى الصدر',
      'كرر العدد المطلوب'
    ],
    tipsEn: ['Bring the dumbbells together at the top', 'Keep your core tight throughout'],
    tipsAr: ['قرّب الدمبلز من بعضهما في القمة', 'أبقِ جذعك مشدوداً طوال التمرين'],
  },
  'chest-pushup': {
    descriptionEn: 'The classic push-up is a fundamental bodyweight exercise that builds chest, shoulder, and arm strength.',
    descriptionAr: 'تمرين الضغط الكلاسيكي هو تمرين أساسي بوزن الجسم يبني قوة الصدر والكتف والذراعين.',
    instructionsEn: [
      'Start in a plank position with hands shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your body until your chest nearly touches the floor',
      'Push yourself back up to the starting position',
      'Keep your core engaged throughout the movement'
    ],
    instructionsAr: [
      'ابدأ في وضع البلانك مع اليدين بعرض الكتفين',
      'حافظ على جسمك في خط مستقيم من الرأس للكعبين',
      'أنزل جسمك حتى يقترب صدرك من الأرض',
      'ادفع نفسك للأعلى لوضع البداية',
      'أبقِ جذعك مشدوداً طوال الحركة'
    ],
    tipsEn: ['Do not let your hips sag', 'Keep your elbows at 45 degrees', 'Breathe in going down, out going up'],
    tipsAr: ['لا تدع وركيك يتدلى', 'أبقِ مرفقيك بزاوية 45 درجة', 'تنفس عند النزول، أخرج عند الصعود'],
  },
  'back-deadlift': {
    descriptionEn: 'The deadlift is the ultimate full-body strength exercise, working your back, legs, and core simultaneously.',
    descriptionAr: 'رفعة الميتة هي تمرين القوة الشامل للجسم كله، تعمل على الظهر والأرجل والجذع في آن واحد.',
    instructionsEn: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend down and grip the bar just outside your legs',
      'Push your chest up and flatten your back',
      'Drive through your heels and lift the bar',
      'Stand tall with shoulders back, then lower with control'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الورك، البار فوق منتصف القدم',
      'انحنِ وأمسك البار خارج ساقيك مباشرة',
      'ارفع صدرك وافرد ظهرك',
      'ادفع من كعبيك وارفع البار',
      'قف منتصباً مع الكتفين للخلف، ثم أنزل بتحكم'
    ],
    tipsEn: ['Never round your lower back', 'Keep the bar close to your body', 'Lock out at the top'],
    tipsAr: ['لا تقوّس أسفل ظهرك أبداً', 'أبقِ البار قريباً من جسمك', 'اقفل في القمة'],
  },
  'back-pullup': {
    descriptionEn: 'The pull-up is the gold standard for back development, building a wide, strong upper back and biceps.',
    descriptionAr: 'سحب العقلة هو المعيار الذهبي لتطوير الظهر، يبني ظهراً علوياً عريضاً وقوياً مع الباي.',
    instructionsEn: [
      'Hang from the bar with palms facing away, wider than shoulders',
      'Engage your back muscles and pull yourself up',
      'Pull until your chin is above the bar',
      'Lower yourself slowly with control',
      'Fully extend your arms at the bottom'
    ],
    instructionsAr: [
      'تعلق من البار مع الكفين للخارج، أوسع من الكتفين',
      'شد عضلات ظهرك واسحب نفسك للأعلى',
      'اسحب حتى يصبح ذقنك فوق البار',
      'أنزل نفسك ببطء بتحكم',
      'افرد ذراعيك بالكامل في الأسفل'
    ],
    tipsEn: ['Focus on pulling with your back, not arms', 'Avoid swinging or kipping', 'Squeeze your lats at the top'],
    tipsAr: ['ركز على السحب بظهرك لا ذراعيك', 'تجنب التأرجح', 'اضغط اللاتس في القمة'],
  },
  'back-lat-pulldown': {
    descriptionEn: 'The lat pulldown is excellent for building back width, especially for those who cannot do pull-ups yet.',
    descriptionAr: 'السحب العلوي تمرين ممتاز لبناء عرض الظهر، خاصة لمن لا يستطيع عمل سحب العقلة.',
    instructionsEn: [
      'Sit at the lat pulldown machine with thighs secured',
      'Grip the bar wider than shoulder-width',
      'Pull the bar down to your upper chest',
      'Squeeze your lats at the bottom',
      'Return the bar slowly with control'
    ],
    instructionsAr: [
      'اجلس على جهاز السحب العلوي مع تثبيت الفخذين',
      'امسك البار أوسع من عرض الكتفين',
      'اسحب البار لأعلى صدرك',
      'اضغط اللاتس في الأسفل',
      'أعد البار ببطء بتحكم'
    ],
    tipsEn: ['Do not lean back too much', 'Pull with your elbows, not your hands', 'Keep your chest up'],
    tipsAr: ['لا تميل للخلف كثيراً', 'اسحب بمرفقيك لا يديك', 'أبقِ صدرك مرتفعاً'],
  },
  'legs-squat': {
    descriptionEn: 'The barbell squat is the king of leg exercises, building massive quads, glutes, and overall lower body strength.',
    descriptionAr: 'سكوات البار هو ملك تمارين الأرجل، يبني عضلات فخذ ومؤخرة ضخمة وقوة شاملة للجزء السفلي.',
    instructionsEn: [
      'Position the bar on your upper traps',
      'Stand with feet shoulder-width apart, toes slightly out',
      'Brace your core and keep your chest up',
      'Lower by bending knees and pushing hips back',
      'Go down until thighs are parallel, then drive up'
    ],
    instructionsAr: [
      'ضع البار على أعلى الترابس',
      'قف مع القدمين بعرض الكتفين، الأصابع للخارج قليلاً',
      'شد جذعك وأبقِ صدرك مرتفعاً',
      'أنزل بثني الركبتين ودفع الوركين للخلف',
      'انزل حتى تصبح الفخذين موازية، ثم ادفع للأعلى'
    ],
    tipsEn: ['Keep your knees tracking over your toes', 'Do not let your knees cave in', 'Keep your heels on the ground'],
    tipsAr: ['أبقِ ركبتيك تتبع أصابع قدميك', 'لا تدع ركبتيك تنهار للداخل', 'أبقِ كعبيك على الأرض'],
  },
  'legs-romanian-deadlift': {
    descriptionEn: 'The Romanian deadlift is the best exercise for hamstring development and hip hinge movement pattern.',
    descriptionAr: 'الرفعة الرومانية هي أفضل تمرين لتطوير الهامسترينج ونمط حركة مفصل الورك.',
    instructionsEn: [
      'Stand with feet hip-width apart, holding the bar',
      'Keep a slight bend in your knees throughout',
      'Push your hips back while lowering the bar',
      'Lower until you feel a stretch in your hamstrings',
      'Drive your hips forward to return to standing'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الورك، ممسكاً بالبار',
      'أبقِ انحناءً خفيفاً في ركبتيك طوال التمرين',
      'ادفع وركيك للخلف مع إنزال البار',
      'أنزل حتى تشعر بشد في الهامسترينج',
      'ادفع وركيك للأمام للعودة للوقوف'
    ],
    tipsEn: ['Keep the bar close to your legs', 'Feel the stretch in your hamstrings', 'Squeeze your glutes at the top'],
    tipsAr: ['أبقِ البار قريباً من ساقيك', 'اشعر بالشد في الهامسترينج', 'اضغط المؤخرة في القمة'],
  },
  'shoulders-overhead-press': {
    descriptionEn: 'The overhead press is the ultimate shoulder builder, developing all three heads of the deltoids.',
    descriptionAr: 'الضغط العلوي هو بناء الكتف المثالي، يطور رؤوس الدالتويد الثلاثة.',
    instructionsEn: [
      'Stand with feet shoulder-width apart',
      'Hold the bar at shoulder height, palms facing forward',
      'Press the bar straight up overhead',
      'Lock out at the top with arms fully extended',
      'Lower the bar back to shoulder height with control'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الكتفين',
      'أمسك البار على ارتفاع الكتف، الكفين للأمام',
      'ادفع البار للأعلى مباشرة فوق الرأس',
      'اقفل في القمة مع فرد الذراعين بالكامل',
      'أنزل البار لارتفاع الكتف بتحكم'
    ],
    tipsEn: ['Keep your core tight', 'Do not arch your back excessively', 'Push your head through at the top'],
    tipsAr: ['أبقِ جذعك مشدوداً', 'لا تقوّس ظهرك بشكل مفرط', 'ادفع رأسك للأمام في القمة'],
  },
  'shoulders-lateral-raise': {
    descriptionEn: 'Lateral raises isolate the side deltoids, creating that wide, capped shoulder look.',
    descriptionAr: 'الرفع الجانبي يعزل الدالتويد الجانبي، يخلق مظهر الكتف العريض المغطى.',
    instructionsEn: [
      'Stand with dumbbells at your sides',
      'Keep a slight bend in your elbows',
      'Raise your arms out to the sides until shoulder height',
      'Pause briefly at the top',
      'Lower slowly back to the starting position'
    ],
    instructionsAr: [
      'قف مع الدمبلز على جانبيك',
      'أبقِ انحناءً خفيفاً في مرفقيك',
      'ارفع ذراعيك للجانبين حتى ارتفاع الكتف',
      'توقف لحظة في القمة',
      'أنزل ببطء لوضع البداية'
    ],
    tipsEn: ['Lead with your elbows', 'Do not swing the weights', 'Control the negative'],
    tipsAr: ['قُد بمرفقيك', 'لا تأرجح الأوزان', 'تحكم في النزول'],
  },
  'biceps-barbell-curl': {
    descriptionEn: 'The barbell curl is the classic bicep builder, allowing you to lift heavy weights for maximum growth.',
    descriptionAr: 'ثني البار هو بناء البايسبس الكلاسيكي، يسمح لك برفع أوزان ثقيلة لنمو أقصى.',
    instructionsEn: [
      'Stand with feet shoulder-width apart',
      'Hold the barbell with an underhand grip',
      'Keep your elbows at your sides throughout',
      'Curl the bar up by bending your elbows',
      'Lower the bar slowly with control'
    ],
    instructionsAr: [
      'قف مع القدمين بعرض الكتفين',
      'أمسك البار بقبضة سفلية',
      'أبقِ مرفقيك على جانبيك طوال التمرين',
      'اثنِ البار للأعلى بثني مرفقيك',
      'أنزل البار ببطء بتحكم'
    ],
    tipsEn: ['Do not swing your body', 'Squeeze at the top', 'Keep your wrists straight'],
    tipsAr: ['لا تأرجح جسمك', 'اضغط في القمة', 'أبقِ معصميك مستقيمين'],
  },
  'triceps-pushdown': {
    descriptionEn: 'The cable pushdown isolates the triceps, building the horseshoe shape on the back of your arms.',
    descriptionAr: 'دفع الكيبل يعزل الترايسبس، يبني شكل حدوة الحصان في خلف ذراعيك.',
    instructionsEn: [
      'Stand facing the cable machine with the attachment at chest height',
      'Grip the attachment with palms facing down',
      'Keep your elbows pinned to your sides',
      'Push down until your arms are fully extended',
      'Return slowly to the starting position'
    ],
    instructionsAr: [
      'قف مواجهاً لجهاز الكيبل مع المقبض على ارتفاع الصدر',
      'امسك المقبض مع الكفين للأسفل',
      'أبقِ مرفقيك ملتصقين بجانبيك',
      'ادفع للأسفل حتى تفرد ذراعيك بالكامل',
      'عد ببطء لوضع البداية'
    ],
    tipsEn: ['Keep your upper arms stationary', 'Squeeze your triceps at the bottom', 'Do not lean forward'],
    tipsAr: ['أبقِ أعلى ذراعيك ثابتاً', 'اضغط الترايسبس في الأسفل', 'لا تميل للأمام'],
  },
  'core-plank': {
    descriptionEn: 'The plank is the foundational core exercise, building total core stability and endurance.',
    descriptionAr: 'البلانك هو تمرين الجذع الأساسي، يبني استقرار وتحمل الجذع الكلي.',
    instructionsEn: [
      'Start in a push-up position on your forearms',
      'Keep your body in a straight line from head to heels',
      'Engage your core by pulling your belly button to your spine',
      'Keep your glutes squeezed and legs straight',
      'Hold the position for the prescribed time'
    ],
    instructionsAr: [
      'ابدأ في وضع الضغط على ساعديك',
      'أبقِ جسمك في خط مستقيم من الرأس للكعبين',
      'شد جذعك بسحب سرتك نحو عمودك الفقري',
      'أبقِ مؤخرتك مضغوطة وساقيك مستقيمتين',
      'حافظ على الوضع للوقت المحدد'
    ],
    tipsEn: ['Do not let your hips sag', 'Do not pike your hips up', 'Breathe steadily'],
    tipsAr: ['لا تدع وركيك يتدلى', 'لا ترفع وركيك للأعلى', 'تنفس بثبات'],
  },
};

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   📝 UPDATING EXERCISE DESCRIPTIONS                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  let updated = 0;
  let notFound = 0;

  for (const [externalId, data] of Object.entries(exerciseData)) {
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

  // Also update exercises that have empty descriptions with a generic one
  const emptyDescExercises = await prisma.exercise.findMany({
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
    },
  });

  console.log(`\n📊 Found ${emptyDescExercises.length} exercises without descriptions`);

  // Generate basic descriptions for remaining exercises
  for (const ex of emptyDescExercises) {
    const muscle = ex.primaryMuscle.toLowerCase().replace('_', ' ');
    const diff = ex.difficulty.toLowerCase();

    const descEn = `${ex.nameEn} is a ${diff} ${muscle} exercise that helps build strength and muscle definition.`;
    const descAr = `${ex.nameEn} هو تمرين ${muscle} ${diff === 'beginner' ? 'للمبتدئين' : diff === 'intermediate' ? 'متوسط' : 'متقدم'} يساعد في بناء القوة وتعريف العضلات.`;

    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        descriptionEn: descEn,
        descriptionAr: descAr,
      },
    });
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Updated ${updated} exercises with detailed descriptions`);
  console.log(`📝 Generated basic descriptions for ${emptyDescExercises.length} exercises`);
  console.log(`⚠️ ${notFound} exercises not found in database`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
