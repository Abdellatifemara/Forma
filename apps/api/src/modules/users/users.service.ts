import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        equipment: true,
        subscription: true,
        aiPreferences: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { appleId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateOnboarding(id: string, dto: UpdateOnboardingDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        fitnessGoal: dto.fitnessGoal,
        activityLevel: dto.activityLevel,
        heightCm: dto.heightCm,
        currentWeightKg: dto.currentWeightKg,
        targetWeightKg: dto.targetWeightKg,
        fitnessLevel: dto.fitnessLevel,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        onboardingCompletedAt: new Date(),
      },
    });

    // Update equipment if provided
    if (dto.equipment && dto.equipment.length > 0) {
      // Remove existing equipment
      await this.prisma.userEquipment.deleteMany({
        where: { userId: id },
      });

      // Add new equipment
      await this.prisma.userEquipment.createMany({
        data: dto.equipment.map((equip) => ({
          userId: id,
          equipment: equip,
        })),
      });
    }

    // Create or update AI preferences
    if (dto.aiPreferences) {
      await this.prisma.userAIPreference.upsert({
        where: { userId: id },
        update: dto.aiPreferences,
        create: {
          userId: id,
          ...dto.aiPreferences,
        },
      });
    }

    return updatedUser;
  }

  async updateLastActive(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get workout stats
    const workoutStats = await this.prisma.workoutLog.aggregate({
      where: { userId: id, status: 'COMPLETED' },
      _count: true,
      _sum: {
        totalVolume: true,
        caloriesBurned: true,
      },
    });

    // Get streak
    const streak = await this.prisma.streak.findUnique({
      where: {
        userId_type: {
          userId: id,
          type: 'workout',
        },
      },
    });

    // Get latest progress
    const latestProgress = await this.prisma.progressLog.findFirst({
      where: { userId: id },
      orderBy: { loggedAt: 'desc' },
    });

    return {
      workoutsCompleted: workoutStats._count,
      totalVolumeKg: workoutStats._sum.totalVolume || 0,
      totalCaloriesBurned: workoutStats._sum.caloriesBurned || 0,
      currentStreak: streak?.currentCount || 0,
      longestStreak: streak?.longestCount || 0,
      currentWeightKg: latestProgress?.weightKg || user.currentWeightKg,
      targetWeightKg: user.targetWeightKg,
    };
  }

  /**
   * Check if a user can see the trainer marketplace.
   * Clients of Trusted Partner trainers cannot see the marketplace.
   */
  async canSeeMarketplace(userId: string): Promise<{ canSeeMarketplace: boolean; reason?: string }> {
    // Check if user is a client of any trainer
    const clientRelations = await this.prisma.trainerClient.findMany({
      where: {
        clientId: userId,
        isActive: true,
      },
      select: {
        canSeeMarketplace: true,
        trainer: {
          select: {
            tier: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // If no trainer relations, user can see marketplace
    if (clientRelations.length === 0) {
      return { canSeeMarketplace: true };
    }

    // Check if any relation blocks marketplace access
    const blockedRelation = clientRelations.find(rel => !rel.canSeeMarketplace);

    if (blockedRelation) {
      const trainerName = `${blockedRelation.trainer.user.firstName} ${blockedRelation.trainer.user.lastName}`;
      return {
        canSeeMarketplace: false,
        reason: `You are exclusively training with ${trainerName}`,
      };
    }

    return { canSeeMarketplace: true };
  }

  /**
   * Get user's trainers (both with and without marketplace visibility)
   */
  async getMyTrainers(userId: string) {
    const relations = await this.prisma.trainerClient.findMany({
      where: {
        clientId: userId,
        isActive: true,
      },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        program: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
          },
        },
      },
    });

    return relations.map(rel => ({
      id: rel.trainer.id,
      name: `${rel.trainer.user.firstName} ${rel.trainer.user.lastName}`,
      avatarUrl: rel.trainer.user.avatarUrl,
      specializations: rel.trainer.specializations,
      tier: rel.trainer.tier,
      currentProgram: rel.program ? {
        id: rel.program.id,
        name: rel.program.nameEn,
        nameAr: rel.program.nameAr,
      } : null,
      canSeeMarketplace: rel.canSeeMarketplace,
      premiumGifted: rel.premiumGifted,
      startDate: rel.startDate,
    }));
  }

  /**
   * Save assessment data — each section upserts independently
   */
  async saveAssessment(userId: string, dto: UpdateAssessmentDto) {
    const results: Record<string, boolean> = {};

    // Training History
    if (dto.trainingHistory) {
      const d = dto.trainingHistory;
      await this.prisma.userTrainingHistory.upsert({
        where: { userId },
        update: {
          totalYearsTraining: d.totalYearsTraining,
          currentLevel: d.currentLevel as any,
          preferredTrainingStyle: d.preferredTrainingStyle as any,
          preferredSplitType: d.preferredSplitType as any,
          preferredRepRange: d.preferredRepRange as any,
          sportsBackground: d.sportsBackground,
        },
        create: {
          userId,
          totalYearsTraining: d.totalYearsTraining ?? 0,
          currentLevel: (d.currentLevel as any) ?? 'BEGINNER',
          preferredTrainingStyle: (d.preferredTrainingStyle as any) ?? 'TRADITIONAL',
          preferredSplitType: (d.preferredSplitType as any) ?? 'FULL_BODY',
          preferredRepRange: (d.preferredRepRange as any) ?? 'MODERATE',
          sportsBackground: d.sportsBackground ?? [],
        },
      });
      results.trainingHistory = true;
    }

    // Fitness Tests
    if (dto.fitnessTests) {
      const d = dto.fitnessTests;
      await this.prisma.userExerciseCapability.upsert({
        where: { userId },
        update: {
          pushUpMaxReps: d.pushUpMaxReps,
          plankHoldSeconds: d.plankHoldSeconds,
          pullUpMaxReps: d.pullUpMaxReps,
          benchPress1RM: d.benchPress1RM,
          squat1RM: d.squat1RM,
          deadlift1RM: d.deadlift1RM,
          bodyweightSquatMaxReps: d.bodyweightSquatMaxReps,
          canTouchToes: d.canTouchToes,
          assessedAt: new Date(),
        },
        create: {
          userId,
          pushUpMaxReps: d.pushUpMaxReps ?? 0,
          plankHoldSeconds: d.plankHoldSeconds ?? 0,
          pullUpMaxReps: d.pullUpMaxReps ?? 0,
          benchPress1RM: d.benchPress1RM,
          squat1RM: d.squat1RM,
          deadlift1RM: d.deadlift1RM,
          bodyweightSquatMaxReps: d.bodyweightSquatMaxReps ?? 0,
          canTouchToes: d.canTouchToes ?? false,
        },
      });
      results.fitnessTests = true;
    }

    // Health Profile
    if (dto.healthProfile) {
      const d = dto.healthProfile;
      await this.prisma.userHealthProfile.upsert({
        where: { userId },
        update: { ...d },
        create: { userId, ...d },
      });
      results.healthProfile = true;
    }

    // Injuries
    if (dto.injuries && dto.injuries.length > 0) {
      // Ensure health profile exists first
      const hp = await this.prisma.userHealthProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
      // Clear old injuries and insert new ones
      await this.prisma.userInjury.deleteMany({ where: { healthProfileId: hp.id } });
      for (const inj of dto.injuries) {
        await this.prisma.userInjury.create({
          data: {
            healthProfileId: hp.id,
            bodyPart: inj.bodyPart as any,
            side: inj.side,
            injuryType: inj.injuryType as any,
            severity: inj.severity as any,
            painLevel: inj.painLevel ?? 0,
            painTriggers: inj.painTriggers ?? [],
            avoidMovements: inj.avoidMovements ?? [],
            inPhysicalTherapy: inj.inPhysicalTherapy ?? false,
            notes: inj.notes,
          },
        });
      }
      results.injuries = true;
    }

    // Supplements (part of Nutrition Profile)
    if (dto.supplements) {
      const d = dto.supplements;
      await this.prisma.userNutritionProfile.upsert({
        where: { userId },
        update: {
          takesProteinPowder: d.takesProteinPowder,
          proteinPowderType: d.proteinPowderType,
          takesCreatine: d.takesCreatine,
          takesPreWorkout: d.takesPreWorkout,
          otherSupplements: d.otherSupplements,
        },
        create: {
          userId,
          takesProteinPowder: d.takesProteinPowder ?? false,
          proteinPowderType: d.proteinPowderType,
          takesCreatine: d.takesCreatine ?? false,
          takesPreWorkout: d.takesPreWorkout ?? false,
          otherSupplements: d.otherSupplements ?? [],
        },
      });
      results.supplements = true;
    }

    // Lifestyle
    if (dto.lifestyle) {
      const d = dto.lifestyle;
      await this.prisma.userLifestyleProfile.upsert({
        where: { userId },
        update: {
          averageSleepHours: d.averageSleepHours,
          sleepQuality: d.sleepQuality as any,
          currentStressLevel: d.currentStressLevel as any,
          targetWorkoutsPerWeek: d.targetWorkoutsPerWeek,
          maxWorkoutMinutes: d.maxWorkoutMinutes,
          preferredWorkoutTime: d.preferredWorkoutTime as any,
          workType: d.workType as any,
        },
        create: {
          userId,
          averageSleepHours: d.averageSleepHours ?? 7,
          sleepQuality: (d.sleepQuality as any) ?? 'FAIR',
          currentStressLevel: (d.currentStressLevel as any) ?? 'MODERATE',
          targetWorkoutsPerWeek: d.targetWorkoutsPerWeek ?? 4,
          maxWorkoutMinutes: d.maxWorkoutMinutes ?? 60,
          preferredWorkoutTime: (d.preferredWorkoutTime as any) ?? 'ANYTIME',
          workType: (d.workType as any) ?? 'SEDENTARY',
        },
      });
      results.lifestyle = true;
    }

    // Fasting
    if (dto.fasting) {
      const d = dto.fasting;
      await this.prisma.userFastingProfile.upsert({
        where: { userId },
        update: {
          doesIntermittentFasting: d.doesIntermittentFasting,
          ifProtocol: d.ifProtocol as any,
          eatingWindowStart: d.eatingWindowStart,
          eatingWindowEnd: d.eatingWindowEnd,
          observesRamadan: d.observesRamadan,
          ramadanActive: d.ramadanActive,
          ramadanWorkoutTiming: d.ramadanWorkoutTiming as any,
        },
        create: {
          userId,
          doesIntermittentFasting: d.doesIntermittentFasting ?? false,
          ifProtocol: d.ifProtocol as any,
          eatingWindowStart: d.eatingWindowStart,
          eatingWindowEnd: d.eatingWindowEnd,
          observesRamadan: d.observesRamadan ?? false,
          ramadanActive: d.ramadanActive ?? false,
          ramadanWorkoutTiming: (d.ramadanWorkoutTiming as any) ?? 'AFTER_IFTAR',
        },
      });
      results.fasting = true;
    }

    // Body Composition
    if (dto.bodyComposition) {
      const d = dto.bodyComposition;
      await this.prisma.userBodyComposition.upsert({
        where: { userId },
        update: {
          currentWeightKg: d.currentWeightKg,
          heightCm: d.heightCm,
          bodyFatPercent: d.bodyFatPercent,
          bodyType: d.bodyType as any,
          waistCm: d.waistCm,
          hipsGlutesCm: d.hipsGlutesCm,
          chestCm: d.chestCm,
        },
        create: {
          userId,
          currentWeightKg: d.currentWeightKg ?? 70,
          heightCm: d.heightCm ?? 170,
          bodyFatPercent: d.bodyFatPercent,
          bodyType: d.bodyType as any,
          waistCm: d.waistCm,
          hipsGlutesCm: d.hipsGlutesCm,
          chestCm: d.chestCm,
        },
      });
      results.bodyComposition = true;
    }

    return { success: true, saved: results };
  }

  /**
   * Get all assessment data for the user
   */
  async getAssessment(userId: string) {
    const [trainingHistory, fitnessTests, healthProfile, lifestyle, fasting, bodyComposition, nutritionProfile] = await Promise.all([
      this.prisma.userTrainingHistory.findUnique({ where: { userId } }),
      this.prisma.userExerciseCapability.findUnique({ where: { userId } }),
      this.prisma.userHealthProfile.findUnique({ where: { userId }, include: { injuries: { where: { isCurrentlyActive: true } } } }),
      this.prisma.userLifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.userFastingProfile.findUnique({ where: { userId } }),
      this.prisma.userBodyComposition.findUnique({ where: { userId } }),
      this.prisma.userNutritionProfile.findUnique({ where: { userId } }),
    ]);

    return {
      trainingHistory,
      fitnessTests,
      healthProfile,
      injuries: healthProfile?.injuries ?? [],
      supplements: nutritionProfile ? {
        takesProteinPowder: nutritionProfile.takesProteinPowder,
        proteinPowderType: nutritionProfile.proteinPowderType,
        takesCreatine: nutritionProfile.takesCreatine,
        takesPreWorkout: nutritionProfile.takesPreWorkout,
        otherSupplements: nutritionProfile.otherSupplements,
      } : null,
      lifestyle,
      fasting,
      bodyComposition,
    };
  }
}
