import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthMetrics {
  hrv?: number;
  restingHeartRate?: number;
  sleepHours?: number;
  sleepQuality?: number; // 0-100
  sleepDeep?: number; // hours
  sleepRem?: number; // hours
  sleepLight?: number; // hours
  sleepAwake?: number; // hours
  steps?: number;
  activeCalories?: number;
  stressLevel?: number; // 0-100
  source: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'manual';
  recordedAt: Date;
}

export interface ReadinessScore {
  score: number; // 0-100
  status: 'optimal' | 'good' | 'moderate' | 'low' | 'rest';
  recommendation: string;
  recommendationAr: string;
  factors: {
    name: string;
    value: number;
    impact: 'positive' | 'neutral' | 'negative';
    weight: number;
  }[];
  suggestedWorkoutIntensity: 'high' | 'moderate' | 'light' | 'rest';
}

@Injectable()
export class HealthDataService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log health metrics from wearables — persists to HealthDataLog then returns readiness
   */
  async logHealthMetrics(userId: string, metrics: HealthMetrics) {
    // Normalize recordedAt to start-of-day for upsert uniqueness
    const recordedDate = new Date(metrics.recordedAt);
    recordedDate.setHours(0, 0, 0, 0);

    await this.prisma.healthDataLog.upsert({
      where: {
        userId_source_recordedAt: {
          userId,
          source: metrics.source,
          recordedAt: recordedDate,
        },
      },
      update: {
        hrv: metrics.hrv,
        restingHeartRate: metrics.restingHeartRate,
        sleepHours: metrics.sleepHours,
        sleepQuality: metrics.sleepQuality,
        sleepDeep: metrics.sleepDeep,
        sleepRem: metrics.sleepRem,
        sleepLight: metrics.sleepLight,
        sleepAwake: metrics.sleepAwake,
        steps: metrics.steps,
        activeCalories: metrics.activeCalories,
        stressLevel: metrics.stressLevel,
      },
      create: {
        userId,
        source: metrics.source,
        recordedAt: recordedDate,
        hrv: metrics.hrv,
        restingHeartRate: metrics.restingHeartRate,
        sleepHours: metrics.sleepHours,
        sleepQuality: metrics.sleepQuality,
        sleepDeep: metrics.sleepDeep,
        sleepRem: metrics.sleepRem,
        sleepLight: metrics.sleepLight,
        sleepAwake: metrics.sleepAwake,
        steps: metrics.steps,
        activeCalories: metrics.activeCalories,
        stressLevel: metrics.stressLevel,
      },
    });

    return this.calculateReadinessScore(userId, metrics);
  }

  /**
   * Calculate readiness score based on health metrics
   */
  async calculateReadinessScore(
    userId: string,
    metrics: Partial<HealthMetrics>,
  ): Promise<ReadinessScore> {
    const factors: ReadinessScore['factors'] = [];

    // 1. HRV Score — most important for readiness
    if (metrics.hrv !== undefined) {
      const hrvBaseline = 50;
      factors.push({
        name: 'Heart Rate Variability',
        value: metrics.hrv,
        impact:
          metrics.hrv > hrvBaseline
            ? 'positive'
            : metrics.hrv > hrvBaseline * 0.7
              ? 'neutral'
              : 'negative',
        weight: 0.35,
      });
    }

    // 2. Resting Heart Rate — lower is better
    if (metrics.restingHeartRate !== undefined) {
      const rhrBaseline = 65;
      factors.push({
        name: 'Resting Heart Rate',
        value: metrics.restingHeartRate,
        impact:
          metrics.restingHeartRate < rhrBaseline
            ? 'positive'
            : metrics.restingHeartRate < 75
              ? 'neutral'
              : 'negative',
        weight: 0.2,
      });
    }

    // 3. Sleep Duration
    if (metrics.sleepHours !== undefined) {
      factors.push({
        name: 'Sleep Duration',
        value: metrics.sleepHours,
        impact:
          metrics.sleepHours >= 7
            ? 'positive'
            : metrics.sleepHours >= 6
              ? 'neutral'
              : 'negative',
        weight: 0.2,
      });
    }

    // 4. Sleep Quality
    if (metrics.sleepQuality !== undefined) {
      factors.push({
        name: 'Sleep Quality',
        value: metrics.sleepQuality,
        impact:
          metrics.sleepQuality >= 70
            ? 'positive'
            : metrics.sleepQuality >= 50
              ? 'neutral'
              : 'negative',
        weight: 0.15,
      });
    }

    // 5. Stress Level (inverse)
    if (metrics.stressLevel !== undefined) {
      factors.push({
        name: 'Stress Level',
        value: metrics.stressLevel,
        impact:
          metrics.stressLevel < 40
            ? 'positive'
            : metrics.stressLevel < 60
              ? 'neutral'
              : 'negative',
        weight: 0.1,
      });
    }

    // Calculate weighted score
    let totalWeight = 0;
    let weightedScore = 0;

    factors.forEach((factor) => {
      let normalizedValue: number;

      switch (factor.name) {
        case 'Heart Rate Variability':
          normalizedValue = Math.min(100, (factor.value / 50) * 70);
          break;
        case 'Resting Heart Rate':
          normalizedValue = Math.max(0, 100 - (factor.value - 50) * 2);
          break;
        case 'Sleep Duration':
          normalizedValue = Math.min(100, (factor.value / 7.5) * 100);
          break;
        case 'Sleep Quality':
          normalizedValue = factor.value;
          break;
        case 'Stress Level':
          normalizedValue = 100 - factor.value;
          break;
        default:
          normalizedValue = factor.value;
      }

      weightedScore += normalizedValue * factor.weight;
      totalWeight += factor.weight;
    });

    // If no wearable data, use activity-based scoring
    if (factors.length === 0) {
      const recentLogs = await this.prisma.workoutLog.count({
        where: {
          userId,
          completedAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          status: 'COMPLETED',
        },
      });

      weightedScore = recentLogs === 0 ? 85 : recentLogs < 3 ? 75 : 50;
      totalWeight = 1;
    }

    const score =
      totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 70;

    const {
      status,
      recommendation,
      recommendationAr,
      suggestedWorkoutIntensity,
    } = this.getReadinessRecommendation(score);

    return {
      score,
      status,
      recommendation,
      recommendationAr,
      factors,
      suggestedWorkoutIntensity,
    };
  }

  private getReadinessRecommendation(score: number): {
    status: ReadinessScore['status'];
    recommendation: string;
    recommendationAr: string;
    suggestedWorkoutIntensity: ReadinessScore['suggestedWorkoutIntensity'];
  } {
    if (score >= 85) {
      return {
        status: 'optimal',
        recommendation:
          'Your body is fully recovered! Great day for a challenging workout or PR attempt.',
        recommendationAr:
          'جسمك تعافى بالكامل! يوم رائع لتمرين صعب أو محاولة رقم قياسي.',
        suggestedWorkoutIntensity: 'high',
      };
    }
    if (score >= 70) {
      return {
        status: 'good',
        recommendation:
          'Good recovery status. You can train normally with moderate intensity.',
        recommendationAr:
          'حالة تعافي جيدة. يمكنك التدريب بشكل طبيعي بكثافة متوسطة.',
        suggestedWorkoutIntensity: 'moderate',
      };
    }
    if (score >= 50) {
      return {
        status: 'moderate',
        recommendation:
          'Recovery is ongoing. Consider a lighter workout or focus on technique today.',
        recommendationAr:
          'التعافي مستمر. فكر في تمرين أخف أو ركز على التقنية اليوم.',
        suggestedWorkoutIntensity: 'light',
      };
    }
    if (score >= 30) {
      return {
        status: 'low',
        recommendation:
          'Your body needs more recovery. Light activity like walking or stretching recommended.',
        recommendationAr:
          'جسمك يحتاج المزيد من التعافي. يُنصح بنشاط خفيف مثل المشي أو التمدد.',
        suggestedWorkoutIntensity: 'light',
      };
    }
    return {
      status: 'rest',
      recommendation:
        'Rest day recommended. Focus on sleep, nutrition, and stress management.',
      recommendationAr:
        'يُنصح بيوم راحة. ركز على النوم والتغذية وإدارة التوتر.',
      suggestedWorkoutIntensity: 'rest',
    };
  }

  /**
   * Get trend analysis of readiness over time — real data from HealthDataLog
   */
  async getReadinessTrend(userId: string, days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const logs = await this.prisma.healthDataLog.findMany({
      where: {
        userId,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Group by date (take latest per day if multiple sources)
    const byDate = new Map<
      string,
      {
        hrv?: number;
        restingHeartRate?: number;
        sleepHours?: number;
        sleepQuality?: number;
        stressLevel?: number;
      }
    >();

    for (const log of logs) {
      const dateKey = log.recordedAt.toISOString().slice(0, 10);
      const existing = byDate.get(dateKey) || {};
      // Merge — prefer non-null values
      byDate.set(dateKey, {
        hrv: log.hrv ?? existing.hrv,
        restingHeartRate: log.restingHeartRate ?? existing.restingHeartRate,
        sleepHours: log.sleepHours ?? existing.sleepHours,
        sleepQuality: log.sleepQuality ?? existing.sleepQuality,
        stressLevel: log.stressLevel ?? existing.stressLevel,
      });
    }

    const daily: { date: string; score: number; status: string }[] = [];

    for (const [date, metrics] of byDate) {
      const result = await this.calculateReadinessScore(userId, metrics);
      daily.push({ date, score: result.score, status: result.status });
    }

    const scores = daily.map((d) => d.score);
    const average =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    // Trend direction: compare first half average to second half
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scores.length >= 4) {
      const mid = Math.floor(scores.length / 2);
      const firstHalf =
        scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondHalf =
        scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
      if (secondHalf - firstHalf > 5) trend = 'improving';
      else if (firstHalf - secondHalf > 5) trend = 'declining';
    }

    // Best day
    const bestEntry = daily.reduce(
      (best, d) => (d.score > (best?.score ?? 0) ? d : best),
      daily[0],
    );
    const bestDay = bestEntry
      ? new Date(bestEntry.date).toLocaleDateString('en-US', {
          weekday: 'long',
        })
      : null;

    return {
      daily,
      average,
      trend,
      bestDay,
      insight:
        daily.length > 0
          ? `Your readiness has been ${trend} over the last ${days} days with an average score of ${average}.`
          : 'No health data recorded yet. Sync your wearable to see trends.',
      insightAr:
        daily.length > 0
          ? `كان استعدادك ${trend === 'improving' ? 'في تحسن' : trend === 'declining' ? 'في انخفاض' : 'مستقراً'} خلال آخر ${days} أيام بمتوسط ${average}.`
          : 'لم يتم تسجيل بيانات صحية بعد. قم بمزامنة جهازك لرؤية الاتجاهات.',
    };
  }

  /**
   * Strain score (0-21, WHOOP-style)
   */
  async getStrainScore(userId: string) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Get today's health data for active calories
    const healthLog = await this.prisma.healthDataLog.findFirst({
      where: {
        userId,
        recordedAt: { gte: todayStart },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Get completed workouts in last 24h
    const workouts = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        completedAt: { gte: last24h },
        status: 'COMPLETED',
      },
      select: {
        totalVolume: true,
        durationMinutes: true,
        caloriesBurned: true,
      },
    });

    const activeCalories = healthLog?.activeCalories ?? 0;
    const workoutCount = workouts.length;
    const totalVolume = workouts.reduce(
      (sum, w) => sum + (w.totalVolume ?? 0),
      0,
    );
    const totalCalsBurned = workouts.reduce(
      (sum, w) => sum + (w.caloriesBurned ?? 0),
      0,
    );

    // Strain formula
    const rawStrain =
      (activeCalories / 200) * 5 +
      workoutCount * 3 +
      (totalVolume / 5000) * 3;
    const strain = Math.min(21, Math.round(rawStrain * 10) / 10);

    let level: 'light' | 'moderate' | 'high' | 'overreaching';
    if (strain < 8) level = 'light';
    else if (strain < 14) level = 'moderate';
    else if (strain < 18) level = 'high';
    else level = 'overreaching';

    return {
      strain,
      level,
      breakdown: {
        activeCalories,
        workoutCalories: totalCalsBurned,
        workoutCount,
        totalVolumeKg: Math.round(totalVolume),
      },
    };
  }

  /**
   * Sleep stages breakdown from latest HealthDataLog
   */
  async getSleepData(userId: string) {
    // Get latest log with sleep data
    const latestSleep = await this.prisma.healthDataLog.findFirst({
      where: {
        userId,
        sleepHours: { not: null },
      },
      orderBy: { recordedAt: 'desc' },
    });

    if (!latestSleep || !latestSleep.sleepHours) {
      return {
        totalHours: null,
        quality: null,
        stages: null,
        trend: [],
      };
    }

    const totalHours = latestSleep.sleepHours;
    const deep = latestSleep.sleepDeep ?? 0;
    const rem = latestSleep.sleepRem ?? 0;
    const light = latestSleep.sleepLight ?? 0;
    const awake = latestSleep.sleepAwake ?? 0;
    const hasStages = deep > 0 || rem > 0 || light > 0;

    // 7-day trend
    const since = new Date();
    since.setDate(since.getDate() - 7);
    since.setHours(0, 0, 0, 0);

    const trendLogs = await this.prisma.healthDataLog.findMany({
      where: {
        userId,
        recordedAt: { gte: since },
        sleepHours: { not: null },
      },
      orderBy: { recordedAt: 'asc' },
      select: {
        recordedAt: true,
        sleepHours: true,
        sleepQuality: true,
      },
    });

    const trend = trendLogs.map((log) => ({
      date: log.recordedAt.toISOString().slice(0, 10),
      hours: log.sleepHours,
      quality: log.sleepQuality,
    }));

    return {
      totalHours,
      quality: latestSleep.sleepQuality ?? null,
      stages: hasStages
        ? {
            deep: {
              hours: deep,
              percentage: Math.round((deep / totalHours) * 100),
            },
            rem: {
              hours: rem,
              percentage: Math.round((rem / totalHours) * 100),
            },
            light: {
              hours: light,
              percentage: Math.round((light / totalHours) * 100),
            },
            awake: {
              hours: awake,
              percentage: Math.round((awake / totalHours) * 100),
            },
          }
        : null,
      trend,
    };
  }

  /**
   * Weekly or monthly summary aggregation
   */
  async getSummary(userId: string, period: 'week' | 'month') {
    const days = period === 'week' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const logs = await this.prisma.healthDataLog.findMany({
      where: {
        userId,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'asc' },
    });

    const workoutCount = await this.prisma.workoutLog.count({
      where: {
        userId,
        completedAt: { gte: since },
        status: 'COMPLETED',
      },
    });

    // Build daily buckets
    const byDate = new Map<string, typeof logs>();
    for (const log of logs) {
      const key = log.recordedAt.toISOString().slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(log);
    }

    const dailyData: {
      date: string;
      hrv: number | null;
      sleepHours: number | null;
      sleepQuality: number | null;
      steps: number | null;
      activeCalories: number | null;
    }[] = [];

    let totalHrv = 0,
      hrvCount = 0;
    let totalSleepHours = 0,
      sleepCount = 0;
    let totalSleepQuality = 0,
      sleepQualityCount = 0;
    let totalSteps = 0,
      stepsCount = 0;
    let totalActiveCal = 0,
      calCount = 0;

    for (const [date, dayLogs] of byDate) {
      // Merge day's logs (multiple sources)
      let hrv: number | null = null;
      let sleepHours: number | null = null;
      let sleepQuality: number | null = null;
      let steps: number | null = null;
      let activeCalories: number | null = null;

      for (const log of dayLogs) {
        hrv = log.hrv ?? hrv;
        sleepHours = log.sleepHours ?? sleepHours;
        sleepQuality = log.sleepQuality ?? sleepQuality;
        steps = log.steps ?? steps;
        activeCalories = log.activeCalories ?? activeCalories;
      }

      dailyData.push({ date, hrv, sleepHours, sleepQuality, steps, activeCalories });

      if (hrv !== null) {
        totalHrv += hrv;
        hrvCount++;
      }
      if (sleepHours !== null) {
        totalSleepHours += sleepHours;
        sleepCount++;
      }
      if (sleepQuality !== null) {
        totalSleepQuality += sleepQuality;
        sleepQualityCount++;
      }
      if (steps !== null) {
        totalSteps += steps;
        stepsCount++;
      }
      if (activeCalories !== null) {
        totalActiveCal += activeCalories;
        calCount++;
      }
    }

    // Get readiness trend for average + strain average
    const readinessTrend = await this.getReadinessTrend(userId, days);

    // Strain average (compute per day is expensive, approximate from totals)
    const avgActiveCal = calCount > 0 ? totalActiveCal / calCount : 0;
    const avgDailyStrain = Math.min(
      21,
      Math.round(((avgActiveCal / 200) * 5 + (workoutCount / days) * 3) * 10) / 10,
    );

    // HRV trend direction
    let hrvTrend: 'improving' | 'declining' | 'stable' = 'stable';
    const hrvValues = dailyData
      .filter((d) => d.hrv !== null)
      .map((d) => d.hrv!);
    if (hrvValues.length >= 4) {
      const mid = Math.floor(hrvValues.length / 2);
      const first = hrvValues.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const second =
        hrvValues.slice(mid).reduce((a, b) => a + b, 0) /
        (hrvValues.length - mid);
      if (second - first > 3) hrvTrend = 'improving';
      else if (first - second > 3) hrvTrend = 'declining';
    }

    return {
      period,
      days,
      summary: {
        readinessAverage: readinessTrend.average,
        readinessTrend: readinessTrend.trend,
        hrvAverage: hrvCount > 0 ? Math.round(totalHrv / hrvCount) : null,
        hrvTrend,
        sleepHoursAverage:
          sleepCount > 0
            ? Math.round((totalSleepHours / sleepCount) * 10) / 10
            : null,
        sleepQualityAverage:
          sleepQualityCount > 0
            ? Math.round(totalSleepQuality / sleepQualityCount)
            : null,
        totalSteps,
        totalActiveCalories: Math.round(totalActiveCal),
        workoutCount,
        strainAverage: avgDailyStrain,
      },
      daily: dailyData,
    };
  }
}
