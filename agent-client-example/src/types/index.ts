// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface TasksResponse {
  tasks: Task[];
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
