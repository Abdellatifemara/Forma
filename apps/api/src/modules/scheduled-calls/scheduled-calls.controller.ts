import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ScheduledCallsService,
  CreateScheduledCallDto,
  UpdateScheduledCallDto,
} from './scheduled-calls.service';
import { ScheduledCallStatus } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: { id: string };
}

@Controller('scheduled-calls')
@UseGuards(JwtAuthGuard)
export class ScheduledCallsController {
  constructor(private readonly scheduledCallsService: ScheduledCallsService) {}

  // Trainer creates a call
  @Post()
  async create(@Request() req: AuthRequest, @Body() data: CreateScheduledCallDto) {
    return this.scheduledCallsService.create(req.user.id, data);
  }

  // Update call details
  @Patch(':id')
  async update(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: UpdateScheduledCallDto,
  ) {
    return this.scheduledCallsService.update(req.user.id, id, data);
  }

  // Cancel a call
  @Delete(':id')
  async cancel(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.scheduledCallsService.cancel(req.user.id, id);
  }

  // Start a call
  @Post(':id/start')
  async start(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.scheduledCallsService.start(req.user.id, id);
  }

  // End a call
  @Post(':id/end')
  async end(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.scheduledCallsService.end(req.user.id, id, body.notes);
  }

  // Get a specific call
  @Get(':id')
  async getById(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.scheduledCallsService.getById(req.user.id, id);
  }

  // Trainer: Get my calls
  @Get('trainer/all')
  async getTrainerCalls(
    @Request() req: AuthRequest,
    @Query('upcoming') upcoming?: string,
    @Query('status') status?: ScheduledCallStatus,
  ) {
    return this.scheduledCallsService.getTrainerCalls(req.user.id, {
      upcoming: upcoming === 'true',
      status,
    });
  }

  // Trainer: Get today's calls
  @Get('trainer/today')
  async getTodaysCalls(@Request() req: AuthRequest) {
    return this.scheduledCallsService.getTodaysCalls(req.user.id);
  }

  // Client: Get my calls
  @Get('client/all')
  async getClientCalls(
    @Request() req: AuthRequest,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.scheduledCallsService.getClientCalls(req.user.id, {
      upcoming: upcoming === 'true',
    });
  }
}
