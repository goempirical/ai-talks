# 🔌 MCP Tool Server - AI Agent Toolkit

![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green)

A powerful and extensible Model Context Protocol (MCP) server that enables AI agents to interact with external tools and services. This implementation provides a task management system that demonstrates how to build and deploy MCP-compatible tools for AI assistants. The server supports both stdio transport for direct MCP communication and HTTP transport for web-based integrations.

## 🌟 What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools, data sources, and services. This server implements the MCP specification, enabling AI assistants like Claude and GPT to execute real-world actions through a standardized interface.

## ✨ Features

- **MCP-Compatible Tools**: Ready-to-use tools for AI assistants
- **Task Management System**: Create, list, and complete tasks
- **Multiple Transport Options**: Works with both stdio and HTTP transport
- **Native MCP Protocol Support**: Implements the official MCP specification
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

### Legacy HTTP API (for Web Applications)

```bash
npm run http
```

This runs the traditional HTTP API server. The HTTP server runs on port 3001 by default.

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

### RESTful API Endpoints

#### Create a Task

```
POST /api/tasks
```

Request body:
```json
{
  "title": "Task title",
  "description": "Task description"
}
```

#### List All Tasks

```
GET /api/tasks?status=[all|pending|completed]
```

#### List Pending Tasks

```
GET /api/tasks/pending
```

#### Complete a Task

```
PATCH /api/tasks/:id/complete
```

#### Execute MCP Tool Directly

```
POST /api/mcp/execute
```

Request body:
```json
{
  "tool": "tool-name",
  "params": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

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

## 🔄 Integration with Other Projects

### Agent Server Example

To connect the `agent-server-example` project to this MCP server:

1. Set the `MCP_SERVER_URL` environment variable in the agent-server-example's `.env` file:
   ```
   MCP_SERVER_URL=http://localhost:3001
   ```

2. Start the MCP server with HTTP transport:
   ```bash
   npm run start:http
   ```

3. Start the agent-server-example:
   ```bash
   cd ../agent-server-example
   npm start
   ```

### Agent Client Example

The `agent-client-example` project provides a web interface for interacting with AI assistants and MCP tools. It connects to the agent-server-example, which in turn connects to this MCP server.

## 📋 Future Enhancements

- Persistent storage options (MongoDB, PostgreSQL)
- Authentication and authorization
- Additional tool categories (file management, web search, etc.)
- WebSocket support for real-time updates
- Tool execution metrics and logging
- Session management for stateful MCP interactions
- Streaming responses for large data transfers

## 📄 License

MIT

---

*Empowering AI agents with real-world capabilities* 🤖✨
