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
import { CheckInsService, CreateCheckInDto } from './check-ins.service';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: { id: string };
}

@Controller('check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  async createOrUpdate(@Request() req: AuthRequest, @Body() data: CreateCheckInDto) {
    return this.checkInsService.createOrUpdate(req.user.id, data);
  }

  @Post('date/:date')
  async createOrUpdateForDate(
    @Request() req: AuthRequest,
    @Param('date') dateStr: string,
    @Body() data: CreateCheckInDto,
  ) {
    const date = new Date(dateStr);
    return this.checkInsService.createOrUpdate(req.user.id, data, date);
  }

  @Get('today')
  async getToday(@Request() req: AuthRequest) {
    return this.checkInsService.getToday(req.user.id);
  }

  @Get('history')
  async getHistory(@Request() req: AuthRequest, @Query('days') days?: string) {
    const dayCount = days ? parseInt(days) : 7;
    return this.checkInsService.getHistory(req.user.id, dayCount);
  }

  @Get('weekly-stats')
  async getWeeklyStats(@Request() req: AuthRequest) {
    return this.checkInsService.getWeeklyStats(req.user.id);
  }

  @Get('compliance')
  async getCompliance(@Request() req: AuthRequest, @Query('days') days?: string) {
    const dayCount = days ? parseInt(days) : 30;
    return this.checkInsService.getComplianceRate(req.user.id, dayCount);
  }

  @Get('date/:date')
  async getByDate(@Request() req: AuthRequest, @Param('date') dateStr: string) {
    const date = new Date(dateStr);
    return this.checkInsService.getByDate(req.user.id, date);
  }

  // Trainer endpoints
  @Get('client/:clientId')
  async getClientCheckIns(
    @Request() req: AuthRequest,
    @Param('clientId') clientId: string,
    @Query('days') days?: string,
  ) {
    const dayCount = days ? parseInt(days) : 7;
    return this.checkInsService.getClientCheckIns(req.user.id, clientId, dayCount);
  }

  @Get('clients/no-checkin')
  async getClientsWithoutCheckIn(@Request() req: AuthRequest) {
    return this.checkInsService.getClientsWithoutCheckIn(req.user.id);
  }
}
