import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { ExercisesModule } from '../exercises/exercises.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [ExercisesModule, AchievementsModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
