import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/** Escape user-supplied strings before embedding in HTML to prevent XSS/injection */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail = 'Forma <noreply@formaeg.com>';
  private readonly ownerEmail: string;

  private readonly emailEnabled: boolean;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.emailEnabled = !!apiKey;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not set — emails disabled, will be logged only');
    }
    // Use a placeholder key when disabled so Resend client doesn't crash on init,
    // but all send() calls are gated by emailEnabled check
    this.resend = new Resend(apiKey || 're_placeholder_key_emails_disabled');
    this.ownerEmail = this.config.get<string>('ERROR_REPORT_EMAIL') || '';
  }

  // ─── Logo + Brand Header ─────────────────────────────────
  private brandHeader(): string {
    return `
      <div style="text-align:center;padding:24px 0 16px;border-bottom:2px solid #10B981">
        <h1 style="margin:0;font-size:28px;font-weight:800;color:#10B981;letter-spacing:-0.5px">FORMA</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#6B7280;letter-spacing:1px">SHAPE YOUR FUTURE</p>
      </div>
    `;
  }

  private brandFooter(): string {
    return `
      <div style="text-align:center;padding:20px 0;border-top:1px solid #E5E7EB;margin-top:24px">
        <p style="margin:0;font-size:12px;color:#9CA3AF">Forma Fitness &copy; ${new Date().getFullYear()}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#9CA3AF">formaeg.com</p>
      </div>
    `;
  }

  private wrapHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F9FAFB">
        <div style="max-width:520px;margin:0 auto;padding:20px">
          <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
            ${this.brandHeader()}
            <div style="padding:24px 28px">
              ${content}
            </div>
            ${this.brandFooter()}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ─── Send Email ──────────────────────────────────────────
  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.emailEnabled) {
      this.logger.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
      return false;
    }
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: this.wrapHtml(html),
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        return false;
      }

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Email error: ${err}`);
      return false;
    }
  }

  // ─── Welcome / Registration ──────────────────────────────
  async sendWelcome(to: string, name: string): Promise<boolean> {
    const safeName = escapeHtml(name);
    return this.send(to, 'Welcome to Forma! 💪', `
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827">Welcome, ${safeName}!</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        You've just joined Egypt's premier fitness platform. We're excited to have you!
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        Your <strong>7-day free trial</strong> starts now. Explore everything Forma has to offer:
      </p>
      <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8">
        <li>AI-powered workout recommendations</li>
        <li>Egyptian food database with full nutrition info</li>
        <li>Health dashboard with wearable integration</li>
        <li>Guided chat coach to help you every step</li>
      </ul>
      <div style="text-align:center;padding:16px 0">
        <a href="https://formaeg.com/workouts" style="display:inline-block;padding:12px 32px;background:#10B981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          Start Your First Workout
        </a>
      </div>
    `);
  }

  // ─── Account Deleted ─────────────────────────────────────
  async sendAccountDeleted(to: string, name: string): Promise<boolean> {
    const safeName = escapeHtml(name);
    return this.send(to, 'Your Forma account has been deleted', `
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827">Goodbye, ${safeName}</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        Your Forma account and all associated data have been permanently deleted.
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        If this wasn't you, please contact us immediately at
        <a href="mailto:support@formaeg.com" style="color:#10B981">support@formaeg.com</a>
      </p>
      <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6">
        We're sorry to see you go. You're always welcome back.
      </p>
    `);
  }

  // ─── Password Reset ──────────────────────────────────────
  async sendPasswordReset(to: string, name: string, resetLink: string): Promise<boolean> {
    const safeName = escapeHtml(name);
    // Only allow https:// links — prevent javascript: or data: URI injection
    const safeLink = resetLink.startsWith('https://') ? resetLink : 'https://formaeg.com/reset-password';
    return this.send(to, 'Reset your Forma password', `
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827">Password Reset</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        Hi ${safeName}, we received a request to reset your password.
      </p>
      <div style="text-align:center;padding:16px 0">
        <a href="${safeLink}" style="display:inline-block;padding:12px 32px;background:#10B981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          Reset Password
        </a>
      </div>
      <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6">
        This link expires in 1 hour. If you didn't request this, ignore this email.
      </p>
    `);
  }

  // ─── Subscription Confirmed ──────────────────────────────
  async sendSubscriptionConfirmed(to: string, name: string, tier: string, amount: string): Promise<boolean> {
    const tierLabel = tier === 'PREMIUM_PLUS' ? 'Premium+' : 'Premium';
    const safeName = escapeHtml(name);
    const safeAmount = escapeHtml(amount);
    return this.send(to, `Forma ${tierLabel} Activated! 🎉`, `
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827">You're now ${tierLabel}!</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        Hi ${safeName}, your ${tierLabel} subscription is now active.
      </p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#166534"><strong>Plan:</strong> ${tierLabel}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#166534"><strong>Amount:</strong> ${safeAmount} LE/month</p>
      </div>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">
        Enjoy all your new features. Let's shape your future together!
      </p>
    `);
  }

  // ─── Trial Ending ────────────────────────────────────────
  async sendTrialEnding(to: string, name: string, daysLeft: number): Promise<boolean> {
    const safeName = escapeHtml(name);
    const safeDays = Math.max(0, Math.floor(daysLeft)); // enforce numeric, no injection possible
    return this.send(to, `Your Forma trial ends in ${safeDays} day${safeDays > 1 ? 's' : ''}`, `
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827">Trial Ending Soon</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        Hi ${safeName}, your free trial ends in <strong>${safeDays} day${safeDays > 1 ? 's' : ''}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6">
        Subscribe now to keep all your data and continue your fitness journey.
      </p>
      <div style="text-align:center;padding:16px 0">
        <a href="https://formaeg.com/checkout" style="display:inline-block;padding:12px 32px;background:#10B981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          Subscribe Now
        </a>
      </div>
    `);
  }

  // ─── Error Report to Owner ───────────────────────────────
  async sendErrorReport(errors: Array<{
    message: string;
    url: string;
    status?: number;
    userId?: string;
    count: number;
    firstSeen: string;
  }>): Promise<boolean> {
    const errorRows = errors.map(e => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#EF4444;font-weight:600">${escapeHtml(String(e.status || 'JS'))}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#374151">${escapeHtml(e.message.slice(0, 100))}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#6B7280">${escapeHtml(e.url)}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#6B7280;text-align:center">${escapeHtml(String(e.count))}</td>
      </tr>
    `).join('');

    return this.send(this.ownerEmail, `⚠️ Forma Error Report (${errors.length} errors)`, `
      <h2 style="margin:0 0 16px;font-size:20px;color:#DC2626">Error Report</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">
        <strong>${errors.length}</strong> error(s) detected on formaeg.com:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#F3F4F6">
            <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280">Status</th>
            <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280">Error</th>
            <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280">Page</th>
            <th style="padding:8px;text-align:center;font-size:11px;color:#6B7280">#</th>
          </tr>
        </thead>
        <tbody>
          ${errorRows}
        </tbody>
      </table>
      <p style="margin:0;font-size:12px;color:#9CA3AF">
        Sent at ${new Date().toISOString()}
      </p>
    `);
  }
}
