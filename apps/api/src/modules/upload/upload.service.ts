import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { R2_CLIENT } from './r2.provider';

@Injectable()
export class UploadService {
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(R2_CLIENT) private readonly r2: S3Client | null,
  ) {
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'forma-media';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';
  }

  private getFileUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    // Fallback: R2 public bucket URL
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    return `https://${this.bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
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

    // Check ban
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { bannedAt: true, uploadBanReason: true },
    });

    if (user?.bannedAt) {
      throw new ForbiddenException(
        `You are banned from uploading images. Reason: ${user.uploadBanReason || 'Violation of community guidelines'}`,
      );
    }

    const ext = file.mimetype.split('/')[1] || 'jpg';
    const key = `images/${userId}/${randomUUID()}.${ext}`;

    await this.putObject(key, file.buffer, file.mimetype);

    return { url: this.getFileUrl(key), key };
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const ext = file.mimetype.split('/')[1] || 'jpg';
    const key = `avatars/${userId}.${ext}`;

    await this.putObject(key, file.buffer, file.mimetype, 'public-read');

    const url = this.getFileUrl(key);

    // Update user avatar in DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    return { url, key };
  }

  async uploadVoice(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'audio/webm', 'audio/mp4', 'audio/mpeg',
      'audio/ogg', 'audio/wav', 'audio/x-m4a',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only WebM, MP4, MP3, OGG, WAV, and M4A audio are allowed.');
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 25MB limit');
    }

    const ext = file.originalname?.split('.').pop() || 'webm';
    const key = `voice/${userId}/${randomUUID()}.${ext}`;

    await this.putObject(key, file.buffer, file.mimetype);

    return { url: this.getFileUrl(key), key };
  }

  async uploadPdf(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Invalid file type. Only PDF files are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const key = `pdfs/${userId}/${randomUUID()}.pdf`;

    await this.putObject(key, file.buffer, file.mimetype);

    return { url: this.getFileUrl(key), key };
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.r2) return;

    try {
      await this.r2.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Failed to delete file from R2:', error);
    }
  }

  private async putObject(
    key: string,
    body: Buffer,
    contentType: string,
    _acl?: string,
  ): Promise<void> {
    if (!this.r2) {
      throw new BadRequestException('Storage not configured. Contact support.');
    }

    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}
