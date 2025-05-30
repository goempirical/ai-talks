/**
 * Configuration management for the MCP server
 */

import { config } from 'dotenv';
import { ServerConfig } from '../types/index.js';

// Load environment variables
config();

/**
 * Get environment variable with optional default value
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get numeric environment variable
 */
function getNumericEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return numValue;
}

/**
 * Server configuration
 */
export const serverConfig: ServerConfig = {
  name: getEnvVar('MCP_SERVER_NAME', 'enhanced-mcp-server'),
  version: getEnvVar('MCP_SERVER_VERSION', '2.0.0'),
  port: getNumericEnvVar('PORT', 3001),
  
  email: {
    host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    port: getNumericEnvVar('SMTP_PORT', 587),
    secure: getBooleanEnvVar('SMTP_SECURE', false),
    auth: {
      user: getEnvVar('SMTP_USER', ''),
      pass: getEnvVar('SMTP_PASS', ''),
    },
    from: getEnvVar('SMTP_FROM', ''),
  },
  
  features: {
    emailEnabled: getBooleanEnvVar('FEATURE_EMAIL_ENABLED', true),
    environmentVariablesEnabled: getBooleanEnvVar('FEATURE_ENV_VARS_ENABLED', true),
    taskManagementEnabled: getBooleanEnvVar('FEATURE_TASK_MANAGEMENT_ENABLED', true),
  },
};

/**
 * Validate configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate email configuration if email feature is enabled
  if (serverConfig.features.emailEnabled) {
    if (!serverConfig.email.auth.user) {
      errors.push('SMTP_USER is required when email feature is enabled');
    }
    if (!serverConfig.email.auth.pass) {
      errors.push('SMTP_PASS is required when email feature is enabled');
    }
    if (!serverConfig.email.from) {
      errors.push('SMTP_FROM is required when email feature is enabled');
    }
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:');
    errors.forEach(error => console.warn(`  - ${error}`));
    console.warn('Some features may not work properly.');
  }
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(): string {
  return `
MCP Server Configuration:
  Name: ${serverConfig.name}
  Version: ${serverConfig.version}
  Port: ${serverConfig.port}
  Features:
    - Task Management: ${serverConfig.features.taskManagementEnabled ? 'Enabled' : 'Disabled'}
    - Email: ${serverConfig.features.emailEnabled ? 'Enabled' : 'Disabled'}
    - Environment Variables: ${serverConfig.features.environmentVariablesEnabled ? 'Enabled' : 'Disabled'}
  Email Configuration:
    - Host: ${serverConfig.email.host}
    - Port: ${serverConfig.email.port}
    - Secure: ${serverConfig.email.secure}
    - From: ${serverConfig.email.from || 'Not configured'}
`;
}