import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { LogWorkoutDto } from './dto/log-workout.dto';

@ApiTags('workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all workout plans for current user' })
  @ApiResponse({ status: 200, description: 'Returns user workout plans' })
  @CacheKey('get_plans_')
  @CacheTTL(300)
  async getPlans(@CurrentUser() user: User) {
    return this.workoutsService.getUserPlans(user.id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a new workout plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async createPlan(
    @CurrentUser() user: User,
    @Body() createPlanDto: CreateWorkoutPlanDto,
  ) {
    return this.workoutsService.createPlan(user.id, createPlanDto);
  }

  @Get('plans/active')
  @ApiOperation({ summary: 'Get active workout plan' })
  @ApiResponse({ status: 200, description: 'Returns active plan or null' })
  @CacheKey('get_active_plan_')
  @CacheTTL(300)
  async getActivePlan(@CurrentUser() user: User) {
    return this.workoutsService.getActivePlan(user.id);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get workout plan by ID' })
  @ApiResponse({ status: 200, description: 'Returns plan details' })
  @CacheKey('get_plan_')
  @CacheTTL(300)
  async getPlan(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workoutsService.getPlanById(id, user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get todays workout based on active plan' })
  @ApiResponse({ status: 200, description: 'Returns todays workout or rest day info' })
  @CacheKey('get_todays_workout_')
  @CacheTTL(300)
  async getTodaysWorkout(@CurrentUser() user: User) {
    return this.workoutsService.getTodaysWorkout(user.id);
  }

  @Post('start/:workoutId')
  @ApiOperation({ summary: 'Start a workout session' })
  @ApiResponse({ status: 201, description: 'Workout started' })
  async startWorkout(
    @CurrentUser() user: User,
    @Param('workoutId') workoutId: string,
  ) {
    return this.workoutsService.startWorkout(user.id, workoutId);
  }

  @Put('logs/:logId/complete')
  @ApiOperation({ summary: 'Complete a workout session' })
  @ApiResponse({ status: 200, description: 'Workout completed' })
  async completeWorkout(
    @CurrentUser() user: User,
    @Param('logId') logId: string,
    @Body() data: { rating?: number; notes?: string },
  ) {
    return this.workoutsService.completeWorkout(user.id, logId, data);
  }

  @Post('logs/:logId/sets')
  @ApiOperation({ summary: 'Log a set for an exercise' })
  @ApiResponse({ status: 201, description: 'Set logged' })
  async logSet(
    @CurrentUser() user: User,
    @Param('logId') logId: string,
    @Body() data: {
      exerciseId: string;
      setNumber: number;
      reps?: number;
      weightKg?: number;
      duration?: number;
      rpe?: number;
    },
  ) {
    return this.workoutsService.logSet(
      user.id,
      logId,
      data.exerciseId,
      {
        setNumber: data.setNumber,
        reps: data.reps,
        weightKg: data.weightKg,
        duration: data.duration,
        rpe: data.rpe,
      },
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get workout history' })
  @ApiResponse({ status: 200, description: 'Returns workout history' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.workoutsService.getWorkoutHistory(user.id, limit || 20);
  }

  @Post('log')
  @ApiOperation({ summary: 'Log a manual workout session' })
  @ApiResponse({ status: 201, description: 'Workout logged successfully' })
  async logManualWorkout(
    @CurrentUser() user: User,
    @Body() logWorkoutDto: LogWorkoutDto,
  ) {
    return this.workoutsService.logManualWorkout(user.id, logWorkoutDto);
  }
}
