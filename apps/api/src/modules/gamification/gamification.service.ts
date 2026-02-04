import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LevelInfo {
  level: number;
  title: string;
  titleAr: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Beginner', titleAr: 'مبتدئ', minXp: 0, maxXp: 100, badge: '🌱' },
  { level: 2, title: 'Rookie', titleAr: 'مستجد', minXp: 100, maxXp: 300, badge: '🌿' },
  { level: 3, title: 'Enthusiast', titleAr: 'متحمس', minXp: 300, maxXp: 600, badge: '🌳' },
  { level: 4, title: 'Dedicated', titleAr: 'مخلص', minXp: 600, maxXp: 1000, badge: '💪' },
  { level: 5, title: 'Committed', titleAr: 'ملتزم', minXp: 1000, maxXp: 1500, badge: '🔥' },
  { level: 6, title: 'Athlete', titleAr: 'رياضي', minXp: 1500, maxXp: 2200, badge: '⚡' },
  { level: 7, title: 'Champion', titleAr: 'بطل', minXp: 2200, maxXp: 3000, badge: '🏆' },
  { level: 8, title: 'Legend', titleAr: 'أسطورة', minXp: 3000, maxXp: 4000, badge: '🌟' },
  { level: 9, title: 'Master', titleAr: 'محترف', minXp: 4000, maxXp: 5500, badge: '👑' },
  { level: 10, title: 'Elite', titleAr: 'نخبة', minXp: 5500, maxXp: Infinity, badge: '💎' },
];

const XP_REWARDS = {
  workoutCompleted: 50,
  workoutStreak3: 30,
  workoutStreak7: 100,
  workoutStreak30: 500,
};

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const streak = await this.prisma.streak.findFirst({
      where: { userId, type: 'workout' },
    });

    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const achievementXp = achievements.reduce(
      (sum, a) => sum + (a.achievement.xpReward || 0),
      0
    );

    const workoutCount = await this.prisma.workoutLog.count({
      where: { userId, status: 'COMPLETED' },
    });

    const workoutXp = workoutCount * XP_REWARDS.workoutCompleted;
    const totalXp = achievementXp + workoutXp;

    const levelInfo = this.getLevelInfo(totalXp);
    const xpForNextLevel = levelInfo.maxXp - totalXp;
    const levelProgress = ((totalXp - levelInfo.minXp) / (levelInfo.maxXp - levelInfo.minXp)) * 100;

    return {
      totalXp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      levelTitleAr: levelInfo.titleAr,
      badge: levelInfo.badge,
      xpForNextLevel: Math.max(0, xpForNextLevel),
      levelProgress: Math.min(100, Math.round(levelProgress)),
      currentStreak: streak?.currentCount || 0,
      longestStreak: streak?.longestCount || 0,
      achievementsUnlocked: achievements.length,
      totalWorkouts: workoutCount,
    };
  }

  async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWorkout = await this.prisma.workoutLog.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: today },
      },
    });

    if (!todayWorkout) {
      return null;
    }

    let streak = await this.prisma.streak.findFirst({
      where: { userId, type: 'workout' },
    });

    if (!streak) {
      streak = await this.prisma.streak.create({
        data: {
          userId,
          type: 'workout',
          currentCount: 1,
          longestCount: 1,
          lastActivityAt: new Date(),
        },
      });
    } else {
      const lastActivity = streak.lastActivityAt;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivity && lastActivity >= yesterday) {
        const lastActivityDate = new Date(lastActivity);
        lastActivityDate.setHours(0, 0, 0, 0);

        if (lastActivityDate.getTime() !== today.getTime()) {
          streak = await this.prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentCount: streak.currentCount + 1,
              longestCount: Math.max(streak.longestCount, streak.currentCount + 1),
              lastActivityAt: new Date(),
            },
          });
        }
      } else {
        streak = await this.prisma.streak.update({
          where: { id: streak.id },
          data: {
            currentCount: 1,
            lastActivityAt: new Date(),
          },
        });
      }
    }

    const milestones = [];
    if (streak.currentCount === 3) milestones.push({ days: 3, xp: XP_REWARDS.workoutStreak3 });
    if (streak.currentCount === 7) milestones.push({ days: 7, xp: XP_REWARDS.workoutStreak7 });
    if (streak.currentCount === 30) milestones.push({ days: 30, xp: XP_REWARDS.workoutStreak30 });

    return {
      currentStreak: streak.currentCount,
      longestStreak: streak.longestCount,
      milestones,
    };
  }

  async getLeaderboard(period: 'weekly' | 'monthly' = 'weekly', limit: number = 10) {
    const startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const workoutCounts = await this.prisma.workoutLog.groupBy({
      by: ['userId'],
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { totalVolume: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const userIds = workoutCounts.map((w) => w.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true },
    });

    return workoutCounts.map((wc, index) => {
      const user = users.find((u) => u.id === wc.userId);
      return {
        rank: index + 1,
        userId: wc.userId,
        name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
        avatarUrl: user?.avatarUrl,
        workoutCount: wc._count.id,
        totalVolume: wc._sum.totalVolume || 0,
        xpEarned: wc._count.id * XP_REWARDS.workoutCompleted,
      };
    });
  }

  async getChallenges(userId: string) {
    const challenges = [
      {
        id: 'weekly-warrior',
        title: '5 Workouts This Week',
        titleAr: '5 تمارين هذا الأسبوع',
        description: 'Complete 5 workouts in 7 days',
        xpReward: 150,
        type: 'workout_count',
        target: 5,
      },
      {
        id: 'volume-king',
        title: 'Lift 10,000kg',
        titleAr: 'ارفع 10,000 كجم',
        description: 'Total volume of 10,000kg this week',
        xpReward: 200,
        type: 'total_volume',
        target: 10000,
      },
    ];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
    });

    return challenges.map((challenge) => {
      let progress = 0;
      if (challenge.type === 'workout_count') {
        progress = workouts.length;
      } else if (challenge.type === 'total_volume') {
        progress = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
      }

      return {
        ...challenge,
        progress,
        completed: progress >= challenge.target,
        percentage: Math.min(100, Math.round((progress / challenge.target) * 100)),
      };
    });
  }

  private getLevelInfo(xp: number): LevelInfo {
    for (const level of LEVELS) {
      if (xp >= level.minXp && xp < level.maxXp) {
        return level;
      }
    }
    return LEVELS[LEVELS.length - 1];
  }
}
