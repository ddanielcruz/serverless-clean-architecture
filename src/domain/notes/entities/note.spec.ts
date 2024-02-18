import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { Audio, AudioFormat } from './audio'
import { Note, NoteStatus } from './note'

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
    expect(note.audio.transcription).toBeNull()
    expect(note.createdAt).toBeInstanceOf(Date)
  })

  it('marks a note as uploaded', () => {
    const note = new Note({ userId, audio })
    note.markAsUploaded()
    expect(note.status).toBe(NoteStatus.Uploaded)
  })

  it('marks a note as transcribed', () => {
    const note = new Note({ userId, audio })
    note.markAsTranscribed('test')
    expect(note.status).toBe(NoteStatus.Transcribed)
    expect(note.audio.transcription).toBe('test')
  })

  it('marks a note as summarized', () => {
    const note = new Note({ userId, audio })
    note.markAsSummarized('test')
    expect(note.status).toBe(NoteStatus.Summarized)
    expect(note.summary).toBe('test')
  })

  it('marks a note as failed', () => {
    const note = new Note({ userId, audio })
    note.markAsFailed()
    expect(note.status).toBe(NoteStatus.Failed)
  })
})
