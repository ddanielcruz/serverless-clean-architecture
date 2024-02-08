import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { ConfirmToken } from '@/domain/security/services/confirm-token'
import type { Session } from '@/domain/security/services/create-session'
import { TokenAlreadyUsedError } from '@/domain/security/services/errors/token-already-used-error'
import { TokenExpiredError } from '@/domain/security/services/errors/token-expired-error'

import { ConfirmTokenController } from './confirm-token-controller'
import { sessionCookieOptions } from '../../config/cookie'
import { HttpCode, type HttpRequest } from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'

const session: Session = {
  accessToken: 'any-access-token',
  refreshToken: 'any-refresh-token',
}

describe('ConfirmTokenController', () => {
  let sut: ConfirmTokenController
  let confirmToken: ConfirmToken
  const httpRequest = {
    body: { token: 'any-token' },
  } satisfies HttpRequest

  beforeEach(() => {
    confirmToken = {
      execute: vi.fn().mockResolvedValue(right({ session })),
    } as unknown as ConfirmToken
    sut = new ConfirmTokenController(confirmToken)
  })

  it('throws a ZodError on invalid request', async () => {
    const promise = sut.handle({})
    await expect(promise).rejects.toThrow(ZodError)
  })

  it('returns 404 on resource not found', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.NOT_FOUND,
      body: { message: error.message },
    })
  })

  it('returns 409 on token already used', async () => {
    const error = new TokenAlreadyUsedError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.CONFLICT,
      body: { message: error.message },
    })
  })

  it('returns 400 on token expired', async () => {
    const error = new TokenExpiredError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.BAD_REQUEST,
      body: { message: error.message },
    })
  })

  it('returns 200 on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.NO_CONTENT,
      headers: {
        'Set-Cookie': expect.any(String),
      },
    })
  })

  it('returns the session tokens as a session cookie', async () => {
    const response = await sut.handle(httpRequest)
    const cookies = response.headers?.['Set-Cookie']
    expect(cookies).toEqual(
      [
        serializeCookie(
          'accessToken',
          session.accessToken,
          sessionCookieOptions,
        ),
        serializeCookie(
          'refreshToken',
          session.refreshToken,
          sessionCookieOptions,
        ),
      ].join(', '),
    )
  })
})
