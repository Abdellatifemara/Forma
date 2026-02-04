import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { SquadsService } from './squads.service';

@ApiTags('squads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('squads')
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new squad' })
  async createSquad(
    @CurrentUser() user: User,
    @Body() dto: {
      name: string;
      description?: string;
      isPublic?: boolean;
      maxMembers?: number;
    },
  ) {
    return this.squadsService.createSquad(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get squads the user is a member of' })
  async getMySquads(@CurrentUser() user: User) {
    return this.squadsService.getUserSquads(user.id);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover public squads to join' })
  async discoverSquads(
    @CurrentUser() user: User,
    @Query('search') search?: string,
  ) {
    return this.squadsService.getPublicSquads(user.id, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get squad details' })
  async getSquad(@CurrentUser() user: User, @Param('id') id: string) {
    return this.squadsService.getSquad(id, user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a squad' })
  async joinSquad(@CurrentUser() user: User, @Param('id') id: string) {
    return this.squadsService.joinSquad(id, user.id);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a squad' })
  async leaveSquad(@CurrentUser() user: User, @Param('id') id: string) {
    return this.squadsService.leaveSquad(id, user.id);
  }

  @Post(':id/challenges')
  @ApiOperation({ summary: 'Create a challenge in the squad' })
  async createChallenge(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: {
      name: string;
      description?: string;
      type: 'workout_count' | 'total_volume' | 'streak_days' | 'calories_burned';
      target: number;
      durationDays: number;
    },
  ) {
    return this.squadsService.createChallenge(id, user.id, dto);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get squad leaderboard' })
  async getLeaderboard(@Param('id') id: string) {
    return this.squadsService.getSquadLeaderboard(id);
  }

  @Get('challenges/:challengeId/leaderboard')
  @ApiOperation({ summary: 'Get challenge leaderboard' })
  async getChallengeLeaderboard(@Param('challengeId') challengeId: string) {
    return this.squadsService.getChallengeLeaderboard(challengeId);
  }

  @Post(':id/share-workout')
  @ApiOperation({ summary: 'Share a completed workout to the squad' })
  async shareWorkout(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: { workoutLogId: string },
  ) {
    return this.squadsService.shareWorkout(id, user.id, dto.workoutLogId);
  }
}
