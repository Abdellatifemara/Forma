import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getRecentActivity(limit: number = 10) {
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
    const { page, limit, query } = options;
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
}
