import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService, AIUsageEvent, UserSurveyResponse } from './analytics.service';

interface AuthRequest {
  user: { id: string };
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Track AI usage event
   */
  @Post('ai-usage')
  async trackAIUsage(
    @Request() req: AuthRequest,
    @Body() body: Omit<AIUsageEvent, 'userId'>,
  ) {
    return this.analyticsService.trackAIUsage({
      ...body,
      userId: req.user.id,
    });
  }

  /**
   * Get user's AI usage statistics
   */
  @Get('ai-usage/me')
  async getMyAIUsage(
    @Request() req: AuthRequest,
    @Query('period') period?: 'day' | 'week' | 'month',
  ) {
    return this.analyticsService.getUserAIUsage(req.user.id, period);
  }

  /**
   * Submit survey response
   */
  @Post('surveys')
  async submitSurvey(
    @Request() req: AuthRequest,
    @Body() body: Omit<UserSurveyResponse, 'userId'>,
  ) {
    return this.analyticsService.storeSurveyResponse({
      ...body,
      userId: req.user.id,
    });
  }
}

/**
 * Admin analytics controller (for research)
 */
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AdminAnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get AI usage metrics (research)
   */
  @Get('ai-metrics')
  async getAIMetrics(@Query('days') days?: string) {
    return this.analyticsService.getAIUsageMetrics(
      days ? parseInt(days, 10) : 30,
    );
  }

  /**
   * Get drop-off analysis (research)
   */
  @Get('drop-off')
  async getDropOffAnalysis() {
    return this.analyticsService.getDropOffAnalysis();
  }

  /**
   * Get query frequency patterns (research)
   */
  @Get('query-patterns')
  async getQueryPatterns() {
    return this.analyticsService.getQueryFrequencyPatterns();
  }

  /**
   * Get query value analysis (research)
   */
  @Get('query-value')
  async getQueryValue() {
    return this.analyticsService.getQueryValueAnalysis();
  }

  /**
   * Get survey results (research)
   */
  @Get('surveys/:surveyId')
  async getSurveyResults(@Query('surveyId') surveyId: string) {
    return this.analyticsService.getSurveyResults(surveyId);
  }
}
