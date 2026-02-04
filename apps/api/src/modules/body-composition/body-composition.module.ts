import { Module } from '@nestjs/common';
import { BodyCompositionController } from './body-composition.controller';
import { BodyCompositionService } from './body-composition.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BodyCompositionController],
  providers: [BodyCompositionService],
  exports: [BodyCompositionService],
})
export class BodyCompositionModule {}
