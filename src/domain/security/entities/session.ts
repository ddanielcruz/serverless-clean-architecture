import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import type { IpAddress } from './ip-address'
import type { Token } from './value-objects/token'

export interface SessionProps {
  userId: UniqueEntityId
  accessToken: Token
  refreshToken: Token
  userAgent: string
  ipAddress: IpAddress
  createdAt: Date
}

export class Session extends Entity<SessionProps> {
  get userId(): UniqueEntityId {
    return this._props.userId
  }

  get accessToken(): Token {
    return this._props.accessToken
  }

  get refreshToken(): Token {
    return this._props.refreshToken
  }

  get userAgent(): string {
    return this._props.userAgent
  }

  get ipAddress(): IpAddress {
    return this._props.ipAddress
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  constructor(
    props: Optional<SessionProps, 'createdAt'>,
    id?: UniqueEntityId | string,
  ) {
    super(
      {
        createdAt: new Date(),
        ...props,
      },
      id,
    )
  }
}
