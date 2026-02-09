import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExerciseData {
  customNameEn: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notesEn?: string;
}

interface WorkoutDayData {
  dayNumber: number;
  nameEn: string;
  nameAr?: string;
  exercises: ExerciseData[];
}

interface ProgramData {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  durationWeeks: number;
  priceEGP: number;
  workoutDays: WorkoutDayData[];
}

// Template programs for trainers
const programs: ProgramData[] = [
  {
    nameEn: 'Beginner Full Body',
    nameAr: 'تمارين للمبتدئين - الجسم كامل',
    descriptionEn: 'Perfect 4-week program for beginners. Focuses on building foundational strength and learning proper form.',
    descriptionAr: 'برنامج 4 أسابيع مثالي للمبتدئين. يركز على بناء القوة الأساسية وتعلم الشكل الصحيح.',
    durationWeeks: 4,
    priceEGP: 300,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'Full Body A',
        nameAr: 'تمرين الجسم كامل A',
        exercises: [
          { customNameEn: 'Goblet Squat', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Push-ups', sets: 3, reps: '10-15', restSeconds: 60 },
          { customNameEn: 'Dumbbell Row', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Dumbbell Lunges', sets: 3, reps: '10 each leg', restSeconds: 60 },
          { customNameEn: 'Plank', sets: 3, reps: '30-45 sec', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Full Body B',
        nameAr: 'تمرين الجسم كامل B',
        exercises: [
          { customNameEn: 'Romanian Deadlift', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Dumbbell Shoulder Press', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Lat Pulldown', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Leg Press', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Bicep Curls', sets: 2, reps: '12', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        nameEn: 'Full Body C',
        nameAr: 'تمرين الجسم كامل C',
        exercises: [
          { customNameEn: 'Barbell Squat', sets: 3, reps: '10', restSeconds: 90 },
          { customNameEn: 'Incline Dumbbell Press', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Seated Cable Row', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Hip Thrusts', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Tricep Dips', sets: 2, reps: '10', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    nameEn: 'Push Pull Legs (PPL)',
    nameAr: 'برنامج دفع سحب أرجل',
    descriptionEn: 'Classic 6-day PPL split for intermediate lifters. Build muscle and strength with this proven program.',
    descriptionAr: 'برنامج PPL كلاسيكي 6 أيام للمتوسطين. بناء العضلات والقوة مع هذا البرنامج المثبت.',
    durationWeeks: 8,
    priceEGP: 500,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'Push Day',
        nameAr: 'يوم الدفع',
        exercises: [
          { customNameEn: 'Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Overhead Press', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60 },
          { customNameEn: 'Lateral Raises', sets: 3, reps: '15', restSeconds: 45 },
          { customNameEn: 'Tricep Pushdowns', sets: 3, reps: '12', restSeconds: 45 },
          { customNameEn: 'Overhead Tricep Extension', sets: 3, reps: '12', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Pull Day',
        nameAr: 'يوم السحب',
        exercises: [
          { customNameEn: 'Deadlift', sets: 4, reps: '6-8', restSeconds: 120 },
          { customNameEn: 'Pull-ups', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Barbell Row', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Face Pulls', sets: 3, reps: '15', restSeconds: 45 },
          { customNameEn: 'Barbell Curls', sets: 3, reps: '10', restSeconds: 45 },
          { customNameEn: 'Hammer Curls', sets: 3, reps: '12', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        nameEn: 'Legs Day',
        nameAr: 'يوم الأرجل',
        exercises: [
          { customNameEn: 'Squat', sets: 4, reps: '8-10', restSeconds: 120 },
          { customNameEn: 'Romanian Deadlift', sets: 4, reps: '10', restSeconds: 90 },
          { customNameEn: 'Leg Press', sets: 3, reps: '12', restSeconds: 90 },
          { customNameEn: 'Leg Curl', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Leg Extension', sets: 3, reps: '15', restSeconds: 60 },
          { customNameEn: 'Calf Raises', sets: 4, reps: '15', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    nameEn: 'Upper Lower Split',
    nameAr: 'برنامج علوي سفلي',
    descriptionEn: 'Efficient 4-day upper/lower split. Great for building muscle while having adequate recovery.',
    descriptionAr: 'برنامج فعال 4 أيام علوي/سفلي. ممتاز لبناء العضلات مع وقت كافي للتعافي.',
    durationWeeks: 6,
    priceEGP: 400,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'Upper Body A',
        nameAr: 'الجزء العلوي A',
        exercises: [
          { customNameEn: 'Bench Press', sets: 4, reps: '6-8', restSeconds: 90 },
          { customNameEn: 'Barbell Row', sets: 4, reps: '6-8', restSeconds: 90 },
          { customNameEn: 'Dumbbell Shoulder Press', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Lat Pulldown', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Bicep Curls', sets: 3, reps: '12', restSeconds: 45 },
          { customNameEn: 'Tricep Extensions', sets: 3, reps: '12', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Lower Body A',
        nameAr: 'الجزء السفلي A',
        exercises: [
          { customNameEn: 'Squat', sets: 4, reps: '6-8', restSeconds: 120 },
          { customNameEn: 'Romanian Deadlift', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Leg Press', sets: 3, reps: '12', restSeconds: 90 },
          { customNameEn: 'Leg Curl', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Calf Raises', sets: 4, reps: '15', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        nameEn: 'Upper Body B',
        nameAr: 'الجزء العلوي B',
        exercises: [
          { customNameEn: 'Overhead Press', sets: 4, reps: '6-8', restSeconds: 90 },
          { customNameEn: 'Pull-ups', sets: 4, reps: '8-10', restSeconds: 90 },
          { customNameEn: 'Incline Dumbbell Press', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Cable Row', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Lateral Raises', sets: 3, reps: '15', restSeconds: 45 },
          { customNameEn: 'Face Pulls', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 4,
        nameEn: 'Lower Body B',
        nameAr: 'الجزء السفلي B',
        exercises: [
          { customNameEn: 'Deadlift', sets: 4, reps: '5', restSeconds: 120 },
          { customNameEn: 'Front Squat', sets: 3, reps: '8', restSeconds: 90 },
          { customNameEn: 'Walking Lunges', sets: 3, reps: '12 each', restSeconds: 60 },
          { customNameEn: 'Hip Thrusts', sets: 3, reps: '12', restSeconds: 60 },
          { customNameEn: 'Calf Raises', sets: 4, reps: '15', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    nameEn: 'Fat Loss HIIT',
    nameAr: 'برنامج حرق الدهون',
    descriptionEn: 'High-intensity interval training program for maximum fat loss. Combines strength and cardio.',
    descriptionAr: 'برنامج تدريب عالي الكثافة لحرق الدهون. يجمع بين القوة والكارديو.',
    durationWeeks: 6,
    priceEGP: 450,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'HIIT Circuit A',
        nameAr: 'دائرة HIIT A',
        exercises: [
          { customNameEn: 'Burpees', sets: 4, reps: '30 sec on, 30 sec off', restSeconds: 30 },
          { customNameEn: 'Kettlebell Swings', sets: 4, reps: '15', restSeconds: 30 },
          { customNameEn: 'Mountain Climbers', sets: 4, reps: '30 sec', restSeconds: 30 },
          { customNameEn: 'Goblet Squat', sets: 4, reps: '15', restSeconds: 30 },
          { customNameEn: 'Push-ups', sets: 4, reps: '12', restSeconds: 30 },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Strength + Cardio',
        nameAr: 'قوة + كارديو',
        exercises: [
          { customNameEn: 'Deadlift', sets: 4, reps: '8', restSeconds: 90 },
          { customNameEn: 'Dumbbell Bench Press', sets: 3, reps: '10', restSeconds: 60 },
          { customNameEn: 'Rowing Machine', sets: 1, reps: '10 min steady', restSeconds: 0 },
          { customNameEn: 'Battle Ropes', sets: 4, reps: '30 sec', restSeconds: 30 },
          { customNameEn: 'Plank', sets: 3, reps: '45 sec', restSeconds: 30 },
        ],
      },
      {
        dayNumber: 3,
        nameEn: 'HIIT Circuit B',
        nameAr: 'دائرة HIIT B',
        exercises: [
          { customNameEn: 'Jump Squats', sets: 4, reps: '15', restSeconds: 30 },
          { customNameEn: 'Dumbbell Thrusters', sets: 4, reps: '12', restSeconds: 30 },
          { customNameEn: 'Box Jumps', sets: 4, reps: '10', restSeconds: 30 },
          { customNameEn: 'Renegade Rows', sets: 4, reps: '8 each', restSeconds: 30 },
          { customNameEn: 'Bicycle Crunches', sets: 4, reps: '20', restSeconds: 30 },
        ],
      },
      {
        dayNumber: 4,
        nameEn: 'Active Recovery',
        nameAr: 'استرداد نشط',
        exercises: [
          { customNameEn: 'Light Walking', sets: 1, reps: '20 min', restSeconds: 0 },
          { customNameEn: 'Dynamic Stretching', sets: 1, reps: '10 min', restSeconds: 0 },
          { customNameEn: 'Foam Rolling', sets: 1, reps: '10 min', restSeconds: 0 },
        ],
      },
    ],
  },
  {
    nameEn: 'Home Workout - No Equipment',
    nameAr: 'تمارين منزلية - بدون معدات',
    descriptionEn: 'Complete home workout program requiring no equipment. Perfect for busy schedules or travel.',
    descriptionAr: 'برنامج تمارين منزلية كامل بدون معدات. مثالي للجداول المزدحمة أو السفر.',
    durationWeeks: 4,
    priceEGP: 250,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'Upper Body',
        nameAr: 'الجزء العلوي',
        exercises: [
          { customNameEn: 'Push-ups', sets: 4, reps: '15', restSeconds: 45 },
          { customNameEn: 'Diamond Push-ups', sets: 3, reps: '10', restSeconds: 45 },
          { customNameEn: 'Pike Push-ups', sets: 3, reps: '10', restSeconds: 45 },
          { customNameEn: 'Tricep Dips (on chair)', sets: 3, reps: '12', restSeconds: 45 },
          { customNameEn: 'Plank to Push-up', sets: 3, reps: '10', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Lower Body',
        nameAr: 'الجزء السفلي',
        exercises: [
          { customNameEn: 'Bodyweight Squats', sets: 4, reps: '20', restSeconds: 45 },
          { customNameEn: 'Lunges', sets: 3, reps: '12 each', restSeconds: 45 },
          { customNameEn: 'Single Leg Glute Bridge', sets: 3, reps: '12 each', restSeconds: 45 },
          { customNameEn: 'Wall Sit', sets: 3, reps: '45 sec', restSeconds: 30 },
          { customNameEn: 'Calf Raises', sets: 4, reps: '20', restSeconds: 30 },
        ],
      },
      {
        dayNumber: 3,
        nameEn: 'Core & Cardio',
        nameAr: 'البطن والكارديو',
        exercises: [
          { customNameEn: 'High Knees', sets: 4, reps: '30 sec', restSeconds: 20 },
          { customNameEn: 'Crunches', sets: 3, reps: '20', restSeconds: 30 },
          { customNameEn: 'Leg Raises', sets: 3, reps: '15', restSeconds: 30 },
          { customNameEn: 'Burpees', sets: 4, reps: '10', restSeconds: 30 },
          { customNameEn: 'Plank', sets: 3, reps: '45 sec', restSeconds: 30 },
          { customNameEn: 'Mountain Climbers', sets: 3, reps: '30 sec', restSeconds: 30 },
        ],
      },
    ],
  },
  {
    nameEn: 'Strength Building - 5x5',
    nameAr: 'بناء القوة - 5×5',
    descriptionEn: 'Classic 5x5 strength program. Focus on compound lifts for maximum strength gains.',
    descriptionAr: 'برنامج قوة كلاسيكي 5×5. التركيز على التمارين المركبة لأقصى مكاسب في القوة.',
    durationWeeks: 12,
    priceEGP: 600,
    workoutDays: [
      {
        dayNumber: 1,
        nameEn: 'Workout A',
        nameAr: 'تمرين A',
        exercises: [
          { customNameEn: 'Squat', sets: 5, reps: '5', restSeconds: 180, notesEn: 'Add 2.5kg each session' },
          { customNameEn: 'Bench Press', sets: 5, reps: '5', restSeconds: 180, notesEn: 'Add 2.5kg each session' },
          { customNameEn: 'Barbell Row', sets: 5, reps: '5', restSeconds: 180, notesEn: 'Add 2.5kg each session' },
        ],
      },
      {
        dayNumber: 2,
        nameEn: 'Workout B',
        nameAr: 'تمرين B',
        exercises: [
          { customNameEn: 'Squat', sets: 5, reps: '5', restSeconds: 180, notesEn: 'Add 2.5kg each session' },
          { customNameEn: 'Overhead Press', sets: 5, reps: '5', restSeconds: 180, notesEn: 'Add 2.5kg each session' },
          { customNameEn: 'Deadlift', sets: 1, reps: '5', restSeconds: 180, notesEn: 'Add 5kg each session' },
        ],
      },
    ],
  },
];

async function seedPrograms() {
  console.log('\n🏋️ SEEDING TRAINER PROGRAMS\n');

  // Get the trainer profile
  const trainer = await prisma.user.findUnique({
    where: { email: 'trainer@forma.fitness' },
    include: { trainerProfile: true },
  });

  if (!trainer || !trainer.trainerProfile) {
    console.log('❌ Trainer account not found. Run seed-test-accounts.ts first!');
    return;
  }

  const trainerId = trainer.trainerProfile.id;
  console.log(`📋 Creating programs for trainer: ${trainer.firstName} ${trainer.lastName}\n`);

  for (const program of programs) {
    // Check if program already exists
    const existing = await prisma.trainerProgram.findFirst({
      where: {
        trainerId,
        nameEn: program.nameEn,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${program.nameEn}" (already exists)`);
      continue;
    }

    // Create program with workout days and exercises
    const created = await prisma.trainerProgram.create({
      data: {
        trainerId,
        nameEn: program.nameEn,
        nameAr: program.nameAr,
        descriptionEn: program.descriptionEn,
        descriptionAr: program.descriptionAr,
        durationWeeks: program.durationWeeks,
        priceEGP: program.priceEGP,
        sourceType: 'manual',
        status: 'ACTIVE', // Pre-made programs are active
        isTemplate: true,
        workoutDays: {
          create: program.workoutDays.map((day) => ({
            dayNumber: day.dayNumber,
            nameEn: day.nameEn,
            nameAr: day.nameAr,
            exercises: {
              create: day.exercises.map((ex, idx) => ({
                customNameEn: ex.customNameEn,
                order: idx + 1,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                ...(ex.notesEn ? { notesEn: ex.notesEn } : {}),
              })),
            },
          })),
        },
      },
    });

    console.log(`✅ Created: "${created.nameEn}" (${program.workoutDays.length} days, ${program.durationWeeks} weeks)`);
  }

  // Show summary
  const totalPrograms = await prisma.trainerProgram.count({
    where: { trainerId },
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   PROGRAMS SEEDED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total programs for trainer: ${totalPrograms}`);
  console.log('');
  console.log('   Available programs:');
  programs.forEach((p) => {
    console.log(`     • ${p.nameEn} (${p.durationWeeks} weeks, ${p.priceEGP} EGP)`);
  });
  console.log('═══════════════════════════════════════════════════════\n');
}

seedPrograms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
