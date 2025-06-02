/**
 * Utility functions for the MCP server
 */

import { Task, ToolResult } from '../types/index.js';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Format a task for display
 */
export function formatTask(task: Task): string {
  const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
  const statusEmoji = task.completed ? '✅' : '⏳';
  const tags = task.tags && task.tags.length > 0 ? `\n      Tags: ${task.tags.join(', ')}` : '';
  
  return `
      ${statusEmoji} ${priorityEmoji} ID: ${task.id}
      Title: ${task.title}
      Description: ${task.description}
      Status: ${task.completed ? "Completed" : "Pending"}
      Priority: ${task.priority || 'medium'}${tags}
      Created: ${task.createdAt.toISOString()}${task.updatedAt ? `\n      Updated: ${task.updatedAt.toISOString()}` : ''}
`;
}

/**
 * Create a success tool result
 */
export function createSuccessResult(message: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: false,
  };
}

/**
 * Create an error tool result
 */
export function createErrorResult(message: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `❌ Error: ${message}`,
      },
    ],
    isError: true,
  };
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate environment variable key format
 */
export function isValidEnvKey(key: string): boolean {
  // Environment variable keys should be uppercase with underscores
  const envKeyRegex = /^[A-Z][A-Z0-9_]*$/;
  return envKeyRegex.test(key);
}

/**
 * Sanitize environment variable key
 */
export function sanitizeEnvKey(key: string): string {
  return key.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Parse comma-separated values
 */
export function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}