import { Controller, Post, Body, Logger } from '@nestjs/common';
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

  constructor(private email: EmailService) {}

  @Post('report')
  async reportErrors(@Body() body: ErrorReport) {
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
