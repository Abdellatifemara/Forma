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

export interface RequestCallDto {
  trainerId: string;
  scheduledAt: Date;
  type?: ScheduledCallType;
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

export interface AvailabilitySlotDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
}

@Injectable()
export class ScheduledCallsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ TRAINER AVAILABILITY ============

  /**
   * Get trainer's availability schedule
   */
  async getTrainerAvailability(trainerId: string) {
    try {
      // trainerId could be the user ID or trainer profile ID
      const trainer = await this.prisma.trainerProfile.findFirst({
        where: {
          OR: [{ userId: trainerId }, { id: trainerId }],
        },
      });

      if (!trainer) {
        return [];
      }

      const availability = await this.prisma.trainerAvailability.findMany({
        where: { trainerId: trainer.id, isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });

      return availability.map((slot) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotMinutes: slot.slotMinutes,
      }));
    } catch (error) {
      console.error('Error fetching trainer availability:', error);
      return [];
    }
  }

  /**
   * Set trainer's availability (replaces existing)
   */
  async setTrainerAvailability(userId: string, slots: AvailabilitySlotDto[]) {
    try {
      const trainer = await this.prisma.trainerProfile.findUnique({
        where: { userId },
      });

      if (!trainer) {
        // Return empty array for non-trainers instead of throwing
        return [];
      }

      // Ensure slots is an array
      const slotsArray = Array.isArray(slots) ? slots : [];

      await this.prisma.$transaction(async (tx) => {
        // Delete all existing availability
        await tx.trainerAvailability.deleteMany({
          where: { trainerId: trainer.id },
        });

        // Create new availability slots
        if (slotsArray.length > 0) {
          await tx.trainerAvailability.createMany({
            data: slotsArray.map((slot) => ({
              trainerId: trainer.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              slotMinutes: slot.slotMinutes || 30,
            })),
          });
        }
      });

      return this.getTrainerAvailability(trainer.id);
    } catch (error) {
      console.error('Error setting trainer availability:', error);
      return [];
    }
  }

  /**
   * Get available time slots for a trainer on a specific date
   */
  async getAvailableSlots(trainerId: string, date: string) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get trainer profile
    const trainer = await this.prisma.trainerProfile.findFirst({
      where: {
        OR: [{ userId: trainerId }, { id: trainerId }],
      },
    });

    if (!trainer) {
      return { date, slots: [], trainerName: '' };
    }

    // Get availability for this day
    const availability = await this.prisma.trainerAvailability.findMany({
      where: {
        trainerId: trainer.id,
        dayOfWeek,
        isActive: true,
      },
    });

    if (availability.length === 0) {
      return { date, slots: [], trainerName: '' };
    }

    // Get existing bookings for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.scheduledCall.findMany({
      where: {
        trainerId: trainer.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['CANCELLED'] },
      },
    });

    const bookedTimes = new Set(
      existingBookings.map((b) => {
        const d = new Date(b.scheduledAt);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }),
    );

    // Generate available slots
    const slots: { time: string; available: boolean }[] = [];

    for (const avail of availability) {
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);
      const slotDuration = avail.slotMinutes;

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        const isBooked = bookedTimes.has(timeStr);

        // Check if slot is in the past
        const slotDateTime = new Date(targetDate);
        slotDateTime.setHours(currentHour, currentMin, 0, 0);
        const isPast = slotDateTime < new Date();

        slots.push({
          time: timeStr,
          available: !isBooked && !isPast,
        });

        // Increment by slot duration
        currentMin += slotDuration;
        while (currentMin >= 60) {
          currentMin -= 60;
          currentHour++;
        }
      }
    }

    return { date, slots };
  }

  // ============ CLIENT BOOKING ============

  /**
   * Client requests/books a call with trainer
   */
  async requestCall(clientId: string, data: RequestCallDto) {
    // Get trainer profile
    const trainer = await this.prisma.trainerProfile.findFirst({
      where: {
        OR: [{ userId: data.trainerId }, { id: data.trainerId }],
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const scheduledAt = new Date(data.scheduledAt);
    const dayOfWeek = scheduledAt.getDay();
    const timeStr = `${scheduledAt.getHours().toString().padStart(2, '0')}:${scheduledAt.getMinutes().toString().padStart(2, '0')}`;

    // Check availability
    const availability = await this.prisma.trainerAvailability.findFirst({
      where: {
        trainerId: trainer.id,
        dayOfWeek,
        isActive: true,
        startTime: { lte: timeStr },
        endTime: { gt: timeStr },
      },
    });

    if (!availability) {
      throw new BadRequestException('This time slot is not available');
    }

    // Check for existing booking
    const existingBooking = await this.prisma.scheduledCall.findFirst({
      where: {
        trainerId: trainer.id,
        scheduledAt,
        status: { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('This slot is already booked');
    }

    // Create the call request
    const roomName = `forma-${trainer.id.slice(-6)}-${Date.now()}`;

    const createdCall = await this.prisma.scheduledCall.create({
      data: {
        trainerId: trainer.id,
        clientId,
        scheduledAt,
        duration: availability.slotMinutes,
        type: data.type || 'WEEKLY_CHECKIN',
        status: 'SCHEDULED', // Pending confirmation
        agenda: data.agenda,
        roomName,
      },
    });

    const call = await this.prisma.scheduledCall.findUnique({
      where: { id: createdCall.id },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return this.formatCall(call);
  }

  // ============ TRAINER METHODS ============

  /**
   * Trainer creates a call (existing method)
   */
  async create(trainerId: string, data: CreateScheduledCallDto) {
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

    const roomName = `forma-${trainerProfile.id.slice(-6)}-${Date.now()}`;

    const createdCall = await this.prisma.scheduledCall.create({
      data: {
        trainerId: trainerProfile.id,
        clientId: data.clientId,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 30,
        type: data.type,
        agenda: data.agenda,
        roomName,
        status: 'CONFIRMED', // Trainer-created calls are auto-confirmed
      },
    });

    const call = await this.prisma.scheduledCall.findUnique({
      where: { id: createdCall.id },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return this.formatCall(call);
  }

  /**
   * Confirm a call request
   */
  async confirm(trainerId: string, callId: string, meetingUrl?: string) {
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    if (!trainerProfile) {
      throw new ForbiddenException('Not a trainer');
    }

    const call = await this.prisma.scheduledCall.findFirst({
      where: { id: callId, trainerId: trainerProfile.id },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.status !== 'SCHEDULED') {
      throw new BadRequestException('Call cannot be confirmed');
    }

    const updated = await this.prisma.scheduledCall.update({
      where: { id: callId },
      data: {
        status: 'CONFIRMED',
        meetingUrl: meetingUrl || `https://meet.forma.fitness/${call.roomName}`,
      },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return this.formatCall(updated);
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

  async cancel(userId: string, callId: string, reason?: string) {
    await this.getCallWithAuth(userId, callId);

    return this.prisma.scheduledCall.update({
      where: { id: callId },
      data: {
        status: 'CANCELLED',
        trainerNotes: reason,
      },
    });
  }

  async start(userId: string, callId: string) {
    const call = await this.getCallWithAuth(userId, callId);

    if (call.status !== 'SCHEDULED' && call.status !== 'CONFIRMED') {
      throw new BadRequestException('Call cannot be started');
    }

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
      // Return empty array instead of throwing - user may not be a trainer yet
      return [];
    }

    const calls = await this.prisma.scheduledCall.findMany({
      where: {
        trainerId: trainerProfile.id,
        ...(options.upcoming && { scheduledAt: { gte: new Date() } }),
        ...(options.status && { status: options.status }),
      },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return calls.map((call) => this.formatCall(call));
  }

  // Get upcoming calls for a client
  async getClientCalls(clientId: string, options: { upcoming?: boolean } = {}) {
    const calls = await this.prisma.scheduledCall.findMany({
      where: {
        clientId,
        ...(options.upcoming && {
          scheduledAt: { gte: new Date() },
          status: { not: 'CANCELLED' },
        }),
      },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return calls.map((call) => this.formatCall(call));
  }

  // Get today's calls for a trainer
  async getTodaysCalls(trainerId: string) {
    const trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    if (!trainerProfile) {
      // Return empty array instead of throwing - user may not be a trainer yet
      return [];
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const calls = await this.prisma.scheduledCall.findMany({
      where: {
        trainerId: trainerProfile.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return calls.map((call) => this.formatCall(call));
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

  private formatCall(call: any) {
    return {
      id: call.id,
      scheduledAt: call.scheduledAt.toISOString(),
      duration: call.duration,
      type: call.type,
      status: call.status,
      meetingUrl: call.meetingUrl,
      roomName: call.roomName,
      agenda: call.agenda,
      trainer: call.trainer
        ? {
            id: call.trainer.userId,
            name: `${call.trainer.user?.firstName || ''} ${call.trainer.user?.lastName || ''}`.trim(),
            avatarUrl: call.trainer.user?.avatarUrl,
          }
        : null,
      client: call.client
        ? {
            id: call.client.id,
            name: `${call.client.firstName || ''} ${call.client.lastName || ''}`.trim(),
            avatarUrl: call.client.avatarUrl,
          }
        : null,
      startedAt: call.startedAt?.toISOString(),
      endedAt: call.endedAt?.toISOString(),
      createdAt: call.createdAt.toISOString(),
    };
  }
}
