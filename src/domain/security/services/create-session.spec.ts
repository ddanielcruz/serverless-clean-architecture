import { left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryIpAddressesRepository } from '@/test/repositories/in-memory-ip-addresses-repository'
import { InMemorySessionsRepository } from '@/test/repositories/in-memory-sessions-repository'

import type { CreateSessionRequest } from './create-session'
import { CreateSession } from './create-session'
import type { LocateIpAddress } from './locate-ip-address'
import type { SignToken, SignTokenParams } from '../cryptography/sign-token'
import { IpAddress } from '../entities/ip-address'
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

  it('fetches ip address by address using IpAddressesRepository', async () => {
    const findByAddressSpy = vi.spyOn(ipAddressesRepo, 'findByAddress')
    await sut.execute(request)
    expect(findByAddressSpy).toHaveBeenCalledWith(request.ipAddress)
  })

  it('creates a new ip address if not found in the repository', async () => {
    const createSpy = vi.spyOn(ipAddressesRepo, 'create')
    await sut.execute(request)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        address: request.ipAddress,
        ...geolocation,
      }),
    )
  })

  it('does not create a new ip address if found in the repository', async () => {
    const ipAddress = new IpAddress({
      address: request.ipAddress,
      ...geolocation,
    })
    await ipAddressesRepo.create(ipAddress)
    const createSpy = vi.spyOn(ipAddressesRepo, 'create')
    await sut.execute(request)
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('returns a ResourceNotFoundError if unable to locate the ip address', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(locateIpAddress, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBe(error)
  })

  it('creates a new access token and refresh token pair', async () => {
    const signSpy = vi.spyOn(signToken, 'sign')
    const response = await sut.execute(request)
    const { userId } = request
    assert(response.isRight())
    expect(signSpy).toHaveBeenCalledWith({
      payload: {
        sub: userId.toString(),
        session: response.value.session.id.toString(),
      },
      secret: TokenSecret.AccessToken,
    })
    expect(signSpy).toHaveBeenCalledWith({
      payload: {
        sub: userId.toString(),
        session: response.value.session.id.toString(),
      },
      secret: TokenSecret.RefreshToken,
    })
  })

  it('returns created session, tokens and resolved ip address', async () => {
    const response = await sut.execute(request)
    assert(response.isRight())
    expect(response.value).toMatchObject({
      session: {
        userId: request.userId,
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
  })
})
