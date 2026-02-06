import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionsController,
  PaymentWebhooksController,
} from './subscriptions.controller';

@Module({
  controllers: [SubscriptionsController, PaymentWebhooksController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
