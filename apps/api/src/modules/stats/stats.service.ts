import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MuscleGroup } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  // Weekly summary for dashboard
  async getWeeklySummary(userId: string) {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get workout stats
    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
      include: {
        exerciseLogs: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    // Calculate volume by muscle group
    const volumeByMuscle: Record<string, number> = {};
    let totalVolume = 0;

    workouts.forEach((workout) => {
      workout.exerciseLogs.forEach((exerciseLog) => {
        const muscle = exerciseLog.exercise.primaryMuscle;
        const volume = exerciseLog.sets.reduce(
          (sum, set) => sum + (set.weightKg || 0) * (set.reps || 0),
          0,
        );

        volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + volume;
        totalVolume += volume;
      });
    });

    // Get nutrition averages
    const mealLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: weekAgo },
      },
    });

    const nutritionTotals = mealLogs.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProteinG || 0),
        carbs: acc.carbs + (meal.totalCarbsG || 0),
        fat: acc.fat + (meal.totalFatG || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const daysWithMeals = new Set(
      mealLogs.map((m) => m.loggedAt.toISOString().split('T')[0]),
    ).size;

    // Get weight change
    const latestWeight = await this.prisma.progressLog.findFirst({
      where: { userId, weightKg: { not: null } },
      orderBy: { loggedAt: 'desc' },
      select: { weightKg: true, loggedAt: true },
    });

    const weekAgoWeight = await this.prisma.progressLog.findFirst({
      where: {
        userId,
        weightKg: { not: null },
        loggedAt: { lte: weekAgo },
      },
      orderBy: { loggedAt: 'desc' },
      select: { weightKg: true },
    });

    // Get streak (use findFirst to avoid errors if record doesn't exist)
    const streak = await this.prisma.streak.findFirst({
      where: {
        userId,
        type: 'workout',
      },
    });

    // Get user's target
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workoutPlans: {
          where: { isActive: true },
          select: { daysPerWeek: true },
        },
      },
    });

    const workoutsTarget = user?.workoutPlans[0]?.daysPerWeek || 4;

    // Return in the format the frontend expects
    return {
      workoutsCompleted: workouts.length,
      totalVolume: Math.round(totalVolume),
      caloriesAvg: daysWithMeals > 0 ? Math.round(nutritionTotals.calories / daysWithMeals) : 0,
      proteinAvg: daysWithMeals > 0 ? Math.round(nutritionTotals.protein / daysWithMeals) : 0,
      weightChange: latestWeight?.weightKg && weekAgoWeight?.weightKg
        ? Math.round((latestWeight.weightKg - weekAgoWeight.weightKg) * 10) / 10
        : 0,
      streakDays: streak?.currentCount || 0,
      // Include additional data for future use
      _extended: {
        workoutsTarget,
        volumeByMuscle,
        currentWeight: latestWeight?.weightKg || null,
        longestStreak: streak?.longestCount || 0,
        daysWithMeals,
      },
    };
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      // Return default values if there's an error
      return {
        workoutsCompleted: 0,
        totalVolume: 0,
        caloriesAvg: 0,
        proteinAvg: 0,
        weightChange: 0,
        streakDays: 0,
        _extended: {
          workoutsTarget: 4,
          volumeByMuscle: {},
          currentWeight: null,
          longestStreak: 0,
          daysWithMeals: 0,
        },
      };
    }
  }

  // Weight trend for charts
  async getWeightTrend(userId: string, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.progressLog.findMany({
      where: {
        userId,
        weightKg: { not: null },
        loggedAt: { gte: startDate },
      },
      orderBy: { loggedAt: 'asc' },
      select: {
        weightKg: true,
        loggedAt: true,
      },
    });

    // Calculate 7-day moving average
    const dataPoints = logs.map((log, index) => {
      const relevantLogs = logs.slice(Math.max(0, index - 6), index + 1);
      const movingAvg =
        relevantLogs.reduce((sum, l) => sum + (l.weightKg || 0), 0) /
        relevantLogs.length;

      return {
        date: log.loggedAt.toISOString().split('T')[0],
        weight: log.weightKg,
        movingAverage: Math.round(movingAvg * 10) / 10,
      };
    });

    // Get target
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { targetWeightKg: true },
    });

    return {
      data: dataPoints,
      targetWeight: user?.targetWeightKg || null,
    };
  }

  // Volume load by muscle group over time
  async getVolumeLoadTrend(userId: string, weeks = 8) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      include: {
        exerciseLogs: {
          include: {
            exercise: { select: { primaryMuscle: true } },
            sets: true,
          },
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Group by week
    const weeklyData: Record<string, Record<string, number>> = {};

    workouts.forEach((workout) => {
      if (!workout.completedAt) return;

      const weekStart = new Date(workout.completedAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {};
      }

      workout.exerciseLogs.forEach((exerciseLog) => {
        const muscle = exerciseLog.exercise.primaryMuscle;
        const volume = exerciseLog.sets.reduce(
          (sum, set) => sum + (set.weightKg || 0) * (set.reps || 0),
          0,
        );

        weeklyData[weekKey][muscle] = (weeklyData[weekKey][muscle] || 0) + volume;
      });
    });

    return {
      weeks: Object.keys(weeklyData).map((week) => ({
        week,
        ...weeklyData[week],
        total: Object.values(weeklyData[week]).reduce((a, b) => a + b, 0),
      })),
      muscles: Object.values(MuscleGroup),
    };
  }

  // 1RM trends for major lifts
  async getStrengthTrends(userId: string) {
    // Define major compound lifts to track (by name pattern)
    const majorLifts = [
      { pattern: 'bench press', name: 'Bench Press' },
      { pattern: 'squat', name: 'Squat' },
      { pattern: 'deadlift', name: 'Deadlift' },
      { pattern: 'overhead press', name: 'Overhead Press' },
      { pattern: 'barbell row', name: 'Barbell Row' },
    ];

    const trends: Record<string, { date: string; estimated1RM: number }[]> = {};

    for (const lift of majorLifts) {
      const exercises = await this.prisma.exercise.findMany({
        where: {
          nameEn: { contains: lift.pattern, mode: 'insensitive' },
        },
        select: { id: true },
      });

      if (exercises.length === 0) continue;

      const logs = await this.prisma.exerciseLog.findMany({
        where: {
          exerciseId: { in: exercises.map((e) => e.id) },
          workoutLog: {
            userId,
            status: 'COMPLETED',
          },
        },
        include: {
          sets: true,
          workoutLog: { select: { completedAt: true } },
        },
        orderBy: { completedAt: 'asc' },
      });

      // Calculate best 1RM estimate for each session
      const sessionBests = logs
        .filter((log) => log.workoutLog.completedAt)
        .map((log) => {
          const best1RM = log.sets.reduce((max, set) => {
            if (!set.weightKg || !set.reps) return max;
            // Epley formula: 1RM = Weight × (1 + Reps/30)
            const estimated = set.weightKg * (1 + set.reps / 30);
            return estimated > max ? estimated : max;
          }, 0);

          return {
            date: log.workoutLog.completedAt!.toISOString().split('T')[0],
            estimated1RM: Math.round(best1RM * 10) / 10,
          };
        })
        .filter((d) => d.estimated1RM > 0);

      if (sessionBests.length > 0) {
        trends[lift.name] = sessionBests;
      }
    }

    return { trends };
  }

  // Muscle balance radar chart data
  async getMuscleBalance(userId: string, weeks = 4) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      include: {
        exerciseLogs: {
          include: {
            exercise: { select: { primaryMuscle: true } },
            sets: true,
          },
        },
      },
    });

    // Calculate volume per muscle group
    const muscleVolumes: Record<string, number> = {};
    let maxVolume = 0;

    workouts.forEach((workout) => {
      workout.exerciseLogs.forEach((exerciseLog) => {
        const muscle = exerciseLog.exercise.primaryMuscle;
        const volume = exerciseLog.sets.reduce(
          (sum, set) => sum + (set.weightKg || 0) * (set.reps || 0),
          0,
        );

        muscleVolumes[muscle] = (muscleVolumes[muscle] || 0) + volume;
        if (muscleVolumes[muscle] > maxVolume) {
          maxVolume = muscleVolumes[muscle];
        }
      });
    });

    // Normalize to 0-100 scale
    const muscleGroups = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'ABS'];

    const data = muscleGroups.map((muscle) => ({
      muscle,
      volume: muscleVolumes[muscle] || 0,
      normalized: maxVolume > 0 ? Math.round((muscleVolumes[muscle] || 0) / maxVolume * 100) : 0,
    }));

    // Identify imbalances
    const avgNormalized = data.reduce((sum, d) => sum + d.normalized, 0) / data.length;
    const lagging = data.filter((d) => d.normalized < avgNormalized * 0.7);

    return {
      data,
      laggingMuscles: lagging.map((d) => d.muscle),
      recommendation: lagging.length > 0
        ? `Consider adding more ${lagging.map((d) => d.muscle.toLowerCase()).join(', ')} exercises`
        : 'Good muscle balance! Keep it up',
    };
  }

  // Training frequency heatmap
  async getTrainingFrequency(userId: string, weeks = 8) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        completedAt: { gte: startDate },
      },
      select: {
        completedAt: true,
        status: true,
        durationMinutes: true,
      },
    });

    // Create calendar data
    const calendar: Record<string, { status: string; duration?: number }> = {};

    workouts.forEach((workout) => {
      if (!workout.completedAt) return;
      const dateKey = workout.completedAt.toISOString().split('T')[0];

      if (workout.status === 'COMPLETED') {
        calendar[dateKey] = {
          status: (workout.durationMinutes || 0) >= 30 ? 'full' : 'light',
          duration: workout.durationMinutes || undefined,
        };
      } else if (workout.status === 'SKIPPED') {
        calendar[dateKey] = { status: 'skipped' };
      }
    });

    return { calendar };
  }
}
