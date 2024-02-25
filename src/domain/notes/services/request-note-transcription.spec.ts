import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeNote } from '@/test/factories/note-factory'
import { InMemoryNotesRepository } from '@/test/repositories/in-memory-notes-repository'

import { RequestNoteTranscription } from './request-note-transcription'
import type { Note } from '../entities/note'
import { NoteStatus } from '../entities/note'
import type { Transcriber } from '../protocols/transcriber'

class TranscriberStub implements Transcriber {
  async requestTranscription(): Promise<{ transcriptionId: string }> {
    return {
      transcriptionId: 'any-transcription-id',
    }
  }

  async loadTranscription(): Promise<string> {
    return 'any-transcription'
  }
}

describe('RequestNoteTranscription', () => {
  let sut: RequestNoteTranscription
  let notesRepository: InMemoryNotesRepository
  let transcriber: TranscriberStub
  let note: Note

  beforeEach(() => {
    notesRepository = new InMemoryNotesRepository()
    transcriber = new TranscriberStub()
    sut = new RequestNoteTranscription(notesRepository, transcriber)
    note = makeNote()
    notesRepository.items.push(note)
  })

  it('gets note by audio ID using NotesRepository', async () => {
    const getByAudioIdSpy = vi.spyOn(notesRepository, 'getByAudioId')
    await sut.execute({ audioId: note.audio.id })

    expect(getByAudioIdSpy).toHaveBeenCalledWith(note.audio.id)
  })

  it('returns a ResourceNotFoundError if note is not found', async () => {
    const response = await sut.execute({ audioId: new UniqueEntityId() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('marks note as uploaded', async () => {
    const saveSpy = vi.spyOn(notesRepository, 'save')
    await sut.execute({ audioId: note.audio.id })
    expect(note.status).toEqual(NoteStatus.Uploaded)
    expect(saveSpy).toHaveBeenCalledWith(note)
  })

  it('requests a transcription using Transcriber', async () => {
    const requestTranscriptionSpy = vi.spyOn(
      transcriber,
      'requestTranscription',
    )
    await sut.execute({ audioId: note.audio.id })

    expect(requestTranscriptionSpy).toHaveBeenCalledWith(note.audio)
  })

  it('returns transcription ID on success', async () => {
    const response = await sut.execute({ audioId: note.audio.id })

    assert(response.isRight())
    expect(response.value.transcriptionId).toBe('any-transcription-id')
  })
})
