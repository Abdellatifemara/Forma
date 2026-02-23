import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { AchievementsService } from '../achievements/achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { LogWeightDto, LogMeasurementsDto, CreateProgressPhotoDto } from './dto/progress.dto';

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

  @Post('photos')
  @ApiOperation({ summary: 'Save a progress photo URL' })
  @ApiResponse({ status: 201, description: 'Photo record created' })
  async createPhoto(@CurrentUser() user: User, @Body() dto: CreateProgressPhotoDto) {
    return this.progressService.createPhoto(user.id, dto);
  }

  @Get('photos')
  @ApiOperation({ summary: 'Get all progress photos' })
  @ApiResponse({ status: 200, description: 'Returns list of progress photos' })
  async getPhotos(@CurrentUser() user: User) {
    return this.progressService.getPhotos(user.id);
  }

  @Delete('photos/:id')
  @ApiOperation({ summary: 'Delete a progress photo' })
  @ApiResponse({ status: 200, description: 'Photo deleted' })
  async deletePhoto(@CurrentUser() user: User, @Param('id') photoId: string) {
    return this.progressService.deletePhoto(user.id, photoId);
  }

  // ─── Fitness Tests ──────────────────────────────────────────────
  @Post('fitness-tests')
  @ApiOperation({ summary: 'Save a fitness test result' })
  @ApiResponse({ status: 201, description: 'Test result saved' })
  async saveFitnessTest(
    @CurrentUser() user: User,
    @Body() dto: { testId: string; value: number; rating: string },
  ) {
    return this.progressService.saveFitnessTest(user.id, dto);
  }

  @Get('fitness-tests')
  @ApiOperation({ summary: 'Get fitness test history' })
  @ApiQuery({ name: 'testId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns test results' })
  async getFitnessTests(
    @CurrentUser() user: User,
    @Query('testId') testId?: string,
  ) {
    return this.progressService.getFitnessTests(user.id, testId);
  }

  @Get('fitness-tests/latest')
  @ApiOperation({ summary: 'Get latest result for each fitness test' })
  @ApiResponse({ status: 200, description: 'Returns latest result per test' })
  async getLatestFitnessTests(@CurrentUser() user: User) {
    return this.progressService.getLatestFitnessTests(user.id);
  }
}
