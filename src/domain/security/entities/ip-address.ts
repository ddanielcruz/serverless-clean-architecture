import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface IpAddressProps {
  address: string
  latitude: number
  longitude: number
  createdAt: Date
}

export class IpAddress extends Entity<IpAddressProps> {
  get address(): string {
    return this._props.address
  }

  get latitude(): number {
    return this._props.latitude
  }

  get longitude(): number {
    return this._props.longitude
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  constructor(
    props: Optional<IpAddressProps, 'createdAt'>,
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
