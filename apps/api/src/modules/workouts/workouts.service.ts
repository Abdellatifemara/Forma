import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutPlan, Workout, WorkoutLog, WorkoutStatus, Prisma, MuscleGroup } from '@prisma/client';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { LogWorkoutDto } from './dto/log-workout.dto';

interface WhatNowInput {
  availableMinutes?: number;  // How much time user has
  energyLevel?: 'low' | 'medium' | 'high';  // User's current energy
  location?: 'gym' | 'home' | 'outdoor';  // Where they'll workout
}

export interface WhatNowRecommendation {
  type: 'quick_workout' | 'full_workout' | 'rest' | 'active_recovery';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationMinutes: number;
  targetMuscles: string[];
  exercises: {
    id: string;
    name: string;
    nameAr?: string;
    sets: number;
    reps: string;
    equipment: string;
  }[];
  reason: string;
  reasonAr: string;
}

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  // Workout Plans
  async getUserPlans(userId: string): Promise<WorkoutPlan[]> {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        workouts: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActivePlan(userId: string): Promise<WorkoutPlan | null> {
    return this.prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workouts: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }],
        },
      },
    });
  }

  async getPlanById(id: string, userId: string): Promise<WorkoutPlan | null> {
    return this.prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        workouts: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }],
        },
      },
    });
  }

  async activatePlan(userId: string, planId: string): Promise<WorkoutPlan> {
    // Verify the plan belongs to the user
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    // Deactivate all other plans
    await this.prisma.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Activate the selected plan and set start date to today
    return this.prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        isActive: true,
        startDate: new Date(),
      },
      include: {
        workouts: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }],
        },
      },
    });
  }

  // Today's Workout
  async getTodaysWorkout(userId: string) {
    const activePlan = await this.getActivePlan(userId) as (WorkoutPlan & { workouts: Workout[] }) | null;

    if (!activePlan || !activePlan.startDate) {
      return null;
    }

    const now = new Date();
    const startDate = new Date(activePlan.startDate);
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    const dayOfWeek = (now.getDay() || 7); // Monday = 1, Sunday = 7

    // Check if we're past the plan duration
    if (weekNumber > activePlan.durationWeeks) {
      return null;
    }

    // Find today's workout
    const todayWorkout = activePlan.workouts.find(
      (w: Workout) => w.weekNumber === weekNumber && w.dayOfWeek === dayOfWeek,
    );

    if (!todayWorkout) {
      // Rest day
      return { isRestDay: true, nextWorkout: this.getNextWorkout(activePlan, weekNumber, dayOfWeek) };
    }

    // Check if already logged today
    const existingLog = await this.prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId: todayWorkout.id,
        scheduledDate: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
    });

    return {
      isRestDay: false,
      workout: todayWorkout,
      isCompleted: existingLog?.status === 'COMPLETED',
      log: existingLog,
    };
  }

  private getNextWorkout(plan: WorkoutPlan & { workouts: Workout[] }, currentWeek: number, currentDay: number) {
    // Find next workout after current day
    for (let week = currentWeek; week <= plan.durationWeeks; week++) {
      const startDay = week === currentWeek ? currentDay + 1 : 1;
      for (let day = startDay; day <= 7; day++) {
        const workout = plan.workouts.find(
          (w) => w.weekNumber === week && w.dayOfWeek === day,
        );
        if (workout) {
          return { weekNumber: week, dayOfWeek: day, workout };
        }
      }
    }
    return null;
  }

  // Workout Logging
  async startWorkout(userId: string, workoutId: string): Promise<WorkoutLog> {
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
      include: { plan: true },
    });

    if (!workout || workout.plan.userId !== userId) {
      throw new NotFoundException('Workout not found');
    }

    // Check for existing in-progress log
    const existingLog = await this.prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId,
        status: 'IN_PROGRESS',
      },
    });

    if (existingLog) {
      return existingLog;
    }

    return this.prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        scheduledDate: new Date(),
        startedAt: new Date(),
        status: 'IN_PROGRESS',
      },
    });
  }

  async completeWorkout(
    userId: string,
    logId: string,
    data: { rating?: number; notes?: string },
  ): Promise<WorkoutLog> {
    const log = await this.prisma.workoutLog.findFirst({
      where: { id: logId, userId },
      include: { exerciseLogs: { include: { sets: true } } },
    });

    if (!log) {
      throw new NotFoundException('Workout log not found');
    }

    if (log.status === 'COMPLETED') {
      throw new BadRequestException('Workout already completed');
    }

    // Calculate totals
    const totalVolume = log.exerciseLogs.reduce((sum, exerciseLog) => {
      return (
        sum +
        exerciseLog.sets.reduce(
          (setSum, set) => setSum + (set.weightKg || 0) * (set.reps || 0),
          0,
        )
      );
    }, 0);

    const startTime = log.startedAt || log.scheduledDate;
    const durationMinutes = Math.round(
      (new Date().getTime() - new Date(startTime).getTime()) / 60000,
    );

    // Estimate calories (very rough: ~5 cal per minute of weight training)
    const caloriesBurned = durationMinutes * 5;

    return this.prisma.workoutLog.update({
      where: { id: logId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalVolume,
        durationMinutes,
        caloriesBurned,
        rating: data.rating,
        notes: data.notes,
      },
    });
  }

  async logSet(
    userId: string,
    logId: string,
    exerciseId: string,
    setData: { setNumber: number; reps?: number; weightKg?: number; duration?: number; rpe?: number },
  ) {
    const log = await this.prisma.workoutLog.findFirst({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new NotFoundException('Workout log not found');
    }

    // Get or create exercise log
    let exerciseLog = await this.prisma.exerciseLog.findFirst({
      where: { workoutLogId: logId, exerciseId },
    });

    if (!exerciseLog) {
      exerciseLog = await this.prisma.exerciseLog.create({
        data: {
          workoutLogId: logId,
          exerciseId,
        },
      });
    }

    // Create or update set log
    const existingSet = await this.prisma.setLog.findFirst({
      where: {
        exerciseLogId: exerciseLog.id,
        setNumber: setData.setNumber,
      },
    });

    if (existingSet) {
      return this.prisma.setLog.update({
        where: { id: existingSet.id },
        data: {
          reps: setData.reps,
          weightKg: setData.weightKg,
          duration: setData.duration,
          rpe: setData.rpe,
        },
      });
    }

    return this.prisma.setLog.create({
      data: {
        exerciseLogId: exerciseLog.id,
        setNumber: setData.setNumber,
        reps: setData.reps,
        weightKg: setData.weightKg,
        duration: setData.duration,
        rpe: setData.rpe,
      },
    });
  }

  // History
  async getWorkoutHistory(
    userId: string,
    limit = 20,
  ): Promise<WorkoutLog[]> {
    const safeTake = Math.min(limit, 100);
    return this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        workout: true,
        exerciseLogs: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: safeTake,
    });
  }

  // Create Workout Plan
  async createPlan(userId: string, dto: CreateWorkoutPlanDto) {
    // Deactivate existing active plans
    await this.prisma.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Create the plan with nested workouts and exercises
    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        nameEn: dto.name,
        nameAr: dto.name,
        descriptionEn: dto.description,
        descriptionAr: dto.description,
        difficulty: dto.difficulty || 'INTERMEDIATE',
        goal: dto.goal || 'BUILD_MUSCLE',
        durationWeeks: 4,
        daysPerWeek: dto.workouts.length,
        isActive: true,
        startDate: new Date(),
        workouts: {
          create: dto.workouts.map((workout, dayIndex) => ({
            weekNumber: 1,
            dayOfWeek: dayIndex + 1,
            nameEn: workout.name,
            nameAr: workout.name,
            focusMuscles: [],
            exercises: {
              create: workout.exercises.map((ex, order) => ({
                exerciseId: ex.exerciseId,
                order: order + 1,
                sets: ex.sets.length,
                reps: parseInt(ex.sets[0]?.reps) || 10,
                restSeconds: 60,
              })),
            },
          })),
        },
      },
      include: {
        workouts: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return plan;
  }

  // "What Now?" Smart Workout Recommendation
  async getWhatNow(userId: string, input: WhatNowInput): Promise<WhatNowRecommendation> {
    const availableMinutes = input.availableMinutes || 30;
    const energyLevel = input.energyLevel || 'medium';
    const location = input.location || 'gym';

    // Get user preferences (injuries, equipment)
    const userPrefs = await this.prisma.userAIPreference.findUnique({
      where: { userId },
    });

    const injuries = userPrefs?.injuries || [];
    const availableEquipment = userPrefs?.availableEquipment || [];

    // Get recent workout history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: sevenDaysAgo },
      },
      include: {
        exerciseLogs: {
          include: { exercise: true },
        },
      },
    });

    // Analyze which muscles have been worked recently
    const muscleWorkCount = new Map<string, number>();
    const allMuscles = [
      'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS',
      'ABS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES',
    ];

    allMuscles.forEach(m => muscleWorkCount.set(m, 0));

    recentLogs.forEach(log => {
      log.exerciseLogs.forEach(exLog => {
        const muscle = exLog.exercise?.primaryMuscle;
        if (muscle) {
          muscleWorkCount.set(muscle, (muscleWorkCount.get(muscle) || 0) + 1);
        }
      });
    });

    // Find neglected muscles (worked least in last 7 days)
    const sortedMuscles = [...muscleWorkCount.entries()]
      .filter(([muscle]) => !this.isMuscleAffectedByInjury(muscle, injuries))
      .sort((a, b) => a[1] - b[1]);

    const neglectedMuscles = sortedMuscles.slice(0, 3).map(([m]) => m);

    // Check if user needs rest
    const workoutsInLast3Days = recentLogs.filter(log => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return log.completedAt && log.completedAt >= threeDaysAgo;
    }).length;

    // Recommend rest if overtrained or low energy
    if (workoutsInLast3Days >= 4 || (energyLevel === 'low' && workoutsInLast3Days >= 2)) {
      return this.generateRestRecommendation(energyLevel);
    }

    // Get exercises for neglected muscles
    const exercises = await this.getExercisesForMuscles(
      neglectedMuscles,
      location,
      availableEquipment,
      injuries,
      availableMinutes,
      energyLevel,
    );

    // Generate recommendation
    const workoutType = availableMinutes < 20 ? 'quick_workout' : 'full_workout';
    const muscleNames = neglectedMuscles.join(', ').toLowerCase();

    return {
      type: workoutType,
      title: availableMinutes < 20
        ? `Quick ${this.formatMuscle(neglectedMuscles[0])} Blast`
        : `${this.formatMuscle(neglectedMuscles[0])} & ${this.formatMuscle(neglectedMuscles[1] || neglectedMuscles[0])} Focus`,
      titleAr: availableMinutes < 20
        ? `تمرين سريع للـ${this.getMuscleArabic(neglectedMuscles[0])}`
        : `تركيز على ${this.getMuscleArabic(neglectedMuscles[0])} و${this.getMuscleArabic(neglectedMuscles[1] || neglectedMuscles[0])}`,
      description: `A ${availableMinutes}-minute workout targeting your ${muscleNames} - areas you haven't trained recently.`,
      descriptionAr: `تمرين ${availableMinutes} دقيقة يستهدف ${muscleNames} - مناطق لم تتدرب عليها مؤخراً`,
      durationMinutes: availableMinutes,
      targetMuscles: neglectedMuscles,
      exercises,
      reason: this.generateReason(neglectedMuscles, workoutsInLast3Days, energyLevel),
      reasonAr: this.generateReasonAr(neglectedMuscles, workoutsInLast3Days, energyLevel),
    };
  }

  private isMuscleAffectedByInjury(muscle: string, injuries: string[]): boolean {
    const injuryMuscleMap: Record<string, string[]> = {
      'shoulder': ['SHOULDERS', 'CHEST', 'BACK'],
      'knee': ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'],
      'lower_back': ['BACK', 'HAMSTRINGS', 'GLUTES', 'ABS'],
      'elbow': ['BICEPS', 'TRICEPS', 'FOREARMS'],
      'wrist': ['BICEPS', 'TRICEPS', 'FOREARMS', 'CHEST'],
      'ankle': ['CALVES', 'QUADRICEPS', 'HAMSTRINGS'],
      'hip': ['GLUTES', 'QUADRICEPS', 'HAMSTRINGS', 'ABS'],
      'neck': ['SHOULDERS', 'BACK'],
    };

    return injuries.some(injury => {
      const affectedMuscles = injuryMuscleMap[injury.toLowerCase()] || [];
      return affectedMuscles.includes(muscle);
    });
  }

  private async getExercisesForMuscles(
    muscles: string[],
    location: string,
    equipment: string[],
    injuries: string[],
    availableMinutes: number,
    energyLevel: string,
  ) {
    // Determine equipment filter based on location
    const equipmentFilter = location === 'home'
      ? ['BODYWEIGHT', 'DUMBBELLS', 'RESISTANCE_BANDS', ...equipment]
      : location === 'outdoor'
        ? ['BODYWEIGHT', 'NONE']
        : undefined; // gym has everything

    // Determine difficulty based on energy
    const difficultyFilter = energyLevel === 'low'
      ? ['BEGINNER', 'INTERMEDIATE']
      : energyLevel === 'high'
        ? ['INTERMEDIATE', 'ADVANCED']
        : ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    // Calculate how many exercises we can fit
    const avgTimePerExercise = energyLevel === 'high' ? 5 : energyLevel === 'low' ? 7 : 6;
    const maxExercises = Math.floor(availableMinutes / avgTimePerExercise);
    const exercisesPerMuscle = Math.max(1, Math.floor(maxExercises / muscles.length));

    // Batch query: fetch exercises for ALL muscles in one query (fixes N+1)
    const whereClause: Prisma.ExerciseWhereInput = {
      primaryMuscle: { in: muscles as MuscleGroup[] },
      difficulty: { in: difficultyFilter as any[] },
    };

    if (equipmentFilter) {
      whereClause.equipment = { hasSome: equipmentFilter as any[] };
    }

    const allExercises = await this.prisma.exercise.findMany({
      where: whereClause,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        equipment: true,
        primaryMuscle: true,
      },
      orderBy: { id: 'asc' },
    });

    // Group by muscle and pick exercisesPerMuscle from each
    const exercisesByMuscle = new Map<string, typeof allExercises>();
    for (const ex of allExercises) {
      const muscle = ex.primaryMuscle;
      if (!exercisesByMuscle.has(muscle)) {
        exercisesByMuscle.set(muscle, []);
      }
      const group = exercisesByMuscle.get(muscle)!;
      if (group.length < exercisesPerMuscle) {
        group.push(ex);
      }
    }

    // Flatten and format results
    const sets = energyLevel === 'low' ? 2 : energyLevel === 'high' ? 4 : 3;
    const reps = energyLevel === 'low' ? '8-10' : energyLevel === 'high' ? '10-15' : '10-12';

    const result: any[] = [];
    for (const muscle of muscles) {
      const exercises = exercisesByMuscle.get(muscle as string) || [];
      for (const ex of exercises) {
        result.push({
          id: ex.id,
          name: ex.nameEn,
          nameAr: ex.nameAr,
          sets,
          reps,
          equipment: ex.equipment,
        });
        if (result.length >= maxExercises) break;
      }
      if (result.length >= maxExercises) break;
    }

    return result.slice(0, maxExercises);
  }

  private generateRestRecommendation(energyLevel: string): WhatNowRecommendation {
    if (energyLevel === 'low') {
      return {
        type: 'rest',
        title: 'Rest Day Recommended',
        titleAr: 'يوم راحة موصى به',
        description: 'Your body needs recovery. Take today off and come back stronger tomorrow.',
        descriptionAr: 'جسمك يحتاج للتعافي. خذ راحة اليوم وعد أقوى غداً',
        durationMinutes: 0,
        targetMuscles: [],
        exercises: [],
        reason: 'You\'ve been training hard and your energy is low. Rest is when muscles grow!',
        reasonAr: 'لقد كنت تتدرب بجد وطاقتك منخفضة. الراحة هي وقت نمو العضلات!',
      };
    }

    return {
      type: 'active_recovery',
      title: 'Active Recovery',
      titleAr: 'تعافي نشط',
      description: 'Light movement to help recovery. Focus on mobility and stretching.',
      descriptionAr: 'حركة خفيفة للمساعدة في التعافي. ركز على المرونة والتمدد',
      durationMinutes: 20,
      targetMuscles: ['FULL_BODY'],
      exercises: [
        { id: 'foam-roll', name: 'Foam Rolling', nameAr: 'تدليك بالأسطوانة', sets: 1, reps: '5 min', equipment: 'FOAM_ROLLER' },
        { id: 'hip-stretch', name: 'Hip Flexor Stretch', nameAr: 'تمدد عضلات الورك', sets: 2, reps: '30 sec each', equipment: 'NONE' },
        { id: 'cat-cow', name: 'Cat-Cow Stretch', nameAr: 'تمدد القط-البقرة', sets: 2, reps: '10 reps', equipment: 'NONE' },
        { id: 'walk', name: 'Light Walk', nameAr: 'مشي خفيف', sets: 1, reps: '10 min', equipment: 'NONE' },
      ],
      reason: 'You\'ve trained 4+ times in 3 days. Active recovery helps without adding stress.',
      reasonAr: 'تدربت 4+ مرات في 3 أيام. التعافي النشط يساعد دون إضافة ضغط',
    };
  }

  private formatMuscle(muscle: string): string {
    return muscle.charAt(0) + muscle.slice(1).toLowerCase().replace('_', ' ');
  }

  private getMuscleArabic(muscle: string): string {
    const arabicNames: Record<string, string> = {
      'CHEST': 'صدر',
      'BACK': 'ظهر',
      'SHOULDERS': 'أكتاف',
      'BICEPS': 'بايسبس',
      'TRICEPS': 'ترايسبس',
      'ABS': 'بطن',
      'QUADRICEPS': 'فخذ أمامي',
      'HAMSTRINGS': 'فخذ خلفي',
      'GLUTES': 'أرداف',
      'CALVES': 'سمانة',
    };
    return arabicNames[muscle] || muscle;
  }

  private generateReason(muscles: string[], recentWorkouts: number, energy: string): string {
    const muscleStr = muscles.map(m => this.formatMuscle(m)).join(' and ');
    if (recentWorkouts === 0) {
      return `You haven't worked out in a while. This ${muscleStr} workout is perfect to get back on track!`;
    }
    return `Your ${muscleStr} haven't been trained in the last 7 days. Time to give them attention!`;
  }

  private generateReasonAr(muscles: string[], recentWorkouts: number, energy: string): string {
    const muscleStr = muscles.map(m => this.getMuscleArabic(m)).join(' و');
    if (recentWorkouts === 0) {
      return `لم تتمرن منذ فترة. هذا التمرين للـ${muscleStr} مثالي للعودة!`;
    }
    return `لم تتدرب على ${muscleStr} في الأيام السبعة الماضية. حان وقت الاهتمام بها!`;
  }

  // Log Manual Workout
  async logManualWorkout(userId: string, dto: LogWorkoutDto) {
    const now = new Date();
    const startTime = new Date(now.getTime() - dto.durationMinutes * 60 * 1000);

    // Create the workout log
    const log = await this.prisma.workoutLog.create({
      data: {
        userId,
        workoutId: null,
        manualName: dto.name,
        scheduledDate: now,
        startedAt: startTime,
        completedAt: now,
        status: 'COMPLETED',
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
      },
    });

    // Log each exercise
    let totalVolume = 0;

    for (const exercise of dto.exercises) {
      // Try to find exercise by ID or name
      let exerciseRecord = null;

      if (exercise.exerciseId) {
        exerciseRecord = await this.prisma.exercise.findUnique({
          where: { id: exercise.exerciseId },
        });
      }

      if (!exerciseRecord && exercise.name) {
        exerciseRecord = await this.prisma.exercise.findFirst({
          where: { nameEn: { contains: exercise.name, mode: 'insensitive' } },
        });
      }

      if (exerciseRecord) {
        const exerciseLog = await this.prisma.exerciseLog.create({
          data: {
            workoutLogId: log.id,
            exerciseId: exerciseRecord.id,
          },
        });

        // Log each set
        for (let i = 0; i < exercise.sets.length; i++) {
          const set = exercise.sets[i];
          await this.prisma.setLog.create({
            data: {
              exerciseLogId: exerciseLog.id,
              setNumber: i + 1,
              reps: set.reps,
              weightKg: set.weightKg,
            },
          });
          totalVolume += (set.weightKg || 0) * set.reps;
        }
      }
    }

    // Update total volume and calories
    return this.prisma.workoutLog.update({
      where: { id: log.id },
      data: {
        totalVolume,
        caloriesBurned: dto.durationMinutes * 5,
      },
      include: {
        exerciseLogs: {
          include: { exercise: true, sets: true },
        },
      },
    });
  }
}
