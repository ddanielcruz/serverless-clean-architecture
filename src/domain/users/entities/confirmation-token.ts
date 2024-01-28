import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export enum ConfirmationTokenType {
  Authentication = 'authentication',
  EmailVerification = 'email-verification',
}

export interface ConfirmationTokenProps {
  userId: UniqueEntityId
  token: string
  type: ConfirmationTokenType
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

export class ConfirmationToken extends Entity<ConfirmationTokenProps> {
  get userId(): UniqueEntityId {
    return this._props.userId
  }

  get token(): string {
    return this._props.token
  }

  get type(): ConfirmationTokenType {
    return this._props.type
  }

  get expiresAt(): Date {
    return this._props.expiresAt
  }

  get usedAt(): Date | null {
    return this._props.usedAt
  }

  get isUsed(): boolean {
    return this._props.usedAt !== null
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  get url(): string {
    // TODO Get base URL from env
    return `https://example.com/${this.token}`
  }

  constructor(
    props: Optional<ConfirmationTokenProps, 'usedAt' | 'createdAt'>,
    id?: UniqueEntityId | string,
  ) {
    super(
      {
        usedAt: null,
        createdAt: new Date(),
        ...props,
      },
      id,
    )
  }
}
