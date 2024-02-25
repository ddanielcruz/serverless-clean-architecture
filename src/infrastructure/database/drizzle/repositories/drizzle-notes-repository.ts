import { count, eq } from 'drizzle-orm'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Pagination } from '@/core/protocols/pagination'
import type { Note } from '@/domain/notes/entities/note'
import type { NotesRepository } from '@/domain/notes/repositories/notes-repository'

import { Database } from '../database'
import { DrizzleNoteMapper } from '../mappers/drizzle-note-mapper'
import * as s from '../schema'

export class DrizzleNotesRepository implements NotesRepository {
  private readonly db = Database.instance

  async create(note: Note): Promise<void> {
    await this.db.transaction(async (trx) => {
      const { audio: audioData, ...noteData } =
        DrizzleNoteMapper.toDrizzle(note)

      await trx.insert(s.audios).values(audioData)
      await trx.insert(s.notes).values(noteData)
    })
  }

  async fetchByUserId(
    userId: UniqueEntityId,
    { page, limit }: Pagination,
  ): Promise<[Note[], number]> {
    const [{ value: total }] = await this.db
      .select({ value: count(s.notes.id) })
      .from(s.notes)
      .where(eq(s.notes.userId, userId.toString()))

    const offset = (page - 1) * limit
    const output = await this.db
      .select()
      .from(s.notes)
      .where(eq(s.notes.userId, userId.toString()))
      .limit(limit)
      .innerJoin(s.audios, eq(s.audios.id, s.notes.audioId))
      .offset(offset)
    const notes = output.map((row) => {
      return DrizzleNoteMapper.toDomain(row.notes, row.audios)
    })

    return [notes, total]
  }

  async getByAudioId(audioId: UniqueEntityId): Promise<Note | null> {
    const output = await this.db
      .select()
      .from(s.notes)
      .where(eq(s.notes.audioId, audioId.toString()))
      .innerJoin(s.audios, eq(s.audios.id, s.notes.audioId))
      .limit(1)
    const note = output[0]

    return note ? DrizzleNoteMapper.toDomain(note.notes, note.audios) : null
  }

  async save(note: Note): Promise<void> {
    await this.db.transaction(async (trx) => {
      const { audio: audioData, ...noteData } =
        DrizzleNoteMapper.toDrizzle(note)

      await trx
        .update(s.audios)
        .set(audioData)
        .where(eq(s.audios.id, note.audio.id.toString()))
      await trx
        .update(s.notes)
        .set(noteData)
        .where(eq(s.notes.id, note.id.toString()))
    })
  }
}
