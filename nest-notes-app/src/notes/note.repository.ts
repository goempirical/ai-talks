
import { Injectable } from '@nestjs/common';
import { Note } from './note.entity';
import { NoteRepository as INoteRepository } from './interfaces/note-repository.interface';
import {
  PaginatedResult,
  PaginationParams,
} from './interfaces/pagination.interface';

@Injectable()
export class NoteRepository implements INoteRepository {
  private notes: Note[] = [];
  private idCounter = 1;

  save(note: Note): Note {
    note.id = this.idCounter++;
    this.notes.push(note);
    return { ...note }; // Return a copy to prevent reference mutations
  }

  findAll(): Note[] {
    return [...this.notes]; // Return a copy of the array
  }

  findById(id: number): Note | null {
    const note = this.notes.find((note) => note.id === id);
    return note ? { ...note } : null;
  }

  update(id: number, entityData: Partial<Note>): Note | null {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      return null;
    }

    // Update only the provided fields
    const updatedNote = {
      ...this.notes[index],
      ...entityData,
      id, // Ensure id doesn't change
    };

    this.notes[index] = updatedNote;
    return { ...updatedNote };
  }

  remove(id: number): boolean {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      return false;
    }

    this.notes.splice(index, 1);
    return true;
  }

  findByTitle(title: string): Note[] {
    const lowercaseTitle = title.toLowerCase();
    return this.notes
      .filter((note) => note.title.toLowerCase().includes(lowercaseTitle))
      .map((note) => ({ ...note }));
  }

  findWithPagination(params: PaginationParams): PaginatedResult<Note> {
    const { page, limit } = params;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalItems = this.notes.length;
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedItems = this.notes
      .slice(startIndex, endIndex)
      .map((note) => ({ ...note }));

    return {
      items: paginatedItems,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  count(): number {
    return this.notes.length;
  }
}
