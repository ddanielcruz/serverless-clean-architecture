import { Entity } from '@/core/entities/entity'

export interface IpAddressProps {
  address: string
  latitude: number
  longitude: number
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
}
