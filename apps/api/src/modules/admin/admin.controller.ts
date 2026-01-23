import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent platform activity' })
  @ApiResponse({ status: 200, description: 'Returns recent activity list' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit) : 10);
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Get pending approvals' })
  @ApiResponse({ status: 200, description: 'Returns pending approvals list' })
  async getPendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'Returns system health metrics' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Post('trainers/:id/approve')
  @ApiOperation({ summary: 'Approve a trainer application' })
  @ApiResponse({ status: 200, description: 'Trainer approved' })
  async approveTrainer(@Param('id') id: string) {
    return this.adminService.approveTrainer(id);
  }

  @Post('trainers/:id/reject')
  @ApiOperation({ summary: 'Reject a trainer application' })
  @ApiResponse({ status: 200, description: 'Trainer rejected' })
  async rejectTrainer(@Param('id') id: string) {
    return this.adminService.rejectTrainer(id);
  }
}
