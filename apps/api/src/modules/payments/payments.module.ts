import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController, PaymobWebhookController } from './payments.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [PaymentsController, PaymobWebhookController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
