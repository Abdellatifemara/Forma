import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean, IsArray, IsEnum, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Training History module
export class TrainingHistoryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalYearsTraining?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currentLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredTrainingStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredSplitType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredRepRange?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) sportsBackground?: string[];
}

// Fitness Tests module
export class FitnessTestsDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(200) pushUpMaxReps?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(600) plankHoldSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) pullUpMaxReps?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) benchPress1RM?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) squat1RM?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) deadlift1RM?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(200) bodyweightSquatMaxReps?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canTouchToes?: boolean;
}

// Health module
export class HealthProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasHeartCondition?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasHighBloodPressure?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasDiabetes?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() diabetesType?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasAsthma?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasArthritis?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasHerniaHistory?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hadRecentSurgery?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() surgeryDetails?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasDoctorClearance?: boolean;
}

// Injury
export class InjuryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() bodyPart?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() side?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() injuryType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() severity?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(10) painLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) painTriggers?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) avoidMovements?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inPhysicalTherapy?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// Supplements module
export class SupplementsDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() takesProteinPowder?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() proteinPowderType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() takesCreatine?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() takesPreWorkout?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) otherSupplements?: string[];
}

// Lifestyle module
export class LifestyleDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(24) averageSleepHours?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sleepQuality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currentStressLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(7) targetWorkoutsPerWeek?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(10) @Max(180) maxWorkoutMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredWorkoutTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workType?: string;
}

// Fasting module
export class FastingDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() doesIntermittentFasting?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() ifProtocol?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eatingWindowStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eatingWindowEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() observesRamadan?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ramadanActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() ramadanWorkoutTiming?: string;
}

// Body Composition module
export class BodyCompositionDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(30) @Max(300) currentWeightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(100) @Max(250) heightCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(3) @Max(70) bodyFatPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bodyType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() waistCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() hipsGlutesCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() chestCm?: number;
}

// Top-level assessment DTO
export class UpdateAssessmentDto {
  @ApiPropertyOptional({ type: TrainingHistoryDto })
  @IsOptional() @ValidateNested() @Type(() => TrainingHistoryDto)
  trainingHistory?: TrainingHistoryDto;

  @ApiPropertyOptional({ type: FitnessTestsDto })
  @IsOptional() @ValidateNested() @Type(() => FitnessTestsDto)
  fitnessTests?: FitnessTestsDto;

  @ApiPropertyOptional({ type: HealthProfileDto })
  @IsOptional() @ValidateNested() @Type(() => HealthProfileDto)
  healthProfile?: HealthProfileDto;

  @ApiPropertyOptional({ type: [InjuryDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => InjuryDto)
  injuries?: InjuryDto[];

  @ApiPropertyOptional({ type: SupplementsDto })
  @IsOptional() @ValidateNested() @Type(() => SupplementsDto)
  supplements?: SupplementsDto;

  @ApiPropertyOptional({ type: LifestyleDto })
  @IsOptional() @ValidateNested() @Type(() => LifestyleDto)
  lifestyle?: LifestyleDto;

  @ApiPropertyOptional({ type: FastingDto })
  @IsOptional() @ValidateNested() @Type(() => FastingDto)
  fasting?: FastingDto;

  @ApiPropertyOptional({ type: BodyCompositionDto })
  @IsOptional() @ValidateNested() @Type(() => BodyCompositionDto)
  bodyComposition?: BodyCompositionDto;
}
