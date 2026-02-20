import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainerTier, TransactionStatus, TransactionType } from '@prisma/client';

/**
 * Commission rates by trainer tier
 * REGULAR: Platform keeps 20%, trainer gets 80%
 * TRUSTED_PARTNER: Platform keeps 5%, trainer gets 95%
 */
const COMMISSION_RATES: Record<TrainerTier, { platform: number; trainer: number }> = {
  REGULAR: { platform: 0.20, trainer: 0.80 },
  TRUSTED_PARTNER: { platform: 0.05, trainer: 0.95 },
};

/**
 * Minimum payout threshold in EGP
 */
const MINIMUM_PAYOUT_AMOUNT = 100;

/**
 * Payout processing fee (fixed)
 */
const PAYOUT_PROCESSING_FEE = 10; // EGP

export interface CommissionSplit {
  totalAmount: number;
  platformFee: number;
  trainerEarnings: number;
  trainerTier: TrainerTier;
  commissionRate: number;
}

export interface CreateTransactionData {
  trainerId: string;
  clientId?: string;
  amountEGP: number;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PayoutRequest {
  trainerId: string;
  amountEGP: number;
  payoutMethod: 'bank_transfer' | 'vodafone_cash' | 'instapay';
  accountDetails: {
    accountNumber?: string;
    bankName?: string;
    phoneNumber?: string;
    accountHolderName: string;
  };
}

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate commission split for a transaction
   */
  calculateCommission(amount: number, tier: TrainerTier): CommissionSplit {
    const rates = COMMISSION_RATES[tier];

    const platformFee = Math.round(amount * rates.platform);
    const trainerEarnings = amount - platformFee;

    return {
      totalAmount: amount,
      platformFee,
      trainerEarnings,
      trainerTier: tier,
      commissionRate: rates.trainer,
    };
  }

  /**
   * Process a new earning transaction (subscription, program purchase, etc.)
   */
  async processEarning(data: CreateTransactionData) {
    // Get trainer profile
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { id: data.trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Calculate commission split
    const split = this.calculateCommission(data.amountEGP, trainer.tier);

    // Create transaction record
    const transaction = await this.prisma.trainerTransaction.create({
      data: {
        trainerId: data.trainerId,
        clientId: data.clientId,
        type: data.type,
        amountEGP: data.amountEGP,
        platformFeeEGP: split.platformFee,
        trainerEarningEGP: split.trainerEarnings,
        status: 'COMPLETED',
        description: data.description || `${data.type} earning`,
        metadata: {
          ...data.metadata,
          originalAmount: data.amountEGP,
          commissionRate: split.commissionRate,
        },
      },
    });

    // Update trainer's available balance
    await this.prisma.trainerProfile.update({
      where: { id: data.trainerId },
      data: {
        availableBalanceEGP: {
          increment: split.trainerEarnings,
        },
        totalEarnings: {
          increment: split.trainerEarnings,
        },
      },
    });

    this.logger.log(
      `Processed earning for trainer ${data.trainerId}: ${split.trainerEarnings} EGP (${split.commissionRate * 100}%)`,
    );

    return {
      transaction,
      split,
    };
  }

  /**
   * Get trainer's current balance and earnings
   */
  async getTrainerBalance(trainerId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { id: trainerId },
      select: {
        tier: true,
        availableBalanceEGP: true,
        totalEarnings: true,
        pendingPayoutEGP: true,
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const commissionRate = COMMISSION_RATES[trainer.tier].trainer;

    return {
      availableBalanceEGP: trainer.availableBalanceEGP,
      totalEarningsEGP: trainer.totalEarnings,
      pendingPayoutEGP: trainer.pendingPayoutEGP,
      tier: trainer.tier,
      commissionRate,
      commissionPercentage: commissionRate * 100,
      minimumPayout: MINIMUM_PAYOUT_AMOUNT,
      canRequestPayout: trainer.availableBalanceEGP >= MINIMUM_PAYOUT_AMOUNT,
    };
  }

  /**
   * Get trainer's transaction history
   */
  async getTransactionHistory(
    trainerId: string,
    options?: {
      type?: TransactionType;
      status?: TransactionStatus;
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const {
      type,
      status,
      page = 1,
      limit: rawLimit = 20,
      startDate,
      endDate,
    } = options || {};
    const limit = Math.min(rawLimit, 100);

    const where = {
      trainerId,
      ...(type && { type }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.trainerTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trainerTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Request a payout
   */
  async requestPayout(request: PayoutRequest) {
    const { trainerId, amountEGP, payoutMethod, accountDetails } = request;

    // Get trainer
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Validate amount
    if (amountEGP < MINIMUM_PAYOUT_AMOUNT) {
      throw new BadRequestException(
        `Minimum payout amount is ${MINIMUM_PAYOUT_AMOUNT} EGP`,
      );
    }

    if (amountEGP > trainer.availableBalanceEGP) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate net payout (minus processing fee)
    const netPayout = amountEGP - PAYOUT_PROCESSING_FEE;

    // Create payout transaction
    const transaction = await this.prisma.trainerTransaction.create({
      data: {
        trainerId,
        type: 'PAYOUT',
        amountEGP: amountEGP,
        platformFeeEGP: PAYOUT_PROCESSING_FEE,
        trainerEarningEGP: netPayout,
        status: 'PENDING',
        description: `Payout request via ${payoutMethod}`,
        metadata: {
          payoutMethod,
          accountDetails,
          netPayout,
          processingFee: PAYOUT_PROCESSING_FEE,
        },
      },
    });

    // Update trainer balance
    await this.prisma.trainerProfile.update({
      where: { id: trainerId },
      data: {
        availableBalanceEGP: {
          decrement: amountEGP,
        },
        pendingPayoutEGP: {
          increment: amountEGP,
        },
      },
    });

    this.logger.log(`Payout requested by trainer ${trainerId}: ${amountEGP} EGP`);

    return {
      transaction,
      amountRequested: amountEGP,
      processingFee: PAYOUT_PROCESSING_FEE,
      netPayout,
      estimatedProcessingDays: this.getEstimatedProcessingDays(payoutMethod),
    };
  }

  /**
   * Process payout (admin/automated)
   */
  async processPayout(transactionId: string, success: boolean, reference?: string) {
    const transaction = await this.prisma.trainerTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== 'PAYOUT' || transaction.status !== 'PENDING') {
      throw new BadRequestException('Invalid transaction for payout processing');
    }

    const payoutAmount = Math.abs(transaction.amountEGP);

    const existingMetadata = (transaction.metadata || {}) as Record<string, unknown>;

    if (success) {
      // Mark as completed
      await this.prisma.trainerTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          paidOutAt: new Date(),
          paymentRef: reference,
          metadata: {
            ...existingMetadata,
            payoutReference: reference,
          },
        },
      });

      // Update trainer's pending payout
      await this.prisma.trainerProfile.update({
        where: { id: transaction.trainerId },
        data: {
          pendingPayoutEGP: {
            decrement: payoutAmount,
          },
        },
      });

      this.logger.log(`Payout completed: ${transactionId}`);
    } else {
      // Mark as failed, refund to balance
      await this.prisma.trainerTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'FAILED',
          metadata: {
            ...existingMetadata,
            failureReason: reference,
          },
        },
      });

      // Refund to available balance
      await this.prisma.trainerProfile.update({
        where: { id: transaction.trainerId },
        data: {
          availableBalanceEGP: {
            increment: payoutAmount,
          },
          pendingPayoutEGP: {
            decrement: payoutAmount,
          },
        },
      });

      this.logger.log(`Payout failed: ${transactionId}`);
    }

