import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NoteRepository } from './note.repository';
import { NotesService } from './notes.service';

@Module({
  controllers: [NotesController],
  providers: [
    // Provide the concrete implementation for the interface
    {
      provide: 'NoteRepository',
      useClass: NoteRepository,
    },
    NotesService,
  ],
})
export class NotesModule {}
