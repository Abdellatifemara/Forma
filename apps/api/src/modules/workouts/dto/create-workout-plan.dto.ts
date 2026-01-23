import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, FitnessGoal } from '@prisma/client';

class SetDto {
  @ApiProperty({ example: '8-12', description: 'Reps (can be range or number)' })
  @IsString()
  reps: string;

  @ApiPropertyOptional({ example: '50', description: 'Weight in kg' })
  @IsOptional()
  @IsString()
  weight?: string;
}

class ExerciseInWorkoutDto {
  @ApiProperty({ description: 'Exercise ID from database' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({ type: [SetDto], description: 'Sets for this exercise' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}

class WorkoutDayDto {
  @ApiProperty({ example: 'Push Day', description: 'Name of the workout day' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [ExerciseInWorkoutDto], description: 'Exercises in this workout' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseInWorkoutDto)
  exercises: ExerciseInWorkoutDto[];
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'My Strength Plan', description: 'Name of the workout plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'A 4-week strength program', description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel, default: 'INTERMEDIATE' })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: FitnessGoal, default: 'BUILD_MUSCLE' })
  @IsOptional()
  @IsEnum(FitnessGoal)
  goal?: FitnessGoal;

  @ApiProperty({ type: [WorkoutDayDto], description: 'Workout days in the plan' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDayDto)
  workouts: WorkoutDayDto[];
}
