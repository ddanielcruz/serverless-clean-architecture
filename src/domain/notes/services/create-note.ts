import { randomUUID } from 'node:crypto'

import { right, type Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { Audio, type AudioFormat } from '../entities/audio'
import { Note } from '../entities/note'
import type { FileUploader } from '../protocols/file-uploader'
import type { NotesRepository } from '../repositories/notes-repository'

export type CreateNoteRequest = {
  userId: UniqueEntityId
  audioFormat: AudioFormat
}

export type CreateNoteResponse = Either<never, { uploadUrl: string }>

export class CreateNote {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly fileUploader: FileUploader,
  ) {}

  async execute(request: CreateNoteRequest): Promise<CreateNoteResponse> {
    // Generate an upload URL to the file storage
    const filename = `${randomUUID()}.${request.audioFormat}`
    const uploadUrl = await this.fileUploader.generateUploadUrl(filename)

    // Create a new note to be processed
    const audio = new Audio({ filename, format: request.audioFormat })
    const note = new Note({ userId: request.userId, audio })
    await this.notesRepository.create(note)

    return right({ uploadUrl })
  }
}
