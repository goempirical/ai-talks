import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { tasks } from './index.js';

// Define Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

// Task interface is imported from index.js via the tasks Map

// Helper function to generate a unique ID
function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Helper function to format a task for display
function formatTask(task: Task): string {
  return `
      ID: ${task.id}
      Title: ${task.title}
      Description: ${task.description}
      Status: ${task.completed ? "Completed" : "Pending"}
      Created: ${task.createdAt.toISOString()}
`;
}

// Create Express app
const app = express();
const PORT = process.env.PORT ?? 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes

// Create a task
app.post('/api/tasks', (req: express.Request, res: express.Response) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const id = generateId();
    const newTask: Task = {
      id,
      title,
      description: description ?? '',
      completed: false,
      createdAt: new Date(),
    };
    
    tasks.set(id, newTask);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        completed: newTask.completed,
        createdAt: newTask.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks with optional status filter
app.get('/api/tasks', (req: express.Request, res: express.Response) => {
  try {
    const status = (req.query.status as string) ?? 'all';
    
    let filteredTasks = Array.from(tasks.values());
    
    if (status === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (status === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    res.json({
      tasks: filteredTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get pending tasks
app.get('/api/tasks/pending', (req: express.Request, res: express.Response) => {
  try {
    const pendingTasks = Array.from(tasks.values())
      .filter(task => !task.completed)
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.createdAt
      }));
    
    res.json({ tasks: pendingTasks });
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

// Complete a task
app.patch('/api/tasks/:id/complete', (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const task = tasks.get(id);
    
    if (!task) {
      return res.status(404).json({ error: `Task with ID ${id} not found` });
    }
    
    if (task.completed) {
      return res.status(400).json({ error: `Task with ID ${id} is already completed` });
    }
    
    task.completed = true;
    tasks.set(id, task);
    
    res.json({
      message: 'Task marked as completed',
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.createdAt
      }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Helper functions for MCP tool execution
function handleCreateTask(title: string, description: string) {
  const id = generateId();
  const newTask = {
    id,
    title,
    description: description ?? '',
    completed: false,
    createdAt: new Date(),
  };
  
  tasks.set(id, newTask);
  
  return {
    content: [
      {
        type: 'text',
        text: `Task created successfully!\n${formatTask(newTask)}`,
      },
    ],
  };
}

function handleListTasks(status: string) {
  const statusValue = status ?? 'all';
  
  let filteredTasks = Array.from(tasks.values());
  if (statusValue === 'pending') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  } else if (statusValue === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }
  
  if (filteredTasks.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No tasks found.',
        },
      ],
    };
  }
  
  const taskList = filteredTasks.map(formatTask).join('\n---\n');
  
  return {
    content: [
      {
        type: 'text',
        text: `Tasks:\n${taskList}`,
      },
    ],
  };
}

function handlePendingTasks() {
  const pendingTasks = Array.from(tasks.values()).filter(
    task => !task.completed
  );
  
  if (pendingTasks.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No pending tasks found.',
        },
      ],
    };
  }
  
  const taskList = pendingTasks.map(formatTask).join('\n---\n');
  
  return {
    content: [
      {
        type: 'text',
        text: `Pending Tasks:\n${taskList}`,
      },
    ],
  };
}

function handleCompleteTask(id: string) {
  const task = tasks.get(id);
  
  if (!task) {
    return {
      content: [
        {
          type: 'text',
          text: `Task with ID ${id} not found.`,
        },
      ],
    };
  }
  
  if (task.completed) {
    return {
      content: [
        {
          type: 'text',
          text: `Task with ID ${id} is already marked as completed.`,
        },
      ],
    };
  }
  
  task.completed = true;
  tasks.set(id, task);
  
  return {
    content: [
      {
        type: 'text',
        text: `Task with ID ${id} marked as completed!\n${formatTask(task)}`,
      },
    ],
  };
}

// MCP Tool Execution Endpoint
app.post('/api/mcp/execute', (req: express.Request, res: express.Response) => {
  try {
    const { tool, params } = req.body;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    
    let result;
    
    switch (tool) {
      case 'create-task':
        if (!params.title) {
          return res.status(400).json({ error: 'Title is required for create-task' });
        }
        result = handleCreateTask(params.title, params.description);
        break;
        
      case 'list-tasks':
        result = handleListTasks(params.status);
        break;
        
      case 'pending-tasks':
        result = handlePendingTasks();
        break;
        
      case 'complete-task':
        if (!params.id) {
          return res.status(400).json({ error: 'Task ID is required for complete-task' });
        }
        result = handleCompleteTask(params.id);
        break;
        
      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error executing MCP tool:', error);
    res.status(500).json({ error: 'Failed to execute MCP tool' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});

// No need to export tasks as we're importing it from index.js
