import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { VerifyUserEmail } from '@/domain/users/services/verify-user-email'
import { makeConfirmationToken } from '@/test/factories/confirmation-token-factory'
import { makeUser } from '@/test/factories/user-factory'
import { InMemoryConfirmationTokensRepository } from '@/test/repositories/in-memory-confirmation-tokens-repository'

import type { ConfirmTokenRequest } from './confirm-token'
import { ConfirmToken } from './confirm-token'
import type { CreateSession } from './create-session'
import { TokenAlreadyUsedError } from './errors/token-already-used-error'
import { TokenExpiredError } from './errors/token-expired-error'
import { UnidentifiedSessionError } from './errors/unidentified-session-error'
import {
  ConfirmationTokenType,
  type ConfirmationToken,
} from '../../users/entities/confirmation-token'
import type { User } from '../../users/entities/user'

describe('ConfirmToken', () => {
  let sut: ConfirmToken
  let confirmationTokensRepository: InMemoryConfirmationTokensRepository
  let createSession: CreateSession
  let user: User
  let confirmationToken: ConfirmationToken
  let request: ConfirmTokenRequest
  let verifyUserEmail: VerifyUserEmail

  beforeEach(() => {
    confirmationTokensRepository = new InMemoryConfirmationTokensRepository()
    createSession = {
      execute: vi.fn().mockResolvedValue(
        right({
          session: {
            accessToken: 'any-access-token',
            refreshToken: 'any-refresh-token',
          },
        }),
      ),
    } as unknown as CreateSession
    verifyUserEmail = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as VerifyUserEmail
    sut = new ConfirmToken(
      confirmationTokensRepository,
      createSession,
      verifyUserEmail,
    )

    user = makeUser()
    confirmationToken = makeConfirmationToken({ userId: user.id })
    confirmationTokensRepository.items.push(confirmationToken)
    request = {
      token: confirmationToken.token,
      ipAddress: 'any-ip-address',
      userAgent: 'any-user-agent',
    }
  })

  it('finds confirmation token by token value', async () => {
    const findByTokenSpy = vi.spyOn(confirmationTokensRepository, 'findByToken')
    await sut.execute(request)
    expect(findByTokenSpy).toHaveBeenCalledWith(request.token)
  })

  it('returns a ResourceNotFoundError if token is not found', async () => {
    confirmationTokensRepository.items = []
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns a TokenAlreadyUsedError if token was already used', async () => {
    confirmationToken.use()
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(TokenAlreadyUsedError)
  })

  it('returns a TokenExpiredError if token is expired', async () => {
    confirmationToken = makeConfirmationToken({
      userId: user.id,
      expiresAt: new Date(2000),
    })
    confirmationTokensRepository.items.push(confirmationToken)
    const response = await sut.execute({
      ...request,
      token: confirmationToken.token,
    })
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(TokenExpiredError)
  })

  it('verifies the user email if token type is EmailVerification', async () => {
    const executeSpy = vi.spyOn(verifyUserEmail, 'execute')
    await sut.execute(request)
    expect(executeSpy).toHaveBeenCalledWith({
      userId: confirmationToken.userId,
    })
  })

  it('returns ResourceNotFoundError if confirmation token user is not found', async () => {
    vi.spyOn(verifyUserEmail, 'execute').mockResolvedValue(
      left(new ResourceNotFoundError()),
    )
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('does not verify user email if token type is not EmailVerification', async () => {
    const executeSpy = vi.spyOn(verifyUserEmail, 'execute')
    confirmationToken = makeConfirmationToken({
      userId: user.id,
      type: ConfirmationTokenType.Authentication,
    })
    confirmationTokensRepository.items.push(confirmationToken)
    await sut.execute({
      ...request,
      token: confirmationToken.token,
    })
    expect(executeSpy).not.toHaveBeenCalled()
  })

  it('uses the token on success', async () => {
    const saveSpy = vi.spyOn(confirmationTokensRepository, 'save')
    await sut.execute(request)
    expect(confirmationToken.isUsed).toBe(true)
    expect(saveSpy).toHaveBeenCalledWith(confirmationToken)
  })

  it('returns an UnidentifiedSessionError if session creations returns a ResourceNotFoundError', async () => {
    vi.spyOn(createSession, 'execute').mockResolvedValue(
      left(new ResourceNotFoundError()),
    )
    const response = await sut.execute(request)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UnidentifiedSessionError)
  })

  it('returns a new session on success', async () => {
    const executeSpy = vi.spyOn(createSession, 'execute')
    const response = await sut.execute(request)
    expect(response.isRight()).toBe(true)
    expect(executeSpy).toHaveBeenCalledWith({
      userId: confirmationToken.userId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    })
    expect(response.value).toMatchObject({
      session: {
        accessToken: 'any-access-token',
        refreshToken: 'any-refresh-token',
      },
    })
  })
})
