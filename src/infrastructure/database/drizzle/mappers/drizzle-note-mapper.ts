import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Note } from '@/domain/notes/entities/note'

import { DrizzleAudioMapper } from './drizzle-audio-mapper'
import type * as s from '../schema'

type DrizzleNote = typeof s.notes.$inferSelect
type DrizzleAudio = typeof s.audios.$inferSelect

export class DrizzleNoteMapper {
  static toDomain(note: DrizzleNote, audio: DrizzleAudio): Note {
    return new Note(
      {
        userId: new UniqueEntityId(note.userId),
        audio: DrizzleAudioMapper.toDomain(audio),
        status: note.status,
        summary: note.summary,
        createdAt: note.createdAt,
      },
      note.id,
    )
  }

  static toDrizzle(note: Note): DrizzleNote & { audio: DrizzleAudio } {
    return {
      id: note.id.toString(),
      userId: note.userId.toString(),
      audioId: note.audio.id.toString(),
      status: note.status,
      summary: note.summary,
      createdAt: note.createdAt,
      audio: DrizzleAudioMapper.toDrizzle(note.audio),
    }
  }
}
