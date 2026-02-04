import { Module } from '@nestjs/common';
import { HealthDataController } from './health-data.controller';
import { HealthDataService } from './health-data.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthDataController],
  providers: [HealthDataService],
  exports: [HealthDataService],
})
export class HealthDataModule {}
