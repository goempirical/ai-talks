import { Injectable, Logger, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { Note } from './note.entity';
import { NoteRepository } from './interfaces/note-repository.interface';
import { CreateNoteDto } from './dto/create-note.dto';
import { PaginatedResult, PaginationParams } from './interfaces/pagination.interface';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @Inject('NoteRepository')
    private readonly noteRepository: NoteRepository,
  ) {}

  createNote(createNoteDto: CreateNoteDto): Note {
    this.logger.log(`Creating note with title: ${createNoteDto.title}`);

    const note = new Note();
    note.title = createNoteDto.title;
    note.content = createNoteDto.content ?? '';
    note.createdAt = new Date();

    return this.noteRepository.save(note);
  }

  findAllNotes(): Note[] {
    this.logger.log('Finding all notes');
    return this.noteRepository.findAll();
  }
  
  findNotesWithPagination(page = 1, limit = 10): PaginatedResult<Note> {
    this.logger.log(`Finding notes with pagination: page ${page}, limit ${limit}`);
    
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    
    const params: PaginationParams = { page, limit };
    return this.noteRepository.findWithPagination(params);
  }

  findNoteById(id: number): Note {
    this.logger.log(`Finding note with id: ${id}`);
    const note = this.noteRepository.findById(id);
    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    return note;
  }

  updateNote(id: number, updateData: Partial<Note>): Note {
    this.logger.log(`Updating note with id: ${id}`);
    const updatedNote = this.noteRepository.update(id, updateData);
    if (!updatedNote) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    return updatedNote;
  }

  removeNote(id: number): void {
    this.logger.log(`Removing note with id: ${id}`);
    const deleted = this.noteRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
  }

  findNotesByTitle(title: string): Note[] {
    this.logger.log(`Finding notes with title containing: ${title}`);
    return this.noteRepository.findByTitle(title);
  }
  
  findNotesByTitleWithPagination(title: string, page = 1, limit = 10): PaginatedResult<Note> {
    this.logger.log(`Finding notes with title containing: ${title} with pagination`);
    
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    
    // Get all notes matching the title
    const matchingNotes = this.noteRepository.findByTitle(title);
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalItems = matchingNotes.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get the paginated items
    const paginatedItems = matchingNotes.slice(startIndex, endIndex);
    
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
  
  getTotalCount(): number {
    return this.noteRepository.count();
  }
}
