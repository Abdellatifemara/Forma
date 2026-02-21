import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { SubscriptionTier } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @IsOptional()
  @IsString()
  billingCycle?: 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;

  @IsOptional()
  @IsString()
  billingCycle?: 'monthly' | 'yearly';
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  immediate?: boolean;
}

export class GiftSubscriptionDto {
  @IsString()
  recipientEmail: string;

  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @IsOptional()
  @IsString()
  billingCycle?: 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  message?: string;
}

// Pricing configuration (matches frontend)
export const SUBSCRIPTION_PRICING = {
  FREE: {
    monthly: 0,
    yearly: 0,
  },
  PREMIUM: {
    monthly: 299,
    yearly: 2990, // ~10 months (2 months free)
  },
  PREMIUM_PLUS: {
    monthly: 999,
    yearly: 9990, // ~10 months (2 months free)
  },
} as const;

// Feature limits per tier
export const FEATURE_LIMITS = {
  FREE: {
    ai_coach_basic: 3,
    food_logging: 3,
    progress_photos: 2,
    custom_workouts: 0,
  },
  PREMIUM: {
    ai_coach_basic: 10,
    food_logging: Infinity,
    progress_photos: Infinity,
    custom_workouts: 10,
    form_checker: 0,
  },
  PREMIUM_PLUS: {
    ai_coach_basic: Infinity,
    food_logging: Infinity,
    progress_photos: Infinity,
    custom_workouts: Infinity,
    form_checker: Infinity,
    video_consultations: 2,
    form_video_reviews: 10,
  },
} as const;
