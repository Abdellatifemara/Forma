import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutPlan, Workout, WorkoutLog, WorkoutStatus, Prisma } from '@prisma/client';

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

  // Today's Workout
  async getTodaysWorkout(userId: string) {
    const activePlan = await this.getActivePlan(userId);

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
      (w) => w.weekNumber === weekNumber && w.dayOfWeek === dayOfWeek,
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
      take: limit,
    });
  }
}
