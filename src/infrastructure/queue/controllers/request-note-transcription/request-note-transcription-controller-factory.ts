import { RequestNoteTranscription } from '@/domain/notes/services/request-note-transcription'
import { TranscribeAdapter } from '@/infrastructure/aws/transcribe/transcribe-adapter'
import { DrizzleNotesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-notes-repository'

import { RequestNoteTranscriptionController } from './request-note-transcription-controller'
import type { QueueController } from '../../protocols/queue-controller'

export function makeRequestNoteTranscriptionController(): QueueController {
  const drizzleNotesRepository = new DrizzleNotesRepository()
  const transcribeAdapter = new TranscribeAdapter()
  const requestNoteTranscription = new RequestNoteTranscription(
    drizzleNotesRepository,
    transcribeAdapter,
  )

  return new RequestNoteTranscriptionController(requestNoteTranscription)
}
