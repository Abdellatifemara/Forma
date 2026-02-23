import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Food, MealLog, MealType, Prisma } from '@prisma/client';

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  // Foods
  async searchFoods(params: {
    query?: string;
    category?: string;
    isEgyptian?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { query, category, isEgyptian, page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FoodWhereInput = {};

    if (query) {
      // Split query into words for better matching
      const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
      if (words.length > 1) {
        // Multi-word: each word must match somewhere (AND logic)
        where.AND = words.map(word => ({
          OR: [
            { nameEn: { contains: word, mode: 'insensitive' as const } },
            { nameAr: { contains: word, mode: 'insensitive' as const } },
            { category: { contains: word, mode: 'insensitive' as const } },
            { brandEn: { contains: word, mode: 'insensitive' as const } },
            { tags: { has: word.toLowerCase() } },
          ],
        }));
      } else {
        where.OR = [
          { nameEn: { contains: query, mode: 'insensitive' } },
          { nameAr: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { brandEn: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
        ];
      }
    }

    if (category) {
      // Support case-insensitive category matching and partial match
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (isEgyptian !== undefined) {
      where.isEgyptian = isEgyptian;
    }

    const [foods, total] = await Promise.all([
      this.prisma.food.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.food.count({ where }),
    ]);

    return {
      foods,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getFoodById(id: string): Promise<Food | null> {
    return this.prisma.food.findUnique({ where: { id } });
  }

  async getFoodByBarcode(barcode: string): Promise<Food | null> {
    return this.prisma.food.findFirst({ where: { barcode } });
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await this.prisma.food.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } },
    });

    return categories.map((c) => ({
      category: c.category,
      count: c._count,
    }));
  }

  // Meal Logging
  async logMeal(
    userId: string,
    data: {
      mealType: MealType;
      foods: { foodId: string; servings: number }[];
      notes?: string;
      photoUrl?: string;
    },
  ): Promise<MealLog> {
    // Get food data to calculate totals
    const foodIds = data.foods.map((f) => f.foodId);
    const foodsData = await this.prisma.food.findMany({
      where: { id: { in: foodIds } },
    });

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    data.foods.forEach((item) => {
      const food = foodsData.find((f) => f.id === item.foodId);
      if (food) {
        totalCalories += food.calories * item.servings;
        totalProtein += food.proteinG * item.servings;
        totalCarbs += food.carbsG * item.servings;
        totalFat += food.fatG * item.servings;
      }
    });

    return this.prisma.mealLog.create({
      data: {
        userId,
        mealType: data.mealType,
        notes: data.notes,
        photoUrl: data.photoUrl,
        totalCalories,
        totalProteinG: totalProtein,
        totalCarbsG: totalCarbs,
        totalFatG: totalFat,
        foods: {
          create: data.foods.map((f) => ({
            foodId: f.foodId,
            servings: f.servings,
          })),
        },
      },
      include: {
        foods: {
          include: { food: true },
        },
      },
    });
  }

  async getMealLogs(
    userId: string,
    date?: Date,
  ): Promise<MealLog[]> {
    const where: Prisma.MealLogWhereInput = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.loggedAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.mealLog.findMany({
      where,
      include: {
        foods: {
          include: { food: true },
        },
      },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async getDailyNutritionSummary(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProteinG || 0),
        carbs: acc.carbs + (meal.totalCarbsG || 0),
        fat: acc.fat + (meal.totalFatG || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    // Get user targets
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { aiPreferences: true },
    });

    // Calculate default targets based on user data (simplified)
    const bmr = user?.currentWeightKg
      ? user.gender === 'MALE'
        ? 10 * user.currentWeightKg + 6.25 * (user.heightCm || 170) - 5 * 30 + 5
        : 10 * user.currentWeightKg + 6.25 * (user.heightCm || 160) - 5 * 30 - 161
      : 2000;

    const activityMultiplier = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9,
    };

    const tdee = bmr * (activityMultiplier[user?.activityLevel || 'MODERATELY_ACTIVE'] || 1.55);

    // Adjust for goal
    let targetCalories = tdee;
    if (user?.fitnessGoal === 'LOSE_WEIGHT') {
      targetCalories = tdee - 500;
    } else if (user?.fitnessGoal === 'BUILD_MUSCLE') {
      targetCalories = tdee + 300;
    }

    const targetProtein = Math.round(user?.currentWeightKg ? user.currentWeightKg * 2 : 150);
    const targetFat = Math.round(targetCalories * 0.25 / 9);
    const targetCarbs = Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4);

    return {
      date: date.toISOString().split('T')[0],
      consumed: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      },
      targets: {
        calories: Math.round(targetCalories),
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
      },
      remaining: {
        calories: Math.round(targetCalories - totals.calories),
        protein: Math.round(targetProtein - totals.protein),
        carbs: Math.round(targetCarbs - totals.carbs),
        fat: Math.round(targetFat - totals.fat),
      },
      mealCount: meals.length,
    };
  }

  async deleteMealLog(userId: string, logId: string): Promise<void> {
    const log = await this.prisma.mealLog.findFirst({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new NotFoundException('Meal log not found');
    }

    await this.prisma.mealLog.delete({ where: { id: logId } });
  }

  // Get daily log in the format frontend expects
  async getDailyLog(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        foods: {
          include: { food: true },
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProteinG || 0),
        carbs: acc.carbs + (meal.totalCarbsG || 0),
        fat: acc.fat + (meal.totalFatG || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    // Get user targets
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Calculate default targets based on user data
    const bmr = user?.currentWeightKg
      ? user.gender === 'MALE'
        ? 10 * user.currentWeightKg + 6.25 * (user.heightCm || 170) - 5 * 30 + 5
        : 10 * user.currentWeightKg + 6.25 * (user.heightCm || 160) - 5 * 30 - 161
      : 2000;

    const activityMultiplier = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9,
    };

    const tdee = bmr * (activityMultiplier[user?.activityLevel || 'MODERATELY_ACTIVE'] || 1.55);

    let targetCalories = tdee;
    if (user?.fitnessGoal === 'LOSE_WEIGHT') {
      targetCalories = tdee - 500;
    } else if (user?.fitnessGoal === 'BUILD_MUSCLE') {
      targetCalories = tdee + 300;
    }

    const targetProtein = Math.round(user?.currentWeightKg ? user.currentWeightKg * 2 : 150);
    const targetFat = Math.round(targetCalories * 0.25 / 9);
    const targetCarbs = Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4);

    // Transform meals to match frontend MealLog type
    const transformedMeals = meals.map(meal => ({
      id: meal.id,
      mealType: meal.mealType,
      loggedAt: meal.loggedAt.toISOString(),
      foods: meal.foods.map(f => ({
        id: f.id,
        name: f.food.nameEn,
        servings: f.servings,
        calories: f.food.calories * f.servings,
        protein: f.food.proteinG * f.servings,
        carbs: f.food.carbsG * f.servings,
        fat: f.food.fatG * f.servings,
      })),
      totalCalories: meal.totalCalories || 0,
      totalProtein: meal.totalProteinG || 0,
      totalCarbs: meal.totalCarbsG || 0,
      totalFat: meal.totalFatG || 0,
    }));

    return {
      date: date.toISOString().split('T')[0],
      meals: transformedMeals,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      },
      goals: {
        calories: Math.round(targetCalories),
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
      },
    };
  }

  // Get weekly nutrition summary
  async getWeeklySummary(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const meals = await this.prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: weekAgo, lte: today },
      },
    });

    // Group by day
    const dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

    meals.forEach(meal => {
      const day = meal.loggedAt.toISOString().split('T')[0];
      if (!dailyTotals[day]) {
        dailyTotals[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyTotals[day].calories += meal.totalCalories || 0;
      dailyTotals[day].protein += meal.totalProteinG || 0;
      dailyTotals[day].carbs += meal.totalCarbsG || 0;
      dailyTotals[day].fat += meal.totalFatG || 0;
    });

    const days = Object.entries(dailyTotals).map(([date, totals]) => ({
      date,
      ...totals,
    }));

    const totalMeals = meals.length;
    const avgCalories = totalMeals > 0 ? Math.round(meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0) / Math.max(Object.keys(dailyTotals).length, 1)) : 0;
    const avgProtein = totalMeals > 0 ? Math.round(meals.reduce((sum, m) => sum + (m.totalProteinG || 0), 0) / Math.max(Object.keys(dailyTotals).length, 1)) : 0;

    return {
      days,
      summary: {
        totalMeals,
        avgDailyCalories: avgCalories,
        avgDailyProtein: avgProtein,
        daysTracked: Object.keys(dailyTotals).length,
      },
    };
  }
}
