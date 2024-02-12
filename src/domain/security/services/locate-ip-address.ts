import type { Either } from '@/core/either'
import type { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

export type LocateIpAddressRequest = {
  address: string
}

export type LocateIpAddressResponse = Either<
  ResourceNotFoundError,
  {
    latitude: number
    longitude: number
  }
>

export abstract class LocateIpAddress {
  abstract execute(
    request: LocateIpAddressRequest,
  ): Promise<LocateIpAddressResponse>
}
