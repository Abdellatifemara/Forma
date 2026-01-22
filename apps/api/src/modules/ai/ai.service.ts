import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
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
  private readonly geminiApiKey: string;
  private readonly geminiModel = 'gemini-1.5-flash';

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelayMs: 1000,
    maxDelayMs: 32000,
    backoffMultiplier: 2,
  };

  constructor(private readonly configService: ConfigService) {
    this.geminiApiKey = this.configService.get('GEMINI_API_KEY') || '';
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
   * Call Gemini API with exponential backoff
   */
  async callGemini(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      retryConfig?: Partial<RetryConfig>;
    },
  ): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const config = { ...this.defaultRetryConfig, ...options?.retryConfig };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

        const body = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 2048,
            temperature: options?.temperature || 0.7,
          },
          ...(options?.systemPrompt && {
            systemInstruction: {
              parts: [{ text: options.systemPrompt }],
            },
          }),
        };

        this.logger.debug(
          `Gemini API call attempt ${attempt + 1}/${config.maxRetries + 1}`,
        );

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        // Parse response
        const data: GeminiResponse = await response.json();

        // Check for API errors
        if (!response.ok || data.error) {
          const errorCode = data.error?.code || response.status;
          const errorMessage =
            data.error?.message || `HTTP ${response.status}`;

          this.logger.warn(
            `Gemini API error (attempt ${attempt + 1}): ${errorCode} - ${errorMessage}`,
          );

          // Check if retryable
          if (this.isRetryableError(response.status, data.error?.code)) {
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
          throw new Error(`Gemini API error: ${errorCode} - ${errorMessage}`);
        }

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        this.logger.debug(`Gemini API success on attempt ${attempt + 1}`);
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
      `Gemini API failed after ${config.maxRetries + 1} attempts`,
    );
    throw lastError || new Error('Gemini API failed after all retries');
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
}
