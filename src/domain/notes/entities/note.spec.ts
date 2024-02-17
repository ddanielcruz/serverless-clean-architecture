import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { Note, NoteStatus } from './note'
import { Audio, AudioFormat } from './audio'

describe('Note', () => {
  const userId = new UniqueEntityId()
  const audio = new Audio({
    filename: 'test.mp3',
    format: AudioFormat.MP3,
  })

  it('creates a note', () => {
    const note = new Note({ userId, audio })
    expect(note.userId).toBe(userId)
    expect(note.audio).toBe(audio)
    expect(note.status).toBe(NoteStatus.Created)
    expect(note.summary).toBeNull()
    expect(note.transcription).toBeNull()
    expect(note.createdAt).toBeInstanceOf(Date)
  })

  it('marks a note as processing', () => {
    const note = new Note({ userId, audio })
    note.markAsProcessing()
    expect(note.status).toBe(NoteStatus.Processing)
  })

  it('marks a note as done', () => {
    const note = new Note({ userId, audio })
    note.markAsDone('test summary', 'test transcription')
    expect(note.status).toBe(NoteStatus.Done)
    expect(note.summary).toBe('test summary')
    expect(note.transcription).toBe('test transcription')
  })

  it('marks a note as failed', () => {
    const note = new Note({ userId, audio })
    note.markAsFailed()
    expect(note.status).toBe(NoteStatus.Failed)
  })
})
