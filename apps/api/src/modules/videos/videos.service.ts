import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoCategory } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all videos by category
   */
  async getByCategory(category: VideoCategory) {
    return this.prisma.video.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        titleAr: true,
        description: true,
        descriptionAr: true,
        category: true,
        tags: true,
        durationSeconds: true,
        thumbnailUrl: true,
      },
    });
  }

  /**
   * Get all active videos
   */
  async getAll() {
    return this.prisma.video.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        titleAr: true,
        category: true,
        tags: true,
        durationSeconds: true,
        thumbnailUrl: true,
      },
    });
  }

  /**
   * Get video by ID
   */
  async getById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  /**
   * Get video by YouTube ID
   */
  async getByYoutubeId(youtubeId: string) {
    const video = await this.prisma.video.findUnique({
      where: { youtubeId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  /**
   * Get YouTube IDs only (lightweight endpoint for players)
   */
  async getYoutubeIds(category?: VideoCategory) {
    const where = category
      ? { category, isActive: true }
      : { isActive: true };

    const videos = await this.prisma.video.findMany({
      where,
      select: {
        youtubeId: true,
        title: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return videos.map((v) => ({
      youtubeId: v.youtubeId,
      title: v.title,
      category: v.category,
    }));
  }

  /**
   * Search videos by tags or title
   */
  async search(query: string, category?: VideoCategory) {
    const where: any = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { titleAr: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    };

    if (category) {
      where.category = category;
    }

    return this.prisma.video.findMany({
      where,
      select: {
        id: true,
        youtubeId: true,
        title: true,
        titleAr: true,
        category: true,
        tags: true,
        durationSeconds: true,
        thumbnailUrl: true,
      },
      take: 20,
    });
  }

  /**
   * Create a new video entry
   */
  async create(data: {
    youtubeId: string;
    title: string;
    titleAr?: string;
    description?: string;
    descriptionAr?: string;
    category: VideoCategory;
    tags?: string[];
    durationSeconds?: number;
    thumbnailUrl?: string;
  }) {
    return this.prisma.video.create({
      data: {
        ...data,
        // Auto-generate thumbnail if not provided
        thumbnailUrl:
          data.thumbnailUrl ||
          `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`,
      },
    });
  }

  /**
   * Bulk create videos (for seeding)
   */
  async bulkCreate(
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
    const data = videos.map((v) => ({
      ...v,
      thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
    }));

    return this.prisma.video.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Update video
   */
  async update(
    id: string,
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
    return this.prisma.video.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete (deactivate) video
   */
  async deactivate(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
