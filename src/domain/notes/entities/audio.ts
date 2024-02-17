import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
}

// TODO Add information about the file size and implement a file size limit
export interface AudioProps {
  format: AudioFormat
  filename: string
  duration: number | null
  transcription: string | null
}

type ConstructorProps = Optional<AudioProps, 'duration' | 'transcription'>

export class Audio extends Entity<AudioProps> {
  get format(): AudioFormat {
    return this._props.format
  }

  get filename(): string {
    return this._props.filename
  }

  get duration(): number | null {
    return this._props.duration
  }

  set duration(duration: number) {
    this._props.duration = duration
  }

  get transcription(): string | null {
    return this._props.transcription
  }

  set transcription(transcription: string) {
    this._props.transcription = transcription
  }

  constructor(props: ConstructorProps, id?: UniqueEntityId | string) {
    super(
      {
        duration: null,
        transcription: null,
        ...props,
      },
      id,
    )
    this.validateFilenameFormat(props)
  }

  private validateFilenameFormat({ filename, format }: ConstructorProps): void {
    if (!filename.endsWith(format)) {
      throw new Error(`Invalid filename format: ${filename}`)
    }
  }
}
