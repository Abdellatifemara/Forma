import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController, AdminCommissionsController } from './commissions.controller';

@Module({
  controllers: [CommissionsController, AdminCommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
