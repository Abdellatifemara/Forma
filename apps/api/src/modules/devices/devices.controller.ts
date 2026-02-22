import { Controller, Post, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { DevicesService } from './devices.service';

@ApiTags('devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect a wearable device (MVP: stores record, no real OAuth)' })
  async connect(
    @CurrentUser() user: User,
    @Body() body: { deviceType: string; displayName?: string },
  ) {
    return this.devicesService.connectDevice(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all connected devices for the user' })
  async list(@CurrentUser() user: User) {
    return this.devicesService.listDevices(user.id);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect a device' })
  async disconnect(
    @CurrentUser() user: User,
    @Body() body: { deviceType: string },
  ) {
    return this.devicesService.disconnectDevice(user.id, body);
  }

  @Patch('sync-frequency')
  @ApiOperation({ summary: 'Update sync interval preference' })
  async updateSyncFrequency(
    @CurrentUser() user: User,
    @Body() body: { deviceType: string; frequency: string },
  ) {
    return this.devicesService.updateSyncFrequency(user.id, body);
  }

  @Patch('permissions')
  @ApiOperation({ summary: 'Update data scope (all/sleep/heart/workouts)' })
  async updatePermissions(
    @CurrentUser() user: User,
    @Body() body: { deviceType: string; permissions: string },
  ) {
    return this.devicesService.updatePermissions(user.id, body);
  }

  @Delete('data')
  @ApiOperation({ summary: 'Delete all health data for the user' })
  async deleteData(@CurrentUser() user: User) {
    return this.devicesService.deleteHealthData(user.id);
  }
}
