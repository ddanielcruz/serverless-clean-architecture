import type { Note } from '@/domain/notes/entities/note'
import type { NotesRepository } from '@/domain/notes/repositories/notes-repository'

export class InMemoryNotesRepository implements NotesRepository {
  readonly items: Note[] = []

  async create(note: Note): Promise<void> {
    this.items.push(note)
  }

  async save(note: Note): Promise<void> {
    const index = this.items.findIndex((n) => n.id.equals(note.id))
    this.items[index] = note
  }
}
