import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Injury types and their affected exercises/muscles
const INJURY_MAP: Record<string, {
  affectedMuscles: string[];
  avoidExercises: string[];
  modifications: { original: string; alternative: string; reason: string }[];
  generalTips: string[];
  generalTipsAr: string[];
}> = {
  shoulder: {
    affectedMuscles: ['SHOULDERS', 'CHEST', 'BACK'],
    avoidExercises: [
      'Overhead Press', 'Military Press', 'Arnold Press',
      'Upright Row', 'Behind Neck Press', 'Dips',
      'Bench Press', 'Incline Press',
    ],
    modifications: [
      { original: 'Bench Press', alternative: 'Floor Press', reason: 'Limits range of motion, reduces shoulder strain' },
      { original: 'Overhead Press', alternative: 'Landmine Press', reason: 'Angled pressing is easier on shoulders' },
      { original: 'Dips', alternative: 'Close-Grip Bench Press', reason: 'Less shoulder extension required' },
      { original: 'Lat Pulldown', alternative: 'Neutral Grip Lat Pulldown', reason: 'Neutral grip reduces shoulder rotation' },
      { original: 'Pull-ups', alternative: 'Neutral Grip Pull-ups', reason: 'Reduces external rotation stress' },
    ],
    generalTips: [
      'Avoid going below parallel on chest exercises',
      'Keep elbows at 45° angle instead of 90° during pressing',
      'Focus on rotator cuff strengthening exercises',
      'Use lighter weights with higher reps',
    ],
    generalTipsAr: [
      'تجنب النزول أسفل مستوى الموازي في تمارين الصدر',
      'حافظ على زاوية المرفقين 45° بدلاً من 90° أثناء الضغط',
      'ركز على تمارين تقوية الكفة المدورة',
      'استخدم أوزان أخف مع تكرارات أكثر',
    ],
  },
  knee: {
    affectedMuscles: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
    avoidExercises: [
      'Deep Squat', 'Jump Squat', 'Lunges', 'Box Jumps',
      'Leg Extension', 'Running', 'Plyometrics',
    ],
    modifications: [
      { original: 'Squat', alternative: 'Box Squat', reason: 'Controlled depth, less knee stress' },
      { original: 'Lunges', alternative: 'Step-ups', reason: 'More controlled movement, less impact' },
      { original: 'Leg Press', alternative: 'Leg Press (partial range)', reason: 'Avoid deep knee flexion' },
      { original: 'Leg Extension', alternative: 'Terminal Knee Extensions', reason: 'Rehabilitative, strengthens VMO' },
      { original: 'Running', alternative: 'Swimming or Cycling', reason: 'Low impact cardio options' },
    ],
    generalTips: [
      'Never let knees cave inward during exercises',
      'Limit knee flexion to 90° or less',
      'Strengthen VMO muscle with targeted exercises',
      'Always warm up thoroughly before leg exercises',
    ],
    generalTipsAr: [
      'لا تدع ركبتيك تنحني للداخل أثناء التمارين',
      'حدد ثني الركبة إلى 90° أو أقل',
      'قوي عضلة VMO بتمارين موجهة',
      'قم بالإحماء جيداً قبل تمارين الساق',
    ],
  },
  lower_back: {
    affectedMuscles: ['BACK', 'HAMSTRINGS', 'GLUTES', 'ABS'],
    avoidExercises: [
      'Deadlift', 'Good Morning', 'Bent Over Row',
      'Hyperextensions', 'Sit-ups', 'Russian Twist',
    ],
    modifications: [
      { original: 'Deadlift', alternative: 'Trap Bar Deadlift', reason: 'More upright torso, less lumbar stress' },
      { original: 'Bent Over Row', alternative: 'Chest Supported Row', reason: 'Eliminates lower back involvement' },
      { original: 'Sit-ups', alternative: 'Dead Bug', reason: 'Core activation without spinal flexion' },
      { original: 'Back Squat', alternative: 'Goblet Squat', reason: 'More upright posture, lighter load' },
      { original: 'Good Morning', alternative: 'Hip Thrust', reason: 'Targets glutes without spinal loading' },
    ],
    generalTips: [
      'Maintain neutral spine in all exercises',
      'Engage core before lifting',
      'Avoid spinal flexion under load',
      'Consider wearing a belt for heavy compound lifts',
    ],
    generalTipsAr: [
      'حافظ على استقامة العمود الفقري في جميع التمارين',
      'شد عضلات البطن قبل الرفع',
      'تجنب ثني العمود الفقري تحت الحمل',
      'فكر في ارتداء حزام للرفعات المركبة الثقيلة',
    ],
  },
  elbow: {
    affectedMuscles: ['BICEPS', 'TRICEPS', 'FOREARMS'],
    avoidExercises: [
      'Skull Crushers', 'Close Grip Bench Press',
      'Barbell Curl', 'Preacher Curl', 'Dips',
    ],
    modifications: [
      { original: 'Skull Crushers', alternative: 'Cable Tricep Pushdown', reason: 'Less stress on elbow joint' },
      { original: 'Barbell Curl', alternative: 'Hammer Curl', reason: 'Neutral grip reduces elbow strain' },
      { original: 'Close Grip Bench', alternative: 'Diamond Push-ups', reason: 'Bodyweight is more forgiving' },
      { original: 'Preacher Curl', alternative: 'Incline Dumbbell Curl', reason: 'Better elbow positioning' },
    ],
    generalTips: [
      'Avoid locking out elbows completely',
      'Use lighter weight with controlled movements',
      'Ice after workouts if needed',
      'Consider elbow sleeves for support',
    ],
    generalTipsAr: [
      'تجنب قفل المرفقين بالكامل',
      'استخدم وزن أخف مع حركات مضبوطة',
      'ضع ثلج بعد التمارين إذا لزم الأمر',
      'فكر في استخدام دعامات المرفق',
    ],
  },
  wrist: {
    affectedMuscles: ['FOREARMS', 'BICEPS', 'TRICEPS'],
    avoidExercises: [
      'Barbell Curl', 'Front Squat', 'Clean',
      'Push-ups', 'Bench Press',
    ],
    modifications: [
      { original: 'Barbell Curl', alternative: 'EZ Bar Curl', reason: 'Angled grip reduces wrist strain' },
      { original: 'Push-ups', alternative: 'Push-ups on fists or handles', reason: 'Maintains neutral wrist' },
      { original: 'Bench Press', alternative: 'Dumbbell Press (neutral grip)', reason: 'Allows natural wrist position' },
      { original: 'Front Squat', alternative: 'Safety Bar Squat', reason: 'No wrist involvement' },
    ],
    generalTips: [
      'Use wrist wraps for heavy pressing',
      'Keep wrists neutral when possible',
      'Strengthen grip with farmer walks',
      'Stretch wrists before and after workouts',
    ],
    generalTipsAr: [
      'استخدم أربطة المعصم للضغط الثقيل',
      'حافظ على استقامة المعصمين قدر الإمكان',
      'قوي القبضة بتمارين حمل المزارع',
      'مدد المعصمين قبل وبعد التمارين',
    ],
  },
  hip: {
    affectedMuscles: ['GLUTES', 'QUADRICEPS', 'HAMSTRINGS', 'ABS'],
    avoidExercises: [
      'Deep Squat', 'Sumo Deadlift', 'Wide Stance Squat',
      'Hip Abduction Machine', 'Bulgarian Split Squat',
    ],
    modifications: [
      { original: 'Squat', alternative: 'Goblet Squat (parallel)', reason: 'Controlled depth, less hip flexion' },
      { original: 'Sumo Deadlift', alternative: 'Conventional Deadlift', reason: 'Less hip abduction required' },
      { original: 'Bulgarian Split Squat', alternative: 'Step-ups', reason: 'Less hip flexor stretch' },
      { original: 'Leg Press', alternative: 'Single Leg Press (narrow stance)', reason: 'Controlled hip position' },
    ],
    generalTips: [
      'Warm up hip flexors thoroughly',
      'Avoid excessive hip external rotation',
      'Strengthen hip stabilizers',
      'Use foam rolling for hip mobility',
    ],
    generalTipsAr: [
      'أحمِ عضلات ثني الورك جيداً',
      'تجنب الدوران الخارجي المفرط للورك',
      'قوي عضلات استقرار الورك',
      'استخدم أسطوانة الفوم لمرونة الورك',
    ],
  },
  neck: {
    affectedMuscles: ['SHOULDERS', 'BACK'],
    avoidExercises: [
      'Behind Neck Press', 'Behind Neck Lat Pulldown',
      'Shrugs (heavy)', 'Upright Row',
    ],
    modifications: [
      { original: 'Shrugs', alternative: 'Face Pulls', reason: 'Better posture, less neck compression' },
      { original: 'Behind Neck Press', alternative: 'Front Press', reason: 'Safer shoulder position' },
      { original: 'Behind Neck Pulldown', alternative: 'Front Lat Pulldown', reason: 'Natural neck position' },
    ],
    generalTips: [
      'Maintain neutral neck position in all exercises',
      'Avoid looking up during overhead exercises',
      'Strengthen neck with isometric exercises',
      'Be cautious with heavy shrugging movements',
    ],
    generalTipsAr: [
      'حافظ على وضع الرقبة المحايد في جميع التمارين',
      'تجنب النظر للأعلى أثناء التمارين العلوية',
      'قوي الرقبة بتمارين الثبات',
      'كن حذراً مع حركات رفع الكتفين الثقيلة',
    ],
  },
};

