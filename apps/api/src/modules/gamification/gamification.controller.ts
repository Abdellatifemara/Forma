import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get user gamification stats (XP, level, streak)' })
  async getStats(@CurrentUser() user: User) {
    return this.gamificationService.getUserStats(user.id);
  }

  @Post('update-streak')
  @ApiOperation({ summary: 'Update workout streak after completing a workout' })
  async updateStreak(@CurrentUser() user: User) {
    return this.gamificationService.updateStreak(user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  async getLeaderboard(
    @Query('period') period?: 'weekly' | 'monthly',
    @Query('limit') limit?: string,
  ) {
    return this.gamificationService.getLeaderboard(
      period || 'weekly',
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('challenges')
  @ApiOperation({ summary: 'Get available challenges and progress' })
  async getChallenges(@CurrentUser() user: User) {
    return this.gamificationService.getChallenges(user.id);
  }
}
