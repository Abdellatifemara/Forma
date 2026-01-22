import { Controller, Get, Put, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @CacheKey('get_profile_')
  @CacheTTL(300)
  async getProfile(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById(user.id);
    const { passwordHash, ...result } = fullUser!;
    return result;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(user.id, updateUserDto);
    const { passwordHash, ...result } = updated;
    return result;
  }

  @Put('me/onboarding')
  @ApiOperation({ summary: 'Complete onboarding with fitness data' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  async completeOnboarding(
    @CurrentUser() user: User,
    @Body() onboardingDto: UpdateOnboardingDto,
  ) {
    const updated = await this.usersService.updateOnboarding(user.id, onboardingDto);
    const { passwordHash, ...result } = updated;
    return result;
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user statistics summary' })
  @ApiResponse({ status: 200, description: 'Returns user stats' })
  @CacheKey('get_stats_')
  @CacheTTL(300)
  async getStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user.id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteAccount(@CurrentUser() user: User) {
    await this.usersService.delete(user.id);
  }
}
