import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Simple in-memory cache for AI responses
const aiCache = new Map<string, { data: string; expiry: number }>();
const AI_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface OpenAIResponse {
  id?: string;
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string;
  private readonly openaiModel = 'gpt-4o-mini'; // Cost-effective, fast model

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelayMs: 1000,
    maxDelayMs: 32000,
    backoffMultiplier: 2,
  };

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY') || '';
  }

  /**
   * Get cached AI response
   */
  private getCached(key: string): string | null {
    const cached = aiCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      this.logger.debug(`AI cache hit: ${key.slice(0, 50)}...`);
      return cached.data;
    }
    aiCache.delete(key);
    return null;
  }

  /**
   * Cache AI response
   */
  private setCache(key: string, data: string): void {
    if (aiCache.size > 200) {
      const firstKey = aiCache.keys().next().value;
      if (firstKey) aiCache.delete(firstKey);
    }
    aiCache.set(key, { data, expiry: Date.now() + AI_CACHE_TTL });
  }

  /**
   * Calculate delay with exponential backoff + jitter
   */
  private calculateBackoffDelay(
    attempt: number,
    config: RetryConfig,
  ): number {
    // Exponential backoff: baseDelay * (multiplier ^ attempt)
    const exponentialDelay =
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);

    // Cap at maxDelay
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

    // Add jitter (±25%) to prevent thundering herd
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(statusCode: number, errorCode?: number): boolean {
    // Retry on:
    // - 429: Rate limit / quota exceeded
    // - 500: Internal server error
    // - 502: Bad gateway
    // - 503: Service unavailable
    // - 504: Gateway timeout
    const retryableCodes = [429, 500, 502, 503, 504];
    return retryableCodes.includes(statusCode) || retryableCodes.includes(errorCode || 0);
  }

  /**
   * Call OpenAI API with exponential backoff
   */
  async callOpenAI(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      retryConfig?: Partial<RetryConfig>;
    },
  ): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const config = { ...this.defaultRetryConfig, ...options?.retryConfig };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const url = 'https://api.openai.com/v1/chat/completions';

        const messages = [];

        // Add system message if provided
        if (options?.systemPrompt) {
          messages.push({
            role: 'system',
            content: options.systemPrompt,
          });
        }

        // Add user message
        messages.push({
          role: 'user',
          content: prompt,
        });

        const body = {
          model: this.openaiModel,
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7,
        };

        this.logger.debug(
          `OpenAI API call attempt ${attempt + 1}/${config.maxRetries + 1}`,
        );

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify(body),
        });

        // Parse response
        const data: OpenAIResponse = await response.json();

        // Check for API errors
        if (!response.ok || data.error) {
          const errorCode = data.error?.code || response.status.toString();
          const errorMessage =
            data.error?.message || `HTTP ${response.status}`;

          this.logger.warn(
            `OpenAI API error (attempt ${attempt + 1}): ${errorCode} - ${errorMessage}`,
          );

          // Check if retryable
          if (this.isRetryableError(response.status)) {
            if (attempt < config.maxRetries) {
              const delay = this.calculateBackoffDelay(attempt, config);
              this.logger.log(
                `Retrying in ${delay}ms (attempt ${attempt + 2}/${config.maxRetries + 1})`,
              );
              await this.sleep(delay);
              continue;
            }
          }

          // Non-retryable or exhausted retries
          throw new Error(`OpenAI API error: ${errorCode} - ${errorMessage}`);
        }

        // Extract text from response
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error('Empty response from OpenAI');
        }

        this.logger.debug(`OpenAI API success on attempt ${attempt + 1}`);
        return text;
      } catch (error) {
        lastError = error as Error;

        // Network errors are retryable
        if (
          error instanceof TypeError &&
          error.message.includes('fetch')
        ) {
          this.logger.warn(
            `Network error (attempt ${attempt + 1}): ${error.message}`,
          );

          if (attempt < config.maxRetries) {
            const delay = this.calculateBackoffDelay(attempt, config);
            this.logger.log(`Retrying in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }
        }

        // If it's not a network error and we're here, rethrow
        if (
          !(error instanceof TypeError) ||
          !error.message.includes('fetch')
        ) {
          throw error;
        }
      }
    }

    // Exhausted all retries
    this.logger.error(
      `OpenAI API failed after ${config.maxRetries + 1} attempts`,
    );
    throw lastError || new Error('OpenAI API failed after all retries');
  }

  // Alias for backwards compatibility
  async callGemini(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      retryConfig?: Partial<RetryConfig>;
    },
  ): Promise<string> {
    return this.callOpenAI(prompt, options);
  }

  /**
   * Generate workout recommendation
   */
  async generateWorkoutRecommendation(
    userProfile: {
      fitnessGoal: string;
      fitnessLevel: string;
      equipment: string[];
    },
  ): Promise<string> {
    const prompt = `
Generate a workout recommendation for a user with:
- Fitness Goal: ${userProfile.fitnessGoal}
- Fitness Level: ${userProfile.fitnessLevel}
- Available Equipment: ${userProfile.equipment.join(', ') || 'bodyweight only'}

Provide a brief 3-5 sentence recommendation.
`;

    return this.callGemini(prompt, {
      systemPrompt:
        'You are a professional fitness coach. Be concise and encouraging.',
      maxTokens: 500,
    });
  }

  /**
   * Generate nutrition advice
   */
  async generateNutritionAdvice(
    userGoal: string,
    currentIntake: { calories: number; protein: number },
  ): Promise<string> {
    const prompt = `
User Goal: ${userGoal}
Current Daily Intake: ${currentIntake.calories} kcal, ${currentIntake.protein}g protein

Give brief nutrition advice (3-5 sentences).
`;

    return this.callGemini(prompt, {
      systemPrompt:
        'You are a registered dietitian. Focus on practical, actionable advice.',
      maxTokens: 500,
    });
  }

  /**
   * Generate a complete workout plan using AI
   */
  async generateWorkoutPlan(params: {
    goal: string;
    fitnessLevel: string;
    daysPerWeek: number;
    durationWeeks: number;
    availableEquipment: string[];
    injuries: string[];
    workoutDuration: number; // minutes
    preferences?: {
      isRamadan?: boolean;
      preferredTime?: string;
    };
  }): Promise<GeneratedWorkoutPlan> {
    const equipmentList = params.availableEquipment.length > 0
      ? params.availableEquipment.join(', ')
      : 'bodyweight only';

    const injuryInfo = params.injuries.length > 0
      ? `User has injuries/limitations: ${params.injuries.join(', ')}. AVOID exercises that stress these areas.`
      : 'No injuries reported.';

    const ramadanInfo = params.preferences?.isRamadan
      ? 'User is fasting for Ramadan. Keep workouts moderate intensity and shorter duration during fasting hours.'
      : '';

    const prompt = `
Create a ${params.durationWeeks}-week workout plan with the following requirements:

USER PROFILE:
- Goal: ${params.goal}
- Fitness Level: ${params.fitnessLevel}
- Days per Week: ${params.daysPerWeek}
- Workout Duration: ${params.workoutDuration} minutes per session
- Available Equipment: ${equipmentList}
${injuryInfo}
${ramadanInfo}

REQUIREMENTS:
1. Design ${params.daysPerWeek} unique workout days per week
2. Include progressive overload (increase difficulty over weeks)
3. Balance muscle groups across the week
4. Include warm-up and cool-down suggestions
5. Each exercise should have: name, sets, reps/duration, rest time

RESPOND IN THIS EXACT JSON FORMAT:
{
  "planName": "string",
  "planNameAr": "string (Arabic translation)",
  "description": "string (1-2 sentences)",
  "descriptionAr": "string (Arabic translation)",
  "weeklySchedule": [
    {
      "dayOfWeek": 1,
      "workoutName": "string",
      "workoutNameAr": "string",
      "focusMuscles": ["string"],
      "estimatedDuration": number,
      "exercises": [
        {
          "name": "string",
          "nameAr": "string",
          "sets": number,
          "reps": "string (e.g., '10-12' or '30 sec')",
          "restSeconds": number,
          "notes": "string (optional tips)"
        }
      ]
    }
  ],
  "progressionNotes": "string (how to progress over weeks)",
  "nutritionTips": "string (relevant to goal)"
}

Only respond with valid JSON, no markdown or explanations.
`;

    const response = await this.callGemini(prompt, {
      systemPrompt: `You are an expert personal trainer and exercise physiologist.
Create safe, effective workout plans tailored to individual needs.
Always consider injuries and limitations.
Respond only with valid JSON.`,
      maxTokens: 4000,
      temperature: 0.5, // Lower for more consistent output
    });

    // Parse JSON response
    try {
      // Clean the response (remove markdown if present)
      let cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const plan = JSON.parse(cleanedResponse) as GeneratedWorkoutPlan;
      return plan;
    } catch (error) {
      this.logger.error('Failed to parse AI workout plan:', error);
      this.logger.debug('Raw response:', response);
      throw new Error('Failed to generate workout plan. Please try again.');
    }
  }

  /**
   * Generate AI-powered form correction feedback
   */
  async analyzeExerciseForm(params: {
    exerciseName: string;
    poseData: { joint: string; angle: number }[];
  }): Promise<FormAnalysisResult> {
    const prompt = `
Analyze the form for: ${params.exerciseName}

Joint angles detected:
${params.poseData.map(p => `- ${p.joint}: ${p.angle}°`).join('\n')}

Provide feedback in this JSON format:
{
  "overallScore": number (0-100),
  "feedback": [
    {
      "area": "string (body part)",
      "issue": "string (what's wrong)",
      "correction": "string (how to fix)",
      "severity": "info" | "warning" | "error"
    }
  ],
  "tips": ["string"]
}

Only respond with valid JSON.
`;

    const response = await this.callGemini(prompt, {
      systemPrompt: 'You are a biomechanics expert. Analyze exercise form and provide actionable corrections.',
      maxTokens: 1000,
    });

    try {
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      this.logger.error('Failed to parse form analysis:', error);
      throw new Error('Failed to analyze form');
    }
  }

  /**
   * Generate motivational message based on user's progress
   */
  async generateMotivationalMessage(params: {
    userName: string;
    streakDays: number;
    recentWorkouts: number;
    goalProgress: number; // percentage
    language: 'en' | 'ar';
  }): Promise<{ message: string }> {
    const languageInstruction = params.language === 'ar'
      ? 'Respond in Arabic only.'
      : 'Respond in English only.';

    const prompt = `
Generate a short, personalized motivational message for:
- Name: ${params.userName}
- Current Streak: ${params.streakDays} days
- Workouts this week: ${params.recentWorkouts}
- Progress towards goal: ${params.goalProgress}%

${languageInstruction}
Keep it 1-2 sentences. Be specific and encouraging.
`;

    const message = await this.callGemini(prompt, {
      systemPrompt: 'You are an encouraging fitness coach. Be genuine and specific.',
      maxTokens: 150,
    });

    return { message: message.trim() };
  }

  /**
   * Predict if user is about to quit based on activity patterns
   */
  async predictChurnRisk(params: {
    daysSinceLastWorkout: number;
    averageWeeklyWorkouts: number;
    currentWeekWorkouts: number;
    streakBroken: boolean;
    membershipDays: number;
  }): Promise<{ riskLevel: 'low' | 'medium' | 'high'; interventions: string[] }> {
    // Simple rule-based prediction (can be enhanced with ML later)
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const interventions: string[] = [];

    // High risk indicators
    if (params.daysSinceLastWorkout > 7) {
      riskLevel = 'high';
      interventions.push('Send "We miss you" push notification');
      interventions.push('Offer a quick 10-minute comeback workout');
    } else if (params.daysSinceLastWorkout > 4 || params.streakBroken) {
      riskLevel = 'medium';
      interventions.push('Send streak recovery challenge');
    }

    // Low activity this week
    if (params.currentWeekWorkouts < params.averageWeeklyWorkouts * 0.5) {
      if (riskLevel === 'low') riskLevel = 'medium';
      interventions.push('Send workout reminder');
      interventions.push('Suggest squad/group workout');
    }

    // New user special handling
    if (params.membershipDays < 14 && params.daysSinceLastWorkout > 2) {
      riskLevel = 'high';
      interventions.push('Send onboarding check-in message');
      interventions.push('Offer free coaching session');
    }

    return { riskLevel, interventions };
  }
}

// Type definitions (exported for controller use)
export interface GeneratedWorkoutPlan {
  planName: string;
  planNameAr: string;
  description: string;
  descriptionAr: string;
  weeklySchedule: {
    dayOfWeek: number;
    workoutName: string;
    workoutNameAr: string;
    focusMuscles: string[];
    estimatedDuration: number;
    exercises: {
      name: string;
      nameAr: string;
      sets: number;
      reps: string;
      restSeconds: number;
      notes?: string;
    }[];
  }[];
  progressionNotes: string;
  nutritionTips: string;
}

export interface FormAnalysisResult {
  overallScore: number;
  feedback: {
    area: string;
    issue: string;
    correction: string;
    severity: 'info' | 'warning' | 'error';
  }[];
  tips: string[];
}
