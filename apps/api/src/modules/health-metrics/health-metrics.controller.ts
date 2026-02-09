import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthMetricsService, CreateHealthMetricDto, GetHealthMetricsQuery } from './health-metrics.service';
import { HealthMetricType } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: { id: string };
}

@Controller('health-metrics')
@UseGuards(JwtAuthGuard)
export class HealthMetricsController {
  constructor(private readonly healthMetricsService: HealthMetricsService) {}

  @Post()
  async create(@Request() req: AuthRequest, @Body() data: CreateHealthMetricDto) {
    return this.healthMetricsService.create(req.user.id, data);
  }

  @Get()
  async getAll(@Request() req: AuthRequest, @Query() query: GetHealthMetricsQuery) {
    return this.healthMetricsService.getAll(req.user.id, query);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: AuthRequest) {
    return this.healthMetricsService.getDashboard(req.user.id);
  }

  @Get('type/:type')
  async getByType(
    @Request() req: AuthRequest,
    @Param('type') type: HealthMetricType,
    @Query('days') days?: string,
  ) {
    const dayCount = days ? parseInt(days) : 30;
    return this.healthMetricsService.getHistory(req.user.id, type, dayCount);
  }

  @Get('latest/:type')
  async getLatest(@Request() req: AuthRequest, @Param('type') type: HealthMetricType) {
    return this.healthMetricsService.getLatestByType(req.user.id, type);
  }

  @Delete(':id')
  async delete(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.healthMetricsService.delete(req.user.id, id);
  }
}
