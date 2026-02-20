import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
@Throttle({ short: { limit: 5, ttl: 10000 }, medium: { limit: 20, ttl: 60000 } })
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    const result = await this.uploadService.uploadImage(file, req.user.id);
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  }

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
      },
    }),
  )
  async uploadVoice(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    const result = await this.uploadService.uploadVoice(file, req.user.id);
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      duration: result.duration,
    };
  }

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    const result = await this.uploadService.uploadPdf(file, req.user.id);
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      pages: result.pages,
    };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for avatars
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Try Cloudinary first, fallback to base64
    try {
      const result = await this.uploadService.uploadImage(file, req.user.id);

      // Update user's avatar URL
      await this.prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl: result.url },
      });

      return {
        success: true,
        url: result.url,
      };
    } catch (error) {
      // Fallback to base64 data URL
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;

      // Update user's avatar URL with base64
      await this.prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl: dataUrl },
      });

      return {
        success: true,
        url: dataUrl,
      };
    }
  }
}
