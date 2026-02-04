import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { AchievementsService } from '../achievements/achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { LogWeightDto, LogMeasurementsDto } from './dto/progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly achievementsService: AchievementsService,
  ) {}

  @Post('weight')
  @ApiOperation({ summary: 'Log weight measurement' })
  @ApiResponse({ status: 201, description: 'Weight logged successfully' })
  async logWeight(@CurrentUser() user: User, @Body() dto: LogWeightDto) {
    const result = await this.progressService.logWeight(user.id, dto);
    // Check achievements in background
    this.achievementsService.checkAndUpdateAchievements(user.id).catch(() => {});
    return result;
  }

  @Post('measurements')
  @ApiOperation({ summary: 'Log body measurements' })
  @ApiResponse({ status: 201, description: 'Measurements logged successfully' })
  async logMeasurements(@CurrentUser() user: User, @Body() dto: LogMeasurementsDto) {
    const result = await this.progressService.logMeasurements(user.id, dto);
    // Check achievements in background
    this.achievementsService.checkAndUpdateAchievements(user.id).catch(() => {});
    return result;
  }

  @Get('weight')
  @ApiOperation({ summary: 'Get weight history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 90)' })
  @ApiResponse({ status: 200, description: 'Returns weight history array' })
  async getWeightHistory(@CurrentUser() user: User, @Query('days') days?: number) {
    return this.progressService.getWeightHistory(user.id, days || 90);
  }

  @Get('measurements')
  @ApiOperation({ summary: 'Get measurements history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records (default: 10)' })
  @ApiResponse({ status: 200, description: 'Returns measurements history array' })
  async getMeasurementsHistory(@CurrentUser() user: User, @Query('limit') limit?: number) {
    return this.progressService.getMeasurementsHistory(user.id, limit || 10);
  }

  @Get('prs')
  @ApiOperation({ summary: 'Get personal records (strength PRs)' })
  @ApiResponse({ status: 200, description: 'Returns top strength PRs' })
  async getStrengthPRs(@CurrentUser() user: User) {
    return this.progressService.getStrengthPRs(user.id);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest progress summary' })
  @ApiResponse({ status: 200, description: 'Returns current weight, body fat, and recent changes' })
  async getLatestProgress(@CurrentUser() user: User) {
    return this.progressService.getLatestProgress(user.id);
  }
}
