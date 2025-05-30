# 🔌 Enhanced MCP Server - AI Agent Toolkit

![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green)
![MCP SDK](https://img.shields.io/badge/MCP%20SDK-Compatible-orange)

A comprehensive and extensible Model Context Protocol (MCP) server with modular architecture supporting task management, email functionality, environment variables, and utility tools. This enhanced implementation provides 23 production-ready tools that enable AI agents to interact with external services while maintaining clean, maintainable, and human-readable code.

## 🌟 What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools, data sources, and services. This server implements the MCP specification, enabling AI assistants like Claude and GPT to execute real-world actions through a standardized interface.

## ✨ Features

### 🎯 Task Management (7 tools)
- **create-task**: Create new tasks with title, description, priority, and tags
- **list-tasks**: List all tasks with filtering by status, priority, or tags
- **pending-tasks**: Get all pending tasks (legacy compatibility)
- **complete-task**: Mark tasks as completed
- **update-task**: Update existing task properties
- **delete-task**: Delete tasks permanently
- **task-stats**: Get comprehensive task statistics

### 📧 Email Functionality (4 tools)
- **send-email**: Send simple text emails with CC/BCC support
- **send-html-email**: Send HTML emails with text fallback
- **test-email**: Test email configuration and SMTP connection
- **send-task-notification**: Send email notifications about task updates

### 🔧 Environment Variables (5 tools)
- **set-env-var**: Set/update environment variables with descriptions
- **get-env-var**: Retrieve environment variable values
- **list-env-vars**: List all managed environment variables
- **delete-env-var**: Remove environment variables
- **export-env-vars**: Export variables in .env format

### 🛠️ Utility Tools (7 tools)
- **get-datetime**: Get current date/time in various formats
- **generate-uuid**: Generate UUIDs in different formats
- **generate-random**: Generate random data (numbers, strings, passwords, hex, base64)
- **calculate-hash**: Calculate hashes using MD5, SHA1, SHA256, SHA512
- **sleep**: Sleep/delay for specified duration
- **get-server-status**: Get server status and resource usage
- **get-server-config**: Get detailed server configuration

### 🏗️ Architecture Features
- **Modular Design**: Each tool category in separate files for maintainability
- **Feature Flags**: Enable/disable functionality via environment variables
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Configuration Management**: Centralized config with validation
- **Error Handling**: Robust error handling with user-friendly messages
- **Backward Compatibility**: Maintains compatibility with existing implementations

## 🏗️ Architecture

The server uses a modular architecture for maintainability and extensibility:

```
src/
├── config/          # Configuration management
├── services/        # Business logic services
├── tools/           # Tool implementations by category
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
└── index.ts         # Main server entry point
```

### Key Design Principles

- **Modular**: Each tool category is in its own file
- **Configurable**: Features can be enabled/disabled via environment variables
- **Type-safe**: Full TypeScript support with comprehensive interfaces
- **Maintainable**: Clear separation of concerns and consistent patterns
- **Extensible**: Easy to add new tools and categories

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server Configuration
MCP_SERVER_NAME=enhanced-mcp-server
MCP_SERVER_VERSION=2.0.0
PORT=3001

# Feature Flags
FEATURE_TASK_MANAGEMENT_ENABLED=true
FEATURE_EMAIL_ENABLED=true
FEATURE_ENV_VARS_ENABLED=true

# Email Configuration (required if email enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Email Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password: Google Account → Security → App passwords
3. Use the app password as `SMTP_PASS`

## 🚀 Installation & Usage

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Build the project
npm run build

# Start the server
npm start

# Or start with HTTP transport
npm start -- --http
```

### Development
```bash
# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🛠️ Tool Examples

### Task Management
Enhanced task management with priority levels, tags, and comprehensive filtering:

```typescript
// Create a task with priority and tags
{
  "title": "Review pull request",
  "description": "Review the new authentication feature",
  "priority": "high",
  "tags": "code-review,security,urgent"
}

// List tasks with filtering
{
  "status": "pending",
  "priority": "high",
  "tag": "urgent"
}
```

### Email Integration
Full-featured email capabilities with SMTP support:

```typescript
// Send HTML email with attachments
{
  "to": "user@example.com",
  "subject": "Project Update",
  "html": "<h1>Status Report</h1><p>All tasks completed!</p>",
  "cc": "manager@example.com"
}

// Send task notification
{
  "to": "team@example.com",
  "taskId": "task-123",
  "action": "completed",
  "message": "Great work team!"
}
```

### Environment Variables
Secure environment variable management with secret masking:

```typescript
// Set a secret variable
{
  "key": "API_SECRET",
  "value": "super-secret-key",
  "description": "Third-party API secret key",
  "isSecret": true
}

// Export all non-secret variables
{
  "includeSecrets": false,
  "includeComments": true
}
```

### Utility Functions
Comprehensive utility tools for common tasks:

```typescript
// Generate secure password
{
  "type": "password",
  "length": 16,
  "includeSymbols": true
}

// Calculate file hash
{
  "text": "Hello, World!",
  "algorithm": "sha256",
  "encoding": "hex"
}
```

## 🌐 API Endpoints (HTTP Mode)

When running with `--http` flag:

- **Server**: `http://localhost:3001/mcp`
- **Health**: `http://localhost:3001/health`
- **Tasks**: `http://localhost:3001/tasks` (GET/POST)
- **Task by ID**: `http://localhost:3001/tasks/:id` (GET/PUT/DELETE)

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

## 🔒 Security Considerations

- Environment variables marked as secrets are masked in output
- Email credentials should use app-specific passwords
- SMTP connections use TLS when available
- Input validation on all tool parameters
- No sensitive data logged to console

## 🤝 Contributing

1. Follow the modular architecture patterns
2. Add comprehensive TypeScript types
3. Include proper error handling
4. Update documentation for new tools
5. Maintain backward compatibility

## 📋 Backward Compatibility

The server maintains full backward compatibility with the original task management functionality while adding new features. All existing tools work exactly as before.

## 📄 Changelog

### v2.0.0
- ✨ Added modular architecture
- ✨ Added email functionality (4 tools)
- ✨ Added environment variable management (5 tools)
- ✨ Added utility tools (7 tools)
- ✨ Added comprehensive configuration system
- ✨ Added feature flags for enabling/disabling functionality
- ✨ Enhanced task management with priorities and tags
- ✨ Added TypeScript interfaces for all components
- 🔧 Improved error handling and validation
- 📚 Added comprehensive documentation
- 🔒 Added security features for sensitive data
- ⚡ Maintained full backward compatibility

### v1.0.0
- 🎯 Basic task management functionality
- 📝 Create, list, and complete tasks
- 🚀 MCP protocol support
- 🌐 HTTP and stdio transport options

## 📄 License

MIT

---

*Empowering AI agents with real-world capabilities* 🤖✨
