-- Phase 1: Supabase Migration Dry Run
-- This script is for review and not for execution.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('USER', 'TRAINER', 'ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "FitnessGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'IMPROVE_HEALTH', 'INCREASE_STRENGTH', 'IMPROVE_ENDURANCE');
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
CREATE TYPE "EquipmentType" AS ENUM ('NONE', 'BODYWEIGHT', 'DUMBBELLS', 'BARBELL', 'KETTLEBELL', 'CABLES', 'MACHINES', 'RESISTANCE_BANDS', 'TRX', 'PULL_UP_BAR', 'BENCH', 'STABILITY_BALL', 'FOAM_ROLLER', 'JUMP_ROPE', 'TREADMILL', 'BIKE', 'ROWING');

-- Create User table
CREATE TABLE public."User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMPTZ,
    gender "Gender",
    "fitnessGoal" "FitnessGoal",
    "activityLevel" "ActivityLevel",
    "heightCm" REAL,
    "currentWeightKg" REAL,
    "targetWeightKg" REAL,
    "fitnessLevel" "DifficultyLevel" DEFAULT 'BEGINNER',
    role "UserRole" DEFAULT 'USER',
    language TEXT DEFAULT 'en',
    "measurementUnit" TEXT DEFAULT 'metric',
    "notificationsEnabled" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "lastActiveAt" TIMESTAMPTZ DEFAULT now(),
    "onboardingCompletedAt" TIMESTAMPTZ
);

-- Create UserEquipment table
CREATE TABLE public."UserEquipment" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES public."User"(id) ON DELETE CASCADE,
    equipment "EquipmentType",
    UNIQUE("userId", equipment)
);

-- RLS Policies for User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public."User" FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public."User" FOR UPDATE
USING (auth.uid() = id);

-- RLS Policies for UserEquipment table
ALTER TABLE public."UserEquipment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own equipment"
ON public."UserEquipment" FOR SELECT
USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own equipment"
ON public."UserEquipment" FOR INSERT
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own equipment"
ON public."UserEquipment" FOR DELETE
USING (auth.uid() = "userId");

-- Function and Trigger to create a public user profile on new auth.users entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
