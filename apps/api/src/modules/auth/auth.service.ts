import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (registerDto.phone) {
      const existingPhone = await this.usersService.findByPhone(registerDto.phone);
      if (existingPhone) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      language: registerDto.language || 'en',
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last active
    await this.usersService.updateLastActive(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user as User);

    return {
      user,
      ...tokens,
    };
  }

  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    // TODO: Verify Google token and get user info
    // For now, throw not implemented
    throw new BadRequestException('Google login not yet implemented');
  }

  async loginWithApple(appleToken: string): Promise<AuthResponse> {
    // TODO: Verify Apple token and get user info
    throw new BadRequestException('Apple login not yet implemented');
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User | Omit<User, 'passwordHash'>) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User | Omit<User, 'passwordHash'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d',
    });
  }

  private generateRefreshToken(user: User | Omit<User, 'passwordHash'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '30d',
    });
  }

  async validateJwtPayload(payload: JwtPayload): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
