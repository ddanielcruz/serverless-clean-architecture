import { Audio } from '@/domain/notes/entities/audio'

import type * as s from '../schema'

type DrizzleAudio = typeof s.audios.$inferSelect

export class DrizzleAudioMapper {
  static toDomain(raw: DrizzleAudio): Audio {
    return new Audio(
      {
        format: raw.format,
        filename: raw.filename,
        duration: raw.duration,
        transcription: raw.transcription,
      },
      raw.id,
    )
  }

  static toDrizzle(audio: Audio | Readonly<Audio>): DrizzleAudio {
    return {
      id: audio.id.toString(),
      format: audio.format,
      filename: audio.filename,
      duration: audio.duration,
      transcription: audio.transcription,
    }
  }
}
