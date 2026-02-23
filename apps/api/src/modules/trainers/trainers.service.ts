import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainerProfile, TrainerStatus, Prisma } from '@prisma/client';

@Injectable()
export class TrainersService {
  private readonly logger = new Logger(TrainersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async searchTrainers(params: {
    query?: string;
    specialization?: string;
    minRating?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  }) {
    try {
      const { query, specialization, minRating, maxPrice, page = 1, pageSize: rawPageSize = 20 } = params;
      const pageSize = Math.min(rawPageSize, 50);
      const skip = (page - 1) * pageSize;

      const where: Prisma.TrainerProfileWhereInput = {
        status: 'APPROVED',
        acceptingClients: true,
      };

      if (query) {
        where.user = {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        };
      }

      if (specialization) {
        where.specializations = { has: specialization };
      }

      if (minRating) {
        where.averageRating = { gte: Number(minRating) };
      }

      if (maxPrice) {
        where.monthlyPrice = { lte: Number(maxPrice) };
      }

      const [trainers, total] = await Promise.all([
        this.prisma.trainerProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            certifications: {
              where: { isVerified: true },
            },
            _count: {
              select: { clients: true },
            },
          },
          orderBy: { averageRating: 'desc' },
          skip,
          take: pageSize,
        }),
        this.prisma.trainerProfile.count({ where }),
      ]);

