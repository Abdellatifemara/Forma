import { Controller, Get, Post, Param, Query, Body, UseGuards, CacheKey, CacheTTL } from '@nestjs/common';
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

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get trainer profile by ID' })
  @CacheKey('get_trainer_')
  @CacheTTL(300)
  async getTrainer(@Param('id') id: string) {
    return this.trainersService.getTrainerById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my trainer profile' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.trainersService.getMyTrainerProfile(user.id);
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

  @UseGuards(JwtAuthGuard)
  @Get('me/clients')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my clients (for trainers)' })
  async getMyClients(@CurrentUser() user: User) {
    return this.trainersService.getMyClients(user.id);
  }
}
