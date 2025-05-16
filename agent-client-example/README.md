# 🤖 OpenAI Agent Playground - Client

![OpenAI Agent Status](https://img.shields.io/badge/OpenAI%20Agent-Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![React](https://img.shields.io/badge/React-18.0%2B-61DAFB)

A modern, sleek React-based client for testing and experimenting with OpenAI Agents and Tools. This application provides an intuitive interface to interact with AI agents, execute tool calls, and explore the capabilities of OpenAI's Agent framework.

## 🌟 Features

- **Interactive Chat Interface**: Engage with AI agents through a responsive and intuitive chat UI
- **Real-time Tool Execution**: Watch as the AI agent executes tools in real-time
- **Task Management**: Create, track, and complete tasks through natural language
- **Tool Development Sandbox**: Test and iterate on custom tools with immediate feedback
- **Conversation History**: Review past interactions and agent reasoning
- **Extensible Architecture**: Easily add new tools and capabilities

## 🛠️ Tech Stack

- **React** with **TypeScript** for type-safe development
- **Vite** as the lightning-fast build tool
- **Tailwind CSS 4.1** for modern, responsive styling
- **TanStack React Query** for efficient data fetching and state management
- **React Router** for seamless navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Backend server running (see the `agent-server-example` project)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/agent-client-example.git
cd agent-client-example
```

2. Install dependencies:

```bash
npm install
```

3. Configure the environment:

Create or modify the `.env` file in the root directory:

```
VITE_API_URL=http://localhost:4000
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## 📂 Project Structure

- `src/components/` - Reusable UI components including the chat interface
- `src/pages/` - Page components for different routes
- `src/services/` - API client services for communicating with the backend
- `src/hooks/` - Custom React hooks for state management
- `src/types/` - TypeScript type definitions for agents and tools
- `src/utils/` - Utility functions and helpers

## 🔧 Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🧪 Testing Your Agents

This client is designed to help you test and iterate on OpenAI Agents with custom tools. Here's how to get the most out of it:

1. **Define your tools** in the backend server
2. **Create conversations** with the agent through the chat interface
3. **Observe tool execution** in real-time
4. **Refine your prompts and tools** based on the agent's performance

## 🔮 Future Enhancements

- Tool debugging interface
- Performance metrics for agent interactions
- Custom tool creation UI
- Multi-agent conversations
- Integration with additional AI models

## 📄 License

MIT

---

*Built with ❤️ for AI agent developers and enthusiasts*
