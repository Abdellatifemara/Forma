import { IsNumber, IsOptional, IsString, IsUrl, IsBoolean, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogWeightDto {
  @ApiProperty({ description: 'Weight in kg', example: 75.5 })
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;

  @ApiPropertyOptional({ description: 'Date of measurement (ISO string)', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class LogMeasurementsDto {
  @ApiPropertyOptional({ description: 'Weight in kg', example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({ description: 'Body fat percentage', example: 15.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  bodyFat?: number;

  @ApiPropertyOptional({ description: 'Chest measurement in cm', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  chest?: number;

  @ApiPropertyOptional({ description: 'Waist measurement in cm', example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  waist?: number;

  @ApiPropertyOptional({ description: 'Hips measurement in cm', example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  hips?: number;

  @ApiPropertyOptional({ description: 'Arms/bicep measurement in cm', example: 35 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(80)
  arms?: number;

  @ApiPropertyOptional({ description: 'Thighs measurement in cm', example: 55 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(100)
  thighs?: number;

  @ApiPropertyOptional({ description: 'Notes about the measurement' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Date of measurement (ISO string)', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreateProgressPhotoDto {
  @ApiProperty({ description: 'URL of the uploaded image (from /upload/image)', example: 'https://media.formaeg.com/images/abc/123.jpg' })
  @IsUrl({ require_tld: false, require_protocol: true })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Label/angle for the photo', example: 'front' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Notes about the photo' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether to share with trainer', default: false })
  @IsOptional()
  @IsBoolean()
  sharedWithTrainer?: boolean;
}
