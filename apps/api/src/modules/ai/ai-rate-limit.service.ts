import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier } from '@prisma/client';

const AI_DAILY_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 5,
  PREMIUM: 50,
  PREMIUM_PLUS: -1, // unlimited
};

const FEATURE_ID = 'ai_queries';

@Injectable()
export class AiRateLimitService {
  private readonly logger = new Logger(AiRateLimitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkAndIncrement(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    });

    const tier = subscription?.tier ?? SubscriptionTier.FREE;
    const dailyLimit = AI_DAILY_LIMITS[tier];

    // Unlimited for PREMIUM_PLUS
    if (dailyLimit === -1) {
      await this.recordUsage(userId);
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const usage = await this.prisma.featureUsageLimit.findFirst({
      where: {
        userId,
        featureId: FEATURE_ID,
        periodStart: { gte: todayStart },
      },
    });

    if (usage) {
      if (usage.usedCount >= dailyLimit) {
        this.logger.warn(`User ${userId} hit AI rate limit (${tier}: ${dailyLimit}/day)`);
        throw new ForbiddenException(
          `Daily AI limit reached (${dailyLimit} queries/day for ${tier} tier). Upgrade your plan for more.`,
        );
      }

      await this.prisma.featureUsageLimit.update({
        where: { id: usage.id },
        data: {
          usedCount: { increment: 1 },
          limitHitAt: usage.usedCount + 1 >= dailyLimit ? new Date() : undefined,
        },
      });
    } else {
      await this.prisma.featureUsageLimit.create({
        data: {
          userId,
          featureId: FEATURE_ID,
          usedCount: 1,
          periodStart: todayStart,
          periodEnd: todayEnd,
        },
      });
    }
  }

  private async recordUsage(userId: string): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    await this.prisma.featureUsageLimit.upsert({
      where: {
        userId_featureId_periodStart: {
          userId,
          featureId: FEATURE_ID,
          periodStart: todayStart,
        },
      },
      update: { usedCount: { increment: 1 } },
      create: {
        userId,
        featureId: FEATURE_ID,
        usedCount: 1,
        periodStart: todayStart,
        periodEnd: todayEnd,
      },
    });
  }
}
