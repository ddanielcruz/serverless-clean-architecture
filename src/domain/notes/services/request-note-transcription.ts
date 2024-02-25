import { left, type Either, right } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { Audio } from '../entities/audio'
import type { Transcriber } from '../protocols/transcriber'
import type { NotesRepository } from '../repositories/notes-repository'

export type RequestNoteTranscriptionRequest = { audioId: UniqueEntityId }

export type RequestNoteTranscriptionResponse = Either<
  ResourceNotFoundError,
  { transcriptionId: string }
>

// Responsible for identifying the note to be transcribed after the audio was
// successfully uploaded, and then request the transcriber service to transcribe it.
export class RequestNoteTranscription {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly transcriber: Transcriber,
  ) {}

  async execute(
    request: RequestNoteTranscriptionRequest,
  ): Promise<RequestNoteTranscriptionResponse> {
    const note = await this.notesRepository.getByAudioId(request.audioId)
    if (!note) {
      return left(new ResourceNotFoundError())
    }

    note.markAsUploaded()
    await this.notesRepository.save(note)

    const audio = note.audio as Audio
    const { transcriptionId } =
      await this.transcriber.requestTranscription(audio)

    return right({ transcriptionId })
  }
}
