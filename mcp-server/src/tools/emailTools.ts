/**
 * Email tools for the MCP server
 */

import { z } from 'zod';
import { ToolDefinition } from '../types/index.js';
import { emailService } from '../services/emailService.js';
import { createSuccessResult, createErrorResult, isValidEmail, parseCommaSeparated } from '../utils/index.js';
import { serverConfig } from '../config/index.js';

/**
 * Send a simple email
 */
const sendEmailTool: ToolDefinition = {
  name: 'send-email',
  description: 'Send a simple text email to one or more recipients',
  inputSchema: {
    to: z.string().describe('Email address(es) of recipient(s), comma-separated for multiple'),
    subject: z.string().min(1).describe('Subject line of the email'),
    text: z.string().min(1).describe('Plain text content of the email'),
    cc: z.string().optional().describe('CC email address(es), comma-separated for multiple'),
    bcc: z.string().optional().describe('BCC email address(es), comma-separated for multiple'),
  },
  handler: async (params: { to: string; subject: string; text: string; cc?: string; bcc?: string }) => {
    try {
      if (!serverConfig.features.emailEnabled) {
        return createErrorResult('Email feature is disabled. Enable it by setting FEATURE_EMAIL_ENABLED=true');
      }

      // Validate email addresses
      const toEmails = parseCommaSeparated(params.to);
      const ccEmails = params.cc ? parseCommaSeparated(params.cc) : [];
      const bccEmails = params.bcc ? parseCommaSeparated(params.bcc) : [];

      const allEmails = [...toEmails, ...ccEmails, ...bccEmails];
      const invalidEmails = allEmails.filter(email => !isValidEmail(email));

      if (invalidEmails.length > 0) {
        return createErrorResult(`Invalid email address(es): ${invalidEmails.join(', ')}`);
      }

      if (toEmails.length === 0) {
        return createErrorResult('At least one recipient email address is required');
      }

      // Check email service status
      const status = emailService.getStatus();
      if (!status.configured) {
        return createErrorResult('Email service is not properly configured. Please check SMTP settings.');
      }

      // Send the email
      const result = await emailService.sendEmail({
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject: params.subject,
        text: params.text,
      });

      if (result.success) {
        return createSuccessResult(`📧 Email sent successfully!
To: ${toEmails.join(', ')}${ccEmails.length > 0 ? `\nCC: ${ccEmails.join(', ')}` : ''}${bccEmails.length > 0 ? `\nBCC: ${bccEmails.join(', ')}` : ''}
Subject: ${params.subject}
Message ID: ${result.messageId || 'N/A'}`);
      } else {
        return createErrorResult(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      return createErrorResult(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Send an HTML email
 */
const sendHtmlEmailTool: ToolDefinition = {
  name: 'send-html-email',
  description: 'Send an HTML email with optional plain text fallback',
  inputSchema: {
    to: z.string().describe('Email address(es) of recipient(s), comma-separated for multiple'),
    subject: z.string().min(1).describe('Subject line of the email'),
    html: z.string().min(1).describe('HTML content of the email'),
    text: z.string().optional().describe('Plain text fallback content'),
    cc: z.string().optional().describe('CC email address(es), comma-separated for multiple'),
    bcc: z.string().optional().describe('BCC email address(es), comma-separated for multiple'),
  },
  handler: async (params: { to: string; subject: string; html: string; text?: string; cc?: string; bcc?: string }) => {
    try {
      if (!serverConfig.features.emailEnabled) {
        return createErrorResult('Email feature is disabled. Enable it by setting FEATURE_EMAIL_ENABLED=true');
      }

      // Validate email addresses
      const toEmails = parseCommaSeparated(params.to);
      const ccEmails = params.cc ? parseCommaSeparated(params.cc) : [];
      const bccEmails = params.bcc ? parseCommaSeparated(params.bcc) : [];

      const allEmails = [...toEmails, ...ccEmails, ...bccEmails];
      const invalidEmails = allEmails.filter(email => !isValidEmail(email));

      if (invalidEmails.length > 0) {
        return createErrorResult(`Invalid email address(es): ${invalidEmails.join(', ')}`);
      }

      if (toEmails.length === 0) {
        return createErrorResult('At least one recipient email address is required');
      }

      // Check email service status
      const status = emailService.getStatus();
      if (!status.configured) {
        return createErrorResult('Email service is not properly configured. Please check SMTP settings.');
      }

      // Send the email
      const result = await emailService.sendEmail({
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (result.success) {
        return createSuccessResult(`📧 HTML email sent successfully!
To: ${toEmails.join(', ')}${ccEmails.length > 0 ? `\nCC: ${ccEmails.join(', ')}` : ''}${bccEmails.length > 0 ? `\nBCC: ${bccEmails.join(', ')}` : ''}
Subject: ${params.subject}
Format: HTML${params.text ? ' with text fallback' : ''}
Message ID: ${result.messageId || 'N/A'}`);
      } else {
        return createErrorResult(`Failed to send HTML email: ${result.error}`);
      }
    } catch (error) {
      return createErrorResult(`Failed to send HTML email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Test email configuration
 */
const testEmailTool: ToolDefinition = {
  name: 'test-email',
  description: 'Test the email configuration by checking connection to SMTP server',
  inputSchema: {},
  handler: async () => {
    try {
      if (!serverConfig.features.emailEnabled) {
        return createErrorResult('Email feature is disabled. Enable it by setting FEATURE_EMAIL_ENABLED=true');
      }

      const status = emailService.getStatus();
      
      if (!status.configured) {
        return createErrorResult(`Email service is not properly configured:
- SMTP Host: ${serverConfig.email.host}
- SMTP Port: ${serverConfig.email.port}
- SMTP User: ${serverConfig.email.auth.user ? '✅ Set' : '❌ Not set'}
- SMTP Password: ${serverConfig.email.auth.pass ? '✅ Set' : '❌ Not set'}
- From Address: ${serverConfig.email.from ? '✅ Set' : '❌ Not set'}

Please check your environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM`);
      }

      if (!status.initialized) {
        return createErrorResult('Email transporter failed to initialize. Check your SMTP configuration.');
      }

      // Test the connection
      const connectionTest = await emailService.testConnection();
      
      if (connectionTest) {
        return createSuccessResult(`✅ Email configuration test successful!
- SMTP Host: ${serverConfig.email.host}
- SMTP Port: ${serverConfig.email.port}
- SMTP Secure: ${serverConfig.email.secure}
- From Address: ${serverConfig.email.from}
- Connection: ✅ Working`);
      } else {
        return createErrorResult(`❌ Email connection test failed. Please verify:
1. SMTP server settings are correct
2. Username and password are valid
3. Network connectivity to SMTP server
4. Firewall settings allow SMTP traffic`);
      }
    } catch (error) {
      return createErrorResult(`Failed to test email configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Send email notification about task completion
 */
const sendTaskNotificationTool: ToolDefinition = {
  name: 'send-task-notification',
  description: 'Send an email notification about task completion or updates',
  inputSchema: {
    to: z.string().describe('Email address(es) of recipient(s), comma-separated for multiple'),
    taskId: z.string().describe('ID of the task to notify about'),
    action: z.enum(['completed', 'created', 'updated', 'deleted']).describe('Action performed on the task'),
    message: z.string().optional().describe('Additional message to include in the notification'),
  },
  handler: async (params: { to: string; taskId: string; action: 'completed' | 'created' | 'updated' | 'deleted'; message?: string }) => {
    try {
      if (!serverConfig.features.emailEnabled) {
        return createErrorResult('Email feature is disabled. Enable it by setting FEATURE_EMAIL_ENABLED=true');
      }

      // Import task storage (avoiding circular dependency)
      const { tasks } = await import('./taskTools.js');
      const task = tasks.get(params.taskId);

      if (!task && params.action !== 'deleted') {
        return createErrorResult(`Task with ID ${params.taskId} not found.`);
      }

      // Validate email addresses
      const toEmails = parseCommaSeparated(params.to);
      const invalidEmails = toEmails.filter(email => !isValidEmail(email));

      if (invalidEmails.length > 0) {
        return createErrorResult(`Invalid email address(es): ${invalidEmails.join(', ')}`);
      }

      // Generate email content
      const actionEmojis = {
        completed: '✅',
        created: '📝',
        updated: '✏️',
        deleted: '🗑️',
      };

      const actionTexts = {
        completed: 'completed',
        created: 'created',
        updated: 'updated',
        deleted: 'deleted',
      };

      const emoji = actionEmojis[params.action];
      const actionText = actionTexts[params.action];
      
      const subject = `${emoji} Task ${actionText}: ${task?.title || params.taskId}`;
      
      let emailContent = `A task has been ${actionText}:\n\n`;
      
      if (task) {
        emailContent += `Title: ${task.title}\n`;
        emailContent += `Description: ${task.description}\n`;
        emailContent += `Status: ${task.completed ? 'Completed' : 'Pending'}\n`;
        emailContent += `Priority: ${task.priority || 'medium'}\n`;
        if (task.tags && task.tags.length > 0) {
          emailContent += `Tags: ${task.tags.join(', ')}\n`;
        }
        emailContent += `Created: ${task.createdAt.toISOString()}\n`;
        if (task.updatedAt) {
          emailContent += `Updated: ${task.updatedAt.toISOString()}\n`;
        }
      } else {
        emailContent += `Task ID: ${params.taskId}\n`;
      }

      if (params.message) {
        emailContent += `\nAdditional Message:\n${params.message}`;
      }

      emailContent += '\n\n---\nThis notification was sent by the MCP Task Management System.';

      // Send the email
      const result = await emailService.sendSimpleEmail(
        toEmails.join(', '),
        subject,
        emailContent
      );

      if (result.success) {
        return createSuccessResult(`📧 Task notification sent successfully!
To: ${toEmails.join(', ')}
Subject: ${subject}
Action: ${actionText}
Message ID: ${result.messageId || 'N/A'}`);
      } else {
        return createErrorResult(`Failed to send task notification: ${result.error}`);
      }
    } catch (error) {
      return createErrorResult(`Failed to send task notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Export all email tools
export const emailTools: ToolDefinition[] = [
  sendEmailTool,
  sendHtmlEmailTool,
  testEmailTool,
  sendTaskNotificationTool,
];