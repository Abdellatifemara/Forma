import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthMetricType } from '@prisma/client';

export interface CreateHealthMetricDto {
  type: HealthMetricType;
  value: number;
  unit: string;
  date?: Date;
  notes?: string;
  source?: string;
}

export interface GetHealthMetricsQuery {
  type?: HealthMetricType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable()
export class HealthMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateHealthMetricDto) {
    return this.prisma.healthMetric.create({
      data: {
        userId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        date: data.date || new Date(),
        notes: data.notes,
        source: data.source || 'manual',
      },
    });
  }

  async getAll(userId: string, query: GetHealthMetricsQuery = {}) {
    const { type, startDate, endDate, limit = 100 } = query;
    const safeTake = Math.min(limit, 500);

    return this.prisma.healthMetric.findMany({
      where: {
        userId,
        ...(type && { type }),
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
      },
      orderBy: { date: 'desc' },
      take: safeTake,
    });
  }

  async getLatestByType(userId: string, type: HealthMetricType) {
    return this.prisma.healthMetric.findFirst({
      where: { userId, type },
      orderBy: { date: 'desc' },
    });
  }

  async getHistory(userId: string, type: HealthMetricType, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.healthMetric.findMany({
      where: {
        userId,
        type,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async delete(userId: string, id: string) {
    const metric = await this.prisma.healthMetric.findFirst({
      where: { id, userId },
    });

    if (!metric) {
      throw new NotFoundException('Health metric not found');
    }

    return this.prisma.healthMetric.delete({ where: { id } });
  }

  // Get a summary dashboard for user
  async getDashboard(userId: string) {
    const [
      latestWeight,
      latestBodyFat,
      latestBloodPressure,
      latestGlucose,
      weightHistory,
    ] = await Promise.all([
      this.getLatestByType(userId, 'WEIGHT'),
      this.getLatestByType(userId, 'BODY_FAT_PERCENTAGE'),
      this.getLatestByType(userId, 'BLOOD_PRESSURE_SYSTOLIC'),
      this.getLatestByType(userId, 'BLOOD_GLUCOSE_FASTING'),
      this.getHistory(userId, 'WEIGHT', 90),
    ]);

    // Calculate weight change
    let weightChange = null;
    if (weightHistory.length >= 2) {
      const firstWeight = weightHistory[0].value;
      const lastWeight = weightHistory[weightHistory.length - 1].value;
      weightChange = lastWeight - firstWeight;
    }

    return {
      current: {
        weight: latestWeight,
        bodyFat: latestBodyFat,
        bloodPressure: latestBloodPressure,
        glucose: latestGlucose,
      },
      trends: {
        weightChange,
        weightHistory: weightHistory.map((h) => ({
          date: h.date,
          value: h.value,
        })),
      },
    };
  }
}
