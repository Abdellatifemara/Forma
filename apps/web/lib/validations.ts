import { z } from 'zod';

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User Profile Validations
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const onboardingSchema = z.object({
  goal: z.enum(['lose-weight', 'build-muscle', 'get-stronger', 'improve-health', 'increase-endurance']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  weight: z.number().min(30).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
  targetWeight: z.number().min(30).max(300).optional(),
  activityLevel: z.number().min(1.2).max(1.9).optional(),
});

// Workout Validations
export const workoutLogSchema = z.object({
  workoutId: z.string().uuid(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      sets: z.array(
        z.object({
          reps: z.number().min(1).max(100),
          weight: z.number().min(0).max(500),
          rpe: z.number().min(1).max(10).optional(),
        })
      ),
    })
  ),
  duration: z.number().min(1).max(300),
  notes: z.string().max(1000).optional(),
});

// Nutrition Validations
export const mealLogSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(
    z.object({
      foodId: z.string().uuid(),
      servings: z.number().min(0.1).max(10),
    })
  ),
  date: z.string().optional(),
});

export const foodSearchSchema = z.object({
  query: z.string().min(2).max(100),
});

// Progress Validations
export const weightLogSchema = z.object({
  weight: z.number().min(30).max(300),
  date: z.string().optional(),
});

export const measurementsSchema = z.object({
  weight: z.number().min(30).max(300).optional(),
  bodyFat: z.number().min(1).max(60).optional(),
  chest: z.number().min(50).max(200).optional(),
  waist: z.number().min(40).max(200).optional(),
  hips: z.number().min(50).max(200).optional(),
  arms: z.number().min(15).max(60).optional(),
  thighs: z.number().min(30).max(100).optional(),
});

// Trainer Validations
export const trainerApplicationSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must be less than 1000 characters'),
  specializations: z
    .array(z.string())
    .min(1, 'Select at least one specialization')
    .max(5, 'Maximum 5 specializations'),
  certifications: z
    .array(z.string())
    .min(1, 'Add at least one certification'),
  experience: z.number().min(1).max(50),
  hourlyRate: z.number().min(50).max(1000),
});

// Contact Form
export const contactSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  subject: z.string().min(5).max(100),
  message: z.string().min(10).max(2000),
});

// Types from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type MealLogInput = z.infer<typeof mealLogSchema>;
export type WeightLogInput = z.infer<typeof weightLogSchema>;
export type MeasurementsInput = z.infer<typeof measurementsSchema>;
export type TrainerApplicationInput = z.infer<typeof trainerApplicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
