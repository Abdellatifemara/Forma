import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SetLogDto {
  @ApiProperty({ example: 10, description: 'Number of reps' })
  @IsNumber()
  @Min(0)
  reps: number;

  @ApiPropertyOptional({ example: 50, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;
}

class ExerciseLogDto {
  @ApiProperty({ example: 'Bench Press', description: 'Exercise name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Exercise ID if known' })
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @ApiProperty({ type: [SetLogDto], description: 'Sets performed' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetLogDto)
  sets: SetLogDto[];
}

export class LogWorkoutDto {
  @ApiProperty({ example: 'Morning Push Day', description: 'Name of the workout' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ type: [ExerciseLogDto], description: 'Exercises performed' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseLogDto)
  exercises: ExerciseLogDto[];

  @ApiPropertyOptional({ description: 'Notes about the workout' })
  @IsOptional()
  @IsString()
  notes?: string;
}
