import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BodyCompositionEntry {
  weight: number;
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  thigh?: number;
  bicep?: number;
}

export interface BodyCompositionAnalysis {
  current: {
    weight: number;
    bodyFatPercentage: number | null;
    bmi: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  changes: {
    weightChange: number;
    bodyFatChange: number | null;
    period: string;
  };
  goals: {
    targetWeight: number | null;
    targetBodyFat: number | null;
    estimatedWeeksToGoal: number | null;
  };
  recommendations: string[];
  recommendationsAr: string[];
}

@Injectable()
export class BodyCompositionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log body composition entry
   */
  async logBodyComposition(userId: string, data: BodyCompositionEntry) {
    // Get user height for BMI calculation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { heightCm: true },
    });

    // Calculate BMI if height is available
    let bmi: number | undefined;
    if (user?.heightCm) {
      const heightM = user.heightCm / 100;
      bmi = data.weight / (heightM * heightM);
    }

    // Store in progress log
    const log = await this.prisma.progressLog.create({
      data: {
        userId,
        weightKg: data.weight,
        bodyFatPercent: data.bodyFatPercentage,
        chestCm: data.chest,
        waistCm: data.waist,
        hipsCm: data.hips,
        thighCm: data.thigh,
        bicepCm: data.bicep,
        notes: bmi ? JSON.stringify({ bmi }) : undefined,
      },
    });

    // Update user's current weight
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentWeightKg: data.weight },
    });

    return log;
  }

  /**
   * Get body composition history
   */
  async getHistory(userId: string, params?: { days?: number; limit?: number }) {
    const days = Math.min(params?.days || 90, 365);
    const limit = Math.min(params?.limit || 50, 200);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.progressLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startDate },
      },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => {
      const extraData = log.notes ? JSON.parse(log.notes) : {};
      return {
        id: log.id,
        date: log.loggedAt,
        weight: log.weightKg,
        bodyFatPercentage: log.bodyFatPercent,
        measurements: {
          chest: log.chestCm,
          waist: log.waistCm,
          hips: log.hipsCm,
          thigh: log.thighCm,
          bicep: log.bicepCm,
        },
        bmi: extraData.bmi,
      };
    });
  }

  /**
   * Get comprehensive body composition analysis
   */
  async getAnalysis(userId: string): Promise<BodyCompositionAnalysis> {
    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        fitnessGoal: true,
      },
    });

    // Get recent logs
    const recentLogs = await this.prisma.progressLog.findMany({
      where: {
        userId,
        weightKg: { not: null },
      },
      orderBy: { loggedAt: 'desc' },
      take: 10,
    });

    const latestLog = recentLogs[0];
    const oldestLog = recentLogs[recentLogs.length - 1];

    // Calculate BMI
    let bmi = 0;
    let category: BodyCompositionAnalysis['current']['category'] = 'normal';

    if (user?.heightCm && latestLog?.weightKg) {
      const heightM = user.heightCm / 100;
      bmi = latestLog.weightKg / (heightM * heightM);

      if (bmi < 18.5) category = 'underweight';
      else if (bmi < 25) category = 'normal';
      else if (bmi < 30) category = 'overweight';
      else category = 'obese';
    }

    // Calculate changes
    const weightChange = latestLog && oldestLog
      ? (latestLog.weightKg || 0) - (oldestLog.weightKg || 0)
      : 0;

    const bodyFatChange = latestLog?.bodyFatPercent && oldestLog?.bodyFatPercent
      ? latestLog.bodyFatPercent - oldestLog.bodyFatPercent
      : null;

    // Estimate weeks to goal
    const currentWeight = latestLog?.weightKg || user?.currentWeightKg || 0;
    const targetWeight = user?.targetWeightKg;
    let estimatedWeeksToGoal: number | null = null;

    if (targetWeight && currentWeight) {
      const weightDiff = Math.abs(currentWeight - targetWeight);
      estimatedWeeksToGoal = Math.ceil(weightDiff / 0.5);
    }

    // Generate recommendations
    const { recommendations, recommendationsAr } = this.generateRecommendations(
      user?.fitnessGoal || 'MAINTAIN',
      category,
      weightChange,
      bodyFatChange,
    );

    return {
      current: {
        weight: currentWeight,
        bodyFatPercentage: latestLog?.bodyFatPercent || null,
        bmi: Math.round(bmi * 10) / 10,
        category,
      },
      changes: {
        weightChange: Math.round(weightChange * 10) / 10,
        bodyFatChange: bodyFatChange ? Math.round(bodyFatChange * 10) / 10 : null,
        period: `${recentLogs.length > 1 ? Math.ceil((Date.now() - (oldestLog?.loggedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)) : 0} days`,
      },
      goals: {
        targetWeight: user?.targetWeightKg || null,
        targetBodyFat: null,
        estimatedWeeksToGoal,
      },
      recommendations,
      recommendationsAr,
    };
  }

  /**
   * Estimate body fat using Navy method
   */
  async estimateBodyFat(userId: string): Promise<{ estimated: number; method: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true, heightCm: true },
    });

    const latestLog = await this.prisma.progressLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });

    if (!user?.heightCm || !latestLog?.waistCm) {
      return null;
    }

    // Simplified estimation based on waist measurement
    // More accurate methods need neck measurement which we don't have
    const waistInches = latestLog.waistCm / 2.54;
    const heightInches = user.heightCm / 2.54;

    let bodyFat: number;
    if (user.gender === 'MALE') {
      bodyFat = ((4.15 * waistInches) - (0.082 * heightInches) - 98.42) / (latestLog.weightKg ? latestLog.weightKg * 2.205 : 150) * 100;
    } else {
      bodyFat = ((4.15 * waistInches) - (0.082 * heightInches) - 76.76) / (latestLog.weightKg ? latestLog.weightKg * 2.205 : 130) * 100;
    }

    return {
      estimated: Math.max(5, Math.min(50, Math.round(bodyFat * 10) / 10)),
      method: 'Waist-Height Estimate',
    };
  }

  private generateRecommendations(
    goal: string,
    bmiCategory: string,
    weightChange: number,
    bodyFatChange: number | null,
  ): { recommendations: string[]; recommendationsAr: string[] } {
    const recommendations: string[] = [];
    const recommendationsAr: string[] = [];

    if (goal === 'LOSE_WEIGHT') {
      if (weightChange < 0) {
        recommendations.push('Great progress! You\'re losing weight at a healthy rate.');
        recommendationsAr.push('تقدم رائع! أنت تفقد الوزن بمعدل صحي.');
      } else if (weightChange > 0.5) {
        recommendations.push('Weight has increased. Consider reducing calorie intake by 200-300 kcal.');
        recommendationsAr.push('زاد الوزن. فكر في تقليل السعرات الحرارية.');
      }
    }

    if (goal === 'BUILD_MUSCLE') {
      if (weightChange > 0 && (bodyFatChange === null || bodyFatChange < 1)) {
        recommendations.push('Excellent! Gaining weight while maintaining body fat.');
        recommendationsAr.push('ممتاز! زيادة الوزن مع الحفاظ على نسبة الدهون.');
      }
    }

    if (bmiCategory === 'underweight') {
      recommendations.push('Focus on nutrient-dense foods and strength training.');
      recommendationsAr.push('ركز على الأطعمة الغنية بالمغذيات وتمارين القوة.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep tracking regularly for best insights.');
      recommendationsAr.push('استمر في التتبع بانتظام للحصول على أفضل النتائج.');
    }

    return { recommendations, recommendationsAr };
  }
}
