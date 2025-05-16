import { Repository } from './repository.interface';
import { Note } from '../note.entity';

/**
 * Interface for Note repository operations...
 * Extends the generic Repository interface and can add Note-specific methods
 */
export interface NoteRepository extends Repository<Note> {
  /**
   * Find notes by title (case-insensitive partial match)
   * @param title The title to search for
   * @returns Array of notes matching the title
   */
  findByTitle(title: string): Note[];
}
