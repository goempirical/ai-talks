import axios from 'axios';
import { ApiResponse, CreateTaskRequest, Task, TasksResponse } from '../types';

// Add type definition for import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

// Extend the ImportMeta interface from the 'vite/client' module
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Use type assertion for Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const sendMessage = async (message: string, history: Array<{ role: string, content: string }>) => {
  const response = await api.post<{ response: string }>('/chat', {
    message,
    history,
  });
  return response.data;
};

// Tasks API
export const getTasks = async (status?: string): Promise<ApiResponse<TasksResponse>> => {
  try {
    const params = status ? { status } : {};
    const response = await api.get<TasksResponse>('/tasks', { params });
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Failed to fetch tasks' };
    }
    return { error: 'An unknown error occurred' };
  }
};

export const createTask = async (task: CreateTaskRequest): Promise<ApiResponse<Task>> => {
  try {
    const response = await api.post<Task>('/tasks', task);
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Failed to create task' };
    }
    return { error: 'An unknown error occurred' };
  }
};

export const completeTask = async (id: string): Promise<ApiResponse<Task>> => {
  try {
    const response = await api.patch<Task>(`/tasks/${id}/complete`);
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Failed to complete task' };
    }
    return { error: 'An unknown error occurred' };
  }
};

export default api;
