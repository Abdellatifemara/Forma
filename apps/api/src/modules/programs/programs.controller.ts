import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  /**
   * Create a new program
   */
  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateProgramDto,
  ) {
    return this.programsService.create(req.user.id, dto);
  }

  /**
   * Create program from parsed PDF data
   */
  @Post('from-pdf')
  async createFromPdf(
    @Request() req: { user: { id: string } },
    @Body() body: { pdfUrl: string; parsedData: any },
  ) {
    return this.programsService.createFromPdf(
      req.user.id,
      body.pdfUrl,
      body.parsedData,
    );
  }

  /**
   * Get all programs for current trainer
   */
  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.programsService.findAllForTrainer(req.user.id);
  }

  /**
   * Get single program with full details
   */
  @Get(':id')
  async findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.programsService.findOne(req.user.id, id);
  }

  /**
   * Update a program
   */
  @Patch(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(req.user.id, id, dto);
  }

  /**
   * Publish a draft program
   */
  @Post(':id/publish')
  async publish(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.programsService.publish(req.user.id, id);
  }

  /**
   * Archive a program
   */
  @Post(':id/archive')
  async archive(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.programsService.archive(req.user.id, id);
  }

  /**
   * Duplicate a program
   */
  @Post(':id/duplicate')
  async duplicate(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.programsService.duplicate(req.user.id, id);
  }

  /**
   * Delete a program
   */
  @Delete(':id')
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.programsService.remove(req.user.id, id);
  }

  // Workout Day endpoints

  /**
   * Add workout day to program
   */
  @Post(':id/days')
  async addWorkoutDay(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { nameEn?: string; nameAr?: string },
  ) {
    return this.programsService.addWorkoutDay(req.user.id, id, body);
  }

  /**
   * Update workout day
   */
  @Patch(':id/days/:dayId')
  async updateWorkoutDay(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('dayId') dayId: string,
    @Body() body: { nameEn?: string; nameAr?: string; notesEn?: string; notesAr?: string },
  ) {
    return this.programsService.updateWorkoutDay(req.user.id, id, dayId, body);
  }

  /**
   * Delete workout day
   */
  @Delete(':id/days/:dayId')
  async removeWorkoutDay(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('dayId') dayId: string,
  ) {
    return this.programsService.removeWorkoutDay(req.user.id, id, dayId);
  }

  // Exercise endpoints

  /**
   * Add exercise to workout day
   */
  @Post(':id/days/:dayId/exercises')
  async addExercise(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('dayId') dayId: string,
    @Body()
    body: {
      exerciseId?: string;
      customNameEn?: string;
      customNameAr?: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      notesEn?: string;
    },
  ) {
    return this.programsService.addExercise(req.user.id, id, dayId, body);
  }

  /**
   * Update exercise
   */
  @Patch(':id/exercises/:exerciseId')
  async updateExercise(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Body()
    body: {
      sets?: number;
      reps?: string;
      restSeconds?: number;
      notesEn?: string;
      notesAr?: string;
      order?: number;
    },
  ) {
    return this.programsService.updateExercise(req.user.id, id, exerciseId, body);
  }

  /**
   * Delete exercise
   */
  @Delete(':id/exercises/:exerciseId')
  async removeExercise(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.programsService.removeExercise(req.user.id, id, exerciseId);
  }
}
