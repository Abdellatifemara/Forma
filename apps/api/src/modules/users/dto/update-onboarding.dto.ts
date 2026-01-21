import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FitnessGoal, ActivityLevel, DifficultyLevel, Gender, EquipmentType } from '@prisma/client';

export class AIPreferencesDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isKeto?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPescatarian?: boolean;

  @ApiPropertyOptional({ example: ['nuts', 'shellfish'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: ['liver', 'okra'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dislikes?: string[];

  @ApiPropertyOptional({ example: ['diabetes', 'hypertension'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConditions?: string[];

  @ApiPropertyOptional({ example: ['metformin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  preferLocalFoods?: boolean;

  @ApiPropertyOptional({ example: 'moderate', enum: ['budget', 'moderate', 'premium'] })
  @IsOptional()
  @IsString()
  budgetLevel?: string;

  @ApiPropertyOptional({ example: 'intermediate' })
  @IsOptional()
  @IsString()
  cookingSkillLevel?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  maxCookingTime?: number;
}

export class UpdateOnboardingDto {
  @ApiProperty({ enum: FitnessGoal, example: 'BUILD_MUSCLE' })
  @IsEnum(FitnessGoal)
  fitnessGoal: FitnessGoal;

  @ApiProperty({ enum: ActivityLevel, example: 'MODERATELY_ACTIVE' })
  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @ApiProperty({ example: 175 })
  @IsNumber()
  @Min(100)
  @Max(250)
  heightCm: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(30)
  @Max(300)
  currentWeightKg: number;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  targetWeightKg?: number;

  @ApiProperty({ enum: DifficultyLevel, example: 'INTERMEDIATE' })
  @IsEnum(DifficultyLevel)
  fitnessLevel: DifficultyLevel;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender, example: 'MALE' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    enum: EquipmentType,
    isArray: true,
    example: ['DUMBBELLS', 'PULL_UP_BAR', 'RESISTANCE_BANDS'],
  })
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipment: EquipmentType[];

  @ApiPropertyOptional({ type: AIPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIPreferencesDto)
  aiPreferences?: AIPreferencesDto;
}
