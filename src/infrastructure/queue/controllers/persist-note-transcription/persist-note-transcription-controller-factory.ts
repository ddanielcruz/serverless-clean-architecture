import { PersistNoteTranscription } from '@/domain/notes/services/persist-note-transcription'
import { LambdaLoggerAdapter } from '@/infrastructure/aws/lambda/adapters/lambda-logger-adapter'
import { TranscribeAdapter } from '@/infrastructure/aws/transcribe/transcribe-adapter'
import { DrizzleNotesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-notes-repository'
import { GPTAdapter } from '@/infrastructure/openai/gpt-adapter'

import { PersistNoteTranscriptionController } from './persist-note-transcription-controller'
import type { QueueController } from '../../protocols/queue-controller'

export function makePersistNoteTranscriptionController(): QueueController {
  const drizzleNotesRepository = new DrizzleNotesRepository()
  const transcribeAdapter = new TranscribeAdapter()
  const lambdaLoggerAdapter = new LambdaLoggerAdapter()
  const gptAdapter = new GPTAdapter(lambdaLoggerAdapter)
  const persistNoteTranscription = new PersistNoteTranscription(
    drizzleNotesRepository,
    transcribeAdapter,
    gptAdapter,
  )

  return new PersistNoteTranscriptionController(persistNoteTranscription)
}
