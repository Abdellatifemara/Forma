import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateSquadDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

interface CreateChallengeDto {
  name: string;
  description?: string;
  type: 'workout_count' | 'total_volume' | 'streak_days' | 'calories_burned';
  target: number;
  durationDays: number;
}

@Injectable()
export class SquadsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new squad
  async createSquad(userId: string, dto: CreateSquadDto) {
    const squad = await this.prisma.squad.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        maxMembers: dto.maxMembers ?? 20,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            // Can't include user without relation, will add manually
          },
        },
      },
    });

    // Log activity
    await this.logActivity(squad.id, userId, 'squad_created', 'Created the squad');

    return squad;
  }

  // Get squads the user is a member of
  async getUserSquads(userId: string) {
    const memberships = await this.prisma.squadMember.findMany({
      where: { userId },
      include: {
        squad: {
          include: {
            members: true,
            challenges: {
              where: {
                endDate: { gte: new Date() },
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.squad,
      myRole: m.role,
      memberCount: m.squad.members.length,
      activeChallenges: m.squad.challenges.length,
    }));
  }

  // Get public squads to join
  async getPublicSquads(userId: string, search?: string) {
    // Get user's current squads
    const userSquadIds = await this.prisma.squadMember.findMany({
      where: { userId },
      select: { squadId: true },
    });

    const excludeIds = userSquadIds.map((s) => s.squadId);

    return this.prisma.squad.findMany({
      where: {
        isPublic: true,
        id: { notIn: excludeIds },
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        members: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // Get squad details
  async getSquad(squadId: string, userId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        members: true,
        challenges: {
          orderBy: { endDate: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!squad) {
      throw new NotFoundException('Squad not found');
    }

    // Check if user is a member
    const membership = squad.members.find((m) => m.userId === userId);

    if (!squad.isPublic && !membership) {
      throw new ForbiddenException('You are not a member of this squad');
    }

    // Get member details with user info
    const memberIds = squad.members.map((m) => m.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const membersWithDetails = squad.members.map((m) => {
      const user = users.find((u) => u.id === m.userId);
      return {
        ...m,
        user: {
          id: user?.id,
          name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
          avatarUrl: user?.avatarUrl,
        },
      };
    });

    // Get leaderboard data for active challenges
    const leaderboard = await this.getSquadLeaderboard(squadId);

    return {
      ...squad,
      members: membersWithDetails,
      myRole: membership?.role || null,
      isMember: !!membership,
      leaderboard,
    };
  }

  // Join a squad
  async joinSquad(squadId: string, userId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: { members: true },
    });

    if (!squad) {
      throw new NotFoundException('Squad not found');
    }

    if (!squad.isPublic) {
      throw new ForbiddenException('This squad is private');
    }

    if (squad.members.length >= squad.maxMembers) {
      throw new BadRequestException('Squad is full');
    }

    const existingMembership = squad.members.find((m) => m.userId === userId);
    if (existingMembership) {
      throw new BadRequestException('You are already a member of this squad');
    }

    await this.prisma.squadMember.create({
      data: {
        squadId,
        userId,
        role: 'member',
      },
    });

    // Log activity
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, displayName: true },
    });
    await this.logActivity(
      squadId,
      userId,
      'member_joined',
      `${user?.displayName || user?.firstName} joined the squad`,
    );

    return { success: true };
  }

  // Leave a squad
  async leaveSquad(squadId: string, userId: string) {
    const membership = await this.prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId, userId } },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this squad');
    }

    // Check if user is the only admin
    if (membership.role === 'admin') {
      const adminCount = await this.prisma.squadMember.count({
        where: { squadId, role: 'admin' },
      });

      if (adminCount === 1) {
        throw new BadRequestException('You are the only admin. Promote another member or delete the squad.');
      }
    }

    await this.prisma.squadMember.delete({
      where: { squadId_userId: { squadId, userId } },
    });

    // Log activity
    await this.logActivity(squadId, userId, 'member_left', 'Left the squad');

    return { success: true };
  }

  // Create a challenge
  async createChallenge(squadId: string, userId: string, dto: CreateChallengeDto) {
    // Verify user is admin or moderator
    const membership = await this.prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId, userId } },
    });

    if (!membership || !['admin', 'moderator'].includes(membership.role)) {
      throw new ForbiddenException('Only admins and moderators can create challenges');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dto.durationDays);

    const challenge = await this.prisma.squadChallenge.create({
      data: {
        squadId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        target: dto.target,
        startDate,
        endDate,
      },
    });

    // Log activity
    await this.logActivity(
      squadId,
      userId,
      'challenge_created',
      `Created challenge: ${dto.name}`,
    );

    return challenge;
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: string) {
    const challenge = await this.prisma.squadChallenge.findUnique({
      where: { id: challengeId },
      include: {
        squad: {
          include: { members: true },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const memberIds = challenge.squad.members.map((m) => m.userId);

    // Get progress for each member based on challenge type
    const leaderboard = await Promise.all(
      memberIds.map(async (userId) => {
        const progress = await this.calculateChallengeProgress(
          userId,
          challenge.type,
          challenge.startDate,
          challenge.endDate,
        );

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true, displayName: true, avatarUrl: true },
        });

        return {
          userId,
          name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
          avatarUrl: user?.avatarUrl,
          progress,
          percentage: Math.min(100, Math.round((progress / challenge.target) * 100)),
          completed: progress >= challenge.target,
        };
      }),
    );

    return leaderboard.sort((a, b) => b.progress - a.progress);
  }

  // Get squad leaderboard (overall weekly progress)
  async getSquadLeaderboard(squadId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: { members: true },
    });

    if (!squad) return [];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const leaderboard = await Promise.all(
      squad.members.map(async (member) => {
        // Get workout count this week
        const workoutCount = await this.prisma.workoutLog.count({
          where: {
            userId: member.userId,
            status: 'COMPLETED',
            completedAt: { gte: weekAgo },
          },
        });

        // Get total volume this week
        const logs = await this.prisma.workoutLog.findMany({
          where: {
            userId: member.userId,
            status: 'COMPLETED',
            completedAt: { gte: weekAgo },
          },
          select: { totalVolume: true },
        });
        const totalVolume = logs.reduce((sum, l) => sum + (l.totalVolume || 0), 0);

        const user = await this.prisma.user.findUnique({
          where: { id: member.userId },
          select: { firstName: true, lastName: true, displayName: true, avatarUrl: true },
        });

        return {
          userId: member.userId,
          name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
          avatarUrl: user?.avatarUrl,
          role: member.role,
          workoutCount,
          totalVolume,
          score: workoutCount * 100 + Math.floor(totalVolume / 100), // Simple scoring
        };
      }),
    );

    return leaderboard.sort((a, b) => b.score - a.score);
  }

  // Helper: Calculate challenge progress
  private async calculateChallengeProgress(
    userId: string,
    type: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    switch (type) {
      case 'workout_count':
        return this.prisma.workoutLog.count({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: { gte: startDate, lte: endDate },
          },
        });

      case 'total_volume':
        const logs = await this.prisma.workoutLog.findMany({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: { gte: startDate, lte: endDate },
          },
          select: { totalVolume: true },
        });
        return logs.reduce((sum, l) => sum + (l.totalVolume || 0), 0);

      case 'streak_days':
        // Count consecutive workout days
        const workoutDays = await this.prisma.workoutLog.findMany({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: { gte: startDate, lte: endDate },
          },
          select: { completedAt: true },
          orderBy: { completedAt: 'asc' },
        });

        const uniqueDays = new Set(
          workoutDays.map((w) =>
            w.completedAt?.toISOString().split('T')[0],
          ),
        );
        return uniqueDays.size;

      case 'calories_burned':
        const calLogs = await this.prisma.workoutLog.findMany({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: { gte: startDate, lte: endDate },
          },
          select: { caloriesBurned: true },
        });
        return calLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);

      default:
        return 0;
    }
  }

  // Helper: Log activity
  private async logActivity(
    squadId: string,
    userId: string,
    type: string,
    description: string,
  ) {
    return this.prisma.squadActivity.create({
      data: {
        squadId,
        userId,
        type,
        description,
      },
    });
  }

  // Share workout to squad
  async shareWorkout(squadId: string, userId: string, workoutLogId: string) {
    // Verify membership
    const membership = await this.prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this squad');
    }

    const workoutLog = await this.prisma.workoutLog.findUnique({
      where: { id: workoutLogId },
    });

    if (!workoutLog || workoutLog.userId !== userId) {
      throw new NotFoundException('Workout not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, displayName: true },
    });

    await this.logActivity(
      squadId,
      userId,
      'workout_shared',
      `${user?.displayName || user?.firstName} completed a ${workoutLog.durationMinutes || 0} minute workout!`,
    );

    return { success: true };
  }
}
