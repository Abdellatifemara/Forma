import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommissionsService, PayoutRequest } from './commissions.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Controller('commissions')
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  /**
   * Get trainer's balance and commission info
   */
  @Get('balance')
  async getBalance(@Request() req) {
    // Get trainer ID from user
    const trainer = await this.getTrainerFromUser(req.user.id);
    return this.commissionsService.getTrainerBalance(trainer.id);
  }

  /**
   * Get transaction history
   */
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const trainer = await this.getTrainerFromUser(req.user.id);
    return this.commissionsService.getTransactionHistory(trainer.id, {
      type,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * Get earnings summary
   */
  @Get('earnings')
  async getEarnings(
    @Request() req,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    const trainer = await this.getTrainerFromUser(req.user.id);
    return this.commissionsService.getEarningsSummary(trainer.id, period);
  }

  /**
   * Request payout
   */
  @Post('payouts')
  async requestPayout(
    @Request() req,
    @Body() body: Omit<PayoutRequest, 'trainerId'>,
  ) {
    const trainer = await this.getTrainerFromUser(req.user.id);
    return this.commissionsService.requestPayout({
      ...body,
      trainerId: trainer.id,
    });
  }

  /**
   * Get commission rates
   */
  @Get('rates')
  async getCommissionRates() {
    return {
      REGULAR: {
        trainerPercentage: 80,
        platformPercentage: 20,
        description: 'Standard commission rate for regular trainers',
      },
      TRUSTED_PARTNER: {
        trainerPercentage: 95,
        platformPercentage: 5,
        description: 'Premium rate for trusted partner trainers',
      },
      minimumPayout: 100,
      payoutFee: 10,
      payoutMethods: [
        { id: 'bank_transfer', name: 'Bank Transfer', nameAr: 'تحويل بنكي', processingDays: 3 },
        { id: 'vodafone_cash', name: 'Vodafone Cash', nameAr: 'فودافون كاش', processingDays: 1 },
        { id: 'instapay', name: 'InstaPay', nameAr: 'إنستاباي', processingDays: 1 },
      ],
    };
  }

  // Helper to get trainer profile from user ID
  private async getTrainerFromUser(userId: string) {
    // This would be injected PrismaService in real implementation
    // For now, assume we have access
    return { id: userId }; // Simplified - would query trainer profile
  }
}

/**
 * Admin commission management
 */
@Controller('admin/commissions')
@UseGuards(JwtAuthGuard)
export class AdminCommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  /**
   * Get platform-wide commission stats
   */
  @Get('stats')
  async getPlatformStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.commissionsService.getPlatformCommissionStats(period);
  }

  /**
   * Process a payout (mark as completed or failed)
   */
  @Post('payouts/:transactionId/process')
  async processPayout(
    @Param('transactionId') transactionId: string,
    @Body() body: { success: boolean; reference?: string },
  ) {
    return this.commissionsService.processPayout(
      transactionId,
      body.success,
      body.reference,
    );
  }

  /**
   * Get pending payouts
   */
  @Get('payouts/pending')
  async getPendingPayouts() {
    // Would query pending payouts from DB
    return { payouts: [] };
  }
}
