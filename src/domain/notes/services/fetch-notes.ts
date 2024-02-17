import type { Either } from '@/core/either'
import { right } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Pagination } from '@/core/protocols/pagination'

import type { Note } from '../entities/note'
import type { NotesRepository } from '../repositories/notes-repository'

export type FetchNotesRequest = {
  userId: UniqueEntityId
  pagination: Pagination
}

export type FetchNotesResponse = Either<
  never,
  {
    notes: Note[]
    total: number
  }
>

export class FetchNotes {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(request: FetchNotesRequest): Promise<FetchNotesResponse> {
    const [notes, total] = await this.notesRepository.fetchByUserId(
      request.userId,
      request.pagination,
    )

    return right({ notes, total })
  }
}
