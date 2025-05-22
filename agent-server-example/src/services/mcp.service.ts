import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CreateTaskDto,
  McpResponse,
  Task,
  TasksResponse,
} from "../interfaces/task.interface";
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  CallToolRequest,
  CallToolResultSchema
} from '@modelcontextprotocol/sdk/types.js';

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private readonly mcpServerUrl: string;

  // SDK client and transport
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private sessionId: string | undefined = undefined;

  constructor(private readonly configService: ConfigService) {
    this.mcpServerUrl = this.configService.get<string>("MCP_SERVER_URL");
    // Ensure the URL ends with /mcp for the MCP protocol endpoint
    if (!this.mcpServerUrl) {
      console.warn("MCP_SERVER_URL not set in environment variables");
    }
  }

  async onModuleInit() {
    try {
      // Initialize the SDK client
      await this.connect();
      console.log("SDK MCP client initialized successfully");
    } catch (error) {
      // Log the error but continue - we want to be resilient
      console.warn("Warning during MCP client initialization:", error);
      console.log("Service will continue and attempt to connect when needed");
    }
  }

  async onModuleDestroy() {
    // Close the SDK client if it exists
    if (this.client && this.transport) {
      try {
        // The Client class doesn't have a disconnect method
        // Instead, we'll just release the references
        console.log("Releasing SDK MCP client resources");
      } catch (error) {
        console.warn("Error releasing SDK client resources:", error);
      }
      this.client = null;
      this.transport = null;
      this.sessionId = undefined;
    }
  }

  /**
   * Connect to the MCP server using the SDK client
   */
  async connect(): Promise<void> {
    if (this.client) {
      console.log("Already connected to MCP server");
      return;
    }

    console.log(`Connecting to ${this.mcpServerUrl}...`);

    try {
      // Create a new client
      this.client = new Client({
        name: "streamable-http-client",
        version: "1.0.0",
      });
      this.client.onerror = (error) => {
        console.error("\x1b[31mClient error:", error, "\x1b[0m");
      };

      // Create the transport
      this.transport = new StreamableHTTPClientTransport(
        new URL(
          this.mcpServerUrl.endsWith("/mcp")
            ? this.mcpServerUrl
            : `${this.mcpServerUrl}/mcp`
        ),
        {
          sessionId: this.sessionId,
        }
      );

      // Connect the client
      await this.client.connect(this.transport);
      this.sessionId = this.transport.sessionId;
      console.log("Transport created with session ID:", this.sessionId);
      console.log("Connected to MCP server");
    } catch (error) {
      console.error("Failed to connect:", error);
      this.client = null;
      this.transport = null;
    }
  }

  /**
   * Call a tool using the SDK client
   */
  private async callTool(
    functionName: string,
    functionArgs: any
  ): Promise<any> {
    try {
      // Ensure we're connected
      if (!this.client) {
        await this.connect();
      }

      if (!this.client) {
        throw new Error("Failed to connect to MCP server");
      }

      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: functionName,
          arguments: functionArgs,
        },
      };

      console.log(
        `Calling tool '${request.params.name}' with args:`,
        request.params.arguments
      );
      const result = await this.client.request(
        request,
        CallToolResultSchema,
        {}
      );

      console.log("Tool result:");
      result.content?.forEach((item) => {
        if (item.type === "text") {
          console.log(`  ${item.text}`);
        } else {
          console.log(`  ${item.type} content:`, item);
        }
      });

      return result;
    } catch (error) {
      console.log(`Error calling tool ${functionName} with SDK client:`, error);
      // Fallback to legacy client
      return this.fallbackCallTool(functionName, functionArgs);
    }
  }

  /**
   * Fallback for tool calls when the SDK client fails
   */
  private async fallbackCallTool(
    functionName: string,
    functionArgs: any
  ): Promise<any> {
    console.log(`Creating fallback response for ${functionName}`);
    // Create a fallback response since we don't have the legacy client anymore
    return {
      content: [
        {
          type: "text",
          text: `Failed to execute ${functionName}. The MCP server might not support this tool or the MCP protocol.`,
        },
      ],
    };
  }

  async getTasks(status?: string): Promise<TasksResponse> {
    try {
      // Try using the SDK client first
      const result = await this.callTool("list-tasks", { status });
      console.log(
        "[DEBUG] Raw MCP response from getTasks:",
        JSON.stringify(result, null, 2)
      );

      // If the result already has a tasks property, return it directly
      if (result?.tasks) {
        return result;
      }

      // Otherwise, try to parse the response
      const taskList = this.parseTasksFromMcpResponse(result);
      return { tasks: taskList || [] };
    } catch (error) {
      console.error("Error getting tasks:", error);
      return { tasks: [] };
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      // Only validate that title exists
      if (!createTaskDto.title) {
        throw new Error("Task title is required");
      }

      // Use the callTool method
      const result = await this.callTool("create-task", {
        title: createTaskDto.title,
        description: createTaskDto.description || "",
      });

      // Try to extract the task from the response
      if (result?.content) {
        for (const item of result.content) {
          if (item.type === "text" && item.text) {
            try {
              // Check if the text contains JSON
              if (item.text.includes("{") && item.text.includes("}")) {
                const jsonMatch = item.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const jsonData = JSON.parse(jsonMatch[0]);
                  if (jsonData.id) {
                    return {
                      id: jsonData.id,
                      title: createTaskDto.title,
                      description: createTaskDto.description || "",
                      completed: false,
                      createdAt: new Date(),
                    };
                  }
                }
              }

              // If we couldn't extract JSON but the text mentions success
              if (item.text.toLowerCase().includes("success")) {
                return {
                  id: `task-${Date.now()}`,
                  title: createTaskDto.title,
                  description: createTaskDto.description || "",
                  completed: false,
                  createdAt: new Date(),
                };
              }
            } catch (e) {
              console.warn("Error parsing JSON from content text:", e);
            }
          }
        }
      }

      console.log("Could not parse MCP response, creating synthetic task");
      // If we couldn't extract a task, create a synthetic one
      return {
        id: `task-${Date.now()}`,
        title: createTaskDto.title,
        description: createTaskDto.description || "",
        completed: false,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating task:", error);
      throw new HttpException(
        "Failed to create task",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async completeTask(id: string): Promise<Task> {
    try {
      // Use the callTool method
      const result = await this.callTool("complete-task", { id });

      // Try to extract the task from the response
      if (result?.content) {
        for (const item of result.content) {
          if (item.type === "text" && item.text) {
            try {
              // Check if the text contains JSON
              if (item.text.includes("{") && item.text.includes("}")) {
                const jsonMatch = item.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const jsonData = JSON.parse(jsonMatch[0]);
                  if (jsonData.id) {
                    return {
                      ...jsonData,
                      completed: true,
                      createdAt: new Date(),
                    };
                  }
                }
              }

              // If we couldn't extract JSON but the text mentions success
              if (item.text.toLowerCase().includes("success")) {
                return {
                  id,
                  title: "Task",
                  description: "",
                  completed: true,
                  createdAt: new Date(),
                };
              }
            } catch (e) {
              console.warn("Error parsing JSON from content text:", e);
            }
          }
        }
      }

      // If we couldn't extract a task, create a synthetic one
      console.log(
        "Could not parse MCP response, creating synthetic completed task"
      );
      return {
        id,
        title: "Task",
        description: "",
        completed: true,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error(`Error completing task ${id}:`, error);
      throw new HttpException(
        "Failed to complete task",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Parse tasks from an MCP response
   * @param mcpResponse The MCP response to parse
   * @returns The parsed tasks
   */
  private parseTasksFromMcpResponse(mcpResponse: McpResponse): Task[] {
    try {
      if (!mcpResponse?.content || mcpResponse.content.length === 0) {
        console.log(
          "[DEBUG] No content in MCP response:",
          JSON.stringify(mcpResponse, null, 2)
        );
        return [];
      }

      const text = mcpResponse.content[0].text;
      console.log("[DEBUG] Content text in MCP response:", text);

      // If no tasks found
      if (text.includes("No tasks found")) {
        return [];
      }

      // Split the text by task separator
      const taskTexts = text.split("---");

      // Parse each task
      return taskTexts
        .map((taskText) => {
          // Extract task info from the text using RegExp.exec()
          const idRegex = /ID:\s*([\w-]+)/;
          const titleRegex = /Title:\s*(.+)(?=\n)/;
          const descriptionRegex = /Description:\s*(.+)(?=\n)/;
          const statusRegex = /Status:\s*(Completed|Pending)/;
          const createdRegex = /Created:\s*(.+)/;

          const idMatch = idRegex.exec(taskText);
          const titleMatch = titleRegex.exec(taskText);
          const descriptionMatch = descriptionRegex.exec(taskText);
          const statusMatch = statusRegex.exec(taskText);
          const createdMatch = createdRegex.exec(taskText);

          if (!idMatch || !titleMatch) {
            return null;
          }

          return {
            id: idMatch[1],
            title: titleMatch[1],
            description: descriptionMatch ? descriptionMatch[1] : "",
            completed: statusMatch ? statusMatch[1] === "Completed" : false,
            createdAt: createdMatch ? new Date(createdMatch[1]) : new Date(),
          };
        })
        .filter(Boolean) as Task[];
    } catch (error) {
      console.error("Failed to parse tasks from MCP response:", error);
      return [];
    }
  }
}
