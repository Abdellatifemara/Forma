import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
