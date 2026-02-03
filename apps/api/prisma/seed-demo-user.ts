import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoUser() {
  console.log('\n🚀 SEEDING DEMO USER FOR INVESTOR DEMO\n');

  // Create or update demo user
  const passwordHash = await bcrypt.hash('Demo123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@forma.fitness' },
    update: {},
    create: {
      email: 'demo@forma.fitness',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      displayName: 'Ahmed',
      gender: 'MALE',
      dateOfBirth: new Date('1995-03-15'),
      fitnessGoal: 'BUILD_MUSCLE',
      activityLevel: 'VERY_ACTIVE',
      heightCm: 178,
      currentWeightKg: 82,
      targetWeightKg: 85,
      fitnessLevel: 'INTERMEDIATE',
      role: 'USER',
      language: 'en',
      measurementUnit: 'metric',
      notificationsEnabled: true,
      onboardingCompletedAt: new Date(),
    },
  });

  console.log(`✅ Demo user created: ${demoUser.email}`);

  // Create subscription (Premium)
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      priceEGP: 199,
      billingCycle: 'monthly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
    },
  });
  console.log('✅ Premium subscription created');

  // Create workout streak
  await prisma.streak.upsert({
    where: { userId_type: { userId: demoUser.id, type: 'workout' } },
    update: {
      currentCount: 7,
      longestCount: 14,
      lastActivityAt: new Date(),
    },
    create: {
      userId: demoUser.id,
      type: 'workout',
      currentCount: 7,
      longestCount: 14,
      lastActivityAt: new Date(),
    },
  });
  console.log('✅ Workout streak created (7 day current)');

  // Get some exercises for the workout plan
  const exercises = await prisma.exercise.findMany({
    take: 30,
    orderBy: { nameEn: 'asc' },
  });

  if (exercises.length < 10) {
    console.log('⚠️ Not enough exercises in database. Please seed exercises first.');
    return;
  }

  // Group exercises by muscle
  const chestExercises = exercises.filter(e => e.primaryMuscle === 'CHEST').slice(0, 5);
  const backExercises = exercises.filter(e => e.primaryMuscle === 'BACK').slice(0, 5);
  const shoulderExercises = exercises.filter(e => e.primaryMuscle === 'SHOULDERS').slice(0, 4);
  const bicepsExercises = exercises.filter(e => e.primaryMuscle === 'BICEPS').slice(0, 3);
  const tricepsExercises = exercises.filter(e => e.primaryMuscle === 'TRICEPS').slice(0, 3);
  const legExercises = exercises.filter(e => ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES'].includes(e.primaryMuscle)).slice(0, 6);
  const absExercises = exercises.filter(e => e.primaryMuscle === 'ABS').slice(0, 4);

  // Delete existing workout plan for demo user
  await prisma.workoutPlan.deleteMany({
    where: { userId: demoUser.id },
  });

  // Create a workout plan
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: demoUser.id,
      nameEn: 'Muscle Building Program',
      nameAr: 'برنامج بناء العضلات',
      descriptionEn: '4-day push/pull/legs split for intermediate lifters',
      descriptionAr: 'برنامج 4 أيام لبناء العضلات للمستوى المتوسط',
      durationWeeks: 8,
      daysPerWeek: 4,
      difficulty: 'INTERMEDIATE',
      goal: 'BUILD_MUSCLE',
      isActive: true,
      isAIGenerated: true,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Started 2 weeks ago
    },
  });

  console.log('✅ Workout plan created: Muscle Building Program');

  // Create workouts for the plan
  const workouts = [];

  // Day 1: Push (Chest, Shoulders, Triceps)
  const pushWorkout = await prisma.workout.create({
    data: {
      planId: workoutPlan.id,
      weekNumber: 1,
      dayOfWeek: 1,
      nameEn: 'Push Day - Chest & Shoulders',
      nameAr: 'يوم الدفع - صدر وأكتاف',
      focusMuscles: ['CHEST', 'SHOULDERS', 'TRICEPS'],
      estimatedMinutes: 60,
      exercises: {
        create: [
          ...chestExercises.slice(0, 3).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 1,
            sets: 4,
            reps: 10,
            restSeconds: 90,
          })),
          ...shoulderExercises.slice(0, 2).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 4,
            sets: 3,
            reps: 12,
            restSeconds: 60,
          })),
          ...tricepsExercises.slice(0, 2).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 6,
            sets: 3,
            reps: 12,
            restSeconds: 60,
          })),
        ],
      },
    },
  });
  workouts.push(pushWorkout);

  // Day 2: Pull (Back, Biceps)
  const pullWorkout = await prisma.workout.create({
    data: {
      planId: workoutPlan.id,
      weekNumber: 1,
      dayOfWeek: 2,
      nameEn: 'Pull Day - Back & Biceps',
      nameAr: 'يوم السحب - ظهر وباي',
      focusMuscles: ['BACK', 'BICEPS'],
      estimatedMinutes: 55,
      exercises: {
        create: [
          ...backExercises.slice(0, 4).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 1,
            sets: 4,
            reps: 10,
            restSeconds: 90,
          })),
          ...bicepsExercises.slice(0, 2).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 5,
            sets: 3,
            reps: 12,
            restSeconds: 60,
          })),
        ],
      },
    },
  });
  workouts.push(pullWorkout);

  // Day 3: Legs
  const legsWorkout = await prisma.workout.create({
    data: {
      planId: workoutPlan.id,
      weekNumber: 1,
      dayOfWeek: 4,
      nameEn: 'Leg Day',
      nameAr: 'يوم الأرجل',
      focusMuscles: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
      estimatedMinutes: 65,
      exercises: {
        create: legExercises.slice(0, 5).map((ex, i) => ({
          exerciseId: ex.id,
          order: i + 1,
          sets: 4,
          reps: i === 0 ? 8 : 12,
          restSeconds: i === 0 ? 120 : 90,
        })),
      },
    },
  });
  workouts.push(legsWorkout);

  // Day 4: Upper Body + Core
  const upperWorkout = await prisma.workout.create({
    data: {
      planId: workoutPlan.id,
      weekNumber: 1,
      dayOfWeek: 5,
      nameEn: 'Upper Body & Core',
      nameAr: 'الجزء العلوي والبطن',
      focusMuscles: ['CHEST', 'BACK', 'ABS'],
      estimatedMinutes: 50,
      exercises: {
        create: [
          ...chestExercises.slice(3, 5).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 1,
            sets: 3,
            reps: 12,
            restSeconds: 60,
          })),
          ...backExercises.slice(4, 5).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 3,
            sets: 3,
            reps: 12,
            restSeconds: 60,
          })),
          ...absExercises.slice(0, 3).map((ex, i) => ({
            exerciseId: ex.id,
            order: i + 4,
            sets: 3,
            reps: 15,
            restSeconds: 45,
          })),
        ],
      },
    },
  });
  workouts.push(upperWorkout);

  console.log('✅ 4 workouts created for the plan');

  // Delete existing workout logs
  await prisma.workoutLog.deleteMany({
    where: { userId: demoUser.id },
  });

  // Create workout logs for the past 2 weeks
  type WorkoutLogEntry = {
    date: Date;
    workout: typeof workouts[0];
    completed: boolean;
  };
  const workoutLogsData: WorkoutLogEntry[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Week 1 (7-14 days ago)
  for (let day = 14; day >= 7; day--) {
    const workoutDate = new Date(today);
    workoutDate.setDate(today.getDate() - day);
    const dayOfWeek = workoutDate.getDay();

    // Skip weekends or rest days
    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) continue;

    const selectedWorkout = workouts[workoutLogsData.length % workouts.length];
    workoutLogsData.push({
      date: workoutDate,
      workout: selectedWorkout,
      completed: true,
    });
  }

  // Week 2 (past 7 days)
  for (let day = 6; day >= 0; day--) {
    const workoutDate = new Date(today);
    workoutDate.setDate(today.getDate() - day);
    const dayOfWeek = workoutDate.getDay();

    // Skip weekends or rest days
    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) continue;

    const selectedWorkout = workouts[workoutLogsData.length % workouts.length];
    workoutLogsData.push({
      date: workoutDate,
      workout: selectedWorkout,
      completed: day !== 0, // Today's workout not completed yet
    });
  }

  // Create the workout logs with exercise logs
  for (const logData of workoutLogsData) {
    const startTime = new Date(logData.date);
    startTime.setHours(18, 0, 0, 0); // 6 PM workout

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + logData.workout.estimatedMinutes + Math.floor(Math.random() * 15));

    // Get workout exercises
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { workoutId: logData.workout.id },
      include: { exercise: true },
    });

    // Calculate total volume
    let totalVolume = 0;
    const exerciseLogsToCreate = [];

    for (const wex of workoutExercises) {
      const setLogs = [];
      const baseWeight = getBaseWeight(wex.exercise.primaryMuscle);

      for (let setNum = 1; setNum <= wex.sets; setNum++) {
        const weight = baseWeight + Math.floor(Math.random() * 5);
        const reps = wex.reps || 10;
        const actualReps = reps - Math.floor(Math.random() * 2);
        totalVolume += weight * actualReps;

        setLogs.push({
          setNumber: setNum,
          reps: actualReps,
          weightKg: weight,
          rpe: 7 + Math.floor(Math.random() * 3),
          completedAt: new Date(startTime.getTime() + setNum * 3 * 60 * 1000),
        });
      }

      exerciseLogsToCreate.push({
        exerciseId: wex.exerciseId,
        sets: setLogs,
      });
    }

    // Create workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: demoUser.id,
        workoutId: logData.workout.id,
        scheduledDate: logData.date,
        startedAt: logData.completed ? startTime : null,
        completedAt: logData.completed ? endTime : null,
        status: logData.completed ? 'COMPLETED' : 'SCHEDULED',
        totalVolume: logData.completed ? totalVolume : null,
        durationMinutes: logData.completed ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : null,
        caloriesBurned: logData.completed ? Math.round(totalVolume / 50) + 200 : null,
        rating: logData.completed ? 4 + Math.floor(Math.random() * 2) : null,
        notes: logData.completed && Math.random() > 0.7 ? 'Great session! Feeling strong.' : null,
      },
    });

    // Create exercise logs for completed workouts
    if (logData.completed) {
      for (const exLog of exerciseLogsToCreate) {
        await prisma.exerciseLog.create({
          data: {
            workoutLogId: workoutLog.id,
            exerciseId: exLog.exerciseId,
            completedAt: endTime,
            sets: {
              create: exLog.sets,
            },
          },
        });
      }
    }
  }

  console.log(`✅ ${workoutLogsData.length} workout logs created with exercise data`);

  // Create progress logs (weight tracking)
  await prisma.progressLog.deleteMany({
    where: { userId: demoUser.id },
  });

  const progressData = [
    { daysAgo: 30, weight: 80.5, bodyFat: 18 },
    { daysAgo: 23, weight: 81.0, bodyFat: 17.5 },
    { daysAgo: 16, weight: 81.5, bodyFat: 17 },
    { daysAgo: 9, weight: 82.0, bodyFat: 16.5 },
    { daysAgo: 2, weight: 82.3, bodyFat: 16 },
  ];

  for (const p of progressData) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - p.daysAgo);

    await prisma.progressLog.create({
      data: {
        userId: demoUser.id,
        loggedAt: logDate,
        weightKg: p.weight,
        bodyFatPercent: p.bodyFat,
        notes: p.daysAgo === 2 ? 'Making good progress!' : null,
      },
    });
  }
  console.log('✅ 5 progress logs created (weight tracking)');

  // Create some meal logs
  await prisma.mealLog.deleteMany({
    where: { userId: demoUser.id },
  });

  // Get some foods
  const foods = await prisma.food.findMany({
    take: 20,
    where: {
      OR: [
        { category: 'PROTEIN' },
        { category: 'GRAINS' },
        { category: 'TRADITIONAL' },
        { category: 'DAIRY' },
      ],
    },
  });

  if (foods.length > 0) {
    // Create meals for today and yesterday
    for (let day = 0; day <= 1; day++) {
      const mealDate = new Date(today);
      mealDate.setDate(today.getDate() - day);

      const mealTypes: Array<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'> = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

      for (const mealType of mealTypes) {
        const mealFoods = foods.slice(
          Math.floor(Math.random() * (foods.length - 3)),
          Math.floor(Math.random() * (foods.length - 3)) + 2
        );

        if (mealFoods.length > 0) {
          let totalCals = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          mealFoods.forEach(f => {
            totalCals += f.calories;
            totalProtein += f.proteinG;
            totalCarbs += f.carbsG;
            totalFat += f.fatG;
          });

          await prisma.mealLog.create({
            data: {
              userId: demoUser.id,
              loggedAt: new Date(mealDate.setHours(getMealHour(mealType), 0, 0, 0)),
              mealType,
              totalCalories: totalCals,
              totalProteinG: totalProtein,
              totalCarbsG: totalCarbs,
              totalFatG: totalFat,
              foods: {
                create: mealFoods.map(f => ({
                  foodId: f.id,
                  servings: 1,
                })),
              },
            },
          });
        }
      }
    }
    console.log('✅ Meal logs created for today and yesterday');
  }

  // Grant some achievements
  const achievements = await prisma.achievement.findMany({ take: 5 });

  for (const ach of achievements) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: demoUser.id,
          achievementId: ach.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        achievementId: ach.id,
        progress: 100,
        unlockedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${achievements.length} achievements unlocked`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   DEMO USER CREATED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   📧 Email: demo@forma.fitness`);
  console.log(`   🔑 Password: Demo123!`);
  console.log(`   💪 Workout Plan: Muscle Building Program (4 days/week)`);
  console.log(`   📊 Workout History: ${workoutLogsData.filter(w => w.completed).length} completed workouts`);
  console.log(`   🔥 Current Streak: 7 days`);
  console.log(`   ⭐ Subscription: Premium`);
  console.log('═══════════════════════════════════════════════════════\n');
}

function getBaseWeight(muscle: string): number {
  const weights: Record<string, number> = {
    CHEST: 60,
    BACK: 50,
    SHOULDERS: 20,
    BICEPS: 12,
    TRICEPS: 15,
    QUADRICEPS: 80,
    HAMSTRINGS: 40,
    GLUTES: 60,
    CALVES: 40,
    ABS: 10,
  };
  return weights[muscle] || 20;
}

function getMealHour(mealType: string): number {
  const hours: Record<string, number> = {
    BREAKFAST: 8,
    LUNCH: 13,
    DINNER: 19,
    SNACK: 16,
    PRE_WORKOUT: 17,
    POST_WORKOUT: 20,
  };
  return hours[mealType] || 12;
}

seedDemoUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
