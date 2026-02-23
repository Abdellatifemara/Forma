import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogWeightDto, LogMeasurementsDto, CreateProgressPhotoDto } from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async logWeight(userId: string, dto: LogWeightDto) {
    const logDate = dto.date ? new Date(dto.date) : new Date();

    // Check if there's already a log for this date
    const existingLog = await this.prisma.progressLog.findFirst({
      where: {
        userId,
        loggedAt: {
          gte: new Date(logDate.setHours(0, 0, 0, 0)),
          lt: new Date(logDate.setHours(23, 59, 59, 999)),
        },
        weightKg: { not: null },
      },
    });

    if (existingLog) {
      // Update existing log
      return this.prisma.progressLog.update({
        where: { id: existingLog.id },
        data: { weightKg: dto.weight },
      });
    }

    // Create new log
    return this.prisma.progressLog.create({
      data: {
        userId,
        weightKg: dto.weight,
        loggedAt: new Date(dto.date || Date.now()),
      },
    });
  }

  async logMeasurements(userId: string, dto: LogMeasurementsDto) {
    const logDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.progressLog.create({
      data: {
        userId,
        loggedAt: logDate,
        weightKg: dto.weight,
        bodyFatPercent: dto.bodyFat,
        chestCm: dto.chest,
        waistCm: dto.waist,
        hipsCm: dto.hips,
        bicepCm: dto.arms,
        thighCm: dto.thighs,
        notes: dto.notes,
      },
    });
  }

  async getWeightHistory(userId: string, rawDays: number = 90) {
    const days = Math.min(rawDays, 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.progressLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startDate },
        weightKg: { not: null },
      },
      orderBy: { loggedAt: 'asc' },
      select: {
        loggedAt: true,
        weightKg: true,
      },
    });

    return logs.map((log) => ({
      date: log.loggedAt.toISOString().split('T')[0],
      weight: log.weightKg,
    }));
  }

  async getMeasurementsHistory(userId: string, rawLimit: number = 10) {
    const limit = Math.min(rawLimit, 200);
    const logs = await this.prisma.progressLog.findMany({
      where: {
        userId,
        OR: [
          { bodyFatPercent: { not: null } },
          { chestCm: { not: null } },
          { waistCm: { not: null } },
          { hipsCm: { not: null } },
          { bicepCm: { not: null } },
          { thighCm: { not: null } },
        ],
      },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      date: log.loggedAt.toISOString().split('T')[0],
      weight: log.weightKg,
      bodyFat: log.bodyFatPercent,
      chest: log.chestCm,
      waist: log.waistCm,
      hips: log.hipsCm,
      arms: log.bicepCm,
      thighs: log.thighCm,
      notes: log.notes,
    }));
  }

  async getStrengthPRs(userId: string) {
    // Get all exercise logs with set data
    const exerciseLogs = await this.prisma.exerciseLog.findMany({
      where: {
        workoutLog: { userId },
      },
      include: {
        exercise: true,
        sets: true,
      },
    });

    // Calculate estimated 1RM for each exercise using Brzycki formula
    const prsMap = new Map<string, { exercise: string; weight: number; reps: number; date: Date; e1rm: number }>();

    for (const log of exerciseLogs) {
      for (const set of log.sets) {
        if (set.weightKg && set.reps && set.reps > 0 && set.reps <= 12) {
          const e1rm = set.weightKg * (36 / (37 - set.reps));

          const existing = prsMap.get(log.exerciseId);
          if (!existing || e1rm > existing.e1rm) {
            prsMap.set(log.exerciseId, {
              exercise: log.exercise.nameEn,
              weight: set.weightKg,
              reps: set.reps,
              date: set.completedAt,
              e1rm,
            });
          }
        }
      }
    }

    return Array.from(prsMap.values())
      .sort((a, b) => b.e1rm - a.e1rm)
      .slice(0, 10)
      .map((pr) => ({
        exerciseName: pr.exercise,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date.toISOString().split('T')[0],
        estimatedMax: Math.round(pr.e1rm),
      }));
  }

  async getLatestProgress(userId: string) {
    const latestWeight = await this.prisma.progressLog.findFirst({
      where: { userId, weightKg: { not: null } },
      orderBy: { loggedAt: 'desc' },
    });

    const latestMeasurements = await this.prisma.progressLog.findFirst({
      where: {
        userId,
        OR: [
          { bodyFatPercent: { not: null } },
          { chestCm: { not: null } },
          { waistCm: { not: null } },
        ],
      },
      orderBy: { loggedAt: 'desc' },
    });

    // Get weight change over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldestInRange = await this.prisma.progressLog.findFirst({
      where: {
        userId,
        loggedAt: { gte: thirtyDaysAgo },
        weightKg: { not: null },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const weightChange =
      latestWeight && oldestInRange
        ? Number(((latestWeight.weightKg || 0) - (oldestInRange.weightKg || 0)).toFixed(1))
        : 0;

    return {
      currentWeight: latestWeight?.weightKg || null,
      weightChange,
      bodyFat: latestMeasurements?.bodyFatPercent || null,
      measurements: latestMeasurements
        ? {
            chest: latestMeasurements.chestCm,
            waist: latestMeasurements.waistCm,
            hips: latestMeasurements.hipsCm,
            arms: latestMeasurements.bicepCm,
            thighs: latestMeasurements.thighCm,
          }
        : null,
    };
  }

  async createPhoto(userId: string, dto: CreateProgressPhotoDto) {
    return this.prisma.progressPhoto.create({
      data: {
        userId,
        photoUrl: dto.imageUrl,
        angle: dto.label,
        notes: dto.notes,
        sharedWithTrainer: dto.sharedWithTrainer ?? false,
      },
    });
  }

  async getPhotos(userId: string) {
    return this.prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      select: {
        id: true,
        photoUrl: true,
        thumbnailUrl: true,
        angle: true,
        loggedAt: true,
        notes: true,
        isPublic: true,
        sharedWithTrainer: true,
      },
    });
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.prisma.progressPhoto.findFirst({
      where: { id: photoId, userId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.progressPhoto.delete({ where: { id: photoId } });
    return { success: true };
  }

  // ─── Fitness Tests ──────────────────────────────────────────────

  async saveFitnessTest(userId: string, dto: { testId: string; value: number; rating: string }) {
    return this.prisma.fitnessTestResult.create({
      data: {
        userId,
        testId: dto.testId,
        value: dto.value,
        rating: dto.rating,
      },
    });
  }

  async getFitnessTests(userId: string, testId?: string) {
    return this.prisma.fitnessTestResult.findMany({
      where: {
        userId,
        ...(testId ? { testId } : {}),
      },
      orderBy: { testedAt: 'desc' },
      take: 50,
    });
  }

  async getLatestFitnessTests(userId: string) {
    // Get the most recent result for each test type
    const all = await this.prisma.fitnessTestResult.findMany({
      where: { userId },
      orderBy: { testedAt: 'desc' },
    });

    const latestByTest = new Map<string, typeof all[0]>();
    for (const result of all) {
      if (!latestByTest.has(result.testId)) {
        latestByTest.set(result.testId, result);
      }
    }

    return Array.from(latestByTest.values());
  }
}
