/**
 * Utility tools for the MCP server
 */

import { z } from 'zod';
import { ToolDefinition } from '../types/index.js';
import { createSuccessResult, createErrorResult, formatDate, sleep } from '../utils/index.js';
import { serverConfig, getConfigSummary } from '../config/index.js';

/**
 * Get current date and time
 */
const getDateTimeTool: ToolDefinition = {
  name: 'get-datetime',
  description: 'Get the current date and time in various formats',
  inputSchema: {
    format: z.enum(['iso', 'local', 'utc', 'timestamp', 'all']).optional().describe('Date format to return'),
    timezone: z.string().optional().describe('Timezone for local format (e.g., "America/New_York")'),
  },
  handler: async (params: { format?: 'iso' | 'local' | 'utc' | 'timestamp' | 'all'; timezone?: string }) => {
    try {
      const now = new Date();
      const format = params.format || 'all';

      let result = '🕐 Current Date and Time:\n\n';

      if (format === 'iso' || format === 'all') {
        result += `ISO 8601: ${now.toISOString()}\n`;
      }

      if (format === 'local' || format === 'all') {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        };

        if (params.timezone) {
          options.timeZone = params.timezone;
        }

        try {
          result += `Local: ${now.toLocaleString('en-US', options)}\n`;
        } catch (error) {
          result += `Local: ${now.toLocaleString()} (timezone error: ${error instanceof Error ? error.message : 'Unknown'})\n`;
        }
      }

      if (format === 'utc' || format === 'all') {
        result += `UTC: ${now.toUTCString()}\n`;
      }

      if (format === 'timestamp' || format === 'all') {
        result += `Unix Timestamp: ${Math.floor(now.getTime() / 1000)}\n`;
        result += `Milliseconds: ${now.getTime()}\n`;
      }

      if (format === 'all') {
        result += `\nDay of Week: ${now.toLocaleDateString('en-US', { weekday: 'long' })}`;
        result += `\nDay of Year: ${Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24))}`;
        result += `\nWeek of Year: ${Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24) + new Date(now.getFullYear(), 0, 1).getDay()) / 7)}`;
      }

      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(`Failed to get date/time: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Generate a UUID
 */
const generateUuidTool: ToolDefinition = {
  name: 'generate-uuid',
  description: 'Generate a UUID (Universally Unique Identifier)',
  inputSchema: {
    count: z.number().min(1).max(100).optional().describe('Number of UUIDs to generate (1-100)'),
    format: z.enum(['standard', 'compact', 'uppercase']).optional().describe('UUID format'),
  },
  handler: async (params: { count?: number; format?: 'standard' | 'compact' | 'uppercase' }) => {
    try {
      const { randomUUID } = await import('node:crypto');
      const count = params.count || 1;
      const format = params.format || 'standard';

      const uuids: string[] = [];

      for (let i = 0; i < count; i++) {
        let uuid: string = randomUUID();
        
        switch (format) {
          case 'compact':
            uuid = uuid.replace(/-/g, '');
            break;
          case 'uppercase':
            uuid = uuid.toUpperCase();
            break;
          // 'standard' is the default format
        }
        
        uuids.push(uuid);
      }

      let result = `🆔 Generated UUID${count > 1 ? 's' : ''}:\n\n`;
      
      if (count === 1) {
        result += uuids[0];
      } else {
        uuids.forEach((uuid, index) => {
          result += `${index + 1}. ${uuid}\n`;
        });
      }

      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(`Failed to generate UUID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Generate random data
 */
const generateRandomTool: ToolDefinition = {
  name: 'generate-random',
  description: 'Generate random data like numbers, strings, or passwords',
  inputSchema: {
    type: z.enum(['number', 'string', 'password', 'hex', 'base64']).describe('Type of random data to generate'),
    length: z.number().min(1).max(1000).optional().describe('Length of generated data (for strings/passwords)'),
    min: z.number().optional().describe('Minimum value (for numbers)'),
    max: z.number().optional().describe('Maximum value (for numbers)'),
    includeSymbols: z.boolean().optional().describe('Include symbols in password generation'),
  },
  handler: async (params: { type: 'number' | 'string' | 'password' | 'hex' | 'base64'; length?: number; min?: number; max?: number; includeSymbols?: boolean }) => {
    try {
      const { randomBytes, randomInt } = await import('node:crypto');

      let result = '';

      switch (params.type) {
        case 'number':
          const min = params.min || 0;
          const max = params.max || 100;
          if (min >= max) {
            return createErrorResult('Minimum value must be less than maximum value');
          }
          result = randomInt(min, max + 1).toString();
          break;

        case 'string':
          const stringLength = params.length || 16;
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          for (let i = 0; i < stringLength; i++) {
            result += chars.charAt(randomInt(0, chars.length));
          }
          break;

        case 'password':
          const passwordLength = params.length || 16;
          const lowercase = 'abcdefghijklmnopqrstuvwxyz';
          const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
          
          let charset = lowercase + uppercase + numbers;
          if (params.includeSymbols) {
            charset += symbols;
          }
          
          for (let i = 0; i < passwordLength; i++) {
            result += charset.charAt(randomInt(0, charset.length));
          }
          break;

        case 'hex':
          const hexLength = params.length || 32;
          result = randomBytes(Math.ceil(hexLength / 2)).toString('hex').substring(0, hexLength);
          break;

        case 'base64':
          const base64Length = params.length || 32;
          const bytesNeeded = Math.ceil((base64Length * 3) / 4);
          result = randomBytes(bytesNeeded).toString('base64').substring(0, base64Length);
          break;
      }

      return createSuccessResult(`🎲 Generated Random ${params.type.charAt(0).toUpperCase() + params.type.slice(1)}:\n\n${result}`);
    } catch (error) {
      return createErrorResult(`Failed to generate random data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Calculate hash of text
 */
const calculateHashTool: ToolDefinition = {
  name: 'calculate-hash',
  description: 'Calculate hash of text using various algorithms',
  inputSchema: {
    text: z.string().min(1).describe('Text to hash'),
    algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha512']).optional().describe('Hash algorithm to use'),
    encoding: z.enum(['hex', 'base64']).optional().describe('Output encoding'),
  },
  handler: async (params: { text: string; algorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512'; encoding?: 'hex' | 'base64' }) => {
    try {
      const { createHash } = await import('node:crypto');
      const algorithm = params.algorithm || 'sha256';
      const encoding = params.encoding || 'hex';

      const hash = createHash(algorithm);
      hash.update(params.text);
      const result = hash.digest(encoding as any);

      return createSuccessResult(`🔐 Hash Calculation:
Algorithm: ${algorithm.toUpperCase()}
Encoding: ${encoding}
Input: ${params.text.length > 50 ? params.text.substring(0, 50) + '...' : params.text}
Hash: ${result}`);
    } catch (error) {
      return createErrorResult(`Failed to calculate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Sleep/delay tool
 */
const sleepTool: ToolDefinition = {
  name: 'sleep',
  description: 'Sleep/delay for a specified amount of time',
  inputSchema: {
    duration: z.number().min(1).max(60000).describe('Duration to sleep in milliseconds (1-60000)'),
    message: z.string().optional().describe('Optional message to display before sleeping'),
  },
  handler: async (params: { duration: number; message?: string }) => {
    try {
      const startTime = Date.now();
      
      if (params.message) {
        console.log(params.message);
      }

      await sleep(params.duration);
      
      const actualDuration = Date.now() - startTime;

      return createSuccessResult(`😴 Sleep completed!
Requested Duration: ${params.duration}ms
Actual Duration: ${actualDuration}ms
${params.message ? `Message: ${params.message}` : ''}`);
    } catch (error) {
      return createErrorResult(`Failed to sleep: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Get server status and configuration
 */
const getServerStatusTool: ToolDefinition = {
  name: 'get-server-status',
  description: 'Get the current status and configuration of the MCP server',
  inputSchema: {},
  handler: async () => {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      // Convert bytes to MB
      const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;

      let status = `🚀 MCP Server Status:\n\n`;
      status += `Server Name: ${serverConfig.name}\n`;
      status += `Version: ${serverConfig.version}\n`;
      status += `Port: ${serverConfig.port}\n`;
      status += `Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s\n`;
      status += `Node.js Version: ${process.version}\n`;
      status += `Platform: ${process.platform} ${process.arch}\n\n`;

      status += `💾 Memory Usage:\n`;
      status += `  RSS: ${formatMemory(memoryUsage.rss)}\n`;
      status += `  Heap Used: ${formatMemory(memoryUsage.heapUsed)}\n`;
      status += `  Heap Total: ${formatMemory(memoryUsage.heapTotal)}\n`;
      status += `  External: ${formatMemory(memoryUsage.external)}\n\n`;

      status += `🔧 Features:\n`;
      status += `  Task Management: ${serverConfig.features.taskManagementEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
      status += `  Email: ${serverConfig.features.emailEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
      status += `  Environment Variables: ${serverConfig.features.environmentVariablesEnabled ? '✅ Enabled' : '❌ Disabled'}\n\n`;

      // Import and get data counts
      const { tasks } = await import('./taskTools.js');
      const { environmentVariables } = await import('./envTools.js');
      
      status += `📊 Data Summary:\n`;
      status += `  Tasks: ${tasks.size}\n`;
      status += `  Environment Variables: ${environmentVariables.size}\n`;

      return createSuccessResult(status);
    } catch (error) {
      return createErrorResult(`Failed to get server status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Get detailed server configuration
 */
const getServerConfigTool: ToolDefinition = {
  name: 'get-server-config',
  description: 'Get detailed server configuration information',
  inputSchema: {
    includeSensitive: z.boolean().optional().describe('Whether to include sensitive configuration details'),
  },
  handler: async (params: { includeSensitive?: boolean }) => {
    try {
      let config = getConfigSummary();
      
      if (!params.includeSensitive) {
        // Mask sensitive information
        config = config.replace(/SMTP_USER=.+/g, 'SMTP_USER=***HIDDEN***');
        config = config.replace(/SMTP_PASS=.+/g, 'SMTP_PASS=***HIDDEN***');
      }

      return createSuccessResult(`⚙️ Server Configuration:\n${config}`);
    } catch (error) {
      return createErrorResult(`Failed to get server configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Export all utility tools
export const utilityTools: ToolDefinition[] = [
  getDateTimeTool,
  generateUuidTool,
  generateRandomTool,
  calculateHashTool,
  sleepTool,
  getServerStatusTool,
  getServerConfigTool,
];