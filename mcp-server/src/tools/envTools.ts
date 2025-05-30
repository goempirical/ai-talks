/**
 * Environment variable management tools for the MCP server
 */

import { z } from 'zod';
import { EnvironmentVariable, ToolDefinition } from '../types/index.js';
import { generateId, createSuccessResult, createErrorResult, isValidEnvKey, sanitizeEnvKey, formatDate } from '../utils/index.js';
import { serverConfig } from '../config/index.js';

// In-memory environment variable storage
export const environmentVariables: Map<string, EnvironmentVariable> = new Map();

/**
 * Set an environment variable
 */
const setEnvVarTool: ToolDefinition = {
  name: 'set-env-var',
  description: 'Set or update an environment variable with optional description',
  inputSchema: {
    key: z.string().min(1).describe('Environment variable key (will be converted to uppercase)'),
    value: z.string().describe('Environment variable value'),
    description: z.string().optional().describe('Description of what this environment variable is used for'),
    isSecret: z.boolean().optional().describe('Whether this is a secret value (will be masked in output)'),
  },
  handler: async (params: { key: string; value: string; description?: string; isSecret?: boolean }) => {
    try {
      if (!serverConfig.features.environmentVariablesEnabled) {
        return createErrorResult('Environment variables feature is disabled. Enable it by setting FEATURE_ENV_VARS_ENABLED=true');
      }

      // Sanitize and validate the key
      const sanitizedKey = sanitizeEnvKey(params.key);
      
      if (!isValidEnvKey(sanitizedKey)) {
        return createErrorResult(`Invalid environment variable key: ${params.key}. Keys should contain only uppercase letters, numbers, and underscores.`);
      }

      const existingVar = environmentVariables.get(sanitizedKey);
      const now = new Date();

      const envVar: EnvironmentVariable = {
        key: sanitizedKey,
        value: params.value,
        description: params.description,
        isSecret: params.isSecret || false,
        createdAt: existingVar?.createdAt || now,
        updatedAt: existingVar ? now : undefined,
      };

      environmentVariables.set(sanitizedKey, envVar);

      // Set the actual environment variable
      process.env[sanitizedKey] = params.value;

      const displayValue = envVar.isSecret ? '***HIDDEN***' : params.value;
      const action = existingVar ? 'updated' : 'created';

      return createSuccessResult(`✅ Environment variable ${action} successfully!
Key: ${sanitizedKey}
Value: ${displayValue}
Description: ${envVar.description || 'No description provided'}
Secret: ${envVar.isSecret ? 'Yes' : 'No'}
${action === 'updated' ? `Updated: ${formatDate(now)}` : `Created: ${formatDate(now)}`}`);
    } catch (error) {
      return createErrorResult(`Failed to set environment variable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Get an environment variable
 */
const getEnvVarTool: ToolDefinition = {
  name: 'get-env-var',
  description: 'Get the value of an environment variable',
  inputSchema: {
    key: z.string().min(1).describe('Environment variable key'),
    showSecret: z.boolean().optional().describe('Whether to show the actual value of secret variables'),
  },
  handler: async (params: { key: string; showSecret?: boolean }) => {
    try {
      if (!serverConfig.features.environmentVariablesEnabled) {
        return createErrorResult('Environment variables feature is disabled. Enable it by setting FEATURE_ENV_VARS_ENABLED=true');
      }

      const sanitizedKey = sanitizeEnvKey(params.key);
      const envVar = environmentVariables.get(sanitizedKey);
      const actualValue = process.env[sanitizedKey];

      if (!envVar && !actualValue) {
        return createErrorResult(`Environment variable ${sanitizedKey} not found.`);
      }

      if (envVar) {
        const displayValue = (envVar.isSecret && !params.showSecret) ? '***HIDDEN***' : envVar.value;
        
        return createSuccessResult(`🔍 Environment Variable Details:
Key: ${envVar.key}
Value: ${displayValue}
Description: ${envVar.description || 'No description provided'}
Secret: ${envVar.isSecret ? 'Yes' : 'No'}
Created: ${formatDate(envVar.createdAt)}${envVar.updatedAt ? `\nUpdated: ${formatDate(envVar.updatedAt)}` : ''}
${envVar.isSecret && !params.showSecret ? '\n💡 Use showSecret=true to reveal the actual value' : ''}`);
      } else {
        // Variable exists in process.env but not in our storage
        return createSuccessResult(`🔍 Environment Variable (System):
Key: ${sanitizedKey}
Value: ${actualValue}
Source: System environment
Description: Not managed by MCP server`);
      }
    } catch (error) {
      return createErrorResult(`Failed to get environment variable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * List all environment variables
 */
const listEnvVarsTool: ToolDefinition = {
  name: 'list-env-vars',
  description: 'List all managed environment variables with optional filtering',
  inputSchema: {
    includeSecrets: z.boolean().optional().describe('Whether to include secret variables in the list'),
    showValues: z.boolean().optional().describe('Whether to show actual values (secrets will still be masked unless showSecrets is true)'),
    showSecrets: z.boolean().optional().describe('Whether to show actual values of secret variables'),
    filter: z.string().optional().describe('Filter variables by key pattern (case-insensitive)'),
  },
  handler: async (params: { includeSecrets?: boolean; showValues?: boolean; showSecrets?: boolean; filter?: string }) => {
    try {
      if (!serverConfig.features.environmentVariablesEnabled) {
        return createErrorResult('Environment variables feature is disabled. Enable it by setting FEATURE_ENV_VARS_ENABLED=true');
      }

      let envVars = Array.from(environmentVariables.values());

      // Filter by pattern if provided
      if (params.filter) {
        const filterLower = params.filter.toLowerCase();
        envVars = envVars.filter(envVar => 
          envVar.key.toLowerCase().includes(filterLower) ||
          (envVar.description && envVar.description.toLowerCase().includes(filterLower))
        );
      }

      // Filter out secrets if not requested
      if (!params.includeSecrets) {
        envVars = envVars.filter(envVar => !envVar.isSecret);
      }

      if (envVars.length === 0) {
        const filterText = params.filter ? ` matching "${params.filter}"` : '';
        const secretText = !params.includeSecrets ? ' (excluding secrets)' : '';
        return createSuccessResult(`📝 No environment variables found${filterText}${secretText}.`);
      }

      // Sort by key
      envVars.sort((a, b) => a.key.localeCompare(b.key));

      let output = `📋 Environment Variables${params.filter ? ` (filtered by: ${params.filter})` : ''}:\n\n`;

      envVars.forEach((envVar, index) => {
        const displayValue = params.showValues ? 
          (envVar.isSecret && !params.showSecrets ? '***HIDDEN***' : envVar.value) : 
          '[Value hidden]';

        output += `${index + 1}. ${envVar.key}${envVar.isSecret ? ' 🔒' : ''}
   Value: ${displayValue}
   Description: ${envVar.description || 'No description'}
   Created: ${formatDate(envVar.createdAt)}${envVar.updatedAt ? `\n   Updated: ${formatDate(envVar.updatedAt)}` : ''}

`;
      });

      const secretCount = Array.from(environmentVariables.values()).filter(v => v.isSecret).length;
      output += `\n📊 Summary: ${envVars.length} variables shown`;
      if (secretCount > 0 && !params.includeSecrets) {
        output += `, ${secretCount} secret variables hidden`;
      }
      if (!params.showValues) {
        output += `\n💡 Use showValues=true to see values`;
      }
      if (secretCount > 0 && params.includeSecrets && !params.showSecrets) {
        output += `\n🔒 Use showSecrets=true to reveal secret values`;
      }

      return createSuccessResult(output);
    } catch (error) {
      return createErrorResult(`Failed to list environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Delete an environment variable
 */
const deleteEnvVarTool: ToolDefinition = {
  name: 'delete-env-var',
  description: 'Delete an environment variable',
  inputSchema: {
    key: z.string().min(1).describe('Environment variable key to delete'),
  },
  handler: async (params: { key: string }) => {
    try {
      if (!serverConfig.features.environmentVariablesEnabled) {
        return createErrorResult('Environment variables feature is disabled. Enable it by setting FEATURE_ENV_VARS_ENABLED=true');
      }

      const sanitizedKey = sanitizeEnvKey(params.key);
      const envVar = environmentVariables.get(sanitizedKey);

      if (!envVar) {
        return createErrorResult(`Environment variable ${sanitizedKey} not found.`);
      }

      // Remove from our storage
      environmentVariables.delete(sanitizedKey);
      
      // Remove from process environment
      delete process.env[sanitizedKey];

      return createSuccessResult(`🗑️ Environment variable deleted successfully:
Key: ${envVar.key}
Description: ${envVar.description || 'No description'}
Was Secret: ${envVar.isSecret ? 'Yes' : 'No'}`);
    } catch (error) {
      return createErrorResult(`Failed to delete environment variable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Export environment variables to a .env format
 */
const exportEnvVarsTool: ToolDefinition = {
  name: 'export-env-vars',
  description: 'Export environment variables in .env file format',
  inputSchema: {
    includeSecrets: z.boolean().optional().describe('Whether to include secret variables in the export'),
    includeComments: z.boolean().optional().describe('Whether to include descriptions as comments'),
  },
  handler: async (params: { includeSecrets?: boolean; includeComments?: boolean }) => {
    try {
      if (!serverConfig.features.environmentVariablesEnabled) {
        return createErrorResult('Environment variables feature is disabled. Enable it by setting FEATURE_ENV_VARS_ENABLED=true');
      }

      let envVars = Array.from(environmentVariables.values());

      // Filter out secrets if not requested
      if (!params.includeSecrets) {
        envVars = envVars.filter(envVar => !envVar.isSecret);
      }

      if (envVars.length === 0) {
        return createSuccessResult('📝 No environment variables to export.');
      }

      // Sort by key
      envVars.sort((a, b) => a.key.localeCompare(b.key));

      let output = '# Environment Variables Export\n';
      output += `# Generated on: ${new Date().toISOString()}\n`;
      output += `# Total variables: ${envVars.length}\n\n`;

      envVars.forEach(envVar => {
        if (params.includeComments && envVar.description) {
          output += `# ${envVar.description}\n`;
        }
        if (envVar.isSecret && params.includeSecrets) {
          output += `# WARNING: This is a secret value\n`;
        }
        output += `${envVar.key}=${envVar.value}\n\n`;
      });

      const secretCount = Array.from(environmentVariables.values()).filter(v => v.isSecret).length;
      if (secretCount > 0 && !params.includeSecrets) {
        output += `# Note: ${secretCount} secret variables were excluded from this export\n`;
        output += '# Use includeSecrets=true to include them\n';
      }

      return createSuccessResult(`📄 Environment Variables Export:\n\n\`\`\`\n${output}\`\`\``);
    } catch (error) {
      return createErrorResult(`Failed to export environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Export all environment variable tools
export const envTools: ToolDefinition[] = [
  setEnvVarTool,
  getEnvVarTool,
  listEnvVarsTool,
  deleteEnvVarTool,
  exportEnvVarsTool,
];