import axios from 'axios';
import { Note } from '../types/Note';
import { PaginatedResult } from '../types/PaginatedResult';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get('/notes');
  return response.data;
};

export const getPaginatedNotes = async (page = 1, limit = 10): Promise<PaginatedResult<Note>> => {
  const response = await api.get(`/notes/paginated?page=${page}&limit=${limit}`);
  return response.data;
};

export const getNoteById = async (id: number): Promise<Note> => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (note: Partial<Note>): Promise<Note> => {
  const response = await api.post('/notes', note);
  return response.data;
};

export const updateNote = async (id: number, note: Partial<Note>): Promise<Note> => {
  const response = await api.put(`/notes/${id}`, note);
  return response.data;
};

export const deleteNote = async (id: number): Promise<void> => {
  await api.delete(`/notes/${id}`);
};

export const searchNotes = async (title: string): Promise<Note[]> => {
  const response = await api.get(`/notes/search?title=${encodeURIComponent(title)}`);
  return response.data;
};

export const searchNotesPaginated = async (
  title: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<Note>> => {
  const response = await api.get(
    `/notes/search/paginated?title=${encodeURIComponent(title)}&page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getNotesCount = async (): Promise<number> => {
  const response = await api.get('/notes/count');
  return response.data.count;
};

export default api;
