import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  CancelSubscriptionDto,
  GiftSubscriptionDto,
} from './dto';

interface AuthRequest {
  user: { id: string };
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * Get current user's subscription
   */
  @Get('me')
  async getMySubscription(@Request() req: AuthRequest) {
    return this.subscriptionsService.getSubscription(req.user.id);
  }

  /**
   * Get available plans
   */
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  /**
   * Create or upgrade subscription
   */
  @Post()
  async createSubscription(
    @Request() req: AuthRequest,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createOrUpgradeSubscription(
      req.user.id,
      dto,
    );
  }

  /**
   * Cancel subscription
   */
  @Delete('me')
  async cancelSubscription(
    @Request() req: AuthRequest,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(req.user.id, dto);
  }

  /**
   * Reactivate cancelled subscription
   */
  @Post('me/reactivate')
  async reactivateSubscription(@Request() req: AuthRequest) {
    return this.subscriptionsService.reactivateSubscription(req.user.id);
  }

  /**
   * Gift a subscription to another user
   */
  @Post('gift')
  async giftSubscription(
    @Request() req: AuthRequest,
    @Body() dto: GiftSubscriptionDto,
  ) {
    return this.subscriptionsService.giftSubscription(req.user.id, dto);
  }

  /**
   * Check feature access
   */
  @Get('features/:featureId/access')
  async checkFeatureAccess(
    @Request() req: AuthRequest,
    @Param('featureId') featureId: string,
  ) {
    const hasAccess = await this.subscriptionsService.hasFeatureAccess(
      req.user.id,
      featureId,
    );
    return { featureId, hasAccess };
  }

  /**
   * Get feature usage
   */
  @Get('features/:featureId/usage')
  async getFeatureUsage(
    @Request() req: AuthRequest,
    @Param('featureId') featureId: string,
  ) {
    return this.subscriptionsService.getFeatureUsage(req.user.id, featureId);
  }

  /**
   * Get payment history
   */
  @Get('payments')
  async getPaymentHistory(
    @Request() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subscriptionsService.getPaymentHistory(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}

/**
 * Webhook controller for payment provider callbacks
 * This should be a separate controller without JWT guard
 */
@Controller('webhooks/payments')
export class PaymentWebhooksController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('success')
  async handlePaymentSuccess(
    @Body() body: { paymentId: string; transactionId: string },
  ) {
    return this.subscriptionsService.processPaymentSuccess(
      body.paymentId,
      body.transactionId,
    );
  }

  @Post('failure')
  async handlePaymentFailure(
    @Body() body: { paymentId: string; reason: string },
  ) {
    return this.subscriptionsService.processPaymentFailure(
      body.paymentId,
      body.reason,
    );
  }
}
