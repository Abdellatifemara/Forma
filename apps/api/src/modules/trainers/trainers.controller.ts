import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '@prisma/client';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search trainers marketplace' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'specialization', required: false })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @CacheKey('search_trainers')
  @CacheTTL(300)
  async searchTrainers(
    @Query('query') query?: string,
    @Query('specialization') specialization?: string,
    @Query('minRating') minRating?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.trainersService.searchTrainers({
      query,
      specialization,
      minRating,
      maxPrice,
      page,
      pageSize,
    });
  }

  // IMPORTANT: /me routes must come BEFORE /:id routes
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my trainer profile' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.trainersService.getMyTrainerProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trainer dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats including clients, revenue, compliance' })
  async getDashboardStats(@CurrentUser() user: User) {
    return this.trainersService.getDashboardStats(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/earnings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings breakdown for a month' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: '0-11 (January = 0)' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getEarningsBreakdown(
    @CurrentUser() user: User,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.trainersService.getEarningsBreakdown(user.id, month, year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/clients')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my clients (for trainers)' })
  async getMyClients(@CurrentUser() user: User) {
    return this.trainersService.getMyClients(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/compliance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client compliance overview' })
  @ApiResponse({ status: 200, description: 'Compliance rates breakdown by client' })
  async getClientCompliance(@CurrentUser() user: User) {
    return this.trainersService.getClientCompliance(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/clients/:clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed information about a specific client' })
  @ApiResponse({ status: 200, description: 'Client details with compliance and stats' })
  async getClientDetails(
    @CurrentUser() user: User,
    @Param('clientId') clientId: string,
  ) {
    return this.trainersService.getClientById(user.id, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/invite-code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a new invite code' })
  async generateInviteCode(@CurrentUser() user: User) {
    return this.trainersService.generateInviteCode(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/invite-link')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invite link' })
  async createInviteLink(
    @CurrentUser() user: User,
    @Body() body: { grantsPremium?: boolean },
  ) {
    return this.trainersService.createInviteLink(user.id, body.grantsPremium);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/invites')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all my invite links' })
  async getMyInvites(@CurrentUser() user: User) {
    return this.trainersService.getMyInvites(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/invites/:inviteId/deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate an invite link' })
  async deactivateInvite(
    @CurrentUser() user: User,
    @Param('inviteId') inviteId: string,
  ) {
    return this.trainersService.deactivateInvite(user.id, inviteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/clients/:clientId/assign-program')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a program to a client' })
  @ApiResponse({ status: 200, description: 'Program assigned successfully' })
  async assignProgramToClient(
    @CurrentUser() user: User,
    @Param('clientId') clientId: string,
    @Body() body: { programId: string },
  ) {
    return this.trainersService.assignProgramToClient(user.id, clientId, body.programId);
  }

  // Public invite endpoints (no auth required)
  @Public()
  @Get('invite/:code')
  @ApiOperation({ summary: 'Verify an invite code' })
  @ApiResponse({ status: 200, description: 'Invite code is valid' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  async verifyInvite(@Param('code') code: string) {
    return this.trainersService.verifyInviteCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite/:code/redeem')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem an invite code' })
  @ApiResponse({ status: 200, description: 'Successfully joined trainer' })
  async redeemInvite(
    @Param('code') code: string,
    @CurrentUser() user: User,
  ) {
    return this.trainersService.redeemInviteCode(code, user.id);
  }

  // Generic :id route must come AFTER all /me routes
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get trainer profile by ID' })
  @CacheKey('get_trainer_')
  @CacheTTL(300)
  async getTrainer(@Param('id') id: string) {
    return this.trainersService.getTrainerById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to become a trainer' })
  async applyAsTrainer(
    @CurrentUser() user: User,
    @Body() data: {
      bio: string;
      specializations: string[];
      yearsExperience: number;
      monthlyPrice: number;
      instagramHandle?: string;
    },
  ) {
    return this.trainersService.applyAsTrainer(user.id, data);
  }
}
