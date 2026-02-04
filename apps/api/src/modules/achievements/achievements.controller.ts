import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements with user progress' })
  @ApiResponse({ status: 200, description: 'Returns all achievements with progress' })
  async getAchievements(@CurrentUser() user: User) {
    return this.achievementsService.getUserAchievements(user.id);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check and update achievement progress' })
  @ApiResponse({ status: 200, description: 'Returns newly unlocked achievements' })
  async checkAchievements(@CurrentUser() user: User) {
    return this.achievementsService.checkAndUpdateAchievements(user.id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed achievement definitions (admin only)' })
  @ApiResponse({ status: 200, description: 'Achievements seeded' })
  async seedAchievements() {
    return this.achievementsService.seedAchievements();
  }
}
