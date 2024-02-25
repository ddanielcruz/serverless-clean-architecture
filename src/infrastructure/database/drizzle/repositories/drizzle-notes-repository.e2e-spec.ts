import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NoteStatus } from '@/domain/notes/entities/note'
import { postgresContainer } from '@/test/containers/postgres-container'
import { makeNote } from '@/test/factories/note-factory'
import { makeUser } from '@/test/factories/user-factory'

import { DrizzleNotesRepository } from './drizzle-notes-repository'
import { Database } from '../database'
import { DrizzleAudioMapper } from '../mappers/drizzle-audio-mapper'
import { DrizzleNoteMapper } from '../mappers/drizzle-note-mapper'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper'
import * as s from '../schema'

describe('DrizzleNotesRepository', () => {
  let db: typeof Database.instance
  let sut: DrizzleNotesRepository
  const user = makeUser()

  beforeAll(async () => {
    await postgresContainer.start()
    db = Database.instance
    sut = new DrizzleNotesRepository()
    await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(user))
  })

  beforeEach(async () => {
    await db.delete(s.notes)
    await db.delete(s.audios)
  })

  afterAll(async () => {
    await Database.disconnect()
    await postgresContainer.stop()
  })

  describe('create', () => {
    it('creates a new note and audio', async () => {
      const note = makeNote({ userId: user.id })
      await sut.create(note)

      const notes = await db.select().from(s.notes)
      const audios = await db.select().from(s.audios)
      expect(notes).toHaveLength(1)
      expect(audios).toHaveLength(1)
      expect(DrizzleNoteMapper.toDrizzle(note)).toMatchObject(notes[0])
      expect(DrizzleAudioMapper.toDrizzle(note.audio)).toMatchObject(audios[0])
    })
  })

  describe('save', () => {
    it('updates note and audio', async () => {
      const note = makeNote({ userId: user.id })
      await sut.create(note)
      note.markAsTranscribed('any-transcription')
      await sut.save(note)

      const notes = await db.select().from(s.notes)
      const audios = await db.select().from(s.audios)
      expect(notes).toHaveLength(1)
      expect(audios).toHaveLength(1)
      expect(DrizzleNoteMapper.toDrizzle(note)).toMatchObject(notes[0])
      expect(DrizzleAudioMapper.toDrizzle(note.audio)).toMatchObject(audios[0])
      expect(notes[0].status).toEqual(NoteStatus.Transcribed)
      expect(audios[0].transcription).toEqual('any-transcription')
    })
  })

  describe('fetchByUserId', () => {
    it('fetches user notes', async () => {
      const notes = new Array(10)
        .fill(null)
        .map(() => makeNote({ userId: user.id }))
      await Promise.all(notes.map((note) => sut.create(note)))

      const [fetchedNotes, total] = await sut.fetchByUserId(user.id, {
        page: 1,
        limit: 10,
      })
      expect(fetchedNotes).toHaveLength(10)
      expect(total).toEqual(10)
    })

    it('fetches user notes with pagination', async () => {
      const notes = new Array(10)
        .fill(null)
        .map(() => makeNote({ userId: user.id }))
      await Promise.all(notes.map((note) => sut.create(note)))

      const [fetchedNotes, total] = await sut.fetchByUserId(user.id, {
        page: 1,
        limit: 5,
      })
      expect(fetchedNotes).toHaveLength(5)
      expect(total).toEqual(10)
    })
  })

  describe('getByAudioId', () => {
    it('returns null if note is not found', async () => {
      const note = await sut.getByAudioId(new UniqueEntityId())
      expect(note).toBeNull()
    })

    it('returns note with audio if found', async () => {
      const note = makeNote({ userId: user.id })
      await sut.create(note)
      const foundNote = await sut.getByAudioId(note.audio.id)
      expect(foundNote).toBeTruthy()
      expect(foundNote).toMatchObject(note)
    })
  })
})
