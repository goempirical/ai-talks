# 🔌 MCP Tool Server - AI Agent Toolkit

![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green)

A powerful and extensible Model Context Protocol (MCP) server that enables AI agents to interact with external tools and services. This implementation provides a task management system that demonstrates how to build and deploy MCP-compatible tools for AI assistants.

## 🌟 What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools, data sources, and services. This server implements the MCP specification, enabling AI assistants like Claude and GPT to execute real-world actions through a standardized interface.

## ✨ Features

- **MCP-Compatible Tools**: Ready-to-use tools for AI assistants
- **Task Management System**: Create, list, and complete tasks
- **Dual Interface**: Works with both MCP stdio mode and HTTP API
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

### MCP Mode (for AI Assistants)

```bash
npm start
```

This runs the server in stdio mode, making it compatible with MCP clients like Claude for Desktop.

### HTTP Mode (for Web Applications)

```bash
npm run http
```

The HTTP server runs on port 3000 by default. You can access it at `http://localhost:3000`.

Customize the port using the `PORT` environment variable:

```bash
PORT=8080 npm run http
```

## 🌐 HTTP API Endpoints

### Create a Task

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

### List All Tasks

```
GET /api/tasks?status=[all|pending|completed]
```

### List Pending Tasks

```
GET /api/tasks/pending
```

### Complete a Task

```
PATCH /api/tasks/:id/complete
```

### Execute MCP Tool Directly

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

## 🔄 Integration with Web Clients

This server pairs perfectly with the `agent-client-example` project, which provides a web interface for interacting with AI assistants and MCP tools.

## 📋 Future Enhancements

- Persistent storage options (MongoDB, PostgreSQL)
- Authentication and authorization
- Additional tool categories (file management, web search, etc.)
- WebSocket support for real-time updates
- Tool execution metrics and logging

## 📄 License

MIT

---

*Empowering AI agents with real-world capabilities* 🤖✨
