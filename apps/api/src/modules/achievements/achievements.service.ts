import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Achievement definitions with requirements
const ACHIEVEMENT_DEFINITIONS = [
  {
    code: 'first_workout',
    nameEn: 'First Workout',
    nameAr: 'أول تمرين',
    descriptionEn: 'Complete your first workout',
    descriptionAr: 'أكمل أول تمرين لك',
    category: 'workout',
    requirement: { type: 'workout_count', target: 1 },
    xpReward: 50,
    icon: 'dumbbell',
  },
  {
    code: 'streak_7',
    nameEn: '7 Day Streak',
    nameAr: 'سلسلة 7 أيام',
    descriptionEn: 'Work out 7 days in a row',
    descriptionAr: 'تمرن 7 أيام متتالية',
    category: 'streak',
    requirement: { type: 'streak', target: 7 },
    xpReward: 100,
    icon: 'flame',
  },
  {
    code: 'streak_30',
    nameEn: '30 Day Streak',
    nameAr: 'سلسلة 30 يوم',
    descriptionEn: 'Work out 30 days in a row',
    descriptionAr: 'تمرن 30 يوم متتالي',
    category: 'streak',
    requirement: { type: 'streak', target: 30 },
    xpReward: 500,
    icon: 'star',
  },
  {
    code: 'calorie_goal_7',
    nameEn: 'Goal Crusher',
    nameAr: 'محطم الأهداف',
    descriptionEn: 'Hit your calorie goal 7 days in a row',
    descriptionAr: 'حقق هدف السعرات 7 أيام متتالية',
    category: 'nutrition',
    requirement: { type: 'calorie_goal_streak', target: 7 },
    xpReward: 150,
    icon: 'target',
  },
  {
    code: 'early_bird',
    nameEn: 'Early Bird',
    nameAr: 'الطائر المبكر',
    descriptionEn: 'Complete 5 workouts before 8 AM',
    descriptionAr: 'أكمل 5 تمارين قبل الساعة 8 صباحاً',
    category: 'workout',
    requirement: { type: 'early_workout_count', target: 5 },
    xpReward: 100,
    icon: 'zap',
  },
  {
    code: 'century_club',
    nameEn: 'Century Club',
    nameAr: 'نادي المئة',
    descriptionEn: 'Complete 100 workouts',
    descriptionAr: 'أكمل 100 تمرين',
    category: 'workout',
    requirement: { type: 'workout_count', target: 100 },
    xpReward: 1000,
    icon: 'medal',
  },
  {
    code: 'workout_10',
    nameEn: 'Getting Started',
    nameAr: 'البداية',
    descriptionEn: 'Complete 10 workouts',
    descriptionAr: 'أكمل 10 تمارين',
    category: 'workout',
    requirement: { type: 'workout_count', target: 10 },
    xpReward: 100,
    icon: 'dumbbell',
  },
  {
    code: 'workout_50',
    nameEn: 'Dedicated',
    nameAr: 'مخلص',
    descriptionEn: 'Complete 50 workouts',
    descriptionAr: 'أكمل 50 تمرين',
    category: 'workout',
    requirement: { type: 'workout_count', target: 50 },
    xpReward: 300,
    icon: 'dumbbell',
  },
  {
    code: 'weight_logged',
    nameEn: 'Tracking Progress',
    nameAr: 'تتبع التقدم',
    descriptionEn: 'Log your weight for the first time',
    descriptionAr: 'سجل وزنك لأول مرة',
    category: 'progress',
    requirement: { type: 'weight_log_count', target: 1 },
    xpReward: 25,
    icon: 'scale',
  },
  {
    code: 'meal_logger',
    nameEn: 'Meal Logger',
    nameAr: 'مسجل الوجبات',
    descriptionEn: 'Log 50 meals',
    descriptionAr: 'سجل 50 وجبة',
    category: 'nutrition',
    requirement: { type: 'meal_log_count', target: 50 },
    xpReward: 150,
    icon: 'utensils',
  },
];

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  // Seed achievements to the database
  async seedAchievements() {
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      await this.prisma.achievement.upsert({
        where: { code: achievement.code },
        update: {
          nameEn: achievement.nameEn,
          nameAr: achievement.nameAr,
          descriptionEn: achievement.descriptionEn,
          descriptionAr: achievement.descriptionAr,
          category: achievement.category,
          requirement: achievement.requirement,
          xpReward: achievement.xpReward,
          iconUrl: achievement.icon,
        },
        create: {
          code: achievement.code,
          nameEn: achievement.nameEn,
          nameAr: achievement.nameAr,
          descriptionEn: achievement.descriptionEn,
          descriptionAr: achievement.descriptionAr,
          category: achievement.category,
          requirement: achievement.requirement,
          xpReward: achievement.xpReward,
          iconUrl: achievement.icon,
        },
      });
    }
    return { seeded: ACHIEVEMENT_DEFINITIONS.length };
  }

  // Get all achievements with user progress
  async getUserAchievements(userId: string) {
    // First, ensure all achievements exist for the user
    const achievements = await this.prisma.achievement.findMany({
      orderBy: { code: 'asc' },
    });

    // Get user's progress on each achievement
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const userProgressMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua]),
    );

    // Calculate real-time progress for each achievement
    const progress = await this.calculateAllProgress(userId);

    return achievements.map((achievement) => {
      const userProgress = userProgressMap.get(achievement.id);
      const requirement = achievement.requirement as { type: string; target: number };
      const currentProgress = progress[requirement.type] || 0;

      return {
        id: achievement.id,
        code: achievement.code,
        title: achievement.nameEn,
        titleAr: achievement.nameAr,
        description: achievement.descriptionEn,
        descriptionAr: achievement.descriptionAr,
        icon: achievement.iconUrl || 'trophy',
        category: achievement.category,
        xpReward: achievement.xpReward,
        unlocked: !!userProgress?.unlockedAt,
        unlockedAt: userProgress?.unlockedAt,
        progress: Math.min(currentProgress, requirement.target),
        total: requirement.target,
      };
    });
  }

  // Calculate progress for all achievement types
  private async calculateAllProgress(userId: string): Promise<Record<string, number>> {
    const [
      workoutCount,
      streak,
      earlyWorkoutCount,
      weightLogCount,
      mealLogCount,
    ] = await Promise.all([
      this.prisma.workoutLog.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.streak.findFirst({
        where: { userId, type: 'workout' },
        select: { currentCount: true, longestCount: true },
      }),
      this.prisma.workoutLog.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { not: null },
          // Check if completed before 8 AM - we'll approximate by checking hour
        },
      }),
      this.prisma.progressLog.count({
        where: { userId, weightKg: { not: null } },
      }),
      this.prisma.mealLog.count({
        where: { userId },
      }),
    ]);

    // For early workout count, we need a custom query
    const earlyWorkouts = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "WorkoutLog"
      WHERE "userId" = ${userId}
      AND status = 'COMPLETED'
      AND EXTRACT(HOUR FROM "completedAt") < 8
    `;

    return {
      workout_count: workoutCount,
      streak: streak?.currentCount || 0,
      longest_streak: streak?.longestCount || 0,
      early_workout_count: Number(earlyWorkouts[0]?.count || 0),
      weight_log_count: weightLogCount,
      meal_log_count: mealLogCount,
      // calorie_goal_streak would need more complex tracking
      calorie_goal_streak: 0,
    };
  }

  // Check and update achievements for a user
  async checkAndUpdateAchievements(userId: string) {
    const achievements = await this.prisma.achievement.findMany();
    const progress = await this.calculateAllProgress(userId);
    const newlyUnlocked: string[] = [];

    for (const achievement of achievements) {
      const requirement = achievement.requirement as { type: string; target: number };
      const currentProgress = progress[requirement.type] || 0;

      // Check if achievement is already unlocked
      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing?.unlockedAt) {
        // Already unlocked, skip
        continue;
      }

      // Upsert progress
      const isUnlocked = currentProgress >= requirement.target;

      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        update: {
          progress: Math.min(currentProgress, requirement.target),
          unlockedAt: isUnlocked ? new Date() : null,
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress: Math.min(currentProgress, requirement.target),
          unlockedAt: isUnlocked ? new Date() : null,
        },
      });

      if (isUnlocked && !existing?.unlockedAt) {
        newlyUnlocked.push(achievement.code);
      }
    }

    return { newlyUnlocked };
  }
}
