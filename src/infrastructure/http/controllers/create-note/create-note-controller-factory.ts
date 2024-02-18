import { CreateNote } from '@/domain/notes/services/create-note'
import { S3Adapter } from '@/infrastructure/aws/s3/s3-adapter'
import { DrizzleNotesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-notes-repository'

import { CreateNoteController } from './create-note-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'

export function makeCreateNoteController() {
  const drizzleNotesRepository = new DrizzleNotesRepository()
  const s3Adapter = new S3Adapter()
  const createNote = new CreateNote(drizzleNotesRepository, s3Adapter)
  const controller = new CreateNoteController(createNote)

  return applyMiddleware(controller)
}
