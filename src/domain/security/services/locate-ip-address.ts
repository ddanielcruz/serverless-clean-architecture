import { left, type Either, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { HttpClient } from '@/core/protocols/http-client'

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

export interface IpApiResponse {
  lat: number
  lon: number
}

export class LocateIpAddress {
  constructor(private readonly httpClient: HttpClient) {}

  async execute({
    address,
  }: LocateIpAddressRequest): Promise<LocateIpAddressResponse> {
    if (this.isLocalhost(address)) {
      return right({ latitude: 0, longitude: 0 })
    }

    const url = this.composeRequestUrl(address)
    const response = await this.httpClient.get<IpApiResponse>({ url })

    if (response.statusCode === 200) {
      const { lat, lon } = response.body
      return right({ latitude: lat, longitude: lon })
    }

    return left(new ResourceNotFoundError())
  }

  private isLocalhost(address: string): boolean {
    return ['127.0.0.1', '::1', 'localhost'].includes(address)
  }

  private composeRequestUrl(address: string): string {
    return `http://ip-api.com/json/${address}`
  }
}
