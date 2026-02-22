import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('reminder')
  @ApiOperation({ summary: 'Set a notification reminder (bedtime, workout, etc.)' })
  async setReminder(
    @CurrentUser() user: User,
    @Body()
    body: {
      type: string;
      enabled?: boolean;
      time?: string;
      days?: string;
      message?: string;
    },
  ) {
    return this.notificationsService.setReminder(user.id, body);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get all notification reminders for the user' })
  async getReminders(@CurrentUser() user: User) {
    return this.notificationsService.getReminders(user.id);
  }
}
