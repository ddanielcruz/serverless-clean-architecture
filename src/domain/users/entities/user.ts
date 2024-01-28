import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface UserProps {
  name: string
  email: string
  emailVerifiedAt: Date | null
  createdAt: Date
}

export class User extends Entity<UserProps> {
  get name(): string {
    return this._props.name
  }

  get email(): string {
    return this._props.email
  }

  get emailVerifiedAt(): Date | null {
    return this._props.emailVerifiedAt
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  get isEmailVerified(): boolean {
    return !!this._props.emailVerifiedAt
  }

  constructor(
    props: Optional<UserProps, 'emailVerifiedAt' | 'createdAt'>,
    id?: UniqueEntityId | string,
  ) {
    super(
      {
        emailVerifiedAt: null,
        createdAt: new Date(),
        ...props,
      },
      id,
    )
  }
}
