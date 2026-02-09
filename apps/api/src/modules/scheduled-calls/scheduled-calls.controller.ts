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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ScheduledCallsService,
  CreateScheduledCallDto,
  UpdateScheduledCallDto,
  AvailabilitySlotDto,
  RequestCallDto,
} from './scheduled-calls.service';
import { ScheduledCallStatus, ScheduledCallType } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: { id: string };
}

@ApiTags('scheduled-calls')
@Controller('scheduled-calls')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScheduledCallsController {
  constructor(private readonly scheduledCallsService: ScheduledCallsService) {}

  // ============ AVAILABILITY ============

  @Get('availability/me')
  @ApiOperation({ summary: 'Get my availability schedule (trainer)' })
  async getMyAvailability(@Request() req: AuthRequest) {
    return this.scheduledCallsService.getTrainerAvailability(req.user.id);
  }

  @Get('availability/:trainerId')
  @ApiOperation({ summary: 'Get trainer availability schedule' })
  async getTrainerAvailability(@Param('trainerId') trainerId: string) {
    return this.scheduledCallsService.getTrainerAvailability(trainerId);
  }

  @Post('availability')
  @ApiOperation({ summary: 'Set availability schedule (trainer)' })
  async setAvailability(
    @Request() req: AuthRequest,
    @Body() body: { slots: AvailabilitySlotDto[] },
  ) {
    return this.scheduledCallsService.setTrainerAvailability(req.user.id, body.slots);
  }

  @Get('slots/:trainerId')
  @ApiOperation({ summary: 'Get available slots for a trainer on a date' })
  async getAvailableSlots(
    @Param('trainerId') trainerId: string,
    @Query('date') date: string,
  ) {
    return this.scheduledCallsService.getAvailableSlots(trainerId, date);
  }

  // ============ CLIENT BOOKING ============

  @Post('request')
  @ApiOperation({ summary: 'Client requests a video call with trainer' })
  async requestCall(
    @Request() req: AuthRequest,
    @Body()
    body: {
      trainerId: string;
      scheduledAt: string;
      type?: ScheduledCallType;
      agenda?: string;
    },
  ) {
    return this.scheduledCallsService.requestCall(req.user.id, {
      trainerId: body.trainerId,
      scheduledAt: new Date(body.scheduledAt),
      type: body.type,
      agenda: body.agenda,
    });
  }

  // ============ TRAINER METHODS ============

  @Post()
  @ApiOperation({ summary: 'Trainer creates a call' })
  async create(@Request() req: AuthRequest, @Body() data: CreateScheduledCallDto) {
    return this.scheduledCallsService.create(req.user.id, data);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a call request (trainer)' })
  async confirm(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { meetingUrl?: string },
  ) {
    return this.scheduledCallsService.confirm(req.user.id, id, body.meetingUrl);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update call details' })
  async update(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: UpdateScheduledCallDto,
  ) {
    return this.scheduledCallsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a call' })
  async cancel(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.scheduledCallsService.cancel(req.user.id, id, body?.reason);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a call' })
  async start(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.scheduledCallsService.start(req.user.id, id);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a call' })
  async end(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.scheduledCallsService.end(req.user.id, id, body.notes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific call' })
  async getById(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.scheduledCallsService.getById(req.user.id, id);
  }

  // ============ LIST CALLS ============

  @Get('trainer/all')
  @ApiOperation({ summary: 'Trainer: Get my calls' })
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

  @Get('trainer/today')
  @ApiOperation({ summary: 'Trainer: Get today\'s calls' })
  async getTodaysCalls(@Request() req: AuthRequest) {
    return this.scheduledCallsService.getTodaysCalls(req.user.id);
  }

  @Get('client/all')
  @ApiOperation({ summary: 'Client: Get my calls' })
  async getClientCalls(
    @Request() req: AuthRequest,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.scheduledCallsService.getClientCalls(req.user.id, {
      upcoming: upcoming === 'true',
    });
  }
}
