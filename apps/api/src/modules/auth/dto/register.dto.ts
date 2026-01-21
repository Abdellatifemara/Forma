import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    { message: 'Password must contain at least one uppercase, one lowercase, and one number' }
  )
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^\+20[0-9]{10}$/, { message: 'Phone must be a valid Egyptian number (+20XXXXXXXXXX)' })
  phone?: string;

  @ApiPropertyOptional({ example: 'ar', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