    return { success };
  }

  /**
   * Get earnings summary for a period
   */
  async getEarningsSummary(trainerId: string, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await this.prisma.trainerTransaction.findMany({
      where: {
        trainerId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        amountEGP: { gt: 0 }, // Only earnings, not payouts
      },
    });

    const byType: Record<string, number> = {};
    let totalEarnings = 0;
    let totalPlatformFees = 0;

    for (const tx of transactions) {
      byType[tx.type] = (byType[tx.type] || 0) + tx.amountEGP;
      totalEarnings += tx.amountEGP;
      totalPlatformFees += tx.platformFeeEGP || 0;
    }

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalEarnings,
      totalPlatformFees,
      transactionCount: transactions.length,
      byType,
    };
  }

  /**
   * Get platform-wide commission statistics (admin)
   */
  async getPlatformCommissionStats(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await this.prisma.trainerTransaction.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        amountEGP: { gt: 0 },
      },
      include: {
        trainer: {
          select: { tier: true },
        },
      },
    });

    let totalRevenue = 0;
    let platformRevenue = 0;
    let trainerPayouts = 0;
    const byTier: Record<string, { count: number; volume: number; platformFees: number }> = {
      REGULAR: { count: 0, volume: 0, platformFees: 0 },
      TRUSTED_PARTNER: { count: 0, volume: 0, platformFees: 0 },
    };

    for (const tx of transactions) {
      const originalAmount = tx.amountEGP + (tx.platformFeeEGP || 0);
      totalRevenue += originalAmount;
      platformRevenue += tx.platformFeeEGP || 0;
      trainerPayouts += tx.amountEGP;

      const tier = tx.trainer.tier;
      byTier[tier].count++;
      byTier[tier].volume += originalAmount;
      byTier[tier].platformFees += tx.platformFeeEGP || 0;
    }

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalRevenue,
      platformRevenue,
      trainerPayouts,
      transactionCount: transactions.length,
      byTier,
    };
  }

  private getEstimatedProcessingDays(method: string): number {
    switch (method) {
      case 'vodafone_cash':
      case 'instapay':
        return 1;
      case 'bank_transfer':
      default:
        return 3;
    }
  }
}
