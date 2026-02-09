import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  // Delete any existing home workout programs
  const deleted = await prisma.trainerProgram.deleteMany({
    where: {
      OR: [
        { nameEn: 'Home Workout - No Equipment' },
        { nameEn: 'Home Workout - Bodyweight Only' },
      ]
    }
  });
  console.log('Deleted old programs:', deleted.count);

  // Get trainer
  const trainer = await prisma.user.findUnique({
    where: { email: 'trainer@forma.fitness' },
    include: { trainerProfile: true }
  });

  if (!trainer?.trainerProfile) {
    console.log('No trainer found');
    return;
  }

  // Create PROPER bodyweight-only home workout
  const program = await prisma.trainerProgram.create({
    data: {
      trainerId: trainer.trainerProfile.id,
      nameEn: 'Home Workout - Bodyweight Only',
      nameAr: 'تمارين منزلية - وزن الجسم فقط',
      descriptionEn: 'No equipment needed. Pure bodyweight exercises you can do anywhere at home.',
      descriptionAr: 'لا حاجة لمعدات. تمارين وزن الجسم يمكنك القيام بها في أي مكان.',
      durationWeeks: 4,
      priceEGP: 200,
      sourceType: 'manual',
      status: 'ACTIVE',
      isTemplate: true,
      workoutDays: {
        create: [
          {
            dayNumber: 1,
            nameEn: 'Upper Body Push',
            nameAr: 'دفع الجزء العلوي',
            exercises: {
              create: [
                { customNameEn: 'Regular Push-ups', order: 1, sets: 4, reps: '15-20', restSeconds: 45 },
                { customNameEn: 'Wide Push-ups', order: 2, sets: 3, reps: '12-15', restSeconds: 45 },
                { customNameEn: 'Diamond Push-ups', order: 3, sets: 3, reps: '10-12', restSeconds: 45 },
                { customNameEn: 'Pike Push-ups', order: 4, sets: 3, reps: '10', restSeconds: 60 },
                { customNameEn: 'Tricep Dips (floor/chair)', order: 5, sets: 3, reps: '12-15', restSeconds: 45 },
                { customNameEn: 'Plank Shoulder Taps', order: 6, sets: 3, reps: '20 total', restSeconds: 30 },
              ]
            }
          },
          {
            dayNumber: 2,
            nameEn: 'Lower Body',
            nameAr: 'الجزء السفلي',
            exercises: {
              create: [
                { customNameEn: 'Bodyweight Squats', order: 1, sets: 4, reps: '20', restSeconds: 45 },
                { customNameEn: 'Jump Squats', order: 2, sets: 3, reps: '12', restSeconds: 45 },
                { customNameEn: 'Walking Lunges', order: 3, sets: 3, reps: '12 each leg', restSeconds: 45 },
                { customNameEn: 'Glute Bridges', order: 4, sets: 3, reps: '15', restSeconds: 45 },
                { customNameEn: 'Single Leg Glute Bridge', order: 5, sets: 3, reps: '10 each', restSeconds: 45 },
                { customNameEn: 'Wall Sit', order: 6, sets: 3, reps: '45-60 sec', restSeconds: 30 },
                { customNameEn: 'Standing Calf Raises', order: 7, sets: 4, reps: '20', restSeconds: 30 },
              ]
            }
          },
          {
            dayNumber: 3,
            nameEn: 'Core & Cardio',
            nameAr: 'البطن والكارديو',
            exercises: {
              create: [
                { customNameEn: 'High Knees', order: 1, sets: 4, reps: '30 sec', restSeconds: 20 },
                { customNameEn: 'Burpees', order: 2, sets: 4, reps: '10', restSeconds: 30 },
                { customNameEn: 'Mountain Climbers', order: 3, sets: 4, reps: '30 sec', restSeconds: 20 },
                { customNameEn: 'Crunches', order: 4, sets: 3, reps: '20', restSeconds: 30 },
                { customNameEn: 'Leg Raises', order: 5, sets: 3, reps: '15', restSeconds: 30 },
                { customNameEn: 'Bicycle Crunches', order: 6, sets: 3, reps: '20 total', restSeconds: 30 },
                { customNameEn: 'Russian Twists', order: 7, sets: 3, reps: '20 total', restSeconds: 30 },
                { customNameEn: 'Plank Hold', order: 8, sets: 3, reps: '45-60 sec', restSeconds: 30 },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created proper home workout:', program.nameEn);
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
