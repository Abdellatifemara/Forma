import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        equipment: true,
        subscription: true,
        aiPreferences: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { appleId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateOnboarding(id: string, dto: UpdateOnboardingDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        fitnessGoal: dto.fitnessGoal,
        activityLevel: dto.activityLevel,
        heightCm: dto.heightCm,
        currentWeightKg: dto.currentWeightKg,
        targetWeightKg: dto.targetWeightKg,
        fitnessLevel: dto.fitnessLevel,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        onboardingCompletedAt: new Date(),
      },
    });

    // Update equipment if provided
    if (dto.equipment && dto.equipment.length > 0) {
      // Remove existing equipment
      await this.prisma.userEquipment.deleteMany({
        where: { userId: id },
      });

      // Add new equipment
      await this.prisma.userEquipment.createMany({
        data: dto.equipment.map((equip) => ({
          userId: id,
          equipment: equip,
        })),
      });
    }

    // Create or update AI preferences
    if (dto.aiPreferences) {
      await this.prisma.userAIPreference.upsert({
        where: { userId: id },
        update: dto.aiPreferences,
        create: {
          userId: id,
          ...dto.aiPreferences,
        },
      });
    }

    return updatedUser;
  }

  async updateLastActive(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get workout stats
    const workoutStats = await this.prisma.workoutLog.aggregate({
      where: { userId: id, status: 'COMPLETED' },
      _count: true,
      _sum: {
        totalVolume: true,
        caloriesBurned: true,
      },
    });

    // Get streak
    const streak = await this.prisma.streak.findUnique({
      where: {
        userId_type: {
          userId: id,
          type: 'workout',
        },
      },
    });

    // Get latest progress
    const latestProgress = await this.prisma.progressLog.findFirst({
      where: { userId: id },
      orderBy: { loggedAt: 'desc' },
    });

    return {
      workoutsCompleted: workoutStats._count,
      totalVolumeKg: workoutStats._sum.totalVolume || 0,
      totalCaloriesBurned: workoutStats._sum.caloriesBurned || 0,
      currentStreak: streak?.currentCount || 0,
      longestStreak: streak?.longestCount || 0,
      currentWeightKg: latestProgress?.weightKg || user.currentWeightKg,
      targetWeightKg: user.targetWeightKg,
    };
  }
}
