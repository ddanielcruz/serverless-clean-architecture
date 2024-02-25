import { left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeNote } from '@/test/factories/note-factory'
import { InMemoryNotesRepository } from '@/test/repositories/in-memory-notes-repository'

import type { PersistNoteTranscriptionRequest } from './persist-note-transcription'
import { PersistNoteTranscription } from './persist-note-transcription'
import { NoteStatus, type Note } from '../entities/note'
import {
  FailedToSummarizeNoteError,
  type SummarizeNoteResponse,
  type Summarizer,
} from '../protocols/summarizer'
import type { Transcriber } from '../protocols/transcriber'

class TranscriberStub implements Transcriber {
  async requestTranscription(): Promise<{ transcriptionId: string }> {
    return { transcriptionId: '' }
  }

  async loadTranscription(): Promise<string> {
    return 'any-transcription'
  }
}

class SummarizerStub implements Summarizer {
  async summarizeNote(): Promise<SummarizeNoteResponse> {
    return right({ summary: 'any-summary' })
  }
}

describe('PersistNoteTranscription', () => {
  let sut: PersistNoteTranscription
  let notesRepository: InMemoryNotesRepository
  let transcriber: Transcriber
  let summarizer: Summarizer
  let note: Note
  let request: PersistNoteTranscriptionRequest

  beforeEach(() => {
    notesRepository = new InMemoryNotesRepository()
    transcriber = new TranscriberStub()
    summarizer = new SummarizerStub()
    sut = new PersistNoteTranscription(notesRepository, transcriber, summarizer)
    note = makeNote()
    notesRepository.items.push(note)
    request = {
      audioId: note.audio.id,
      transcriptionId: 'any-transcription-id',
    }
  })

  it('gets note by audio ID using NotesRepository', async () => {
    const getByAudioIdSpy = vi.spyOn(notesRepository, 'getByAudioId')
    await sut.execute(request)
    expect(getByAudioIdSpy).toHaveBeenCalledWith(note.audio.id)
  })

  it('returns a ResourceNotFoundError if note is not found', async () => {
    const response = await sut.execute({
      ...request,
      audioId: new UniqueEntityId(),
    })
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('loads transcription by transcription ID', async () => {
    const loadTranscriptionSpy = vi.spyOn(transcriber, 'loadTranscription')
    await sut.execute(request)
    expect(loadTranscriptionSpy).toHaveBeenCalledWith(request.transcriptionId)
  })

  it('marks note as transcribed with note transcription', async () => {
    const saveSpy = vi.spyOn(notesRepository, 'save')
    await sut.execute(request)
    expect(note.audio.transcription).toBe('any-transcription')
    note.markAsTranscribed('any-transcription')
    expect(saveSpy).toHaveBeenCalledWith(note)
  })

  it('requests note summary', async () => {
    const summarizeNoteSpy = vi.spyOn(summarizer, 'summarizeNote')
    await sut.execute(request)
    expect(summarizeNoteSpy).toHaveBeenCalledWith(note)
  })

  it('returns summary error on failure', async () => {
    vi.spyOn(summarizer, 'summarizeNote').mockResolvedValueOnce(
      left(new FailedToSummarizeNoteError()),
    )
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FailedToSummarizeNoteError)
  })

  it('marks note as summarized with note summary on success', async () => {
    const saveSpy = vi.spyOn(notesRepository, 'save')
    await sut.execute(request)
    expect(note.status).toBe(NoteStatus.Summarized)
    expect(note.summary).toBe('any-summary')
    expect(saveSpy).toHaveBeenCalledWith(note)
  })
})
