import type { Note } from '../entities/note'

export interface NotesRepository {
  create(note: Note): Promise<void>
  save(note: Note): Promise<void>
}
