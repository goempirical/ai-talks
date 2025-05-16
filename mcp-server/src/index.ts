import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";

// Define Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

// In-memory task storage - exported to be shared with HTTP server
export const tasks: Map<string, Task> = new Map();

// Check if this module is being imported or run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

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

// Create server instance
const server = new McpServer({
  name: "task-manager",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register tool: create-task
server.tool(
  "create-task",
  "Create a new task with title and description",
  {
    title: z.string().min(1).describe("Title of the task"),
    description: z.string().describe("Description of the task"),
  },
  async ({ title, description }: { title: string; description: string }) => {
    const id = generateId();
    const newTask: Task = {
      id,
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };

    tasks.set(id, newTask);

    return {
      content: [
        {
          type: "text",
          text: `Task created successfully!\n${formatTask(newTask)}`,
        },
      ],
    };
  }
);

// Register tool: list-tasks
server.tool(
  "list-tasks",
  "Get a list of all tasks",
  // Add a status filter parameter
  {
    status: z
      .enum(["all", "pending", "completed"])
      .optional()
      .describe("Filter tasks by status: all, pending, or completed"),
  },
  async (params: { status?: "all" | "pending" | "completed" }) => {
    // Default to 'all' if status is null or undefined
    const status = params.status ?? "all";

    // Filter tasks based on status parameter
    let filteredTasks = Array.from(tasks.values());
    if (status === "pending") {
      filteredTasks = filteredTasks.filter((task) => !task.completed);
    } else if (status === "completed") {
      filteredTasks = filteredTasks.filter((task) => task.completed);
    }
    if (filteredTasks.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No tasks found.",
          },
        ],
      };
    }

    const taskList = filteredTasks.map(formatTask).join("\n---\n");

    return {
      content: [
        {
          type: "text",
          text: `Tasks:\n${taskList}`,
        },
      ],
    };
  }
);

// Register tool: pending-tasks
server.tool(
  "pending-tasks",
  "Get a list of all pending tasks",
  // Define an empty object schema with a property to satisfy the MCP protocol
  {
    status: z
      .string()
      .optional()
      .describe("Not used but required for MCP protocol"),
  },
  async (_params: { status?: string }) => {
    // Filter for only pending tasks
    const pendingTasks = Array.from(tasks.values()).filter(
      (task) => !task.completed
    );

    if (pendingTasks.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No pending tasks found.",
          },
        ],
      };
    }

    const taskList = pendingTasks.map(formatTask).join("\n---\n");

    return {
      content: [
        {
          type: "text",
          text: `Pending Tasks:\n${taskList}`,
        },
      ],
    };
  }
);

// Register tool: complete-task
server.tool(
  "complete-task",
  "Mark a task as completed",
  {
    id: z.string().describe("ID of the task to mark as completed"),
  },
  async ({ id }: { id: string }) => {
    const task = tasks.get(id);

    if (!task) {
      return {
        content: [
          {
            type: "text",
            text: `Task with ID ${id} not found.`,
          },
        ],
      };
    }

    if (task.completed) {
      return {
        content: [
          {
            type: "text",
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
          type: "text",
          text: `Task marked as completed:\n${formatTask(task)}`,
        },
      ],
    };
  }
);

// Main function to run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Task Manager MCP Server running on stdio");
}

// Only run the server if this file is being executed directly
if (isMainModule) {
  // Run the server
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}

// Export the server for potential use in other modules
export { server };
