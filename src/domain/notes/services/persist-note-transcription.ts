import { left, type Either, right } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type {
  FailedToSummarizeNoteError,
  Summarizer,
} from '../protocols/summarizer'
import type { Transcriber } from '../protocols/transcriber'
import type { NotesRepository } from '../repositories/notes-repository'

export type PersistNoteTranscriptionRequest = {
  audioId: UniqueEntityId
  transcriptionId: string
}

export type PersistNoteTranscriptionResponse = Either<
  ResourceNotFoundError | FailedToSummarizeNoteError,
  null
>

// Responsible for persisting the transcription of a note after it was successfully
// transcribed by the transcriber service.
export class PersistNoteTranscription {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly transcriber: Transcriber,
    private readonly summarizer: Summarizer,
  ) {}

  async execute({
    audioId,
    transcriptionId,
  }: PersistNoteTranscriptionRequest): Promise<PersistNoteTranscriptionResponse> {
    const note = await this.notesRepository.getByAudioId(audioId)
    if (!note) {
      return left(new ResourceNotFoundError())
    }

    const transcription =
      await this.transcriber.loadTranscription(transcriptionId)
    note.markAsTranscribed(transcription)
    await this.notesRepository.save(note)

    const summaryResponse = await this.summarizer.summarizeNote(note)
    if (summaryResponse.isLeft()) {
      return left(summaryResponse.value)
    }

    note.markAsSummarized(summaryResponse.value.summary)
    await this.notesRepository.save(note)

    return right(null)
  }
}
