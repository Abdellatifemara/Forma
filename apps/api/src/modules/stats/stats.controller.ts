import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly summary stats for dashboard' })
  @ApiResponse({ status: 200, description: 'Returns weekly summary with workouts, nutrition, weight change' })
  async getWeeklySummary(@CurrentUser() user: User) {
    return this.statsService.getWeeklySummary(user.id);
  }

  @Get('weight-trend')
  @ApiOperation({ summary: 'Get weight trend data for charts' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 90)' })
  async getWeightTrend(
    @CurrentUser() user: User,
    @Query('days') days?: number,
  ) {
    return this.statsService.getWeightTrend(user.id, days || 90);
  }

  @Get('volume-trend')
  @ApiOperation({ summary: 'Get volume load trend by muscle group' })
  @ApiQuery({ name: 'weeks', required: false, type: Number, description: 'Number of weeks (default: 8)' })
  async getVolumeLoadTrend(
    @CurrentUser() user: User,
    @Query('weeks') weeks?: number,
  ) {
    return this.statsService.getVolumeLoadTrend(user.id, weeks || 8);
  }

  @Get('strength')
  @ApiOperation({ summary: 'Get strength trends (estimated 1RM) for major lifts' })
  async getStrengthTrends(@CurrentUser() user: User) {
    return this.statsService.getStrengthTrends(user.id);
  }

  @Get('muscle-balance')
  @ApiOperation({ summary: 'Get muscle balance radar chart data' })
  @ApiQuery({ name: 'weeks', required: false, type: Number, description: 'Number of weeks (default: 4)' })
  async getMuscleBalance(
    @CurrentUser() user: User,
    @Query('weeks') weeks?: number,
  ) {
    return this.statsService.getMuscleBalance(user.id, weeks || 4);
  }

  @Get('frequency')
  @ApiOperation({ summary: 'Get training frequency heatmap data' })
  @ApiQuery({ name: 'weeks', required: false, type: Number, description: 'Number of weeks (default: 8)' })
  async getTrainingFrequency(
    @CurrentUser() user: User,
    @Query('weeks') weeks?: number,
  ) {
    return this.statsService.getTrainingFrequency(user.id, weeks || 8);
  }
}
