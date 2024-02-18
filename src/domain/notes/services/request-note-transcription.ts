import type { Either } from '@/core/either'

export type RequestNoteTranscriptionRequest = { filename: string }

export type RequestNoteTranscriptionResponse = Either<unknown, unknown>

// Responsible for identifying the note to be transcribed after the audio was
// successfully uploaded, and then request the transcriber service to transcribe it.
export abstract class RequestNoteTranscription {
  abstract execute(
    request: RequestNoteTranscriptionRequest,
  ): Promise<RequestNoteTranscriptionResponse>
}
