import { RequestNoteTranscription } from '@/domain/notes/services/request-note-transcription'
import { LambdaLoggerAdapter } from '@/infrastructure/aws/lambda/adapters/lambda-logger-adapter'
import { TranscribeAdapter } from '@/infrastructure/aws/transcribe/transcribe-adapter'
import { DrizzleNotesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-notes-repository'

import { RequestNoteTranscriptionController } from './request-note-transcription-controller'
import type { QueueController } from '../../protocols/queue-controller'

export function makeRequestNoteTranscriptionController(): QueueController {
  const logger = new LambdaLoggerAdapter()
  const drizzleNotesRepository = new DrizzleNotesRepository()
  const transcribeAdapter = new TranscribeAdapter()
  const requestNoteTranscription = new RequestNoteTranscription(
    drizzleNotesRepository,
    transcribeAdapter,
  )

  return new RequestNoteTranscriptionController(
    logger,
    requestNoteTranscription,
  )
}
