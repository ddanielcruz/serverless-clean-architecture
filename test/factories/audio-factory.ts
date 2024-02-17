import { randomUUID } from 'node:crypto'

import type { AudioProps } from '@/domain/notes/entities/value-objects/audio'
import { Audio, AudioFormat } from '@/domain/notes/entities/value-objects/audio'

export function makeAudio(override?: Partial<AudioProps>): Audio {
  const format = override?.format ?? AudioFormat.MP3
  const filename = override?.filename ?? `${randomUUID()}.${format}`

  return new Audio({
    filename,
    format,
    ...override,
  })
}
