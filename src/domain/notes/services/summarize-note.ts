import type { Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type SummarizeNoteRequest = { noteId: UniqueEntityId }

export type SummarizeNoteResponse = Either<unknown, unknown>

// Responsible for summarizing a note after it was successfully transcribed by the
// transcriber service.
export abstract class SummarizeNote {
  abstract execute(
    request: SummarizeNoteRequest,
  ): Promise<SummarizeNoteResponse>
}
