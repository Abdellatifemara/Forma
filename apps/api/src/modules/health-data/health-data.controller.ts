import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { HealthDataService } from './health-data.service';

@ApiTags('health-data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health-data')
export class HealthDataController {
  constructor(private readonly healthDataService: HealthDataService) {}

  @Post('metrics')
  @ApiOperation({ summary: 'Log health metrics from wearable devices' })
  async logMetrics(
    @CurrentUser() user: User,
    @Body()
    body: {
      hrv?: number;
      restingHeartRate?: number;
      sleepHours?: number;
      sleepQuality?: number;
      steps?: number;
      activeCalories?: number;
      stressLevel?: number;
      source: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'manual';
    },
  ) {
    return this.healthDataService.logHealthMetrics(user.id, {
      ...body,
      recordedAt: new Date(),
    });
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Get current readiness score and workout recommendation' })
  async getReadiness(
    @CurrentUser() user: User,
    @Query('hrv') hrv?: string,
    @Query('restingHeartRate') restingHeartRate?: string,
    @Query('sleepHours') sleepHours?: string,
    @Query('sleepQuality') sleepQuality?: string,
  ) {
    return this.healthDataService.calculateReadinessScore(user.id, {
      hrv: hrv ? parseFloat(hrv) : undefined,
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      sleepQuality: sleepQuality ? parseInt(sleepQuality) : undefined,
    });
  }

  @Get('readiness/trend')
  @ApiOperation({ summary: 'Get readiness trend over time' })
  async getReadinessTrend(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    return this.healthDataService.getReadinessTrend(user.id, days ? parseInt(days) : 7);
  }

  @Post('sync/apple-health')
  @ApiOperation({ summary: 'Sync data from Apple Health (called from iOS app)' })
  async syncAppleHealth(
    @CurrentUser() user: User,
    @Body()
    body: {
      data: Array<{
        type: string;
        value: number;
        unit: string;
        date: string;
      }>;
    },
  ) {
    // Process Apple Health data
    const metrics: any = {};

    for (const item of body.data) {
      switch (item.type) {
        case 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN':
          metrics.hrv = item.value;
          break;
        case 'HKQuantityTypeIdentifierRestingHeartRate':
          metrics.restingHeartRate = item.value;
          break;
        case 'HKCategoryTypeIdentifierSleepAnalysis':
          metrics.sleepHours = item.value / 3600; // Convert seconds to hours
          break;
        case 'HKQuantityTypeIdentifierStepCount':
          metrics.steps = item.value;
          break;
        case 'HKQuantityTypeIdentifierActiveEnergyBurned':
          metrics.activeCalories = item.value;
          break;
      }
    }

    return this.healthDataService.logHealthMetrics(user.id, {
      ...metrics,
      source: 'apple_health',
      recordedAt: new Date(),
    });
  }

  @Post('sync/google-fit')
  @ApiOperation({ summary: 'Sync data from Google Fit / Health Connect' })
  async syncGoogleFit(
    @CurrentUser() user: User,
    @Body()
    body: {
      data: Array<{
        dataType: string;
        value: number;
        timestamp: string;
      }>;
    },
  ) {
    // Process Google Fit data
    const metrics: any = {};

    for (const item of body.data) {
      switch (item.dataType) {
        case 'com.google.heart_rate.variability':
          metrics.hrv = item.value;
          break;
        case 'com.google.heart_rate.resting':
          metrics.restingHeartRate = item.value;
          break;
        case 'com.google.sleep.segment':
          // Google Fit returns sleep in segments
          metrics.sleepHours = (metrics.sleepHours || 0) + item.value;
          break;
        case 'com.google.step_count.delta':
          metrics.steps = item.value;
          break;
        case 'com.google.calories.expended':
          metrics.activeCalories = item.value;
          break;
      }
    }

    return this.healthDataService.logHealthMetrics(user.id, {
      ...metrics,
      source: 'google_fit',
      recordedAt: new Date(),
    });
  }
}
