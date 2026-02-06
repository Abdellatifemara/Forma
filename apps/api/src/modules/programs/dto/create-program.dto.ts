import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProgramSourceType {
  MANUAL = 'manual',
  PDF = 'pdf',
  AI_GENERATED = 'ai_generated',
}

export class CreateExerciseDto {
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsOptional()
  @IsString()
  customNameEn?: string;

  @IsOptional()
  @IsString()
  customNameAr?: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  order: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  sets: number;

  @IsOptional()
  @IsString()
  reps?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesAr?: string;
}

export class CreateWorkoutDayDto {
  @IsNumber()
  @Min(1)
  dayNumber: number;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesAr?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];
}

export class CreateProgramDto {
  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsNumber()
  @Min(1)
  @Max(52)
  durationWeeks: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEGP?: number;

  @IsOptional()
  @IsEnum(ProgramSourceType)
  sourceType?: ProgramSourceType;

  @IsOptional()
  @IsString()
  sourcePdfUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  workoutDays?: CreateWorkoutDayDto[];
}
