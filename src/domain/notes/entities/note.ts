import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import type { Audio } from './audio'

export enum NoteStatus {
  Created = 'created',
  Uploaded = 'uploaded',
  Transcribed = 'transcribed',
  Summarized = 'summarized',
  Failed = 'failed',
}

// TODO Add information to delete unprocessed or long-time failed notes
export interface NoteProps {
  userId: UniqueEntityId
  audio: Audio
  status: NoteStatus
  summary: string | null
  createdAt: Date
}

export class Note extends Entity<NoteProps> {
  get userId(): UniqueEntityId {
    return this._props.userId
  }

  get audio(): Readonly<Audio> {
    return this._props.audio
  }

  get status(): NoteStatus {
    return this._props.status
  }

  get summary(): string | null {
    return this._props.summary
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  constructor(
    props: Optional<NoteProps, 'status' | 'summary' | 'createdAt'>,
    id?: UniqueEntityId | string,
  ) {
    super(
      {
        status: NoteStatus.Created,
        summary: null,
        createdAt: new Date(),
        ...props,
      },
      id,
    )
  }

  markAsUploaded(): void {
    this._props.status = NoteStatus.Uploaded
  }

  markAsTranscribed(transcription: string): void {
    this._props.status = NoteStatus.Transcribed
    this._props.audio.transcription = transcription
  }

  markAsSummarized(summary: string): void {
    this._props.status = NoteStatus.Summarized
    this._props.summary = summary
  }

  markAsFailed(): void {
    this._props.status = NoteStatus.Failed
  }
}
