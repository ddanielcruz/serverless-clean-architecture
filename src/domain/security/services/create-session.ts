import { right, type Either, left } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { LocateIpAddress } from './locate-ip-address'
import type { SignToken } from '../cryptography/sign-token'
import { IpAddress } from '../entities/ip-address'
import { Session } from '../entities/session'
import type { TokenPayload } from '../protocols/token'
import { TokenSecret } from '../protocols/token'
import type { IpAddressesRepository } from '../repositories/ip-addresses-repository'
import type { SessionsRepository } from '../repositories/sessions-repository'

export type CreateSessionRequest = {
  userId: UniqueEntityId
  ipAddress: string
  userAgent: string
}

export type CreateSessionResponse = Either<
  ResourceNotFoundError,
  { session: Session }
>

export class CreateSession {
  constructor(
    private readonly signToken: SignToken,
    private readonly sessionsRepository: SessionsRepository,
    private readonly ipAddressesRepository: IpAddressesRepository,
    private readonly locateIpAddress: LocateIpAddress,
  ) {}

  async execute(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    // Identify request IP address
    const ipAddressResponse = await this.identifyIpAddress(request.ipAddress)
    if (ipAddressResponse.isLeft()) {
      return left(ipAddressResponse.value)
    }

    // Sign tokens
    const payload: TokenPayload = { sub: request.userId.toString() }
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken.sign({ payload, secret: TokenSecret.AccessToken }),
      this.signToken.sign({ payload, secret: TokenSecret.RefreshToken }),
    ])

    // Create a new session
    const session = new Session({
      userId: request.userId,
      ipAddress: ipAddressResponse.value,
      userAgent: request.userAgent,
      accessToken,
      refreshToken,
    })

    await this.sessionsRepository.create(session)

    return right({ session })
  }

  private async identifyIpAddress(
    address: string,
  ): Promise<Either<ResourceNotFoundError, IpAddress>> {
    let ipAddress = await this.ipAddressesRepository.findByAddress(address)

    if (!ipAddress) {
      // Get IP address geolocation
      const locateResponse = await this.locateIpAddress.execute({ address })
      if (locateResponse.isLeft()) {
        return left(locateResponse.value)
      }

      const { latitude, longitude } = locateResponse.value
      ipAddress = new IpAddress({ address, latitude, longitude })

      // Save IP address for future requests
      await this.ipAddressesRepository.create(ipAddress)
    }

    return right(ipAddress)
  }
}
