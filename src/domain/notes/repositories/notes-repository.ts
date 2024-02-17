import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Pagination } from '@/core/protocols/pagination'

import type { Note } from '../entities/note'

export interface NotesRepository {
  create(note: Note): Promise<void>
  fetchByUserId(
    userId: UniqueEntityId,
    pagination: Pagination,
  ): Promise<[Note[], number]>
  save(note: Note): Promise<void>
}
