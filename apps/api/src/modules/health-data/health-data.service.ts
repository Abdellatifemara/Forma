import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthMetrics {
  hrv?: number; // Heart Rate Variability in ms
  restingHeartRate?: number;
  sleepHours?: number;
  sleepQuality?: number; // 0-100
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
   * Log health metrics from wearables
   */
  async logHealthMetrics(userId: string, metrics: HealthMetrics) {
    // Store in database (we'll need to add this model)
    // For now, just process and return readiness
    return this.calculateReadinessScore(userId, metrics);
  }

  /**
   * Calculate readiness score based on health metrics
   * Uses a weighted algorithm combining multiple factors
   */
  async calculateReadinessScore(
    userId: string,
    metrics: Partial<HealthMetrics>,
  ): Promise<ReadinessScore> {
    const factors: ReadinessScore['factors'] = [];

    // 1. HRV Score (Heart Rate Variability) - Most important for readiness
    // Higher HRV = better recovery
    if (metrics.hrv !== undefined) {
      const hrvBaseline = 50; // Average HRV in ms
      const hrvScore = Math.min(100, (metrics.hrv / hrvBaseline) * 70);
      factors.push({
        name: 'Heart Rate Variability',
        value: metrics.hrv,
        impact: metrics.hrv > hrvBaseline ? 'positive' : metrics.hrv > hrvBaseline * 0.7 ? 'neutral' : 'negative',
        weight: 0.35, // HRV is 35% of score
      });
    }

    // 2. Resting Heart Rate
    // Lower is generally better (for trained individuals)
    if (metrics.restingHeartRate !== undefined) {
      const rhrBaseline = 65;
      const rhrScore = Math.max(0, 100 - ((metrics.restingHeartRate - 50) * 2));
      factors.push({
        name: 'Resting Heart Rate',
        value: metrics.restingHeartRate,
        impact: metrics.restingHeartRate < rhrBaseline ? 'positive' : metrics.restingHeartRate < 75 ? 'neutral' : 'negative',
        weight: 0.2,
      });
    }

    // 3. Sleep Duration
    if (metrics.sleepHours !== undefined) {
      const optimalSleep = 7.5;
      const sleepScore = Math.min(100, (metrics.sleepHours / optimalSleep) * 100);
      factors.push({
        name: 'Sleep Duration',
        value: metrics.sleepHours,
        impact: metrics.sleepHours >= 7 ? 'positive' : metrics.sleepHours >= 6 ? 'neutral' : 'negative',
        weight: 0.2,
      });
    }

    // 4. Sleep Quality
    if (metrics.sleepQuality !== undefined) {
      factors.push({
        name: 'Sleep Quality',
        value: metrics.sleepQuality,
        impact: metrics.sleepQuality >= 70 ? 'positive' : metrics.sleepQuality >= 50 ? 'neutral' : 'negative',
        weight: 0.15,
      });
    }

    // 5. Stress Level (inverse - lower is better)
    if (metrics.stressLevel !== undefined) {
      const stressScore = 100 - metrics.stressLevel;
      factors.push({
        name: 'Stress Level',
        value: metrics.stressLevel,
        impact: metrics.stressLevel < 40 ? 'positive' : metrics.stressLevel < 60 ? 'neutral' : 'negative',
        weight: 0.1,
      });
    }

    // Calculate weighted score
    let totalWeight = 0;
    let weightedScore = 0;

    factors.forEach(factor => {
      let normalizedValue: number;

      switch (factor.name) {
        case 'Heart Rate Variability':
          normalizedValue = Math.min(100, (factor.value / 50) * 70);
          break;
        case 'Resting Heart Rate':
          normalizedValue = Math.max(0, 100 - ((factor.value - 50) * 2));
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

    // If not enough data, use activity-based scoring
    if (factors.length === 0) {
      // Get recent workout activity
      const recentLogs = await this.prisma.workoutLog.count({
        where: {
          userId,
          completedAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
          },
          status: 'COMPLETED',
        },
      });

      // Simple formula: If 0 workouts in 3 days, higher readiness
      // If 3+ workouts, might need rest
      weightedScore = recentLogs === 0 ? 85 : recentLogs < 3 ? 75 : 50;
      totalWeight = 1;
    }

    const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 70;

    // Determine status and recommendations
    const { status, recommendation, recommendationAr, suggestedWorkoutIntensity } =
      this.getReadinessRecommendation(score);

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
        recommendation: 'Your body is fully recovered! Great day for a challenging workout or PR attempt.',
        recommendationAr: 'جسمك تعافى بالكامل! يوم رائع لتمرين صعب أو محاولة رقم قياسي.',
        suggestedWorkoutIntensity: 'high',
      };
    }
    if (score >= 70) {
      return {
        status: 'good',
        recommendation: 'Good recovery status. You can train normally with moderate intensity.',
        recommendationAr: 'حالة تعافي جيدة. يمكنك التدريب بشكل طبيعي بكثافة متوسطة.',
        suggestedWorkoutIntensity: 'moderate',
      };
    }
    if (score >= 50) {
      return {
        status: 'moderate',
        recommendation: 'Recovery is ongoing. Consider a lighter workout or focus on technique today.',
        recommendationAr: 'التعافي مستمر. فكر في تمرين أخف أو ركز على التقنية اليوم.',
        suggestedWorkoutIntensity: 'light',
      };
    }
    if (score >= 30) {
      return {
        status: 'low',
        recommendation: 'Your body needs more recovery. Light activity like walking or stretching recommended.',
        recommendationAr: 'جسمك يحتاج المزيد من التعافي. يُنصح بنشاط خفيف مثل المشي أو التمدد.',
        suggestedWorkoutIntensity: 'light',
      };
    }
    return {
      status: 'rest',
      recommendation: 'Rest day recommended. Focus on sleep, nutrition, and stress management.',
      recommendationAr: 'يُنصح بيوم راحة. ركز على النوم والتغذية وإدارة التوتر.',
      suggestedWorkoutIntensity: 'rest',
    };
  }

  /**
   * Get trend analysis of readiness over time
   */
  async getReadinessTrend(userId: string, days: number = 7) {
    // This would query stored health metrics
    // For now, return sample data structure
    return {
      average: 72,
      trend: 'improving', // improving, declining, stable
      bestDay: 'Tuesday',
      insight: 'Your readiness tends to be highest mid-week after quality sleep.',
      insightAr: 'استعدادك يميل لأن يكون أعلى في منتصف الأسبوع بعد نوم جيد.',
    };
  }
}
