import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Pagination } from '@/core/protocols/pagination'
import type { Note } from '@/domain/notes/entities/note'
import type { NotesRepository } from '@/domain/notes/repositories/notes-repository'

export class InMemoryNotesRepository implements NotesRepository {
  readonly items: Note[] = []

  async fetchByUserId(
    userId: UniqueEntityId,
    { page, limit }: Pagination,
  ): Promise<[Note[], number]> {
    const notes = this.items.filter((n) => n.userId.equals(userId))
    const start = (page - 1) * limit
    const end = start + limit

    return [notes.slice(start, end), notes.length]
  }

  async create(note: Note): Promise<void> {
    this.items.push(note)
  }

  async save(note: Note): Promise<void> {
    const index = this.items.findIndex((n) => n.id.equals(note.id))
    this.items[index] = note
  }
}
