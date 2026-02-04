import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { InjuryModificationsService } from './injury-modifications.service';

@ApiTags('injury-modifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('injury-modifications')
export class InjuryModificationsController {
  constructor(private readonly injuryModificationsService: InjuryModificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all injury-based modifications for user' })
  async getModifications(@CurrentUser() user: User) {
    return this.injuryModificationsService.getModifications(user.id);
  }

  @Post('check-exercise')
  @ApiOperation({ summary: 'Check if an exercise is safe for user injuries' })
  async checkExercise(
    @CurrentUser() user: User,
    @Body() body: { exerciseName: string },
  ) {
    return this.injuryModificationsService.isExerciseSafe(user.id, body.exerciseName);
  }

  @Post('modify-workout')
  @ApiOperation({ summary: 'Modify a workout plan based on injuries' })
  async modifyWorkout(
    @CurrentUser() user: User,
    @Body() body: { exercises: { name: string; sets: number; reps: string }[] },
  ) {
    return this.injuryModificationsService.modifyWorkoutForInjuries(user.id, body.exercises);
  }

  @Get('warmup')
  @ApiOperation({ summary: 'Get injury-specific warm-up routine' })
  async getWarmup(@CurrentUser() user: User) {
    return this.injuryModificationsService.getInjuryWarmup(user.id);
  }
}
