import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { WorkoutGeneratorService, DurationType, EnergyLevel, LocationType, GeneratedWorkout } from './workout-generator.service';
import { AchievementsService } from '../achievements/achievements.service';
import { AiService } from '../ai/ai.service';
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
    private readonly aiService: AiService,
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

  @Post('generate-program')
  @ApiOperation({ summary: 'Generate a complete 4-week personalized program' })
  @ApiResponse({ status: 201, description: 'Returns a 4-week program with all sessions' })
  async generateProgram(
    @CurrentUser() user: User,
    @Body() input: {
      daysPerWeek?: number;
      minutesPerSession?: number;
      location?: 'gym' | 'home' | 'home_gym' | 'outdoor' | 'hotel';
      programName?: string;
      programNameAr?: string;
    },
  ) {
    const profile = await this.workoutGenerator.loadUserProfile(user.id);
    const days = Math.min(Math.max(input.daysPerWeek || 4, 3), 6);
    const minutes = input.minutesPerSession || 45;

    return this.workoutGenerator.generateProgram(profile, {
      daysPerWeek: days,
      minutesPerSession: minutes as any,
      location: (input.location || 'gym') as any,
      programName: input.programName,
      programNameAr: input.programNameAr,
    });
  }

  @Post('generate-premium')
  @ApiOperation({ summary: 'Premium+ AI-enhanced workout — offline engine + thin GPT review pass' })
  @ApiResponse({ status: 201, description: 'Returns workout with AI coaching notes and exercise swaps' })
  async generatePremiumWorkout(
    @CurrentUser() user: User,
    @Body() input: {
      availableMinutes?: number;
      energyLevel?: 'low' | 'medium' | 'high';
      location?: 'gym' | 'home' | 'home_gym' | 'outdoor' | 'hotel';
      goal?: string;
      split?: string;
      weekNumber?: number;
    },
  ) {
    // Step 1: Run offline engine (same as /generate)
    const profile = await this.workoutGenerator.loadUserProfile(user.id);
    const recentMuscles = await this.workoutGenerator.getRecentMusclesWorked(user.id);
    const now = new Date();
    const duration = input.availableMinutes || 45;

    const workout = await this.workoutGenerator.generateWorkout(profile, {
      location: (input.location || 'gym') as LocationType,
      availableMinutes: (duration || 45) as DurationType,
      energyLevel: (input.energyLevel || 'medium') as EnergyLevel,
      dayOfWeek: now.getDay() || 7,
      recentMusclesWorked: recentMuscles,
      weekNumber: input.weekNumber || Math.ceil((now.getDate()) / 7),
      targetSplit: input.split,
    });

    // Step 2: If workout is rest/recovery, skip AI
    if (workout.type === 'rest' || workout.type === 'active_recovery') {
      return workout;
    }

    // Step 3: Compress workout into tight AI query
    // Format: M28/92kg/178cm/24bf/endo/inter|goal:BUILD_MUSCLE|phase:volume
    // |exercises:BenchPress(4x12-10-8-6),InclineDumbbell(3x10),CableFly(3x12)
    // |injuries:SHOULDER_MILD|supps:creatine+preworkout|readiness:72/yellow-green
    try {
      const compressedProfile = [
        `${profile.gender === 'MALE' ? 'M' : 'F'}${profile.age}/${Math.round(profile.weightKg)}kg/${Math.round(profile.heightCm)}cm`,
        profile.bodyFatPercent ? `${Math.round(profile.bodyFatPercent)}bf` : '',
        profile.bodyType?.toLowerCase() || '',
        workout.modifiers?.effectiveLevel || profile.experienceLevel.toLowerCase(),
      ].filter(Boolean).join('/');

      const compressedExercises = workout.workingSets
        .map(ex => `${ex.name}(${ex.sets}x${ex.reps})`)
        .join(',');

      const compressedInjuries = profile.injuryData
        .filter(i => i.isCurrentlyActive)
        .map(i => `${i.bodyPart}_${i.severity}`)
        .join(',');

      const compressedSupps = [
        profile.supplements.takesCreatine ? 'creatine' : '',
        profile.supplements.takesPreWorkout ? 'preworkout' : '',
        profile.supplements.takesBetaAlanine ? 'beta-alanine' : '',
      ].filter(Boolean).join('+');

      const aiPrompt = [
        `User: ${compressedProfile}`,
        `Goal: ${profile.fitnessGoal}`,
        `Phase: ${workout.periodizationPhase}`,
        `Split: ${workout.splitType} targeting ${workout.targetMuscles.join(',')}`,
        `Exercises: ${compressedExercises}`,
        compressedInjuries ? `Injuries: ${compressedInjuries}` : '',
        compressedSupps ? `Supplements: ${compressedSupps}` : '',
        `Readiness: ${workout.readinessScore}/100`,
        `Duration: ${workout.durationMinutes}min at ${input.location || 'gym'}`,
      ].filter(Boolean).join('|');

      const aiResponse = await this.aiService.callOpenAI(aiPrompt, {
        systemPrompt: `You are Forma's elite fitness coach. Review this workout and provide BRIEF coaching notes in JSON format ONLY.
Return EXACTLY this JSON structure (no markdown, no explanation):
{"coachingNotes":"1-2 sentences of personalized advice","coachingNotesAr":"same in Egyptian Arabic","swapSuggestions":[{"exercise":"name","swapFor":"alternative","reason":"why"}],"intensityTip":"one technique tip for today"}
Rules: max 100 tokens. Temperature 0. Be specific to THIS user's data. If workout is already optimal, say so briefly.`,
        maxTokens: 150,
        temperature: 0,
      });

      // Parse AI response
      try {
        const parsed = JSON.parse(aiResponse.trim());
        return {
          ...workout,
          aiCoachingNotes: parsed.coachingNotes,
          aiCoachingNotesAr: parsed.coachingNotesAr,
          aiSwapSuggestions: parsed.swapSuggestions,
          aiIntensityTip: parsed.intensityTip,
          aiEnhanced: true,
        };
      } catch {
        // AI response wasn't valid JSON — return workout without AI notes
        return { ...workout, aiEnhanced: false, aiRawNote: aiResponse };
      }
    } catch {
      // AI call failed — return offline workout as-is
      return { ...workout, aiEnhanced: false };
    }
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
