import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentRequest, PaymobTransactionCallback } from './paymob.types';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Get available payment methods
   */
  @Get('methods')
  getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }

  /**
   * Create a payment intent
   */
  @Post('create-intent')
  async createPaymentIntent(
    @Request() req: { user: { id: string } },
    @Body() body: Omit<CreatePaymentRequest, 'userId'>,
  ) {
    return this.paymentsService.createPaymentIntent(req.user.id, {
      ...body,
      userId: req.user.id,
    });
  }

  /**
   * Get payment status
   */
  @Get(':paymentId/status')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPaymentStatus(paymentId);
  }
}

/**
 * Webhook controller for Paymob callbacks
 * No authentication - Paymob sends callbacks directly
 */
@Controller('webhooks/paymob')
export class PaymobWebhookController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Transaction processed callback
   * Paymob calls this after a payment attempt
   */
  @Post('transaction')
  async handleTransactionCallback(
    @Body() callback: PaymobTransactionCallback,
    @Headers('hmac') hmac: string,
  ) {
    await this.paymentsService.handleWebhook(callback, hmac);
    return { received: true };
  }

  /**
   * Transaction response callback (redirect endpoint)
   * User is redirected here after payment
   */
  @Post('response')
  async handleResponseCallback(@Body() body: any) {
    // This is the redirect endpoint - just acknowledge
    // The actual processing happens in the transaction callback
    return { received: true };
  }
}
