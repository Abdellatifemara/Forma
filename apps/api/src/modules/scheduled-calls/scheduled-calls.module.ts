import { Module } from '@nestjs/common';
import { ScheduledCallsController } from './scheduled-calls.controller';
import { ScheduledCallsService } from './scheduled-calls.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduledCallsController],
  providers: [ScheduledCallsService],
  exports: [ScheduledCallsService],
})
export class ScheduledCallsModule {}
