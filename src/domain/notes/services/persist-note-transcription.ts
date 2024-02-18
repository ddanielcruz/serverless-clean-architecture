import type { Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type PersistNoteTranscriptionRequest = {
  noteId: UniqueEntityId
  transcription: string
}

export type PersistNoteTranscriptionResponse = Either<unknown, unknown>

// Responsible for persisting the transcription of a note after it was successfully
// transcribed by the transcriber service.
export abstract class PersistNoteTranscription {
  abstract execute(
    request: PersistNoteTranscriptionRequest,
  ): Promise<PersistNoteTranscriptionResponse>
}
