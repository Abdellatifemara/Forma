import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchController, AdminResearchController } from './research.controller';

@Module({
  controllers: [ResearchController, AdminResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
