import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIQueryType, SubscriptionTier } from '@prisma/client';

export interface SurveyQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  question: string;
  questionAr?: string;
  options?: { value: string; label: string; labelAr?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required?: boolean;
}

export interface AIUsageData {
  featureId: string;
  queryType: AIQueryType;
  queryText?: string;
  responseTimeMs?: number;
  successful?: boolean;
  satisfaction?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(private prisma: PrismaService) {}

  // ==========================================
  // RESEARCH TESTS
  // ==========================================

  /**
   * Get all available tests for user (those not yet completed)
   */
  async getAvailableTests(userId: string) {
    // Get all tests
    const allTests = await this.prisma.survey.findMany({
      where: {
        isActive: true,
        code: { startsWith: 'test_' },
      },
      select: {
        id: true,
        code: true,
        title: true,
        titleAr: true,
        description: true,
        descriptionAr: true,
        questions: true,
      },
    });

    // Get completed tests by user
    const completedResponses = await this.prisma.surveyResponse.findMany({
      where: { userId },
      select: { surveyId: true },
    });
    const completedIds = new Set(completedResponses.map((r) => r.surveyId));

    // Map tests with completion status
    const tests = allTests.map((test) => ({
      id: test.id,
      code: test.code,
      title: test.title,
      titleAr: test.titleAr,
      description: test.description,
      descriptionAr: test.descriptionAr,
      questionCount: (test.questions as unknown[]).length,
      completed: completedIds.has(test.id),
    }));

    const completedCount = tests.filter((t) => t.completed).length;

    return {
      tests,
      totalTests: tests.length,
      completedTests: completedCount,
      progress: tests.length > 0 ? Math.round((completedCount / tests.length) * 100) : 0,
    };
  }

  /**
   * Get specific test by code
   */
  async getTestByCode(userId: string, code: string) {
    const test = await this.prisma.survey.findUnique({
      where: { code },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Check if already completed
    const existingResponse = await this.prisma.surveyResponse.findUnique({
      where: {
        surveyId_userId: { surveyId: test.id, userId },
      },
    });

    return {
      id: test.id,
      code: test.code,
      title: test.title,
      titleAr: test.titleAr,
      description: test.description,
      descriptionAr: test.descriptionAr,
      questions: test.questions as unknown as SurveyQuestion[],
      completed: !!existingResponse,
      completedAt: existingResponse?.completedAt,
    };
  }

  // ==========================================
  // SURVEYS
  // ==========================================

  /**
   * Get available survey for user based on trigger
   */
  async getAvailableSurvey(userId: string, triggerEvent?: string) {
    // Get user's subscription tier
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    const tier = subscription?.tier || 'FREE';

    // Find active survey matching trigger that user hasn't completed
    const survey = await this.prisma.survey.findFirst({
      where: {
        isActive: true,
        ...(triggerEvent && { triggerEvent }),
        NOT: {
          responses: {
            some: { userId },
          },
        },
      },
    });

    if (!survey) {
      return null;
    }

    return {
      id: survey.id,
      code: survey.code,
      title: survey.title,
      titleAr: survey.titleAr,
      description: survey.description,
      descriptionAr: survey.descriptionAr,
      questions: survey.questions as unknown as SurveyQuestion[],
    };
  }

  /**
   * Submit survey response
   */
  async submitSurveyResponse(
    userId: string,
    surveyId: string,
    responses: Record<string, unknown>,
  ) {
    // Check if survey exists
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    // Check if already responded
    const existing = await this.prisma.surveyResponse.findUnique({
      where: {
        surveyId_userId: { surveyId, userId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already submitted response');
    }

    // Get user context for metadata
    const [subscription, user] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fitnessLevel: true, fitnessGoal: true, createdAt: true },
      }),
    ]);

    // Create response
    const response = await this.prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
        responses: JSON.parse(JSON.stringify(responses)),
        metadata: JSON.parse(JSON.stringify({
          tier: subscription?.tier || 'FREE',
          fitnessLevel: user?.fitnessLevel,
          fitnessGoal: user?.fitnessGoal,
          daysSinceSignup: user?.createdAt
            ? Math.floor(
                (Date.now() - new Date(user.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : null,
        })),
      },
    });

    this.logger.log(`Survey response submitted: ${survey.code} by ${userId}`);

    return { success: true, responseId: response.id };
  }

