import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CrossfitService } from './crossfit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User, CrossfitWodType, CrossfitScoreType } from '@prisma/client';

@ApiTags('crossfit')
@Controller('crossfit')
export class CrossfitController {
  constructor(private readonly crossfitService: CrossfitService) {}

  // ── WODs (Public) ────────────────────────────────────────────

  @Public()
  @Get('wod-of-day')
  @ApiOperation({ summary: 'Get the WOD of the day' })
  getWodOfDay() {
    return this.crossfitService.getWodOfDay();
  }

  @Public()
  @Get('random-wod')
  @ApiOperation({ summary: 'Get a random WOD' })
  @ApiQuery({ name: 'type', required: false, enum: ['girl', 'hero'] })
  getRandomWod(@Query('type') type?: 'girl' | 'hero') {
    return this.crossfitService.getRandomWod(type);
  }

  // ── Scores (Authenticated) ──────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('scores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log a CrossFit score' })
  async logScore(
    @CurrentUser() user: User,
    @Body() data: {
      wodName: string;
      wodType: CrossfitWodType;
      scoreType: CrossfitScoreType;
      scoreValue: number;
      rx?: boolean;
      scaled?: boolean;
      notes?: string;
    },
  ) {
    return this.crossfitService.logScore(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('scores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get score history' })
  @ApiQuery({ name: 'wodName', required: false })
  async getScoreHistory(
    @CurrentUser() user: User,
    @Query('wodName') wodName?: string,
  ) {
    return this.crossfitService.getScoreHistory(user.id, wodName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('benchmark-history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get benchmark WOD history with PRs' })
  async getBenchmarkHistory(@CurrentUser() user: User) {
    return this.crossfitService.getBenchmarkHistory(user.id);
  }

  // ── PR Board ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('pr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log a new PR' })
  async logPR(
    @CurrentUser() user: User,
    @Body() data: {
      movement: string;
      value: number;
      unit: string;
      notes?: string;
    },
  ) {
    return this.crossfitService.logPR(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pr-board')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get PR board' })
  async getPRBoard(@CurrentUser() user: User) {
    return this.crossfitService.getPRBoard(user.id);
  }
}
