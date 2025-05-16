# AI Talks - Educational AI Sessions Examples

![AI Sessions](https://img.shields.io/badge/AI%20Sessions-Educational-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.0%2B-red)
![React](https://img.shields.io/badge/React-18.0%2B-61DAFB)

A collection of educational examples used in AI Sessions for learning about AI agent development and the Model Context Protocol (MCP). This repository contains multiple interconnected projects that demonstrate various concepts in AI-driven applications for educational purposes.

## Overview

This repository provides examples for learning about AI agents and their applications:

- **Client Application**: A modern React-based interface for interacting with AI agents
- **Agent Server**: A NestJS backend that bridges AI models with MCP tools
- **MCP Server**: A Model Context Protocol server that enables AI agents to perform real-world actions
- **Notes Application**: A sample application demonstrating practical AI integration

## Projects

### [Agent Client Example](/agent-client-example)

A React-based client for educational purposes to learn about AI Agents and Tools. Features include:

- Interactive chat interface with AI agents
- Real-time tool execution visualization
- Task management through natural language
- Conversation history tracking

### [Agent Server Example](/agent-server-example)

A NestJS backend that bridges AI models with MCP servers for educational purposes:

- AI-powered chat interface with latest models
- Function calling mapped to executable actions
- MCP tool execution bridge
- Task management API

### [MCP Server](/mcp-server)

A Model Context Protocol (MCP) server example for learning how AI agents interact with external tools:

- MCP-compatible tools for AI assistants
- Task management system (create, list, complete tasks)
- Dual interface: MCP stdio mode and HTTP API
- Extensible architecture for adding new tools

### [Nest Notes App](/nest-notes-app)

A simple NestJS application with a notes module specifically designed for applying refactoring techniques and best practices:

- Demonstrates code refactoring using AI tools like Windsurf and Cursor
- Showcases effective prompt engineering for code improvements
- Provides a practical codebase for learning AI-assisted development
- Includes REST API endpoints and frontend components as refactoring targets

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- AI API key (for certain examples)

### Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-talks.git
cd ai-talks
```

2. Set up each project by following the instructions in their respective README files.

3. For a complete learning experience, start the projects in this order:
   - MCP Server
   - Agent Server
   - Agent Client

## How It All Works Together

This educational repository demonstrates the following workflow:

1. **User Interaction**: Users interact with the AI through the Agent Client interface
2. **Request Processing**: The Agent Server processes natural language requests using AI models
3. **Tool Identification**: The AI identifies which tools are needed to fulfill the request
4. **MCP Execution**: The Agent Server calls the appropriate MCP tools
5. **Response Generation**: Results are processed and returned to the user interface

## Educational Objectives

These examples are designed to help you learn:

1. **AI Agent Fundamentals**: Understanding how AI agents process and respond to requests
2. **Tool Integration**: How to create tools that AI agents can use
3. **MCP Protocol**: The basics of the Model Context Protocol for AI tool execution
4. **Full-Stack Development**: Building complete applications with AI capabilities
5. **Best Practices**: Patterns for effective AI integration in applications

## Development Workflow

For educational purposes, try following this workflow:

1. **Define MCP Tools**: Create new tools in the MCP Server
2. **Register Tools**: Make tools available to the Agent Server
3. **Test with Client**: Use the Agent Client to interact with your tools
4. **Iterate and Refine**: Improve tool functionality based on testing

## Future Learning Topics

- Authentication and user management
- Persistent storage for conversations and tasks
- Additional tool categories (file management, web search, etc.)
- Multi-agent conversations
- Performance metrics and monitoring

## License

MIT

---

*Educational resources for learning about AI agent development and integration* 🎓✨
