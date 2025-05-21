import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

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

// We'll check for tool existence in the request handler

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
  // Check if we should use HTTP transport
  const useHttp = process.argv.includes("--http");
  const port = parseInt(process.env.PORT || "3001");

  if (useHttp) {
    // Create Express app for HTTP transport
    const app = express();
    app.use(express.json());
    
    // Map to store transports by session ID
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
    
    // Handle MCP requests via native MCP endpoint
    app.post("/mcp", async (req, res) => {
      console.log('Received MCP request:', req.body);
      try {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID when session is initialized
              console.log(`Session initialized with ID: ${sessionId}`);
              transports[sessionId] = transport;
            }
          });

          // Set up onclose handler to clean up transport when closed
          transport.onclose = () => {
            const sid = transport.sessionId;
            if (sid && transports[sid]) {
              console.log(`Transport closed for session ${sid}, removing from transports map`);
              delete transports[sid];
            }
          };

          // Connect the transport to the MCP server BEFORE handling the request
          await server.connect(transport);
          await transport.handleRequest(req, res, req.body);
          return; // Already handled
        } else {
          // Invalid request - no session ID or not initialization request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
          return;
        }

        // Handle the request with existing transport - no need to reconnect
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });
    
    // Handle GET requests for SSE streams
    app.get('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      // Check for Last-Event-ID header for resumability
      const lastEventId = req.headers['last-event-id'] as string | undefined;
      if (lastEventId) {
        console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
      } else {
        console.log(`Establishing new SSE stream for session ${sessionId}`);
      }
      
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });
    
    // Handle DELETE requests for session termination
    app.delete('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      console.log(`Terminating session ${sessionId}`);
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });

    // Start the HTTP server
    app.listen(port, () => {
      console.log(`MCP server running with HTTP transport on port ${port}`);
      console.log(`Access the server at http://localhost:${port}/mcp`);
    });
  } else {
    // Use stdio transport (default)
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.log("MCP server running with stdio transport");
  }
}

// Only run the server if this file is being executed directly
if (isMainModule) {
  // Run the server
  main().catch((error) => {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  });
}

// Export the server for potential use in other modules
export { server };
