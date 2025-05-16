import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { PaginatedResult } from './interfaces/pagination.interface';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('notes')
@Controller('notes')
@UseInterceptors(ClassSerializerInterceptor)
export class NotesController {
  private readonly logger = new Logger(NotesController.name);

  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiCreatedResponse({
    description: 'The note has been successfully created.',
    type: Note,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (e.g., title too short)',
  })
  createNote(@Body() createNoteDto: CreateNoteDto): Note {
    this.logger.log('Creating a new note');
    return this.notesService.createNote(createNoteDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all notes' })
  @ApiOkResponse({
    description: 'List of all notes',
    type: [Note],
  })
  getAllNotes(): Note[] {
    this.logger.log('Getting all notes');
    return this.notesService.findAllNotes();
  }

  @Get('paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notes with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiOkResponse({
    description: 'Paginated list of notes',
    schema: {
      properties: {
        items: { type: 'array', items: { $ref: 'Note' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNext: { type: 'boolean' },
        hasPrevious: { type: 'boolean' },
      },
    },
  })
  getPaginatedNotes(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): PaginatedResult<Note> {
    return this.notesService.findNotesWithPagination(page, limit);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search notes by title' })
  @ApiQuery({ name: 'title', required: true, type: String, description: 'Title to search for' })
  @ApiOkResponse({
    description: 'List of notes matching the title',
    type: [Note],
  })
  searchNotesByTitle(@Query('title') title: string): Note[] {
    return this.notesService.findNotesByTitle(title);
  }

  @Get('search/paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search notes by title with pagination' })
  @ApiQuery({ name: 'title', required: true, type: String, description: 'Title to search for' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiOkResponse({
    description: 'Paginated list of notes matching the title',
    schema: {
      properties: {
        items: { type: 'array', items: { $ref: 'Note' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNext: { type: 'boolean' },
        hasPrevious: { type: 'boolean' },
      },
    },
  })
  searchNotesByTitlePaginated(
    @Query('title') title: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): PaginatedResult<Note> {
    return this.notesService.findNotesByTitleWithPagination(title, page, limit);
  }

  @Get('count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get total count of notes' })
  @ApiOkResponse({
    description: 'Total count of notes',
    schema: { properties: { count: { type: 'number' } } },
  })
  getTotalCount(): { count: number } {
    return { count: this.notesService.getTotalCount() };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiParam({ name: 'id', description: 'Note ID', type: Number })
  @ApiOkResponse({
    description: 'The note with the specified ID',
    type: Note,
  })
  @ApiNotFoundResponse({
    description: 'Note not found',
  })
  getNoteById(@Param('id', ParseIntPipe) id: number): Note {
    return this.notesService.findNoteById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'id', description: 'Note ID', type: Number })
  @ApiOkResponse({
    description: 'The updated note',
    type: Note,
  })
  @ApiNotFoundResponse({
    description: 'Note not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Note>,
  ): Note {
    return this.notesService.updateNote(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', description: 'Note ID', type: Number })
  @ApiNotFoundResponse({
    description: 'Note not found',
  })
  deleteNote(@Param('id', ParseIntPipe) id: number): void {
    this.notesService.removeNote(id);
  }
}
