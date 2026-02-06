import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // EQUIPMENT INVENTORY
  // ==========================================

  async getEquipmentInventory(userId: string) {
    const inventory = await this.prisma.userEquipmentInventory.findUnique({
      where: { userId },
    });
    return inventory || this.getDefaultEquipmentInventory();
  }

  async updateEquipmentInventory(userId: string, data: any) {
    return this.prisma.userEquipmentInventory.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private getDefaultEquipmentInventory() {
    return {
      primaryLocation: 'HOME',
      hasGymAccess: false,
      hasPullUpBar: false,
      hasDumbbells: false,
      hasBarbell: false,
      hasBench: false,
      hasResistanceBands: false,
      hasYogaMat: false,
    };
  }

  // ==========================================
  // EXERCISE CAPABILITY
  // ==========================================

  async getExerciseCapability(userId: string) {
    const capability = await this.prisma.userExerciseCapability.findUnique({
      where: { userId },
    });
    return capability || this.getDefaultExerciseCapability();
  }

  async updateExerciseCapability(userId: string, data: any) {
    return this.prisma.userExerciseCapability.upsert({
      where: { userId },
      update: { ...data, assessedAt: new Date() },
      create: { userId, ...data },
    });
  }

  private getDefaultExerciseCapability() {
    return {
      pushUpMaxReps: 0,
      pullUpMaxReps: 0,
      plankHoldSeconds: 0,
      bodyweightSquatMaxReps: 0,
      canTouchToes: false,
    };
  }

  // ==========================================
  // MOVEMENT SCREENING
  // ==========================================

  async getMovementScreen(userId: string) {
    const screen = await this.prisma.userMovementScreen.findUnique({
      where: { userId },
    });
    return screen || this.getDefaultMovementScreen();
  }

  async updateMovementScreen(userId: string, data: any) {
    return this.prisma.userMovementScreen.upsert({
      where: { userId },
      update: { ...data, screenedAt: new Date() },
      create: { userId, ...data },
    });
  }

  private getDefaultMovementScreen() {
    return {
      deepSquatScore: 2,
      shoulderMobilityScoreL: 2,
      shoulderMobilityScoreR: 2,
      limitedAnkleDorsiflexion: false,
      limitedShoulderFlexion: false,
      roundedShoulders: false,
    };
  }

  // ==========================================
  // HEALTH PROFILE & INJURIES
  // ==========================================

  async getHealthProfile(userId: string) {
    const profile = await this.prisma.userHealthProfile.findUnique({
      where: { userId },
      include: { injuries: true },
    });
    return profile || { injuries: [] };
  }

  async updateHealthProfile(userId: string, data: any) {
    const { injuries, ...healthData } = data;

    return this.prisma.userHealthProfile.upsert({
      where: { userId },
      update: healthData,
      create: { userId, ...healthData },
      include: { injuries: true },
    });
  }

  async addInjury(userId: string, injuryData: any) {
    // Get or create health profile first
    let healthProfile = await this.prisma.userHealthProfile.findUnique({
      where: { userId },
    });

    if (!healthProfile) {
      healthProfile = await this.prisma.userHealthProfile.create({
        data: { userId },
      });
    }

    return this.prisma.userInjury.create({
      data: {
        healthProfileId: healthProfile.id,
        ...injuryData,
      },
    });
  }

  async updateInjury(injuryId: string, data: any) {
    return this.prisma.userInjury.update({
      where: { id: injuryId },
      data,
    });
  }

  async deleteInjury(injuryId: string) {
    return this.prisma.userInjury.delete({
      where: { id: injuryId },
    });
  }

  // ==========================================
  // NUTRITION PROFILE
  // ==========================================

  async getNutritionProfile(userId: string) {
    const profile = await this.prisma.userNutritionProfile.findUnique({
      where: { userId },
    });
    return profile || this.getDefaultNutritionProfile();
  }

  async updateNutritionProfile(userId: string, data: any) {
    return this.prisma.userNutritionProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private getDefaultNutritionProfile() {
    return {
      isHalal: false,
      isVegetarian: false,
      isVegan: false,
      cookingSkillLevel: 'INTERMEDIATE',
      maxCookingTimeMin: 30,
      budgetLevel: 'MODERATE',
      mealsPerDay: 3,
      preferLocalEgyptianFood: true,
    };
  }

  // ==========================================
  // LIFESTYLE PROFILE
  // ==========================================

  async getLifestyleProfile(userId: string) {
    const profile = await this.prisma.userLifestyleProfile.findUnique({
      where: { userId },
    });
    return profile || this.getDefaultLifestyleProfile();
  }

  async updateLifestyleProfile(userId: string, data: any) {
    return this.prisma.userLifestyleProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private getDefaultLifestyleProfile() {
    return {
      workType: 'SEDENTARY',
      averageSleepHours: 7,
      sleepQuality: 'FAIR',
      currentStressLevel: 'MODERATE',
      targetWorkoutsPerWeek: 4,
      maxWorkoutMinutes: 60,
    };
  }

  // ==========================================
  // BODY COMPOSITION
  // ==========================================

  async getBodyComposition(userId: string) {
    const composition = await this.prisma.userBodyComposition.findUnique({
      where: { userId },
    });
    return composition;
  }

  async updateBodyComposition(userId: string, data: any) {
    // Calculate derived values
    if (data.currentWeightKg && data.heightCm) {
      const heightM = data.heightCm / 100;
      data.bmi = data.currentWeightKg / (heightM * heightM);
    }
    if (data.bodyFatPercent && data.currentWeightKg) {
      data.fatMassKg = data.currentWeightKg * (data.bodyFatPercent / 100);
      data.leanMassKg = data.currentWeightKg - data.fatMassKg;
    }
    if (data.waistCm && data.hipsGlutesCm) {
      data.waistToHipRatio = data.waistCm / data.hipsGlutesCm;
    }
    if (data.waistCm && data.heightCm) {
      data.waistToHeightRatio = data.waistCm / data.heightCm;
    }

    return this.prisma.userBodyComposition.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // ==========================================
  // DAILY READINESS
  // ==========================================

  async logDailyReadiness(userId: string, data: any) {
    // Calculate recommended intensity based on readiness factors
    const recommendedIntensity = this.calculateRecommendedIntensity(data);
    const shouldSkip = data.overallReadiness < 3 || data.feelingIll;

    return this.prisma.dailyReadinessLog.create({
      data: {
        userId,
        ...data,
        recommendedIntensity,
        shouldSkipWorkout: shouldSkip,
      },
    });
  }

  async getTodayReadiness(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.dailyReadinessLog.findFirst({
      where: {
        userId,
        loggedAt: { gte: today },
      },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async getReadinessHistory(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.dailyReadinessLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startDate },
      },
      orderBy: { loggedAt: 'desc' },
    });
  }

  private calculateRecommendedIntensity(data: any): string {
    const score = data.overallReadiness ||
      Math.round((data.energyLevel + data.motivationLevel + data.moodLevel) / 3);

    if (data.feelingIll || data.painIntensity > 6) return 'RECOVERY';
    if (score <= 3 || data.sorenessLevel > 7) return 'LIGHT';
    if (score <= 5) return 'MODERATE';
    if (score <= 7) return 'HIGH';
    return 'MAXIMUM';
  }

  // ==========================================
  // WORKOUT FEEDBACK
  // ==========================================

  async logWorkoutFeedback(userId: string, workoutLogId: string, data: any) {
    return this.prisma.workoutFeedback.create({
      data: {
        userId,
        workoutLogId,
        ...data,
      },
    });
  }

  async getWorkoutFeedback(workoutLogId: string) {
    return this.prisma.workoutFeedback.findUnique({
      where: { workoutLogId },
    });
  }

  // ==========================================
  // MUSCLE RECOVERY STATUS
  // ==========================================

  async updateMuscleRecovery(userId: string, muscleGroup: string, workoutData: any) {
    const { sets, rpe } = workoutData;

    // Calculate estimated recovery time based on volume and intensity
    const hoursToRecover = this.calculateRecoveryTime(sets, rpe);
    const estimatedFullRecoveryAt = new Date();
    estimatedFullRecoveryAt.setHours(estimatedFullRecoveryAt.getHours() + hoursToRecover);

    return this.prisma.muscleRecoveryStatus.upsert({
      where: {
        userId_muscleGroup: { userId, muscleGroup: muscleGroup as any },
      },
      update: {
        lastWorkedAt: new Date(),
        lastWorkoutSets: sets,
        lastWorkoutRPE: rpe,
        recoveryPercent: 0,
        estimatedFullRecoveryAt,
        setsThisWeek: { increment: sets },
      },
      create: {
        userId,
        muscleGroup: muscleGroup as any,
        lastWorkedAt: new Date(),
        lastWorkoutSets: sets,
        lastWorkoutRPE: rpe,
        recoveryPercent: 0,
        estimatedFullRecoveryAt,
        setsThisWeek: sets,
      },
    });
  }

  async getMuscleRecoveryStatus(userId: string) {
    const statuses = await this.prisma.muscleRecoveryStatus.findMany({
      where: { userId },
    });

    // Update recovery percentages based on time since last workout
    const now = new Date();
    return statuses.map(status => {
      if (!status.lastWorkedAt) return { ...status, recoveryPercent: 100 };

      const hoursSinceWorkout = (now.getTime() - status.lastWorkedAt.getTime()) / (1000 * 60 * 60);
      const hoursToRecover = this.calculateRecoveryTime(status.lastWorkoutSets, status.lastWorkoutRPE);
      const recoveryPercent = Math.min(100, Math.round((hoursSinceWorkout / hoursToRecover) * 100));

      return { ...status, recoveryPercent };
    });
  }

  private calculateRecoveryTime(sets: number, rpe: number): number {
    // Base recovery: 48 hours
    // Adjust based on volume and intensity
    const baseHours = 48;
    const volumeFactor = 1 + (sets - 10) * 0.05; // More sets = more recovery needed
    const intensityFactor = 1 + (rpe - 7) * 0.1; // Higher RPE = more recovery needed

    return Math.round(baseHours * volumeFactor * intensityFactor);
  }

  // ==========================================
  // TRAINING HISTORY
  // ==========================================

  async getTrainingHistory(userId: string) {
    const history = await this.prisma.userTrainingHistory.findUnique({
      where: { userId },
    });
    return history || this.getDefaultTrainingHistory();
  }

  async updateTrainingHistory(userId: string, data: any) {
    return this.prisma.userTrainingHistory.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private getDefaultTrainingHistory() {
    return {
      totalYearsTraining: 0,
      currentLevel: 'BEGINNER',
      preferredTrainingStyle: 'TRADITIONAL',
      preferredSplitType: 'FULL_BODY',
      totalWorkoutsLogged: 0,
      consistencyScore: 50,
    };
  }

  // ==========================================
  // GOALS PROFILE
  // ==========================================

  async getGoalsProfile(userId: string) {
    const goals = await this.prisma.userGoalsProfile.findUnique({
      where: { userId },
    });
    return goals;
  }

  async updateGoalsProfile(userId: string, data: any) {
    return this.prisma.userGoalsProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // ==========================================
  // FASTING PROFILE
  // ==========================================

  async getFastingProfile(userId: string) {
    const fasting = await this.prisma.userFastingProfile.findUnique({
      where: { userId },
    });
    return fasting || this.getDefaultFastingProfile();
  }

  async updateFastingProfile(userId: string, data: any) {
    return this.prisma.userFastingProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  private getDefaultFastingProfile() {
    return {
      doesIntermittentFasting: false,
      observesRamadan: false,
      ramadanActive: false,
    };
  }

  // ==========================================
  // COMPLETE AI PROFILE
  // Get all data AI needs for decision making
  // ==========================================

  async getCompleteAIProfile(userId: string) {
    const [
      user,
      equipment,
      capability,
      movement,
      health,
      nutrition,
      lifestyle,
      body,
      training,
      goals,
      fasting,
      todayReadiness,
      muscleRecovery,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          gender: true,
          dateOfBirth: true,
          fitnessGoal: true,
          fitnessLevel: true,
          heightCm: true,
          currentWeightKg: true,
          targetWeightKg: true,
        },
      }),
      this.getEquipmentInventory(userId),
      this.getExerciseCapability(userId),
      this.getMovementScreen(userId),
      this.getHealthProfile(userId),
      this.getNutritionProfile(userId),
      this.getLifestyleProfile(userId),
      this.getBodyComposition(userId),
      this.getTrainingHistory(userId),
      this.getGoalsProfile(userId),
      this.getFastingProfile(userId),
      this.getTodayReadiness(userId),
      this.getMuscleRecoveryStatus(userId),
    ]);

    return {
      user,
      equipment,
      capability,
      movement,
      health,
      nutrition,
      lifestyle,
      body,
      training,
      goals,
      fasting,
      todayReadiness,
      muscleRecovery,
      // Add computed fields for AI
      computed: {
        age: user?.dateOfBirth
          ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        bmi: body?.bmi,
        isRamadanActive: fasting?.ramadanActive,
        currentReadiness: todayReadiness?.overallReadiness,
      },
    };
  }

  // ==========================================
  // PROFILE COMPLETION STATUS
  // Track what data has been collected
  // ==========================================

  async getProfileCompletionStatus(userId: string) {
    const [
      equipment,
      capability,
      movement,
      health,
      nutrition,
      lifestyle,
      body,
      training,
      goals,
      fasting,
    ] = await Promise.all([
      this.prisma.userEquipmentInventory.findUnique({ where: { userId } }),
      this.prisma.userExerciseCapability.findUnique({ where: { userId } }),
      this.prisma.userMovementScreen.findUnique({ where: { userId } }),
      this.prisma.userHealthProfile.findUnique({ where: { userId } }),
      this.prisma.userNutritionProfile.findUnique({ where: { userId } }),
      this.prisma.userLifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.userBodyComposition.findUnique({ where: { userId } }),
      this.prisma.userTrainingHistory.findUnique({ where: { userId } }),
      this.prisma.userGoalsProfile.findUnique({ where: { userId } }),
      this.prisma.userFastingProfile.findUnique({ where: { userId } }),
    ]);

    const sections = {
      equipment: { completed: !!equipment, priority: 1, name: 'Equipment Inventory' },
      capability: { completed: !!capability, priority: 2, name: 'Exercise Capability' },
      movement: { completed: !!movement, priority: 3, name: 'Movement Screening' },
      health: { completed: !!health, priority: 1, name: 'Health & Injuries' },
      nutrition: { completed: !!nutrition, priority: 2, name: 'Nutrition Preferences' },
      lifestyle: { completed: !!lifestyle, priority: 3, name: 'Lifestyle & Schedule' },
      body: { completed: !!body, priority: 4, name: 'Body Measurements' },
      training: { completed: !!training, priority: 4, name: 'Training History' },
      goals: { completed: !!goals, priority: 1, name: 'Goals & Motivation' },
      fasting: { completed: !!fasting, priority: 5, name: 'Fasting Preferences' },
    };

    const completedCount = Object.values(sections).filter(s => s.completed).length;
    const totalCount = Object.keys(sections).length;

    return {
      sections,
      completedCount,
      totalCount,
      completionPercent: Math.round((completedCount / totalCount) * 100),
      nextToComplete: Object.entries(sections)
        .filter(([_, s]) => !s.completed)
        .sort((a, b) => a[1].priority - b[1].priority)[0]?.[0] || null,
    };
  }
}
