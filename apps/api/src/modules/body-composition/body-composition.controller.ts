import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { BodyCompositionService } from './body-composition.service';

@ApiTags('body-composition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('body-composition')
export class BodyCompositionController {
  constructor(private readonly bodyCompositionService: BodyCompositionService) {}

  @Post()
  @ApiOperation({ summary: 'Log body composition entry' })
  async logBodyComposition(
    @CurrentUser() user: User,
    @Body()
    body: {
      weight: number;
      bodyFatPercentage?: number;
      muscleMass?: number;
      waterPercentage?: number;
      boneMass?: number;
      visceralFat?: number;
      metabolicAge?: number;
      bmr?: number;
      chest?: number;
      waist?: number;
      hips?: number;
      leftArm?: number;
      rightArm?: number;
      leftThigh?: number;
      rightThigh?: number;
      neck?: number;
    },
  ) {
    return this.bodyCompositionService.logBodyComposition(user.id, body);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get body composition history' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bodyCompositionService.getHistory(user.id, {
      days: days ? parseInt(days) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Get comprehensive body composition analysis' })
  async getAnalysis(@CurrentUser() user: User) {
    return this.bodyCompositionService.getAnalysis(user.id);
  }

  @Get('estimate-bodyfat')
  @ApiOperation({ summary: 'Estimate body fat using measurements (Navy method)' })
  async estimateBodyFat(@CurrentUser() user: User) {
    return this.bodyCompositionService.estimateBodyFat(user.id);
  }
}
