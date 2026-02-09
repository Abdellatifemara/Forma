import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduledCallType, ScheduledCallStatus } from '@prisma/client';

export interface CreateScheduledCallDto {
  clientId: string;
  scheduledAt: Date;
  duration?: number;
  type: ScheduledCallType;
  agenda?: string;
}

export interface UpdateScheduledCallDto {
  scheduledAt?: Date;
  duration?: number;
  type?: ScheduledCallType;
  status?: ScheduledCallStatus;
  agenda?: string;
  trainerNotes?: string;
  clientNotes?: string;
  meetingUrl?: string;
  roomName?: string;
}

@Injectable()
export class ScheduledCallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(trainerId: string, data: CreateScheduledCallDto) {
    // Verify trainer has this client
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    if (!trainerProfile) {
      throw new ForbiddenException('Not a trainer');
    }

    const relationship = await this.prisma.trainerClient.findFirst({
      where: {
        trainerId: trainerProfile.id,
        clientId: data.clientId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Client not found');
    }

    // Generate a unique room name for the call
    const roomName = `forma-${trainerProfile.id.slice(-6)}-${Date.now()}`;

    return this.prisma.scheduledCall.create({
      data: {
        trainerId: trainerProfile.id,
        clientId: data.clientId,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 30,
        type: data.type,
        agenda: data.agenda,
        roomName,
        // We'll generate the meeting URL when the call starts
      },
    });
  }

  async update(userId: string, callId: string, data: UpdateScheduledCallDto) {
    const call = await this.getCallWithAuth(userId, callId);

    return this.prisma.scheduledCall.update({
      where: { id: callId },
      data: {
        ...data,
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
      },
    });
  }

  async cancel(userId: string, callId: string) {
    await this.getCallWithAuth(userId, callId);

    return this.prisma.scheduledCall.update({
      where: { id: callId },
      data: { status: 'CANCELLED' },
    });
  }

  async start(userId: string, callId: string) {
    const call = await this.getCallWithAuth(userId, callId);

    if (call.status !== 'SCHEDULED' && call.status !== 'CONFIRMED') {
      throw new BadRequestException('Call cannot be started');
    }

    // Generate meeting URL (in production, integrate with Daily.co or similar)
    const meetingUrl = `https://meet.forma.fitness/${call.roomName}`;

    return this.prisma.scheduledCall.update({
      where: { id: callId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        meetingUrl,
      },
    });
  }

  async end(userId: string, callId: string, notes?: string) {
    const call = await this.getCallWithAuth(userId, callId);

    if (call.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Call is not in progress');
    }

    return this.prisma.scheduledCall.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        ...(notes && { trainerNotes: notes }),
      },
    });
  }

  async getById(userId: string, callId: string) {
    return this.getCallWithAuth(userId, callId);
  }

  // Get upcoming calls for a trainer
  async getTrainerCalls(
    trainerId: string,
    options: { upcoming?: boolean; status?: ScheduledCallStatus } = {},
  ) {
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    if (!trainerProfile) {
      throw new ForbiddenException('Not a trainer');
    }

    return this.prisma.scheduledCall.findMany({
      where: {
        trainerId: trainerProfile.id,
        ...(options.upcoming && { scheduledAt: { gte: new Date() } }),
        ...(options.status && { status: options.status }),
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Get upcoming calls for a client
  async getClientCalls(clientId: string, options: { upcoming?: boolean } = {}) {
    return this.prisma.scheduledCall.findMany({
      where: {
        clientId,
        ...(options.upcoming && {
          scheduledAt: { gte: new Date() },
          status: { not: 'CANCELLED' },
        }),
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Get today's calls for a trainer
  async getTodaysCalls(trainerId: string) {
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    if (!trainerProfile) {
      throw new ForbiddenException('Not a trainer');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.scheduledCall.findMany({
      where: {
        trainerId: trainerProfile.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  private async getCallWithAuth(userId: string, callId: string) {
    const call = await this.prisma.scheduledCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Check if user is the client
    if (call.clientId === userId) {
      return call;
    }

    // Check if user is the trainer
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (trainerProfile && call.trainerId === trainerProfile.id) {
      return call;
    }

    throw new ForbiddenException('Not authorized to access this call');
  }
}
