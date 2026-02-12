import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
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

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated users list' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('query') query?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      query,
    });
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.adminService.updateUser(id, data);
  }

  @Post('users/:id/delete')
  @ApiOperation({ summary: 'Delete a user and all their data' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/subscription')
  @ApiOperation({ summary: 'Update user subscription tier' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  async updateUserSubscription(
    @Param('id') id: string,
    @Body() data: { tier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS' },
  ) {
    return this.adminService.updateUserSubscription(id, data.tier);
  }

  @Get('trainers/stats')
  @ApiOperation({ summary: 'Get trainer statistics' })
  @ApiResponse({ status: 200, description: 'Returns trainer statistics' })
  async getTrainerStats() {
    return this.adminService.getTrainerStats();
  }

  @Get('trainers')
  @ApiOperation({ summary: 'Get all trainers with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated trainers list' })
  async getAllTrainers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllTrainers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiResponse({ status: 200, description: 'Returns analytics data' })
  async getAnalytics(@Query('period') period?: 'week' | 'month' | 'quarter' | 'year') {
    return this.adminService.getAnalytics(period || 'month');
  }

  @Get('content/stats')
  @ApiOperation({ summary: 'Get content statistics' })
  @ApiResponse({ status: 200, description: 'Returns content stats' })
  async getContentStats() {
    return this.adminService.getContentStats();
  }

  @Get('content/exercises')
  @ApiOperation({ summary: 'Get exercises for content management' })
  @ApiResponse({ status: 200, description: 'Returns paginated exercises' })
  async getExercises(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getExercises({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }

  @Get('content/foods')
  @ApiOperation({ summary: 'Get foods for content management' })
  @ApiResponse({ status: 200, description: 'Returns paginated foods' })
  async getFoods(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getFoods({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }
}
