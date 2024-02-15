import { left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeSession } from '@/test/factories/session-factory'
import { InMemorySessionsRepository } from '@/test/repositories/in-memory-sessions-repository'

import type { CreateSession } from './create-session'
import { RefreshTokenInvalidError } from './errors/refresh-token-invalid-error'
import { UnidentifiedSessionError } from './errors/unidentified-session-error'
import type { RefreshSessionRequest } from './refresh-session'
import { RefreshSession } from './refresh-session'
import type { VerifyToken } from '../cryptography/verify-token'
import { Session } from '../entities/session'
import { TokenSecret } from '../protocols/token'

describe('RefreshSession', () => {
  let verifyToken: VerifyToken
  let createSession: CreateSession
  let sessionsRepository: InMemorySessionsRepository
  let sut: RefreshSession

  const session = makeSession()
  const request: RefreshSessionRequest = {
    refreshToken: 'any-refresh-token',
    ipAddress: 'any-ip-address',
    userAgent: 'any-user-agent',
  }

  beforeEach(() => {
    verifyToken = {
      verify: vi
        .fn()
        .mockResolvedValue({ session: session.id.value, sub: 'user-id' }),
    }
    createSession = {
      execute: vi.fn().mockResolvedValue(right({ session: makeSession() })),
    } as unknown as CreateSession
    sessionsRepository = new InMemorySessionsRepository()
    sut = new RefreshSession(verifyToken, createSession, sessionsRepository)
    sessionsRepository.items.push(session)
  })

  it('verifies token is valid', async () => {
    const verifySpy = vi.spyOn(verifyToken, 'verify')
    await sut.execute(request)
    expect(verifySpy).toHaveBeenCalledWith({
      token: request.refreshToken,
      secret: TokenSecret.RefreshToken,
    })
  })

  it('returns a RefreshTokenInvalidError if token is not valid', async () => {
    vi.spyOn(verifyToken, 'verify').mockResolvedValue(null)
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(RefreshTokenInvalidError)
  })

  it('invalidates active session', async () => {
    const invalidateSpy = vi.spyOn(sessionsRepository, 'invalidate')
    await sut.execute(request)
    expect(invalidateSpy).toHaveBeenCalledWith(
      new UniqueEntityId(session.id.value),
    )
  })

  it('returns a ResourceNotFoundError if fails to invalidate the session', async () => {
    vi.spyOn(sessionsRepository, 'invalidate').mockResolvedValue(false)
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns an UnidentifiedSessionError if fails to create a new session', async () => {
    vi.spyOn(createSession, 'execute').mockResolvedValue(
      left(new ResourceNotFoundError()),
    )
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UnidentifiedSessionError)
  })

  it('creates a new session on success', async () => {
    const executeSpy = vi.spyOn(createSession, 'execute')
    const response = await sut.execute(request)
    assert(response.isRight())
    expect(response.value.session).toBeDefined()
    expect(response.value.session).toBeInstanceOf(Session)
    expect(executeSpy).toHaveBeenCalledWith({
      userId: new UniqueEntityId('user-id'),
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    })
  })

  it.todo('throws if new IP address is too far from the original one')
})
