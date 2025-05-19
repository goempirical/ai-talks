import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

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
  // Check if we should use HTTP transport
  const useHttp = process.argv.includes("--http");
  const port = parseInt(process.env.PORT || "3001");

  if (useHttp) {
    // Create Express app for HTTP transport
    const app = express();
    app.use(express.json());

    // Handle MCP requests via native MCP endpoint
    app.post("/mcp", async (req, res) => {
      try {
        // Create a new transport for each request (stateless mode)
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless mode
        });

        // Clean up when the request is done
        res.on("close", () => {
          transport.close();
        });

        // Connect to the MCP server
        await server.connect(transport);

        // Handle the request
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

    // Add compatibility endpoint for agent-server-example
    app.post("/api/mcp/execute", async (req, res) => {
      try {
        const { tool, params } = req.body;

        if (!tool) {
          return res.status(400).json({ error: "Tool name is required" });
        }

        let result;

        switch (tool) {
          case "create-task":
            if (!params.title) {
              return res
                .status(400)
                .json({ error: "Title is required for create-task" });
            }
            const id = generateId();
            const newTask: Task = {
              id,
              title: params.title,
              description: params.description || "",
              completed: false,
              createdAt: new Date(),
            };

            tasks.set(id, newTask);

            result = {
              content: [
                {
                  type: "text",
                  text: `Task created successfully!\n${formatTask(newTask)}`,
                },
              ],
            };
            break;

          case "list-tasks":
            const status = params.status || "all";
            let filteredTasks = Array.from(tasks.values());

            if (status === "pending") {
              filteredTasks = filteredTasks.filter((task) => !task.completed);
            } else if (status === "completed") {
              filteredTasks = filteredTasks.filter((task) => task.completed);
            }

            if (filteredTasks.length === 0) {
              result = {
                content: [
                  {
                    type: "text",
                    text: "No tasks found.",
                  },
                ],
              };
            } else {
              const taskList = filteredTasks.map(formatTask).join("\n---\n");

              result = {
                content: [
                  {
                    type: "text",
                    text: `Tasks:\n${taskList}`,
                  },
                ],
              };
            }
            break;

          case "pending-tasks":
            const pendingTasks = Array.from(tasks.values()).filter(
              (task) => !task.completed
            );

            if (pendingTasks.length === 0) {
              result = {
                content: [
                  {
                    type: "text",
                    text: "No pending tasks found.",
                  },
                ],
              };
            } else {
              const pendingTaskList = pendingTasks
                .map(formatTask)
                .join("\n---\n");

              result = {
                content: [
                  {
                    type: "text",
                    text: `Pending Tasks:\n${pendingTaskList}`,
                  },
                ],
              };
            }
            break;

          case "complete-task":
            if (!params.id) {
              return res
                .status(400)
                .json({ error: "Task ID is required for complete-task" });
            }

            const task = tasks.get(params.id);

            if (!task) {
              result = {
                content: [
                  {
                    type: "text",
                    text: `Task with ID ${params.id} not found.`,
                  },
                ],
              };
              break;
            }

            if (task.completed) {
              result = {
                content: [
                  {
                    type: "text",
                    text: `Task with ID ${params.id} is already marked as completed.`,
                  },
                ],
              };
              break;
            }

            task.completed = true;
            tasks.set(params.id, task);

            result = {
              content: [
                {
                  type: "text",
                  text: `Task with ID ${
                    params.id
                  } marked as completed!\n${formatTask(task)}`,
                },
              ],
            };
            break;

          default:
            return res.status(400).json({ error: `Unknown tool: ${tool}` });
        }

        res.json(result);
      } catch (error) {
        console.error("Error executing MCP tool:", error);
        res.status(500).json({ error: "Failed to execute MCP tool" });
      }
    });

    // Add API endpoints for tasks
    app.post("/api/tasks", (req, res) => {
      try {
        const { title, description } = req.body;

        if (!title) {
          return res.status(400).json({ error: "Title is required" });
        }

        const id = generateId();
        const newTask: Task = {
          id,
          title,
          description: description ?? "",
          completed: false,
          createdAt: new Date(),
        };

        tasks.set(id, newTask);

        res.status(201).json({
          message: "Task created successfully",
          task: {
            id: newTask.id,
            title: newTask.title,
            description: newTask.description,
            completed: newTask.completed,
            createdAt: newTask.createdAt,
          },
        });
      } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
      }
    });

    app.get("/api/tasks", (req, res) => {
      try {
        const status = (req.query.status as string) ?? "all";

        let filteredTasks = Array.from(tasks.values());

        if (status === "pending") {
          filteredTasks = filteredTasks.filter((task) => !task.completed);
        } else if (status === "completed") {
          filteredTasks = filteredTasks.filter((task) => task.completed);
        }

        res.json({
          tasks: filteredTasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed,
            createdAt: task.createdAt,
          })),
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
      }
    });

    app.patch("/api/tasks/:id/complete", (req, res) => {
      try {
        const { id } = req.params;
        const task = tasks.get(id);

        if (!task) {
          return res
            .status(404)
            .json({ error: `Task with ID ${id} not found` });
        }

        if (task.completed) {
          return res
            .status(400)
            .json({ error: `Task with ID ${id} is already completed` });
        }

        task.completed = true;
        tasks.set(id, task);

        res.json({
          message: "Task marked as completed",
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed,
            createdAt: task.createdAt,
          },
        });
      } catch (error) {
        console.error("Error completing task:", error);
        res.status(500).json({ error: "Failed to complete task" });
      }
    });

    // Start the HTTP server
    app.listen(port, () => {
      console.log(`MCP server running with HTTP transport on port ${port}`);
      console.log(`Access the server at http://localhost:${port}/mcp`);
      console.log(
        `API endpoints available at http://localhost:${port}/api/tasks`
      );
      console.log(
        `MCP tool execution endpoint at http://localhost:${port}/api/mcp/execute`
      );
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
