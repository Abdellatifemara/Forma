import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AIUsageEvent {
  userId: string;
  featureId: string;
  queryType: 'workout' | 'nutrition' | 'form' | 'progress' | 'general';
  query: string;
  responseTime: number;
  successful: boolean;
  userSatisfaction?: number; // 1-5 rating
  metadata?: Record<string, unknown>;
}

export interface UserSurveyResponse {
  userId: string;
  surveyId: string;
  responses: Record<string, unknown>;
  completedAt: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track AI feature usage
   */
  async trackAIUsage(event: AIUsageEvent) {
    this.logger.log(`AI Usage: ${event.featureId} by ${event.userId}`);

    // Store in analytics table (would need to add to schema)
    // For now, log to console and could be sent to analytics service

    // Get user's subscription tier for segmentation
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: event.userId },
    });

    const analyticsData = {
      ...event,
      tier: subscription?.tier || 'FREE',
      timestamp: new Date().toISOString(),
    };

    // In production, send to analytics service (Mixpanel, Amplitude, etc.)
    this.logger.debug(`Analytics: ${JSON.stringify(analyticsData)}`);

    return { tracked: true };
  }

  /**
   * Get AI usage statistics for a user
   */
  async getUserAIUsage(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const tier = subscription?.tier || 'FREE';

    // Get limits based on tier
    const limits = {
      FREE: 3,
      PREMIUM: 20,
      PREMIUM_PLUS: Infinity,
    };

    const limit = limits[tier as keyof typeof limits];

    // Calculate period start
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case 'day':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'month':
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // In production, count from analytics table
    // For now, return mock data
    const used = 0; // Would be actual count from DB

    return {
      tier,
      limit: limit === Infinity ? 'unlimited' : limit,
      used,
      remaining: limit === Infinity ? 'unlimited' : Math.max(0, limit - used),
      periodStart: periodStart.toISOString(),
      periodEnd: this.getNextResetDate().toISOString(),
    };
  }

  /**
   * Get aggregated AI usage metrics for research
   */
  async getAIUsageMetrics(days: number = 30) {
    // In production, aggregate from analytics table
    return {
      totalQueries: 0,
      uniqueUsers: 0,
      averageQueriesPerUser: 0,
      queryTypeBreakdown: {
        workout: 0,
        nutrition: 0,
        form: 0,
        progress: 0,
        general: 0,
      },
      tierBreakdown: {
        FREE: { users: 0, queries: 0, avgPerUser: 0 },
        PREMIUM: { users: 0, queries: 0, avgPerUser: 0 },
        PREMIUM_PLUS: { users: 0, queries: 0, avgPerUser: 0 },
      },
      limitHitRate: {
        FREE: 0,
        PREMIUM: 0,
      },
      satisfactionByTier: {
        FREE: 0,
        PREMIUM: 0,
        PREMIUM_PLUS: 0,
      },
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * Store survey response
   */
  async storeSurveyResponse(response: UserSurveyResponse) {
    this.logger.log(`Survey response: ${response.surveyId} by ${response.userId}`);

    // In production, store in survey_responses table
    return { stored: true };
  }

  /**
   * Get survey results for research
   */
  async getSurveyResults(surveyId: string) {
    // In production, aggregate from survey_responses table
    return {
      surveyId,
      totalResponses: 0,
      responsesByQuestion: {},
      completionRate: 0,
    };
  }

  /**
   * Get drop-off analysis for AI features
   */
  async getDropOffAnalysis() {
    return {
      limitHitToChurn: {
        FREE: 0, // % who hit limit and churned
        PREMIUM: 0,
      },
      limitHitToUpgrade: {
        FREE: 0, // % who hit limit and upgraded
        PREMIUM: 0,
      },
      averageQueriesBeforeUpgrade: 0,
      averageQueriesBeforeChurn: 0,
    };
  }

  /**
   * Research study: Query frequency patterns
   */
  async getQueryFrequencyPatterns() {
    return {
      byUserType: {
        beginner: { avgPerWeek: 0, peakUsageDay: '' },
        intermediate: { avgPerWeek: 0, peakUsageDay: '' },
        advanced: { avgPerWeek: 0, peakUsageDay: '' },
      },
      byTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
      },
      byDayOfWeek: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
    };
  }

  /**
   * Research study: Query value analysis
   */
  async getQueryValueAnalysis() {
    return {
      byCategory: {
        workout: { count: 0, avgSatisfaction: 0, npsImpact: 0 },
        nutrition: { count: 0, avgSatisfaction: 0, npsImpact: 0 },
        form: { count: 0, avgSatisfaction: 0, npsImpact: 0 },
        progress: { count: 0, avgSatisfaction: 0, npsImpact: 0 },
        general: { count: 0, avgSatisfaction: 0, npsImpact: 0 },
      },
      mostValuableQueries: [],
      leastValuableQueries: [],
    };
  }

  private getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}