  /**
   * Get survey results (admin)
   */
  async getSurveyResults(surveyCode: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { code: surveyCode },
      include: {
        responses: {
          include: {
            user: {
              select: { fitnessLevel: true },
            },
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const questions = survey.questions as unknown as SurveyQuestion[];
    const responseCount = survey.responses.length;

    // Aggregate responses by question
    const aggregatedResponses: Record<
      string,
      {
        question: string;
        type: string;
        responses: Record<string, number>;
        averageScore?: number;
        textResponses?: string[];
      }
    > = {};

    for (const question of questions) {
      aggregatedResponses[question.id] = {
        question: question.question,
        type: question.type,
        responses: {},
        textResponses: question.type === 'text' ? [] : undefined,
      };

      if (question.type === 'scale') {
        let sum = 0;
        let count = 0;

        for (const response of survey.responses) {
          const answers = response.responses as Record<string, unknown>;
          const value = answers[question.id];
          if (typeof value === 'number') {
            sum += value;
            count++;
            const key = value.toString();
            aggregatedResponses[question.id].responses[key] =
              (aggregatedResponses[question.id].responses[key] || 0) + 1;
          }
        }

        aggregatedResponses[question.id].averageScore =
          count > 0 ? sum / count : 0;
      } else if (question.type === 'text') {
        for (const response of survey.responses) {
          const answers = response.responses as Record<string, unknown>;
          const value = answers[question.id];
          if (typeof value === 'string' && value.trim()) {
            aggregatedResponses[question.id].textResponses!.push(value);
          }
        }
      } else {
        // single_choice or multiple_choice
        for (const response of survey.responses) {
          const answers = response.responses as Record<string, unknown>;
          const value = answers[question.id];

          if (Array.isArray(value)) {
            for (const v of value) {
              aggregatedResponses[question.id].responses[v] =
                (aggregatedResponses[question.id].responses[v] || 0) + 1;
            }
          } else if (typeof value === 'string') {
            aggregatedResponses[question.id].responses[value] =
              (aggregatedResponses[question.id].responses[value] || 0) + 1;
          }
        }
      }
    }

    // Segment by tier
    const byTier: Record<string, number> = {};
    for (const response of survey.responses) {
      const tier = (response.metadata as Record<string, unknown>)?.tier as string || 'unknown';
      byTier[tier] = (byTier[tier] || 0) + 1;
    }

    return {
      surveyId: survey.id,
      code: survey.code,
      title: survey.title,
      totalResponses: responseCount,
      byTier,
      aggregatedResponses,
    };
  }

  // ==========================================
  // AI USAGE TRACKING
  // ==========================================

  /**
   * Track AI feature usage
   */
  async trackAIUsage(userId: string, data: AIUsageData) {
    // Get user's subscription tier
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    const tier = (subscription?.tier || 'FREE') as SubscriptionTier;

    // Create usage event
    await this.prisma.aIUsageEvent.create({
      data: {
        userId,
        tier,
        featureId: data.featureId,
        queryType: data.queryType,
        queryText: data.queryText,
        responseTimeMs: data.responseTimeMs,
        successful: data.successful ?? true,
        satisfaction: data.satisfaction,
        ...(data.metadata && { metadata: JSON.parse(JSON.stringify(data.metadata)) }),
      },
    });

    // Update usage limit tracking
    await this.updateUsageLimit(userId, data.featureId);

    this.logger.debug(`AI usage tracked: ${data.featureId} by ${userId}`);

    return { tracked: true };
  }

  /**
   * Get user's AI usage for current period
   */
  async getUserAIUsage(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    const tier = subscription?.tier || 'FREE';

    // Get limits based on tier
    const limits: Record<string, number | null> = {
      FREE: 3,
      PREMIUM: 20,
      PREMIUM_PLUS: null, // unlimited
    };
    const limit = limits[tier];

    // Get current month's usage
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const usageCount = await this.prisma.aIUsageEvent.count({
      where: {
        userId,
        featureId: 'ai_coach_basic',
        createdAt: { gte: periodStart },
      },
    });

    // Check if limit was hit
    const limitRecord = await this.prisma.featureUsageLimit.findFirst({
      where: {
        userId,
        featureId: 'ai_coach_basic',
        periodStart: { gte: periodStart },
      },
    });

    return {
      tier,
      limit: limit === null ? 'unlimited' : limit,
      used: usageCount,
      remaining: limit === null ? 'unlimited' : Math.max(0, limit - usageCount),
      limitHitAt: limitRecord?.limitHitAt,
      periodStart: periodStart.toISOString(),
      periodEnd: this.getMonthEnd().toISOString(),
    };
  }

  /**
   * Check if user can use AI feature
   */
  async canUseAIFeature(userId: string, featureId: string): Promise<boolean> {
    const usage = await this.getUserAIUsage(userId);

    if (usage.remaining === 'unlimited') {
      return true;
    }

    return (usage.remaining as number) > 0;
  }

  /**
   * Update usage limit tracking and check if limit hit
   */
  private async updateUsageLimit(userId: string, featureId: string) {
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = this.getMonthEnd();

    // Upsert usage limit record
    const existing = await this.prisma.featureUsageLimit.findFirst({
      where: {
        userId,
        featureId,
        periodStart: { gte: periodStart },
      },
    });

    if (existing) {
      await this.prisma.featureUsageLimit.update({
        where: { id: existing.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    } else {
      await this.prisma.featureUsageLimit.create({
        data: {
          userId,
          featureId,
          usedCount: 1,
          periodStart,
          periodEnd,
        },
      });
    }

    // Check if limit hit
    const usage = await this.getUserAIUsage(userId);
    if (usage.remaining === 0 && !existing?.limitHitAt) {
      // First time hitting limit - trigger survey
      await this.prisma.featureUsageLimit.updateMany({
        where: {
          userId,
          featureId,
          periodStart: { gte: periodStart },
        },
        data: {
          limitHitAt: new Date(),
        },
      });

      this.logger.log(`User ${userId} hit limit for ${featureId}`);
    }
  }

  // ==========================================
  // RESEARCH ANALYTICS
  // ==========================================

  /**
   * Get AI usage metrics for research
   */
  async getAIUsageMetrics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.prisma.aIUsageEvent.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        tier: true,
        queryType: true,
        satisfaction: true,
        userId: true,
      },
    });

    // Aggregate metrics
    const uniqueUsers = new Set(events.map((e) => e.userId)).size;
    const totalQueries = events.length;

    const queryTypeBreakdown: Record<string, number> = {};
    const tierBreakdown: Record<string, { queries: number; users: Set<string>; satisfaction: number[] }> = {
      FREE: { queries: 0, users: new Set(), satisfaction: [] },
      PREMIUM: { queries: 0, users: new Set(), satisfaction: [] },
      PREMIUM_PLUS: { queries: 0, users: new Set(), satisfaction: [] },
    };

    for (const event of events) {
      // Query type breakdown
      queryTypeBreakdown[event.queryType] =
        (queryTypeBreakdown[event.queryType] || 0) + 1;

      // Tier breakdown
      if (tierBreakdown[event.tier]) {
        tierBreakdown[event.tier].queries++;
        tierBreakdown[event.tier].users.add(event.userId);
        if (event.satisfaction) {
          tierBreakdown[event.tier].satisfaction.push(event.satisfaction);
        }
      }
    }

    // Calculate averages
    const tierStats: Record<string, { queries: number; users: number; avgSatisfaction: number }> = {};
    for (const [tier, data] of Object.entries(tierBreakdown)) {
      tierStats[tier] = {
        queries: data.queries,
        users: data.users.size,
        avgSatisfaction:
          data.satisfaction.length > 0
            ? data.satisfaction.reduce((a, b) => a + b, 0) /
              data.satisfaction.length
            : 0,
      };
    }

    return {
      period: { start: startDate.toISOString(), end: new Date().toISOString() },
      totalQueries,
      uniqueUsers,
      averageQueriesPerUser: uniqueUsers > 0 ? totalQueries / uniqueUsers : 0,
      queryTypeBreakdown,
      tierStats,
    };
  }

  /**
   * Get limit hit analysis
   */
  async getLimitHitAnalysis() {
    const limitHits = await this.prisma.featureUsageLimit.findMany({
      where: {
        limitHitAt: { not: null },
      },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    });

    // Analyze post-limit behavior
    const analysis: Record<string, { total: number; upgraded: number; churned: number }> = {
      FREE: { total: 0, upgraded: 0, churned: 0 },
      PREMIUM: { total: 0, upgraded: 0, churned: 0 },
    };

    for (const hit of limitHits) {
      const tierAtHit = 'FREE'; // Would need to track tier at time of hit
      if (analysis[tierAtHit]) {
        analysis[tierAtHit].total++;

        // Check if user upgraded after hitting limit
        const currentTier = hit.user.subscription?.tier;
        if (currentTier && currentTier !== tierAtHit) {
          analysis[tierAtHit].upgraded++;
        }
      }
    }

    return {
      totalLimitHits: limitHits.length,
      byTier: analysis,
      upgradeRateFromLimit: {
        FREE: analysis.FREE.total > 0
          ? (analysis.FREE.upgraded / analysis.FREE.total) * 100
          : 0,
        PREMIUM: analysis.PREMIUM.total > 0
          ? (analysis.PREMIUM.upgraded / analysis.PREMIUM.total) * 100
          : 0,
      },
    };
  }

  /**
   * Get query frequency patterns
   */
  async getQueryFrequencyPatterns() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await this.prisma.aIUsageEvent.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        userId: true,
      },
    });

    // By hour of day
    const byHour: Record<number, number> = {};
    // By day of week
    const byDayOfWeek: Record<number, number> = {};

    for (const event of events) {
      const hour = event.createdAt.getHours();
      const day = event.createdAt.getDay();

      byHour[hour] = (byHour[hour] || 0) + 1;
      byDayOfWeek[day] = (byDayOfWeek[day] || 0) + 1;
    }

    // Find peak times
    const peakHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0];
    const peakDay = Object.entries(byDayOfWeek).sort((a, b) => b[1] - a[1])[0];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      byHour,
      byDayOfWeek,
      peakHour: peakHour ? parseInt(peakHour[0]) : null,
      peakDay: peakDay ? dayNames[parseInt(peakDay[0])] : null,
      totalEvents: events.length,
    };
  }

  // ==========================================
  // SEED SURVEYS
  // ==========================================

  /**
   * Seed all research tests
   */
  async seedSurveys() {
    const surveys = this.getAllResearchTests();

    for (const survey of surveys) {
      await this.prisma.survey.upsert({
        where: { code: survey.code },
        update: survey,
        create: survey,
      });
    }

    this.logger.log(`Seeded ${surveys.length} research tests`);
    return { seeded: surveys.length, tests: surveys.map(s => s.code) };
  }

  /**
   * Get all research tests organized by category
   */
  private getAllResearchTests() {
    return [
      // ==========================================
      // TEST 1: WORKOUT LOGGING PREFERENCES
      // ==========================================
      {
        code: 'test_workout_logging',
        title: 'Workout Logging Test',
        titleAr: 'اختبار تسجيل التمارين',
        description: 'What do you want to track during workouts?',
        descriptionAr: 'ماذا تريد تتبعه أثناء التمارين؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'wl1',
            type: 'multiple_choice',
            question: 'What do you currently track during workouts?',
            questionAr: 'ماذا تتبع حالياً أثناء التمارين؟',
            options: [
              { value: 'weight', label: 'Weight lifted', labelAr: 'الوزن المرفوع' },
              { value: 'reps', label: 'Reps completed', labelAr: 'التكرارات' },
              { value: 'sets', label: 'Number of sets', labelAr: 'عدد المجموعات' },
              { value: 'rest', label: 'Rest time', labelAr: 'وقت الراحة' },
              { value: 'rpe', label: 'How hard it felt (RPE)', labelAr: 'مستوى الصعوبة' },
              { value: 'notes', label: 'Notes/comments', labelAr: 'ملاحظات' },
              { value: 'nothing', label: 'Nothing - I just workout', labelAr: 'لا شيء - أتمرن فقط' },
            ],
            required: true,
          },
          {
            id: 'wl2',
            type: 'single_choice',
            question: 'When do you log your sets?',
            questionAr: 'متى تسجل مجموعاتك؟',
            options: [
              { value: 'during_rest', label: 'Between sets (during rest)', labelAr: 'بين المجموعات (أثناء الراحة)' },
              { value: 'after_exercise', label: 'After finishing each exercise', labelAr: 'بعد كل تمرين' },
              { value: 'after_workout', label: 'After the whole workout', labelAr: 'بعد التمرين كله' },
              { value: 'dont_log', label: 'I don\'t log', labelAr: 'لا أسجل' },
            ],
            required: true,
          },
          {
            id: 'wl3',
            type: 'multiple_choice',
            question: 'What EXTRA data would you log if easy?',
            questionAr: 'ما البيانات الإضافية التي ستسجلها لو كانت سهلة؟',
            options: [
              { value: 'tempo', label: 'Tempo (speed of movement)', labelAr: 'سرعة الحركة' },
              { value: 'grip', label: 'Grip type/width', labelAr: 'نوع/عرض القبضة' },
              { value: 'machine_settings', label: 'Machine seat/settings', labelAr: 'إعدادات الجهاز' },
              { value: 'form_video', label: 'Video of my form', labelAr: 'فيديو للفورم' },
              { value: 'muscle_feel', label: 'Which muscles I felt', labelAr: 'العضلات اللي حسيت بيها' },
              { value: 'energy', label: 'Energy level', labelAr: 'مستوى الطاقة' },
              { value: 'pump', label: 'Pump rating', labelAr: 'مستوى البامب' },
            ],
            required: true,
          },
          {
            id: 'wl4',
            type: 'single_choice',
            question: 'Do you want the app to auto-suggest weights?',
            questionAr: 'هل تريد اقتراح الأوزان تلقائياً؟',
            options: [
              { value: 'yes_last', label: 'Yes, show my last weight', labelAr: 'أيوه، اعرض آخر وزن' },
              { value: 'yes_progressive', label: 'Yes, suggest progressive overload', labelAr: 'أيوه، اقترح زيادة تدريجية' },
              { value: 'no_manual', label: 'No, I\'ll enter manually', labelAr: 'لا، هدخل يدوي' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 2: NUTRITION TRACKING
      // ==========================================
      {
        code: 'test_nutrition_tracking',
        title: 'Nutrition Tracking Test',
        titleAr: 'اختبار تتبع التغذية',
        description: 'How do you want to log food?',
        descriptionAr: 'كيف تريد تسجيل الأكل؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'nt1',
            type: 'single_choice',
            question: 'How detailed do you want nutrition tracking?',
            questionAr: 'كم التفاصيل اللي تريدها في تتبع التغذية؟',
            options: [
              { value: 'calories_only', label: 'Just calories', labelAr: 'السعرات فقط' },
              { value: 'macros', label: 'Calories + Protein/Carbs/Fat', labelAr: 'السعرات + البروتين/الكربوهيدرات/الدهون' },
              { value: 'detailed', label: 'Full breakdown (fiber, sugar, etc)', labelAr: 'تفاصيل كاملة (ألياف، سكر، الخ)' },
              { value: 'none', label: 'I don\'t want to track nutrition', labelAr: 'مش عايز أتبع التغذية' },
            ],
            required: true,
          },
          {
            id: 'nt2',
            type: 'single_choice',
            question: 'How do you prefer to log meals?',
            questionAr: 'كيف تفضل تسجيل الوجبات؟',
            options: [
              { value: 'search', label: 'Search for food items', labelAr: 'البحث عن الأطعمة' },
              { value: 'barcode', label: 'Scan barcode', labelAr: 'مسح الباركود' },
              { value: 'photo', label: 'Take a photo (AI estimate)', labelAr: 'صورة (تقدير AI)' },
              { value: 'quick', label: 'Quick add (just enter numbers)', labelAr: 'إضافة سريعة (أرقام فقط)' },
              { value: 'saved', label: 'Pick from my saved meals', labelAr: 'اختار من وجباتي المحفوظة' },
            ],
            required: true,
          },
          {
            id: 'nt3',
            type: 'multiple_choice',
            question: 'What meals do you typically log?',
            questionAr: 'أي وجبات بتسجلها عادة؟',
            options: [
              { value: 'breakfast', label: 'Breakfast', labelAr: 'فطار' },
              { value: 'lunch', label: 'Lunch', labelAr: 'غداء' },
              { value: 'dinner', label: 'Dinner', labelAr: 'عشاء' },
              { value: 'snacks', label: 'Snacks', labelAr: 'سناكس' },
              { value: 'pre_workout', label: 'Pre-workout', labelAr: 'قبل التمرين' },
              { value: 'post_workout', label: 'Post-workout', labelAr: 'بعد التمرين' },
              { value: 'supplements', label: 'Supplements', labelAr: 'مكملات' },
            ],
            required: true,
          },
          {
            id: 'nt4',
            type: 'single_choice',
            question: 'Do you want water tracking?',
            questionAr: 'هل تريد تتبع الماء؟',
            options: [
              { value: 'yes_remind', label: 'Yes, with reminders', labelAr: 'أيوه، مع تذكيرات' },
              { value: 'yes_manual', label: 'Yes, I\'ll log manually', labelAr: 'أيوه، هسجل يدوي' },
              { value: 'no', label: 'No, not important to me', labelAr: 'لا، مش مهم' },
            ],
            required: true,
          },
          {
            id: 'nt5',
            type: 'single_choice',
            question: 'Egyptian food database - how important?',
            questionAr: 'قاعدة بيانات الأكل المصري - قد إيه مهمة؟',
            options: [
              { value: 'essential', label: 'Essential - I eat mostly Egyptian food', labelAr: 'ضرورية - باكل أكل مصري' },
              { value: 'helpful', label: 'Helpful but not required', labelAr: 'مفيدة بس مش لازم' },
              { value: 'not_needed', label: 'Not needed - I cook my own meals', labelAr: 'مش محتاج - بطبخ أكلي' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 3: BODY TRACKING & PROGRESS
      // ==========================================
      {
        code: 'test_body_tracking',
        title: 'Body Tracking Test',
        titleAr: 'اختبار تتبع الجسم',
        description: 'How do you track progress?',
        descriptionAr: 'كيف تتبع تقدمك؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'bt1',
            type: 'multiple_choice',
            question: 'What body metrics do you want to track?',
            questionAr: 'ما مقاييس الجسم اللي تريد تتبعها؟',
            options: [
              { value: 'weight', label: 'Weight', labelAr: 'الوزن' },
              { value: 'body_fat', label: 'Body fat %', labelAr: 'نسبة الدهون' },
              { value: 'muscle_mass', label: 'Muscle mass', labelAr: 'الكتلة العضلية' },
              { value: 'measurements', label: 'Tape measurements (arms, waist, etc)', labelAr: 'قياسات (ذراع، وسط، الخ)' },
              { value: 'photos', label: 'Progress photos', labelAr: 'صور التقدم' },
              { value: 'none', label: 'Just track workouts', labelAr: 'التمارين فقط' },
            ],
            required: true,
          },
          {
            id: 'bt2',
            type: 'single_choice',
            question: 'How often do you weigh yourself?',
            questionAr: 'كل قد إيه توزن نفسك؟',
            options: [
              { value: 'daily', label: 'Daily', labelAr: 'يومياً' },
              { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعياً' },
              { value: 'biweekly', label: 'Every 2 weeks', labelAr: 'كل أسبوعين' },
              { value: 'monthly', label: 'Monthly', labelAr: 'شهرياً' },
              { value: 'never', label: 'Never / Don\'t own a scale', labelAr: 'أبداً / معنديش ميزان' },
            ],
            required: true,
          },
          {
            id: 'bt3',
            type: 'single_choice',
            question: 'Do you take progress photos?',
            questionAr: 'هل تاخد صور تقدم؟',
            options: [
              { value: 'weekly', label: 'Yes, weekly', labelAr: 'أيوه، أسبوعياً' },
              { value: 'monthly', label: 'Yes, monthly', labelAr: 'أيوه، شهرياً' },
              { value: 'sometimes', label: 'Sometimes', labelAr: 'أحياناً' },
              { value: 'never', label: 'Never', labelAr: 'أبداً' },
              { value: 'would_if_private', label: 'Would if completely private', labelAr: 'لو خاصة تماماً' },
            ],
            required: true,
          },
          {
            id: 'bt4',
            type: 'multiple_choice',
            question: 'What strength PRs do you care about?',
            questionAr: 'ما أرقامك القياسية اللي تهتم بيها؟',
            options: [
              { value: 'bench', label: 'Bench Press', labelAr: 'بنش بريس' },
              { value: 'squat', label: 'Squat', labelAr: 'سكوات' },
              { value: 'deadlift', label: 'Deadlift', labelAr: 'ديدليفت' },
              { value: 'ohp', label: 'Overhead Press', labelAr: 'أوفرهيد بريس' },
              { value: 'row', label: 'Barbell Row', labelAr: 'باربل رو' },
              { value: 'all', label: 'All exercises', labelAr: 'كل التمارين' },
              { value: 'none', label: 'Don\'t care about PRs', labelAr: 'مش مهتم بالأرقام القياسية' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 4: SCHEDULE & LIFESTYLE
      // ==========================================
      {
        code: 'test_schedule_lifestyle',
        title: 'Schedule & Lifestyle Test',
        titleAr: 'اختبار الجدول ونمط الحياة',
        description: 'Your workout & eating schedule',
        descriptionAr: 'جدول تمارينك وأكلك',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'sl1',
            type: 'single_choice',
            question: 'When do you usually workout?',
            questionAr: 'متى تتمرن عادة؟',
            options: [
              { value: 'early_morning', label: 'Early morning (5-7am)', labelAr: 'الصبح بدري (5-7)' },
              { value: 'morning', label: 'Morning (7-10am)', labelAr: 'الصبح (7-10)' },
              { value: 'midday', label: 'Midday (10am-2pm)', labelAr: 'الضهر (10-2)' },
              { value: 'afternoon', label: 'Afternoon (2-5pm)', labelAr: 'بعد الضهر (2-5)' },
              { value: 'evening', label: 'Evening (5-8pm)', labelAr: 'المساء (5-8)' },
              { value: 'night', label: 'Night (8pm+)', labelAr: 'بالليل (8+)' },
              { value: 'varies', label: 'It varies', labelAr: 'بيتغير' },
            ],
            required: true,
          },
          {
            id: 'sl2',
            type: 'single_choice',
            question: 'How many days per week do you train?',
            questionAr: 'كم يوم في الأسبوع تتمرن؟',
            options: [
              { value: '2-3', label: '2-3 days', labelAr: '2-3 أيام' },
              { value: '4', label: '4 days', labelAr: '4 أيام' },
              { value: '5', label: '5 days', labelAr: '5 أيام' },
              { value: '6', label: '6 days', labelAr: '6 أيام' },
              { value: '7', label: 'Every day', labelAr: 'كل يوم' },
            ],
            required: true,
          },
          {
            id: 'sl3',
            type: 'single_choice',
            question: 'How long is your typical workout?',
            questionAr: 'كم مدة تمرينك العادي؟',
            options: [
              { value: '30-45', label: '30-45 minutes', labelAr: '30-45 دقيقة' },
              { value: '45-60', label: '45-60 minutes', labelAr: '45-60 دقيقة' },
              { value: '60-90', label: '60-90 minutes', labelAr: '60-90 دقيقة' },
              { value: '90+', label: '90+ minutes', labelAr: '90+ دقيقة' },
            ],
            required: true,
          },
          {
            id: 'sl4',
            type: 'single_choice',
            question: 'Do you meal prep?',
            questionAr: 'هل تحضر وجباتك مسبقاً؟',
            options: [
              { value: 'full_week', label: 'Yes, full week', labelAr: 'أيوه، الأسبوع كله' },
              { value: 'few_days', label: 'Yes, few days ahead', labelAr: 'أيوه، كام يوم' },
              { value: 'sometimes', label: 'Sometimes', labelAr: 'أحياناً' },
              { value: 'never', label: 'No, I cook daily', labelAr: 'لا، بطبخ يومي' },
              { value: 'dont_cook', label: 'I don\'t cook', labelAr: 'مش بطبخ' },
            ],
            required: true,
          },
          {
            id: 'sl5',
            type: 'single_choice',
            question: 'Where do you workout?',
            questionAr: 'فين بتتمرن؟',
            options: [
              { value: 'gym', label: 'Commercial gym', labelAr: 'جيم' },
              { value: 'home_full', label: 'Home gym (full equipment)', labelAr: 'جيم في البيت (معدات كاملة)' },
              { value: 'home_basic', label: 'Home (basic equipment)', labelAr: 'البيت (معدات بسيطة)' },
              { value: 'both', label: 'Mix of gym and home', labelAr: 'جيم والبيت' },
              { value: 'outdoor', label: 'Outdoor/Calisthenics', labelAr: 'في الشارع/كاليستنيكس' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 5: GOALS & MOTIVATION
      // ==========================================
      {
        code: 'test_goals_motivation',
        title: 'Goals & Motivation Test',
        titleAr: 'اختبار الأهداف والتحفيز',
        description: 'What drives you?',
        descriptionAr: 'ما الذي يحفزك؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'gm1',
            type: 'single_choice',
            question: 'What\'s your PRIMARY fitness goal right now?',
            questionAr: 'ما هدفك الأساسي حالياً؟',
            options: [
              { value: 'lose_fat', label: 'Lose fat', labelAr: 'خسارة دهون' },
              { value: 'build_muscle', label: 'Build muscle', labelAr: 'بناء عضل' },
              { value: 'recomp', label: 'Both (recomp)', labelAr: 'الاتنين' },
              { value: 'strength', label: 'Get stronger', labelAr: 'زيادة القوة' },
              { value: 'health', label: 'General health', labelAr: 'الصحة العامة' },
              { value: 'athletic', label: 'Athletic performance', labelAr: 'الأداء الرياضي' },
              { value: 'maintain', label: 'Maintain current shape', labelAr: 'الحفاظ على الشكل' },
            ],
            required: true,
          },
          {
            id: 'gm2',
            type: 'multiple_choice',
            question: 'What motivates you most?',
            questionAr: 'ما الذي يحفزك أكثر؟',
            options: [
              { value: 'look_better', label: 'Looking better', labelAr: 'شكل أحسن' },
              { value: 'feel_better', label: 'Feeling better', labelAr: 'إحساس أحسن' },
              { value: 'strength_gains', label: 'Getting stronger', labelAr: 'زيادة القوة' },
              { value: 'health', label: 'Health benefits', labelAr: 'فوائد صحية' },
              { value: 'discipline', label: 'Building discipline', labelAr: 'بناء الانضباط' },
              { value: 'social', label: 'Social/community', labelAr: 'المجتمع والأصدقاء' },
              { value: 'competition', label: 'Competition', labelAr: 'المنافسة' },
            ],
            required: true,
          },
          {
            id: 'gm3',
            type: 'single_choice',
            question: 'Do you want goal deadlines?',
            questionAr: 'هل تريد مواعيد نهائية للأهداف؟',
            options: [
              { value: 'yes_strict', label: 'Yes, strict deadlines', labelAr: 'أيوه، مواعيد صارمة' },
              { value: 'yes_flexible', label: 'Yes, but flexible', labelAr: 'أيوه، بس مرنة' },
              { value: 'no', label: 'No, I go at my own pace', labelAr: 'لا، بمشي على راحتي' },
            ],
            required: true,
          },
          {
            id: 'gm4',
            type: 'single_choice',
            question: 'How do you feel about workout streaks?',
            questionAr: 'رأيك في سلسلة التمارين المتتالية؟',
            options: [
              { value: 'love', label: 'Love them - keeps me accountable', labelAr: 'بحبها - بتخليني ملتزم' },
              { value: 'like', label: 'Nice to see, not essential', labelAr: 'حلوة، بس مش أساسية' },
              { value: 'pressure', label: 'They stress me out', labelAr: 'بتضغطني' },
              { value: 'dont_care', label: 'Don\'t care', labelAr: 'مش فارقة' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 6: SOCIAL & COMMUNITY
      // ==========================================
      {
        code: 'test_social_community',
        title: 'Social & Community Test',
        titleAr: 'اختبار الاجتماعي والمجتمع',
        description: 'How social do you want the app?',
        descriptionAr: 'قد إيه تريد التطبيق اجتماعي؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'sc1',
            type: 'single_choice',
            question: 'Would you join a squad/group?',
            questionAr: 'هل هتنضم لمجموعة/سكواد؟',
            options: [
              { value: 'yes_active', label: 'Yes, I\'d be active', labelAr: 'أيوه، هكون نشيط' },
              { value: 'yes_lurk', label: 'Yes, but just watch', labelAr: 'أيوه، بس أتفرج' },
              { value: 'maybe_friends', label: 'Only with friends I know', labelAr: 'بس مع أصحابي' },
              { value: 'no', label: 'No, I prefer solo', labelAr: 'لا، بفضل لوحدي' },
            ],
            required: true,
          },
          {
            id: 'sc2',
            type: 'multiple_choice',
            question: 'What would you share with others?',
            questionAr: 'ما الذي ستشاركه مع الآخرين؟',
            options: [
              { value: 'workouts', label: 'Completed workouts', labelAr: 'التمارين المكتملة' },
              { value: 'prs', label: 'New PRs', labelAr: 'أرقام قياسية جديدة' },
              { value: 'progress_pics', label: 'Progress photos', labelAr: 'صور التقدم' },
              { value: 'meals', label: 'Meal photos', labelAr: 'صور الوجبات' },
              { value: 'achievements', label: 'Achievements/badges', labelAr: 'الإنجازات' },
              { value: 'nothing', label: 'Nothing - keep private', labelAr: 'لا شيء - خصوصية' },
            ],
            required: true,
          },
          {
            id: 'sc3',
            type: 'single_choice',
            question: 'Would you do group challenges?',
            questionAr: 'هل تشارك في تحديات جماعية؟',
            options: [
              { value: 'yes_compete', label: 'Yes, I want to compete', labelAr: 'أيوه، عايز أنافس' },
              { value: 'yes_motivation', label: 'Yes, for motivation', labelAr: 'أيوه، للتحفيز' },
              { value: 'maybe', label: 'Maybe with friends', labelAr: 'ممكن مع أصحابي' },
              { value: 'no', label: 'No interest', labelAr: 'مش مهتم' },
            ],
            required: true,
          },
          {
            id: 'sc4',
            type: 'single_choice',
            question: 'Would you want a workout buddy matching feature?',
            questionAr: 'تريد ميزة إيجاد شريك تمرين؟',
            options: [
              { value: 'yes', label: 'Yes, would love it', labelAr: 'أيوه، هتكون حلوة' },
              { value: 'maybe', label: 'Maybe, if well done', labelAr: 'ممكن، لو متعملة كويس' },
              { value: 'no', label: 'No, I train alone', labelAr: 'لا، بتمرن لوحدي' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 7: COACH & TRAINER INTERACTION
      // ==========================================
      {
        code: 'test_coach_interaction',
        title: 'Coach Interaction Test',
        titleAr: 'اختبار التفاعل مع المدرب',
        description: 'How do you want trainer support?',
        descriptionAr: 'كيف تريد دعم المدرب؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'ci1',
            type: 'single_choice',
            question: 'Do you currently have a trainer/coach?',
            questionAr: 'هل لديك مدرب حالياً؟',
            options: [
              { value: 'yes_inperson', label: 'Yes, in-person', labelAr: 'أيوه، وجهاً لوجه' },
              { value: 'yes_online', label: 'Yes, online coach', labelAr: 'أيوه، مدرب أونلاين' },
              { value: 'had_before', label: 'Had one before', labelAr: 'كان عندي قبل كده' },
              { value: 'never', label: 'Never had one', labelAr: 'عمري ما كان' },
              { value: 'self_coached', label: 'I coach myself', labelAr: 'بدرب نفسي' },
            ],
            required: true,
          },
          {
            id: 'ci2',
            type: 'multiple_choice',
            question: 'What would you want from a trainer?',
            questionAr: 'ما الذي تريده من المدرب؟',
            options: [
              { value: 'program', label: 'Custom workout program', labelAr: 'برنامج تمارين مخصص' },
              { value: 'nutrition', label: 'Nutrition/meal plan', labelAr: 'خطة تغذية' },
              { value: 'form_check', label: 'Form checks on videos', labelAr: 'مراجعة الفورم بالفيديو' },
              { value: 'accountability', label: 'Accountability check-ins', labelAr: 'متابعة الالتزام' },
              { value: 'motivation', label: 'Motivation/support', labelAr: 'تحفيز ودعم' },
              { value: 'questions', label: 'Answer my questions', labelAr: 'الرد على أسئلتي' },
            ],
            required: true,
          },
          {
            id: 'ci3',
            type: 'single_choice',
            question: 'How often would you want to check-in with a coach?',
            questionAr: 'كل قد إيه تريد التواصل مع المدرب؟',
            options: [
              { value: 'daily', label: 'Daily', labelAr: 'يومياً' },
              { value: 'few_times_week', label: 'Few times a week', labelAr: 'عدة مرات في الأسبوع' },
              { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعياً' },
              { value: 'biweekly', label: 'Every 2 weeks', labelAr: 'كل أسبوعين' },
              { value: 'as_needed', label: 'Only when I need help', labelAr: 'لما أحتاج مساعدة بس' },
            ],
            required: true,
          },
          {
            id: 'ci4',
            type: 'single_choice',
            question: 'Preferred communication with coach?',
            questionAr: 'طريقة التواصل المفضلة مع المدرب؟',
            options: [
              { value: 'app_chat', label: 'In-app chat', labelAr: 'شات في التطبيق' },
              { value: 'whatsapp', label: 'WhatsApp', labelAr: 'واتساب' },
              { value: 'video_call', label: 'Video calls', labelAr: 'مكالمات فيديو' },
              { value: 'voice', label: 'Voice messages', labelAr: 'رسائل صوتية' },
              { value: 'any', label: 'Any works', labelAr: 'أي طريقة' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 8: ONBOARDING DEPTH
      // ==========================================
      {
        code: 'test_onboarding_depth',
        title: 'Onboarding Test',
        titleAr: 'اختبار التسجيل',
        description: 'How much info should we collect upfront?',
        descriptionAr: 'كم معلومات نجمع في البداية؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'od1',
            type: 'single_choice',
            question: 'How long of an onboarding is acceptable?',
            questionAr: 'كم مدة التسجيل المقبولة؟',
            options: [
              { value: '1min', label: '1 minute (very quick)', labelAr: 'دقيقة (سريع جداً)' },
              { value: '3min', label: '2-3 minutes', labelAr: '2-3 دقائق' },
              { value: '5min', label: '5 minutes', labelAr: '5 دقائق' },
              { value: '10min', label: '10+ minutes if it helps', labelAr: '10+ دقائق لو مفيد' },
            ],
            required: true,
          },
          {
            id: 'od2',
            type: 'multiple_choice',
            question: 'What info are you comfortable sharing at signup?',
            questionAr: 'ما المعلومات المريح مشاركتها عند التسجيل؟',
            options: [
              { value: 'weight', label: 'Current weight', labelAr: 'الوزن الحالي' },
              { value: 'height', label: 'Height', labelAr: 'الطول' },
              { value: 'age', label: 'Age', labelAr: 'العمر' },
              { value: 'body_fat', label: 'Body fat %', labelAr: 'نسبة الدهون' },
              { value: 'injuries', label: 'Injuries/limitations', labelAr: 'إصابات/قيود' },
              { value: 'medical', label: 'Medical conditions', labelAr: 'حالات طبية' },
              { value: 'experience', label: 'Training experience', labelAr: 'خبرة التدريب' },
              { value: 'goals', label: 'Fitness goals', labelAr: 'أهداف اللياقة' },
              { value: 'diet', label: 'Diet preferences', labelAr: 'تفضيلات الغذاء' },
            ],
            required: true,
          },
          {
            id: 'od3',
            type: 'single_choice',
            question: 'Do you want personalized recommendations from day 1?',
            questionAr: 'تريد توصيات مخصصة من أول يوم؟',
            options: [
              { value: 'yes_worth_it', label: 'Yes, worth more questions', labelAr: 'أيوه، تستاهل أسئلة أكتر' },
              { value: 'yes_quick', label: 'Yes, but keep it quick', labelAr: 'أيوه، بس بسرعة' },
              { value: 'no_explore', label: 'No, let me explore first', labelAr: 'لا، خليني أستكشف الأول' },
            ],
            required: true,
          },
          {
            id: 'od4',
            type: 'single_choice',
            question: 'Would you do a fitness assessment?',
            questionAr: 'هل تعمل تقييم لياقة؟',
            options: [
              { value: 'yes_detailed', label: 'Yes, detailed one', labelAr: 'أيوه، مفصل' },
              { value: 'yes_quick', label: 'Yes, quick one', labelAr: 'أيوه، سريع' },
              { value: 'maybe_later', label: 'Maybe later, not at signup', labelAr: 'ممكن بعدين، مش عند التسجيل' },
              { value: 'no', label: 'No', labelAr: 'لا' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 9: NOTIFICATIONS & REMINDERS
      // ==========================================
      {
        code: 'test_notifications',
        title: 'Notifications Test',
        titleAr: 'اختبار الإشعارات',
        description: 'What reminders do you want?',
        descriptionAr: 'ما التذكيرات التي تريدها؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'not1',
            type: 'multiple_choice',
            question: 'What notifications would you enable?',
            questionAr: 'ما الإشعارات التي ستفعّلها؟',
            options: [
              { value: 'workout_reminder', label: 'Workout reminders', labelAr: 'تذكير التمرين' },
              { value: 'meal_log', label: 'Meal logging reminders', labelAr: 'تذكير تسجيل الوجبات' },
              { value: 'water', label: 'Water reminders', labelAr: 'تذكير الماء' },
              { value: 'weigh_in', label: 'Weigh-in reminders', labelAr: 'تذكير الوزن' },
              { value: 'rest_day', label: 'Rest day reminders', labelAr: 'تذكير يوم الراحة' },
              { value: 'streak', label: 'Streak notifications', labelAr: 'إشعارات السلسلة' },
              { value: 'coach', label: 'Coach messages', labelAr: 'رسائل المدرب' },
              { value: 'none', label: 'None - I\'ll check the app', labelAr: 'لا شيء - هفتح التطبيق' },
            ],
            required: true,
          },
          {
            id: 'not2',
            type: 'single_choice',
            question: 'How many notifications per day is too many?',
            questionAr: 'كم إشعار في اليوم كتير؟',
            options: [
              { value: '1', label: '1 is enough', labelAr: '1 كفاية' },
              { value: '3', label: '2-3 max', labelAr: '2-3 ماكس' },
              { value: '5', label: '4-5 max', labelAr: '4-5 ماكس' },
              { value: 'unlimited', label: 'Don\'t mind many', labelAr: 'مش فارقة' },
            ],
            required: true,
          },
          {
            id: 'not3',
            type: 'single_choice',
            question: 'Best time for workout reminders?',
            questionAr: 'أفضل وقت لتذكير التمرين؟',
            options: [
              { value: 'morning', label: 'Morning (6-9am)', labelAr: 'الصبح (6-9)' },
              { value: 'before_lunch', label: 'Before lunch (11am)', labelAr: 'قبل الغداء (11)' },
              { value: 'afternoon', label: 'Afternoon (3-5pm)', labelAr: 'بعد الضهر (3-5)' },
              { value: 'evening', label: 'Evening (6-8pm)', labelAr: 'المساء (6-8)' },
              { value: 'custom', label: 'Let me set custom time', labelAr: 'خليني أحدد الوقت' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 10: FEATURE PRIORITY
      // ==========================================
      {
        code: 'test_feature_priority',
        title: 'Feature Priority Test',
        titleAr: 'اختبار أولوية الميزات',
        description: 'What features matter most?',
        descriptionAr: 'ما الميزات الأهم؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'fp1',
            type: 'single_choice',
            question: 'Most important feature for you?',
            questionAr: 'أهم ميزة لك؟',
            options: [
              { value: 'workout_tracking', label: 'Workout tracking', labelAr: 'تتبع التمارين' },
              { value: 'nutrition_tracking', label: 'Nutrition tracking', labelAr: 'تتبع التغذية' },
              { value: 'progress_tracking', label: 'Progress/body tracking', labelAr: 'تتبع التقدم' },
              { value: 'ai_coach', label: 'AI coaching', labelAr: 'تدريب AI' },
              { value: 'human_coach', label: 'Human trainer', labelAr: 'مدرب بشري' },
              { value: 'programs', label: 'Workout programs', labelAr: 'برامج تمارين' },
              { value: 'community', label: 'Community/social', labelAr: 'المجتمع' },
            ],
            required: true,
          },
          {
            id: 'fp2',
            type: 'multiple_choice',
            question: 'Which features would you pay for?',
            questionAr: 'أي ميزات هتدفع لها؟',
            options: [
              { value: 'ai_unlimited', label: 'Unlimited AI coaching', labelAr: 'تدريب AI غير محدود' },
              { value: 'human_coach', label: 'Human trainer access', labelAr: 'وصول لمدرب بشري' },
              { value: 'custom_programs', label: 'Custom workout programs', labelAr: 'برامج مخصصة' },
              { value: 'meal_plans', label: 'Personalized meal plans', labelAr: 'خطط وجبات مخصصة' },
              { value: 'analytics', label: 'Advanced analytics', labelAr: 'تحليلات متقدمة' },
              { value: 'form_check', label: 'AI form checking', labelAr: 'فحص الفورم بالAI' },
              { value: 'none', label: 'Nothing - want it free', labelAr: 'لا شيء - عايزه مجاني' },
            ],
            required: true,
          },
          {
            id: 'fp3',
            type: 'single_choice',
            question: 'How important is Arabic language support?',
            questionAr: 'قد إيه مهم دعم اللغة العربية؟',
            options: [
              { value: 'essential', label: 'Essential - I prefer Arabic', labelAr: 'ضروري - بفضل العربي' },
              { value: 'nice', label: 'Nice to have', labelAr: 'حلو لو موجود' },
              { value: 'not_needed', label: 'Not needed - I use English', labelAr: 'مش محتاج - باستخدم إنجليزي' },
            ],
            required: true,
          },
          {
            id: 'fp4',
            type: 'single_choice',
            question: 'Would you use offline mode?',
            questionAr: 'هتستخدم وضع بدون إنترنت؟',
            options: [
              { value: 'yes_essential', label: 'Yes, essential for gym', labelAr: 'أيوه، ضروري في الجيم' },
              { value: 'yes_sometimes', label: 'Yes, sometimes useful', labelAr: 'أيوه، مفيد أحياناً' },
              { value: 'no', label: 'No, always have internet', labelAr: 'لا، عندي نت دايماً' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 11: PRICING & VALUE
      // ==========================================
      {
        code: 'test_pricing_value',
        title: 'Pricing & Value Test',
        titleAr: 'اختبار التسعير والقيمة',
        description: 'What would you pay for?',
        descriptionAr: 'ما الذي ستدفع له؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'pv1',
            type: 'single_choice',
            question: 'How much do you spend on fitness monthly?',
            questionAr: 'كم تصرف على اللياقة شهرياً؟',
            options: [
              { value: '0', label: 'Nothing', labelAr: 'لا شيء' },
              { value: 'gym_only', label: 'Just gym membership', labelAr: 'اشتراك الجيم فقط' },
              { value: '500', label: '200-500 EGP', labelAr: '200-500 جنيه' },
              { value: '1000', label: '500-1000 EGP', labelAr: '500-1000 جنيه' },
              { value: '2000', label: '1000-2000 EGP', labelAr: '1000-2000 جنيه' },
              { value: '2000+', label: '2000+ EGP', labelAr: '2000+ جنيه' },
            ],
            required: true,
          },
          {
            id: 'pv2',
            type: 'single_choice',
            question: 'Would you pay 79 EGP/month for Premium?',
            questionAr: 'هتدفع 79 جنيه/شهر لـ Premium؟',
            options: [
              { value: 'yes_definitely', label: 'Yes, definitely', labelAr: 'أيوه بالتأكيد' },
              { value: 'yes_if_value', label: 'Yes, if it provides value', labelAr: 'أيوه لو فيه قيمة' },
              { value: 'maybe', label: 'Maybe, need to try first', labelAr: 'ممكن، لازم أجرب الأول' },
              { value: 'no_too_much', label: 'No, too expensive', labelAr: 'لا، غالي' },
              { value: 'no_free_only', label: 'No, free only', labelAr: 'لا، مجاني فقط' },
            ],
            required: true,
          },
          {
            id: 'pv3',
            type: 'single_choice',
            question: 'Would you pay 449 EGP/month for Premium+ with human trainer?',
            questionAr: 'هتدفع 449 جنيه/شهر لـ Premium+ مع مدرب؟',
            options: [
              { value: 'yes', label: 'Yes, good value', labelAr: 'أيوه، قيمة كويسة' },
              { value: 'maybe', label: 'Maybe for the right trainer', labelAr: 'ممكن للمدرب المناسب' },
              { value: 'no_expensive', label: 'No, too expensive', labelAr: 'لا، غالي' },
              { value: 'no_dont_need', label: 'No, don\'t need a trainer', labelAr: 'لا، مش محتاج مدرب' },
            ],
            required: true,
          },
          {
            id: 'pv4',
            type: 'single_choice',
            question: 'Yearly vs monthly subscription?',
            questionAr: 'اشتراك سنوي ولا شهري؟',
            options: [
              { value: 'yearly', label: 'Yearly for discount', labelAr: 'سنوي للخصم' },
              { value: 'monthly', label: 'Monthly - more flexible', labelAr: 'شهري - أكثر مرونة' },
              { value: 'depends', label: 'Depends on the discount', labelAr: 'حسب الخصم' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 12: APP EXPERIENCE & UX
      // ==========================================
      {
        code: 'test_app_experience',
        title: 'App Experience Test',
        titleAr: 'اختبار تجربة التطبيق',
        description: 'How should the app feel?',
        descriptionAr: 'كيف يجب أن يكون التطبيق؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'ax1',
            type: 'single_choice',
            question: 'Preferred app theme?',
            questionAr: 'ثيم التطبيق المفضل؟',
            options: [
              { value: 'dark', label: 'Dark mode always', labelAr: 'الوضع الداكن دايماً' },
              { value: 'light', label: 'Light mode always', labelAr: 'الوضع الفاتح دايماً' },
              { value: 'system', label: 'Follow system', labelAr: 'حسب النظام' },
              { value: 'both', label: 'Option to switch', labelAr: 'خيار للتبديل' },
            ],
            required: true,
          },
          {
            id: 'ax2',
            type: 'single_choice',
            question: 'What fitness apps have you used?',
            questionAr: 'ما تطبيقات اللياقة التي استخدمتها؟',
            options: [
              { value: 'strong', label: 'Strong', labelAr: 'Strong' },
              { value: 'hevy', label: 'Hevy', labelAr: 'Hevy' },
              { value: 'myfitnesspal', label: 'MyFitnessPal', labelAr: 'MyFitnessPal' },
              { value: 'fitbit', label: 'Fitbit', labelAr: 'Fitbit' },
              { value: 'apple_health', label: 'Apple Health', labelAr: 'Apple Health' },
              { value: 'other', label: 'Other', labelAr: 'غيره' },
              { value: 'none', label: 'None', labelAr: 'لا شيء' },
            ],
            required: true,
          },
          {
            id: 'ax3',
            type: 'single_choice',
            question: 'How important is speed/performance?',
            questionAr: 'قد إيه مهمة السرعة/الأداء؟',
            options: [
              { value: 'critical', label: 'Critical - app must be fast', labelAr: 'حرج - لازم يكون سريع' },
              { value: 'important', label: 'Important but not critical', labelAr: 'مهم بس مش حرج' },
              { value: 'ok', label: 'Ok with some loading', labelAr: 'مقبول بعض التحميل' },
            ],
            required: true,
          },
          {
            id: 'ax4',
            type: 'single_choice',
            question: 'What frustrates you most in fitness apps?',
            questionAr: 'ما الذي يزعجك في تطبيقات اللياقة؟',
            options: [
              { value: 'too_complex', label: 'Too complex/overwhelming', labelAr: 'معقد/مربك' },
              { value: 'too_simple', label: 'Too simple/limited', labelAr: 'بسيط جداً/محدود' },
              { value: 'slow', label: 'Slow/laggy', labelAr: 'بطيء' },
              { value: 'ads', label: 'Too many ads', labelAr: 'إعلانات كتير' },
              { value: 'forced_premium', label: 'Features locked behind paywall', labelAr: 'ميزات محجوبة' },
              { value: 'no_arabic', label: 'No Arabic support', labelAr: 'مفيش عربي' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 13: EQUIPMENT & GYM SETUP
      // ==========================================
      {
        code: 'test_equipment',
        title: 'Equipment Test',
        titleAr: 'اختبار المعدات',
        description: 'What equipment do you have access to?',
        descriptionAr: 'ما المعدات المتاحة لك؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'eq1',
            type: 'multiple_choice',
            question: 'What equipment does your gym have?',
            questionAr: 'ما المعدات في الجيم؟',
            options: [
              { value: 'barbells', label: 'Barbells & plates', labelAr: 'بار وأوزان' },
              { value: 'dumbbells', label: 'Dumbbells', labelAr: 'دمبلز' },
              { value: 'cables', label: 'Cable machines', labelAr: 'أجهزة الكيبل' },
              { value: 'machines', label: 'Weight machines', labelAr: 'أجهزة الأوزان' },
              { value: 'smith', label: 'Smith machine', labelAr: 'سميث ماشين' },
              { value: 'rack', label: 'Squat/Power rack', labelAr: 'راك السكوات' },
              { value: 'bench', label: 'Benches', labelAr: 'بنشات' },
              { value: 'cardio', label: 'Cardio machines', labelAr: 'أجهزة كارديو' },
            ],
            required: true,
          },
          {
            id: 'eq2',
            type: 'single_choice',
            question: 'Is your gym usually crowded?',
            questionAr: 'الجيم عادة مزدحم؟',
            options: [
              { value: 'never', label: 'Never - always empty', labelAr: 'أبداً - فاضي' },
              { value: 'sometimes', label: 'Sometimes crowded', labelAr: 'أحياناً مزدحم' },
              { value: 'often', label: 'Often crowded', labelAr: 'غالباً مزدحم' },
              { value: 'always', label: 'Always packed', labelAr: 'دايماً مليان' },
            ],
            required: true,
          },
          {
            id: 'eq3',
            type: 'single_choice',
            question: 'Would you like alternative exercises for busy equipment?',
            questionAr: 'تريد تمارين بديلة للمعدات المشغولة؟',
            options: [
              { value: 'yes_always', label: 'Yes, always show alternatives', labelAr: 'أيوه، دايماً اعرض بدائل' },
              { value: 'yes_ask', label: 'Yes, but ask me first', labelAr: 'أيوه، بس اسألني الأول' },
              { value: 'no', label: 'No, I\'ll wait', labelAr: 'لا، هستنى' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 14: INJURY & LIMITATIONS
      // ==========================================
      {
        code: 'test_injuries',
        title: 'Injuries & Limitations Test',
        titleAr: 'اختبار الإصابات والقيود',
        description: 'Any injuries or limitations?',
        descriptionAr: 'أي إصابات أو قيود؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'inj1',
            type: 'multiple_choice',
            question: 'Do you have any current injuries/limitations?',
            questionAr: 'هل لديك إصابات/قيود حالية؟',
            options: [
              { value: 'none', label: 'None', labelAr: 'لا شيء' },
              { value: 'knee', label: 'Knee issues', labelAr: 'مشاكل الركبة' },
              { value: 'back', label: 'Back issues', labelAr: 'مشاكل الظهر' },
              { value: 'shoulder', label: 'Shoulder issues', labelAr: 'مشاكل الكتف' },
              { value: 'wrist', label: 'Wrist issues', labelAr: 'مشاكل الرسغ' },
              { value: 'hip', label: 'Hip issues', labelAr: 'مشاكل الورك' },
              { value: 'other', label: 'Other', labelAr: 'غيره' },
            ],
            required: true,
          },
          {
            id: 'inj2',
            type: 'single_choice',
            question: 'How should the app handle injuries?',
            questionAr: 'كيف يتعامل التطبيق مع الإصابات؟',
            options: [
              { value: 'auto_swap', label: 'Automatically swap exercises', labelAr: 'استبدال التمارين تلقائياً' },
              { value: 'suggest', label: 'Suggest alternatives, I choose', labelAr: 'اقترح بدائل، أنا أختار' },
              { value: 'warn', label: 'Just warn me', labelAr: 'بس نبهني' },
              { value: 'nothing', label: 'Nothing, I\'ll manage', labelAr: 'لا شيء، هتصرف' },
            ],
            required: true,
          },
          {
            id: 'inj3',
            type: 'single_choice',
            question: 'Would you value rehab/prehab exercises?',
            questionAr: 'هل تقدر تمارين إعادة التأهيل؟',
            options: [
              { value: 'yes_integrated', label: 'Yes, integrate into my workouts', labelAr: 'أيوه، ادمجها في تماريني' },
              { value: 'yes_separate', label: 'Yes, as separate routines', labelAr: 'أيوه، كروتين منفصل' },
              { value: 'maybe', label: 'Maybe for specific injuries', labelAr: 'ممكن لإصابات معينة' },
              { value: 'no', label: 'No need', labelAr: 'مش محتاج' },
            ],
            required: true,
          },
        ],
      },

      // ==========================================
      // TEST 15: RAMADAN & SPECIAL PERIODS
      // ==========================================
      {
        code: 'test_ramadan',
        title: 'Ramadan & Fasting Test',
        titleAr: 'اختبار رمضان والصيام',
        description: 'Training during Ramadan?',
        descriptionAr: 'التدريب في رمضان؟',
        triggerEvent: 'manual',
        questions: [
          {
            id: 'rm1',
            type: 'single_choice',
            question: 'Do you train during Ramadan?',
            questionAr: 'هل تتمرن في رمضان؟',
            options: [
              { value: 'yes_same', label: 'Yes, same as usual', labelAr: 'أيوه، زي العادي' },
              { value: 'yes_modified', label: 'Yes, but modified', labelAr: 'أيوه، بس معدل' },
              { value: 'less', label: 'Yes, but less frequently', labelAr: 'أيوه، بس أقل' },
              { value: 'no', label: 'No, I take the month off', labelAr: 'لا، بوقف الشهر' },
            ],
            required: true,
          },
          {
            id: 'rm2',
            type: 'single_choice',
            question: 'When do you prefer to train during Ramadan?',
            questionAr: 'متى تفضل تتمرن في رمضان؟',
            options: [
              { value: 'before_iftar', label: 'Before Iftar', labelAr: 'قبل الإفطار' },
              { value: 'after_iftar', label: 'After Iftar', labelAr: 'بعد الإفطار' },
              { value: 'after_taraweeh', label: 'After Taraweeh', labelAr: 'بعد التراويح' },
              { value: 'before_suhoor', label: 'Before Suhoor', labelAr: 'قبل السحور' },
              { value: 'varies', label: 'It varies', labelAr: 'بيتغير' },
            ],
            required: true,
          },
          {
            id: 'rm3',
            type: 'single_choice',
            question: 'Would you use a Ramadan mode in the app?',
            questionAr: 'هتستخدم وضع رمضان في التطبيق؟',
            options: [
              { value: 'yes_definitely', label: 'Yes, definitely useful', labelAr: 'أيوه، مفيد بالتأكيد' },
              { value: 'yes_try', label: 'Would try it', labelAr: 'هجربه' },
              { value: 'maybe', label: 'Maybe', labelAr: 'ممكن' },
              { value: 'no', label: 'No need', labelAr: 'مش محتاج' },
            ],
            required: true,
          },
        ],
      },
    ];
  }

  private getMonthEnd(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
}
