import { right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryIpAddressesRepository } from '@/test/repositories/in-memory-ip-addresses-repository'
import { InMemorySessionsRepository } from '@/test/repositories/in-memory-sessions-repository'

import type { CreateSessionRequest } from './create-session'
import { CreateSession } from './create-session'
import type { LocateIpAddress } from './locate-ip-address'
import type { SignToken, SignTokenParams } from '../cryptography/sign-token'
import { Token } from '../entities/value-objects/token'
import { TokenSecret } from '../protocols/token'

const geolocation = {
  latitude: 1000,
  longitude: 1000,
}

describe('CreateSession', () => {
  let sut: CreateSession
  let signToken: SignToken
  let ipAddressesRepo: InMemoryIpAddressesRepository
  let sessionsRepo: InMemorySessionsRepository
  let locateIpAddress: LocateIpAddress

  const request: CreateSessionRequest = {
    userId: new UniqueEntityId(),
    ipAddress: 'any-ip-address',
    userAgent: 'any-user-agent',
  }

  beforeEach(() => {
    signToken = {
      sign: vi.fn().mockImplementation((params: SignTokenParams) => {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)

        return new Token({ value: `any-${params.secret}`, expiresAt })
      }),
    }
    ipAddressesRepo = new InMemoryIpAddressesRepository()
    sessionsRepo = new InMemorySessionsRepository()
    locateIpAddress = {
      execute: vi.fn().mockImplementation(async () => right(geolocation)),
    } as unknown as LocateIpAddress
    sut = new CreateSession(
      signToken,
      sessionsRepo,
      ipAddressesRepo,
      locateIpAddress,
    )
  })

  it('creates a new access token and refresh token pair', async () => {
    const signSpy = vi.spyOn(signToken, 'sign')
    const response = await sut.execute(request)
    const { userId } = request

    expect(response.isRight()).toEqual(true)
    expect(response.value).toMatchObject({
      session: {
        userId,
        userAgent: request.userAgent,
        ipAddress: {
          address: request.ipAddress,
          ...geolocation,
        },
        accessToken: {
          value: `any-${TokenSecret.AccessToken}`,
          expiresAt: expect.any(Date),
        },
        refreshToken: {
          value: `any-${TokenSecret.RefreshToken}`,
          expiresAt: expect.any(Date),
        },
        createdAt: expect.any(Date),
      },
    })
    expect(signSpy).toHaveBeenCalledWith({
      payload: { sub: userId.toString() },
      secret: TokenSecret.AccessToken,
    })
    expect(signSpy).toHaveBeenCalledWith({
      payload: { sub: userId.toString() },
      secret: TokenSecret.RefreshToken,
    })
  })
})
