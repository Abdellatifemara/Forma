import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProgramPhase {
  name: string;
  weeks: string;
  reps?: string;
  sets?: string;
  focus?: string;
  tempo?: string;
  supersets?: boolean;
  volume?: string;
  intensity?: string;
  holds?: string;
}

interface ProfessionalProgram {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  programType: string;
  category: string;
  tier: string;
  durationWeeks: number;
  daysPerWeek: number;
  sessionMinutes: number;
  difficulty: string;
  goals: string[];
  equipmentNeeded: string[];
  originalAuthor: string;
  targetGender?: string;
  methodology?: string;
  phases?: ProgramPhase[];
  weeklyStructure?: Record<string, any>;
  protocol?: Record<string, string>;
  focus?: string[];
  principles?: string[];
  split?: Record<string, string>;
  blocks?: ProgramPhase[];
  energySystems?: any[];
  protocols?: any[];
  structure?: Record<string, any>;
  weeklyRotation?: Record<string, any>;
  targetAreas?: string[];
  components?: string[];
  weeklyMinutes?: Record<string, string>;
}

interface ProgramData {
  professionalPrograms: ProfessionalProgram[];
  professionalAddons: ProfessionalProgram[];
}

// Map category strings to exercise patterns
const categoryExercises: Record<string, { customNameEn: string; sets: number; reps: string; restSeconds: number }[]> = {
  STRENGTH: [
    { customNameEn: 'Barbell Squat', sets: 4, reps: '5', restSeconds: 180 },
    { customNameEn: 'Bench Press', sets: 4, reps: '5', restSeconds: 180 },
    { customNameEn: 'Deadlift', sets: 3, reps: '5', restSeconds: 180 },
    { customNameEn: 'Overhead Press', sets: 3, reps: '8', restSeconds: 120 },
    { customNameEn: 'Barbell Row', sets: 3, reps: '8', restSeconds: 90 },
  ],
  HYPERTROPHY: [
    { customNameEn: 'Incline Dumbbell Press', sets: 4, reps: '10-12', restSeconds: 90 },
    { customNameEn: 'Lat Pulldown', sets: 4, reps: '10-12', restSeconds: 90 },
    { customNameEn: 'Leg Press', sets: 4, reps: '12-15', restSeconds: 90 },
    { customNameEn: 'Cable Flyes', sets: 3, reps: '12-15', restSeconds: 60 },
    { customNameEn: 'Lateral Raises', sets: 3, reps: '15', restSeconds: 60 },
    { customNameEn: 'Tricep Pushdowns', sets: 3, reps: '12', restSeconds: 60 },
  ],
  FAT_LOSS: [
    { customNameEn: 'Goblet Squat', sets: 3, reps: '15', restSeconds: 45 },
    { customNameEn: 'Dumbbell Row', sets: 3, reps: '12', restSeconds: 45 },
    { customNameEn: 'Push-ups', sets: 3, reps: '15', restSeconds: 45 },
    { customNameEn: 'Walking Lunges', sets: 3, reps: '12 each', restSeconds: 45 },
    { customNameEn: 'Kettlebell Swings', sets: 3, reps: '20', restSeconds: 30 },
    { customNameEn: 'Burpees', sets: 3, reps: '10', restSeconds: 30 },
  ],
  CARDIO_HIIT: [
    { customNameEn: 'Box Jumps', sets: 4, reps: '10', restSeconds: 30 },
    { customNameEn: 'Battle Ropes', sets: 4, reps: '30 sec', restSeconds: 30 },
    { customNameEn: 'Mountain Climbers', sets: 4, reps: '30 sec', restSeconds: 20 },
    { customNameEn: 'Kettlebell Swings', sets: 4, reps: '15', restSeconds: 30 },
    { customNameEn: 'Burpees', sets: 4, reps: '10', restSeconds: 30 },
  ],
  GENERAL_FITNESS: [
    { customNameEn: 'Bodyweight Squat', sets: 3, reps: '15', restSeconds: 60 },
    { customNameEn: 'Push-ups', sets: 3, reps: '12', restSeconds: 60 },
    { customNameEn: 'Dumbbell Lunges', sets: 3, reps: '10 each', restSeconds: 60 },
    { customNameEn: 'Plank', sets: 3, reps: '30 sec', restSeconds: 45 },
    { customNameEn: 'Dumbbell Shoulder Press', sets: 3, reps: '10', restSeconds: 60 },
  ],
  MOBILITY: [
    { customNameEn: 'Foam Roll - IT Band', sets: 1, reps: '60 sec each side', restSeconds: 0 },
    { customNameEn: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each', restSeconds: 0 },
    { customNameEn: 'Thoracic Spine Rotation', sets: 2, reps: '10 each side', restSeconds: 0 },
    { customNameEn: 'Cat-Cow Stretch', sets: 2, reps: '10', restSeconds: 0 },
    { customNameEn: 'World\'s Greatest Stretch', sets: 2, reps: '5 each side', restSeconds: 0 },
  ],
  SPORT_SPECIFIC: [
    { customNameEn: 'Power Clean', sets: 4, reps: '3', restSeconds: 120 },
    { customNameEn: 'Box Jumps', sets: 4, reps: '5', restSeconds: 90 },
    { customNameEn: 'Medicine Ball Throws', sets: 3, reps: '10', restSeconds: 60 },
    { customNameEn: 'Farmer\'s Carry', sets: 3, reps: '40m', restSeconds: 90 },
    { customNameEn: 'Sled Push', sets: 3, reps: '20m', restSeconds: 90 },
  ],
  CORE: [
    { customNameEn: 'Plank', sets: 3, reps: '45 sec', restSeconds: 30 },
    { customNameEn: 'Dead Bug', sets: 3, reps: '10 each', restSeconds: 30 },
    { customNameEn: 'Bird Dog', sets: 3, reps: '10 each', restSeconds: 30 },
    { customNameEn: 'Pallof Press', sets: 3, reps: '10 each', restSeconds: 45 },
  ],
  SPECIALIZATION: [
    { customNameEn: 'Concentration Curls', sets: 3, reps: '12', restSeconds: 45 },
    { customNameEn: 'Skull Crushers', sets: 3, reps: '12', restSeconds: 45 },
    { customNameEn: 'Face Pulls', sets: 3, reps: '15', restSeconds: 45 },
  ],
};

// Generate workout days based on program type
function generateWorkoutDays(program: ProfessionalProgram): { dayNumber: number; nameEn: string; exercises: { customNameEn: string; sets: number; reps: string; restSeconds: number }[] }[] {
  const days: { dayNumber: number; nameEn: string; exercises: { customNameEn: string; sets: number; reps: string; restSeconds: number }[] }[] = [];
  const exercises = categoryExercises[program.category] || categoryExercises.GENERAL_FITNESS;

  for (let i = 1; i <= program.daysPerWeek; i++) {
    days.push({
      dayNumber: i,
      nameEn: `Day ${i}`,
      exercises: exercises.map((ex) => ({ ...ex })),
    });
  }

  return days;
}

async function seedProfessionalPrograms() {
  console.log('\n🎓 SEEDING PROFESSIONAL PROGRAMS (NSCA/ACSM/NASM Standards)\n');

  // Load program data
  const dataPath = path.join(__dirname, 'seed-data', 'professional-programs.json');
  if (!fs.existsSync(dataPath)) {
    console.log('❌ professional-programs.json not found!');
    return;
  }

  const data: ProgramData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

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
  console.log(`📋 Creating professional programs for trainer: ${trainer.firstName} ${trainer.lastName}\n`);

  let created = 0;
  let skipped = 0;

  // Seed professional programs
  for (const program of data.professionalPrograms) {
    // Check if already exists
    const existing = await prisma.trainerProgram.findFirst({
      where: {
        trainerId,
        nameEn: program.nameEn,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${program.nameEn}" (already exists)`);
      skipped++;
      continue;
    }

    // Generate workout days based on category
    const workoutDays = generateWorkoutDays(program);

    // Create the program
    await prisma.trainerProgram.create({
      data: {
        trainerId,
        nameEn: program.nameEn,
        nameAr: program.nameAr,
        descriptionEn: `${program.descriptionEn}\n\nOriginal methodology: ${program.originalAuthor}`,
        descriptionAr: program.descriptionAr,
        durationWeeks: program.durationWeeks,
        priceEGP: program.tier === 'FREE' ? 0 : program.tier === 'PREMIUM' ? 500 : 800,
        sourceType: 'manual',
        status: 'ACTIVE',
        isTemplate: true,
        workoutDays: {
          create: workoutDays.map((day, idx) => ({
            dayNumber: day.dayNumber,
            nameEn: day.nameEn,
            exercises: {
              create: day.exercises.map((ex, exIdx) => ({
                customNameEn: ex.customNameEn,
                order: exIdx + 1,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
              })),
            },
          })),
        },
      },
    });

    console.log(`✅ Created: "${program.nameEn}" (${program.category}, ${program.difficulty})`);
    created++;
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   PROFESSIONAL PROGRAMS SEEDED!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('');
  console.log('   Programs based on:');
  console.log('     • NSCA (National Strength & Conditioning Association)');
  console.log('     • ACSM (American College of Sports Medicine)');
  console.log('     • NASM (National Academy of Sports Medicine)');
  console.log('═══════════════════════════════════════════════════════\n');
}

seedProfessionalPrograms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
