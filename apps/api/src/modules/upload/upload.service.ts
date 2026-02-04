import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

interface ModerationResult {
  flagged: boolean;
  categories: string[];
  confidence: number;
}

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; publicId: string; moderated: boolean }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check if user is banned from uploading
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { bannedAt: true, uploadBanReason: true },
    });

    if (user?.bannedAt) {
      throw new ForbiddenException(
        `You are banned from uploading images. Reason: ${user.uploadBanReason || 'Violation of community guidelines'}`,
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `forma/chat/images/${userId}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' },
          ],
          // Enable moderation using Cloudinary's built-in NSFW detection
          // This uses Google's Vision API or AWS Rekognition depending on account setup
          moderation: 'aws_rek',
        },
        async (error, result) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else if (result) {
            // Check moderation result (Cloudinary returns moderation array with status)
            const moderationResult = (result as any).moderation?.[0];
            const isRejected = moderationResult?.status === 'rejected';

            if (isRejected) {
              // Delete the uploaded image
              await cloudinary.uploader.destroy(result.public_id);

              // Log the violation
              await this.logContentViolation(userId, result.public_id, 'NSFW content detected');

              // Check violation count and potentially ban user
              await this.checkAndBanUser(userId);

              reject(
                new ForbiddenException(
                  'Image rejected: Content violates community guidelines. Repeated violations may result in account suspension.',
                ),
              );
              return;
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              moderated: true,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  // Log content violation for review
  private async logContentViolation(
    userId: string,
    publicId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.prisma.contentViolation.create({
        data: {
          userId,
          resourceId: publicId,
          type: 'IMAGE',
          reason,
          detectedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log content violation:', error);
    }
  }

  // Check violation count and ban user if necessary
  private async checkAndBanUser(userId: string): Promise<void> {
    try {
      const violationCount = await this.prisma.contentViolation.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      // Ban after 3 violations in 30 days
      if (violationCount >= 3) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            bannedAt: new Date(),
            uploadBanReason: 'Multiple content policy violations',
          },
        });
      }
    } catch (error) {
      console.error('Failed to check/ban user:', error);
    }
  }

  async uploadVoice(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; publicId: string; duration?: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'audio/x-m4a',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only WebM, MP4, MP3, OGG, WAV, and M4A audio are allowed.',
      );
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 25MB limit');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `forma/chat/voice/${userId}`,
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          format: 'mp3',
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              duration: result.duration,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
    }
  }
}
