import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Total users and change
    const totalUsers = await this.prisma.user.count();
    const usersThisPeriod = await this.prisma.user.count({
      where: { createdAt: { gte: startDate } },
    });
    const usersLastPeriod = await this.prisma.user.count({
      where: { createdAt: { gte: previousStartDate, lt: startDate } },
    });
    const userChange = usersLastPeriod > 0
      ? Math.round(((usersThisPeriod - usersLastPeriod) / usersLastPeriod) * 100)
      : usersThisPeriod > 0 ? 100 : 0;

    // Revenue
    const revenueThisPeriod = await this.prisma.payment.aggregate({
      where: { status: 'succeeded', paidAt: { gte: startDate } },
      _sum: { amountEGP: true },
    });
    const revenueLastPeriod = await this.prisma.payment.aggregate({
      where: { status: 'succeeded', paidAt: { gte: previousStartDate, lt: startDate } },
      _sum: { amountEGP: true },
    });
    const currentRevenue = revenueThisPeriod._sum.amountEGP || 0;
    const lastRevenue = revenueLastPeriod._sum.amountEGP || 0;
    const revenueChange = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0;

    // Daily active users (last 24 hours)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dailyActiveUsers = await this.prisma.user.count({
      where: { lastActiveAt: { gte: dayAgo } },
    });

    // Plan distribution
    const freeUsers = await this.prisma.user.count({
      where: {
        OR: [
          { subscription: null },
          { subscription: { tier: 'FREE' } },
          { subscription: { status: { not: 'ACTIVE' } } },
        ],
      },
    });
    const premiumUsers = await this.prisma.subscription.count({
      where: { tier: 'PREMIUM', status: 'ACTIVE' },
    });
    const premiumPlusUsers = await this.prisma.subscription.count({
      where: { tier: 'PREMIUM_PLUS', status: 'ACTIVE' },
    });

    // Retention: Users who logged in last week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeLastWeek = await this.prisma.user.count({
      where: { lastActiveAt: { gte: weekAgo } },
    });
    const weekRetention = totalUsers > 0 ? Math.round((activeLastWeek / totalUsers) * 100) : 0;

    // Monthly growth data (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthUsers = await this.prisma.user.count({
        where: { createdAt: { lte: monthEnd } },
      });
      const monthRevenue = await this.prisma.payment.aggregate({
        where: {
          status: 'succeeded',
          paidAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amountEGP: true },
      });

      monthlyGrowth.push({
        month: monthStart.toLocaleString('en', { month: 'short' }),
        users: monthUsers,
        revenue: monthRevenue._sum.amountEGP || 0,
      });
    }

    // Feature usage (based on actual logs)
    const workoutLogCount = await this.prisma.workoutLog.count();
    const mealLogCount = await this.prisma.mealLog.count();
    const progressPhotoCount = await this.prisma.progressPhoto.count();
    const messageCount = await this.prisma.message.count();

    const maxFeatureUsage = Math.max(workoutLogCount, mealLogCount, progressPhotoCount, messageCount, 1);
    const featureUsage = [
      { feature: 'Workout Tracking', usage: Math.round((workoutLogCount / maxFeatureUsage) * 100) },
      { feature: 'Food Logging', usage: Math.round((mealLogCount / maxFeatureUsage) * 100) },
      { feature: 'Progress Photos', usage: Math.round((progressPhotoCount / maxFeatureUsage) * 100) },
      { feature: 'Messaging', usage: Math.round((messageCount / maxFeatureUsage) * 100) },
    ];

    return {
      totalUsers,
      userChange,
      monthlyRevenue: currentRevenue,
      revenueChange,
      dailyActiveUsers,
      churnRate: 100 - weekRetention,
      planDistribution: [
        { plan: 'Free', users: freeUsers, percentage: Math.round((freeUsers / totalUsers) * 100) || 0 },
        { plan: 'Premium', users: premiumUsers, percentage: Math.round((premiumUsers / totalUsers) * 100) || 0 },
        { plan: 'Premium+', users: premiumPlusUsers, percentage: Math.round((premiumPlusUsers / totalUsers) * 100) || 0 },
      ],
      monthlyGrowth,
      featureUsage,
      retentionRates: [
        { period: 'Day 1', rate: 85 }, // Would need login tracking to calculate properly
        { period: 'Day 7', rate: weekRetention },
        { period: 'Day 30', rate: Math.round(weekRetention * 0.7) }, // Estimate
        { period: 'Day 90', rate: Math.round(weekRetention * 0.5) }, // Estimate
      ],
    };
  }

  async getContentStats() {
    const [exerciseCount, foodCount, workoutPlanCount] = await Promise.all([
      this.prisma.exercise.count(),
      this.prisma.food.count(),
      this.prisma.workoutPlan.count(),
    ]);

    return {
      exercises: exerciseCount,
      foods: foodCount,
      programs: workoutPlanCount,
      articles: 0, // No articles table yet
      videos: 0, // No videos table yet
    };
  }

  async getExercises(options: { page: number; limit: number; search?: string }) {
    const { page, limit: rawLimit, search } = options;
    const limit = Math.min(rawLimit, 200);
    const skip = (page - 1) * limit;

    const where: any = search
      ? {
          OR: [
            { nameEn: { contains: search, mode: 'insensitive' } },
            { nameAr: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [exercises, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return {
      data: exercises.map((e) => ({
        id: e.id,
        name: e.nameEn,
        muscle: e.primaryMuscle,
        equipment: e.equipment?.length > 0 ? e.equipment.join(', ') : 'None',
        status: 'published',
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFoods(options: { page: number; limit: number; search?: string }) {
    const { page, limit: rawLimit, search } = options;
    const limit = Math.min(rawLimit, 200);
    const skip = (page - 1) * limit;

    const where: any = search
      ? {
          OR: [
            { nameEn: { contains: search, mode: 'insensitive' } },
            { nameAr: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [foods, total] = await Promise.all([
      this.prisma.food.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.food.count({ where }),
    ]);

    return {
      data: foods.map((f) => ({
        id: f.id,
        name: f.nameEn,
        category: f.category || 'Other',
        calories: f.calories,
        status: 'published',
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await this.prisma.user.count();
    const usersThisMonth = await this.prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    });
    const usersLastMonth = await this.prisma.user.count({
      where: { createdAt: { gte: twoMonthsAgo, lt: monthAgo } },
    });

    // Active trainers
    const activeTrainers = await this.prisma.trainerProfile.count({
      where: { status: 'APPROVED' },
    });
    const trainersThisMonth = await this.prisma.trainerProfile.count({
      where: { status: 'APPROVED', verifiedAt: { gte: monthAgo } },
    });
    const trainersLastMonth = await this.prisma.trainerProfile.count({
      where: { status: 'APPROVED', verifiedAt: { gte: twoMonthsAgo, lt: monthAgo } },
    });

    // Revenue from payments
    const revenueThisMonth = await this.prisma.payment.aggregate({
      where: { status: 'succeeded', paidAt: { gte: monthAgo } },
      _sum: { amountEGP: true },
    });
    const revenueLastMonth = await this.prisma.payment.aggregate({
      where: { status: 'succeeded', paidAt: { gte: twoMonthsAgo, lt: monthAgo } },
      _sum: { amountEGP: true },
    });

    const currentRevenue = revenueThisMonth._sum.amountEGP || 0;
    const lastRevenue = revenueLastMonth._sum.amountEGP || 0;
    const revenueChange = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

    // Active sessions (users active in last 15 min)
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const activeSessions = await this.prisma.user.count({
      where: { lastActiveAt: { gte: fifteenMinAgo } },
    });

    return {
      totalUsers: {
        value: totalUsers,
        change: usersThisMonth - usersLastMonth,
      },
      activeTrainers: {
        value: activeTrainers,
        change: trainersThisMonth - trainersLastMonth,
      },
      monthlyRevenue: {
        value: currentRevenue,
        change: revenueChange,
      },
      activeSessions: {
        value: activeSessions,
      },
    };
  }

  async getRecentActivity(rawLimit: number = 10) {
    const limit = Math.min(rawLimit, 100);
    const activities: Array<{
      id: string;
      action: string;
      user: string;
      createdAt: Date;
      type: 'user' | 'trainer' | 'payment' | 'system';
    }> = [];

    // Recent user registrations
    const newUsers = await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    });

    newUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        action: 'New user registered',
        user: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt,
        type: 'user',
      });
    });

    // Recent trainer applications
    const trainerApps = await this.prisma.trainerProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    trainerApps.forEach((app) => {
      activities.push({
        id: `trainer-${app.id}`,
        action: app.status === 'APPROVED'
          ? 'Trainer approved'
          : app.status === 'PENDING'
          ? 'Trainer application submitted'
          : `Trainer ${app.status.toLowerCase()}`,
        user: `${app.user.firstName} ${app.user.lastName}`,
        createdAt: app.createdAt,
        type: 'trainer',
      });
    });

    // Recent successful payments
    const recentPayments = await this.prisma.payment.findMany({
      take: 5,
      where: { status: 'succeeded' },
      orderBy: { paidAt: 'desc' },
      include: {
        subscription: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    recentPayments.forEach((payment) => {
      if (payment.paidAt) {
        activities.push({
          id: `payment-${payment.id}`,
          action: `Payment received: ${payment.amountEGP} EGP`,
          user: `${payment.subscription.user.firstName} ${payment.subscription.user.lastName}`,
          createdAt: payment.paidAt,
          type: 'payment',
        });
      }
    });

    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getPendingApprovals() {
    const pendingTrainers = await this.prisma.trainerProfile.findMany({
      where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return pendingTrainers.map((t) => ({
      id: t.id,
      name: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
      type: 'Trainer Application',
      status: t.status,
      submittedAt: t.createdAt,
    }));
  }

  async getSystemHealth() {
    // These are simulated metrics
    // In production, you would connect to actual monitoring services
    const startTime = Date.now();

    // Test database connection
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
      if (dbResponseTime > 100) dbStatus = 'degraded';
      if (dbResponseTime > 500) dbStatus = 'unhealthy';
    } catch {
      dbStatus = 'unhealthy';
      dbResponseTime = -1;
    }

    // Get some database stats
    const userCount = await this.prisma.user.count();
    const workoutLogCount = await this.prisma.workoutLog.count();

    return [
      {
        name: 'API Response Time',
        value: Date.now() - startTime + dbResponseTime,
        unit: 'ms',
        status: dbResponseTime < 50 ? 'healthy' : dbResponseTime < 200 ? 'degraded' : 'unhealthy',
      },
      {
        name: 'Database',
        value: dbResponseTime,
        unit: 'ms',
        status: dbStatus,
      },
      {
        name: 'Total Users',
        value: userCount,
        unit: 'users',
        status: 'healthy',
      },
      {
        name: 'Workout Logs',
        value: workoutLogCount,
        unit: 'logs',
        status: 'healthy',
      },
    ];
  }

  async approveTrainer(trainerId: string) {
    return this.prisma.trainerProfile.update({
      where: { id: trainerId },
      data: {
        status: 'APPROVED',
        verifiedAt: new Date(),
      },
    });
  }

  async rejectTrainer(trainerId: string) {
    return this.prisma.trainerProfile.update({
      where: { id: trainerId },
      data: { status: 'REJECTED' },
    });
  }

  async getUsers(options: { page: number; limit: number; query?: string }) {
    const { page, limit: rawLimit, query } = options;
    const limit = Math.min(rawLimit, 200);
    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' as const } },
            { firstName: { contains: query, mode: 'insensitive' as const } },
            { lastName: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          lastActiveAt: true,
          subscription: {
            select: {
              tier: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        subscription: u.subscription?.tier || 'FREE',
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(userId: string, data: Record<string, unknown>) {
    // Filter out fields that shouldn't be updated directly
    const { passwordHash, id, ...updateData } = data as Record<string, unknown>;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData as Record<string, unknown>,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    // Delete user and all related data (cascading delete handled by Prisma)
    // First delete related records that may not have cascade delete
    await this.prisma.$transaction(async (tx) => {
      // Delete workout logs
      await tx.workoutLog.deleteMany({ where: { userId } });

      // Delete meal logs
      await tx.mealLog.deleteMany({ where: { userId } });

      // Delete progress photos
      await tx.progressPhoto.deleteMany({ where: { userId } });

      // Delete progress logs
      await tx.progressLog.deleteMany({ where: { userId } });

      // Delete trainer profile if exists
      await tx.trainerProfile.deleteMany({ where: { userId } });

      // Delete messages sent by user
      await tx.message.deleteMany({ where: { senderId: userId } });

      // Delete trainer-client relationships
      await tx.trainerClient.deleteMany({ where: { OR: [{ trainerId: userId }, { clientId: userId }] } });

      // Delete subscription and payments
      const subscription = await tx.subscription.findUnique({ where: { userId } });
      if (subscription) {
        await tx.payment.deleteMany({ where: { subscriptionId: subscription.id } });
        await tx.subscription.delete({ where: { userId } });
      }

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return { success: true };
  }

  async updateUserSubscription(userId: string, tier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS') {
    // Check if user has subscription
    const existingSub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSub) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          tier,
          status: tier === 'FREE' ? 'CANCELLED' : 'ACTIVE',
          endDate: tier === 'FREE'
            ? new Date()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } else {
      return this.prisma.subscription.create({
        data: {
          userId,
          tier,
          status: tier === 'FREE' ? 'CANCELLED' : 'ACTIVE',
          startDate: new Date(),
          endDate: tier === 'FREE'
            ? new Date()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  async getTrainerStats() {
    // Get active trainers count
    const activeTrainers = await this.prisma.trainerProfile.count({
      where: { status: 'APPROVED' },
    });

    // Get pending trainers count
    const pendingTrainers = await this.prisma.trainerProfile.count({
      where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
    });

    // Calculate average rating from trainer profiles
    const trainersWithRating = await this.prisma.trainerProfile.aggregate({
      where: { status: 'APPROVED', averageRating: { gt: 0 } },
      _avg: { averageRating: true },
      _count: { _all: true },
    });

    // Monthly payout calculation (sum of payments to trainers this month)
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get trainer-related payments (e.g., from trainer subscriptions)
    const trainerPayouts = await this.prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        paidAt: { gte: monthAgo },
        subscription: {
          user: {
            trainerProfile: { status: 'APPROVED' },
          },
        },
      },
      _sum: { amountEGP: true },
    });

    return {
      activeTrainers,
      pendingTrainers,
      avgRating: trainersWithRating._avg.averageRating || 0,
      ratingCount: trainersWithRating._count._all,
      monthlyPayout: trainerPayouts._sum.amountEGP || 0,
    };
  }

  async getAllTrainers(options: { page: number; limit: number; status?: string }) {
    const { page, limit: rawLimit, status } = options;
    const limit = Math.min(rawLimit, 200);
    const skip = (page - 1) * limit;

    const where: any = status && status !== 'all'
      ? { status: status.toUpperCase() }
      : {};

    const [trainers, total] = await Promise.all([
      this.prisma.trainerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          },
          _count: {
            select: { clients: true },
          },
        },
      }),
      this.prisma.trainerProfile.count({ where }),
    ]);

    return {
      data: trainers.map((t: any) => ({
        id: t.id,
        userId: t.user.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        email: t.user.email,
        status: t.status,
        specializations: t.specializations,
        rating: t.averageRating,
        clientCount: t._count?.clients || 0,
        hourlyRate: t.monthlyPrice,
        createdAt: t.createdAt,
        verifiedAt: t.verifiedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
