import { Controller, Post, Body, Logger, HttpCode, Ip } from '@nestjs/common';
import { EmailService } from '../email/email.service';

interface ErrorReport {
  errors: Array<{
    message: string;
    url: string;
    endpoint?: string;
    status?: number;
    stack?: string;
    userId?: string;
    userAgent?: string;
    count: number;
    firstSeen: string;
  }>;
}

@Controller('errors')
export class ErrorReportingController {
  private readonly logger = new Logger(ErrorReportingController.name);
  private errorBuffer: Map<string, ErrorReport['errors'][0]> = new Map();
  private lastFlush = Date.now();
  private readonly FLUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Simple in-memory rate limiter: max 10 reports per IP per minute
  private rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX = 10;

  constructor(private email: EmailService) {}

  @Post('report')
  @HttpCode(200)
  async reportErrors(@Body() body: ErrorReport, @Ip() ip: string) {
    // Rate limit check
    const now = Date.now();
    const limiter = this.rateLimitMap.get(ip);
    if (limiter && now < limiter.resetAt) {
      if (limiter.count >= this.RATE_LIMIT_MAX) {
        return { ok: true, throttled: true };
      }
      limiter.count++;
    } else {
      this.rateLimitMap.set(ip, { count: 1, resetAt: now + this.RATE_LIMIT_WINDOW });
    }
    // Cleanup stale entries periodically
    if (this.rateLimitMap.size > 1000) {
      for (const [key, val] of this.rateLimitMap) {
        if (now > val.resetAt) this.rateLimitMap.delete(key);
      }
    }
    if (!body.errors?.length) return { ok: true };

    // Buffer errors and deduplicate
    for (const err of body.errors) {
      const key = `${err.status}:${err.message}:${err.url}`;
      const existing = this.errorBuffer.get(key);
      if (existing) {
        existing.count += err.count;
      } else {
        this.errorBuffer.set(key, { ...err });
      }
    }

    this.logger.warn(`Received ${body.errors.length} error report(s) from frontend`);

    // Flush if enough time passed or too many errors
    if (
      this.errorBuffer.size >= 10 ||
      Date.now() - this.lastFlush > this.FLUSH_INTERVAL
    ) {
      await this.flush();
    }

    return { ok: true };
  }

  private async flush() {
    if (this.errorBuffer.size === 0) return;

    const errors = Array.from(this.errorBuffer.values());
    this.errorBuffer.clear();
    this.lastFlush = Date.now();

    try {
      await this.email.sendErrorReport(errors);
      this.logger.log(`Flushed ${errors.length} error(s) to owner email`);
    } catch (err) {
      this.logger.error(`Failed to send error report email: ${err}`);
    }
  }
}
