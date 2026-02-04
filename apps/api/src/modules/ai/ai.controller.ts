import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@Body() body: { message: string; context?: string }) {
    const response = await this.aiService.callGemini(body.message, {
      systemPrompt: body.context || 'You are a helpful fitness and nutrition assistant.',
      maxTokens: 1024,
    });

    return { response };
  }

  @Post('workout-recommendation')
  @ApiOperation({ summary: 'Get AI workout recommendation' })
  async getWorkoutRecommendation(
    @Body()
    body: {
      fitnessGoal: string;
      fitnessLevel: string;
      equipment: string[];
    },
  ) {
    const recommendation =
      await this.aiService.generateWorkoutRecommendation(body);
    return { recommendation };
  }

  @Post('nutrition-advice')
  @ApiOperation({ summary: 'Get AI nutrition advice' })
  async getNutritionAdvice(
    @Body()
    body: {
      goal: string;
      currentCalories: number;
      currentProtein: number;
    },
  ) {
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
    @Body()
    body: {
      exerciseName: string;
      poseData: { joint: string; angle: number }[];
    },
  ) {
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
