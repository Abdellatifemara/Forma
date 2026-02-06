import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResearchService, AIUsageData } from './research.service';
import { AIQueryType } from '@prisma/client';

interface AuthRequest {
  user: { id: string };
}

@Controller('research')
@UseGuards(JwtAuthGuard)
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  /**
   * Get all available tests for user
   */
  @Get('tests')
  async getAvailableTests(@Request() req: AuthRequest) {
    return this.researchService.getAvailableTests(req.user.id);
  }

  /**
   * Get specific test by code
   */
  @Get('tests/:code')
  async getTest(@Request() req: AuthRequest, @Param('code') code: string) {
    return this.researchService.getTestByCode(req.user.id, code);
  }

  /**
   * Get available survey for user
   */
  @Get('surveys/available')
  async getAvailableSurvey(
    @Request() req: AuthRequest,
    @Query('trigger') trigger?: string,
  ) {
    return this.researchService.getAvailableSurvey(req.user.id, trigger);
  }

  /**
   * Submit survey response
   */
  @Post('surveys/:surveyId/respond')
  async submitSurveyResponse(
    @Request() req: AuthRequest,
    @Param('surveyId') surveyId: string,
    @Body() body: { responses: Record<string, unknown> },
  ) {
    return this.researchService.submitSurveyResponse(
      req.user.id,
      surveyId,
      body.responses,
    );
  }

  /**
   * Track AI usage
   */
  @Post('ai-usage')
  async trackAIUsage(
    @Request() req: AuthRequest,
    @Body() body: {
      featureId: string;
      queryType: AIQueryType;
      queryText?: string;
      responseTimeMs?: number;
      successful?: boolean;
      satisfaction?: number;
    },
  ) {
    return this.researchService.trackAIUsage(req.user.id, body);
  }

  /**
   * Get user's AI usage
   */
  @Get('ai-usage/me')
  async getMyAIUsage(@Request() req: AuthRequest) {
    return this.researchService.getUserAIUsage(req.user.id);
  }

  /**
   * Check if user can use AI feature
   */
  @Get('ai-usage/can-use/:featureId')
  async canUseAIFeature(@Request() req: AuthRequest, @Param('featureId') featureId: string) {
    const canUse = await this.researchService.canUseAIFeature(req.user.id, featureId);
    return { canUse };
  }
}

/**
 * Admin research controller for viewing results
 */
@Controller('admin/research')
@UseGuards(JwtAuthGuard)
export class AdminResearchController {
  constructor(private researchService: ResearchService) {}

  /**
   * Get survey results
   */
  @Get('surveys/:code/results')
  async getSurveyResults(@Param('code') code: string) {
    return this.researchService.getSurveyResults(code);
  }

  /**
   * Get AI usage metrics
   */
  @Get('ai-metrics')
  async getAIMetrics(@Query('days') days?: string) {
    return this.researchService.getAIUsageMetrics(
      days ? parseInt(days, 10) : 30,
    );
  }

  /**
   * Get limit hit analysis
   */
  @Get('limit-analysis')
  async getLimitHitAnalysis() {
    return this.researchService.getLimitHitAnalysis();
  }

  /**
   * Get query frequency patterns
   */
  @Get('query-patterns')
  async getQueryPatterns() {
    return this.researchService.getQueryFrequencyPatterns();
  }

  /**
   * Seed surveys
   */
  @Post('surveys/seed')
  async seedSurveys() {
    return this.researchService.seedSurveys();
  }
}
