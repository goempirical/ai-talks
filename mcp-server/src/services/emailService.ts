/**
 * Email service for sending emails through SMTP
 */

import nodemailer from 'nodemailer';
import { EmailConfig, EmailMessage } from '../types/index.js';
import { serverConfig } from '../config/index.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Test the email connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email transporter not initialized. Check your email configuration.',
      };
    }

    try {
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
        cc: message.cc ? (Array.isArray(message.cc) ? message.cc.join(', ') : message.cc) : undefined,
        bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc.join(', ') : message.bcc) : undefined,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send a simple text email
   */
  async sendSimpleEmail(to: string, subject: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      subject,
      text,
    });
  }

  /**
   * Send an HTML email
   */
  async sendHtmlEmail(to: string, subject: string, html: string, text?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Get email service status
   */
  getStatus(): { initialized: boolean; configured: boolean } {
    return {
      initialized: this.transporter !== null,
      configured: !!(this.config.auth.user && this.config.auth.pass && this.config.from),
    };
  }
}

// Create and export the email service instance
export const emailService = new EmailService(serverConfig.email);

// Export the class for testing purposes
export { EmailService };