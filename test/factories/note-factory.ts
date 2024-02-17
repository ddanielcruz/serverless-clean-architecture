import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { NoteProps } from '@/domain/notes/entities/note'
import { Note } from '@/domain/notes/entities/note'

import { makeAudio } from './audio-factory'

export function makeNote(
  override?: Partial<NoteProps & { id: UniqueEntityId }>,
): Note {
  return new Note({
    userId: new UniqueEntityId(),
    audio: makeAudio(),
    ...override,
  })
}
