import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [PrismaModule, AchievementsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
