import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { WorkoutGeneratorService, DurationType, EnergyLevel, LocationType } from './workout-generator.service';
import { AchievementsService } from '../achievements/achievements.service';
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
  constructor(
    private readonly workoutsService: WorkoutsService,
    private readonly workoutGenerator: WorkoutGeneratorService,
    private readonly achievementsService: AchievementsService,
  ) {}

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

  @Post('plans/:id/activate')
  @ApiOperation({ summary: 'Activate a workout plan' })
  @ApiResponse({ status: 200, description: 'Plan activated successfully' })
  async activatePlan(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workoutsService.activatePlan(user.id, id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get todays workout based on active plan' })
  @ApiResponse({ status: 200, description: 'Returns todays workout or rest day info' })
  @CacheKey('get_todays_workout_')
  @CacheTTL(300)
  async getTodaysWorkout(@CurrentUser() user: User) {
    return this.workoutsService.getTodaysWorkout(user.id);
  }

  @Post('what-now')
  @ApiOperation({ summary: 'Get smart workout recommendation based on user state and history (V2 — research-based engine)' })
  @ApiResponse({ status: 200, description: 'Returns personalized workout recommendation with full structure' })
  async getWhatNow(
    @CurrentUser() user: User,
    @Body() input: {
      availableMinutes?: number;
      energyLevel?: 'low' | 'medium' | 'high';
      location?: 'gym' | 'home' | 'home_gym' | 'outdoor' | 'hotel';
    },
  ) {
    try {
      const profile = await this.workoutGenerator.loadUserProfile(user.id);
      const recentMuscles = await this.workoutGenerator.getRecentMusclesWorked(user.id);
      const now = new Date();

      const generated = await this.workoutGenerator.generateWorkout(profile, {
        location: (input.location || 'gym') as LocationType,
        availableMinutes: (input.availableMinutes || 30) as DurationType,
        energyLevel: (input.energyLevel || 'medium') as EnergyLevel,
        dayOfWeek: now.getDay() || 7,
        recentMusclesWorked: recentMuscles,
        weekNumber: Math.ceil((now.getDate()) / 7),
      });

      return generated;
    } catch (err) {
      // Fallback to legacy engine if new one fails
      return this.workoutsService.getWhatNow(user.id, {
        availableMinutes: input.availableMinutes,
        energyLevel: input.energyLevel as any,
        location: input.location as any,
      });
    }
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a complete workout plan using the research-based engine' })
  @ApiResponse({ status: 201, description: 'Returns a fully structured workout with warmup, exercises, cooldown, and progression' })
  async generateWorkout(
    @CurrentUser() user: User,
    @Body() input: {
      availableMinutes?: number;
      energyLevel?: 'low' | 'medium' | 'high';
      location?: 'gym' | 'home' | 'home_gym' | 'outdoor' | 'hotel';
      weekNumber?: number;
      // Chat flow params: split override + exercise count
      split?: string;
      exerciseCount?: number;
    },
  ) {
    const profile = await this.workoutGenerator.loadUserProfile(user.id);
    const recentMuscles = await this.workoutGenerator.getRecentMusclesWorked(user.id);
    const now = new Date();

    // Map exercise count to approximate duration if no explicit duration
    let duration = input.availableMinutes;
    if (!duration && input.exerciseCount) {
      if (input.exerciseCount <= 5) duration = 30;
      else if (input.exerciseCount <= 8) duration = 45;
      else duration = 60;
    }

    return this.workoutGenerator.generateWorkout(profile, {
      location: (input.location || 'gym') as LocationType,
      availableMinutes: (duration || 45) as DurationType,
      energyLevel: (input.energyLevel || 'medium') as EnergyLevel,
      dayOfWeek: now.getDay() || 7,
      recentMusclesWorked: recentMuscles,
      weekNumber: input.weekNumber || Math.ceil((now.getDate()) / 7),
      targetSplit: input.split,
      maxExercises: input.exerciseCount ? Number(input.exerciseCount) : undefined,
    });
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
    const result = await this.workoutsService.completeWorkout(user.id, logId, data);
    // Check achievements in background (don't await to keep response fast)
    this.achievementsService.checkAndUpdateAchievements(user.id).catch(() => {});
    return result;
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
    @Query('limit') limitStr?: string,
    @Query('page') pageStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const logs = await this.workoutsService.getWorkoutHistory(user.id, limit);

    // Return in format expected by frontend
    return {
      data: logs,
      meta: {
        total: logs.length,
        page,
        limit,
      },
    };
  }

  @Post('log')
  @ApiOperation({ summary: 'Log a manual workout session' })
  @ApiResponse({ status: 201, description: 'Workout logged successfully' })
  async logManualWorkout(
    @CurrentUser() user: User,
    @Body() logWorkoutDto: LogWorkoutDto,
  ) {
    const result = await this.workoutsService.logManualWorkout(user.id, logWorkoutDto);
    // Check achievements in background
    this.achievementsService.checkAndUpdateAchievements(user.id).catch(() => {});
    return result;
  }
}
