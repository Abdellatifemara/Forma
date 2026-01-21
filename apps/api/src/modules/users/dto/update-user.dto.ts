import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Hassan' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'AhmedFit' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'ar' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'metric' })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
