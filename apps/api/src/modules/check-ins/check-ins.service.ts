import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCheckInDto {
  workoutCompleted?: boolean;
  workoutRating?: number;
  workoutNotes?: string;
  nutritionCompleted?: boolean;
  nutritionRating?: number;
  nutritionNotes?: string;
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  musclesoreness?: number;
  mood?: number;
  notes?: string;
}

@Injectable()
export class CheckInsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(userId: string, data: CreateCheckInDto, date?: Date) {
    const checkInDate = date || new Date();
    // Normalize to just the date (no time)
    const normalizedDate = new Date(checkInDate.toISOString().split('T')[0]);

    // Try to find existing check-in for this date
    const existing = await this.prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date: normalizedDate,
        },
      },
    });

    if (existing) {
      // Update existing
      return this.prisma.dailyCheckIn.update({
        where: { id: existing.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    }

    // Create new
    return this.prisma.dailyCheckIn.create({
      data: {
        userId,
        date: normalizedDate,
        ...data,
      },
    });
  }

  async getByDate(userId: string, date: Date) {
    const normalizedDate = new Date(date.toISOString().split('T')[0]);

    return this.prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date: normalizedDate,
        },
      },
    });
  }

  async getToday(userId: string) {
    return this.getByDate(userId, new Date());
  }

  async getHistory(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getWeeklyStats(userId: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const checkIns = await this.prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    if (checkIns.length === 0) {
      return null;
    }

    // Calculate averages
    const stats = {
      totalCheckIns: checkIns.length,
      workoutsCompleted: checkIns.filter((c) => c.workoutCompleted).length,
      nutritionCompleted: checkIns.filter((c) => c.nutritionCompleted).length,
      avgWorkoutRating: this.average(checkIns.map((c) => c.workoutRating)),
      avgNutritionRating: this.average(checkIns.map((c) => c.nutritionRating)),
      avgSleepHours: this.average(checkIns.map((c) => c.sleepHours)),
      avgSleepQuality: this.average(checkIns.map((c) => c.sleepQuality)),
      avgEnergyLevel: this.average(checkIns.map((c) => c.energyLevel)),
      avgStressLevel: this.average(checkIns.map((c) => c.stressLevel)),
      avgMood: this.average(checkIns.map((c) => c.mood)),
    };

    return stats;
  }

  async getComplianceRate(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const checkIns = await this.prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    const workoutCompliance =
      checkIns.filter((c) => c.workoutCompleted).length / days;
    const nutritionCompliance =
      checkIns.filter((c) => c.nutritionCompleted).length / days;
    const checkInCompliance = checkIns.length / days;

    return {
      workoutCompliance: Math.round(workoutCompliance * 100),
      nutritionCompliance: Math.round(nutritionCompliance * 100),
      checkInCompliance: Math.round(checkInCompliance * 100),
      totalDays: days,
      checkInDays: checkIns.length,
    };
  }

  // For trainers to get client check-ins
  async getClientCheckIns(
    trainerId: string,
    clientId: string,
    days: number = 7,
  ) {
    // Verify trainer-client relationship
    const relationship = await this.prisma.trainerClient.findFirst({
      where: {
        trainer: { userId: trainerId },
        clientId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Client not found');
    }

    return this.getHistory(clientId, days);
  }

  // Get clients who haven't checked in today (for trainer dashboard)
  async getClientsWithoutCheckIn(trainerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clients = await this.prisma.trainerClient.findMany({
      where: {
        trainer: { userId: trainerId },
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const clientsWithCheckIns = await this.prisma.dailyCheckIn.findMany({
      where: {
        userId: { in: clients.map((c) => c.clientId) },
        date: { gte: today },
      },
      select: { userId: true },
    });

    const checkedInIds = new Set(clientsWithCheckIns.map((c) => c.userId));

    return clients
      .filter((c) => !checkedInIds.has(c.clientId))
      .map((c) => c.client);
  }

  private average(values: (number | null)[]): number | null {
    const validValues = values.filter((v) => v !== null) as number[];
    if (validValues.length === 0) return null;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  }
}
