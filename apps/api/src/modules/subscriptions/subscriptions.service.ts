import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  CancelSubscriptionDto,
  GiftSubscriptionDto,
  SUBSCRIPTION_PRICING,
  FEATURE_LIMITS,
} from './dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get subscription for a user
   */
  async getSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Create a free subscription if none exists
    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          tier: 'FREE',
          status: 'ACTIVE',
          priceEGP: 0,
        },
        include: {
          payments: true,
        },
      });
    }

    return {
      ...subscription,
      pricing: SUBSCRIPTION_PRICING[subscription.tier],
      limits: FEATURE_LIMITS[subscription.tier],
    };
  }

  /**
   * Create or upgrade subscription
   */
  async createOrUpgradeSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ) {
    const { tier, billingCycle = 'monthly', paymentMethodId, promoCode } = dto;

    if (tier === 'FREE') {
      throw new BadRequestException('Cannot subscribe to free tier');
    }

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    // Get pricing
    const pricing = SUBSCRIPTION_PRICING[tier];
    let priceEGP: number = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;

    // Apply promo code discount (simplified - would need promo code table)
    if (promoCode) {
      // TODO: Validate promo code from database
      // For now, hardcode some test codes
      if (promoCode === 'FORMA50') {
        priceEGP = Math.round(priceEGP * 0.5);
      } else if (promoCode === 'FORMA20') {
        priceEGP = Math.round(priceEGP * 0.8);
      }
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update or create subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        status: 'ACTIVE',
        priceEGP,
        billingCycle,
        startDate,
        endDate,
        cancelledAt: null,
      },
      create: {
        userId,
        tier,
        status: 'ACTIVE',
        priceEGP,
        billingCycle,
        startDate,
        endDate,
      },
    });

    // Create payment record (pending - will be completed by payment webhook)
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amountEGP: priceEGP,
        status: 'pending',
      },
    });

    return {
      subscription,
      payment,
      paymentRequired: priceEGP > 0,
      amountDue: priceEGP,
      // In production, return payment gateway URL
      // paymentUrl: await this.createPaymobPayment(payment.id, priceEGP),
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, dto: CancelSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (subscription.tier === 'FREE') {
      throw new BadRequestException('Cannot cancel free tier');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription already cancelled');
    }

    // If immediate cancellation, downgrade to free immediately
    if (dto.immediate) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          tier: 'FREE',
          status: 'CANCELLED',
          priceEGP: 0,
          cancelledAt: new Date(),
        },
      });
    }

    // Otherwise, mark as cancelled but keep active until end date
    return this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (subscription.status !== 'CANCELLED') {
      throw new BadRequestException('Subscription is not cancelled');
    }

    // Check if still within billing period
    if (subscription.endDate && new Date() > subscription.endDate) {
      throw new BadRequestException(
        'Subscription period has ended. Please create a new subscription.',
      );
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        cancelledAt: null,
      },
    });
  }

  /**
   * Gift a subscription to another user
   */
  async giftSubscription(gifterId: string, dto: GiftSubscriptionDto) {
    const { recipientEmail, tier, billingCycle = 'monthly', message } = dto;

    // Find recipient
    const recipient = await this.prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase() },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipient.id === gifterId) {
      throw new BadRequestException('Cannot gift subscription to yourself');
    }

    // Get pricing
    const pricing = SUBSCRIPTION_PRICING[tier];
    const priceEGP = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create or upgrade recipient's subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { userId: recipient.id },
      update: {
        tier,
        status: 'ACTIVE',
        priceEGP: 0, // Gift is free for recipient
        billingCycle,
        startDate,
        endDate,
        cancelledAt: null,
      },
      create: {
        userId: recipient.id,
        tier,
        status: 'ACTIVE',
        priceEGP: 0,
        billingCycle,
        startDate,
        endDate,
      },
    });

    // Create payment record for gifter
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amountEGP: priceEGP,
        status: 'pending',
      },
    });

    // TODO: Send notification to recipient

    return {
      subscription,
      payment,
      recipientId: recipient.id,
      amountDue: priceEGP,
    };
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    const limits = FEATURE_LIMITS[subscription.tier];

    if (!(featureId in limits)) {
      // Feature not limited, available to all
      return true;
    }

    const limit = limits[featureId as keyof typeof limits];
    return limit > 0;
  }

  /**
   * Get feature usage for a user
   */
  async getFeatureUsage(userId: string, featureId: string) {
    const subscription = await this.getSubscription(userId);
    const limits = FEATURE_LIMITS[subscription.tier];

    const limit = limits[featureId as keyof typeof limits] ?? Infinity;

    // TODO: Track actual usage in database
    // For now, return mock data
    return {
      featureId,
      limit,
      used: 0,
      remaining: limit === Infinity ? Infinity : limit,
      resetDate: this.getNextResetDate(),
    };
  }

  /**
   * Process expired subscriptions (called by cron job)
   */
  async processExpiredSubscriptions() {
    const now = new Date();

    // Find subscriptions that have expired
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        endDate: { lt: now },
        status: { not: 'EXPIRED' },
        tier: { not: 'FREE' },
      },
    });

    // Downgrade to free
    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: 'FREE',
          status: 'EXPIRED',
          priceEGP: 0,
        },
      });
    }

    return {
      processed: expiredSubscriptions.length,
    };
  }

  /**
   * Process payment completion (called by payment webhook)
   */
  async processPaymentSuccess(paymentId: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        stripePaymentId: transactionId,
        paidAt: new Date(),
      },
    });

    // Ensure subscription is active
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
      },
    });

    return { success: true };
  }

  /**
   * Process payment failure (called by payment webhook)
   */
  async processPaymentFailure(paymentId: string, reason: string) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'failed',
      },
    });

    return { success: true, reason };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { payments: [], total: 0, page, limit };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({
        where: { subscriptionId: subscription.id },
      }),
    ]);

    return { payments, total, page, limit };
  }

  /**
   * Get all available plans with pricing
   */
  getAvailablePlans() {
    return Object.entries(SUBSCRIPTION_PRICING).map(([tier, pricing]) => ({
      tier,
      name: tier === 'FREE' ? 'Free' : tier === 'PREMIUM' ? 'Premium' : 'Premium+',
      pricing,
      limits: FEATURE_LIMITS[tier as SubscriptionTier],
    }));
  }

  private getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}
