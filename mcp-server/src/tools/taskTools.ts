/**
 * Task management tools for the MCP server
 */

import { z } from 'zod';
import { Task, ToolDefinition } from '../types/index.js';
import { generateId, formatTask, createSuccessResult, createErrorResult } from '../utils/index.js';

// In-memory task storage - exported to be shared with HTTP server
export const tasks: Map<string, Task> = new Map();

/**
 * Create a new task
 */
const createTaskTool: ToolDefinition = {
  name: 'create-task',
  description: 'Create a new task with title, description, priority, and optional tags',
  inputSchema: {
    title: z.string().min(1).describe('Title of the task'),
    description: z.string().describe('Description of the task'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Priority level of the task'),
    tags: z.string().optional().describe('Comma-separated tags for the task'),
  },
  handler: async (params: { title: string; description: string; priority?: 'low' | 'medium' | 'high'; tags?: string }) => {
    try {
      const id = generateId();
      const taskTags = params.tags ? params.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
      
      const newTask: Task = {
        id,
        title: params.title,
        description: params.description,
        completed: false,
        createdAt: new Date(),
        priority: params.priority || 'medium',
        tags: taskTags,
      };

      tasks.set(id, newTask);

      return createSuccessResult(`✅ Task created successfully!\n${formatTask(newTask)}`);
    } catch (error) {
      return createErrorResult(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * List all tasks with filtering options
 */
const listTasksTool: ToolDefinition = {
  name: 'list-tasks',
  description: 'Get a list of all tasks with optional filtering by status, priority, or tags',
  inputSchema: {
    status: z.enum(['all', 'pending', 'completed']).optional().describe('Filter tasks by status'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Filter tasks by priority'),
    tag: z.string().optional().describe('Filter tasks by a specific tag'),
  },
  handler: async (params: { status?: 'all' | 'pending' | 'completed'; priority?: 'low' | 'medium' | 'high'; tag?: string }) => {
    try {
      const status = params.status ?? 'all';
      let filteredTasks = Array.from(tasks.values());

      // Filter by status
      if (status === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
      } else if (status === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
      }

      // Filter by priority
      if (params.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
      }

      // Filter by tag
      if (params.tag) {
        filteredTasks = filteredTasks.filter(task => 
          task.tags && task.tags.some(tag => tag.toLowerCase().includes(params.tag!.toLowerCase()))
        );
      }

      if (filteredTasks.length === 0) {
        return createSuccessResult('📝 No tasks found matching the specified criteria.');
      }

      // Sort by priority and creation date
      filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        return b.createdAt.getTime() - a.createdAt.getTime(); // Newer first
      });

      const taskList = filteredTasks.map(formatTask).join('\n---\n');
      const filterInfo = [];
      if (status !== 'all') filterInfo.push(`Status: ${status}`);
      if (params.priority) filterInfo.push(`Priority: ${params.priority}`);
      if (params.tag) filterInfo.push(`Tag: ${params.tag}`);
      
      const filterText = filterInfo.length > 0 ? ` (Filtered by: ${filterInfo.join(', ')})` : '';
      
      return createSuccessResult(`📋 Tasks${filterText}:\n${taskList}`);
    } catch (error) {
      return createErrorResult(`Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Get pending tasks (legacy compatibility)
 */
const pendingTasksTool: ToolDefinition = {
  name: 'pending-tasks',
  description: 'Get a list of all pending tasks',
  inputSchema: {
    status: z.string().optional().describe('Not used but required for MCP protocol'),
  },
  handler: async (_params: { status?: string }) => {
    try {
      const pendingTasks = Array.from(tasks.values()).filter(task => !task.completed);

      if (pendingTasks.length === 0) {
        return createSuccessResult('📝 No pending tasks found.');
      }

      // Sort by priority and creation date
      pendingTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      const taskList = pendingTasks.map(formatTask).join('\n---\n');

      return createSuccessResult(`⏳ Pending Tasks:\n${taskList}`);
    } catch (error) {
      return createErrorResult(`Failed to get pending tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Complete a task
 */
const completeTaskTool: ToolDefinition = {
  name: 'complete-task',
  description: 'Mark a task as completed',
  inputSchema: {
    id: z.string().describe('ID of the task to mark as completed'),
  },
  handler: async (params: { id: string }) => {
    try {
      const task = tasks.get(params.id);

      if (!task) {
        return createErrorResult(`Task with ID ${params.id} not found.`);
      }

      if (task.completed) {
        return createSuccessResult(`✅ Task with ID ${params.id} is already marked as completed.`);
      }

      task.completed = true;
      task.updatedAt = new Date();
      tasks.set(params.id, task);

      return createSuccessResult(`✅ Task marked as completed:\n${formatTask(task)}`);
    } catch (error) {
      return createErrorResult(`Failed to complete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Update a task
 */
const updateTaskTool: ToolDefinition = {
  name: 'update-task',
  description: 'Update an existing task\'s title, description, priority, or tags',
  inputSchema: {
    id: z.string().describe('ID of the task to update'),
    title: z.string().optional().describe('New title for the task'),
    description: z.string().optional().describe('New description for the task'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
    tags: z.string().optional().describe('New comma-separated tags (replaces existing tags)'),
  },
  handler: async (params: { id: string; title?: string; description?: string; priority?: 'low' | 'medium' | 'high'; tags?: string }) => {
    try {
      const task = tasks.get(params.id);

      if (!task) {
        return createErrorResult(`Task with ID ${params.id} not found.`);
      }

      // Update fields if provided
      if (params.title !== undefined) task.title = params.title;
      if (params.description !== undefined) task.description = params.description;
      if (params.priority !== undefined) task.priority = params.priority;
      if (params.tags !== undefined) {
        task.tags = params.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      
      task.updatedAt = new Date();
      tasks.set(params.id, task);

      return createSuccessResult(`✏️ Task updated successfully:\n${formatTask(task)}`);
    } catch (error) {
      return createErrorResult(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Delete a task
 */
const deleteTaskTool: ToolDefinition = {
  name: 'delete-task',
  description: 'Delete a task permanently',
  inputSchema: {
    id: z.string().describe('ID of the task to delete'),
  },
  handler: async (params: { id: string }) => {
    try {
      const task = tasks.get(params.id);

      if (!task) {
        return createErrorResult(`Task with ID ${params.id} not found.`);
      }

      tasks.delete(params.id);

      return createSuccessResult(`🗑️ Task deleted successfully:\n${formatTask(task)}`);
    } catch (error) {
      return createErrorResult(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

/**
 * Get task statistics
 */
const taskStatsTool: ToolDefinition = {
  name: 'task-stats',
  description: 'Get statistics about all tasks',
  inputSchema: {},
  handler: async () => {
    try {
      const allTasks = Array.from(tasks.values());
      const completed = allTasks.filter(task => task.completed).length;
      const pending = allTasks.filter(task => !task.completed).length;
      
      const priorityStats = {
        high: allTasks.filter(task => task.priority === 'high').length,
        medium: allTasks.filter(task => task.priority === 'medium').length,
        low: allTasks.filter(task => task.priority === 'low').length,
      };

      const allTags = allTasks.flatMap(task => task.tags || []);
      const uniqueTags = [...new Set(allTags)];
      const tagCounts = uniqueTags.map(tag => ({
        tag,
        count: allTags.filter(t => t === tag).length,
      })).sort((a, b) => b.count - a.count);

      const stats = `
📊 Task Statistics:
  Total Tasks: ${allTasks.length}
  Completed: ${completed} (${allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0}%)
  Pending: ${pending} (${allTasks.length > 0 ? Math.round((pending / allTasks.length) * 100) : 0}%)

Priority Distribution:
  🔴 High: ${priorityStats.high}
  🟡 Medium: ${priorityStats.medium}
  🟢 Low: ${priorityStats.low}

${uniqueTags.length > 0 ? `Top Tags:
${tagCounts.slice(0, 5).map(({ tag, count }) => `  #${tag}: ${count}`).join('\n')}` : 'No tags used yet.'}
`;

      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get task statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Export all task tools
export const taskTools: ToolDefinition[] = [
  createTaskTool,
  listTasksTool,
  pendingTasksTool,
  completeTaskTool,
  updateTaskTool,
  deleteTaskTool,
  taskStatsTool,
];