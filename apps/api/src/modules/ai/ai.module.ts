import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRateLimitService } from './ai-rate-limit.service';
import { ChatPipelineService } from './chat-pipeline.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiRateLimitService, ChatPipelineService],
  exports: [AiService, ChatPipelineService],
})
export class AiModule {}
