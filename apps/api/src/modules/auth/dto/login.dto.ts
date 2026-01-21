import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class GoogleLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class AppleLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
