import type { Either } from '@/core/either'
import type { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { Note } from '../entities/note'

export class FailedToSummarizeNoteError extends Error {
  constructor() {
    super('Failed to summarize note.')
    this.name = 'FailedToSummarizeNoteError'
  }
}

export type SummarizeNoteResponse = Either<
  ResourceNotFoundError | FailedToSummarizeNoteError,
  { summary: string }
>

// Responsible for summarizing a note after it was successfully transcribed by the
// transcriber service.
export interface Summarizer {
  summarizeNote(note: Note): Promise<SummarizeNoteResponse>
}