@Injectable()
export class InjuryModificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get injury-aware exercise modifications for a user
   */
  async getModifications(userId: string) {
    // Get user's injuries
    const prefs = await this.prisma.userAIPreference.findUnique({
      where: { userId },
    });

    const injuries = prefs?.injuries || [];

    if (injuries.length === 0) {
      return {
        hasInjuries: false,
        injuries: [],
        modifications: [],
        avoidExercises: [],
        generalTips: [],
        generalTipsAr: [],
      };
    }

    // Aggregate modifications from all injuries
    const allModifications: typeof INJURY_MAP['shoulder']['modifications'] = [];
    const allAvoidExercises: string[] = [];
    const allTips: string[] = [];
    const allTipsAr: string[] = [];
    const affectedMuscles = new Set<string>();

    for (const injury of injuries) {
      const injuryData = INJURY_MAP[injury.toLowerCase()];
      if (injuryData) {
        allModifications.push(...injuryData.modifications);
        allAvoidExercises.push(...injuryData.avoidExercises);
        allTips.push(...injuryData.generalTips);
        allTipsAr.push(...injuryData.generalTipsAr);
        injuryData.affectedMuscles.forEach(m => affectedMuscles.add(m));
      }
    }

    // Remove duplicates
    const uniqueAvoidExercises = [...new Set(allAvoidExercises)];
    const uniqueTips = [...new Set(allTips)];
    const uniqueTipsAr = [...new Set(allTipsAr)];

    // Remove duplicate modifications (keep first occurrence)
    const seenOriginals = new Set<string>();
    const uniqueModifications = allModifications.filter(mod => {
      if (seenOriginals.has(mod.original)) return false;
      seenOriginals.add(mod.original);
      return true;
    });

    return {
      hasInjuries: true,
      injuries,
      affectedMuscles: [...affectedMuscles],
      modifications: uniqueModifications,
      avoidExercises: uniqueAvoidExercises,
      generalTips: uniqueTips,
      generalTipsAr: uniqueTipsAr,
    };
  }

  /**
   * Check if an exercise is safe for user's injuries
   */
  async isExerciseSafe(userId: string, exerciseName: string) {
    const mods = await this.getModifications(userId);

    if (!mods.hasInjuries) {
      return { safe: true, modifications: [] };
    }

    const isAvoided = mods.avoidExercises.some(
      ex => exerciseName.toLowerCase().includes(ex.toLowerCase())
    );

    if (isAvoided) {
      const alternatives = mods.modifications
        .filter(m => exerciseName.toLowerCase().includes(m.original.toLowerCase()))
        .map(m => ({
          alternative: m.alternative,
          reason: m.reason,
        }));

      return {
        safe: false,
        reason: `This exercise may aggravate your injury`,
        alternatives,
      };
    }

    return { safe: true, modifications: [] };
  }

  /**
   * Modify a workout plan based on user's injuries
   */
  async modifyWorkoutForInjuries(
    userId: string,
    exercises: { name: string; sets: number; reps: string }[],
  ) {
    const mods = await this.getModifications(userId);

    if (!mods.hasInjuries) {
      return { modified: false, exercises };
    }

    const modifiedExercises = exercises.map(exercise => {
      // Check if this exercise should be avoided
      const shouldAvoid = mods.avoidExercises.some(
        ex => exercise.name.toLowerCase().includes(ex.toLowerCase())
      );

      if (shouldAvoid) {
        // Find alternative
        const modification = mods.modifications.find(
          m => exercise.name.toLowerCase().includes(m.original.toLowerCase())
        );

        if (modification) {
          return {
            ...exercise,
            name: modification.alternative,
            originalName: exercise.name,
            modified: true,
            reason: modification.reason,
          };
        }

        // No specific alternative found, mark as flagged
        return {
          ...exercise,
          flagged: true,
          warning: 'Consider skipping or use very light weight',
        };
      }

      return { ...exercise, modified: false };
    });

    const modificationsApplied = modifiedExercises.filter(
      e => (e as any).modified || (e as any).flagged
    ).length;

    return {
      modified: modificationsApplied > 0,
      modificationsApplied,
      exercises: modifiedExercises,
      tips: mods.generalTips.slice(0, 3),
      tipsAr: mods.generalTipsAr.slice(0, 3),
    };
  }

  /**
   * Get injury-specific warm-up routine
   */
  async getInjuryWarmup(userId: string) {
    const mods = await this.getModifications(userId);

    if (!mods.hasInjuries) {
      return {
        exercises: [
          { name: 'Light Cardio', duration: '5 min' },
          { name: 'Dynamic Stretching', duration: '5 min' },
        ],
      };
    }

    const warmupExercises: { name: string; nameAr: string; duration: string; focus: string }[] = [];

    // Add injury-specific warm-up exercises
    for (const injury of mods.injuries) {
      switch (injury.toLowerCase()) {
        case 'shoulder':
          warmupExercises.push(
            { name: 'Arm Circles', nameAr: 'دوائر الذراعين', duration: '30 sec each direction', focus: 'shoulder' },
            { name: 'Band Pull-Aparts', nameAr: 'سحب الحزام', duration: '2x15', focus: 'shoulder' },
            { name: 'Wall Slides', nameAr: 'انزلاق الحائط', duration: '2x10', focus: 'shoulder' },
          );
          break;
        case 'knee':
          warmupExercises.push(
            { name: 'Leg Swings', nameAr: 'تأرجح الساق', duration: '10 each leg', focus: 'knee' },
            { name: 'Bodyweight Squats (partial)', nameAr: 'قرفصاء جزئي', duration: '2x10', focus: 'knee' },
            { name: 'Quad Stretch', nameAr: 'تمدد الفخذ', duration: '30 sec each', focus: 'knee' },
          );
          break;
        case 'lower_back':
          warmupExercises.push(
            { name: 'Cat-Cow Stretch', nameAr: 'تمدد القط-البقرة', duration: '10 reps', focus: 'lower_back' },
            { name: 'Hip Circles', nameAr: 'دوائر الورك', duration: '10 each direction', focus: 'lower_back' },
            { name: 'Bird Dog', nameAr: 'تمرين الكلب-الطائر', duration: '2x8 each side', focus: 'lower_back' },
          );
          break;
      }
    }

    return {
      duration: '10-15 min',
      importance: 'Critical for injury prevention',
      exercises: warmupExercises,
    };
  }
}
