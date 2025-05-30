/**
 * Shared types and interfaces for the MCP server
 */

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

// Email configuration interface
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// Email message interface
export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Environment variable interface
export interface EnvironmentVariable {
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Tool result interface - matches MCP SDK expectations
export interface ToolResult {
  [x: string]: unknown;
  content: Array<{
    [x: string]: unknown;
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// Tool registration interface
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (params: any) => Promise<ToolResult>;
}

// Server configuration interface
export interface ServerConfig {
  name: string;
  version: string;
  port: number;
  email: EmailConfig;
  features: {
    emailEnabled: boolean;
    environmentVariablesEnabled: boolean;
    taskManagementEnabled: boolean;
  };
}