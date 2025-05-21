# 🔌 MCP Tool Server - AI Agent Toolkit

![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green)
![MCP SDK](https://img.shields.io/badge/MCP%20SDK-Compatible-orange)

A powerful and extensible Model Context Protocol (MCP) server that enables AI agents to interact with external tools and services. This implementation provides a task management system that demonstrates how to build and deploy MCP-compatible tools for AI assistants. The server supports both stdio transport for direct MCP communication and HTTP transport for web-based integrations, with robust session management for reliable client connections.

## 🌟 What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools, data sources, and services. This server implements the MCP specification, enabling AI assistants like Claude and GPT to execute real-world actions through a standardized interface.

## ✨ Features

- **MCP-Compatible Tools**: Ready-to-use tools for AI assistants
- **Task Management System**: Create, list, and complete tasks
- **Multiple Transport Options**: Works with both stdio and HTTP transport
- **Native MCP Protocol Support**: Implements the official MCP specification
- **Robust Session Management**: Maintains valid session IDs for reliable tool execution
- **MCP SDK Integration**: Compatible with the official MCP SDK client
- **RESTful API**: HTTP endpoints for traditional web applications
- **Extensible Architecture**: Easily add new tools and capabilities
- **Developer-Friendly**: Clear documentation and examples
- **Lightweight**: In-memory storage for quick setup and testing

## 🛠️ Available Tools

### 1. create-task

Creates a new task with a title and description.

**Parameters:**
- `title`: String (required) - The title of the task
- `description`: String (required) - The description of the task

### 2. list-tasks

Lists all tasks currently stored in memory.

**Parameters:**
- `status`: String (optional) - Filter by status: "all", "pending", or "completed"

### 3. pending-tasks

Lists all pending tasks.

**Parameters:** None

### 4. complete-task

Marks a specific task as completed.

**Parameters:**
- `id`: String (required) - The ID of the task to mark as completed

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-server.git
cd mcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## 🏃‍♂️ Running the Server

### Stdio Transport (for AI Assistants)

```bash
npm start
```

This runs the server in stdio mode, making it compatible with MCP clients like Claude for Desktop.

### HTTP Transport (Native MCP Protocol)

```bash
npm run start:http
```

This runs the server with HTTP transport using the native MCP protocol. The server listens on port 3001 by default and exposes the MCP endpoint at `/mcp`.


Customize the port using the `PORT` environment variable for any mode:

```bash
PORT=8080 npm run start:http
```

## 🌐 Available Endpoints

### Native MCP Protocol Endpoint

```
POST /mcp
```

This endpoint implements the Model Context Protocol specification for HTTP transport. It accepts and responds with MCP-formatted JSON-RPC messages.

## 🔮 Building Your Own MCP Tools

This server provides a template for creating your own MCP-compatible tools. To add a new tool:

1. Define your tool in the `src/tools` directory
2. Register it in the tool registry
3. Implement the necessary logic
4. Update the HTTP API if needed

Check the existing tools for examples of how to structure your implementations.

## 🧪 Testing with AI Assistants

1. Start the server in MCP mode: `npm start`
2. Connect to the server using an MCP-compatible AI assistant
3. The AI can now use the available tools to manage tasks:
   - Create a task: `create-task` with title and description
   - List all tasks: `list-tasks`
   - Complete a task: `complete-task` with the task ID

## 🔄 Integration with MCP Clients

This server implements the Model Context Protocol specification and can be used with any MCP-compatible client. It supports both custom clients and the official MCP SDK.

### Using with the MCP SDK

1. Install the MCP SDK in your client application:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. Use the SDK's `Client` and `StreamableHTTPClientTransport` classes to connect to the server:
   ```typescript
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';
   import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
   import { CallToolRequest, CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
   
   // Create a new client
   const client = new Client({
     name: "my-mcp-client",
     version: "1.0.0",
   });
   
   // Create the transport with the server URL
   const transport = new StreamableHTTPClientTransport(
     new URL("http://localhost:3001/mcp")
   );
   
   // Connect the client
   await client.connect(transport);
   
   // The session ID is automatically managed by the transport
   console.log("Connected with session ID:", transport.sessionId);
   
   // Call a tool
   const result = await client.request({
     method: "tools/call",
     params: {
       name: "list-tasks",
       arguments: { status: "all" },
     },
   }, CallToolResultSchema, {});
   ```

### Using with a Custom Client

1. Start the MCP server with HTTP transport:
   ```bash
   npm run start:http
   ```

2. Configure your MCP client to connect to the server at:
   ```
   http://localhost:3001/mcp
   ```

3. Make sure to extract and reuse the session ID from the server's responses for subsequent requests.

4. The client can now use the available MCP tools defined in this server.

## 📋 Future Enhancements

- Persistent storage options (MongoDB, PostgreSQL)
- Authentication and authorization
- Additional tool categories (file management, web search, etc.)
- WebSocket support for real-time updates
- Tool execution metrics and logging
- Enhanced error handling and recovery mechanisms
- Streaming responses for large data transfers
- Improved client-side SDK examples and documentation

## 📄 License

MIT

---

*Empowering AI agents with real-world capabilities* 🤖✨
