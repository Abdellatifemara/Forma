import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutGeneratorService } from './workout-generator.service';
import { WorkoutsController } from './workouts.controller';
import { ExercisesModule } from '../exercises/exercises.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [ExercisesModule, AchievementsModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutGeneratorService],
  exports: [WorkoutsService, WorkoutGeneratorService],
})
export class WorkoutsModule {}
