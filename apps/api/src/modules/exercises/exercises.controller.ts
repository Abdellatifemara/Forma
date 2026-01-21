import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { SearchExercisesDto } from './dto/search-exercises.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User, MuscleGroup } from '@prisma/client';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter exercises' })
  @ApiResponse({ status: 200, description: 'Returns paginated exercise list' })
  async search(@Query() searchDto: SearchExercisesDto) {
    return this.exercisesService.search(searchDto);
  }

  @Public()
  @Get('muscles')
  @ApiOperation({ summary: 'Get exercise counts by muscle group' })
  @ApiResponse({ status: 200, description: 'Returns muscle groups with counts' })
  async getMuscleGroupCounts() {
    return this.exercisesService.getMuscleGroupCounts();
  }

  @Public()
  @Get('muscle/:muscle')
  @ApiOperation({ summary: 'Get exercises by muscle group' })
  @ApiParam({ name: 'muscle', enum: MuscleGroup })
  @ApiResponse({ status: 200, description: 'Returns exercises for muscle group' })
  async getByMuscleGroup(@Param('muscle') muscle: MuscleGroup) {
    return this.exercisesService.getByMuscleGroup(muscle);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exercises available for user based on their equipment' })
  @ApiResponse({ status: 200, description: 'Returns exercises matching user equipment' })
  async getRecommended(
    @CurrentUser() user: User,
    @Query('muscle') muscle?: MuscleGroup,
  ) {
    return this.exercisesService.getForUser(user.id, muscle);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiResponse({ status: 200, description: 'Returns exercise details' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async getById(@Param('id') id: string) {
    const exercise = await this.exercisesService.findById(id);
    if (!exercise) {
      // Try by external ID
      const byExternal = await this.exercisesService.findByExternalId(id);
      if (!byExternal) {
        return { error: 'Exercise not found', statusCode: 404 };
      }
      return byExternal;
    }
    return exercise;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user history for a specific exercise' })
  @ApiResponse({ status: 200, description: 'Returns exercise history with stats' })
  async getHistory(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.exercisesService.getExerciseHistory(user.id, id);
  }
}
