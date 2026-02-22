import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async setReminder(
    userId: string,
    body: {
      type: string;
      enabled?: boolean;
      time?: string;
      days?: string;
      message?: string;
    },
  ) {
    return this.prisma.notificationReminder.upsert({
      where: { userId_type: { userId, type: body.type } },
      update: {
        enabled: body.enabled ?? true,
        time: body.time,
        days: body.days,
        message: body.message,
      },
      create: {
        userId,
        type: body.type,
        enabled: body.enabled ?? true,
        time: body.time,
        days: body.days,
        message: body.message,
      },
    });
  }

  async getReminders(userId: string) {
    return this.prisma.notificationReminder.findMany({
      where: { userId },
    });
  }
}
