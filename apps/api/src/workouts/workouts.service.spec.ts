import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let prismaService: PrismaService;

  const mockWorkoutPlan = {
    id: '1',
    name: 'Push Pull Legs',
    description: 'Classic 6-day split',
    duration: 12,
    frequency: 6,
    level: 'intermediate',
    goal: 'muscle_building',
    createdAt: new Date(),
    updatedAt: new Date(),
    workouts: [],
  };

  const mockWorkout = {
    id: '1',
    name: 'Push Day A',
    day: 1,
    planId: '1',
    exercises: [
      {
        id: '1',
        exerciseId: 'ex-1',
        sets: 4,
        reps: '8-10',
        restSeconds: 90,
        exercise: {
          id: 'ex-1',
          name: 'Bench Press',
          muscleGroup: 'Chest',
        },
      },
    ],
  };

  const mockWorkoutLog = {
    id: 'log-1',
    userId: 'user-1',
    workoutId: '1',
    date: new Date(),
    duration: 3600,
    totalVolume: 12500,
    exercises: [],
  };

  const mockPrismaService = {
    workoutPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workout: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    workoutLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    exerciseLog: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlans', () => {
    it('should return array of workout plans', async () => {
      mockPrismaService.workoutPlan.findMany.mockResolvedValue([mockWorkoutPlan]);

      const result = await service.getPlans('user-1');

      expect(result).toEqual([mockWorkoutPlan]);
      expect(mockPrismaService.workoutPlan.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no plans exist', async () => {
      mockPrismaService.workoutPlan.findMany.mockResolvedValue([]);

      const result = await service.getPlans('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getPlan', () => {
    it('should return a workout plan by id', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(mockWorkoutPlan);

      const result = await service.getPlan('1');

      expect(result).toEqual(mockWorkoutPlan);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.getPlan('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTodayWorkout', () => {
    it('should return todays scheduled workout', async () => {
      mockPrismaService.workout.findFirst.mockResolvedValue(mockWorkout);

      const result = await service.getTodayWorkout('user-1');

      expect(result).toEqual(mockWorkout);
    });

    it('should return null when no workout scheduled for today', async () => {
      mockPrismaService.workout.findFirst.mockResolvedValue(null);

      const result = await service.getTodayWorkout('user-1');

      expect(result).toBeNull();
    });
  });

  describe('logWorkout', () => {
    const logData = {
      workoutId: '1',
      duration: 3600,
      exercises: [
        {
          exerciseId: 'ex-1',
          sets: [
            { reps: 10, weight: 80, rpe: 8 },
            { reps: 8, weight: 85, rpe: 9 },
          ],
        },
      ],
      notes: 'Great workout!',
    };

    it('should create a workout log', async () => {
      mockPrismaService.workout.findUnique.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutLog.create.mockResolvedValue(mockWorkoutLog);
      mockPrismaService.exerciseLog.createMany.mockResolvedValue({ count: 1 });

      const result = await service.logWorkout('user-1', logData);

      expect(result).toEqual(mockWorkoutLog);
      expect(mockPrismaService.workoutLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when workout not found', async () => {
      mockPrismaService.workout.findUnique.mockResolvedValue(null);

      await expect(service.logWorkout('user-1', logData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate total volume correctly', async () => {
      mockPrismaService.workout.findUnique.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutLog.create.mockImplementation((args) => {
        return Promise.resolve({
          ...mockWorkoutLog,
          totalVolume: args.data.totalVolume,
        });
      });

      const result = await service.logWorkout('user-1', logData);

      // Volume = (10 * 80) + (8 * 85) = 800 + 680 = 1480
      expect(mockPrismaService.workoutLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalVolume: 1480,
          }),
        }),
      );
    });
  });

  describe('getHistory', () => {
    it('should return paginated workout history', async () => {
      mockPrismaService.workoutLog.findMany.mockResolvedValue([mockWorkoutLog]);
      mockPrismaService.workoutLog.count.mockResolvedValue(1);

      const result = await service.getHistory('user-1', { page: 1, limit: 10 });

      expect(result.data).toEqual([mockWorkoutLog]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should handle empty history', async () => {
      mockPrismaService.workoutLog.findMany.mockResolvedValue([]);
      mockPrismaService.workoutLog.count.mockResolvedValue(0);

      const result = await service.getHistory('user-1', { page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
