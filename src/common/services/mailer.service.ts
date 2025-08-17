import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Store <no-reply@yourstore.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendApprovalEmail(to: string, username: string) {
    const subject = 'Your account has been approved';
    const html = `<p>Hello ${username},</p><p>Your account has been approved. You can now log in and use the system.</p>`;
    await this.sendMail(to, subject, html);
  }

  async sendRejectionEmail(to: string, username: string) {
    const subject = 'Your account registration was rejected';
    const html = `<p>Hello ${username},</p><p>We regret to inform you that your account registration was rejected. Please contact support for more information.</p>`;
    await this.sendMail(to, subject, html);
  }

  async sendPromotionEmail(to: string, username: string) {
    const subject = 'You have been promoted to admin';
    const html = `<p>Hello ${username},</p><p>Congratulations! Your account has been promoted to admin. You now have administrative privileges.</p>`;
    await this.sendMail(to, subject, html);
  }
} 