import { randomUUID } from 'node:crypto'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AudioProps } from '@/domain/notes/entities/audio'
import { Audio, AudioFormat } from '@/domain/notes/entities/audio'

export function makeAudio(
  override?: Partial<AudioProps & { id: UniqueEntityId }>,
): Audio {
  const format = override?.format ?? AudioFormat.MP3
  const filename = override?.filename ?? `${randomUUID()}.${format}`

  return new Audio(
    {
      filename,
      format,
      ...override,
    },
    override?.id,
  )
}
