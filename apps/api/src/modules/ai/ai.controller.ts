import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiRateLimitService } from './ai-rate-limit.service';
import { ChatPipelineService } from './chat-pipeline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Throttle({ short: { limit: 3, ttl: 10000 }, medium: { limit: 15, ttl: 60000 } })
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rateLimitService: AiRateLimitService,
    private readonly chatPipeline: ChatPipelineService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Smart chat with AI coach (pipeline)' })
  async chat(
    @CurrentUser() user: User,
    @Body() body: {
      message: string;
      context?: string;
      language?: 'en' | 'ar';
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ) {
    // Rate limit check (local/faq/food responses are free but still counted for analytics)
    await this.rateLimitService.checkAndIncrement(user.id);

    const result = await this.chatPipeline.processMessage({
      userId: user.id,
      message: body.message,
      language: body.language || (user.language === 'ar' ? 'ar' : 'en'),
      conversationHistory: body.conversationHistory,
    });

    return result;
  }

  @Get('chat/usage')
  @ApiOperation({ summary: 'Get AI chat usage stats for current user' })
  async getChatUsage(@CurrentUser() user: User) {
    return this.chatPipeline.getUsageStats(user.id);
  }

  @Post('workout-recommendation')
  @ApiOperation({ summary: 'Get AI workout recommendation' })
  async getWorkoutRecommendation(
    @CurrentUser() user: User,
    @Body()
    body: {
      fitnessGoal: string;
      fitnessLevel: string;
      equipment: string[];
    },
  ) {
    await this.rateLimitService.checkAndIncrement(user.id);

    const recommendation =
      await this.aiService.generateWorkoutRecommendation(body);
    return { recommendation };
  }

  @Post('nutrition-advice')
  @ApiOperation({ summary: 'Get AI nutrition advice' })
  async getNutritionAdvice(
    @CurrentUser() user: User,
    @Body()
    body: {
      goal: string;
      currentCalories: number;
      currentProtein: number;
    },
  ) {
    await this.rateLimitService.checkAndIncrement(user.id);

    const advice = await this.aiService.generateNutritionAdvice(body.goal, {
      calories: body.currentCalories,
      protein: body.currentProtein,
    });
    return { advice };
  }

  @Post('generate-plan')
  @ApiOperation({ summary: 'Generate a complete AI workout plan' })
  async generateWorkoutPlan(
    @CurrentUser() user: User,
    @Body()
    body: {
      goal: string;
      fitnessLevel: string;
      daysPerWeek: number;
      durationWeeks: number;
      availableEquipment: string[];
      injuries: string[];
      workoutDuration: number;
      isRamadan?: boolean;
    },
  ) {
    await this.rateLimitService.checkAndIncrement(user.id);

    const plan = await this.aiService.generateWorkoutPlan({
      goal: body.goal,
      fitnessLevel: body.fitnessLevel,
      daysPerWeek: body.daysPerWeek,
      durationWeeks: body.durationWeeks,
      availableEquipment: body.availableEquipment,
      injuries: body.injuries,
      workoutDuration: body.workoutDuration,
      preferences: {
        isRamadan: body.isRamadan,
      },
    });
    return { plan };
  }

  @Post('analyze-form')
  @ApiOperation({ summary: 'Analyze exercise form from pose data' })
  async analyzeForm(
    @CurrentUser() user: User,
    @Body()
    body: {
      exerciseName: string;
      poseData: { joint: string; angle: number }[];
    },
  ) {
    await this.rateLimitService.checkAndIncrement(user.id);

    const analysis = await this.aiService.analyzeExerciseForm(body);
    return analysis;
  }

  @Post('motivate')
  @ApiOperation({ summary: 'Get personalized motivational message' })
  async getMotivation(
    @CurrentUser() user: User,
    @Body()
    body: {
      streakDays: number;
      recentWorkouts: number;
      goalProgress: number;
      language: 'en' | 'ar';
    },
  ) {
    await this.rateLimitService.checkAndIncrement(user.id);

    const result = await this.aiService.generateMotivationalMessage({
      userName: user.firstName,
      streakDays: body.streakDays,
      recentWorkouts: body.recentWorkouts,
      goalProgress: body.goalProgress,
      language: body.language,
    });
    return result;
  }

  @Post('churn-risk')
  @ApiOperation({ summary: 'Predict user churn risk and get interventions' })
  async predictChurnRisk(
    @CurrentUser() user: User,
    @Body()
    body: {
      daysSinceLastWorkout: number;
      averageWeeklyWorkouts: number;
      currentWeekWorkouts: number;
      streakBroken: boolean;
      membershipDays: number;
    },
  ) {
    const result = await this.aiService.predictChurnRisk(body);
    return result;
  }
}
