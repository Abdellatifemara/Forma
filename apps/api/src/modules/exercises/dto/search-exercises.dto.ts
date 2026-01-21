import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory } from '@prisma/client';

export class SearchExercisesDto {
  @ApiPropertyOptional({ description: 'Search query for exercise name or tags' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: MuscleGroup, description: 'Primary muscle group' })
  @IsOptional()
  @IsEnum(MuscleGroup)
  primaryMuscle?: MuscleGroup;

  @ApiPropertyOptional({
    enum: MuscleGroup,
    isArray: true,
    description: 'Filter by any of these muscle groups (primary or secondary)',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MuscleGroup, { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  muscleGroups?: MuscleGroup[];

  @ApiPropertyOptional({
    enum: EquipmentType,
    isArray: true,
    description: 'Filter by equipment available',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  equipment?: EquipmentType[];

  @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Exact difficulty level' })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Maximum difficulty level' })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  maxDifficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: ExerciseCategory, description: 'Exercise category' })
  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @ApiPropertyOptional({ enum: ['name', 'difficulty', 'created'], default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'difficulty' | 'created';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
