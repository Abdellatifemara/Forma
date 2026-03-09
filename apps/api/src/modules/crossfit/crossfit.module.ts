import { Module } from '@nestjs/common';
import { CrossfitService } from './crossfit.service';
import { CrossfitController } from './crossfit.controller';

@Module({
  controllers: [CrossfitController],
  providers: [CrossfitService],
  exports: [CrossfitService],
})
export class CrossfitModule {}