      return {
        trainers,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error('searchTrainers failed:', error);
      // Return empty result instead of 500
      return { trainers: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
  }

  async getTrainerById(id: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        certifications: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { clients: { where: { isActive: true } } },
        },
      },
    });

    if (!trainer || trainer.status !== 'APPROVED') {
      throw new NotFoundException('Trainer not found');
    }

    return trainer;
  }

  async getMyTrainerProfile(userId: string) {
    return this.prisma.trainerProfile.findUnique({
      where: { userId },
      include: {
        certifications: true,
        clients: {
          where: { isActive: true },
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                fitnessGoal: true,
                currentWeightKg: true,
                targetWeightKg: true,
              },
            },
          },
        },
        _count: {
          select: {
            clients: { where: { isActive: true } },
            reviews: true,
          },
        },
      },
    });
  }

  async applyAsTrainer(
    userId: string,
    data: {
      bio: string;
      specializations: string[];
      yearsExperience: number;
      monthlyPrice: number;
      instagramHandle?: string;
    },
  ) {
    // Check if already a trainer
    const existing = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ForbiddenException('Already registered as trainer');
    }

    return this.prisma.trainerProfile.create({
      data: {
        userId,
        bio: data.bio,
        specializations: data.specializations,
        yearsExperience: data.yearsExperience,
        monthlyPrice: data.monthlyPrice,
        instagramHandle: data.instagramHandle,
        status: 'PENDING',
      },
    });
  }

  async getMyClients(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    return this.prisma.trainerClient.findMany({
      where: {
        trainerId: trainer.id,
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            fitnessGoal: true,
            currentWeightKg: true,
            targetWeightKg: true,
            lastActiveAt: true,
          },
        },
        program: {
          select: {
            id: true,
            nameEn: true,
          },
        },
      },
    });
  }

  async getDashboardStats(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for stats
    const [
      activeClients,
      newClientsThisMonth,
      lastMonthClients,
      currentMonthRevenue,
      lastMonthRevenue,
      avgCompliance,
      complianceBreakdown,
    ] = await Promise.all([
      // Active clients count
      this.prisma.trainerClient.count({
        where: { trainerId: trainer.id, isActive: true },
      }),
      // New clients this month
      this.prisma.trainerClient.count({
        where: {
          trainerId: trainer.id,
          startDate: { gte: startOfMonth },
        },
      }),
      // Clients last month (for comparison)
      this.prisma.trainerClient.count({
        where: {
          trainerId: trainer.id,
          isActive: true,
          startDate: { lte: endOfLastMonth },
        },
      }),
      // Revenue this month
      this.prisma.trainerTransaction.aggregate({
        where: {
          trainerId: trainer.id,
          createdAt: { gte: startOfMonth },
          status: { in: ['COMPLETED', 'PAID_OUT'] },
          type: { in: ['SUBSCRIPTION', 'PROGRAM_PURCHASE'] },
        },
        _sum: { amountEGP: true },
      }),
      // Revenue last month
      this.prisma.trainerTransaction.aggregate({
        where: {
          trainerId: trainer.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { in: ['COMPLETED', 'PAID_OUT'] },
          type: { in: ['SUBSCRIPTION', 'PROGRAM_PURCHASE'] },
        },
        _sum: { amountEGP: true },
      }),
      // Average compliance rate
      this.prisma.trainerClient.aggregate({
        where: {
          trainerId: trainer.id,
          isActive: true,
        },
        _avg: { complianceRate: true },
      }),
      // Compliance breakdown
      Promise.all([
        this.prisma.trainerClient.count({
          where: { trainerId: trainer.id, isActive: true, complianceRate: { gte: 80 } },
        }),
        this.prisma.trainerClient.count({
          where: { trainerId: trainer.id, isActive: true, complianceRate: { gte: 50, lt: 80 } },
        }),
        this.prisma.trainerClient.count({
          where: { trainerId: trainer.id, isActive: true, complianceRate: { lt: 50 } },
        }),
      ]),
    ]);

    const monthlyRevenue = currentMonthRevenue._sum.amountEGP || 0;
    const previousRevenue = lastMonthRevenue._sum.amountEGP || 0;
    const revenueChange = previousRevenue > 0
      ? Math.round(((monthlyRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    return {
      activeClients,
      newClientsThisMonth,
      clientsChange: activeClients - lastMonthClients,
      monthlyRevenue,
      revenueChange,
      pendingPayout: trainer.pendingPayoutEGP,
      totalEarnings: trainer.totalEarnings,
      averageRating: trainer.averageRating,
      totalReviews: trainer.totalReviews,
      tier: trainer.tier,
      commissionRate: trainer.commissionRate,
      avgCompliance: Math.round(avgCompliance._avg.complianceRate || 0),
      complianceBreakdown: {
        highPerformers: complianceBreakdown[0],
        needAttention: complianceBreakdown[1],
        atRisk: complianceBreakdown[2],
      },
      inviteCode: trainer.inviteCode,
    };
  }

  async getEarningsBreakdown(userId: string, month?: number, year?: number) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    // Return empty data for non-trainers instead of throwing
    if (!trainer) {
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();
      const nextPayoutDate = new Date();
      if (nextPayoutDate.getDate() > 15) {
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
      }
      nextPayoutDate.setDate(15);

      return {
        month: targetMonth,
        year: targetYear,
        grossRevenue: 0,
        breakdown: { subscriptions: 0, programs: 0, tips: 0 },
        platformFee: 0,
        platformFeePercentage: 15,
        netEarnings: 0,
        payouts: 0,
        pendingPayout: 0,
        nextPayoutDate: nextPayoutDate.toISOString(),
        transactions: [],
      };
    }

    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    const transactions = await this.prisma.trainerTransaction.findMany({
      where: {
        trainerId: trainer.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const subscriptionRevenue = transactions
      .filter(t => t.type === 'SUBSCRIPTION' && t.status !== 'REFUNDED')
      .reduce((sum, t) => sum + t.amountEGP, 0);

    const programRevenue = transactions
      .filter(t => t.type === 'PROGRAM_PURCHASE' && t.status !== 'REFUNDED')
      .reduce((sum, t) => sum + t.amountEGP, 0);

    const tips = transactions
      .filter(t => t.type === 'TIP' && t.status !== 'REFUNDED')
      .reduce((sum, t) => sum + t.amountEGP, 0);

    const grossRevenue = subscriptionRevenue + programRevenue + tips;
    const platformFee = grossRevenue * trainer.commissionRate;
    const netEarnings = grossRevenue - platformFee;

    const payouts = transactions
      .filter(t => t.type === 'PAYOUT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amountEGP, 0);

    // Get next payout date (15th of next month if past 15th, else 15th of current month)
    const nextPayoutDate = new Date();
    if (nextPayoutDate.getDate() > 15) {
      nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    }
    nextPayoutDate.setDate(15);

    return {
      month: targetMonth,
      year: targetYear,
      grossRevenue,
      breakdown: {
        subscriptions: subscriptionRevenue,
        programs: programRevenue,
        tips,
      },
      platformFee,
      platformFeePercentage: trainer.commissionRate * 100,
      netEarnings,
      payouts,
      pendingPayout: trainer.pendingPayoutEGP,
      nextPayoutDate: nextPayoutDate.toISOString(),
      transactions: transactions.slice(0, 20), // Latest 20 transactions
    };
  }

  async getClientById(userId: string, clientId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const trainerClient = await this.prisma.trainerClient.findUnique({
      where: {
        trainerId_clientId: {
          trainerId: trainer.id,
          clientId: clientId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            fitnessGoal: true,
            currentWeightKg: true,
            targetWeightKg: true,
            heightCm: true,
            lastActiveAt: true,
            createdAt: true,
          },
        },
        program: {
          select: {
            id: true,
            nameEn: true,
            descriptionEn: true,
            durationWeeks: true,
          },
        },
      },
    });

    if (!trainerClient) {
      throw new NotFoundException('Client not found');
    }

    // Get workout logs for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workoutLogs, mealLogs, progressLogs] = await Promise.all([
      this.prisma.workoutLog.findMany({
        where: {
          userId: clientId,
          completedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { completedAt: 'desc' },
        take: 30,
      }),
      this.prisma.mealLog.findMany({
        where: {
          userId: clientId,
          loggedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { loggedAt: 'desc' },
        take: 30,
      }),
      this.prisma.progressLog.findMany({
        where: {
          userId: clientId,
          weightKg: { not: null },
        },
        orderBy: { loggedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate compliance breakdown
    const workoutCompliance = workoutLogs.length > 0
      ? Math.round((workoutLogs.filter((l: { completedAt: Date | null }) => l.completedAt).length / 30) * 100)
      : 0;
    const nutritionCompliance = mealLogs.length > 0
      ? Math.round((mealLogs.length / 30) * 100)
      : 0;

    // Calculate weekly trend (last 4 weeks)
    const weeklyTrend: { week: string; compliance: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekWorkouts = workoutLogs.filter((l: { completedAt: Date | null }) => {
        if (!l.completedAt) return false;
        const date = new Date(l.completedAt);
        return date >= weekStart && date < weekEnd;
      }).length;

      weeklyTrend.push({
        week: `Week ${4 - i}`,
        compliance: Math.min(100, Math.round((weekWorkouts / 5) * 100)), // Assuming 5 workouts per week target
      });
    }

    // Calculate weight progress from ProgressLog
    const startWeight = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1].weightKg : trainerClient.client.currentWeightKg;
    const currentWeight = progressLogs.length > 0 ? progressLogs[0].weightKg : trainerClient.client.currentWeightKg;
    const weightProgress = startWeight && currentWeight ? currentWeight - startWeight : 0;

    return {
      id: trainerClient.id,
      clientId: trainerClient.clientId,
      client: {
        ...trainerClient.client,
        name: `${trainerClient.client.firstName} ${trainerClient.client.lastName}`,
      },
      program: trainerClient.program,
      startDate: trainerClient.startDate,
      isActive: trainerClient.isActive,
      canSeeMarketplace: trainerClient.canSeeMarketplace,
      premiumGifted: trainerClient.premiumGifted,
      compliance: {
        overall: trainerClient.complianceRate,
        workout: workoutCompliance,
        nutrition: nutritionCompliance,
        weeklyTrend,
      },
      stats: {
        workoutsCompleted: workoutLogs.length,
        totalVolume: workoutLogs.reduce((sum: number, l: { totalVolume: number | null }) => sum + (l.totalVolume || 0), 0),
        avgCalories: mealLogs.length > 0
          ? Math.round(mealLogs.reduce((sum: number, l: { totalCalories: number | null }) => sum + (l.totalCalories || 0), 0) / mealLogs.length)
          : 0,
        weightProgress,
        currentWeight,
        startWeight,
      },
      recentActivity: {
        lastWorkout: workoutLogs[0]?.completedAt || null,
        lastNutritionLog: mealLogs[0]?.loggedAt || null,
      },
    };
  }

  async getClientCompliance(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const clients = await this.prisma.trainerClient.findMany({
      where: {
        trainerId: trainer.id,
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            lastActiveAt: true,
          },
        },
        program: {
          select: {
            id: true,
            nameEn: true,
          },
        },
      },
      orderBy: { complianceRate: 'asc' },
    });

    const avgCompliance = clients.length > 0
      ? clients.reduce((sum, c) => sum + c.complianceRate, 0) / clients.length
      : 0;

    return {
      averageCompliance: Math.round(avgCompliance),
      totalClients: clients.length,
      breakdown: {
        highPerformers: clients.filter(c => c.complianceRate >= 80),
        needAttention: clients.filter(c => c.complianceRate >= 50 && c.complianceRate < 80),
        atRisk: clients.filter(c => c.complianceRate < 50),
      },
      clients: clients.map(c => ({
        id: c.id,
        clientId: c.clientId,
        name: `${c.client.firstName} ${c.client.lastName}`,
        avatarUrl: c.client.avatarUrl,
        complianceRate: c.complianceRate,
        lastActiveAt: c.client.lastActiveAt,
        program: c.program?.nameEn || 'No program',
        canSeeMarketplace: c.canSeeMarketplace,
        premiumGifted: c.premiumGifted,
      })),
    };
  }

  async generateInviteCode(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    // Generate code from trainer name + random string
    const baseName = trainer.user.firstName?.toUpperCase().replace(/[^A-Z]/g, '') || 'TRAINER';
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${baseName}-${randomPart}`;

    const updatedTrainer = await this.prisma.trainerProfile.update({
      where: { id: trainer.id },
      data: { inviteCode: code },
    });

    return { inviteCode: updatedTrainer.inviteCode };
  }

  async createInviteLink(userId: string, grantsPremium: boolean = false) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    // Only trusted partners can gift premium
    if (grantsPremium && trainer.tier !== 'TRUSTED_PARTNER') {
      throw new ForbiddenException('Only trusted partners can gift premium access');
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const invite = await this.prisma.trainerInvite.create({
      data: {
        trainerId: trainer.id,
        code,
        grantsPremium,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      code: invite.code,
      grantsPremium: invite.grantsPremium,
      expiresAt: invite.expiresAt,
      link: `https://formaeg.com/join/${invite.code}`,
    };
  }

  async verifyInviteCode(code: string) {
    const invite = await this.prisma.trainerInvite.findUnique({
      where: { code },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    if (!invite.isActive) {
      throw new ForbiddenException('This invite code has been deactivated');
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new ForbiddenException('This invite code has expired');
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new ForbiddenException('This invite code has reached its maximum uses');
    }

    return {
      valid: true,
      trainer: {
        id: invite.trainer.id,
        name: `${invite.trainer.user.firstName} ${invite.trainer.user.lastName}`,
        avatarUrl: invite.trainer.user.avatarUrl,
        specializations: invite.trainer.specializations,
        tier: invite.trainer.tier,
      },
      grantsPremium: invite.grantsPremium,
      expiresAt: invite.expiresAt,
    };
  }

  async redeemInviteCode(code: string, clientUserId: string) {
    // First verify the code
    const invite = await this.prisma.trainerInvite.findUnique({
      where: { code },
      include: { trainer: true },
    });

    if (!invite || !invite.isActive) {
      throw new ForbiddenException('Invalid or inactive invite code');
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new ForbiddenException('This invite code has expired');
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new ForbiddenException('This invite code has reached its maximum uses');
    }

    // Check if already a client of this trainer
    const existingRelation = await this.prisma.trainerClient.findUnique({
      where: {
        trainerId_clientId: {
          trainerId: invite.trainerId,
          clientId: clientUserId,
        },
      },
    });

    if (existingRelation) {
      throw new ForbiddenException('You are already connected with this trainer');
    }

    // Create client relationship
    const isTrustedPartner = invite.trainer.tier === 'TRUSTED_PARTNER';

    const [_, trainerClient] = await this.prisma.$transaction([
      // Increment invite uses
      this.prisma.trainerInvite.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      }),
      // Create trainer-client relationship
      this.prisma.trainerClient.create({
        data: {
          trainerId: invite.trainerId,
          clientId: clientUserId,
          invitedVia: code,
          canSeeMarketplace: !isTrustedPartner, // Trusted partner clients can't see marketplace
          premiumGifted: invite.grantsPremium,
        },
      }),
    ]);

    // Note: Premium gifting is tracked via premiumGifted field
    // Actual subscription upgrade should be handled by subscription management module

    return {
      success: true,
      trainerId: invite.trainerId,
      premiumGranted: invite.grantsPremium,
      canSeeMarketplace: !isTrustedPartner,
    };
  }

  async getMyInvites(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const invites = await this.prisma.trainerInvite.findMany({
      where: { trainerId: trainer.id },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map(invite => ({
      id: invite.id,
      code: invite.code,
      link: `https://formaeg.com/join/${invite.code}`,
      uses: invite.uses,
      maxUses: invite.maxUses,
      grantsPremium: invite.grantsPremium,
      expiresAt: invite.expiresAt,
      isActive: invite.isActive,
      createdAt: invite.createdAt,
      isExpired: invite.expiresAt ? new Date() > invite.expiresAt : false,
    }));
  }

  async deactivateInvite(userId: string, inviteId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const invite = await this.prisma.trainerInvite.findFirst({
      where: { id: inviteId, trainerId: trainer.id },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.prisma.trainerInvite.update({
      where: { id: inviteId },
      data: { isActive: false },
    });

    return { success: true };
  }

  async assignProgramToClient(userId: string, clientId: string, programId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    // Verify the client belongs to this trainer
    const trainerClient = await this.prisma.trainerClient.findUnique({
      where: {
        trainerId_clientId: {
          trainerId: trainer.id,
          clientId,
        },
      },
    });

    if (!trainerClient) {
      throw new NotFoundException('Client not found');
    }

    // Verify the program belongs to this trainer
    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId: trainer.id,
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Assign the program
    const updated = await this.prisma.trainerClient.update({
      where: { id: trainerClient.id },
      data: {
        currentProgramId: programId,
        programStartDate: new Date(),
        programEndDate: program.durationWeeks
          ? new Date(Date.now() + program.durationWeeks * 7 * 24 * 60 * 60 * 1000)
          : null,
      },
      include: {
        program: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            durationWeeks: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      client: {
        id: updated.clientId,
        name: `${updated.client.firstName} ${updated.client.lastName}`,
      },
      program: updated.program,
      programStartDate: updated.programStartDate,
      programEndDate: updated.programEndDate,
    };
  }
}
