import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryNotesRepository } from '@/test/repositories/in-memory-notes-repository'

import type { CreateNoteRequest } from './create-note'
import { CreateNote } from './create-note'
import { NoteStatus } from '../entities/note'
import { AudioFormat } from '../entities/audio'
import type { FileUploader } from '../uploads/file-uploader'

class FileUploaderStub implements FileUploader {
  async generateUploadUrl(filename: string): Promise<string> {
    return `https://storage.example.com/${filename}`
  }
}

describe('CreateNote', () => {
  let sut: CreateNote
  let notesRepository: InMemoryNotesRepository
  let fileUploader: FileUploader
  const request: CreateNoteRequest = {
    userId: new UniqueEntityId(),
    audioFormat: AudioFormat.MP3,
  }

  beforeEach(() => {
    notesRepository = new InMemoryNotesRepository()
    fileUploader = new FileUploaderStub()
    sut = new CreateNote(notesRepository, fileUploader)
  })

  it('generates an upload URL with correct file format', async () => {
    const generateUploadUrlSpy = vi.spyOn(fileUploader, 'generateUploadUrl')
    await sut.execute(request)
    expect(generateUploadUrlSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\.mp3$/),
    )
  })

  it('creates a new note', async () => {
    const createSpy = vi.spyOn(notesRepository, 'create')
    await sut.execute(request)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: request.userId,
        audio: expect.objectContaining({
          filename: expect.stringMatching(/\.mp3$/),
          format: AudioFormat.MP3,
          duration: null,
        }),
        status: NoteStatus.Created,
        createdAt: expect.any(Date),
      }),
    )
  })

  it('returns the upload URL on success', async () => {
    vi.spyOn(fileUploader, 'generateUploadUrl').mockResolvedValue(
      'any-upload-url',
    )
    const response = await sut.execute(request)
    expect(response.isRight()).toBe(true)
    expect(response.value.uploadUrl).toEqual('any-upload-url')
  })
})
