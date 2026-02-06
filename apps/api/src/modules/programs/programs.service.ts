import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto, ProgramSourceType } from './dto/create-program.dto';
import { UpdateProgramDto, ProgramStatus } from './dto/update-program.dto';
import { ParsedProgramData, ParsedWorkoutDay, ParsedExercise } from './dto/parse-pdf.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get trainer profile ID for a user
   */
  private async getTrainerProfileId(userId: string): Promise<string> {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!trainer) {
      throw new ForbiddenException('User is not a trainer');
    }

    return trainer.id;
  }

  /**
   * Create a new program
   */
  async create(userId: string, dto: CreateProgramDto) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Create program with workout days and exercises
    const program = await this.prisma.trainerProgram.create({
      data: {
        trainerId,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        descriptionEn: dto.descriptionEn,
        descriptionAr: dto.descriptionAr,
        durationWeeks: dto.durationWeeks,
        priceEGP: dto.priceEGP,
        sourceType: dto.sourceType || ProgramSourceType.MANUAL,
        sourcePdfUrl: dto.sourcePdfUrl,
        status: 'DRAFT',
        workoutDays: dto.workoutDays
          ? {
              create: dto.workoutDays.map((day) => ({
                dayNumber: day.dayNumber,
                nameEn: day.nameEn,
                nameAr: day.nameAr,
                notesEn: day.notesEn,
                notesAr: day.notesAr,
                exercises: {
                  create: day.exercises.map((ex) => ({
                    exerciseId: ex.exerciseId,
                    customNameEn: ex.customNameEn,
                    customNameAr: ex.customNameAr,
                    order: ex.order,
                    sets: ex.sets,
                    reps: ex.reps,
                    restSeconds: ex.restSeconds ?? 60,
                    notesEn: ex.notesEn,
                    notesAr: ex.notesAr,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return program;
  }

  /**
   * Create program from parsed PDF data
   */
  async createFromPdf(
    userId: string,
    pdfUrl: string,
    parsedData: ParsedProgramData,
  ) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Map parsed data to program structure
    const workoutDays = parsedData.workoutDays.map((day, index) => ({
      dayNumber: index + 1,
      nameEn: day.name,
      exercises: day.exercises.map((ex, exIndex) => ({
        customNameEn: ex.name,
        order: exIndex + 1,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds ?? 60,
        notesEn: ex.notes,
      })),
    }));

    const program = await this.prisma.trainerProgram.create({
      data: {
        trainerId,
        nameEn: parsedData.suggestedName,
        descriptionEn: parsedData.suggestedDescription,
        durationWeeks: parsedData.durationWeeks,
        sourceType: ProgramSourceType.PDF,
        sourcePdfUrl: pdfUrl,
        status: 'DRAFT',
        workoutDays: {
          create: workoutDays.map((day) => ({
            dayNumber: day.dayNumber,
            nameEn: day.nameEn,
            exercises: {
              create: day.exercises.map((ex) => ({
                customNameEn: ex.customNameEn,
                order: ex.order,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                notesEn: ex.notesEn,
              })),
            },
          })),
        },
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return program;
  }

  /**
   * Get all programs for a trainer
   */
  async findAllForTrainer(userId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const programs = await this.prisma.trainerProgram.findMany({
      where: { trainerId },
      include: {
        _count: {
          select: { clients: true },
        },
        workoutDays: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return programs.map((p) => ({
      id: p.id,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      durationWeeks: p.durationWeeks,
      priceEGP: p.priceEGP,
      status: p.status,
      sourceType: p.sourceType,
      clientCount: p._count.clients,
      workoutDayCount: p.workoutDays.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Get a single program with full details
   */
  async findOne(userId: string, programId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        _count: {
          select: { clients: true },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  /**
   * Update a program
   */
  async update(userId: string, programId: string, dto: UpdateProgramDto) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership
    const existing = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Program not found');
    }

    // If program has clients, prevent certain changes
    if (existing.status === 'ACTIVE') {
      const clientCount = await this.prisma.trainerClient.count({
        where: { programId },
      });

      if (clientCount > 0 && dto.workoutDays) {
        throw new BadRequestException(
          'Cannot modify workout structure for programs with active clients. Create a new program instead.',
        );
      }
    }

    const program = await this.prisma.trainerProgram.update({
      where: { id: programId },
      data: {
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        descriptionEn: dto.descriptionEn,
        descriptionAr: dto.descriptionAr,
        durationWeeks: dto.durationWeeks,
        priceEGP: dto.priceEGP,
        status: dto.status,
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return program;
  }

  /**
   * Publish a draft program (make it active)
   */
  async publish(userId: string, programId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Validate program has at least one workout day with exercises
    if (program.workoutDays.length === 0) {
      throw new BadRequestException('Program must have at least one workout day');
    }

    const hasExercises = program.workoutDays.some((day) => day.exercises.length > 0);
    if (!hasExercises) {
      throw new BadRequestException('Program must have at least one exercise');
    }

    return this.prisma.trainerProgram.update({
      where: { id: programId },
      data: { status: 'ACTIVE' },
    });
  }

  /**
   * Archive a program
   */
  async archive(userId: string, programId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const existing = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Program not found');
    }

    return this.prisma.trainerProgram.update({
      where: { id: programId },
      data: { status: 'ARCHIVED' },
    });
  }

  /**
   * Delete a program (only drafts with no clients)
   */
  async remove(userId: string, programId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
      include: {
        _count: {
          select: { clients: true },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program._count.clients > 0) {
      throw new BadRequestException(
        'Cannot delete program with active clients. Archive it instead.',
      );
    }

    // Delete workout days and exercises (cascade should handle this)
    await this.prisma.trainerProgram.delete({
      where: { id: programId },
    });

    return { success: true };
  }

  /**
   * Duplicate a program
   */
  async duplicate(userId: string, programId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    const original = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!original) {
      throw new NotFoundException('Program not found');
    }

    // Create duplicate
    const duplicate = await this.prisma.trainerProgram.create({
      data: {
        trainerId,
        nameEn: `${original.nameEn} (Copy)`,
        nameAr: original.nameAr ? `${original.nameAr} (نسخة)` : null,
        descriptionEn: original.descriptionEn,
        descriptionAr: original.descriptionAr,
        durationWeeks: original.durationWeeks,
        priceEGP: original.priceEGP,
        sourceType: 'manual',
        status: 'DRAFT',
        workoutDays: {
          create: original.workoutDays.map((day) => ({
            dayNumber: day.dayNumber,
            nameEn: day.nameEn,
            nameAr: day.nameAr,
            notesEn: day.notesEn,
            notesAr: day.notesAr,
            exercises: {
              create: day.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                customNameEn: ex.customNameEn,
                customNameAr: ex.customNameAr,
                order: ex.order,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                notesEn: ex.notesEn,
                notesAr: ex.notesAr,
              })),
            },
          })),
        },
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return duplicate;
  }

  /**
   * Add a workout day to a program
   */
  async addWorkoutDay(
    userId: string,
    programId: string,
    data: { nameEn?: string; nameAr?: string },
  ) {
    const trainerId = await this.getTrainerProfileId(userId);

    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
      },
      include: {
        workoutDays: {
          select: { dayNumber: true },
          orderBy: { dayNumber: 'desc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const nextDayNumber = (program.workoutDays[0]?.dayNumber || 0) + 1;

    return this.prisma.programWorkoutDay.create({
      data: {
        programId,
        dayNumber: nextDayNumber,
        nameEn: data.nameEn || `Day ${nextDayNumber}`,
        nameAr: data.nameAr,
      },
      include: {
        exercises: true,
      },
    });
  }

  /**
   * Update a workout day
   */
  async updateWorkoutDay(
    userId: string,
    programId: string,
    dayId: string,
    data: { nameEn?: string; nameAr?: string; notesEn?: string; notesAr?: string },
  ) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership
    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
        workoutDays: {
          some: { id: dayId },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Workout day not found');
    }

    return this.prisma.programWorkoutDay.update({
      where: { id: dayId },
      data,
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Delete a workout day
   */
  async removeWorkoutDay(userId: string, programId: string, dayId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership
    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
        workoutDays: {
          some: { id: dayId },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Workout day not found');
    }

    await this.prisma.programWorkoutDay.delete({
      where: { id: dayId },
    });

    return { success: true };
  }

  /**
   * Add exercise to a workout day
   */
  async addExercise(
    userId: string,
    programId: string,
    dayId: string,
    data: {
      exerciseId?: string;
      customNameEn?: string;
      customNameAr?: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      notesEn?: string;
    },
  ) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership
    const program = await this.prisma.trainerProgram.findFirst({
      where: {
        id: programId,
        trainerId,
        workoutDays: {
          some: { id: dayId },
        },
      },
      include: {
        workoutDays: {
          where: { id: dayId },
          include: {
            exercises: {
              select: { order: true },
              orderBy: { order: 'desc' },
            },
          },
        },
      },
    });

    if (!program || program.workoutDays.length === 0) {
      throw new NotFoundException('Workout day not found');
    }

    const nextOrder = (program.workoutDays[0].exercises[0]?.order || 0) + 1;

    return this.prisma.programExercise.create({
      data: {
        workoutDayId: dayId,
        exerciseId: data.exerciseId,
        customNameEn: data.customNameEn,
        customNameAr: data.customNameAr,
        order: nextOrder,
        sets: data.sets,
        reps: data.reps,
        restSeconds: data.restSeconds ?? 60,
        notesEn: data.notesEn,
      },
      include: {
        exercise: true,
      },
    });
  }

  /**
   * Update an exercise
   */
  async updateExercise(
    userId: string,
    programId: string,
    exerciseId: string,
    data: {
      sets?: number;
      reps?: string;
      restSeconds?: number;
      notesEn?: string;
      notesAr?: string;
      order?: number;
    },
  ) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership through program
    const exercise = await this.prisma.programExercise.findFirst({
      where: {
        id: exerciseId,
        workoutDay: {
          program: {
            id: programId,
            trainerId,
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return this.prisma.programExercise.update({
      where: { id: exerciseId },
      data,
      include: {
        exercise: true,
      },
    });
  }

  /**
   * Remove an exercise
   */
  async removeExercise(userId: string, programId: string, exerciseId: string) {
    const trainerId = await this.getTrainerProfileId(userId);

    // Verify ownership
    const exercise = await this.prisma.programExercise.findFirst({
      where: {
        id: exerciseId,
        workoutDay: {
          program: {
            id: programId,
            trainerId,
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    await this.prisma.programExercise.delete({
      where: { id: exerciseId },
    });

    return { success: true };
  }
}
