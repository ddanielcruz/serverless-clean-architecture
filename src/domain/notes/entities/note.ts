import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import type { Audio } from './value-objects/audio'

export enum NoteStatus {
  Created = 'created',
  Processing = 'processing',
  Done = 'done',
  Failed = 'failed',
}

export interface NoteProps {
  userId: UniqueEntityId
  audio: Audio
  status: NoteStatus
  summary: string | null
  transcription: string | null
  createdAt: Date
}

type ConstructorProps = Optional<
  NoteProps,
  'status' | 'summary' | 'transcription' | 'createdAt'
>

export class Note extends Entity<NoteProps> {
  get userId(): UniqueEntityId {
    return this._props.userId
  }

  get audio(): Audio {
    return this._props.audio
  }

  get status(): NoteStatus {
    return this._props.status
  }

  get summary(): string | null {
    return this._props.summary
  }

  get transcription(): string | null {
    return this._props.transcription
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  constructor(props: ConstructorProps) {
    super({
      status: NoteStatus.Created,
      summary: null,
      transcription: null,
      createdAt: new Date(),
      ...props,
    })
  }

  markAsProcessing(): void {
    this._props.status = NoteStatus.Processing
  }

  markAsDone(summary: string, transcription: string): void {
    this._props.status = NoteStatus.Done
    this._props.summary = summary
    this._props.transcription = transcription
  }

  markAsFailed(): void {
    this._props.status = NoteStatus.Failed
  }
}
