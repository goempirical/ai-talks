/**
 * Tool registry for the MCP server
 * This module exports all available tools and provides a centralized registry
 */

import { ToolDefinition } from '../types/index.js';
import { taskTools } from './taskTools.js';
import { emailTools } from './emailTools.js';
import { envTools } from './envTools.js';
import { utilityTools } from './utilityTools.js';
import { serverConfig } from '../config/index.js';

/**
 * Get all available tools based on feature flags
 */
export function getAllTools(): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  // Always include utility tools
  tools.push(...utilityTools);

  // Add task management tools if enabled
  if (serverConfig.features.taskManagementEnabled) {
    tools.push(...taskTools);
  }

  // Add email tools if enabled
  if (serverConfig.features.emailEnabled) {
    tools.push(...emailTools);
  }

  // Add environment variable tools if enabled
  if (serverConfig.features.environmentVariablesEnabled) {
    tools.push(...envTools);
  }

  return tools;
}

/**
 * Get a tool by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  const tools = getAllTools();
  return tools.find(tool => tool.name === name);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: 'task' | 'email' | 'env' | 'utility'): ToolDefinition[] {
  switch (category) {
    case 'task':
      return serverConfig.features.taskManagementEnabled ? taskTools : [];
    case 'email':
      return serverConfig.features.emailEnabled ? emailTools : [];
    case 'env':
      return serverConfig.features.environmentVariablesEnabled ? envTools : [];
    case 'utility':
      return utilityTools;
    default:
      return [];
  }
}

/**
 * Get tool names grouped by category
 */
export function getToolCategories(): Record<string, string[]> {
  return {
    utility: utilityTools.map(tool => tool.name),
    task: serverConfig.features.taskManagementEnabled ? taskTools.map(tool => tool.name) : [],
    email: serverConfig.features.emailEnabled ? emailTools.map(tool => tool.name) : [],
    env: serverConfig.features.environmentVariablesEnabled ? envTools.map(tool => tool.name) : [],
  };
}

/**
 * Get tool statistics
 */
export function getToolStats(): {
  total: number;
  byCategory: Record<string, number>;
  enabled: string[];
  disabled: string[];
} {
  const categories = getToolCategories();
  const enabledFeatures: string[] = ['utility']; // utility is always enabled
  const disabledFeatures: string[] = [];

  if (serverConfig.features.taskManagementEnabled) {
    enabledFeatures.push('task');
  } else {
    disabledFeatures.push('task');
  }

  if (serverConfig.features.emailEnabled) {
    enabledFeatures.push('email');
  } else {
    disabledFeatures.push('email');
  }

  if (serverConfig.features.environmentVariablesEnabled) {
    enabledFeatures.push('env');
  } else {
    disabledFeatures.push('env');
  }

  const byCategory = Object.fromEntries(
    Object.entries(categories).map(([category, tools]) => [category, tools.length])
  );

  const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);

  return {
    total,
    byCategory,
    enabled: enabledFeatures,
    disabled: disabledFeatures,
  };
}

/**
 * Validate that all tools have unique names
 */
export function validateToolRegistry(): { valid: boolean; errors: string[] } {
  const tools = getAllTools();
  const names = tools.map(tool => tool.name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  
  if (duplicates.length > 0) {
    return {
      valid: false,
      errors: [`Duplicate tool names found: ${[...new Set(duplicates)].join(', ')}`],
    };
  }

  return {
    valid: true,
    errors: [],
  };
}

// Export individual tool arrays for direct access if needed
export { taskTools, emailTools, envTools, utilityTools };