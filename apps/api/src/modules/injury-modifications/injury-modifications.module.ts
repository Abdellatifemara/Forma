import { Module } from '@nestjs/common';
import { InjuryModificationsController } from './injury-modifications.controller';
import { InjuryModificationsService } from './injury-modifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InjuryModificationsController],
  providers: [InjuryModificationsService],
  exports: [InjuryModificationsService],
})
export class InjuryModificationsModule {}
