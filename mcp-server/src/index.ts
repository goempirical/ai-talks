/**
 * Enhanced MCP Server with modular architecture
 * Supports task management, email functionality, environment variables, and utility tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

// Import our modular components
import { serverConfig, validateConfig, getConfigSummary } from './config/index.js';
import { getAllTools, validateToolRegistry, getToolStats } from './tools/index.js';

// Check if this module is being imported or run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Validate configuration on startup
validateConfig();

// Create server instance with dynamic configuration
const server = new McpServer({
  name: serverConfig.name,
  version: serverConfig.version,
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register all tools dynamically
function registerTools() {
  const tools = getAllTools();
  const validation = validateToolRegistry();
  
  if (!validation.valid) {
    console.error('Tool registry validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log(`Registering ${tools.length} tools...`);
  
  tools.forEach(tool => {
    try {
      server.tool(
        tool.name,
        tool.description,
        tool.inputSchema,
        tool.handler
      );
      console.log(`  ✅ Registered tool: ${tool.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to register tool ${tool.name}:`, error);
    }
  });

  // Log tool statistics
  const stats = getToolStats();
  console.log(`\n📊 Tool Registration Summary:`);
  console.log(`  Total tools: ${stats.total}`);
  console.log(`  Enabled categories: ${stats.enabled.join(', ')}`);
  if (stats.disabled.length > 0) {
    console.log(`  Disabled categories: ${stats.disabled.join(', ')}`);
  }
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`  ${category}: ${count} tools`);
    }
  });
}

// Register all tools
registerTools();

// Main function to run the server
async function main() {
  // Log configuration summary
  console.log(getConfigSummary());
  
  // Check if we should use HTTP transport
  const useHttp = process.argv.includes("--http");
  const port = serverConfig.port;

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

// Export the server and tasks for potential use in other modules (backward compatibility)
export { server };

// Re-export tasks for backward compatibility
export { tasks } from './tools/taskTools.js';
