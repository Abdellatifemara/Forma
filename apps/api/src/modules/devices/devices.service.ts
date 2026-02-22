import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async connectDevice(userId: string, body: { deviceType: string; displayName?: string }) {
    const existing = await this.prisma.connectedDevice.findUnique({
      where: { userId_deviceType: { userId, deviceType: body.deviceType } },
    });

    if (existing && existing.isActive) {
      throw new ConflictException(`${body.deviceType} is already connected`);
    }

    // Reactivate if previously disconnected, or create new
    if (existing) {
      return this.prisma.connectedDevice.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          displayName: body.displayName || existing.displayName,
          mockToken: `mock_${body.deviceType}_${Date.now()}`,
          connectedAt: new Date(),
        },
      });
    }

    return this.prisma.connectedDevice.create({
      data: {
        userId,
        deviceType: body.deviceType,
        displayName: body.displayName,
        mockToken: `mock_${body.deviceType}_${Date.now()}`,
      },
    });
  }

  async listDevices(userId: string) {
    return this.prisma.connectedDevice.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async disconnectDevice(userId: string, body: { deviceType: string }) {
    const device = await this.prisma.connectedDevice.findUnique({
      where: { userId_deviceType: { userId, deviceType: body.deviceType } },
    });

    if (!device) {
      throw new NotFoundException(`No ${body.deviceType} device found`);
    }

    return this.prisma.connectedDevice.update({
      where: { id: device.id },
      data: { isActive: false, mockToken: null },
    });
  }

  async updateSyncFrequency(userId: string, body: { deviceType: string; frequency: string }) {
    const device = await this.prisma.connectedDevice.findUnique({
      where: { userId_deviceType: { userId, deviceType: body.deviceType } },
    });

    if (!device) {
      throw new NotFoundException(`No ${body.deviceType} device found`);
    }

    return this.prisma.connectedDevice.update({
      where: { id: device.id },
      data: { syncFrequency: body.frequency },
    });
  }

  async updatePermissions(userId: string, body: { deviceType: string; permissions: string }) {
    const device = await this.prisma.connectedDevice.findUnique({
      where: { userId_deviceType: { userId, deviceType: body.deviceType } },
    });

    if (!device) {
      throw new NotFoundException(`No ${body.deviceType} device found`);
    }

    return this.prisma.connectedDevice.update({
      where: { id: device.id },
      data: { permissions: body.permissions },
    });
  }

  async deleteHealthData(userId: string) {
    // Delete all health data logs for this user
    const deleted = await this.prisma.healthDataLog.deleteMany({
      where: { userId },
    });

    return { deletedCount: deleted.count, message: 'All health data deleted' };
  }
}
