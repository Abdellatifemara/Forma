import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { VideoCategory } from '@prisma/client';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiQuery({ name: 'category', enum: VideoCategory, required: false })
  async getAll(@Query('category') category?: VideoCategory) {
    if (category) {
      return this.videosService.getByCategory(category);
    }
    return this.videosService.getAll();
  }

  @Get('youtube-ids')
  @Public()
  @ApiOperation({ summary: 'Get YouTube IDs only (lightweight)' })
  @ApiQuery({ name: 'category', enum: VideoCategory, required: false })
  async getYoutubeIds(@Query('category') category?: VideoCategory) {
    return this.videosService.getYoutubeIds(category);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search videos by title or tags' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'category', enum: VideoCategory, required: false })
  async search(
    @Query('q') query: string,
    @Query('category') category?: VideoCategory,
  ) {
    return this.videosService.search(query, category);
  }

  @Get('category/:category')
  @Public()
  @ApiOperation({ summary: 'Get videos by category' })
  async getByCategory(@Param('category') category: VideoCategory) {
    return this.videosService.getByCategory(category);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get video by ID' })
  async getById(@Param('id') id: string) {
    return this.videosService.getById(id);
  }

  @Get('youtube/:youtubeId')
  @Public()
  @ApiOperation({ summary: 'Get video by YouTube ID' })
  async getByYoutubeId(@Param('youtubeId') youtubeId: string) {
    return this.videosService.getByYoutubeId(youtubeId);
  }

  // Admin endpoints (protected)

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new video (Admin)' })
  async create(
    @Body()
    data: {
      youtubeId: string;
      title: string;
      titleAr?: string;
      description?: string;
      descriptionAr?: string;
      category: VideoCategory;
      tags?: string[];
      durationSeconds?: number;
    },
  ) {
    return this.videosService.create(data);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create videos (Admin)' })
  async bulkCreate(
    @Body()
    videos: Array<{
      youtubeId: string;
      title: string;
      titleAr?: string;
      description?: string;
      category: VideoCategory;
      tags?: string[];
      durationSeconds?: number;
    }>,
  ) {
    return this.videosService.bulkCreate(videos);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video (Admin)' })
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      titleAr?: string;
      description?: string;
      descriptionAr?: string;
      category?: VideoCategory;
      tags?: string[];
      isActive?: boolean;
    },
  ) {
    return this.videosService.update(id, data);
  }
}
