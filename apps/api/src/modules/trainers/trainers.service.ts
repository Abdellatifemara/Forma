import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainerProfile, TrainerStatus, Prisma } from '@prisma/client';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  async searchTrainers(params: {
    query?: string;
    specialization?: string;
    minRating?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { query, specialization, minRating, maxPrice, page = 1, pageSize = 20 } = params;
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
      where.averageRating = { gte: minRating };
    }

    if (maxPrice) {
      where.monthlyPrice = { lte: maxPrice };
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
            select: { clients: { where: { isActive: true } } },
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
      },
    });
  }
}
