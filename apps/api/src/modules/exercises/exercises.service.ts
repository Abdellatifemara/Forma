import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory, Prisma } from '@prisma/client';
import { SearchExercisesDto } from './dto/search-exercises.dto';

// Simple in-memory cache for exercise searches
const searchCache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = searchCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  searchCache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  // Limit cache size
  if (searchCache.size > 500) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ExerciseWhereUniqueInput;
    where?: Prisma.ExerciseWhereInput;
    orderBy?: Prisma.ExerciseOrderByWithRelationInput;
  }): Promise<Exercise[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.exercise.findMany({
      skip,
      take: take ? Math.min(take, 100) : 50,
      cursor,
      where,
      orderBy,
    });
  }

  async findById(id: string): Promise<Exercise | null> {
    return this.prisma.exercise.findUnique({
      where: { id },
    });
  }

  async findByExternalId(externalId: string): Promise<Exercise | null> {
    return this.prisma.exercise.findUnique({
      where: { externalId },
    });
  }

  async search(dto: SearchExercisesDto): Promise<{
    data: Exercise[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    exercises: Exercise[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.ExerciseWhereInput = {};

    // Text search
    if (dto.query) {
      const searchTerm = dto.query.toLowerCase();
      where.OR = [
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { descriptionEn: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Muscle group filter
    if (dto.primaryMuscle) {
      where.primaryMuscle = dto.primaryMuscle;
    }

    if (dto.muscleGroups && dto.muscleGroups.length > 0) {
      where.OR = [
        { primaryMuscle: { in: dto.muscleGroups } },
        { secondaryMuscles: { hasSome: dto.muscleGroups } },
      ];
    }

    // Equipment filter
    if (dto.equipment && dto.equipment.length > 0) {
      where.equipment = { hasSome: dto.equipment };
    }

    // Difficulty filter
    if (dto.difficulty) {
      where.difficulty = dto.difficulty;
    }

    if (dto.maxDifficulty) {
      const difficultyOrder: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
      const maxIndex = difficultyOrder.indexOf(dto.maxDifficulty);
      where.difficulty = { in: difficultyOrder.slice(0, maxIndex + 1) };
    }

    // Category filter
    if (dto.category) {
      where.category = dto.category;
    }

    // Build orderBy
    let orderBy: Prisma.ExerciseOrderByWithRelationInput = { nameEn: 'asc' };

    if (dto.sortBy) {
      switch (dto.sortBy) {
        case 'name':
          orderBy = { nameEn: dto.sortOrder || 'asc' };
          break;
        case 'difficulty':
          orderBy = { difficulty: dto.sortOrder || 'asc' };
          break;
        case 'created':
          orderBy = { createdAt: dto.sortOrder || 'desc' };
          break;
      }
    }

    // Execute queries
    const [exercises, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.exercise.count({ where }),
    ]);

    // Return in format expected by frontend
    return {
      data: exercises,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      // Also include flat properties for backward compatibility
      exercises,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getByMuscleGroup(muscle: MuscleGroup): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { primaryMuscle: muscle },
          { secondaryMuscles: { has: muscle } },
        ],
      },
      orderBy: { nameEn: 'asc' },
      take: 200,
    });
  }

  async getByEquipment(equipment: EquipmentType[]): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        equipment: { hasSome: equipment },
      },
      orderBy: { nameEn: 'asc' },
      take: 200,
    });
  }

  async getForUser(
    userId: string,
    muscle?: MuscleGroup,
  ): Promise<Exercise[]> {
    // Get user's equipment
    const userEquipment = await this.prisma.userEquipment.findMany({
      where: { userId },
    });

    const equipmentTypes = userEquipment.map((e) => e.equipment);

    // Add bodyweight by default
    if (!equipmentTypes.includes('BODYWEIGHT')) {
      equipmentTypes.push('BODYWEIGHT');
    }
    if (!equipmentTypes.includes('NONE')) {
      equipmentTypes.push('NONE');
    }

    const where: Prisma.ExerciseWhereInput = {
      equipment: { hasSome: equipmentTypes },
    };

    if (muscle) {
      where.OR = [
        { primaryMuscle: muscle },
        { secondaryMuscles: { has: muscle } },
      ];
    }

    return this.prisma.exercise.findMany({
      where,
      orderBy: { difficulty: 'asc' },
      take: 200,
    });
  }

  async getExerciseHistory(userId: string, exerciseId: string) {
    const exercise = await this.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Get user's history for this exercise
    const logs = await this.prisma.exerciseLog.findMany({
      where: {
        exerciseId,
        workoutLog: {
          userId,
          status: 'COMPLETED',
        },
      },
      include: {
        sets: true,
        workoutLog: {
          select: {
            completedAt: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20,
    });

    // Calculate best set for each session
    const history = logs.map((log) => {
      const bestSet = log.sets.reduce((best, current) => {
        const currentVolume = (current.weightKg || 0) * (current.reps || 0);
        const bestVolume = (best?.weightKg || 0) * (best?.reps || 0);
        return currentVolume > bestVolume ? current : best;
      }, log.sets[0]);

      return {
        date: log.workoutLog.completedAt,
        sets: log.sets.length,
        bestSet: bestSet
          ? {
              weight: bestSet.weightKg,
              reps: bestSet.reps,
              volume: (bestSet.weightKg || 0) * (bestSet.reps || 0),
            }
          : null,
        totalVolume: log.sets.reduce(
          (sum, set) => sum + (set.weightKg || 0) * (set.reps || 0),
          0,
        ),
      };
    });

    // Calculate estimated 1RM using Epley formula
    const personalRecord = history.reduce((pr, session) => {
      if (!session.bestSet) return pr;
      const estimated1RM =
        session.bestSet.weight! * (1 + session.bestSet.reps! / 30);
      return estimated1RM > pr ? estimated1RM : pr;
    }, 0);

    return {
      exercise: {
        id: exercise.id,
        nameEn: exercise.nameEn,
        nameAr: exercise.nameAr,
      },
      history,
      totalSessions: logs.length,
      estimated1RM: personalRecord > 0 ? Math.round(personalRecord * 10) / 10 : null,
    };
  }

  async getMuscleGroupCounts(): Promise<{ muscle: MuscleGroup; count: number }[]> {
    const groups = await this.prisma.exercise.groupBy({
      by: ['primaryMuscle'],
      _count: { id: true },
    });

    return groups
      .map((g) => ({ muscle: g.primaryMuscle, count: g._count.id }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }
}
