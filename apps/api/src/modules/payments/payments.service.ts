import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import {
  PaymobAuthResponse,
  PaymobOrderResponse,
  PaymobPaymentKeyResponse,
  PaymobTransactionCallback,
  CreatePaymentRequest,
  PaymentIntent,
  PaymentMethod,
} from './paymob.types';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymobApiUrl = 'https://accept.paymob.com/api';

  // Paymob integration IDs for different payment methods
  private readonly integrationIds: Record<PaymentMethod, number>;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
  ) {
    // Load integration IDs from environment
    this.integrationIds = {
      card: parseInt(this.configService.get('PAYMOB_CARD_INTEGRATION_ID') || '0'),
      wallet: parseInt(this.configService.get('PAYMOB_WALLET_INTEGRATION_ID') || '0'),
      fawry: parseInt(this.configService.get('PAYMOB_FAWRY_INTEGRATION_ID') || '0'),
      kiosk: parseInt(this.configService.get('PAYMOB_KIOSK_INTEGRATION_ID') || '0'),
    };
  }

  /**
   * Create a payment intent for subscription or program purchase
   */
  async createPaymentIntent(
    userId: string,
    request: CreatePaymentRequest,
  ): Promise<PaymentIntent> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Step 1: Authenticate with Paymob
    const authToken = await this.authenticate();

    // Step 2: Create order
    const order = await this.createOrder(authToken, request);

    // Step 3: Get payment key
    const paymentKey = await this.getPaymentKey(
      authToken,
      order.id,
      request.amountEGP,
      user,
      request.paymentMethod,
    );

    // Step 4: Store payment intent in database
    const paymentRecord = await this.prisma.payment.create({
      data: {
        subscriptionId: request.metadata?.subscriptionId || '',
        amountEGP: request.amountEGP,
        status: 'pending',
        stripePaymentId: order.id.toString(), // Using this field for Paymob order ID
      },
    });

    // Build iframe URL based on payment method
    const iframeId = this.configService.get('PAYMOB_IFRAME_ID');
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return {
      id: paymentRecord.id,
      orderId: order.id,
      paymentKey,
      iframeUrl,
      amountEGP: request.amountEGP,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }

  /**
   * Handle Paymob webhook callback
   */
  async handleWebhook(callback: PaymobTransactionCallback): Promise<void> {
    this.logger.log(`Received Paymob webhook: ${JSON.stringify(callback.obj.id)}`);

    // Verify HMAC
    const isValid = this.verifyHmac(callback);
    if (!isValid) {
      this.logger.error('Invalid HMAC signature');
      throw new BadRequestException('Invalid signature');
    }

    const { obj } = callback;
    const orderId = obj.order.id.toString();

    // Find the payment record
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: orderId },
      include: { subscription: true },
    });

    if (!payment) {
      this.logger.error(`Payment not found for order ${orderId}`);
      return;
    }

    if (obj.success && !obj.is_voided && !obj.is_refunded) {
      // Payment successful
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      // Activate subscription
      if (payment.subscription) {
        await this.subscriptionsService.processPaymentSuccess(
          payment.id,
          obj.id.toString(),
        );
      }

      this.logger.log(`Payment ${payment.id} completed successfully`);
    } else if (obj.is_voided || obj.is_refunded) {
      // Payment voided or refunded
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'refunded' },
      });

      this.logger.log(`Payment ${payment.id} was refunded/voided`);
    } else {
      // Payment failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      await this.subscriptionsService.processPaymentFailure(
        payment.id,
        obj.data?.message || 'Payment failed',
      );

      this.logger.log(`Payment ${payment.id} failed`);
    }
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): { id: PaymentMethod; name: string; nameAr: string; enabled: boolean }[] {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        nameAr: 'بطاقة ائتمان/خصم',
        enabled: this.integrationIds.card > 0,
      },
      {
        id: 'wallet',
        name: 'Mobile Wallet',
        nameAr: 'محفظة إلكترونية',
        enabled: this.integrationIds.wallet > 0,
      },
      {
        id: 'fawry',
        name: 'Fawry',
        nameAr: 'فوري',
        enabled: this.integrationIds.fawry > 0,
      },
      {
        id: 'kiosk',
        name: 'Aman/Masary Kiosk',
        nameAr: 'كشك أمان/مصاري',
        enabled: this.integrationIds.kiosk > 0,
      },
    ].filter(m => m.enabled);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      id: payment.id,
      status: payment.status,
      amountEGP: payment.amountEGP,
      paidAt: payment.paidAt,
    };
  }

  // ==========================================
  // Private Paymob API Methods
  // ==========================================

  private async authenticate(): Promise<string> {
    const apiKey = this.configService.get('PAYMOB_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('Paymob API key not configured');
    }

    try {
      const response = await fetch(`${this.paymobApiUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data: PaymobAuthResponse = await response.json();
      return data.token;
    } catch (error) {
      this.logger.error('Paymob authentication failed', error);
      throw new InternalServerErrorException('Payment service unavailable');
    }
  }

  private async createOrder(
    authToken: string,
    request: CreatePaymentRequest,
  ): Promise<PaymobOrderResponse> {
    try {
      const response = await fetch(`${this.paymobApiUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: request.amountEGP * 100, // Convert to piasters
          currency: 'EGP',
          items: [
            {
              name: request.description,
              amount_cents: request.amountEGP * 100,
              description: request.description,
              quantity: 1,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Order creation failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Failed to create Paymob order', error);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  private async getPaymentKey(
    authToken: string,
    orderId: number,
    amountEGP: number,
    user: { email: string; displayName?: string | null },
    paymentMethod: PaymentMethod,
  ): Promise<string> {
    const integrationId = this.integrationIds[paymentMethod];

    if (!integrationId) {
      throw new BadRequestException(`Payment method ${paymentMethod} not available`);
    }

    const nameParts = (user.displayName || 'Forma User').split(' ');

    try {
      const response = await fetch(`${this.paymobApiUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountEGP * 100,
          expiration: 3600, // 1 hour
          order_id: orderId,
          billing_data: {
            apartment: 'NA',
            email: user.email,
            floor: 'NA',
            first_name: nameParts[0] || 'Forma',
            street: 'NA',
            building: 'NA',
            phone_number: 'NA',
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'Cairo',
            country: 'EG',
            last_name: nameParts.slice(1).join(' ') || 'User',
            state: 'NA',
          },
          currency: 'EGP',
          integration_id: integrationId,
          lock_order_when_paid: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment key failed: ${response.status}`);
      }

      const data: PaymobPaymentKeyResponse = await response.json();
      return data.token;
    } catch (error) {
      this.logger.error('Failed to get payment key', error);
      throw new InternalServerErrorException('Failed to initialize payment');
    }
  }

  private verifyHmac(callback: PaymobTransactionCallback): boolean {
    const hmacSecret = this.configService.get('PAYMOB_HMAC_SECRET');

    if (!hmacSecret) {
      this.logger.warn('HMAC secret not configured, skipping verification');
      return true; // Skip verification in development
    }

    const { obj } = callback;

    // Build HMAC string in Paymob's required order
    const hmacString = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order.id,
      obj.owner,
      obj.pending,
      obj.source_data.pan,
      obj.source_data.sub_type,
      obj.source_data.type,
      obj.success,
    ].join('');

    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(hmacString)
      .digest('hex');

    // The callback should include the HMAC from Paymob for comparison
    // In production, compare with the received HMAC header
    return true; // Placeholder - implement full verification in production
  }
}
